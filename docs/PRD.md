# Ephemera Engine — Product Requirements Document

A comprehensive specification translating the Parlor Games: Ephemera Engine design into app features, screens, and user flows. This document serves as the bridge between the game design (DESIGN.md), strategic research (STRATEGY.md, RESEARCH.md), and technical implementation.

**Version**: 1.0
**Status**: Draft
**Last Updated**: 2026-02-23

**Source Documents**:
- `DESIGN.md` — Game mechanics, phases, artifacts (§I–VI)
- `STRATEGY.md` — Market, architecture, monetization (Pillars 1–8)
- `RESEARCH.md` — Academic foundations (Domains 1–7)

---

## Table of Contents

- [Part 0 — Product Overview](#part-0--product-overview)
- [Part 1 — User Personas & Journeys](#part-1--user-personas--journeys)
- [Part 2 — Shared Platform Features](#part-2--shared-platform-features)
- [Part 3 — Game Modules](#part-3--game-modules)
- [Part 4 — Cross-Cutting Concerns](#part-4--cross-cutting-concerns)
- [Part 5 — Technical Handoff & Appendices](#part-5--technical-handoff--appendices)

---

# Part 0 — Product Overview

## 0.1 Product Vision

The Ephemera Engine is a mobile application that transforms ordinary dinner parties into unrepeatable social rituals. It scaffolds four parlor games — each built on a three-phase arc of preparation, live play, and artifact generation — producing beautiful physical and digital keepsakes from evenings that can never be reconstructed. The app is the ritual guide: it prepares, coordinates, and preserves, but during the evening itself, the screen goes dark. The game lives in the room, between people.

**Positioning statement**: For hosts who believe gatherings should be meaningful, the Ephemera Engine is a mobile app that turns dinner parties into designed social rituals with lasting artifacts — unlike Jackbox (entertainment only, no lifecycle), We're Not Really Strangers (cards only, no hosting tools), or commercial murder mystery kits (static, no generation), Ephemera Engine combines procedural generation, curated content, and player-driven contributions across a multi-day arc that no other product addresses.

## 0.2 Scope & Boundaries

### V1 Includes

| Category | Included |
|----------|----------|
| **Games** | The Confession Album (P0), Murder Mystery (P0) |
| **Platform** | iOS + Android (React Native + Expo) |
| **Player Access** | Native app for hosts + app players; web join (mobile browser) for web players |
| **Phases** | Full three-phase lifecycle: pre-game, game night, post-game |
| **Artifacts** | Server-side HTML→PDF generation, in-app download, push notification delivery |
| **Content** | Base content library bundled with app (curated seeds, question lineages) |
| **Auth** | Email/password, Apple Sign-In, Google Sign-In; guest mode for web players |
| **Monetization** | Premium app ($9.99); content packs deferred to V1.1 |
| **LLM Integration** | Curated content only at V1 launch; Claude API generation deferred to V1.1 |

### V1.1 (Post-Launch Enhancement)

| Category | Feature | Rationale |
|----------|---------|-----------|
| **LLM Generation** | Claude API for Murder Mystery Setting Seed generation | Validate game mechanics with curated seeds first; add generation after confirming quality bar |
| **Content Packs** | Purchasable content packs ($2.99–$6.99) via IAP | Requires iOS StoreKit 2 + Android BillingClient integration; multi-week effort |
| **Content Store** | In-app browsing, preview, and purchase of content packs | Depends on IAP infrastructure |

### V1 Excludes

| Category | Excluded | Rationale |
|----------|----------|-----------|
| **Games** | Whose Memory? (P1), The Exquisite Corpse (P1) | Ship with two games; expand post-launch |
| **Facilitator Edition** | B2B licensing, custom branding, analytics | V2 scope; requires privacy impact assessment (STRATEGY.md §Deep Dive B) |
| **Print-on-Demand** | Physical artifact shipping via Lulu/Peecho/Blurb API | Stretch goal; validate digital artifacts first |
| **Social Features** | Public profiles, social feed, sharing to Instagram | By design: "No social feed, no public profiles" (STRATEGY.md §8.3) |
| **Subscription Model** | Season pass / annual subscription | Content pack model matches usage patterns (STRATEGY.md §Pillar 7) |
| **Multi-language** | Localized question sets, UI translations | English first; internationalization architecture prepared |
| **Custom Questions** | Host-authored question lineages | V2 feature; V1 uses curated library only |
| **Coordination Channel** | In-app group chat for pre-game coordination | Hosts use existing messaging apps; reduces scope |

### Priority Tiers

```
P0 — Launch requirement. App does not ship without this.
P1 — Post-launch expansion. Planned for V1.1–V1.3.
P2 — Future consideration. Validated by research but deferred.
```

## 0.3 Glossary

| Term | Definition |
|------|-----------|
| **Host** | The primary user who creates a session, selects a game, configures parameters, sends invitations, manages pre-game contributions, orchestrates game night, and triggers post-game artifact generation. The host is always also a player. (DESIGN.md §I: "The host is a player.") |
| **App Player** | A guest who has installed the Ephemera Engine app. Can participate in all three phases: receives invitations, submits contributions, views game night reference material, and receives artifacts. |
| **Web Player** | A guest who joins via a shared link in a mobile browser without installing the app. Can RSVP, submit pre-game contributions, and access game night reference material. Receives artifacts via email. Limited post-game features. |
| **Session** | A single instance of a game from creation to archival. Contains all configuration, player data, contributions, game state, and generated artifacts. |
| **Game Night** | The live, in-person evening when the game is played. The second phase of the three-phase arc. |
| **Artifact** | A beautiful, designed document (PDF or future physical) generated from the data of a completed session. Each game produces 2–4 distinct artifact types. (DESIGN.md §II–V Post-Game sections) |
| **Content Pack** | A purchasable bundle of curated content: question lineages, setting seeds, story themes, structural templates, or era packets. Extends the base game library. |
| **Fragment** | (Exquisite Corpse) A single sentence or phrase contributed by a player before game night, used as raw material for collaborative assembly. |
| **Question Lineage** | (Confession Album) A categorized family of questions with a shared register and origin: Classic Proust, Vanity Fair, Pivot/Lipton, or Thematic Remix. (DESIGN.md §IV) |
| **Setting Seed** | (Murder Mystery) A four-element scenario generator: Era × Location × Social Milieu × Central Tension. Produces unique murder mystery scenarios combinatorially. (DESIGN.md §II) |
| **The Board** | (Confession Album) The physical or digital display of all available questions. Diminishes visibly as questions are selected and removed during play. (DESIGN.md §IV) |
| **The Chain** | (Confession Album) The core mechanic: each player inherits the previous player's chosen question, then selects a new one from the board. Compulsion, then agency. (DESIGN.md §IV) |
| **The Return** | (Confession Album) Optional variant: after the board is empty, each player may re-ask any question from the evening to any other player. (DESIGN.md §IV) |
| **The Dossier** | (Murder Mystery) Post-game artifact: a case file summarizing the true events, red herrings, accusations, and solution. (DESIGN.md §II) |
| **The Album** | (Confession Album) Post-game artifact: a saddle-stitched booklet with all questions and paired answers. (DESIGN.md §IV) |
| **Proust's Answer** | (Confession Album) Delayed post-game artifact: a private letter pairing the player's answer with Proust's historical response. Delivered 1 week after game night. (DESIGN.md §IV) |
| **The Anthology** | (Whose Memory?) Post-game artifact: compiled story booklet with author reveals. (DESIGN.md §III) |
| **The Chapbook** | (Exquisite Corpse) Post-game artifact: literary magazine of all assembled texts. (DESIGN.md §V) |
| **Phase** | One of three temporal stages: Pre-Game (days/weeks before), Game Night (the evening), Post-Game (hours/days after). (DESIGN.md §I) |
| **Contribution** | Any pre-game submission from a player: written answers, story submissions, character preferences, cocktail descriptions, fragment text. |
| **Contribution Brief** | The set of instructions sent to each player describing what they should prepare or bring. Narratively motivated, not arbitrary. (DESIGN.md §II–V) |
| **Deep Link** | A URL that opens the app (or web join page) directly to a specific session's invitation, bypassing navigation. |
| **Session State** | The current lifecycle position of a session: Draft → Inviting → Preparing → Active → Complete → Archived. |

---

# Part 1 — User Personas & Journeys

## 1.1 Personas

### Persona 1: The Host

**Demographics**: 28–45 years old. Experience-oriented. Hosts dinner parties 4–12 times per year. Reads, cooks, curates playlists. Values aesthetics and intentionality. May identify as "the person in the friend group who organizes things."

**Motivations**:
- Wants gatherings to be *meaningful*, not just pleasant
- Enjoys preparation as a creative act — menu planning, atmosphere design, curation
- Wants to give guests an experience they'll remember and talk about
- Values beautiful objects and keepsakes

**Behaviors**:
- Installs the app, pays for it, purchases content packs
- Spends 30–60 minutes configuring a session (selecting game, curating questions/settings, customizing invitations)
- Manages the pre-game: tracking RSVPs, monitoring contribution submissions, sending reminders
- Orchestrates game night: pacing, phase transitions, reveals
- Triggers artifact generation post-game
- The host is the growth engine: a great host invites 8 people, 3 of whom become hosts themselves

**Pain Points**:
- Existing party games feel disposable — no preparation, no lasting memory
- Murder mystery kits are static and feel scripted
- Wants to host something special but lacks the design/writing skill to create it from scratch
- Post-party, there's nothing to show for the evening

**Relationship to the App**: Power user. The app is a creative tool, not an admin panel. The host experience should feel like curating an exhibition or designing a menu — not filling out forms.

### Persona 2: The App Player

**Demographics**: 25–45. Friend or acquaintance of the host. Willing to install an app if the invitation is compelling enough. Socially engaged but may not be a natural "host" themselves.

**Motivations**:
- Curious about the experience — the invitation intrigued them
- Wants to participate fully: contribute, prepare, engage
- Enjoys the anticipation of the pre-game phase
- Wants the post-game artifact as a keepsake

**Behaviors**:
- Installs the app via invitation deep link
- Creates an account (or uses guest auth initially, upgrades later)
- Submits pre-game contributions (answers, stories, preferences, recipes)
- Uses the app minimally during game night (reference material, voting)
- Receives and views artifacts post-game
- May become a host after experiencing the game as a player

**Pain Points**:
- Doesn't want the app to be intrusive or require excessive setup
- Worried about vulnerability — "What if my answers are weird?"
- Doesn't want another social network or notification-heavy app

**Relationship to the App**: Moderate engagement. High during pre-game (contributions), minimal during game night (screen dark), medium during post-game (artifacts).

### Persona 3: The Web Player

**Demographics**: Any age. May not be tech-forward. Invited by the host but unwilling or unable to install an app for a single event. The plus-one, the out-of-town friend, the parent at the dinner party.

**Motivations**:
- Wants to participate without friction
- May be skeptical of the game concept but willing to try
- Doesn't want to create an account or install anything

**Behaviors**:
- Receives an invitation via SMS, email, or messaging app
- Opens a mobile web link to RSVP
- Submits pre-game contributions via web form
- During game night, has no app — participates fully through analog play
- Receives artifacts via email (PDF attachment or download link)

**Pain Points**:
- Any friction in the join process will cause drop-off
- Doesn't want to feel like a second-class participant
- May not check email for the post-game artifact

**Relationship to the App**: Minimal. Web-only touchpoints. The experience must be complete without the app — the web player's game night is identical to the app player's.

## 1.2 User Journeys

### Journey 1: The Confession Album — Host Perspective

```
PRE-GAME (1–2 weeks before)
├── 1. Host opens app → Home screen → "Create Session"
├── 2. Selects "The Confession Album" from game picker
├── 3. Configures session:
│   ├── Session name ("A Midsummer Confession")
│   ├── Date and time
│   ├── Guest count (8)
│   └── Question lineage: Classic Proust (base) + 5 Thematic Remix additions
├── 4. Reviews question set on Board Preview screen
│   ├── Removes 2 questions too light for the group
│   ├── Adds 1 from Vanity Fair lineage
│   └── Final count: 13 questions (8 guests + 5 buffer)
├── 5. Configures options:
│   ├── The Return variant: ON
│   ├── Board format: digital (guests will view on host's tablet)
│   └── Contribution archetype assignment: auto-assign
├── 6. Reviews invitation preview
│   └── Invitation includes: date, atmosphere text, contribution archetype assignment
├── 7. Sends invitations → Session moves to INVITING state
├── 8. Monitors RSVP dashboard:
│   ├── 6/8 accepted within 2 days
│   ├── 1 declined → host adjusts question count
│   └── 1 pending → host sends reminder (in-app or manual)
├── 9. Tracks contribution submissions:
│   ├── Views who has submitted, who hasn't
│   ├── Sends deadline reminders (3 days before, 1 day before)
│   └── Reviews submitted answers for any issues
└── 10. Session moves to PREPARING state when deadline passes

GAME NIGHT
├── 11. Host opens Game Night Dashboard
│   ├── Board displayed on host's tablet/phone (propped up for group)
│   ├── Player order shown (configurable)
│   └── Ambient mode: warm, dim, minimal UI
├── 12. Act I — The Board & The Tradition
│   ├── Host reads introduction text (provided by app)
│   ├── Guests present contributions
│   └── Host answers first question (warm-up)
├── 13. Act II — The Chain
│   ├── Host advances player turns on dashboard
│   ├── Current question highlighted on digital board
│   ├── Questions removed from board as selected
│   ├── Board visibly diminishes
│   └── Host may toggle "The Return" round
├── 14. Act III — The Portrait
│   ├── Host reviews curated answer pairs (noted during play)
│   ├── Reads selected pairs aloud
│   └── Session moves to COMPLETE state
└── 15. Host triggers "Generate Artifacts"

POST-GAME
├── 16. Artifact generation begins (server-side, <30 seconds)
│   ├── The Album (PDF): all questions + paired answers
│   └── Contributions Table: archetype assignments + what guests brought
├── 17. Host reviews artifact previews in app
├── 18. Host distributes artifacts:
│   ├── App players: push notification + in-app download
│   └── Web players: email with PDF attachment
├── 19. 1 week later: Proust's Answer generation
│   ├── Each player receives personalized letter (push/email)
│   └── Pairs their answer with Proust's historical response
└── 20. Session moves to ARCHIVED state
```

### Journey 2: The Confession Album — Player Perspective

```
PRE-GAME
├── 1. Receives invitation (push notification if app installed, SMS/email if not)
├── 2. Opens deep link → lands on Session Invitation screen
│   ├── Sees: game name, date, host name, atmosphere description
│   ├── Sees: contribution archetype assignment ("Your idea of happiness — bring a drink")
│   └── Does NOT see: question list, chain mechanic explanation
├── 3. RSVPs: Accept / Decline / Maybe
├── 4. (If new user) Creates account or continues as web player
├── 5. Views Contribution Brief:
│   ├── Archetype: "Your idea of happiness"
│   ├── Instruction: "Bring a drink that embodies it"
│   └── Tone guidance: "Not prescriptive — your interpretation is the first creative act"
├── 6. Submits contribution description (optional, for the Contributions Table):
│   └── "A thermos of my grandmother's Turkish coffee"
└── 7. Receives reminder notification 1 day before if contribution not submitted

GAME NIGHT
├── 8. The app is essentially unused during game night
│   ├── Optional: view the board on their own phone (if host enables)
│   └── Optional: reference their contribution archetype
├── 9. Participates in the chain mechanic (analog, in the room)
├── 10. Answers inherited questions and chooses new ones from the board
└── 11. Participates in The Return (if enabled) and The Portrait

POST-GAME
├── 12. Receives push notification: "Your Album is ready"
├── 13. Opens app → views/downloads The Album (PDF)
├── 14. Views Contributions Table
├── 15. 1 week later: receives "Proust's Answer" notification
│   ├── Opens personalized letter
│   ├── Sees their answer paired with Proust's historical response
│   └── For non-Proust questions: sees a related Proust answer with context
└── 16. Artifact saved to personal artifact library in app
```

### Journey 3: The Murder Mystery — Host Perspective

```
PRE-GAME (2–4 weeks before)
├── 1. Host opens app → "Create Session" → selects "Murder Mystery"
├── 2. Configures session:
│   ├── Guest count (8)
│   ├── Date and time
│   └── Setting Seed selection:
│       ├── Option A: Browse curated seeds (pre-authored scenarios)
│       ├── Option B: Generate seed (LLM-powered, Claude API)
│       │   ├── Select Era: 1928
│       │   ├── Select Location: Riviera villa
│       │   ├── Select Milieu: Art world
│       │   └── Select Tension: A vanished manuscript
│       └── Option C: Randomize across all four axes
├── 3. Reviews generated scenario:
│   ├── Setting description, character roster, relationship web
│   ├── Crime structure: victim, murderer, weapon, motive, red herrings
│   ├── Timeline of key dramatic beats (4–6 events)
│   └── Can regenerate or manually adjust
├── 4. Reviews character sheets (auto-generated from seed):
│   ├── Each character: name, occupation, personality sketch, secret, relationship
│   └── Host can edit any character detail
├── 5. Configures contribution briefs:
│   ├── Each character has: food/drink suggestion, dress code, prop suggestion, preparation prompts
│   └── Host can customize or accept defaults
├── 6. Sends invitations → Session moves to INVITING state
│   ├── Invitation includes: date, setting teaser (no spoilers), RSVP request
│   └── Invitation does NOT include: character assignment (that comes after RSVP)
├── 7. Monitors RSVPs on dashboard
├── 8. Assigns characters to confirmed guests:
│   ├── Option A: Auto-assign (system matches based on guest count)
│   ├── Option B: Manual assignment (host chooses who plays whom)
│   └── Option C: Preference-based (guests rank character archetypes, system assigns)
├── 9. Delivers character packets:
│   ├── Each guest receives: character sheet, contribution brief, preparation prompts
│   ├── Push notification: "Your character has arrived"
│   └── The murderer receives their packet with or without full knowledge (host configures)
├── 10. Tracks pre-game submissions:
│   ├── Preparation prompt answers (alibi, motive, last words to victim)
│   ├── Contribution confirmations (cocktail, dish, outfit, prop)
│   └── Deadline reminders as needed
└── 11. Session moves to PREPARING state

GAME NIGHT
├── 12. Host opens Game Night Dashboard
│   ├── Three-act structure displayed with timing guidance
│   ├── Player roster with character names
│   ├── Clue distribution checklist
│   └── Emergency reference: full solution, all secrets
├── 13. Act I — Arrival & Establishment (45 min)
│   ├── Host marks "Act I Begin" on dashboard
│   ├── Character introduction checklist
│   └── Host tracks: who has been introduced, relationships discovered
├── 14. Act II — The Crime (30 min)
│   ├── Host triggers "The Crime" event on dashboard
│   ├── Clue distribution tracker: which clues distributed, which remain
│   ├── Interrogation round timer (optional, 5–7 min per round)
│   └── Mid-investigation evidence reveals (host triggers)
├── 15. Act III — Accusation & Reveal (30 min)
│   ├── Host triggers "Accusations" phase
│   ├── Optional: in-app accusation submission (each player submits who/how/why)
│   ├── Host triggers "The Reveal"
│   ├── Solution displayed on host dashboard for reading aloud
│   └── Awards voting (optional, in-app)
└── 16. Session moves to COMPLETE state → Host triggers "Generate Artifacts"

POST-GAME
├── 17. Artifact generation:
│   ├── The Dossier (case file PDF)
│   ├── Menu of the Damned (recipe card collection PDF)
│   └── Society Page Photo template (camera overlay + compositing)
├── 18. Host reviews and distributes artifacts
├── 19. Host writes The Sealed Envelope (optional):
│   ├── App provides epilogue writing prompts per character
│   ├── Host writes personalized character epilogues
│   └── Delivered to each guest 1 week later
└── 20. Session archived
```

### Journey 4: The Murder Mystery — Player Perspective

```
PRE-GAME
├── 1. Receives invitation → RSVPs
├── 2. (After RSVP) Receives character packet notification
├── 3. Opens character sheet:
│   ├── Name, occupation, personality sketch
│   ├── Secret (something their character is hiding)
│   ├── Relationship to another character (by role, not player name)
│   └── "You owe a great debt to the art dealer"
├── 4. Views contribution brief:
│   ├── Food/drink: "Your character is a Marseille spice merchant — bring a cocktail that tells that story"
│   ├── Dress: "Deep jewel tones. Something with structure. A pocket watch you never look at."
│   └── Prop: "One object your character would carry"
├── 5. Answers preparation prompts privately:
│   ├── "What is your character's alibi?"
│   ├── "What do you owe the victim?"
│   └── "What would you kill to protect?"
├── 6. Submits cocktail/dish description for the menu compilation
└── 7. Anticipation builds over 2–4 weeks

GAME NIGHT
├── 8. Arrives in character
├── 9. Presents contributions (cocktail, dish, prop) as performance moments
├── 10. Discovers relationships through in-character conversation
├── 11. Investigates after the crime: searches for physical clues, interrogates others
├── 12. Writes private accusation (on paper or in app)
├── 13. Witnesses the reveal
└── 14. Votes on awards (optional)

POST-GAME
├── 15. Receives The Dossier (push/email)
├── 16. Receives Menu of the Damned (push/email)
├── 17. Takes Society Page Photo (in-app camera with period overlay)
├── 18. 1 week later: receives The Sealed Envelope
│   └── Personalized character epilogue from the host
└── 19. Artifacts saved to personal library
```

---

# Part 2 — Shared Platform Features

All four games share a common infrastructure layer. Features in this section apply across games unless otherwise noted.

## 2.1 Authentication & Profiles

### 2.1.1 Sign-Up / Sign-In

**Priority**: P0
**Phase**: Platform
**Users**: Host, App Player

**Purpose**: Establish persistent identity for hosts (session history, purchased content, artifact library) and app players (contribution history, artifact access).

**Trigger**: First app launch, or tapping "Sign In" from any unauthenticated state.

**Flow**:
1. User opens app for first time → Welcome screen with product introduction (3 screens, skippable)
2. Sign-up options presented:
   - "Continue with Apple" (Apple Sign-In)
   - "Continue with Google" (Google Sign-In)
   - "Sign up with email"
3. For email sign-up:
   - Enter email address
   - Enter password (min 8 characters)
   - Enter display name
   - Verification email sent → user confirms
4. Profile created with:
   - Display name
   - Optional avatar (photo or initial-based)
   - Unique user ID
5. User lands on Home screen

**Success Criteria**:
- Sign-up completes in <60 seconds for social auth
- Sign-up completes in <90 seconds for email auth (excluding verification)
- No mandatory fields beyond name and auth credentials
- Social auth uses platform-native flows (no embedded webviews)

**Dependencies**: None (foundational feature)

**Notes**: No username system, no public profiles, no discoverability. Identity exists only within sessions the user participates in.

### 2.1.2 Guest Mode (Web Players)

**Priority**: P0
**Phase**: Platform
**Users**: Web Player

**Purpose**: Allow participation without installation or account creation. The web player experience must feel complete, not degraded. (STRATEGY.md §8.2: "Players may never install the app.")

**Trigger**: Opening an invitation deep link in a mobile browser.

**Flow**:
1. Web player taps invitation link → mobile browser opens web join page
2. Session invitation displayed: game name, date, host name, atmosphere text
3. Prompted for display name only (no account creation)
4. RSVPs: Accept / Decline / Maybe
5. If accepted: redirected to contribution submission form
6. Session cookie maintains identity for this session
7. Post-game artifacts delivered via email (entered during RSVP or contribution flow)

**Success Criteria**:
- RSVP completes in <30 seconds from link tap
- No app install prompt, no account creation wall
- Web player can submit all pre-game contributions through mobile browser
- Web player receives all artifacts via email

**Dependencies**: 2.3 Invitation System

### 2.1.3 Host Profile

**Priority**: P0
**Phase**: Platform
**Users**: Host

**Purpose**: Hosts have additional capabilities and data: session history, purchased content packs, artifact generation history, hosting preferences.

**Trigger**: Any authenticated user becomes a host when they create their first session.

**Flow**:
1. User creates first session → "Host" capability unlocked (no separate role selection)
2. Host profile includes:
   - Session history (past sessions with dates, games, player counts)
   - Content library (owned content packs)
   - Artifact library (all generated artifacts from hosted sessions)
   - Hosting preferences (default settings carried across sessions)
3. Host profile is private — not visible to other users

**Success Criteria**:
- Host capability activates automatically on first session creation
- No separate "become a host" flow or paywall for hosting
- Session history searchable and filterable

**Dependencies**: 2.1.1 Sign-Up

## 2.2 Session Management

### 2.2.1 Create Session

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Initialize a new game session with all configuration required for the selected game type. The session creation flow should feel like curating an experience, not filling out a form. (STRATEGY.md §8.2: "Host dashboard should feel like a creative tool, not an admin panel.")

**Trigger**: Host taps "Create Session" on Home screen or "+" FAB.

**Flow**:
1. Select game type:
   - The Confession Album (P0)
   - Murder Mystery (P0)
   - Whose Memory? (P1, shown but locked)
   - The Exquisite Corpse (P1, shown but locked)
2. Enter session basics:
   - Session name (optional; auto-generated from game + date if blank)
   - Date and time
   - Expected guest count (used for content calibration)
3. Game-specific configuration (see §3.1, §3.2 for details):
   - Confession Album: question lineage, question set curation, board format, variant toggles
   - Murder Mystery: setting seed selection/generation, character roster review, contribution brief customization
4. Review session summary screen
5. Confirm → session created in DRAFT state
6. Option to immediately send invitations (→ INVITING) or save draft for later

**Success Criteria**:
- Session creation completes in <5 minutes for default settings
- Session creation completes in <15 minutes for fully customized configuration
- Every configuration has sensible defaults — host can accept all defaults and have a good game
- Session saved as draft at any point; host can return later

**Dependencies**: 2.1.1 Sign-Up

### 2.2.2 Session States

**Priority**: P0
**Phase**: Platform
**Users**: Host

**Purpose**: Track session lifecycle from creation to archival. Each state transition triggers specific behaviors (notifications, feature availability, UI changes).

**State Machine**:

```
                    ┌──────────────────────────────────────────────┐
                    │                                              │
  ┌───────┐   send    ┌──────────┐  deadline  ┌───────────┐       │
  │ DRAFT │──invites──▶│ INVITING │───passes──▶│ PREPARING │       │
  └───────┘           └──────────┘            └───────────┘       │
      │                    │                       │              │
      │                    │                       │              │
      ▼                    ▼                       ▼              │
  ┌────────┐          (host can                ┌────────┐        │
  │CANCELED│           cancel at               │ ACTIVE │        │
  └────────┘           any point)              └────────┘        │
                                                   │              │
                                                   ▼              │
                                              ┌──────────┐       │
                                              │ COMPLETE │       │
                                              └──────────┘       │
                                                   │              │
                                                   ▼              │
                                              ┌──────────┐       │
                                              │ ARCHIVED │◀──────┘
                                              └──────────┘
```

| State | Description | Host Can | Players See |
|-------|-------------|----------|-------------|
| **DRAFT** | Session created, not yet shared | Edit all config, send invitations, cancel | Nothing (session not visible) |
| **INVITING** | Invitations sent, RSVPs collecting | Edit config, track RSVPs, send reminders, add/remove players, cancel | Invitation, RSVP form |
| **PREPARING** | RSVPs closed or deadline passed, contributions collecting | Track contributions, send reminders, edit config (limited), start game night | Contribution forms, character sheets, preparation prompts |
| **ACTIVE** | Game night in progress | Game Night Dashboard, phase controls | Game night reference material (minimal) |
| **COMPLETE** | Game night ended, artifacts being generated or ready | Generate artifacts, write delayed content (epilogues, afterwords), distribute | Artifacts, downloads |
| **ARCHIVED** | All artifacts delivered, session closed | View history, re-download artifacts | View artifacts in library |
| **CANCELED** | Session abandoned before game night | N/A | Cancellation notification |

**Transition Rules**:
- DRAFT → INVITING: triggered by "Send Invitations"
- INVITING → PREPARING: triggered by host manually, or auto when RSVP deadline passes
- PREPARING → ACTIVE: triggered by host starting game night
- ACTIVE → COMPLETE: triggered by host ending game night
- COMPLETE → ARCHIVED: triggered automatically when all artifacts delivered (including delayed), or manually by host
- Any pre-ACTIVE state → CANCELED: triggered by host

**Success Criteria**:
- State transitions are atomic and logged
- Players receive appropriate notifications on each transition
- Host cannot accidentally skip states (e.g., cannot start game night without invitations sent)
- Session state visible on host dashboard at all times

**Dependencies**: 2.2.1 Create Session

## 2.3 Invitation System

### 2.3.1 Send Invitations

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Invite guests to a session via shareable links. The invitation itself should set the tone — it is "an atmosphere, not a rules document" (DESIGN.md §IV). Must support both app players (deep link opens app) and web players (deep link opens mobile browser).

**Trigger**: Host taps "Send Invitations" from session config or dashboard.

**Flow**:
1. Host chooses invitation method:
   - **Share link**: generates a unique deep link; host shares via their preferred messaging app (iMessage, WhatsApp, email, etc.)
   - **Invite by contact**: host selects contacts from device; app generates individual invitation messages
2. Each invitation contains:
   - Session deep link (unique per session, optionally unique per invitee)
   - Host name
   - Game name and date
   - Atmospheric teaser text (auto-generated based on game type and configuration)
   - For Confession Album: contribution archetype assignment
   - For Murder Mystery: no character details (assigned after RSVP)
3. Deep link behavior:
   - If app installed: opens app → Session Invitation screen
   - If app not installed: opens mobile browser → Web Join page
4. Session moves to INVITING state

**Success Criteria**:
- Deep link generation <1 second
- Deep link works on iOS (Universal Links) and Android (App Links)
- Fallback to web join works reliably when app not installed
- Invitation shareable via any messaging platform (plain text + link)
- No recipient tracking via invitation link (privacy: host doesn't see if someone opened the link without RSVPing)

**Dependencies**: 2.2.1 Create Session

### 2.3.2 RSVP Tracking

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host, App Player, Web Player

**Purpose**: Track guest responses so the host can manage guest count, assign roles, and know when to proceed.

**Trigger**: Guest opens invitation link.

**Flow**:
1. Guest opens deep link → Invitation screen
2. Sees session details: game, date, host, atmosphere text
3. RSVPs:
   - **Accept**: added to session roster; proceeds to contribution flow
   - **Decline**: host notified; guest removed from roster
   - **Maybe**: host notified; guest shown in "pending" state
4. Host dashboard updates in real-time:
   - Accepted / Declined / Maybe / No Response counts
   - Guest list with RSVP status
5. Host can:
   - Send reminder to non-responders
   - Manually add a guest (generates new invitation link)
   - Adjust session configuration based on confirmed count

**Success Criteria**:
- RSVP status updates visible to host within 5 seconds
- Host can see full RSVP dashboard at a glance
- Reminders sent only to non-responders (not to those who already responded)

**Dependencies**: 2.3.1 Send Invitations

### 2.3.3 Role Assignment (Murder Mystery)

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Assign characters to confirmed guests for Murder Mystery sessions. Must happen after RSVP confirmation. (DESIGN.md §II: characters assigned after guest list confirmed.)

**Trigger**: Host has confirmed guest list and taps "Assign Characters."

**Flow**:
1. Host views character roster (generated from setting seed)
2. Assignment options:
   - **Auto-assign**: system distributes characters; host reviews
   - **Manual**: host drags characters to guest names
   - **Preference-based**: guests receive character archetype preference form; system optimizes assignment
3. Host reviews all assignments
4. Host confirms → character packets delivered to each guest
5. Each guest receives push notification: "Your character has arrived"

**Success Criteria**:
- Assignment screen shows character summaries alongside guest names
- Host can reassign any character before delivery
- Preference-based mode collects preferences in <2 minutes per guest
- Character packet delivery confirmed per-guest on host dashboard

**Dependencies**: 2.3.2 RSVP Tracking, 3.2 Murder Mystery module

## 2.4 Contribution Pipeline

### 2.4.1 Contribution Submission

**Priority**: P0
**Phase**: Pre-Game
**Users**: App Player, Web Player

**Purpose**: Collect async pre-game content from players: written answers, story submissions, character preparation answers, cocktail/dish descriptions, fragment text. Contributions are the raw material the game and artifacts are built from. "Preparation is play" (DESIGN.md §I).

**Trigger**: Guest accepts invitation → navigated to contribution flow, or opens contribution reminder notification.

**Flow**:
1. Guest views their contribution brief:
   - Game-specific instructions (see §3.1–3.4)
   - Tone guidance and examples
   - Submission deadline
   - Word count guidance (where applicable)
2. Guest enters contributions in structured form fields:
   - Text fields for written answers / stories / descriptions
   - Optional photo upload (for contribution descriptions, e.g., "here's what I'm bringing")
3. Guest can save draft and return later
4. Guest submits → host notified of submission
5. Guest can edit submission until the host locks contributions (PREPARING → ACTIVE transition)

**Success Criteria**:
- Contribution form loads in <2 seconds
- Drafts auto-save every 30 seconds
- Guest can complete contribution submission in <10 minutes
- Web players have identical contribution flow to app players
- Submissions viewable by host immediately

**Dependencies**: 2.3.2 RSVP Tracking

### 2.4.2 Host Review Dashboard

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Give the host a complete view of all pending and submitted contributions. Enable the host to identify missing submissions, send targeted reminders, and review content for issues.

**Trigger**: Host navigates to session dashboard during INVITING or PREPARING state.

**Flow**:
1. Dashboard displays contribution matrix:
   - Rows: guests
   - Columns: required contributions (varies by game)
   - Cells: submitted / pending / overdue
2. Host can:
   - Tap any cell to view submitted content
   - Send reminder to specific guests (targeted, not broadcast)
   - Flag a submission for follow-up (e.g., identifying details in a Whose Memory? story)
   - Mark a guest as "excused" if they won't submit (system generates fallback content if applicable)
3. Summary bar shows: X/Y contributions received, Z days until deadline

**Success Criteria**:
- Dashboard loads in <1 second
- Real-time updates as contributions arrive
- One-tap reminder sending per guest
- Clear visual distinction between submitted, pending, and overdue

**Dependencies**: 2.4.1 Contribution Submission

### 2.4.3 Deadline & Reminder System

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host, App Player, Web Player

**Purpose**: Ensure contributions arrive before game night. Automated reminders reduce host burden; manual reminders give the host control.

**Trigger**: Configurable deadlines set during session creation.

**Flow**:
1. Host sets contribution deadline during session creation (default: 3 days before game night)
2. Automated reminders sent to guests with pending contributions:
   - 3 days before deadline: "Friendly reminder — your contribution is due in 3 days"
   - 1 day before deadline: "Tomorrow is the deadline for [Session Name]"
   - Deadline passed: "The deadline has passed, but you can still submit" (grace period)
3. Host can send manual reminder at any time (custom message optional)
4. Reminders respect notification preferences (see §2.9)
5. Host can extend deadline from dashboard

**Success Criteria**:
- Automated reminders fire reliably at configured times
- No duplicate reminders within a 12-hour window
- Host sees which guests received which reminders
- Grace period submissions still accepted unless host manually locks

**Dependencies**: 2.4.1 Contribution Submission, 2.5 Push Notifications

## 2.5 Push Notifications

### 2.5.1 Notification Catalog

**Priority**: P0
**Phase**: All phases
**Users**: Host, App Player

**Purpose**: Time-sensitive communication across the entire session lifecycle. Notifications must be meaningful, not spammy — every notification corresponds to a real event. (See §5.4 for the complete catalog.)

**Notification Types**:

| Category | Notification | Recipient | Timing | Channel |
|----------|-------------|-----------|--------|---------|
| **Invitation** | "You're invited to [Session Name]" | Player | On send | Push + SMS/email |
| **RSVP** | "[Guest] accepted your invitation" | Host | On RSVP | Push |
| **Character** | "Your character has arrived" | Player | On assignment | Push |
| **Reminder** | "Your contribution is due in [N] days" | Player | 3d, 1d before deadline | Push |
| **Submission** | "[Guest] submitted their contribution" | Host | On submit (batched) | Push |
| **Deadline** | "Contributions deadline has passed" | Host | On deadline | Push |
| **Game Night** | "[Session Name] begins tonight" | All | Day of, morning | Push |
| **Phase Change** | "Act II has begun" | Player | On host trigger | Push (optional) |
| **Artifact Ready** | "Your [Artifact Name] is ready" | All | On generation | Push + email |
| **Delayed Artifact** | "A letter from the past" | Player | 1 week post-game | Push + email |
| **Canceled** | "[Session Name] has been canceled" | All | On cancellation | Push + email |

**Timing Rules**:
- No notifications between 10 PM and 8 AM local time (queued for morning delivery)
- Batch contribution-received notifications for host (max 1 per hour)
- Delayed artifacts scheduled for delivery at 10 AM local time on the target date
- Host can override notification timing for their session

**Success Criteria**:
- Notifications delivered within 30 seconds of trigger event
- Push notification registration succeeds on first app launch
- Web players receive equivalent notifications via email
- Users can control notification preferences per category

**Dependencies**: 2.1.1 Sign-Up

### 2.5.2 Email Notifications (Web Players)

**Priority**: P0
**Phase**: All phases
**Users**: Web Player

**Purpose**: Web players who don't install the app need a reliable notification channel.

**Trigger**: Any notification event targeting a web player.

**Flow**:
1. Web player provides email during RSVP or contribution flow
2. All push notifications are sent as emails to web players
3. Email includes deep link back to the web session page
4. Artifact delivery emails include PDF attachment

**Success Criteria**:
- Emails sent within 60 seconds of trigger
- PDF attachments <10MB
- Email deliverability >95% (SPF/DKIM/DMARC)
- Unsubscribe link in every email

**Dependencies**: 2.5.1 Notification Catalog

## 2.6 Game Night Dashboard (Host)

### 2.6.1 Dashboard Overview

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: The host's control surface during game night. Provides phase progression, timing, player management, and emergency reference — while respecting the "screen dark" principle. The dashboard should be glanceable, not attention-demanding. Warm ambient mode by default. (DESIGN.md §I: "during the evening, the screen is dark"; STRATEGY.md §Pillar 5: "the phone is a candle on the table, not a flashlight in the face.")

**Trigger**: Host taps "Start Game Night" from session dashboard.

**Flow**:
1. Dashboard launches in ambient mode:
   - Dark background, warm accent colors (amber/gold)
   - Minimal text, large touch targets
   - Auto-brightness reduction (system prompt)
   - Screen stays on (wake lock)
2. Dashboard displays:
   - Current phase/act name
   - Phase progression controls (advance to next phase)
   - Optional timer (configurable per phase; no timer by default for Confession Album)
   - Player roster with check-in status
   - Quick reference button (expands full session details)
3. Game-specific dashboard elements (see §3.1, §3.2)
4. "End Game Night" button (confirmation required) → session moves to COMPLETE

**Success Criteria**:
- Dashboard loads in <1 second
- Screen wake lock prevents auto-sleep during game night
- Ambient mode reduces screen brightness and uses OLED-friendly dark theme
- All touch targets >=48dp
- Dashboard usable with one hand while host is simultaneously participating

**Dependencies**: 2.2.2 Session States

### 2.6.2 Phase Progression Controls

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: Let the host advance through game phases at their own pace. No automatic timers force transitions — the host reads the room. (DESIGN.md §IV: "The pace is unhurried. There is no timer.")

**Flow**:
1. Dashboard shows current phase with progress indicator
2. "Next Phase" button (with phase name preview: "Begin Act II: The Crime")
3. Confirmation dialog: "Ready to move to [Phase Name]?"
4. On confirm: phase transition animation, optional player notification
5. Phase history shown as completed checkmarks

**Success Criteria**:
- Phase transition completes in <500ms
- No accidental transitions (confirmation required)
- Host can go back one phase if triggered accidentally (within 30 seconds)

**Dependencies**: 2.6.1 Dashboard Overview

### 2.6.3 Emergency Reference

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: The host needs access to the full game state during game night — solution, secrets, character details, question list — without scrolling through the entire session config. A panic button for the host who forgot a detail.

**Flow**:
1. Host taps "Reference" icon on dashboard → full-screen overlay
2. Tabs for:
   - Player Roster (names, characters, secrets)
   - Game State (current phase, what's happened, what's next)
   - Full Solution (Murder Mystery: whodunit; Confession Album: remaining questions)
   - Contribution Summary (what each guest brought/submitted)
3. Searchable within reference view
4. Tap outside or swipe down to dismiss → return to ambient dashboard

**Success Criteria**:
- Reference overlay opens in <300ms
- All game data available offline (pre-cached when session enters ACTIVE state)
- Reference view is read-only (no accidental edits during game night)

**Dependencies**: 2.6.1 Dashboard Overview

## 2.7 Artifact Generation Engine

### 2.7.1 Generation Pipeline

**Priority**: P0
**Phase**: Post-Game
**Users**: Host (triggers), All (receives)

**Purpose**: Transform session data into beautiful, designed PDF documents. The artifact is the Ephemera Engine's most distinctive feature. "A confession album that looks like a database has confessed nothing." (DESIGN.md §IV; STRATEGY.md §Deep Dive C)

**Trigger**: Host taps "Generate Artifacts" after game night ends, or auto-triggered when session moves to COMPLETE.

**Flow**:
1. Host taps "Generate Artifacts" → confirmation
2. Client sends generation request to server with session data
3. Server-side pipeline:
   a. Assemble data: player contributions, game outcomes, session metadata
   b. Select template: game-specific artifact template (HTML/CSS)
   c. Populate template: inject data into template variables
   d. Render: Puppeteer/Playwright renders HTML → PDF
   e. Typography: web fonts loaded (Playfair Display, Lora, JetBrains Mono)
   f. Quality check: PDF file size, page count, rendering verification
4. PDF uploaded to storage (CDN-backed)
5. Download links generated (time-limited, session-scoped)
6. Host receives notification: "Artifacts ready for review"
7. Host previews artifacts in-app (PDF viewer)
8. Host distributes:
   - App players: push notification with in-app download link
   - Web players: email with PDF attachment

**Success Criteria**:
- Generation completes in <30 seconds per artifact
- PDF quality: 300 DPI, print-ready, correct typography
- File size: <5MB per artifact (optimized images, subset fonts)
- Offline viewing: downloaded PDFs viewable without internet
- Generation works for all supported artifact types (see §5.5)

**Dependencies**: 2.2.2 Session States (COMPLETE state), 2.5 Push Notifications

### 2.7.2 Delayed Artifact Delivery

**Priority**: P0
**Phase**: Post-Game
**Users**: All

**Purpose**: Some artifacts are intentionally delayed — delivered days or a week after game night. This is a designed feature, not a limitation. "The Sealed Envelope" arrives when the evening has settled into memory. (DESIGN.md §II, §IV)

**Trigger**: Scheduled delivery date (configured during session creation or using defaults).

**Delayed Artifacts**:

| Game | Artifact | Default Delay | Configurable |
|------|----------|---------------|-------------|
| Confession Album | Proust's Answer | 7 days | Yes (3–14 days) |
| Murder Mystery | The Sealed Envelope | 7 days | Yes (3–14 days) |
| Whose Memory? | The Afterword + The Prompt That Never Was | 7 days | Yes |
| Exquisite Corpse | The Fragment That Got Away + Constraint Echo | 7 days | Yes |

**Flow**:
1. Immediate artifacts generated and delivered on game night / next morning
2. Delayed artifacts queued with scheduled delivery date
3. For host-written delayed artifacts (Sealed Envelope, Afterword):
   a. Host receives writing prompt notification 2 days after game night
   b. Host writes content in-app (guided by per-character/per-player prompts)
   c. Content saved; delivery proceeds on schedule
   d. If host doesn't write by delivery date: delivery postponed, host reminded daily for 7 additional days (14 days total from game night)
   e. **Fallback**: If host has not written by day 14, the delayed artifact is delivered without personalization. A note is included: "Your host is still crafting your epilogue — this artifact may be updated." The host can still submit content afterward, which triggers a revised artifact delivery.
4. For auto-generated delayed artifacts (Proust's Answer, Fragment That Got Away):
   a. Generated server-side at scheduled time
   b. Personalized per player
   c. Delivered via push + email at 10 AM local time
5. Delivery confirmation tracked per player

**Success Criteria**:
- Delayed artifacts delivered within 1 hour of scheduled time
- Host writing prompts sent reliably 2 days post-game
- Per-player personalization correct (right answers paired with right Proust responses)
- Delivery tracked: host can see who received what

**Dependencies**: 2.7.1 Generation Pipeline, 2.5 Push Notifications

## 2.8 Content Library & Store

### 2.8.1 Bundled Content

**Priority**: P0
**Phase**: Platform
**Users**: Host

**Purpose**: The base app includes enough content for multiple plays without additional purchases. Bundled content is the floor, not the ceiling.

**Bundled Content (V1)**:

| Game | Content Type | Quantity | Notes |
|------|-------------|----------|-------|
| Confession Album | Classic Proust questions (1886 + 1892) | 35 | Full historical set |
| Confession Album | Thematic Remix questions | 20 | Original to Ephemera Engine |
| Confession Album | Vanity Fair-inspired questions | 10 | Inspired by, not verbatim |
| Confession Album | Pivot/Lipton compressions | 10 | Short-form questions |
| Murder Mystery | Curated Setting Seeds | 5 | Fully authored scenarios |
| Murder Mystery | Era Packets | 10 | Period-specific details |
| Murder Mystery | Character Archetypes | 30 | Occupation, personality, secret templates |
| Murder Mystery | Crime Mechanics | 10 | Poison, theft, framing, etc. |
| All Games | Artifact Templates | 1 per type | Base visual design |

**Success Criteria**:
- Bundled content supports >=5 unique sessions per game without repetition
- Content loads from local storage (no network required)
- Content organized and browsable by category

**Dependencies**: None

### 2.8.2 Content Pack Store

**Priority**: P0
**Phase**: Platform
**Users**: Host

**Purpose**: Purchasable content expansions that extend the base library. Content packs are the primary ongoing revenue model. (STRATEGY.md §Pillar 7)

**Trigger**: Host navigates to Store from Home screen or encounters "Get more content" prompts during session configuration.

**Flow**:
1. Store displays available content packs organized by game
2. Each pack shows:
   - Name and description
   - Game compatibility
   - Content count (e.g., "25 new questions across 3 lineages")
   - Price ($2.99–$6.99)
   - Preview: sample content items
3. Host purchases via in-app purchase (Apple/Google)
4. Content downloaded and merged into local content library
5. New content appears in session configuration alongside bundled content

**Content Pack Types**:

| Type | Price Range | Example |
|------|------------|---------|
| Question Lineage Pack | $2.99–$3.99 | "The Mortality Questions" — 25 questions |
| Setting Seed Pack | $4.99–$6.99 | "The Jazz Age Collection" — 5 scenarios |
| Era Packet Bundle | $2.99–$3.99 | "The Victorian Era" — period details |
| Theme Pack | $2.99–$3.99 | "Sensory Memories" — 20 story prompts |
| Template Pack | $2.99–$3.99 | "Alternative Structures" — 10 templates |
| Game Unlock | $4.99–$6.99 | Whose Memory? or The Exquisite Corpse |

**Success Criteria**:
- Store loads in <2 seconds
- Purchase flow uses native IAP (no external payment)
- Purchased content available immediately after download
- Purchased content persists across reinstalls (tied to account)

**Dependencies**: 2.1.1 Sign-Up, Platform IAP integration

### 2.8.3 Content Pack Format

**Priority**: P0
**Phase**: Platform
**Users**: Internal (content authoring pipeline)

**Purpose**: Standardized format for authoring, packaging, and distributing content packs. (See §5.6 for full specification.)

**Format**:
```yaml
id: "confession-album-mortality-v1"
name: "The Mortality Questions"
version: "1.0"
game: "confession-album"
type: "question-lineage"
price_tier: "standard"
description: "25 questions on death, legacy, time, and what remains."
preview_items: 3

items:
  - id: "mort-001"
    type: "question"
    lineage: "thematic-remix"
    register: "deep"
    domain: "mortality"
    text: "What do you want said at your funeral that probably won't be true?"
    proust_adjacent: "What is your idea of perfect happiness?"
    proust_response: "To live close to all those I love..."
```

**Dependencies**: None (internal tooling)

## 2.9 Settings & Preferences

### 2.9.1 Notification Preferences

**Priority**: P0
**Phase**: Platform
**Users**: All

**Purpose**: Let users control notification frequency and channels without disabling critical communications.

**Settings**:

| Setting | Options | Default |
|---------|---------|---------|
| Invitation notifications | On / Off | On |
| Contribution reminders | On / Off | On |
| Game night notifications | On / Off | On |
| Artifact notifications | On / Off | On |
| Delayed artifact notifications | On / Off | On |
| Email notifications (web) | On / Off | On |
| Quiet hours | Custom / Default (10PM–8AM) / Off | Default |

**Dependencies**: 2.5 Push Notifications

### 2.9.2 Accessibility Settings

**Priority**: P0
**Phase**: Platform
**Users**: All

**Purpose**: Ensure the app is usable by all players regardless of ability. (STRATEGY.md §8.1; RESEARCH.md §5)

**Settings**:

| Setting | Options | Default |
|---------|---------|---------|
| Text size | System / Large / Extra Large | System |
| High contrast mode | On / Off | Off |
| Reduce motion | On / Off (respects system) | System |
| Screen reader optimization | Auto (VoiceOver/TalkBack) | Auto |
| Written answer mode | Enable / Disable | Available |

**Notes**: Written answer mode allows players to type responses during game night instead of speaking aloud — accommodating neurodivergent players, non-native speakers, or anyone who prefers writing. (STRATEGY.md §8.1)

**Dependencies**: None

### 2.9.3 App Theme

**Priority**: P1
**Phase**: Platform
**Users**: All

**Settings**:

| Setting | Options | Default |
|---------|---------|---------|
| Theme | Warm (cream/amber) / Dark (charcoal/gold) / System | System |

**Notes**: Both modes evoke the register of the games: contemplative, unhurried, warm. Dark mode uses charcoal with gold accents — not pure black.

**Dependencies**: None

---

# Part 3 — Game Modules

Each game module specifies its Pre-Game, Game Night, and Post-Game features, game-specific data model, and artifact specifications. Shared platform features (§2) are referenced, not repeated.

## 3.1 The Confession Album (P0)

*Source: DESIGN.md §IV. Chain-answering Proust Questionnaire with diminishing board.*

### 3.1.1 Pre-Game: Question Set Configuration

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Let the host curate the question set that will appear on the board. The question set is the most important creative decision the host makes — it determines the evening's register, depth, and emotional range.

**Trigger**: Session creation flow, after selecting "The Confession Album."

**Flow**:
1. Host selects base lineage:
   - Classic Proust (35 questions, light to medium)
   - Vanity Fair (10 questions, medium)
   - Pivot/Lipton (10 questions, light)
   - Thematic Remix (20 questions, mixed)
   - Or: "Surprise me" (system selects balanced mix)
2. Board Preview screen displays all questions in selected lineage
3. Host curates:
   - Remove questions (tap to deselect)
   - Add questions from other lineages (browse or search)
   - Reorder questions on the board (drag to arrange)
4. System suggests target count: guest count + 5 (e.g., 8 guests = 13 questions)
5. Each question tagged with metadata:
   - Register: light / medium / deep
   - Domain: virtue, appetite, memory, imagination, mortality, relationship, aesthetics, identity
   - Lineage: which tradition it comes from
   - Proust response: whether a historical Proust answer exists (for Proust's Answer artifact)
6. Host confirms question set → saved to session

**Success Criteria**:
- Board Preview loads all questions with tags in <1 second
- Host can curate a full question set in <10 minutes
- System warns if question count is too low (<guest count) or too high (>guest count + 10)
- Default "Surprise me" option produces a balanced, playable set immediately

**Dependencies**: 2.8.1 Bundled Content

### 3.1.2 Pre-Game: Board Configuration

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Configure how the question board will be displayed during game night.

**Flow**:
1. Host selects board format:
   - **Digital Board (default)**: questions displayed on host's device (tablet/phone), guests can see from seats
   - **Physical Board**: host will print/write questions on physical cards; app provides printable template
   - **Hybrid**: digital board on host device + printed cards as backup
2. For digital board:
   - Layout options: grid, list, scattered (artistic arrangement)
   - Background: warm neutral / dark / custom color
   - Font size: auto (based on question count) / manual
3. For physical board:
   - App generates printable PDF of question cards (formatted for cutting)
   - Cards include question text only (no metadata visible to players)

**Success Criteria**:
- Digital board readable from 6 feet away on a tablet
- Printable cards formatted for standard paper sizes (A4, Letter)
- Questions randomized in layout (not ordered by register or domain)

**Dependencies**: 3.1.1 Question Set Configuration

### 3.1.3 Pre-Game: Contribution Archetype Assignment

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host, App Player, Web Player

**Purpose**: Each guest brings one item tied to a question archetype from the Proust tradition. (DESIGN.md §IV: "Your idea of happiness — bring a drink that embodies it.")

**Flow**:
1. During session creation, host configures assignment:
   - **Auto-assign**: system assigns archetypes evenly across guests
   - **Manual**: host assigns specific archetypes to specific guests
   - **Player choice**: guests choose from available archetypes (first-come)
2. Available archetypes (from DESIGN.md §IV):
   - "Your idea of happiness" — bring a drink
   - "Your favorite food" — bring it, or bring the story
   - "Your most treasured possession" — bring the object to display
   - "Your favorite word" — write it on a card
   - "The quality you most admire" — bring a piece of music
3. Assignment included in invitation
4. Guest views their archetype in contribution brief
5. Guest optionally submits description of what they're bringing (for Contributions Table artifact)

**Success Criteria**:
- Each guest receives exactly one archetype
- No archetype assigned to more than ceil(guests/archetypes) players
- Archetype description includes evocative guidance, not prescriptive instructions

**Dependencies**: 2.3.1 Send Invitations, 2.4.1 Contribution Submission

### 3.1.4 Pre-Game: Player Order

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Establish the order in which players will take turns during The Chain. (DESIGN.md §IV: host may arrange order to "alternate temperaments.")

**Flow**:
1. After RSVPs confirmed, host sets player order:
   - **Seating arrangement**: host enters order based on planned seating (clockwise)
   - **Random**: system generates random order
   - **Manual**: host arranges by dragging player names
2. Host is NOT in the turn order (host answers the first question as warm-up, then the chain begins)
3. Player order visible on Game Night Dashboard but not shown to players in advance
4. Host can reorder during game night if needed (before a player's turn)

**Success Criteria**:
- Player order configurable in <2 minutes
- Reordering during game night possible without disrupting flow

**Dependencies**: 2.3.2 RSVP Tracking

### 3.1.5 Game Night: Board Display

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: Display the question board on the host's device during game night. Questions are removed as they are selected, making the board visibly diminish — the central visual metaphor of the game. (DESIGN.md §IV: "As questions are removed, the gaps are visible. The board becomes a record of what has been asked and what remains.")

**Trigger**: Host starts game night → board appears on Game Night Dashboard.

#### Display Mode: Digital Board (default)

**Flow**:
1. Board displays all questions in configured layout
2. During each player's turn:
   a. Current player highlighted in turn order
   b. Player approaches board (or host's device) and selects a question
   c. Host taps the selected question on screen
   d. Question expands: full text displayed, read aloud by player
   e. After both answers (inheritance + choice), host taps "Remove"
   f. Question animates out — gap remains visible
   g. Turn advances to next player
3. Board progressively empties throughout the game
4. Host can tap any remaining question to preview it (for their commentary: "we've lost all the questions about virtue")
5. When board is empty, chain is complete

#### Display Mode: Physical Board

When the host selects Physical Board format in §3.1.2, the dashboard does NOT display the question grid. Instead:

1. Dashboard shows a simplified "Current Phase" indicator with:
   - Current player name and turn number
   - Phase progression (Act I → Act II → The Return)
   - Remaining question count (host manually decrements)
   - Optional timer
2. Host manually removes physical cards from the table/wall as questions are selected
3. Host taps "Next Turn" to advance the turn order
4. Host taps "Question Selected" and types/selects the question ID to log which question was chosen (required for artifact generation)

#### Display Mode: Hybrid

Combines Digital Board display on the host's device with physical cards as a backup. Dashboard functions identically to Digital Board mode.

**Success Criteria**:
- Digital Board: question removal animation smooth (300ms, fade + collapse)
- All modes: remaining question count visible at all times
- Digital Board: readable at the configured distance throughout (font scales as questions reduce)
- Digital Board: host can undo a removal within 10 seconds (in case of accidental tap)
- Physical Board: chain data still captured for artifact generation via manual input

**Dependencies**: 3.1.2 Board Configuration, 2.6.1 Dashboard Overview

### 3.1.6 Game Night: The Chain Mechanic

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: Track the chain mechanic on the host dashboard: who inherits which question, who chooses which question, and the pairing of answers. This data feeds the post-game Album artifact.

**Flow**:
1. Dashboard shows turn state:
   ```
   Current Player: [Name]
   Step 1: INHERIT — Answer [Previous Player]'s question: "[Question Text]"
   Step 2: CHOOSE — Select a new question from the board
   ```
2. Host records which question was chosen (by tapping it on the board)
3. Pairing logged: Question → Chooser + Inheritor
4. Optional: host can note standout answer pairs during play (bookmarked for The Portrait)
5. After all turns complete, dashboard shows "Board Empty — Begin The Portrait"

**Success Criteria**:
- Turn tracking requires minimal host interaction (1–2 taps per turn)
- Answer pairings logged correctly for artifact generation
- Host can bookmark notable pairs with one tap
- Chain state recoverable if app is backgrounded/foregrounded

**Dependencies**: 3.1.5 Digital Board Display

### 3.1.7 Game Night: The Return (Optional Variant)

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: After the board is empty, an optional final round where any player may re-ask any question to any other player. (DESIGN.md §IV: "This round is brief and voluntary. It produces the evening's most electric moments or its quietest ones.")

**Trigger**: Host toggles "Begin The Return" on dashboard (only available if enabled during session creation).

**Flow**:
1. Host activates The Return → dashboard switches to open-floor mode
2. Any player may volunteer to ask
3. Host tracks which question was re-asked and to whom (optional — this round is informal)
4. No fixed turn order, no obligation to answer
5. Host ends The Return when energy dissipates → "Begin The Portrait"

**Success Criteria**:
- The Return activation is a single tap
- Tracking is optional (the round can be fully analog)
- Dashboard clearly indicates this is a voluntary, unstructured round

**Dependencies**: 3.1.6 Chain Mechanic

### 3.1.8 Game Night: The Portrait

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: The host reads back selected answer-pairs — the same question answered by two different people. The climactic moment of the game. (DESIGN.md §IV: "the pairs speak for themselves.")

**Trigger**: Host taps "Begin The Portrait" after chain completes.

**Flow**:
1. Dashboard displays all answer pairings from the chain
2. Host-bookmarked pairs highlighted at top
3. Host selects which pairs to read aloud (not all — curated selection)
4. For each pair, dashboard shows:
   ```
   "What is your idea of perfect happiness?"
   [Name A] said: [answer summary/first few words]
   [Name B] said: [answer summary/first few words]
   ```
5. Host reads pairs aloud from dashboard
6. After The Portrait, host ends game night → COMPLETE state

**Success Criteria**:
- All pairings available with bookmarked pairs prioritized
- Host can navigate between pairs with swipe gestures
- Dashboard in ambient mode during The Portrait (large text, warm background)

**Dependencies**: 3.1.6 Chain Mechanic

### 3.1.9 Post-Game: The Album

**Priority**: P0
**Phase**: Post-Game
**Users**: All

**Purpose**: The primary artifact of The Confession Album: a saddle-stitched booklet PDF with all questions and paired answers. (DESIGN.md §IV: "one question per page... echoes the Victorian original.")

**Trigger**: Host triggers artifact generation after game night.

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | The Album |
| Format | PDF, portrait, A5 or half-letter |
| Pages | Cover + 1 per question + Contributions Table + colophon |
| Template Style | Victorian confession album: display serif for questions, readable serif for answers |
| Color Palette | Warm cream background, deep green accents, gold foil-effect titles |
| Typography | Playfair Display (questions), Lora (answers), JetBrains Mono (names/dates) |

**Content Layout (per question page)**:
```
┌─────────────────────────────────┐
│                                 │
│   "What is your idea of        │
│    perfect happiness?"          │
│                                 │
│   ─────────────────────         │
│                                 │
│   [Name A] (chose):             │
│   [Full answer text]            │
│                                 │
│   [Name B] (inherited):         │
│   [Full answer text]            │
│                                 │
│                                 │
│                         [3/13]  │
└─────────────────────────────────┘
```

**Cover Page**: "Confession Album" in display type, session date, list of participants, session name if provided.

**Colophon**: "This album was composed on [date] by [list of names]. Questions drawn from the [lineage] tradition. Assembled by the Ephemera Engine."

**Success Criteria**:
- Album generated in <30 seconds
- All question-answer pairs correctly attributed
- Print-ready quality (300 DPI)
- File size <5MB
- Visually beautiful — would not look out of place framed or on a shelf

**Dependencies**: 2.7.1 Generation Pipeline, 3.1.6 Chain Mechanic (for pairing data)

### 3.1.10 Post-Game: Contributions Table

**Priority**: P0
**Phase**: Post-Game
**Users**: All

**Purpose**: Document what each guest brought — the assembled contributions that furnished the evening. (DESIGN.md §IV: "A still life of the group's collective taste.")

**Trigger**: Generated alongside The Album.

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | The Contributions Table |
| Format | Single page within The Album (or standalone 1-page PDF) |
| Content | Guest name, archetype, what they brought, their description |

**Success Criteria**:
- All contributions with descriptions included
- Guests who didn't submit descriptions show archetype only
- Formatted as a beautiful table/list, not a spreadsheet

**Dependencies**: 2.4.1 Contribution Submission

### 3.1.11 Post-Game: Proust's Answer (Delayed)

**Priority**: P0
**Phase**: Post-Game (delayed 1 week)
**Users**: App Player, Web Player (individual, personalized)

**Purpose**: The game's final gesture: a private letter pairing each player's answer with Proust's historical response to the same (or adjacent) question. "A conversation across time, delivered privately, after the evening has settled into memory." (DESIGN.md §IV)

**Trigger**: Scheduled delivery, 7 days after game night (configurable).

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | Proust's Answer |
| Format | PDF, single page, letter format |
| Personalization | One unique letter per player per question answered |
| Template Style | Personal letter: handwriting-inspired header, warm serif body |
| Color Palette | Cream paper, sepia ink, gold accent |

**Content Format**:
```
Dear [Player Name],

You were asked: "What is your idea of perfect happiness?"

You said: "[Their full answer]"

At age thirteen, Marcel Proust said: "To live close to all those
I love, with the beauties of nature, a quantity of books and music,
and, near at hand, a French theater."

— The Ephemera Engine
  [Date of game night]
```

**For non-Proust questions** (Vanity Fair, Pivot, Thematic Remix):
```
Proust was never asked your question. But he was asked
something adjacent: "What is your present state of mind?"

He said: "Annoyance at having to answer the question about my
present state of mind."

The distance between your question and his is where the
conversation lives.
```

**Delivery Rules**:
- One letter per question the player answered (typically 2: one inherited, one chosen)
- Letters delivered as a single PDF with multiple pages, or individual PDFs
- Delivered at 10 AM local time
- Push notification: "A letter from the past has arrived"
- Email for web players with PDF attachment

**Success Criteria**:
- Correct Proust response paired with correct question
- Player's actual answer reproduced accurately
- Letters feel personal, not automated
- Delivery timing accurate to within 1 hour of schedule

**Dependencies**: 2.7.2 Delayed Artifact Delivery, Historical Proust response database

### 3.1.12 Confession Album Data Model

```
Session (confession_album)
├── question_set: QuestionItem[]
│   ├── id: string
│   ├── text: string
│   ├── lineage: "classic-proust" | "vanity-fair" | "pivot-lipton" | "thematic-remix"
│   ├── register: "light" | "medium" | "deep"
│   ├── domain: string
│   ├── proust_response_1886: string | null
│   ├── proust_response_1892: string | null
│   ├── board_position: number
│   └── status: "on-board" | "removed"
├── player_order: PlayerId[]
├── contributions: ContributionItem[]
│   ├── player_id: PlayerId
│   ├── archetype: string
│   └── description: string
├── chain: ChainEntry[]
│   ├── turn_number: number
│   ├── player_id: PlayerId
│   ├── inherited_question_id: string | null (null for first player)
│   ├── inherited_answer: string (recorded by host or entered by player)
│   ├── chosen_question_id: string
│   ├── chosen_answer: string
│   └── bookmarked: boolean
├── the_return: ReturnEntry[] (optional)
│   ├── asker_id: PlayerId
│   ├── target_id: PlayerId
│   └── question_id: string
└── config
    ├── board_format: "digital" | "physical" | "hybrid"
    ├── return_enabled: boolean
    └── timer_enabled: boolean
```

## 3.2 Murder Mystery (P0)

*Source: DESIGN.md §II. Immersive whodunit with character sheets, contributions, and investigation.*

### 3.2.1 Pre-Game: Setting Seed Selection

**Priority**: P0
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Select or generate the four-element scenario that determines the entire murder mystery: era, location, milieu, and tension. (DESIGN.md §II: "Era x Location x Milieu x Tension produces thousands of unique scenarios.")

**Trigger**: Session creation flow, after selecting "Murder Mystery."

**Flow**:
1. Host chooses seed method:
   - **Browse curated seeds**: pre-authored, fully fleshed-out scenarios (5 bundled in V1)
   - **Generate seed**: select elements from each axis, LLM generates full scenario
   - **Full random**: system selects all four axes randomly, LLM generates
2. For generated/random seeds:
   a. Host selects or accepts:
      - Era (e.g., 1928, 1962, 1887)
      - Location (e.g., Riviera villa, Manhattan penthouse)
      - Social Milieu (e.g., Art world, diplomatic corps)
      - Central Tension (e.g., art theft ring, contested inheritance)
   b. System sends elements to Claude API (server-side)
   c. LLM generates:
      - Setting description (2–3 paragraphs)
      - Character roster (guest count + 1 for victim, or victim is among guests)
      - Relationship web (who knows whom, how)
      - Crime structure: victim, murderer, weapon, motive
      - 2–3 red herrings baked into character secrets
      - Timeline of 4–6 key dramatic beats
   d. Host reviews generated scenario
   e. Host can: regenerate entirely, regenerate individual elements, manually edit
3. For curated seeds: host selects from list, reviews details, optionally customizes
4. Host confirms seed → character generation proceeds

**Success Criteria**:
- Curated seed selection in <2 minutes
- LLM generation completes in <15 seconds
- Generated scenarios are internally consistent (no logical contradictions)
- Host can regenerate unlimited times during configuration
- Generated content does not repeat across sessions (sufficient randomness)

**Dependencies**: 2.8.1 Bundled Content, Claude API integration

### 3.2.2 Pre-Game: Character Sheet Delivery

**Priority**: P0
**Phase**: Pre-Game
**Users**: App Player, Web Player

**Purpose**: Deliver personalized character packets to each guest after role assignment. The packet transforms the guest into a character weeks before the party. (DESIGN.md §II: "The game begins when the envelope arrives.")

**Trigger**: Host confirms character assignments (§2.3.3).

**Content Per Character Packet**:
1. **Character Sheet**:
   - Full name, occupation, public reputation
   - Personality sketch (2–3 sentences)
   - One secret (relevant to the crime)
   - One or more relationships to other characters (by role, not player name)
2. **Contribution Brief**:
   - Food/drink: narratively motivated suggestion
   - Dress code: color palette, silhouette, era-appropriate, one signature accessory
   - Prop: one object the character would carry
3. **Preparation Prompts** (2–3 questions):
   - "What is your character's alibi for the evening of the crime?"
   - "What do you owe the victim?"
   - "What would you kill to protect?"
   - "What is the last thing you said to the deceased?"

**Flow**:
1. Character packet displayed as a themed, sealed-envelope UI (tap to "open")
2. Content revealed progressively: character sheet first, then brief, then prompts
3. Player can revisit their packet at any time before and during game night
4. Preparation prompt answers submitted as contributions (§2.4.1)

**Success Criteria**:
- Character packet presentation feels like receiving a physical envelope
- All character information accessible offline after initial load
- Preparation prompt submission tracked on host dashboard
- Character sheet does not reveal the murderer's full knowledge (configurable)

**Dependencies**: 2.3.3 Role Assignment, 3.2.1 Setting Seed

### 3.2.3 Game Night: Three-Act Dashboard

**Priority**: P0
**Phase**: Game Night
**Users**: Host

**Purpose**: Guide the host through the three-act structure of game night with phase-specific tools. (DESIGN.md §II: Act I Arrival, Act II The Crime, Act III Accusation & Reveal.)

**Dashboard Layout**:

```
┌─────────────────────────────────────────┐
│  MURDER MYSTERY — Game Night            │
│  Setting: Villa Soleil, Riviera, 1928   │
├─────────────────────────────────────────┤
│                                         │
│  ● Act I: Arrival    ○ Act II    ○ III  │
│                                         │
│  Checklist:                             │
│  ☑ All guests arrived                   │
│  ☑ Cocktails presented                  │
│  ☐ All relationships discovered         │
│  ☐ Suspicion building                   │
│                                         │
│  Players: 8/8 present                   │
│                                         │
│  [Reference]  [Timer: OFF]  [Next Act]  │
│                                         │
└─────────────────────────────────────────┘
```

**Act I — Arrival & Establishment** (45 min suggested):
- Character introduction checklist
- Optional music cue (if host uploaded/selected a playlist)
- "Begin Act II" button (with confirmation)

**Act II — The Crime** (30 min suggested):
- Crime trigger button: "Reveal the Crime"
- Clue distribution tracker:
  - List of physical clues, checked off as distributed
  - Character knowledge reminders (what each character knows)
- Interrogation round controls:
  - Optional timer (5–7 min per round)
  - Group rotation tracker (which pairs/trios have met)
- Mid-investigation reveals: "New Evidence" button to trigger host-delivered twists

**Act III — Accusation & Reveal** (30 min suggested):
- "Begin Accusations" button
- Optional in-app accusation form (players submit who/how/why on their own phones)
- Accusation summary display (for host to read aloud)
- "The Reveal" button → displays full solution for host to narrate:
  - True murderer, weapon, motive
  - Complete timeline
  - Red herring explanations
  - Who was closest to the truth
- Awards voting (optional):
  - Best Performance, Most Convincing Liar, Best Cocktail, Best Dressed, Closest to the Truth

**Success Criteria**:
- Dashboard provides enough structure without micromanaging
- Host can skip checklists if they prefer to run informally
- All information available via Emergency Reference (§2.6.3)
- Phase transitions logged with timestamps (for Dossier artifact)

**Dependencies**: 2.6.1 Dashboard Overview, 3.2.1 Setting Seed

### 3.2.4 Game Night: Accusation Submission

**Priority**: P0
**Phase**: Game Night
**Users**: App Player, Host

**Purpose**: Capture player accusations digitally for inclusion in The Dossier artifact. (DESIGN.md §II: "Each guest writes down their accusation — who committed the crime, how, and why — and seals it.")

**Trigger**: Host activates "Begin Accusations" on dashboard; players receive notification.

**Flow**:
1. Host activates accusation phase
2. App players see accusation form on their devices:
   - Who committed the crime? (select from character list)
   - How? (free text, 1–2 sentences)
   - Why? (free text, 1–2 sentences)
3. Players submit → sealed (not visible to others or host until reveal)
4. Host dashboard shows submission count (X/Y submitted), not content
5. **Analog fallback**: Players who prefer paper write their accusations and seal them. After The Reveal, host transcribes paper accusations into the app via a "Post-Game Reconciliation" step before artifact generation.
6. During The Reveal, host can display accusation summary

**Post-Game Reconciliation** (before artifact generation):
- Host reviews the accusation list; any missing players are flagged
- Host can enter paper accusations on behalf of players who didn't use the app
- Reconciliation must be completed before The Dossier can be generated
- Host can mark a player as "no accusation" if they chose not to participate

**Success Criteria**:
- Digital accusation is the default path; paper is an explicit fallback
- All accusations (digital and transcribed) available for The Dossier artifact
- Submissions sealed until host triggers reveal
- Form takes <2 minutes to complete
- Works offline (syncs when connectivity resumes)

**Dependencies**: 2.6.1 Dashboard Overview

### 3.2.5 Post-Game: The Dossier

**Priority**: P0
**Phase**: Post-Game
**Users**: All

**Purpose**: A case file summarizing the true events of the evening. Written in the voice of a detective, journalist, or archivist from the game's era. (DESIGN.md §II: "the real timeline, the red herrings that worked, who guessed what, and how the crime was solved or wasn't.")

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | The Dossier |
| Format | PDF, portrait, A5 or half-letter, 4–8 pages |
| Template Style | Case file / broadsheet — noir aesthetic |
| Color Palette | Black, white, red accent |
| Typography | JetBrains Mono (headers, labels), Lora (narrative body) |

**Content**:
- Cover: "CASE FILE — [Crime Type] at [Location], [Date in fiction]"
- The True Timeline: what actually happened, narrated in era-appropriate voice
- The Red Herrings: which false leads worked and which didn't
- The Accusations: summary of who accused whom (anonymized or named, host chooses)
- The Solution: the murderer, weapon, motive — full explanation
- Awards: if voted, listed with recipients
- Cast of Characters: player name → character name → a one-line fate

**Success Criteria**:
- Dossier voice matches the era/setting of the game
- All player accusations included (digital submissions + host-transcribed paper accusations from §3.2.4 reconciliation)
- Generated in <30 seconds
- Feels like a genuine artifact from the game's world

**Dependencies**: 2.7.1 Generation Pipeline, 3.2.3 Three-Act Dashboard (for timeline data)

### 3.2.6 Post-Game: Menu of the Damned

**Priority**: P0
**Phase**: Post-Game
**Users**: All

**Purpose**: The full cocktail and food menu as contributed by guests, compiled with character attributions. (DESIGN.md §II: "formatted as a keepsake recipe card collection or a single broadsheet menu.")

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | Menu of the Damned |
| Format | PDF, landscape, recipe card layout or broadsheet |
| Content | Character name, player name, item brought, description/story |
| Template Style | Period-appropriate menu design (era-matched) |

**Success Criteria**:
- All submitted food/drink contributions included
- Character attribution (character name, not just player name)
- Visually distinct from The Dossier (different template, lighter tone)

**Dependencies**: 2.7.1 Generation Pipeline, 2.4.1 Contribution Submission

### 3.2.7 Post-Game: Society Page Photo

**Priority**: P1
**Phase**: Post-Game
**Users**: All

**Purpose**: A group photo formatted as a society page clipping or crime scene evidence photo. (DESIGN.md §II: "captioned in-fiction with character names and the evening's date within the story.")

**Trigger**: Any player opens the Society Page feature after game night.

**Flow**:
1. Player opens camera within the app
2. Period-appropriate overlay displayed (frame, filter, caption area)
3. Photo taken
4. App composites:
   - Photo with period frame/filter
   - Character names as captions
   - Fictional date and location
   - "Society page" or "evidence photo" header
5. Result saved and shareable

**Success Criteria**:
- Camera overlay renders at 60fps
- Composited image high-resolution (suitable for printing)
- Multiple overlay styles per era

**Dependencies**: Camera permissions, era-specific overlay assets

### 3.2.8 Post-Game: The Sealed Envelope (Delayed)

**Priority**: P0
**Phase**: Post-Game (delayed 1 week)
**Users**: App Player, Web Player (individual)

**Purpose**: Each guest receives a personalized character epilogue — what happened to their character after the events of the evening. Written by the host. (DESIGN.md §II: "The game is now truly over.")

**Trigger**: Scheduled delivery, 7 days after game night.

**Flow**:
1. 2 days after game night: host receives notification with writing prompts
2. Host opens epilogue writing screen:
   - For each character: a prompt suggesting narrative direction
   - Example: "The spice merchant returned to Marseille. What did he find?"
   - Host writes 2–4 sentences per character
3. Epilogues saved as delayed artifacts
4. Delivered to each player at scheduled time
5. If host doesn't write by delivery date: reminder sent; delivery postponed

**Artifact Specification**:

| Property | Value |
|----------|-------|
| Name | The Sealed Envelope |
| Format | PDF, single page, personal letter |
| Template Style | Handwritten-feel header, narrative body in era voice |
| Personalization | One unique epilogue per player |

**Success Criteria**:
- Writing prompts help the host without constraining them
- Epilogue writing takes <20 minutes total (all characters)
- Each player receives only their own character's epilogue

**Dependencies**: 2.7.2 Delayed Artifact Delivery

### 3.2.9 Murder Mystery Data Model

```
Session (murder_mystery)
├── setting_seed
│   ├── source: "curated" | "generated" | "random"
│   ├── era: string
│   ├── location: string
│   ├── milieu: string
│   ├── tension: string
│   ├── setting_description: string
│   └── generated_by: "human" | "llm" | "hybrid"
├── characters: Character[]
│   ├── id: string
│   ├── name: string
│   ├── occupation: string
│   ├── personality: string
│   ├── secret: string  <!-- allow-secret -->
│   ├── relationships: { target_character_id, type, description }[]
│   │       type: "ally" | "rival" | "secret" | "obligation" | "kin" | "professional"
│   ├── is_murderer: boolean
│   ├── is_victim: boolean
│   ├── contribution_brief: { food, dress, prop }
│   ├── preparation_prompts: string[]
│   └── assigned_to: PlayerId | null
├── crime
│   ├── victim_id: string
│   ├── murderer_id: string
│   ├── weapon: string
│   ├── motive: string
│   ├── red_herrings: RedHerring[]
│   └── timeline: TimelineEvent[]
├── contributions: ContributionItem[]
│   ├── player_id: PlayerId
│   ├── character_id: string
│   ├── food_description: string
│   ├── prep_answers: { prompt: string, answer: string }[]
│   └── cocktail_description: string
├── game_night
│   ├── act_timestamps: { act: number, started_at: timestamp }[]
│   ├── clues_distributed: string[]
│   ├── evidence_reveals: { timestamp, description }[]
│   └── accusations: Accusation[]
│       ├── player_id: PlayerId
│       ├── accused_character_id: string
│       ├── method: string
│       └── motive: string
├── awards: Award[]
│   ├── category: string
│   ├── winner_id: PlayerId
│   └── votes: number
└── sealed_envelopes: Epilogue[]
    ├── character_id: string
    ├── player_id: PlayerId
    ├── text: string
    └── delivered: boolean
```

## 3.3 Whose Memory? (P1)

*Source: DESIGN.md §III. Anonymous storytelling and attribution game. Deferred to post-launch.*

### 3.3.1 Pre-Game: Theme Selection

**Priority**: P1
**Phase**: Pre-Game
**Users**: Host

**Purpose**: Select or generate the evocative prompt that invites personal stories. (DESIGN.md §III: "specific enough to constrain but open enough to invite range.")

**Flow**:
1. Host browses curated themes organized by intimacy level and occasion
2. Or generates a theme from combinatorial grammar: Sense x Emotion x Temporality x Specificity
3. Theme announced to all guests with submission deadline

**Dependencies**: 2.8.1 Bundled Content

### 3.3.2 Pre-Game: Story Submission

**Priority**: P1
**Phase**: Pre-Game
**Users**: App Player, Web Player

**Purpose**: Collect anonymous personal stories (200–500 words) from each guest. (DESIGN.md §III)

**Flow**:
1. Guest views theme and submission guidelines
2. Writes story in first person (200–500 words)
3. Submits anonymously to host
4. Host reviews: checks for accidental identifiers, assigns poetic aliases

**Dependencies**: 2.4.1 Contribution Submission

### 3.3.3 Game Night Features

**Priority**: P1
**Phase**: Game Night
**Users**: Host

**Features**:
- Reading format selection (host reads aloud / silent reading / volunteer readers)
- Story display on host device (one at a time, large text)
- Guess Sheet: digital form for players to record guesses (story → author)
- Three-round structure: Open Table → The Interview → Private Deliberation
- The Reveal: sequential author reveals with optional sharing prompts
- Scoring: correct guesses tallied, awards voted

**Dependencies**: 2.6.1 Dashboard Overview

### 3.3.4 Post-Game Artifacts

**Priority**: P1
**Phase**: Post-Game
**Users**: All

**Artifacts**:
1. **The Anthology** — all stories compiled with author reveals (booklet PDF)
2. **The Guess Map** — visual showing who guessed whom (infographic PDF)
3. **The Afterword** (delayed) — host's written reflection on the evening
4. **The Prompt That Never Was** (delayed) — a second theme, sent privately, no submission channel

**Dependencies**: 2.7.1 Generation Pipeline, 2.7.2 Delayed Artifact Delivery

## 3.4 The Exquisite Corpse (P1)

*Source: DESIGN.md §V. Collaborative fiction with fragments, structural templates, and assembly. Deferred to post-launch.*

### 3.4.1 Pre-Game: Fragment Submission

**Priority**: P1
**Phase**: Pre-Game
**Users**: App Player, Web Player

**Purpose**: Collect anonymous sentence fragments from each guest. (DESIGN.md §V: "each fragment should be one sentence. Not a story — a shard.")

**Flow**:
1. Guest receives 2–3 prompt types, each requesting 3–5 fragments
2. Optional constraint provided (a color, season, object, sense, temporal anchor)
3. Total: 6–15 fragments per player
4. Submitted anonymously; host shuffles into Fragment Pool

**Dependencies**: 2.4.1 Contribution Submission

### 3.4.2 Game Night Features

**Priority**: P1
**Phase**: Game Night
**Users**: Host

**Features**:
- Fragment Pool display (digital: scrollable list of all fragments)
- Four-round structure:
  - Round 1: Story Spine assembly
  - Round 2: Exquisite Corpse (blind sequential writing)
  - Round 3: Cut-Up (rearrangement of Round 1 output)
  - Round 4: Rewrite (groups exchange and rewrite)
- Group assignment and timer controls
- The Reading: final texts read aloud
- Optional Fragment Auction
- Awards: Best Line, Best Collision, Best Reader, Best Book Raid

**Dependencies**: 2.6.1 Dashboard Overview

### 3.4.3 Post-Game Artifacts

**Priority**: P1
**Phase**: Post-Game
**Users**: All

**Artifacts**:
1. **The Chapbook** — all final texts as literary magazine (booklet PDF)
   - Includes: Rewrite texts, Story Spines (appendix), Exquisite Corpse texts (appendix), colophon
2. **The Fragment Census** — all fragments revealed with author names
3. **The Fragment That Got Away** (delayed) — one unused fragment sent to each player
4. **The Constraint Echo** (delayed) — a new prompt echoing the evening's constraint

**Dependencies**: 2.7.1 Generation Pipeline, 2.7.2 Delayed Artifact Delivery

---

# Part 4 — Cross-Cutting Concerns

## 4.1 Accessibility

**Priority**: P0
**Phase**: All
**Users**: All

**Purpose**: The app must be usable by players with diverse abilities, comfort levels, and neurological profiles. Accessibility is a design principle, not a compliance checkbox. (STRATEGY.md §8.1; RESEARCH.md §1.7: cultural calibration; RESEARCH.md §2.3: prosocial design)

### 4.1.1 Written Answer Mode

Players may type their responses during game night instead of speaking aloud. This accommodates:
- Neurodivergent players who find spontaneous verbal performance difficult
- Non-native English speakers who express themselves better in writing
- Shy or introverted players who prefer reflection to performance
- Players with speech-related disabilities

**Implementation**: Toggle in Settings (§2.9.2). When enabled, the player's phone shows a text input field during their turn. Their written response is displayed on the host dashboard (if the host enables this) or the player reads their own written answer aloud at their comfort level.

### 4.1.2 Pass / Skip Mechanic

Any player may pass on any question, prompt, or game mechanic without explanation or stigma. The pass is a designed feature of the game, not a failure mode.

**Implementation**:
- Confession Album: player may pass on the inherited question (the chain continues; the question is answered only by the chooser)
- Murder Mystery: player may skip any preparation prompt
- Whose Memory?: player may indicate they'd prefer not to share the additional detail during the reveal
- Exquisite Corpse: no skip needed (fragments are anonymous, assembly is collaborative)

The host is informed of passes (to track for artifact generation) but the pass is not announced or highlighted to the group.

### 4.1.3 Digital Board Fallback

The "approach the board" mechanic (Confession Album) requires mobility. The digital board provides an inherent fallback: a player with limited mobility can select a question from their own phone (if host enables "remote question selection") without approaching a physical board.

**Implementation**: Host can enable "Remote Selection" mode where players browse and select questions from their own devices. Selection is relayed to the host dashboard and removed from the board.

### 4.1.4 Screen Reader Support

All app screens support VoiceOver (iOS) and TalkBack (Android):
- Semantic HTML structure in all views
- Meaningful labels on all interactive elements
- Correct reading order for complex layouts (board, dashboard, contribution matrix)
- Artifact PDFs tagged for accessibility (PDF/UA compliance)

### 4.1.5 Neurodivergent-Friendly Design

- No flashing animations or rapid visual changes
- Timer is always optional and never the default (DESIGN.md §IV: "no timer")
- Reduce motion setting respected throughout
- Clear, predictable navigation structure
- Contribution deadlines flexible (grace periods, extensions)
- No public shame mechanics (no "X hasn't submitted yet" visible to other players)

### 4.1.6 Observer Role

A guest who RSVPs as "Observer" can be present at game night but opts out of all game mechanics. No contributions required, no turn in the chain, no character assigned.

**Rules**:
- Observer receives artifacts but contributes nothing to them
- Observer does not appear in turn order or player roster during game night
- Observer can be converted to a player mid-game if they choose to join (host adds them to the roster)
- No stigma or friction: the RSVP flow offers "Participant" and "Observer" as equal options
- For Murder Mystery: Observers may still receive a character packet marked "Guest of the Evening" — a non-critical character who attends but has no secret or role in the crime. This allows social participation without mechanical involvement.

### 4.1.7 Multi-Device Host (V1: Single Device)

V1 supports single-device hosting only. The host uses one device (phone or tablet) for both the board display and the dashboard controls.

**V2 consideration**: Multi-device support (tablet for board + phone for controls) requires session state sharing between devices, which conflicts with the Offline Gate (no network during game night). A local peer-to-peer solution (Bluetooth or local Wi-Fi) could resolve this but adds significant complexity. Deferred to V2 with a dedicated spike.

## 4.2 Privacy & Data

**Priority**: P0
**Phase**: All
**Users**: All

**Purpose**: The content shared in these games is personal, vulnerable, and belongs to the people in the room — not to the platform. Privacy is a core product value, not a legal requirement. (STRATEGY.md §8.3: "No social feed, no public profiles, no sharing to Instagram. The content belongs to the room.")

### 4.2.1 Data Principles

1. **No social features**: no public profiles, no social feed, no activity stream, no friend lists, no "see what your friends are playing"
2. **Content belongs to the room**: contributions, answers, stories, and game data are visible only to session participants
3. **No cross-session data sharing**: data from one session is never used in another session or visible to non-participants
4. **Minimal data collection**: only collect what is necessary for the product to function
5. **No advertising, no tracking**: no ad SDK, no analytics beyond essential product metrics
6. **Artifact ownership**: generated artifacts are owned by the participants, not the platform

### 4.2.2 Data Retention Policy

| Data Type | Retention | Rationale |
|-----------|-----------|-----------|
| Account data (name, email, auth) | Until account deletion | Required for authentication |
| Session configuration | Until session archived + 90 days | Needed for artifact regeneration |
| Player contributions (text) | Until session archived + 90 days | Needed for artifact generation and delayed delivery |
| Generated artifacts (PDFs) | Until player deletes or account deleted | Player-owned content |
| Game night state (phase timestamps, accusations) | Until session archived + 90 days | Needed for artifact generation |
| LLM-generated content (setting seeds, characters) | Until session archived + 90 days | Session-specific |
| Notification tokens | Until app uninstalled | Required for push delivery |

After retention period: data permanently deleted from servers. Players can download all their artifacts before deletion.

### 4.2.3 LLM Data Handling

For Murder Mystery Setting Seed generation (Claude API):
- Session data sent to Claude API is not used for model training (per Anthropic API terms)
- Only the four seed axes + guest count are sent; no player personal data
- Generated content is stored only within the session
- Host can review and edit all generated content before it reaches players

## 4.3 Offline & Connectivity

**Priority**: P0
**Phase**: All (critical for Game Night)
**Users**: All

**Purpose**: Game night must work fully offline. The game lives in the room, not on a server. Pre-game and post-game require connectivity for sync and artifact generation.

### 4.3.1 Connectivity Requirements by Phase

| Phase | Connectivity | Rationale |
|-------|-------------|-----------|
| **Pre-Game** | Required | Invitations, RSVP, contribution sync |
| **Game Night** | Not required | All game data pre-cached; the room IS the game |
| **Post-Game** | Required | Artifact generation (server-side), delivery |

### 4.3.2 Local-First Game Night

When the host starts game night (session → ACTIVE):
1. All session data synced to device and cached locally
2. Game Night Dashboard operates entirely from local data
3. No network requests during game night
4. All interactions (phase transitions, question removals, bookmarks) logged locally
5. When connectivity resumes: local changes sync to server

**Implementation**: Local SQLite database (WatermelonDB or Expo SQLite) holds complete session state. Dashboard reads from local DB only. Sync engine runs in background when network available.

### 4.3.3 Sync Resolution

If the host's device loses and regains connectivity during game night:
- Local state is authoritative (server state is stale)
- On reconnect: local changes pushed to server (last-write-wins for simple fields)
- Conflict resolution: host device always wins (only one host per session)
- Player devices (if connected) receive updates via server push after sync

### 4.3.4 Graceful Degradation

If connectivity is lost during pre-game or post-game:
- Contribution drafts saved locally, synced when connected
- Artifact generation queued, executed when connected
- Clear indication to user: "You're offline. Changes will sync when you reconnect."
- No data loss in any scenario

## 4.4 Performance

**Priority**: P0
**Phase**: All
**Users**: All

### 4.4.1 Performance Targets

| Metric | Target | Context |
|--------|--------|---------|
| App launch (cold start) | <2 seconds | First meaningful paint |
| App launch (warm start) | <500ms | Return from background |
| Screen navigation | <300ms | Any screen transition |
| Phase transition | <500ms | Game night phase change |
| Board question removal animation | <300ms | Confession Album |
| Contribution form load | <2 seconds | Including web player forms |
| Artifact generation | <30 seconds | Server-side PDF rendering |
| Push notification delivery | <30 seconds | From trigger to device |
| Deep link resolution | <3 seconds | From tap to app/web content |
| Search within content library | <500ms | Filtering questions/seeds |

### 4.4.2 Device Targets

| Platform | Minimum | Recommended |
|----------|---------|-------------|
| iOS | iPhone 12 / iOS 16+ | iPhone 14+ / iOS 17+ |
| Android | Android 10+ / 4GB RAM | Android 13+ / 6GB RAM |
| Web (player join) | Safari 16+ / Chrome 100+ | Latest stable |

### 4.4.3 Bundle Size

| Target | Limit |
|--------|-------|
| Initial app download | <50MB |
| With bundled content | <80MB |
| Per content pack | <5MB |
| Per artifact PDF | <5MB |

## 4.5 Error Handling

**Priority**: P0
**Phase**: All
**Users**: All

### 4.5.1 Player Drops During Game Night

**Scenario**: A player leaves, loses their device, or their app crashes during game night.

**Confession Album**:
- If a player drops during the chain: host can skip their turn (the inheritance passes to the next player) or assign their turn to another player
- Dashboard provides "Skip Player" option per turn
- The chain continues; the dropped player's questions are answered by adjacent players

**Murder Mystery**:
- Host continues without the player; their character becomes an NPC controlled by the host
- Emergency Reference shows the dropped character's secrets and role in the crime
- If the dropped player was the murderer: host manages the reveal accordingly

### 4.5.2 Host Disconnects

**Scenario**: The host's device crashes or runs out of battery during game night.

**Mitigation**:
- Game night state saved locally every 30 seconds
- On app restart: dashboard resumes from last saved state
- "Resume Game Night" option on app launch if session is in ACTIVE state
- No data loss — all bookmarks, phase progress, and turn tracking preserved

### 4.5.3 Missing Submissions

**Scenario**: A player doesn't submit their pre-game contribution before the deadline.

**Handling**:
- Host notified of missing submissions
- Host can: extend deadline, send manual reminder, or proceed without
- For Confession Album: missing contribution description results in blank entry in Contributions Table (not a blocker)
- For Murder Mystery: missing preparation prompt answers noted as "sealed" in host reference (character is playable without them)
- For Whose Memory?: missing story means one fewer story in the pool (game adjusts)
- For Exquisite Corpse: missing fragments reduce pool size (game adjusts)

### 4.5.4 Mid-Game Player Addition

**Scenario**: An unexpected guest arrives during game night.

**Confession Album**:
- Host can add them to the end of the player order
- They participate in the chain from their insertion point
- They don't have a contribution archetype but can participate fully

**Murder Mystery**:
- Host assigns them a "late arrival" character (pre-generated extra, or improvised)
- They enter during Act I or early Act II
- Their character sheet is simplified (no preparation prompts answered)

### 4.5.5 Session Recovery

**Scenario**: The entire session needs to be recovered (e.g., host switches devices).

**Handling**:
- All session data synced to server (when online)
- Host can log into the app on a new device and resume any active session
- Session state transitions are server-validated when online
- Offline changes queued and replayed on reconnect

## 4.6 Safety & Moderation

**Priority**: P0
**Phase**: All
**Users**: All

**Purpose**: Ensure player safety during vulnerability-heavy game moments and prevent harmful content from entering the artifact pipeline. These games invite genuine self-disclosure, personal storytelling, and emotional risk — the platform must actively protect that trust. (STRATEGY.md §8.3: content belongs to the room; RESEARCH.md §1.7: cultural calibration; DESIGN.md §IV: no timer, no pressure)

### 4.6.1 Content Filters on LLM Output

All Claude API output (Murder Mystery setting seeds, character descriptions, scenario narrative) passes through a content safety filter before display or storage.

**Filter rejects**:
- Graphic violence beyond genre conventions (Murder Mystery permits classic whodunit tropes; explicit gore is rejected)
- Sexual content of any kind
- Real-world hate speech, slurs, or discriminatory language
- Content targeting or referencing real living persons
- Content that could be interpreted as inciting real-world harm

**Handling**:
- Rejected output triggers automatic re-generation with the same seed axes (up to 3 retries)
- If all 3 retries fail: host is notified with "Content generation failed — try adjusting your seed axes" and the generation is logged for review
- Content that passes the automated filter but is flagged by the host can be reported and regenerated manually via the host dashboard
- Filter runs server-side (Supabase Edge Function) before content is written to the session store

**Implementation**: A validation layer between the Claude API response and the session content store. Filter logic is deterministic (keyword/pattern matching + category classification), not a second LLM call. Filter rules are versioned and updatable without app deployment.

### 4.6.2 Player Comfort ("Tap Out" Mechanic)

Any player can silently "tap out" of a question, prompt, or scene without explanation. Tap Out is a first-class game mechanic — not an edge case or failure mode.

**Tap Out vs. Pass**:
- **Pass** (§4.1.2): skips one turn or one question. The player remains active in the current phase and will be called on again.
- **Tap Out**: exits the current game phase entirely. The player remains present in the room but is not called on until the next phase begins.

**Rules**:
- Tap Out is always available — no cooldown, no limit, no confirmation dialog
- The player's device shows a persistent "Tap Out" button during active game phases
- Tapped-out player's screen returns to a neutral "waiting" state with a "Rejoin Phase" option
- No notification to other players — only the host's dashboard shows the tapped-out status (discreet indicator, not a banner)
- Turn order adjusts automatically: the tapped-out player is simply skipped
- The player can rejoin the current phase at any time via "Rejoin Phase"

**Game-Specific Behavior**:
- **Confession Album**: tapped-out player is skipped in the chain. Their inherited question passes to the next player in order. They re-enter the chain in the next round or phase.
- **Murder Mystery**: if a player taps out during interrogation, their character is temporarily "called away" in fiction (e.g., "receives an urgent telephone call"). The host's Emergency Reference notes the absence. The character returns when the player rejoins.
- **Whose Memory?**: tapped-out player's story remains in the pool but the player is not called on to reveal or elaborate.
- **Exquisite Corpse**: tapped-out player's fragments are still included (they are anonymous); the player simply does not participate in assembly discussion.

### 4.6.3 Host Conduct Guidelines

The host bears primary responsibility for setting the emotional tone of game night. The app provides structured guidance without being prescriptive.

**Pre-Game Onboarding — "Hosting with Care" Guide**:
- Displayed once during the host's first session creation flow (dismissible after first use)
- Available at any time from Settings (§2.9)
- Content covers:
  - **Read the room**: escalate intimacy gradually — start with light questions/scenes before deeper ones
  - **Respect passes and tap-outs**: never comment on, question, or draw attention to a player's pass or tap-out
  - **Never force a reveal or confession**: the game invites vulnerability, it never demands it
  - **Manage energy**: schedule breaks between intense phases; the app suggests break points but the host decides
  - **Know your group**: acquaintances need different question registers than lifelong friends

**Pre-Game Night Checklist**:
- Appears on the host dashboard when transitioning to ACTIVE state
- Checklist items:
  - [ ] Review all content (questions, character sheets, scenario descriptions)
  - [ ] Check question register mix (see §4.6.5)
  - [ ] Confirm all players have submitted contributions (or acknowledge missing ones)
  - [ ] Consider whether content warnings are appropriate for this group (see §4.6.4)
- Dismissible after first use per host (stored in host preferences)
- Can be re-enabled from Settings

**Post-Game Self-Assessment — "How Did It Go?"**:
- Optional prompt shown to the host after session transitions to POST_GAME
- Private reflection (never shared with players or the platform):
  - "Did everyone seem comfortable?"
  - "Were there moments that felt too intense?"
  - "Would you adjust anything for next time?"
- Responses stored locally only — not synced to server
- Purely for the host's own learning; no scoring, no judgment

### 4.6.4 Content Warnings

Hosts can preview and tag content to help players make informed choices about engagement.

**Host Preview**:
- Host can preview all content (questions, character sheets, scenario descriptions) before distributing to players
- Preview is available during pre-game setup and at any time during game night via the dashboard
- Host can remove, replace, or reorder content items during preview

**Theme Tags**:
- Content items (questions, seeds, character descriptions) carry theme metadata: `[vulnerability]`, `[mortality]`, `[family]`, `[romance]`, `[conflict]`
- Tags are assigned during content authoring (content packs) and by the content filter (LLM-generated content)
- Tags are metadata — not visible to players by default

**Content Warnings Mode**:
- Host can enable "Content Warnings" mode per session (toggle in session settings)
- When enabled: players see theme tags before engaging with a question or prompt
- Display format: a small, non-intrusive tag line below the question text (e.g., "Themes: vulnerability, family")
- Players can still pass (§4.1.2) or tap out (§4.6.2) after seeing the tags
- Content Warnings mode does not change the content — it only adds visibility

**Implementation**: Theme tags are a `string[]` field on content items (questions, seeds, character sheets). The host dashboard exposes a filter/sort by tag. Content Warnings mode is a boolean on the session configuration.

### 4.6.5 Sensitive Theme Handling

The games invite emotional depth, but the platform must help hosts calibrate that depth to their group.

**Question Register Ratings (Confession Album)**:
- Every question in the content library carries a register rating:
  - **Light**: safe for acquaintances, work colleagues, new groups ("What is your idea of earthly happiness?")
  - **Medium**: appropriate for friends, recurring groups ("What is the trait you most deplore in yourself?")
  - **Deep**: close friends, family, established trust ("What is your greatest regret?")
- Register is metadata on the question item, displayed to the host during content selection
- Players do not see the register rating

**Register Mix Warning**:
- When the host's selected question set contains a mix of registers, the dashboard displays an advisory:
  - "This set includes 3 'deep' questions alongside 5 'light' questions. Consider your group's comfort level."
- Warning is informational only — the host can proceed without changes
- Triggered when the set contains both "deep" and "light" questions with no "medium" bridge

**Murder Mystery Hard Exclusions**:
- The following themes are permanently excluded from Murder Mystery scenario generation — both in the Claude API generation prompt and in the content safety filter (§4.6.1):
  - Sexual assault as a crime mechanic
  - Suicide as a plot device
  - Child harm in any form
- These are not configurable — they are hard-coded exclusions in both the generation prompt template and the server-side filter
- Violation of these exclusions by the LLM is treated as a filter failure and triggers re-generation

**Content Pack Review**:
- All content packs (shipped or user-created) are tagged with a minimum register rating
- Content packs that include "deep" register content are flagged during import: "This pack contains questions rated 'deep'. Recommended for close friends and family."

---

# Part 5 — Technical Handoff & Appendices

## 5.1 Platform & Framework

**Recommendation** (from STRATEGY.md §Pillar 6):

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Mobile Framework | React Native + Expo | TypeScript skill leverage, mature ecosystem, OTA updates |
| Backend | Supabase | Auth, real-time, PostgreSQL, storage, edge functions |
| Artifact Generation | Node.js + Puppeteer (server-side) | Full typography control, print-ready PDFs |
| LLM Integration | Claude API (server-side) | Murder Mystery Setting Seed generation |
| Local Database | WatermelonDB or Expo SQLite | Offline-first game night |
| Push Notifications | Expo Notifications + FCM | Cross-platform push delivery |
| Deep Linking | Expo Linking + Universal Links / App Links | Invitation flow |
| State Management | Zustand or Jotai | Lightweight, TypeScript-native |
| Styling | NativeWind (Tailwind for RN) | Rapid UI development |
| PDF Viewing | react-native-pdf | In-app artifact viewing |

## 5.2 Data Model Overview

### Entity-Relationship Summary

```
User
├── id, display_name, email, auth_provider, avatar_url
├── created_at, last_active_at
└── has_many: SessionParticipation, PurchasedContent, Artifact

Session
├── id, game_type, name, date_time, state, host_id
├── config: JSON (game-specific configuration)
├── created_at, updated_at
├── belongs_to: User (host)
├── has_many: SessionParticipation, Contribution, GameNightLog, Artifact
└── has_one: GameSpecificData (polymorphic)

SessionParticipation
├── session_id, user_id (nullable for web players)
├── display_name, email (for web players)
├── role: "host" | "app_player" | "web_player"
├── rsvp_status: "pending" | "accepted" | "declined" | "maybe"
├── character_id (Murder Mystery only)
└── joined_at

Contribution
├── id, session_id, participant_id
├── type: game-specific contribution type
├── content: JSON (structured contribution data)
├── status: "draft" | "submitted" | "reviewed"
└── submitted_at

GameNightLog
├── session_id, event_type, timestamp
├── data: JSON (phase transitions, question removals, bookmarks, etc.)
└── device_id (for sync)

Artifact
├── id, session_id, type, name
├── status: "pending" | "generating" | "ready" | "delivered"
├── file_url, file_size
├── personalized_for: participant_id (null if shared)
├── scheduled_delivery: timestamp (null if immediate)
└── delivered_at

ContentPack
├── id, name, game_type, type, price_tier
├── version, description
├── items: JSON[]
└── purchased_by: User[] (junction table)

ConfessionAlbumData (game-specific)
├── question_set, player_order, chain_entries, return_entries
└── config (board_format, return_enabled, timer_enabled)

MurderMysteryData (game-specific)
├── setting_seed, characters, crime, contributions
├── game_night (act_timestamps, clues, accusations, awards)
└── sealed_envelopes
```

## 5.3 Screen Inventory

### Onboarding & Auth (4 screens)
1. Welcome / Product Introduction (3-step walkthrough)
2. Sign-Up / Sign-In
3. Email Verification
4. Profile Setup (name, optional avatar)

### Home & Navigation (3 screens)
5. Home Screen (active sessions, past sessions, create new)
6. Session List (filterable: upcoming, active, completed, archived)
7. Settings

### Session Creation — Shared (3 screens)
8. Game Type Picker
9. Session Basics (name, date, guest count)
10. Session Summary / Review

### Session Creation — Confession Album (3 screens)
11. Question Lineage Selector
12. Board Preview / Question Curation
13. Board Configuration (format, variants, player order)

### Session Creation — Murder Mystery (4 screens)
14. Setting Seed Browser (curated seeds)
15. Setting Seed Generator (4-axis selection + LLM generation)
16. Scenario Review (setting, characters, crime structure)
17. Character Customization (edit names, secrets, briefs)

### Invitation & RSVP (4 screens)
18. Invitation Composer (share link generation, message preview)
19. RSVP Dashboard (host view: who accepted/declined/pending)
20. Session Invitation (player view: game info, RSVP buttons)
21. Character Assignment (Murder Mystery: assign characters to guests)

### Contributions (4 screens)
22. Host Contribution Dashboard (matrix: who submitted what)
23. Contribution Brief (player view: what to submit)
24. Contribution Form (text input, photo upload)
25. Character Packet (Murder Mystery: character sheet, brief, prompts)

### Game Night — Shared (3 screens)
26. Game Night Launch (countdown, checklist)
27. Game Night Dashboard (ambient mode, phase controls)
28. Emergency Reference (full-screen overlay with session details)

### Game Night — Confession Album (3 screens)
29. Digital Board (question display, tap to select/remove)
30. Chain Tracker (current turn, inherit/choose state)
31. The Portrait (answer pair display for host reading)

### Game Night — Murder Mystery (3 screens)
32. Three-Act Dashboard (act progression, checklists)
33. Clue Distribution Tracker
34. Accusation / Reveal (accusation form for players, solution display for host)

### Post-Game (5 screens)
35. Artifact Generation Progress
36. Artifact Preview (PDF viewer)
37. Artifact Distribution (send to players)
38. Delayed Artifact Writing (host: Sealed Envelope / Afterword)
39. Artifact Library (personal collection of all received artifacts)

### Content Store (2 screens)
40. Store Home (browse packs by game)
41. Content Pack Detail (description, preview, purchase)

### Web Player (4 screens — mobile browser)
42. Web Join / RSVP (session invitation in browser)
43. Web Contribution Form
44. Web Artifact Download (email link landing page)
45. Web Character Packet (Murder Mystery)

**Total: ~45 screens** (+ game-specific variants for P1 games)

## 5.4 Notification Catalog

| ID | Notification | Recipient | Trigger | Timing | Channel | Copy Template |
|----|-------------|-----------|---------|--------|---------|---------------|
| N01 | Session invitation | Player | Host sends invitations | Immediate | Push + email | "You're invited to [Session Name] on [Date]. [Host Name] is hosting a [Game Name]." |
| N02 | RSVP received | Host | Player RSVPs | Immediate | Push | "[Player Name] accepted your invitation to [Session Name]." |
| N03 | RSVP declined | Host | Player declines | Immediate | Push | "[Player Name] can't make it to [Session Name]." |
| N04 | Character delivered | Player | Host assigns character | Immediate | Push | "Your character has arrived. Open to discover who you'll become." |
| N05 | Contribution reminder (3d) | Player | 3 days before deadline | Scheduled | Push | "Your contribution for [Session Name] is due in 3 days." |
| N06 | Contribution reminder (1d) | Player | 1 day before deadline | Scheduled | Push | "Tomorrow is the deadline for [Session Name]." |
| N07 | Contribution received | Host | Player submits | Batched (1/hr) | Push | "[N] new contributions received for [Session Name]." |
| N08 | Deadline passed | Host | Deadline time | Scheduled | Push | "Contribution deadline passed. [X/Y] submissions received." |
| N09 | Game night today | All | Day of game night | 10 AM | Push | "[Session Name] is tonight." |
| N10 | Phase change | Player | Host advances phase | Immediate | Push (opt-in) | "Act II has begun." |
| N11 | Artifact ready | All | Generation complete | Immediate | Push + email | "Your [Artifact Name] from [Session Name] is ready." |
| N12 | Delayed artifact | Player | Scheduled delivery | Scheduled (10 AM) | Push + email | "A letter from the past has arrived." (Proust's Answer) |
| N13 | Delayed artifact | Player | Scheduled delivery | Scheduled (10 AM) | Push + email | "A sealed envelope, addressed to you." (Sealed Envelope) |
| N14 | Writing prompt | Host | 2 days post-game | Scheduled | Push | "Time to write your players' epilogues for [Session Name]." |
| N15 | Session canceled | All | Host cancels | Immediate | Push + email | "[Session Name] has been canceled by [Host Name]." |
| N16 | Manual reminder | Player | Host sends manually | Immediate | Push | "[Host Name]: [Custom message or default reminder]" |

## 5.5 Artifact Catalog

| ID | Game | Artifact | Trigger | Format | Pages | Template | Delivery | Personalized |
|----|------|----------|---------|--------|-------|----------|----------|-------------|
| A01 | Confession Album | The Album | Host triggers post-game | PDF (A5) | Cover + N questions + colophon | Victorian confession album | Immediate | No (shared) |
| A02 | Confession Album | Contributions Table | Auto with A01 | PDF (1 page, within A01) | 1 | Table/list | Immediate | No (shared) |
| A03 | Confession Album | Proust's Answer | Scheduled (7d) | PDF (letter) | 1 per question answered | Personal letter | Delayed | Yes (per player) |
| A04 | Murder Mystery | The Dossier | Host triggers post-game | PDF (A5) | 4–8 | Case file / noir broadsheet | Immediate | No (shared) |
| A05 | Murder Mystery | Menu of the Damned | Auto with A04 | PDF (landscape) | 2–4 | Period menu / recipe cards | Immediate | No (shared) |
| A06 | Murder Mystery | Society Page Photo | Player triggers camera | Image (composited) | 1 | Period photo overlay | Immediate | No (shared) |
| A07 | Murder Mystery | The Sealed Envelope | Scheduled (7d) | PDF (letter) | 1 | Era-voice personal letter | Delayed | Yes (per player) |
| A08 | Whose Memory? | The Anthology | Host triggers post-game | PDF (booklet) | Cover + N stories + guess map | Zine / handmade booklet | Immediate | No (shared) |
| A09 | Whose Memory? | The Guess Map | Auto with A08 | PDF (1 page, within A08) | 1 | Infographic / matrix | Immediate | No (shared) |
| A10 | Whose Memory? | The Afterword | Scheduled (7d) | PDF (letter) | 1–2 | Host's reflection | Delayed | No (shared) |
| A11 | Whose Memory? | The Prompt That Never Was | Scheduled (7d) | PDF (card) | 1 | Single-prompt card | Delayed | No (shared) |
| A12 | Exquisite Corpse | The Chapbook | Host triggers post-game | PDF (booklet) | Cover + texts + appendices + colophon | Literary magazine / zine | Immediate | No (shared) |
| A13 | Exquisite Corpse | The Fragment Census | Auto with A12 | PDF (list) | 2–4 | Attribution list | Immediate | No (shared) |
| A14 | Exquisite Corpse | The Fragment That Got Away | Scheduled (7d) | PDF (card) | 1 | Single-fragment card | Delayed | Yes (per player) |
| A15 | Exquisite Corpse | The Constraint Echo | Scheduled (7d) | PDF (card) | 1 | Single-prompt card | Delayed | No (shared) |

## 5.6 Content Pack Specification

### Pack Structure

```yaml
# content-pack.yaml — canonical format for all content packs

schema_version: "1.0"

metadata:
  id: "pack-unique-id"
  name: "Human-Readable Pack Name"
  version: "1.0.0"
  game: "confession-album" | "murder-mystery" | "whose-memory" | "exquisite-corpse"
  type: "question-lineage" | "setting-seed" | "era-packet" | "theme" | "template" | "game-unlock"
  price_tier: "free" | "standard" | "premium"  # maps to price range
  description: "Short description for store listing (max 200 chars)"
  long_description: "Full description with markdown formatting"
  preview_items: 3  # number of items visible before purchase
  author: "Ephemera Engine"  # or contributor name for future UGC
  tags: ["mortality", "deep", "philosophical"]
  min_app_version: "1.0.0"  # minimum app version required
  locale: "en"  # content language (future: localized variants)

versioning:
  # Content pack version management
  # - Pack updates delivered via app update or background download
  # - Items have stable IDs; updated items keep their ID with bumped version
  # - Sessions reference item IDs at time of creation (snapshot)
  # - Post-purchase updates are free within the same major version
  # - Major version bumps (2.0) may require re-purchase (future UGC packs)
  update_strategy: "additive"  # "additive" (new items only) | "replace" (full pack replace)
  changelog: "Description of changes in this version"

content:
  items:
    - id: "item-unique-id"
      type: "question" | "seed" | "era" | "theme" | "template" | "character" | "mechanic"
      # Type-specific fields follow...
```

### Type-Specific Fields

**Question** (Confession Album):
```yaml
- id: "ca-mort-001"
  type: "question"
  text: "What do you want said at your funeral that probably won't be true?"
  lineage: "thematic-remix"
  register: "deep"
  domain: "mortality"
  proust_adjacent: "What is your idea of perfect happiness?"
  proust_response_1886: "To live close to all those I love..."
  proust_response_1892: null
```

**Setting Seed** (Murder Mystery):
```yaml
- id: "mm-jazz-001"
  type: "seed"
  name: "The Vanished Score"
  era: "1928"
  location: "Manhattan penthouse"
  milieu: "Jazz musicians and Harlem Renaissance intellectuals"
  tension: "A composer's final manuscript has disappeared"
  setting_description: "Full narrative description..."
  characters:
    - name: "Clarence Beaumont"
      occupation: "Club owner"
      # ... full character data
  crime:
    victim: "character-id"
    murderer: "character-id"
    weapon: "Poisoned gin"
    motive: "The manuscript names names"
    red_herrings: [...]
    timeline: [...]
```

**Era Packet** (Murder Mystery):
```yaml
- id: "era-victorian-001"
  type: "era"
  name: "Late Victorian (1880–1900)"
  period: { start: 1880, end: 1900 }
  details:
    slang: ["Capital!", "Beastly", "Quite so"]
    fashion: "Bustles giving way to S-bend corsets..."
    technology: "Gas lighting, telegraph, early telephone..."
    social_norms: "Strict class boundaries, elaborate mourning customs..."
    music: "Gilbert and Sullivan, music halls, salon piano..."
```

### Validation Rules
- All `id` fields globally unique
- `text` fields non-empty, max 500 characters (questions), max 5000 (descriptions)
- `register` values: "light", "medium", "deep"
- `lineage` values: "classic-proust", "vanity-fair", "pivot-lipton", "thematic-remix"
- Setting seeds must include at least 6 characters and a complete crime structure
- Version follows semver

## 5.7 Open Questions

Decisions deferred to the technical architecture phase:

| # | Question | Context | Options |
|---|----------|---------|---------|
| 1 | **Real-time sync protocol** | Do player devices need real-time updates during game night, or is the host device the single source? | A) Host-only (simplest, matches "screen dark"); B) Supabase Realtime for optional player sync |
| 2 | **Artifact template engine** | Should artifact templates be authored as HTML/CSS (Puppeteer) or as React components (react-pdf)? | A) HTML/CSS + Puppeteer (more design flexibility); B) React-pdf (JS-native, but limited CSS) |
| 3 | **Offline database** | WatermelonDB vs Expo SQLite vs MMKV for local-first game night data? | WatermelonDB (reactive, sync-built-in) vs SQLite (simpler, proven) vs MMKV (key-value, fastest) |
| 4 | **Content delivery for packs** | Bundle content packs in the app binary, or download on purchase? | A) In-binary (faster, larger app); B) On-demand download (smaller app, requires connectivity) |
| 5 | **Web player technology** | Static HTML pages or lightweight React SPA for the web join experience? | A) Static (fastest, simplest); B) React SPA (richer UX, more maintenance) |
| 6 | **LLM generation caching** | Cache LLM-generated setting seeds for reuse, or generate fresh each time? | A) Cache with similarity detection; B) Always fresh (higher cost, guaranteed uniqueness) |
| 7 | **Artifact versioning** | ~~Can hosts regenerate artifacts after initial generation?~~ **RESOLVED**: One re-generation within 24 hours, then locked. See spec 006 plan.md. | Decision: B (limited regeneration) |
| 8 | **Multi-device host support** | ~~Can the host use a tablet + phone simultaneously?~~ **RESOLVED**: V1 is single-device only. V2 may explore local peer-to-peer. See §4.1.7. | Decision: A (V1), B (V2 consideration) |
| 9 | **Player contribution encryption** | End-to-end encrypt contributions, or rely on server-side access controls? | A) E2E encryption (strongest privacy, complex key management); B) Server-side ACLs (simpler) |
| 10 | **Internationalization architecture** | Prepare i18n infrastructure in V1 (even though content is English-only)? | A) Yes (string extraction, locale support); B) No (defer to V2) |

