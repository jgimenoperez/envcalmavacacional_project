# Schema.org Audit Report — encalmavacacional.com
**Audit date:** 2026-02-24
**Site:** https://encalmavacacional.com/
**Business type:** Vacation rental apartments (Puerto de Sagunto, Valencia, Spain)
**CMS:** WordPress + Astra theme + Elementor + Yoast SEO (Block 1) + RankMath/custom plugin (Block 2)

---

## 1. DETECTION RESULTS

### JSON-LD Blocks Found: 2 (Homepage)

| Block | Source | Types Present |
|-------|--------|---------------|
| Block 1 | Yoast SEO plugin | WebPage, ImageObject, BreadcrumbList, WebSite, Organization |
| Block 2 | Custom/RankMath plugin | WebSite, WebPage, Organization, BreadcrumbList, SearchAction |

### Microdata Found: 12 attributes (Astra theme)

| Element | itemtype |
|---------|----------|
| `<body>` | https://schema.org/WebPage |
| `<header>` | https://schema.org/WPHeader |
| `<div.site-branding>` (x2) | https://schema.org/Organization |
| `<nav>` (x3) | https://schema.org/SiteNavigationElement |
| `<article>` | https://schema.org/CreativeWork |
| `<footer>` | https://schema.org/WPFooter |

### RDFa Found: 20 attributes
All are Open Graph `<meta property="og:...">` tags — not Schema.org RDFa. No true RDFa vocabulary in use.

### Apartment Pages (El Atico, La Playa): Same 2-block pattern, no apartment-specific schema.

---

## 2. VALIDATION RESULTS

### Block 1 (Yoast SEO)

| Check | Status | Detail |
|-------|--------|--------|
| JSON syntax valid | PASS | Parses correctly |
| @context = https://schema.org | PASS | Correct |
| @types are valid | PASS | WebPage, ImageObject, BreadcrumbList, WebSite, Organization |
| No deprecated types | PASS | None used |
| Absolute URLs | FAIL | See issues below |
| Required properties present | PARTIAL | Organization missing key properties |

**Issues in Block 1:**

- **[HIGH] HTTP URL — Organization logo.url:** Uses `http://encalmavacacional.com/...` instead of `https://`
- **[HIGH] HTTP URL — Organization logo.contentUrl:** Same http:// problem
- **[MEDIUM] HTTP URL — WebPage thumbnailUrl:** Uses `http://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp` — the logo image is being set as the page's primary thumbnail; a property page photo would be more appropriate
- **[MEDIUM] Organization missing telephone:** Two phone numbers are visible in the HTML (`+34653399081`, `+34618874229`) but neither appears in schema
- **[MEDIUM] Organization missing address:** PostalAddress not declared despite location being a key ranking signal for local search
- **[MEDIUM] Organization missing sameAs:** Instagram (`https://www.instagram.com/encalmavacacional/`) is linked in HTML but not referenced in schema
- **[LOW] Organization missing email:** No email in schema (add if publicly listed)

### Block 2 (Custom/RankMath plugin)

| Check | Status | Detail |
|-------|--------|--------|
| JSON syntax valid | PASS | Parses correctly |
| @context = https://schema.org | PASS | Correct |
| @types are valid | PASS | |
| No deprecated types | PASS | |
| Absolute URLs | FAIL | SearchAction target uses http:// |
| URL trailing space | FAIL | Organization.url has trailing space |
| URL trailing slash | FAIL | WebPage.url missing trailing slash |

**Issues in Block 2:**

- **[HIGH] HTTP URL — SearchAction target:** `"target": "http://encalmavacacional.com/?s={search_term_string}"` — should be https://
- **[HIGH] Organization URL has trailing space:** `"url": "https://encalmavacacional.com/ "` — the trailing space will cause URL mismatch and may prevent Google from resolving the @id
- **[MEDIUM] WebPage URL missing trailing slash:** `"url": "https://encalmavacacional.com"` — canonical uses trailing slash, creating inconsistency
- **[MEDIUM] SearchAction query-input old format:** String `"required name=search_term_string"` is the deprecated format; should use `PropertyValueSpecification` object
- **[MEDIUM] Organization missing telephone, address, sameAs:** Same as Block 1
- **[LOW] Organization logo is favicon:** `favicon.png` (32x32px) used as logo — Google requires minimum 112x112px for logo rich results

