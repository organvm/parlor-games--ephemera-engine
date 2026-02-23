# 005 — Technology Research: Game Night Engine

Research notes on technology choices, patterns, and trade-offs for the game night engine spec.

---

## 1. WatermelonDB vs Expo SQLite

### The Question

The PRD (section 4.3.2) mentions "WatermelonDB or Expo SQLite" for local-first game night. This section evaluates both and documents the decision.

### WatermelonDB

**What it is**: A reactive, offline-first database for React Native built on top of SQLite. Provides an ORM-like model layer, observable queries (Rx.js), and a built-in sync engine for conflict resolution with remote databases.

**Strengths**:
- Reactive queries: UI automatically updates when underlying data changes
- Built-in sync protocol: handles push/pull, conflict resolution, incremental sync
- Model layer with schema and migrations
- Lazy loading: only materializes records when accessed
- Battle-tested in large apps (Nozbe, Evernote-like apps)

**Costs for this project**:
- **Rx.js dependency**: ~30KB gzipped. Philosophical overhead (reactive streams) for a dashboard that updates on user action, not on data push.
- **Model boilerplate**: Every entity requires a Model class, a schema definition, and decorators. For ~6 simple tables, this is overhead.
- **Sync engine complexity**: WatermelonDB's sync assumes bidirectional sync between client and server. Our sync is one-directional (local -> server, host authoritative). Using WatermelonDB's sync for this is like using a bulldozer to dig a hole.
- **Migration system**: Requires versioned schema migrations even for local-only data. Our local schema is ephemeral — wiped after sync completes.
- **Learning curve**: New API, new patterns, new debugging surface.

**Bundle impact**: ~150KB gzipped (WatermelonDB + Rx.js). Compared to Expo SQLite: 0KB additional (built into Expo).

### Expo SQLite

**What it is**: Expo's built-in SQLite wrapper. Provides direct SQL access to a local SQLite database. No ORM, no sync, no reactive queries.

**Strengths**:
- Zero additional dependencies (included in Expo)
- Zero bundle size impact
- Direct SQL queries — full SQLite power
- Simple API: `openDatabaseAsync()`, `execAsync()`, `getFirstAsync()`, `getAllAsync()`
- Synchronous reads available via `openDatabaseSync()` (Expo SDK 51+)

**Costs for this project**:
- Manual SQL queries (no type-safe ORM) — mitigated by TypeScript types on query results
- No reactive queries — mitigated by Zustand store (UI reads from store, not DB directly)
- No built-in sync — mitigated by custom sync engine (simple for one-directional sync)
- Manual schema management — mitigated by a single `schema.ts` file with CREATE TABLE statements

### Decision: Expo SQLite

**Rationale**: The game night engine's local database needs are simple:
1. Pre-cache ~6 tables of session data before game night
2. Read from those tables during game night (all reads go through Zustand store)
3. Write action logs during game night (phase transitions, player actions, timer events)
4. Push all local data to server after game night (one-directional sync)

WatermelonDB's reactive queries, bidirectional sync, and model layer are all solutions to problems this spec does not have. Expo SQLite covers all four needs with zero additional complexity.

**When to reconsider**: If a future spec requires real-time multi-device sync during game night (e.g., all players voting from their phones simultaneously and seeing results update live), WatermelonDB's sync engine would be justified. This is not in the V1 scope.

---

## 2. Wake Lock on iOS and Android

### iOS: Screen Idle Timer

iOS does not have a traditional "wake lock" API. Instead, apps can disable the idle timer:

```typescript
// Using expo-keep-awake
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

// On dashboard mount
await activateKeepAwakeAsync('game-night');

// On dashboard unmount
deactivateKeepAwake('game-night');
```

**Under the hood**: Sets `UIApplication.shared.isIdleTimerDisabled = true`. This is the same API used by navigation apps (Google Maps, Waze) to keep the screen on during driving.

