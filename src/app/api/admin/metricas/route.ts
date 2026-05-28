import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { isAdmin } from "@/lib/adminAuth";
import {
  anyoCarrera,
  decadaDe,
  metaPorNombre,
  type MetaCache,
} from "@/lib/agregadoMeta";
import { bloqueGeografico } from "@/lib/paises";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizarNombre } from "@/utils/normalizar";

type Sb = ReturnType<typeof supabaseAdmin>;

const POSICIONES_TOP = [
  "himno_artista",
  "seleccionador",
  "portero",
  "defensa",
  "mediocampo",
  "delantera",
  "suplente",
] as const;

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }
  const sb = supabaseAdmin();

  const [
    totalSelecciones,
    totalEnriquecidos,
    seriePorDia,
    horarioDia,
    diaSemana,
    himnos,
    himnosUnicos,
    porPosicion,
    busquedasNoAnadidas,
    gemelas,
    combinaciones,
    comodines,
    iteradores,
    paises,
    paisesPorPosicion,
    paisesBloques,
    selPorPureza,
    generos,
    generosPorPosicion,
    cromosPurosGenero,
    generacional,
  ] = await Promise.all([
    contarSelecciones(sb),
    contarEnriquecidos(sb),
    serieDiaria(sb),
    horaDelDia(sb),
    diaDeLaSemana(sb),
    topHimnos(sb),
    topHimnosUnicos(sb),
    Promise.all(POSICIONES_TOP.map((p) => topPorPosicion(sb, p))),
    topBusquedasNoAnadidas(sb),
    seleccionesGemelas(sb),
    combinacionesRecurrentes(sb),
    artistasComodin(sb),
    topIteradores(sb),
    topPaises(sb),
    paisesPorPosicionFn(sb),
    distribucionPorBloque(sb),
    purezaPais(sb),
    topGeneros(sb),
    generosPorPosicionFn(sb),
    cromosPurosVsMestizos(sb),
    analisisGeneracional(sb),
  ]);

  return NextResponse.json({
    totalSelecciones,
    totalEnriquecidos,
    seriePorDia,
    horarioDia,
    diaSemana,
    himnos,
    himnosUnicos,
    topPorPosicion: Object.fromEntries(
      POSICIONES_TOP.map((p, i) => [p, porPosicion[i]])
    ),
    busquedasNoAnadidas,
    gemelas,
    combinaciones,
    comodines,
    iteradores,
    paises,
    paisesPorPosicion,
    paisesBloques,
    selPorPureza,
    generos,
    generosPorPosicion,
    cromosPurosGenero,
    generacional,
  });
}

// ─────────────────────────────────────────────────────────────────────
// Helpers de queries
// ─────────────────────────────────────────────────────────────────────

async function contarSelecciones(sb: Sb): Promise<number> {
  const { count, error } = await sb
    .from("selecciones")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

async function contarEnriquecidos(sb: Sb) {
  const { count: total, error: e1 } = await sb
    .from("artistas_meta")
    .select("id", { count: "exact", head: true });
  if (e1) return { total: 0, encontrados: 0 };
  const { count: encontrados, error: e2 } = await sb
    .from("artistas_meta")
    .select("id", { count: "exact", head: true })
    .eq("encontrado", true);
  if (e2) return { total: total ?? 0, encontrados: 0 };
  return { total: total ?? 0, encontrados: encontrados ?? 0 };
}

async function serieDiaria(sb: Sb) {
  const desde = new Date();
  desde.setDate(desde.getDate() - 90);
  const { data, error } = await sb
    .from("selecciones")
    .select("created_at")
    .gte("created_at", desde.toISOString())
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const por: Record<string, number> = {};
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  for (const row of data) {
    const k = fmt.format(new Date(row.created_at));
    por[k] = (por[k] ?? 0) + 1;
  }
  return Object.entries(por)
    .map(([dia, total]) => ({ dia, total }))
    .sort((a, b) => a.dia.localeCompare(b.dia));
}

async function horaDelDia(sb: Sb) {
  const { data, error } = await sb.from("selecciones").select("created_at");
  if (error || !data) return [];
  const por: number[] = Array(24).fill(0);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    hour12: false,
  });
  for (const row of data) {
    const h = parseInt(fmt.format(new Date(row.created_at)), 10);
    if (!Number.isNaN(h)) por[h]++;
  }
  return por.map((total, hora) => ({ hora, total }));
}

