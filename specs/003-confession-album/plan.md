# Implementation Plan: 003-confession-album

**Spec**: [spec.md](./spec.md)
**Last Updated**: 2026-02-23

---

## 1. Constitution Check

Before implementation, every planned component is validated against the project's 7 principles and 4 gates.

### Principle Alignment

| Principle | How This Spec Honors It |
|-----------|------------------------|
| **Analog Warmth** | The digital board is a display tool held by the host. Players never touch a screen during their turn -- they approach a board (physical or displayed), speak aloud, and choose with their voice or finger. The app tracks; the room plays. |
| **Offline-First** | All game night state (chain entries, board state, bookmarks) stored in local SQLite via WatermelonDB. Zero network calls between "Start Game Night" and "End Game Night." Sync happens before and after. |
| **Privacy by Design** | Answers belong to the session. No cross-session data leakage. Proust's Answer is delivered per-player, not broadcast. No social sharing features. |
| **Host as Creative Tool** | Question set curation is a creative act: choosing lineages, removing questions, reordering. The host shapes the evening's emotional arc through curation, not administration. |
| **Preparation is Play** | Contribution archetype assignment makes pre-game meaningful: interpreting "your idea of happiness" as a drink is a creative act. The invitation itself sets atmosphere. |
| **Ephemera over Permanence** | The Album is a trace, not a transcript. It records which questions were paired with whom -- not a verbatim recording. Proust's Answer arrives once and lives in the player's artifact library. |
| **Simplicity** | 2 taps per turn. One screen for the board. One screen for the chain tracker. Three artifacts total, two of which share a template bundle. |

### Gate Validation

| Gate | Status | Notes |
|------|--------|-------|
| Simplicity Gate | PASS | No new Edge Functions required. Question set CRUD uses existing Supabase REST. Artifact generation reuses 006 pipeline. |
| Offline Gate | PASS | WatermelonDB schema covers all game night entities. Pre-cache on session ACTIVE transition. |
| Privacy Gate | PASS | No new data exposure vectors. Proust's Answer is per-player delivery, not shared. |
| Analog Gate | PASS | Host holds the device. Players interact with the room. The app's role during game night is scorekeeper and display, not mediator. |

---

## 2. Architecture Overview

### Component Map

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Pre-Game     │  │  Game Night   │  │  Post-Game    │  │
│  │  Screens      │  │  Screens      │  │  Screens      │  │
│  │              │  │              │  │              │  │
│  │ • Lineage    │  │ • Digital    │  │ • Generation  │  │
│  │   Selector   │  │   Board      │  │   Progress    │  │
│  │ • Board      │  │ • Chain      │  │ • Artifact    │  │
│  │   Preview    │  │   Tracker    │  │   Preview     │  │
│  │ • Board      │  │ • The        │  │ • Distribution│  │
│  │   Config     │  │   Portrait   │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│  ┌──────┴─────────────────┴─────────────────┴───────┐  │
│  │              State Management (Zustand)            │  │
│  │  • questionSetStore    • chainStore               │  │
│  │  • boardConfigStore    • portraitStore             │  │
│  └──────────────┬────────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────┴────────────────────────────────────┐  │
│  │           Local Database (WatermelonDB)            │  │
│  │  Tables: question_items, chain_entries,            │  │
│  │          return_entries, contributions,             │  │
│  │          board_config, player_order                │  │
│  └──────────────┬────────────────────────────────────┘  │
│                 │ (sync when online)                     │
└─────────────────┼───────────────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────────────┐
│                    Supabase Backend                       │
│                                                          │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL    │  │  Storage     │  │  Edge Fn     │  │
│  │               │  │  (PDFs)      │  │  (generate-  │  │
│  │ • sessions    │  │              │  │   artifact)  │  │
│  │ • question_   │  │              │  │              │  │
│  │   items       │  │              │  │              │  │
│  │ • chain_      │  │              │  │              │  │
│  │   entries     │  │              │  │              │  │
│  │ • artifacts   │  │              │  │              │  │
│  └───────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **WatermelonDB for game night state**: Chosen over raw SQLite because it provides reactive queries (board UI updates automatically when a question is removed) and built-in sync primitives. Aligns with PRD Open Question #3.

