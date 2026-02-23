# Technology Research: 003-confession-album

**Spec**: [spec.md](./spec.md)
**Last Updated**: 2026-02-23

---

## 1. React Native Animated Board Display

### Problem

The digital board must display 13-40 questions in a visually appealing layout, support tap-to-select, animate question removal (300ms fade + collapse), maintain visible gaps after removal, and scale font size as the board empties. This all runs on the host's device during game night, potentially without network connectivity.

### Approach: React Native Reanimated + FlatList

**React Native Reanimated v3** is the standard for performant animations in React Native. It runs animations on the UI thread via worklets, achieving 60fps without bridge overhead.

**Board layout strategies**:

| Layout | Implementation | Tradeoffs |
|--------|---------------|-----------|
| **Grid** | `FlatList` with `numColumns` and `Animated.View` wrappers per cell. Question removal uses `withTiming` to animate opacity (1→0) and height (auto→0) over 300ms. | Simple, predictable. Gap maintenance via placeholder cells with `opacity: 0`. |
| **List** | `FlatList` (single column). Each row is an `Animated.View`. Removal animates opacity + translateX (slide off). | Most readable from distance. Natural for long question text. |
| **Scattered** | Absolute positioning with pre-calculated coordinates. Questions positioned randomly within bounds. Removal animates opacity + scale (shrink to 0). | Most visually striking. Requires collision detection during layout. Most complex to implement. |

**Recommended for V1**: Grid layout as default. List as fallback. Scattered deferred to P3 (FR-047).

**Gap preservation**: After a question is removed, the cell remains in the FlatList data array with a `status: "removed"` flag. The cell renders as an empty space (same dimensions, transparent). This preserves the board's spatial memory -- guests can see where questions used to be.

**Font scaling**: A `useBoardFontSize` hook calculates font size based on:
```typescript
const baseFontSize = 16; // base for 25+ questions
const maxFontSize = 28; // max for < 5 questions
const remainingCount = questions.filter(q => q.status === 'on-board').length;
const scale = Math.min(1 + (25 - remainingCount) / 25, maxFontSize / baseFontSize);
const fontSize = baseFontSize * scale;
```

### Alternative Considered: react-native-gesture-handler + custom canvas

