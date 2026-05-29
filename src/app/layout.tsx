import type { Metadata } from "next";
import "./globals.css";

// Base usada por Next para resolver URLs absolutas de Open Graph, Twitter
// Cards y canonical. Cambia con `NEXT_PUBLIC_SITE_URL` cuando se despliegue
// en un preview o en un dominio distinto; por defecto apunta al dominio
// definitivo del proyecto.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://arturopaniagua.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "La selección musical de mi vida",
  description:
    "Arma tu propia selección musical en formato Mundial: himno, seleccionador, once titular y banquillo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
