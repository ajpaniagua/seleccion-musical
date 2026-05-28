"use client";

import { COLORS } from "@/lib/colores";
import type { Seleccion } from "@/lib/tipos";
import { proxyFoto } from "@/utils/proxyFoto";
import { Jugador } from "./Jugador";

type Props = {
  seleccion: Seleccion;
};

export function CromoFinal({ seleccion }: Props) {
  const {
    himno,
    seleccionador,
    portero,
    defensas,
    medios,
    delanteros,
    banquillo,
    usuario,
  } = seleccion;

  return (
    <div
      style={{
        width: 480,
        height: 853,
        background: "#1a1410",
        position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(212,162,46,0.28) 0%, transparent 45%),
          radial-gradient(circle at 90% 90%, rgba(212,162,46,0.20) 0%, transparent 45%)
        `,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          height: 111,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: COLORS.gold,
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: 5,
            fontStyle: "italic",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          ★ MUNDIAL MUSICAL 2026 ★
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: COLORS.paper,
          margin: "0 16px",
          borderRadius: 8,
          border: `2px solid ${COLORS.gold}`,
          boxShadow: "0 0 20px rgba(212,162,46,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 16px 8px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -1.2,
              lineHeight: 0.95,
              margin: 0,
              color: COLORS.text,
            }}
          >
            La selección musical
            <br />
            <span
              style={{
                color: COLORS.gold,
                fontSize: 32,
                textShadow: `2px 2px 0 ${COLORS.text}`,
              }}
            >
              DE MI VIDA
            </span>
          </h1>
          {usuario && (
            <div
              style={{
                marginTop: 6,
                fontSize: 10,
                color: "#555",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
              }}
            >
              por{" "}
              <strong
                style={{
                  color: COLORS.text,
                  fontStyle: "normal",
                  fontFamily: "inherit",
                }}
              >
                @{usuario}
              </strong>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "0 12px 8px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: 1.4,
              background: COLORS.text,
              color: COLORS.bg,
              padding: "8px 10px",
              borderRadius: 5,
              position: "relative",
              boxShadow: `2px 2px 0 ${COLORS.gold}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 7,
                letterSpacing: 2,
                color: COLORS.gold,
                fontWeight: 900,
                marginBottom: 3,
              }}
            >
              ★ HIMNO
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                fontStyle: "italic",
                color: COLORS.gold,
                letterSpacing: -0.5,
                lineHeight: 1,
                marginBottom: 2,
              }}
            >
              &ldquo;{himno?.titulo ?? "—"}&rdquo;
            </div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: COLORS.bg,
                letterSpacing: 0.3,
              }}
            >
              {(himno?.artista ?? "").toUpperCase()}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: `linear-gradient(135deg, ${COLORS.gold}15 0%, transparent 100%)`,
              padding: "8px 10px",
              borderRadius: 5,
              border: `1.5px dashed ${COLORS.gold}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: COLORS.bg,
                border: `2px solid ${COLORS.gold}`,
                overflow: "hidden",
              }}
            >
              {seleccionador?.foto && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={proxyFoto(seleccionador.foto)}
                  alt={seleccionador.nombre}
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 6,
                  letterSpacing: 1.5,
                  color: COLORS.gold,
                  fontWeight: 900,
                }}
              >
                ★ SELECCIONADOR
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  fontStyle: "italic",
                  letterSpacing: -0.3,
                  color: COLORS.text,
                  lineHeight: 1,
                  marginTop: 1,
                }}
              >
                {seleccionador?.nombre ?? "—"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 12px", flex: 1, display: "flex" }}>
          <div
            style={{
              background: `
                linear-gradient(180deg, ${COLORS.pitch} 0%, ${COLORS.pitchLight} 50%, ${COLORS.pitch} 100%),
                repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.03) 12px, rgba(255,255,255,0.03) 24px)
              `,
              padding: "8px 4px 6px",
              border: `1.5px solid ${COLORS.text}`,
              borderRadius: 5,
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 5,
                left: 5,
                right: 5,
                bottom: 5,
                border: `1px solid ${COLORS.pitchLine}`,
                borderRadius: 3,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: COLORS.pitchLine,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 28,
                height: 28,
                border: `1px solid ${COLORS.pitchLine}`,
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                position: "relative",
                zIndex: 1,
              }}
            >
              {delanteros.map((a, i) => (
                <Jugador
                  key={`d-${i}`}
                  nombre={a?.nombre ?? "—"}
                  foto={a?.foto ?? ""}
                  size="normal"
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                position: "relative",
                zIndex: 1,
              }}
            >
              {medios.map((a, i) => (
                <Jugador
                  key={`m-${i}`}
                  nombre={a?.nombre ?? "—"}
                  foto={a?.foto ?? ""}
                  size="normal"
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                position: "relative",
                zIndex: 1,
              }}
            >
              {defensas.map((a, i) => (
                <Jugador
                  key={`f-${i}`}
                  nombre={a?.nombre ?? "—"}
                  foto={a?.foto ?? ""}
                  size="small"
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Jugador
                nombre={portero?.nombre ?? "—"}
                foto={portero?.foto ?? ""}
                size="normal"
              />
            </div>
          </div>
        </div>

        <div style={{ padding: "8px 12px 6px" }}>
          <div style={{ marginBottom: 4, textAlign: "center" }}>
            <div
              style={{
                fontSize: 7,
                letterSpacing: 2.5,
                color: "#888",
                fontWeight: 900,
              }}
            >
              ★ BANQUILLO
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              flexWrap: "wrap",
              padding: "0 2px",
            }}
          >
            {banquillo.filter((a): a is NonNullable<typeof a> => !!a).map((a, i) => (
              <Jugador
                key={`s-${i}`}
                nombre={a.nombre}
                foto={a.foto}
                size="tiny"
                bgOscuro={false}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            background: COLORS.text,
            padding: "8px 16px",
            borderTop: `2px solid ${COLORS.gold}`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: COLORS.gold,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 2,
              fontStyle: "italic",
              marginBottom: 2,
            }}
          >
            Crea la tuya en
          </div>
          <div
            style={{
              color: COLORS.bg,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: 0.3,
              lineHeight: 1.1,
            }}
          >
            arturopaniagua.com/mundial
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.4,
              marginTop: 4,
              fontStyle: "italic",
            }}
          >
            Un proyecto de @ajpaniagua
          </div>
        </div>
      </div>

      <div
        style={{
          height: 111,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: COLORS.gold,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 3,
            fontStyle: "italic",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          #LaSelecciónMusicalDeMiVida
        </div>
      </div>
    </div>
  );
}
