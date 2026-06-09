import type { Metadata } from "next";

// `page.tsx` de esta ruta es un client component, así que no puede exportar
// metadata. Lo hacemos desde un layout intermedio que envuelve solo esta
// ruta sin alterar la estructura visual: simplemente devuelve children.
export const metadata: Metadata = {
  title: "Arma tu selección · La selección musical de mi vida",
  description:
    "Elige tu himno, tu seleccionador, los once titulares y el banquillo. Genera tu cromo y compártelo en redes sociales.",
  alternates: {
    canonical: "/crear",
  },
  openGraph: {
    title: "Arma tu selección musical",
    description:
      "Tu himno, tu seleccionador, tu once. Genera tu cromo y compártelo en cinco minutos.",
    url: "https://mundial.arturopaniagua.com/crear",
    siteName: "arturopaniagua.com",
    locale: "es_ES",
    type: "website",
  },
};

export default function CrearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
