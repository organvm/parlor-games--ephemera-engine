# Quality Validation Checklist: 003-confession-album

**Spec**: [../spec.md](../spec.md)
**Last Updated**: 2026-02-23

---

## 1. Constitution Gate Audit

Every feature must pass all 4 gates. A single FAIL blocks release.

### Simplicity Gate

- [ ] No new Supabase Edge Functions created (reuses generate-artifact from 006)
- [ ] Total Edge Function count remains <= 3 across the entire app
- [ ] Question set CRUD uses standard Supabase REST (PostgREST), not custom endpoints
- [ ] Chain tracking requires <= 2 host taps per turn
- [ ] No feature added that is not traced to a PRD requirement
- [ ] No speculative features (YAGNI): The Return tracking is optional, not mandatory
- [ ] Pre-game curation completable in < 10 minutes
- [ ] Player order configurable in < 2 minutes

### Offline Gate

- [ ] Game Night Dashboard makes zero network requests when session is ACTIVE
- [ ] All game night data (questions, chain entries, bookmarks) stored in WatermelonDB/SQLite
- [ ] Pre-cache triggered on session ACTIVE transition includes: question_items, player_order, contributions, config
- [ ] Chain state survives app backgrounding (AppState listener saves to DB)
- [ ] Chain state survives app force-quit (periodic 30-second auto-save)
- [ ] Chain state survives device restart (WatermelonDB persists to disk)
- [ ] Post-game sync pushes all local changes to Supabase when connectivity resumes
- [ ] No data loss in any offline scenario (verified by Quickstart Scenario 3)
- [ ] Graceful degradation: if pre-game content library browsing happens offline, cached content is shown

### Privacy Gate

- [ ] Question-answer data visible only to session participants (RLS enforced)
- [ ] Proust's Answer delivered per-player (personalized_for field set)
- [ ] No cross-session data leakage: content from Session A never appears in Session B
- [ ] No social features: no sharing, no public profiles, no activity feed
- [ ] Contribution descriptions visible only to session participants
- [ ] Artifact download URLs are time-limited and session-scoped
- [ ] No analytics telemetry on answer content (only structural metrics: generation time, file size)

### Analog Gate

- [ ] During game night, only the host's device is required
- [ ] Players never need to interact with a screen during their turn (answers are verbal)
- [ ] The digital board is a display -- players point or speak; host taps
- [ ] Written answer mode exists as accessibility option, not default
- [ ] The Portrait reading is host-spoken, not screen-displayed to players
- [ ] Physical board option available (printable cards)

---

## 2. Functional Requirements Verification

### Pre-Game: Question Set Configuration (FR-001 to FR-010)

- [ ] **FR-001**: Selecting a base lineage loads all questions from that lineage into Board Preview
- [ ] **FR-002**: Host can deselect individual questions (tap to toggle)
- [ ] **FR-003**: Host can add questions from other lineages via browse or search
- [ ] **FR-004**: Host can reorder questions via drag-and-drop (long-press + drag)
- [ ] **FR-005**: System displays suggested target count: guest_count + 5
- [ ] **FR-006**: Warning when count < guest_count or > guest_count + 10
- [ ] **FR-007**: "Surprise me" generates a balanced set (mixed lineages, mixed registers)
- [ ] **FR-008**: Each question displays register, domain, lineage badge, and Proust indicator
- [ ] **FR-009**: Board Preview loads all questions with metadata in < 1 second
- [ ] **FR-010**: Full curation completable in < 10 minutes (user testing verified)

### Game Night: Chain Mechanic (FR-011 to FR-022)

