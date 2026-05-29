import type { Metadata } from "next";
import Link from "next/link";
import { CromoDemo } from "@/components/CromoDemo";
import { COLORS } from "@/lib/colores";

export const metadata: Metadata = {
  title: "[PREVIEW] La selección musical de mi vida",
  robots: { index: false, follow: false },
};

const POSTER = "'Bebas Neue', 'Anton', sans-serif";

/**
 * Preview de rediseño en dirección "sport poster condensed":
 * - Bebas Neue como tipografía de cartel callejero de partido.
 * - Composición que rompe la lineal: títulos descomunales, números grandes
 *   de cartel deportivo, cromo integrado en la composición.
 * - Inter solo para UI utilitaria y micro-copy.
 */
export default function PreviewPage() {
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
          fontFamily: POSTER,
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
            fontFamily: "'Inter', sans-serif",
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
              fontFamily: POSTER,
              fontWeight: 400,
              lineHeight: 0.82,
              letterSpacing: -1,
            }}
          >
            <span
              style={{
                display: "block",
                // min más bajo para que en iPhone (375px) "LA SELECCIÓN MUSICAL"
                // siga cabiendo en una sola línea sin desbordar lateralmente.
                fontSize: "clamp(28px, 8vw, 96px)",
                color: COLORS.text,
                whiteSpace: "nowrap",
              }}
            >
              LA SELECCIÓN MUSICAL
            </span>
            <span
              style={{
                display: "block",
                fontSize: "clamp(52px, 16vw, 200px)",
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
            maxWidth: 460,
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#333",
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          Tu once de música contra el mundo. Himno, seleccionador, titulares y
          banquillo de lujo. <strong>Solo te llevará 5 minutos.</strong>
        </p>

        {/* Cromo como héroe central. Usamos el prop `escala` del componente
            (que envuelve internamente con transform + ResizeObserver) en lugar
            de aplicar el scale por fuera: así el layout reserva el espacio
            correcto y no se solapa con el CTA. */}
        <div style={{ marginTop: 32 }}>
          <CromoDemo escala={1.2} />
        </div>

        <Link
          href="/mundial/crear"
          style={{
            display: "inline-block",
            marginTop: 40,
            background: COLORS.text,
            color: COLORS.bg,
            padding: "20px 52px",
            fontSize: "clamp(20px, 2.6vw, 28px)",
            fontWeight: 400,
            letterSpacing: 4,
            borderRadius: 0,
            boxShadow: `6px 6px 0 ${COLORS.gold}`,
            fontFamily: POSTER,
            border: `2px solid ${COLORS.text}`,
          }}
        >
          ARMA TU SELECCIÓN →
        </Link>

        <footer
          style={{
            marginTop: 60,
            fontSize: 12,
            color: "#666",
            fontFamily: "'Inter', sans-serif",
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
            marginTop: 36,
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
      </div>
    </main>
  );
}
