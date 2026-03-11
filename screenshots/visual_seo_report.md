# Visual SEO & Mobile Rendering Report
**Site:** https://encalmavacacional.com/
**Date:** 2026-02-24
**Tool:** Playwright / Chromium

---

## Screenshots Captured

| Viewport | Above-the-Fold | Full Page |
|---|---|---|
| Desktop 1920x1080 | desktop_above_fold.png | desktop_full_page.png |
| Laptop 1366x768 | laptop_above_fold.png | laptop_full_page.png |
| Tablet 768x1024 | tablet_above_fold.png | tablet_full_page.png |
| Mobile 375x812 | mobile_above_fold.png | mobile_full_page.png |

---

## 1. Above-the-Fold Content Analysis (SEO Value)

### What is visible without scrolling

**Desktop (1920x1080):**
- Full hero image (beach scene, Mediterranean) renders immediately — strong emotional hook.
- Logo (EnCalma Vacacional) centered in hero — highly visible.
- H1 text "estancias / en calma" renders within the hero at ~337px from top.
- Tagline "El lugar perfecto para desconectar y disfrutar de tus vacaciones." is visible.
- H2 "Encuentra tu escapada perfecta" appears at ~590px from top — just below the fold.
- Cookie consent banner occupies the bottom-right quadrant and obscures part of the hero.
- No booking/reservation CTA button is visible above the fold.

**Mobile (375x812):**
- Logo, H1 ("estancias / en calma") and tagline are visible.
- The cookie consent popup takes over approximately 50% of the visible screen height.
- H2 "Encuentra tu escapada perfecta" is cut off by the cookie banner.
- No actionable booking CTA is reachable without dismissing the cookie banner.

### SEO Assessment — Above the Fold

| Signal | Status | Notes |
|---|---|---|
| H1 visible ATF | PASS | "estancias / en calma" — but split across two H1 tags |
| Primary CTA ATF | FAIL | No reservation/booking button visible ATF on any viewport |
| Key value prop ATF | PARTIAL | Tagline present but generic; no location keyword ATF |
| Hero image loads | PASS | Mediterranean beach imagery loads correctly |
| Keyword in H1 | FAIL | H1 contains brand tone ("en calma") not search intent keywords |

---

## 2. Title Tag & Meta Data

| Element | Value | Assessment |
|---|---|---|
| Title | "Home - ENCALMA VACACIONAL" | POOR — Generic "Home" prefix, no location or product keywords |
| Meta Description | "estancias en calma El lugar perfecto para desconectar..." | POOR — Not a well-formed sentence; missing location & action keywords |
| Meta Keywords | None | NEUTRAL — Not used by Google; acceptable |
| og:title | "Home - ENCALMA VACACIONAL" | POOR — Same weak title propagated to social sharing |
| og:description | Full page content dump | POOR — 1,800+ characters; will be truncated on social shares |
| og:image | logo_encalma.webp | POOR — Logo used instead of a compelling property photo |

### Recommended Title
```
Apartamentos Vacacionales en Puerto de Sagunto | EnCalma Vacacional
```

### Recommended Meta Description
```
Alquila nuestros apartamentos vacacionales frente al mar en Puerto de Sagunto.
Trato personal, alma mediterránea y descanso garantizado. Reserva ahora.
```

---

## 3. H1 / Heading Hierarchy

### H1 Tags Found (3 total — CRITICAL ISSUE)
1. "estancias" — in hero
2. "en calma" — in hero (this is one logical phrase split into two H1 elements)
3. "Reserva tu escapada perfecta" — in the bottom CTA section

**Issue:** Multiple H1 tags dilute SEO signal. The hero H1 is split into two separate `<h1>` elements for stylistic reasons (different font sizes), which is technically two H1s. There is also a third H1 deeper on the page.

**Issue:** None of the H1 tags contain target search keywords such as "apartamentos vacacionales", "Puerto de Sagunto", or "alquiler vacacional".

### H2 Tags Found
1. "Encuentra tu escapada perfecta"
2. "Nuestros servicios"
3. (empty H2 detected)
4. "Estancias en calma"

**Issue:** One empty `<h2>` tag detected — this is dead markup that could confuse crawlers.
**Issue:** H2s are also brand-tone rather than keyword-targeted.

---

## 4. Structured Data

Three JSON-LD blocks detected:

| Schema Type | Source | Status |
|---|---|---|
| WebPage | WordPress/Yoast SEO plugin | PASS — Good basic markup |
| WebSite (with SearchAction) | WordPress/Yoast SEO plugin | PASS |
| Product | Trustindex (reviews widget) | PARTIAL — Trustindex auto-generates Product schema; not ideal schema type for accommodation |

