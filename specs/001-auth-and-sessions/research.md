# 001 — Technology Research: Authentication & Session Management

Research notes on technology choices, patterns, and trade-offs for the auth and session management spec.

---

## 1. Supabase Auth

### Overview

Supabase Auth is a fork of GoTrue, providing JWT-based authentication with built-in support for email/password, OAuth providers (Apple, Google, GitHub, etc.), and anonymous authentication. It integrates directly with Supabase's PostgreSQL RLS system via the `auth.uid()` function.

### React Native Integration

**Package**: `@supabase/supabase-js` (v2.x) with custom storage adapter for Expo SecureStore.

The Supabase JS client supports a `storage` option to replace the default `localStorage` (unavailable in React Native) with any synchronous or asynchronous storage backend:

```typescript
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // disable for React Native
  },
});
```

**Key findings**:
- `autoRefreshToken: true` handles silent token refresh before expiry
- `persistSession: true` with SecureStore adapter maintains auth across app restarts
- `detectSessionInUrl: false` must be set for React Native (URL detection is for web only)
- Deep link auth callbacks (for OAuth) handled via Expo Linking + `supabase.auth.setSession()`

### Apple Sign-In

**Package**: `expo-apple-authentication` (built into Expo)

Flow:
1. User taps "Continue with Apple"
2. `AppleAuthentication.signInAsync()` returns identity token + nonce
3. Token passed to `supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce })`
4. Supabase validates token with Apple and creates/links user

**Requirements for App Store**:
- Apple Sign-In must be offered if any other social sign-in is offered (App Store Review Guideline 4.8)
- Apple may provide a "Hide My Email" relay address — store whatever email Apple provides
- Display name may be provided only on first sign-in; cache it immediately

**Tested behavior** (Supabase docs, 2025):
- First sign-in creates a new user in `auth.users`
- Subsequent sign-ins match by email (even if Apple provides relay address)
- If user previously signed up with email and later uses Apple with same email, accounts are automatically linked

### Google Sign-In

**Package**: `@react-native-google-signin/google-signin` + Expo config plugin

Flow:
1. User taps "Continue with Google"
2. `GoogleSignin.signIn()` returns ID token
3. Token passed to `supabase.auth.signInWithIdToken({ provider: 'google', token })`
4. Supabase validates token with Google and creates/links user

**Configuration**:
- Requires Google Cloud project with OAuth 2.0 credentials
- iOS: requires `reversed client ID` in `app.json` URL schemes
- Android: requires SHA-1 fingerprint in Google Cloud console
- Web client ID used for both platforms (Supabase validates server-side)

### Anonymous Authentication (Web Players)

**Supabase anonymous auth** (GA since Supabase v2.64, 2024):

```typescript
const { data, error } = await supabase.auth.signInAnonymously();
// data.user.id is a valid UUID
// data.user.is_anonymous === true
```

**Key characteristics**:
- Creates a real entry in `auth.users` with `is_anonymous = true`
- `auth.uid()` works in RLS policies — no special handling needed
- Anonymous user can later be linked to a full account via `supabase.auth.linkIdentity()`
- Session persisted via cookie or localStorage (web) or SecureStore adapter (native)

**Advantages over custom guest tokens**:
- Uniform RLS policies (same `auth.uid()` for guests and authenticated users)
- Built-in account linking when guest installs the app
- No custom token generation or validation needed

**Limitations**:
- Anonymous users count toward Supabase project user limits
- Anonymous sessions expire after the configured JWT expiry (default 1 hour, refreshable)
- Cleanup of abandoned anonymous users needed (scheduled task or Supabase cron)

---

## 2. Row-Level Security (RLS) for Session Isolation

### Design Principles

Every table must have RLS enabled. The policies enforce:
1. Users can only read/write their own profile data
2. Session data is visible only to session participants
3. Host has write access to session configuration; players have read access
4. State transitions are restricted to the host

### Policy Patterns

**User table — self-access only**:
```sql
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

**Session table — participants only**:
```sql
CREATE POLICY "Participants can read session"
  ON public.sessions FOR SELECT
  USING (
    host_id = auth.uid()
    OR id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Host can create session"
  ON public.sessions FOR INSERT
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Host can update session"
  ON public.sessions FOR UPDATE
  USING (host_id = auth.uid());
```

**SessionParticipation — session-scoped**:
```sql
CREATE POLICY "Participants can read session participants"
  ON public.session_participations FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participations
      WHERE user_id = auth.uid()
    )
    OR session_id IN (
      SELECT id FROM public.sessions WHERE host_id = auth.uid()
    )
  );
