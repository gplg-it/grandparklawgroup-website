# Architecture

**Analysis Date:** 2026-03-22

## Pattern Overview

**Overall:** Static Site with Progressive Enhancement

**Key Characteristics:**
- HTML-first, server-rendered pages with no backend framework
- Progressive enhancement: vanilla JavaScript for interactivity
- CSS-in-files with component-scoped styling
- SEO-optimized with structured data (JSON-LD)
- Responsive design with fluid typography
- Accessibility-first approach (semantic HTML, ARIA attributes)

## Layers

**Presentation Layer:**
- Purpose: Render user interface and handle client-side interactions
- Location: `index.html`, `**/index.html` (page files)
- Contains: HTML markup, inline styles, page-specific scripts
- Depends on: Design System assets (`assets/css/`)
- Used by: End users, search engines

**Design System Layer:**
- Purpose: Centralized styling constants and component styles
- Location: `assets/css/design-system.css`, `assets/css/main.css`
- Contains: CSS custom properties, typography, spacing, colors, animations
- Depends on: External fonts (Google Fonts)
- Used by: All HTML pages via stylesheet imports

**Interaction Layer:**
- Purpose: Client-side JavaScript enhancements
- Location: `assets/js/main.js`
- Contains: Event listeners, DOM manipulation, animations, form validation
- Depends on: Vanilla JavaScript APIs (no frameworks)
- Used by: All pages that import the main script

**Template Layer:**
- Purpose: Standardized content templates for page types
- Location: `_templates/` directory
- Contains: Template HTML files with placeholder comments
- Depends on: Design System, Interaction scripts
- Used by: Manual page creation by developers

**Asset Layer:**
- Purpose: Static images, icons, and media files
- Location: `assets/images/`
- Contains: Logos, attorney photos, team images, favicons
- Depends on: None
- Used by: All pages via image references

## Data Flow

**Page Load Flow:**

1. Browser requests HTML document (e.g., `/index.html`)
2. HTML head loads meta tags, stylesheets, structured data
3. Page renders with semantic HTML structure
4. CSS loads from `design-system.css` and `main.css`
5. Loader animation displays while page content loads
6. JavaScript from `assets/js/main.js` executes on DOM ready
7. Event listeners attach to interactive elements
8. Images lazy-load, animations trigger on scroll

**User Interaction Flow:**

1. User triggers action (click, scroll, form submit)
2. JavaScript event listener captures interaction
3. DOM is manipulated or data validated
4. Class toggles trigger CSS transitions/animations
5. Browser repaints/recomposes as needed

**Page Navigation Flow:**

1. User clicks internal link to another page
2. Browser requests new HTML document from server
3. New page HTML loads, CSS re-applies, scripts re-initialize
4. Session storage checked for return-visit status (loader animation varies)

**State Management:**
- Session state: `sessionStorage.getItem('gplVisited')` tracks return visits
- Visual state: CSS classes (`.active`, `.scrolled`, `.hidden`) track UI state
- Form state: Input validation tracked via `.error` class on fields
- Scroll state: Window scroll position tracked for header effects, back-to-top button

## Key Abstractions

**Page Template:**
- Purpose: Standardize HTML structure across all pages
- Examples: `index.html`, `about/index.html`, `practices/business-torts/index.html`
- Pattern: Each page includes Google Tag Manager, meta tags, structured data, header/footer, content sections

**Component (CSS-based):**
- Purpose: Reusable styled UI elements
- Examples: `.header`, `.loader`, `.button`, `.section`, `.card`
- Pattern: BEM-like naming with CSS custom properties for theming

**Module (JavaScript function):**
- Purpose: Encapsulated behavior for a specific interaction type
- Examples: `initLoader()`, `initMobileMenu()`, `initScrollReveal()`
- Pattern: IIFE (Immediately Invoked Function Expression) with strict mode, event delegation

**Page Type:**
- Purpose: Styling and behavior specific to page categories
- Examples: `page-home`, `page-about`, `page-professionals`
- Pattern: Body class identifies page type, used for page-specific styles

## Entry Points

**Homepage:**
- Location: `index.html`
- Triggers: Direct domain visit or navigation to `/`
- Responsibilities: Introduce firm, display hero video, showcase practice areas, feature professionals

**Practice Area Pages:**
- Location: `practices/{practice-slug}/index.html`
- Triggers: User navigation from practices menu or internal links
- Responsibilities: Explain practice area details, list attorneys, call to action

**Attorney Profile Pages:**
- Location: `professionals/{attorney-slug}/index.html`
- Triggers: User navigation from professionals grid or practice area pages
- Responsibilities: Display attorney bio, credentials, practice areas, contact info

**Portal Pages:**
- Location: `portal/` and subdirectories
- Triggers: Internal staff/client access
- Responsibilities: Provide tool access (bio generator), login interfaces

**Utility Pages:**
- Location: `about/`, `contact/`, `resources/`, `legal/`
- Triggers: Footer navigation, internal links
- Responsibilities: Provide company information, contact form, resources, legal compliance

## Error Handling

**Strategy:** Graceful degradation with fallback content

**Patterns:**
- Missing video: Fallback poster image displayed, error logged to console
- Failed image load: Browser shows alt text
- Missing required form fields: `.error` class added, form submit prevented
- JavaScript disabled: Page still fully functional with semantic HTML

## Cross-Cutting Concerns

**Logging:**
- Console logging only (`console.log()`) for debug info
- No error tracking service integrated
- Video load failures logged to console

**Validation:**
- Client-side form validation via JavaScript (`initFormValidation()`)
- Email regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Required field checking via HTML5 `required` attribute
- No server-side validation (server not present)

**Authentication:**
- Portal pages have `staff-login.html` and `client-login.html`
- No authentication implementation visible (likely handled by server/external service)
- Portal pages protected conceptually but no access control in static files

**Analytics & Tracking:**
- Google Tag Manager integrated (GTM-M649WB9Z)
- GTM script injected in head of every page
- dataLayer available for custom events

**Accessibility:**
- Semantic HTML: `<header>`, `<main>`, `<footer>`, `<section>`, etc.
- ARIA attributes on interactive elements (loader has `aria-hidden="true"`)
- Focus management in mobile menu
- Respects `prefers-reduced-motion` media query for animations
- Color contrast maintained per WCAG guidelines

**SEO:**
- Canonical URLs on every page
- Open Graph meta tags for social sharing
- Twitter Card meta tags
- JSON-LD structured data (LegalService schema)
- Meta descriptions and keywords on all pages
- Sitemap.xml and robots.txt files present

---

*Architecture analysis: 2026-03-22*
