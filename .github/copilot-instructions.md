# Grand Park Law Group - AI Coding Instructions

## Project Overview

Grand Park Law Group website is a **static HTML law firm site** with a sophisticated design system and templated attorney bio pages. The site prioritizes **accessibility, SEO, and brand consistency** using a warm charcoal + champagne gold color scheme.

## Architecture & Core Patterns

### Design System (Source of Truth)
- **[assets/css/design-system.css](assets/css/design-system.css)** defines all CSS custom properties and global styles
- Primary palette: Warm charcoal (`#1a1915`), Champagne gold (`#c9a962`)
- Typography: Cormorant Garamond (display), Outfit (body) from Google Fonts
- Fluid typography uses `clamp()` for responsive sizing: `clamp(min, preferred, max)`
- Z-index scale (--z-loader: 9999, --z-modal: 500, etc.) prevents layering bugs

### Component Styles
- [assets/css/main.css](assets/css/main.css) builds on design-system with page components
- Loader animation on page load with return-visit optimization using sessionStorage
- Header scroll effect (backdrop blur) triggered at 100px threshold
- Mobile menu overlay system with separate `.menu-toggle` and `.menu-overlay` elements
- Lazy video loading via `data-src` attribute pattern

### Attorney Bio Template System
- [_templates/attorney-bio-template.html](/_templates/attorney-bio-template.html) is the canonical source
- Uses `{{PLACEHOLDER}}` syntax for content replacement (not a templating engine—manual replacement)
- Each attorney gets a nested directory: `professionals/{slug}/index.html`
- Includes structured data (schema.org Attorney type) and OpenGraph/Twitter meta tags
- vCard generation ready with attorney contact info

## Critical Workflows

### Creating New Attorney Pages
1. Copy [_templates/attorney-bio-template.html](/_templates/attorney-bio-template.html)
2. Replace ALL `{{PLACEHOLDER}}` values with actual attorney data
3. **Key replacements**: `{{ATTORNEY_SLUG}}`, `{{ATTORNEY_FULL_NAME}}`, `{{PRACTICE_AREAS_ARRAY}}`
4. Update relative paths for assets (e.g., `../../assets/css/main.css`)
5. Deploy to `professionals/{slug}/index.html`

### SEO & Metadata
- Every page has canonical URL, OG tags, and Twitter Card meta
- Structured data uses schema.org `LegalService` and `Attorney` types
- Site operates across multiple jurisdictions: California primary, Illinois secondary

### Relative Path Convention
- Root pages: `assets/css/main.css` (no `../`)
- Nested pages (2 levels deep): `../../assets/css/main.css`
- Template uses nested paths; copy appropriately per depth

## Project-Specific Conventions

### Naming & Organization
- Directory structure mirrors site navigation: `/practices/{practice-area}/index.html`
- Attorney slugs are lowercase, hyphen-separated: `armand-jaafari`, not `ArmandJaafari`
- Image paths follow pattern: `assets/images/attorneys/{slug}.jpg` and `{slug}-og.jpg`

### JavaScript Patterns
- [assets/js/main.js](assets/js/main.js) uses IIFE (Immediately Invoked Function Expression) wrapping
- `'use strict'` mode enforced
- Event listeners use `{ passive: true }` for scroll performance
- Elements checked for existence before DOM manipulation (defensive coding)
- Session storage used for UX optimization (e.g., loader animation variation)

### Accessibility Requirements
- Semantic HTML: `<header role="banner">`, `<nav role="navigation">`, `<button>` for clickables
- ARIA labels on interactive elements: `aria-label`, `aria-expanded`, `aria-modal`
- Color contrast maintained via CSS custom properties (gold on charcoal)
- Loader marked as `aria-hidden="true"` (decorative)

### Git Workflow
- Repository is version controlled; commits visible in .git/
- Typical workflow: `git add .` → `git commit -m "message"` → `git push`

## Key Files Reference

| File | Purpose |
|------|---------|
| [index.html](index.html) | Homepage with hero, services overview, structured data |
| [assets/css/design-system.css](assets/css/design-system.css) | All color, typography, spacing, z-index tokens |
| [assets/css/main.css](assets/css/main.css) | Component-specific styling (loader, header, menu, etc.) |
| [assets/js/main.js](assets/js/main.js) | Loading animation, header scroll, mobile menu, lazy video |
| [_templates/attorney-bio-template.html](/_templates/attorney-bio-template.html) | Master template for attorney pages |
| [professionals/{slug}/index.html](professionals/armand-jaafari/index.html) | Example attorney page (live reference) |

## Common Pitfalls to Avoid

1. **Forgetting relative path updates** when copying pages to new nesting levels
2. **Hardcoding colors** instead of using CSS custom properties
3. **Skipping structured data** when adding new page types
4. **Not testing sessionStorage logic** for loader animation on return visits
5. **Breaking scroll event performance** by removing `{ passive: true }`

## Development Notes

- **No build process**: Static HTML, CSS, and JS—changes deploy directly
- **No package manager**: All fonts loaded from Google Fonts CDN
- **Analytics-ready**: Pages have schema.org and OpenGraph data for SEO/social sharing
- **Multi-jurisdiction**: Site templates handle both CA and IL location data
