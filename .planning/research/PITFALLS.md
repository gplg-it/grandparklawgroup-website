# Domain Pitfalls

**Domain:** PocketBase SSO portal — static frontend (Cloudflare Pages) + PocketBase on Synology NAS + Google/Microsoft OAuth2
**Researched:** 2026-03-22
**Confidence note:** WebSearch and WebFetch were unavailable. All findings are from training knowledge (cutoff August 2025). Confidence levels reflect that. Verify PocketBase-specific items against current docs at https://pocketbase.io/docs/ before implementation.

---

## Critical Pitfalls

Mistakes that cause rewrites or blocked deployments.

---

### Pitfall 1: OAuth2 Redirect URI Mismatch

**What goes wrong:** Google and Microsoft OAuth2 providers reject the auth callback with "redirect_uri_mismatch" or "AADSTS50011" errors. The PocketBase OAuth2 flow uses a specific redirect URL of the form `https://pocketbase.gplg.synology.me/api/oauth2-redirect`. If the Google Cloud Console or Azure App Registration does not have this *exact* URL registered — including trailing slash, protocol, and subdomain — auth fails for all users.

**Why it happens:** Developers register the frontend domain (`https://www.grandparklawgroup.com`) as the redirect URI instead of the PocketBase API endpoint. PocketBase handles the OAuth2 callback server-side, not the static frontend. The frontend only receives a token after PocketBase completes the exchange.

**Consequences:** Auth is completely broken. No user can log in. Error is opaque on the frontend — looks like a generic network failure until you check browser network tab.

**Prevention:**
- Register `https://pocketbase.gplg.synology.me/api/oauth2-redirect` in Google Cloud Console under "Authorized redirect URIs" — not the Cloudflare Pages domain.
- Register the same URL in Azure App Registration under "Redirect URIs" (Web platform, not SPA).
- For Google: also add the Cloudflare Pages domain to "Authorized JavaScript origins" (separate field) if using the JS SDK's redirect flow.
- Test the redirect URI by visiting `https://pocketbase.gplg.synology.me/api/oauth2-redirect` directly — it should return a PocketBase response (even an error), not a 404 or connection refused.

**Detection:** Browser network tab shows 400 from Google/Microsoft OAuth endpoint with `redirect_uri_mismatch` in the response body. PocketBase admin logs show the incoming OAuth2 callback.

**Phase:** PocketBase setup + OAuth2 provider configuration phase. Verify before writing any frontend auth code.

**Confidence:** HIGH — this is a universal OAuth2 constraint, not PocketBase-specific.

---

### Pitfall 2: CORS Misconfiguration — Wrong Origin or Missing Headers

**What goes wrong:** The static frontend at `https://www.grandparklawgroup.com` makes API calls to `https://pocketbase.gplg.synology.me`. PocketBase's CORS settings must explicitly allow the Cloudflare Pages origin. If CORS is configured incorrectly, all API calls (including auth) fail with "CORS policy" errors in the browser — even if the server is reachable.

**Why it happens:** PocketBase's default CORS configuration in development may allow all origins (`*`). When hardening for production, developers restrict origins but omit the `grandparklawgroup.com` domain, or include it with a typo, or forget the `https://` prefix. Cloudflare Pages preview deployments also get distinct subdomains (e.g., `abc123.grandparklawgroup.pages.dev`) that are not listed.

**Consequences:** Every API call from the frontend fails silently or with misleading errors. Auth cannot complete. Appears as a network error or 401, masking the real CORS issue.

**Prevention:**
- In PocketBase admin panel under Settings > Application, set the "Allowed Origins" to `https://www.grandparklawgroup.com` explicitly.
- Also add `https://*.grandparklawgroup.pages.dev` (wildcard) or specific preview URLs for development and staging.
- Add `http://localhost:*` for local development.
- If using Synology's reverse proxy in front of PocketBase, verify the proxy is not stripping `Origin` headers or adding conflicting `Access-Control-Allow-Origin` headers (double-header problem).
- After configuring, test with: `curl -H "Origin: https://www.grandparklawgroup.com" -I https://pocketbase.gplg.synology.me/api/health` and confirm `Access-Control-Allow-Origin` is present in the response.

