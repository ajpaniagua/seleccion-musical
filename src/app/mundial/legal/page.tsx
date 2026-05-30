import type { Metadata } from "next";
import Link from "next/link";
import { COLORS } from "@/lib/colores";
import { FUENTES } from "@/lib/tipografias";

export const metadata: Metadata = {
  title: "Aviso legal y privacidad · La selección musical de mi vida",
  description:
    "Aviso legal, política de privacidad y disclaimer del proyecto editorial La selección musical de mi vida.",
  alternates: {
    canonical: "/mundial/legal",
  },
  robots: { index: true, follow: true },
};

export default function LegalPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          fontFamily: FUENTES.UI,
          color: COLORS.text,
          lineHeight: 1.6,
        }}
      >
        <nav style={{ marginBottom: 28 }}>
          <Link
            href="/mundial"
            style={{
              fontFamily: FUENTES.POSTER,
              fontSize: 14,
              letterSpacing: 3,
              color: COLORS.text,
              textDecoration: "none",
            }}
          >
            ← VOLVER A LA SELECCIÓN
          </Link>
        </nav>

        <header style={{ marginBottom: 32 }}>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 4,
              marginBottom: 10,
            }}
          >
            ★ MUNDIAL MUSICAL 2026 ★
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: FUENTES.POSTER,
              fontWeight: 400,
              lineHeight: 0.9,
              fontSize: "clamp(40px, 8vw, 64px)",
              letterSpacing: -1,
            }}
          >
            AVISO LEGAL <span style={{ color: COLORS.gold }}>Y PRIVACIDAD</span>
          </h1>
        </header>

        {/* Disclaimer destacado: lo primero que se lee. */}
        <section
          style={{
            background: COLORS.paper,
            border: `2px solid ${COLORS.text}`,
            padding: "20px 22px",
            marginBottom: 36,
            boxShadow: `5px 5px 0 ${COLORS.gold}`,
          }}
        >
          <h2
            style={{
              fontFamily: FUENTES.POSTER,
              fontSize: 22,
              letterSpacing: 3,
              margin: 0,
              marginBottom: 10,
            }}
          >
            ★ PROYECTO INDEPENDIENTE
          </h2>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
            <strong>La selección musical de mi vida</strong> es un proyecto
            editorial independiente de Arturo Paniagua. No está asociado,
            patrocinado, autorizado ni respaldado por la <strong>FIFA</strong>,
            la <strong>UEFA</strong>, la <strong>RFEF</strong> ni por ninguna
            federación o liga deportiva. La palabra <em>Mundial</em> se utiliza
            en sentido figurado, como recurso editorial vinculado al contexto
            futbolístico de 2026. Tampoco existe vinculación oficial con{" "}
            <strong>Apple</strong>, <strong>iTunes</strong> ni{" "}
            <strong>Deezer</strong>; sus APIs públicas se utilizan únicamente
            para localizar artistas y canciones que el propio usuario elige.
          </p>
        </section>

        <Bloque titulo="QUIÉN ESTÁ DETRÁS">
          <p>
            Responsable del proyecto: <strong>Arturo Paniagua</strong>. El
            sitio principal del autor es{" "}
            <a href="https://arturopaniagua.com" style={enlace}>
              arturopaniagua.com
            </a>
            . Para cualquier consulta relacionada con esta herramienta o tus
            datos, puedes escribir a{" "}
            <a href="mailto:info@arturopaniagua.com" style={enlace}>
              info@arturopaniagua.com
            </a>
            .
          </p>
        </Bloque>

        <Bloque titulo="QUÉ HACE ESTA WEB">
          <p>
            La web permite a cualquier persona armar su propia <em>selección
            musical</em> en formato fútbol (himno, seleccionador, once titular y
            banquillo) y generar un cromo en imagen para compartir en redes
            sociales. La generación de la imagen ocurre íntegramente en tu
            propio dispositivo; no enviamos tu cromo a ningún servidor de
            terceros.
          </p>
        </Bloque>

        <Bloque titulo="QUÉ DATOS GUARDAMOS">
          <p>
            Cuando generas tu cromo guardamos, con fines puramente editoriales y
            estadísticos, los siguientes datos en nuestra base de datos:
          </p>
          <ul style={listaStyle}>
            <li>
              Las elecciones musicales: himno (canción + artista), seleccionador
              y los artistas que has añadido al once y al banquillo.
            </li>
            <li>
              Tu nombre de usuario de Instagram, <strong>solo si decides
              ponerlo</strong> en el campo &ldquo;firma&rdquo; (es opcional).
            </li>
            <li>
              Un hash anónimo de dispositivo (<code>voter_hash</code>) generado
              con SHA-256 a partir de tu dirección IP, el user-agent del
              navegador y un identificador aleatorio almacenado en una cookie
              local (<code>ms_vid</code>). Este hash no es reversible y no
              permite identificarte: solo sirve para detectar duplicados
              cuando alguien genera muchas selecciones desde el mismo
              dispositivo.
            </li>
            <li>
              Las búsquedas de texto que escribes en el buscador (sin asociarlas
              a tu identidad), para entender qué artistas no estamos
              encontrando bien.
            </li>
          </ul>
          <p>
            <strong>No guardamos</strong> tu correo electrónico, ni tu dirección
            IP en claro en nuestra propia base de datos, ni datos de
            geolocalización detallados. No te asociamos con cookies
            publicitarias. No hay perfilado individual, ni venta de datos, ni
            comunicación a terceros con fines comerciales más allá del
            procesamiento agregado descrito en la sección &ldquo;Cookies y
            analítica&rdquo;.
          </p>
        </Bloque>

        <Bloque titulo="POR QUÉ LO GUARDAMOS">
          <p>
            La finalidad es <strong>editorial</strong>: Arturo utiliza los datos
            agregados para preparar vídeos y artículos durante el Mundial de
            2026 (los artistas más elegidos, las canciones más nombradas, las
            tendencias por semana). Las selecciones individuales pueden ser
            comentadas en sus redes sociales, siempre respetando el carácter
            público del cromo que tú mismo decides compartir.
          </p>
          <p>
            Base legal del tratamiento:{" "}
            <strong>interés legítimo editorial</strong> y, en lo que afecta a la
            firma opcional con tu @ de Instagram,{" "}
            <strong>consentimiento</strong> al introducirla voluntariamente.
          </p>
        </Bloque>

        <Bloque titulo="COOKIES Y ANALÍTICA">
          <p>
            Esta web utiliza una cookie técnica propia, <code>ms_vid</code>, que
            almacena un identificador aleatorio durante un año como parte del
            mecanismo anti-duplicado descrito arriba.
          </p>
          <p>
            Para medir el uso de la web utilizamos{" "}
            <strong>Vercel Web Analytics</strong> (métricas técnicas y de
            visitas, sin cookies) y <strong>Google Analytics 4</strong>{" "}
            (métricas agregadas de tráfico). Google Analytics instala en tu
            navegador las cookies <code>_ga</code> y <code>_ga_*</code> con una
            duración de hasta dos años. La configuración tiene activada la
            anonimización de IP.
          </p>
          <p>
            Puedes bloquear estas cookies desde la configuración de tu
            navegador o con una extensión como uBlock Origin o Privacy Badger.
          </p>
        </Bloque>

        <Bloque titulo="TUS DERECHOS">
          <p>
            Puedes pedirnos en cualquier momento que eliminemos una selección
            concreta o tu @ de Instagram de nuestra base de datos. Como no
            guardamos tu identidad, para localizar tu selección necesitaremos
            que nos indiques aproximadamente cuándo la creaste y, si la
            firmaste, con qué @. Escríbenos a{" "}
            <a href="mailto:info@arturopaniagua.com" style={enlace}>
              info@arturopaniagua.com
            </a>{" "}
            y la borraremos.
          </p>
          <p>
            También tienes derecho a presentar una reclamación ante la Agencia
            Española de Protección de Datos (
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              style={enlace}
            >
              aepd.es
            </a>
            ).
          </p>
        </Bloque>

        <Bloque titulo="PROPIEDAD INTELECTUAL">
          <p>
            Las fotos de los artistas que aparecen en el buscador y en el cromo
            provienen de la API pública de <strong>Deezer</strong> (con{" "}
            <strong>iTunes Search API</strong> como fuente complementaria
            ocasional). Los datos de canciones para el himno se obtienen de{" "}
            <strong>iTunes Search API</strong>. Los nombres de artistas, los
            títulos de canciones y las imágenes son propiedad de sus
            respectivos titulares; en esta web se reproducen con fines
            editoriales y no comerciales, en el marco de un proyecto
            periodístico personal.
          </p>
          <p>
            Si eres titular de derechos sobre alguno de los contenidos
            referenciados y deseas que dejemos de mostrarlo, escríbenos a{" "}
            <a href="mailto:info@arturopaniagua.com" style={enlace}>
              info@arturopaniagua.com
            </a>{" "}
            y lo retiraremos.
          </p>
        </Bloque>

        <Bloque titulo="CAMBIOS EN ESTE AVISO">
          <p>
            Podemos actualizar este texto si cambian el alcance del proyecto o
            las herramientas que usamos. La versión vigente es siempre la
            publicada en esta página.
          </p>
          <p style={{ color: "#666", fontSize: 14 }}>
            Última actualización: 29 de mayo de 2026.
          </p>
        </Bloque>

        <footer
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: `1px solid ${COLORS.paper}`,
            fontSize: 13,
            color: "#666",
            fontStyle: "italic",
          }}
        >
          Un proyecto de Arturo Paniagua ·{" "}
          <a
            href="https://arturopaniagua.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: COLORS.text,
              fontStyle: "normal",
              fontWeight: 700,
              textDecoration: "underline",
              textDecorationColor: COLORS.gold,
              textUnderlineOffset: 3,
            }}
          >
            arturopaniagua.com
          </a>
        </footer>
      </div>
    </main>
  );
}

const enlace: React.CSSProperties = {
  color: COLORS.text,
  fontWeight: 700,
  textDecoration: "underline",
  textDecorationColor: COLORS.gold,
  textUnderlineOffset: 3,
};

const listaStyle: React.CSSProperties = {
  margin: "8px 0 12px",
  paddingLeft: 22,
  fontSize: 16,
};

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontFamily: FUENTES.POSTER,
          fontSize: 22,
          letterSpacing: 3,
          margin: 0,
          marginBottom: 8,
        }}
      >
        ★ {titulo}
      </h2>
      <div style={{ fontSize: 16, fontWeight: 500 }}>{children}</div>
    </section>
  );
}
