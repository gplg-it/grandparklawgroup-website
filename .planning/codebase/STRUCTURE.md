# Codebase Structure

**Analysis Date:** 2026-03-22

## Directory Layout

```
grandparklawgroup.com/
├── index.html                          # Homepage
├── robots.txt                          # SEO: Search engine crawling rules
├── sitemap.xml                         # SEO: Site structure for indexing
├── README.md                           # Project documentation
│
├── assets/                             # Static assets (images, styles, scripts)
│   ├── css/
│   │   ├── design-system.css          # CSS custom properties, resets, spacing, typography
│   │   └── main.css                   # Component styles, page-specific styles
│   ├── images/
│   │   ├── attorneys/                 # Attorney headshot photos
│   │   ├── team/                      # Staff/team photos
│   │   ├── favicon.svg                # Browser favicon
│   │   ├── apple-touch-icon.png       # iOS home screen icon
│   │   └── logo.png                   # Company logo
│   └── js/
│       └── main.js                    # Client-side JavaScript (vanilla, no framework)
│
├── _templates/                        # Template files for content creation
│   ├── attorney-bio-template.html     # Template for attorney profile pages
│   ├── attorney-bio-SAMPLE.html       # Sample completed attorney bio
│   └── grandpark-bio-generator.html   # Tool for generating bio pages
│
├── _dev/                              # Development/archived files
│   ├── favicon - simple/              # Favicon design iterations
│   ├── favoicon - bold/               # (Note: typo in directory name)
│   ├── favoicon - cream shimmer/
│   ├── depcrecated/                   # Deprecated pages
│   └── Recovery Website (broken)/     # Backup/recovery files
│
├── .planning/                         # GSD planning documents
│   └── codebase/                      # Architecture and analysis docs
│
├── .claude/                           # Claude AI context files
│   └── settings.local.json
│
├── .vscode/                           # IDE configuration
│   ├── settings.json
│   └── extensions.json
│
├── .github/                           # GitHub configuration (empty or minimal)
│
├── .git/                              # Git repository (version control)
│
└── Content Directories (Page Structure):
    ├── about/index.html               # Company background and mission
    ├── careers/index.html             # Job opportunities
    ├── contact/index.html             # Contact form and office info
    ├── diversity/index.html           # Diversity statement
    ├── pro-bono/index.html            # Pro bono work and community
    ├── insights/index.html            # Blog/insights/articles (category page)
    │
    ├── practices/index.html           # Practice areas overview
    └── practices/{practice}/index.html # Individual practice area pages
        ├── business-torts/
        ├── civil-rights/
        ├── corporate-governance/
        ├── employment-law/
        ├── entertainment/
        ├── medical-malpractice/
        ├── personal-injury/
        └── real-property/
    │
    ├── professionals/index.html       # Attorney directory/grid
    └── professionals/{attorney}/index.html # Individual attorney bio pages
        ├── armand-jaafari/
        ├── danae-richie/
        ├── edrel-lou-g-dela-cerna/
        ├── fabiola-jimenez/
        ├── germeneil-guela-o-calibo/
        └── marvin-b-casamayor/
    │
    ├── resources/index.html           # Resources directory/overview
    ├── resources/us-courts/index.html # US court information
    ├── resources/public-agencies/index.html # Government agencies
    │
    ├── legal/                         # Legal/compliance pages
    │   ├── privacy/index.html         # Privacy policy
    │   ├── terms/index.html           # Terms of service
    │   └── attorney-advertising/index.html # Attorney advertising disclaimer
    │
    ├── portal/index.html              # Portal landing/access page
    ├── portal/staff-login.html        # Staff member login
    ├── portal/client-login.html       # Client login
    └── portal/staff/
        ├── index.html                 # Staff portal dashboard
        └── tools/
            └── bio-generator.html     # Web tool for generating attorney bio pages
    │
    └── seo-dashboard/                 # SEO monitoring/dashboard tools
        ├── gplg-seo-dashboard.html    # Main SEO dashboard
        └── gplg-seo-package.html      # SEO package information
```

## Directory Purposes

**assets/css/:**
- Purpose: All stylesheets for the site
- Contains: CSS custom properties, typography, component styles, animations
- Key files:
  - `design-system.css` - Global design tokens (colors, spacing, transitions, typography)
  - `main.css` - Component and page-specific styles

**assets/images/:**
- Purpose: All static images used on the site
- Contains: PNG, JPG, SVG files for logos, icons, photos
- Key subdirectories:
  - `attorneys/` - Professional headshots for attorney profiles
  - `team/` - Photos of staff and team members

**assets/js/:**
- Purpose: Client-side JavaScript enhancements
- Contains: Vanilla JS (no frameworks), event listeners, DOM manipulation
- Key files: `main.js` - Single monolithic JavaScript file with all client logic

**_templates/:**
- Purpose: Template files for manual content creation
- Contains: HTML templates with placeholder comments
- Usage: Copy template, replace placeholders with actual content, create new page

**_dev/:**
- Purpose: Development workspace, archived files, deprecated content
- Contains: Design iterations, broken versions, experimental work
- Status: Files here are not production-ready

