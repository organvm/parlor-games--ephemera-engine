# Discovery: organvm/parlor-games--ephemera-engine

**Date:** 2026-06-22
**Verdict:** REAL VALUE — promote to the ranked tier.

## Value Thesis

The latent value of `parlor-games--ephemera-engine` is not the (partially-built) parlor-games
app — it is the **themed print-quality PDF rendering engine in `artifacts/`**: a self-contained,
dependency-decoupled, CI-green Nunjucks + Puppeteer pipeline (`src/render.ts` + `src/cli.ts`, ~390
lines) that compiles structured JSON into A5 print-ready PDFs through a real three-theme CSS design
system (`design-system/`: tokens → typography → layout → textures) and six finished templates across
two product lines. It typechecks clean under CI today (`npm run typecheck` passes; CI gates every PR
on it) and runs from a single `renderPDF(options)` export with no coupling to the app, Supabase, or
React Native — meaning any repo in the estate that needs to turn data into a beautiful physical
artifact (certificates, reports, letters, event collateral, booklets, receipts) can consume it as-is.
The signature gap that proves the thesis: the product's own server path, the `render-artifact`
Supabase edge function, currently returns **mock dummy bytes** (`new Uint8Array([0,1,2,3])`) while a
genuinely working renderer sits one directory away — so the highest-leverage move is to wire the proven
`artifacts/` engine into that server function, which simultaneously (a) unlocks the product's
signature post-game-artifact feature, (b) extracts the engine into a reusable, estate-wide asset, and
(c) opens a direct revenue path (on-demand print-quality PDF generation, plus the 5 hand-authored,
935-line murder-mystery narrative seed packs as saleable content IP). The rest of the repo — the
~16k-line Expo app, 7 SpecKit specs, and ~6k lines of design corpus — is real but partial scaffolding;
its value is realized *through* the artifact engine, which is the one finished, portable, revenue-
adjacent capability that justifies promotion.

## Highest Latent Value (specific)

1. **Reusable asset (primary):** `artifacts/` — a standalone themed PDF generation engine. Extractable
   as `@ephemera-engine/pdf-renderer`. Usable by any estate repo needing data → print-quality PDF.
2. **Content IP (secondary):** `content/murder-mystery-seeds/curated-seeds.yaml` — 5 hand-authored,
   literary murder-mystery scenarios (935 lines). Saleable as standalone narrative content packs.
3. **Product (tertiary):** the Confession Album + Murder Mystery game verticals — real mechanics, ~40-50%
   complete app, gated on finishing the artifact server bridge and pre-game lifecycle.

## Single Best Concrete First Task

**Replace the mock `supabase/functions/render-artifact/index.ts` with a real invocation of the proven
`artifacts/` pipeline** (call `renderPDF()` / the CLI to produce a real PDF, then upload to the
`ephemera` storage bucket instead of returning `new Uint8Array([0,1,2,3])`). This converts the engine
from "demo-only local CLI" into a server-callable capability, lights up the product's signature
feature, and is the cleanest path to extracting the renderer as an estate-wide reusable module.
Build stays green: CI only typechecks `artifacts/`, which is unaffected.
