# Research: 002 Pre-Game Lifecycle

**Spec**: 002-pre-game-lifecycle
**Last Updated**: 2026-02-23
**Areas**: Deep linking, push notifications, in-app purchases, contribution form patterns

---

## 1. Expo Deep Linking (Universal Links / App Links)

### How Expo Deep Linking Works

Expo provides two layers of deep linking:

1. **Expo Linking API** (`expo-linking`): Handles URL parsing and routing within the app. With expo-router, deep links map directly to file-system routes.

2. **Native deep links**: Universal Links (iOS) and App Links (Android) provide seamless app-or-web resolution without intermediate redirect pages.

### Universal Links (iOS)

**Mechanism**: Apple validates an `apple-app-site-association` (AASA) file hosted at `https://yourdomain.com/.well-known/apple-app-site-association`. When a user taps a link to your domain, iOS checks this file (cached at install time and periodically refreshed) to decide whether to open the app or Safari.

**AASA file structure**:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appIDs": ["TEAMID.com.ephemera.engine"],
        "components": [
          { "/": "/invite/*", "comment": "Session invitations" }
        ]
      }
    ]
  }
}
```

**Key requirements**:
- AASA must be served over HTTPS with valid TLS (no redirects)
- Content-Type: `application/json`
- File must be accessible without authentication
- Apple CDN caches AASA; updates can take 24-48 hours to propagate
- Requires `expo.ios.associatedDomains: ["applinks:ephemera.app"]` in app config

**Expo-specific configuration**:
```typescript
// app.config.ts
export default {
  expo: {
    ios: {
      associatedDomains: ["applinks:ephemera.app"],
    },
    // ...
  },
};
```

**Gotchas**:
- Universal Links do NOT work when the link is typed into Safari's address bar; they only trigger from taps in other apps (Messages, Mail, third-party apps)
- Links opened in Safari via JavaScript `window.location` may not trigger Universal Links
- If the user has previously dismissed the app open banner, iOS may stop offering Universal Links for that domain until the app is reinstalled
- Testing requires a real device with a valid AASA; simulator support is limited

### App Links (Android)

**Mechanism**: Android uses `assetlinks.json` at `https://yourdomain.com/.well-known/assetlinks.json` to verify the app-domain association. Unlike iOS, Android verifies at install time and on each app update.

