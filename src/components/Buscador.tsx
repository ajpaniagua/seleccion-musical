"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loguearBusqueda } from "@/lib/api";
import { COLORS } from "@/lib/colores";
import { buscarArtistas, buscarCanciones, BusquedaError } from "@/lib/musica";
import type { Artista, Cancion } from "@/lib/tipos";
import { useDebounce } from "@/utils/useDebounce";

type ModoArtista = {
  modo: "artista";
  titulo: string;
  subtitulo: string;
  onSelect: (a: Artista) => void;
};

type ModoCancion = {
  modo: "cancion";
  titulo: string;
  subtitulo: string;
  onSelect: (c: Cancion) => void;
};

type Props = (ModoArtista | ModoCancion) & {
  onClose: () => void;
};

export function Buscador(props: Props) {
  const [query, setQuery] = useState("");
  const [resultadosArt, setResultadosArt] = useState<Artista[]>([]);
  const [resultadosCan, setResultadosCan] = useState<Cancion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounced = useDebounce(query, 400);
  const ultimaBusquedaLogueada = useRef<string>("");
  const seleccionoAlgo = useRef(false);

  // Loguea cada nueva búsqueda debounced (anadido=false provisionalmente)
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2 || q === ultimaBusquedaLogueada.current) return;
    ultimaBusquedaLogueada.current = q;
    loguearBusqueda(q, false);
  }, [debounced]);

  // Cuando el usuario seleccione, reenviamos la última búsqueda como anadido=true
  function notificarSeleccion() {
    seleccionoAlgo.current = true;
    const q = debounced.trim();
    if (q.length >= 2) loguearBusqueda(q, true);
  }

  const placeholder = useMemo(
    () =>
      props.modo === "artista" ? "Busca un artista…" : "Busca una canción…",
    [props.modo]
  );

  useEffect(() => {
    let cancel = false;
    async function run() {
      const q = debounced.trim();
      if (q.length < 2) {
        setResultadosArt([]);
        setResultadosCan([]);
        setError(null);
        return;
      }
      setCargando(true);
      setError(null);
      try {
        if (props.modo === "artista") {
          const r = await buscarArtistas(q);
          if (!cancel) setResultadosArt(r);
        } else {
          const r = await buscarCanciones(q);
          if (!cancel) setResultadosCan(r);
        }
      } catch (e) {
        if (cancel) return;
        if (e instanceof BusquedaError) {
          setError(e.message);
        } else {
          setError("No se pudo buscar. Revisa tu conexión e inténtalo de nuevo.");
        }
      } finally {
        if (!cancel) setCargando(false);
      }
    }
    run();
    return () => {
      cancel = true;
    };
  }, [debounced, props.modo]);

  return (
    <div
      onClick={props.onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "5vh 16px",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.bg,
          width: "100%",
          maxWidth: 480,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        <header
          style={{
            padding: "16px 20px 12px",
            borderBottom: `1px solid ${COLORS.paper}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: COLORS.text,
                }}
              >
                {props.titulo}
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  lineHeight: 1.4,
                  color: "#555",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                }}
              >
                {props.subtitulo}
              </p>
            </div>
            <button
              onClick={props.onClose}
              aria-label="Cerrar"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 24,
                color: COLORS.text,
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px 14px",
              fontSize: 16,
              borderRadius: 8,
              border: `2px solid ${COLORS.text}`,
              outline: "none",
              background: COLORS.bg,
            }}
          />
        </header>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "8px 0",
          }}
        >
          {error && (
            <div style={{ padding: "16px 20px", color: COLORS.red, fontSize: 14 }}>
              {error}
            </div>
          )}
          {cargando && (
            <div style={{ padding: "16px 20px", color: "#888", fontSize: 14 }}>
              Buscando…
            </div>
          )}
          {!cargando && !error && debounced.trim().length >= 2 && (
            <>
              {props.modo === "artista" &&
                resultadosArt.length === 0 && (
                  <div style={{ padding: "16px 20px", color: "#888", fontSize: 14 }}>
                    Sin resultados.
                  </div>
                )}
              {props.modo === "cancion" &&
                resultadosCan.length === 0 && (
                  <div style={{ padding: "16px 20px", color: "#888", fontSize: 14 }}>
                    Sin resultados.
                  </div>
                )}
            </>
          )}

          {props.modo === "artista" &&
            resultadosArt.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  notificarSeleccion();
                  props.onSelect(a);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  padding: "10px 20px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  borderBottom: `1px solid ${COLORS.paper}`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: COLORS.paper,
                    border: `2px solid ${COLORS.gold}`,
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {a.foto && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={a.foto}
                      alt={a.nombre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>
                    {a.nombre}
                  </div>
                  {a.genero && (
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {a.genero}
                    </div>
                  )}
                </div>
              </button>
            ))}

          {props.modo === "cancion" &&
            resultadosCan.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  notificarSeleccion();
                  props.onSelect(c);
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  width: "100%",
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  borderBottom: `1px solid ${COLORS.paper}`,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: COLORS.text,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{c.titulo}&rdquo;
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>{c.artista}</div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
