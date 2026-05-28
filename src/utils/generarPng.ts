import { toPng } from "html-to-image";

/**
 * Recorre todas las <img> de un nodo y las convierte a data: URL.
 * Esto evita el problema de "tainted canvas" al generar PNG con html-to-image:
 * cuando la librería clona el DOM y re-descarga las imágenes desde el CDN,
 * el navegador no respeta el crossOrigin a tiempo y el canvas queda
 * contaminado, generando imágenes con los círculos en blanco.
 *
 * Guardamos los src originales y los restauramos al terminar, para no
 * romper la vista previa del cromo si el usuario vuelve a editar.
 */
async function inlineImagenes(nodo: HTMLElement): Promise<() => void> {
  const imgs = Array.from(nodo.querySelectorAll("img"));
  const originales: Array<{ img: HTMLImageElement; src: string }> = [];

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith("data:")) return;
      try {
        const res = await fetch(src, { cache: "no-cache", mode: "cors" });
        if (!res.ok) return;
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        originales.push({ img, src });
        img.src = dataUrl;
        // Esperamos a que la nueva imagen se decode antes de continuar
        if (img.decode) {
          try {
            await img.decode();
          } catch {}
        }
      } catch (e) {
        console.warn("[cromo] no pude inline-ar imagen:", src, e);
      }
    })
  );

  return () => {
    for (const { img, src } of originales) {
      img.src = src;
    }
  };
}

/**
 * Genera un PNG del cromo escalado a 1080×1920 (≈2.25× sobre el render de 480×853).
 * Devuelve un Blob listo para descargar o pasar a navigator.share.
 */
export async function generarPngCromo(nodo: HTMLElement): Promise<Blob> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const restaurar = await inlineImagenes(nodo);
  try {
    const dataUrl = await toPng(nodo, {
      pixelRatio: 2.25,
      cacheBust: true,
      backgroundColor: "#1a1410",
      skipFonts: false,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  } finally {
    restaurar();
  }
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
 * Heurística simple para decidir si el dispositivo del usuario es móvil.
 * Combina User-Agent Client Hints (navegadores modernos) con un fallback
 * por user agent + touch points.
 */
export function esDispositivoMovil(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (typeof uaData?.mobile === "boolean") return uaData.mobile;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(ua)) return true;
  // iPad moderno se identifica como Mac, lo cazamos por touch
  if (navigator.maxTouchPoints > 1 && /Mac/i.test(ua)) return true;
  return false;
}

/**
 * Intenta compartir un archivo a través de navigator.share (móvil).
 * Devuelve true si se completó o el usuario canceló, false si toca fallback
 * a descarga.
 */
export async function compartirArchivo(
  blob: Blob,
  nombre: string
): Promise<boolean> {
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
    if ((e as Error)?.name === "AbortError") return true;
    return false;
  }
}
