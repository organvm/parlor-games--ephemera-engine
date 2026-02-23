# 002b — Feature Specification: Monetization & Content Store

**Status**: Deferred (V1.1)
**Split from**: 002-pre-game-lifecycle (2026-02-23 evaluation)
**Depends on**: 001-auth-and-sessions, 002-pre-game-lifecycle

---

## Overview

This spec covers the in-app purchase (IAP) infrastructure and content store, extracted from the original spec 002 to reduce V1 scope. These features are deferred to V1.1, after the core game mechanics are validated with curated content.

## Scope

### Included (from original spec 002)

1. **Content Store UI** — Browse, preview, and purchase content packs
2. **In-App Purchase Flow** — iOS StoreKit 2 + Android BillingClient integration
3. **IAP Receipt Validation** — Server-side validation Edge Function (`process-iap-receipt`)
4. **Content Pack Download & Merge** — Download purchased packs from Supabase Storage, merge into local content library
5. **Purchase Restoration** — Re-download owned packs on new device/reinstall

### Excluded (remains in spec 002)

- Invitations & RSVPs
- Contributions & contribution dashboard
- Push/email notifications
- Role assignment (Murder Mystery)
- Bundled content library (ships with app binary)

## PRD References

- §2.8.1 Bundled Content Library (content format — shared with 002)
- §2.8.2 Content Packs (content store UI)
- §5.6 Content Pack Specification (pack format, versioning)
- STRATEGY.md §Pillar 7 (monetization model)

## Technical Architecture

### Edge Function: `process-iap-receipt`

- Validates purchase receipts with Apple App Store Server API v2 (JWT-based) and Google Play Developer API
- Records validated purchases in `user_content_packs` junction table
- Returns pack download URL on success
- Counts as 1 of the 5 allowed Edge Functions (constitution)

### Content Store Screens

1. **StoreHome** — Browse packs by game, see owned/available
2. **PackDetail** — Pack description, preview items, price, purchase button
3. **PurchaseButton** — Platform IAP dialog trigger

### Data Model

```
content_packs
├── id: uuid
├── name: string
├── game: enum (confession-album, murder-mystery, ...)
├── type: enum (question-lineage, setting-seed, era-packet, ...)
├── price_tier: enum (free, standard, premium)
├── description: text
├── preview_items: integer
├── version: semver
├── min_app_version: semver
├── created_at: timestamp
└── metadata: jsonb

user_content_packs
├── id: uuid
├── user_id: uuid (FK users)
├── pack_id: uuid (FK content_packs)
├── purchased_at: timestamp
├── receipt_data: jsonb
├── platform: enum (ios, android)
└── restored: boolean
```

## Implementation Estimate

~5 tasks, ~8-12 working days (solo developer):
1. Content packs migration + seed data
2. IAP receipt validation Edge Function
3. Content store UI (StoreHome, PackDetail, PurchaseButton)
4. Content download and local library merge
5. Purchase restoration flow

## Dependencies

- Spec 001: User identity for purchase ownership
- Spec 002: Content library format (shared schema)
- Apple Developer account with IAP configuration
- Google Play Console with billing configuration

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| IAP review rejection (Apple/Google) | High | Medium | Follow platform guidelines exactly; test with sandbox accounts |
| IAP receipt fraud | High | Low | Server-side validation only; never trust client |
| Content pack schema drift | Medium | Medium | Schema version in pack metadata; runtime validation |
| Platform IAP API changes | Medium | Low | Use well-maintained library (react-native-iap or expo-in-app-purchases) |