**Detection:** Browser console shows "has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header". Network tab shows the preflight OPTIONS request returning 403 or missing CORS headers.

**Phase:** PocketBase deployment phase, before any frontend integration.

**Confidence:** HIGH — standard CORS behavior, PocketBase configuration is well-documented.

---

### Pitfall 3: Synology Reverse Proxy Breaks WebSocket / Long-Poll Connections

**What goes wrong:** PocketBase uses Server-Sent Events (SSE) for its real-time subscription API (`/api/realtime`). Synology DSM's built-in reverse proxy (nginx-based) has default timeout settings that close long-lived connections. SSE connections drop after 60 seconds, causing real-time subscriptions to fail repeatedly.

**Why it happens:** The default `proxy_read_timeout` on Synology's reverse proxy is 60s. SSE is a persistent HTTP connection — it appears idle between events and gets terminated. The portal may not use realtime subscriptions in v1, but the issue also affects any slow API response that exceeds the timeout.

**Consequences:** If real-time features are used (live case status updates), they appear to work in testing but fail intermittently in production. Regular API calls over 60 seconds (rare, but possible during heavy SQLite operations) also time out.

**Prevention:**
- For v1 (no real-time), this is low risk. Avoid using PocketBase's `subscribe()` API until reverse proxy is tuned.
- If using Synology's Application Portal for reverse proxy, customize the nginx config to add `proxy_read_timeout 3600;` and `proxy_send_timeout 3600;`.
- Alternatively, run PocketBase directly on a port with HTTPS terminated by Synology's Let's Encrypt cert at the DSM level (not application-level reverse proxy), bypassing the proxy entirely.
- Add `Connection: keep-alive` and `X-Accel-Buffering: no` headers in the reverse proxy config for the realtime endpoint.

**Detection:** Real-time subscriptions reconnect every ~60 seconds. Browser DevTools shows EventSource connections closing and reopening on a regular cadence.

**Phase:** Synology deployment phase. Document the limitation; defer real-time features to a post-v1 phase until proxy is tuned.

**Confidence:** MEDIUM — based on Synology nginx defaults and general reverse proxy behavior. Specific DSM version may differ.

---

### Pitfall 4: Microsoft OAuth2 — Personal Accounts Require Specific Tenant Configuration

**What goes wrong:** The project uses personal Microsoft accounts (not M365/work accounts). Azure App Registration defaults to a single-tenant configuration tied to a corporate directory. Personal Microsoft accounts (outlook.com, hotmail.com, live.com) require the app to use the "common" or "consumers" tenant endpoint, not a specific tenant ID.

**Why it happens:** When creating the Azure App Registration, the "Supported account types" defaults to "Accounts in this organizational directory only (Single tenant)." Personal Microsoft accounts use `login.microsoftonline.com/consumers/` — they are rejected by single-tenant apps.

**Consequences:** Microsoft login appears to work during setup (if the developer uses a work account for testing), but personal account users see "This Microsoft account does not exist in tenant X" or "The provided value for the input parameter 'scope' is not valid."

**Prevention:**
- In Azure App Registration, set "Supported account types" to "Personal Microsoft accounts only" (if staff will only use personal accounts) or "Accounts in any organizational directory and personal Microsoft accounts" (multi-tenant + personal).
- In PocketBase's Microsoft OAuth2 provider settings, verify the authorization URL uses `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` or `consumers` endpoint, not a tenant-specific URL.
- Test with an actual outlook.com or hotmail.com account before launch — do not only test with the developer's work/school account.

**Detection:** Login with a personal Microsoft account returns "AADSTS50020: User account from identity provider does not exist in tenant" or similar AADST error codes.

**Phase:** OAuth2 provider configuration phase. Must be verified with real personal accounts before frontend work begins.

