# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A product design and mobile app strategy for a series of unrepeatable parlor/party games. Currently in DESIGN_ONLY status — the only runnable code is the artifact rendering pipeline in `artifacts/`.

Four games: Murder Mystery, Whose Memory?, The Confession Album, The Exquisite Corpse.

## Commands

All commands run from `artifacts/`:

```bash
cd artifacts && npm install

# Render specific templates
npm run render -- the-album              # Confession Album booklet
npm run render -- the-dossier            # Murder Mystery case file
npm run render -- --all                  # All 6 templates
npm run render -- the-album --data my-data.json  # Custom data

# Shorthand scripts
npm run render:album
npm run render:dossier
npm run render:all

# Type checking (no tests or linter configured yet)
npm run typecheck
```

PDFs output to `artifacts/output/` (gitignored).

## Architecture

### Artifact Rendering Pipeline (`artifacts/`)

Nunjucks templates + Puppeteer → PDF. Two source files:

- `src/render.ts` — Template resolution (`TEMPLATE_MAP`), Nunjucks environment with custom filters (`dateFormat`, `truncate`, `ordinal`, `markdown`, `initials`), HTML rendering, CSS inlining, Puppeteer PDF generation. Key export: `renderPDF(options) → RenderResult`.
- `src/cli.ts` — CLI argument parsing, fixture auto-loading by game name, `--all` batch mode.

Templates use a shared base (`_base.njk`) and macros (`_macros.njk`). Design system is CSS-only: tokens → typography → layout → textures, with three themes (`confession-album`, `murder-mystery`, `personal-letter`). Page size is A5 portrait (148×210mm).

**6 P0 Templates:**
- Confession Album: `the-album`, `prousts-answer`, `contributions-table`
- Murder Mystery: `the-dossier`, `menu-of-the-damned`, `the-sealed-envelope`

Fixture data in `artifacts/fixtures/` — one JSON per game, auto-resolved from template's game field.

### Design Corpus (`docs/`)

- `docs/DESIGN.md` — Series framework + four game designs + template system
- `docs/STRATEGY.md` — Market analysis, React Native architecture, monetization, ritual design theory
- `docs/RESEARCH.md` — Academic synthesis (~270 citations across 7 domains)
- `docs/PRD.md` — Full product requirements (~2,700 lines): 3-layer structure (shared platform → game modules → cross-cutting), ~45 screens, data model, notification catalog, content pack spec

### SpecKit Specifications (`specs/`)

Six specs decompose the PRD into implementable feature areas. Each contains: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`, `tasks.md`, `checklists/requirements.md`.

**Dependency order (solo dev MVP build sequence):** 001 → 002 → 006 → 005 → 003 → 004

| Spec | Area | Depends On |
|------|------|------------|
| 001 | Auth, profiles, session state machine | (foundation) |
| 002 | Invitations, contributions, notifications, content store | 001 |
| 003 | Confession Album vertical slice | 001, 002 |
| 004 | Murder Mystery vertical slice | 001, 002 |
| 005 | Dashboard shell, offline infra, plugin architecture | 001 |
| 006 | Server artifact rendering (wraps existing `artifacts/`) | 001 |

## Constitution

All work must pass 4 architectural gates defined in `memory/constitution.md`:

1. **Simplicity** — Max 3 Supabase Edge Functions, no premature abstractions, single PostgreSQL schema
2. **Offline** — Game night works with zero connectivity, local DB is source of truth during ACTIVE state
3. **Privacy** — No social feed, no public profiles, contributions encrypted, minimal data retention
4. **Analog** — No features replacing in-room human interaction, screen-dark during play

## Planned Tech Stack (not yet implemented)

TypeScript 5.x, React Native + Expo, Supabase (auth/realtime/storage/edge functions), WatermelonDB or Expo SQLite (local-first), Claude API (Murder Mystery seeds), Puppeteer + Nunjucks (artifacts — already built).

## Status

Completed: Design corpus, PRD, artifact pipeline, SpecKit specs (all 6).
Next: Content library authoring → Implementation following specs 001-006.
