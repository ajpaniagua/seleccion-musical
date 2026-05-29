"use client";

import { useEffect, useRef, useState } from "react";
import type { Seleccion } from "@/lib/tipos";
import { CromoFinal } from "./CromoFinal";

const ESCALA = 0.42;
const ANCHO_BASE = 480;

// Fotos reales de Deezer cacheadas a través de nuestro proxy /api/foto.
// Hardcoded para no tener que pegarle a la API en cada visita a la landing.
const D = (hash: string) =>
  `https://cdn-images.dzcdn.net/images/artist/${hash}/1000x1000-000000-80-0-0.jpg`;

const SELECCION_DEMO: Seleccion = {
  usuario: "tu_nombre",
  himno: { id: "demo-1", titulo: "Mediterráneo", artista: "Joan Manuel Serrat" },
  seleccionador: {
    id: "demo-s",
    nombre: "Bunbury",
    foto: D("08b73c9b2f63b5e269efda3b1f762007"),
  },
  portero: {
    id: "demo-p",
    nombre: "Camarón de la Isla",
    foto: D("877069deb0f62bdd7584d268c863bd76"),
  },
  defensas: [
    { id: "d1", nombre: "Mecano", foto: D("a7335b62b37653e04be8a9ad32c7b7bd") },
    {
      id: "d2",
      nombre: "Héroes del Silencio",
      foto: D("8df7881250c96ec27bbf6dc92c89d393"),
    },
    {
      id: "d3",
      nombre: "Los Planetas",
      foto: D("17f8104eb19fc6c0d3049791b2a19f66"),
    },
    {
      id: "d4",
      nombre: "Extremoduro",
      foto: D("fac337de59e1a5ae1100c53f2685a53f"),
    },
  ],
  medios: [
    {
      id: "m1",
      nombre: "Antonio Vega",
      foto: D("1498030d1f8288d0fc2c8ef25bb90339"),
    },
    {
      id: "m2",
      nombre: "Radio Futura",
      foto: D("9ba13a68bdbfa282a6d0b6fa3c4ba0d8"),
    },
    { id: "m3", nombre: "Zahara", foto: D("04950881d6aa5deaed2ad09396fd1bb2") },
  ],
  delanteros: [
    {
      id: "f1",
      nombre: "Rosalía",
      foto: D("96636156440182f1e7db3f77d39e6545"),
    },
    {
      id: "f2",
      nombre: "Paco de Lucía",
      foto: D("a39ed1db816ffe65ce47a3ed67831dca"),
    },
    {
      id: "f3",
      nombre: "C. Tangana",
      foto: D("0e48ef0b911fe883e0eaa67350c85c46"),
    },
  ],
  banquillo: [
    { id: "s1", nombre: "Amaia", foto: D("94692c20cfdae68537e615b3312f2146") },
    {
      id: "s2",
      nombre: "Luz Casal",
      foto: D("d6f2e5a62ed668f843060d3ceda9d57d"),
    },
    { id: "s3", nombre: "Leiva", foto: D("d466308ffa855c5321e75385f3a07bb4") },
    {
      id: "s4",
      nombre: "Vetusta Morla",
      foto: D("8682e037612a642d79e06584cb4e1e29"),
    },
    {
      id: "s5",
      nombre: "Kiko Veneno",
      foto: D("76f5a7ac02d84e5b5e9c7466bc9290fe"),
    },
  ],
};

/**
 * Miniatura del cromo para la landing: cromo real escalado a la mitad,
 * con fondo + gradiente igual que en la vista de compartir, y fotos reales
 * de Deezer servidas a través del proxy /api/foto.
 */
export function CromoDemo() {
  // Medimos la altura real del cromo (varía si se cambia el contenido o
  // las dimensiones de CromoFinal) para que el wrapper escalado reserve
  // exactamente el espacio justo.
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
