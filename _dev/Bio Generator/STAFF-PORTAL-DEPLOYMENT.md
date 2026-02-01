# Staff Portal — Deployment Guide

## Grand Park Law Group · Internal Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Classification:** Internal — IT / DevOps

---

## Overview

This guide covers the deployment of the Staff Portal system, which includes a post-login dashboard, the Bio Page Generator tool, and Cloudflare Access authentication. The system is designed as a static HTML deployment protected at the edge — no backend code required.

---

## File Structure

```
/portal/
├── index.html                  ← Portal gateway (client/staff selection)
├── client-login.html           ← Client login page
├── staff-login.html            ← Staff login page
│
└── staff/                      ← PROTECTED — Cloudflare Access boundary
    ├── index.html              ← Staff Dashboard (this deployment)
    │
    └── tools/
        └── bio-generator.html  ← Bio Page Generator (internal tool)
```

**Key principle:** Everything inside `/portal/staff/` requires authentication via Cloudflare Access. Everything outside that path remains publicly accessible (login pages, portal gateway).

---

## Deliverables

| File | Description | Size | Destination |
|------|-------------|------|-------------|
| `grandpark-staff-dashboard.html` | Staff Dashboard hub page | ~22 KB | `/portal/staff/index.html` |
| `grandpark-bio-generator.html` | Bio Page Generator tool | ~90 KB | `/portal/staff/tools/bio-generator.html` |
| `grandpark-attorney-bio-template.html` | Attorney bio base template | ~67 KB | Reference only |
| `grandpark-staff-bio-template.html` | Staff bio base template | ~56 KB | Reference only |
| `grandpark-attorney-bio-SAMPLE.html` | Attorney sample bio | ~46 KB | Reference only |
| `grandpark-staff-bio-SAMPLE.html` | Staff sample bio | ~35 KB | Reference only |

---

## Step 1 — Deploy Static Files

### Method A: Git Repository (Recommended)

If the portal is managed within the Eleventy site repository:

```bash
# From repository root
mkdir -p src/portal/staff/tools

# Copy dashboard
cp grandpark-staff-dashboard.html src/portal/staff/index.html

# Copy bio generator
cp grandpark-bio-generator.html src/portal/staff/tools/bio-generator.html

# Commit and push
git add src/portal/staff/
git commit -m "feat: add staff dashboard and bio generator tool"
git push origin main
```

Cloudflare Pages will build and deploy automatically.

### Method B: Direct Upload (Cloudflare Dashboard)

1. Go to **Cloudflare Dashboard → Pages → [your project]**
2. Click **Create deployment → Upload assets**
3. Upload files maintaining the directory structure:
   - `portal/staff/index.html` ← dashboard
   - `portal/staff/tools/bio-generator.html` ← generator
4. Click **Deploy**

### Method C: Wrangler CLI

```bash
# Prepare upload directory
mkdir -p deploy/portal/staff/tools

cp grandpark-staff-dashboard.html deploy/portal/staff/index.html
cp grandpark-bio-generator.html deploy/portal/staff/tools/bio-generator.html

# Deploy
npx wrangler pages deploy deploy/ --project-name=<your-project-name>
```

---

## Step 2 — Configure Cloudflare Access

Cloudflare Access (Zero Trust) protects `/portal/staff/` at the CDN edge before any request reaches the origin. Free tier supports up to 50 users.

### 2.1 Enable Zero Trust

