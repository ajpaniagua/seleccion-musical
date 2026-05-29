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
          marginBottom: 22,
        }}
      >
        ★ MUNDIAL MUSICAL 2026 ★
      </div>

      {/* El título grande "La selección musical DE MI VIDA" ya vive dentro
          del propio cromo demo, así que aquí lo dejamos solo como intro
          editorial para evitar redundancia. */}
      <p
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 20,
          color: "#333",
          maxWidth: 520,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {TEXTOS.landingIntro}
      </p>

      <div style={{ marginTop: 28 }}>
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
        Un proyecto de Arturo Paniagua · arturopaniagua.com
      </footer>
    </main>
  );
}
