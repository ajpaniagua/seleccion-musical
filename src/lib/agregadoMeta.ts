import { bloqueGeografico } from "./paises";
import { supabaseAdmin } from "./supabase";
import { normalizarNombre } from "@/utils/normalizar";

type Sb = ReturnType<typeof supabaseAdmin>;

export type MetaCache = {
  pais: string | null;
  paisNombre: string | null;
  genero: string | null;
  anyoInicio: number | null;
  anyoDebut: number | null;
  tipo: string | null;
};

/**
 * Devuelve un mapa nombre_normalizado → metadata, leyendo de artistas_meta.
 * Trocea las consultas para respetar el límite de in() de Supabase.
 */
export async function metaPorNombre(
  sb: Sb,
  nombres: string[]
): Promise<Map<string, MetaCache>> {
  const norms = Array.from(new Set(nombres.map(normalizarNombre)));
  const out = new Map<string, MetaCache>();
  if (norms.length === 0) return out;
  const chunks: string[][] = [];
  for (let i = 0; i < norms.length; i += 500) {
    chunks.push(norms.slice(i, i + 500));
  }
  for (const chunk of chunks) {
    const { data, error } = await sb
      .from("artistas_meta")
      .select(
        "nombre_normalizado, pais, pais_nombre, genero_principal, anyo_inicio, anyo_debut, tipo"
      )
      .in("nombre_normalizado", chunk)
      .eq("encontrado", true);
    if (error || !data) continue;
    for (const r of data) {
      out.set(r.nombre_normalizado, {
        pais: r.pais ?? null,
        paisNombre: r.pais_nombre ?? null,
        genero: r.genero_principal ?? null,
        anyoInicio: r.anyo_inicio ?? null,
        anyoDebut: r.anyo_debut ?? null,
        tipo: r.tipo ?? null,
      });
    }
  }
  return out;
}

/**
 * Año "comparable" entre Person y Group:
 *  - Preferido: año del primer álbum/EP (anyo_debut).
 *  - Fallback: anyo_inicio + 18 para Person, anyo_inicio para Group.
 */
export function anyoCarrera(meta: MetaCache | undefined): number | null {
  if (!meta) return null;
  if (meta.anyoDebut) return meta.anyoDebut;
  if (!meta.anyoInicio) return null;
  if (meta.tipo === "Person") return meta.anyoInicio + 18;
  return meta.anyoInicio;
}

export function decadaDe(anyo: number): string {
  const d = Math.floor(anyo / 10) * 10;
  return `${d}s`;
}

/**
 * Calcula las métricas derivadas de una selección a partir de los nombres de
 * sus titulares (no los suplentes, para que el dato refleje el once "fuerte").
 */
export type AgregadoSeleccion = {
  anyoMedio: number | null;
  decadaDominante: string | null;
  decadasRepresentadas: number;
  paisesDistintos: number;
  paisesLista: string;
  generosDistintos: number;
  generosLista: string;
  transgeneracional: boolean;
  bloqueDominante: string;
  cobertura: number;
};

export function agregarPorSeleccion(
  nombresTitulares: string[],
  meta: Map<string, MetaCache>
): AgregadoSeleccion {
  const anyos: number[] = [];
  const paises = new Map<string, number>();
  const generos = new Map<string, number>();
  const bloques = new Map<string, number>();
  let conMeta = 0;

  for (const n of nombresTitulares) {
    const m = meta.get(normalizarNombre(n));
    if (m) conMeta++;
    const a = anyoCarrera(m);
    if (a !== null) anyos.push(a);
    if (m?.paisNombre) paises.set(m.paisNombre, (paises.get(m.paisNombre) ?? 0) + 1);
    if (m?.pais) {
      const b = bloqueGeografico(m.pais);
      bloques.set(b, (bloques.get(b) ?? 0) + 1);
    }
    if (m?.genero) generos.set(m.genero, (generos.get(m.genero) ?? 0) + 1);
  }

  const decadas = new Set(anyos.map(decadaDe));
  const anyoMedio =
    anyos.length > 0 ? Math.round(anyos.reduce((a, b) => a + b, 0) / anyos.length) : null;

  let decadaDominante: string | null = null;
  if (anyos.length > 0) {
    const cuenta: Record<string, number> = {};
    for (const a of anyos) {
      const d = decadaDe(a);
      cuenta[d] = (cuenta[d] ?? 0) + 1;
    }
    decadaDominante = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0][0];
  }

  const bloqueDominante =
    bloques.size > 0
      ? Array.from(bloques.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : "Sin datos";

  return {
    anyoMedio,
    decadaDominante,
    decadasRepresentadas: decadas.size,
    paisesDistintos: paises.size,
    paisesLista: Array.from(paises.keys()).sort().join(", "),
    generosDistintos: generos.size,
    generosLista: Array.from(generos.keys()).sort().join(", "),
    transgeneracional: decadas.size >= 4,
    bloqueDominante,
    cobertura: nombresTitulares.length > 0 ? conMeta / nombresTitulares.length : 0,
  };
}
