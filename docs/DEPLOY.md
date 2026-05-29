# Despliegue de `mi-seleccion`

Esta app vive desplegada en **Vercel** y debe responder bajo
`https://arturopaniagua.com/mundial`. El dominio raíz `arturopaniagua.com` no
se toca: sigue siendo la web actual de Arturo. Solo el subpath `/mundial/*`
apunta a este proyecto.

Este documento es la checklist de despliegue y resolución de incidencias para
la fase "dominio + privacidad".

---

## 1. Variables de entorno en Vercel

En **Project → Settings → Environment Variables**, replicar las claves de
`.env.local` para los entornos `Production`, `Preview` y opcionalmente
`Development`:

| Clave                       | Producción                                  | Notas                                              |
| --------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `SUPABASE_URL`              | URL del proyecto Supabase                   | Server-only                                        |
| `SUPABASE_ANON_KEY`         | Anon key (publishable)                      | Server-only                                        |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (¡NO exponer al cliente!)     | Solo usada en Route Handlers del admin             |
| `ADMIN_PASSWORD`            | Contraseña del dashboard                    | La de `.env.local` rota antes del lanzamiento      |
| `ADMIN_SECRET`              | Secreto para firmar la cookie de admin      | Rotar antes del lanzamiento                        |
| `NEXT_PUBLIC_SITE_URL`      | `https://arturopaniagua.com`                | Usado en `metadataBase` (OG, canonical, Twitter)   |

> `NEXT_PUBLIC_SITE_URL` solo es necesario fijarlo en previews si quieres que
> Open Graph apunte al preview en vez de al dominio definitivo. Por defecto
> `layout.tsx` ya cae en `https://arturopaniagua.com`.

Tras añadir o cambiar variables, **redeployar** (Vercel no las recoge en
caliente).

---

## 2. Apuntar `arturopaniagua.com/mundial` al proyecto Vercel

El dominio raíz `arturopaniagua.com` está hosteado en otro sitio (web
editorial actual de Arturo). La estrategia es **mantener el dominio raíz
donde está y delegar solo el subpath** `/mundial/*` al proyecto Vercel.

Opciones, de más simple a más invasiva:

### Opción A · Subdominio + redirect (recomendada como atajo)

1. En Vercel: **Project → Settings → Domains → Add**, añadir
   `mundial.arturopaniagua.com`.
2. En el panel DNS de `arturopaniagua.com` (Cloudflare / SiteGround / donde
   esté): añadir un registro `CNAME` para `mundial` apuntando a
   `cname.vercel-dns.com`.
3. En el hosting actual de `arturopaniagua.com`, dejar una redirección 301
   permanente de `/mundial` y `/mundial/*` hacia `mundial.arturopaniagua.com/*`.
4. En la app: para que las URLs internas no rompan, *no* cambiar nada (todas
   las rutas internas siguen siendo `/mundial/...`). El SEO se canoniza solo
   en el subdominio.

Pros: cero configuración compleja, despliegue inmediato.
Contras: la URL "bonita" del briefing (`arturopaniagua.com/mundial`) queda en
redirect. Para Stories da exactamente igual porque Instagram no muestra la URL
real.

### Opción B · Reverse proxy del subpath (URL exacta del briefing)

Mantiene la URL `arturopaniagua.com/mundial` literalmente.

1. En Vercel: añadir `arturopaniagua.com` como dominio del proyecto **sin
   apuntar DNS**, solo para que Vercel acepte el host.
2. En el hosting / CDN delante de `arturopaniagua.com` (Cloudflare es lo más
   sencillo), añadir una regla de **reverse proxy / worker** que reescriba
   cualquier petición que empiece por `/mundial` hacia
   `https://<proyecto>.vercel.app/mundial`, preservando path, query y método.
3. Asegurar que los headers `X-Forwarded-Host` y `X-Forwarded-Proto` se
   propagan, para que `voterHash` lea la IP cliente correcta desde
   `x-forwarded-for` (ya lo hace en [`src/lib/voterHash.ts`](../src/lib/voterHash.ts)).
4. En la app no hace falta `basePath` (todas las rutas ya cuelgan de
   `/mundial`).

Pros: la URL canónica es exactamente la del briefing.
Contras: depende de configurar el proxy en Cloudflare/SiteGround sin romper el
sitio principal. Recomendado solo si Arturo quiere blindar esa URL exacta
para SEO.

> **Sugerencia**: empezar por la Opción A y, si tras el lanzamiento queremos
> consolidar SEO en la URL exacta, migrar a la B sin tocar la app.

---

## 3. Verificación post-despliegue

Antes de anunciar:

- [ ] `https://arturopaniagua.com/mundial` (o el subdominio elegido) carga la
      landing sin errores 404 ni 5xx.
- [ ] `/mundial/crear` carga, deja construir un cromo y descargar el PNG.
- [ ] `/mundial/admin` pide contraseña y, tras login, muestra métricas.
- [ ] `/mundial/legal` carga y enlaza correctamente desde los footers.
- [ ] Compartir la URL en WhatsApp / X / Telegram muestra la **Open Graph
      image** (la generada en `src/app/mundial/opengraph-image.tsx`). Probar
      con el debugger oficial:
      - <https://developers.facebook.com/tools/debug/>
      - <https://cards-dev.twitter.com/validator> (si sigue activo)
- [ ] El bloque "PROYECTO INDEPENDIENTE" del `/mundial/legal` es lo primero
      que se ve al entrar.
- [ ] La cookie `ms_vid` se planta al generar el primer cromo y persiste.

---

## 4. Cosas que NO hay que hacer

- **No** añadir el proyecto a la raíz `arturopaniagua.com`: rompe la web
  actual del autor.
- **No** exponer `SUPABASE_SERVICE_ROLE_KEY` ni `ADMIN_*` como
  `NEXT_PUBLIC_*`. Esas claves solo se leen en Route Handlers / Server
  Components.
- **No** redirigir desde HTTPS a HTTP en el reverse proxy: rompe la cookie
  `ms_vid` (sameSite=lax) y las llamadas a Supabase.

---

## 5. Rotación de credenciales antes del lanzamiento

Los valores actuales de `.env.local` se generaron en desarrollo. Antes de
abrir al público el 11 de junio de 2026:

1. Rotar `ADMIN_PASSWORD` y `ADMIN_SECRET` a valores nuevos (256 bits
   aleatorios) y guardarlos solo en el gestor de contraseñas de Arturo.
2. Si `SUPABASE_SERVICE_ROLE_KEY` ha sido pegada en algún chat, rotarla desde
   Supabase Dashboard → Project Settings → API.
3. Actualizar todas las variables en Vercel y redeployar.
