# 004 — Murder Mystery Game Module

Feature specification for the Murder Mystery game: setting seed selection/generation (Claude API), character sheet generation and delivery, contribution briefs, three-act game night dashboard, clue distribution, accusation submission, awards voting, and four post-game artifacts (The Dossier, Menu of the Damned, Society Page, The Sealed Envelope).

**Spec ID**: 004-murder-mystery
**Priority**: P0 (Launch Requirement)
**Status**: Draft
**Depends On**: 001-auth-and-sessions, 002-pre-game-lifecycle, 005-game-night-engine, 006-artifact-pipeline
**Depended On By**: None (leaf game module)

**PRD Sections**: §3.2 (all subsections 3.2.1–3.2.9), §5.5 (artifacts A04–A07), §5.2 (MurderMysteryData entity)

---

## 1. User Stories

### US-001: Host Selects or Generates a Setting Seed (P1)

**As** a host creating a Murder Mystery session,
**I want** to select a curated scenario or generate one from four combinatorial axes via the Claude API,
**so that** every murder mystery I host is unique and tailored to the evening I envision.

**Why this priority**: The setting seed is the foundation of the entire Murder Mystery experience. Without a scenario, no characters, clues, or crime structure can exist. This is the prerequisite for all downstream features.

**Independent Test**: Can be tested by creating a session, selecting axes, triggering generation, and verifying the returned scenario is internally consistent with characters, crime, and timeline.

#### Acceptance Scenarios

**Scenario 1a: Browse curated seeds**
```
Given I am creating a Murder Mystery session
When I select "Browse Curated Seeds"
Then I see a list of 5+ pre-authored scenarios with era, location, milieu, and tension previews
And I can tap any seed to view its full setting description, character roster, and crime structure
And I can confirm my selection in <2 minutes
```

**Scenario 1b: Generate seed from four axes**
```
Given I am creating a Murder Mystery session
When I select "Generate Seed"
And I choose or accept values for Era, Location, Social Milieu, and Central Tension
And I tap "Generate"
Then the system sends my selections to the Claude API (server-side)
And within 15 seconds I receive a complete scenario containing:
  - Setting description (2–3 paragraphs)
  - Character roster (guest count + host consideration)
  - Relationship web
  - Crime structure (victim, murderer, weapon, motive)
  - 2–3 red herrings baked into character secrets
  - Timeline of 4–6 key dramatic beats
And the generated scenario has no internal logical contradictions
```

**Scenario 1c: Randomize all axes**
```
Given I am creating a Murder Mystery session
When I select "Full Random"
Then the system randomly selects all four axes and generates a complete scenario
And I see the generated result within 15 seconds
And I can regenerate if I do not like the result
```

**Scenario 1d: Regenerate or edit**
```
Given I have received a generated scenario
When I tap "Regenerate" or edit individual elements (a character name, a motive, a timeline beat)
Then I can regenerate the entire scenario or modify specific fields
And my edits are preserved if I regenerate only selected elements
And I can regenerate unlimited times during configuration
```

**Scenario 1e: Confirm seed and proceed**
```
Given I have reviewed and accepted a setting seed (curated or generated)
When I tap "Confirm Seed"
Then the seed is saved to the session
And character generation and assignment screens become available
And I can return to edit the seed later (until session enters ACTIVE state)
```

---

### US-002: Character Sheet Delivery and Contribution Briefs (P1)

**As** a guest who RSVPed to a Murder Mystery session,
**I want** to receive a personalized character packet with my character sheet, contribution brief, and preparation prompts,
**so that** I can become my character weeks before game night and prepare my food, dress, and prop contributions.

**Why this priority**: Character delivery is the moment the game becomes real for players. Without it, there is no Murder Mystery. The contribution briefs drive the physical preparation that makes game night immersive.

**Independent Test**: Can be tested by assigning a character to a guest and verifying they receive a complete packet with all required elements, and that their preparation prompt answers are tracked on the host dashboard.