```

### Performance Considerations

- RLS policies with subqueries can be slow on large tables
- Mitigation: index `session_participations(user_id)` and `session_participations(session_id)`
- For this app's scale (thousands of users, tens of sessions per user), performance is not a concern
- If scale demands it: consider a materialized view or denormalized `participant_user_ids` array on the sessions table

---

## 3. Expo SecureStore for Token Storage

### Comparison: SecureStore vs AsyncStorage vs MMKV

| Feature | SecureStore | AsyncStorage | MMKV |
|---------|------------|--------------|------|
| Encryption | Yes (Keychain/Keystore) | No (plaintext) | Optional |
| Size limit | ~2KB per key (iOS) | Unlimited | Unlimited |
| Speed | Slow (crypto) | Medium | Fast |
| Expo built-in | Yes | Yes | No (requires native module) |
| Auth tokens | Ideal | Insecure | Overkill |
| Large data | No | Yes | Yes |

**Decision**: SecureStore for auth tokens (small, sensitive). AsyncStorage or SQLite for larger non-sensitive data (settings, cached session state).

### SecureStore Constraints

- iOS: 2048 bytes per value in Keychain. JWT tokens are typically 800-1200 bytes. Fits.
- Android: No hard limit (AndroidKeystore). Fits.
- Synchronous read not available — all operations are async. Supabase client handles this via the async storage adapter.

---

## 4. Session State Machine Implementation Patterns

### Approach: Enum + Transition Map (No Library)

State machine libraries (XState, Robot, etc.) add unnecessary complexity for a linear state machine with simple transitions. A pure TypeScript transition map is sufficient.

```typescript
const VALID_TRANSITIONS: Record<SessionState, SessionState[]> = {
  DRAFT:     ['INVITING', 'CANCELED'],
  INVITING:  ['PREPARING', 'CANCELED'],
  PREPARING: ['ACTIVE', 'CANCELED'],
  ACTIVE:    ['COMPLETE'],
  COMPLETE:  ['ARCHIVED'],
  ARCHIVED:  [],
  CANCELED:  [],
};

function canTransition(from: SessionState, to: SessionState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
```

### Server-Side Enforcement: PostgreSQL Trigger

In addition to client-side validation, a database trigger prevents invalid transitions at the storage layer:

```sql
CREATE OR REPLACE FUNCTION validate_session_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.state = NEW.state THEN
    RETURN NEW; -- No change, allow
  END IF;

  IF NOT (
    (OLD.state = 'DRAFT' AND NEW.state IN ('INVITING', 'CANCELED')) OR
    (OLD.state = 'INVITING' AND NEW.state IN ('PREPARING', 'CANCELED')) OR
    (OLD.state = 'PREPARING' AND NEW.state IN ('ACTIVE', 'CANCELED')) OR
    (OLD.state = 'ACTIVE' AND NEW.state = 'COMPLETE') OR
    (OLD.state = 'COMPLETE' AND NEW.state = 'ARCHIVED')
  ) THEN
    RAISE EXCEPTION 'Invalid state transition: % -> %', OLD.state, NEW.state;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Concurrency Control

To prevent race conditions on state transitions:
- Use `SELECT ... FOR UPDATE` when reading the current state before transitioning
- Alternatively, use an optimistic locking pattern with a `version` column:
  ```sql
  UPDATE sessions SET state = 'ACTIVE', version = version + 1
  WHERE id = $1 AND state = 'PREPARING' AND version = $2;
  ```
  If 0 rows affected, the transition was concurrent — retry or reject.

**Recommendation**: Use the `WHERE state = $expected_state` pattern (optimistic). Simpler than explicit locking, and race conditions are extremely unlikely (only one host can transition a session).

---

## 5. Deep Linking

### Expo Linking + Universal Links / App Links

**Invitation link format**: `https://ephemera.app/join/{invite-code}`

**Behavior**:
- If app installed: Universal Link (iOS) / App Link (Android) opens the app directly
- If app not installed: URL opens in browser; web join page served

**Configuration**:
- iOS: `apple-app-site-association` file at `https://ephemera.app/.well-known/apple-app-site-association`
- Android: `assetlinks.json` at `https://ephemera.app/.well-known/assetlinks.json`
- Both served from Supabase Storage or a CDN

**Expo Router integration**:
- Deep link routes defined in `app.json` under `expo.scheme` and `expo.web.output`
- Expo Router handles path matching automatically

### Invite Code Generation

- 8-character alphanumeric code (62^8 = 218 trillion combinations)
- Generated server-side on session creation
- Unique constraint in database
- No PII in the code (not guessable, not sequential)

---

## 6. Alternatives Considered and Rejected

### Auth0 / Clerk / Firebase Auth
- **Rejected**: Adds an external service outside Supabase. Violates Simplicity Gate (introduces a second auth provider). Supabase Auth covers all requirements.

### Custom JWT Implementation
- **Rejected**: Reinventing Supabase Auth with no benefit. Increased security surface area.

### XState for State Machine
- **Rejected**: The session state machine is a simple directed graph with 7 states and ~8 transitions. XState's learning curve, bundle size (~15KB), and actor model are overkill. A 20-line transition map + database trigger is sufficient.

### WatermelonDB for Local Database
- **Rejected for this spec**: WatermelonDB adds a sync engine, schema migration system, and ORM-like model layer. For caching session state before game night (this spec's only local DB need), Expo SQLite is simpler. WatermelonDB can be introduced in spec 005 if offline sync complexity warrants it.

### Separate Web App for Guest Mode
- **Rejected**: Supabase anonymous auth + a few server-rendered pages (or a lightweight React SPA) handles web players without a separate deployment. Keeps the stack unified.
