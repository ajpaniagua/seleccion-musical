import type { Artista, Seleccion } from "@/lib/tipos";

export type SlotId =
  | { tipo: "portero" }
  | { tipo: "defensa"; indice: number }
  | { tipo: "mediocampo"; indice: number }
  | { tipo: "delantera"; indice: number }
  | { tipo: "banquillo"; indice: number };

export function idSlot(s: SlotId): string {
  if (s.tipo === "portero") return "portero";
  return `${s.tipo}-${s.indice}`;
}

export function parseSlotId(id: string): SlotId | null {
  if (id === "portero") return { tipo: "portero" };
  const m = id.match(/^(defensa|mediocampo|delantera|banquillo)-(\d+)$/);
  if (!m) return null;
  return { tipo: m[1] as SlotId["tipo"], indice: Number(m[2]) } as SlotId;
}

export function leerSlot(s: Seleccion, slot: SlotId): Artista | null {
  switch (slot.tipo) {
    case "portero":
      return s.portero;
    case "defensa":
      return s.defensas[slot.indice] ?? null;
    case "mediocampo":
      return s.medios[slot.indice] ?? null;
    case "delantera":
      return s.delanteros[slot.indice] ?? null;
    case "banquillo":
      return s.banquillo[slot.indice] ?? null;
  }
}

export function escribirSlot(
  s: Seleccion,
  slot: SlotId,
  a: Artista | null
): Seleccion {
  switch (slot.tipo) {
    case "portero":
      return { ...s, portero: a };
    case "defensa": {
      const arr = [...s.defensas];
      arr[slot.indice] = a;
      return { ...s, defensas: arr };
    }
    case "mediocampo": {
      const arr = [...s.medios];
      arr[slot.indice] = a;
      return { ...s, medios: arr };
    }
    case "delantera": {
      const arr = [...s.delanteros];
      arr[slot.indice] = a;
      return { ...s, delanteros: arr };
    }
    case "banquillo": {
      const arr = [...s.banquillo];
      arr[slot.indice] = a;
      return { ...s, banquillo: arr };
    }
  }
}

export function intercambiarSlots(
  s: Seleccion,
  a: SlotId,
  b: SlotId
): Seleccion {
  if (idSlot(a) === idSlot(b)) return s;
  const artA = leerSlot(s, a);
  const artB = leerSlot(s, b);
  let next = escribirSlot(s, a, artB);
  next = escribirSlot(next, b, artA);
  return next;
}
