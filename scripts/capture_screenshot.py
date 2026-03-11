"""
Visual SEO & Mobile Rendering Analysis Script
Site: https://encalmavacacional.com/
"""
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://encalmavacacional.com/"
SCREENSHOTS_DIR = "/mnt/c/MCP_CLAUDE/JOSE/NaranjaIT/En_Calma_Vacacional/screenshots"

VIEWPORTS = [
    {"name": "desktop",  "width": 1920, "height": 1080},
    {"name": "laptop",   "width": 1366, "height": 768},
    {"name": "tablet",   "width": 768,  "height": 1024},
    {"name": "mobile",   "width": 375,  "height": 812},
]


def capture(page, url, output_path, full_page=False):
    page.goto(url, wait_until="networkidle", timeout=30000)
    # Extra settle time for lazy images / animations
    time.sleep(2)
    page.screenshot(path=output_path, full_page=full_page)
    print(f"  Saved: {output_path}")


def extract_seo_data(page):
    """Pull key on-page SEO signals via JS evaluation."""
    data = page.evaluate("""() => {
        const getText = (sel) => {
            const el = document.querySelector(sel);
            return el ? el.innerText.trim() : null;
        };
        const getMeta = (name) => {
            const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            return el ? el.getAttribute('content') : null;
        };

        // Headings
        const h1Els = [...document.querySelectorAll('h1')].map(e => e.innerText.trim());
        const h2Els = [...document.querySelectorAll('h2')].map(e => e.innerText.trim()).slice(0, 6);

        // Images without alt
        const allImgs = [...document.querySelectorAll('img')];
        const missingAlt = allImgs.filter(i => !i.alt || i.alt.trim() === '').map(i => ({
            src: i.src.substring(0, 100),
            width: i.naturalWidth,
            height: i.naturalHeight
        }));

        // CTAs - buttons and prominent links
        const buttons = [...document.querySelectorAll('a[class*="btn"], button, a[class*="cta"], .wp-block-button a')]
            .map(e => e.innerText.trim())
            .filter(t => t.length > 0)
            .slice(0, 10);

        // Check for popups / overlays
        const overlaySelectors = [
            '[class*="popup"]','[class*="modal"]','[class*="overlay"]',
            '[class*="interstitial"]','[id*="popup"]','[id*="modal"]',
            '[class*="cookie"]','[class*="gdpr"]','[class*="newsletter"]'
        ];
        const popups = overlaySelectors.flatMap(sel => {
            return [...document.querySelectorAll(sel)].map(el => ({
                selector: sel,
                visible: el.offsetParent !== null,
                text: el.innerText.trim().substring(0, 80)
            }));
        });

        // Viewport above-the-fold (first 768px)
        const aboveFold = [...document.querySelectorAll('h1, h2, [class*="hero"], [class*="cta"], [class*="banner"]')]
            .filter(el => el.getBoundingClientRect().top < 768)
            .map(el => ({
                tag: el.tagName,
                text: el.innerText.trim().substring(0, 120),
                top: Math.round(el.getBoundingClientRect().top)
            }));

        // Navigation
        const navLinks = [...document.querySelectorAll('nav a, header a')]
            .map(e => e.innerText.trim())
            .filter(t => t.length > 0)
            .slice(0, 12);

        // Structured data
        const jsonLds = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(s => { try { return JSON.parse(s.textContent); } catch(e) { return null; } })
            .filter(Boolean);

        // Font sizes (basic check for readability)
        const bodyFontSize = getComputedStyle(document.body).fontSize;

        // Touch targets (links/buttons smaller than 48px)
        const smallTargets = [...document.querySelectorAll('a, button')]
            .filter(el => {
                const r = el.getBoundingClientRect();
                return (r.width > 0 && r.height > 0) && (r.width < 48 || r.height < 48);
            })
            .slice(0, 10)
            .map(el => ({
                tag: el.tagName,
                text: el.innerText.trim().substring(0, 40),
                width: Math.round(el.getBoundingClientRect().width),
                height: Math.round(el.getBoundingClientRect().height)
            }));

        return {
            title: document.title,
            metaDescription: getMeta('description'),
            metaKeywords: getMeta('keywords'),
            ogTitle: getMeta('og:title'),
            ogDescription: getMeta('og:description'),
            ogImage: getMeta('og:image'),
            h1: h1Els,
            h2: h2Els,
            missingAlt,
            buttons,
            popups: popups.filter((p, i, arr) => arr.findIndex(x => x.selector === p.selector && x.text === p.text) === i),
            aboveFold,
            navLinks,
            jsonLds,
            bodyFontSize,
            smallTargets,
            totalImages: allImgs.length
        };
    }""")
    return data


def check_horizontal_scroll(page):
    return page.evaluate("""() => document.documentElement.scrollWidth > window.innerWidth""")


def main():
    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])

        for vp in VIEWPORTS:
            name = vp["name"]
            print(f"\n[{name.upper()}] {vp['width']}x{vp['height']}")

            # Use mobile user-agent for mobile viewport
            if name == "mobile":
                context = browser.new_context(
                    viewport={"width": vp["width"], "height": vp["height"]},
                    user_agent=(
                        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 "
                        "Mobile/15E148 Safari/604.1"
                    ),
                    is_mobile=True,
                    has_touch=True,
                )
            else:
                context = browser.new_context(
                    viewport={"width": vp["width"], "height": vp["height"]}
                )

            page = context.new_page()

            # Above-the-fold screenshot
            atf_path = f"{SCREENSHOTS_DIR}/{name}_above_fold.png"
            capture(page, BASE_URL, atf_path, full_page=False)

            # Full-page screenshot
            full_path = f"{SCREENSHOTS_DIR}/{name}_full_page.png"
            page.screenshot(path=full_path, full_page=True)
            print(f"  Saved: {full_path}")

            # Extract SEO + UX data
            seo = extract_seo_data(page)
            scroll = check_horizontal_scroll(page)

            results[name] = {
                "viewport": vp,
                "seo": seo,
                "horizontal_scroll": scroll,
                "screenshots": {
                    "above_fold": atf_path,
                    "full_page": full_path
                }
            }

            context.close()

        browser.close()

    # Save JSON report
    report_path = f"{SCREENSHOTS_DIR}/seo_analysis.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nReport saved: {report_path}")

    return results


if __name__ == "__main__":
    main()