async function diaDeLaSemana(sb: Sb) {
  const { data, error } = await sb.from("selecciones").select("created_at");
  if (error || !data) return [];
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const por: number[] = Array(7).fill(0);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
  });
  const map: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  };
  for (const row of data) {
    const idx = map[fmt.format(new Date(row.created_at))];
    if (idx !== undefined) por[idx]++;
  }
  return dias.map((nombre, i) => ({ nombre, total: por[i] }));
}

async function topHimnos(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("himno_cancion, himno_artista")
    .not("himno_cancion", "is", null);
  if (error || !data) return [];
  const por: Record<string, { cancion: string; artista: string; total: number }> = {};
  for (const row of data) {
    const cancion = row.himno_cancion ?? "";
    const artista = row.himno_artista ?? "";
    const k = `${cancion}::${artista}`;
    if (!por[k]) por[k] = { cancion, artista, total: 0 };
    por[k].total++;
  }
  return Object.values(por)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

async function topHimnosUnicos(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("himno_cancion, himno_artista, created_at")
    .not("himno_cancion", "is", null);
  if (error || !data) return { total: 0, recientes: [] };
  const por: Record<string, { cancion: string; artista: string; created_at: string }> = {};
  for (const row of data) {
    const cancion = row.himno_cancion ?? "";
    const artista = row.himno_artista ?? "";
    const k = `${cancion}::${artista}`.toLowerCase();
    por[k] = { cancion, artista, created_at: row.created_at };
  }
  const usadas: Record<string, number> = {};
  for (const row of data) {
    const cancion = row.himno_cancion ?? "";
    const artista = row.himno_artista ?? "";
    const k = `${cancion}::${artista}`.toLowerCase();
    usadas[k] = (usadas[k] ?? 0) + 1;
  }
  const unicos = Object.entries(usadas).filter(([, v]) => v === 1);
  const muestra = unicos
    .map(([k]) => por[k])
    .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
    .slice(0, 10);
  return { total: unicos.length, recientes: muestra };
}

async function topPorPosicion(sb: Sb, posicion: string) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre")
    .eq("posicion", posicion)
    .not("artista_nombre", "is", null);
  if (error || !data) return [];
  const por: Record<string, number> = {};
  for (const row of data) {
    const k = row.artista_nombre ?? "";
    if (!k) continue;
    por[k] = (por[k] ?? 0) + 1;
  }
  return Object.entries(por)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

async function topBusquedasNoAnadidas(sb: Sb) {
  const { data, error } = await sb
    .from("busquedas")
    .select("texto, anadido")
    .not("texto", "is", null);
  if (error || !data) return [];
  const por: Record<string, { total: number; anadidos: number }> = {};
  for (const row of data) {
    const k = (row.texto ?? "").toLowerCase().trim();
    if (k.length < 2) continue;
    if (!por[k]) por[k] = { total: 0, anadidos: 0 };
    por[k].total++;
    if (row.anadido) por[k].anadidos++;
  }
  return Object.entries(por)
    .map(([texto, v]) => ({
      texto,
      busquedas: v.total,
      anadidos: v.anadidos,
      noAnadidos: v.total - v.anadidos,
    }))
    .filter((x) => x.noAnadidos >= 2)
    .sort((a, b) => b.noAnadidos - a.noAnadidos)
    .slice(0, 20);
}

// ─────────────────────────────────────────────────────────────────────
// Bloque 1 (nuevas vistas editoriales)
// ─────────────────────────────────────────────────────────────────────

async function seleccionesGemelas(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("id, usuario, titulares, suplentes, created_at");
  if (error || !data) return [];
  const por: Record<
    string,
    { firma: string; total: number; usuarios: string[]; created_at: string }
  > = {};
  for (const row of data) {
    const titNames = (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => normalizarNombre(t?.nombre ?? ""))
      .sort();
    const supNames = (Array.isArray(row.suplentes) ? row.suplentes : [])
      .map((t: { nombre?: string }) => normalizarNombre(t?.nombre ?? ""))
      .sort();
    if (titNames.length === 0) continue;
    const firma = createHash("md5")
      .update(`${titNames.join("|")}::${supNames.join("|")}`)
      .digest("hex");
    if (!por[firma])
      por[firma] = { firma, total: 0, usuarios: [], created_at: row.created_at };
    por[firma].total++;
    if (row.usuario && !por[firma].usuarios.includes(row.usuario)) {
      por[firma].usuarios.push(row.usuario);
    }
  }
  return Object.values(por)
    .filter((g) => g.total >= 2)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

async function combinacionesRecurrentes(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("titulares, suplentes");
  if (error || !data) return [];

  // Cuenta de apariciones individuales (para calcular probabilidad condicional)
  const conteoIndividual: Map<string, number> = new Map();
  const conteoPares: Map<string, number> = new Map();
  const nombresOriginal: Map<string, string> = new Map();
  const totalSelecciones = data.length;

  for (const row of data) {
    const nombres = [
      ...(Array.isArray(row.titulares) ? row.titulares : []),
      ...(Array.isArray(row.suplentes) ? row.suplentes : []),
    ]
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n): n is string => !!n);

    const unicos = new Set(nombres.map(normalizarNombre));
    for (const n of nombres) nombresOriginal.set(normalizarNombre(n), n);

    const arr = Array.from(unicos);
    for (const n of arr) conteoIndividual.set(n, (conteoIndividual.get(n) ?? 0) + 1);

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const k = arr[i] < arr[j] ? `${arr[i]}|${arr[j]}` : `${arr[j]}|${arr[i]}`;
        conteoPares.set(k, (conteoPares.get(k) ?? 0) + 1);
      }
    }
  }

  // Solo pares donde al menos uno aparece en >=3 selecciones (evita ruido)
  const UMBRAL = Math.max(3, Math.floor(totalSelecciones * 0.05));
  const resultados: Array<{
    a: string;
    b: string;
    juntos: number;
    aSola: number;
    bSola: number;
    pAconB: number; // P(b | a)
  }> = [];

  for (const [k, juntos] of conteoPares) {
    const [n1, n2] = k.split("|");
    const c1 = conteoIndividual.get(n1) ?? 0;
    const c2 = conteoIndividual.get(n2) ?? 0;
    if (c1 < UMBRAL && c2 < UMBRAL) continue;
    resultados.push({
      a: nombresOriginal.get(n1) ?? n1,
      b: nombresOriginal.get(n2) ?? n2,
      juntos,
      aSola: c1,
      bSola: c2,
      pAconB: c1 > 0 ? juntos / c1 : 0,
    });
  }

  return resultados
    .sort((a, b) => b.pAconB - a.pAconB || b.juntos - a.juntos)
    .slice(0, 15);
}

