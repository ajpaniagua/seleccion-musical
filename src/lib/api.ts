import type { Seleccion } from "./tipos";

export async function guardarSeleccion(s: Seleccion): Promise<{ id: string } | null> {
  try {
    const r = await fetch("/api/selecciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: s.usuario,
        himno: s.himno ? { titulo: s.himno.titulo, artista: s.himno.artista } : null,
        seleccionador: s.seleccionador
          ? { nombre: s.seleccionador.nombre, foto: s.seleccionador.foto }
          : null,
        portero: s.portero ? { nombre: s.portero.nombre, foto: s.portero.foto } : null,
        defensas: s.defensas.map((a) => (a ? { nombre: a.nombre, foto: a.foto } : null)),
        medios: s.medios.map((a) => (a ? { nombre: a.nombre, foto: a.foto } : null)),
        delanteros: s.delanteros.map((a) => (a ? { nombre: a.nombre, foto: a.foto } : null)),
        banquillo: s.banquillo.map((a) => (a ? { nombre: a.nombre, foto: a.foto } : null)),
      }),
    });
    if (!r.ok) return null;
    return (await r.json()) as { id: string };
  } catch {
    return null;
  }
}

export async function loguearBusqueda(texto: string, anadido: boolean): Promise<void> {
  try {
    await fetch("/api/busquedas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, anadido }),
    });
  } catch {
    // log es best-effort; nunca debe bloquear al usuario
  }
}
