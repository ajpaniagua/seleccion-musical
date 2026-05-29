# Despliegue de `mi-seleccion`

La app vive en **Vercel** (URL actual: `https://seleccion-musical.vercel.app`)
y debe responder, **con la URL exacta**, en
`https://arturopaniagua.com/mundial`. La web principal `arturopaniagua.com`
sigue hosteada en **SiteGround** y no se toca.

Para conseguir la URL literal sin tocar la web actual, ponemos
**Cloudflare** (gratis) delante del dominio y usamos un **Worker** que
intercepta `/mundial*` y se lo pasa internamente a Vercel. Para el resto del
tráfico, Cloudflare sigue enviando a SiteGround como siempre.

```
Usuario
  │
  ▼
arturopaniagua.com (Cloudflare)
  │
  ├── /mundial*      ──► Cloudflare Worker ──► seleccion-musical.vercel.app
  ├── /_next/*       ──► Cloudflare Worker ──► seleccion-musical.vercel.app
  ├── /api/*         ──► Cloudflare Worker ──► seleccion-musical.vercel.app
  │
  └── todo lo demás  ──► SiteGround (web actual de Arturo)
```

---

## Checklist de la migración

### 1. Variables de entorno en Vercel

Antes de tocar DNS, asegurarse de que el deploy actual tiene en
**Vercel → Project → Settings → Environment Variables** (entorno
`Production`):

| Clave                       | Valor                                       |
| --------------------------- | ------------------------------------------- |
| `SUPABASE_URL`              | URL del proyecto Supabase                   |
| `SUPABASE_ANON_KEY`         | Anon key                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-only)                  |
| `ADMIN_PASSWORD`            | Contraseña del dashboard                    |
| `ADMIN_SECRET`              | Secreto para firmar la cookie de admin      |
| `NEXT_PUBLIC_SITE_URL`      | `https://arturopaniagua.com`                |

Tras añadir cualquier variable, **redeploy** desde Vercel.

### 2. Cloudflare: crear cuenta y añadir el sitio

1. Ir a <https://dash.cloudflare.com/sign-up> y crear cuenta gratis.
2. **Add a Site** → escribir `arturopaniagua.com` → plan **Free $0**.
3. Cloudflare escaneará automáticamente los DNS actuales de SiteGround.
   Verificar que aparecen los registros principales (al menos un `A` apuntando
   a la IP de SiteGround y los `MX` del correo si hay).
4. La columna **Proxy status** debe estar:
   - `A` del dominio raíz: **proxied (naranja)** → para que el Worker pueda
     interceptar `/mundial*` y servir desde Cloudflare.
   - `MX` y `TXT` del correo: **DNS only (gris)** → el correo nunca debe pasar
     por el proxy de Cloudflare.

### 3. SiteGround: cambiar nameservers a Cloudflare

Cloudflare te muestra al final del wizard sus dos nameservers (por ejemplo
`dana.ns.cloudflare.com` y `kirk.ns.cloudflare.com`). En SiteGround:

1. Entrar al panel de SiteGround → **Site Tools** del sitio principal.
2. **Domain → Name Servers** → elegir **Use Custom Name Servers**.
3. Pegar los dos nameservers que da Cloudflare.
4. Guardar y esperar. La propagación tarda entre 15 minutos y 24 horas (lo
   normal son 1-2h). La web principal **no se cae** mientras propaga: o se
   resuelve por SiteGround directo (lo viejo) o por Cloudflare (lo nuevo),
   ambas devuelven la misma web.

Cloudflare avisa por email cuando el dominio queda "Active".

### 4. Vercel: añadir `arturopaniagua.com` como dominio del proyecto

**No** es estrictamente necesario que Vercel responda al host
`arturopaniagua.com` (el Worker hace el fetch a la URL `.vercel.app`), pero
añadirlo evita problemas con SSL si en el futuro alguien apunta DNS directo.

1. **Vercel → Project → Settings → Domains → Add**.
2. Añadir `arturopaniagua.com`.
3. Vercel pedirá un registro de verificación. Como el DNS ya está en
   Cloudflare, añadir el `TXT` que Vercel pide en
   **Cloudflare → DNS → Records → Add record** (Type `TXT`, Name lo que diga
   Vercel, Content el valor que diga Vercel, Proxy `DNS only` gris).
4. Vercel verificará en minutos. Tras eso, Vercel emite certificado SSL para
   `arturopaniagua.com`.

### 5. Cloudflare Worker: el proxy a Vercel

En el dashboard de Cloudflare:

1. **Workers & Pages → Create application → Create Worker**.
2. Nombre sugerido: `mundial-proxy`. Click **Deploy** para crear el Worker
   con el código por defecto, y luego **Edit code**.
3. Borrar el código de ejemplo y pegar:

