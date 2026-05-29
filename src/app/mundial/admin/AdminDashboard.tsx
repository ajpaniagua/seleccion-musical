"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/colores";
import { FUENTES } from "@/lib/tipografias";

type Top = { nombre: string; total: number };
type TopHimno = { cancion: string; artista: string; total: number };
type SerieDia = { dia: string; total: number };
type HoraDia = { hora: number; total: number };
type SemDia = { nombre: string; total: number };
type BusquedaNoAnadida = {
  texto: string;
  busquedas: number;
  anadidos: number;
  noAnadidos: number;
};
type Gemela = {
  firma: string;
  total: number;
  usuarios: string[];
  created_at: string;
};
type Combinacion = {
  a: string;
  b: string;
  juntos: number;
  aSola: number;
  bSola: number;
  pAconB: number;
};
type Comodin = {
  nombre: string;
  posicionesDistintas: number;
  posiciones: string[];
  total: number;
};
type Iterador = { hash: string; iteraciones: number; usuarios: string[] };
type Pais = { pais: string; total: number };
type Genero = { genero: string; total: number };
type SelGen = {
  id: string;
  usuario: string | null;
  anyoMedio: number;
  decadasRepresentadas: number;
  decadaDominante: string;
  cobertura: number;
};
type Generacional = {
  anyoMedioGlobal: number | null;
  distribucionPorDecada: { decada: string; total: number }[];
  cubos: {
    pre80: number;
    ochentas90s: number;
    dosmil10s: number;
    dosmil10s_act: number;
    transgeneracional: number;
    sinDatos: number;
  };
  masJovenes: SelGen[];
  masVeteranas: SelGen[];
  masTransgeneracionales: SelGen[];
};

type Metricas = {
  totalSelecciones: number;
  totalEnriquecidos: { total: number; encontrados: number };
  seriePorDia: SerieDia[];
  horarioDia: HoraDia[];
  diaSemana: SemDia[];
  himnos: TopHimno[];
  himnosUnicos: { total: number; recientes: TopHimno[] };
  topPorPosicion: Record<string, Top[]>;
  busquedasNoAnadidas: BusquedaNoAnadida[];
  gemelas: Gemela[];
  combinaciones: Combinacion[];
  comodines: Comodin[];
  iteradores: Iterador[];
  paises: Pais[];
  paisesPorPosicion: Record<string, Pais[]>;
  paisesBloques: { bloque: string; total: number }[];
  selPorPureza: {
    soloEspanyolas: number;
    conLatam: number;
    conMundoAnglo: number;
    mixtas: number;
  };
  generos: Genero[];
  generosPorPosicion: Record<string, Genero[]>;
  cromosPurosGenero: {
    puros: number;
    mestizos2_3: number;
    mestizos4plus: number;
    sinDatos: number;
  };
  generacional: Generacional;
};

const ETIQUETAS_POSICION: Record<string, string> = {
  himno_artista: "Top artistas del himno",
  seleccionador: "Top seleccionadores",
  portero: "Top porteros",
  defensa: "Top defensas",
  mediocampo: "Top mediocampos",
  delantera: "Top delanteros",
  suplente: "Top suplentes",
};

