"use client";

import type { Seleccion } from "@/lib/tipos";
import { CromoFinal } from "./CromoFinal";

// Selección de muestra para la landing. Sin fotos: se ven las iniciales
// en los círculos, lo cual basta para que se entienda el formato del cromo
// y evita depender de CDNs externos al cargar la home.
const SELECCION_DEMO: Seleccion = {
  usuario: "tu_nombre",
  himno: { id: "demo-1", titulo: "Mediterráneo", artista: "Joan Manuel Serrat" },
  seleccionador: { id: "demo-s", nombre: "Bunbury", foto: "" },
  portero: { id: "demo-p", nombre: "Camarón de la Isla", foto: "" },
  defensas: [
    { id: "d1", nombre: "Mecano", foto: "" },
    { id: "d2", nombre: "Héroes del Silencio", foto: "" },
    { id: "d3", nombre: "Los Planetas", foto: "" },
    { id: "d4", nombre: "Extremoduro", foto: "" },
  ],
  medios: [
    { id: "m1", nombre: "Antonio Vega", foto: "" },
    { id: "m2", nombre: "Radio Futura", foto: "" },
    { id: "m3", nombre: "Zahara", foto: "" },
  ],
  delanteros: [
    { id: "f1", nombre: "Rosalía", foto: "" },
    { id: "f2", nombre: "Paco de Lucía", foto: "" },
    { id: "f3", nombre: "C. Tangana", foto: "" },
  ],
  banquillo: [
    { id: "s1", nombre: "Amaia", foto: "" },
    { id: "s2", nombre: "Luz Casal", foto: "" },
    { id: "s3", nombre: "Leiva", foto: "" },
    { id: "s4", nombre: "Vetusta Morla", foto: "" },
    { id: "s5", nombre: "Kiko Veneno", foto: "" },
  ],
};

/**
 * Miniatura no interactiva del cromo para la landing. Sirve para que el
 * usuario vea de qué va antes de invertir 5 minutos creando el suyo.
 */
export function CromoDemo() {
  return (
    <div
      style={{
        // Wrapper con fondo + gradiente igual que en la vista de compartir,
        // para que el cromo se vea "completo" (transparente por dentro).
        width: 240,
        height: 320,
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
        style={{
          width: 480,
          transformOrigin: "top left",
          transform: "scale(0.5)",
          background: "transparent",
        }}
      >
        <CromoFinal seleccion={SELECCION_DEMO} />
      </div>
    </div>
  );
}
