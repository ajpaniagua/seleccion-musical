import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon del proyecto. Estrella dorada SVG sobre fondo negro,
// guiño a la franja "★ MUNDIAL MUSICAL 2026 ★" de la landing. Usamos SVG
// en vez del glifo ★ porque Satori no tiene fallback automático de fuentes
// y el carácter Unicode saldría como rectángulo con X.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="46"
          height="46"
          viewBox="0 0 24 24"
          style={{ display: "flex" }}
        >
          <path
            d="M12 2.5l2.95 6.32 6.55 0.74-4.92 4.63 1.36 6.81L12 17.77l-5.94 3.23 1.36-6.81-4.92-4.63 6.55-0.74z"
            fill="#D4A22E"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
