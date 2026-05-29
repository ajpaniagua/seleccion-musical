"use client";

import { useEffect, useRef, useState } from "react";
import type { Seleccion } from "@/lib/tipos";
import { CromoFinal } from "./CromoFinal";

const ESCALA = 0.42;
const ANCHO_BASE = 480;

// Selección demo curada para la landing: clásicos universales, géneros muy
// diversos (soul, rock, jazz, reggae, pop, glam, funk, chanson, country,
// folk latinoamericano, blues) y paridad fuerte (9 mujeres entre once y
// banquillo). Hardcoded para no pegarle a la API en cada visita.
const D = (hash: string) =>
  `https://cdn-images.dzcdn.net/images/artist/${hash}/1000x1000-000000-80-0-0.jpg`;

const SELECCION_DEMO: Seleccion = {
  usuario: "tu_nombre",
  himno: { id: "h", titulo: "Imagine", artista: "John Lennon" },
  seleccionador: {
    id: "s",
    nombre: "Quincy Jones",
    foto: D("71a51858525f1418ed4cb894690ab20e"),
  },
  portero: {
    id: "p",
    nombre: "Ella Fitzgerald",
    foto: D("0250af414d882062b1a77aa9521b7331"),
  },
  defensas: [
    { id: "d1", nombre: "Madonna", foto: D("2498e1e0c6930809143a743b746958be") },
    {
      id: "d2",
      nombre: "Stevie Wonder",
      foto: D("b8138428e7b0ce78843106b4b83d4e77"),
    },
    {
      id: "d3",
      nombre: "Édith Piaf",
      foto: D("242534322478decb42a2df37f712bbac"),
    },
    {
      id: "d4",
      nombre: "Tina Turner",
      foto: D("6dfabac67edec77d322a2d85be60d87a"),
    },
  ],
  medios: [
    {
      id: "m1",
      nombre: "Bob Marley",
      foto: D("c8241e15efdefa9465c7b470643efb3b"),
    },
    {
      id: "m2",
      nombre: "Nina Simone",
      foto: D("b165a74366ee734abd789180099e129d"),
    },
    { id: "m3", nombre: "Prince", foto: D("85eec086152fb01d873ccdb0810e2660") },
  ],
  delanteros: [
    {
      id: "f1",
      nombre: "David Bowie",
      foto: D("8301a6a09a24f4bb35950c59717defa0"),
    },
    {
      id: "f2",
      nombre: "Aretha Franklin",
      foto: D("4453648f7e780028c2be766b21474223"),
    },
    {
      id: "f3",
      nombre: "Michael Jackson",
      foto: D("97fae13b2b30e4aec2e8c9e0c7839d92"),
    },
  ],
  banquillo: [
    {
      id: "s1",
      nombre: "Amy Winehouse",
      foto: D("0cacb43a576b031eb169cca27171c1f5"),
    },
    {
      id: "s2",
      nombre: "Billie Holiday",
      foto: D("6ef0c8b38d744ab219951165cd52e595"),
    },
    {
      id: "s3",
      nombre: "Mercedes Sosa",
      foto: D("4a41cc292b5ca1de2b4af49ff87ba96e"),
    },
    {
      id: "s4",
      nombre: "Jimi Hendrix",
      foto: D("2deec542fc75d5691434c407ee077ff7"),
    },
    {
      id: "s5",
      nombre: "Frank Sinatra",
      foto: D("e22ed29d34715f53323c6d190410a27c"),
    },
  ],
};

/**
 * Miniatura del cromo para la landing: cromo real escalado, con fondo +
 * gradiente, y fotos reales de Deezer servidas a través del proxy /api/foto.
 */
export function CromoDemo() {
  // Medimos la altura real del cromo para que el wrapper escalado reserve
  // el espacio exacto y no se corte el footer.
  const cromoRef = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState(720);
  useEffect(() => {
    if (!cromoRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h && h > 0) setAlto(h);
    });
    ro.observe(cromoRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      style={{
        width: ANCHO_BASE * ESCALA,
        height: alto * ESCALA,
        flexShrink: 0,
        background: "#1a1410",
        backgroundImage:
          "radial-gradient(circle at 10% 10%, rgba(212,162,46,0.28) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(212,162,46,0.20) 0%, transparent 45%)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        ref={cromoRef}
        style={{
          width: ANCHO_BASE,
          transformOrigin: "top left",
          transform: `scale(${ESCALA})`,
          background: "transparent",
        }}
      >
        <CromoFinal seleccion={SELECCION_DEMO} />
      </div>
    </div>
  );
}
