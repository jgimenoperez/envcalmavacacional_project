# 🎯 Auditoría SEO Completa — encalmavacacional.com
**Fecha:** 24 de febrero de 2026 | **Puntuación SEO:** 44/100

---

## 📊 Resumen Ejecutivo

**Puntuación de Salud SEO: 44/100**

| Categoría | Puntuación | Estado |
|---|---|---|
| **SEO Técnico** | 51/100 | ⚠️ Necesita mejoras |
| **Calidad de Contenido + E-E-A-T** | 54/100 | ⚠️ Necesita mejoras |
| **SEO On-Page** | 35/100 | 🔴 Crítico |
| **Schema / Datos Estructurados** | 25/100 | 🔴 Crítico |
| **Performance / Core Web Vitals** | 48/100 | ⚠️ Necesita mejoras |
| **Optimización de Imágenes** | 40/100 | ⚠️ Necesita mejoras |
| **Preparación para IA** | 22/100 | 🔴 Muy bajo |

---

## 🏢 Información del Sitio

- **Empresa:** EN CALMA VACACIONAL S.L.
- **NIF:** B55473144
- **Tipo de negocio:** Alquiler vacacional (2 apartamentos)
- **Ubicación:** Puerto de Sagunto, Valencia
- **Idioma:** Español (es-ES)
- **CMS:** WordPress + Elementor + LiteSpeed Cache
- **Licencias VUT:**
  - El Ático: CV-VUT0057506-V
  - La Playa: CV-VUT0057503-V
- **Propietarios:** Gloria y Álvaro

---

## 🔴 PROBLEMAS CRÍTICOS (Solucionar Inmediatamente)

### ⚠️ CRÍTICO #1: HTTP sirve una página completa (sin redirección a HTTPS)

**Problema:** Cada URL tiene un duplicado vivo en HTTP. `http://encalmavacacional.com/` devuelve HTTP 200 en lugar de redirigir a HTTPS. Google debe decidir cuál versión indexar — y está confundido.

**Impacto:** Contenido duplicado, señales de seguridad mixtas, crawl budget desperdiciado.

**Solución:**

1. Ve a tu hosting / Panel de control (Plesk, cPanel, etc.)
2. Busca "Redirecciones" o "Redirection"
3. Crea una redirección **permanente 301**:
   - **De:** `http://encalmavacacional.com`
   - **A:** `https://encalmavacacional.com`
   - Marcar "Redirigir con www también"

**O en `.htaccess` (si tienes acceso FTP/SSH):**
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

**Verificación:**
```bash
curl -I http://encalmavacacional.com/
# Debe mostrar: HTTP/1.1 301 Moved Permanently
# Location: https://encalmavacacional.com/
```

---

### ⚠️ CRÍTICO #2: Cero Headers de Seguridad

**Problema:** No hay ni un solo header de seguridad:
- ❌ `Strict-Transport-Security` (HSTS)
- ❌ `Content-Security-Policy`
- ❌ `X-Frame-Options`
- ❌ `X-Content-Type-Options`
- ❌ `Referrer-Policy`
- ❌ `Permissions-Policy`

**Impacto:** Riesgo de seguridad, navegadores no fuerzan HTTPS, ataques XSS posibles.

**Solución (via LiteSpeed Cache):**

1. Accede a WordPress Admin > LiteSpeed Cache > Page Optimization > Headers
2. O si tienes acceso `.htaccess`, añade al inicio:

