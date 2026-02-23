# SDD-003: The Confession Album

**Spec**: 003-confession-album
**Status**: Draft
**Priority**: P0 (Launch Requirement)
**Last Updated**: 2026-02-23
**Depends On**: [001-auth-and-sessions](../001-auth-and-sessions/spec.md), [002-pre-game-lifecycle](../002-pre-game-lifecycle/spec.md)
**Depended On By**: [005-game-night-engine](../005-game-night-engine/spec.md), [006-artifact-pipeline](../006-artifact-pipeline/spec.md)

**Source Documents**:
- PRD.md §3.1 (all subsections 3.1.1–3.1.12)
- DESIGN.md §IV (Game 3: The Confession Album)
- PRD.md §5.5 Artifact Catalog (A01–A03)
- PRD.md §5.6 Content Pack Specification (Question type)

---

## 1. Overview

The Confession Album is one of two P0 game modules in the Ephemera Engine. It implements a chain-answering parlor game built on the Victorian confession album tradition -- the parlor game Marcel Proust made famous when he completed one at age thirteen.

The module spans all three phases of the game lifecycle:

- **Pre-Game**: Host curates a question set from the content library, configures the board format, assigns contribution archetypes to guests, and sets player order.
- **Game Night**: A digital (or physical) board displays questions. Players take turns in The Chain: each inherits the previous player's question, then selects a new one from the board. The board visibly diminishes. The host tracks pairings for artifact generation.
- **Post-Game**: Three artifacts are generated -- The Album (immediate booklet PDF), The Contributions Table (within The Album), and Proust's Answer (delayed personalized letters, 7 days later).

The Chain mechanic is the heart of the game: every question except the first and last is answered by exactly two people -- the one who chose it and the one who inherited it. This pairing of a deliberate answer with an unguarded one is the game's central tension.

---

## 2. User Stories

### US-001: Host Curates Question Set (P1)

**As a** host creating a Confession Album session,
**I want to** select a base question lineage and then add, remove, and reorder questions,
**so that** the board reflects my creative vision for the evening's register and depth.

**Acceptance Criteria**:

```gherkin
Scenario: Select base lineage
  Given the host has selected "The Confession Album" during session creation
  When the host reaches the Question Set Configuration screen
  Then the host sees four lineage options: Classic Proust, Vanity Fair, Pivot/Lipton, Thematic Remix
  And a "Surprise me" option that selects a balanced mix
  And selecting a lineage loads all questions from that lineage into the Board Preview

Scenario: Remove a question from the board
  Given the host is viewing the Board Preview with 35 Classic Proust questions loaded
  When the host taps a question to deselect it
  Then the question is visually dimmed and excluded from the final set
  And the running question count updates immediately

Scenario: Add questions from another lineage
  Given the host has Classic Proust as the base lineage
  When the host taps "Add from other lineages"
  Then the host can browse or search questions from Vanity Fair, Pivot/Lipton, and Thematic Remix
  And tapping a question adds it to the Board Preview
  And the question's lineage badge is visible

Scenario: Reorder questions on the board
  Given the host is viewing the Board Preview
  When the host long-presses and drags a question
  Then the question moves to the new position
  And the board_position values update accordingly

Scenario: Target count guidance
  Given the session has 8 guests
  When the host views the Board Preview
  Then the system displays "Suggested: 13 questions (8 guests + 5)"
  And a warning appears if the count drops below 8 or exceeds 18

Scenario: Question metadata visible
  Given the Board Preview is displayed
  When the host taps a question to view details
  Then the host sees the question's register (light/medium/deep), domain, lineage, and whether a Proust historical response exists
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-001 | System loads all questions from the selected base lineage into Board Preview | P0 |
| FR-002 | Host can deselect individual questions to remove them from the set | P0 |
| FR-003 | Host can add questions from other lineages via browse or search | P0 |
| FR-004 | Host can reorder questions via drag-and-drop | P0 |
| FR-005 | System displays suggested target count (guest_count + 5) | P0 |
| FR-006 | System warns when count < guest_count or > guest_count + 10 | P0 |
| FR-007 | "Surprise me" generates a balanced set immediately | P0 |
| FR-008 | Each question displays register, domain, lineage, and proust_response availability | P0 |
| FR-009 | Board Preview loads all questions with metadata in < 1 second | P0 |
| FR-010 | Full question set curation completable in < 10 minutes | P0 |

---

### US-002: Chain Mechanic Tracks Board Diminishment (P1)

**As a** host running game night,
**I want to** display the question board, track the chain mechanic, and bookmark notable answer pairs,
**so that** the evening flows smoothly and the data feeds accurate artifact generation.

**Acceptance Criteria**:

```gherkin
Scenario: Digital board displays all questions
  Given the host has started game night for a session with 13 questions
  When the Game Night Dashboard loads
  Then all 13 questions are displayed in the configured layout (grid, list, or scattered)
  And the remaining question count shows "13 remaining"
  And the current player is highlighted in the turn order bar

