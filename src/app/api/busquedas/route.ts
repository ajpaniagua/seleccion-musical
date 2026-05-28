import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { obtenerVoterHash } from "@/lib/voterHash";

type Payload = {
  texto?: string;
  anadido?: boolean;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const texto = (body.texto ?? "").trim().slice(0, 120);
  if (texto.length < 2) {
    return NextResponse.json({ ok: false, motivo: "texto_corto" });
  }
  const voterHash = await obtenerVoterHash();
  const sb = supabaseAdmin();
  const { error } = await sb.from("busquedas").insert({
    texto,
    anadido: !!body.anadido,
    voter_hash: voterHash,
  });
  if (error) {
    console.error("[busquedas] error insert:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
