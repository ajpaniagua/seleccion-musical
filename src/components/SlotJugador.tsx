"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/colores";
import type { Artista } from "@/lib/tipos";
import { partirNombre } from "@/utils/partirNombre";

type Size = "tiny" | "small" | "normal";

const SIZES: Record<Size, { circle: number; font: number; width: number }> = {
  tiny: { circle: 36, font: 8, width: 60 },
  small: { circle: 44, font: 9, width: 72 },
  normal: { circle: 52, font: 10, width: 78 },
};

type Props = {
  artista: Artista | null;
  size?: Size;
  etiqueta: string;
  onClick: () => void;
  onRemove?: () => void;
  bgOscuro?: boolean;
  dndId?: string;
};

export function SlotJugador({
  artista,
  size = "normal",
  etiqueta,
  onClick,
  onRemove,
  bgOscuro = false,
  dndId,
}: Props) {
  const s = SIZES[size];
  const partido = artista ? partirNombre(artista.nombre) : null;
  const colorNombre = bgOscuro ? COLORS.bg : COLORS.text;
  const sombraNombre = bgOscuro ? "0 1px 2px rgba(0,0,0,0.9)" : "none";

  // Pulse dorado cuando un slot pasa de vacío a tener artista.
  const previaTuvoArtista = useRef(!!artista);
  const [recienAnadido, setRecienAnadido] = useState(false);
  useEffect(() => {
    if (artista && !previaTuvoArtista.current) {
      setRecienAnadido(true);
      const t = setTimeout(() => setRecienAnadido(false), 600);
      return () => clearTimeout(t);
    }
    previaTuvoArtista.current = !!artista;
  }, [artista]);

  const draggable = useDraggable({
    id: dndId ?? "_disabled-drag",
    disabled: !dndId || !artista,
  });
  const droppable = useDroppable({
    id: dndId ?? "_disabled-drop",
    disabled: !dndId,
  });

  const isOver = droppable.isOver;
  const isDragging = draggable.isDragging;

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    width: s.width,
    background: "transparent",
    border: "none",
    padding: 4,
    cursor: artista ? "grab" : "pointer",
    // Permitimos scroll vertical hasta que el drag se active explícitamente.
    // dnd-kit (TouchSensor con delay) bloquea touchAction al activarse.
    touchAction: "manipulation",
    transform: draggable.transform
      ? `translate3d(${draggable.transform.x}px, ${draggable.transform.y}px, 0)`
      : undefined,
    transition: isDragging ? undefined : "transform 150ms ease",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const setRef = (el: HTMLDivElement | null) => {
    draggable.setNodeRef(el);
    droppable.setNodeRef(el);
  };

  return (
    <div
      ref={setRef}
      style={wrapperStyle}
      {...draggable.attributes}
      {...draggable.listeners}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={artista ? `${artista.nombre}, arrastra para mover` : etiqueta}
    >
      <div
        style={{
          width: s.circle,
          height: s.circle,
          borderRadius: "50%",
          background: artista ? COLORS.bg : "rgba(255,255,255,0.08)",
          border: artista
            ? `2px solid ${COLORS.gold}`
            : `2px dashed ${bgOscuro ? "rgba(255,255,255,0.5)" : "#bbb"}`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOver
            ? `0 0 0 3px ${COLORS.gold}`
            : recienAnadido
              ? `0 0 0 4px ${COLORS.gold}, 0 0 20px rgba(212,162,46,0.8)`
              : artista
                ? "0 2px 5px rgba(0,0,0,0.4)"
                : "none",
          transform: recienAnadido ? "scale(1.15)" : "scale(1)",
          transition:
            "box-shadow 280ms ease-out, transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {artista ? (
          artista.foto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={artista.foto}
              alt={artista.nombre}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontSize: s.font + 4,
                fontWeight: 900,
                color: COLORS.text,
              }}
            >
              {artista.nombre.charAt(0).toUpperCase()}
            </span>
          )
        ) : (
          <span
            style={{
              fontSize: s.circle * 0.4,
              color: bgOscuro ? "rgba(255,255,255,0.6)" : "#bbb",
              fontWeight: 300,
            }}
          >
            +
          </span>
        )}
      </div>

      <div
        style={{
          textAlign: "center",
          lineHeight: 1.1,
          minHeight: 24,
          pointerEvents: "none",
        }}
      >
        {partido ? (
          <>
            <div
              style={{
                fontSize: s.font,
                fontWeight: 900,
                fontStyle: "italic",
                color: colorNombre,
                textShadow: sombraNombre,
                letterSpacing: 0.2,
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
                  fontStyle: "italic",
                  color: colorNombre,
                  textShadow: sombraNombre,
                  letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                  marginTop: 1,
                }}
              >
                {partido.linea2}
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: bgOscuro ? "rgba(255,255,255,0.7)" : "#888",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {etiqueta}
          </div>
        )}
      </div>

      {artista && onRemove && (
        <span
          role="button"
          aria-label="Quitar"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 0,
            right: 6,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: COLORS.red,
            color: "#fff",
            fontSize: 12,
            lineHeight: "18px",
            textAlign: "center",
            fontWeight: 900,
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          ×
        </span>
      )}
    </div>
  );
}
