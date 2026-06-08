import html2canvas from "html2canvas-pro";

const ANCHO_FINAL = 1080;
const ALTO_FINAL = 1920;
const FONDO_FINAL = "#1a1410";

/**
 * Genera un PNG 1080×1920 (9:16, formato Stories) del cromo:
 *  1. Captura el cromo a su tamaño natural con html2canvas-pro.
 *     html2canvas-pro maneja CORS limpiamente, a diferencia de html-to-image
 *     que dejaba los círculos en blanco.
 *  2. Lo dibuja centrado verticalmente sobre un lienzo 1080×1920 con el
 *     mismo fondo oscuro del cromo, así el resultado siempre es 9:16
 *     estricto (independientemente de cuánto contenido tenga el cromo).
 */
export async function generarPngCromo(nodo: HTMLElement): Promise<Blob> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // Capturamos el cromo a 2.25× con fondo transparente. El lienzo final
  // pone el color base y el gradiente, así toda la imagen 9:16 luce el
  // mismo gradiente sin cortes en la frontera del cromo.
  const cromoCanvas = await html2canvas(nodo, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    scale: 2.25,
    logging: false,
    imageTimeout: 12000,
  });

  // Lienzo 1080×1920 con el fondo del marco
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = ANCHO_FINAL;
  finalCanvas.height = ALTO_FINAL;
  const ctx = finalCanvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.fillStyle = FONDO_FINAL;
  ctx.fillRect(0, 0, ANCHO_FINAL, ALTO_FINAL);

  // Mismo gradiente dorado del cromo, aplicado a todo el lienzo para que no
  // se vea un corte entre la zona del cromo y el padding 9:16.
  const grad1 = ctx.createRadialGradient(
    ANCHO_FINAL * 0.1,
    ALTO_FINAL * 0.1,
    0,
    ANCHO_FINAL * 0.1,
    ALTO_FINAL * 0.1,
    ANCHO_FINAL * 0.55
  );
  grad1.addColorStop(0, "rgba(212,162,46,0.28)");
  grad1.addColorStop(1, "rgba(212,162,46,0)");
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, ANCHO_FINAL, ALTO_FINAL);

  const grad2 = ctx.createRadialGradient(
    ANCHO_FINAL * 0.9,
    ALTO_FINAL * 0.9,
    0,
    ANCHO_FINAL * 0.9,
    ALTO_FINAL * 0.9,
    ANCHO_FINAL * 0.55
  );
  grad2.addColorStop(0, "rgba(212,162,46,0.2)");
  grad2.addColorStop(1, "rgba(212,162,46,0)");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, 0, ANCHO_FINAL, ALTO_FINAL);

  // Dibujamos el cromo centrado. Si por lo que sea no cupiera en altura,
  // lo escalamos manteniendo proporción (defensivo, no debería ocurrir).
  const cromoW = cromoCanvas.width;
  const cromoH = cromoCanvas.height;
  let drawW = cromoW;
  let drawH = cromoH;
  let offsetX = Math.round((ANCHO_FINAL - cromoW) / 2);
  let offsetY = Math.round((ALTO_FINAL - cromoH) / 2);
  if (cromoH > ALTO_FINAL || cromoW > ANCHO_FINAL) {
    const ratio = Math.min(ANCHO_FINAL / cromoW, ALTO_FINAL / cromoH);
    drawW = cromoW * ratio;
    drawH = cromoH * ratio;
    offsetX = Math.round((ANCHO_FINAL - drawW) / 2);
    offsetY = Math.round((ALTO_FINAL - drawH) / 2);
  }
  ctx.drawImage(cromoCanvas, offsetX, offsetY, drawW, drawH);

  return new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
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
 * Detecta si la página está cargada dentro del WebView in-app de Instagram,
 * Facebook, TikTok o similares. Esos navegadores in-app tienen limitaciones
 * importantes con `navigator.share()` (especialmente en Android) y a veces
 * bloquean la descarga directa de blobs, así que conviene avisar al usuario
 * para que abra la página en Chrome / Safari.
 */
export function esNavegadorInApp(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /Instagram|FBAN|FBAV|FB_IAB|FB4A|MessengerForiOS|Line\//i.test(ua) ||
    /TikTok|musical_ly|Twitter|LinkedInApp/i.test(ua)
  );
}

/**
 * ¿Es un dispositivo Android? Útil para decidir si mostrar el botón explícito
 * de descarga como fallback (en Chrome Android la Web Share API tiene más
 * casos de fallo). En iOS la API es fiable y no hace falta.
 */
export function esAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
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
