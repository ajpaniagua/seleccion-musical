// Textos cortos y punzantes. Cuanto menos texto, menos margen para una
// viuda tipográfica (la palabra que queda sola en la última línea). Si en el
// futuro se reescribe alguno y crece, mantener el espíritu: dos oraciones
// breves máximo, idealmente una sola.
export const COPYS = {
  himno: {
    titulo: "Tu himno",
    subtitulo: "La canción que mejor te define. La que pondrías para presentarte al mundo.",
  },
  seleccionador: {
    titulo: "Tu seleccionador",
    subtitulo: "El artista que ha dirigido tu sensibilidad musical. Tu maestro, tu brújula.",
  },
  once: {
    titulo: "Un artista para el once",
    subtitulo: "Los once que siempre saltan al campo de tu vida. Los tuyos, no los más famosos.",
  },
  banquillo: {
    titulo: "Un suplente",
    subtitulo: "Los que también te han marcado. Los que entran cuando el partido lo pide.",
  },
} as const;

export const TEXTOS = {
  firmaSubtitulo:
    "Opcional, pero así Arturo podrá comentar tu selección.",
  constructorIntro:
    "Arma tu selección con los artistas y canciones que mejor te representan. Solo te llevará 5 minutos.",
  landingIntro:
    "Arma tu propia selección con los artistas y bandas más importantes de tu vida, los que te definen.",
  landingDemoNota: "Así se verá tu cromo, listo para compartir en Instagram.",
  tipDrag: "Mantén pulsado un jugador para moverlo a otra posición.",
  postShareLead:
    "Sube tu cromo a redes y etiqueta a @ajpaniagua. Estará pendiente de las mejores.",
  notaDescargarMovil:
    "Pulsa el botón para abrir el panel de compartir.",
  notaDescargarDesktop:
    "Pulsa el botón para descargar la imagen y compartirla en tus redes.",
};
