# BRIEFING TÉCNICO · LA SELECCIÓN MUSICAL DE MI VIDA

> **Documento maestro para Claude Code**
> Versión: v1.0 (proyecto desde cero)
> Fecha: 28 mayo 2026
> Lanzamiento previsto: antes del 11 junio 2026

---

## 0. INSTRUCCIÓN PREVIA · BORRAR TODO LO ANTERIOR

**Borra completo el proyecto anterior "La Otra Copa"**. Estructura de carpetas, JSONs, componentes, base de datos, todo. Empezamos un proyecto nuevo desde cero con otro concepto, otra mecánica y otra arquitectura.

---

## 1. QUÉ ES EL PROYECTO

**La selección musical de mi vida** es una web interactiva donde cualquier usuario arma su propia "selección musical" en formato fútbol y la comparte como cromo en redes sociales.

**No es un Mundial paralelo. No hay 48 países. No hay bracket.** Es una herramienta editorial que aprovecha el contexto del Mundial para hablar de música.

### Concepto
El usuario elige:
- 1 himno (canción + artista)
- 1 seleccionador (un artista)
- 11 titulares en formación 4-3-3
- Banquillo (cantidad por definir, propuesta inicial: 10 incluyendo portero suplente)

Cuando termina, la web genera una **imagen compartible** estilo cromo que el usuario descarga y comparte en Instagram Stories, X, WhatsApp.

### Propósito editorial
- Arturo crea su propia selección y la presenta en vídeo manifiesto (antes del 11 jun)
- Durante el Mundial, publica 5 vídeos editoriales musicales aprovechando el contexto futbolero
- La web es el "soundtrack" del proyecto: lugar donde la audiencia interactúa
- Arturo comenta las selecciones más interesantes de la audiencia en redes

---

## 2. URL Y HOSTING

- **Dominio**: arturopaniagua.com (ya existe)
- **Ruta de la herramienta**: `arturopaniagua.com/mundial`
- **Hosting**: SiteGround (ya contratado)
- **Razón del slug `/mundial`**: SEO durante los meses junio-julio 2026 (cuando "mundial" tiene picos de búsqueda)
- **CDN recomendado**: Cloudflare gratis delante de la web para absorber tráfico viral

---

## 3. ESTRUCTURA DE LA WEB

### Página única (`/mundial`)

La web es **una sola página** con secciones que el usuario recorre:

1. **Hero / Manifiesto**: presentación del proyecto en voz de Arturo + botón "Crear mi selección"
2. **Constructor**: la herramienta interactiva donde se arma la selección
3. **Cromo final**: vista previa del cromo generado + opciones de compartir
4. **Sección "Mis vídeos del Mundial"**: lista de vídeos editoriales publicados (se irá poblando durante el Mundial)
5. **Footer**: créditos + enlaces a redes de Arturo

### Rutas
- `/` (landing arturopaniagua.com - NO TOCAR, es la web actual de Arturo)
- `/mundial` (landing de este proyecto)
- `/mundial/crear` (la herramienta interactiva)
- `/mundial/[id]` (URL única de cada selección compartida)
- `/mundial/admin` (dashboard privado para Arturo con contraseña)

---

## 4. EL CONSTRUCTOR · DETALLE FUNCIONAL

### Buscador de artistas

- **API**: iTunes Search API (gratis, sin registro)
  - Endpoint: `https://itunes.apple.com/search?term=NOMBRE&entity=musicArtist&limit=10`
  - Para canción: `entity=song`
- **Comportamiento**: el usuario escribe, aparecen resultados con foto + nombre
- **Datos a guardar por artista seleccionado**:
  - Nombre exacto
  - URL de la foto (artworkUrl100, escalada a 600x600 sustituyendo en el URL)
  - Género musical (primaryGenreName)
- **Implementación crítica**: 
  - **Debounce** de 400ms para evitar saturar la API
  - **Cache local** de resultados para no repetir búsquedas
  - Mensaje amigable si se excede el rate limit (20 req/min/IP)

### Slots a rellenar

