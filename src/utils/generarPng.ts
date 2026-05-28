import html2canvas from "html2canvas-pro";

/**
 * Genera un PNG del cromo escalado a ≈1080×1920 (2.25× sobre 480×853).
 * Usa html2canvas-pro porque maneja CORS limpiamente con useCORS:true,
 * a diferencia de html-to-image que se quedaba con los círculos en blanco.
 */
export async function generarPngCromo(nodo: HTMLElement): Promise<Blob> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const canvas = await html2canvas(nodo, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#1a1410",
    scale: 2.25,
    logging: false,
    imageTimeout: 12000,
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo serializar el canvas a PNG"));
      },
      "image/png",
      0.95
    );
  });
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
 * Heurística simple para detectar dispositivo móvil.
 * Combina User-Agent Client Hints (navegadores modernos) con fallback por UA + touch.
 */
export function esDispositivoMovil(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (typeof uaData?.mobile === "boolean") return uaData.mobile;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod|Android|Mobile/i.test(ua)) return true;
  if (navigator.maxTouchPoints > 1 && /Mac/i.test(ua)) return true;
  return false;
}

/**
 * Intenta compartir un archivo a través de navigator.share (móvil).
 * Devuelve true si se completó o el usuario canceló, false si toca fallback a descarga.
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
