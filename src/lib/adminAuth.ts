import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "ms_admin";
const COOKIE_TTL = 60 * 60 * 8; // 8 horas

function tokenEsperado(): string {
  const pass = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SECRET ?? "default-admin-secret";
  if (!pass) {
    throw new Error("Falta ADMIN_PASSWORD en el entorno.");
  }
  return createHash("sha256").update(`${pass}|${secret}`).digest("hex");
}

export async function verificarPassword(intento: string): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const buf1 = Buffer.from(intento, "utf8");
  const buf2 = Buffer.from(process.env.ADMIN_PASSWORD, "utf8");
  if (buf1.length !== buf2.length) return false;
  return timingSafeEqual(buf1, buf2);
}

export async function plantarCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: tokenEsperado(),
    maxAge: COOKIE_TTL,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function borrarCookieAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  try {
    const esperado = tokenEsperado();
    const buf1 = Buffer.from(cookie, "utf8");
    const buf2 = Buffer.from(esperado, "utf8");
    if (buf1.length !== buf2.length) return false;
    return timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}
