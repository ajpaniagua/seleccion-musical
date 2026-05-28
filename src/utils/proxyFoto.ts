/**
 * Convierte una URL externa (Deezer, iTunes) en una URL del proxy interno
 * para que sea CORS-safe y se pueda volcar en un canvas sin tainted.
 * Si la URL ya es relativa o vacía, se devuelve igual.
 */
export function proxyFoto(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("/api/foto")) return url;
  if (!url.startsWith("http")) return url;
  return `/api/foto?url=${encodeURIComponent(url)}`;
}