#### Acceptance Scenarios

**Scenario 2a: Receive character packet**
```
Given I am a confirmed guest with a character assigned by the host
When the host delivers character packets
Then I receive a push notification: "Your character has arrived"
And I see a themed "sealed envelope" UI that I tap to open
And the content reveals progressively: character sheet first, then contribution brief, then preparation prompts
```

**Scenario 2b: Character sheet content**
```
Given I have opened my character packet
When I view my character sheet
Then I see:
  - Full name, occupation, and public reputation
  - Personality sketch (2–3 sentences)
  - One secret relevant to the crime
  - One relationship to another character (by role, not player name)
And the character sheet is accessible offline after initial load
```

**Scenario 2c: Contribution brief content**
```
Given I have opened my character packet
When I view my contribution brief
Then I see narratively motivated suggestions for:
  - Food/drink: tied to character identity with a direction, not a recipe
  - Dress code: color palette, silhouette suggestion, one signature accessory
  - Prop: one object the character would carry with narrative significance
And the tone is evocative and interpretive, not prescriptive
```

**Scenario 2d: Preparation prompts**
```
Given I have viewed my contribution brief
When I navigate to preparation prompts
Then I see 2–3 private questions to answer before game night:
  - e.g., "What is your character's alibi?"
  - e.g., "What do you owe the victim?"
  - e.g., "What would you kill to protect?"
And I can write and submit my answers as contributions
And the host can see my submission status on their dashboard
```

**Scenario 2e: Revisit packet**
```
Given I have opened my character packet
When I navigate back to it at any time before or during game night
Then I can view all character information without re-downloading
And my submitted preparation answers are shown alongside the prompts
```

**Scenario 2f: Web player character delivery**
```
Given I am a web player with an assigned character
When the host delivers character packets
Then I receive an email with a link to my web character packet page
And the web page displays identical content to the app version
And I can submit preparation prompts via the web form
```

---

### US-003: Three-Act Game Night Dashboard (P1)

**As** a host running a Murder Mystery game night,
**I want** a three-act dashboard that guides me through Arrival, Crime, and Reveal with phase-specific tools,
**so that** I can orchestrate the evening's dramatic arc while remaining a player myself.

**Why this priority**: The dashboard is the host's essential tool during game night. Without it, the host cannot manage acts, distribute clues, or trigger the reveal. It must work offline.

**Independent Test**: Can be tested by launching a game night in ACTIVE state with pre-loaded session data and walking through all three acts without network connectivity.

#### Acceptance Scenarios

**Scenario 3a: Launch game night dashboard**
```
Given my Murder Mystery session is in PREPARING state
When I tap "Start Game Night" and confirm
Then the session transitions to ACTIVE state
And the Three-Act Dashboard launches in ambient mode (dark background, warm accents, large touch targets)
And the screen wake lock is activated
And all session data is available offline
```

**Scenario 3b: Act I — Arrival & Establishment**
```
Given the dashboard is showing Act I
When I am guiding guests through arrivals
Then I see:
  - Character introduction checklist (tap to mark introduced)
  - Player roster with character names
  - "Begin Act II" button with confirmation
And suggested duration is shown (45 min) but no timer is forced
```

**Scenario 3c: Act II — The Crime**
```
Given I have advanced to Act II
When I tap "Reveal the Crime"
Then the crime trigger moment is displayed
And I see:
  - Clue distribution tracker (checklist of physical clues, checked off as distributed)
  - Character knowledge reminders (what each character privately knows)
  - Optional interrogation round timer (5–7 min per round, off by default)
  - "New Evidence" button to trigger mid-investigation reveals
And I can distribute clues in any order at my discretion
```