**Confidence:** HIGH — Microsoft tenant configuration is a well-documented requirement. Confirmed behavior for personal vs. work accounts.

---

### Pitfall 5: PocketBase Token Storage in localStorage — XSS Exposure for a Law Firm

**What goes wrong:** PocketBase's JS SDK stores the auth token in `localStorage` by default. For a law firm handling client case information, storing tokens in localStorage exposes them to any XSS vulnerability — in the site's own code, in third-party scripts, or in injected content. A compromised token grants full API access to client case data.

**Why it happens:** The SDK's default `authStore` uses `localStorage` for persistence across page loads. This is the standard behavior and works fine for many applications, but it's a meaningful risk for regulated legal data.

**Consequences:** If any script on the page (analytics, CDN-hosted assets, injected ads) has XSS capability, it can read `pb_auth` from localStorage and exfiltrate the token. Client case data could be accessed. Law firm faces attorney-client privilege and confidentiality liability.

**Prevention:**
- Override the PocketBase `authStore` to use `sessionStorage` instead of `localStorage`. Tokens do not persist across browser sessions, requiring re-login each session — acceptable trade-off for legal data.
- Alternatively, implement a custom `authStore` that stores tokens in a `httpOnly` cookie by proxying auth through a Cloudflare Worker (adds complexity, but eliminates JS-accessible token storage entirely).
- For v1, `sessionStorage` is the pragmatic choice: `new PocketBase('https://pocketbase.gplg.synology.me', { authStore: new AsyncAuthStore({ save: async (v) => sessionStorage.setItem('pb_auth', v), initial: sessionStorage.getItem('pb_auth') }) })`
- Audit all third-party scripts included on portal pages. Do not include any external scripts (analytics, chat widgets, etc.) on gated portal pages.
- Set a `Content-Security-Policy` header on the portal pages via Cloudflare Pages `_headers` file to restrict script sources.

**Detection:** Open browser DevTools > Application > Local Storage. If `pocketbase.gplg.synology.me` key `pb_auth` is visible after login, tokens are in localStorage.

**Phase:** Frontend auth implementation phase. Address before any client data is displayed.

**Confidence:** HIGH — localStorage XSS risk is a documented security concern; PocketBase SDK default is localStorage.

---

## Moderate Pitfalls

---

### Pitfall 6: Synology DDNS IP Changes Break Let's Encrypt Certificate

**What goes wrong:** Synology's DDNS service (`gplg.synology.me`) dynamically maps to the NAS's external IP. If the ISP changes the IP (DHCP lease renewal, power outage, router reset) and the DDNS record does not update before the certificate renewal check, Let's Encrypt validation fails. The certificate lapses, and all HTTPS connections to PocketBase return SSL errors — auth breaks for all users.

**Why it happens:** Let's Encrypt uses HTTP-01 or DNS-01 challenge. If the DDNS record points to a stale IP during renewal, the challenge fails. Synology DDNS updates typically happen within minutes, but if the NAS is offline during the renewal window, updates pause.

**Consequences:** All PocketBase API calls fail with SSL certificate errors. No user can authenticate. No data is accessible. Recovery requires the NAS to be online, DDNS to update, and Let's Encrypt renewal to succeed — potentially hours of downtime.

**Prevention:**
- In DSM, enable automatic certificate renewal under Control Panel > Security > Certificate and verify the renewal schedule.
- Set up a health check monitoring URL (free tier: UptimeRobot or BetterUptime) pointing to `https://pocketbase.gplg.synology.me/api/health` with alerts to email/phone.
- Document the manual renewal procedure for when automation fails.
- Consider a static IP from the ISP if the firm can afford it (~$5-15/month) — eliminates DDNS reliability risk entirely.
- Set the DDNS update interval to the minimum in DSM (typically 5 minutes).

**Detection:** `curl https://pocketbase.gplg.synology.me/api/health` returns SSL error. UptimeRobot alert fires.

**Phase:** Synology infrastructure setup phase. Configure monitoring before going live.

