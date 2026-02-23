# Quickstart: 003-confession-album

**Spec**: [spec.md](./spec.md)
**Last Updated**: 2026-02-23

Key validation scenarios to confirm the Confession Album module works correctly. Each scenario is a focused integration test that validates one critical path.

---

## Scenario 1: Full Question Set Curation

**Purpose**: Validate that a host can curate a complete question set from the content library.

**Steps**:
1. Create a new session with game_type = "confession-album" and guest_count = 8.
2. On the Question Lineage Selector, tap "Classic Proust."
3. Verify the Board Preview shows 35 questions, all with lineage = "classic-proust."
4. Verify the target count banner reads "Suggested: 13 questions (8 guests + 5)."
5. Tap 22 questions to deselect them. Verify the count reads "13 selected."
6. Tap "Add from other lineages." Search for "happiness." Verify results from Thematic Remix appear.
7. Add 2 Thematic Remix questions. Verify count reads "15 selected" and a warning appears ("More than 18 -- consider removing some").
8. Remove 2 more Classic Proust questions. Count should read "13 selected," warning dismissed.
9. Long-press and drag the first question to position 5. Verify board_position values update.
10. Confirm the question set. Verify all 13 QuestionItems are written to the database with correct lineage, register, domain, and board_position values.

**Expected Result**: 13 questions from mixed lineages saved to the session with correct metadata and ordering.

---

## Scenario 2: Chain Mechanic -- Full Game Night

**Purpose**: Validate the chain mechanic from first turn to board empty, including undo and bookmark.

**Preconditions**: Session with 5 players and 10 questions. Player order set. Session in ACTIVE state.

**Steps**:
1. Host opens Game Night Dashboard. Verify the digital board displays 10 questions and the turn order bar shows all 5 players. First player is highlighted.
2. **Host warm-up**: Host selects question Q1 on the board and taps "Remove." Verify Q1 animates out. Count reads "9 remaining."
3. **Turn 1 (Player A)**: Dashboard shows "INHERIT: none (first player)." Player A selects Q3 from the board. Host taps Q3, then taps "Remove." ChainEntry written: turn_number=1, player_id=A, inherited_question_id=null, chosen_question_id=Q3. Count reads "8 remaining."
4. **Turn 2 (Player B)**: Dashboard shows "INHERIT: Answer Player A's question: Q3." Player B answers Q3 verbally. Host taps board question Q7. Host taps "Remove." ChainEntry: turn_number=2, inherited_question_id=Q3, chosen_question_id=Q7. Host taps bookmark icon. Verify bookmarked=true.
5. **Undo test**: Host taps "Undo" within 10 seconds. Verify Q7 reappears on the board. ChainEntry for turn 2 is deleted. Count returns to "8 remaining." Host re-selects Q7 and removes it. New ChainEntry created.
6. Continue turns 3-5. After turn 5, the board should have 4 remaining questions.
7. Continue until board is empty. Verify the dashboard shows "Board Empty -- Begin The Portrait."
8. Verify all ChainEntries are persisted in local SQLite with correct turn_number, player_id, inherited_question_id, chosen_question_id, and bookmarked values.

**Expected Result**: 10 ChainEntries (including host warm-up if tracked separately), all correctly chained, with at least one bookmarked entry.

---

## Scenario 3: Offline Game Night Resilience

**Purpose**: Validate that game night operates fully offline and state survives app lifecycle events.

**Preconditions**: Session in ACTIVE state. All session data pre-cached to local SQLite.

**Steps**:
1. Enable airplane mode on the host device.
2. Open Game Night Dashboard. Verify all questions load from local database.
3. Complete 3 turns of the chain. Verify ChainEntries are written locally.
4. Force-quit the app (swipe away from app switcher).
5. Relaunch the app. Verify "Resume Game Night" option appears.
6. Tap "Resume." Verify the dashboard shows the board with 3 questions removed and the chain at turn 4. All previous entries intact.
7. Complete the remaining turns.
8. End game night. Session transitions to COMPLETE (stored locally).
9. Disable airplane mode. Verify sync runs: all ChainEntries and question status changes are pushed to Supabase.

**Expected Result**: Zero data loss across app lifecycle events while offline. Clean sync on reconnect.