```apache
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

---

### ⚠️ CRÍTICO #3: Dos plugins SEO compitiendo (Yoast + SureRank)

**Problema:** Tanto Yoast SEO como SureRank están activos simultáneamente. Esto genera:
- 2 etiquetas `<link rel="canonical">` duplicadas
- 2 conjuntos de meta tags `og:title`, `og:description` duplicados
- 2 bloques JSON-LD conflictivos con el mismo `@id` pero valores contradictorios
- URL de organización con espacio al final: `"https://encalmavacacional.com/ "` ← **Inválida**

**Impacto:** Google no sabe cuál información usar, conflictos de validación de esquema.

**Solución:**

1. WordPress Admin > Plugins
2. **DESACTIVA y ELIMINA** uno de estos (recomendación: mantén **Yoast SEO**, quita SureRank):
   - Busca "SureRank" o "Yoast SEO"
   - Haz clic en "Desactivar"
   - Luego "Eliminar"
3. Purga cachés: LiteSpeed Cache > Herramientas > Purgar todo

**Verificación:**
```bash
curl https://encalmavacacional.com/ 2>/dev/null | grep -c "rel=\"canonical\""
# Debe mostrar: 1 (solo una etiqueta, no 2)
```

---

### ⚠️ CRÍTICO #4: Enlaces de menú rotos (404)

**Problema:** El menú de navegación apunta a:
- `/apartamento-vacacional-la-playa/` → **404 NO ENCONTRADO**
- `/apartamento-vacacional-el-atico/` → **404 NO ENCONTRADO**

Las páginas reales están en:
- `/apartamento-vacacional-ciudamar/` ✅
- `/apartamento-vacacional-atico/` ✅

**Impacto:** Visitantes hacen clic y se encuentran con errores. Google ve crawl errors.

**Solución:**

1. WordPress Admin > Apariencia > Menús
2. Busca los dos elementos de menú que salen 404
3. Edita cada uno y corrige la URL:
   - **El Atico** → `/apartamento-vacacional-atico/`
   - **La Playa** → `/apartamento-vacacional-ciudamar/`
4. Guarda cambios

---

### ⚠️ CRÍTICO #5: Falta schema LodgingBusiness (Hotel/Alojamiento)

**Problema:** No hay **ningún** schema de tipo alojamiento/hotel. Google no puede clasificar este sitio como un alquiler vacacional.

**Impacto:**
- ❌ No puede aparecer en resultados ricos de alojamientos
- ❌ Sin estrellas de reseñas en Google
- ❌ Sin panel de información local
- ❌ No cumple para Google Viajes

**Solución (copia y pega):**

1. Descarga el archivo: `/mnt/c/MCP_CLAUDE/JOSE/NaranjaIT/En_Calma_Vacacional/schema_audit_report.md`
2. WordPress Admin > Elementor > página de inicio
3. Busca "Schema" o "Código personalizado" en Elementor
4. **O** ve a WordPress Admin > LiteSpeed Cache > Configuración > Inyectar código
5. Copia este JSON-LD en la sección `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://encalmavacacional.com/#lodging",
  "name": "EnCalma Vacacional",
  "description": "Apartamentos vacacionales en Puerto de Sagunto con alma mediterránea",
  "url": "https://encalmavacacional.com/",
  "telephone": "+34653399081",
  "image": "https://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto de Sagunto",
    "addressRegion": "Valencia",
    "postalCode": "46520",
    "addressCountry": "ES",
    "streetAddress": "Puerto de Sagunto"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.6667,
    "longitude": -0.2167
  },
  "priceRange": "$$",
  "sameAs": ["https://www.instagram.com/encalmavacacional/"],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire Acondicionado", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terraza con vistas al mar", "value": true }
  ],
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Ricardo" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "Salgo encantado, tanto con los anfitriones como con la casa y la ubicación. ¡Volvería con los ojos cerrados!"
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Elena" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "La casa estaba impecable y tenía muchos detalles. Hemos estado muy a gusto."
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "África" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "Un apartamento precioso. Gloria y Álvaro super encantadores con unos detalles que son de agradecer."
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "3"
  }
}
```

6. Guarda cambios
7. Purga cachés

---

## 🟠 PRIORIDAD ALTA (Solucionar en 1 Semana)

### H1: El título de inicio NO tiene palabras clave

**Actual:** `Home - ENCALMA VACACIONAL` (25 caracteres)

**Problema:** "Home" no tiene valor para SEO. No contiene palabras clave de búsqueda. Google muestra hasta 60 caracteres.

**Recomendado:** `Apartamentos Vacacionales en Puerto de Sagunto | EnCalma Vacacional` (70 caracteres)

**Solución:**

1. WordPress Admin > Editar página (Inicio)
2. Baja hasta la caja de Yoast SEO
3. Busca "SEO title" o "Título SEO"
4. Reemplaza con el título recomendado
5. Guarda

**Verificación:**
```bash
curl https://encalmavacacional.com/ 2>/dev/null | grep "<title>" | head -1
# Debe mostrar: <title>Apartamentos Vacacionales en Puerto de Sagunto...</title>
```

---

### H2: Página tiene 3 etiquetas H1 (debería haber solo 1)

**Problema:**
```html
<h1>estancias</h1>
<h1>en calma</h1>
<h1>Reserva tu escapada perfecta</h1>
```

Las primeras dos son el lema partido en dos para estilos CSS. Eso está mal. Google espera **una sola H1 clara y descriptiva**.

**Solución:**

1. WordPress Admin > Elementor > Editar página inicio
2. Busca el widget del héroe (hero section) — "estancias en calma"
3. Selecciona el texto "estancias"
   - Cambia su nivel de encabezado de H1 → **H2**
4. Selecciona el texto "en calma"
   - Cambia su nivel de encabezado de H1 → **H2**
5. El "Reserva tu escapada perfecta" → cambia a **H2**
6. **Crea una verdadera H1** antes (arriba) con algo como:
   - **"Apartamentos Vacacionales en Puerto de Sagunto"**
7. Guarda cambios

---

### H3: Falta schema AggregateRating (reseñas sin visibilidad)

**Problema:** Tienes 3 reseñas visibles (Ricardo, Elena, África) pero sin schema. Google no puede mostrar estrellas en resultados de búsqueda.

**Impacto:**
- ❌ Sin estrellas ⭐⭐⭐⭐⭐ en Google
- ❌ CTR (clics) más bajo que competidores con estrellas

**Solución:** El JSON-LD del paso CRÍTICO #5 ya incluye `aggregateRating`. Una vez que lo añadas, las estrellas deberían aparecer en 1-2 semanas.

**Verificación (Google Search Console):**
1. Accede a Google Search Console > Enhancement > Rich results
2. Busca "AggregateRating"
3. Debe mostrar "1 resultado válido"

---

### H4: Banner de cookies es intrusivo en móvil

**Problema:** La ventana modal de consentimiento cubre el 40-50% de la pantalla en móvil, ocultando completamente el titular.

**Impacto:** Google penaliza esto bajo "Page Experience". Tasa de rebote muy alta.

**Solución:**

1. WordPress Admin > Plugins > Complianz
2. Configuración > Banner
3. Busca "Posición" o "Layout"
4. Cambia de "Centrada" → **"Abajo fijo" o "Bottom Fixed"**
5. Guarda

---

### H5: Imagen héroe no está precargada (demora LCP)

**Problema:** La imagen de fondo del héroe se carga vía CSS `background-image`. El navegador no la descubre hasta que parsea CSS — retraso de ~500-1000ms.

**Solución:**

1. WordPress Admin > LiteSpeed Cache > Page Optimization > CSS
2. O edita el archivo de tema (child theme si tienes):
3. En la sección `<head>`, añade:

```html
<link rel="preload"
      as="image"
      href="https://encalmavacacional.com/wp-content/uploads/2025/09/3-38.jpg.webp"
      type="image/webp">