### Microdata Issues

| Check | Status | Detail |
|-------|--------|--------|
| WPHeader type | WARN | Not a valid Schema.org type (Astra theme artifact) |
| WPFooter type | WARN | Not a valid Schema.org type (Astra theme artifact) |
| WebPage declared 3x | WARN | body (Microdata) + Block 1 (JSON-LD) + Block 2 (JSON-LD) — redundant |
| Organization declared 3x | WARN | site-branding div (Microdata) + Block 1 + Block 2 — redundant |
| CreativeWork on article | WARN | Too generic for a vacation rental homepage |

**Google's recommendation:** Use JSON-LD exclusively. Microdata from themes creates noise and conflicting declarations. Disable Astra's microdata output if possible (Settings > Astra > Schema Markup).

---

## 3. DUPLICATE / CONFLICTING SCHEMA

Both Block 1 and Block 2 declare the same `@id` for WebSite and Organization:

```
WebSite @id: https://encalmavacacional.com/#website  (declared in Block 1 AND Block 2)
Organization @id: https://encalmavacacional.com/#organization  (declared in Block 1 AND Block 2)
```

While JSON-LD's `@id` system theoretically allows merging, **having two conflicting definitions of the same entity with different property values causes unpredictable parser behavior.** For example:

- Block 1 Organization logo = full 1024x1024 image (http://)
- Block 2 Organization logo = favicon.png (32x32)

Google's crawler must choose one or merge them incorrectly. **Eliminate Block 2 or consolidate into a single block.**

---

## 4. MISSING SCHEMA OPPORTUNITIES

| Schema Type | Priority | Impact | Where to Add |
|-------------|----------|--------|--------------|
| **LodgingBusiness** | CRITICAL | Identifies the site as a vacation rental business to Google | Homepage |
| **Accommodation** | CRITICAL | Enables property-level rich results for each apartment | Each apartment page |
| **AggregateRating** | HIGH | Enables star rating display in SERPs | Homepage + each apartment page |
| **Person** (Gloria & Álvaro) | MEDIUM | Adds trust signals for hosts | About section / homepage |
| **BreadcrumbList** (apartment pages) | MEDIUM | Navigation context for apartment pages | Each apartment page (Block 2 has it but it's in the custom plugin's format with conflicts) |

**Not recommended (deprecated/restricted):**
- FAQ schema — restricted to government and healthcare sites only (August 2023)
- HowTo schema — rich results removed September 2023
- SpecialAnnouncement — deprecated July 2025
- CourseInfo, LearningVideo — retired June 2025

---

## 5. RICH RESULT ELIGIBILITY

| Rich Result Type | Currently Eligible | After Fixes |
|-----------------|-------------------|-------------|
| Sitelinks Searchbox (WebSite + SearchAction) | PARTIAL — http:// URL breaks it | YES |
| Breadcrumbs | YES (Block 1 is correct) | YES |
| Organization Knowledge Panel | PARTIAL — http:// logos, missing fields | YES |
| Vacation Rental / Lodging | NO — no LodgingBusiness or Accommodation schema | YES |
| Review snippets | NO — reviews in HTML but no Review schema | POSSIBLE (with AggregateRating) |
| Local Business panel | NO — no LocalBusiness/LodgingBusiness schema | YES |

---

## 6. CORRECTED & NEW JSON-LD CODE

### FIX A — Replace Block 2 entirely AND fix Block 1's Organization
(Consolidate into one authoritative Organization + WebSite block)

Add this as the single custom schema block, and configure Yoast to stop outputting its own Organization/WebSite (use Yoast's "Organization" settings to fill in details there instead):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://encalmavacacional.com/#website",
      "url": "https://encalmavacacional.com/",
      "name": "ENCALMA VACACIONAL",
      "description": "Apartamentos Vacacionales Puerto de Sagunto",
      "inLanguage": "es",
      "publisher": { "@id": "https://encalmavacacional.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://encalmavacacional.com/?s={search_term_string}"
        },
        "query-input": {
          "@type": "PropertyValueSpecification",
          "valueRequired": true,
          "valueName": "search_term_string"
        }
      }
    },
    {
      "@type": "Organization",
      "@id": "https://encalmavacacional.com/#organization",
      "name": "ENCALMA VACACIONAL",
      "alternateName": "EnCalma Vacacional",
      "url": "https://encalmavacacional.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://encalmavacacional.com/#/schema/logo/image/",
        "url": "https://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp",
        "contentUrl": "https://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp",
        "width": 768,
        "height": 215,
        "caption": "ENCALMA VACACIONAL"
      },
      "image": { "@id": "https://encalmavacacional.com/#/schema/logo/image/" },
      "description": "Apartamentos vacacionales en Puerto de Sagunto con alma mediterránea.",
      "telephone": "+34653399081",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Puerto de Sagunto",
        "addressRegion": "Valencia",
        "addressCountry": "ES"
      },
      "sameAs": [
        "https://www.instagram.com/encalmavacacional/"
      ]
    }
  ]
}
```

### FIX B — NEW: LodgingBusiness + Reviews (Homepage)
Add this as a new `<script type="application/ld+json">` block in the homepage `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": "https://encalmavacacional.com/#business",
  "name": "EnCalma Vacacional",
  "alternateName": "ENCALMA VACACIONAL",
  "description": "Apartamentos vacacionales en Puerto de Sagunto con alma mediterránea. Viviendas acogedoras junto al mar, pensadas para desconectar y sentirte como en casa.",
  "url": "https://encalmavacacional.com/",
  "telephone": "+34653399081",
  "logo": {
    "@type": "ImageObject",
    "url": "https://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp",
    "width": 768,
    "height": 215
  },
  "image": "https://encalmavacacional.com/wp-content/uploads/2026/02/logo_encalma.webp",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto de Sagunto",
    "addressRegion": "Valencia",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.6667,
    "longitude": -0.2167
  },
  "priceRange": "$$",
  "sameAs": [
    "https://www.instagram.com/encalmavacacional/"
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire Acondicionado", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terraza", "value": true }
  ],
  "containsPlace": [
    {
      "@type": "Accommodation",
      "@id": "https://encalmavacacional.com/apartamento-vacacional-atico/#accommodation",
      "name": "EnCalma Vacacional El Ático",
      "url": "https://encalmavacacional.com/apartamento-vacacional-atico/",
      "description": "Luz, espacio, comodidad y amplitud para tu familia o amigos. 110 m², 3 habitaciones, 2 baños, terraza de 20m², parking incluido.",
      "numberOfRooms": 3,
      "occupancy": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 6 },
      "floorSize": { "@type": "QuantitativeValue", "value": 110, "unitCode": "MTK" }
    },
    {
      "@type": "Accommodation",
      "@id": "https://encalmavacacional.com/apartamento-vacacional-ciudamar/#accommodation",
      "name": "EnCalma Vacacional La Playa",
      "url": "https://encalmavacacional.com/apartamento-vacacional-ciudamar/",
      "description": "Desayuna con la salida del sol, come con la brisa del mar. 110 m², vistas al mar, piscina, 2 terrazas.",
      "numberOfRooms": 2,
      "occupancy": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 5 },
      "floorSize": { "@type": "QuantitativeValue", "value": 110, "unitCode": "MTK" }
    }
  ],
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Ricardo" },
      "reviewBody": "Salgo encantado, tanto con los anfitriones como con la casa y la ubicación volvería con los ojos cerrados.",
      "name": "Para repetir!!"
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Elena" },
      "reviewBody": "La casa estaba impecable y tenía muchos detalles. Hemos estado muy a gusto.",
      "name": "Gusto por los detalles"
    },
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "África" },
      "reviewBody": "Un apartamento precioso. Gloria y Álvaro super encantadores con unos detalles que son de agradecer. La playa está a 10 min andando, volveremos seguro.",
      "name": "Los mejores anfitriones"
    }
  ]
}
```

> **Note on AggregateRating:** To unlock star rating display in SERPs, add an `aggregateRating` property to the LodgingBusiness block. This requires a numeric average and review count. Obtain these from your Airbnb/Booking.com profiles or a WordPress review plugin. Example:
> ```json
> "aggregateRating": {
>   "@type": "AggregateRating",
>   "ratingValue": "5.0",
>   "reviewCount": "3",
>   "bestRating": "5",
>   "worstRating": "1"
> }
> ```

### FIX C — NEW: Accommodation Schema for El Ático page
Add to `/apartamento-vacacional-atico/` page `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Accommodation",
  "@id": "https://encalmavacacional.com/apartamento-vacacional-atico/#accommodation",
  "name": "EnCalma Vacacional El Ático",
  "description": "Vivienda ideal para familias o grupos de amigos. 110 m², 3 dormitorios (camas 150, 150 y 2x90), 2 baños completos, terraza de 20m² orientada a la playa, plaza de garaje con acceso directo. A 800 metros de la playa, a 30 minutos de Valencia.",
  "url": "https://encalmavacacional.com/apartamento-vacacional-atico/",
  "image": [
    "https://encalmavacacional.com/wp-content/uploads/2025/09/f6d709ee-8307-455a-8708-99b92d9f4ed9.jpeg"
  ],
  "numberOfRooms": 3,
  "numberOfBathroomsTotal": 2,
  "floorSize": { "@type": "QuantitativeValue", "value": 110, "unitCode": "MTK" },
  "occupancy": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 6 },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Plaza de Parking", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire Acondicionado", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terraza 20m²", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cuna Gratuita", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Lavavajillas", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cafetera de cápsulas", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Atención 24h", "value": true }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto de Sagunto",
    "addressRegion": "Valencia",
    "addressCountry": "ES"
  },
  "containedInPlace": { "@id": "https://encalmavacacional.com/#business" },
  "offers": {
    "@type": "Offer",
    "url": "https://encalmavacacional.com/apartamento-vacacional-atico/",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://encalmavacacional.com/#organization" }
  }
}
```

### FIX D — NEW: Accommodation Schema for La Playa (Ciudamar) page
Add to `/apartamento-vacacional-ciudamar/` page `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Accommodation",
  "@id": "https://encalmavacacional.com/apartamento-vacacional-ciudamar/#accommodation",
  "name": "EnCalma Vacacional La Playa",
  "description": "Disfruta de la verdadera libertad de vivir en la playa. 110 m², 2 dormitorios, vistas al mar, 2 terrazas, piscina comunitaria. Puerto de Sagunto, Valencia.",
  "url": "https://encalmavacacional.com/apartamento-vacacional-ciudamar/",
  "numberOfRooms": 2,
  "floorSize": { "@type": "QuantitativeValue", "value": 110, "unitCode": "MTK" },
  "occupancy": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 5 },
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Parking Comunal", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Aire Acondicionado", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Terraza con Vistas al Mar", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Piscina", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Cuna Gratuita", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Caja Fuerte", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Atención 24h", "value": true }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto de Sagunto",
    "addressRegion": "Valencia",
    "addressCountry": "ES"
  },
  "containedInPlace": { "@id": "https://encalmavacacional.com/#business" },
  "offers": {
    "@type": "Offer",
    "url": "https://encalmavacacional.com/apartamento-vacacional-ciudamar/",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "seller": { "@id": "https://encalmavacacional.com/#organization" }
  }
}
```

---

## 7. IMPLEMENTATION PRIORITY

| Priority | Action | Severity | File/Location |
|----------|--------|----------|---------------|
| 1 | Fix http:// to https:// in Organization logo (Yoast settings) | HIGH | Yoast SEO > Settings > Site Identity |
| 2 | Fix Organization URL trailing space in Block 2 | HIGH | Custom schema plugin |
| 3 | Fix SearchAction target http:// in Block 2 | HIGH | Custom schema plugin |
| 4 | Eliminate Block 2 entirely (deduplicate with Yoast Block 1) | HIGH | Remove custom plugin block |
| 5 | Add telephone + address + sameAs to Organization (via Yoast) | MEDIUM | Yoast SEO > Settings |
| 6 | Add LodgingBusiness schema (Fix B above) | CRITICAL | Homepage `<head>` |
| 7 | Add Accommodation schema to El Ático page (Fix C) | HIGH | Apartment page `<head>` |
| 8 | Add Accommodation schema to La Playa page (Fix D) | HIGH | Apartment page `<head>` |
| 9 | Add AggregateRating once review count is confirmed | MEDIUM | Homepage LodgingBusiness block |
| 10 | Disable Astra theme Microdata (WPHeader, WPFooter, etc.) | LOW | Astra theme settings |

---

## 8. VALIDATION TOOLS

After implementing fixes, validate using:

- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/
- **Google Search Console:** Enhancement reports under "Enhancements" section

---

*Report generated by Schema.org Markup Specialist Agent — 2026-02-24*