**Behavior**:
- Screen stays on indefinitely while the app is in the foreground
- Automatically re-enables idle timer when app goes to background
- No user permission required
- Works with Auto-Lock settings (overrides temporarily)
- Battery impact: significant on long game nights (4+ hours). Reduced brightness mitigates this.

**App Store considerations**: Apple permits wake lock for apps where screen-on is core to the experience (navigation, timers, reference). A game night dashboard qualifies. No review risk.

### Android: Wake Lock Permission

Android requires the `WAKE_LOCK` permission in `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

**expo-keep-awake behavior on Android**:
- Uses `FLAG_KEEP_SCREEN_ON` on the window (not PowerManager wake lock)
- `FLAG_KEEP_SCREEN_ON` does not require explicit user permission — it's a window flag
- Expo handles this automatically when using `activateKeepAwakeAsync()`
- More reliable than PowerManager wake locks across manufacturers

**Edge cases tested**:
- Samsung: works correctly. Samsung's "battery optimization" does not override `FLAG_KEEP_SCREEN_ON`.
- Xiaomi/MIUI: may override wake lock in aggressive battery saving mode. Mitigation: detect and prompt user to exclude the app from battery optimization.
- OnePlus: works correctly.

### Recommendation

Use `expo-keep-awake` exclusively. It abstracts platform differences, requires no native configuration beyond the default Expo setup, and handles edge cases (background/foreground transitions, tag-based activation/deactivation).

---

## 3. Ambient Mode Patterns

### Brightness Control

```typescript
import * as Brightness from 'expo-brightness';

// Save original brightness
const originalBrightness = await Brightness.getBrightnessAsync();

// Set ambient brightness (30% — visible in dim room, not blinding)
await Brightness.setBrightnessAsync(0.3);

// Restore on exit
await Brightness.setBrightnessAsync(originalBrightness);
```

**Platform notes**:
- iOS: Controls app-level brightness. No system permission needed. Does not affect the system brightness slider.
- Android: Requires `WRITE_SETTINGS` permission for system brightness. Alternative: use `useWindowBrightness` which controls only the app window (no permission needed). Expo Brightness supports both.

**Recommendation**: Use window-level brightness (no permission required) on both platforms. This changes brightness only within the app, leaving system brightness untouched.

### OLED-Friendly Dark Theme

OLED screens turn off pixels for pure black (#000000), saving battery and reducing light bleed. The ambient mode theme should use:

```typescript
const ambientTheme = {
  background: '#000000',        // Pure black — OLED pixel-off
  surface: '#1A1A1A',           // Elevated surfaces (cards, dialogs)
  surfaceVariant: '#2A2A2A',    // Secondary surfaces
  primary: '#FFB74D',           // Warm amber — primary actions, highlights
  primaryDim: '#FF8F00',        // Darker amber — timer arc, phase indicator
  onBackground: '#E0E0E0',     // Text on dark background (not pure white — reduces eye strain)
  onSurface: '#BDBDBD',        // Secondary text
  accent: '#FFD54F',           // Gold — success states, checkmarks
  error: '#EF5350',            // Muted red — sparingly used
};
```

**Typography in ambient mode**:
- Body text: 18sp minimum (Lora, regular weight)
- Headings: 24sp+ (Playfair Display)
- Player names: 20sp (clear at arm's length)
- Phase name: 28sp (the largest text on screen)

### Comparable Apps with Ambient Modes

- **Google Maps (night mode)**: Dark background, reduced brightness, orange/amber accent. Shows only essential info.
- **Sleep Cycle**: Pure black OLED background, minimal text, warm red numbers.
- **Spotify Car Mode**: Large touch targets, high contrast, reduced information density.
- **Apple Bedtime**: Warm orange/amber palette, reduced brightness, minimal interaction.

The Ephemera Engine dashboard should feel closest to a combination of Google Maps night mode (functional, glanceable) and Apple Bedtime (warm, calm, unhurried).

---

## 4. Offline Sync Protocols

### The Sync Problem (Simplified)

The game night engine's sync problem is significantly simpler than typical offline-first sync:

1. **Single writer**: Only the host's device writes game state. No multi-device write conflicts.
2. **One-directional**: Local -> server only. Server never pushes changes to the host during game night.
3. **Host authoritative**: If local and server disagree, local wins. No merge needed.
4. **Post-hoc**: Sync happens after game night, not during. No real-time requirements.

This reduces the sync problem to: "push a JSON payload to the server when connectivity is available."

### Implementation Pattern: Queue + Retry

```typescript
interface SyncQueueEntry {
  id: string;
  sessionId: string;
  operation: 'game_night_log' | 'phase_transition' | 'session_complete';
  payload: Record<string, unknown>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
  lastAttemptAt: string | null;
}

