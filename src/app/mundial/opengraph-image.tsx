import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "La selección musical de mi vida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Reproducimos la estética de la landing (`src/app/mundial/page.tsx`) en
// formato Open Graph 1200×630: fondo crema, "2026" decorativo gigante al
// fondo en dorado, titular en Bebas Neue con la sombra dorada/negra. Para
// que Satori (motor de next/og) pueda renderizar Bebas Neue, embebemos el
// .ttf que vive co-localizado en este directorio. Edge runtime es el modo
// soportado oficialmente por Next para `fetch(new URL(..., import.meta.url))`.
export default async function OGImage() {
  const bebas = await fetch(
    new URL("./BebasNeue-Regular.ttf", import.meta.url)
  ).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Bebas Neue",
          overflow: "hidden",
        }}
      >
        {/* "2026" decorativo gigante: marca de agua dorada al 8% como en la
            landing. Va anclado arriba a la derecha, fuera del flujo. */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -50,
            fontSize: 460,
            color: "#D4A22E",
            opacity: 0.09,
            lineHeight: 0.85,
            letterSpacing: -10,
            display: "flex",
          }}
        >
          2026
        </div>

        {/* Bloque central */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <div
            style={{
              color: "#D4A22E",
              fontSize: 28,
              letterSpacing: 12,
              marginBottom: 18,
              display: "flex",
            }}
          >
            ★ MUNDIAL MUSICAL 2026 ★
          </div>

          <div
            style={{
              fontSize: 96,
              color: "#0a0a0a",
              lineHeight: 0.85,
              letterSpacing: -1,
              display: "flex",
            }}
          >
            LA SELECCIÓN MUSICAL
          </div>
          <div
            style={{
              fontSize: 210,
              color: "#D4A22E",
              lineHeight: 0.9,
              letterSpacing: -4,
              marginTop: 8,
              textShadow: "6px 6px 0 #0a0a0a",
              display: "flex",
            }}
          >
            DE MI VIDA
          </div>
        </div>

        {/* Pie: URL y autoría, alineados con la voz de la landing. */}
        <div
          style={{
            position: "absolute",
            bottom: 38,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              color: "#0a0a0a",
              fontSize: 28,
              letterSpacing: 6,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <span style={{ color: "#D4A22E" }}>★</span>
            <span>ARTUROPANIAGUA.COM/MUNDIAL</span>
            <span style={{ color: "#D4A22E" }}>★</span>
          </div>
          <div
            style={{
              color: "#666",
              fontSize: 20,
              letterSpacing: 4,
              display: "flex",
            }}
          >
            UN PROYECTO DE @AJPANIAGUA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Bebas Neue",
          data: bebas,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
