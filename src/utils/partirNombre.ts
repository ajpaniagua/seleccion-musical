export type NombrePartido = {
  linea1: string;
  linea2: string | null;
};

export function partirNombre(nombre: string): NombrePartido {
  const upper = nombre.toUpperCase();
  if (nombre.length <= 11) {
    return { linea1: upper, linea2: null };
  }
  const palabras = upper.split(" ");
  if (palabras.length === 1) {
    return { linea1: upper, linea2: null };
  }
  const mitad = Math.ceil(palabras.length / 2);
  return {
    linea1: palabras.slice(0, mitad).join(" "),
    linea2: palabras.slice(mitad).join(" "),
  };
}