Scenario: Host selects a question during a player's turn
  Given it is Player 2's turn and they have completed the inheritance step
  When the host taps a question on the digital board
  Then the question expands to show full text
  And the dashboard records this as Player 2's chosen question
  And a "Remove" button appears

Scenario: Question removal with animation
  Given the host taps "Remove" on the selected question
  Then the question animates out (300ms fade + collapse)
  And a gap remains visible where the question was
  And the remaining count decrements by 1
  And the font size of remaining questions scales up if fewer than 8 remain

Scenario: Undo question removal
  Given a question was just removed
  When the host taps "Undo" within 10 seconds
  Then the question reappears in its original position
  And the chain entry is reverted

Scenario: Chain turn tracking
  Given it is Player 3's turn
  When the dashboard shows the turn state
  Then Step 1 reads "INHERIT -- Answer [Player 2]'s question: '[Question Text]'"
  And Step 2 reads "CHOOSE -- Select a new question from the board"
  And the host can tap the board to record Player 3's choice

Scenario: Bookmark a notable pair
  Given Player 3 has completed both steps of their turn
  When the host taps the bookmark icon on this turn entry
  Then the pairing is flagged as bookmarked
  And it will appear highlighted during The Portrait

Scenario: Board empty triggers portrait
  Given the last question has been removed from the board
  Then the dashboard displays "Board Empty -- Begin The Portrait"
  And the "Begin The Return" button appears if the_return is enabled in session config

Scenario: Chain state survives app backgrounding
  Given the host's app is backgrounded during turn 5 of the chain
  When the host returns to the app
  Then the dashboard resumes at turn 5 with all previous chain entries intact
  And no data has been lost
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-011 | Digital board displays all questions in the configured layout | P0 |
| FR-012 | Host taps a question to select it as the current player's choice | P0 |
| FR-013 | Question removal animation completes in 300ms (fade + collapse) | P0 |
| FR-014 | Gaps remain visible after removal (board does not reflow) | P0 |
| FR-015 | Font scales up as question count decreases below threshold | P0 |
| FR-016 | Host can undo a removal within 10 seconds | P0 |
| FR-017 | Dashboard shows current player, inheritance step, and choice step | P0 |
| FR-018 | ChainEntry logged per turn: turn_number, player_id, inherited_question_id, chosen_question_id, bookmarked | P0 |
| FR-019 | Host can bookmark a pairing with one tap | P0 |
| FR-020 | Remaining question count visible at all times | P0 |
| FR-021 | Chain state persisted to local SQLite every 30 seconds and on every turn completion | P0 |
| FR-022 | Turn tracking requires <= 2 host taps per turn (select question + remove) | P0 |

---

### US-003: The Album Artifact Generated (P1)

**As a** host completing game night,
**I want to** trigger generation of The Album PDF containing all question-answer pairs,
**so that** every participant receives a beautiful keepsake of the evening.

**Acceptance Criteria**:

