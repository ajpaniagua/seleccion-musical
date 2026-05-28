/**
 * Cliente de MusicBrainz para enriquecer artistas con país y género.
 * - Rate limit obligatorio: 1 req/s (los ponemos secuenciales con sleep 1100ms).
 * - User-Agent identificable obligatorio.
 * - Devuelve null si no encuentra resultados razonables.
 */

import { paisIsoANombre } from "./paises";

const USER_AGENT =
  "mi-seleccion/1.0 (https://arturopaniagua.com/mundial; ajpaniagua@gmail.com)";

const ENDPOINT = "https://musicbrainz.org/ws/2/artist/";

export type MetaArtista = {
  mbid: string | null;
  nombre: string;
  pais: string | null;
  paisNombre: string | null;
  tipo: string | null;
  generoPrincipal: string | null;
  generos: string[];
  anyoInicio: number | null; // life-span.begin (nacimiento o formación)
  anyoFin: number | null;
  anyoDebut: number | null; // primer release-group (álbum/EP) — el dato bueno
};

type MBArtistResult = {
  id: string;
  name: string;
  score?: number;
  country?: string;
  area?: { name?: string };
  type?: string;
  "life-span"?: { begin?: string; end?: string; ended?: boolean | null };
  tags?: { name: string; count?: number }[];
  genres?: { name: string; count?: number }[];
};

function anyoDesdeFecha(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  if (Number.isNaN(y) || y < 1800 || y > new Date().getFullYear() + 1) return null;
  return y;
}

type MBResponse = { artists?: MBArtistResult[] };

const FAMILIAS_GENERO: Array<[RegExp, string]> = [
  [/^(reggaeton|reggaetón|perreo|trap latino)$/i, "Reguetón"],
  [/(hip hop|hip-hop|rap)/i, "Hip hop"],
  [/(flamenco|cante)/i, "Flamenco"],
  [/(electronic|electrónic|techno|house|trance|edm|dance)/i, "Electrónica"],
  [/(indie)/i, "Indie"],
  [/(rock)/i, "Rock"],
  [/(pop)/i, "Pop"],
  [/(folk|folklore|cantautor|singer-songwriter)/i, "Cantautor"],
  [/(jazz|blues|soul|funk|r&b|rnb)/i, "Soul / Jazz"],
  [/(reggae|ska)/i, "Reggae / Ska"],
  [/(punk|hardcore)/i, "Punk"],
  [/(metal)/i, "Metal"],
  [/(country)/i, "Country"],
  [/(classical|orchestral|opera)/i, "Clásica"],
  [/(latin|tropical|salsa|bachata|cumbia|merengue|bolero)/i, "Latina"],
];

function clasificarGenero(tags: string[]): string | null {
  for (const t of tags) {
    for (const [re, familia] of FAMILIAS_GENERO) {
      if (re.test(t)) return familia;
    }
  }
  return tags[0]
    ? tags[0]
        .toLowerCase()
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ")
    : null;
}

function tagsOrdenados(result: MBArtistResult): string[] {
  const fuente = (result.genres?.length ? result.genres : result.tags) ?? [];
  return fuente
    .slice()
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .map((t) => t.name)
    .filter((n) => n && n.length < 40);
}

async function consultar(query: string): Promise<MBArtistResult | null> {
  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&fmt=json&limit=3`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!r.ok) return null;
    const json = (await r.json()) as MBResponse;
    const artistas = json.artists ?? [];
    if (artistas.length === 0) return null;
    // El primer resultado suele tener el mayor score. Filtramos los muy bajos.
    const top = artistas[0];
    if ((top.score ?? 0) < 70) return null;
    return top;
  } catch {
    return null;
  }
}

type MBReleaseGroup = {
  id: string;
  title: string;
  "first-release-date"?: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
};

type MBReleaseGroupsResponse = {
  "release-groups"?: MBReleaseGroup[];
};

/**
 * Pide los release-groups del artista por MBID y devuelve el año del más antiguo
 * que sea Album o EP, no live ni compilation. Eso es el "debut" comparable entre
 * Person y Group.
 */
async function primerDebutPorMbid(mbid: string): Promise<number | null> {
  const url = `https://musicbrainz.org/ws/2/release-group?artist=${encodeURIComponent(mbid)}&type=album|ep&fmt=json&limit=100`;
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!r.ok) return null;
    const json = (await r.json()) as MBReleaseGroupsResponse;
    const grupos = json["release-groups"] ?? [];
    const aniosValidos: number[] = [];
    for (const g of grupos) {
      const secondary = g["secondary-types"] ?? [];
      if (secondary.includes("Live") || secondary.includes("Compilation")) continue;
      const anyo = anyoDesdeFecha(g["first-release-date"]);
      if (anyo !== null) aniosValidos.push(anyo);
    }
    if (aniosValidos.length === 0) return null;
    return Math.min(...aniosValidos);
  } catch {
    return null;
  }
}

/**
 * Busca un artista en MusicBrainz probando dos variantes:
 *  1. Búsqueda exacta `artist:"Nombre"` (filtros estrictos)
 *  2. Búsqueda libre con el mismo término
 *
 * Llamarla con sleep externo si vas a hacer varias seguidas (1.1s entre llamadas).
 */
export async function buscarMetaArtista(
  nombreOriginal: string
): Promise<MetaArtista | null> {
  const limpio = nombreOriginal.replace(/"/g, "").trim();
  if (!limpio) return null;

  let res = await consultar(`artist:"${limpio}"`);
  if (!res) {
    // Backoff: alguno como "C. Tangana" o "Héroes del Silencio" rinde mejor sin comillas
    res = await consultar(limpio);
  }
  if (!res) return null;

  const tags = tagsOrdenados(res);
  const pais = res.country || null;

  // Segunda llamada: año del primer álbum/EP (excluyendo live y compilations).
  // Es el dato verdaderamente comparable entre Person (donde life-span es
  // nacimiento) y Group (donde es formación). Si falla devolvemos null y
  // seguimos.
  await sleep(MB_DELAY_MS);
  const anyoDebut = await primerDebutPorMbid(res.id);

  return {
    mbid: res.id,
    nombre: res.name,
    pais,
    paisNombre: pais ? (paisIsoANombre[pais] ?? res.area?.name ?? pais) : null,
    tipo: res.type ?? null,
    generoPrincipal: clasificarGenero(tags),
    generos: tags.slice(0, 6),
    anyoInicio: anyoDesdeFecha(res["life-span"]?.begin),
    anyoFin: anyoDesdeFecha(res["life-span"]?.end),
    anyoDebut,
  };
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const MB_DELAY_MS = 1100;