async function artistasComodin(sb: Sb) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre, posicion")
    .not("artista_nombre", "is", null);
  if (error || !data) return [];

  const por: Record<string, { posiciones: Set<string>; total: number }> = {};
  for (const row of data) {
    const n = row.artista_nombre ?? "";
    if (!n) continue;
    if (!por[n]) por[n] = { posiciones: new Set(), total: 0 };
    if (row.posicion) por[n].posiciones.add(row.posicion);
    por[n].total++;
  }
  return Object.entries(por)
    .map(([nombre, v]) => ({
      nombre,
      posicionesDistintas: v.posiciones.size,
      posiciones: Array.from(v.posiciones).sort(),
      total: v.total,
    }))
    .filter((x) => x.posicionesDistintas >= 3 && x.total >= 3)
    .sort(
      (a, b) =>
        b.posicionesDistintas - a.posicionesDistintas || b.total - a.total
    )
    .slice(0, 15);
}

async function topIteradores(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("voter_hash, usuario, id");
  if (error || !data) return [];
  const por: Record<string, { total: number; usuarios: Set<string> }> = {};
  for (const row of data) {
    const k = row.voter_hash;
    if (!por[k]) por[k] = { total: 0, usuarios: new Set() };
    por[k].total++;
    if (row.usuario) por[k].usuarios.add(row.usuario);
  }
  return Object.entries(por)
    .filter(([, v]) => v.total > 1)
    .map(([hash, v]) => ({
      hash: hash.slice(0, 8) + "…",
      iteraciones: v.total,
      usuarios: Array.from(v.usuarios),
    }))
    .sort((a, b) => b.iteraciones - a.iteraciones)
    .slice(0, 20);
}