```gherkin
Scenario: Host triggers artifact generation
  Given the session has moved to COMPLETE state
  When the host taps "Generate Artifacts"
  Then a confirmation dialog appears: "Generate The Album and Contributions Table?"
  And on confirm, a generation progress screen appears

Scenario: Album PDF generated with correct content
  Given artifact generation has been triggered
  When the server-side pipeline completes
  Then the resulting PDF contains:
    | Page | Content |
    | Cover | "The Confession Album", session title, date, host name, location, question set lineage |
    | TOC | List of all questions with player count |
    | Per-question pages | Question text, chooser name + answer, inheritor name + answer, page number |
    | Contributions Table | Guest name, archetype, item description |
    | Colophon | Date, participant names, lineage, "Assembled by the Ephemera Engine" |
  And all question-answer pairings are correctly attributed from ChainEntry data

Scenario: Album generation performance
  Given a session with 13 questions and 8 players
  When artifact generation runs
  Then The Album PDF is generated in < 30 seconds
  And the file size is < 5 MB
  And the PDF is print-ready quality (300 DPI)

Scenario: Album uses existing Nunjucks template
  Given the artifact generation pipeline processes The Album
  When the template engine renders the HTML
  Then it uses the template at artifacts/templates/confession-album/the-album.njk
  And applies the confession-album theme with Playfair Display, Lora, and JetBrains Mono fonts
  And uses the warm cream / deep green / gold color palette

Scenario: Artifact distribution
  Given The Album has been generated
  When the host triggers distribution
  Then app players receive a push notification "Your Album is ready"
  And app players can download the PDF in-app
  And web players receive an email with the PDF attachment
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-023 | Album PDF generated from ChainEntry data + session metadata | P0 |
| FR-024 | Album uses the-album.njk Nunjucks template | P0 |
| FR-025 | Cover page includes session title, date, host, location, lineage badge | P0 |
| FR-026 | Each question gets one page with both answers attributed (chooser + inheritor) | P0 |
| FR-027 | Contributions Table included as a page within The Album | P0 |
| FR-028 | Colophon page with session metadata and engine attribution | P0 |
| FR-029 | Generation completes in < 30 seconds | P0 |
| FR-030 | PDF file size < 5 MB | P0 |
| FR-031 | PDF is print-ready at 300 DPI | P0 |
| FR-032 | App players receive push notification on generation complete | P0 |
| FR-033 | Web players receive email with PDF attachment | P0 |

---

### US-004: The Return Variant and The Portrait (P2)

**As a** host,
**I want to** optionally activate The Return round after the board empties and then conduct The Portrait by reading curated answer pairs,
**so that** the evening has a satisfying climactic arc.

**Acceptance Criteria**:

```gherkin
Scenario: Activate The Return
  Given the board is empty and return_enabled is true in session config
  When the host taps "Begin The Return"
  Then the dashboard switches to open-floor mode
  And any player can volunteer to re-ask any question to any other player
  And the host can optionally log ReturnEntry records (asker, target, question)

Scenario: The Return is informal
  Given The Return is active
  When the host does not log a re-ask
  Then no data is required for this round
  And the round proceeds as a fully analog interaction
  And the host can end it at any time with "End The Return"

Scenario: Begin The Portrait
  Given The Chain is complete (and The Return has ended, if activated)
  When the host taps "Begin The Portrait"
  Then the dashboard displays all answer pairings from ChainEntry data
  And bookmarked pairs appear at the top, highlighted with gold accent
  And unbookmarked pairs follow in chain order

Scenario: Navigate answer pairs during The Portrait
  Given The Portrait is active
  When the host views a pair
  Then the display shows: question text, Name A (chooser) + answer preview, Name B (inheritor) + answer preview
  And the host can swipe left/right to navigate between pairs
  And the dashboard is in ambient mode (large text, warm background, minimal UI)

Scenario: End game night
  Given The Portrait has been conducted
  When the host taps "End Game Night"
  Then the session state transitions to COMPLETE
  And the "Generate Artifacts" button becomes available
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-034 | The Return activation is a single tap, available only when return_enabled and board is empty | P2 |
| FR-035 | ReturnEntry logging is optional (round functions without tracking) | P2 |
| FR-036 | The Portrait displays all ChainEntry pairings with bookmarked pairs prioritized | P2 |
| FR-037 | Swipe navigation between pairs during The Portrait | P2 |
| FR-038 | Ambient mode during The Portrait: large text, warm background, minimal chrome | P2 |

---

### US-005: Proust's Answer Delayed Delivery (P2)

**As a** player who participated in a Confession Album session,
**I want to** receive a personalized letter pairing my answer with Proust's historical response, delivered 7 days later,
**so that** the game's final gesture arrives after the evening has settled into memory.

**Acceptance Criteria**:

