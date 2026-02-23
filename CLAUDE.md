# CLAUDE.md — parlor-games--ephemera-engine

## What This Is

A product design and mobile app strategy for a series of unrepeatable parlor/party games. The primary artifacts are the design document, mobile app strategy, and the artifact template rendering system.

## Key Files

- `DESIGN.md` — Complete series design document (framework + four games + template)
- `STRATEGY.md` — Mobile app research & strategy: market analysis, technical architecture (React Native), monetization, competitive landscape, ritual design theory, educator market, artifact generation
- `RESEARCH.md` — Academic research synthesis (~270 citations across 7 domains): self-disclosure psychology, game studies, ritual/liminality, collaborative creativity, loneliness science, narrative psychology, material culture
- `PRD.md` — Product Requirements Document: app features, screens, user flows, data models, artifact specs, notification catalog, content pack format (~2,700 lines)
- `artifacts/` — Artifact template rendering system (Nunjucks + Puppeteer → PDF)
  - `design-system/` — CSS tokens, typography, layout, textures
  - `templates/` — 6 P0 Nunjucks templates (Confession Album × 3, Murder Mystery × 3)
  - `src/render.ts` — Rendering pipeline (HTML → PDF via Puppeteer)
  - `src/cli.ts` — CLI entry point (`npx ts-node src/cli.ts <template>`)
  - `fixtures/` — Sample data for all templates
- `memory/constitution.md` — Immutable architectural principles (7 principles, 4 gates) enforced across all specs
- `specs/` — SpecKit SDD specifications (6 feature areas, 48 files total)
  - `001-auth-and-sessions/` — Auth, profiles, session state machine (foundation)
  - `002-pre-game-lifecycle/` — Invitations, contributions, notifications, content store
  - `003-confession-album/` — Full Confession Album vertical slice
  - `004-murder-mystery/` — Full Murder Mystery vertical slice
  - `005-game-night-engine/` — Dashboard shell, offline infrastructure, plugin architecture
  - `006-artifact-pipeline/` — Server rendering service wrapping existing artifacts/ code
  - Each spec contains: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`, `tasks.md`, `checklists/requirements.md`
- `seed.yaml` — Organ III registration

## The Four Games

1. **Murder Mystery** — immersive whodunit with character sheets, contributions, investigation
2. **Whose Memory?** — anonymous storytelling and attribution game
3. **The Confession Album** — chain-answering Proust Questionnaire with diminishing board
4. **The Exquisite Corpse** — cut-up / story spine collaborative fiction game

## Status

Next steps:
1. ~~Product Requirements Document (PRD) — app features, screens, user flows~~ **DONE** (PRD.md)
2. ~~Artifact template system — visual design for post-game PDFs~~ **DONE** (artifacts/)
3. ~~SpecKit SDD specifications — full spec/plan/tasks for all 6 feature areas~~ **DONE** (specs/)
4. Content library authoring (200+ questions, 30+ era packets, 50+ structural templates)
5. Implementation — follow specs/001-006 in dependency order
6. ~~Prototype artifact generation — HTML/CSS → PDF pipeline proof of concept~~ **DONE** (artifacts/src/)

## Artifact System

The `artifacts/` directory contains a standalone Node.js rendering pipeline:

```bash
cd artifacts && npm install
npx ts-node src/cli.ts the-album                    # Confession Album booklet
npx ts-node src/cli.ts the-dossier                   # Murder Mystery case file
npx ts-node src/cli.ts --all                          # All 6 templates
npx ts-node src/cli.ts the-album --data my-data.json  # Custom data
```

**6 P0 Templates:**
- Confession Album: `the-album` (booklet), `prousts-answer` (personal letter), `contributions-table` (grid)
- Murder Mystery: `the-dossier` (case file), `menu-of-the-damned` (recipe cards), `the-sealed-envelope` (host letter)

**Design System:** Playfair Display / Lora / JetBrains Mono, three color themes (confession-album, murder-mystery, personal-letter), A5 portrait (148×210mm), CSS-only paper textures.

## PRD Structure

The PRD (PRD.md) is organized in three layers:
- **Layer 1 — Shared Platform** (§2): auth, sessions, invitations, contributions, notifications, artifacts, store
- **Layer 2 — Game Modules** (§3): Confession Album (P0), Murder Mystery (P0), Whose Memory? (P1), Exquisite Corpse (P1)
- **Layer 3 — Cross-Cutting** (§4): accessibility, privacy, offline, performance, error handling

Appendices (§5) include: tech stack, data model, ~45-screen inventory, notification catalog, artifact catalog, content pack spec, open questions.

## Specification Structure (SpecKit SDD)

Six specifications decompose the PRD into implementable feature areas. Each follows the SpecKit methodology: `spec.md` → `plan.md` + supporting files → `tasks.md`.

**Dependency graph:**
```
001: auth-and-sessions (foundation)
 ├──→ 002: pre-game-lifecycle (needs User, Session)
 │     ├──→ 003: confession-album (needs invitations, contributions, content)
 │     └──→ 004: murder-mystery (needs invitations, contributions, content)
 ├──→ 005: game-night-engine (needs Session state machine)
 │     └── 003 and 004 plug into this as game plugins
 └──→ 006: artifact-pipeline (needs Session, wraps existing artifacts/)
       └── 003 and 004 define what artifacts to generate
```

**Constitution** (`memory/constitution.md`): All specs must pass 4 gates — Simplicity (≤3 server services), Offline (game night without network), Privacy (no social features), Analog (no features replacing human interaction).

**Build order** (solo developer MVP): 001 → 002 → 006 → 005 → 003 → 004

**Tech stack**: TypeScript 5.x, React Native + Expo, Supabase (auth/realtime/storage/edge functions), WatermelonDB or Expo SQLite (local), Claude API (Murder Mystery setting seeds), Puppeteer + Nunjucks (artifacts — already built).