- [ ] **FR-011**: Digital board displays all questions in configured layout (grid or list)
- [ ] **FR-012**: Host taps a question to select it as current player's choice
- [ ] **FR-013**: Question removal animation completes in ~300ms (fade + collapse)
- [ ] **FR-014**: Gaps remain visible after removal (board does not reflow/compact)
- [ ] **FR-015**: Font scales up as question count decreases below threshold (< 8 remaining)
- [ ] **FR-016**: Host can undo a removal within 10 seconds
- [ ] **FR-017**: Dashboard shows: current player, inheritance step text, choice step text
- [ ] **FR-018**: ChainEntry logged per turn with all required fields
- [ ] **FR-019**: Host can bookmark a pairing with one tap
- [ ] **FR-020**: Remaining question count visible at all times on board screen
- [ ] **FR-021**: Chain state persisted to local SQLite on every turn + every 30 seconds
- [ ] **FR-022**: Turn tracking requires <= 2 host taps (select + remove)

### Post-Game: The Album (FR-023 to FR-033)

- [ ] **FR-023**: Album PDF generated from ChainEntry data + session metadata
- [ ] **FR-024**: Album uses `artifacts/templates/confession-album/the-album.njk`
- [ ] **FR-025**: Cover page includes: session title, date, host, location, lineage badge
- [ ] **FR-026**: Each question gets one page with both answers attributed (chooser + inheritor)
- [ ] **FR-027**: Contributions Table included as a page within The Album
- [ ] **FR-028**: Colophon page with session metadata and engine attribution
- [ ] **FR-029**: Generation completes in < 30 seconds
- [ ] **FR-030**: PDF file size < 5 MB
- [ ] **FR-031**: PDF is print-ready at 300 DPI (verified with a test print)
- [ ] **FR-032**: App players receive push notification on generation complete
- [ ] **FR-033**: Web players receive email with PDF attachment

### The Return and The Portrait (FR-034 to FR-038)

- [ ] **FR-034**: The Return activation requires a single tap; available only when conditions met
- [ ] **FR-035**: ReturnEntry logging is optional (round works without tracking)
- [ ] **FR-036**: The Portrait displays all pairings with bookmarked pairs prioritized
- [ ] **FR-037**: Swipe navigation between pairs during The Portrait
- [ ] **FR-038**: Ambient mode active during The Portrait (large text, warm background)

### Proust's Answer (FR-039 to FR-045)

- [ ] **FR-039**: One letter generated per player per question answered
- [ ] **FR-040**: Classic Proust questions paired with correct proust_response (1886 or 1892)
- [ ] **FR-041**: Non-Proust questions use proust_adjacent mapping with bridge text
- [ ] **FR-042**: Template: `artifacts/templates/confession-album/prousts-answer.njk` with personal-letter theme
- [ ] **FR-043**: Delivery scheduled at game_night_date + 7 days (configurable 3-14)
- [ ] **FR-044**: Delivery at 10 AM local time, accurate within 1 hour
- [ ] **FR-045**: Push notification for app players, email for web players

### Board Configuration (FR-046 to FR-050)

- [ ] **FR-046**: Three board format options: digital, physical, hybrid
- [ ] **FR-047**: Digital layout options: grid and list (scattered deferred to P3)
- [ ] **FR-048**: Printable question card PDF generated for physical board
- [ ] **FR-049**: Cards formatted for A4/Letter paper with cut guides
- [ ] **FR-050**: Auto font sizing adjusts based on question count and screen dimensions

### Contribution Archetypes (FR-051 to FR-055)

- [ ] **FR-051**: Three assignment modes: auto-assign, manual, player-choice
- [ ] **FR-052**: Five archetypes with evocative guidance text (from DESIGN.md §IV)
- [ ] **FR-053**: Auto-assign: no archetype exceeds ceil(guests/5) assignments
- [ ] **FR-054**: Archetype included in invitation content sent to guest
- [ ] **FR-055**: Guest can submit description of what they are bringing

### Player Order (FR-056 to FR-059)

- [ ] **FR-056**: Three modes: seating, random, manual
- [ ] **FR-057**: Host excluded from turn order (answers first question as warm-up)
- [ ] **FR-058**: Player order configurable in < 2 minutes
- [ ] **FR-059**: Reordering during game night possible without disrupting flow

---

## 3. Non-Functional Requirements

