import { NextResponse } from "next/server";
import { enriquecerArtistas, nombresDeSeleccion } from "@/lib/enriquecer";
import { supabaseAdmin } from "@/lib/supabase";
import { obtenerVoterHash } from "@/lib/voterHash";

type ArtistaPayload = { nombre: string; foto: string };

type Payload = {
  usuario?: string;
  himno?: { titulo: string; artista: string } | null;
  seleccionador?: ArtistaPayload | null;
  portero?: ArtistaPayload | null;
  defensas?: (ArtistaPayload | null)[];
  medios?: (ArtistaPayload | null)[];
  delanteros?: (ArtistaPayload | null)[];
  banquillo?: (ArtistaPayload | null)[];
};

function limpiarTexto(s: string | undefined | null, max = 80): string | null {
  if (!s) return null;
  const t = s.trim().slice(0, max);
  return t.length > 0 ? t : null;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.himno?.titulo || !body.himno?.artista) {
    return NextResponse.json({ error: "Falta el himno" }, { status: 400 });
  }
  if (!body.seleccionador?.nombre) {
    return NextResponse.json({ error: "Falta el seleccionador" }, { status: 400 });
  }
  if (!body.portero?.nombre) {
    return NextResponse.json({ error: "Falta el portero" }, { status: 400 });
  }
  const defensas = (body.defensas ?? []).filter((a): a is ArtistaPayload => !!a?.nombre);
  const medios = (body.medios ?? []).filter((a): a is ArtistaPayload => !!a?.nombre);
  const delanteros = (body.delanteros ?? []).filter((a): a is ArtistaPayload => !!a?.nombre);
  if (defensas.length !== 4 || medios.length !== 3 || delanteros.length !== 3) {
    return NextResponse.json({ error: "Once incompleto" }, { status: 400 });
  }
  const suplentes = (body.banquillo ?? []).filter((a): a is ArtistaPayload => !!a?.nombre);

  const voterHash = await obtenerVoterHash();
  const sb = supabaseAdmin();

  const titulares = [
    { ...body.portero, posicion: "portero" },
    ...defensas.map((a) => ({ ...a, posicion: "defensa" })),
    ...medios.map((a) => ({ ...a, posicion: "mediocampo" })),
    ...delanteros.map((a) => ({ ...a, posicion: "delantera" })),
  ];

  const { data: seleccion, error: errSel } = await sb
    .from("selecciones")
    .insert({
      usuario: limpiarTexto(body.usuario, 30),
      voter_hash: voterHash,
      himno_cancion: limpiarTexto(body.himno.titulo, 120),
      himno_artista: limpiarTexto(body.himno.artista, 80),
      seleccionador_nombre: limpiarTexto(body.seleccionador.nombre, 80),
      seleccionador_foto: limpiarTexto(body.seleccionador.foto, 500),
      titulares,
      suplentes,
    })
    .select("id")
    .single();

  if (errSel || !seleccion) {
    console.error("[selecciones] error insert:", errSel);
    return NextResponse.json({ error: "No se pudo guardar la selección" }, { status: 500 });
  }

  const eventos = [
    { artista_nombre: limpiarTexto(body.himno.artista, 80), posicion: "himno_artista", rol: "himno" },
    {
      artista_nombre: limpiarTexto(body.seleccionador.nombre, 80),
      posicion: "seleccionador",
      rol: "seleccionador",
    },
    ...titulares.map((t) => ({
      artista_nombre: limpiarTexto(t.nombre, 80),
      posicion: t.posicion,
      rol: "titular",
    })),
    ...suplentes.map((s) => ({
      artista_nombre: limpiarTexto(s.nombre, 80),
      posicion: "suplente",
      rol: "suplente",
    })),
  ]
    .filter((e) => e.artista_nombre)
    .map((e) => ({ ...e, seleccion_id: seleccion.id }));

  if (eventos.length > 0) {
    const { error: errEv } = await sb.from("eventos_artistas").insert(eventos);
    if (errEv) {
      // No bloqueamos al usuario por esto, pero lo logueamos para no perder eventos
      console.error("[selecciones] error eventos:", errEv);
    }
  }

  // Enriquecimiento en background — no bloquea la respuesta. Si falla, se
  // reintentará la próxima vez que aparezca el artista (max 3 intentos por
  // nombre, ver enriquecer.ts).
  const artistas = nombresDeSeleccion(body);
  void enriquecerArtistas(artistas).catch((e) =>
    console.error("[selecciones] fallo enriqueciendo:", e)
  );

  return NextResponse.json({ id: seleccion.id });
}