// On each game night action:
async function queueSync(entry: Omit<SyncQueueEntry, 'id' | 'status' | 'retryCount' | 'createdAt' | 'lastAttemptAt'>) {
  await db.runAsync(
    'INSERT INTO sync_queue (id, session_id, operation, payload, status, retry_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uuid(), entry.sessionId, entry.operation, JSON.stringify(entry.payload), 'pending', 0, new Date().toISOString()]
  );
}

// Background processor:
async function processSyncQueue() {
  const pending = await db.getAllAsync<SyncQueueEntry>(
    'SELECT * FROM sync_queue WHERE status IN (?, ?) ORDER BY created_at ASC',
    ['pending', 'failed']
  );

  for (const entry of pending) {
    try {
      await supabaseFunctions.invoke('sync-game-night', { body: entry.payload });
      await db.runAsync('UPDATE sync_queue SET status = ? WHERE id = ?', ['completed', entry.id]);
    } catch (error) {
      const nextRetry = Math.min(Math.pow(2, entry.retryCount) * 1000, 60000);
      await db.runAsync(
        'UPDATE sync_queue SET status = ?, retry_count = ?, last_attempt_at = ? WHERE id = ?',
        ['failed', entry.retryCount + 1, new Date().toISOString(), entry.id]
      );
      await delay(nextRetry);
    }
  }
}
```

### Exponential Backoff Schedule

| Attempt | Delay | Total elapsed |
|---------|-------|--------------|
| 1 | 1s | 1s |
| 2 | 2s | 3s |
| 3 | 4s | 7s |
| 4 | 8s | 15s |
| 5 | 16s | 31s |
| 6 | 32s | 63s |
| 7+ | 60s (cap) | +60s each |

### Alternatives Considered

- **CRDTs (Conflict-free Replicated Data Types)**: Massive overkill. CRDTs solve multi-writer, multi-replica conflicts. We have one writer.
- **Supabase Realtime sync**: Real-time sync requires active connection. We're offline during game night by design.
- **WatermelonDB sync**: Built for bidirectional sync with conflict resolution. Our sync is unidirectional. Using it would be like hiring a mediator for a monologue.

---

## 5. React Native Accessibility APIs

### VoiceOver / TalkBack Support

React Native's accessibility system maps to platform-native screen readers:

```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Advance to next phase: Act II The Crime"
  accessibilityHint="Double-tap to open confirmation dialog"
  accessible={true}
>
  <Text>Next Phase</Text>
</TouchableOpacity>
```

**Key properties**:
- `accessibilityRole`: Maps to semantic role (button, header, text, image, etc.)
- `accessibilityLabel`: Screen reader announcement
- `accessibilityHint`: Additional context for what will happen
- `accessibilityState`: Communicates disabled, selected, checked states
- `accessibilityLiveRegion` (Android) / `accessibilityElementsHidden` (iOS): Dynamic content announcements

### Reduce Motion

```typescript
import { AccessibilityInfo } from 'react-native';

// Check system setting
const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();

// Listen for changes
AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
  // Disable animations
});
```

In Reanimated:
```typescript
import { useReducedMotion } from 'react-native-reanimated';