---

# Appendix: Design Traceability Matrix

Mapping between DESIGN.md sections and PRD features to ensure complete coverage.

## DESIGN.md §I — Series Framework

| Design Concept | PRD Section | Coverage |
|---------------|-------------|----------|
| Three-Phase Structure | §0.3 Glossary (Phase), §2.2.2 Session States, all §3.x | Full |
| Replayability Trinity (Procedural, Curated, Player-Driven) | §2.8 Content Library, §3.2.1 Setting Seed, §2.4 Contribution Pipeline | Full |
| Ephemera over permanence | §2.7 Artifact Generation, §4.2 Privacy | Full |
| Preparation is play | §2.4 Contribution Pipeline, all §3.x Pre-Game | Full |
| No spectators | §3.x Game Night features, §4.1 Accessibility (pass mechanics) | Full |
| Analog warmth, digital scaffolding | §2.6 Game Night Dashboard, §4.3 Offline | Full |
| The host is a player | §1.1 Persona 1, §2.6 Dashboard, §3.x Host features | Full |

## DESIGN.md §II — Murder Mystery

| Design Concept | PRD Section |
|---------------|-------------|
| Setting Seed (4 axes) | §3.2.1 |
| Role Assignment Packet | §3.2.2 |
| Contribution Brief (food, dress, prop) | §3.2.2 |
| Preparation Prompts | §3.2.2 |
| Act I — Arrival | §3.2.3 |
| Act II — The Crime (clues, interrogation) | §3.2.3 |
| Act III — Accusation & Reveal | §3.2.3, §3.2.4 |
| Awards | §3.2.3 |
| The Dossier | §3.2.5 |
| Menu of the Damned | §3.2.6 |
| The Society Page | §3.2.7 |
| The Sealed Envelope | §3.2.8 |
| Replayability mechanisms | §2.8 Content Library, §3.2.1 |

