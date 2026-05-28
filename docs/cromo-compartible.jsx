import { useState } from "react";

const COLORS = {
  bg: "#FAFAF7",
  paper: "#F5F1E6",
  text: "#0a0a0a",
  gold: "#D4A22E",
  pitch: "#1a4d2e",
  pitchLight: "#2a6b3f",
  pitchLine: "rgba(255,255,255,0.25)",
  red: "#E63946",
};

const seleccion = {
  usuario: "arturo_paniagua",
  himno: {
    artista: "Joan Manuel Serrat",
    cancion: "Mediterráneo",
  },
  seleccionador: {
    name: "Joaquín Sabina",
    img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=S",
  },
  portero: { name: "Camarón", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=C", tipo: "L" },
  defensas: [
    { name: "Mecano", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=M", tipo: "L" },
    { name: "Héroes del Silencio", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=H", tipo: "L" },
    { name: "Los Planetas", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=P", tipo: "L" },
    { name: "Extremoduro", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=E", tipo: "L" },
  ],
  medios: [
    { name: "Antonio Vega", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=V", tipo: "L" },
    { name: "Radio Futura", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=R", tipo: "L" },
    { name: "Zahara", img: "https://via.placeholder.com/200/E63946/FAFAF7?text=Z", tipo: "A" },
  ],
  delanteros: [
    { name: "Rosalía", img: "https://via.placeholder.com/200/E63946/FAFAF7?text=R", tipo: "A" },
    { name: "Paco de Lucía", img: "https://via.placeholder.com/200/D4A22E/0a0a0a?text=PL", tipo: "L" },
    { name: "Alejandro Sanz", img: "https://via.placeholder.com/200/E63946/FAFAF7?text=S", tipo: "A" },
  ],
  banquillo: [
    { name: "Amaia", img: "https://via.placeholder.com/100/E63946/FAFAF7?text=A", tipo: "A" },
    { name: "Luz Casal", img: "https://via.placeholder.com/100/D4A22E/0a0a0a?text=L", tipo: "L" },
    { name: "Leiva", img: "https://via.placeholder.com/100/E63946/FAFAF7?text=L", tipo: "A" },
    { name: "Vetusta Morla", img: "https://via.placeholder.com/100/E63946/FAFAF7?text=V", tipo: "A" },
    { name: "C. Tangana", img: "https://via.placeholder.com/100/E63946/FAFAF7?text=T", tipo: "A" },
    { name: "Kiko Veneno", img: "https://via.placeholder.com/100/D4A22E/0a0a0a?text=K", tipo: "L" },
    { name: "Amaral", img: "https://via.placeholder.com/100/E63946/FAFAF7?text=A", tipo: "A" },
  ],
};

function partirNombre(nombre) {
  if (nombre.length <= 11) {
    return { linea1: nombre.toUpperCase(), linea2: null };
  }
  const palabras = nombre.split(" ");
  if (palabras.length === 1) {
    return { linea1: nombre.toUpperCase(), linea2: null };
  }
  const mitad = Math.ceil(palabras.length / 2);
  const linea1 = palabras.slice(0, mitad).join(" ").toUpperCase();
  const linea2 = palabras.slice(mitad).join(" ").toUpperCase();
  return { linea1, linea2 };
}

function Jugador({ artist, size = "normal" }) {
  const sizes = {
    tiny: { circle: 30, font: 7, gap: 2, blockHeight: 22 },
    small: { circle: 36, font: 8, gap: 3, blockHeight: 24 },
    normal: { circle: 42, font: 9, gap: 3, blockHeight: 26 },
  };
  const s = sizes[size];
  const isLeyenda = artist.tipo === "L";
  const borderColor = isLeyenda ? COLORS.gold : COLORS.red;
  const nombre = partirNombre(artist.name);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: s.gap,
      width: 70,
    }}>
      <div style={{
        width: s.circle, height: s.circle,
        borderRadius: "50%",
        background: COLORS.bg,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 2px 5px rgba(0,0,0,0.4)`,
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <img src={artist.img} alt={artist.name} style={{
          width: "100%", height: "100%", objectFit: "cover",
        }} />
      </div>
      <div style={{
        textAlign: "center",
        lineHeight: 1.05,
        height: s.blockHeight,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
      }}>
        <div style={{
          fontSize: s.font,
          fontWeight: 900,
          color: COLORS.bg,
          letterSpacing: 0.2,
          fontStyle: "italic",
          textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          whiteSpace: "nowrap",
        }}>
          {nombre.linea1}
        </div>
        {nombre.linea2 && (
          <div style={{
            fontSize: s.font,
            fontWeight: 900,
            color: COLORS.bg,
            letterSpacing: 0.2,
            fontStyle: "italic",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
            whiteSpace: "nowrap",
            marginTop: 1,
          }}>
            {nombre.linea2}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a1a",
      padding: "20px 0",
      display: "flex", justifyContent: "center",
      alignItems: "flex-start",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* MARCO COMPLETO 9:16 · 360 × 640 (escalado de 1080×1920) */}
      <div style={{
        width: 360,
        height: 640,
        background: COLORS.text,
        position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(212,162,46,0.15) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(212,162,46,0.10) 0%, transparent 40%)
        `,
      }}>
        {/* DEAD ZONE SUPERIOR · 83px (250/1920 × 640) */}
        <div style={{
          height: 83,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}>
          <div style={{
            color: COLORS.gold,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: 4,
            fontStyle: "italic",
          }}>
            ★ MUNDIAL MUSICAL 2026 ★
          </div>
        </div>

        {/* SAFE ZONE · 474px (1420/1920 × 640) */}
        <div style={{
          flex: 1,
          background: COLORS.paper,
          margin: "0 16px",
          borderRadius: 8,
          border: `2px solid ${COLORS.gold}`,
          boxShadow: `0 0 20px rgba(212,162,46,0.3)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* TÍTULO */}
          <div style={{ padding: "14px 16px 8px", textAlign: "center" }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -1.2,
              lineHeight: 0.95,
              margin: 0,
              color: COLORS.text,
            }}>
              La selección musical<br/>
              <span style={{
                color: COLORS.gold,
                fontSize: 32,
                textShadow: `2px 2px 0 ${COLORS.text}`,
              }}>DE MI VIDA</span>
            </h1>
            <div style={{
              marginTop: 6,
              fontSize: 10,
              color: "#555",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}>
              por <strong style={{ color: COLORS.text, fontStyle: "normal", fontFamily: "inherit" }}>@{seleccion.usuario}</strong>
            </div>
          </div>

          {/* HIMNO + SELECCIONADOR EN FILA */}
          <div style={{
            display: "flex",
            gap: 8,
            padding: "0 12px 8px",
            alignItems: "stretch",
          }}>
            {/* HIMNO */}
            <div style={{
              flex: 1.4,
              background: COLORS.text,
              color: COLORS.bg,
              padding: "8px 10px",
              borderRadius: 5,
              position: "relative",
              boxShadow: `2px 2px 0 ${COLORS.gold}`,
              overflow: "hidden",
            }}>
              <div style={{
                fontSize: 7, letterSpacing: 2, color: COLORS.gold,
                fontWeight: 900, marginBottom: 3,
              }}>★ HIMNO</div>
              <div style={{
                fontSize: 13,
                fontWeight: 900,
                fontStyle: "italic",
                color: COLORS.gold,
                letterSpacing: -0.5,
                lineHeight: 1,
                marginBottom: 2,
              }}>
                "{seleccion.himno.cancion}"
              </div>
              <div style={{
                fontSize: 8,
                fontWeight: 700,
                color: COLORS.bg,
                letterSpacing: 0.3,
              }}>
                {seleccion.himno.artista.toUpperCase()}
              </div>
            </div>

            {/* SELECCIONADOR */}
            <div style={{
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
            }}>
              <div style={{
                width: 32, height: 32,
                borderRadius: "50%",
                background: COLORS.bg,
                border: `2px solid ${COLORS.gold}`,
                overflow: "hidden",
              }}>
                <img src={seleccion.seleccionador.img} alt={seleccion.seleccionador.name} style={{
                  width: "100%", height: "100%", objectFit: "cover",
                }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 6, letterSpacing: 1.5, color: COLORS.gold,
                  fontWeight: 900,
                }}>★ SELECCIONADOR</div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 900,
                  fontStyle: "italic",
                  letterSpacing: -0.3,
                  color: COLORS.text,
                  lineHeight: 1,
                  marginTop: 1,
                }}>
                  {seleccion.seleccionador.name}
                </div>
              </div>
            </div>
          </div>

          {/* CAMPO */}
          <div style={{ padding: "0 12px", flex: 1, display: "flex" }}>
            <div style={{
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
            }}>
              <div style={{
                position: "absolute", top: 5, left: 5, right: 5, bottom: 5,
                border: `1px solid ${COLORS.pitchLine}`,
                borderRadius: 3, pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", left: 0, right: 0, top: "50%",
                height: 1, background: COLORS.pitchLine,
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate(-50%, -50%)",
                width: 28, height: 28,
                border: `1px solid ${COLORS.pitchLine}`,
                borderRadius: "50%",
                pointerEvents: "none",
              }} />

              <div style={{
                display: "flex", justifyContent: "space-around",
                position: "relative", zIndex: 1,
              }}>
                {seleccion.delanteros.map((j, i) => (
                  <Jugador key={i} artist={j} size="normal" />
                ))}
              </div>

              <div style={{
                display: "flex", justifyContent: "space-around",
                position: "relative", zIndex: 1,
              }}>
                {seleccion.medios.map((j, i) => (
                  <Jugador key={i} artist={j} size="normal" />
                ))}
              </div>

              <div style={{
                display: "flex", justifyContent: "space-around",
                position: "relative", zIndex: 1,
              }}>
                {seleccion.defensas.map((j, i) => (
                  <Jugador key={i} artist={j} size="small" />
                ))}
              </div>

              <div style={{
                display: "flex", justifyContent: "center",
                position: "relative", zIndex: 1,
              }}>
                <Jugador artist={seleccion.portero} size="normal" />
              </div>
            </div>
          </div>

          {/* BANQUILLO */}
          <div style={{ padding: "8px 12px 6px" }}>
            <div style={{ marginBottom: 4, textAlign: "center" }}>
              <div style={{
                fontSize: 7, letterSpacing: 2.5, color: "#888",
                fontWeight: 900,
              }}>★ BANQUILLO</div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 2px",
            }}>
              {seleccion.banquillo.map((j, i) => (
                <Jugador key={i} artist={j} size="tiny" />
              ))}
            </div>
          </div>

          {/* URL DENTRO DE SAFE ZONE */}
          <div style={{
            background: COLORS.text,
            padding: "8px 16px",
            borderTop: `2px solid ${COLORS.gold}`,
            textAlign: "center",
          }}>
            <div style={{
              color: COLORS.gold,
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 2,
              fontStyle: "italic",
              marginBottom: 1,
            }}>
              Crea la tuya
            </div>
            <div style={{
              color: COLORS.bg,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 0.3,
            }}>
              arturopaniagua.com/mundial
            </div>
          </div>
        </div>

        {/* DEAD ZONE INFERIOR · 83px */}
        <div style={{
          height: 83,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}>
          <div style={{
            color: COLORS.gold,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 3,
            fontStyle: "italic",
          }}>
            #LaSelecciónMusicalDeMiVida
          </div>
        </div>
      </div>
    </div>
  );
}
