import { isAdmin } from "@/lib/adminAuth";
import { agregarPorSeleccion, metaPorNombre } from "@/lib/agregadoMeta";
import { supabaseAdmin } from "@/lib/supabase";

type Titular = { nombre: string; foto?: string; posicion: string };
type Suplente = { nombre: string; foto?: string };

function escapar(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function nombrePorRol(arr: Titular[], pos: string, n: number): string {
  const en = arr.filter((x) => x.posicion === pos);
  return en[n - 1]?.nombre ?? "";
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return new Response("no-auth", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") ?? "selecciones";
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const sb = supabaseAdmin();

  if (tipo === "artistas") {
    return csvArtistas(sb);
  }

  if (tipo === "enriquecidas") {
    return csvSeleccionesEnriquecidas(sb, desde, hasta);
  }

  if (tipo === "eventos") {
    let q = sb.from("eventos_artistas").select("*").order("created_at", { ascending: true });
    if (desde) q = q.gte("created_at", desde);
    if (hasta) q = q.lte("created_at", hasta);
    const { data, error } = await q;
    if (error) return new Response(`error: ${error.message}`, { status: 500 });
    const headers = ["id", "created_at", "seleccion_id", "artista_nombre", "posicion", "rol"];
    const filas = (data ?? []).map((r) =>
      headers.map((h) => escapar((r as Record<string, unknown>)[h])).join(",")
    );
    const csv = [headers.join(","), ...filas].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="eventos-${Date.now()}.csv"`,
      },
    });
  }

  // tipo === "selecciones" (por defecto)
  let q = sb.from("selecciones").select("*").order("created_at", { ascending: true });
  if (desde) q = q.gte("created_at", desde);
  if (hasta) q = q.lte("created_at", hasta);
  const { data, error } = await q;
  if (error) return new Response(`error: ${error.message}`, { status: 500 });

  const headers = [
    "id",
    "created_at",
    "usuario",
    "himno_cancion",
    "himno_artista",
    "seleccionador_nombre",
    "portero",
    "defensa_1",
    "defensa_2",
    "defensa_3",
    "defensa_4",
    "mediocampo_1",
    "mediocampo_2",
    "mediocampo_3",
    "delantera_1",
    "delantera_2",
    "delantera_3",
    "suplente_1",
    "suplente_2",
    "suplente_3",
    "suplente_4",
    "suplente_5",
  ];

  const filas = (data ?? []).map((r) => {
    const titulares = (r.titulares as Titular[] | null) ?? [];
    const suplentes = (r.suplentes as Suplente[] | null) ?? [];
    const portero = titulares.find((t) => t.posicion === "portero")?.nombre ?? "";
    const valores = [
      r.id,
      r.created_at,
      r.usuario,
      r.himno_cancion,
      r.himno_artista,
      r.seleccionador_nombre,
      portero,
      nombrePorRol(titulares, "defensa", 1),
      nombrePorRol(titulares, "defensa", 2),
      nombrePorRol(titulares, "defensa", 3),
      nombrePorRol(titulares, "defensa", 4),
      nombrePorRol(titulares, "mediocampo", 1),
      nombrePorRol(titulares, "mediocampo", 2),
      nombrePorRol(titulares, "mediocampo", 3),
      nombrePorRol(titulares, "delantera", 1),
      nombrePorRol(titulares, "delantera", 2),
      nombrePorRol(titulares, "delantera", 3),
      suplentes[0]?.nombre ?? "",
      suplentes[1]?.nombre ?? "",
      suplentes[2]?.nombre ?? "",
      suplentes[3]?.nombre ?? "",
      suplentes[4]?.nombre ?? "",
    ];
    return valores.map(escapar).join(",");
  });

  const csv = [headers.join(","), ...filas].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="selecciones-${Date.now()}.csv"`,
    },
  });
}

type Sb = ReturnType<typeof supabaseAdmin>;

