# Technology Stack

**Analysis Date:** 2026-03-22

## Languages

**Primary:**
- HTML5 - Markup for all pages
- CSS3 - Styling and responsive design
- JavaScript (Vanilla) - Client-side interactions and animations

**Secondary:**
- JSON - Schema.org structured data, configuration

## Runtime

**Environment:**
- Browser-based static site (no server runtime)
- HTML pages served as static files

**Package Manager:**
- Not applicable (no Node.js/npm dependency management)
- Manual asset management

## Frameworks

**Core:**
- No frontend framework (vanilla HTML/CSS/JS)
- Static site architecture

**Fonts & Design:**
- Google Fonts - `https://fonts.googleapis.com`
  - Cormorant Garamond (display font)
  - Outfit (body font)

**Build/Dev:**
- Not detected

## Key Dependencies

**Third-Party Scripts:**
- Google Tag Manager - Analytics and tracking
  - Script: `https://www.googletagmanager.com/gtm.js`
  - Container ID: GTM-M649WB9Z

- Cloudflare Pages Analytics - Page analytics
  - Script: `https://static.cloudflareinsights.com/beacon.min.js`
  - Token: 97af4cf6b3e74dfabd6ea83ce66c10f0

## Configuration

**Environment:**
- No environment variables required for core site
- External service URLs and API keys configured in HTML/JS files (templates with placeholder values)
- Key placeholders in codebase:
  - `YOUR_FORM_ID` (Formspree contact form integration)
  - `YOUR_GHOST_URL`, `YOUR_GHOST_CONTENT_API_KEY` (blog CMS - optional)
  - `YOUR_DIRECTUS_URL`, `YOUR_DIRECTUS_API_TOKEN` (CMS - optional)
  - `YOUR_LISTMONK_URL`, `YOUR_LIST_UUID` (email list - optional)
  - `YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL` (content source - optional)
  - `YOUR_MAUTIC_URL` (marketing automation - optional)

**Build:**
- No build configuration files detected
- Direct HTML/CSS/JS files served

## Platform Requirements

**Development:**
- Git repository: `https://github.com/gplg-it/grandparklawgroup-website.git`
- Text editor or IDE (VS Code configuration present in `.vscode/settings.json`)
- Web browser for testing

**Production:**
- Hosting: Cloudflare Pages
- DNS: Domain registered and pointing to Cloudflare
- HTTPS: Managed by Cloudflare

## Asset Organization

**CSS:**
- `assets/css/design-system.css` - Design tokens, color variables, spacing system
- `assets/css/main.css` - Component styles, animations, responsive design

**JavaScript:**
- `assets/js/main.js` - Core functionality module (loader, animations, navigation, forms)

**Images:**
- `assets/images/` - Logos, favicons, team photos
- `assets/images/attorneys/` - Attorney headshots
- `assets/images/team/` - Staff photos

---

*Stack analysis: 2026-03-22*
