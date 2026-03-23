# Grand Park Law Group — Portal & SSO

## What This Is

A secure portal system for Grand Park Law Group's existing static website, adding Google and Microsoft SSO authentication via PocketBase (self-hosted on Synology NAS). Staff get a firm metrics dashboard; clients get case status visibility. The frontend remains a static site on Cloudflare Pages, communicating with PocketBase at `pocketbase.gplg.synology.me`.

## Core Value

Staff and clients can securely sign in with Google or Microsoft and immediately see the information relevant to them — firm metrics for staff, case status for clients.

## Requirements

### Validated

- ✓ Static law firm website with practice areas, attorney bios, resources — existing
- ✓ Staff portal page at `/portal/staff/` — existing (currently ungated)
- ✓ Design system with consistent tokens, typography, responsive layout — existing
- ✓ SEO infrastructure (structured data, sitemap, robots.txt) — existing
- ✓ Cloudflare Pages hosting — existing

### Active

- [ ] Deploy PocketBase on Synology DSM server
- [ ] Configure Google OAuth2 provider in PocketBase
- [ ] Configure Microsoft OAuth2 provider in PocketBase
- [ ] SSO login page — choose Google or Microsoft to sign in
- [ ] Role-based access: staff vs. client accounts
- [ ] Staff dashboard — firm metrics (case counts, deadlines, billable hours overview)
- [ ] Client portal — case status updates visible after login
- [ ] Auth-gated routes — staff and client portals require login, redirect if unauthenticated
- [ ] PocketBase collections for cases, staff, clients, metrics
- [ ] Logout flow — clear session, redirect to public site

### Out of Scope

- Auth0 or other third-party auth service — PocketBase handles auth natively
- Document upload/sharing — defer to future version
- Secure messaging between clients and attorneys — defer to future version
- Invoice/payment processing — defer to future version
- Time/billing entry for staff — defer to future version
- Case management (CRUD) for staff — v1 is read-only dashboard
- Mobile app — web-first
- Custom email/password auth — SSO only for v1

## Context

- **Existing site:** Static HTML/CSS/JS law firm website hosted on Cloudflare Pages. No build tooling, no framework, vanilla JS with progressive enhancement.
- **PocketBase:** Will be deployed on Synology NAS at `pocketbase.gplg.synology.me`. Provides auth (OAuth2), database (SQLite), and REST API in a single binary. Not yet deployed — setup is part of this project.
- **Synology DDNS:** The NAS is reachable via `gplg.synology.me` using Synology's built-in DDNS service.
- **Design system:** Existing CSS custom properties (gold/charcoal/cream palette, Cormorant Garamond + Outfit fonts) should be used for portal UI consistency.
- **No Microsoft 365:** Staff don't have M365 accounts — Microsoft SSO will use personal Microsoft accounts.
- **Zero-cost constraint:** All infrastructure must be free-tier or self-hosted.

## Constraints

- **Hosting:** Cloudflare Pages (static frontend) — no server-side rendering available
- **Backend:** PocketBase on Synology NAS — single binary, SQLite-backed
- **Cost:** $0 — all services must be free tier or self-hosted
- **Auth:** Google and Microsoft OAuth2 only — no email/password
- **CORS:** PocketBase must allow requests from the Cloudflare Pages domain
- **HTTPS:** Synology DDNS provides SSL via Let's Encrypt — PocketBase API must be served over HTTPS
- **Design:** Must match existing site design tokens (colors, fonts, spacing)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PocketBase over Auth0 | Self-hosted on existing Synology NAS, handles both auth and DB, zero cost | — Pending |
| PocketBase over Firebase/Supabase | User wants self-hosted, zero-cost solution; Synology already available | — Pending |
| Google + Microsoft SSO (no email/password) | Simplifies auth flow, no password management burden | — Pending |
| Static frontend + PocketBase API | Keeps current Cloudflare Pages hosting, PocketBase provides REST API | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-22 after initialization*
