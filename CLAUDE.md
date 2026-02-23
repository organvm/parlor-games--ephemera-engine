# CLAUDE.md — parlor-games--ephemera-engine

## What This Is

A product design and mobile app strategy for a series of unrepeatable parlor/party games. Currently in DESIGN_ONLY status — no code, no build system. The primary artifacts are the design document and the mobile app strategy.

## Key Files

- `DESIGN.md` — Complete series design document (framework + four games + template)
- `STRATEGY.md` — Mobile app research & strategy: market analysis, technical architecture (React Native), monetization, competitive landscape, ritual design theory, educator market, artifact generation
- `RESEARCH.md` — Academic research synthesis (~270 citations across 7 domains): self-disclosure psychology, game studies, ritual/liminality, collaborative creativity, loneliness science, narrative psychology, material culture
- `PRD.md` — Product Requirements Document: app features, screens, user flows, data models, artifact specs, notification catalog, content pack format (~2,700 lines)
- `seed.yaml` — Organ III registration

## The Four Games

1. **Murder Mystery** — immersive whodunit with character sheets, contributions, investigation
2. **Whose Memory?** — anonymous storytelling and attribution game
3. **The Confession Album** — chain-answering Proust Questionnaire with diminishing board
4. **The Exquisite Corpse** — cut-up / story spine collaborative fiction game

## Status

DESIGN_ONLY. Next steps:
1. ~~Product Requirements Document (PRD) — app features, screens, user flows~~ **DONE** (PRD.md)
2. Artifact template system — visual design for post-game PDFs
3. Content library authoring (200+ questions, 30+ era packets, 50+ structural templates)
4. Technical architecture document — data models, API design, offline-first patterns
5. Prototype artifact generation — HTML/CSS → PDF pipeline proof of concept

## PRD Structure

The PRD (PRD.md) is organized in three layers:
- **Layer 1 — Shared Platform** (§2): auth, sessions, invitations, contributions, notifications, artifacts, store
- **Layer 2 — Game Modules** (§3): Confession Album (P0), Murder Mystery (P0), Whose Memory? (P1), Exquisite Corpse (P1)
- **Layer 3 — Cross-Cutting** (§4): accessibility, privacy, offline, performance, error handling

Appendices (§5) include: tech stack, data model, ~45-screen inventory, notification catalog, artifact catalog, content pack spec, open questions.
