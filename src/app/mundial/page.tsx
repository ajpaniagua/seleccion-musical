import type { Metadata } from "next";
import Link from "next/link";
import { CromoDemo } from "@/components/CromoDemo";
import { COLORS } from "@/lib/colores";
import { FUENTES } from "@/lib/tipografias";

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
        background: COLORS.bg,
        padding: "32px 20px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* "2026" decorativo gigante en el fondo, marca de agua tipo poster */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          right: "-2vw",
          fontFamily: FUENTES.POSTER,
          fontSize: "min(36vw, 460px)",
          color: COLORS.gold,
          opacity: 0.07,
          lineHeight: 0.85,
          pointerEvents: "none",
          letterSpacing: -10,
        }}
      >
        2026
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: COLORS.gold,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: 6,
            marginBottom: 24,
            fontFamily: FUENTES.UI,
          }}
        >
          ★ MUNDIAL MUSICAL 2026 ★
        </div>

        {/* Bloque de título en estilo poster: condensed extremo, capas */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: FUENTES.POSTER,
              fontWeight: 400,
              lineHeight: 0.82,
              letterSpacing: -1,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "clamp(40px, 11vw, 96px)",
                color: COLORS.text,
                whiteSpace: "nowrap",
              }}
            >
              LA SELECCIÓN MUSICAL
            </span>
            <span
              style={{
                display: "block",
                fontSize: "clamp(72px, 22vw, 200px)",
                color: COLORS.gold,
                textShadow: `5px 5px 0 ${COLORS.text}`,
                whiteSpace: "nowrap",
                marginTop: 4,
                letterSpacing: -3,
              }}
            >
              DE MI VIDA
            </span>
          </h1>
        </div>

        <p
          style={{
            margin: "26px 0 0",
            maxWidth: 560,
            fontFamily: FUENTES.UI,
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#333",
            lineHeight: 1.45,
            fontWeight: 500,
            textWrap: "balance",
          }}
        >
          Tu once de música contra el mundo. Himno, seleccionador, titulares y
          banquillo de{" "}lujo.
          <br />
          <strong style={{ whiteSpace: "nowrap" }}>
            Solo te llevará 5 minutos.
          </strong>
        </p>

        {/* CTA arriba del cromo: importante en móvil para no tener que
            scrollear hasta el final. */}
        <Link
          href="/mundial/crear"
          style={{
            display: "inline-block",
            marginTop: 28,
            background: COLORS.text,
            color: COLORS.bg,
            padding: "20px 52px",
            fontSize: "clamp(20px, 2.6vw, 28px)",
            fontWeight: 400,
            letterSpacing: 4,
            borderRadius: 0,
            boxShadow: `6px 6px 0 ${COLORS.gold}`,
            fontFamily: FUENTES.POSTER,
            border: `2px solid ${COLORS.text}`,
          }}
        >
          ARMA TU SELECCIÓN →
        </Link>

        {/* Cromo como referencia visual debajo */}
        <div
          style={{
            marginTop: 56,
            fontFamily: FUENTES.POSTER,
            fontSize: 14,
            letterSpacing: 4,
            color: "#666",
            marginBottom: 14,
          }}
        >
          ASÍ SE VERÁ TU CROMO EN REDES SOCIALES
        </div>
        <div>
          <CromoDemo escala={1.2} />
        </div>

        <footer
          style={{
            marginTop: 60,
            fontSize: 12,
            color: "#666",
            fontFamily: FUENTES.UI,
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
      </div>
    </main>
  );
}
