# Research: Murder Mystery Game Module

**Spec**: 004-murder-mystery | **Date**: 2026-02-23

Technology research covering Claude API integration for setting seed generation, character sheet rendering, three-act dashboard UX patterns, and clue distribution algorithms.

---

## 1. Claude API Integration for Setting Seed Generation

### API Design

The Murder Mystery setting seed generation requires structured, multi-part output from Claude. The Anthropic SDK (TypeScript) supports this via the Messages API with system prompts and structured output.

**Recommended approach**: Use the Anthropic TypeScript SDK (`@anthropic-ai/sdk`) in a Supabase Edge Function. The Edge Function acts as a proxy — the mobile client never calls Claude directly (privacy gate compliance, API key protection).

**Model selection**: Claude 3.5 Sonnet or Claude 3.5 Haiku for seed generation. Sonnet provides higher creative quality for narrative generation; Haiku offers lower latency (<5s typical) for regeneration cycles. The host may regenerate many times, so latency matters.

**Structured output strategy**: Use a detailed system prompt that specifies the exact JSON schema for the response. Include a JSON schema definition in the system prompt and request JSON output. Validate the response server-side before returning to the client.

```typescript
// Simplified Edge Function pattern
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  system: MURDER_MYSTERY_SYSTEM_PROMPT,
  messages: [
    {
      role: 'user',
      content: `Generate a murder mystery scenario:
        Era: ${era}
        Location: ${location}
        Social Milieu: ${milieu}
        Central Tension: ${tension}
        Player count: ${playerCount}`
    }
  ]
});
```

**System prompt design**: The system prompt should include:
1. Role definition ("You are a murder mystery scenario designer...")
2. Output JSON schema with all required fields
3. Constraints: internal consistency rules (victim cannot be murderer, each character must have exactly one secret, red herrings must be plausible but not correct)
4. 1–2 complete example scenarios as few-shot examples
5. Quality criteria: characters must feel distinct, motives must be era-appropriate, timeline must be dramatically satisfying

**Validation layer**: After receiving the response, run server-side validation:
- JSON parse check
- Schema conformance (all required fields present)
- Consistency rules: victim_id and murderer_id reference valid character IDs, no duplicate IDs, relationship graph is connected, timeline events are in chronological order
- If validation fails: auto-retry with a "fix this issue" follow-up message (up to 3 retries)

### Cost Estimation

At current Claude API pricing:
- Input: ~2,000 tokens (system prompt + user message) × $3/M tokens = $0.006 per generation
- Output: ~3,000 tokens (full scenario) × $15/M tokens = $0.045 per generation
- Total: ~$0.05 per seed generation
- If hosts regenerate 3x on average: ~$0.15 per session setup
- At 1,000 sessions/month: ~$150/month API cost

### Rate Limiting

Implement per-session rate limiting in the Edge Function:
- Max 10 generations per session (prevents abuse during free exploration)
- 5-second cooldown between requests (prevents rapid-fire regeneration)
- Rate limit tracked in a Supabase table keyed by session_id

---

## 2. Character Sheet Rendering and Delivery

### Sealed Envelope UI Pattern

The character packet should feel like receiving a physical envelope. This is a UX design challenge, not a technical one.

