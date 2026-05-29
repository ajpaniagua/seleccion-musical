"use client";

import { useEffect, useRef, useState } from "react";
import { COLORS } from "@/lib/colores";
import { Jugador } from "./Jugador";

// Fotos reales de Deezer (servidas por nuestro proxy /api/foto via Jugador).
const D = (hash: string) =>
  `https://cdn-images.dzcdn.net/images/artist/${hash}/1000x1000-000000-80-0-0.jpg`;

const HIMNO = { titulo: "Imagine", artista: "John Lennon" };
const SELECCIONADOR = {
  nombre: "Quincy Jones",
  foto: D("71a51858525f1418ed4cb894690ab20e"),
};

const DELANTEROS = [
  { nombre: "David Bowie", foto: D("8301a6a09a24f4bb35950c59717defa0") },
  { nombre: "Aretha Franklin", foto: D("4453648f7e780028c2be766b21474223") },
  { nombre: "Michael Jackson", foto: D("97fae13b2b30e4aec2e8c9e0c7839d92") },
];
const MEDIOS = [
  { nombre: "Bob Marley", foto: D("c8241e15efdefa9465c7b470643efb3b") },
  { nombre: "Nina Simone", foto: D("b165a74366ee734abd789180099e129d") },
  { nombre: "Prince", foto: D("85eec086152fb01d873ccdb0810e2660") },
];
const DEFENSAS = [
  { nombre: "Madonna", foto: D("2498e1e0c6930809143a743b746958be") },
  { nombre: "Stevie Wonder", foto: D("b8138428e7b0ce78843106b4b83d4e77") },
  { nombre: "Édith Piaf", foto: D("242534322478decb42a2df37f712bbac") },
  { nombre: "Tina Turner", foto: D("6dfabac67edec77d322a2d85be60d87a") },
];
const PORTERO = {
  nombre: "Ella Fitzgerald",
  foto: D("0250af414d882062b1a77aa9521b7331"),
};
const BANQUILLO = [
  { nombre: "Amy Winehouse", foto: D("0cacb43a576b031eb169cca27171c1f5") },
  { nombre: "Billie Holiday", foto: D("6ef0c8b38d744ab219951165cd52e595") },
  { nombre: "Mercedes Sosa", foto: D("4a41cc292b5ca1de2b4af49ff87ba96e") },
  { nombre: "Jimi Hendrix", foto: D("2deec542fc75d5691434c407ee077ff7") },
  { nombre: "Frank Sinatra", foto: D("e22ed29d34715f53323c6d190410a27c") },
];

type Props = {
  /**
   * Factor de escala visual. Si lo pasas distinto a 1, el componente se
   * envuelve con transform: scale + ResizeObserver para que el layout
   * exterior reserve el espacio escalado y no se solapen el CTA o el
   * siguiente bloque.
   */
  escala?: number;
};

/**
 * Vista parcial del cromo para la landing: solo himno, once y banquillo.
 * No es el cromo completo (no incluye título "La selección musical DE MI VIDA"
 * ni seleccionador ni footer), solo lo justo para que el visitante entienda
 * el formato sin duplicar el título de la landing.
 */
