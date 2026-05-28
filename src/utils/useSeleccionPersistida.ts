import { useEffect, useRef, useState } from "react";
import { crearSeleccionVacia, type Seleccion } from "@/lib/tipos";

const STORAGE_KEY = "mi-seleccion:borrador";
const VERSION = 1;

type Persistido = {
  v: number;
  s: Seleccion;
};

function leer(): Seleccion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persistido;
    if (parsed.v !== VERSION) return null;
    return parsed.s;
  } catch {
    return null;
  }
}

function escribir(s: Seleccion) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: VERSION, s } satisfies Persistido)
    );
  } catch {}
}

export function limpiarSeleccionPersistida() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function useSeleccionPersistida(): [
  Seleccion,
  React.Dispatch<React.SetStateAction<Seleccion>>,
  boolean,
] {
  const [seleccion, setSeleccion] = useState<Seleccion>(() => crearSeleccionVacia());
  const [hidratada, setHidratada] = useState(false);
  const primeraEscritura = useRef(true);

  useEffect(() => {
    const persistida = leer();
    if (persistida) setSeleccion(persistida);
    setHidratada(true);
  }, []);

  useEffect(() => {
    if (!hidratada) return;
    if (primeraEscritura.current) {
      primeraEscritura.current = false;
      return;
    }
    escribir(seleccion);
  }, [seleccion, hidratada]);

  return [seleccion, setSeleccion, hidratada];
}
