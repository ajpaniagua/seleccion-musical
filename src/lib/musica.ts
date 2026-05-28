import type { Artista, Cancion } from "./tipos";

const cache = new Map<string, unknown>();

export class BusquedaError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "BusquedaError";
  }
}

async function pedir<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const r = await fetch(url);
  if (!r.ok) {
    let mensaje = "No se pudo buscar. Inténtalo de nuevo en unos segundos.";
    try {
      const data = await r.json();
      if (typeof data?.error === "string") mensaje = data.error;
    } catch {}
    throw new BusquedaError(mensaje);
  }
  const data = (await r.json()) as { results: T };
  cache.set(url, data.results);
  return data.results;
}

export async function buscarArtistas(termino: string): Promise<Artista[]> {
  const q = termino.trim();
  if (q.length < 2) return [];
  return pedir<Artista[]>(`/api/musica/artista?q=${encodeURIComponent(q)}`);
}

export async function buscarCanciones(termino: string): Promise<Cancion[]> {
  const q = termino.trim();
  if (q.length < 2) return [];
  return pedir<Cancion[]>(`/api/musica/cancion?q=${encodeURIComponent(q)}`);
}