**Scenario 3d: Act III — Accusation & Reveal**
```
Given I have advanced to Act III
When I tap "Begin Accusations"
Then app players can optionally open an accusation form on their phones
And I see the submission count (X/Y submitted) without seeing content
When I tap "The Reveal"
Then the full solution is displayed for me to narrate:
  - True murderer, weapon, motive
  - Complete timeline of what actually happened
  - Red herring explanations
  - Who was closest to the truth
And I can optionally trigger awards voting
```

**Scenario 3e: Emergency reference**
```
Given the dashboard is active in any act
When I tap the "Reference" icon
Then a full-screen overlay appears with:
  - Player roster (names, characters, secrets)
  - Full solution details
  - All clue data
  - Contribution summary
And the overlay is read-only and dismissible
And all data is served from local storage (no network required)
```

**Scenario 3f: Phase transition logging**
```
Given I advance between acts
When each transition occurs
Then the timestamp is logged locally
And timestamps are included in The Dossier artifact data
```

---

### US-004: Accusation Submission and Voting (P2)

**As** a player at a Murder Mystery game night,
**I want** to submit my accusation digitally and vote on awards,
**so that** my theory is recorded for the case file artifact and the evening has a ceremonial close.

**Why this priority**: Digital accusation is optional (paper works) but enables richer artifact data. Awards voting is the celebratory coda. Both enhance the post-game Dossier but are not required for the core game.

**Independent Test**: Can be tested by activating accusation phase, submitting an accusation on a player device, and verifying it appears sealed on the host dashboard and in the Dossier data.

#### Acceptance Scenarios

**Scenario 4a: Submit accusation**
```
Given the host has activated the accusation phase
When I open the app and see the accusation form
Then I can select who committed the crime (from character list)
And I can enter how (free text, 1–2 sentences)
And I can enter why (free text, 1–2 sentences)
And my submission is sealed — not visible to others until the host triggers the reveal
And the form works offline and syncs when connectivity resumes
And submission takes <2 minutes
```

**Scenario 4b: Accusation is optional**
```
Given the host has activated the accusation phase
When a player chooses to write their accusation on paper instead
Then the game proceeds normally without requiring digital submission from all players
And the host dashboard shows "X of Y submitted digitally" without blocking
```

**Scenario 4c: Awards voting**
```
Given the host has triggered awards voting after the reveal
When players see the voting screen on their phones
Then they can vote for categories:
  - Best Performance
  - Most Convincing Liar
  - Best Cocktail
  - Best Dressed
  - Closest to the Truth
And each player casts one vote per category (cannot vote for themselves)
And results are tallied and displayed on the host dashboard
And voting works offline
```

---

### US-005: The Dossier — Post-Game Artifact (P1)

**As** a participant in a completed Murder Mystery,
**I want** to receive The Dossier — a beautifully designed case file summarizing the true events, accusations, and solution,
**so that** the evening is preserved as a tangible artifact in the voice of the game's era.

**Why this priority**: The Dossier is the primary Murder Mystery artifact and the product's most distinctive feature. It transforms ephemeral social experience into a lasting keepsake.

**Independent Test**: Can be tested by triggering generation with a complete session dataset and verifying the resulting PDF contains all required sections with correct data, era-appropriate voice, and noir visual design.

#### Acceptance Scenarios

**Scenario 5a: Generate Dossier**
```
Given the session is in COMPLETE state
When the host taps "Generate Artifacts"
Then The Dossier PDF is generated server-side in <30 seconds
And the PDF is A5 portrait, 4–8 pages, with noir aesthetic
And typography uses JetBrains Mono (headers/labels) and Lora (narrative body)
```

**Scenario 5b: Dossier content**
```
Given The Dossier has been generated
When I view the PDF
Then I see:
  - Cover: "CASE FILE — [Crime] at [Location], [Date in fiction]"
  - Cast of Characters (player name → character name → one-line fate)
  - Crime Scene Summary (setting description, scene details)
  - Evidence Log (all clues with exhibit labels and discovery attribution)
  - Accusations (who accused whom, with reasoning)
  - The Reveal (culprit, full explanation, vote tally)
  - Appendix: Clue Cards
And the narrative voice matches the era/setting of the game
```