### Missing Structured Data (HIGH PRIORITY)
- No `LodgingBusiness` or `VacationRental` schema — Google uses this for rich results in travel searches.
- No `ApartmentComplex` or `Accommodation` type.
- No `Review` / `AggregateRating` in site-native schema (only via Trustindex widget).
- No `LocalBusiness` schema with address, phone, GPS coordinates.

### Recommended Addition
```json
{
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "EnCalma Vacacional",
  "url": "https://encalmavacacional.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Puerto de Sagunto",
    "addressCountry": "ES"
  },
  "telephone": "+34653398081",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "43"
  }
}
```

---

## 5. Cookie Consent / Intrusive Interstitials

### Finding: MEDIUM-HIGH SEVERITY

The cookie consent popup ("Gestionar consentimiento") is displayed immediately on page load on ALL viewports and is rendered as an overlay that:

- On **desktop/laptop**: appears bottom-right, partially covering the hero CTA area and obscuring the "Encuentra tu escapada perfecta" H2.
- On **laptop (1366px)**: covers the tagline and partially hides the primary H2.
- On **tablet (768px)**: takes up the bottom ~50% of the visible viewport, hiding all content below the hero heading.
- On **mobile (375px)**: occupies approximately 50% of the screen from below mid-page, rendering the H2 CTA "Encuentra tu escapada perfecta" completely invisible.

### Google's Stance
Google's Page Experience guidelines penalize "intrusive interstitials" that make content less accessible. A consent banner that covers significant content on first load — especially on mobile — can negatively affect:
- Core Web Vitals (Interaction to Next Paint)
- User engagement signals (bounce rate increase)
- Crawl rendering (Googlebot may see the overlay state)

### Recommendation
- Move the cookie banner to a **bottom bar** (fixed, non-blocking) rather than a centered overlay.
- Ensure the banner does not overlap the primary H1/H2/CTA elements on any viewport.
- Pre-accept functional cookies to avoid blocking experience for returning visitors.

---

## 6. Mobile Responsiveness

### Horizontal Scroll
| Viewport | Horizontal Scroll |
|---|---|
| Desktop | None |
| Laptop | None |
| Tablet | None |
| Mobile | None |

No horizontal overflow detected — PASS.

### Layout Observations

**Mobile (375px) — Full Page Review:**
- Navigation collapses to hamburger menu — correctly implemented.
- Hero image scales responsively — PASS.
- Text "estancias / en calma" remains readable and large — PASS.
- Body font size: 16px — meets minimum readability threshold — PASS.
- Apartment card section stacks vertically — PASS (single column on mobile).
- "About Us" (Gloria y Alvaro) section is readable.
- Footer with phone numbers is readable.

**Tablet (768px) — Full Page Review:**
- Hamburger menu used at tablet breakpoint — this is an early breakpoint for a tablet; could show full nav.
- Cookie banner takes full width and pushes content visibility down significantly.
- Service icons and text stack well.
- Two-column apartment card layout renders correctly.

### Touch Target Sizes (Mobile)

| Element | Width | Height | Status |
|---|---|---|---|
| "Aceptar" button (cookie) | 335px | 45px | FAIL — 3px below 48px minimum |
| "Denegar" button (cookie) | 335px | 45px | FAIL — 3px below 48px minimum |
| "Política de cookies" link | 106px | 36px | FAIL — 12px below minimum |
| "Política de privacidad" link | 125px | 36px | FAIL — 12px below minimum |
| "Aviso legal" link | 59px | 36px | FAIL — 12px below minimum |
| "CONTACTA" CTA button | 131px | 44px | FAIL — 4px below minimum |
| Logo link | 50px | 17px | CRITICAL FAIL — far too small |

Google's Material Design and Apple HIG both recommend minimum 48x48px touch targets. Multiple elements fail this standard, with cookie consent buttons ironically being slightly undersized despite being the most critical mobile interaction on page load.

---

## 7. Images & Text Alternatives

### Image Inventory
- Total images detected: 24
- Images with missing alt text: 1

### Missing Alt Detail
- The only missing alt is a 1x1 base64 SVG placeholder (likely a lazy-load spacer). This is low-severity as it contains no visual information. Adding `alt=""` (empty string) to mark it as decorative would be best practice.

### Images That Need Strong Alt Text Verification

From visual review of screenshots, the following visible images should have descriptive, keyword-rich alt text:

| Image | Recommended Alt Text |
|---|---|
| Hero beach background | "Vista de la playa de Puerto de Sagunto desde los apartamentos EnCalma" |
| "El Atico" apartment | "Apartamento vacacional El Atico - EnCalma Vacacional Puerto de Sagunto" |
| "La Playa" apartment | "Apartamento vacacional La Playa con vistas al mar - Puerto de Sagunto" |
| Logo | "EnCalma Vacacional - Apartamentos en Puerto de Sagunto" |
| og:image | Should be replaced with a property photo, not the logo |