```

(Si no tienes acceso, pide a tu hosting/developer que lo añada en el `<head>`)

---

### H6: jQuery y Royal Elementor JS cargan sin defer (render-blocking)

**Problema:** Estos scripts bloquean la lectura del HTML:
- `jquery.min.js` (29.7 KB)
- `jquery-migrate.min.js` (13.3 KB)
- `frontend.min.js` (Royal Elementor, 42.6 KB)

El atributo `data-cfasync="false"` impide que LiteSpeed los difiera.

**Solución:**

1. WordPress Admin > LiteSpeed Cache > Page Optimization > JS
2. Busca "Defer JavaScript" o "Deferred JS"
3. Habilita esta opción
4. Añade a la lista: `jquery`, `jquery-migrate`, `royal-elementor`
5. **Importante:** Prueba el sitio después. Algunos plugins pueden romperse. Si algo falla:
   - Deshabilita esta opción
   - Contacta a soporte de hosting

---

### H7: og:image usa el logo (no una foto de apartamento)

**Problema:** Cuando compartes en WhatsApp, Facebook, etc., aparece el logo. Para alquiler vacacional, debería ser una foto atractiva.

**Impacto:** CTR bajo en redes sociales, compartidos menos atractivos.

**Solución:**

1. WordPress Admin > Editar página inicio
2. Baja a Yoast SEO
3. Busca "Social" o "Facebook"
4. Busca "Featured Image" u "OG Image"
5. **Sube una foto landscape 1200×630px** de uno de los apartamentos o la playa
6. Guarda

---

### H8: URLs con HTTP en schemas, sitemap e imágenes

**Problema:** El sitemap tiene 105 URLs de imágenes en `http://`. Los schemas tienen `http://` en varias propiedades.

