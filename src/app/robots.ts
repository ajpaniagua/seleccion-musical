import type { MetadataRoute } from "next";

// Robots.txt del subdominio mundial.arturopaniagua.com.
// Le decimos explícitamente a los crawlers qué pueden indexar y dónde
// vive el sitemap. Sin este archivo Next/Vercel devuelve un 404 cuando
// Googlebot pide /robots.txt, lo cual no es bloqueante pero es feo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: "https://mundial.arturopaniagua.com/sitemap.xml",
    host: "https://mundial.arturopaniagua.com",
  };
}