export function AdminDashboard() {
  const [data, setData] = useState<Metricas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enriqueciendo, setEnriqueciendo] = useState(false);
  const [rangoExport, setRangoExport] = useState<"todo" | "7d" | "30d">("todo");
  const [avisoEnriquecer, setAvisoEnriquecer] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/metricas");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as Metricas;
        if (!cancel) setData(json);
      } catch (e) {
        if (!cancel) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        if (!cancel) setCargando(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  async function reenriquecer() {
    setEnriqueciendo(true);
    setAvisoEnriquecer(null);
    try {
      const r = await fetch("/api/admin/reenriquecer", { method: "POST" });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error ?? "Error");
      setAvisoEnriquecer(
        `Lanzado en background sobre ${json.total} artistas únicos. Tardará ~${Math.ceil((json.total * 1.1) / 60)} min. Recarga la página en un rato.`
      );
    } catch (e) {
      setAvisoEnriquecer(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setEnriqueciendo(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 80px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 4,
              fontFamily: FUENTES.UI,
            }}
          >
            ★ DASHBOARD
          </div>
          <h1
            style={{
              margin: "4px 0 0",
              fontFamily: FUENTES.POSTER,
              fontSize: 38,
              fontWeight: 400,
              letterSpacing: -0.5,
              lineHeight: 0.95,
              color: COLORS.text,
            }}
          >
            LA SELECCIÓN MUSICAL
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={reenriquecer}
            disabled={enriqueciendo}
            style={{
              background: COLORS.gold,
              color: COLORS.text,
              border: `2px solid ${COLORS.text}`,
              padding: "8px 18px",
              fontFamily: FUENTES.POSTER,
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: 2,
              borderRadius: 0,
              cursor: enriqueciendo ? "wait" : "pointer",
              opacity: enriqueciendo ? 0.7 : 1,
              boxShadow: `3px 3px 0 ${COLORS.text}`,
            }}
          >
            {enriqueciendo ? "LANZANDO…" : "REENRIQUECER ARTISTAS"}
          </button>
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: `2px solid ${COLORS.text}`,
              padding: "8px 18px",
              fontFamily: FUENTES.POSTER,
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: 2,
              borderRadius: 0,
              cursor: "pointer",
            }}
          >
            CERRAR SESIÓN
          </button>
        </div>
      </header>

      {avisoEnriquecer && (
        <p
          style={{
            color: COLORS.gold,
            background: COLORS.paper,
            padding: "10px 14px",
            borderLeft: `4px solid ${COLORS.gold}`,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {avisoEnriquecer}
        </p>
      )}

      {cargando && <p style={{ color: "#888" }}>Cargando métricas…</p>}
      {error && (
        <p style={{ color: COLORS.red }}>No se pudo cargar el panel: {error}</p>
      )}

      {data && (
        <>
          {/* TARJETAS RESUMEN */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <Card titulo="Total selecciones" valor={data.totalSelecciones} />
            <Card
              titulo="Hoy (Europe/Madrid)"
              valor={data.seriePorDia.at(-1)?.total ?? 0}
              detalle={data.seriePorDia.at(-1)?.dia ?? ""}
            />
            <Card
              titulo="Últimos 7 días"
              valor={data.seriePorDia.slice(-7).reduce((a, b) => a + b.total, 0)}
            />
            <Card
              titulo="Artistas enriquecidos"
              valor={`${data.totalEnriquecidos.encontrados} / ${data.totalEnriquecidos.total}`}
              detalle="Con país y género de MusicBrainz"
            />
          </section>

          {/* GRÁFICO TEMPORAL */}
          <SerieGrafico serie={data.seriePorDia} />

          {/* DISTRIBUCIONES TEMPORALES */}
          <Seccion titulo="¿Cuándo se hace una selección? (zona Europe/Madrid)">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <BarrasMini
                titulo="Por hora del día"
                items={data.horarioDia.map((h) => ({
                  label: `${h.hora.toString().padStart(2, "0")}h`,
                  total: h.total,
                }))}
              />
              <BarrasMini
                titulo="Por día de la semana"
                items={data.diaSemana.map((d) => ({ label: d.nombre.slice(0, 3), total: d.total }))}
              />
            </div>
          </Seccion>

          {/* TOP HIMNOS */}
          <Seccion titulo="Top himnos">
            <TablaSimple
              headers={["Canción", "Artista", "Veces"]}
              rows={data.himnos.map((h) => [h.cancion, h.artista, String(h.total)])}
            />
          </Seccion>

          {/* HIMNOS ÚNICOS */}
          <Seccion
            titulo={`Himnos únicos · ${data.himnosUnicos.total} canciones elegidas solo una vez`}
          >
            <p
              style={{
                fontSize: 13,
                color: "#666",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: 8,
              }}
            >
              Algunos de los más recientes (gold editorial: cromos muy personales).
            </p>
            <TablaSimple
              headers={["Canción", "Artista"]}
              rows={data.himnosUnicos.recientes.map((h) => [h.cancion, h.artista])}
            />
          </Seccion>

          {/* TOP POR POSICIÓN */}
          {Object.entries(data.topPorPosicion).map(([pos, lista]) => (
            <Seccion key={pos} titulo={ETIQUETAS_POSICION[pos] ?? pos}>
              <TablaSimple
                headers={["Artista", "Veces"]}
                rows={lista.map((x) => [x.nombre, String(x.total)])}
              />
            </Seccion>
          ))}

          {/* COMBINACIONES RECURRENTES */}
          <Seccion titulo="Combinaciones recurrentes — qué artistas suelen ir juntos">
            <p
              style={{
                fontSize: 13,
                color: "#666",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: 8,
              }}
            >
              &ldquo;De quien pone a <b>A</b>, ¿qué porcentaje pone también a <b>B</b>?&rdquo;
            </p>
            <TablaSimple
              headers={["Artista A", "Artista B", "Juntos", "A en total", "P(B | A)"]}
              rows={data.combinaciones.map((c) => [
                c.a,
                c.b,
                String(c.juntos),
                String(c.aSola),
                `${Math.round(c.pAconB * 100)}%`,
              ])}
            />
          </Seccion>

          {/* ARTISTAS COMODÍN */}
          <Seccion titulo="Artistas comodín — los que aparecen en muchas posiciones distintas">
            <TablaSimple
              headers={["Artista", "Apariciones", "Posiciones distintas", "Cuáles"]}
              rows={data.comodines.map((c) => [
                c.nombre,
                String(c.total),
                String(c.posicionesDistintas),
                c.posiciones.join(", "),
              ])}
            />
          </Seccion>

          {/* SELECCIONES GEMELAS */}
          <Seccion titulo="Selecciones gemelas — armadas por personas distintas">
            {data.gemelas.length === 0 ? (
              <p style={{ color: "#888", fontSize: 13, fontStyle: "italic" }}>
                Aún no hay selecciones repetidas entre usuarios distintos.
              </p>
            ) : (
              <TablaSimple
                headers={["Firma", "Veces", "Usuarios"]}
                rows={data.gemelas.map((g) => [
                  g.firma.slice(0, 12) + "…",
                  String(g.total),
                  g.usuarios.length > 0 ? g.usuarios.join(", ") : "(anónimos)",
                ])}
              />
            )}
          </Seccion>

          {/* ITERADORES */}
          <Seccion titulo="Iteradores — la misma persona armó varias selecciones">
            <TablaSimple
              headers={["Voter", "Iteraciones", "Usuarios firmados"]}
              rows={data.iteradores.map((i) => [
                i.hash,
                String(i.iteraciones),
                i.usuarios.length > 0 ? i.usuarios.join(", ") : "(anónimo)",
              ])}
            />
          </Seccion>

          {/* PAÍSES */}
          <Seccion titulo="Por país del artista">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 12, color: "#888", letterSpacing: 1.5, margin: "0 0 8px" }}>
                  TOP PAÍSES
                </h3>
                <TablaSimple
                  headers={["País", "Apariciones"]}
                  rows={data.paises.map((p) => [p.pais, String(p.total)])}
                />
              </div>
              <div>
                <h3 style={{ fontSize: 12, color: "#888", letterSpacing: 1.5, margin: "0 0 8px" }}>
                  POR BLOQUE GEOGRÁFICO
                </h3>
                <TablaSimple
                  headers={["Bloque", "Artistas"]}
                  rows={data.paisesBloques.map((b) => [b.bloque, String(b.total)])}
                />
              </div>
            </div>
          </Seccion>

          {/* PUREZA */}
          <Seccion titulo="¿Cómo de mezcladas son las selecciones del once titular?">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              <Card titulo="Solo España" valor={data.selPorPureza.soloEspanyolas} />
              <Card titulo="Con Latinoamérica" valor={data.selPorPureza.conLatam} />
              <Card titulo="Con mundo anglo" valor={data.selPorPureza.conMundoAnglo} />
              <Card titulo="Mestizas (otras)" valor={data.selPorPureza.mixtas} />
            </div>
          </Seccion>

          {/* GÉNEROS */}
          <Seccion titulo="Por género musical del artista">
            <TablaSimple
              headers={["Género", "Apariciones"]}
              rows={data.generos.map((g) => [g.genero, String(g.total)])}
            />
          </Seccion>

          <Seccion titulo="Cromos puros vs mestizos por género">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              <Card titulo="Puros (1 género)" valor={data.cromosPurosGenero.puros} />
              <Card titulo="Mestizos (2-3)" valor={data.cromosPurosGenero.mestizos2_3} />
              <Card titulo="Muy mestizos (4+)" valor={data.cromosPurosGenero.mestizos4plus} />
              <Card titulo="Sin datos aún" valor={data.cromosPurosGenero.sinDatos} />
            </div>
          </Seccion>

          {/* GENERACIONAL */}
          <Seccion titulo="Perfil generacional de las selecciones">
            <p
              style={{
                fontSize: 13,
                color: "#666",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: 12,
              }}
            >
              Año del primer álbum/EP del artista según MusicBrainz (excluye
              recopilatorios y discos en vivo). Comparable entre solistas y
              grupos.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Card
                titulo="Año medio global"
                valor={data.generacional.anyoMedioGlobal ?? "—"}
                detalle="Promedio entre todas las apariciones"
              />
              <Card titulo="Pre-80s" valor={data.generacional.cubos.pre80} detalle="Año medio < 1980" />
              <Card titulo="80s–90s" valor={data.generacional.cubos.ochentas90s} detalle="Año medio 1980–1999" />
              <Card titulo="2000s" valor={data.generacional.cubos.dosmil10s} detalle="Año medio 2000–2009" />
              <Card titulo="2010+ a hoy" valor={data.generacional.cubos.dosmil10s_act} detalle="Año medio ≥ 2010" />
              <Card
                titulo="Transgeneracionales"
                valor={data.generacional.cubos.transgeneracional}
                detalle="4+ décadas mezcladas"
              />
              <Card titulo="Sin datos aún" valor={data.generacional.cubos.sinDatos} />
            </div>

            <BarrasMini
              titulo="Distribución global por década (todas las apariciones)"
              items={data.generacional.distribucionPorDecada.map((d) => ({
                label: d.decada,
                total: d.total,
              }))}
            />
          </Seccion>

          <Seccion titulo="Selecciones más jóvenes (año medio más alto)">
            <TablaSimple
              headers={["@", "Año medio", "Décadas", "Década dominante", "Cobertura"]}
              rows={data.generacional.masJovenes.map((s) => [
                s.usuario ?? "(anónimo)",
                String(s.anyoMedio),
                String(s.decadasRepresentadas),
                s.decadaDominante,
                `${Math.round(s.cobertura * 100)}%`,
              ])}
            />
          </Seccion>

          <Seccion titulo="Selecciones más veteranas (año medio más bajo)">
            <TablaSimple
              headers={["@", "Año medio", "Décadas", "Década dominante", "Cobertura"]}
              rows={data.generacional.masVeteranas.map((s) => [
                s.usuario ?? "(anónimo)",
                String(s.anyoMedio),
                String(s.decadasRepresentadas),
                s.decadaDominante,
                `${Math.round(s.cobertura * 100)}%`,
              ])}
            />
          </Seccion>

          <Seccion titulo="Selecciones transgeneracionales (más décadas mezcladas)">
            <TablaSimple
              headers={["@", "Décadas distintas", "Año medio", "Década dominante"]}
              rows={data.generacional.masTransgeneracionales.map((s) => [
                s.usuario ?? "(anónimo)",
                String(s.decadasRepresentadas),
                String(s.anyoMedio),
                s.decadaDominante,
              ])}
            />
          </Seccion>

          {/* BÚSQUEDAS FRUSTRADAS */}
          <Seccion titulo="Búsquedas que no terminaron en selección">
            <TablaSimple
              headers={["Texto buscado", "Búsquedas", "No añadidos"]}
              rows={data.busquedasNoAnadidas.map((b) => [
                b.texto,
                String(b.busquedas),
                String(b.noAnadidos),
              ])}
            />
          </Seccion>

          {/* EXPORT CSV */}
          <Seccion titulo="Exportar a CSV — para análisis editorial con Claude AI">
            <p
              style={{
                fontSize: 13,
                color: "#666",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: 14,
              }}
            >
              Descarga los dos CSV y súbelos a una conversación con Claude
              pidiéndole patrones editoriales. El catálogo da contexto de cada
              artista; las selecciones, una fila por cromo con métricas derivadas.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  fontSize: 11,
                  letterSpacing: 1.5,
                  fontWeight: 900,
                  color: "#888",
                }}
              >
                RANGO:
              </label>
              <select
                value={rangoExport}
                onChange={(e) =>
                  setRangoExport(e.target.value as "todo" | "7d" | "30d")
                }
                style={{
                  padding: "6px 10px",
                  fontSize: 13,
                  borderRadius: 999,
                  border: `1.5px solid ${COLORS.text}`,
                  background: COLORS.bg,
                  cursor: "pointer",
                }}
              >
                <option value="todo">Todas las fechas</option>
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <BotonCsv
                href="/api/admin/csv?tipo=artistas"
                label="🎤 Catálogo de artistas"
              />
              <BotonCsv
                href={`/api/admin/csv?tipo=enriquecidas${
                  rangoExport === "7d"
                    ? `&desde=${desdeISO(7)}`
                    : rangoExport === "30d"
                      ? `&desde=${desdeISO(30)}`
                      : ""
                }`}
                label="🌟 Selecciones enriquecidas"
              />
            </div>

            <details style={{ marginTop: 18 }}>
              <summary
                style={{
                  fontSize: 11,
                  letterSpacing: 2,
                  fontWeight: 900,
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                EXPORTS AVANZADOS (DATOS BRUTOS)
              </summary>
              <div
                style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}
              >
                <BotonCsv
                  href="/api/admin/csv?tipo=selecciones"
                  label="Histórico bruto"
                />
                <BotonCsv
                  href="/api/admin/csv?tipo=eventos"
                  label="Eventos por artista"
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  marginTop: 8,
                  marginBottom: 0,
                }}
              >
                Datos sin columnas derivadas. Útil solo si quieres hacer tus
                propias agregaciones en Excel.
              </p>
            </details>
          </Seccion>
        </>
      )}
    </main>
  );
}