**Solución (la más efectiva):**

1. WordPress Admin > Configuración > General
2. Asegúrate de que AMBAS direcciones usan `https://`:
   - "Dirección de WordPress:" → `https://encalmavacacional.com/`
   - "Dirección del sitio:" → `https://encalmavacacional.com/`
3. Guarda
4. LiteSpeed Cache > Database > "Find & Replace"
5. Buscar: `http://encalmavacacional.com`
6. Reemplazar por: `https://encalmavacacional.com`
7. Ejecuta
8. LiteSpeed Cache > Herramientas > Purgar todo
9. Descarga nuevamente el sitemap (irá a regenerarse)

---

### H9: Página "Somos EnCalma" demasiado corta (~150 palabras)

**Problema:** La página sobre Gloria y Álvaro es crítica para generar confianza. Tiene solo 150 palabras, sin fotos, sin historia.

**Impacto:**
- ❌ Bajos niveles de E-E-A-T (Experiencia, Autoridad)
- ❌ Sin confianza para potenciales clientes
- ❌ Google no ve experiencia del propietario

**Solución:**

1. WordPress Admin > Editar página "Somos EnCalma"
2. Expande a 600-800 palabras:
   - **¿De dónde son?**
   - **¿Cuánto tiempo llevan en esto?**
   - **¿Por qué eligieron Puerto de Sagunto?**
   - **¿Qué hace especial su servicio?**
   - **Testimonios de clientes/historias**
   - **Detalles sobre su filosofía**
3. **Añade 2 fotos** de Gloria y Álvaro (buena luz, sonriendo)
4. Guarda

**Ejemplo de párrafo:**
```
Gloria y Álvaro llevan 8 años recibiendo a viajeros en Puerto de Sagunto.
Lo que empezó como una forma de compartir su amor por la Costa de Azahar
se convirtió en una pasión por crear experiencias memorables. "No nos gustan
los apartamentos anónimos" dice Gloria. "Cada cliente es importante; nos
encargamos personalmente de la limpieza, la bienvenida y los detalles."
```

---

### H10: Sin H1 en páginas de apartamentos

**Problema:** `/apartamento-vacacional-atico/` y `/apartamento-vacacional-ciudamar/` tienen H2 como título, pero ningún H1.

**Solución:**

1. Edita cada página en Elementor
2. En el título del apartamento (actualmente H2)
3. Cambia a **H1**
4. Guarda

---

## 🟡 PRIORIDAD MEDIA (Solucionar en 1 Mes)

### M1: Meta description no está optimizada

**Actual:** Se auto-genera del texto de la página (157 caracteres, corta).

**Recomendado:** Escribe una descripción de 155 caracteres con palabras clave y CTA.

**Ejemplo:**
```
Alquila nuestros apartamentos vacacionales en Puerto de Sagunto. El Ático y
La Playa con WiFi, parking y terraza. Trato personal. ¡Reserva ahora!
```

**Solución:**
1. WordPress Admin > Editar página inicio
2. Yoast SEO > Meta description
3. Pega el texto recomendado
4. Guarda

