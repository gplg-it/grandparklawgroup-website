# External Integrations

**Analysis Date:** 2026-03-22

## APIs & External Services

**Analytics & Tracking:**
- Google Tag Manager (GTM)
  - Purpose: Analytics tracking and conversion monitoring
  - Container ID: GTM-M649WB9Z
  - Script: `https://www.googletagmanager.com/gtm.js`
  - Configuration: `index.html` and all pages include GTM script and noscript iframe

- Cloudflare Pages Analytics
  - Purpose: Page performance and visitor analytics
  - Token: 97af4cf6b3e74dfabd6ea83ce66c10f0
  - Script: `https://static.cloudflareinsights.com/beacon.min.js`
  - Included in footer of all pages

**Font Delivery:**
- Google Fonts API
  - Service: Web font hosting and delivery
  - Fonts: Cormorant Garamond, Outfit
  - Endpoints:
    - `https://fonts.googleapis.com` (preconnect)
    - `https://fonts.gstatic.com` (preconnect)
  - API URL: `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Outfit:wght@200;300;400;500;600&display=swap`

**Content Management (Optional/Planned):**
- Ghost CMS
  - Purpose: Blog and content management (not currently active)
  - Configuration location: `insights/index.html` (lines 2044-2045)
  - Environment variables: `YOUR_GHOST_URL`, `YOUR_GHOST_CONTENT_API_KEY`
  - Status: Template/placeholder - awaiting configuration

- Directus CMS
  - Purpose: Headless CMS for content (not currently active)
  - Configuration location: `insights/index.html` (lines 2050-2051)
  - Environment variables: `YOUR_DIRECTUS_URL`, `YOUR_DIRECTUS_API_TOKEN`
  - Status: Template/placeholder - awaiting configuration

**Email & Marketing Automation:**
- Formspree
  - Purpose: Contact form submission handling
  - Configuration: `contact/index.html` line 205
  - Form endpoint: `https://formspree.io/f/YOUR_FORM_ID`
  - Method: POST
  - Status: Requires form ID configuration
  - Fields handled: firstName, lastName, email, phone, caseType, message

- Listmonk
  - Purpose: Email list management and newsletter (not currently active)
  - Configuration location: `insights/index.html` (lines 2061-2062)
  - Environment variables: `YOUR_LISTMONK_URL`, `YOUR_LIST_UUID`
  - Status: Template/placeholder - awaiting configuration

- Mautic
  - Purpose: Marketing automation (not currently active)
  - Configuration location: `insights/index.html` (line 2067)
  - Environment variable: `YOUR_MAUTIC_URL`
  - Status: Template/placeholder - awaiting configuration

**Data Sources:**
- Google Sheets (via CSV export)
  - Purpose: Potential content or metadata source
  - Configuration location: `insights/index.html` (line 2056)
  - Environment variable: `YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL`
  - Status: Template/placeholder - awaiting configuration

## Data Storage

**Databases:**
- None - Pure static site architecture
- No server-side database

**File Storage:**
- Cloudflare Pages (built-in)
  - All assets served through Cloudflare's global CDN
  - Local files in repository

**Caching:**
- Cloudflare Pages automatic caching
  - Configuration managed by Cloudflare

## Authentication & Identity

**Auth Provider:**
- Portal pages present (`portal/staff-login.html`, `portal/client-login.html`)
- Authentication mechanism not yet implemented
- Status: Login pages created but backend not configured

**Current Implementation:**
- No active authentication system
- Portal serves as placeholder for future member/staff access

## Monitoring & Observability

**Error Tracking:**
- Not detected - no error tracking service configured

**Logs:**
- Cloudflare Pages analytics provides request logs
- Browser console logging in `assets/js/main.js` for debugging:
  - Video load failures logged to console
  - No external log aggregation service

**Analytics:**
- Google Tag Manager (GTM-M649WB9Z) - primary analytics
- Cloudflare Pages analytics - secondary analytics

## CI/CD & Deployment

**Hosting:**
- Cloudflare Pages
  - Repository: `https://github.com/gplg-it/grandparklawgroup-website.git`
  - Auto-deployment on git push to main branch

**CI Pipeline:**
- Not detected - likely using Cloudflare Pages automatic deployment
- No GitHub Actions or other CI service configuration found

**Domain & DNS:**
- Domain: `grandparklawgroup.com`
- Hosted on: Cloudflare Pages
- HTTPS: Automatic (Cloudflare managed)

## Environment Configuration

**Required env vars (for optional integrations):**
- `YOUR_FORM_ID` - Formspree contact form ID (required for contact form)
- `YOUR_GHOST_URL` - Ghost CMS instance URL (optional)
- `YOUR_GHOST_CONTENT_API_KEY` - Ghost API key (optional)
- `YOUR_DIRECTUS_URL` - Directus CMS instance URL (optional)
- `YOUR_DIRECTUS_API_TOKEN` - Directus API token (optional)
- `YOUR_LISTMONK_URL` - Listmonk instance URL (optional)
- `YOUR_LIST_UUID` - Listmonk list UUID (optional)
- `YOUR_MAUTIC_URL` - Mautic instance URL (optional)
- `YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL` - Google Sheets CSV export URL (optional)

**Secrets location:**
- Configuration values currently in HTML/JS files as placeholders
- No `.env` file present
- No secure secrets management system detected

**Social Media Integration:**
- Links only (no API integration)
- Linked accounts:
  - LinkedIn: `https://linkedin.com/company/grandparklaw`
  - Twitter/X: `https://twitter.com/grandparklaw`, `https://x.com/grandparklaw`
  - Facebook: `https://facebook.com/grandparklawgroup`
  - Instagram: `https://instagram.com/grandparklawgroup`

## Webhooks & Callbacks

**Incoming:**
- Formspree webhook endpoints for contact form submissions
  - Form ID required in `contact/index.html` line 205

**Outgoing:**
- Not detected

## Performance & Optimization

**Image Optimization:**
- Images stored locally in repository
- Served via Cloudflare CDN
- Multiple formats for team photos (JPG, PNG variants)

**CDN:**
- Cloudflare Pages handles CDN delivery globally
- Google Fonts cached through Google's CDN

---

*Integration audit: 2026-03-22*
