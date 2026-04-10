# Architecture Patterns

**Project:** Grand Park Law Group — Portal & SSO
**Researched:** 2026-03-22
**Confidence:** HIGH — PocketBase auth API is stable and well-documented; patterns derived from official PocketBase documentation and established static site + headless auth patterns.

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare Pages (CDN)                  │
│                                                         │
│  Static HTML/CSS/JS — no server-side rendering          │
│                                                         │
│  /portal/staff-login.html   ─── auth entry point        │
│  /portal/client-login.html  ─── auth entry point        │
│  /portal/staff/index.html   ─── protected dashboard     │
│  /portal/client/index.html  ─── protected client view   │
│  /portal/callback.html      ─── OAuth2 redirect handler │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTPS REST + CORS
                   │  Authorization: Bearer <jwt>
                   ▼
┌─────────────────────────────────────────────────────────┐
│         PocketBase on Synology NAS                       │
│         https://pocketbase.gplg.synology.me             │
│                                                         │
│  Auth layer:                                            │
│    ├── Google OAuth2 provider (configured in admin UI)  │
│    └── Microsoft OAuth2 provider (configured in admin UI│
│                                                         │
│  Collections (SQLite tables):                           │
│    ├── _pb_users_auth  (built-in auth collection)       │
│    ├── cases           (case records, linked to users)  │
│    ├── metrics         (firm-wide dashboard data)       │
│    └── staff_notes     (optional, future)               │
│                                                         │
│  API rules (per-collection):                            │
│    ├── cases: viewRule = @request.auth.role = "client"  │
│    └── metrics: viewRule = @request.auth.role = "staff" │
└─────────────────────────────────────────────────────────┘
                   │
                   │  OAuth2 redirect
                   ▼
┌─────────────────────────────────────────────────────────┐
│         Google / Microsoft OAuth2 Servers               │
│                                                         │
│  Google:    accounts.google.com                         │
│  Microsoft: login.microsoftonline.com/common            │
└─────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Technology |
|-----------|---------------|-------------------|------------|
| Login page (static HTML) | Present SSO buttons, initiate OAuth2 flow | PocketBase API | Vanilla JS, existing CSS tokens |
| Callback page (static HTML) | Receive OAuth2 redirect, exchange code for token, store token, redirect to dashboard | PocketBase API | Vanilla JS |
| Staff dashboard (static HTML) | Gate access, display metrics from API | PocketBase API | Vanilla JS |
| Client portal (static HTML) | Gate access, display case data from API | PocketBase API | Vanilla JS |
| PocketBase auth layer | Issue JWT tokens, validate OAuth2 tokens from Google/Microsoft, manage sessions | Google OAuth2, Microsoft OAuth2 | PocketBase built-in |
| PocketBase data layer | Store and serve cases, metrics, user records | Auth layer (request.auth context) | PocketBase collections + API rules |
| Synology NAS / DSM | Host PocketBase binary, serve HTTPS via reverse proxy, SSL via Let's Encrypt | Public internet | Synology DSM reverse proxy |

**Boundary rules:**
- Cloudflare Pages never calls Google/Microsoft directly. All OAuth2 flows route through PocketBase.
- PocketBase API rules are the only authorization enforcement. The frontend gates are UX, not security.
- No secrets live in the static site. OAuth2 client IDs and secrets live in PocketBase admin config only.

---

## OAuth2 Flow — Step by Step

This is PocketBase's standard OAuth2 redirect flow for browser clients. Confidence: HIGH.

### Phase 1: Initiation (Login Page)

```
User clicks "Sign in with Google"
       │
       ▼
login page JS calls:
  GET https://pocketbase.gplg.synology.me/api/collections/users/auth-methods
       │
       ▼
PocketBase returns list of enabled providers including authUrl for Google
       │
       ▼
JS stores state + codeVerifier (PKCE) in sessionStorage
JS redirects browser to: Google authUrl
  (contains redirect_uri pointing to /portal/callback.html)
```

### Phase 2: OAuth2 Provider Handshake

```
Browser hits Google accounts.google.com
       │
       ▼
User authenticates with Google account
       │
       ▼
Google redirects to:
  https://www.grandparklawgroup.com/portal/callback.html
  ?code=<authorization_code>&state=<state>
```

### Phase 3: Token Exchange (Callback Page)

```
/portal/callback.html loads
       │
       ▼
JS reads ?code and ?state from URL params
JS reads stored state + codeVerifier from sessionStorage
       │
       ▼
JS calls PocketBase:
  POST https://pocketbase.gplg.synology.me/api/collections/users/auth-with-oauth2
  Body: { provider: "google", code, codeVerifier, redirectUrl }
       │
       ▼
PocketBase:
  1. Validates code with Google
  2. Gets user profile from Google
  3. Creates or updates user record in _pb_users_auth collection
  4. Returns: { token: "<jwt>", record: { id, email, role, ... } }
       │
       ▼
JS stores token and record in localStorage:
  localStorage.setItem("pb_auth_token", token)
  localStorage.setItem("pb_auth_record", JSON.stringify(record))
       │
       ▼
JS reads role from record, redirects:
  role === "staff"  → /portal/staff/
  role === "client" → /portal/client/
  role unknown      → /portal/staff-login.html?error=unauthorized
```

### Phase 4: Authenticated Page Load (Dashboard / Client Portal)

```
Protected page loads
       │
       ▼
JS checks localStorage for pb_auth_token
  No token → redirect to login page immediately (before content renders)
  Token present → continue
       │
       ▼
JS validates token is not expired (decode JWT, check exp claim)
  Expired → redirect to login page
  Valid → continue
       │
       ▼
JS calls PocketBase API with Authorization header:
  GET /api/collections/metrics/records
  Authorization: Bearer <jwt>
       │
       ▼
PocketBase evaluates API rule against request.auth context
  Rule passes → returns records as JSON
  Rule fails → 403 Forbidden
       │
       ▼
JS renders data into page DOM
```

### Phase 5: Logout

```
User clicks "Sign Out"
       │
       ▼
JS calls:
  POST https://pocketbase.gplg.synology.me/api/collections/users/auth-refresh
  (optional — to invalidate server-side if needed)
       │
       ▼
JS clears localStorage:
  localStorage.removeItem("pb_auth_token")
  localStorage.removeItem("pb_auth_record")
       │
       ▼
JS redirects to: https://www.grandparklawgroup.com/
```

---

## Data Flow: Auth Tokens

```
Direction: PocketBase → localStorage → Authorization header → PocketBase API rules

Token type:     JWT (signed by PocketBase secret)
Token lifetime: Configurable in PocketBase admin (default: 30 days for auth records)
Storage:        localStorage (persists across browser sessions)
Transport:      HTTPS only (Authorization: Bearer header)
Refresh:        POST /api/collections/users/auth-refresh with existing token
                Returns new token with extended expiry
                Call on every dashboard load to silently extend session
```

---

## Data Flow: Case and Metrics Data

```
Staff dashboard:
  GET /api/collections/metrics/records
  GET /api/collections/cases/records?filter=...
  → API rule: @request.auth.role = "staff"
  → Returns: JSON array of metric/case records
  → JS renders into DOM widgets

Client portal:
  GET /api/collections/cases/records?filter=(@request.auth.id = client)
  → API rule: @request.auth.id = client
  (each case record has a "client" field linking to the user record)
  → Returns: only the cases belonging to this client
  → JS renders case status cards
```

---

## PocketBase Collection Design

### users (built-in _pb_users_auth)

PocketBase's built-in users auth collection. Extended with custom fields:

| Field | Type | Notes |
|-------|------|-------|
| id | auto | PocketBase-generated |
| email | email | From OAuth2 provider |
| name | text | From OAuth2 provider |
| role | select | "staff" or "client" — set manually by admin after account creation |
| avatar | file | Optional |

Role is NOT set by OAuth2 automatically. Admin must set role after a user's first login.
This is the correct approach — self-registration with role escalation is a security risk.

### cases

| Field | Type | Notes |
|-------|------|-------|
| id | auto | |
| title | text | Case name/description |
| status | select | "active", "closed", "pending", "on-hold" |
| client | relation | Relation to users collection |
| assigned_staff | relation | Relation to users collection |
| updated | auto | Last updated timestamp |
| notes | text | Internal notes (staff-only via API rule) |

### metrics

| Field | Type | Notes |
|-------|------|-------|
| id | auto | |
| label | text | Metric name (e.g., "Active Cases") |
| value | number | Numeric value |
| period | text | e.g., "March 2026" |
| category | select | "cases", "hours", "deadlines" |

Metrics are entered manually by admin or staff with elevated permissions. No automated data pipeline in v1.

---

## CORS Configuration

PocketBase must be configured to allow requests from the Cloudflare Pages domain.

In PocketBase admin UI (Settings → Application):
- Allowed Origins: `https://www.grandparklawgroup.com`
- During development: also add `http://localhost:*` or `http://127.0.0.1:*`

This is the only place CORS is configured. The static frontend cannot configure CORS — it must be set on the PocketBase server.

---

## Synology Reverse Proxy Configuration

PocketBase runs on an internal port (default: 8090). Synology DSM's built-in reverse proxy forwards `pocketbase.gplg.synology.me` → `localhost:8090` with SSL termination via Let's Encrypt.

```
Internet → pocketbase.gplg.synology.me (port 443, HTTPS)
         → Synology DSM reverse proxy (SSL termination)
         → PocketBase binary (localhost:8090, HTTP)
```

PocketBase does NOT need its own SSL certificate — Synology handles TLS. PocketBase can run in plain HTTP mode internally because it's only exposed through the reverse proxy.

---

## Auth Gating Pattern (Client-Side)

Since Cloudflare Pages serves static files, there is no server-side route protection. Auth gating is client-side. This is a known limitation with a known mitigation:

**The security model:** PocketBase API rules are the real authorization boundary. The static page's auth check is a UX redirect, not a security gate. A user who bypasses the redirect will see the page shell but receive 403 errors from every API call.

**Implementation pattern:**

```javascript
// At the top of every protected page's <script> block, before any DOM writes:
(function() {
  const token = localStorage.getItem('pb_auth_token');
  const record = JSON.parse(localStorage.getItem('pb_auth_record') || 'null');

  if (!token || !record) {
    window.location.replace('/portal/staff-login.html');
    return;
  }

  // Decode JWT exp without a library (base64 decode middle segment)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('pb_auth_token');
      localStorage.removeItem('pb_auth_record');
      window.location.replace('/portal/staff-login.html?reason=expired');
      return;
    }
  } catch (e) {
    window.location.replace('/portal/staff-login.html');
    return;
  }

  // Role check for staff-only pages
  if (record.role !== 'staff') {
    window.location.replace('/portal/staff-login.html?reason=unauthorized');
    return;
  }
})();
```

This runs synchronously before the page renders meaningful content. It's not perfect (flash-of-content risk on slow connections) but is the standard pattern for static-hosted auth-gated pages.

---

## OAuth2 Redirect URI Registration

Both Google and Microsoft require the redirect URI to be registered in their developer consoles.

**Google Cloud Console:**
- Authorized redirect URIs: `https://www.grandparklawgroup.com/portal/callback.html`

**Microsoft Azure App Registration:**
- Redirect URIs: `https://www.grandparklawgroup.com/portal/callback.html`
- Account types: "Personal Microsoft accounts only" (since staff have no M365)

Both providers will reject the OAuth2 code if the redirect URI in the request doesn't exactly match a registered URI. This must be set up before any OAuth2 testing.

---

## Suggested Build Order

Dependencies flow downward — each layer must exist before the layer above can be tested.

```
1. Synology: Deploy PocketBase binary, configure reverse proxy, verify HTTPS
   └── Depends on: nothing. Foundation for everything.

2. PocketBase: Configure CORS, create collections (users, cases, metrics),
               configure Google OAuth2 provider, configure Microsoft OAuth2 provider
   └── Depends on: (1) PocketBase running and accessible

3. OAuth2 providers: Register app, add redirect URI in Google/Microsoft consoles
   └── Depends on: (2) PocketBase running (need client ID/secret from PocketBase config)
   Note: Google and Microsoft registration can be done in parallel

4. Callback page: /portal/callback.html — token exchange logic
   └── Depends on: (2)(3) PocketBase configured with OAuth2 providers

5. Login pages: Wire Google/Microsoft SSO buttons to PocketBase auth-methods endpoint
   └── Depends on: (4) callback page exists and handles redirect

6. Auth guard module: Shared JS for token validation and redirect-if-unauthenticated
   └── Depends on: (4)(5) full auth flow works end-to-end

7. Staff dashboard: Wire metrics/cases API calls, render data widgets
   └── Depends on: (6) auth guard works, (2) metrics collection populated

8. Client portal: Wire case status API calls, render case cards
   └── Depends on: (6) auth guard works, (2) cases collection with client relations
```

**Parallel opportunities:**
- Steps 3 (Google registration) and 3 (Microsoft registration) are fully parallel
- Steps 7 (staff dashboard) and 8 (client portal) can be built in parallel after step 6
- Collection schema design (step 2b) can be designed before PocketBase is deployed

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing OAuth2 Client Secrets in Frontend Code
**What goes wrong:** Client secrets embedded in JS are visible to anyone who views source.
**Why it matters here:** All OAuth2 secrets live in PocketBase admin config only. The frontend only sends the authorization code to PocketBase; PocketBase handles the server-to-server token exchange with Google/Microsoft.
**Instead:** Never put `GOOGLE_CLIENT_SECRET` or `MICROSOFT_CLIENT_SECRET` in any static file.

### Anti-Pattern 2: Using sessionStorage for Auth Tokens
**What goes wrong:** Token is lost when tab closes; user must re-authenticate every session.
**Why it matters here:** Law firm staff use the portal regularly — forcing re-auth every tab close creates friction.
**Instead:** Use localStorage with explicit logout and token expiry checking.

### Anti-Pattern 3: Relying on Frontend Route Guards for Security
**What goes wrong:** Any user can open DevTools, bypass the JS redirect, and reach the page HTML.
**Why it matters here:** The page shell loads regardless. The security is the PocketBase API returning 403.
**Instead:** Ensure every PocketBase collection has strict API rules. Test the rules directly with curl before trusting the frontend guard.

### Anti-Pattern 4: Single Callback URL for Both Staff and Client Flows
**What goes wrong:** Callback must determine which portal to redirect to based on role — but role isn't known until after the token exchange. Using separate login pages (staff-login vs client-login) does not help if there's one callback.
**Instead:** Use a single `/portal/callback.html` that reads role from the returned token record and routes accordingly. Or encode the intended destination in the OAuth2 state parameter before initiating the flow.

### Anti-Pattern 5: Blocking PocketBase admin port in Synology firewall
**What goes wrong:** PocketBase admin UI defaults to the same port as the API. Firewall rules that block external API access also block the admin panel.
**Instead:** PocketBase admin UI is accessible at `/_/` on the same port. Use Synology DSM firewall rules carefully — allow external HTTPS to the reverse proxy but manage PocketBase admin access separately (VPN-only or Synology DDNS with IP restriction).

---

## Scalability Considerations

This is a small law firm portal — scale is not a primary concern. Notes for awareness:

| Concern | For this use case | If it grows |
|---------|-------------------|-------------|
| Concurrent users | <20 staff + <200 clients = trivial for SQLite | PocketBase + SQLite handles hundreds of concurrent reads fine |
| PocketBase uptime | Synology NAS uptime is adequate for internal tool | Not suitable for SLA-critical public service |
| Token refresh | Manual per-page-load refresh is fine at this scale | Consider a shared auth.js module to avoid code duplication |
| Data volume | Cases and metrics stay small indefinitely | No concern for a law firm's caseload |
| NAS availability | Offline NAS = portal unavailable | Document backup access procedure for staff |

The primary operational risk is NAS availability, not technical scalability.

---

## Sources

- PocketBase authentication documentation: https://pocketbase.io/docs/authentication/ (HIGH confidence — stable API)
- PocketBase API records documentation: https://pocketbase.io/docs/api-records/ (HIGH confidence)
- PocketBase collection rules: https://pocketbase.io/docs/collections/#api-rules-and-filters (HIGH confidence)
- OAuth2 Authorization Code + PKCE flow: RFC 7636 (HIGH confidence — standard protocol)
- Google OAuth2 redirect URI registration: https://console.cloud.google.com (standard procedure, HIGH confidence)
- Microsoft identity platform for personal accounts: https://learn.microsoft.com/en-us/azure/active-directory/develop/ (HIGH confidence)
- Synology reverse proxy with Let's Encrypt: standard DSM feature (HIGH confidence)

Note: Web tools were unavailable during this research session. All findings are based on training data through August 2025. PocketBase's auth API has been stable since v0.16 and the patterns described here are well-established. Recommend verifying specific endpoint signatures against current PocketBase docs before implementation.