```gherkin
Scenario: Proust's Answer generation for Classic Proust questions
  Given a player answered "What is your idea of perfect happiness?" (a Classic Proust question)
  When the scheduled delivery date arrives (7 days post-game)
  Then the system generates a PDF letter using prousts-answer.njk
  And the letter contains the player's full answer
  And pairs it with Proust's historical response (1886 or 1892, whichever is available)
  And includes the question lineage context

Scenario: Proust's Answer for non-Proust questions
  Given a player answered a Vanity Fair question that Proust never answered
  When the letter is generated
  Then the letter notes "Proust was never asked your question"
  And pairs it with an adjacent Proust answer with a contextual bridge
  And the proust_adjacent field from the QuestionItem is used

Scenario: One letter per question answered
  Given Player 3 answered 2 questions (one inherited, one chosen)
  When Proust's Answer is generated
  Then the player receives 2 personalized letter PDFs (or a single multi-page PDF)
  And each letter correctly pairs the player's specific answer with the right Proust response

Scenario: Delivery timing and notification
  Given the session's game night was 7 days ago
  When the scheduled generation runs
  Then letters are generated server-side
  And app players receive a push notification at 10 AM local time: "A letter from the past has arrived"
  And web players receive an email with the PDF attachment
  And delivery is accurate to within 1 hour of the scheduled time

Scenario: Letter visual quality
  Given a Proust's Answer letter is generated
  Then the PDF uses the personal-letter theme (cream paper, sepia ink, gold accent)
  And the template at artifacts/templates/confession-album/prousts-answer.njk is used
  And the letter feels personal, not automated
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-039 | Proust's Answer generated per-player per-question-answered | P2 |
| FR-040 | Classic Proust questions paired with proust_response_1886 or proust_response_1892 | P2 |
| FR-041 | Non-Proust questions use proust_adjacent mapping with contextual bridge text | P2 |
| FR-042 | prousts-answer.njk template used with personal-letter theme | P2 |
| FR-043 | Delivery scheduled at game_night_date + 7 days, configurable 3-14 days | P2 |
| FR-044 | Delivery at 10 AM local time, accurate within 1 hour | P2 |
| FR-045 | Push notification for app players, email for web players | P2 |

---

### US-006: Board Configuration Options (P3)

**As a** host,
**I want to** choose between digital, physical, and hybrid board formats and configure the layout,
**so that** the board presentation matches my venue and group.

**Acceptance Criteria**:

```gherkin
Scenario: Select digital board format
  Given the host is configuring the session
  When the host selects "Digital Board"
  Then layout options appear: grid, list, scattered
  And background options appear: warm neutral / dark / custom
  And font size options appear: auto (based on question count) / manual

Scenario: Select physical board format
  Given the host selects "Physical Board"
  Then the system generates a printable PDF of question cards
  And cards are formatted for standard paper (A4 / Letter) with cut guides
  And cards contain question text only (no metadata visible to players)
  And the host can download and print the PDF

Scenario: Digital board readable from distance
  Given the digital board is configured with auto font size
  And the session has 13 questions
  When the board is displayed on a tablet
  Then questions are readable from 6 feet away
  And font size scales based on question count and screen dimensions