2. **Zustand stores per feature area**: Lightweight, TypeScript-native state management. Each game phase gets its own store. Stores hydrate from WatermelonDB on game night start.

3. **Single Edge Function for artifact generation**: The `generate-artifact` Edge Function (defined in 006-artifact-pipeline) receives session data, selects the appropriate Nunjucks template, renders HTML, converts to PDF via Puppeteer, and uploads to Supabase Storage. This spec defines the data contract; 006 defines the pipeline.

4. **Content library as local SQLite**: Question content bundled with the app and loaded into WatermelonDB. Content packs downloaded and merged into the same local store. No network call needed to browse questions during session creation if content is pre-cached.

---

## 3. Project Structure

New files and directories introduced by this spec:

```
src/
├── features/
│   └── confession-album/
│       ├── screens/
│       │   ├── QuestionLineageSelector.tsx    # PRD Screen 11
│       │   ├── BoardPreview.tsx               # PRD Screen 12
│       │   ├── BoardConfiguration.tsx         # PRD Screen 13
│       │   ├── DigitalBoard.tsx               # PRD Screen 29
│       │   ├── ChainTracker.tsx               # PRD Screen 30
│       │   └── ThePortrait.tsx                # PRD Screen 31
│       ├── components/
│       │   ├── QuestionCard.tsx               # Individual question on board
│       │   ├── QuestionCardAnimated.tsx       # Animated wrapper (removal)
│       │   ├── BoardGrid.tsx                  # Grid layout for digital board
│       │   ├── BoardList.tsx                  # List layout
│       │   ├── BoardScattered.tsx             # Scattered/artistic layout
│       │   ├── TurnStateIndicator.tsx         # Inherit/Choose step display
│       │   ├── PlayerOrderBar.tsx             # Turn order bar
│       │   ├── AnswerPairCard.tsx             # Pair display for Portrait
│       │   ├── BookmarkButton.tsx             # Bookmark toggle
│       │   ├── LineagePicker.tsx              # Lineage selection radio
│       │   ├── RegisterBadge.tsx              # light/medium/deep badge
│       │   └── ArchetypeAssigner.tsx          # Archetype assignment UI
│       ├── stores/
│       │   ├── questionSetStore.ts            # Question curation state
│       │   ├── chainStore.ts                  # Chain mechanic state
│       │   ├── boardConfigStore.ts            # Board display config
│       │   └── portraitStore.ts               # Portrait curation state
│       ├── hooks/
│       │   ├── useQuestionSet.ts              # Question filtering, search
│       │   ├── useChain.ts                    # Chain turn management
│       │   ├── useBoard.ts                    # Board display logic
│       │   ├── usePortrait.ts                 # Portrait pair navigation
│       │   └── useContributionArchetypes.ts   # Archetype assignment
│       ├── utils/
│       │   ├── questionFilters.ts             # Filter by lineage, register, domain
│       │   ├── targetCountCalculator.ts       # guest_count + 5 logic
│       │   ├── archetypeDistributor.ts        # Even distribution algorithm
│       │   └── chainValidator.ts              # Chain integrity checks
│       ├── types/
│       │   └── confession-album.ts            # TypeScript types (see data-model.md)
│       └── __tests__/
│           ├── questionFilters.test.ts
│           ├── targetCountCalculator.test.ts
│           ├── archetypeDistributor.test.ts
│           ├── chainValidator.test.ts
│           ├── chainStore.test.ts
│           └── questionSetStore.test.ts
├── db/
│   └── models/
│       ├── QuestionItem.ts                    # WatermelonDB model
│       ├── ChainEntry.ts                      # WatermelonDB model
│       ├── ReturnEntry.ts                     # WatermelonDB model
│       └── ContributionItem.ts                # WatermelonDB model
└── services/
    └── confession-album/
        ├── questionSetService.ts              # CRUD for question sets
        ├── chainService.ts                    # Chain state management
        └── artifactDataAssembler.ts           # Assemble data for artifact generation
```

