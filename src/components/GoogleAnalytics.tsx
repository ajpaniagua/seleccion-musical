import Script from "next/script";

/**
 * Carga gtag.js de Google Analytics 4 si la variable de entorno
 * `NEXT_PUBLIC_GA_ID` está definida. Si no, no inyecta nada (útil en
 * desarrollo local para no contaminar las métricas).
 *
 * Decisión consciente: lanzamos sin banner de cookies. La página
 * /mundial/legal lo declara explícitamente y describe qué cookies pone
 * GA4 (`_ga`, `_ga_*`). Si en algún momento queremos añadir consent mode,
 * este es el componente a tocar.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
