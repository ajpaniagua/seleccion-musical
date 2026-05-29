import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para iOS (Safari "Add to Home Screen", marcadores). Misma estética
// que `icon.tsx` pero a 180×180, que es el tamaño que pide Apple.
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
          color: "#D4A22E",
          fontSize: 140,
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