**assetlinks.json structure**:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_applinks",
    "package_name": "com.ephemera.engine",
    "sha256_cert_fingerprints": ["SHA256_OF_SIGNING_KEY"]
  }
}]
```

**Expo-specific configuration**:
```typescript
// app.config.ts
export default {
  expo: {
    android: {
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "ephemera.app",
              pathPrefix: "/invite",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
  },
};
```

**Gotchas**:
- The `autoVerify: true` flag is essential; without it, Android shows a disambiguation dialog
- SHA-256 fingerprint must match the exact signing key used for the build (dev vs. production)
- Some Android OEMs (Samsung, Xiaomi) have custom link-handling behavior that can interfere
- Android 12+ requires explicit user approval for default link handling in some cases

### Fallback Strategy

When the app is not installed, the URL must resolve to a web page:

**Approach**: Host a lightweight web application at `https://ephemera.app/invite/:token` that:
1. Serves the AASA and assetlinks.json files from `.well-known/`
2. Renders a mobile-optimized invitation page for web players
3. Includes a smart app banner (`<meta name="apple-itunes-app" content="app-id=XXX">`)
4. Provides full RSVP and contribution functionality for web players

**No intermediate redirect pages**: Both Universal Links and App Links fail if the initial URL redirects. The invitation page must be the canonical URL that both the app and the web experience share.

### Expo Router Integration

With expo-router, deep links map to file routes:
```
app/
  invite/
    [token].tsx    # Handles /invite/:token
```

The `[token].tsx` route component receives the token via `useLocalSearchParams()`, validates it against the backend, and renders the invitation screen or redirects to the RSVP flow.

### Recommendation

Use a single domain (`ephemera.app`) for both the deep link target and the web player experience. This avoids the complexity of managing separate domains and ensures the AASA/assetlinks files are co-located with the web content. Deploy the web player pages as a static site or lightweight SPA on the same domain (e.g., via Vercel or Cloudflare Pages).

---

## 2. Push Notification Architecture

### Expo Notifications + FCM

**Architecture overview**:
- **Client**: `expo-notifications` library handles token registration, foreground display, background handling, and notification categories
- **Transport**: Firebase Cloud Messaging (FCM) for both iOS and Android delivery
- **Dispatch**: Expo Push API acts as a unified interface; you send to Expo push tokens, Expo routes to FCM/APNs

**Why Expo Push API over direct FCM/APNs**:
- Single API for both platforms
- Expo handles token translation (Expo push token -> FCM/APNs)
- Built-in receipt tracking and error handling
- Batch sending (up to 100 notifications per request)
- No need to manage APNs certificates or FCM server keys separately (Expo credentials service handles this)

### Token Registration

```typescript
import * as Notifications from 'expo-notifications';

async function registerForPush(): Promise<string | null> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-expo-project-id',
  });

  return token; // Format: ExponentPushToken[xxxxxx]
}
```

**Token lifecycle**:
- Tokens can change on app reinstall, OS update, or Expo SDK upgrade
- Re-register on every app launch; update server if token changes
- Store mapping: `user_id -> push_token` in the database
- A user can have multiple tokens (multiple devices)

### Server-Side Dispatch

**Expo Push API endpoint**: `https://exp.host/--/api/v2/push/send`

```typescript
// Edge Function: send-notification/index.ts
const messages = recipients.map(r => ({
  to: r.pushToken,
  title: notification.title,
  body: notification.body,
  data: { sessionId: notification.sessionId, type: notification.type },
  sound: 'default',
  categoryIdentifier: notification.category,
  priority: 'high',
}));

const response = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify(messages),
});
```

**Receipt checking**: After sending, you receive ticket IDs. Poll `https://exp.host/--/api/v2/push/getReceipts` after 15 minutes to check delivery status. Handle errors:
- `DeviceNotRegistered`: remove the token from your database
- `MessageTooBig`: reduce payload size
- `MessageRateExceeded`: implement backoff

### Scheduled Notifications

Expo Notifications supports local scheduled notifications, but for server-driven scheduling (deadline reminders, delayed artifacts), use a server-side scheduler:

**pg_cron approach**:
```sql
-- Run every 15 minutes to process scheduled notifications
SELECT cron.schedule('process-notifications', '*/15 * * * *',
  $$SELECT process_pending_notifications()$$
);
```

The `process_pending_notifications()` function:
1. Queries `notification_queue WHERE status = 'scheduled' AND scheduled_for <= NOW()`
2. Applies quiet hours logic (check recipient timezone)
3. Updates status to `ready`
4. Calls `pg_notify('dispatch_notification')` to trigger the Edge Function

**Alternative**: Supabase Database Webhooks can trigger Edge Functions on row insert/update, avoiding the need for pg_cron for non-scheduled notifications.

### Notification Categories (iOS)

iOS supports actionable notification categories with buttons:

```typescript
Notifications.setNotificationCategoryAsync('invitation', [
  { identifier: 'ACCEPT', buttonTitle: 'Accept', options: { opensAppToForeground: true } },
  { identifier: 'DECLINE', buttonTitle: 'Decline', options: { isDestructive: true } },
  { identifier: 'MAYBE', buttonTitle: 'Maybe' },
]);
```

This allows players to RSVP directly from the notification without opening the app.

### Quiet Hours Implementation

```typescript
function shouldDelayNotification(
  scheduledFor: Date,
  recipientTimezone: string
): Date | null {
  const localTime = toZonedTime(scheduledFor, recipientTimezone);
  const hour = localTime.getHours();

  if (hour >= 22 || hour < 8) {
    // Reschedule to 8 AM in the recipient's timezone
    const nextMorning = new Date(localTime);
    if (hour >= 22) nextMorning.setDate(nextMorning.getDate() + 1);
    nextMorning.setHours(8, 0, 0, 0);
    return fromZonedTime(nextMorning, recipientTimezone);
  }

  return null; // No delay needed
}
```

### Recommendation

Use Expo Push API as the dispatch mechanism (simplest, handles both platforms). Store push tokens in Supabase with user_id foreign key. Use pg_cron for scheduled notifications and Supabase Database Webhooks for immediate notifications. Implement quiet hours and deduplication in the Edge Function, not in the client.

---

## 3. In-App Purchase Integration

### Platform Requirements

Both Apple and Google require that digital content sold within apps uses their native IAP systems. Content packs are digital goods, so IAP is mandatory.

### Library Options

| Library | Pros | Cons |
|---------|------|------|
| `react-native-iap` | Mature, well-documented, supports both platforms, receipt validation helpers | Not Expo-native; requires custom dev client or bare workflow |
| `expo-in-app-purchases` | Official Expo library, works with managed workflow | Less mature, fewer features, limited documentation |
| `react-native-purchases` (RevenueCat) | Managed backend, cross-platform entitlements, analytics | Third-party dependency, monthly cost at scale, vendor lock-in |

**Recommendation**: `react-native-iap` for maximum control and zero ongoing costs. Requires Expo custom dev client (`expo-dev-client`), which is standard for production apps.

### Purchase Flow

```
Client                        Server (Edge Function)         Apple/Google
  │                                  │                            │
  ├─ requestProducts(skus) ─────────────────────────────────────▶│
  │  ◀─────── product list (prices) ─────────────────────────────┤
  │                                  │                            │
  ├─ requestPurchase(sku) ──────────────────────────────────────▶│
  │  ◀─────── purchase receipt ──────────────────────────────────┤
  │                                  │                            │
  ├─ validateReceipt(receipt) ──────▶│                            │
  │                                  ├─ verifyReceipt ──────────▶│
  │                                  │  ◀─── validation result ──┤
  │                                  │                            │
  │                                  ├─ Record in user_content_packs
  │  ◀─── { valid: true } ─────────┤                            │
  │                                  │                            │
  ├─ downloadPackContent() ─────────▶│                            │
  │  ◀─── pack JSON ────────────────┤                            │
  │                                  │                            │
  ├─ mergeIntoLocalLibrary()         │                            │
```

### Apple App Store Server API v2

Apple's modern receipt validation uses JWS (JSON Web Signature) tokens:

```typescript
// Edge Function: process-iap-receipt
import { jwtVerify } from 'jose';

async function verifyAppleReceipt(signedTransaction: string) {
  // Apple's root certificate for App Store
  const appleRootCert = await fetchAppleRootCertificate();

  // Verify the JWS
  const { payload } = await jwtVerify(signedTransaction, appleRootCert);

  return {
    productId: payload.productId,
    purchaseDate: new Date(payload.purchaseDate),
    expiresDate: payload.expiresDate ? new Date(payload.expiresDate) : null,
    environment: payload.environment, // 'Production' or 'Sandbox'
  };
}
```

### Google Play Billing

Google uses server-to-server verification via the Google Play Developer API:

```typescript
async function verifyGoogleReceipt(
  purchaseToken: string,
  productId: string
) {
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const response = await androidpublisher.purchases.products.get({
    packageName: 'com.ephemera.engine',
    productId,
    token: purchaseToken, // allow-secret
    auth,
  });

  return {
    purchaseState: response.data.purchaseState, // 0 = purchased
    consumptionState: response.data.consumptionState,
    purchaseTime: response.data.purchaseTimeMillis,
  };
}
```

### Content Pack Delivery

After successful receipt validation:
1. Server records ownership in `user_content_packs` table
2. Client downloads pack content as JSON from Supabase Storage
3. Content validated against schema before local merge
4. Local SQLite updated with new content items tagged by pack_id

**Offline resilience**: If download fails after purchase, the ownership record exists server-side. On next app launch, the client checks for undownloaded owned packs and retries.

### Pricing Tiers

| Tier | Apple Price | Google Price | Pack Type |
|------|------------|-------------|-----------|
| standard | $2.99 | $2.99 | Question lineage, era packet, theme |
| premium | $4.99-$6.99 | $4.99-$6.99 | Setting seed, game unlock |

Apple and Google both take a 30% commission (15% for small business program participants under $1M/year revenue).

### Recommendation

Use `react-native-iap` with server-side receipt validation via Supabase Edge Function. Never trust client-reported purchase status. Store content as downloadable JSON in Supabase Storage, separate from purchase validation. Implement purchase restoration flow for reinstalls and device transfers.

---

## 4. Contribution Form Patterns in React Native

### Form Architecture

For structured contribution forms with diverse field types (text, photo, structured data), several patterns are relevant:

### React Hook Form + Zod

**Recommended stack**: `react-hook-form` + `zod` for validation + `@hookform/resolvers/zod`

```typescript
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const contributionSchema = z.object({
  text: z.string().min(10, 'At least 10 characters').max(2000),
  description: z.string().optional(),
  photoUri: z.string().url().optional(),
});

type ContributionData = z.infer<typeof contributionSchema>;

function ContributionForm({ brief, onSubmit }) {
  const { control, handleSubmit, formState } = useForm<ContributionData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: brief.defaults,
  });
  // ...
}
```

**Why React Hook Form**:
- Minimal re-renders (uncontrolled by default)
- TypeScript-native with Zod inference
- `isDirty` tracking for auto-save logic
- Built-in field array support for multi-item contributions

### Auto-Save Pattern

```typescript
function useAutoSave<T>(data: T, saveFn: (data: T) => Promise<void>, intervalMs = 30000) {
  const lastSaved = useRef<T>(data);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      if (!isEqual(data, lastSaved.current)) {
        await saveFn(data);
        lastSaved.current = data;
      }
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [data, saveFn, intervalMs]);

  // Also save on unmount / app background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        if (!isEqual(data, lastSaved.current)) {
          saveFn(data); // Fire-and-forget
        }
      }
    });
    return () => subscription.remove();
  }, [data, saveFn]);
}
```

### Photo Upload

**Library**: `expo-image-picker` for selection, `expo-image-manipulator` for compression

```typescript
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

async function pickAndCompressPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  // Compress to <2MB
  const compressed = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return compressed.uri;
}
```

**Upload**: Use Supabase Storage client (`supabase.storage.from('contribution-photos').upload(path, file)`). The upload returns a public URL that is stored in the contribution's content JSON.

### Offline Draft Storage

**Option A: Expo SQLite**
- Structured storage with SQL queries
- Good for complex data relationships
- Supports WAL mode for concurrent reads

**Option B: MMKV**
- Key-value store, extremely fast
- Simpler API, good for individual drafts
- No query capability

**Recommendation**: MMKV for draft storage (each draft is a single key-value pair keyed by `contribution:{session_id}:{type}`). Use SQLite for the full content library (needs querying). This hybrid approach optimizes for each use case.

### Game-Specific Form Variations

| Game | Contribution Type | Form Fields |
|------|------------------|-------------|
| Confession Album | Contribution description | Text (what you're bringing), optional photo |
| Murder Mystery | Character preparation | Multiple text fields (alibi, motive, last words), cocktail/dish description, optional photo |
| Murder Mystery | Character preferences | Archetype ranking (drag-to-reorder or numbered selection) |
| Whose Memory? | Story submission | Long text (500-2000 words), title |
| Exquisite Corpse | Fragment submission | Short text (1-3 sentences) |

The form component should accept a `brief` object that defines which fields to render, their labels, placeholder text, and validation rules. This makes the form reusable across all game types without conditional logic inside the component.

### Recommendation

Use React Hook Form with Zod validation. Auto-save drafts to MMKV every 30 seconds and on app background. Compress photos client-side before upload. Design the contribution form as a schema-driven component that renders fields based on the contribution brief definition.

---

## 5. Supabase Realtime for Dashboard Updates

### How Supabase Realtime Works

Supabase Realtime uses WebSocket connections to stream database changes to clients. Three modes:

1. **Broadcast**: Pub/sub between clients (no database persistence)
2. **Presence**: Track online status of connected clients
3. **Postgres Changes**: Stream INSERT/UPDATE/DELETE events from specific tables

For the RSVP and contribution dashboards, **Postgres Changes** is the right mode.

### Subscription Pattern

```typescript
import { supabase } from '../shared/services/supabase';

function useRealtimeContributions(sessionId: string) {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('contributions')
      .select('*')
      .eq('session_id', sessionId)
      .then(({ data }) => setContributions(data ?? []));

    // Real-time subscription
    const channel = supabase
      .channel(`contributions:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contributions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setContributions(prev => [...prev, payload.new as Contribution]);
          } else if (payload.eventType === 'UPDATE') {
            setContributions(prev =>
              prev.map(c => c.id === payload.new.id ? payload.new as Contribution : c)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  return contributions;
}
```

### RLS Considerations

Supabase Realtime respects Row Level Security policies. The subscription only receives events for rows the authenticated user can SELECT. This means:
- Host subscriptions see all contributions for their session (host has SELECT on session contributions)
- Player subscriptions see only their own contributions

### Performance

- Each Realtime subscription is a persistent WebSocket connection
- Supabase free tier: 200 concurrent connections; Pro tier: 500+
- For a session with 8-10 players + 1 host, connection count is well within limits
- Filter subscriptions by session_id to minimize unnecessary event processing

### Recommendation

Use Supabase Realtime Postgres Changes for both the RSVP dashboard and contribution dashboard. Subscribe with session_id filters. Combine initial fetch with real-time subscription for immediate data + live updates. Unsubscribe on component unmount to free connections.

---

## References

- [Expo Deep Linking documentation](https://docs.expo.dev/guides/deep-linking/)
- [Apple Universal Links documentation](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Android App Links documentation](https://developer.android.com/training/app-links)
- [Expo Notifications documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push API reference](https://docs.expo.dev/push-notifications/sending-notifications/)
- [react-native-iap documentation](https://react-native-iap.dooboolab.com/)
- [Apple App Store Server API](https://developer.apple.com/documentation/appstoreserverapi)
- [Google Play Billing Library](https://developer.android.com/google/play/billing)
- [Supabase Realtime documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions)
- [React Hook Form documentation](https://react-hook-form.com/)
- [Zod documentation](https://zod.dev/)
