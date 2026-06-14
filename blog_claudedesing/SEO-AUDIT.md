# Auditoría SEO — Blog enCalma (montaje técnico)

> Estado: análisis hecho, **pendiente de implementar**. No es sobre el copy, sino sobre cómo está montado el blog.
> Aplica a las cuatro carpetas (`blog`, `blog_opus`, `blog_claudedesing`) porque comparten la misma lógica.
> Fecha: 2026-06-14.

## Problema de fondo: renderizado en cliente (CSR)

Todo el contenido (lista de artículos, cuerpo, categorías) se trae con JavaScript desde Prismic **en el navegador**. El HTML servido por `server.js` llega vacío:

```html
<div class="post-list" id="articlesContainer"></div>   <!-- vacío hasta que corre el JS -->
<section class="article-body" id="articleBody"></section>
```

Para un blog (cuyo valor SEO es que el contenido se indexe y se comparta) esto es el fallo principal:

- Googlebot ejecuta JS en dos olas, con retraso y sin garantías. Parte con desventaja.
- WhatsApp, Facebook, Twitter/X, LinkedIn **no ejecutan JS** → previews al compartir salen vacías o con la plantilla genérica (sin título, imagen ni descripción). Crítico en un negocio vacacional que se comparte por redes/WhatsApp.

## Problemas por severidad

### Críticos
1. **CSR sin SSR/SSG.** Pre-renderizar el HTML (Next.js/Astro/11ty con Prismic, o build estático).
2. **Sin Open Graph / Twitter Cards.** Faltan `og:title`, `og:image`, `og:description`, `twitter:card`.
3. **Meta por artículo puestas con JS.** `article.html` no tiene `<meta name="description">`; el `<title>` se fija con `document.title` después de cargar → crawlers sin JS no lo ven. Todos los artículos comparten el mismo `<title>` base.
4. **Soft 404.** Slug inexistente devuelve HTTP 200 con el cascarón de `article.html`. Google lo indexa como página válida.

### Medios
5. **Sin datos estructurados (JSON-LD).** Falta schema `BlogPosting`/`Article` (fecha, autor, imagen) y `BreadcrumbList` (las migas son solo visuales).
6. **Sin `sitemap.xml` ni `robots.txt`.** Descubribilidad depende de que el crawler renderice y siga enlaces.
7. **Sin `<link rel="canonical">`.** Riesgo de duplicados con URLs `?slug=`.
8. **URLs con query string + `.html`**: `article.html?slug=castillo-de-sagunto` en vez de `/blog/castillo-de-sagunto`.
9. **Imágenes clave como `background-image` CSS** (portada del artículo, miniaturas de relacionados): invisibles para Google Imágenes y sin `alt`.

### Menores
10. **Cascada de peticiones secuenciales**: master ref → documentos (→ relacionados). LCP tardío. Master ref no se cachea.
11. **Jerarquía de encabezados con salto**: en el artículo `h1` → `h3` (los `heading2` de Prismic se mapean a `<h3>`). Debería `h1`→`h2`.
12. **Sin `hreflang`** pese a tener locales ES/EN.

## Lo que ya está bien (no tocar)
- HTML semántico correcto (`article`, `nav`, `aside`, `main`, `header`, `footer`).
- Enlaces internos como `<a href>` reales (crawlables), no `onclick`.
- Imágenes de la lista con `alt` + `width`/`height` + `loading="lazy"` y optimización vía CDN Prismic.
- `lang="es"`; en `blog_claudedesing`, meta description en el índice.

## Veredicto
Visualmente `blog_claudedesing` está bien; en SEO técnico la base CSR lo limita. El salto grande es pre-renderizar el contenido (SSG/SSR) + meta dinámicas + OG + JSON-LD + sitemap + 404 reales.

## Plan de acción (elegir nivel)

### Opción A — Rápido, sin cambiar de stack (sobre el `server.js` Node actual)
Objetivo: ~80% de la mejora sin reescribir.
- [ ] SSR de meta por página: el servidor detecta `?slug=`, consulta Prismic y inyecta `<title>`, `<meta description>`, OG y Twitter Cards en el HTML antes de enviarlo.
- [ ] Inyectar JSON-LD `BlogPosting` + `BreadcrumbList` desde el servidor.
- [ ] 404 reales: slug inexistente → HTTP 404.
- [ ] `sitemap.xml` dinámico (generado desde Prismic) + `robots.txt`.
- [ ] `<link rel="canonical">` por página.
- [ ] URLs limpias: rutear `/blog/:slug` → servir article.html (mantener `?slug=` como fallback o redirigir 301).
- [ ] Cachear el master ref de Prismic en el servidor.

### Opción B — Bien hecho (migración)
- [ ] Migrar a **Astro** o **Next.js** con Prismic.
- [ ] Generación estática (SSG) de índice + cada artículo.
- [ ] Meta/OG/JSON-LD/sitemap/canonical nativos.
- [ ] Imágenes con `<img>` (no background) + alt, responsive.

## Punto donde retomar
Decidir A o B. Si A: empezar por el SSR de meta+OG en `server.js` de `blog_claudedesing`, que es lo de mayor impacto. El resto del montaje (lógica Prismic, diseño Guía Lateral) ya está terminado y validado (server arranca, sirve HTTP 200, JS sin errores de sintaxis).
