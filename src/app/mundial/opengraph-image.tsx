import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "La selección musical de mi vida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 15% 20%, rgba(212,162,46,0.35) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(212,162,46,0.25) 0%, transparent 50%), #1a1410",
          color: "#FAFAF7",
          fontFamily: "Inter, sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            color: "#D4A22E",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 10,
            marginBottom: 32,
            display: "flex",
          }}
        >
          ★ MUNDIAL MUSICAL 2026 ★
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 0.95,
            textAlign: "center",
            letterSpacing: -3,
            display: "flex",
          }}
        >
          La selección musical
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            fontStyle: "italic",
            color: "#D4A22E",
            lineHeight: 1,
            marginTop: 8,
            letterSpacing: -4,
            display: "flex",
            textShadow: "5px 5px 0 #0a0a0a",
          }}
        >
          DE MI VIDA
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            color: "rgba(250,250,247,0.8)",
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: 900,
            display: "flex",
          }}
        >
          Arma tu selección con los artistas que mejor te representan
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 50,
            color: "#D4A22E",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            display: "flex",
          }}
        >
          arturopaniagua.com/mundial · Un proyecto de @ajpaniagua
        </div>
      </div>
    ),
    { ...size }
  );
}
