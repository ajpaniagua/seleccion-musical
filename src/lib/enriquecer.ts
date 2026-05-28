import { buscarMetaArtista, MB_DELAY_MS, sleep } from "./musicbrainz";
import { supabaseAdmin } from "./supabase";
import { normalizarNombre } from "@/utils/normalizar";

const MAX_INTENTOS = 3;

/**
 * Enriquece una lista de nombres de artista en background:
 *  - Marca como "consultado" cualquier artista que ya esté en BD
 *  - Para los que no, consulta MusicBrainz con rate limit 1 req/s
 *
 * Es seguro llamarla sin await (background fire-and-forget). En caso de
 * error parcial logueamos por consola sin bloquear al usuario.
 */
export async function enriquecerArtistas(nombres: string[]): Promise<void> {
  const unicos = Array.from(
    new Map(
      nombres
        .filter((n) => n && n.trim().length > 0)
        .map((n) => [normalizarNombre(n), n])
    ).entries()
  );
  if (unicos.length === 0) return;

  const sb = supabaseAdmin();
  const nombresNorm = unicos.map(([n]) => n);

  // Traemos qué ya tenemos en BD
  const { data: existentes, error } = await sb
    .from("artistas_meta")
    .select("nombre_normalizado, intentos, encontrado")
    .in("nombre_normalizado", nombresNorm);

  if (error) {
    console.error("[enriquecer] error leyendo caché:", error);
    return;
  }

  const mapaExistentes = new Map(
    (existentes ?? []).map((r) => [r.nombre_normalizado, r])
  );

  // Lista filtrada: los que no están, o están pero no se encontraron y aún
  // no agotaron intentos
  const aConsultar = unicos.filter(([n]) => {
    const e = mapaExistentes.get(n);
    if (!e) return true;
    if (e.encontrado) return false;
    return (e.intentos ?? 0) < MAX_INTENTOS;
  });

  if (aConsultar.length === 0) return;

  // MusicBrainz exige 1 req/s. Vamos secuenciales.
  for (let i = 0; i < aConsultar.length; i++) {
    const [norm, original] = aConsultar[i];
    if (i > 0) await sleep(MB_DELAY_MS);

    let meta = null;
    try {
      meta = await buscarMetaArtista(original);
    } catch (e) {
      console.error(`[enriquecer] fallo buscando ${original}:`, e);
    }

    const ahora = new Date().toISOString();
    const previo = mapaExistentes.get(norm);
    const fila = {
      nombre_normalizado: norm,
      nombre_original: original,
      mbid: meta?.mbid ?? null,
      pais: meta?.pais ?? null,
      pais_nombre: meta?.paisNombre ?? null,
      tipo: meta?.tipo ?? null,
      genero_principal: meta?.generoPrincipal ?? null,
      generos: meta?.generos ?? [],
      anyo_inicio: meta?.anyoInicio ?? null,
      anyo_fin: meta?.anyoFin ?? null,
      anyo_debut: meta?.anyoDebut ?? null,
      encontrado: !!meta,
      intentos: (previo?.intentos ?? 0) + 1,
      ultimo_intento_at: ahora,
    };

    const { error: errUpsert } = await sb
      .from("artistas_meta")
      .upsert(fila, { onConflict: "nombre_normalizado" });
    if (errUpsert) {
      console.error(
        `[enriquecer] upsert FALLÓ para ${original}:`,
        errUpsert.message,
        errUpsert.details,
        errUpsert.hint
      );
    } else {
      console.log(
        `[enriquecer] ${original} → ${meta?.paisNombre ?? "—"} · ${meta?.generoPrincipal ?? "—"} · debut ${meta?.anyoDebut ?? "—"}`
      );
    }
  }
}

/**
 * Extrae los nombres de artista únicos involucrados en una selección.
 */
export function nombresDeSeleccion(payload: {
  himno?: { artista: string } | null;
  seleccionador?: { nombre: string } | null;
  portero?: { nombre: string } | null;
  defensas?: ({ nombre: string } | null)[];
  medios?: ({ nombre: string } | null)[];
  delanteros?: ({ nombre: string } | null)[];
  banquillo?: ({ nombre: string } | null)[];
}): string[] {
  const out: string[] = [];
  if (payload.himno?.artista) out.push(payload.himno.artista);
  if (payload.seleccionador?.nombre) out.push(payload.seleccionador.nombre);
  if (payload.portero?.nombre) out.push(payload.portero.nombre);
  for (const arr of [
    payload.defensas,
    payload.medios,
    payload.delanteros,
    payload.banquillo,
  ]) {
    for (const a of arr ?? []) {
      if (a?.nombre) out.push(a.nombre);
    }
  }
  return out;
}
