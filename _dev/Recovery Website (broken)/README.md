# Grand Park Law Group — Website

**Grand Park Law Group, A.P.C.**  
11835 W Olympic Blvd, Suite 870E  
Los Angeles, CA 90064  
[grandparklaw.com](https://grandparklaw.com)

---

## Architecture

Static HTML website. No build step required — the `src/` directory is the deployable root.

| Layer | Technology |
|-------|-----------|
| Hosting | Cloudflare Pages |
| Fonts | Google Fonts (Cormorant Garamond + Outfit) |
| Video | Mixkit CDN |
| Analytics | Cloudflare Web Analytics |
| CMS | Ghost + Google Sheets (Insights page) |

## Directory Structure

```
grandpark-law-website/
├── src/                    ← Deploy this directory
│   ├── index.html          ← Landing page (self-contained inline CSS/JS)
│   ├── about/
│   ├── careers/
│   ├── contact/
│   ├── diversity/
│   ├── insights/           ← CMS-integrated (Ghost + Sheets)
│   ├── legal/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── attorney-advertising/
│   ├── portal/             ← Client/Staff login gateway
│   ├── practices/          ← Overview + 7 practice areas
│   ├── pro-bono/
│   ├── professionals/      ← Overview + attorney bios
│   └── assets/
│       ├── css/            ← design-system.css, main.css
│       ├── js/             ← main.js
│       └── images/         ← See images/README.md for required files
├── docs/                   ← Internal documentation
├── _templates/             ← Attorney bio template + sample
├── _reference/             ← Competitor sites (gitignored)
├── .gitignore
├── package.json
└── README.md
```

## Page Inventory

### Fully Built (9 unique pages)

| Route | Title | Lines |
|-------|-------|-------|
| `/` | Landing | 1,584 |
| `/about/` | About | 603 |
| `/practices/` | Practice Areas | 599 |
| `/professionals/` | Our Professionals | 351 |
| `/insights/` | Insights | 1,732 |
| `/contact/` | Contact | 502 |
| `/legal/privacy/` | Privacy Policy | 417 |
| `/legal/terms/` | Terms of Use | 386 |
| `/legal/attorney-advertising/` | Attorney Advertising | 398 |

### Stub Pages (12 pages — route structure in place, content pending)

| Route | Title |
|-------|-------|
| `/careers/` | Careers |
| `/diversity/` | Diversity & Inclusion |
| `/pro-bono/` | Pro Bono |
| `/practices/personal-injury/` | Personal Injury |
| `/practices/medical-malpractice/` | Medical Malpractice |
| `/practices/employment-law/` | Employment Law |
| `/practices/civil-rights/` | Civil Rights |
| `/practices/entertainment/` | Entertainment |
| `/practices/real-property/` | Real Property |
| `/practices/corporate-governance/` | Corporate Governance |
| `/professionals/armand-jaafari/` | Armand Jaafari |
| `/professionals/danae-rosario/` | Danae Rosario |

### Portal Pages (3 pages — self-contained)

| Route | Title |
|-------|-------|
| `/portal/` | Portal Access Gateway |
| `/portal/client-login.html` | Client Login |
| `/portal/staff-login.html` | Staff Login |

## Missing Assets

Local image files were never deployed to the origin server. See
`src/assets/images/README.md` for the full list and specifications.

All external CDN resources (Google Fonts, Mixkit videos, Unsplash images,
Cloudflare analytics) load correctly and require no local files.

## Local Development

```bash
npx serve src -l 3000
```

## Deployment

Deploy the `src/` directory to Cloudflare Pages. No build command needed —
set the build output directory to `src`.

```
Build command:       (leave blank)
Build output:        src
Root directory:      /
```

## Design System

- **Primary**: `#1a1915` (warm charcoal)
- **Accent**: `#c9a962` (champagne gold)
- **Surface**: `#2d2a24` (elevated charcoal)
- **Text**: `#faf9f6` (off-white)
- **Display font**: Cormorant Garamond (300–600)
- **Body font**: Outfit (200–600)

Full specification in `docs/DESIGN-SYSTEM.md`.
