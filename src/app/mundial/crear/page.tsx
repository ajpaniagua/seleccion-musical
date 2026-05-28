"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Banquillo } from "@/components/Banquillo";
import { Buscador } from "@/components/Buscador";
import { Campo, type SlotRef } from "@/components/Campo";
import { CromoFinal } from "@/components/CromoFinal";
import { SlotJugador } from "@/components/SlotJugador";
import { guardarSeleccion } from "@/lib/api";
import { COLORS } from "@/lib/colores";
import {
  compartirArchivo,
  descargarBlob,
  esDispositivoMovil,
  generarPngCromo,
} from "@/utils/generarPng";
import {
  intercambiarSlots,
  parseSlotId,
} from "@/utils/slotsDnd";
import {
  contarRellenosObligatorios,
  contarRellenosTotales,
  crearSeleccionVacia,
  seleccionEsValida,
  seleccionTieneAlgo,
  TOTAL_OBLIGATORIOS,
  type Artista,
  type Cancion,
  type Seleccion,
} from "@/lib/tipos";
import {
  limpiarSeleccionPersistida,
  useSeleccionPersistida,
} from "@/utils/useSeleccionPersistida";

type BuscadorAbierto =
  | { tipo: "himno" }
  | { tipo: "seleccionador" }
  | { tipo: "campo"; slot: SlotRef }
  | { tipo: "banquillo"; indice: number }
  | null;

const COPYS = {
  himno: {
    titulo: "Tu himno",
    subtitulo:
      "La canción que mejor te define. La que te emociona desde el primer acorde. La que pondrías para presentarte al mundo.",
  },
  seleccionador: {
    titulo: "Tu seleccionador",
    subtitulo:
      "El artista que dirige tu sensibilidad musical. El que te enseñó a escuchar. Tu referente, tu maestro, tu brújula.",
  },
  once: {
    titulo: "Un artista para el once",
    subtitulo:
      "Los once artistas que siempre saltan al campo de tu vida. Los que te han marcado de verdad. No los más famosos, los tuyos.",
  },
  banquillo: {
    titulo: "Un suplente",
    subtitulo:
      "Los que no son titulares pero también te han hecho vibrar. Tus suplentes de lujo. Los que entran cuando el partido lo pide.",
  },
} as const;