## DESIGN.md §III — Whose Memory?

| Design Concept | PRD Section |
|---------------|-------------|
| Theme selection | §3.3.1 |
| Story submission | §3.3.2 |
| Reading formats | §3.3.3 |
| Guessing mechanic | §3.3.3 |
| The Anthology | §3.3.4 |
| The Guess Map | §3.3.4 |
| The Afterword | §3.3.4 |
| The Prompt That Never Was | §3.3.4 |

## DESIGN.md §IV — The Confession Album

| Design Concept | PRD Section |
|---------------|-------------|
| Question lineage selection | §3.1.1 |
| The Board (physical/digital) | §3.1.2, §3.1.5 |
| Contribution archetype | §3.1.3 |
| Player order | §3.1.4 |
| The Chain mechanic | §3.1.6 |
| The Return variant | §3.1.7 |
| The Portrait | §3.1.8 |
| The Album artifact | §3.1.9 |
| Contributions Table | §3.1.10 |
| Proust's Answer | §3.1.11 |

## DESIGN.md §V — The Exquisite Corpse

| Design Concept | PRD Section |
|---------------|-------------|
| Fragment submission | §3.4.1 |
| Four-round structure | §3.4.2 |
| The Chapbook | §3.4.3 |
| The Fragment Census | §3.4.3 |
| The Fragment That Got Away | §3.4.3 |
| The Constraint Echo | §3.4.3 |

---

*PRD compiled for the Ephemera Engine. The path from here to a shipping app begins with the technical architecture document.*
