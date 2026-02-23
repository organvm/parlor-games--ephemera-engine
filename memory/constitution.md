# Ephemera Engine Constitution

Immutable architectural principles derived from DESIGN.md and STRATEGY.md. All specifications must comply with these gates.

**Version**: 1.0 | **Ratified**: 2026-02-23

## Core Principles

### I. Analog Warmth, Digital Scaffolding

The app scaffolds; the game lives in the room. During game night, minimal screen interaction. No features that replace human interaction. The phone is a candle on the table, not a flashlight in the face. Technology generates the scenario, coordinates the menu, compiles the post-game artifact — but during the evening, the screen is dark.

*Source: DESIGN.md §I, STRATEGY.md §Pillar 5*

### II. Offline-First Game Night

Game night must work with zero connectivity. The local database is the source of truth during ACTIVE state. Sync is eventual, not required. All game data pre-cached when session enters ACTIVE. No network requests during game night. Local changes sync to server when connectivity resumes.

*Source: PRD §4.3, STRATEGY.md §Pillar 6*

### III. Privacy by Design

No social feed, no public profiles, no sharing. Player content belongs to the session. Contributions encrypted at rest. Minimal data retention (session + 90 days). No advertising, no tracking. No cross-session data sharing. Artifact ownership belongs to participants.

*Source: STRATEGY.md §8.3, PRD §4.2*

### IV. Host as Creative Tool

Every host-facing screen feels like curation, not administration. Configuration has sensible defaults but deep customization. The host is a player, not just a coordinator. The host dashboard should feel like designing a menu or curating an exhibition, not filling out forms.

*Source: DESIGN.md §I ("The host is a player"), STRATEGY.md §8.2*

### V. Preparation is Play

Pre-game is the first act, not logistics. Contribution briefs are narratively motivated, not arbitrary. Invitations set atmosphere, not rules. The game begins when the envelope arrives. Receiving your character sheet, choosing what to cook, deciding what story to tell — these are creative acts.

*Source: DESIGN.md §I, §II, §IV*

### VI. Ephemera over Permanence

Artifacts preserve traces, not recordings. A case file, not a transcript. A zine, not a video. The best moments are the ones you had to be there for. The form is the meaning — a confession album that looks like a database has confessed nothing.

*Source: DESIGN.md §I, §IV*

### VII. Simplicity

Maximum 5 Supabase Edge Functions or equivalent server-side services. No premature abstraction. Use framework primitives directly (Expo APIs, Supabase client). YAGNI. Start simple, add complexity only when proven necessary. Every additional dependency, service, or abstraction layer requires justification.

*Budget rationale (updated 2026-02-23): Original ≤3 budget cannot hold the specified feature set. Realistic allocation: (1) send-notification, (2) generate-artifacts trigger, (3) game-night-sync, (4) generate-seed (Claude API proxy), (5) reserve. IAP receipt validation deferred to V1.1; pg_cron handles scheduling without consuming an Edge Function slot.*

*Source: STRATEGY.md §Pillar 6, PRD §5.1*

## Architectural Gates

Checked during `/speckit.plan` for every specification.

### Simplicity Gate

- [ ] Total server-side services ≤5?
- [ ] No speculative "might need" features?
- [ ] Using framework primitives directly (not wrapped)?
- [ ] No premature abstractions or repository patterns?
- [ ] Single database schema (Supabase PostgreSQL)?

### Offline Gate

- [ ] All game night features work without network connectivity?
- [ ] Local database holds complete session state during ACTIVE?
- [ ] No network requests required during game night phase?
- [ ] Sync is eventual and non-blocking?
- [ ] Dashboard operates entirely from local data?

### Privacy Gate

- [ ] No data leaves the session boundary without explicit consent?
- [ ] No cross-session data sharing or aggregation?
- [ ] No public profiles or social features?
- [ ] Player contributions scoped to session participants only?
- [ ] Minimal data retention policy enforced?

### Analog Gate

- [ ] No feature replaces in-room human interaction?
- [ ] Game night UI is ambient and glanceable, not attention-demanding?
- [ ] Screen-dark principle respected (minimal phone use during play)?
- [ ] All game-night player interactions happen in the room, not through the app?
- [ ] Timer is optional, never forced?

## Governance

- This constitution supersedes all other architectural decisions within the Ephemera Engine project.
- Amendments require documented rationale and explicit approval.
- Violations must be justified in the Complexity Tracking section of the relevant plan.md.
- All six specifications (001–006) must pass all four gates.
