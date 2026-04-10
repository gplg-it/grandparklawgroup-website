# Feature Landscape

**Domain:** Law firm authenticated portal (staff dashboard + client case portal)
**Project:** Grand Park Law Group — Portal & SSO
**Researched:** 2026-03-22
**Confidence:** HIGH (domain well-understood; existing site examined directly)

---

## Context: What This Milestone Is Actually Building

The existing staff portal at `/portal/staff/` is already an app-launcher: it links out to ERPNext, Invoice Ninja, Mattermost, Directus, Ghost, Listmonk, Mautic, and Synology file storage. That content and structure already exists.

This milestone adds **two new things only:**

1. **Auth gate** — PocketBase SSO (Google + Microsoft OAuth2) protects both portals. Unauthenticated visitors are redirected to login.
2. **Live data surfaces** — Staff see a firm metrics dashboard (case counts, deadlines, billable hours snapshot). Clients see their case status after login.

Everything else is out of scope for v1.

---

## Staff Dashboard

### Table Stakes

Features staff will expect the moment they land on an authenticated dashboard. Missing any of these makes the portal feel incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Identity display (name + avatar from OAuth) | SSO login provides user info — not showing it feels like a bug | Low | PocketBase returns name/avatar from Google/Microsoft OAuth token |
| Session-aware greeting ("Welcome back, [Name]") | Personalization that confirms the auth worked | Low | Already scaffolded in HTML; replace static with live data |
| Logout button | Standard — any authenticated surface needs an explicit way out | Low | Clear PocketBase token from localStorage/cookie, redirect to `/portal/` |
| Redirect-if-unauthenticated | Without this, auth is theater | Low | JS guard on page load; check PocketBase token validity |
| Active case count | The single most useful metric for a litigation firm — shows workload | Low-Med | Read from PocketBase `cases` collection, filter by status |
| Upcoming deadlines (next 7–14 days) | Missed deadlines are malpractice risk — this is the first thing attorneys look for | Medium | Query cases by `deadline_date`, sort ascending, limit to horizon |
| Billable hours snapshot (current month) | Tells staff at a glance whether the firm is on track financially | Medium | Requires a `time_entries` or `metrics` collection; can be manually updated v1 |
| System status indicators (app links live/offline) | The existing app-launcher has 11 links — staff expect to know what's working | Low | Can be static badge initially; real monitoring is v2 |

### Differentiators

Features that would set this dashboard apart from a generic intranet portal.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Practice-area case breakdown | Shows which departments (civil rights, employment, entertainment, etc.) are busiest — informs staffing | Medium | Group cases by `practice_area` field; bar or count display |
| Deadline urgency indicators (red/amber/green) | Attorneys triage by urgency — color-coded deadlines are faster to scan than a date list | Low | CSS status classes on deadline cards; logic is date arithmetic |
| Announcements from PocketBase (not hardcoded) | Currently announcements are hardcoded HTML; pulling from PocketBase makes them editable without deploys | Low-Med | PocketBase `announcements` collection; staff admin can post without touching code |
| Staff-only quick note / pinned reminders | A simple scratchpad visible only to the logged-in user | High | Requires per-user record in PocketBase — defer to v2 |
| Recent activity feed (last 5 case updates) | Situational awareness — "what changed since I was last here" | Medium | Requires `updated` timestamp on cases + sort query |

### Anti-Features (Staff Dashboard)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Time/billing entry forms | Full billing UI is Invoice Ninja's job — duplicating it creates data sync debt | Link to Invoice Ninja from the app launcher (already exists) |
| Case CRUD (create/edit/delete cases) | v1 is read-only; writing case data requires validation, audit logs, and conflict handling | Defer to v2 milestone; v1 is observe-only |
| Document upload/management | Synology file storage already handles this — competing with it fragments the workflow | Keep Synology file manager link in app launcher |
| Staff messaging/chat | Mattermost is already deployed and linked — building a second messaging surface creates confusion | Keep Mattermost link; do not replicate |
| Role-management UI (add/remove staff) | PocketBase admin UI handles this fine at this scale | Use PocketBase admin panel directly |
| Dashboard analytics for the website (SEO, traffic) | The seo-dashboard/ directory suggests this exists separately | Keep SEO monitoring out of the staff portal |

---

## Client Portal

### Table Stakes

Features clients will expect. Without these, clients cannot use the portal and will call or email instead — defeating the purpose.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Identity confirmation (name, which attorney is handling matter) | Client needs to confirm they're seeing their own data, not another client's | Low | Show `client.name` and `assigned_attorney` from PocketBase |
| Case/matter name and reference number | This is the anchor — clients refer to their matter by name when calling | Low | Top of the page; prominent display |
| Current case status (e.g., "Discovery", "Pre-Trial", "Settled") | The reason the portal exists — replaces "any update?" phone calls | Low | Status field on `cases` collection; map to human-readable labels |
| Last updated timestamp | "Status: Active" without a date is useless — clients want to know when something changed | Low | `updated` field on case record |
| Next step or upcoming date | What happens next? Clients are anxious — a single "Next: Mediation on April 15" line reduces support calls dramatically | Low-Med | `next_step` text field + optional `next_date` date field on case record |
| Attorney contact info | When clients have questions after reading status, they need to know who to call | Low | Static or from `professionals` collection; don't require clicking away |
| Logout | Same as staff — any authenticated surface must have visible logout | Low | Same logout pattern as staff |
| Redirect-if-unauthenticated | Same as staff — auth must gate the page | Low | Same JS guard pattern |

### Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Status history / timeline | "Status changed from Investigation to Discovery on Feb 14" — gives clients a sense of progress without attorney contact | Medium | Requires `case_status_history` collection or append-only log; not required for v1 |
| Multiple matters for one client | A client might have more than one active matter | Low | Filter by `client_id` — handle list view if count > 1 |
| Practice-area context blurb | Brief one-paragraph explanation of what the current phase means (e.g., "Discovery is the phase where...") — reduces uninformed client calls | Low | Static copy keyed by status value; no DB required |
| Print-friendly matter summary | Clients sometimes need a paper record of their matter | Low | CSS print media query; already exists in staff portal CSS |
| "Questions? Contact us" CTA | Prominent, below the status — converts portal visit into direct engagement | Low | Link to `/contact/` or attorney email |

### Anti-Features (Client Portal)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Secure client-attorney messaging | Attorney-client privilege requirements, retention policies, bar compliance — this is a product unto itself | Defer to v2; use existing email/phone for now |
| Invoice/payment view | Invoice Ninja handles billing — duplicating this requires keeping two systems in sync | Defer to v2; clients get invoices via Invoice Ninja directly |
| Document download (retainer agreements, discovery, filings) | Confidential legal documents require access auditing, versioning, and encryption at rest — not appropriate for v1 static + PocketBase | Defer to v2 or use a dedicated document portal |
| Client self-registration | New clients must be vetted and conflicts-checked before getting portal access — self-signup is ethically problematic | Staff create client accounts manually in PocketBase admin |
| Case search or filter | Most clients have 1–3 active matters — search adds complexity with no benefit at this scale | Simple list; filter is v2 when volume warrants it |
| Notifications / email alerts on status change | PocketBase supports hooks but reliable email delivery (SMTP, SPF/DKIM) requires separate setup | Defer to v2; clients check portal on their own schedule |

---

## Auth Flow (Both Portals)

### Table Stakes

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Google OAuth2 "Sign in with Google" button | Google accounts are universal — all staff and most clients have one | Low-Med | PocketBase OAuth2 redirect flow; standard implementation |
| Microsoft OAuth2 "Sign in with Microsoft" button | Staff requested this; personal Microsoft accounts, not M365 | Low-Med | Same PocketBase OAuth2 pattern as Google |
| Role detection post-login | After auth, the app must decide: show staff dashboard or client portal | Low | Check PocketBase user record for `role` field (staff / client) |
| Invalid role redirect | A client accidentally hitting the staff login URL should be redirected, not shown a broken page | Low | After role check, redirect to appropriate portal or show "access not provisioned" message |
| Token persistence (stay logged in across page refreshes) | Logging out on refresh makes the portal unusable | Low | Store PocketBase JWT in localStorage; validate on page load |
| Expired token handling | PocketBase tokens expire — graceful re-auth, not a silent blank screen | Low | Catch 401 from PocketBase API, redirect to login |

### Anti-Features (Auth)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Email/password sign-in | Password management, reset flows, breach liability — out of scope per PROJECT.md | SSO only for v1 |
| "Remember me" checkbox | PocketBase token handling already provides session persistence; checkbox is redundant complexity | Rely on token TTL |
| Multi-factor authentication UI | Google/Microsoft OAuth already handles MFA on their end | Trust IdP-managed MFA |

---

## Feature Dependencies

```
PocketBase deployed + HTTPS
  └── OAuth2 providers configured (Google, Microsoft)
       └── Auth flow (login page, token storage, role check)
            ├── Staff auth gate
            │    └── Firm metrics dashboard (reads cases, metrics collections)
            │         └── Announcements from PocketBase (replaces hardcoded HTML)
            └── Client auth gate
                 └── Case status view (reads cases, filtered by client_id)
                      └── Multiple-matter list (if client has > 1 case)
```

### Hard Dependencies (cannot build without)

- PocketBase running and reachable at `pocketbase.gplg.synology.me` over HTTPS
- Google OAuth2 app credentials configured in PocketBase admin
- Microsoft OAuth2 app credentials configured in PocketBase admin
- PocketBase collections: `users` (with role field), `cases` (with status, client_id, assigned_attorney, deadline_date, next_step), `metrics` or `time_entries`

### Soft Dependencies (can stub or defer)

- `announcements` collection — staff dashboard works without it; fall back to hardcoded HTML initially
- `case_status_history` — client portal works with current-status-only in v1
- Practice-area breakdown — staff dashboard works with total case count only; breakdown is additive

---

## MVP Recommendation

Prioritize in this order for v1:

1. **PocketBase + OAuth2 setup** — Nothing else works without this
2. **Auth gate on both portals** — Protects existing pages; immediate security value
3. **Role-based routing** — Sends staff to `/portal/staff/` and clients to a new `/portal/client/` page
4. **Client case status view** — The client-facing value proposition; shows matter name, status, last updated, next step, attorney contact
5. **Staff metrics strip** — Add a live data row to the existing staff dashboard: active case count, upcoming deadline count (next 14 days), billable hours (current month) — replaces the current static status cards
6. **Live announcements** — Pull from PocketBase `announcements` collection so staff can post without a deploy

**Defer to v2:**
- Status history / audit trail
- Secure messaging
- Document management
- Invoice/payment view
- Email notifications on case updates
- Granular role permissions beyond staff/client binary

---

## Sources

- Direct inspection of existing portal files (`/portal/staff/index.html`, `/portal/client-login.html`, `/portal/index.html`)
- Project requirements: `.planning/PROJECT.md`
- Domain knowledge of law firm portal patterns (attorney-client privilege considerations, malpractice risk from missed deadlines, bar ethics on self-registration) — HIGH confidence, well-established legal industry practice
- PocketBase OAuth2 capabilities known from training data (August 2025 cutoff) — MEDIUM confidence; recommend verifying current OAuth2 provider setup docs at pocketbase.io/docs before implementation
