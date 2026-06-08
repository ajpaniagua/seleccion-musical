"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/colores";
import { FUENTES } from "@/lib/tipografias";
import { esNavegadorInApp } from "@/utils/generarPng";

/**
 * Mini-banner discreto que solo se renderiza si detectamos que la web está
 * cargada dentro del WebView de una red social (Instagram, Facebook, TikTok…).
 * Para el 98% de usuarios que entran desde Chrome, Safari o cualquier
 * navegador real, este componente devuelve null y la landing/constructor
 * permanecen visualmente limpios.
 *
 * El usuario afectado ve una pista para abrir la web en su navegador real,
 * donde el compartir y la descarga funcionan sin trampas.
 */
export function AvisoInApp() {
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(esNavegadorInApp());
  }, []);

  if (!inApp) return null;

  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1px solid ${COLORS.gold}`,
        borderRadius: 8,
        padding: "10px 14px",
        margin: "0 auto 18px",
        maxWidth: 520,
        fontFamily: FUENTES.UI,
        fontSize: 12.5,
        color: COLORS.text,
        lineHeight: 1.4,
        textAlign: "center",
        fontWeight: 500,
      }}
    >
      Para una experiencia completa, abre esta web en{" "}
      <strong>Chrome</strong> o <strong>Safari</strong>.
    </div>
  );
}
