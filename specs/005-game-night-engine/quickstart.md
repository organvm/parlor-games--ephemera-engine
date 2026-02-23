# 005 — Quickstart: Key Validation Scenarios

Critical scenarios to validate before considering the game night engine implementation complete. Each scenario maps to acceptance criteria in `spec.md` and should be testable with the defined stack (Vitest for unit/integration, Maestro/Detox for E2E).

---

## Scenario 1: Offline Game Night — Full Walk-Through

**Goal**: Verify that a complete game night works with zero network connectivity, from dashboard launch to session completion.

**Steps**:
1. As host, create a Confession Album session with 6 players and walk it to PREPARING state (online)
2. Tap "Start Game Night" — verify session data pre-cached to local SQLite
3. **Enable airplane mode on the device**
4. Verify: dashboard launches in ambient mode (dark background, warm accents, large touch)
5. Verify: wake lock active (screen does not auto-sleep)
6. Verify: brightness reduced (compare to normal brightness)
7. Verify: NO network error messages, NO loading spinners, NO connectivity warnings
8. Advance through all phases:
   - Act I: "The Board & The Tradition"
   - Act II: "The Chain" — advance several player turns
   - Act III: "The Portrait"
9. During Act II: skip one player, have one player pass
10. Verify: all actions logged locally (check SQLite directly or via debug screen)
11. Tap "End Game Night" — session transitions to COMPLETE
12. Verify: sync queue has pending entries
13. **Disable airplane mode**
14. Verify: sync begins in background, data pushed to server
15. Verify: server has complete game_night_logs and game_night_summary

**Validates**: US-001, US-002, US-005, US-007, US-008; FR-001 through FR-008, FR-027 through FR-036

**Test type**: E2E (Maestro) with airplane mode toggling

---

## Scenario 2: Host Disconnect Recovery

**Goal**: Verify that a host's device crash during game night can be recovered from with minimal data loss.

**Steps**:
1. Start a game night (session in ACTIVE state)
2. Advance through 2 phases, skip 1 player, add 1 timer
3. Wait for auto-save (30 seconds)
4. Force-kill the app (simulate crash)
5. Relaunch the app
6. Verify: app detects ACTIVE session, shows "Resume Game Night" prompt
7. Tap "Resume Game Night"
8. Verify: dashboard resumes from auto-saved state:
   - Correct phase (phase 2, not phase 0)
   - Correct player turn position
   - Skipped player still marked
   - Timer state preserved (or cleared — both acceptable after crash)
9. Verify: can continue progressing through remaining phases
10. Verify: any actions from the ~30 seconds before crash may be lost (acceptable)

**Validates**: US-005 (Scenario 5c), edge case 5.1, FR-030, FR-031

**Test type**: E2E (Maestro with app restart)

---

## Scenario 3: Phase Progression with Undo

**Goal**: Walk through all phase transitions, verify confirmations, and test the 30-second undo window.

**Steps**:
1. Launch game night dashboard
2. Verify: phase 0 is current ("The Board & The Tradition" for Confession Album)
3. Tap "Next Phase"
4. Verify: confirmation dialog shows "Ready to move to Act II: The Chain?"
5. Cancel — verify: phase unchanged
6. Tap "Next Phase" again, confirm
7. Verify: phase transitions to 1 with animation (<500ms)
8. Verify: undo indicator appears
9. Tap "Undo" within 30 seconds
10. Verify: phase reverts to 0
11. Advance again (confirm) — verify: undo indicator appears
12. Wait 31 seconds
13. Verify: undo indicator disappears, cannot undo
14. Continue advancing through all remaining phases
15. Verify: phase history shows checkmarks for completed phases
16. On final phase: verify "End Game Night" is the only forward action

**Validates**: US-002 (all scenarios), FR-009 through FR-014

**Test type**: E2E (Maestro)

---

## Scenario 4: Sync on Reconnect

**Goal**: Verify that game night data syncs correctly when connectivity resumes after an offline session.

**Steps**:
1. Start game night in airplane mode (fully offline)
2. Play through 3 phases with various actions (turns, skips, timer events)
3. End game night (ACTIVE -> COMPLETE)
4. Verify: sync queue has entries in "pending" status
5. Verify: no sync attempted (airplane mode still on)
6. Disable airplane mode
7. Verify: sync engine activates, processes queue entries
8. Verify: each entry transitions through pending -> in_progress -> completed
9. Query server: verify game_night_logs table has all events
10. Query server: verify game_night_summaries has correct aggregated data
11. Verify: sync queue entries are now "completed"
12. Check artifact pipeline can read the synced data (query the endpoints)

**Validates**: US-008 (all scenarios), FR-032 through FR-036

**Test type**: Integration (Vitest with Supabase local + network simulation)

---

## Scenario 5: Timer Behavior

**Goal**: Verify that the timer is optional, controllable, and never forces a phase transition.

