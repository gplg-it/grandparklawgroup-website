# Technology Stack — PocketBase SSO Portal

**Project:** Grand Park Law Group — Staff & Client Portal
**Researched:** 2026-03-22
**Mode:** Ecosystem (existing static site + new auth layer)

---

## Existing Site Constraints (Non-Negotiable)

Before recommending additions, the stack must accept these hard constraints from the existing codebase:

| Constraint | Detail |
|------------|--------|
| No build tooling | No Webpack, Vite, or bundlers — files are served as-is |
| Vanilla JS | No framework (React, Vue, etc.) — direct DOM manipulation |
| Cloudflare Pages | Static hosting only — no server-side code execution |
| Zero cost | All new infrastructure must be free-tier or self-hosted |
| PocketBase on Synology NAS | Decided — not negotiable |
| Design tokens already defined | CSS custom properties in `portal/staff/index.html` (inline) |

---

## Recommended Stack

### Backend: PocketBase

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PocketBase | 0.22.x (VERIFY at pocketbase.io/docs before deploying) | Auth, database, REST API, OAuth2 broker | Single binary — runs on Synology NAS without Docker required. Handles Google + Microsoft OAuth2 natively. Built-in SQLite DB for cases/clients/staff collections. Admin UI for data management. REST API for all reads/writes from the static frontend. No separate auth service needed. |

**Confidence: MEDIUM** — PocketBase's general capabilities are well-established in training data. Version number should be verified at `pocketbase.io` before deployment; PocketBase releases frequently and minor API surface changes between versions.

**Why not something else:**
- Firebase Auth: Cloud-hosted, free tier has rate limits, data leaves your control
- Supabase: Excellent but cloud-hosted; self-hosted version adds complexity beyond what's needed
- Auth0: Paid at scale, external SaaS, out of scope per PROJECT.md
- Keycloak: Massive operational overhead for a 2-person law firm portal
- Netlify Identity / Cloudflare Access: Would work for staff but cannot serve client-specific data views

---

### Frontend Auth Layer: PocketBase JavaScript SDK

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PocketBase JS SDK | 0.21.x (VERIFY at github.com/pocketbase/js-sdk) | Auth token management, API calls, OAuth2 redirect handling | Official SDK from PocketBase team. Handles the full OAuth2 PKCE flow, token storage in `localStorage`, auto-refresh of expired tokens, and typed wrappers for REST calls. No framework required — works in vanilla JS via CDN script tag or ES module import. |

**Confidence: MEDIUM** — The SDK's CDN availability and vanilla JS compatibility are well-established. Exact version to verify at release; breaking changes exist between 0.x minor versions.

**Delivery method:** Load via CDN script tag (no npm, no bundler — matches existing site pattern):

```html
<!-- In portal pages only, not sitewide -->
<script src="https://cdn.jsdelivr.net/npm/pocketbase@0.21/dist/pocketbase.umd.js"></script>
```

**Why not fetch() directly (no SDK):** The OAuth2 PKCE flow requires precise redirect URL construction, state parameter validation, and code verifier handling. The SDK encapsulates this correctly. Writing it manually risks auth security bugs. For a law firm portal, correctness is mandatory.

**Why not a framework (React/Vue/Svelte):** Introducing a build toolchain to a deliberately no-build site creates ongoing maintenance overhead and breaks the project's established pattern. The SDK + vanilla JS is sufficient for dashboard data rendering.

---

### Token Storage: localStorage (SDK default)

| Technology | Purpose | Why |
|------------|---------|-----|
| `localStorage` | Persist PocketBase auth token across page loads | PocketBase JS SDK uses localStorage by default for the auth store. Tokens survive tab closes (unlike sessionStorage), enabling "stay logged in" behavior. For a law firm portal on internal/trusted devices, this is acceptable. |

**Confidence: HIGH** — This is standard browser API, well-understood behavior.

**Security note:** `localStorage` is accessible to JavaScript on the same origin. The portal pages are on the Cloudflare Pages domain. PocketBase tokens are short-lived JWTs (default 30-day expiry, configurable). The risk profile is acceptable for a staff dashboard and client status viewer — not payment processing or medical records. If a stricter posture is required later, HttpOnly cookies via a thin Cloudflare Worker proxy could be added, but that is out of scope for v1.

