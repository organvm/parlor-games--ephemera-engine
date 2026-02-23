# Project Manifest — Ephemera Engine

Annotated bibliography of all project files, organized by provenance layer and generation thread.

**Project**: `parlor-games--ephemera-engine`
**Organ**: III (Commerce / Ergon)
**Status**: DESIGN_ONLY → Specifications Complete
**Total Files**: 75 | **Total Lines**: ~27,186
**Manifest Date**: 2026-02-23

---

## Legend

| Field | Description |
|-------|-------------|
| **ID** | Unique file identifier: `EE-{layer}{seq}` (EE = Ephemera Engine) |
| **Tags** | `design` `strategy` `research` `prd` `code` `template` `fixture` `css` `config` `spec` `plan` `data-model` `api` `tasks` `checklist` `governance` `meta` |
| **Provenance** | `manual` (human-authored), `thread-N` (agent-generated in batch N), `session-0` (pre-existing) |
| **Lines** | Approximate line count |

---

## Layer 0 — Foundation Documents

Hand-authored design, research, and strategy documents that define the product. All other files derive from these.

### EE-F01 — DESIGN.md
- **Title**: Series Design Document
- **Path**: `DESIGN.md`
- **Tags**: `design`, `games`, `framework`
- **Lines**: 836
- **Provenance**: `manual`
- **Annotation**: The canonical game design document. Defines the three-phase structure (Pre-Game / Game Night / Post-Game), the Replayability Trinity (procedural + curated + player-driven), and five design principles ("Ephemera over permanence," "Preparation is play," "No spectators," "Analog warmth, digital scaffolding," "The host is a player"). Contains complete mechanical specifications for all four games: Murder Mystery (§II, setting seeds, 3-act structure, character sheets), Whose Memory? (§III, anonymous storytelling), Confession Album (§IV, chain mechanic, The Board, The Return, The Portrait), and Exquisite Corpse (§V, cut-up collaborative fiction). Concludes with a reusable Game Seed Template (§VI). The philosophical bedrock of the entire project.

### EE-F02 — STRATEGY.md
- **Title**: Mobile App Research & Strategy
- **Path**: `STRATEGY.md`
- **Tags**: `strategy`, `market`, `architecture`, `monetization`
- **Lines**: 475
- **Provenance**: `manual`
- **Annotation**: Market-facing strategy built on eight pillars: Historical Foundation (Victorian parlor games to modern social games), Structured Intimacy (self-disclosure psychology), Loneliness Economy (epidemic-scale market opportunity), Competitive Landscape (Jackbox, Wavelength, apps-as-game-master), Phone-as-Scaffold (the central design metaphor — "candle on the table, not flashlight in the face"), Technical Architecture (React Native + Expo, Supabase, offline-first), Monetization (freemium + content packs + IAP), and Underexplored Pillars. Deep dives into Ritual Design Theory (Turner's liminality, Rappaport's invariance), Educator Market analysis, and Artifact Generation Architecture. Source for the constitution's Simplicity Gate (≤3 Edge Functions) and the phone-as-scaffold principle.

### EE-F03 — RESEARCH.md
- **Title**: Academic Research Synthesis
- **Path**: `RESEARCH.md`
- **Tags**: `research`, `academic`, `psychology`, `game-studies`
- **Lines**: 935
- **Provenance**: `manual`
- **Annotation**: Scholarly foundation spanning ~270 citations across seven domains: self-disclosure psychology (Jourard, Altman & Taylor's social penetration theory), game studies (Huizinga's magic circle, Caillois's classification, Suits's lusory attitude), ritual and liminality (Turner's communitas, van Gennep's rites of passage), collaborative creativity (Sawyer's group flow, Csikszentmihalyi's flow states), loneliness science (Cacioppo, Holt-Lunstad's meta-analyses), narrative psychology (Bruner, McAdams's life story model), and material culture (ephemera studies, scrapbook theory). Provides the theoretical justification for why structured social games combat loneliness, why preparation-as-play increases investment, and why physical artifacts outperform digital recordings as memory objects. Referenced throughout the PRD for feature rationale.

### EE-F04 — PRD.md
- **Title**: Product Requirements Document
- **Path**: `PRD.md`
- **Tags**: `prd`, `requirements`, `screens`, `data-model`, `notifications`, `artifacts`
- **Lines**: 2,713
- **Provenance**: `manual`
- **Annotation**: The most detailed file in the repository. Organized in five parts: Part 0 (Product Vision — scope, glossary, V1 = Confession Album P0 + Murder Mystery P0), Part 1 (Personas — Host, App Player, Web Player — and four user journeys), Part 2 (Shared Platform — §2.1 Auth, §2.2 Sessions with 7-state machine, §2.3 Invitations with deep links, §2.4 Contributions, §2.5 Notifications with 16-item catalog N01-N16, §2.6 Game Night Dashboard, §2.7 Artifact Generation Engine, §2.8 Content Store, §2.9 Settings), Part 3 (Game Modules — §3.1 Confession Album with 12 subsections, §3.2 Murder Mystery with 9 subsections, §3.3-3.4 P1 games), Part 4 (Cross-Cutting — accessibility, privacy, offline, performance targets, error handling with 5 recovery scenarios), Part 5 (Appendices — tech stack, data model, ~45-screen inventory, notification catalog, artifact catalog A01-A15, content pack YAML spec, 10 open questions). The primary source for all 6 SpecKit specifications.

---

## Layer 1 — Project Registration & Governance

### EE-G01 — seed.yaml
- **Title**: Organ III Repository Registration
- **Path**: `seed.yaml`
- **Tags**: `config`, `governance`, `organvm`
- **Lines**: 27
- **Provenance**: `manual`
- **Annotation**: ORGANVM automation contract declaring this repository's membership in Organ III (Commerce), its implementation status (DESIGN_ONLY), tier (standard), and promotion status (LOCAL). Tags: games, social, generative, analog, mobile, react-native. No inter-organ edges (produces/consumes empty). Read by cross-organ governance tooling in `organvm-iv-taxis`.

### EE-G02 — CLAUDE.md
- **Title**: Claude Code Project Instructions
- **Path**: `CLAUDE.md`
- **Tags**: `meta`, `governance`, `claude-code`
- **Lines**: 94
- **Provenance**: `manual` (updated by `thread-main` on 2026-02-23)
- **Annotation**: Project-level instructions for Claude Code. Describes repository purpose, lists all key files (foundation docs, artifacts system, specs, constitution), documents the four games, tracks project status (PRD done, artifacts done, specs done, content authoring and implementation next), explains the artifact rendering CLI, summarizes PRD structure, and provides the full SpecKit SDD section with dependency graph, constitution reference, build order, and tech stack summary. Updated during the specification generation session to include `specs/` and `memory/` references.

