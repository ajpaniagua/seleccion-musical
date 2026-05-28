export type Artista = {
  id: string;
  nombre: string;
  foto: string;
  genero?: string;
};

export type Cancion = {
  id: string;
  titulo: string;
  artista: string;
};

export type PosicionCampo =
  | "portero"
  | "defensa"
  | "mediocampo"
  | "delantera";

export type SlotTitular = {
  posicion: PosicionCampo;
  indice: number;
  artista: Artista | null;
};

export type Seleccion = {
  usuario: string;
  himno: Cancion | null;
  seleccionador: Artista | null;
  portero: Artista | null;
  defensas: (Artista | null)[];
  medios: (Artista | null)[];
  delanteros: (Artista | null)[];
  banquillo: (Artista | null)[];
};

export const TAMANO_DEFENSAS = 4;
export const TAMANO_MEDIOS = 3;
export const TAMANO_DELANTEROS = 3;
export const TAMANO_BANQUILLO = 5;

export function crearSeleccionVacia(): Seleccion {
  return {
    usuario: "",
    himno: null,
    seleccionador: null,
    portero: null,
    defensas: Array(TAMANO_DEFENSAS).fill(null),
    medios: Array(TAMANO_MEDIOS).fill(null),
    delanteros: Array(TAMANO_DELANTEROS).fill(null),
    banquillo: Array(TAMANO_BANQUILLO).fill(null),
  };
}

export function seleccionEsValida(s: Seleccion): boolean {
  if (!s.himno || !s.seleccionador || !s.portero) return false;
  if (s.defensas.some((a) => !a)) return false;
  if (s.medios.some((a) => !a)) return false;
  if (s.delanteros.some((a) => !a)) return false;
  return true;
}

export const TOTAL_OBLIGATORIOS =
  2 + 1 + TAMANO_DEFENSAS + TAMANO_MEDIOS + TAMANO_DELANTEROS;

export function contarRellenosObligatorios(s: Seleccion): number {
  let n = 0;
  if (s.himno) n++;
  if (s.seleccionador) n++;
  if (s.portero) n++;
  n += s.defensas.filter(Boolean).length;
  n += s.medios.filter(Boolean).length;
  n += s.delanteros.filter(Boolean).length;
  return n;
}

export function contarRellenosTotales(s: Seleccion): number {
  return contarRellenosObligatorios(s) + s.banquillo.filter(Boolean).length;
}

export function seleccionTieneAlgo(s: Seleccion): boolean {
  return contarRellenosTotales(s) > 0 || s.usuario.length > 0;
}
