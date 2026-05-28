import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

const COOKIE_NAME = "ms_vid";
const COOKIE_TTL = 60 * 60 * 24 * 365; // 1 año

function ipDeHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * Devuelve un hash anónimo y estable por dispositivo, asegurando que la cookie
 * `ms_vid` está plantada. Para usar dentro de Route Handlers (server-side).
 *
 * El hash combina IP + user-agent + un identificador persistente en cookie.
 * No es reversible y no expone la IP en claro.
 */
export async function obtenerVoterHash(): Promise<string> {
  const h = await headers();
  const ip = ipDeHeaders(h);
  const ua = h.get("user-agent") ?? "no-ua";
  const cookieStore = await cookies();
  let vid = cookieStore.get(COOKIE_NAME)?.value;
  if (!vid) {
    vid = crypto.randomUUID();
    cookieStore.set({
      name: COOKIE_NAME,
      value: vid,
      maxAge: COOKIE_TTL,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }
  return createHash("sha256").update(`${ip}|${ua}|${vid}`).digest("hex");
}