**Recommended implementation**:
1. Initial state: an animated envelope illustration with a wax seal. Tap to "break the seal."
2. Transition: envelope opens with a reveal animation (Expo's `react-native-reanimated` for gesture-driven spring animations).
3. Progressive reveal: character sheet slides out first, followed by contribution brief and preparation prompts as separate "cards" in a vertical scroll.
4. Revisit: after first open, the packet is a standard scrollable view with tabs (Character / Brief / Prompts).

**Offline caching**: Character packets are fetched when the session enters PREPARING state (or when the host delivers packets). Data is stored in the local DB and accessible without network. The sealed-envelope animation plays even offline.

**Web player delivery**: The web character packet page is a responsive HTML page served by Supabase (or a static host). It receives the same data as the app version and renders character sheet, brief, and prompts. No animation (web is functional, not theatrical). Preparation prompt answers submitted via a standard web form that POSTs to the Supabase API.

### Character Assignment Modes

Three modes per PRD §2.3.3:

1. **Auto-assign**: Round-robin or random distribution. Simple array shuffle. No sophistication needed for V1.
2. **Manual**: Drag-and-drop UI. Use `react-native-draggable-flatlist` or similar. Host drags character cards onto guest name slots.
3. **Preference-based**: Guests receive a short form with character archetype descriptions (not full character sheets — no spoilers). They rank their top 3 preferences. System runs a simple stable-matching algorithm (Gale-Shapley or Hungarian algorithm for optimal assignment). This is a nice-to-have for V1; auto-assign and manual are sufficient for launch.

---

## 3. Three-Act Dashboard UX Patterns

### Ambient Mode Design

The dashboard must respect the "screen dark" principle (constitution: Analog Gate). Research into ambient display patterns from smart home controllers and music apps (e.g., Spotify's car mode, Sonos controller) informs the design:

- **Dark background** with OLED-friendly true black (#000000) for energy savings on OLED screens
- **Warm accent colors**: amber (#C9A027), gold (#D4A843), muted red (#8B2500) — noir palette
- **Large touch targets**: minimum 48dp per Material Design guidelines, but aim for 64dp for one-handed operation while hosting
- **Minimal text**: phase name, checklist items, and action buttons. No paragraph text on the dashboard.
- **Auto-brightness**: Use Expo's `Brightness` API to dim to 30% when dashboard launches. Restore on exit.
- **Wake lock**: Use `expo-keep-awake` to prevent the screen from sleeping during game night.

### Phase Progression UX

Research from theater stage management apps (Stage Manager Pro, StagePlot Pro) and live event cueing software:

- **Visual act indicator**: horizontal three-segment bar at the top. Active segment glows; completed segments are filled; future segments are outlined. Tap-safe (no accidental transitions).
- **Transition confirmation**: "Begin Act II: The Crime?" with a 3-second hold-to-confirm button (prevents accidental taps). The hold gesture is borrowed from delete confirmations in iOS.
- **Undo window**: 30-second undo for accidental phase advances. A toast appears: "Undo" button visible for 30 seconds. After that, the transition is permanent.
- **No back-tracking beyond undo window**: Acts proceed forward only. This is intentional — the murder mystery has a one-way dramatic arc.

### Clue Distribution Tracker

The clue tracker is a checklist, not an automated system. The host checks off clues as they physically distribute cards or reveal information.

- **Checklist UI**: each clue is a card with title, type badge, and checkbox. Checked items move to a "Distributed" section.
- **Sort order**: default is the order defined in the scenario, but the host can reorder by dragging.
- **Character knowledge panel**: expandable section showing what each character privately knows (from their character sheet). This is the host's cheat sheet for managing information asymmetry.

---

## 4. Clue Distribution Algorithms

### Progressive Reveal Pattern

The Murder Mystery uses a host-driven progressive reveal, not an automated distribution algorithm. However, the system can provide intelligent suggestions:

**Recommended approach**: Define clue difficulty tiers in the seed data:
- **Tier 1 (Act I)**: Clues that establish relationships and raise suspicion. Discoverable through social interaction.
- **Tier 2 (Act II)**: Clues that narrow the suspect pool. Physical evidence, documents.
- **Tier 3 (Act III)**: The decisive clue or combination that points to the murderer. Revealed only if the group is struggling.

The host sees tier recommendations but can distribute in any order. The tracker shows suggested timing next to each clue: "Suggested: Act II, after interrogation round 1."

### Clue Interconnection

For generated scenarios, the Claude API prompt should require that clues form a logical graph:
- Each clue must connect to at least one character
- At least 2 clues must point toward the true murderer
- At least 1 clue per red herring must plausibly support the false theory
- The complete clue set must be sufficient to solve the mystery (no missing links)

This is enforced via the server-side validation layer after generation.

---

## 5. Offline Architecture for Game Night

### Local Database Strategy

**WatermelonDB** is the recommended local database for React Native offline-first:
- Reactive (observes changes and re-renders automatically)
- Built-in sync primitives (push/pull with backend)
- SQLite under the hood (proven, fast)
- Works with both iOS and Android

**Alternative**: Expo SQLite — simpler, no sync abstractions, requires manual sync implementation. Lighter weight but more work.

**Recommendation**: Use WatermelonDB if other specs (001, 005) adopt it for the shared offline layer. If the project decides on Expo SQLite for simplicity, the Murder Mystery module follows the shared decision.

### Sync Protocol

1. **Pre-cache on PREPARING → ACTIVE transition**: Full session data (characters, clues, crime, contributions, settings) pulled from Supabase and written to local DB.
2. **During game night**: All reads from local DB. All writes (act timestamps, clue distribution checks, accusations, votes) written to local DB with `synced: false` flag.
3. **Post-game night (ACTIVE → COMPLETE transition)**: Background sync pushes all local changes to Supabase. Uses Supabase's `upsert` with conflict resolution (last-write-wins for simple fields, merge for arrays like accusations).

---

## 6. Artifact Template Compatibility

The existing Nunjucks templates (`the-dossier.njk`, `menu-of-the-damned.njk`, `the-sealed-envelope.njk`) and the fixture data (`murder-mystery.json`) define the canonical data shape. The app's artifact generation service must assemble session data into exactly this shape before passing it to the shared rendering pipeline.

**Data shape mapping** (from app entities to template variables):

| Template Variable | Source |
|-------------------|--------|
| `session.id`, `session.title`, `session.date` | Session table |
| `session.caseNumber` | Generated: `YYYY-MMDD` from session date |
| `setting.era`, `setting.location`, `setting.description`, `setting.crimeScene` | Session.config.setting_seed |
| `characters[]` (name, playedBy, bio) | Session.config.characters joined with SessionParticipation |
| `clues[]` (id, title, type, description, foundBy) | Session.config.clues (static) + game_night.clues_distributed (status) |
| `accusations[]` (accuser, target, reasoning) | Session.config.game_night.accusations |
| `reveal` (culprit, explanation) | Session.config.crime |
| `votes[]` (character, count) | Session.config.awards |
| `recipes[]` (contributor, name, type, ingredients, steps) | Contributions table filtered by type=food/drink |
| `host.name`, `reflection`, `stats` | Session host + host-written content |

The existing templates require no modification for V1. The service layer bridges the gap between the app's relational data and the template's flat JSON structure.
