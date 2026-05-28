"use client";

import { COLORS } from "@/lib/colores";
import type { Artista } from "@/lib/tipos";
import { SlotJugador } from "./SlotJugador";

type Props = {
  banquillo: (Artista | null)[];
  onAbrirSlot: (indice: number) => void;
  onLimpiarSlot: (indice: number) => void;
};

export function Banquillo({ banquillo, onAbrirSlot, onLimpiarSlot }: Props) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1px solid ${COLORS.gold}`,
        borderRadius: 12,
        padding: "16px 12px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: 900,
          color: "#777",
          marginBottom: 12,
        }}
      >
        ★ BANQUILLO
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          justifyItems: "center",
        }}
      >
        {banquillo.map((a, i) => (
          <SlotJugador
            key={`s-${i}`}
            dndId={`banquillo-${i}`}
            artista={a}
            size="tiny"
            etiqueta={`#${i + 1}`}
            onClick={() => onAbrirSlot(i)}
            onRemove={() => onLimpiarSlot(i)}
          />
        ))}
      </div>
    </div>
  );
}
