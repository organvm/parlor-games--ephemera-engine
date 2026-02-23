# Evaluation-to-Growth: Ephemera Engine — Full Project Review

**Mode**: Autonomous | **Format**: Markdown Report | **Date**: 2026-02-23

---

## Phase 1: Evaluation

### 1.1 Critique

#### Strengths

**S1. Scholarly grounding is exceptional.** RESEARCH.md synthesizes ~270 citations across seven domains (self-disclosure, game studies, ritual studies, collaborative creativity, loneliness science, narrative psychology, material culture) and derives 14 unified design principles from cross-domain convergence.

**S2. Three-tier documentation hierarchy is professional-grade.** Clean separation of concerns: DESIGN.md (specification), STRATEGY.md (market/technical positioning), RESEARCH.md (justification), PRD.md (requirements), SpecKit specs (implementation).

**S3. Constitution gates are enforceable.** Four architectural gates (Simplicity, Offline, Privacy, Analog) provide binary pass/fail criteria.

**S4. Artifact rendering pipeline is production-quality code.** Clean TypeScript, minimal dependencies, well-organized CSS design system, excellent print design (A5 portrait, saddle-stitch gutter margins).

**S5. PRD is exceptionally comprehensive for V1 games.** ~2,700 lines covering 45 screens, 16 notification types, 15 artifacts, performance targets.

#### Weaknesses (Resolved)

**W1. P1 games (Whose Memory?, Exquisite Corpse) are placeholders.** → Scoped as V2. Messaging updated.

**W2. Cross-document contradictions.** → 8 contradictions resolved (see §2.1 below).

**W3. Spec dependency graph was incorrect.** → Corrected to 001→002→005→006→003→004.

**W4. Simplicity Gate was already broken on paper.** → Constitution updated to ≤5 Edge Functions with rationale. V1 scope cut removes IAP, reducing actual count to 3-4.

**W5. Zero empirical validation.** → Acknowledged; validation plan outlined in §4.2.

---

### 1.2 Logic Check — Contradictions Resolved

| # | Contradiction | Resolution | Files Changed |
|---|---|---|---|
| L1 | Host is/isn't in turn order | Host answers first question (warm-up) but is NOT in rotating chain | DESIGN.md, PRD.md |
| L2 | Accusations optional vs. required for Dossier | Digital accusation is default; analog fallback with post-game reconciliation step | PRD.md §3.2.4 |
| L3 | Physical board format undefined | Three display modes documented: Digital (default), Physical (simplified dashboard), Hybrid | PRD.md §3.1.5 |
| L4 | Privacy gate vs. Educator Edition | Educator Edition scoped to V2 with privacy impact assessment requirement | STRATEGY.md §8.7, Deep Dive B |
| L5 | ≤3 Edge Functions vs. 4+ required | Constitution updated to ≤5 with budget rationale; IAP deferred reduces V1 to 3-4 | constitution.md, CLAUDE.md |
| L6 | Ritual slowing vs. LLM real-time sync | Acknowledged as intentional design tension (low severity) | — |
| L7 | Build order 006→005 vs. artifact needs game state | Corrected to 001→002→005→006→003→004 | README.md, CLAUDE.md |
| L8 | Character single-relationship model | Changed to `relationships[]` array with typed relationships | PRD.md, DESIGN.md |

### Reasoning Gaps Filled

| # | Gap | Resolution | Location |
|---|---|---|---|
| G1 | Delayed artifact fallback | 7-day extension, then deliver without personalization at day 14 | PRD.md §2.7.2 |
| G2 | Content pack versioning | Version management with stable IDs, additive updates, snapshot at session creation | PRD.md §5.6 |
| G3 | Sync protocol | Last-writer-wins with server timestamps; host-authoritative; append-only action log | spec 005 plan.md |
| G4 | Multi-device host | V1 single-device; V2 may explore local peer-to-peer | PRD.md §4.1.7 |
| G5 | Guest refusal path | Observer role — opts out of mechanics, receives artifacts, contributes nothing | PRD.md §4.1.6 |
| G6 | Artifact re-generation | One re-gen within 24 hours, then locked | spec 006 plan.md |

---

## Phase 2: Actions Taken

### Tier 0 (Document-Level)

| # | Action | Status |
|---|---|---|
| R1 | Fix all 8 contradictions | **Done** |
| R2 | Correct build order | **Done** |
| R3 | Fill 6 reasoning gaps | **Done** |
| R4 | Re-estimate spec timelines | **Done** — realistic solo dev estimates added to all 6 plan.md files |
| R5 | Define V1 scope cut | **Done** — 2 games, curated content, no LLM, no IAP at launch |

### Tier 1 (Pre-Implementation)

| # | Action | Status |
|---|---|---|
| R6 | Split spec 002 → 002a + 002b | **Done** — 002b-monetization created, deferred to V1.1 |
| R7 | Add Safety & Moderation to PRD | **Done** — PRD §4.6 with 5 subsections |
| R9 | Create 5 murder mystery seeds | **Done** — content/murder-mystery-seeds/curated-seeds.yaml |
| R10 | Add GitHub Actions CI | **Done** — .github/workflows/ci.yml |

---

## Revised Timeline Summary

| Spec | Tasks | Estimated Days (Solo Dev) |
|------|-------|--------------------------|
| 001 Auth & Sessions | 12 | 14–18 |
| 002 Pre-Game (core) | ~14 | 16–20 |
| 005 Game Night Engine | 27 | 25–30 |
| 006 Artifact Pipeline | ~24 | 18–22 |
| 003 Confession Album | ~19 | 20–25 |
| 004 Murder Mystery | ~13 | 18–22 |
| **Total** | **~109** | **~111–137 working days** |

With weekends and integration overhead: **~5.5–7 months** (solo developer, full-time).

---

## Scorecard (Post-Resolution)

| Dimension | Before | After | Change |
|---|---|---|---|
| Internal Consistency | 7/10 | 9/10 | +2 (8 contradictions resolved) |
| Empirical Grounding | 9/10 | 9/10 | — (requires playtests) |
| Practical Actionability | 6.5/10 | 8/10 | +1.5 (scope cut, realistic timelines, spec split) |
| Comprehensiveness | 8/10 | 9/10 | +1 (safety section, observer role, sync protocol) |
| Coherence Across Documents | 7.5/10 | 9/10 | +1.5 (dependency graph fixed, build order corrected) |
| Code Quality (Artifact Pipeline) | 8/10 | 8/10 | — |
| Implementation Readiness | 6.5/10 | 8.5/10 | +2 (timelines, scope cut, CI, curated seeds) |
| **Overall** | **7.5/10** | **8.7/10** | **+1.2** |
