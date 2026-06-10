"use client";

import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AvisoInApp } from "@/components/AvisoInApp";
import { Banquillo } from "@/components/Banquillo";
import { Buscador } from "@/components/Buscador";
import { Campo, type SlotRef } from "@/components/Campo";
import { CromoFinal } from "@/components/CromoFinal";
import { SlotJugador } from "@/components/SlotJugador";
import { trackEvent } from "@/utils/analytics";
import { guardarSeleccion } from "@/lib/api";
import { COLORS } from "@/lib/colores";
import { COPYS, TEXTOS } from "@/lib/copys";
import { FUENTES } from "@/lib/tipografias";
import {
  compartirArchivo,
  descargarBlob,
  esAndroid,
  esDispositivoMovil,
  esNavegadorInApp,
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

export default function CrearPage() {
  const [seleccion, setSeleccion] = useSeleccionPersistida();
  const [abierto, setAbierto] = useState<BuscadorAbierto>(null);
  const [mostrarCromo, setMostrarCromo] = useState(false);

  const valida = seleccionEsValida(seleccion);
  const rellenosObligatorios = contarRellenosObligatorios(seleccion);
  const rellenosTotales = contarRellenosTotales(seleccion);
  const progresoPct = Math.round((rellenosObligatorios / TOTAL_OBLIGATORIOS) * 100);
  const tieneAlgo = seleccionTieneAlgo(seleccion);

  // MouseSensor + TouchSensor (en vez de PointerSensor + TouchSensor) para
  // que iOS Safari no dispare ambos. iOS emula pointer events desde touch,
  // así que un PointerSensor con `distance` se activa en cuanto el dedo se
  // mueve 6px y le come el turno al TouchSensor con delay, rompiendo tanto
  // el scroll vertical sobre los slots como el long-press intencional para
  // arrastrar. MouseSensor solo se dispara con eventos de ratón reales.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
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
    trackEvent("cromo_visto", {
      con_firma: !!seleccion.usuario,
      con_banquillo: contarRellenosTotales(seleccion) - TOTAL_OBLIGATORIOS > 0,
    });
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
      <AvisoInApp />
      <header style={{ textAlign: "center", marginBottom: 22 }}>
        <div
          style={{
            color: COLORS.gold,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 4,
            marginBottom: 10,
            fontFamily: FUENTES.UI,
          }}
        >
          ★ MUNDIAL MUSICAL 2026 ★
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FUENTES.POSTER,
            fontWeight: 400,
            lineHeight: 0.85,
            letterSpacing: -1,
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "clamp(34px, 7.6vw, 60px)",
              whiteSpace: "nowrap",
              color: COLORS.text,
            }}
          >
            LA SELECCIÓN MUSICAL
          </span>
          <span
            style={{
              display: "block",
              color: COLORS.gold,
              fontSize: "clamp(56px, 14vw, 130px)",
              whiteSpace: "nowrap",
              marginTop: 4,
              letterSpacing: -2,
              textShadow: `4px 4px 0 ${COLORS.text}`,
            }}
          >
            DE MI VIDA
          </span>
        </h1>
        <p
          style={{
            fontFamily: FUENTES.UI,
            color: "#333",
            marginTop: 14,
            fontSize: "clamp(15px, 2vw, 17px)",
            lineHeight: 1.45,
            fontWeight: 500,
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
            textWrap: "balance",
          }}
        >
          {TEXTOS.constructorIntro}
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
            border: `2px solid ${COLORS.text}`,
            padding: 16,
            borderRadius: 0,
            textAlign: "left",
            boxShadow: `5px 5px 0 ${COLORS.gold}`,
          }}
        >
          {seleccion.himno ? (
            <div>
              <div
                style={{
                  fontFamily: FUENTES.POSTER,
                  fontSize: 16,
                  letterSpacing: 3,
                  color: COLORS.gold,
                  fontWeight: 400,
                  marginBottom: 6,
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
                  fontFamily: FUENTES.UI,
                }}
              >
                &ldquo;{seleccion.himno.titulo}&rdquo;
              </div>
              <div
                style={{
                  fontFamily: FUENTES.POSTER,
                  fontSize: 16,
                  fontWeight: 400,
                  letterSpacing: 2,
                  marginTop: 4,
                }}
              >
                {seleccion.himno.artista.toUpperCase()}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: FUENTES.UI,
                  opacity: 0.7,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Elige una canción…
              </span>
              <span style={{ color: COLORS.gold, fontSize: 26, fontWeight: 900 }}>+</span>
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
        <p
          style={{
            fontFamily: FUENTES.UI,
            color: "#888",
            fontSize: 12,
            fontWeight: 500,
            marginTop: 4,
            marginBottom: 14,
            textAlign: "center",
          }}
        >
          {TEXTOS.tipDrag}
        </p>
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
        subtitulo={TEXTOS.firmaSubtitulo}
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
            placeholder="tu_usuario_de_instagram"
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
            border: valida ? `2px solid ${COLORS.text}` : "none",
            padding: "18px 44px",
            fontFamily: FUENTES.POSTER,
            fontSize: 26,
            fontWeight: 400,
            letterSpacing: 3,
            borderRadius: 0,
            boxShadow: valida ? `5px 5px 0 ${COLORS.gold}` : "none",
            cursor: valida ? "pointer" : "not-allowed",
          }}
        >
          {valida ? "GENERAR CROMO" : faltanCampos(seleccion)}
        </button>
      </div>

      <footer
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: `1px solid ${COLORS.paper}`,
          fontFamily: FUENTES.UI,
          fontSize: 12,
          color: "#888",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <Link
          href="/legal"
          style={{
            color: "#666",
            fontWeight: 700,
            textDecoration: "underline",
            textDecorationColor: COLORS.gold,
            textUnderlineOffset: 3,
          }}
        >
          Aviso legal y privacidad
        </Link>
        <div style={{ fontSize: 11, marginTop: 6, textWrap: "balance" }}>
          Proyecto editorial independiente. No asociado con la FIFA, UEFA,
          RFEF ni ninguna federación deportiva.
        </div>
      </footer>

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
              fontFamily: FUENTES.POSTER,
              fontSize: 22,
              fontWeight: 400,
              letterSpacing: 3,
              color: COLORS.text,
            }}
          >
            {rellenos} DE {total} OBLIGATORIOS
          </div>
          {rellenosBanquillo > 0 && (
            <div
              style={{
                fontSize: 12,
                color: "#888",
                fontFamily: FUENTES.UI,
                fontWeight: 500,
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
              color: "#666",
              border: "2px solid #999",
              padding: "6px 14px",
              fontFamily: FUENTES.POSTER,
              fontSize: 14,
              fontWeight: 400,
              letterSpacing: 2,
              borderRadius: 0,
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
    <section style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: FUENTES.POSTER,
          fontSize: 22,
          letterSpacing: 4,
          color: COLORS.text,
          marginBottom: 4,
        }}
      >
        ★ {titulo.toUpperCase()}
      </div>
      <p
        style={{
          fontFamily: FUENTES.UI,
          color: "#333",
          fontSize: 15,
          fontWeight: 500,
          lineHeight: 1.45,
          marginTop: 0,
          marginBottom: 12,
          textWrap: "balance",
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
  const [android, setAndroid] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [escala, setEscala] = useState(1);
  const [alturaCromo, setAlturaCromo] = useState(640);

  // Observa la altura natural del cromo (cambia según contenido) para que el
  // wrapper escalado pueda reservar el espacio correcto en el layout.
  useEffect(() => {
    if (!cromoRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h && h > 0) setAlturaCromo(h);
    });
    ro.observe(cromoRef.current);
    return () => ro.disconnect();
  }, []);

  // Detecta solo en cliente (esDispositivoMovil necesita navigator)
  useEffect(() => {
    setMovil(esDispositivoMovil());
    setAndroid(esAndroid());
    setInApp(esNavegadorInApp());
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

  // Guardamos la selección en BD AL ENTRAR a la vista del cromo (fire-and-forget),
  // no al pulsar compartir. Esto es crítico para Android: la Web Share API exige
  // que se llame dentro de la "user activation" del click, y si meto un await
  // a Supabase (que puede tardar 1-2s) antes de share(), Chrome lo rechaza y
  // cae al fallback de descarga. Hacerlo aquí garantiza que el click → share
  // es instantáneo.
  useEffect(() => {
    if (yaGuardada.current) return;
    yaGuardada.current = true;
    guardarSeleccion(seleccion).catch((e) => {
      console.error("[cromo] error guardando selección:", e);
      yaGuardada.current = false;
    });
    // Sólo al montar, no en cada cambio
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generarBlob(): Promise<Blob | null> {
    if (!cromoRef.current) return null;
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

    try {
      return await generarPngCromo(cromoRef.current);
    } finally {
      wrap.style.transform = prev.transform;
      wrap.style.position = prev.position;
      wrap.style.left = prev.left;
      wrap.style.top = prev.top;
      wrap.style.zIndex = prev.zIndex;
    }
  }

  async function manejarCompartir() {
    if (!cromoRef.current) return;
    setGenerando(true);
    setAviso(null);
    try {
      const blob = await generarBlob();
      if (!blob) return;

      const compartido = await compartirArchivo(blob, nombreArchivo);
      if (compartido) {
        trackEvent("compartir_completado", { metodo: "share_api" });
      } else {
        // El navegador no abrió el sheet (o falló): caemos a descarga directa
        // para no dejar al usuario sin nada.
        descargarBlob(blob, nombreArchivo);
        trackEvent("descargar_imagen", { metodo: "fallback_share" });
        setAviso(
          inApp
            ? "Compartir no funciona dentro de Instagram. Imagen descargada — ábrela en Galería y súbela a Stories."
            : "Compartir no estaba disponible. Imagen descargada — súbela manualmente."
        );
      }
    } catch (e) {
      console.error("[cromo] error generando PNG:", e);
      setAviso("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  async function manejarDescargaDirecta() {
    if (!cromoRef.current) return;
    setGenerando(true);
    setAviso(null);
    try {
      const blob = await generarBlob();
      if (!blob) return;

      if (inApp) {
        // En navegadores in-app (Instagram, FB…), el método `<a download>` no
        // descarga: solo abre la imagen en un visor sin opción de guardar.
        // En cambio, mostrar la imagen como <img> normal SÍ permite que el
        // long-press del navegador ofrezca "Guardar imagen", que es el único
        // camino fiable en ese entorno.
        const url = URL.createObjectURL(blob);
        setImagenPreview(url);
        trackEvent("descargar_imagen", { metodo: "inapp_preview" });
        return;
      }

      descargarBlob(blob, nombreArchivo);
      trackEvent("descargar_imagen", {
        metodo: movil ? "directo_movil" : "directo_desktop",
      });
      setAviso(
        movil
          ? "Imagen descargada. Ábrela en Galería y súbela a Stories."
          : "Imagen descargada. La encuentras en tu carpeta de descargas."
      );
    } catch (e) {
      console.error("[cromo] error generando PNG:", e);
      setAviso("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  function cerrarPreview() {
    if (imagenPreview) URL.revokeObjectURL(imagenPreview);
    setImagenPreview(null);
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
          // Wrapper exterior: fondo + gradiente + sombra. NO se captura.
          // El cromoRef (interior) es transparente para que el lienzo del PNG
          // pueda poner SU gradiente único y se vea por toda la imagen sin
          // chocar con el del cromo.
          width: 480 * escala,
          height: alturaCromo * escala,
          flexShrink: 0,
          background: "#1a1410",
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(212,162,46,0.28) 0%, transparent 45%), radial-gradient(circle at 90% 90%, rgba(212,162,46,0.20) 0%, transparent 45%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div
          ref={cromoRef}
          style={{
            width: 480,
            transformOrigin: "top left",
            transform: `scale(${escala})`,
            background: "transparent",
          }}
        >
          <CromoFinal seleccion={seleccion} />
        </div>
      </div>
      {inApp && (
        <div
          style={{
            maxWidth: 380,
            padding: "12px 16px",
            background: "rgba(230, 57, 70, 0.15)",
            border: `1.5px solid ${COLORS.red}`,
            borderRadius: 10,
            color: COLORS.bg,
            fontFamily: FUENTES.UI,
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          Estás viendo esta web dentro del navegador de Instagram. Para
          guardar y subir tu cromo sin problemas, ábrelo en Chrome o Safari
          (toca los tres puntos arriba y elige &ldquo;Abrir en navegador&rdquo;).
        </div>
      )}
      {/* Botones de acción.
          - iOS y desktop (donde el share API es fiable o no aplica):
            un solo botón principal — el flujo de siempre.
          - Android sin in-app: dos botones grandes — COMPARTIR (share API)
            y DESCARGAR (fallback siempre disponible porque en Chrome
            Android el share falla más a menudo).
          - In-app browser (Instagram/FB/…): solo DESCARGAR. */}
      {android && !inApp ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
            maxWidth: 480,
          }}
        >
          <button
            type="button"
            onClick={manejarCompartir}
            disabled={generando}
            style={{
              flex: "1 1 180px",
              background: COLORS.gold,
              color: COLORS.text,
              border: `2px solid ${COLORS.text}`,
              padding: "16px 20px",
              fontFamily: FUENTES.POSTER,
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: 2,
              borderRadius: 0,
              opacity: generando ? 0.7 : 1,
              cursor: generando ? "wait" : "pointer",
              boxShadow: `5px 5px 0 ${COLORS.text}`,
            }}
          >
            {generando ? "GENERANDO…" : "COMPARTIR"}
          </button>
          <button
            type="button"
            onClick={manejarDescargaDirecta}
            disabled={generando}
            style={{
              flex: "1 1 180px",
              background: COLORS.bg,
              color: COLORS.text,
              border: `2px solid ${COLORS.text}`,
              padding: "16px 20px",
              fontFamily: FUENTES.POSTER,
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: 2,
              borderRadius: 0,
              opacity: generando ? 0.7 : 1,
              cursor: generando ? "wait" : "pointer",
              boxShadow: `5px 5px 0 ${COLORS.text}`,
            }}
          >
            {generando ? "GENERANDO…" : "DESCARGAR"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={inApp ? manejarDescargaDirecta : manejarCompartir}
          disabled={generando}
          style={{
            background: COLORS.gold,
            color: COLORS.text,
            border: `2px solid ${COLORS.text}`,
            padding: "16px 36px",
            fontFamily: FUENTES.POSTER,
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: 3,
            borderRadius: 0,
            opacity: generando ? 0.7 : 1,
            cursor: generando ? "wait" : "pointer",
            boxShadow: `5px 5px 0 ${COLORS.text}`,
          }}
        >
          {generando
            ? "GENERANDO…"
            : inApp
              ? "DESCARGAR IMAGEN"
              : movil
                ? "COMPARTE TU SELECCIÓN"
                : "DESCARGAR IMAGEN"}
        </button>
      )}
      <button
        type="button"
        onClick={onVolver}
        disabled={generando}
        style={{
          background: "transparent",
          color: "rgba(255,255,255,0.8)",
          border: "none",
          padding: "8px 16px",
          fontFamily: FUENTES.POSTER,
          fontSize: 16,
          fontWeight: 400,
          letterSpacing: 2,
          opacity: generando ? 0.5 : 1,
          cursor: generando ? "wait" : "pointer",
        }}
      >
        ← VOLVER A EDITAR
      </button>
      {aviso && (
        <p
          style={{
            color: COLORS.gold,
            fontFamily: FUENTES.UI,
            fontSize: 14,
            fontWeight: 500,
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
          color: "rgba(255,255,255,0.7)",
          fontFamily: FUENTES.UI,
          fontSize: 13,
          fontWeight: 500,
          maxWidth: 360,
          textAlign: "center",
        }}
      >
        {movil ? TEXTOS.notaDescargarMovil : TEXTOS.notaDescargarDesktop}
      </p>

      <footer
        style={{
          marginTop: 32,
          fontFamily: FUENTES.UI,
          fontSize: 12,
          color: "rgba(255,255,255,0.55)",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: 380,
        }}
      >
        <Link
          href="/legal"
          style={{
            color: "rgba(255,255,255,0.7)",
            fontWeight: 700,
            textDecoration: "underline",
            textDecorationColor: COLORS.gold,
            textUnderlineOffset: 3,
          }}
        >
          Aviso legal y privacidad
        </Link>
        <div style={{ fontSize: 11, marginTop: 6, textWrap: "balance" }}>
          Proyecto editorial independiente. No asociado con la FIFA, UEFA,
          RFEF ni ninguna federación deportiva.
        </div>
      </footer>

      {/* Prompt para compartir con Arturo: aparece cuando el usuario ya ha
          generado el PNG (es decir, cuando hay aviso de descarga/compartido). */}
      {aviso && (
        <div
          style={{
            marginTop: 8,
            padding: "16px 20px",
            background: "rgba(212,162,46,0.12)",
            border: `1.5px solid ${COLORS.gold}`,
            borderRadius: 12,
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: COLORS.gold,
              fontWeight: 900,
              marginBottom: 6,
            }}
          >
            ★ HAZ QUE TE VEA
          </div>
          <p
            style={{
              fontFamily: FUENTES.UI,
              color: COLORS.bg,
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Sube tu cromo a Stories y etiqueta a{" "}
            <a
              href="https://instagram.com/ajpaniagua"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.gold,
                fontStyle: "normal",
                fontWeight: 900,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              @ajpaniagua
            </a>
            . Arturo comentará las selecciones más{"\u00a0"}interesantes.
          </p>
        </div>
      )}

      {/* Modal de preview para in-app browsers: la única vía que SÍ funciona
          en Instagram/FB para guardar la imagen al dispositivo es mostrarla
          como <img> y dejar que el long-press del navegador ofrezca
          "Guardar imagen". El download programático queda bloqueado por el
          WebView. */}
      {imagenPreview && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={cerrarPreview}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "16px 16px 32px",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cerrarPreview();
            }}
            style={{
              alignSelf: "flex-end",
              background: "rgba(255,255,255,0.15)",
              color: COLORS.bg,
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "8px 14px",
              fontFamily: FUENTES.POSTER,
              fontSize: 14,
              letterSpacing: 2,
              borderRadius: 20,
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            ✕ CERRAR
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(135deg, ${COLORS.gold}, #b8861f)`,
              color: COLORS.text,
              padding: "16px 20px",
              borderRadius: 12,
              maxWidth: 360,
              textAlign: "center",
              marginBottom: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: FUENTES.POSTER,
                fontSize: 18,
                letterSpacing: 3,
                marginBottom: 6,
                fontWeight: 400,
              }}
            >
              👇 MANTÉN PULSADA LA IMAGEN
            </div>
            <div
              style={{
                fontFamily: FUENTES.UI,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              Elige &ldquo;Guardar imagen&rdquo; (Android) o &ldquo;Añadir a
              Fotos&rdquo; (iOS) para descargarla. Luego ya puedes subirla
              a Stories.
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagenPreview}
            alt="Tu selección musical"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              maxHeight: "75vh",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              borderRadius: 4,
            }}
          />
        </div>
      )}
    </main>
  );
}
