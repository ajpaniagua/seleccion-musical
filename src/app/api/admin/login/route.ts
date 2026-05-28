import { NextResponse } from "next/server";
import { plantarCookieAdmin, verificarPassword } from "@/lib/adminAuth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ok = await verificarPassword(body.password ?? "");
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await plantarCookieAdmin();
  return NextResponse.json({ ok: true });
}