**practices/**
- Purpose: Content for each legal practice area
- Structure: Flat directory with one `index.html` per practice area
- Pattern: Each practice page lists relevant attorneys and explains service details

**professionals/**
- Purpose: Content for each attorney
- Structure: Flat directory with one `index.html` per attorney
- Pattern: Each attorney page built from `_templates/attorney-bio-template.html`

**portal/**
- Purpose: Internal staff and client access areas
- Structure: Portal landing page, login pages, staff tools
- Access: Intended for authenticated users (authentication handled externally)

**legal/**
- Purpose: Compliance and legal disclosure pages
- Contains: Privacy policy, terms of service, advertising disclaimers
- Usage: Linked from footer, required for legal compliance

**resources/**
- Purpose: Public resources and external information
- Contains: Curated links to courts, government agencies, external resources
- Structure: Flat pages with categorized content

## Key File Locations

**Entry Points:**
- `index.html` - Homepage and main site entry point
- `portal/index.html` - Portal section entry point
- `practices/index.html` - Practice areas directory
- `professionals/index.html` - Attorney directory

**Configuration:**
- `.vscode/settings.json` - VS Code editor settings
- `.vscode/extensions.json` - Recommended VS Code extensions
- `.claude/settings.local.json` - Claude AI local settings

**Core Logic:**
- `assets/js/main.js` - All client-side JavaScript functionality
- `assets/css/design-system.css` - Design tokens and global styles
- `assets/css/main.css` - Component and page-specific styles

**SEO/Meta:**
- `robots.txt` - Search engine crawling directives
- `sitemap.xml` - XML sitemap for search engines
- `index.html` (head section) - Meta tags, structured data for homepage

**Templates:**
- `_templates/attorney-bio-template.html` - Template for attorney profile pages
- `_templates/attorney-bio-SAMPLE.html` - Completed example of attorney profile

## Naming Conventions

**Files:**
- Kebab-case for HTML files: `attorney-bio-template.html`
- Lowercase with hyphens for directories: `business-torts`, `civil-rights`
- Lowercase with hyphens for CSS files: `design-system.css`, `main.css`

**Directories:**
- Content directories use kebab-case: `practices/business-torts/`, `professionals/armand-jaafari/`
- Asset directories use lowercase: `assets/css/`, `assets/js/`, `assets/images/`
- Template directory underscore-prefixed: `_templates/`, `_dev/`

**HTML Structure:**
- All pages use `/index.html` pattern (no direct page names in URLs)
- URLs are directory-based: `/practices/business-torts/` not `/practices/business-torts.html`
- Canonical URLs always include trailing slash: `https://grandparklawgroup.com/about/`

**CSS Classes:**
- BEM-like naming with component prefix: `.loader`, `.loader-logo`, `.loader-bar`
- State classes: `.active`, `.scrolled`, `.hidden`, `.visible`
- Page-specific body class: `page-home`, `page-about`, `page-professionals`

**JavaScript Functions:**
- Camelcase with `init` prefix: `initLoader()`, `initMobileMenu()`, `initScrollReveal()`
- Private helper functions within IIFE: `closeMenu()`, `updateYear()`

## Where to Add New Code

**New Practice Area Page:**
1. Create directory: `practices/{practice-slug}/`
2. Create file: `practices/{practice-slug}/index.html`
3. Copy HTML structure from existing practice page (e.g., `practices/business-torts/index.html`)
4. Update:
   - `<title>` and meta descriptions
   - Canonical URL in `<link rel="canonical">`
   - Body class to `page-{practice-slug}` (optional)
   - Content sections with practice-specific text
   - JSON-LD structured data
5. Update navigation links in header/footer templates (if they exist)

**New Attorney Profile Page:**
1. Create directory: `professionals/{attorney-slug}/`
2. Create file: `professionals/{attorney-slug}/index.html`
3. Use template: Copy `_templates/attorney-bio-template.html`
4. Replace all `{{PLACEHOLDER}}` values with actual attorney information
5. Update meta tags, canonical URL, structured data
6. Add attorney photo to `assets/images/attorneys/{attorney-slug}.jpg`
7. Update `professionals/index.html` to link to new profile

**New Utility/Content Page:**
1. Create directory if needed: `{section}/`
2. Create file: `{section}/index.html`
3. Copy HTML structure from similar existing page
4. Update meta tags, title, canonical URL
5. Add content sections as needed
6. Update navigation if page should appear in menus

**New JavaScript Functionality:**
1. Add new function to `assets/js/main.js` following `initFunctionName()` pattern
2. Keep function encapsulated within IIFE with strict mode
3. Use event delegation where possible
4. Add to `init()` function to initialize on page load
5. Example structure:
```javascript
function initNewFeature() {
    const element = document.getElementById('elementId');
    if (!element) return;

    element.addEventListener('click', () => {
        // handler code
    });
}
```

**New CSS Component:**
1. Add to `assets/css/main.css` (not design-system.css)
2. Use existing CSS custom properties for colors, spacing, transitions
3. Follow BEM naming: `.component-name`, `.component-name__child`, `.component-name--modifier`
4. Reference design tokens: `color: var(--accent-gold);`, `padding: var(--space-md);`

**New Design Token:**
1. Add to `assets/css/design-system.css` in `:root` section
2. Follow naming pattern: `--category-variant` (e.g., `--accent-gold-light`)
3. Document in file header comment

## Special Directories

**_dev/:**
- Purpose: Development workspace and archived files
- Generated: No (manually created/managed)
- Committed: Yes (git tracks these for reference)
- Status: Content here is not used in production
- Cleanup: Safe to delete old iterations when finalizing

**_templates/:**
- Purpose: Reference templates for content creation
- Generated: No (manually created)
- Committed: Yes (templates are source material)
- Usage: Copy these files when creating new pages, don't edit the originals

**.planning/:**
- Purpose: GSD planning and analysis documents
- Generated: Yes (created by GSD commands)
- Committed: Yes (documents guide future work)
- Refresh: Re-run `/gsd:map-codebase` to update analysis

**.vscode/ and .claude/:**
- Purpose: IDE and AI tool configuration
- Generated: Some files generated by tools
- Committed: Yes (shared settings for team consistency)
- Edit: Modify as needed for team preferences

---

*Structure analysis: 2026-03-22*
