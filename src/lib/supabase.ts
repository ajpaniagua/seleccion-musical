import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role. SOLO debe importarse en Route Handlers
 * o Server Components. Si por descuido se importa en cliente, Next dará error
 * porque las env SUPABASE_* sin prefijo NEXT_PUBLIC_ no existen en el bundle.
 */
let cliente: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cliente) return cliente;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno. Revisa .env.local."
    );
  }
  cliente = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cliente;
}

export type SeleccionRow = {
  id: string;
  created_at: string;
  usuario: string | null;
  voter_hash: string;
  himno_cancion: string | null;
  himno_artista: string | null;
  seleccionador_nombre: string | null;
  seleccionador_foto: string | null;
  titulares: { nombre: string; foto: string; posicion: string }[];
  suplentes: { nombre: string; foto: string }[];
};

export type EventoArtistaRow = {
  id: number;
  created_at: string;
  seleccion_id: string | null;
  artista_nombre: string | null;
  posicion: string | null;
  rol: string | null;
};

export type BusquedaRow = {
  id: number;
  created_at: string;
  texto: string | null;
  anadido: boolean;
  voter_hash: string | null;
};