1. Navigate to **Cloudflare Dashboard → Zero Trust** (or https://one.dash.cloudflare.com)
2. If first time, follow the setup wizard and choose the **Free** plan
3. Select your account

### 2.2 Create an Access Application

1. Go to **Zero Trust → Access → Applications**
2. Click **Add an application**
3. Choose **Self-hosted**

Configure as follows:

| Field | Value |
|-------|-------|
| **Application name** | `Grand Park Staff Portal` |
| **Session Duration** | `24 hours` (or per firm policy) |
| **Application domain** | `www.grandparklaw.com` (or your Pages domain) |
| **Path** | `/portal/staff/` |

> **Critical:** The trailing slash on `/portal/staff/` ensures the entire subdirectory is protected.

Click **Next**.

### 2.3 Create Access Policy

| Field | Value |
|-------|-------|
| **Policy name** | `Staff — Google Workspace` |
| **Action** | `Allow` |
| **Include rule** | Emails Ending In: `@grandparklaw.com` |

**Alternative configurations:**

For specific users only:
- **Include rule → Emails:** list individual email addresses

For Google Workspace group:
- **Include rule → Login Methods:** `Google`
- **Include rule → Emails Ending In:** `@grandparklaw.com`

For Microsoft 365 hybrid:
- Add a second **Include** rule: `Emails Ending In: @grandparklaw.onmicrosoft.com`

Click **Next**, then **Add application**.

### 2.4 Verify Protection

```bash
# This should redirect to Cloudflare Access login screen
curl -I https://www.grandparklaw.com/portal/staff/

# Expected response:
# HTTP/2 302
# location: https://[team-name].cloudflareaccess.com/cdn-cgi/access/login/...
```

Access the URL in a browser. You should see the Cloudflare Access login gate before reaching the dashboard.

### 2.5 Customize Login Appearance (Optional)

1. Go to **Zero Trust → Settings → Authentication → Login page**
2. Upload the Grand Park logo
3. Set background color to `#1a1915`
4. Set header text: "Grand Park Law Group — Staff Portal"

---

## Step 3 — Configure Staff Login Redirect

Update the existing `staff-login.html` to redirect authenticated users to the dashboard. After successful SSO authentication through Cloudflare Access, users land on `/portal/staff/` automatically. However, to provide a manual entry point:

### Option A: Direct Link from Staff Login

In `staff-login.html`, update the SSO button's behavior to point to the protected path. Cloudflare Access will intercept the request and present the login gate if the user isn't authenticated, then redirect to the dashboard upon success:

```html
<!-- Replace the Google Workspace SSO button href -->
<a href="/portal/staff/" class="sso-btn google-sso">
    <svg>...</svg>
    Sign in with Google Workspace
</a>
```

### Option B: JavaScript Redirect After Auth

```javascript
// Add to staff-login.html <script> section
// Check if user has a valid CF Access token
const cfToken = document.cookie.split(';').find(c => c.trim().startsWith('CF_Authorization='));
if (cfToken) {
    window.location.href = '/portal/staff/';
}
```

---

## Step 4 — Verify Bio Generator

The Bio Page Generator is a self-contained 90 KB HTML file with zero external dependencies (other than Google Fonts). Verify the following functions work after deployment:

### Functional Checklist

| Feature | Test Action | Expected Result |
|---------|-------------|-----------------|
| Category Toggle | Click "Attorney" / "Staff" | Form fields switch appropriately |
| Live Preview | Fill form, click "Preview" | iframe shows rendered bio page |
| Download HTML | Click "Download HTML" | `.html` file downloads with correct filename |
| Download vCard | Click "vCard" | `.vcf` file downloads with contact info |
| Photo Upload | Upload an image file | Photo appears in preview hero section |
| Repeatable Fields | Click "+ Add" buttons | New education / bar / matter entries appear |
| Remove Entries | Click "×" on repeatable items | Entry is removed |
| Responsive Preview | Resize browser window | Preview frame updates layout |
| Form Validation | Submit with empty required fields | Toast notification warns user |

### Output Verification

After generating a bio page, verify the downloaded HTML:

1. Open the `.html` file in a browser
2. Confirm all sections render (hero, bio, credentials, footer)
3. Verify responsive layout at mobile breakpoints
4. Test Print/PDF output via browser print dialog
5. Confirm vCard opens correctly in Contacts app

---

## Step 5 — Update Application URLs

The Staff Dashboard ships with placeholder URLs for internal applications. Update these to match your actual deployment domains:

```
erp.gplg.app        → ERPNext / Frappe
billing.gplg.app    → Invoice Ninja
chat.gplg.app       → Mattermost
cms.gplg.app        → Directus CMS
blog.gplg.app       → Ghost CMS
newsletters.gplg.app → Listmonk
marketing.gplg.app  → Mautic
files.gplg.app      → File Manager / Synology
passwords.gplg.app  → Password Vault
support.gplg.app    → IT Support
```

Edit the `href` attributes in the dashboard HTML if any domains differ from the above.

---

## Architecture Diagram

```
                        ┌─────────────────────────────────┐
                        │       Cloudflare Edge CDN        │
                        │                                  │
    User Request ──────►│  DNS → SSL → Access Policy Check │
                        │                                  │
                        └───────────┬─────────────────┬────┘
                                    │                 │
                        ┌───────────▼──────┐  ┌───────▼──────────┐
                        │  /portal/staff/* │  │  /portal/* (else) │
                        │  ── PROTECTED ── │  │  ── PUBLIC ──     │
                        │                  │  │                   │
                        │  CF Access Gate  │  │  No auth required │
                        │  → Google SSO    │  │  Login pages      │
                        │  → Email verify  │  │  Gateway           │
                        └───────┬──────────┘  └───────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Staff Dashboard     │
                    │   /portal/staff/      │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │ Bio Generator   │  │
                    │  │ /staff/tools/   │  │
                    │  └─────────────────┘  │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │ Future Tools    │  │
                    │  │ /staff/tools/   │  │
                    │  └─────────────────┘  │
                    └───────────────────────┘
```

---

## Security Notes

1. **Edge authentication**: Cloudflare Access blocks unauthenticated requests at the CDN edge. Requests never reach the origin server without a valid JWT.

2. **JWT validation**: The `CF_Authorization` cookie contains a signed JWT. The dashboard reads this token client-side for display purposes only (user greeting). Never use client-side JWT parsing for access control decisions.

3. **No sensitive data in static files**: The dashboard and bio generator contain no secrets, API keys, or server-side logic. All authentication is handled by Cloudflare Access infrastructure.

4. **robots.txt**: Both files include `<meta name="robots" content="noindex, nofollow">` to prevent search engine indexing. Additionally, consider adding to your `robots.txt`:
   ```
   User-agent: *
   Disallow: /portal/staff/
   ```

5. **Session management**: Cloudflare Access sessions expire according to the configured session duration (default recommendation: 24 hours). Users must re-authenticate after expiry.

---

## Adding Future Tools

The `/portal/staff/tools/` directory is designed to grow. To add a new internal tool:

1. Create the tool as a self-contained HTML file
2. Place it at `/portal/staff/tools/[tool-name].html`
3. Add a new `<a class="app-card">` block to the dashboard's Internal Tools section
4. Deploy via your preferred method

The tool inherits Cloudflare Access protection automatically — no additional configuration needed for anything under `/portal/staff/`.

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Access loop / infinite redirect | Verify the application domain and path match exactly in CF Access settings |
| "Access Denied" for valid user | Check that the user's email matches the Access policy (e.g., ends in `@grandparklaw.com`) |
| Dashboard shows "Staff Member" instead of name | CF_Authorization cookie may not be set; verify Cloudflare Access is active on the path |
| Bio generator preview blank | Check browser console for errors; ensure Google Fonts can load (fonts.googleapis.com not blocked) |
| Download not triggering | Some browsers block programmatic downloads; try right-click → Save As on the download button |
| 404 on `/portal/staff/` | Ensure the file is deployed as `index.html` inside the `staff/` directory |
| CSS not rendering correctly | Clear browser cache; verify the HTML file is served with `text/html` content type |
