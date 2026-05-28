import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