// ─────────────────────────────────────────────────────────────────────
// País y género (requieren artistas_meta poblado)
// ─────────────────────────────────────────────────────────────────────

// metaPorNombre / anyoCarrera / decadaDe viven ahora en @/lib/agregadoMeta

async function topPaises(sb: Sb) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre")
    .not("artista_nombre", "is", null);
  if (error || !data) return [];
  const nombres = data.map((r) => r.artista_nombre as string);
  const meta = await metaPorNombre(sb, nombres);
  const por: Record<string, number> = {};
  for (const n of nombres) {
    const m = meta.get(normalizarNombre(n));
    if (!m?.paisNombre) continue;
    por[m.paisNombre] = (por[m.paisNombre] ?? 0) + 1;
  }
  return Object.entries(por)
    .map(([pais, total]) => ({ pais, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);
}

async function paisesPorPosicionFn(sb: Sb) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre, posicion, rol")
    .not("artista_nombre", "is", null);
  if (error || !data) return {};
  const nombres = data.map((r) => r.artista_nombre as string);
  const meta = await metaPorNombre(sb, nombres);
  const por: Record<string, Record<string, number>> = {};
  for (const row of data) {
    const m = meta.get(normalizarNombre(row.artista_nombre as string));
    if (!m?.paisNombre || !row.posicion) continue;
    if (!por[row.posicion]) por[row.posicion] = {};
    por[row.posicion][m.paisNombre] = (por[row.posicion][m.paisNombre] ?? 0) + 1;
  }
  const out: Record<string, { pais: string; total: number }[]> = {};
  for (const pos of Object.keys(por)) {
    out[pos] = Object.entries(por[pos])
      .map(([pais, total]) => ({ pais, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }
  return out;
}

async function distribucionPorBloque(sb: Sb) {
  const { data, error } = await sb
    .from("artistas_meta")
    .select("pais, pais_nombre")
    .eq("encontrado", true);
  if (error || !data) return [];
  const por: Record<string, number> = {};
  for (const row of data) {
    const b = bloqueGeografico(row.pais);
    por[b] = (por[b] ?? 0) + 1;
  }
  return Object.entries(por)
    .map(([bloque, total]) => ({ bloque, total }))
    .sort((a, b) => b.total - a.total);
}

async function purezaPais(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("titulares");
  if (error || !data) return { soloEspanyolas: 0, mixtas: 0, conLatam: 0, conMundoAnglo: 0 };
  const todosNombres = data.flatMap((row) =>
    (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n)
  );
  const meta = await metaPorNombre(sb, todosNombres);
  let soloEspanyolas = 0,
    conLatam = 0,
    conMundoAnglo = 0,
    mixtas = 0;
  for (const row of data) {
    const nombres = (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n);
    const bloques = new Set<string>();
    for (const n of nombres) {
      const m = meta.get(normalizarNombre(n));
      if (m?.pais) bloques.add(bloqueGeografico(m.pais));
    }
    if (bloques.size === 0) continue;
    if (bloques.size === 1 && bloques.has("España")) soloEspanyolas++;
    else if (bloques.has("Latinoamérica")) conLatam++;
    else if (bloques.has("Mundo anglosajón")) conMundoAnglo++;
    else mixtas++;
  }
  return { soloEspanyolas, conLatam, conMundoAnglo, mixtas };
}

async function topGeneros(sb: Sb) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre")
    .not("artista_nombre", "is", null);
  if (error || !data) return [];
  const nombres = data.map((r) => r.artista_nombre as string);
  const meta = await metaPorNombre(sb, nombres);
  const por: Record<string, number> = {};
  for (const n of nombres) {
    const m = meta.get(normalizarNombre(n));
    if (!m?.genero) continue;
    por[m.genero] = (por[m.genero] ?? 0) + 1;
  }
  return Object.entries(por)
    .map(([genero, total]) => ({ genero, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);
}

async function generosPorPosicionFn(sb: Sb) {
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre, posicion")
    .not("artista_nombre", "is", null);
  if (error || !data) return {};
  const nombres = data.map((r) => r.artista_nombre as string);
  const meta = await metaPorNombre(sb, nombres);
  const por: Record<string, Record<string, number>> = {};
  for (const row of data) {
    const m = meta.get(normalizarNombre(row.artista_nombre as string));
    if (!m?.genero || !row.posicion) continue;
    if (!por[row.posicion]) por[row.posicion] = {};
    por[row.posicion][m.genero] = (por[row.posicion][m.genero] ?? 0) + 1;
  }
  const out: Record<string, { genero: string; total: number }[]> = {};
  for (const pos of Object.keys(por)) {
    out[pos] = Object.entries(por[pos])
      .map(([genero, total]) => ({ genero, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }
  return out;
}

async function cromosPurosVsMestizos(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("titulares");
  if (error || !data) return { puros: 0, mestizos2_3: 0, mestizos4plus: 0, sinDatos: 0 };
  const todosNombres = data.flatMap((row) =>
    (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n)
  );
  const meta = await metaPorNombre(sb, todosNombres);
  let puros = 0,
    mestizos2_3 = 0,
    mestizos4plus = 0,
    sinDatos = 0;
  for (const row of data) {
    const nombres = (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n);
    const generos = new Set<string>();
    for (const n of nombres) {
      const m = meta.get(normalizarNombre(n));
      if (m?.genero) generos.add(m.genero);
    }
    if (generos.size === 0) sinDatos++;
    else if (generos.size === 1) puros++;
    else if (generos.size <= 3) mestizos2_3++;
    else mestizos4plus++;
  }
  return { puros, mestizos2_3, mestizos4plus, sinDatos };
}

// ─────────────────────────────────────────────────────────────────────
// Análisis generacional
// ─────────────────────────────────────────────────────────────────────

type SeleccionGeneracion = {
  id: string;
  usuario: string | null;
  anyoMedio: number;
  decadasRepresentadas: number;
  decadaDominante: string;
  cobertura: number; // 0..1 — % de titulares con dato
};

async function analisisGeneracional(sb: Sb) {
  const { data, error } = await sb
    .from("selecciones")
    .select("id, usuario, titulares")
    .order("created_at", { ascending: false });
  if (error || !data) {
    return {
      anyoMedioGlobal: null,
      distribucionPorDecada: [],
      cubos: { pre80: 0, ochentas90s: 0, dosmil10s: 0, dosmil10s_act: 0, transgeneracional: 0, sinDatos: 0 },
      masJovenes: [],
      masVeteranas: [],
      masTransgeneracionales: [],
    };
  }

  const todosNombres = data.flatMap((row) =>
    (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n)
  );
  const meta = await metaPorNombre(sb, todosNombres);

  const analizadas: SeleccionGeneracion[] = [];
  let pre80 = 0,
    ochentas90s = 0,
    dosmil = 0,
    dosmil10s_act = 0,
    transgeneracional = 0,
    sinDatos = 0;

  for (const row of data) {
    const nombres = (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => t?.nombre)
      .filter((n: unknown): n is string => !!n);
    const anyos = nombres
      .map((n) => anyoCarrera(meta.get(normalizarNombre(n))))
      .filter((a): a is number => a !== null);

    const cobertura = nombres.length > 0 ? anyos.length / nombres.length : 0;
    if (anyos.length === 0) {
      sinDatos++;
      continue;
    }
    const anyoMedio = Math.round(anyos.reduce((a, b) => a + b, 0) / anyos.length);
    const decadasSet = new Set(anyos.map(decadaDe));
    const decadasRepresentadas = decadasSet.size;

    // Década dominante (la que tiene más artistas)
    const cuentaDecada: Record<string, number> = {};
    for (const a of anyos) {
      const d = decadaDe(a);
      cuentaDecada[d] = (cuentaDecada[d] ?? 0) + 1;
    }
    const decadaDominante = Object.entries(cuentaDecada).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    analizadas.push({
      id: row.id,
      usuario: row.usuario,
      anyoMedio,
      decadasRepresentadas,
      decadaDominante,
      cobertura,
    });

    if (decadasRepresentadas >= 4) transgeneracional++;
    else if (anyoMedio < 1980) pre80++;
    else if (anyoMedio < 2000) ochentas90s++;
    else if (anyoMedio < 2010) dosmil++;
    else dosmil10s_act++;
  }

  // Distribución global por década (sumando todas las apariciones de artistas)
  const todosLosAnyos: number[] = data.flatMap((row) =>
    (Array.isArray(row.titulares) ? row.titulares : [])
      .map((t: { nombre?: string }) => anyoCarrera(meta.get(normalizarNombre(t?.nombre ?? ""))))
      .filter((a: number | null): a is number => a !== null)
  );
  const porDecada: Record<string, number> = {};
  for (const a of todosLosAnyos) {
    const d = decadaDe(a);
    porDecada[d] = (porDecada[d] ?? 0) + 1;
  }

  const anyoMedioGlobal =
    todosLosAnyos.length > 0
      ? Math.round(todosLosAnyos.reduce((a, b) => a + b, 0) / todosLosAnyos.length)
      : null;

  const distribucionPorDecada = Object.entries(porDecada)
    .map(([decada, total]) => ({ decada, total }))
    .sort((a, b) => a.decada.localeCompare(b.decada));

  // Solo selecciones con cobertura razonable (>=70% de artistas con dato)
  const conCobertura = analizadas.filter((a) => a.cobertura >= 0.7);

  const masJovenes = conCobertura
    .slice()
    .sort((a, b) => b.anyoMedio - a.anyoMedio)
    .slice(0, 5);
  const masVeteranas = conCobertura
    .slice()
    .sort((a, b) => a.anyoMedio - b.anyoMedio)
    .slice(0, 5);
  const masTransgeneracionales = conCobertura
    .slice()
    .sort(
      (a, b) =>
        b.decadasRepresentadas - a.decadasRepresentadas ||
        b.anyoMedio - a.anyoMedio
    )
    .slice(0, 5);

  return {
    anyoMedioGlobal,
    distribucionPorDecada,
    cubos: {
      pre80,
      ochentas90s,
      dosmil10s: dosmil,
      dosmil10s_act,
      transgeneracional,
      sinDatos,
    },
    masJovenes,
    masVeteranas,
    masTransgeneracionales,
  };
}