Repite para todas las páginas importantes: About, Contacto, Apartamentos.

---

### M2: No hay información de precios

**Problema:** Clientes potenciales no ven tarifas en la web. Deben contactar primero.

**Impacto:** Pérdida de clientes que solo navegan (reducen fricciones).

**Solución:**

**Opción A: Página de precios**
1. Crea una página nueva: `/tarifas/` o `/precios/`
2. Muestra tabla con:
   - Precios por apartamento
   - Temporada alta/baja
   - Descuentos por semana/mes
   - Qué está incluido

**Opción B: Tarjetas en página inicio**
- Debajo de cada apartamento, añade la tarifa

**Opción C: Plugin de calendario**
- Usa Elementor Pro + Booking plugin para mostrar disponibilidad y precios en vivo

Recomendación: **Opción A + B** (máxima transparencia).

---

### M3: Falta página de políticas de huéspedes

**Contenido a crear:**
- ✅ Política de cancelación (% reembolso según días antes)
- ✅ Horarios de entrada/salida (ej: 15:00 / 11:00)
- ✅ Política de mascotas (¿se permiten? ¿coste extra?)
- ✅ Política de fumar (¿dónde?)
- ✅ Normas de la casa (ruido, visitantes, etc.)
- ✅ Qué está incluido (toallas, mantas, etc.)

**Impacto:**
- ✅ Menos preguntas por email
- ✅ Clientes mejor informados
- ✅ Menos conflictos post-reserva

**Solución:**
1. Crea página `/politicas/` o `/normas/`
2. Usa Elementor con diseño claro
3. Enlaza desde página de contacto y cada apartamento

---

### M4: Sin enlaces a perfiles externos (Booking, Airbnb, Google)

**Problema:** No hay visible que estes en Booking.com, Airbnb, o Google. Sin reseñas de terceros.

**Impacto:** Autoridad baja. Clientes no confían en sitios desconocidos.

**Solución:**