---

## Scenario 4: The Album Artifact Generation

**Purpose**: Validate that The Album PDF is correctly generated from chain data.

**Preconditions**: Session in COMPLETE state with 10 ChainEntries, 5 contributions, and synced to server.

**Steps**:
1. Host taps "Generate Artifacts." Confirm dialog appears.
2. On confirm, generation progress screen appears with status "Generating..."
3. Wait for generation to complete (< 30 seconds). Verify artifact status transitions: pending -> generating -> ready.
4. Host previews The Album in-app.
5. Verify PDF structure:
   - Cover page: "The Confession Album", session title, date, host name, location.
   - Table of contents: all 10 questions listed.
   - 10 question pages: each shows question text, chooser name + answer, inheritor name + answer. Bookmarked entries have gold accent.
   - Contributions Table page: 5 rows with player name, archetype label, description.
   - Colophon: date, names, lineage, engine attribution.
6. Verify PDF file size < 5 MB.
7. Host distributes. Verify app players receive push notification. Verify web players receive email with PDF.

**Expected Result**: Print-quality PDF with all pairings correctly attributed and visually consistent with the existing the-album.njk template design.

---

## Scenario 5: Proust's Answer Delayed Delivery

**Purpose**: Validate per-player personalized letter generation and scheduled delivery.

**Preconditions**: Session in COMPLETE state. Game night was 7 days ago. Player "Suki" answered 2 questions: Q1 (Classic Proust, has proust_response_1886) and Q5 (Vanity Fair, no Proust response, has proust_adjacent).

**Steps**:
1. Verify the scheduled job triggers on the 7-day mark.
2. For Suki's Q1 letter:
   - Verify the PDF contains: "Dear Suki," greeting.
   - Verify the question text: "What is your idea of perfect happiness?"
   - Verify "Your Answer" section contains Suki's actual answer text.
   - Verify "Proust's Answer" section contains the proust_response_1886 text.
   - Verify the postscript contains the question's lineage_context.
3. For Suki's Q5 letter:
   - Verify the bridge text: "Proust was never asked your question. But he was asked something adjacent..."
   - Verify the adjacent Proust answer is correct (from proust_adjacent_question_id mapping).
4. Verify Suki receives a push notification at 10 AM local: "A letter from the past has arrived."
5. Verify Suki can view both letters in the artifact library.
6. Verify a web player receives the letters via email attachment.

**Expected Result**: Personalized letters with correct Proust pairings, delivered on schedule via the correct channel.

---

## Scenario 6: Contribution Archetype Assignment

**Purpose**: Validate auto-assign distributes archetypes evenly and submissions flow correctly.

**Steps**:
1. Create a session with 8 guests. Set archetype_assignment = "auto-assign."
2. Trigger auto-assignment. Verify:
   - All 8 guests receive exactly one archetype.
   - Distribution: ceil(8/5) = 2 max per archetype. So 3 archetypes have 2 guests, 2 archetypes have 1 guest. Total: 8.
3. Player A views their Contribution Brief. Verify they see their archetype label and evocative instruction.
4. Player A submits description: "A thermos of my grandmother's Turkish coffee."
5. Verify the contribution record updates: submitted=true, description filled.
6. Host views the contribution dashboard. Verify Player A's submission appears.
7. Player B does not submit. Verify the Contributions Table artifact shows Player B's archetype but no description.

**Expected Result**: Even distribution, clear instructions, graceful handling of missing submissions.

---

## Scenario 7: Player Order and Edge Cases

**Purpose**: Validate player order configuration and mid-game adjustments.

**Steps**:
1. Create a session with 6 players. Set player_order mode = "random."
2. Verify the host is NOT in the generated order.
3. Switch to mode = "manual." Drag Player C to position 1. Verify the order updates.
4. Start game night. Verify the turn order bar matches the manual order.
5. After turn 2, tap "Add Late Arrival" (Player G, no archetype).
6. Verify Player G is appended to the end of the player order.
7. Continue turns until Player G's turn. Verify the chain mechanic works normally for the late addition.
8. Verify Player G does not appear in the Contributions Table (no archetype).

**Expected Result**: Flexible player order with graceful late-arrival handling.