**Scenario 5c: Distribution**
```
Given The Dossier is ready
When the host distributes artifacts
Then app players receive a push notification with in-app download
And web players receive an email with PDF attachment
And the PDF is <5MB and viewable offline after download
```

---

### US-006: Menu of the Damned — Post-Game Artifact (P2)

**As** a participant in a completed Murder Mystery,
**I want** to receive the Menu of the Damned — a recipe card collection of all food and drink contributions,
**so that** I can recreate the evening's flavors and remember who brought what.

**Why this priority**: The Menu is the second immediate artifact. It preserves the collaborative culinary contribution that is central to the Murder Mystery's physical preparation.

**Independent Test**: Can be tested by providing recipe fixture data and verifying the PDF renders all recipes with character attribution, ingredients, and steps in the recipe card layout.

#### Acceptance Scenarios

**Scenario 6a: Auto-generate with Dossier**
```
Given the host triggers artifact generation
Then the Menu of the Damned is generated automatically alongside The Dossier
And the PDF uses a recipe card layout (5x7 portrait per card)
And the template style is period-appropriate with the murder-mystery noir theme
```

**Scenario 6b: Menu content**
```
Given the Menu has been generated
When I view the PDF
Then each recipe card shows:
  - Recipe type (First Course, Cocktail, Dessert, etc.)
  - Recipe name
  - Contributor (character name and player name)
  - Ingredients list
  - Step-by-step instructions
  - Footer: "Served at [Session Title] · [Date]"
And all submitted food/drink contributions are included
```

---

### US-007: The Sealed Envelope — Delayed Artifact (P2)

**As** a participant in a completed Murder Mystery,
**I want** to receive a personalized character epilogue one week later, written by the host,
**so that** my character's story has a narrative close and the game has a final, surprising beat.

**Why this priority**: The Sealed Envelope is the delayed-delivery emotional coda. It requires host writing, which means it depends on a writing prompt system and scheduled delivery.

**Independent Test**: Can be tested by providing epilogue text for each character and verifying personalized PDFs are generated and scheduled for delivery at the correct time.

#### Acceptance Scenarios

**Scenario 7a: Host receives writing prompts**
```
Given the session is in COMPLETE state
When 2 days have passed since game night
Then the host receives a notification: "Time to write your players' epilogues"
And the host opens an epilogue writing screen showing:
  - Each character with a narrative writing prompt
  - Example: "The spice merchant returned to Marseille. What did he find?"
  - A text field for 2–4 sentences per character
```

**Scenario 7b: Host writes epilogues**
```
Given the host is on the epilogue writing screen
When the host writes 2–4 sentences per character
And taps "Save Epilogues"
Then the epilogues are saved as delayed artifacts
And the total writing time should be <20 minutes for all characters
```

**Scenario 7c: Delayed delivery**
```
Given epilogues have been saved
When the scheduled delivery date arrives (default: 7 days post-game, configurable 3–14 days)
Then each player receives only their own character's epilogue
And the PDF is a single-page personal letter in era-appropriate voice
And delivery occurs at 10 AM local time via push notification + email
```

**Scenario 7d: Host hasn't written by delivery date**
```
Given the delivery date has arrived and the host has not written epilogues
Then the host receives a reminder notification
And delivery is postponed until the host completes writing
And players are not notified of the delay
```

---

### US-008: Society Page Photo — Post-Game Artifact (P3)

**As** a participant in a completed Murder Mystery,
**I want** to take or overlay a group photo formatted as a society page clipping from the game's era,
**so that** we have a visual keepsake of the evening in character.

**Why this priority**: P1 in the PRD (deprioritized to P3 here because it requires camera integration and era-specific overlay assets, and the core game experience does not depend on it).

**Independent Test**: Can be tested by opening the camera overlay feature, taking a photo, and verifying the composited result includes period frame, character captions, and fictional date.