```

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-046 | Three board format options: digital, physical, hybrid | P3 |
| FR-047 | Digital layout options: grid, list, scattered | P3 |
| FR-048 | Printable question card PDF for physical board | P3 |
| FR-049 | Cards formatted for A4/Letter with cut guides | P3 |
| FR-050 | Auto font sizing for digital board based on count + screen size | P3 |

---

## 3. Contribution Archetype Assignment

This feature is part of the pre-game flow (PRD §3.1.3) and bridges between the 002-pre-game-lifecycle spec and this module.

**Flow**: During session creation, the host configures how archetypes are assigned. Five archetypes from DESIGN.md §IV:

| Archetype | Instruction |
|-----------|------------|
| "Your idea of happiness" | Bring a drink that embodies it |
| "Your favorite food" | Bring it, or bring the story |
| "Your most treasured possession" | Bring the object to display |
| "Your favorite word" | Write it on a card |
| "The quality you most admire" | Bring a piece of music |

**Assignment modes**: auto-assign (system distributes evenly), manual (host assigns), player-choice (first-come). Each guest receives exactly one archetype. No archetype assigned to more than `ceil(guests / 5)` players.

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-051 | Three assignment modes: auto-assign, manual, player-choice | P0 |
| FR-052 | Five contribution archetypes with evocative guidance text | P0 |
| FR-053 | Even distribution: no archetype exceeds ceil(guests/archetypes) assignments | P0 |
| FR-054 | Archetype included in invitation content | P0 |
| FR-055 | Guest can submit a description of what they are bringing (for Contributions Table) | P0 |

---

## 4. Player Order Configuration

From PRD §3.1.4. The host establishes turn order for The Chain.

**Modes**: seating arrangement (clockwise entry), random, manual (drag to reorder).

**Rules**:
- Host is NOT in the turn order. Host answers the first question as a warm-up.
- Player order visible on Game Night Dashboard but not shown to players in advance.
- Host can reorder during game night before a player's turn begins.

**Requirements**:
| ID | Requirement | Priority |
|----|------------|----------|
| FR-056 | Three player order modes: seating, random, manual | P0 |
| FR-057 | Host excluded from turn order (answers first question as warm-up) | P0 |
| FR-058 | Player order configurable in < 2 minutes | P0 |
| FR-059 | Reordering possible during game night without disrupting flow | P0 |

---

## 5. Success Criteria Summary

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Question set curation time | < 10 minutes | User testing |
| Board Preview load time | < 1 second | Performance profiling |
| Question removal animation | 300ms | Animation timing |
| Host taps per chain turn | <= 2 | Interaction audit |
| Album generation time | < 30 seconds | Server-side timing |
| Album PDF file size | < 5 MB | File size check |
| Proust's Answer delivery accuracy | Within 1 hour of schedule | Delivery log audit |
| Chain state recovery after backgrounding | 100% data retention | Integration test |
| Offline game night operation | Full functionality without network | Airplane mode test |

---

## 6. Constitution Gate Check

Every feature in this spec must pass the 4 gates defined in the project constitution:

| Gate | Verdict | Rationale |
|------|---------|-----------|
| **Simplicity** | PASS | Chain tracking requires <= 2 taps per turn. No complex branching mechanics. Board is a single-screen display. |
| **Offline** | PASS | All game night features operate from local SQLite. Chain state persisted locally. No network calls during play. |
| **Privacy** | PASS | No social features. Answers visible only to session participants. Proust's Answer delivered privately per player. |
| **Analog** | PASS | The app scaffolds the board and tracks pairings. The game itself -- answering, choosing, listening -- happens in the room between people. Screen dark for players. |

---

## 7. Non-Functional Requirements

| ID | Requirement | Category |
|----|------------|----------|
| NFR-001 | Game night dashboard operates entirely from local data (no network requests) | Offline |
| NFR-002 | Chain state saved to local SQLite every 30 seconds | Reliability |
| NFR-003 | Dashboard resumes from last saved state after app restart | Reliability |
| NFR-004 | All question-answer pairings correctly attributed in artifacts | Correctness |
| NFR-005 | Artifact PDFs tagged for screen reader accessibility (PDF/UA) | Accessibility |
| NFR-006 | Written answer mode available as alternative to verbal responses | Accessibility |
| NFR-007 | Pass/skip mechanic allows any player to skip the inherited question | Accessibility |
| NFR-008 | Session data visible only to session participants | Privacy |
| NFR-009 | Board font scales as questions reduce, remaining readable at configured distance | Usability |
| NFR-010 | Reduce motion setting respected for board animations | Accessibility |

---

## 8. Open Questions

| # | Question | Context | Status |
|---|----------|---------|--------|
| 1 | Should the host be able to enter answer text during the chain, or is the chain purely a tracking mechanism? | If answers are entered, artifacts can include full text. If not, The Album shows question pairings without answer content. | Deferred to implementation |
| 2 | Multi-device board: can the host display the board on a tablet while controlling from a phone? | PRD Open Question #8. Significant complexity. | Deferred to V2 |
| 3 | Should The Return entries appear in The Album? | Currently optional tracking. If logged, they could be an appendix. | Deferred |
| 4 | How are answer texts captured for The Album? | Options: host types summary, player submits via own device, or answers recorded as audio and transcribed. Each has tradeoffs for the analog-warmth principle. | Critical decision for FR-023 |