Cada slot indica con un subtítulo en voz de Arturo qué debe poner el usuario:

#### HIMNO
- Subtítulo: "La canción que mejor te define. La que te emociona desde el primer acorde. La que pondrías para presentarte al mundo."
- El usuario busca una CANCIÓN (entity=song)
- Se guardan: título de la canción + nombre del artista
- NO se guarda portada de álbum ni año

#### SELECCIONADOR
- Subtítulo: "El artista que dirige tu sensibilidad musical. El que te enseñó a escuchar. Tu referente, tu maestro, tu brújula."
- El usuario busca un ARTISTA
- Se guardan: nombre + foto

#### ONCE INICIAL (4-3-3)
- Subtítulo: "Los once artistas que siempre saltan al campo de tu vida. Los que te han marcado de verdad. No los más famosos, los tuyos."
- 11 slots distribuidos en formación 4-3-3:
  - 3 delanteros
  - 3 mediocampos
  - 4 defensas
  - 1 portero
- Cada slot acepta drag&drop o "añadir" desde el buscador

#### BANQUILLO
- Subtítulo: "Los que no son titulares pero también te han hecho vibrar. Tus suplentes de lujo. Los que entran cuando el partido lo pide."
- Cantidad: **10 suplentes** (incluyendo 1 portero suplente obligatorio si el usuario lo quiere)
- Posiciones libres (no se restringe la formación del banquillo)

#### FIRMA
- Subtítulo: "Pon tu @ para firmar tu cromo. Es opcional, pero la gente verá quién armó esta selección."
- Campo de texto donde el usuario introduce su @ (se guarda y se imprime en el cromo)

### Validaciones
- No se puede generar el cromo si faltan: himno, seleccionador, los 11 titulares
- El banquillo es opcional pero recomendado
- El @ es opcional

---

## 5. EL CROMO COMPARTIBLE · DETALLE VISUAL

### Formato
- **9:16 estricto** (1080 × 1920 px en producción)
- Diseñado para Instagram Stories como prioridad
- También funciona en X, WhatsApp, Telegram

### Safe zones de Instagram Stories

Instagram Stories tiene zonas que la UI tapa:
- Arriba 250px: tapados por header de Instagram (avatar + hora)
- Abajo 250px: tapados por barra de respuesta

**Por tanto, el contenido crítico debe vivir en los 1420px centrales.**

### Estructura visual de arriba abajo

```
┌─────────────────────────────────┐ ← 1080 px
│  DEAD ZONE SUPERIOR (250 px)    │  Decoración sacrificable
│  "★ MUNDIAL MUSICAL 2026 ★"    │  (puede taparse, no importa)
├─────────────────────────────────┤
│                                 │
│  SAFE ZONE (1420 px)            │
│                                 │
│  [Título + @usuario]            │
│  [Himno + Seleccionador en fila]│
│  [Campo de fútbol con el 11]    │
│  [Banquillo de 10]              │
│  [URL arturopaniagua.com/mundial]│
│                                 │
├─────────────────────────────────┤
│  DEAD ZONE INFERIOR (250 px)    │  Decoración sacrificable
│  "#LaSelecciónMusicalDeMiVida"  │  (puede taparse, no importa)
└─────────────────────────────────┘
```

### Paleta de colores

```js
const COLORS = {
  bg: "#FAFAF7",        // Blanco hueso fondo principal
  paper: "#F5F1E6",     // Crema para el cromo interno
  text: "#0a0a0a",      // Negro
  gold: "#D4A22E",      // Dorado para LEYENDAS
  pitch: "#1a4d2e",     // Verde campo de fútbol
  pitchLight: "#2a6b3f",// Verde más claro
  red: "#E63946",       // Rojo para artistas ACTUALES
};
```

### Tipografía
- **Fuente principal**: Inter (importar desde Google Fonts)
- **Fuente secundaria**: Georgia serif para frases en cursiva
- **Estilos**: itálicas grandes para títulos, peso 900 (Black) para destacados

