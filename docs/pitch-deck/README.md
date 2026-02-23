# Pitch Deck

Interactive pitch deck for the Ephemera Engine project. A single self-contained HTML page with scroll-driven animations.

**Live:** https://organvm-iii-ergon.github.io/parlor-games--ephemera-engine/

## Local preview

Open `index.html` in any browser. No build step required.

## Technology

- Single `index.html` — no framework, no build step
- GSAP + ScrollTrigger from CDN for scroll animations
- Design system reused from `artifacts/design-system/` (tokens, typography, textures)
- `prefers-reduced-motion` respected — all animations disabled when set
- Fully readable as a static document without JavaScript