```js
// Worker mundial-proxy
// Reenvía /mundial*, /_next/* y /api/* a Vercel preservando todo lo demás
// para que la web principal de arturopaniagua.com siga sirviéndose desde
// SiteGround sin tocar nada.
const ORIGEN = "https://seleccion-musical.vercel.app";

const PREFIJOS_PROXY = ["/mundial", "/_next", "/api"];

export default {
  async fetch(request) {
    const urlIn = new URL(request.url);
    const debeProxy = PREFIJOS_PROXY.some((p) =>
      urlIn.pathname === p || urlIn.pathname.startsWith(p + "/")
    );

    if (!debeProxy) {
      // El resto del tráfico no nos compete: que siga su camino normal a
      // SiteGround (es lo que hace Cloudflare por defecto).
      return fetch(request);
    }

    // Reescribimos la petición hacia el origen de Vercel manteniendo path,
    // query, método, body y headers. Cambiamos el Host al esperado por
    // Vercel para que su routing interno (host-based) la enrute.
    const urlOut = new URL(urlIn.pathname + urlIn.search, ORIGEN);
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(ORIGEN).host);
    // Cloudflare ya rellena cf-connecting-ip con la IP real del cliente.
    // Lo replicamos en x-forwarded-for por compatibilidad con voterHash.
    const ipCliente = request.headers.get("cf-connecting-ip");
    if (ipCliente) headers.set("x-forwarded-for", ipCliente);

    const req = new Request(urlOut, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });

    return fetch(req);
  },
};
```

4. **Save and deploy**.

### 6. Cloudflare: enlazar el Worker a las rutas del dominio

En el Worker recién creado:

1. **Settings → Triggers → Routes → Add route**, añadir las **tres** rutas:
   - `arturopaniagua.com/mundial*` · Zone: `arturopaniagua.com`
   - `arturopaniagua.com/_next/*` · Zone: `arturopaniagua.com`
   - `arturopaniagua.com/api/*` · Zone: `arturopaniagua.com`

> Las tres apuntan al mismo Worker. Es necesario incluir `/_next/*` y
> `/api/*` porque Next.js sirve sus assets y endpoints desde esos paths sin
> el prefijo `/mundial`. Si la web principal de Arturo no usa `/api/`, no
> habrá colisión (caso típico en WordPress).

### 7. Verificación

Con todo aplicado:

- [ ] `https://arturopaniagua.com` → muestra la web actual (SiteGround).
- [ ] `https://arturopaniagua.com/mundial` → muestra la landing del
      proyecto.
- [ ] `https://arturopaniagua.com/mundial/crear` → constructor funcional.
- [ ] `https://arturopaniagua.com/mundial/legal` → aviso legal y privacidad.
- [ ] Generar un cromo y descargar el PNG funciona desde móvil y escritorio.
- [ ] `https://arturopaniagua.com/mundial/admin` pide contraseña y luego
      muestra métricas.
- [ ] Compartir `https://arturopaniagua.com/mundial` en WhatsApp / X /
      Telegram pre-visualiza la **Open Graph image** generada por
      `src/app/mundial/opengraph-image.tsx`.
- [ ] Probar `curl -I https://arturopaniagua.com/mundial` y comprobar que el
      header `Server` indica Cloudflare y que devuelve `200`.

### 8. Rotación de credenciales antes del lanzamiento

Antes del 11 de junio:

1. Rotar `ADMIN_PASSWORD` y `ADMIN_SECRET` a valores nuevos y guardarlos en
   un gestor de contraseñas (no en chats).
2. Si `SUPABASE_SERVICE_ROLE_KEY` ha pasado por algún chat, rotarla desde
   **Supabase Dashboard → Project Settings → API**.
3. Actualizar las variables en Vercel y redeployar.

---

## Cosas que **no** hay que hacer

- No cambiar los registros `MX` ni quitarles el modo "DNS only": romperías
  el correo del dominio.
- No desactivar el proxy (naranja) del `A` principal: el Worker no se
  ejecutaría y `arturopaniagua.com/mundial` iría a parar a SiteGround.
- No subir `SUPABASE_SERVICE_ROLE_KEY` ni `ADMIN_*` como variables
  `NEXT_PUBLIC_*`: serían visibles desde el navegador.

---

## Si algo falla

- **`arturopaniagua.com/mundial` devuelve 404 con `Server: Apache`**: el
  Worker no se está disparando. Comprobar las **Routes** en el Worker
  (Settings → Triggers).
- **Devuelve 521 / 522**: Cloudflare no puede contactar al origen. Revisar
  que la URL en el Worker (`ORIGEN`) es la correcta y que el deploy de
  Vercel sigue activo.
- **Devuelve 526 (SSL invalid)**: muy raro, pero si pasara, en
  **Cloudflare → SSL/TLS → Overview** poner el modo en **Full (strict)**.
- **Las imágenes de Deezer / iTunes no cargan**: el proxy de fotos
  (`/api/foto`) está cubierto por la route `/api/*`. Si fallara, mirar
  logs del Worker en Cloudflare.