### Estética de jugadores
- **NO usar cromos rectangulares Panini**
- **SÍ usar estilo FotMob**: 
  - Círculo con foto del artista
  - Borde de color: dorado para LEYENDAS, rojo para ACTUALES
  - Nombre debajo en blanco con sombra de texto
  - Sin etiquetas de texto "LEYENDA / ACTUAL", solo color del borde

### Sistema de nombres uniforme

**Regla única**:
- Si el nombre tiene ≤ 11 caracteres → 1 línea, tamaño normal
- Si tiene más → 2 líneas (partiendo por espacio cercano al centro), MISMO tamaño que los demás
- **Nunca abreviar bandas ni nombres compuestos**
  - "Los Planetas" se mantiene completo
  - "Héroes del Silencio" se mantiene completo
  - "CA7RIEL y Paco Amoroso" se mantiene completo
  - "Sanguijuelas del Guadiana" se mantiene completo
- **Block height fijo** para que las filas del campo se mantengan alineadas aunque algunos nombres ocupen 2 líneas y otros 1

### El campo de fútbol
- Gradiente verde con líneas blancas marcadas (perímetro + línea central + círculo central + áreas)
- Los 11 jugadores como bolitas FotMob distribuidos en 4-3-3
- Delantera arriba, portero abajo (vista del seleccionador)

### El banquillo
- 10 jugadores en grid de 2 filas × 5 columnas (o 1 fila × 10)
- Bolitas más pequeñas que el campo
- Sin recuadro de madera, fondo neutro

### El himno
- Bloque tipográfico destacado
- Fondo negro con sombra dorada
- Título de la canción entre comillas, en dorado grande, itálica
- Nombre del artista debajo en blanco, más pequeño
- Sin portada de álbum, sin año

### El seleccionador
- Caja con bolita del artista + nombre
- Borde dorado discontinuo
- Etiqueta "★ SELECCIONADOR" en dorado

### Footer del cromo (dentro de safe zone)
- Fondo negro
- "Crea la tuya" en dorado itálica
- "arturopaniagua.com/mundial" en blanco grande

### Prototipo visual de referencia
Usar como referencia el archivo `cromo-compartible.jsx` (último prototipo validado).

---

## 6. GENERACIÓN DE LA IMAGEN

**CRÍTICO**: La generación de imagen debe ocurrir **EN EL NAVEGADOR DEL USUARIO**, NO en el servidor.

### Tecnología
- Librería: `html-to-image` o `dom-to-image-more`
- Función: convertir el HTML del cromo en PNG
- El usuario descarga la imagen directamente desde su dispositivo

### Razón
- Cero coste de servidor (SiteGround no aguantaría server-side rendering a escala)
- Si va viral, escalamos a infinito sin pagar más
- Compatible con cualquier dispositivo moderno

### Calidad de salida
- PNG 1080 × 1920 px
- 72 dpi (suficiente para Stories)
- Optimizada en tamaño (target < 500KB)

---

## 7. BASE DE DATOS

### Tecnología: Supabase

- Plan gratuito para empezar (500MB)
- Si crece a > 500MB, upgrade a Pro ($25/mes)

### Tabla `selecciones`

Cada vez que un usuario genera un cromo, se guarda una fila:

```sql
CREATE TABLE selecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fecha_dia DATE GENERATED ALWAYS AS (created_at::date) STORED,
  semana_iso INTEGER GENERATED ALWAYS AS (EXTRACT(WEEK FROM created_at)) STORED,
  usuario TEXT,                    -- El @ que puso el usuario (opcional)
  voter_hash TEXT NOT NULL,        -- hash(IP + cookie) para anti-duplicados
  
  himno_cancion TEXT,
  himno_artista TEXT,
  seleccionador_nombre TEXT,
  seleccionador_foto TEXT,
  
  -- Jugadores: 11 titulares + 10 banquillo = 21
  -- Se guardan como JSONB array
  titulares JSONB,                 -- [{nombre, foto, posicion}, ...]
  suplentes JSONB
);
```

### Tabla `eventos_artistas`

