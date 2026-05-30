import type { MetadataRoute } from "next";

// Sitemap del proyecto, accesible en /mundial/sitemap.xml.
// El robots.txt vive en la raíz del dominio (servido por SiteGround para
// la web principal de Arturo), así que no podemos referenciarlo desde ahí
// automáticamente: hay que registrar esta URL manualmente en Google Search
// Console (Settings → Sitemaps → Submit a new sitemap).
//
// Se incluyen las páginas indexables. Quedan fuera /mundial/admin (privada,
// con robots noindex), /mundial/opengraph-image, /mundial/icon y los
// endpoints de API.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://arturopaniagua.com";
  const ahora = new Date();

  return [
    {
      url: `${base}/mundial`,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/mundial/crear`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/mundial/legal`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
