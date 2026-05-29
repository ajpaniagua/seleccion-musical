/**
 * Sistema tipográfico del proyecto. Tres voces distintas, una por registro:
 *
 *  - POSTER: "el cartel del partido grita". Bebas Neue ultra-condensed.
 *    Para titulares grandes, badges "MUNDIAL MUSICAL", encabezados de sección
 *    tipo "★ HIMNO" y botones CTA principales.
 *
 *  - UI: "el sistema te informa". Inter. Para botones secundarios, formularios,
 *    tablas, micro-copy y datos del admin.
 *
 *  - EDITORIAL: "Arturo te habla en su voz". Georgia italic. Para subtítulos
 *    editoriales, notas explicativas y voz autoral.
 *
 * El cromo final (PNG exportado) mantiene su identidad propia (Inter Italic
 * + estética Panini) y NO usa estos tokens. Solo la UI de la web los respeta.
 */
export const FUENTES = {
  POSTER: "'Bebas Neue', 'Anton', sans-serif",
  UI: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  EDITORIAL: "Georgia, 'Times New Roman', serif",
} as const;