function TimerRing() {
  const reduceMotion = useReducedMotion();

  // If reduceMotion, show static progress bar instead of animated arc
  if (reduceMotion) {
    return <StaticProgressBar progress={progress} />;
  }

  return <AnimatedArc progress={animatedProgress} />;
}
```

### Touch Target Sizing

React Native defaults to small touch targets. The dashboard must enforce 48dp minimum:

```typescript
const MINIMUM_TOUCH_TARGET = 48; // dp

const styles = StyleSheet.create({
  touchable: {
    minWidth: MINIMUM_TOUCH_TARGET,
    minHeight: MINIMUM_TOUCH_TARGET,
    // For smaller visual elements, use hitSlop to extend touch area:
  },
});

// For elements that are visually smaller than 48dp:
<TouchableOpacity
  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
>
  <SmallIcon />
</TouchableOpacity>
```

### Font Scaling

Respect the user's system font size preference:

```typescript
import { PixelRatio } from 'react-native';

// React Native automatically scales Text with system font size
// But for the ambient mode, enforce minimums:
const bodySize = Math.max(18, 14 * PixelRatio.getFontScale());
const headingSize = Math.max(24, 18 * PixelRatio.getFontScale());
```

---

## 6. Expo SQLite API Reference (SDK 51+)

### Async API (recommended)

```typescript
import * as SQLite from 'expo-sqlite';

// Open database
const db = await SQLite.openDatabaseAsync('game-night.db');

// Create tables
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS game_night_local_state (
    session_id TEXT PRIMARY KEY,
    current_phase_index INTEGER NOT NULL DEFAULT 0,
    turn_position INTEGER NOT NULL DEFAULT 0,
    player_order TEXT NOT NULL DEFAULT '[]',
    player_status TEXT NOT NULL DEFAULT '{}',
    timer_state TEXT,
    undo_available_until TEXT,
    game_specific_state TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  );
`);

// Insert
await db.runAsync(
  'INSERT INTO game_night_local_state (session_id, updated_at) VALUES (?, ?)',
  [sessionId, new Date().toISOString()]
);

// Read single row
const state = await db.getFirstAsync<GameNightLocalState>(
  'SELECT * FROM game_night_local_state WHERE session_id = ?',
  [sessionId]
);

// Read multiple rows
const logs = await db.getAllAsync<GameNightLogEntry>(
  'SELECT * FROM game_night_log WHERE session_id = ? ORDER BY created_at ASC',
  [sessionId]
);

// Transaction
await db.withTransactionAsync(async () => {
  await db.runAsync('UPDATE ...', [...]);
  await db.runAsync('INSERT ...', [...]);
});
```

### Performance Notes

- SQLite reads: <1ms for indexed queries on small tables (our use case)
- SQLite writes: <5ms per INSERT (fast enough for 30-second auto-save)
- Transaction overhead: ~1ms additional
- Database file size: negligible (game night data is a few KB)

---

## 7. Alternatives Considered and Rejected

### WatermelonDB
- **Rejected**: See section 1 for detailed comparison. Overkill for one-directional, single-writer sync.

### Firebase Firestore (offline mode)
- **Rejected**: Introduces Firebase dependency alongside Supabase. Violates Simplicity Gate. Firestore's offline mode is designed for bidirectional sync — our sync is simpler.

### Custom WebSocket Server for Real-Time Sync
- **Rejected**: Game night is offline by design. Real-time sync contradicts the Offline Gate. Player devices are read-only spectators, not sync participants.

### MMKV for Local Storage
- **Rejected for primary storage**: MMKV is fast but key-value only. Game night data has relational structure (sessions, players, actions). SQLite's relational model is a better fit. MMKV could supplement for simple flags/preferences, but that's already handled by Zustand + AsyncStorage.

### XState for Dashboard State Machine
- **Rejected**: The dashboard state is simpler than a state machine — it's a phase index that increments. Phase progression is a counter, not a graph. An enum + switch statement suffices.