### EE-G03 — memory/constitution.md
- **Title**: Ephemera Engine Constitution
- **Path**: `memory/constitution.md`
- **Tags**: `governance`, `architecture`, `constitution`
- **Lines**: 92
- **Provenance**: `thread-main` (2026-02-23, Step 0 of plan)
- **Annotation**: Immutable architectural principles derived from DESIGN.md and STRATEGY.md. Seven core principles: (I) Analog Warmth, Digital Scaffolding, (II) Offline-First Game Night, (III) Privacy by Design, (IV) Host as Creative Tool, (V) Preparation is Play, (VI) Ephemera over Permanence, (VII) Simplicity. Four architectural gates checked during `/speckit.plan` for every specification: Simplicity Gate (≤3 server services, no speculative features, framework primitives), Offline Gate (game night without network, local DB as truth), Privacy Gate (no cross-session data, session-scoped content), Analog Gate (no features replacing human interaction, screen-dark principle). Governance section declares supremacy over all other architectural decisions. Ratified version 1.0.

---

## Layer 2 — Artifact Rendering Pipeline

Working code: a standalone Node.js system that renders Nunjucks templates to print-quality PDFs via Puppeteer. This is the only executable code in the repository.

### EE-A01 — artifacts/package.json
- **Title**: Artifact Pipeline Package Manifest
- **Path**: `artifacts/package.json`
- **Tags**: `config`, `code`, `npm`
- **Lines**: 27
- **Provenance**: `session-0`
- **Annotation**: Package `@ephemera-engine/artifacts` v0.1.0. Dependencies: nunjucks ^3.2.4 (template engine), puppeteer ^23.0.0 (headless Chrome for PDF), marked ^14.0.0 (Markdown rendering in templates). Dev dependency: typescript ^5.6.0. Entry point: `src/cli.ts` via `npx ts-node`.

### EE-A02 — artifacts/tsconfig.json
- **Title**: TypeScript Compiler Configuration
- **Path**: `artifacts/tsconfig.json`
- **Tags**: `config`, `code`, `typescript`
- **Lines**: 19
- **Provenance**: `session-0`
- **Annotation**: Strict TypeScript configuration targeting ES2022/CommonJS. Outputs to `dist/` with declarations, declaration maps, and source maps. Includes only `src/**/*.ts`.

### EE-A03 — artifacts/.gitignore
- **Title**: Artifact Build Exclusions
- **Path**: `artifacts/.gitignore`
- **Tags**: `config`
- **Lines**: 4
- **Provenance**: `session-0`
- **Annotation**: Excludes `node_modules/`, `output/` (rendered PDFs), `dist/` (compiled TS), and `*.pdf` from version control.

### EE-A04 — artifacts/src/render.ts
- **Title**: Rendering Pipeline — HTML to PDF
- **Path**: `artifacts/src/render.ts`
- **Tags**: `code`, `typescript`, `nunjucks`, `puppeteer`, `pipeline`
- **Lines**: 236
- **Provenance**: `session-0`
- **Annotation**: Core rendering engine. Exports `TEMPLATE_MAP` (6 entries mapping template names to `{ game, theme, path }`), `renderHTML()` (Nunjucks environment with custom filters: `dateFormat`, `truncate`, `ordinal`, `initials`, `markdown`), `renderPDF()` (Puppeteer launch with headless mode, `preferCSSPageSize` for A5 format), and `inlineCSS()` (reads and concatenates all design-system CSS files into a `<style>` block for self-contained HTML). This file is the code that spec 006 wraps into a server service — it is imported directly, not rewritten. The Nunjucks environment points at `artifacts/templates/`, and the CSS inliner reads from `artifacts/design-system/`.

### EE-A05 — artifacts/src/cli.ts
- **Title**: CLI Entry Point
- **Path**: `artifacts/src/cli.ts`
- **Tags**: `code`, `typescript`, `cli`
- **Lines**: 152
- **Provenance**: `session-0`
- **Annotation**: Command-line interface for local artifact generation. Parses args for template name (or `--all`), loads fixture data from `artifacts/fixtures/` (or custom `--data` path), calls `renderPDF()`, and writes output to `artifacts/output/`. Usage: `npx ts-node src/cli.ts the-album`, `npx ts-node src/cli.ts --all`, `npx ts-node src/cli.ts the-dossier --data custom.json`.

