import type { MetadataRoute } from "next";

// Sitemap del proyecto, accesible en /sitemap.xml del subdominio.
// El subdominio mundial.arturopaniagua.com vive directamente en Vercel
// (CNAME, sin proxy), así que aquí servimos su propio sitemap. Hay que
// registrar esta URL en Google Search Console manualmente
// (Settings → Sitemaps → Submit a new sitemap).
//
// Se incluyen las páginas indexables. Quedan fuera /admin (privada con
// robots noindex), /opengraph-image, /icon y los endpoints de API.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mundial.arturopaniagua.com";
  const ahora = new Date();

  return [
    {
      url: `${base}/`,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/crear`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/legal`,
      lastModified: ahora,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