1. **Google Business Profile:**
   - Ve a [google.com/business](https://google.com/business)
   - Crea/reclama tu negocio
   - Rellena: nombre, dirección, teléfono, fotos, horarios
   - Google te dará un enlace para el sitio

2. **Booking.com / Airbnb:**
   - Si tienes perfil, copia el enlace
   - Añade en el pie de página o barra lateral:
   ```html
   <a href="https://www.booking.com/hotel/es/...">Ver en Booking</a>
   <a href="https://www.airbnb.com/rooms/...">Ver en Airbnb</a>
   <a href="https://maps.google.com/...">Google Maps</a>
   ```

3. En pie de página, añade sección "Encuéntranos en":
   - Booking ⭐⭐⭐⭐⭐
   - Airbnb ⭐⭐⭐⭐⭐
   - Google Maps ⭐⭐⭐⭐⭐

---

### M5: Imágenes del sitemap son miniaturas (150×150px)

**Problema:** El sitemap declara imágenes de 150×150 en lugar de tamaño completo. Google Images no las indexa bien.

**Solución:**

1. WordPress Admin > Yoast SEO > Integraciones > Google Search Console
2. Busca "XML Sitemaps"
3. Opción: Desactiva sitemap de imágenes (Yoast no lo regenerará)
4. **O** edita manualmente en Yoast > Configuración > XML Sitemaps > Imágenes → desactiva

---

### M6: Categoría "sin-categoria" en sitemap (contenido vacío)

**Problema:** `/category/sin-categoria/` está en sitemap pero es una página vacía. Consume crawl budget.

**Solución:**

1. WordPress Admin > Yoast SEO > Búsqueda > Apariencia
2. Busca "Categorías" o "Categories"
3. Cambia "Mostrar en resultados de búsqueda" → **No (noindex)**
4. Guarda

---

### M7: Páginas legales en sitemap (sin valor de búsqueda)

**Problema:** Política privacidad, aviso legal, política cookies **están en el sitemap**. Nadie busca esto, solo consume crawl budget.

**Solución:**

1. WordPress Admin > Yoast SEO > Búsqueda > Apariencia
2. Para cada página (Privacy, Legal, Cookies):
   - Edita la página
   - Yoast SEO > "Avanzado" → Cambiar a **noindex**
   - Guarda

Esto las quitará del sitemap automáticamente.

---

### M8: Imagen de fondo de CTA = 243 KB (demasiado grande)

**Problema:** El archivo `w1.jpg` (243.6 KB) es enorme. Ralentiza el sitio.

**Solución:**

1. **Descarga la imagen original**
2. Abre en Photoshop / GIMP / [TinyPNG.com](https://tinypng.com)
3. **Redimensiona a 1200px ancho máximo**
4. **Exporta como WebP** (mejor compresión que JPG)
5. **Objetivo:** <60 KB (idealmente 40-50 KB)
6. Reemplaza la imagen en Elementor

**Herramienta online fácil:** [Squoosh.app](https://squoosh.app)
- Arrastra la imagen
- Baja calidad JPG a 75-80
- Exporta WebP
- Descarga

---

### M9: Google Fonts sin preconnect (conexión lenta)

**Problema:** Código actual: `dns-prefetch` solo (busca el DNS). Falta `preconnect` (establece conexión completa).

**Solución:**

1. WordPress Admin > Astra > Typography
2. Busca configuración de Google Fonts
3. O ve a LiteSpeed Cache > Page Optimization
4. Busca "DNS Prefetch" o "Preconnect"
5. **Reemplaza:**
```html
<!-- Antes (lento) -->
<link rel='dns-prefetch' href='//fonts.googleapis.com' />

<!-- Después (rápido) -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

---

### M10: 3 imágenes sin ancho/alto (shift visual)

**Problema:** Las fotos de testimonios (Ricardo, Elena, África) no tienen `width` y `height`. Causa que la página "tiemble" al cargar.

**Solución:**

1. Elementor > Edita cada testimonial
2. Selecciona la imagen
3. En "Avanzado" busca "Dimensiones" o "Size"
4. Fija:
   - Avatar Ricardo: 285×280 px
   - Avatar Elena: 128×128 px
   - Avatar África: 128×128 px
5. Guarda

---

### M11: Botones demasiado pequeños en móvil

**Problema:** El botón "CONTACTA", botones de cookies, y logo son <48px de alto. Difíciles de tocar.

**Solución (Accesibilidad):**

1. Elementor > Edita cada botón
2. En "Tamaño" o "Dimensions" → mínimo **48×48px**
3. Especialmente el logo — actualmente solo 17px de alto

---

### M12: og:description demasiado largo (1.800+ caracteres)

**Problema:** El contenido completo de la página se copia como `og:description`. Redes sociales solo muestran 155 caracteres.

**Solución:**

1. WordPress Admin > Editar página inicio
2. Yoast SEO > Social > Facebook
3. Reescribe a máximo 155 caracteres con un "hook":

**Ejemplo:**
```
¿Buscas descanso en playa? Apartamentos acogedores en Puerto de Sagunto
con WiFi, parking y terraza. Gestionados personalmente por Gloria y Álvaro.
¡Reserva ya!
```

---

### M13: robots.txt tiene sitemap duplicada

**Problema:**
```
Sitemap: https://encalmavacacional.com/sitemap_index.xml   ← Línea 1 (correcta)
...
Sitemap: http://encalmavacacional.com/sitemap_index.xml    ← Línea 8 (HTTP, mala)
```

**Solución:**

1. FTP / Gestor de archivos
2. Descarga `/robots.txt`
3. Elimina la línea con `http://`
4. Guarda y resubelo

O si usas WordPress:

1. WordPress Admin > LiteSpeed Cache > Robtos.txt
2. Edita y elimina la línea HTTP
3. Guarda

---

## 🟢 PRIORIDAD BAJA (Cuando tengas tiempo)

### L1: URL `/contact/` en inglés (sitio en español)

Cambiar a `/contacto/`. Requiere:
1. Cambiar slug en WordPress
2. Crear redirección 301 de `/contact/` → `/contacto/`

---

### L2: WooCommerce instalado pero no usado

Si no vendes productos online, desinstalalo. Añade CSS/JS innecesario a cada página.

1. WordPress Admin > Plugins > WooCommerce
2. Desactiva > Elimina

---

### L3: Desactiva Microdata de Astra (genera etiquetas inválidas)

Astra auto-inyecta `WPHeader`, `WPFooter` que no son tipos Schema.org válidos.

1. WordPress Admin > Astra > Performance
2. Busca "Microdata"
3. Desactiva

---

## ✅ Lo Que Está Bien

- ✅ HTTPS funciona (cuando redirige desde HTTP)
- ✅ HTTP/2 + HTTP/3 (QUIC)
- ✅ LiteSpeed Cache activo (TTFB 49ms)
- ✅ Brotli compression
- ✅ Yoast SEO configurado
- ✅ Contenido genuinamente escrito por humanos
- ✅ URLs semánticas (apartamento-vacacional-...)
- ✅ Diseño responsive (sin scroll horizontal)
- ✅ GDPR compliant
- ✅ Licencias VUT visibles

---

## 📋 Plan de Acción: Semana por Semana

### SEMANA 1

- [ ] C1: Añade redirección 301 HTTP → HTTPS
- [ ] C2: Añade headers de seguridad (HSTS, X-Frame-Options, etc.)
- [ ] C3: Desactiva plugin SureRank, mantén Yoast
- [ ] C4: Corrige enlaces rotos del menú (apartamentos)
- [ ] H1: Reescribe título de página inicio (con palabras clave)
- [ ] H2: Consolida H1 tags (una sola H1 clara)

### SEMANA 2

- [ ] C5 + H3: Añade JSON-LD de LodgingBusiness + AggregateRating
- [ ] H8: Fuerza HTTPS en todas las URLs (WordPress settings + find & replace)
- [ ] H4: Mueve banner de cookies a "bottom fixed" (no intrusivo)
- [ ] H10: Añade H1 a páginas de apartamentos
- [ ] H5: Añade preload link para imagen héroe

### SEMANA 3

- [ ] H6: Habilita JS deferred en LiteSpeed Cache
- [ ] H7: Reemplaza og:image con foto de apartamento
- [ ] H9: Expande página "Somos EnCalma" a 600+ palabras + fotos
- [ ] M1: Escribe meta descriptions optimizadas para todas las páginas clave

### SEMANA 4 en adelante

- [ ] M2: Crea página de precios/tarifas
- [ ] M3: Crea página de políticas de huéspedes
- [ ] M4: Enlaza Google Business Profile, Booking, Airbnb
- [ ] M5-M13: Resuelve items de prioridad media

---

## 🔍 Cómo Verificar los Cambios

### Después de cada cambio, verifica:

**1. Google Search Console:**
- Ve a [search.google.com/search-console](https://search.google.com/search-console)
- URL Inspection
- Introduce tu URL
- Haz clic "Solicitar indexación"
- Espera 24-48h

**2. Google PageSpeed Insights:**
- Ve a [pagespeed.web.dev](https://pagespeed.web.dev)
- Introduce tu URL
- Mira cambios en LCP, CLS, INP

**3. Schema Testing:**
- Ve a [schema.org/validator](https://validator.schema.org/)
- Pega tu URL o HTML
- Verifica que no haya errores

**4. Lighthouse en Chrome:**
- Presiona F12 (Dev Tools)
- Tab "Lighthouse"
- Genera reporte
- Mira cambios en Performance, SEO, Accessibility

---

## 📞 Ayuda y Contacto

**Si tienes problemas:**
1. Contacta a tu hosting/proveedor
2. Comparte los pasos que intentaste
3. Pasa los resultados de error

**Recursos útiles:**
- [Documentación Yoast SEO](https://yoast.com/help/)
- [LiteSpeed Cache Docs](https://docs.litespeedtech.com/lscache/lscwp/)
- [Google Search Console Help](https://support.google.com/webmasters/)
- [Schema.org](https://schema.org/)

---

**Generado:** 24 de febrero de 2026 | **Auditoría completa:** 6 análisis en paralelo
