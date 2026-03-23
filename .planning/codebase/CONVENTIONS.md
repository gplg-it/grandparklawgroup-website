# Coding Conventions

**Analysis Date:** 2026-03-22

## Naming Patterns

**Files:**
- HTML files: lowercase with hyphens, typically `index.html` in section directories
- CSS files: lowercase with hyphens (e.g., `main.css`, `design-system.css`)
- JavaScript files: lowercase with hyphens (e.g., `main.js`)
- Image files: lowercase with hyphens (e.g., `apple-touch-icon.png`, `hero-poster.jpg`)
- Data attributes: kebab-case (e.g., `data-filter`, `data-filterable`, `data-filter-item`)

**Functions:**
- camelCase for all function declarations and expressions
- Descriptive verb-based names (e.g., `initLoader()`, `initMobileMenu()`, `collectFormData()`, `generateHTML()`)
- Prefix functions with action verbs: `init` for initialization, `add` for creation, `remove` for deletion, `update` for modifications
- Example patterns: `initHeaderScroll()`, `addEducation()`, `removeEntry()`, `setCategory()`

**Variables:**
- camelCase for all variables and constants
- Descriptive names indicating purpose (e.g., `scrollThreshold`, `currentCategory`, `isValid`, `lastScroll`)
- Boolean variables prefixed with `is`, `has`, or `can` (e.g., `isActive`, `hasReturned`)
- DOM element references suffixed with context (e.g., `menuToggle`, `menuOverlay`, `heroVideo`)

**Types/Classes:**
- CSS classes: kebab-case (e.g., `.loader`, `.header-scroll`, `.menu-overlay`, `.filter-btn`)
- Semantic HTML5 elements used throughout (e.g., `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`)
- BEM-like naming for component hierarchy (e.g., `.loader-logo`, `.loader-bar`, `.menu-backdrop`, `.menu-nav-link`)

## Code Style

**Formatting:**
- No automated formatter detected (no .prettierrc, eslint config, or similar)
- Manual formatting conventions observed:
  - 4-space indentation for HTML and JavaScript
  - BEM-inspired class naming for CSS scalability
  - One rule per line in CSS
  - Consistent spacing around operators and after keywords

**Linting:**
- Not detected (no .eslintrc, eslint.config.js, or similar)
- Manual code review appears to be the quality standard

**Whitespace & Comments:**
- Section comments use banner format with equals signs:
  ```javascript
  // ============================================
  // SECTION NAME
  // ============================================
  ```
- Consistently applied to separate logical modules
- Comments appear before function definitions when behavior is non-obvious
- Inline comments used sparingly, only for clarification

## Import Organization

**Script Loading:**
- CSS files loaded in `<head>` before closing `</head>`
- JavaScript loaded at end of `<body>` or inline when immediate execution needed
- Google Tag Manager script loaded early in `<head>`
- Font preconnects before stylesheet declarations

**Order in HTML head:**
1. Google Tag Manager script
2. Meta tags (charset, viewport, etc.)
3. SEO meta tags (description, canonical, og:*, twitter:*)
4. Favicon and apple-touch-icon
5. Font preconnects (fonts.googleapis.com, fonts.gstatic.com)
6. Stylesheet links (CSS files)
7. JSON-LD schema script

**Path Aliases:**
- Not used; all paths are relative or absolute URLs
- Asset references: `assets/css/`, `assets/js/`, `assets/images/`
- Page navigation: relative paths (e.g., `about/index.html`, `contact/index.html`)

## Error Handling

**Patterns:**
- Early returns using existence checks:
  ```javascript
  const element = document.getElementById('id');
  if (!element) return;
  ```
- Try/catch not observed in main codebase
- Graceful degradation for video loading failures:
  ```javascript
  video.addEventListener('error', () => {
      console.log('Video failed to load, showing poster');
  });
  ```
- Feature detection for browser capabilities:
  ```javascript
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
  }
  ```
- Email validation with regex pattern:
  ```javascript
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(field.value)) {
      isValid = false;
  }
  ```

