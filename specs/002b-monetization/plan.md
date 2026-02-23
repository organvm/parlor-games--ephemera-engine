# 002b — Implementation Plan: Monetization & Content Store

**Spec**: 002b-monetization
**Status**: Deferred (V1.1)
**Stack**: TypeScript 5.x, React Native + Expo, Supabase, react-native-iap
**Depends on**: 001-auth-and-sessions, 002-pre-game-lifecycle

---

## Constitution Check

### Simplicity Gate

- [x] Total server-side services ≤5? Yes. This spec adds 1 Edge Function (`process-iap-receipt`). Budget: +1 from this spec.
- [x] No speculative features? Yes. Only implementing IAP for content packs — no subscription, no print-on-demand.
- [x] Using framework primitives directly? Yes. `react-native-iap` for platform IAP; Supabase client for pack catalog.

### Offline Gate

- [x] N/A for game night. Content store requires connectivity. Purchased content cached locally.

### Privacy Gate

- [x] Purchase data scoped to user. No cross-user purchase visibility. No social features.

### Analog Gate

- [x] N/A. Content store is a pre-game activity.

---

## Implementation Phases

**Total estimated effort**: ~5 tasks, ~8-12 working days (solo developer)

### Phase 1: Infrastructure (Tasks 1-2) — ~4 days
- Content packs and user_content_packs DB migration
- `process-iap-receipt` Edge Function (Apple + Google validation)

### Phase 2: Client (Tasks 3-5) — ~5 days
- Content store UI (StoreHome, PackDetail, PurchaseButton)
- Content download + local library merge
- Purchase restoration flow

---

## Trigger for Implementation

This spec should be implemented when:
1. V1 has launched successfully
2. At least 3 playtests completed per game
3. Content library has 50+ question items and 5+ murder mystery seeds
4. User feedback validates demand for additional content