- [ ] **NFR-001**: Game night dashboard: zero network requests during ACTIVE state
- [ ] **NFR-002**: Chain state auto-saved every 30 seconds
- [ ] **NFR-003**: Dashboard resumes from saved state after app restart
- [ ] **NFR-004**: All question-answer pairings correctly attributed in artifacts
- [ ] **NFR-005**: Generated PDFs tagged for screen reader accessibility (PDF/UA)
- [ ] **NFR-006**: Written answer mode available as accessibility alternative
- [ ] **NFR-007**: Pass/skip mechanic: any player can skip inherited question
- [ ] **NFR-008**: Session data visible only to participants (RLS verified)
- [ ] **NFR-009**: Board font scales, readable from configured distance
- [ ] **NFR-010**: Reduce motion setting eliminates removal animations

---

## 4. Performance Targets

- [ ] Board Preview load: < 1 second with 75 questions
- [ ] Question removal animation: ~300ms
- [ ] Screen navigation: < 300ms for all Confession Album screens
- [ ] Content library search: < 500ms for 200+ questions
- [ ] Album PDF generation: < 30 seconds for 40-question session
- [ ] Album PDF file size: < 5 MB
- [ ] App cold start to Board Preview: < 3 seconds
- [ ] Chain state WatermelonDB write: < 50ms per entry

---

## 5. Accessibility

- [ ] All screens pass VoiceOver (iOS) testing
- [ ] All screens pass TalkBack (Android) testing
- [ ] All interactive elements have meaningful accessibility labels
- [ ] Board question cards announce: question number, text, register, status
- [ ] Chain tracker announces: current player name, step (inherit/choose), question text
- [ ] The Portrait announces: question text, chooser name + answer, inheritor name + answer
- [ ] Reduce motion: all animations disabled when system preference is set
- [ ] Pass/skip: available for inherited questions, no stigma in UI
- [ ] Written answer mode: text input field available during player's turn
- [ ] Color contrast: all text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Touch targets: minimum 44x44pt for all buttons

---

## 6. Data Integrity

- [ ] ChainEntry.turn_number is sequential with no gaps (verified by chainValidator)
- [ ] Every chosen_question_id in ChainEntry references a valid QuestionItem
- [ ] Every inherited_question_id matches the previous turn's chosen_question_id
- [ ] Turn 1 has inherited_question_id = null
- [ ] No question appears in more than one ChainEntry.chosen_question_id
- [ ] Question count matches: initial set size = ChainEntries count + host warm-up + remaining on board
- [ ] All questions with status='removed' have a corresponding ChainEntry
- [ ] ContributionItem.archetype distribution satisfies ceil(N/5) constraint
- [ ] Artifact personalized_for references valid session participant

---

## 7. Cross-Spec Integration

- [ ] Session state machine from 001: Draft -> Inviting -> Preparing -> Active -> Complete -> Archived
- [ ] Invitation flow from 002: archetype assignment included in invitation content
- [ ] Contribution pipeline from 002: ContributionItem submissions tracked and displayed
- [ ] Game Night Dashboard shell from 005: Confession Album screens plug into dashboard
- [ ] Artifact generation pipeline from 006: generate-artifact Edge Function called with correct payload
- [ ] Notification catalog: N11 (artifact ready), N12 (Proust's Answer) triggered at correct times
- [ ] Content library from 002: question browsing during curation uses shared content store

---

## 8. Template and Design System

- [ ] the-album.njk renders correctly with chain data (chooser + inheritor per question)
- [ ] prousts-answer.njk renders with direct Proust pairing and with adjacent pairing
- [ ] contributions-table.njk shows archetype, label, and guest description
- [ ] Fonts load correctly: Playfair Display, Lora, JetBrains Mono
- [ ] Color palette correct: warm cream, deep green, gold (confession-album theme)
- [ ] Personal letter theme correct: cream, sepia, gold (prousts-answer)
- [ ] Textures render: parchment, fiber, aged (from design-system/textures.css)
- [ ] Ornaments render: fleuron, dots (from _macros.njk)
- [ ] PDF page size correct: A5 portrait (148 x 210mm)
- [ ] Bookmarked pairs visually distinguished in The Album (gold accent)
