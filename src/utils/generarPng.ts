import { toPng } from "html-to-image";

/**
 * Genera un PNG del cromo escalado a 1080×1920 (3× sobre el render de 480×853).
 * Devuelve un objeto Blob listo para descargar o pasar a navigator.share.
 */
export async function generarPngCromo(nodo: HTMLElement): Promise<Blob> {
  // Esperamos a que las fuentes terminen de cargar para evitar saltos tipográficos
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const dataUrl = await toPng(nodo, {
    pixelRatio: 2.25,
    cacheBust: true,
    backgroundColor: "#1a1410",
    fontEmbedCSS: undefined,
    skipFonts: false,
  });
  const res = await fetch(dataUrl);
  return res.blob();
}

export function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Intenta compartir un archivo a través de navigator.share (móvil).
 * Devuelve true si se pudo iniciar el share, false si toca fallback.
 */
export async function compartirArchivo(blob: Blob, nombre: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };
  if (!nav.share || !nav.canShare) return false;
  const file = new File([blob], nombre, { type: blob.type || "image/png" });
  const data: ShareData = { files: [file] };
  if (!nav.canShare(data)) return false;
  try {
    await nav.share(data);
    return true;
  } catch (e) {
    // Usuario canceló o falló — devolvemos false para que el caller decida fallback
    if ((e as Error)?.name === "AbortError") return true;
    return false;
  }
}
