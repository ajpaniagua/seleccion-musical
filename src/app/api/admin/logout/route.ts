import { NextResponse } from "next/server";
import { borrarCookieAdmin } from "@/lib/adminAuth";

export async function POST() {
  await borrarCookieAdmin();
  return NextResponse.json({ ok: true });
}
