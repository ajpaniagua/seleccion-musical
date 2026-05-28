import { NextResponse } from "next/server";

const HOSTS_PERMITIDOS = [
  "cdn-images.dzcdn.net",
  "is1-ssl.mzstatic.com",
  "is2-ssl.mzstatic.com",
  "is3-ssl.mzstatic.com",
  "is4-ssl.mzstatic.com",
  "is5-ssl.mzstatic.com",
  "a1.mzstatic.com",
];

export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "url requerido" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "url inválida" }, { status: 400 });
  }
  if (!HOSTS_PERMITIDOS.includes(parsed.host)) {
    return NextResponse.json({ error: "host no permitido" }, { status: 403 });
  }

  try {
    const r = await fetch(parsed.toString(), { next: { revalidate: 86400 } });
    if (!r.ok) {
      return NextResponse.json({ error: `upstream ${r.status}` }, { status: 502 });
    }
    const buf = await r.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": r.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ error: "no se pudo descargar" }, { status: 502 });
  }
}