**Steps**:
1. Launch dashboard — verify NO timer visible (FR-015)
2. Tap timer icon — verify preset options (15, 30, 45, 60 min, custom)
3. Select 15 minutes
4. Verify: circular arc animation begins, warm amber color
5. Verify: timer is purely visual (no sound, no vibration)
6. Tap timer -> Pause — verify countdown stops
7. Tap timer -> Resume — verify countdown continues
8. Tap timer -> +5 min — verify remaining time increases by 5 minutes
9. Advance to next phase while timer is still running
10. Verify: timer is automatically dismissed (not carried to next phase)
11. Start a new timer on the new phase
12. Wait for timer to expire (fast-forward in test)
13. Verify: gentle pulse animation, "Time's up — move on?" suggestion
14. Verify: phase does NOT auto-advance
15. Dismiss the suggestion — verify dashboard returns to normal

**Validates**: US-003 (all scenarios), FR-015 through FR-020

**Test type**: E2E (Maestro) + unit (Vitest for timer logic)

---

## Scenario 6: Emergency Reference Overlay

**Goal**: Verify the reference overlay provides complete, searchable, read-only game data.

**Steps**:
1. Launch game night for a Murder Mystery session
2. Tap "Reference" icon
3. Verify: overlay slides up in <300ms
4. Verify: tabs visible: "Player Roster", "Game State", "Full Solution", "Contributions"
5. Tap "Player Roster" — verify: all players with character names and secrets visible
6. Tap "Full Solution" — verify: murderer, motive, weapon, timeline, red herrings all present
7. Type in search bar: search for a character name
8. Verify: results filter across all tabs in <100ms
9. Try to tap/edit any content — verify: no edit controls exist, content is read-only
10. Swipe down to dismiss — verify: dashboard resumes underneath
11. Verify: all reference data was served from local SQLite (no network requests)

**Validates**: US-004 (all scenarios), FR-021 through FR-026

**Test type**: E2E (Maestro)

---

## Scenario 7: Written Answer Mode

**Goal**: Verify that a player can type answers on their device during game night.

**Steps**:
1. As player: enable "Written Answer Mode" in Settings -> Accessibility
2. As host: start game night with "Show Written Answers" enabled
3. As player: during the player's turn, verify text input field appears on player device
4. Type an answer and tap "Submit"
5. Verify: answer submitted in <2 seconds
6. As host: verify written answer appears on dashboard with player name
7. Verify: other players' devices show no indication of written answer mode
8. Check game_night_log: verify `written_answer` event recorded with answer text
9. After sync: verify written_answers table on server has the answer

**Validates**: US-006 (all scenarios), FR-037 through FR-039

**Test type**: E2E (Maestro, two devices) + integration (Vitest)

---

## Scenario 8: Player Drop and Mid-Game Addition

**Goal**: Verify the host can handle a player leaving and a new player arriving during game night.

**Steps**:
1. Start game night with 6 players
2. After 2 turns: tap Player C's name -> "Mark as Dropped"
3. Verify: Player C dimmed in roster
4. Verify: when Player C's turn comes, it is automatically skipped
5. Verify: the chain passes to Player D (next active player)
6. Tap "Add Player" -> enter "Late Arrival" as name
7. Verify: "Late Arrival" appears at end of player order
8. Verify: when the order reaches them, they participate normally
9. Check game_night_log: verify `player_drop` and `player_add` events recorded
10. Verify: dropped Player C can be reinstated (tap name -> "Reinstate")
11. After reinstate: verify Player C is back in the roster, active again

**Validates**: US-007 (Scenarios 7c, 7d), FR-046 through FR-049, edge cases 5.3, 5.4

**Test type**: E2E (Maestro) + integration (Vitest)

---

## Smoke Test Checklist

For rapid validation during development:

- [ ] Dashboard launches in ambient mode (dark background, amber accents)
- [ ] Wake lock prevents screen sleep
- [ ] Brightness reduced on dashboard launch
- [ ] All touch targets >=48dp
- [ ] Phase advancement with confirmation dialog works
- [ ] Phase undo works within 30 seconds
- [ ] Phase history shows completed checkmarks
- [ ] Timer starts, pauses, extends, dismisses correctly
- [ ] Timer never auto-advances phase
- [ ] Timer uses visual arc, not digital clock
- [ ] Reference overlay opens in <300ms
- [ ] Reference overlay is searchable
- [ ] Reference overlay is read-only
- [ ] All features work in airplane mode
- [ ] Auto-save runs every 30 seconds
- [ ] Dashboard resumes after app restart
- [ ] Sync queue processes after connectivity resumes
- [ ] Written answer input appears for players with mode enabled
- [ ] Written answers display on host dashboard
- [ ] Player skip works, chain continues correctly
- [ ] Player pass logged but not announced
- [ ] Mid-game player addition works
- [ ] Player drop marks turns as auto-skip
- [ ] Game-specific phases display correctly (test both games)
- [ ] Emergency reference shows game-specific tabs
- [ ] VoiceOver/TalkBack can navigate the dashboard
- [ ] Reduce motion disables animations
