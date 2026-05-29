# Guía rápida para editar textos del proyecto

Casi todos los textos editoriales de la app están agrupados en un solo archivo
para que puedas tocarlos sin pelearte con el código. Esta guía te dice dónde
están cada uno.

> **Importante**: cuando edites cualquier archivo, guarda los cambios, abre
> una terminal en la carpeta del proyecto y ejecuta:
>
> ```bash
> git add -A
> git commit -m "Editar textos"
> git push
> ```
>
> En 1-2 minutos Vercel publica los cambios automáticamente.

---

## 📝 La mayoría de textos editoriales

**Archivo: `src/lib/copys.ts`**

Aquí están agrupados:

- **`COPYS.himno.subtitulo`** — texto editorial sobre el himno
- **`COPYS.seleccionador.subtitulo`** — texto sobre el seleccionador
- **`COPYS.once.subtitulo`** — texto sobre el once titular
- **`COPYS.banquillo.subtitulo`** — texto sobre el banquillo
- **`TEXTOS.firmaSubtitulo`** — explicación del campo del @
- **`TEXTOS.constructorIntro`** — frase de bienvenida del constructor
- **`TEXTOS.landingIntro`** — frase de bienvenida de la landing
- **`TEXTOS.landingDemoNota`** — pie del cromo demo en la landing
- **`TEXTOS.tipDrag`** — "Mantén pulsado un jugador para…"
- **`TEXTOS.postShareLead`** — CTA que aparece tras descargar el cromo
- **`TEXTOS.notaDescargarMovil`** / **`TEXTOS.notaDescargarDesktop`** — nota
  bajo el botón de compartir

Cuidado con los textos largos: si pones más de dos oraciones, el riesgo de
viuda tipográfica crece. Mantén las frases cortas.

---

## 🏷️ Títulos y branding fijos

### Landing (`/mundial`)

**Archivo: `src/app/mundial/page.tsx`**

- "★ MUNDIAL MUSICAL 2026 ★" — badge dorado de arriba
- "La selección musical" y "DE MI VIDA" — el `<h1>` principal
- "Un proyecto de Arturo Paniagua · arturopaniagua.com" — footer

### Constructor (`/mundial/crear`)

**Archivo: `src/app/mundial/crear/page.tsx`**

- "★ MUNDIAL MUSICAL 2026 ★" del header
- "La selección musical / DE MI VIDA" del header
- "EMPEZAR DE CERO" — botón de la barra de progreso
- "GENERAR CROMO" / "FALTA EL…" — texto del botón sticky (función
  `faltanCampos` y el botón en el JSX)
- "← VOLVER A EDITAR" / "DESCARGAR IMAGEN" / "COMPARTE TU SELECCIÓN" —
  botones de la vista del cromo

### Cromo final (lo que se exporta al PNG)

**Archivo: `src/components/CromoFinal.tsx`**

- "★ MUNDIAL MUSICAL 2026 ★" — encabezado del marco
- "La selección musical / DE MI VIDA" — título dentro del paper crema
- "★ HIMNO" — etiqueta del bloque del himno
- "★ SELECCIONADOR" — etiqueta del seleccionador
- "★ BANQUILLO" — etiqueta del banquillo
- "Crea la tuya en arturopaniagua.com/mundial" — footer del cromo
- "Un proyecto de @ajpaniagua" — pie del footer del cromo

### Cromo demo de la landing

**Archivo: `src/components/CromoDemo.tsx`**

Aquí están hardcodeados los artistas de muestra de la landing:
- `HIMNO` (canción + artista)
- `SELECCIONADOR`
- `DELANTEROS`, `MEDIOS`, `DEFENSAS`, `PORTERO`, `BANQUILLO`

Cada uno con `nombre` y `foto` (URL de Deezer). Si cambias un artista, hay
que conseguir su foto en Deezer (puedes pedírselo a Claude).

---

## 🔎 Buscador y modales

**Archivo: `src/components/Buscador.tsx`**

- "Busca un artista…" / "Busca una canción…" — placeholders
- "Buscando…" — mensaje de carga
- "Sin resultados." — vacío
- "No se pudo buscar. Revisa tu conexión…" — error

---

## 🏷️ Etiquetas de slots vacíos

**Archivo: `src/components/Banquillo.tsx`** — `etiqueta="Suplente"`
**Archivo: `src/components/Campo.tsx`** — `etiqueta="Delantero"`, etc.

---

## 🔐 Dashboard del admin

**Archivo: `src/app/mundial/admin/AdminLogin.tsx`**
- "★ DASHBOARD ★" y la frase de bienvenida del login

**Archivo: `src/app/mundial/admin/AdminDashboard.tsx`**
- Títulos de cada sección ("Top himnos", "Top seleccionadores", etc.)
- Etiquetas de `ETIQUETAS_POSICION` (line ~70 aprox)
- Etiquetas de las tarjetas resumen

---

## 🌐 Metadatos y SEO

**Archivo: `src/app/mundial/page.tsx`** (el objeto `metadata` al principio)
- `title` y `description` del `<head>`
- Texto de Open Graph (cuando se comparte el enlace en WhatsApp, X, etc.)

**Archivo: `src/app/layout.tsx`**
- Title fallback de la app

---

## 🎵 Resumen visual

| Quieres cambiar… | Vete a… |
|---|---|
| Subtítulos editoriales del constructor | `src/lib/copys.ts` |
| Intros y notas | `src/lib/copys.ts` |
| Título grande de landing | `src/app/mundial/page.tsx` |
| Footer del cromo (URL + @) | `src/components/CromoFinal.tsx` |
| Artistas demo de la landing | `src/components/CromoDemo.tsx` |
| Botones del cromo final | `src/app/mundial/crear/page.tsx` |
| Vistas del admin | `src/app/mundial/admin/AdminDashboard.tsx` |