export default function CrearPage() {
  const [seleccion, setSeleccion] = useSeleccionPersistida();
  const [abierto, setAbierto] = useState<BuscadorAbierto>(null);
  const [mostrarCromo, setMostrarCromo] = useState(false);

  const valida = seleccionEsValida(seleccion);
  const rellenosObligatorios = contarRellenosObligatorios(seleccion);
  const rellenosTotales = contarRellenosTotales(seleccion);
  const progresoPct = Math.round((rellenosObligatorios / TOTAL_OBLIGATORIOS) * 100);
  const tieneAlgo = seleccionTieneAlgo(seleccion);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // En móvil: press-and-hold de 250ms y permitimos hasta 14px de "wobble"
    // del dedo antes de cancelar. Más generoso que los defaults para que el
    // drag se active con confianza sin pelear con el scroll vertical.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 14 } })
  );

  function manejarDragEnd(e: DragEndEvent) {
    if (!e.over) return;
    const aId = String(e.active.id);
    const bId = String(e.over.id);
    if (aId === bId) return;
    const a = parseSlotId(aId);
    const b = parseSlotId(bId);
    if (!a || !b) return;
    setSeleccion((s) => intercambiarSlots(s, a, b));
  }

  function empezarDeCero() {
    if (
      !window.confirm(
        "¿Empezar de cero? Se borrará tu selección actual y no se podrá recuperar."
      )
    )
      return;
    limpiarSeleccionPersistida();
    setSeleccion(crearSeleccionVacia());
  }

  function asignarArtistaCampo(slot: SlotRef, a: Artista) {
    setSeleccion((s) => {
      const next = { ...s };
      if (slot.tipo === "portero") {
        next.portero = a;
      } else if (slot.tipo === "defensa") {
        const arr = [...s.defensas];
        arr[slot.indice] = a;
        next.defensas = arr;
      } else if (slot.tipo === "mediocampo") {
        const arr = [...s.medios];
        arr[slot.indice] = a;
        next.medios = arr;
      } else if (slot.tipo === "delantera") {
        const arr = [...s.delanteros];
        arr[slot.indice] = a;
        next.delanteros = arr;
      }
      return next;
    });
  }

  function limpiarCampo(slot: SlotRef) {
    setSeleccion((s) => {
      const next = { ...s };
      if (slot.tipo === "portero") {
        next.portero = null;
      } else if (slot.tipo === "defensa") {
        const arr = [...s.defensas];
        arr[slot.indice] = null;
        next.defensas = arr;
      } else if (slot.tipo === "mediocampo") {
        const arr = [...s.medios];
        arr[slot.indice] = null;
        next.medios = arr;
      } else if (slot.tipo === "delantera") {
        const arr = [...s.delanteros];
        arr[slot.indice] = null;
        next.delanteros = arr;
      }
      return next;
    });
  }

  function asignarBanquillo(indice: number, a: Artista) {
    setSeleccion((s) => {
      const arr = [...s.banquillo];
      arr[indice] = a;
      return { ...s, banquillo: arr };
    });
  }

  function limpiarBanquillo(indice: number) {
    setSeleccion((s) => {
      const arr = [...s.banquillo];
      arr[indice] = null;
      return { ...s, banquillo: arr };
    });
  }

  function manejarSeleccionArtista(a: Artista) {
    if (!abierto) return;
    if (abierto.tipo === "seleccionador") {
      setSeleccion((s) => ({ ...s, seleccionador: a }));
    } else if (abierto.tipo === "campo") {
      asignarArtistaCampo(abierto.slot, a);
    } else if (abierto.tipo === "banquillo") {
      asignarBanquillo(abierto.indice, a);
    }
    setAbierto(null);
  }

  function manejarSeleccionCancion(c: Cancion) {
    setSeleccion((s) => ({ ...s, himno: c }));
    setAbierto(null);
  }

  function manejarGenerar() {
    if (!valida) return;
    setMostrarCromo(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Cuando mostramos el cromo, empujamos una entrada al historial para que
  // "atrás" del navegador vuelva al editor en lugar de a la landing. Si el
  // usuario pulsa atrás (popstate), salimos del cromo sin perder la selección.
  useEffect(() => {
    if (!mostrarCromo) return;
    window.history.pushState({ vista: "cromo" }, "", "?cromo=1");

    function manejarPop() {
      setMostrarCromo(false);
    }
    window.addEventListener("popstate", manejarPop);
    return () => {
      window.removeEventListener("popstate", manejarPop);
    };
  }, [mostrarCromo]);

  if (mostrarCromo && valida) {
    return (
      <VistaCromo
        seleccion={seleccion}
        onVolver={() => {
          // Usamos history.back() en vez de setear el state directamente:
          // dispara nuestro popstate listener (que apaga mostrarCromo) y
          // de paso limpia la entrada "?cromo=1" del historial.
          if (typeof window !== "undefined") window.history.back();
          else setMostrarCromo(false);
        }}
      />
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={manejarDragEnd}>
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 16px 80px",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          ★ MUNDIAL MUSICAL 2026 ★
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: -1.5,
            lineHeight: 1,
          }}
        >
          La selección musical
          <br />
          <span style={{ color: COLORS.gold, fontSize: 44 }}>DE MI VIDA</span>
        </h1>
        <p
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#555",
            marginTop: 12,
            fontSize: 15,
            lineHeight: 1.5,
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Arma tu selección con los artistas y canciones que mejor te representan,
          y comparte tu cromo con el mundo. Solo te llevará 5 minutos.
        </p>
      </header>

      <BarraProgreso
        rellenos={rellenosObligatorios}
        total={TOTAL_OBLIGATORIOS}
        pct={progresoPct}
        rellenosBanquillo={rellenosTotales - rellenosObligatorios}
        tieneAlgo={tieneAlgo}
        onReset={empezarDeCero}
      />

      <Seccion titulo="HIMNO" subtitulo={COPYS.himno.subtitulo}>
        <button
          type="button"
          onClick={() => setAbierto({ tipo: "himno" })}
          style={{
            width: "100%",
            background: COLORS.text,
            color: COLORS.bg,
            border: "none",
            padding: 16,
            borderRadius: 10,
            textAlign: "left",
            boxShadow: `4px 4px 0 ${COLORS.gold}`,
          }}
        >
          {seleccion.himno ? (
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  color: COLORS.gold,
                  fontWeight: 900,
                  marginBottom: 4,
                }}
              >
                ★ HIMNO ELEGIDO
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: COLORS.gold,
                  letterSpacing: -0.5,
                }}
              >
                &ldquo;{seleccion.himno.titulo}&rdquo;
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                {seleccion.himno.artista.toUpperCase()}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontStyle: "italic", opacity: 0.7 }}>
                Elige una canción…
              </span>
              <span style={{ color: COLORS.gold, fontSize: 22, fontWeight: 900 }}>+</span>
            </div>
          )}
        </button>
      </Seccion>

      <Seccion
        titulo="SELECCIONADOR"
        subtitulo={COPYS.seleccionador.subtitulo}
      >
        <div
          style={{
            background: COLORS.paper,
            border: `2px dashed ${COLORS.gold}`,
            borderRadius: 10,
            padding: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SlotJugador
            artista={seleccion.seleccionador}
            etiqueta="Seleccionador"
            onClick={() => setAbierto({ tipo: "seleccionador" })}
            onRemove={() => setSeleccion((s) => ({ ...s, seleccionador: null }))}
          />
        </div>
      </Seccion>

      <Seccion titulo="ONCE INICIAL · 4-3-3" subtitulo={COPYS.once.subtitulo}>
        <Campo
          portero={seleccion.portero}
          defensas={seleccion.defensas}
          medios={seleccion.medios}
          delanteros={seleccion.delanteros}
          onAbrirSlot={(slot) => setAbierto({ tipo: "campo", slot })}
          onLimpiarSlot={limpiarCampo}
        />
      </Seccion>

      <Seccion titulo="BANQUILLO · 5 suplentes" subtitulo={COPYS.banquillo.subtitulo}>
        <Banquillo
          banquillo={seleccion.banquillo}
          onAbrirSlot={(i) => setAbierto({ tipo: "banquillo", indice: i })}
          onLimpiarSlot={limpiarBanquillo}
        />
      </Seccion>

      <Seccion
        titulo="FIRMA"
        subtitulo="Pon tu @ para firmar tu cromo. Es opcional, pero la gente verá quién armó esta selección."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.text }}>@</span>
          <input
            value={seleccion.usuario}
            onChange={(e) =>
              setSeleccion((s) => ({
                ...s,
                usuario: e.target.value.replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30),
              }))
            }
            placeholder="tu_usuario"
            style={{
              flex: 1,
              padding: "10px 14px",
              fontSize: 16,
              border: `2px solid ${COLORS.text}`,
              borderRadius: 8,
              outline: "none",
              background: COLORS.bg,
            }}
          />
        </div>
      </Seccion>

      <div
        style={{
          position: "sticky",
          bottom: 16,
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={manejarGenerar}
          disabled={!valida}
          style={{
            background: valida ? COLORS.text : "#888",
            color: COLORS.bg,
            border: "none",
            padding: "18px 36px",
            fontSize: 16,
            fontWeight: 900,
            letterSpacing: 2,
            borderRadius: 999,
            boxShadow: valida ? `4px 4px 0 ${COLORS.gold}` : "none",
            cursor: valida ? "pointer" : "not-allowed",
          }}
        >
          {valida ? "GENERAR CROMO" : faltanCampos(seleccion)}
        </button>
      </div>

      {abierto?.tipo === "himno" && (
        <Buscador
          modo="cancion"
          titulo={COPYS.himno.titulo}
          subtitulo={COPYS.himno.subtitulo}
          onClose={() => setAbierto(null)}
          onSelect={manejarSeleccionCancion}
        />
      )}
      {abierto?.tipo === "seleccionador" && (
        <Buscador
          modo="artista"
          titulo={COPYS.seleccionador.titulo}
          subtitulo={COPYS.seleccionador.subtitulo}
          onClose={() => setAbierto(null)}
          onSelect={manejarSeleccionArtista}
        />
      )}
      {abierto?.tipo === "campo" && (
        <Buscador
          modo="artista"
          titulo={COPYS.once.titulo}
          subtitulo={COPYS.once.subtitulo}
          onClose={() => setAbierto(null)}
          onSelect={manejarSeleccionArtista}
        />
      )}
      {abierto?.tipo === "banquillo" && (
        <Buscador
          modo="artista"
          titulo={COPYS.banquillo.titulo}
          subtitulo={COPYS.banquillo.subtitulo}
          onClose={() => setAbierto(null)}
          onSelect={manejarSeleccionArtista}
        />
      )}
    </main>
    </DndContext>
  );
}