Para análisis editorial fino, cada artista metido en cada selección genera un evento:

```sql
CREATE TABLE eventos_artistas (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  fecha_dia DATE GENERATED ALWAYS AS (created_at::date) STORED,
  seleccion_id UUID REFERENCES selecciones(id),
  artista_nombre TEXT,
  posicion TEXT,                   -- "himno_artista" | "seleccionador" | "portero" | "defensa" | "mediocampo" | "delantera" | "suplente"
  rol TEXT                         -- "titular" | "suplente" | "himno" | "seleccionador"
);
```

### Tabla `busquedas`

Para entender qué busca la gente, incluso si no añade el artista:

```sql
CREATE TABLE busquedas (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  texto TEXT,
  añadido BOOLEAN DEFAULT FALSE,
  voter_hash TEXT
);
```

### Privacidad
- **Modo 100% anónimo**: no se guardan emails, no se guarda IP en claro
- `voter_hash` = SHA-256(IP + user-agent + cookie persistente). No reversible.
- Política de privacidad mínima visible en la web

---

## 8. DASHBOARD DE ARTURO (`/mundial/admin`)

Protegido por contraseña. Solo accesible para Arturo.

### Vistas necesarias

#### Vista 1 · Totales en vivo
- Número total de selecciones creadas
- Crecimiento semana actual vs anterior (porcentaje)
- Picos de actividad por día

#### Vista 2 · Top artistas por posición
- Top 10 himnos más elegidos
- Top 10 seleccionadores
- Top 10 porteros
- Top 10 defensas
- Top 10 mediocampos
- Top 10 delanteros
- Top 10 suplentes
- Top 10 artistas más buscados que NO se añadieron

#### Vista 3 · Histórico temporal
- Gráfico de selecciones por día desde el lanzamiento
- Marcadores de eventos clave (publicación de cada vídeo de Arturo, etc.)

#### Vista 4 · Exportar CSV
- Botón grande "Descargar histórico completo CSV"
- Botón "Descargar semana actual CSV"
- Botón "Descargar mes actual CSV"

### CSV de exportación
Debe contener TODOS los campos relevantes con fechas para análisis editorial fino:

```
id, created_at, fecha_dia, semana_iso, usuario,
himno_cancion, himno_artista,
seleccionador_nombre,
portero_nombre, defensa_1_nombre, defensa_2_nombre, ...,
delantera_1_nombre, delantera_2_nombre, delantera_3_nombre,
suplente_1_nombre, ..., suplente_10_nombre
```

Adicionalmente, otro CSV para eventos:
```
artista_nombre, posicion, rol, created_at, fecha_dia, semana_iso, seleccion_id
```

---

## 9. URL ÚNICA POR SELECCIÓN

Cada cromo generado tiene su propia URL en formato `arturopaniagua.com/mundial/[id]`.

### Comportamiento
- La URL se genera al guardar la selección
- Permite que el usuario comparta no solo la imagen, sino también un enlace
- Al entrar a la URL, se ve el cromo completo en formato web (no imagen estática)
- Tiene un botón "Crear la mía" prominente
- Buena para SEO y para captar tráfico desde compartidos

### Metatags OG
Cada URL única debe tener metatags Open Graph para que cuando alguien la comparte en WhatsApp, X o cualquier red, aparezca la imagen del cromo:

```html
<meta property="og:title" content="La selección musical de @[usuario]" />
<meta property="og:description" content="Mi alineación musical: [himno] y otros artistas que me han marcado" />
<meta property="og:image" content="[URL de la imagen del cromo generada]" />
```

---

## 10. STACK TÉCNICO

- **Framework**: Next.js 14 (App Router) o 15 si está estable
- **Lenguaje**: TypeScript
- **Estilos**: CSS inline en componentes (mantener consistencia con prototipos)
- **Base de datos**: Supabase
- **Hosting**: SiteGround
- **CDN**: Cloudflare gratis delante
- **Generación de imagen**: html-to-image (client-side)
- **API externa**: iTunes Search API (sin registro)