function desdeISO(diasAtras: number): string {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString();
}

function Card({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: number | string;
  detalle?: string;
}) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `2px solid ${COLORS.gold}`,
        borderRadius: 0,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#888",
          fontWeight: 900,
          fontFamily: FUENTES.UI,
        }}
      >
        {titulo.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: FUENTES.POSTER,
          fontSize: 44,
          fontWeight: 400,
          color: COLORS.text,
          letterSpacing: -0.5,
          marginTop: 2,
          lineHeight: 1,
        }}
      >
        {valor}
      </div>
      {detalle && (
        <div
          style={{
            fontSize: 11,
            color: "#666",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {detalle}
        </div>
      )}
    </div>
  );
}

function BarrasMini({ titulo, items }: { titulo: string; items: { label: string; total: number }[] }) {
  const max = Math.max(...items.map((i) => i.total), 1);
  return (
    <div>
      <h3 style={{ fontSize: 12, color: "#888", letterSpacing: 1.5, margin: "0 0 8px" }}>
        {titulo.toUpperCase()}
      </h3>
      <div
        style={{
          background: COLORS.paper,
          border: `1px solid ${COLORS.gold}`,
          borderRadius: 8,
          padding: 8,
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 120,
        }}
      >
        {items.map((it) => (
          <div
            key={it.label}
            title={`${it.label} · ${it.total}`}
            style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}
          >
            <div
              style={{
                width: "100%",
                height: `${(it.total / max) * 100}%`,
                minHeight: 2,
                background: COLORS.gold,
                borderRadius: 1,
              }}
            />
            <div style={{ fontSize: 9, color: "#888" }}>{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SerieGrafico({ serie }: { serie: SerieDia[] }) {
  if (serie.length === 0) {
    return (
      <Seccion titulo="Crecimiento por día (últimos 90)">
        <p style={{ color: "#888", fontSize: 13 }}>Aún no hay selecciones.</p>
      </Seccion>
    );
  }
  const max = Math.max(...serie.map((s) => s.total), 1);
  return (
    <Seccion titulo="Crecimiento por día (últimos 90)">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 2,
          height: 140,
          padding: "0 4px",
          background: COLORS.paper,
          borderRadius: 8,
          border: `1px solid ${COLORS.gold}`,
          overflowX: "auto",
        }}
      >
        {serie.map((s) => (
          <div
            key={s.dia}
            title={`${s.dia} · ${s.total}`}
            style={{
              flex: "0 0 8px",
              height: `${(s.total / max) * 100}%`,
              background: COLORS.gold,
              minHeight: 1,
              borderRadius: 1,
            }}
          />
        ))}
      </div>
    </Seccion>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          margin: "0 0 12px",
          fontFamily: FUENTES.POSTER,
          fontSize: 22,
          letterSpacing: 3,
          fontWeight: 400,
          color: COLORS.text,
        }}
      >
        ★ {titulo.toUpperCase()}
      </h2>
      {children}
    </section>
  );
}

function TablaSimple({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) {
    return (
      <p style={{ color: "#888", fontSize: 13, fontStyle: "italic" }}>
        Sin datos todavía.
      </p>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderBottom: `2px solid ${COLORS.text}`,
                  fontWeight: 900,
                  letterSpacing: 1,
                  fontSize: 11,
                }}
              >
                {h.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "8px 10px",
                    borderBottom: `1px solid ${COLORS.paper}`,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BotonCsv({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      download
      style={{
        background: COLORS.text,
        color: COLORS.bg,
        padding: "10px 20px",
        fontFamily: FUENTES.POSTER,
        fontSize: 18,
        fontWeight: 400,
        letterSpacing: 2,
        borderRadius: 0,
        border: `2px solid ${COLORS.text}`,
        textDecoration: "none",
        boxShadow: `4px 4px 0 ${COLORS.gold}`,
      }}
    >
      ↓ {label.toUpperCase()}
    </a>
  );
}