function BarraProgreso({
  rellenos,
  total,
  pct,
  rellenosBanquillo,
  tieneAlgo,
  onReset,
}: {
  rellenos: number;
  total: number;
  pct: number;
  rellenosBanquillo: number;
  tieneAlgo: boolean;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        background: COLORS.bg,
        padding: "12px 0",
        marginBottom: 20,
        borderBottom: `1px solid ${COLORS.paper}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 3,
              color: COLORS.text,
            }}
          >
            {rellenos} DE {total} OBLIGATORIOS
          </div>
          {rellenosBanquillo > 0 && (
            <div
              style={{
                fontSize: 11,
                color: "#888",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
              }}
            >
              + {rellenosBanquillo} en el banquillo
            </div>
          )}
        </div>
        {tieneAlgo && (
          <button
            type="button"
            onClick={onReset}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #ccc",
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              borderRadius: 999,
            }}
          >
            EMPEZAR DE CERO
          </button>
        )}
      </div>
      <div
        style={{
          height: 6,
          background: COLORS.paper,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: pct === 100 ? COLORS.gold : COLORS.text,
            transition: "width 200ms ease",
          }}
        />
      </div>
    </div>
  );
}

function Seccion({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: 900,
          color: COLORS.text,
          marginBottom: 4,
        }}
      >
        ★ {titulo}
      </div>
      <p
        style={{
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          color: "#555",
          fontSize: 14,
          lineHeight: 1.5,
          marginTop: 0,
          marginBottom: 14,
        }}
      >
        {subtitulo}
      </p>
      {children}
    </section>
  );
}

function faltanCampos(s: Seleccion): string {
  if (!s.himno) return "FALTA EL HIMNO";
  if (!s.seleccionador) return "FALTA EL SELECCIONADOR";
  if (!s.portero) return "FALTA EL PORTERO";
  const huecosCampo =
    s.defensas.filter((a) => !a).length +
    s.medios.filter((a) => !a).length +
    s.delanteros.filter((a) => !a).length;
  if (huecosCampo > 0)
    return `FALTAN ${huecosCampo} EN EL ONCE`;
  return "GENERAR CROMO";
}

function VistaCromo({
  seleccion,
  onVolver,
}: {
  seleccion: Seleccion;
  onVolver: () => void;
}) {
  const cromoRef = useRef<HTMLDivElement>(null);
  const [generando, setGenerando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [movil, setMovil] = useState(false);
  const [escala, setEscala] = useState(1);

  // Detecta solo en cliente (esDispositivoMovil necesita navigator)
  useEffect(() => {
    setMovil(esDispositivoMovil());
  }, []);

  // El cromo mide 480px de ancho. Si el viewport es menor, escalamos
  // visualmente para que entre con margen, pero el DOM sigue a tamaño real
  // (la captura quita el transform momentáneamente para generar el PNG a 1080×1920).
  useEffect(() => {
    function calcular() {
      const margenLateral = 32;
      const disponible = window.innerWidth - margenLateral;
      setEscala(disponible >= 480 ? 1 : Math.max(0.5, disponible / 480));
    }
    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, []);

  // Mientras la VistaCromo esté montada, pintamos body y html en gris oscuro
  // para que el "rubber band scroll" de iOS/macOS no enseñe el blanco del
  // body global por arriba o por abajo del cromo.
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.background;
    const prevHtml = html.style.background;
    body.style.background = "#1a1a1a";
    html.style.background = "#1a1a1a";
    return () => {
      body.style.background = prevBody;
      html.style.background = prevHtml;
    };
  }, []);

  const nombreArchivo = useMemo(() => {
    const slug = (seleccion.usuario || "mi-seleccion")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    return `seleccion-musical-${slug || "mi-seleccion"}.png`;
  }, [seleccion.usuario]);

  const yaGuardada = useRef(false);

  async function manejarCompartir() {
    if (!cromoRef.current) return;
    setGenerando(true);
    setAviso(null);
    try {
      // Guardamos en BD una sola vez por sesión de cromo (idempotente desde la UI).
      // Si falla la BD seguimos generando el PNG igualmente — el usuario es lo primero.
      if (!yaGuardada.current) {
        const r = await guardarSeleccion(seleccion);
        if (r) yaGuardada.current = true;
      }
      // Quitamos el scale durante la captura. html2canvas captura lo que
      // ve en pantalla, así que con scale aplicado generaría un PNG pequeño.
      // Sacamos también el cromo de la viewport para que el usuario no vea
      // el flash a tamaño real.
      const wrap = cromoRef.current;
      const prev = {
        transform: wrap.style.transform,
        position: wrap.style.position,
        left: wrap.style.left,
        top: wrap.style.top,
        zIndex: wrap.style.zIndex,
      };
      wrap.style.transform = "none";
      wrap.style.position = "fixed";
      wrap.style.left = "-10000px";
      wrap.style.top = "0";
      wrap.style.zIndex = "-1";
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      let blob: Blob;
      try {
        blob = await generarPngCromo(cromoRef.current);
      } finally {
        wrap.style.transform = prev.transform;
        wrap.style.position = prev.position;
        wrap.style.left = prev.left;
        wrap.style.top = prev.top;
        wrap.style.zIndex = prev.zIndex;
      }

      if (movil) {
        // En móvil: abrir el sheet nativo de compartir. Si el usuario lo cancela
        // o el navegador no soporta share, caemos a descarga directa.
        const compartido = await compartirArchivo(blob, nombreArchivo);
        if (!compartido) {
          descargarBlob(blob, nombreArchivo);
          setAviso("Imagen descargada. Ya puedes subirla a Stories.");
        }
      } else {
        // En escritorio: descarga directa, sin sheet del SO.
        descargarBlob(blob, nombreArchivo);
        setAviso("Imagen descargada. La encuentras en tu carpeta de descargas.");
      }
    } catch (e) {
      console.error("[cromo] error generando PNG:", e);
      setAviso("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        padding: "40px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          // Reserva el espacio que ocupa el cromo escalado en el layout
          width: 480 * escala,
          height: 853 * escala,
          flexShrink: 0,
        }}
      >
        <div
          ref={cromoRef}
          style={{
            width: 480,
            height: 853,
            transformOrigin: "top left",
            transform: `scale(${escala})`,
          }}
        >
          <CromoFinal seleccion={seleccion} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onVolver}
          disabled={generando}
          style={{
            background: "transparent",
            color: COLORS.bg,
            border: `2px solid ${COLORS.bg}`,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 2,
            borderRadius: 999,
            opacity: generando ? 0.5 : 1,
          }}
        >
          ← VOLVER A EDITAR
        </button>
        <button
          type="button"
          onClick={manejarCompartir}
          disabled={generando}
          style={{
            background: COLORS.gold,
            color: COLORS.text,
            border: "none",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 2,
            borderRadius: 999,
            opacity: generando ? 0.7 : 1,
            cursor: generando ? "wait" : "pointer",
            boxShadow: `4px 4px 0 ${COLORS.text}`,
          }}
        >
          {generando
            ? "GENERANDO…"
            : movil
              ? "COMPARTE TU SELECCIÓN"
              : "DESCARGAR IMAGEN"}
        </button>
      </div>
      {aviso && (
        <p
          style={{
            color: COLORS.gold,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 14,
            maxWidth: 360,
            textAlign: "center",
            margin: 0,
          }}
        >
          {aviso}
        </p>
      )}
      <p
        style={{
          color: "rgba(255,255,255,0.6)",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: 13,
          maxWidth: 360,
          textAlign: "center",
        }}
      >
        {movil
          ? "Pulsa el botón para abrir el panel de compartir y subirla a Stories, WhatsApp o X."
          : "Pulsa el botón para descargar la imagen. Luego súbela a Stories, X o WhatsApp."}
      </p>
    </main>
  );
}