Existing files modified:
```
artifacts/templates/confession-album/
├── the-album.njk                              # Already exists, may need chain-data integration
├── prousts-answer.njk                         # Already exists
└── contributions-table.njk                    # Already exists, extend for archetype display
artifacts/fixtures/
└── confession-album.json                      # Already exists, extend with chain data
```

---

## 4. Data Flow

### Pre-Game: Question Set Curation

```
Host selects lineage
  → Content library query (local WatermelonDB)
  → Questions loaded into questionSetStore
  → Host adds/removes/reorders
  → Final set saved to session.config.question_set (Supabase)
  → Synced to local DB for game night
```

### Game Night: The Chain

```
Host starts game night
  → All session data pre-cached to local SQLite
  → chainStore initialized (turn=1, board=full)
  → Per turn:
      1. Dashboard shows inheritance (previous question)
      2. Host taps question on board → chosen_question_id set
      3. Host taps "Remove" → question status = "removed"
      4. ChainEntry written to local DB
      5. Turn advances
  → Board empty → Portrait mode
  → Host ends game → session state = COMPLETE
  → Local changes sync to Supabase
```

### Post-Game: Artifact Generation

```
Host taps "Generate Artifacts"
  → Client calls generate-artifact Edge Function
  → Edge Function:
      1. Reads session + chain entries from Supabase
      2. Assembles template data (see artifactDataAssembler.ts)
      3. Renders the-album.njk via Nunjucks
      4. Puppeteer HTML → PDF
      5. Uploads PDF to Supabase Storage
      6. Creates Artifact record (status=ready)
  → Client polls artifact status
  → On ready: host previews, then distributes

7 days later:
  → Scheduled job reads chain entries per player
  → For each (player, question) pair:
      1. Looks up proust_response from QuestionItem
      2. Renders prousts-answer.njk
      3. Puppeteer → PDF
      4. Uploads, creates Artifact (personalized_for=player_id)
  → Push notification at 10 AM local
```

---

## 5. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Answer text capture ambiguity (Open Question #4) | High | High | Start with host-typed summaries for V1. The Album works with question pairings + attribution even without full text. Full text is a V1.1 enhancement. |
| WatermelonDB reactive performance with 40 questions | Medium | Low | WatermelonDB is designed for reactive lists. 40 items is trivial. Profile early with 50+ questions. |
| Board animation jank on lower-end Android | Medium | Medium | Use React Native Reanimated for 60fps animations. Test on minimum device (Android 10, 4GB RAM). Fallback: instant removal with no animation if reduce_motion is set. |
| Proust's Answer scheduled delivery reliability | Medium | Medium | Use Supabase pg_cron or external scheduler (e.g., Inngest). Implement delivery retry with exponential backoff. Monitor delivery rates. |
| Offline sync conflicts after game night | Low | Low | Host device is always authoritative. Last-write-wins. Only one host per session. |

---

## 6. Implementation Phases

**Total estimated effort**: ~19 tasks, ~20–25 working days (solo developer)

### Phase 1: Data Layer + Content Library (Tasks 1-4) — ~4 days
- TypeScript types
- WatermelonDB models + migrations
- Question content seeding
- Supabase schema

### Phase 2: Pre-Game Screens (Tasks 5-8) — ~5 days
- Lineage selector
- Board preview + curation
- Board configuration
- Archetype assignment
- Player order

### Phase 3: Game Night Core (Tasks 9-12) — ~6 days
- Digital board display (with Physical Board fallback mode)
- Chain tracker
- Bookmark + undo
- Local persistence

### Phase 4: Post-Game + Artifacts (Tasks 13-16) — ~5 days
- The Portrait screen
- Album data assembler
- Template integration
- Proust's Answer scheduler

### Phase 5: Polish + Testing (Tasks 17-18) — ~4 days
- Animation polish
- E2E tests
- Constitution gate audit
