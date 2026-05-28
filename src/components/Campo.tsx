"use client";

import { COLORS } from "@/lib/colores";
import type { Artista } from "@/lib/tipos";
import { SlotJugador } from "./SlotJugador";

export type SlotRef =
  | { tipo: "portero" }
  | { tipo: "defensa"; indice: number }
  | { tipo: "mediocampo"; indice: number }
  | { tipo: "delantera"; indice: number };

type Props = {
  portero: Artista | null;
  defensas: (Artista | null)[];
  medios: (Artista | null)[];
  delanteros: (Artista | null)[];
  onAbrirSlot: (slot: SlotRef) => void;
  onLimpiarSlot: (slot: SlotRef) => void;
};

export function Campo({
  portero,
  defensas,
  medios,
  delanteros,
  onAbrirSlot,
  onLimpiarSlot,
}: Props) {
  return (
    <div
      style={{
        background: `
          linear-gradient(180deg, ${COLORS.pitch} 0%, ${COLORS.pitchLight} 50%, ${COLORS.pitch} 100%),
          repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.03) 12px, rgba(255,255,255,0.03) 24px)
        `,
        padding: "20px 8px",
        border: `2px solid ${COLORS.text}`,
        borderRadius: 12,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 12,
        minHeight: 520,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          border: `1px solid ${COLORS.pitchLine}`,
          borderRadius: 8,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          background: COLORS.pitchLine,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 60,
          height: 60,
          border: `1px solid ${COLORS.pitchLine}`,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          position: "relative",
          zIndex: 1,
        }}
      >
        {delanteros.map((a, i) => (
          <SlotJugador
            key={`d-${i}`}
            dndId={`delantera-${i}`}
            artista={a}
            etiqueta="Delantero"
            bgOscuro
            onClick={() => onAbrirSlot({ tipo: "delantera", indice: i })}
            onRemove={() => onLimpiarSlot({ tipo: "delantera", indice: i })}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          position: "relative",
          zIndex: 1,
        }}
      >
        {medios.map((a, i) => (
          <SlotJugador
            key={`m-${i}`}
            dndId={`mediocampo-${i}`}
            artista={a}
            etiqueta="Mediocampo"
            bgOscuro
            onClick={() => onAbrirSlot({ tipo: "mediocampo", indice: i })}
            onRemove={() => onLimpiarSlot({ tipo: "mediocampo", indice: i })}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          position: "relative",
          zIndex: 1,
        }}
      >
        {defensas.map((a, i) => (
          <SlotJugador
            key={`f-${i}`}
            dndId={`defensa-${i}`}
            artista={a}
            etiqueta="Defensa"
            size="small"
            bgOscuro
            onClick={() => onAbrirSlot({ tipo: "defensa", indice: i })}
            onRemove={() => onLimpiarSlot({ tipo: "defensa", indice: i })}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <SlotJugador
          dndId="portero"
          artista={portero}
          etiqueta="Portero"
          bgOscuro
          onClick={() => onAbrirSlot({ tipo: "portero" })}
          onRemove={() => onLimpiarSlot({ tipo: "portero" })}
        />
      </div>
    </div>
  );
}
