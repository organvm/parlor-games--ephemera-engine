# Quickstart: Murder Mystery Game Module

**Spec**: 004-murder-mystery | **Date**: 2026-02-23

Key validation scenarios that prove the spec works end-to-end. Each scenario is independently runnable and verifiable.

---

## Scenario 1: Generate a Setting Seed via Claude API

**Purpose**: Validate the core generation pipeline from user input to complete scenario.

### Steps

1. Create a Murder Mystery session (requires spec 001 auth + session CRUD)
2. Navigate to Setting Seed Generator screen
3. Select:
   - Era: "1928"
   - Location: "Manhattan penthouse"
   - Milieu: "Jazz musicians"
   - Tension: "A composer's manuscript has vanished"
4. Tap "Generate"

### Expected Result

- Loading indicator appears
- Within 15 seconds, a complete scenario is returned:
  - Setting description (2–3 paragraphs, era-appropriate)
  - 7 characters (for 6 players + 1 victim/player overlap)
  - Crime structure with victim, murderer, weapon, motive
  - 2–3 red herrings linked to specific characters
  - 4–6 timeline events across three acts
  - 7 clues with types and discovery attributions
- No internal contradictions (victim is not the murderer, all character IDs referenced in crime exist in roster, relationships reference valid characters)
- Tapping "Regenerate" produces a different scenario within 15 seconds

### Validation Checks

- [ ] Generation completes in <15 seconds
- [ ] JSON response conforms to `GenerateSeedResponse` schema
- [ ] Server-side validation passes (no contradictions)
- [ ] Seed is saved to session.config when confirmed
- [ ] Generation is logged in `seed_generation_log`

---

## Scenario 2: Character Packet Delivery Flow

**Purpose**: Validate character assignment and delivery to both app and web players.

### Steps

1. Create a session with a confirmed seed and 6 RSVPed guests (4 app players, 2 web players)
2. Navigate to Character Assignment screen
3. Use auto-assign mode
4. Review assignments
5. Tap "Deliver Character Packets"

### Expected Result

- 4 app players receive push notifications: "Your character has arrived"
- 2 web players receive emails with links to web character packet pages
- Each player's packet contains:
  - Character sheet (name, occupation, personality, secret, relationship)
  - Contribution brief (food, dress, prop suggestions)
  - 2–3 preparation prompts
- Host dashboard shows delivery status per guest (sent/pending/failed)
- Players can view their packet offline after initial load

### Validation Checks

- [ ] All 6 packets delivered (4 push + 2 email)
- [ ] Each packet contains all required sections
- [ ] No player sees another player's secret
- [ ] Relationship descriptions use character roles, not player names
- [ ] Packet is cached locally for offline access
- [ ] Preparation prompt submission is tracked on host dashboard

---

## Scenario 3: Offline Game Night Dashboard

**Purpose**: Validate that the entire game night runs without network connectivity.

### Steps

1. Have a session in PREPARING state with all data populated
2. Turn on airplane mode on the host device
3. Tap "Start Game Night"
4. Walk through all three acts:
   - Act I: Check off 3 character introductions
   - Act II: Distribute 4 clues, trigger 1 evidence reveal
   - Act III: Trigger accusations, trigger reveal
5. Turn off airplane mode
6. Verify data syncs

### Expected Result

- Dashboard launches in ambient mode (dark, warm, large touch targets)
- Screen does not auto-sleep (wake lock active)
- All phase transitions work without error
- Clue checklist updates locally
- Emergency reference shows all session data
- After reconnecting: all timestamps, clue distributions, and evidence reveals sync to Supabase

### Validation Checks

- [ ] Dashboard loads in <1 second from local data
- [ ] All 3 act transitions succeed offline
- [ ] Clue distribution checkboxes persist across app backgrounding
- [ ] Emergency reference shows complete data (characters, secrets, solution, clues)
- [ ] Phase timestamps logged locally
- [ ] Data syncs to Supabase within 30 seconds of reconnection
- [ ] No data loss during the offline period

