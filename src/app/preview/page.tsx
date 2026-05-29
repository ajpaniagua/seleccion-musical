import type { Metadata } from "next";
import Link from "next/link";
import { CromoDemo } from "@/components/CromoDemo";
import { COLORS } from "@/lib/colores";

export const metadata: Metadata = {
  title: "[PREVIEW] La selección musical de mi vida",
  robots: { index: false, follow: false },
};

const SERIF_DISPLAY = "'Fraunces', Georgia, serif";

/**
 * Versión paralela de la landing — propuesta de rediseño.
 * - Tipografía display: Fraunces (Google Fonts) en el título grande.
 * - Cromo demo como héroe visual.
 * - Cita editorial.
 */
export default function PreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 20px 60px",
        textAlign: "center",
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          color: COLORS.gold,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 5,
          marginBottom: 18,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        ★ MUNDIAL MUSICAL 2026 ★
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: SERIF_DISPLAY,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: -2,
          lineHeight: 0.92,
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "clamp(34px, 7.6vw, 78px)",
            whiteSpace: "nowrap",
            color: COLORS.text,
          }}
        >
          La selección musical
        </span>
        <span
          style={{
            display: "block",
            color: COLORS.gold,
            fontSize: "clamp(44px, 10.5vw, 110px)",
            textShadow: `4px 4px 0 ${COLORS.text}`,
            whiteSpace: "nowrap",
            marginTop: 6,
          }}
        >
          DE MI VIDA
        </span>
      </h1>

      {/* Cita editorial: pone la voz de Arturo como autor */}
      <blockquote
        style={{
          margin: "28px 0 0",
          maxWidth: 540,
          fontFamily: SERIF_DISPLAY,
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(18px, 2.4vw, 24px)",
          color: COLORS.text,
          lineHeight: 1.35,
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -18,
            left: -8,
            fontSize: 80,
            color: COLORS.gold,
            opacity: 0.35,
            lineHeight: 1,
            fontFamily: SERIF_DISPLAY,
          }}
        >
          &ldquo;
        </span>
        Cada canción que elegimos cuenta quién somos. Esta es la mía. ¿Cuál
        es la tuya?
        <footer
          style={{
            marginTop: 12,
            fontFamily: "'Inter', sans-serif",
            fontStyle: "normal",
            fontSize: 12,
            letterSpacing: 2.5,
            fontWeight: 900,
            color: "#666",
          }}
        >
          — ARTURO PANIAGUA
        </footer>
      </blockquote>

      {/* Cromo como héroe: más grande, sombra dramática */}
      <div style={{ marginTop: 38, transform: "scale(1.25)", transformOrigin: "top" }}>
        <CromoDemo />
      </div>

      <Link
        href="/mundial/crear"
        style={{
          display: "inline-block",
          marginTop: 100,
          background: COLORS.text,
          color: COLORS.bg,
          padding: "22px 56px",
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 3,
          borderRadius: 999,
          boxShadow: `6px 6px 0 ${COLORS.gold}`,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        CREAR MI SELECCIÓN →
      </Link>

      <footer
        style={{
          marginTop: 72,
          fontSize: 12,
          color: "#666",
          fontFamily: SERIF_DISPLAY,
          fontStyle: "italic",
        }}
      >
        Un proyecto de Arturo Paniagua ·{" "}
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

      <div
        style={{
          marginTop: 32,
          padding: "10px 18px",
          background: "rgba(212,162,46,0.15)",
          border: `1px dashed ${COLORS.gold}`,
          borderRadius: 8,
          fontSize: 12,
          color: COLORS.text,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: 1,
        }}
      >
        🎨 Vista previa de diseño · No es la landing real ·{" "}
        <Link href="/mundial" style={{ textDecoration: "underline" }}>
          ver versión actual
        </Link>
      </div>
    </main>
  );
}
