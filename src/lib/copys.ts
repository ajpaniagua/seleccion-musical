// NBSP (U+00A0) entre las dos últimas palabras de cada texto largo evita
// la viuda tipográfica: la última palabra nunca queda sola colgando.
const NBSP = " ";

export const COPYS = {
  himno: {
    titulo: "Tu himno",
    subtitulo: `La canción que mejor te define. La que te emociona desde el primer acorde. La que pondrías para presentarte al${NBSP}mundo.`,
  },
  seleccionador: {
    titulo: "Tu seleccionador",
    subtitulo: `El artista que dirige tu sensibilidad musical. El que te enseñó a escuchar. Tu referente, tu maestro, tu${NBSP}brújula.`,
  },
  once: {
    titulo: "Un artista para el once",
    subtitulo: `Los once artistas que siempre saltan al campo de tu vida. Los que te han marcado de verdad. No los más famosos, los${NBSP}tuyos.`,
  },
  banquillo: {
    titulo: "Un suplente",
    subtitulo: `Los que no son titulares pero también te han hecho vibrar. Tus suplentes de lujo. Los que entran cuando el partido lo${NBSP}pide.`,
  },
} as const;

export const TEXTOS = {
  firmaSubtitulo: `Pon tu @ de Instagram para firmar tu cromo. Es opcional, pero así Arturo podrá comentar tu selección si le${NBSP}encanta.`,
  constructorIntro: `Arma tu selección con los artistas y canciones que mejor te representan, y comparte tu cromo con el mundo. Solo te llevará 5${NBSP}minutos.`,
  landingIntro: `Arma tu propia selección con los músicos que han sido importantes en tu vida. Un himno, un seleccionador, un once titular y un banquillo de${NBSP}lujo.`,
  landingDemoNota: `Así se verá tu cromo, listo para${NBSP}Stories.`,
  tipDrag: `💡 Tip: mantén pulsado un jugador para arrastrarlo a otra${NBSP}posición.`,
  postShareLead: `Sube tu cromo a Stories y etiqueta a @ajpaniagua. Arturo comentará las selecciones más${NBSP}interesantes.`,
  notaDescargarMovil: `Pulsa el botón para abrir el panel de compartir y subirla a Stories, WhatsApp o${NBSP}X.`,
  notaDescargarDesktop: `Pulsa el botón para descargar la imagen. Luego súbela a Stories, X o${NBSP}WhatsApp.`,
};
