/**
 * Dispara un evento personalizado a Google Analytics 4 si gtag está
 * disponible. Defensivo: no rompe nada si gtag no está cargado (ad-blocker,
 * sin NEXT_PUBLIC_GA_ID en local, SSR…). Fire-and-forget.
 *
 * Los eventos personalizados aparecen en GA4 → Reports → Engagement →
 * Events. Para marcarlos como conversiones: Admin → Events → toggle
 * "Mark as conversion" en el evento.
 */
export function trackEvent(
  evento: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  const gtag = (
    window as Window & { gtag?: (...args: unknown[]) => void }
  ).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", evento, params ?? {});
  } catch {
    // no-op: nunca dejar que un fallo de analytics rompa la UI
  }
}