**Confidence:** MEDIUM — DDNS reliability depends on ISP behavior and NAS uptime. The risk is real; severity depends on ISP stability.

---

### Pitfall 7: PocketBase Running as Root on Synology

**What goes wrong:** PocketBase is often started directly as the `admin` user or root on Synology NAS for convenience. Running a web-accessible service as root means a PocketBase vulnerability could give an attacker root access to the entire NAS (and all its data, network shares, other services).

**Why it happens:** Synology's Task Scheduler (the most common way to run PocketBase as a service) defaults to running scheduled tasks as root unless explicitly changed.

**Consequences:** Security incident affecting not just the portal but all NAS data. Unacceptable for a law firm with confidential client files likely stored on the same NAS.

**Prevention:**
- Create a dedicated DSM user account with no special privileges for running PocketBase.
- In Task Scheduler, specify this user account under the task's "Run as" setting.
- Store the PocketBase data directory in a location this user owns, not a shared admin folder.
- Restrict PocketBase's data folder permissions to this user only.

**Detection:** Check the PocketBase process owner: in DSM Resource Monitor, find the PocketBase process and verify its user column is not `root` or `admin`.

**Phase:** Synology deployment phase. Configure before any data is stored.

**Confidence:** HIGH — DSM Task Scheduler behavior and principle of least privilege are well-established.

---

### Pitfall 8: PocketBase Admin Panel Exposed to Public Internet

**What goes wrong:** By default, PocketBase's admin panel is accessible at `https://pocketbase.gplg.synology.me/_/`. Since the NAS is internet-facing, the admin panel is publicly accessible to anyone who knows the URL. Brute-force attacks against the admin credentials are possible.

**Why it happens:** PocketBase has no built-in IP allowlist or admin panel access restriction. Every public-facing PocketBase instance exposes `/_/`.

**Consequences:** Admin credentials can be brute-forced. If admin account is compromised, attacker has full access to all collections, all client data, and can modify OAuth2 configuration.

**Prevention:**
- Use Synology's firewall (Control Panel > Security > Firewall) to block external access to the PocketBase port except from known IPs (developer's home IP, office IP) — or use Synology VPN for admin access.
- Set a strong, unique admin password (20+ characters, password manager). PocketBase does not enforce lockout by default.
- Use Synology's reverse proxy to route `/api/` to PocketBase but block `/_/` path from external access by returning 403 — allow `/_/` only from LAN IP ranges.
- Change the admin panel path if PocketBase supports it (check current PocketBase docs — this was not a native feature as of mid-2025 but may have changed).

**Detection:** Visit `https://pocketbase.gplg.synology.me/_/` from a non-office network. If the login page loads, it's publicly accessible.

**Phase:** Synology deployment phase, before any OAuth2 credentials are configured.

**Confidence:** MEDIUM — PocketBase admin panel exposure is a documented concern; Synology firewall/reverse proxy workarounds are well-established. Specific path-blocking capability depends on DSM version.

---

### Pitfall 9: OAuth2 State Parameter Not Validated — CSRF on Auth Callback

**What goes wrong:** The OAuth2 flow uses a `state` parameter to prevent CSRF attacks. If the frontend implementation does not verify that the `state` parameter returned in the OAuth2 callback matches the one generated before the redirect, an attacker can force a victim to log in as the attacker's account (login CSRF).

