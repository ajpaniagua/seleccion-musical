import type { Metadata } from "next";
import Link from "next/link";
import { CromoDemo } from "@/components/CromoDemo";
import { COLORS } from "@/lib/colores";
import { TEXTOS } from "@/lib/copys";

export const metadata: Metadata = {
  title: "La selección musical de mi vida · Mundial Musical 2026",
  description:
    "Arma tu selección musical: un himno, un seleccionador, once titulares y cinco suplentes. Comparte tu cromo con el mundo.",
  openGraph: {
    title: "La selección musical de mi vida",
    description:
      "Arma tu selección con los artistas que mejor te representan. Un proyecto de @ajpaniagua.",
    url: "https://arturopaniagua.com/mundial",
    siteName: "arturopaniagua.com",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La selección musical de mi vida",
    description:
      "Arma tu selección musical con los artistas que mejor te representan.",
  },
};

export default function MundialPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          color: COLORS.gold,
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 5,
          marginBottom: 16,
        }}
      >
        ★ MUNDIAL MUSICAL 2026 ★
      </div>

      <h1
        style={{
          margin: 0,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: -2,
          lineHeight: 0.95,
        }}
      >
        <span
          style={{
            display: "block",
            // Tamaño calculado para que "La selección musical" (20 char) tenga
            // un ancho parecido al de "DE MI VIDA" (10 char) abajo. nowrap
            // garantiza que nunca se parta en dos líneas, y el clamp baja en
            // pantallas estrechas para no desbordar lateralmente.
            fontSize: "clamp(26px, 5.6vw, 50px)",
            whiteSpace: "nowrap",
          }}
        >
          La selección musical
        </span>
        <span
          style={{
            display: "block",
            color: COLORS.gold,
            fontSize: "clamp(40px, 10vw, 90px)",
            textShadow: `4px 4px 0 ${COLORS.text}`,
            whiteSpace: "nowrap",
            marginTop: 4,
          }}
        >
          DE MI VIDA
        </span>
      </h1>

      <p
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 18,
          color: "#444",
          maxWidth: 520,
          marginTop: 14,
          lineHeight: 1.4,
        }}
      >
        {TEXTOS.landingIntro}
      </p>

      <div style={{ marginTop: 24 }}>
        <CromoDemo />
      </div>
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 13,
          color: "#888",
          marginTop: 10,
        }}
      >
        {TEXTOS.landingDemoNota}
      </div>

      <Link
        href="/mundial/crear"
        style={{
          display: "inline-block",
          marginTop: 24,
          background: COLORS.text,
          color: COLORS.bg,
          padding: "20px 48px",
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 3,
          borderRadius: 999,
          boxShadow: `6px 6px 0 ${COLORS.gold}`,
        }}
      >
        CREAR MI SELECCIÓN →
      </Link>

      <footer
        style={{
          marginTop: 80,
          fontSize: 12,
          color: "#888",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
        }}
      >
        Un proyecto de{" "}
        <a
          href="https://arturopaniagua.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: COLORS.text,
            fontWeight: 700,
            textDecoration: "underline",
            textDecorationColor: COLORS.gold,
            textUnderlineOffset: 3,
          }}
        >
          Arturo Paniagua
        </a>{" "}
        ·{" "}
        <a
          href="https://arturopaniagua.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: COLORS.text,
            fontWeight: 700,
            textDecoration: "underline",
            textDecorationColor: COLORS.gold,
            textUnderlineOffset: 3,
          }}
        >
          arturopaniagua.com
        </a>
      </footer>
    </main>
  );
}
