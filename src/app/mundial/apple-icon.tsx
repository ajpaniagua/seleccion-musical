import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para iOS (Safari "Add to Home Screen", marcadores). Misma estética
// que `icon.tsx` pero a 180×180, que es el tamaño que pide Apple. Estrella
// dorada SVG sobre fondo negro.
export default function AppleIcon() {
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
          width="130"
          height="130"
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