## Logging

**Framework:** console (native)

**Patterns:**
- `console.log()` used sparingly for debugging
- No production logging framework detected
- Minimal verbose output; logs only appear for error fallbacks
- Example: `console.log('Video failed to load, showing poster');`

## Comments

**When to Comment:**
- Banner sections separating logical modules (required)
- Non-obvious algorithm behavior (optional, rarely used)
- Complex DOM manipulation logic (optional)
- Todo/Future work items not found in codebase

**JSDoc/TSDoc:**
- Not used; no JSDoc or TSDoc patterns observed
- Function documentation through descriptive names instead

## Function Design

**Size:**
- Small, focused functions (typically 5-20 lines)
- Each function handles a single responsibility
- Examples: `initLoader()` (8 lines), `closeMenu()` (4 lines), `initBackToTop()` (15 lines)

**Parameters:**
- Minimal parameters; usually 0-2
- Event handlers use implicit event parameter where needed
- Data collection functions accept no parameters, accessing DOM directly

**Return Values:**
- Early returns for guard conditions
- Some functions return nothing (void), modifying DOM in place
- Data collection functions return objects with structured properties

## Module Design

**Exports:**
- IIFE (Immediately Invoked Function Expression) pattern wraps entire module:
  ```javascript
  (function() {
      'use strict';
      // all code here
  })();
  ```
- Single global scope pollution avoided through IIFE
- `'use strict';` declared at top of IIFE

**Barrel Files:**
- Not used; no barrel files (`index.js` exporting from sibling modules)
- Simple file structure with direct script references in HTML

**Module Initialization:**
- Single `init()` function calls all initialization functions
- Triggered on DOMContentLoaded or immediately if document already loaded:
  ```javascript
  if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
  } else {
      init();
  }
  ```

## HTML Conventions

**Semantic HTML:**
- Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- ARIA roles and labels for accessibility:
  - `role="banner"`, `role="navigation"`, `role="main"`, `role="dialog"`
  - `aria-label`, `aria-expanded`, `aria-modal`, `aria-hidden` attributes

**Data Attributes:**
- Used extensively for DOM selection and behavior:
  - `data-filter`: filtering category
  - `data-filterable`: container for filterable items
  - `data-filter-item`: individual item with category
  - `data-idx`: index for repeatable groups
  - `data-validate`: form validation flag
  - `data-year`: auto-updating year element

**ID Naming:**
- camelCase (e.g., `loader`, `header`, `menuToggle`, `heroVideo`, `menuOverlay`)
- Prefixes indicate type: form fields have descriptive names (`firstName`, `email`)
- Container IDs use descriptive suffixes (`educationContainer`, `barContainer`, `skillsContainer`)

## CSS Conventions

**CSS Custom Properties (Variables):**
- Comprehensive design system using CSS variables in `:root`
- Naming: `--category-name` (e.g., `--primary-dark`, `--accent-gold`, `--text-light`)
- Scale variables for typography: `--text-xs` through `--text-5xl`
- Spacing scale: `--space-2xs` through `--space-2xl`
- Z-index scale: `--z-base`, `--z-dropdown`, `--z-sticky`, `--z-fixed`, etc.

**Class Organization:**
- BEM-inspired: `.block`, `.block-element`, `.block--modifier`
- Example: `.loader`, `.loader-logo`, `.loader.hidden`
- Component-based organization with clear section comments

**Selectors:**
- Use of pseudo-elements: `::before`, `::after` for decorative elements
- Pseudo-classes: `:hover`, `:focus`, `:focus-visible` for interactions
- Attribute selectors: `[data-*]`, `[required]`, `input[type="email"]`

**Responsive Design:**
- CSS custom properties for responsive typography using `clamp()`
- Example: `--text-base: clamp(0.95rem, 0.9rem + 0.2vw, 1.05rem);`
- Fluid spacing and sizing throughout
- Container-padding uses `clamp()` for responsiveness

---

*Convention analysis: 2026-03-22*