**Why it happens:** Developers building the auth flow manually (without using PocketBase's JS SDK) sometimes skip `state` validation because it appears to "work" without it. PocketBase's SDK handles this automatically, but custom implementations often omit it.

**Consequences:** A client could be tricked into authenticating as an attacker's account, potentially exposing attacker-controlled case data or allowing session fixation.

**Prevention:**
- Use PocketBase's official JS SDK (`pocketbase` npm package or CDN build) for the OAuth2 flow. It handles `state` generation and validation internally.
- Do not implement the OAuth2 redirect flow manually with raw `fetch` calls — the SDK abstracts the security-critical parts correctly.
- Verify the callback URL extracts `state` from the URL and compares it to what was stored before the redirect.

**Detection:** In the auth flow, check whether the `state` parameter in the redirect URL matches a value stored in `sessionStorage` before the OAuth redirect began.

**Phase:** Frontend auth implementation phase.

**Confidence:** HIGH — OAuth2 CSRF via state parameter is a well-documented attack vector; PocketBase SDK handles it correctly.

---

### Pitfall 10: Role Assignment Relies on OAuth2 Email Domain — Easily Spoofed

**What goes wrong:** A common pattern is to assign "staff" role to users whose Google/Microsoft email ends in `@grandparklawgroup.com`. If the firm does not own that Google Workspace domain with verified accounts, or if the check is done client-side only, a user can register a Gmail account like `name@grandparklawgroup.com.evil.com` to bypass domain checks.

**Why it happens:** Domain-based role assignment seems simple and elegant but requires the OAuth2 provider to actually verify domain ownership (Google Workspace does; personal Gmail accounts do not).

**Consequences:** Unauthorized users gain staff access. Client case data exposed. If role is checked client-side by the JavaScript, any user can modify the check in browser DevTools.

**Prevention:**
- Never assign roles client-side. Role assignment must happen in PocketBase — either via admin-assigned roles at account creation, or via PocketBase hooks/rules.
- For staff accounts: manually create staff user records in PocketBase with `role: "staff"` after account creation. First-login provisioning should place new OAuth2 users in a pending state requiring admin approval.
- For clients: same pattern — admin creates the client record linked to their OAuth2 account.
- Do not rely on email domain alone for role determination unless using Google Workspace with verified organizational accounts and restricting the OAuth2 app to that workspace.
- Set PocketBase collection-level API rules so that only users with `role = "staff"` can access staff-only collections.

**Detection:** Create a test Google account not in the firm's domain and attempt to log in. Verify the account ends up in "pending" state rather than receiving staff access.

**Phase:** Role/permissions design phase, before any data is loaded into the portal.

**Confidence:** HIGH — client-side authorization bypass is a universal web security issue; PocketBase collection rules are the correct mitigation.

---

## Minor Pitfalls

---

### Pitfall 11: PocketBase SQLite File Not Backed Up

**What goes wrong:** PocketBase uses a single SQLite file (`pb_data/data.db`) for all data including user accounts, OAuth tokens, collection data, and application config. If the Synology NAS drive fails and there is no backup, all portal data is lost — requiring users to re-authenticate and all case data to be re-entered.

**Prevention:**
- Enable Synology Hyper Backup to back up the `pb_data/` directory to an external drive or Synology C2 (free tier available).
- Schedule backups at minimum daily, ideally every 6 hours for active portal data.
- Test restoration from backup before going live — not just backup creation.
- PocketBase has a built-in backup API endpoint (`/api/backups`) that can be triggered on a schedule via DSM Task Scheduler.

**Phase:** Synology deployment phase, before any live data is written.

**Confidence:** HIGH — SQLite single-file data loss risk is well-understood.

---

### Pitfall 12: Cloudflare Pages `_redirects` Conflicts with Portal Routes

**What goes wrong:** The static site uses client-side route guarding for `/portal/staff/` and `/portal/client/`. Cloudflare Pages serves the static HTML files directly. If `_redirects` rules are not configured correctly, a user navigating directly to `/portal/staff/` gets the HTML file served without auth checking (the page renders, then JS redirects — visible flash of ungated content).

**Prevention:**
- Auth gating must be enforced by JavaScript on page load — the page should show a loading spinner (or nothing) until the auth check completes, then either display content or redirect to login.
- Do not use `_redirects` to redirect unauthenticated users — this requires server-side session knowledge that Cloudflare Pages doesn't have.
- Structure the portal pages to render a blank authenticated shell by default; only populate content after `pb.authStore.isValid` is confirmed.

**Phase:** Frontend auth implementation phase.

**Confidence:** HIGH — standard static site auth pattern constraint.

---

### Pitfall 13: PocketBase Version Pinning — Upgrade Breaks Schema

**What goes wrong:** PocketBase has had breaking changes between minor versions (particularly collection schema and API response format changes in the v0.x to v0.2x transition). If the PocketBase binary is updated on the Synology without reviewing the changelog, collection rules, API calls in the frontend, and auth flow may silently break.

**Prevention:**
- Document the exact PocketBase version deployed (e.g., `v0.22.x`).
- Do not enable auto-update on the PocketBase binary. Update manually after reading the changelog.
- Keep the old binary alongside the new one for rollback.
- Run a smoke test after any update: verify OAuth2 login, collection read, and admin panel access.

**Phase:** Synology deployment phase — pin version in deployment docs.

**Confidence:** MEDIUM — based on PocketBase's release history through mid-2025. Specific breaking changes depend on version.

---

### Pitfall 14: Missing Content-Security-Policy Allows Token Exfiltration

**What goes wrong:** Without a `Content-Security-Policy` header on portal pages, any injected or third-party script can read `localStorage`/`sessionStorage` and make requests to arbitrary domains, potentially exfiltrating auth tokens or case data.

**Prevention:**
- In the Cloudflare Pages `_headers` file, add strict CSP for portal pages:
  ```
  /portal/*
    Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://pocketbase.gplg.synology.me; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:
  ```
- Do not include any external analytics, tag managers, or third-party scripts on `/portal/*` pages.
- Add `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` to portal page headers.

**Phase:** Frontend implementation phase, before any auth or data is wired up.

**Confidence:** HIGH — CSP configuration for static sites via Cloudflare `_headers` is well-documented.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| PocketBase installation on Synology | Running as root (Pitfall 7), admin panel exposed (Pitfall 8) | Dedicated DSM user, firewall rules before first run |
| Let's Encrypt / HTTPS setup | DDNS IP staleness causes cert failure (Pitfall 6) | Set up uptime monitoring day one |
| Google OAuth2 provider config | Wrong redirect URI (Pitfall 1) | Register PocketBase `/api/oauth2-redirect` URL, not frontend URL |
| Microsoft OAuth2 provider config | Single-tenant rejects personal accounts (Pitfall 4) | Set "consumers" or "common" tenant, test with real personal account |
| CORS configuration | Frontend calls blocked (Pitfall 2) | Allowlist Cloudflare Pages origin before any frontend work |
| Synology reverse proxy setup | Timeout kills SSE / long connections (Pitfall 3) | Document limitation; avoid realtime API in v1 |
| Frontend auth implementation | Token in localStorage (Pitfall 5), no state validation (Pitfall 9) | Use PocketBase JS SDK, override to sessionStorage |
| Role and permissions design | Client-side role bypass (Pitfall 10) | All role checks in PocketBase collection rules, not JS |
| Content security hardening | Token exfiltration via injected script (Pitfall 14) | CSP headers in `_headers` file |
| Go-live | No backup of SQLite (Pitfall 11) | Hyper Backup configured before any real data |

---

## Sources

- PocketBase official documentation (https://pocketbase.io/docs/) — not accessible during research session; verify OAuth2 and CORS sections directly.
- OAuth2 redirect URI requirements: Google Identity Platform docs, Microsoft Identity Platform docs (AADSTS error codes).
- Synology DSM reverse proxy behavior: based on nginx defaults and DSM documentation patterns through mid-2025.
- PocketBase JS SDK behavior: training knowledge through August 2025. Verify current `AuthStore` API in SDK source (https://github.com/pocketbase/js-sdk).

**Overall confidence:** MEDIUM — pitfalls derived from training knowledge without live verification. Core OAuth2 and CORS behaviors are HIGH confidence (universal standards). Synology-specific and PocketBase-specific details are MEDIUM confidence. Recommend validating Pitfalls 3, 6, 8, and 13 against current Synology DSM docs and PocketBase changelog before implementation.
