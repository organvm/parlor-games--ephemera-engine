# Requirements Checklist: Murder Mystery Game Module

**Spec**: 004-murder-mystery | **Date**: 2026-02-23

Map of each functional requirement to implementation status. All start unchecked.

---

## Setting Seed Generation

- [ ] **FR-101** — System shall provide a curated seed browser with 5+ pre-authored Murder Mystery scenarios bundled in V1
- [ ] **FR-102** — System shall support LLM-based scenario generation via Claude API (server-side only) from four axes: Era, Location, Social Milieu, Central Tension
- [ ] **FR-103** — Generated scenarios shall include: setting description, character roster, relationship web, crime structure, 2–3 red herrings, and 4–6 timeline beats
- [ ] **FR-104** — LLM generation shall complete in <15 seconds
- [ ] **FR-105** — Host shall be able to regenerate scenarios unlimited times during configuration
- [ ] **FR-106** — Host shall be able to manually edit any field of a generated or curated scenario
- [ ] **FR-107** — System shall support "Full Random" generation where all axes are selected randomly
- [ ] **FR-108** — Generated content shall not repeat across sessions (sufficient randomness in prompts)
- [ ] **FR-109** — Setting seed source shall be recorded: "curated", "generated", or "random"

## Character Management

- [ ] **FR-110** — Character packets shall contain: character sheet, contribution brief, and 2–3 preparation prompts
- [ ] **FR-111** — Character assignment shall support auto-assign, manual drag-and-drop, and preference-based modes
- [ ] **FR-112** — Character packets shall be delivered via themed "sealed envelope" UI with progressive reveal
- [ ] **FR-113** — All character information shall be accessible offline after initial load
- [ ] **FR-114** — Preparation prompt answers shall be tracked as contributions on the host dashboard
- [ ] **FR-115** — The murderer's packet shall be configurable: full knowledge or partial knowledge
- [ ] **FR-116** — Web players shall receive character packets via email link to a web page with identical content

## Game Night Dashboard

- [ ] **FR-117** — Dashboard shall display three acts: Act I (Arrival), Act II (The Crime), Act III (Accusation & Reveal)
- [ ] **FR-118** — Dashboard shall launch in ambient mode: dark background, warm accents, large touch targets (>=48dp), screen wake lock
- [ ] **FR-119** — Act I shall include: character introduction checklist, player roster, "Begin Act II" button
- [ ] **FR-120** — Act II shall include: crime trigger, clue distribution tracker, knowledge reminders, optional timer, "New Evidence" button
- [ ] **FR-121** — Act III shall include: accusation activation, submission count, "The Reveal" button, optional awards voting
- [ ] **FR-122** — All phase transitions shall require confirmation to prevent accidental advances
- [ ] **FR-123** — Phase transitions shall be logged with timestamps for artifact data
- [ ] **FR-124** — Dashboard shall operate entirely from local data (no network required)
- [ ] **FR-125** — Host shall be able to skip checklists and run informally if preferred
- [ ] **FR-126** — Emergency Reference overlay shall provide full session data in read-only mode

## Accusation & Voting

- [ ] **FR-127** — App players shall be able to submit digital accusations: who, how, why
- [ ] **FR-128** — Accusations shall be sealed until the host triggers the reveal
- [ ] **FR-129** — Accusation submission shall be optional
- [ ] **FR-130** — Accusation form shall work offline and sync when connectivity resumes
- [ ] **FR-131** — Awards voting shall support 5 categories: Best Performance, Most Convincing Liar, Best Cocktail, Best Dressed, Closest to the Truth
- [ ] **FR-132** — Players shall not be able to vote for themselves in any award category
- [ ] **FR-133** — Awards results shall be tallied and displayed on the host dashboard

## Artifacts

- [ ] **FR-134** — The Dossier (A04) shall be generated as PDF (A5 portrait, 4–8 pages, noir theme) with all required sections
- [ ] **FR-135** — The Dossier voice shall match the era/setting of the session
- [ ] **FR-136** — Menu of the Damned (A05) shall be auto-generated alongside The Dossier as a landscape PDF with recipe card layout
- [ ] **FR-137** — Menu shall include all submitted food/drink contributions with character attribution
- [ ] **FR-138** — Society Page Photo (A06) shall provide a camera overlay with era-specific frame and character captions
- [ ] **FR-139** — The Sealed Envelope (A07) shall deliver personalized character epilogues as single-page PDF letters
- [ ] **FR-140** — Sealed Envelope delivery shall be scheduled 7 days after game night (configurable 3–14 days) at 10 AM local time
- [ ] **FR-141** — Host shall receive epilogue writing prompts 2 days after game night
- [ ] **FR-142** — Artifact generation shall complete in <30 seconds per artifact
- [ ] **FR-143** — All artifact PDFs shall be <5MB, 300 DPI, with correct web fonts
- [ ] **FR-144** — Artifacts shall be distributed via push notification (app) and email with PDF attachment (web)

---

## Constitution Compliance

### Simplicity Gate

- [ ] Total server-side services ≤3 (uses 2: generate-seed, render-artifact)
- [ ] No speculative features (Society Page deferred to P1)
- [ ] Framework primitives used directly
- [ ] No premature abstractions
- [ ] Single database schema (JSONB in sessions.config)

### Offline Gate

- [ ] All game night features work without network
- [ ] Local DB holds complete session state during ACTIVE
- [ ] No network requests during game night
- [ ] Sync is eventual and non-blocking
- [ ] Dashboard operates from local data

### Privacy Gate

- [ ] No data leaves session boundary
- [ ] No cross-session data sharing
- [ ] No public profiles or social features
- [ ] Player contributions scoped to session participants
- [ ] Minimal data retention enforced (90 days)

### Analog Gate

- [ ] No feature replaces in-room interaction
- [ ] Game night UI is ambient and glanceable
- [ ] Screen-dark principle respected
- [ ] All player interactions happen in the room
- [ ] Timer is optional, never forced

---

## Summary

| Category | Total | Implemented | Remaining |
|----------|-------|-------------|-----------|
| Setting Seed Generation | 9 | 0 | 9 |
| Character Management | 7 | 0 | 7 |
| Game Night Dashboard | 10 | 0 | 10 |
| Accusation & Voting | 7 | 0 | 7 |
| Artifacts | 11 | 0 | 11 |
| Constitution Gates | 20 | 0 | 20 |
| **Total** | **64** | **0** | **64** |