---

### OAuth2 Providers: Google and Microsoft

| Provider | Type | Notes |
|----------|------|-------|
| Google OAuth2 | Staff + Client | Configured in PocketBase Admin UI. Requires a Google Cloud Console project with OAuth 2.0 credentials. Redirect URI points to PocketBase endpoint. |
| Microsoft OAuth2 | Staff + Client | Configured in PocketBase Admin UI. Requires Azure App Registration (free). PROJECT.md notes staff will use personal Microsoft accounts — Azure app registration type must be "Accounts in any organizational directory and personal Microsoft accounts." |

**Confidence: HIGH** — PocketBase's OAuth2 provider support for Google and Microsoft is documented. Configuration is done in PocketBase's Admin UI, not in code.

**Why not GitHub/Apple/etc.:** Out of scope — project specifies Google + Microsoft only.

---

### Route Protection: Client-Side Auth Guard (vanilla JS)

| Technology | Purpose | Why |
|------------|---------|-----|
| Inline JS auth guard on portal pages | Prevent unauthenticated page render | Each portal page checks for a valid PocketBase auth token before rendering content. If no valid token exists, immediately redirect to the login page. |

**Confidence: HIGH** — This is a standard SPA pattern adapted for multi-page static sites.

**Implementation pattern:**

```javascript
// At the top of each portal page's <script> block, before any content renders
const pb = new PocketBase('https://pocketbase.gplg.synology.me');

if (!pb.authStore.isValid) {
    window.location.replace('/portal/login/');
}
```

**Important caveat:** Client-side route protection is a UX convenience, not a security boundary. The real security is that PocketBase API endpoints return 401 for unauthenticated requests — the dashboard data simply cannot be fetched without a valid token. The redirect prevents unauthenticated users from seeing a broken empty dashboard.

---

### Login Page: Dedicated Static HTML Page

| Location | Purpose |
|----------|---------|
| `/portal/login/index.html` | Single login page for all users — shows Google and Microsoft sign-in buttons |

**Why one shared login page (not separate staff/client login):** PocketBase handles role differentiation after auth. The user signs in with Google or Microsoft; PocketBase returns a record with the user's collection membership (staff vs. client). The login page then reads the role from the token and routes accordingly:
- Staff role → redirect to `/portal/staff/`
- Client role → redirect to `/portal/client/`
- Unknown role → redirect to `/` with an error message

This is simpler to maintain than two separate login pages and eliminates the UX problem of users landing on the wrong login page.

---

### Data Collections: PocketBase SQLite

| Collection | Fields (initial) | Purpose |
|------------|-----------------|---------|
| `users` (built-in) | email, name, role (staff/client), avatar | PocketBase's built-in auth collection — extended with a `role` field via custom fields |
| `cases` | title, status, client (relation), assigned_attorney, opened_date, last_updated, notes | Case records visible to clients (their own) and staff (all) |
| `staff_metrics` | period, active_cases, deadlines_this_week, billable_hours_ytd, recorded_at | Aggregated metrics for staff dashboard (manual entry or future automation) |

**Confidence: MEDIUM** — Collection structure is a recommendation based on the PROJECT.md requirements. Actual fields should be refined during the PocketBase setup phase.

---

### CORS Configuration: PocketBase Admin Setting

PocketBase must have CORS configured to allow requests from the Cloudflare Pages domain.

| Setting | Value |
|---------|-------|
| Allowed origins | `https://grandparklawgroup.com`, `https://www.grandparklawgroup.com` (and preview deploy URLs during development) |
| Configuration location | PocketBase Admin UI → Settings → Application |

**Confidence: HIGH** — PocketBase CORS is configured in the Admin UI, not in code.

---

### HTTPS: Synology Let's Encrypt (existing)

| Component | Detail |
|-----------|--------|
| SSL provider | Let's Encrypt via Synology DSM built-in certificate manager |
| Endpoint | `https://pocketbase.gplg.synology.me` |
| Port | 8090 (PocketBase default) — exposed via Synology reverse proxy on 443 |