export function CromoDemo({ escala = 1 }: Props = {}) {
  const cromoRef = useRef<HTMLDivElement>(null);
  const [altoBase, setAltoBase] = useState(0);

  useEffect(() => {
    if (escala === 1 || !cromoRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h && h > 0) setAltoBase(h);
    });
    ro.observe(cromoRef.current);
    return () => ro.disconnect();
  }, [escala]);

  const cromo = (
    <div
      ref={cromoRef}
      style={{
        width: "100%",
        maxWidth: 360,
        background: COLORS.paper,
        border: `2px solid ${COLORS.gold}`,
        borderRadius: 10,
        boxShadow:
          "0 0 20px rgba(212,162,46,0.3), 0 20px 50px rgba(0,0,0,0.25)",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HIMNO + SELECCIONADOR EN FILA */}
      <div
        style={{
          padding: "14px 14px 12px",
          display: "flex",
          gap: 8,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            flex: 1.4,
            background: COLORS.text,
            color: COLORS.bg,
            padding: "10px 12px",
            borderRadius: 6,
            boxShadow: `2px 2px 0 ${COLORS.gold}`,
          }}
        >
          <div
            style={{
              fontSize: 8,
              letterSpacing: 2,
              color: COLORS.gold,
              fontWeight: 900,
              marginBottom: 4,
            }}
          >
            ★ HIMNO
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              fontStyle: "italic",
              color: COLORS.gold,
              letterSpacing: -0.4,
              lineHeight: 1,
              marginBottom: 3,
            }}
          >
            &ldquo;{HIMNO.titulo}&rdquo;
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.bg,
              letterSpacing: 0.3,
            }}
          >
            {HIMNO.artista.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: `linear-gradient(135deg, ${COLORS.gold}15 0%, transparent 100%)`,
            padding: "8px 10px",
            borderRadius: 6,
            border: `1.5px dashed ${COLORS.gold}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: COLORS.bg,
              border: `2px solid ${COLORS.gold}`,
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/foto?url=${encodeURIComponent(SELECCIONADOR.foto)}`}
              alt={SELECCIONADOR.nombre}
              crossOrigin="anonymous"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 7,
                letterSpacing: 1.5,
                color: COLORS.gold,
                fontWeight: 900,
              }}
            >
              ★ SELECCIONADOR
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: -0.3,
                color: COLORS.text,
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              {SELECCIONADOR.nombre}
            </div>
          </div>
        </div>
      </div>

      {/* ONCE 4-3-3 */}
      <div style={{ padding: "0 14px 12px" }}>
        <div
          style={{
            background: `linear-gradient(180deg, ${COLORS.pitch} 0%, ${COLORS.pitchLight} 50%, ${COLORS.pitch} 100%)`,
            padding: "12px 6px 10px",
            border: `1.5px solid ${COLORS.text}`,
            borderRadius: 6,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              right: 6,
              bottom: 6,
              border: `1px solid ${COLORS.pitchLine}`,
              borderRadius: 3,
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
              display: "flex",
              justifyContent: "space-around",
              position: "relative",
              zIndex: 1,
            }}
          >
            {DELANTEROS.map((j, i) => (
              <Jugador key={`d${i}`} nombre={j.nombre} foto={j.foto} size="normal" />
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
            {MEDIOS.map((j, i) => (
              <Jugador key={`m${i}`} nombre={j.nombre} foto={j.foto} size="normal" />
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
            {DEFENSAS.map((j, i) => (
              <Jugador key={`f${i}`} nombre={j.nombre} foto={j.foto} size="small" />
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
            <Jugador nombre={PORTERO.nombre} foto={PORTERO.foto} size="normal" />
          </div>
        </div>
      </div>

      {/* BANQUILLO */}
      <div style={{ padding: "0 14px 14px" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: 8,
            letterSpacing: 2.5,
            color: "#888",
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          ★ BANQUILLO
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {BANQUILLO.map((j, i) => (
            <Jugador
              key={`s${i}`}
              nombre={j.nombre}
              foto={j.foto}
              size="tiny"
              bgOscuro={false}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (escala === 1) return cromo;

  // Con escala, envolvemos en un wrapper de dimensiones escaladas para que
  // el layout exterior reserve el espacio real ocupado y el siguiente
  // elemento no se solape.
  return (
    <div
      style={{
        width: 360 * escala,
        height: altoBase ? altoBase * escala : undefined,
        // Mientras se mide la altura por primera vez (altoBase = 0),
        // dejamos auto para que tome el espacio que necesite.
      }}
    >
      <div
        style={{
          width: 360,
          transformOrigin: "top left",
          transform: `scale(${escala})`,
        }}
      >
        {cromo}
      </div>
    </div>
  );
}