#### Acceptance Scenarios

**Scenario 8a: Open camera with period overlay**
```
Given the session is in COMPLETE state or later
When I open the Society Page feature from the post-game screen
Then the camera launches with a period-appropriate overlay:
  - Era-matched frame and filter
  - Caption area for character names
  - Fictional date and location
And the overlay renders at 60fps
```

**Scenario 8b: Save composited photo**
```
Given I have taken a photo with the overlay
When the app composites the image
Then the result is high-resolution (suitable for printing)
And it is saved to my artifact library and the device camera roll
And character names, fictional date, and location are embedded as captions
```

---

## 2. Functional Requirements

### Setting Seed Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-101 | System shall provide a curated seed browser with 5+ pre-authored Murder Mystery scenarios bundled in V1 | P0 |
| FR-102 | System shall support LLM-based scenario generation via Claude API (server-side only) from four axes: Era, Location, Social Milieu, Central Tension | P0 |
| FR-103 | Generated scenarios shall include: setting description, character roster, relationship web, crime structure (victim, murderer, weapon, motive), 2–3 red herrings, and 4–6 timeline beats | P0 |
| FR-104 | LLM generation shall complete in <15 seconds | P0 |
| FR-105 | Host shall be able to regenerate scenarios unlimited times during configuration | P0 |
| FR-106 | Host shall be able to manually edit any field of a generated or curated scenario | P0 |
| FR-107 | System shall support "Full Random" generation where all axes are selected randomly | P0 |
| FR-108 | Generated content shall not repeat across sessions (sufficient randomness in prompts) | P0 |
| FR-109 | Setting seed source shall be recorded: "curated", "generated", or "random" | P0 |

### Character Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-110 | Character packets shall contain: character sheet (name, occupation, personality, secret, relationship), contribution brief (food, dress, prop), and 2–3 preparation prompts | P0 |
| FR-111 | Character assignment shall support auto-assign, manual drag-and-drop, and preference-based modes | P0 |
| FR-112 | Character packets shall be delivered via themed "sealed envelope" UI with progressive reveal | P0 |
| FR-113 | All character information shall be accessible offline after initial load | P0 |
| FR-114 | Preparation prompt answers shall be tracked as contributions on the host dashboard | P0 |
| FR-115 | The murderer's packet shall be configurable: full knowledge or partial knowledge (host decides) | P0 |
| FR-116 | Web players shall receive character packets via email link to a web page with identical content | P0 |

### Game Night Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-117 | Dashboard shall display three acts: Act I (Arrival & Establishment), Act II (The Crime), Act III (Accusation & Reveal) | P0 |
| FR-118 | Dashboard shall launch in ambient mode: dark background, warm accent colors, large touch targets (>=48dp), screen wake lock | P0 |
| FR-119 | Act I shall include: character introduction checklist, player roster, "Begin Act II" button | P0 |
| FR-120 | Act II shall include: crime trigger button, clue distribution tracker, character knowledge reminders, optional interrogation timer, "New Evidence" button | P0 |
| FR-121 | Act III shall include: accusation activation, submission count display, "The Reveal" button with full solution, optional awards voting | P0 |
| FR-122 | All phase transitions shall require confirmation to prevent accidental advances | P0 |
| FR-123 | Phase transitions shall be logged with timestamps for artifact data | P0 |
| FR-124 | Dashboard shall operate entirely from local data (no network required) | P0 |
| FR-125 | Host shall be able to skip checklists and run informally if preferred | P0 |
| FR-126 | Emergency Reference overlay shall provide full session data (roster, secrets, solution, clues, contributions) in read-only mode | P0 |