async function csvArtistas(sb: Sb): Promise<Response> {
  // Catálogo de artistas con apariciones totales
  const [meta, eventos] = await Promise.all([
    sb
      .from("artistas_meta")
      .select(
        "nombre_normalizado, nombre_original, mbid, pais, pais_nombre, tipo, genero_principal, generos, anyo_inicio, anyo_fin, anyo_debut, encontrado"
      )
      .order("nombre_original", { ascending: true }),
    sb.from("eventos_artistas").select("artista_nombre").not("artista_nombre", "is", null),
  ]);
  if (meta.error) return new Response(`error: ${meta.error.message}`, { status: 500 });

  // Contamos apariciones por nombre normalizado
  const apariciones = new Map<string, number>();
  for (const row of eventos.data ?? []) {
    const norm = (row.artista_nombre ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    if (!norm) continue;
    apariciones.set(norm, (apariciones.get(norm) ?? 0) + 1);
  }

  const headers = [
    "nombre",
    "tipo",
    "pais",
    "pais_iso",
    "genero_principal",
    "generos",
    "anyo_inicio",
    "anyo_fin",
    "anyo_debut",
    "apariciones",
    "mbid",
    "encontrado",
  ];
  const filas = (meta.data ?? []).map((r) => {
    const norm = (r.nombre_original ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    return [
      r.nombre_original,
      r.tipo,
      r.pais_nombre,
      r.pais,
      r.genero_principal,
      Array.isArray(r.generos) ? r.generos.join("; ") : "",
      r.anyo_inicio,
      r.anyo_fin,
      r.anyo_debut,
      apariciones.get(norm) ?? 0,
      r.mbid,
      r.encontrado,
    ]
      .map(escapar)
      .join(",");
  });

  const csv = [headers.join(","), ...filas].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="artistas-meta-${Date.now()}.csv"`,
    },
  });
}

async function csvSeleccionesEnriquecidas(
  sb: Sb,
  desde: string | null,
  hasta: string | null
): Promise<Response> {
  let q = sb.from("selecciones").select("*").order("created_at", { ascending: true });
  if (desde) q = q.gte("created_at", desde);
  if (hasta) q = q.lte("created_at", hasta);
  const { data, error } = await q;
  if (error) return new Response(`error: ${error.message}`, { status: 500 });

  // Cargo metadata para todos los nombres únicos involucrados en las titulares
  const todosNombres: string[] = [];
  for (const r of data ?? []) {
    const tit = (r.titulares as Titular[] | null) ?? [];
    for (const t of tit) if (t.nombre) todosNombres.push(t.nombre);
  }
  const meta = await metaPorNombre(sb, todosNombres);

  const headers = [
    "id",
    "created_at",
    "usuario",
    "himno_cancion",
    "himno_artista",
    "seleccionador",
    "portero",
    "defensa_1",
    "defensa_2",
    "defensa_3",
    "defensa_4",
    "mediocampo_1",
    "mediocampo_2",
    "mediocampo_3",
    "delantera_1",
    "delantera_2",
    "delantera_3",
    "suplente_1",
    "suplente_2",
    "suplente_3",
    "suplente_4",
    "suplente_5",
    "anyo_medio_titulares",
    "decada_dominante",
    "decadas_representadas",
    "transgeneracional",
    "paises_distintos",
    "paises_lista",
    "bloque_dominante",
    "generos_distintos",
    "generos_lista",
    "cobertura_meta_pct",
  ];

  const filas = (data ?? []).map((r) => {
    const titulares = (r.titulares as Titular[] | null) ?? [];
    const suplentes = (r.suplentes as Suplente[] | null) ?? [];
    const portero = titulares.find((t) => t.posicion === "portero")?.nombre ?? "";
    const nombresTit = titulares.map((t) => t.nombre).filter(Boolean);
    const agg = agregarPorSeleccion(nombresTit, meta);

    const valores = [
      r.id,
      r.created_at,
      r.usuario,
      r.himno_cancion,
      r.himno_artista,
      r.seleccionador_nombre,
      portero,
      nombrePorRol(titulares, "defensa", 1),
      nombrePorRol(titulares, "defensa", 2),
      nombrePorRol(titulares, "defensa", 3),
      nombrePorRol(titulares, "defensa", 4),
      nombrePorRol(titulares, "mediocampo", 1),
      nombrePorRol(titulares, "mediocampo", 2),
      nombrePorRol(titulares, "mediocampo", 3),
      nombrePorRol(titulares, "delantera", 1),
      nombrePorRol(titulares, "delantera", 2),
      nombrePorRol(titulares, "delantera", 3),
      suplentes[0]?.nombre ?? "",
      suplentes[1]?.nombre ?? "",
      suplentes[2]?.nombre ?? "",
      suplentes[3]?.nombre ?? "",
      suplentes[4]?.nombre ?? "",
      agg.anyoMedio ?? "",
      agg.decadaDominante ?? "",
      agg.decadasRepresentadas,
      agg.transgeneracional,
      agg.paisesDistintos,
      agg.paisesLista,
      agg.bloqueDominante,
      agg.generosDistintos,
      agg.generosLista,
      Math.round(agg.cobertura * 100),
    ];
    return valores.map(escapar).join(",");
  });

  const csv = [headers.join(","), ...filas].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="selecciones-enriquecidas-${Date.now()}.csv"`,
    },
  });
}
