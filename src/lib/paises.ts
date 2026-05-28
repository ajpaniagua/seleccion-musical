/**
 * Mapping ISO 3166-1 alpha-2 → nombre en español.
 * No exhaustivo, pero cubre los países que más van a salir en una selección
 * editorial española (España, Latinoamérica, mundo anglosajón, Europa).
 * Si el código no está aquí, en la BD guardamos el área que devolvió MusicBrainz.
 */
export const paisIsoANombre: Record<string, string> = {
  ES: "España",
  AR: "Argentina",
  MX: "México",
  CL: "Chile",
  CO: "Colombia",
  PE: "Perú",
  UY: "Uruguay",
  VE: "Venezuela",
  CU: "Cuba",
  PR: "Puerto Rico",
  DO: "República Dominicana",
  BO: "Bolivia",
  PY: "Paraguay",
  EC: "Ecuador",
  GT: "Guatemala",
  CR: "Costa Rica",
  PA: "Panamá",
  HN: "Honduras",
  NI: "Nicaragua",
  SV: "El Salvador",
  US: "Estados Unidos",
  GB: "Reino Unido",
  IE: "Irlanda",
  FR: "Francia",
  IT: "Italia",
  DE: "Alemania",
  PT: "Portugal",
  BR: "Brasil",
  CA: "Canadá",
  AU: "Australia",
  NZ: "Nueva Zelanda",
  JP: "Japón",
  KR: "Corea del Sur",
  SE: "Suecia",
  NO: "Noruega",
  DK: "Dinamarca",
  NL: "Países Bajos",
  BE: "Bélgica",
  CH: "Suiza",
  AT: "Austria",
  PL: "Polonia",
  GR: "Grecia",
  RU: "Rusia",
  UA: "Ucrania",
  TR: "Turquía",
  IL: "Israel",
  ZA: "Sudáfrica",
  NG: "Nigeria",
  MA: "Marruecos",
  EG: "Egipto",
  CN: "China",
  IN: "India",
  ID: "Indonesia",
  MY: "Malasia",
  TH: "Tailandia",
};

/**
 * Agrupa países en bloques editoriales para las métricas del dashboard.
 */
export function bloqueGeografico(iso: string | null | undefined): string {
  if (!iso) return "Sin datos";
  if (iso === "ES") return "España";
  if (
    [
      "AR", "MX", "CL", "CO", "PE", "UY", "VE", "CU", "PR", "DO",
      "BO", "PY", "EC", "GT", "CR", "PA", "HN", "NI", "SV", "BR",
    ].includes(iso)
  ) {
    return "Latinoamérica";
  }
  if (["US", "GB", "IE", "CA", "AU", "NZ"].includes(iso)) {
    return "Mundo anglosajón";
  }
  if (
    ["FR", "IT", "DE", "PT", "NL", "BE", "CH", "AT", "PL", "GR", "SE", "NO", "DK"].includes(iso)
  ) {
    return "Resto de Europa";
  }
  return "Otros";
}