### Accusation & Voting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-127 | App players shall be able to submit digital accusations: who (character select), how (free text), why (free text) | P0 |
| FR-128 | Accusations shall be sealed until the host triggers the reveal | P0 |
| FR-129 | Accusation submission shall be optional — the game proceeds without requiring all players to submit digitally | P0 |
| FR-130 | Accusation form shall work offline and sync when connectivity resumes | P0 |
| FR-131 | Awards voting shall support 5 categories: Best Performance, Most Convincing Liar, Best Cocktail, Best Dressed, Closest to the Truth | P0 |
| FR-132 | Players shall not be able to vote for themselves in any award category | P0 |
| FR-133 | Awards results shall be tallied and displayed on the host dashboard | P0 |

### Artifacts

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-134 | The Dossier (A04) shall be generated as PDF (A5 portrait, 4–8 pages, noir theme) containing: cover, cast, crime scene, evidence log, accusations, reveal, appendix | P0 |
| FR-135 | The Dossier voice shall match the era/setting of the session | P0 |
| FR-136 | Menu of the Damned (A05) shall be auto-generated alongside The Dossier as a landscape PDF with recipe card layout | P0 |
| FR-137 | Menu shall include all submitted food/drink contributions with character attribution, ingredients, and steps | P0 |
| FR-138 | Society Page Photo (A06) shall provide a camera overlay with era-specific frame, character name captions, and fictional date | P1 |
| FR-139 | The Sealed Envelope (A07) shall deliver personalized character epilogues, one per player, as single-page PDF letters | P0 |
| FR-140 | Sealed Envelope delivery shall be scheduled 7 days after game night (configurable 3–14 days) at 10 AM local time | P0 |
| FR-141 | Host shall receive epilogue writing prompts 2 days after game night | P0 |
| FR-142 | Artifact generation shall complete in <30 seconds per artifact | P0 |
| FR-143 | All artifact PDFs shall be <5MB, 300 DPI, with correct web fonts | P0 |
| FR-144 | Artifacts shall be distributed via push notification (app players) and email with PDF attachment (web players) | P0 |

---

## 3. Key Entities

These entities define the data boundary for this spec. Full schema in `data-model.md`.

### MurderMysteryData (game-specific, stored in Session.config)

**setting_seed**
- `source` (enum) — "curated" | "generated" | "random"
- `era` (text) — e.g., "Prohibition-Era New York, 1928"
- `location` (text) — e.g., "The Gilded Vine speakeasy"
- `milieu` (text) — e.g., "Bootleggers and speakeasy society"
- `tension` (text) — e.g., "A poisoning at a private dinner"
- `setting_description` (text) — narrative description (2–3 paragraphs)
- `crime_scene` (text) — physical scene description
- `generated_by` (enum) — "human" | "llm" | "hybrid"

**characters[]**
- `id` (string) — unique character identifier
- `name` (text) — character full name
- `occupation` (text) — character occupation
- `personality` (text) — 2–3 sentence personality sketch
- `secret` (text) — one secret relevant to the crime
- `relationship` (object) — `{ target_character_id, description }`
- `is_murderer` (boolean)
- `is_victim` (boolean)
- `contribution_brief` (object) — `{ food, dress, prop }`
- `preparation_prompts` (text[]) — 2–3 questions
- `assigned_to` (PlayerId | null) — FK to SessionParticipation

**crime**
- `victim_id` (string) — FK to character
- `murderer_id` (string) — FK to character
- `weapon` (text)
- `motive` (text)
- `red_herrings` (RedHerring[]) — each: `{ character_id, description }`
- `timeline` (TimelineEvent[]) — each: `{ order, description, act }`

**game_night**
- `act_timestamps` (object[]) — `{ act: number, started_at: timestamp }`
- `clues_distributed` (string[]) — IDs of clues marked as distributed
- `evidence_reveals` (object[]) — `{ timestamp, description }`
- `accusations` (Accusation[]) — `{ player_id, accused_character_id, method, motive }`

**clues[]**
- `id` (string) — exhibit identifier (A, B, C...)
- `title` (text) — clue title
- `type` (enum) — PHYSICAL | DOCUMENT | FINANCIAL | PERSONAL
- `description` (text)
- `found_by` (text) — character name who discovers it