### EE-A06 — artifacts/design-system/tokens.css
- **Title**: Design Tokens (CSS Custom Properties)
- **Path**: `artifacts/design-system/tokens.css`
- **Tags**: `css`, `design-system`, `tokens`
- **Lines**: 94
- **Provenance**: `session-0`
- **Annotation**: Root-level CSS custom properties defining the visual language for all artifact PDFs. Three theme variants via `[data-theme]` attribute selectors: `confession-album` (cream/sepia/gold palette), `murder-mystery` (charcoal/crimson/gold noir palette), `personal-letter` (warm ivory/burgundy for Proust's Answer). Variables for colors (`--color-bg`, `--color-text`, `--color-accent`, `--color-gold`, `--color-muted`, `--color-divider`), spacing scale (`--sp-1` through `--sp-8`), border radii, and z-indexes.

### EE-A07 — artifacts/design-system/typography.css
- **Title**: Typography System
- **Path**: `artifacts/design-system/typography.css`
- **Tags**: `css`, `design-system`, `typography`
- **Lines**: 126
- **Provenance**: `session-0`
- **Annotation**: Font stack and typographic scale. Three families: Playfair Display (headings, `--ff-heading`), Lora (body text, `--ff-body`), JetBrains Mono (metadata/code, `--ff-mono`). Loaded via Google Fonts `@import`. Size scale from `--fs-xs` (0.75rem) through `--fs-3xl` (2.5rem). Utility classes: `.small-caps`, `.text-mono`, `.text-sm`, `.text-xs`, `.metadata`, `.drop-cap` (first-letter styling for opening paragraphs).

### EE-A08 — artifacts/design-system/layout.css
- **Title**: Print Layout System
- **Path**: `artifacts/design-system/layout.css`
- **Tags**: `css`, `design-system`, `layout`, `print`
- **Lines**: 162
- **Provenance**: `session-0`
- **Annotation**: A5 portrait (148mm x 210mm) page layout with CSS `@page` rules. Defines `.page` container with margins, `.cover-page` with centered content, `.avoid-break` for orphan/widow control, `.page-break` for forced breaks, `.two-column` grid, `.sidebar`, and `.margin-note` for annotation-style marginal content. Print-optimized: no background-color-adjust needed (Puppeteer's `printBackground: true` handles this).

### EE-A09 — artifacts/design-system/textures.css
- **Title**: CSS-Only Paper Textures
- **Path**: `artifacts/design-system/textures.css`
- **Tags**: `css`, `design-system`, `visual`
- **Lines**: 162
- **Provenance**: `session-0`
- **Annotation**: Pure CSS paper texture effects requiring no image assets. Techniques include layered radial gradients for paper grain (`.paper-grain`), repeating linear gradients for ruled lines (`.lined-paper`), box-shadow insets for aged edges (`.aged-paper`), and pseudo-element overlays for foxing spots (`.foxed`). Theme-aware: textures reference `--color-bg` and `--color-divider` tokens. Designed to reproduce at print resolution without rasterization artifacts.

### EE-A10 — artifacts/design-system/reset.css
- **Title**: CSS Reset
- **Path**: `artifacts/design-system/reset.css`
- **Tags**: `css`, `design-system`
- **Lines**: 65
- **Provenance**: `session-0`
- **Annotation**: Minimal CSS reset for artifact rendering. Box-sizing border-box, margin/padding zeroing, image max-width, font inheritance for form elements. Includes `@media print` rules for background printing and link URL display suppression.

### EE-A11 — artifacts/templates/_base.njk
- **Title**: Base HTML Template
- **Path**: `artifacts/templates/_base.njk`
- **Tags**: `template`, `nunjucks`, `html`
- **Lines**: 21
- **Provenance**: `session-0`
- **Annotation**: Root Nunjucks template inherited by all artifact templates. Sets `<!DOCTYPE html>`, includes `data-theme` attribute (defaulting to `confession-album`), links all five design-system CSS files, provides `{% block extraStyles %}` for per-template CSS injection and `{% block content %}` for the body. All artifact PDFs share this HTML skeleton.

### EE-A12 — artifacts/templates/_macros.njk
- **Title**: Shared Template Macros
- **Path**: `artifacts/templates/_macros.njk`
- **Tags**: `template`, `nunjucks`, `components`
- **Lines**: 266
- **Provenance**: `session-0`
- **Annotation**: Reusable macro library for artifact templates. Nine macros: `pageHeader()` (title/subtitle/metadata), `divider()` (ornamental HR with optional symbol), `playerCard()` (initials circle + name/role), `ornament()` (fleuron/asterism/dots/rule decorative elements), `eraBadge()` (period label), `statCard()` (stat display with label+value), `questionNumber()` (ordinal margin note), `waxSeal()` (CSS-only wax seal with text), `exhibitLabel()` (evidence tag), `classifiedStamp()` (rotated stamp overlay). Each macro has inline `<style>` rules bundled via `macroStyles()`. Component library for the artifact design system.

### EE-A13 — artifacts/templates/confession-album/the-album.njk
- **Title**: The Album — Confession Album Booklet Template
- **Path**: `artifacts/templates/confession-album/the-album.njk`
- **Tags**: `template`, `nunjucks`, `confession-album`, `artifact-A01`
- **Lines**: 187
- **Provenance**: `session-0`
- **Annotation**: Primary Confession Album artifact (A01). Multi-page PDF booklet: cover page with session title and date, question spreads (each showing question text, player answers, and Proust's original response if available), completion matrix, and colophon. Extends `_base.njk` with `confession-album` theme. Spec 003 identifies a needed extension: chain mechanic attribution (chooser vs. inheritor) for each question spread.

### EE-A14 — artifacts/templates/confession-album/prousts-answer.njk
- **Title**: Proust's Answer — Personal Letter Template
- **Path**: `artifacts/templates/confession-album/prousts-answer.njk`
- **Tags**: `template`, `nunjucks`, `confession-album`, `artifact-A03`, `delayed-delivery`
- **Lines**: 162
- **Provenance**: `session-0`
- **Annotation**: Delayed-delivery personalized artifact (A03). One letter per player per question they answered, pairing their answer with Proust's 1886 or 1892 response to the same (or adjacent) question. Uses `personal-letter` theme for warm ivory/burgundy palette. Delivered 7 days post-game at 10 AM local time. The most intimate artifact in the system — each player receives a private correspondence with the past.

### EE-A15 — artifacts/templates/confession-album/contributions-table.njk
- **Title**: Contributions Table Template
- **Path**: `artifacts/templates/confession-album/contributions-table.njk`
- **Tags**: `template`, `nunjucks`, `confession-album`, `artifact-A02`
- **Lines**: 164
- **Provenance**: `session-0`
- **Annotation**: Supplementary artifact (A02, auto-generated with A01). Grid/table showing guest name, contribution archetype (Happiness, Food, Possession, Word, Quality), what they brought, and their description. Spec 003 notes this needs extension for archetype display matching PRD §3.1.10.

### EE-A16 — artifacts/templates/murder-mystery/the-dossier.njk
- **Title**: The Dossier — Case File Template
- **Path**: `artifacts/templates/murder-mystery/the-dossier.njk`
- **Tags**: `template`, `nunjucks`, `murder-mystery`, `artifact-A04`
- **Lines**: 262
- **Provenance**: `session-0`
- **Annotation**: Primary Murder Mystery artifact (A04). Noir-styled case file PDF: cover with case number and setting, crime scene description, suspect dossiers (character name, player name, bio), evidence log (clue cards with exhibit labels), accusation transcripts, final reveal with explanation, vote tally, and host reflection. Uses `murder-mystery` theme (charcoal/crimson). The most complex template — uses `classifiedStamp()`, `exhibitLabel()`, `waxSeal()`, and `playerCard()` macros extensively.

### EE-A17 — artifacts/templates/murder-mystery/menu-of-the-damned.njk
- **Title**: Menu of the Damned — Recipe Cards Template
- **Path**: `artifacts/templates/murder-mystery/menu-of-the-damned.njk`
- **Tags**: `template`, `nunjucks`, `murder-mystery`, `artifact-A05`
- **Lines**: 164
- **Provenance**: `session-0`
- **Annotation**: Supplementary artifact (A05, auto-generated with A04). Landscape-format recipe card collection: each card shows contributor name (in character), dish name, course type, ingredient list, and preparation steps. Period-appropriate typography. Preserves the culinary dimension of the evening — the food was narratively motivated, not decorative.

### EE-A18 — artifacts/templates/murder-mystery/the-sealed-envelope.njk
- **Title**: The Sealed Envelope — Host Epilogue Template
- **Path**: `artifacts/templates/murder-mystery/the-sealed-envelope.njk`
- **Tags**: `template`, `nunjucks`, `murder-mystery`, `artifact-A07`, `delayed-delivery`
- **Lines**: 159
- **Provenance**: `session-0`
- **Annotation**: Delayed-delivery personalized artifact (A07). Host-written epilogues in the voice of the era, addressed to each player's character. Wax seal motif. The host writes these within 48 hours of game night (prompted by notification N14), and they arrive 7 days later at 10 AM. The Murder Mystery equivalent of Proust's Answer — a private letter from the world you inhabited for an evening.

### EE-A19 — artifacts/fixtures/confession-album.json
- **Title**: Confession Album Sample Data
- **Path**: `artifacts/fixtures/confession-album.json`
- **Tags**: `fixture`, `json`, `confession-album`, `test-data`
- **Lines**: 79
- **Provenance**: `session-0`
- **Annotation**: Complete fixture for rendering Confession Album templates. Schema: `session` (id, title, date, host, location), `questionSet` (lineage name), `players[]` (id, name), `questions[]` (id, text, lineage, register, domain, proust responses), `answers[]` (playerId, questionId, text), `completionMatrix`, `player` (for Proust's Answer personalization), `questionLineage`. Serves as the de facto data contract between the app and the rendering pipeline. Referenced by specs 003 and 006 for data model alignment.

### EE-A20 — artifacts/fixtures/murder-mystery.json
- **Title**: Murder Mystery Sample Data — "Death at the Gilded Vine"
- **Path**: `artifacts/fixtures/murder-mystery.json`
- **Tags**: `fixture`, `json`, `murder-mystery`, `test-data`
- **Lines**: 241
- **Provenance**: `session-0`
- **Annotation**: Rich narrative fixture: Prohibition-Era New York, 1928. The Gilded Vine speakeasy. Victim: Salvatore "Sal" Moretti. Six characters (Vivienne LaRoux, Tommy "Two-Step" Malone, Dr. Henrietta Voss, Father Domenico Bianchi, Pearl Washington, Inspector Alistair Finch) with full bios. Seven clues (wine bottle with antimony, handwritten note, kitchen footprints, Pearl's letter, unmarked crate, ledger entry, Bureau badge). Six accusations with reasoning. Reveal: Father Bianchi is actually Enzo Moretti, Sal's estranged brother. Three recipes (Consomme Brunoise, Coq au Vin Noir, Bourbon Pecan Pie). Vote tally. Host reflection. This fixture is both test data and a demonstration of the game's creative ambition. Referenced by specs 004 and 006.

### EE-A21 — artifacts/package-lock.json
- **Title**: NPM Lock File
- **Path**: `artifacts/package-lock.json`
- **Tags**: `config`, `npm`
- **Lines**: (generated)
- **Provenance**: `session-0`
- **Annotation**: Deterministic dependency resolution for the artifact pipeline. Auto-generated by npm. Pins exact versions of nunjucks, puppeteer, marked, typescript, and all transitive dependencies.

---

## Layer 3 — SpecKit SDD Specifications

48 files across 6 feature areas, generated on 2026-02-23 using the SpecKit Specification-Driven Development methodology. Each spec contains 8 files following a uniform structure. Generated in two parallel batches of three agents each.

### Thread 1 (Batch 1, Agent `001`): auth-and-sessions

**Agent**: `aaa336688e4fbb5bc` | **Duration**: ~10 min | **Tokens**: ~100K | **Tool calls**: 34

#### EE-S01a — specs/001-auth-and-sessions/spec.md
- **Title**: Authentication & Session Management — Feature Specification
- **Tags**: `spec`, `auth`, `sessions`, `state-machine`, `guest-mode`
- **Lines**: 533
- **Annotation**: 5 user stories (US-001 through US-005) with 30 Given/When/Then acceptance scenarios. 40 functional requirements (FR-001 through FR-040) covering email/Apple/Google auth, guest mode via session cookies, host auto-activation, 7-state session machine (DRAFT→INVITING→PREPARING→ACTIVE→COMPLETE→ARCHIVED→CANCELED), notification preferences, accessibility settings. Key entities: User, Session, SessionParticipation, SessionStateLog. Success criteria include <60s social auth, <30s web RSVP, 100% transition atomicity. Edge cases: expired sessions, concurrent limits (5 non-terminal, 1 ACTIVE), account deletion cascade, token expiration, duplicate prevention, web-to-app claiming.

#### EE-S01b — specs/001-auth-and-sessions/plan.md
- **Title**: Authentication & Session Management — Implementation Plan
- **Tags**: `plan`, `architecture`, `supabase`, `expo`
- **Lines**: 242
- **Annotation**: Constitution compliance verified (all 4 gates pass). Technology decisions: Supabase Auth, Expo SecureStore, PostgreSQL triggers for state machine, anonymous auth for guests, Expo SQLite for local cache, Zustand for state. Project structure with exact `src/` paths. 4 phases (Foundation → Core Auth → Sessions → Guest+Settings). Complexity: 0/3 Edge Functions consumed. 5-risk matrix.

#### EE-S01c — specs/001-auth-and-sessions/research.md
- **Title**: Authentication & Session Management — Technology Research
- **Tags**: `research`, `supabase-auth`, `rls`, `state-machine`, `deep-linking`
- **Lines**: 305
- **Annotation**: Supabase Auth React Native integration (SecureStore adapter, Apple/Google flows, anonymous auth with code examples). RLS policy patterns for session isolation with SQL. SecureStore vs AsyncStorage vs MMKV comparison. State machine: TypeScript transition map, PostgreSQL trigger, optimistic locking. Deep linking (Universal Links / App Links). Alternatives rejected: Auth0, Firebase Auth, XState, WatermelonDB.

#### EE-S01d — specs/001-auth-and-sessions/data-model.md
- **Title**: Authentication & Session Management — Database Schema
- **Tags**: `data-model`, `postgresql`, `rls`, `triggers`, `enums`
- **Lines**: 469
- **Annotation**: 5 enum types, 4 tables (users, sessions, session_participations, session_state_log) with complete CREATE TABLE SQL. 13 indexes, 4 triggers (state validation, state logging, host auto-activation, updated_at), 15 RLS policies. Data retention via pg_cron. Foundation schema referenced by all other specs.

#### EE-S01e — specs/001-auth-and-sessions/contracts/openapi.yaml
- **Title**: Authentication & Session Management — API Contracts
- **Tags**: `api`, `openapi`, `rest`, `supabase`
- **Lines**: 910
- **Annotation**: OpenAPI 3.0. Auth endpoints (signup, sign-in email/social/anonymous, refresh, sign-out, password reset). Profile CRUD. Session CRUD + invite code lookup. Atomic state transition via RPC. Participation (join/RSVP). State log queries. 12 component schemas.

#### EE-S01f — specs/001-auth-and-sessions/quickstart.md
- **Title**: Authentication & Session Management — Validation Scenarios
- **Tags**: `checklist`, `testing`, `e2e`
- **Lines**: 202
- **Annotation**: 8 critical scenarios: full auth round-trip, state machine walkthrough, invalid transitions, guest join, RLS isolation, concurrent transitions, settings persistence, session limits. 13-item smoke test checklist.

#### EE-S01g — specs/001-auth-and-sessions/tasks.md
- **Title**: Authentication & Session Management — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 356
- **Annotation**: 12 tasks across 4 phases. Each task: priority, story reference, deliverables, file paths, dependencies, complexity estimate. Dependency graph. 11-15 day timeline.

#### EE-S01h — specs/001-auth-and-sessions/checklists/requirements.md
- **Title**: Authentication & Session Management — Requirements Checklist
- **Tags**: `checklist`, `quality`, `gates`
- **Lines**: 169
- **Annotation**: 100+ checkbox items across 12 sections: spec quality, 4 constitution gates, data model, API, auth, sessions, state machine, guest mode, settings, testing, performance, security.

---

### Thread 2 (Batch 1, Agent `002`): pre-game-lifecycle

**Agent**: `a55686668a813d58e` | **Duration**: ~14 min | **Tokens**: ~105K | **Tool calls**: 28

#### EE-S02a — specs/002-pre-game-lifecycle/spec.md
- **Title**: Pre-Game Lifecycle — Feature Specification
- **Tags**: `spec`, `invitations`, `contributions`, `notifications`, `content-store`, `iap`
- **Lines**: 558
- **Annotation**: 5 user stories: deep link invitations + RSVP (P0), contribution submission + host review (P0), deadline reminders (P1), content pack browsing + purchase (P1), Murder Mystery role assignment (P2). 44 functional requirements (FR-201 through FR-253). 12 non-functional requirements. Covers the entire pre-game phase: invitation tokens with Universal Links / App Links, contribution forms (app + web parity), push notification infrastructure (Expo + FCM), automated reminders with dedup and quiet hours, content library (bundled + IAP store), and character assignment (round-robin + preference-based). 5 open questions deferred to implementation.

#### EE-S02b — specs/002-pre-game-lifecycle/plan.md
- **Title**: Pre-Game Lifecycle — Implementation Plan
- **Tags**: `plan`, `deep-linking`, `push-notifications`, `iap`
- **Lines**: 383
- **Annotation**: 7 subsystem architectures: deep linking (AASA/assetlinks), push (Expo Push API + pg_cron), email (SPF/DKIM/DMARC), IAP (react-native-iap + server validation), contributions (JSONB + Realtime), role assignment (round-robin + Hungarian algorithm), content library (SQLite + MMKV). ASCII data flow diagrams. Migration strategy. 2/3 Edge Functions consumed.

#### EE-S02c — specs/002-pre-game-lifecycle/research.md
- **Title**: Pre-Game Lifecycle — Technology Research
- **Tags**: `research`, `deep-linking`, `expo-notifications`, `iap`, `react-hook-form`
- **Lines**: 620
- **Annotation**: Deep research: Universal Links AASA gotchas (CDN caching, Safari address bar), App Links autoVerify, Expo Notifications token lifecycle + receipt checking, react-native-iap vs RevenueCat vs expo-in-app-purchases, Apple App Store Server API v2 (JWS verification), Google Play Billing, React Hook Form + Zod auto-save patterns, Supabase Realtime Postgres Changes mode. Code examples throughout.

#### EE-S02d — specs/002-pre-game-lifecycle/data-model.md
- **Title**: Pre-Game Lifecycle — Database Schema
- **Tags**: `data-model`, `postgresql`, `rls`, `notifications`, `content-packs`
- **Lines**: 862
- **Annotation**: 8 new tables (invitation_tokens, contributions, notification_queue, push_tokens, notification_preferences, content_packs, user_content_packs, character_preferences). Content JSON schemas per contribution type. RLS policies, indexes. 4 database functions for notification processing (enqueue, suppress, batch, process). pg_cron schedule. Supabase Storage buckets. The most complex data-model file in the project.

#### EE-S02e — specs/002-pre-game-lifecycle/contracts/openapi.yaml
- **Title**: Pre-Game Lifecycle — API Contracts
- **Tags**: `api`, `openapi`, `invitations`, `contributions`, `content-store`
- **Lines**: 1,156
- **Annotation**: 17 endpoints across 6 tags. Invitation token resolution, RSVP submission + dashboard, contribution CRUD + host review, notification preferences, content store browsing + IAP receipt validation, character assignment. The largest OpenAPI file in the project.

#### EE-S02f — specs/002-pre-game-lifecycle/quickstart.md
- **Title**: Pre-Game Lifecycle — Validation Scenarios
- **Tags**: `checklist`, `testing`, `curl`
- **Lines**: 335
- **Annotation**: 6 scenarios with curl commands and SQL queries: invitation→RSVP, contribution lifecycle, web player flow, notification dedup + quiet hours, content pack purchase, role assignment.

#### EE-S02g — specs/002-pre-game-lifecycle/tasks.md
- **Title**: Pre-Game Lifecycle — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 282
- **Annotation**: 19 tasks across 4 phases. Total: 89 hours (67h P0 critical path). Database foundation → backend services → client infrastructure → integration + polish.

#### EE-S02h — specs/002-pre-game-lifecycle/checklists/requirements.md
- **Title**: Pre-Game Lifecycle — Requirements Checklist
- **Tags**: `checklist`, `quality`, `gates`
- **Lines**: 226
- **Annotation**: 91 items: 12 constitution gate checks, 10 invitation, 7 RSVP, 10 contribution, 13 notification, 10 content store, 5 role assignment, 12 NFR, 15 data model, 16 API, 10 testing, 5 cross-spec dependency.

---

### Thread 3 (Batch 1, Agent `003`): confession-album

**Agent**: `a07a2ffe0240040c8` | **Duration**: ~13 min | **Tokens**: ~130K | **Tool calls**: 36

#### EE-S03a — specs/003-confession-album/spec.md
- **Title**: Confession Album — Feature Specification
- **Tags**: `spec`, `confession-album`, `chain-mechanic`, `board`, `proust`
- **Lines**: 498
- **Annotation**: 6 user stories: question set curation (P1), chain mechanic (P1), The Album artifact (P1), The Return + The Portrait (P2), Proust's Answer delayed delivery (P2), board configuration (P3). 59 functional requirements. Full chain mechanic: inherit previous question → choose from board → board shrinks → font grows. Contribution archetypes (Happiness, Food, Possession, Word, Quality). Proust pairing logic (direct or adjacent). All 4 constitution gates pass.

#### EE-S03b — specs/003-confession-album/plan.md
- **Title**: Confession Album — Implementation Plan
- **Tags**: `plan`, `watermelondb`, `zustand`, `reanimated`
- **Lines**: 275
- **Annotation**: Architecture: React Native app → Zustand stores (questionSet, chain, boardConfig, portrait) → WatermelonDB → Supabase. 6 screens, 12 components, 4 stores, 5 hooks, 4 utilities, 4 DB models, 3 services. ASCII component diagram. Data flows for curation, chain, and artifact generation. 5 risks. 5 phases.

#### EE-S03c — specs/003-confession-album/research.md
- **Title**: Confession Album — Technology Research
- **Tags**: `research`, `reanimated`, `watermelondb`, `nunjucks`, `animation`
- **Lines**: 363
- **Annotation**: Board display (React Native Reanimated v3 for 60fps removal, FlatList with gap preservation, font scaling algorithm). WatermelonDB reactive queries + sync. Question filtering (chip-based, LIKE queries, <100ms for 200 items). Template integration analysis: identifies gap in `the-album.njk` (needs chooser/inheritor attribution), provides `artifactDataAssembler.ts` code sketch.

#### EE-S03d — specs/003-confession-album/data-model.md
- **Title**: Confession Album — Database Schema
- **Tags**: `data-model`, `postgresql`, `watermelondb`, `chain-entries`
- **Lines**: 607
- **Annotation**: Entities: QuestionItem, ChainEntry, ReturnEntry, ContributionItem (with 5 archetypes), ConfessionAlbumConfig, ContentQuestion. Supabase SQL: 5 tables with RLS. WatermelonDB schema for offline game night. Fixture schema evolution documenting how `confession-album.json` extends with chain data. Entity relationship diagram.

#### EE-S03e — specs/003-confession-album/contracts/openapi.yaml
- **Title**: Confession Album — API Contracts
- **Tags**: `api`, `openapi`, `question-set`, `chain`, `artifacts`
- **Lines**: 1,130
- **Annotation**: 7 tag groups: question set CRUD, board configuration, contributions + archetypes, player order, chain state sync, The Return sync, artifact generation + polling + download.

#### EE-S03f — specs/003-confession-album/quickstart.md
- **Title**: Confession Album — Validation Scenarios
- **Tags**: `checklist`, `testing`
- **Lines**: 153
- **Annotation**: 7 scenarios: question curation, full chain game night (10 turns), offline resilience, Album PDF generation, Proust's Answer delivery, archetype assignment, player order edge cases.

#### EE-S03g — specs/003-confession-album/tasks.md
- **Title**: Confession Album — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 295
- **Annotation**: 18 tasks, 5 phases, 88 hours total. Critical path: T01→T02→T09→T10→T11→T15→T16. P0/P2/P3 and US-xxx markers.

#### EE-S03h — specs/003-confession-album/checklists/requirements.md
- **Title**: Confession Album — Requirements Checklist
- **Tags**: `checklist`, `quality`, `gates`, `accessibility`
- **Lines**: 224
- **Annotation**: 8 sections: constitution gates (30 items), 59 FRs, 10 NFRs, 8 performance targets, 11 accessibility checkpoints, 9 data integrity rules, 7 cross-spec integration points, 10 template verification checks.

---

### Thread 4 (Batch 2, Agent `004`): murder-mystery

**Agent**: `a0758dfda6469dd23` | **Duration**: ~12 min | **Tokens**: ~153K | **Tool calls**: 37

#### EE-S04a — specs/004-murder-mystery/spec.md
- **Title**: Murder Mystery — Feature Specification
- **Tags**: `spec`, `murder-mystery`, `claude-api`, `three-act`, `characters`
- **Lines**: 650
- **Annotation**: 8 user stories: setting seed selection/generation via Claude API (P1), character sheet delivery (P1), three-act game night dashboard (P1), accusation submission + awards voting (P2), The Dossier (P1), Menu of the Damned (P2), The Sealed Envelope (P2), Society Page Photo (P3 deferred). 44 functional requirements (FR-101 through FR-144). Setting seed: 4-axis configuration (era, location, milieu, tension) → Claude API generates characters, crime, clues, timeline. Three acts: Arrival+Setting, Crime+Investigation, Accusations+Reveal. The most narratively complex spec.

#### EE-S04b — specs/004-murder-mystery/plan.md
- **Title**: Murder Mystery — Implementation Plan
- **Tags**: `plan`, `claude-api`, `offline`, `three-act`
- **Lines**: 248
- **Annotation**: Constitution check (all pass). ~30 source files. ASCII data flows for seed generation, offline game night, and artifact rendering. 7 risks (Claude API latency, cost at $0.05/gen, rate limiting). Complexity: adds Claude API as external service.

#### EE-S04c — specs/004-murder-mystery/research.md
- **Title**: Murder Mystery — Technology Research
- **Tags**: `research`, `claude-api`, `anthropic-sdk`, `gale-shapley`, `clue-distribution`
- **Lines**: 196
- **Annotation**: Claude API integration (Anthropic SDK, system prompt design, structured JSON output, validation, cost estimation, rate limiting). Character assignment modes including Gale-Shapley for preferences. Three-act dashboard UX (smart-home ambient patterns, hold-to-confirm, 30s undo). Clue distribution (tier-based progressive reveal). Offline architecture. Template data mapping.

#### EE-S04d — specs/004-murder-mystery/data-model.md
- **Title**: Murder Mystery — Database Schema
- **Tags**: `data-model`, `jsonb`, `characters`, `clues`, `accusations`
- **Lines**: 433
- **Annotation**: JSONB structure in `sessions.config` with CHECK constraint and GIN index. `seed_generation_log` for rate limiting. Full TypeScript interfaces: MurderMysteryData, SettingSeed, Character, Crime, RedHerring, TimelineEvent, Clue, GameNightState, Accusation, Award, SealedEnvelope. WatermelonDB local schema (4 tables). Sync protocol. RLS policies. Entity relationship diagram. Fixture-to-schema mapping.

#### EE-S04e — specs/004-murder-mystery/contracts/openapi.yaml
- **Title**: Murder Mystery — API Contracts
- **Tags**: `api`, `openapi`, `claude-api`, `accusations`, `awards`
- **Lines**: 761
- **Annotation**: 10 endpoints: seed generation (Claude proxy), character assign/deliver, act advancement, clue distribution, accusation submit/retrieve, awards vote/results, sealed envelope save, artifact render trigger.

#### EE-S04f — specs/004-murder-mystery/quickstart.md
- **Title**: Murder Mystery — Validation Scenarios
- **Tags**: `checklist`, `testing`
- **Lines**: 232
- **Annotation**: 6 scenarios: Claude API seed generation, character packet delivery, offline game night, accusation + awards, The Dossier generation, Sealed Envelope lifecycle.

#### EE-S04g — specs/004-murder-mystery/tasks.md
- **Title**: Murder Mystery — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 298
- **Annotation**: 66 tasks across 11 phases (one per user story + setup + polish). Dependency graph with parallel opportunities. MVP-first: US1+US3+US5.

#### EE-S04h — specs/004-murder-mystery/checklists/requirements.md
- **Title**: Murder Mystery — Requirements Checklist
- **Tags**: `checklist`, `quality`, `gates`
- **Lines**: 116
- **Annotation**: 64 items: 44 FRs + 20 constitution gate checks.

---

### Thread 5 (Batch 2, Agent `005`): game-night-engine

**Agent**: `a9eb8bd6f2aff31ac` | **Duration**: ~14 min | **Tokens**: ~156K | **Tool calls**: 39

#### EE-S05a — specs/005-game-night-engine/spec.md
- **Title**: Game Night Engine — Feature Specification
- **Tags**: `spec`, `dashboard`, `offline`, `ambient`, `accessibility`, `plugin`
- **Lines**: 686
- **Annotation**: 8 user stories: ambient mode dashboard (P1), phase progression with undo (P1), optional timer (P2), emergency reference overlay (P2), fully offline game night (P1 constitutional), written answer mode (P2), pass/skip + player management (P2), post-game sync (P3). 53 functional requirements. The dashboard shell that specs 003 and 004 plug into via a TypeScript plugin interface. "The phone is a candle on the table." Critical for Analog Gate and Offline Gate compliance. 10 edge cases including host disconnect, player drops, and mid-game addition.

#### EE-S05b — specs/005-game-night-engine/plan.md
- **Title**: Game Night Engine — Implementation Plan
- **Tags**: `plan`, `expo-sqlite`, `plugin-architecture`, `ambient-mode`
- **Lines**: 373
- **Annotation**: Chooses Expo SQLite over WatermelonDB (simpler, zero deps, sufficient for single-writer sync). expo-keep-awake, expo-brightness. Plugin architecture: TypeScript interface with PhaseDefinition, ReferenceTabDefinition, GamePanelProps. ASCII data flows for pre-cache, game night (local-only), and post-game sync. 1/3 Edge Functions consumed.

#### EE-S05c — specs/005-game-night-engine/research.md
- **Title**: Game Night Engine — Technology Research
- **Tags**: `research`, `expo-sqlite`, `wake-lock`, `ambient-mode`, `sync`, `accessibility`
- **Lines**: 419
- **Annotation**: WatermelonDB vs Expo SQLite detailed comparison (decision: SQLite). Wake lock (expo-keep-awake, platform behaviors, OEM quirks). Ambient mode (brightness API, OLED-friendly hex values, comparable apps). Sync protocol (single writer, one-directional, queue+retry, exponential backoff). React Native accessibility APIs. Expo SQLite SDK 51+ examples. Alternatives rejected: CRDTs, Supabase Realtime for sync, WatermelonDB sync.

#### EE-S05d — specs/005-game-night-engine/data-model.md
- **Title**: Game Night Engine — Database Schema
- **Tags**: `data-model`, `sqlite`, `postgresql`, `sync-queue`, `events`
- **Lines**: 444
- **Annotation**: Local SQLite (6 tables: local_sessions, local_participants, local_game_data, game_night_local_state, game_night_log with 17 event types, sync_queue). Server PostgreSQL (3 tables: game_night_logs, game_night_summaries, written_answers). GamePlugin TypeScript contract. Data retention: local cleanup after sync + 7 days, server follows session ARCHIVED + 90 days.

#### EE-S05e — specs/005-game-night-engine/contracts/openapi.yaml
- **Title**: Game Night Engine — API Contracts
- **Tags**: `api`, `openapi`, `sync`, `recovery`
- **Lines**: 457
- **Annotation**: 3 endpoints: POST sync-game-night (idempotent push with dedup), GET resume-game-night (device recovery), POST recover-game-night (emergency partial data recovery). 17 event types defined. Minimal API surface — the engine is designed to run offline.

#### EE-S05f — specs/005-game-night-engine/quickstart.md
- **Title**: Game Night Engine — Validation Scenarios
- **Tags**: `checklist`, `testing`, `offline`
- **Lines**: 239
- **Annotation**: 8 scenarios: offline full walkthrough, host disconnect recovery, phase progression with undo, sync on reconnect, timer behavior, emergency reference, written answer mode, player drop + addition. 25-item smoke test.

#### EE-S05g — specs/005-game-night-engine/tasks.md
- **Title**: Game Night Engine — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 662
- **Annotation**: 27 tasks across 6 phases: setup, dashboard shell, timer + reference, accessibility, sync + plugins, polish. Full dependency graph. 21-28 day timeline. The longest tasks.md file.

#### EE-S05h — specs/005-game-night-engine/checklists/requirements.md
- **Title**: Game Night Engine — Requirements Checklist
- **Tags**: `checklist`, `quality`, `gates`, `offline`, `accessibility`
- **Lines**: 274
- **Annotation**: Organized by: spec quality, constitution (all 4 gates), dashboard shell, offline + sync, accessibility (written answer, pass/skip, screen reader, visual), plugin architecture, performance, edge cases, data model, API, testing, docs.

---

### Thread 6 (Batch 2, Agent `006`): artifact-pipeline

**Agent**: `a69da51f9246dde47` | **Duration**: ~11 min | **Tokens**: ~142K | **Tool calls**: 47

#### EE-S06a — specs/006-artifact-pipeline/spec.md
- **Title**: Artifact Pipeline — Feature Specification
- **Tags**: `spec`, `artifact-pipeline`, `pdf`, `delivery`, `delayed`
- **Lines**: 401
- **Annotation**: 5 user stories: host triggers generation (P1), artifacts distributed to players (P1), delayed delivery scheduler (P2), host writing prompts (P2), artifact library (P3). 39 functional requirements. Wraps existing `artifacts/src/render.ts` into a server-callable service. Key decision documented: Puppeteer cannot run in Supabase Edge Functions (Deno), so Cloud Run hosts the renderer. Covers all 15 artifacts (A01-A15) across 4 games. <30 second generation target.

#### EE-S06b — specs/006-artifact-pipeline/plan.md
- **Title**: Artifact Pipeline — Implementation Plan
- **Tags**: `plan`, `cloud-run`, `supabase-storage`, `resend`
- **Lines**: 172
- **Annotation**: Architecture: Edge Function (coordinator) → Cloud Run (Puppeteer renderer, wraps existing render.ts) → Supabase Storage → Expo Push / Resend email. Constitution check: 1/3 server services. "Wrap, don't rewrite" principle. pg_cron + database queue for delayed delivery. Resend for email (3K free/month).

#### EE-S06c — specs/006-artifact-pipeline/research.md
- **Title**: Artifact Pipeline — Technology Research
- **Tags**: `research`, `puppeteer`, `cloud-run`, `resend`, `pg-cron`, `react-native-pdf`
- **Lines**: 349
- **Annotation**: 6 areas: Puppeteer hosting comparison (Cloud Run recommended over Browserless/Railway/Lambda — scale-to-zero, native Chrome, free tier), Supabase Storage (signed URLs, CDN, 1GB free), email delivery (Resend vs SendGrid — Resend wins on DX), scheduled jobs (pg_cron vs Inngest — pg_cron for V1 simplicity), PDF viewing (react-native-pdf), push notifications (Expo Push API reuse from spec 002).

#### EE-S06d — specs/006-artifact-pipeline/data-model.md
- **Title**: Artifact Pipeline — Database Schema
- **Tags**: `data-model`, `postgresql`, `artifacts`, `delivery-tracking`
- **Lines**: 404
- **Annotation**: 3 tables: artifacts (status enum: queued/generating/ready/delivered/failed, file_url, personalized_for, scheduled_delivery_at), artifact_deliveries (per-recipient tracking), artifact_writing_prompts (host epilogues). RLS policies. Supabase Storage bucket config. File path conventions. Data assembly queries for Confession Album and Proust's Answer.

#### EE-S06e — specs/006-artifact-pipeline/contracts/openapi.yaml
- **Title**: Artifact Pipeline — API Contracts
- **Tags**: `api`, `openapi`, `generation`, `delivery`, `writing-prompts`
- **Lines**: 711
- **Annotation**: 10 endpoints: trigger generation, status polling, retry, distribute, delivery status, resend, writing prompts (get/submit), library listing, signed download URL, internal Cloud Run render.

#### EE-S06f — specs/006-artifact-pipeline/quickstart.md
- **Title**: Artifact Pipeline — Validation Scenarios
- **Tags**: `checklist`, `testing`, `e2e`
- **Lines**: 217
- **Annotation**: 6 scenarios: end-to-end Confession Album generation, Murder Mystery generation, delayed Proust's Answer delivery, host writing prompts, artifact library browsing, error recovery.

#### EE-S06g — specs/006-artifact-pipeline/tasks.md
- **Title**: Artifact Pipeline — Task List
- **Tags**: `tasks`, `implementation`, `phased`
- **Lines**: 270
- **Annotation**: 84 tasks across 8 phases. Phase 1 wraps existing render.ts with minimal changes. Dependency graph and parallel opportunities.

#### EE-S06h — specs/006-artifact-pipeline/checklists/requirements.md
- **Title**: Artifact Pipeline — Requirements Checklist
- **Tags**: `checklist`, `quality`, `traceability`
- **Lines**: 101
- **Annotation**: Requirements traceability matrix: 39 FRs mapped to user stories, tasks, and quickstart scenarios. Coverage: 38/39 by tasks, 36/39 by tests.

---

## Cross-Reference Indexes

### By Tag

| Tag | Files |
|-----|-------|
| `design` | EE-F01 |
| `strategy` | EE-F02 |
| `research` | EE-F03, EE-S01c, EE-S02c, EE-S03c, EE-S04c, EE-S05c, EE-S06c |
| `prd` | EE-F04 |
| `governance` | EE-G01, EE-G02, EE-G03 |
| `code` | EE-A01, EE-A02, EE-A04, EE-A05 |
| `css` | EE-A06, EE-A07, EE-A08, EE-A09, EE-A10 |
| `template` | EE-A11, EE-A12, EE-A13, EE-A14, EE-A15, EE-A16, EE-A17, EE-A18 |
| `fixture` | EE-A19, EE-A20 |
| `spec` | EE-S01a, EE-S02a, EE-S03a, EE-S04a, EE-S05a, EE-S06a |
| `plan` | EE-S01b, EE-S02b, EE-S03b, EE-S04b, EE-S05b, EE-S06b |
| `data-model` | EE-S01d, EE-S02d, EE-S03d, EE-S04d, EE-S05d, EE-S06d |
| `api` | EE-S01e, EE-S02e, EE-S03e, EE-S04e, EE-S05e, EE-S06e |
| `tasks` | EE-S01g, EE-S02g, EE-S03g, EE-S04g, EE-S05g, EE-S06g |
| `checklist` | EE-S01f, EE-S01h, EE-S02f, EE-S02h, EE-S03f, EE-S03h, EE-S04f, EE-S04h, EE-S05f, EE-S05h, EE-S06f, EE-S06h |
| `confession-album` | EE-A13, EE-A14, EE-A15, EE-A19, EE-S03a–h |
| `murder-mystery` | EE-A16, EE-A17, EE-A18, EE-A20, EE-S04a–h |
| `offline` | EE-S05a–h |
| `delayed-delivery` | EE-A14, EE-A18 |
| `claude-api` | EE-S04a, EE-S04b, EE-S04c, EE-S04e |

### By Provenance

| Source | Count | Files |
|--------|-------|-------|
| `manual` (human-authored) | 5 | EE-F01 through EE-F04, EE-G01 |
| `session-0` (pre-existing code) | 21 | EE-A01 through EE-A21 |
| `thread-main` (orchestrator) | 2 | EE-G02 (updated), EE-G03 (created) |
| `thread-1` (agent 001) | 8 | EE-S01a through EE-S01h |
| `thread-2` (agent 002) | 8 | EE-S02a through EE-S02h |
| `thread-3` (agent 003) | 8 | EE-S03a through EE-S03h |
| `thread-4` (agent 004) | 8 | EE-S04a through EE-S04h |
| `thread-5` (agent 005) | 8 | EE-S05a through EE-S05h |
| `thread-6` (agent 006) | 8 | EE-S06a through EE-S06h |

### Dependency Chain

```
EE-F01 (DESIGN) ──┐
EE-F02 (STRATEGY) ─┤──→ EE-G03 (Constitution) ──→ All specs
EE-F03 (RESEARCH) ─┤
EE-F04 (PRD) ──────┘

EE-S01 (auth) ──→ EE-S02 (pre-game) ──→ EE-S03 (confession-album)
                                     └──→ EE-S04 (murder-mystery)
              ──→ EE-S05 (game-night) ←── EE-S03, EE-S04 (plugins)
              ──→ EE-S06 (artifacts)  ←── EE-S03, EE-S04 (data shapes)
                                      ←── EE-A04–A20 (existing templates)
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total files | 75 |
| Foundation documents | 4 (5,959 lines) |
| Governance files | 3 (213 lines) |
| Artifact pipeline code | 21 (2,748 lines) |
| Spec files | 48 (20,266 lines) |
| Total project lines | ~27,186 |
| Functional requirements | 279 (40 + 44 + 59 + 44 + 53 + 39) |
| User stories | 37 (5 + 5 + 6 + 8 + 8 + 5) |
| Implementation tasks | 226 (12 + 19 + 18 + 66 + 27 + 84) |
| API endpoints | 57 (across 6 OpenAPI specs) |
| Database tables | ~30 (across all data-model files) |
| Agent generation time | ~74 min total (~12 min avg per spec) |
| Agent tokens consumed | ~787K total |