---

## Scenario 4: Digital Accusation and Awards Voting

**Purpose**: Validate player-facing game night interactions.

### Steps

1. Host activates accusation phase (Act III)
2. On a player device (app player):
   - Open the accusation form
   - Select accused character from dropdown
   - Enter method: "Poisoned the wine during the toast"
   - Enter motive: "To silence the only witness"
   - Submit
3. On the host dashboard: verify submission count increments
4. Host triggers awards voting
5. On a player device: vote in all 5 categories
6. On the host dashboard: view results

### Expected Result

- Accusation form loads with character list
- Submission confirms with "Accusation sealed" feedback
- Host sees "3/6 submitted" (not content)
- After reveal: host can view all accusations
- Awards voting shows 5 categories with nominee list (excludes self)
- Results tallied correctly

### Validation Checks

- [ ] Accusation form works offline (saved locally)
- [ ] Accusation is sealed — not visible to host until reveal trigger
- [ ] Host dashboard shows count, not content, before reveal
- [ ] Player cannot vote for themselves
- [ ] Award results sum correctly
- [ ] All data syncs post-game

---

## Scenario 5: Artifact Generation — The Dossier

**Purpose**: Validate the primary artifact from session data to beautiful PDF.

### Steps

1. Complete a Murder Mystery session with:
   - 6 characters, 7 clues, 6 accusations, reveal data
   - Awards voted
2. Session moves to COMPLETE state
3. Host taps "Generate Artifacts"
4. Wait for generation

### Expected Result

- The Dossier PDF generated in <30 seconds
- PDF is A5 portrait, 4–8 pages
- Contains:
  - Cover with case number, title, date, location
  - Cast of Characters with initials, names, bios
  - Crime Scene Summary
  - Evidence Log with exhibit labels
  - Accusations section
  - The Reveal with culprit and explanation
  - Vote tally
  - Appendix: Clue Cards
- Typography: JetBrains Mono headers, Lora body
- Noir visual theme (dark background, red accents)
- PDF file size <5MB

### Validation Checks

- [ ] Generation completes in <30 seconds
- [ ] PDF renders with correct fonts (no font substitution)
- [ ] All 6 characters present in Cast
- [ ] All 7 clues present in Evidence Log
- [ ] All submitted accusations present
- [ ] Reveal section shows correct culprit
- [ ] PDF file size <5MB
- [ ] Data matches the fixture shape at `artifacts/fixtures/murder-mystery.json`

---

## Scenario 6: The Sealed Envelope — Delayed Delivery

**Purpose**: Validate the delayed artifact lifecycle from host writing to scheduled delivery.

### Steps

1. Complete a session (COMPLETE state)
2. Wait 2 days (or simulate with clock manipulation)
3. Host receives "Time to write epilogues" notification
4. Host writes epilogues for all 6 characters
5. Host saves
6. Wait until scheduled delivery (7 days post-game or simulated)
7. Verify delivery to each player

### Expected Result

- Writing prompts are specific to each character's narrative arc
- Each epilogue is 2–4 sentences
- Total writing time <20 minutes for all characters
- On delivery date at 10 AM local time:
  - Each app player receives push: "A sealed envelope, addressed to you."
  - Each web player receives email with PDF attachment
  - Each player receives ONLY their own character's epilogue
- PDF is single-page personal letter with era-appropriate voice

### Validation Checks

- [ ] Writing prompt notification fires at 2 days post-game
- [ ] Each character has a unique narrative prompt
- [ ] Epilogues save correctly
- [ ] Delivery scheduled for correct date
- [ ] Each player receives only their own epilogue (no cross-contamination)
- [ ] PDF uses personal-letter theme (aged texture, wax seal)
- [ ] If host doesn't write: weekly reminders sent, delivery postponed