Using `@shopify/react-native-skia` for a fully custom canvas-based board. Rejected because:
- Overkill for a grid/list of 13-40 items
- FlatList handles item recycling efficiently
- Reanimated already provides the needed animation primitives
- Skia adds ~2MB to bundle size for minimal benefit here

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native-reanimated` | ^3.x | UI-thread animations for question removal |
| `react-native-gesture-handler` | ^2.x | Long-press for reorder (pre-game), tap for select (game night) |
| `@gorhom/bottom-sheet` | ^4.x | Question detail view on tap (pre-game curation) |

---

## 2. Local Chain State Management (Offline Game Night)

### Problem

During game night, the host's device must track the entire chain state -- current turn, inherited question, chosen question, bookmarks -- with zero network dependency. State must survive app backgrounding, force-quit, and device restart. Data must sync to Supabase when connectivity resumes.

### Approach: WatermelonDB with Reactive Queries

**WatermelonDB** is a high-performance reactive database for React Native, built on SQLite. It provides:
- **Lazy loading**: Only loads records when they are needed by a query.
- **Reactive queries**: UI components subscribe to database queries. When a `ChainEntry` is inserted, the chain tracker screen updates automatically.
- **Sync primitives**: Built-in `synchronize()` function implements a pull/push sync protocol compatible with any backend (including Supabase).

**Schema for game night tables**:

```typescript
// db/schema.ts (WatermelonDB schema)
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const confessionAlbumSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'question_items',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'question_id', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'lineage', type: 'string' },
        { name: 'register', type: 'string' },
        { name: 'domain', type: 'string' },
        { name: 'proust_response_1886', type: 'string', isOptional: true },
        { name: 'proust_response_1892', type: 'string', isOptional: true },
        { name: 'board_position', type: 'number' },
        { name: 'status', type: 'string' }, // 'on-board' | 'removed'
      ],
    }),
    tableSchema({
      name: 'chain_entries',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'turn_number', type: 'number' },
        { name: 'player_id', type: 'string' },
        { name: 'inherited_question_id', type: 'string', isOptional: true },
        { name: 'inherited_answer', type: 'string', isOptional: true },
        { name: 'chosen_question_id', type: 'string' },
        { name: 'chosen_answer', type: 'string', isOptional: true },
        { name: 'bookmarked', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'return_entries',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'asker_id', type: 'string' },
        { name: 'target_id', type: 'string' },
        { name: 'question_id', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
```

**Sync strategy**:

1. **Pre-game sync (online)**: When session transitions to ACTIVE, all question items and player order are pulled from Supabase into WatermelonDB. This is the last required network call before game night.
2. **Game night (offline)**: All reads and writes go to WatermelonDB. No network calls.
3. **Post-game sync (online)**: When host ends game night and connectivity is available, all chain_entries and return_entries are pushed to Supabase. The sync uses WatermelonDB's `synchronize()` with a Supabase-compatible adapter.

**Undo implementation**: The undo window (10 seconds) is managed in the Zustand `chainStore`, not in the database. When "Remove" is tapped, the ChainEntry is written to WatermelonDB immediately. If "Undo" is tapped within 10 seconds, the entry is deleted and the question status reverts. The undo timer is a `setTimeout` reference stored in the store.

### Alternative Considered: Expo SQLite (raw)

Direct SQLite via `expo-sqlite` would work but lacks WatermelonDB's reactive query system. The digital board needs to update instantly when a question is removed -- reactive queries provide this without manual state synchronization.

### Alternative Considered: MMKV

`react-native-mmkv` is a fast key-value store. Rejected because chain state is relational (entries reference questions and players) and benefits from indexed queries. MMKV is better suited for simple preferences.

---

## 3. Question Set Filtering and Search UX

### Problem

During pre-game curation, the host browses 200+ questions across 4 lineages, 3 registers, and 8 domains. The interface must support fast filtering, full-text search, and an intuitive add/remove workflow.

### Approach: Filtered FlatList with Chip-Based Filters

**Filter architecture**:

```typescript
interface QuestionFilters {
  lineage: ('classic-proust' | 'vanity-fair' | 'pivot-lipton' | 'thematic-remix')[];
  register: ('light' | 'medium' | 'deep')[];
  domain: string[];
  searchText: string;
  hasProustResponse: boolean | null; // null = no filter
}
```

Filters are applied locally (all questions are in WatermelonDB). With 200+ items and indexed columns, query time is < 50ms.

**UX pattern**:

1. **Lineage selector**: Horizontal chip row at top. Multi-select. Tapping a lineage chip toggles it on/off. When base lineage is selected, all its questions are pre-included.
2. **Register filter**: Three toggle chips (Light / Medium / Deep) below lineage. Color-coded: light = green, medium = amber, deep = crimson.
3. **Search bar**: Full-text search against question text. Debounced at 300ms. Searches locally via WatermelonDB `Q.where('text', Q.sanitizeLikeString(searchText))`.
4. **Results list**: Scrollable FlatList of question cards. Each card shows: question text, lineage badge, register badge, domain tag, Proust indicator (quill icon if proust_response exists). Tap to toggle inclusion in the board set.
5. **Board preview**: Sticky footer showing "13 / 13 suggested" count. Tapping opens full Board Preview screen.

**Performance**: With 200 questions and local queries, the entire filter-search-display cycle completes in < 100ms. No pagination needed.

### Search Implementation

WatermelonDB supports `Q.sanitizeLikeString` for LIKE queries against SQLite FTS. For 200 questions, a simple LIKE query is sufficient. If the content library grows beyond 1000 questions (V2 with content packs), an FTS5 virtual table can be added.

```typescript
// hooks/useQuestionSet.ts
const useFilteredQuestions = (filters: QuestionFilters) => {
  return useQuery(
    database.get<QuestionItem>('content_questions')
      .query(
        Q.and(
          filters.lineage.length > 0
            ? Q.where('lineage', Q.oneOf(filters.lineage))
            : Q.where('lineage', Q.notEq('')),
          filters.register.length > 0
            ? Q.where('register', Q.oneOf(filters.register))
            : Q.where('register', Q.notEq('')),
          filters.searchText
            ? Q.where('text', Q.like(`%${Q.sanitizeLikeString(filters.searchText)}%`))
            : Q.where('text', Q.notEq('')),
        )
      )
  );
};
```

---

## 4. Nunjucks Template Integration for Album Generation

### Problem

The Album (A01), Contributions Table (A02), and Proust's Answer (A03) are generated server-side using existing Nunjucks templates in `artifacts/templates/confession-album/`. The artifact generation pipeline (defined in 006) must receive correctly shaped data from the Confession Album module and produce print-quality PDFs.

### Existing Template Analysis

**the-album.njk** (at `artifacts/templates/confession-album/the-album.njk`):
- Expects: `{ session, players[], questions[], answers[], questionSet }`
- The current fixture (`artifacts/fixtures/confession-album.json`) uses a flat `answers[]` array where each entry has `{ playerId, questionId, text }`.
- The template iterates questions, then filters answers by `questionId` to find matching player answers.

**Gap**: The current template data model does not distinguish between "chooser" and "inheritor." The chain mechanic requires that each question page shows:
- Who chose this question (and their answer)
- Who inherited this question (and their answer)

The current template shows all answers for a question without role attribution.

**Required template data shape for chain integration**:

```typescript
interface AlbumTemplateData {
  session: {
    id: string;
    title: string;
    date: string;
    host: string;
    location: string;
  };
  questionSet: string; // Lineage name for era badge
  players: Array<{ id: string; name: string }>;
  questions: Array<{
    id: string;
    text: string;
    turnNumber: number; // Order in the chain
  }>;
  chain: Array<{
    questionId: string;
    questionText: string;
    chooser: { name: string; answer: string };
    inheritor: { name: string; answer: string } | null; // null for last question
    bookmarked: boolean;
  }>;
  contributions: Array<{
    playerName: string;
    archetype: string;
    description: string;
  }>;
}
```

**Template modification needed**: The `the-album.njk` template's question spread section should iterate `chain` instead of cross-referencing `questions` and `answers`. Each spread shows:
- Question text
- Chooser's answer (with "chose this question" attribution)
- Inheritor's answer (with "inherited this question" attribution)
- Bookmark indicator (gold accent if bookmarked)

**prousts-answer.njk** (at `artifacts/templates/confession-album/prousts-answer.njk`):
- Expects: `{ player, question, playerAnswer, proustAnswer, questionLineage, sessionDate }`
- Already correctly shaped for per-player delivery.
- No modification needed for chain integration.

**contributions-table.njk** (at `artifacts/templates/confession-album/contributions-table.njk`):
- Currently shows a question-by-player completion matrix.
- Needs to be extended (or a new section added) to show contribution archetypes: guest name, archetype, what they brought, description.
- The PRD defines the Contributions Table as "Guest name, archetype, what they brought, their description" (PRD §3.1.10).

### Artifact Data Assembly

The `artifactDataAssembler.ts` service translates between the WatermelonDB/Supabase data model and the template data shapes:

```typescript
// services/confession-album/artifactDataAssembler.ts

export function assembleAlbumData(
  session: Session,
  players: Player[],
  questionItems: QuestionItem[],
  chainEntries: ChainEntry[],
  contributions: ContributionItem[],
): AlbumTemplateData {
  const chain = chainEntries
    .sort((a, b) => a.turn_number - b.turn_number)
    .map(entry => {
      const question = questionItems.find(q => q.id === entry.chosen_question_id);
      const chooser = players.find(p => p.id === entry.player_id);
      // The inheritor is the player in the NEXT turn
      const nextEntry = chainEntries.find(
        e => e.inherited_question_id === entry.chosen_question_id
      );
      const inheritor = nextEntry
        ? players.find(p => p.id === nextEntry.player_id)
        : null;

      return {
        questionId: entry.chosen_question_id,
        questionText: question?.text ?? '',
        chooser: {
          name: chooser?.name ?? 'Unknown',
          answer: entry.chosen_answer ?? '',
        },
        inheritor: inheritor && nextEntry ? {
          name: inheritor.name,
          answer: nextEntry.inherited_answer ?? '',
        } : null,
        bookmarked: entry.bookmarked,
      };
    });

  return {
    session: {
      id: session.id,
      title: session.name,
      date: session.date_time,
      host: session.host_name,
      location: session.location ?? '',
    },
    questionSet: questionItems[0]?.lineage ?? 'Classic',
    players: players.map(p => ({ id: p.id, name: p.name })),
    questions: questionItems
      .filter(q => q.status === 'removed') // Only questions that were actually asked
      .map((q, i) => ({ id: q.id, text: q.text, turnNumber: i + 1 })),
    chain,
    contributions: contributions.map(c => ({
      playerName: players.find(p => p.id === c.player_id)?.name ?? 'Unknown',
      archetype: c.archetype,
      description: c.description,
    })),
  };
}
```

### Rendering Pipeline Integration

The existing `artifacts/src/render.ts` provides `renderPDF()` which:
1. Creates a Nunjucks environment pointed at `artifacts/templates/`
2. Renders the template with provided data
3. Inlines CSS from `artifacts/design-system/`
4. Launches Puppeteer, sets HTML content, and generates PDF

For server-side generation, the same `renderPDF` function is called within the Supabase Edge Function. The Edge Function:
1. Receives the session ID
2. Queries Supabase for session data, chain entries, contributions
3. Calls `assembleAlbumData()` to shape the data
4. Calls `renderPDF({ templateName: 'the-album', data: albumData })`
5. Uploads the resulting PDF to Supabase Storage

**Puppeteer in Edge Functions**: Supabase Edge Functions run on Deno. For PDF generation, the recommended approach is to use a headless Chrome instance via `@browserless/browserless` or a self-hosted Puppeteer service. Alternatively, the generation can run on a dedicated Node.js service (Cloud Run, etc.) called by the Edge Function. This is an architectural decision for 006-artifact-pipeline.

---

## 5. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Board animation library | React Native Reanimated v3 | UI-thread animations, 60fps, mature ecosystem |
| Board layout V1 | Grid + List (Scattered deferred) | Simplicity gate. Grid covers 90% of use cases. |
| Local database | WatermelonDB | Reactive queries for board updates, sync primitives |
| State management | Zustand | Lightweight, TypeScript-native, per-feature stores |
| Question search | WatermelonDB LIKE queries | Sufficient for 200 items. FTS5 upgrade path if needed. |
| Artifact data assembly | Dedicated assembler service | Clean separation between game data model and template data shape |
| Template modification | Extend the-album.njk for chain pairings | Existing template is close; needs chooser/inheritor attribution |
| Undo mechanism | Zustand timer + WatermelonDB delete | Simple, avoids complex state branching |
