import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { enriquecerArtistas } from "@/lib/enriquecer";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Recorre la BD buscando artistas referenciados que aún no tengan metadata,
 * y dispara una pasada de enriquecimiento. Útil al principio cuando hay
 * muchos artistas pendientes acumulados.
 */
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "no-auth" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("eventos_artistas")
    .select("artista_nombre")
    .not("artista_nombre", "is", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const todos = Array.from(
    new Set((data ?? []).map((r) => r.artista_nombre).filter((n): n is string => !!n))
  );

  // Disparamos en background; le devolvemos al admin un OK inmediato
  void enriquecerArtistas(todos).catch((e) =>
    console.error("[reenriquecer] error:", e)
  );
  return NextResponse.json({ ok: true, total: todos.length });
}
