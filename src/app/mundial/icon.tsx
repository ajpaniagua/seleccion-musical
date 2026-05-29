import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon de las rutas /mundial/*. Se genera programáticamente para no
// añadir un binario extra al bundle. Estrella dorada sobre fondo negro,
// haciendo guiño a la franja "★ MUNDIAL MUSICAL 2026 ★" de la landing.
// Sin esto, el navegador caería al /favicon.ico del dominio raíz que sirve
// la web actual de Arturo (WordPress) y muestra su icono.
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
          color: "#D4A22E",
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        ★
      </div>
    ),
    { ...size }
  );
}