**awards[]**
- `category` (text) — award name
- `winner_id` (PlayerId)
- `votes` (number)

**sealed_envelopes[]**
- `character_id` (string)
- `player_id` (PlayerId)
- `text` (text) — host-written epilogue
- `delivered` (boolean)

---

## 4. Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Curated seed selection time | <2 minutes | Timer from browsing seeds to confirmation |
| LLM seed generation latency | <15 seconds | Server-side timer from API call to response |
| Generated scenario consistency | 0 logical contradictions per session | Manual QA + automated validation rules |
| Character packet delivery confirmation | 100% of assigned characters delivered | Host dashboard shows per-guest delivery status |
| Dashboard load time | <1 second | Timer from "Start Game Night" to rendered dashboard |
| Offline game night | 100% of dashboard features work without network | Test in airplane mode after ACTIVE transition |
| Accusation form completion | <2 minutes | Timer from form open to submission |
| Dossier generation time | <30 seconds | Server-side timer from request to PDF ready |
| Dossier PDF quality | 300 DPI, correct fonts, <5MB | Automated rendering verification |
| Menu artifact includes all contributions | 100% of submitted recipes present | Comparison of submission count to artifact content |
| Sealed Envelope delivery accuracy | 100% personalized, correct recipient | Automated check: player receives only their character's epilogue |
| Sealed Envelope delivery timing | Within 1 hour of scheduled time | Delivery log timestamp vs. scheduled timestamp |

---

## 5. Edge Cases

### 5.1 Setting Seed Generation Failures
- If Claude API is unavailable during generation: show error with "Retry" button and option to browse curated seeds instead
- If generated scenario contains contradictions (e.g., dead character assigned as murderer): run server-side validation and auto-regenerate, up to 3 retries
- If host has no internet during session creation: curated seeds (bundled locally) remain available; LLM generation is disabled with clear messaging

### 5.2 Player Count Changes After Seed Generation
- If a player drops out after characters are assigned: host can reassign or mark character as NPC (host plays the character minimally)
- If a player is added after character generation: host can add a character manually or regenerate the roster (with warning about losing edits)
- Character count must match confirmed guest count ±1 (victim may or may not be a player character)

### 5.3 Missing Contributions
- If a player doesn't submit preparation prompts by deadline: their character still functions; prep answers are marked as "not submitted" in artifact data
- If no food/drink contributions are submitted: Menu of the Damned artifact is skipped (not generated with empty data)
- If fewer than 2 recipes are submitted: host is prompted to add their own recipes to meet minimum for a meaningful artifact

### 5.4 Game Night Interruptions
- If the app crashes during ACTIVE state: dashboard restores from local state on relaunch; no data loss
- If the host device dies: another device cannot take over as host in V1 (host should charge their phone); session data is preserved locally and syncs on recovery
- If game night exceeds 24 hours without ending: host receives a reminder; no auto-transition

### 5.5 Accusation Edge Cases
- If only 1 player submits digitally: the Dossier still includes that accusation alongside "Paper submissions not recorded digitally"
- If no players submit digitally: the Accusations section of the Dossier shows "Accusations were submitted on paper" with no player data
- If a player accuses a character that doesn't exist: form validation prevents submission (character select from fixed list)

### 5.6 Sealed Envelope Edge Cases
- If host never writes epilogues: delivery is indefinitely postponed; host receives weekly reminders for 4 weeks, then a final "last chance" notification
- If session is archived before epilogues are written: host can still write and send epilogues from archived session view
- If a player deleted their account before envelope delivery: the epilogue is still generated but delivery fails silently; host is not notified (minimal data retention)

### 5.7 Clue Distribution
- Host may distribute clues in any order (the tracker is a guide, not enforced)
- If host skips a clue: the Dossier still includes all clues in the Evidence Log regardless of distribution status
- If host adds ad-hoc evidence mid-game (via "New Evidence" button): these are logged and included in the Dossier