The og:image currently uses the logo (`logo_encalma.webp`). Social shares and Google Discover cards will show the logo instead of an inviting property photo — a significant missed opportunity for visual engagement.

---

## 8. Visual Hierarchy & UX Signals

### Positive Signals
- Clean, aesthetic Mediterranean design — strong brand identity.
- Trust badges ("Excelente Criticas / Verificado por Trustindex") visible in corner — social proof.
- Star rating section ("Que dicen de nosotros?") builds credibility.
- WhatsApp floating button gives direct contact channel — high conversion signal.
- Personal "About Us" section with names/photos builds trust for a personal hosting business.
- Phone numbers visible in footer.
- Instagram link in footer.

### Concerns

**No booking/reservation CTA above the fold:**
The most critical conversion action — booking an apartment — requires scrolling past the hero, past the services section, past the reviews, and into a lower CTA section. The "CONTACTA" button only appears near the bottom of the page. This directly reduces conversion rates.

**The "Encuentra tu escapada perfecta" H2 is not a CTA:**
It reads as a headline but has no button or form associated with it. Users have no path to act on it.

**Apartment cards are missing direct booking links:**
The apartment cards ("El Atico", "La Playa") show on the desktop full-page view but the apartment names ("EnCalma Vacacional El Atico", "EnCalma Vacacional La Playa") appear as text captions. From the laptop full page, the cards appear with text descriptions but it is unclear if they link to detail pages or booking flows.

**"Gestionar consentimiento" CTA hierarchy confusion:**
On mobile, the first CTA a user sees is cookie consent, not a property booking prompt. The "Aceptar" button visually competes with and takes priority over the "Encuentra tu escapada perfecta" heading.

**Services section uses generic icons:**
The three service bullets (location pin, house icon, person icon) use generic icon-font glyphs. These are not indexed by Google Images and provide no visual differentiation.

---

## Summary: Findings by Severity

### CRITICAL
| # | Issue |
|---|---|
| C1 | Page title "Home - ENCALMA VACACIONAL" is non-descriptive; missing location and product keywords |
| C2 | Three H1 tags on one page; none contain target search keywords |
| C3 | No LodgingBusiness / VacationRental structured data schema |
| C4 | No booking/reservation CTA visible above the fold on any viewport |

### HIGH
| # | Issue |
|---|---|
| H1 | Cookie consent overlay blocks 40-50% of mobile viewport; potential interstitial penalty |
| H2 | og:image uses logo instead of property photograph |
| H3 | og:description is 1,800+ chars (raw content dump); will not display correctly in social sharing |
| H4 | Meta description lacks location keywords and action verbs |
| H5 | No LocalBusiness schema with address, GPS, phone for local SEO |

### MEDIUM
| # | Issue |
|---|---|
| M1 | Touch targets below 48px: cookie buttons (45px), CONTACTA link (44px), legal links (36px), logo link (17px) |
| M2 | One empty `<h2>` element in markup |
| M3 | H2 headings are brand-tone, not keyword-targeted |
| M4 | Apartment cards lack visible booking/detail links above fold |
| M5 | No AggregateRating schema natively on site (only via third-party Trustindex widget) |

### LOW
| # | Issue |
|---|---|
| L1 | 1x1 SVG placeholder image missing alt="" attribute (decorative; low impact) |
| L2 | No meta keywords (not a ranking factor but confirms no keyword strategy is documented) |
| L3 | Tablet viewport (768px) uses hamburger menu — could display horizontal nav |
| L4 | og:title mirrors the page title verbatim; no social-specific optimization |

---

## Priority Action Plan

1. **Rewrite the title tag** to include "Apartamentos Vacacionales Puerto de Sagunto".
2. **Consolidate H1 tags** — use a single H1 with brand + keyword (e.g., "Apartamentos Vacacionales en Puerto de Sagunto").
3. **Add LodgingBusiness JSON-LD** with address, phone, and aggregateRating.
4. **Add a booking/contact CTA button inside the hero section** — visible ATF on all viewports.
5. **Change the cookie banner** from a centered overlay to a bottom-fixed bar (non-blocking).
6. **Replace og:image** with a high-quality interior or exterior property photo.
7. **Rewrite meta description** with keywords, location, and a call to action under 160 characters.
8. **Increase touch target heights** for cookie buttons and the CONTACTA link to minimum 48px.
9. **Fix the empty H2** in the markup.
10. **Add descriptive alt text** to all property and hero images with location keywords.
