/**
 * Normaliza el nombre de un artista para deduplicación.
 * - minúsculas
 * - sin acentos
 * - sin "the " / "los " / "las " inicial
 * - espacios colapsados
 */
export function normalizarNombre(nombre: string): string {
  const sinAcentos = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  const sinArticulo = sinAcentos
    .replace(/^the\s+/, "")
    .replace(/^los\s+/, "")
    .replace(/^las\s+/, "")
    .replace(/^el\s+/, "")
    .replace(/^la\s+/, "");
  return sinArticulo.replace(/\s+/g, " ").trim();
}
