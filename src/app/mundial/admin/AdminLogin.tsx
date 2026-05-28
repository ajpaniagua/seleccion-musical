"use client";

import { useState } from "react";
import { COLORS } from "@/lib/colores";

export function AdminLogin() {
  const [pass, setPass] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (!r.ok) {
        setError("Contraseña incorrecta.");
        return;
      }
      window.location.reload();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          ★ DASHBOARD ★
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          La selección musical
        </h1>
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#555",
            marginTop: 12,
            fontSize: 14,
          }}
        >
          Introduce la contraseña de Arturo para acceder al panel.
        </p>
        <form onSubmit={manejarSubmit} style={{ marginTop: 28 }}>
          <input
            type="password"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Contraseña"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: 16,
              border: `2px solid ${COLORS.text}`,
              borderRadius: 10,
              outline: "none",
              background: COLORS.bg,
            }}
          />
          {error && (
            <p style={{ color: COLORS.red, fontSize: 13, marginTop: 10 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={enviando || !pass}
            style={{
              marginTop: 16,
              width: "100%",
              background: enviando ? "#888" : COLORS.text,
              color: COLORS.bg,
              border: "none",
              padding: "14px",
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 2,
              borderRadius: 999,
              boxShadow: enviando ? "none" : `4px 4px 0 ${COLORS.gold}`,
              cursor: enviando ? "wait" : "pointer",
            }}
          >
            {enviando ? "COMPROBANDO…" : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}
