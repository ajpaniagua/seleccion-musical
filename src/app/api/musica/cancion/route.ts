import { NextResponse } from "next/server";

type Cancion = { id: string; titulo: string; artista: string };

type DeezerTrack = {
  id: number;
  title: string;
  title_short?: string;
  artist?: { name: string };
};

type ItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
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

async function buscarEnDeezer(q: string): Promise<Cancion[]> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return [];
    const json = (await r.json()) as { data?: DeezerTrack[] };
    return (json.data ?? [])
      .filter((t) => t.title && t.artist?.name)
      .map((t) => ({
        id: `dz:${t.id}`,
        titulo: t.title_short || t.title,
        artista: t.artist!.name,
      }));
  } catch {
    return [];
  }
}

async function buscarEnItunes(q: string): Promise<Cancion[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=10&country=ES&media=music`;
  try {
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return [];
    const json = (await r.json()) as { results?: ItunesTrack[] };
    return (json.results ?? [])
      .filter((t) => t.trackName && t.artistName)
      .map((t) => ({
        id: `it:${t.trackId}`,
        titulo: t.trackName,
        artista: t.artistName,
      }));
  } catch {
    return [];
  }
}

function combinarSinDuplicar(a: Cancion[], b: Cancion[]): Cancion[] {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const clave = (c: Cancion) => `${norm(c.titulo)}|${norm(c.artista)}`;
  const vistos = new Set(a.map(clave));
  const extra = b.filter((x) => {
    const k = clave(x);
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
  return [...a, ...extra].slice(0, 12);
}
