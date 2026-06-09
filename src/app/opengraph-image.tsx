import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "La selección musical de mi vida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Reproducimos la estética de la landing (`src/app/page.tsx`) en
// formato Open Graph 1200×630: fondo crema, "2026" decorativo gigante al
// fondo en dorado, titular en Bebas Neue con la sombra dorada/negra. Para
// que Satori (motor de next/og) pueda renderizar Bebas Neue, embebemos el
// .ttf que vive co-localizado en este directorio. Edge runtime es el modo
// soportado oficialmente por Next para `fetch(new URL(..., import.meta.url))`.
//
// Nota sobre las estrellas: Satori no hace font-fallback automático, así que
// el glifo ★ (U+2605) sale como rectángulo con X si la única fuente cargada
// es Bebas (que no lo incluye). Las dibujamos como SVG inline para evitar
// depender de qué fuentes tenga el motor de render.
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
        {/* "2026" decorativo gigante: marca de agua dorada al 9% como en la
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
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <Estrella size={22} color="#D4A22E" />
            <span
              style={{
                color: "#D4A22E",
                fontSize: 28,
                letterSpacing: 12,
              }}
            >
              MUNDIAL MUSICAL 2026
            </span>
            <Estrella size={22} color="#D4A22E" />
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

        {/* Pie: URL y autoría. */}
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
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Estrella size={22} color="#D4A22E" />
            <span
              style={{
                color: "#0a0a0a",
                fontSize: 28,
                letterSpacing: 6,
              }}
            >
              ARTUROPANIAGUA.COM/MUNDIAL
            </span>
            <Estrella size={22} color="#D4A22E" />
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

// Estrella de cinco puntas dibujada como SVG, independiente de la fuente.
function Estrella({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ display: "flex" }}
    >
      <path
        d="M12 2.5l2.95 6.32 6.55 0.74-4.92 4.63 1.36 6.81L12 17.77l-5.94 3.23 1.36-6.81-4.92-4.63 6.55-0.74z"
        fill={color}
      />
    </svg>
  );
}