---

## 11. ESTRUCTURA DE REPOSITORIO PROPUESTA

```
seleccion-musical/
├── src/
│   ├── app/
│   │   ├── mundial/
│   │   │   ├── page.tsx           # Landing
│   │   │   ├── crear/page.tsx     # Constructor
│   │   │   ├── [id]/page.tsx      # Cromo público compartido
│   │   │   └── admin/page.tsx     # Dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Buscador.tsx
│   │   ├── SlotJugador.tsx
│   │   ├── Campo.tsx
│   │   ├── Banquillo.tsx
│   │   ├── CromoFinal.tsx
│   │   ├── BloqueHimno.tsx
│   │   ├── BloqueSeleccionador.tsx
│   │   └── GeneradorImagen.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── itunes.ts              # Wrapper de iTunes API
│   │   ├── voterHash.ts
│   │   └── tipos.ts
│   └── utils/
│       ├── partirNombre.ts        # Regla de 1 o 2 líneas para nombres
│       └── debounce.ts
├── public/
└── README.md
```

---

## 12. PRIORIDADES DE DESARROLLO

En orden de criticidad:

### Fase 1 · MVP funcional (días 1-5)
1. Setup del proyecto Next.js + Supabase
2. Crear las tablas en Supabase
3. Wrapper de iTunes API con debounce y caché
4. Constructor básico: buscador + 11 slots + himno + seleccionador
5. Sistema de drag & drop básico
6. Botón "Generar cromo"

### Fase 2 · Cromo y compartido (días 6-9)
7. Diseño visual del cromo siguiendo prototipo
8. Generación de PNG con html-to-image
9. Botón "Descargar imagen"
10. Botón "Compartir" (navigator.share API)
11. Guardar selección en Supabase con URL única

### Fase 3 · Landing + Admin (días 10-13)
12. Landing con manifiesto y CTA
13. Sección de vídeos del Mundial (placeholder al inicio)
14. Vista pública de cromo compartido por URL
15. Dashboard de Arturo con métricas básicas
16. Exportación CSV

### Fase 4 · Refinamiento (días 14-15)
17. Cloudflare CDN configurado
18. Política de privacidad y términos
19. Tests en móvil y compatibilidad cross-browser
20. Optimización de performance

---

## 13. REFERENCIAS VISUALES

- **Prototipo del cromo final**: `cromo-compartible.jsx` (último validado por Arturo)
- **Estética de jugadores**: FotMob (círculos con foto, nombre debajo)
- **Estética general**: Panini contemporáneo + Spotify Wrapped (impacto visual + datos personalizados)
- **Paleta y tipografía**: heredadas del proyecto anterior (blanco hueso + negro + dorado)

---

## 14. LO QUE NO LLEVA EL PROYECTO

Para que quede claro:

- **No hay bracket de votación entre selecciones**
- **No hay 48 países preconstruidos**
- **No hay fichas editoriales por jugador**
- **No hay vídeos del Mundial dentro de la web** (solo enlaces a Instagram/YouTube)
- **No hay sistema de cuentas/login**
- **No hay edición posterior de la selección** (cada selección guardada es un snapshot)
- **No hay portada de álbum ni año** en el himno (solo título canción + artista)

---

## 15. PREGUNTAS PENDIENTES PARA ARTURO

Algunas cosas no están 100% decididas y se pueden ajustar durante el desarrollo:

1. **¿Banquillo de 10 jugadores exactos o configurable?** Propuesta: 10 fijos
2. **¿Validamos nacionalidad de artistas o libertad total?** Propuesta: libertad total (proyecto es "selección de tu vida", no de España)
3. **¿El cromo permite editar después o es snapshot definitivo?** Propuesta: snapshot, pero se puede crear uno nuevo
4. **¿El dashboard de Arturo es solo con contraseña simple o requiere login?** Propuesta: contraseña simple (suficiente)

---

**Fin del briefing.**

Para dudas durante el desarrollo, escribir a Arturo en directo o consultar al chat principal de Claude con contexto.
