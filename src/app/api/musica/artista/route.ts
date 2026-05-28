import { NextResponse } from "next/server";

type Artista = { id: string; nombre: string; foto: string };

type DeezerArtist = {
  id: number;
  name: string;
  picture_xl?: string;
  picture_big?: string;
  picture_medium?: string;
};

type ItunesArtist = {
  artistId: number;
  artistName: string;
};

type ItunesSong = {
  artistName: string;
  artworkUrl100?: string;
};

const UMBRAL_FALLBACK = 3;

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const deDeezer = await buscarEnDeezer(q);
  if (deDeezer.length >= UMBRAL_FALLBACK) {
    return NextResponse.json({ results: deDeezer });
  }
  const deItunes = await buscarEnItunes(q);
  const combinados = combinarSinDuplicar(deDeezer, deItunes);
  return NextResponse.json({ results: combinados });
}

async function buscarEnDeezer(q: string): Promise<Artista[]> {
  const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=10`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return [];
    const json = (await r.json()) as { data?: DeezerArtist[] };
    return (json.data ?? [])
      .filter((a) => a.name)
      .map((a) => ({
        id: `dz:${a.id}`,
        nombre: a.name,
        foto: a.picture_xl || a.picture_big || a.picture_medium || "",
      }));
  } catch {
    return [];
  }
}

async function buscarEnItunes(q: string): Promise<Artista[]> {
  const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=musicArtist&limit=10&country=ES`;
  try {
    const r = await fetch(artistUrl, { next: { revalidate: 3600 } });
    if (!r.ok) return [];
    const json = (await r.json()) as { results?: ItunesArtist[] };
    const artistas = json.results ?? [];
    const vistos = new Set<string>();
    const unicos = artistas.filter((a) => {
      if (!a.artistName || vistos.has(a.artistName)) return false;
      vistos.add(a.artistName);
      return true;
    });
    const con = await Promise.all(
      unicos.map(async (a) => ({
        id: `it:${a.artistId}`,
        nombre: a.artistName,
        foto: await fotoDeArtista(a.artistName),
      }))
    );
    return con;
  } catch {
    return [];
  }
}

async function fotoDeArtista(nombre: string): Promise<string> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(nombre)}&entity=song&limit=1&country=ES&attribute=artistTerm`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return "";
    const json = (await r.json()) as { results?: ItunesSong[] };
    const art = json.results?.[0]?.artworkUrl100 ?? "";
    return art.replace("100x100bb", "600x600bb");
  } catch {
    return "";
  }
}

function combinarSinDuplicar(a: Artista[], b: Artista[]): Artista[] {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const vistos = new Set(a.map((x) => norm(x.nombre)));
  const extra = b.filter((x) => {
    const k = norm(x.nombre);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
  return [...a, ...extra].slice(0, 12);
}
