# Website Recovery Notes

**Date**: January 31, 2025  
**Source**: www.grandparklawgroup.com (Cloudflare Pages)  
**Method**: SiteSucker mirror + wget verification

---

## What Was Recovered

### HTML Pages (9 unique + 12 stub routes)
All 9 fully-built pages were captured intact with complete inline styles,
scripts, structured data (JSON-LD), Open Graph metadata, and content.

Interior pages (about, contact, practices overview, professionals overview,
insights, legal/*) were captured by wget with clean absolute paths. The
landing page was captured by SiteSucker with relative paths and `.html`
suffix mangling on image URLs — both issues have been corrected.

### CSS (2 files)
- `design-system.css` — 588 lines, custom properties and base styles
- `main.css` — 722 lines, component and layout styles

Both verified byte-for-byte against SiteSucker capture.

### JavaScript (1 file)
- `main.js` — 315 lines, navigation, scroll behavior, mobile menu

Verified intact. The landing page uses inline scripts (VIDEO_CONFIG,
hero video initialization, section animations) and does not load main.js.

## What Was NOT Recovered

### Local Images (never deployed)
These files were referenced in HTML but the server returned HTML 404 pages
for all of them. They were never uploaded to the Cloudflare Pages deployment:

| File | Referenced In |
|------|--------------|
| `/assets/images/favicon.svg` | All pages (link rel=icon) |
| `/assets/images/apple-touch-icon.png` | All pages (link rel=apple-touch-icon) |
| `/assets/images/og-default.jpg` | All pages (og:image, twitter:image) |
| `/assets/images/logo.svg` | JSON-LD structured data |
| `/assets/images/hero-poster.jpg` | Landing page (video fallback) |
| `/assets/images/attorneys/jaafari.jpg` | Landing page (team section) |
| `/assets/images/attorneys/rosario.jpg` | Landing page (team section) |

### Unbuilt Pages (12 routes)
These routes existed in the navigation and internal links but the server
returned the landing page HTML for all of them (catch-all SPA behavior).
Stub pages with consistent headers/footers have been generated for these
routes to maintain URL structure.

## SiteSucker Artifact: `.html` Suffix Mangling

SiteSucker appended `.html` to URLs when the server returned `text/html`
content-type instead of the expected binary (image/svg+xml, image/png, etc).
This happened because the images were never deployed — the server returned
its catch-all HTML page for missing assets.

**Affected paths (corrected):**
- `favicon.svg.html` → `favicon.svg`
- `apple-touch-icon.png.html` → `apple-touch-icon.png`
- `jaafari.jpg.html` → `jaafari.jpg`
- `rosario.jpg.html` → `rosario.jpg`

**Also corrected:** Relative paths (`assets/...`) converted to absolute
(`/assets/...`) for deployment consistency.

## Architecture Notes

- Landing page is fully self-contained (inline CSS + JS). It also loads
  the external CSS files for design-system variables.
- Interior pages use external CSS/JS from `/assets/`.
- Portal pages (gateway, client-login, staff-login) are fully self-contained.
- Insights page has a CMS CONFIG object for Ghost, Directus, Google Sheets,
  Listmonk, and Mautic — all currently set to `enabled: false`.
- Cloudflare Web Analytics beacon: token `97af4cf6b3e74dfabd6ea83ce66c10f0`
  (present on interior pages, can be added to landing page).

## External CDN Dependencies

| Resource | CDN | Status |
|----------|-----|--------|
| Cormorant Garamond + Outfit | Google Fonts | ✅ Working |
| Hero videos | Mixkit | ✅ Working |
| Stock photos | Unsplash | ✅ Working |
| Email decode | Cloudflare | ✅ Working |
| Analytics beacon | Cloudflare | ✅ Working |