**Confidence: MEDIUM** — Synology's built-in Let's Encrypt support is well-documented. The reverse proxy step (DSM → Application Portal → Reverse Proxy) mapping `pocketbase.gplg.synology.me:443` to `localhost:8090` is the standard Synology pattern. This requires a phase of its own in the roadmap.

---

### No Additional Infrastructure Needed

Explicitly: do NOT add the following:

| What | Why Not |
|------|---------|
| Cloudflare Workers | Not needed — CORS + PocketBase API handles everything. Workers add complexity and a new billing surface area. |
| Cloudflare Access | Requires Teams plan for custom domains; overkill for SSO already handled by PocketBase |
| JWT verification middleware | PocketBase API enforces auth server-side. Client is a consumer, not a verifier. |
| State management library (Redux, Zustand) | No framework on the frontend — vanilla JS module pattern with localStorage is sufficient |
| React/Vue/Svelte for portal pages | Overkill for a read-only dashboard with ~5 data fields. Adds build complexity the project explicitly avoids. |
| Separate API gateway | PocketBase IS the API. No gateway needed at this scale. |

---

## Full Dependency Summary

### Runtime (CDN, no install required)

```html
<!-- PocketBase JS SDK — load only on portal pages -->
<script src="https://cdn.jsdelivr.net/npm/pocketbase@0.21/dist/pocketbase.umd.js"></script>
```

Verify latest stable version at: `https://github.com/pocketbase/js-sdk/releases`

### Server (self-hosted, Synology NAS)

```bash
# Download PocketBase binary for linux/amd64 (Synology x86_64 NAS)
# Verify current version at: https://github.com/pocketbase/pocketbase/releases
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
./pocketbase serve --http="0.0.0.0:8090"
```

**ARM NAS note:** If the Synology NAS is ARM-based (DS220j, DS220+, etc.), download `linux_arm64` instead of `linux_amd64`. Verify NAS CPU architecture in DSM → Info Center before downloading.

### OAuth2 Credentials (external registrations, free)

| Service | Where | Cost |
|---------|-------|------|
| Google OAuth2 Client ID | console.cloud.google.com | Free |
| Microsoft App Registration | portal.azure.com | Free |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Backend auth | PocketBase | Supabase | Cloud-hosted; violates self-hosted constraint |
| Backend auth | PocketBase | Firebase Auth | Cloud-hosted; Google dependency; rate limits |
| Backend auth | PocketBase | Keycloak | Requires JVM, too heavy for Synology NAS |
| Frontend SDK | PocketBase JS SDK | Raw fetch() | OAuth2 PKCE flow is complex; SDK prevents security bugs |
| Frontend SDK | PocketBase JS SDK | Axios | No OAuth2 flow support; just an HTTP client |
| Frontend framework | None (vanilla JS) | React SPA | Requires bundler; breaks existing no-build pattern |
| Token storage | localStorage | HttpOnly cookie | Requires server-side proxy (Cloudflare Worker) — adds cost and complexity; acceptable risk for v1 |
| Route protection | Client-side JS guard | Cloudflare Access | Requires Teams plan; overkill; removes PocketBase role control |

---

## Sources

- Training knowledge of PocketBase architecture and JS SDK (MEDIUM confidence — verify versions)
- PocketBase documentation canonical URL: `https://pocketbase.io/docs/`
- PocketBase JS SDK releases: `https://github.com/pocketbase/js-sdk/releases`
- PocketBase server releases: `https://github.com/pocketbase/pocketbase/releases`
- PROJECT.md constraints and decisions (HIGH confidence — primary source)
- Existing codebase audit in `.planning/codebase/` (HIGH confidence)

**Version verification required before implementation:**
- PocketBase server version: check `github.com/pocketbase/pocketbase/releases`
- PocketBase JS SDK version: check `github.com/pocketbase/js-sdk/releases`
- jsDelivr CDN URL format may change with major versions

---

*Research complete: 2026-03-22*
