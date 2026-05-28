"use client";

import { COLORS } from "@/lib/colores";
import { partirNombre } from "@/utils/partirNombre";
import { proxyFoto } from "@/utils/proxyFoto";

type Size = "tiny" | "small" | "normal";

const SIZES: Record<Size, { circle: number; font: number; gap: number; blockHeight: number }> = {
  tiny: { circle: 30, font: 7, gap: 2, blockHeight: 22 },
  small: { circle: 36, font: 8, gap: 3, blockHeight: 24 },
  normal: { circle: 42, font: 9, gap: 3, blockHeight: 26 },
};

type Props = {
  nombre: string;
  foto: string;
  size?: Size;
  bgOscuro?: boolean;
};

export function Jugador({
  nombre,
  foto,
  size = "normal",
  bgOscuro = true,
}: Props) {
  const s = SIZES[size];
  const partido = partirNombre(nombre);
  const colorTexto = bgOscuro ? COLORS.bg : COLORS.text;
  const sombraTexto = bgOscuro
    ? "0 1px 2px rgba(0,0,0,0.9)"
    : "0 1px 1px rgba(255,255,255,0.6)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: s.gap,
        width: 70,
      }}
    >
      <div
        style={{
          width: s.circle,
          height: s.circle,
          borderRadius: "50%",
          background: COLORS.bg,
          border: `2px solid ${COLORS.gold}`,
          boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {foto && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={proxyFoto(foto)}
            alt={nombre}
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div
        style={{
          textAlign: "center",
          lineHeight: 1.05,
          height: s.blockHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: s.font,
            fontWeight: 900,
            color: colorTexto,
            letterSpacing: 0.2,
            fontStyle: "italic",
            textShadow: sombraTexto,
            whiteSpace: "nowrap",
          }}
        >
          {partido.linea1}
        </div>
        {partido.linea2 && (
          <div
            style={{
              fontSize: s.font,
              fontWeight: 900,
              color: COLORS.bg,
              letterSpacing: 0.2,
              fontStyle: "italic",
              textShadow: "0 1px 2px rgba(0,0,0,0.9)",
              whiteSpace: "nowrap",
              marginTop: 1,
            }}
          >
            {partido.linea2}
          </div>
        )}
      </div>
    </div>
  );
}
