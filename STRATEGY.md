# Ephemera Engine — Mobile App Research & Strategy

A research synthesis and strategic framework for launching the Parlor Games: Ephemera Engine as iOS/Android mobile applications.

---

## Context

The Parlor Games: Ephemera Engine is currently a DESIGN_ONLY project containing four fully designed analog parlor games:

1. **Murder Mystery** — immersive whodunit with character sheets, contributions, investigation
2. **Whose Memory?** — anonymous storytelling and attribution game
3. **The Confession Album** — chain-answering Proust Questionnaire with diminishing board
4. **The Exquisite Corpse** — cut-up / story spine collaborative fiction game

This document synthesizes research across parlor game history, game design theory, market landscape, technical architecture, and identifies underexplored pillars to inform the product strategy.

---

## Pillar 1: Historical & Cultural Foundation

### The Confession Album Lineage

Victorian confession albums were commercially printed books kept on parlor tables (late 19th century Britain). Proust filled one out at age 13 (1886) and again at 20 (1892); his responses auctioned for $34,000 in 2003. Modern descendants: Vanity Fair back page (since 1993), Bernard Pivot's *Bouillon de Culture*, James Lipton's *Inside the Actors Studio*.

The Proust Questionnaire has built-in cultural cachet — name recognition across educated audiences.

### The Parlor Game → Digital Arc

Victorian parlor games died with mass media (radio, cinema, TV replaced room-based entertainment). Board game renaissance began ~2010s (Settlers of Catan era), accelerated through pandemic:

- Escape rooms: $12.7B market (2024), growing at 14.8% CAGR
- Immersive theater (Sleep No More, Punchdrunk): advancing at 24.23% CAGR, now 4% of the $144B immersive entertainment market
- U.S. immersive entertainment projected to reach $281B by 2033

### The Dinner Party Renaissance (2024–2025)

Gen Z and Millennials are reviving hosted gatherings as a cultural response to digital fatigue:

- Pinterest/Instagram searches for "dinner party dining" up 160% YoY
- Themed, curated home gatherings replacing bar/restaurant nightlife
- "Experiences over possessions" as generational value — this is the Ephemera Engine's target audience

---

## Pillar 2: The Science of Structured Intimacy

### Arthur Aron's 36 Questions (1997)

Demonstrated that structured, escalating, reciprocal self-disclosure between strangers produces measurable closeness. "You don't want to share too much, too fast. What works best is back-and-forth self-disclosure that increases gradually." One couple from the study later married; the questions have been used in hundreds of subsequent studies.

The Ephemera Engine's three-act structure (establishment → core game → reveal) mirrors Aron's escalating disclosure model. **This is scientific validation of the core mechanic** — structured question games produce real intimacy.

### The Magic Circle (Huizinga, 1938 / Salen & Zimmerman, 2003)

Games create a "separate, defined space" where special rules apply — a "place of predictability and order in an otherwise chaotic world." The magic circle is what makes vulnerability safe: players can say things inside a game they would never volunteer unprompted.

The Proust Questionnaire's genius: it asks about *preferences and ideals*, not facts — players feel safe precisely because the questions seem harmless, and reveal more than they intend.

**Design implication**: the app must protect the magic circle. The phone should scaffold the game without breaking the spell of the room.

---

## Pillar 3: The Loneliness Economy

### The Crisis

- U.S. Surgeon General declared loneliness an epidemic (2023); 1 in 5 American adults report feeling lonely *every single day* (Gallup)
- Upper 25% of social media users are 2x as likely to experience loneliness (Oregon State)
- Those who socialize at least monthly report decreased loneliness post-pandemic, but frequent socializers paradoxically report *increased* loneliness — quality over quantity
- Japan approved robot companions for elderly (2025) — the loneliness economy is being addressed by technology, but mostly badly

### The Opportunity

New connection apps (Wyzr, TimeLeft, Pawmates) are trying to solve this but focus on *stranger matching*. The Ephemera Engine is different: it deepens connections between people who *already know each other* (or are about to). It doesn't find you friends — it makes the friends you have more real to you.

**Positioning**: not a social network, not a dating app, not a stranger-matching service. A tool for the people who already host, who already gather, who want those gatherings to be meaningful.

---

## Pillar 4: Competitive Landscape

### Direct Competitors (Digital Party Games)

| Product | Model | What It Does | Gap |
|---------|-------|-------------|-----|
| **Jackbox Games** | $29.99/pack, 11 packs, phone-as-controller | Comedy party games for groups of 3–8+ | No pre-game, no post-game, no intimacy — entertainment only |
| **We're Not Really Strangers** | Physical card game ($25) + expansion packs | Escalating intimacy questions in 3 levels (perception → connection → reflection) | No hosting structure, no artifacts, no game *night* design |
| **{THE AND}** by Skin Deep | Physical cards ($25–35) per edition | Relationship-specific question cards based on Emmy-winning documentary | Narrowly couples-focused, no group play, no event design |
| **Mystery Night App** | Web app, per-game purchase | Digital murder mystery with character delivery via phone | Replaces analog play rather than scaffolding it; no post-game artifacts |
| **Night of Mystery** | Downloadable kits, $20–35 | Printable murder mystery party packages | DIY PDFs, no digital orchestration, no procedural generation |
| **Shot in the Dark** | Downloadable kits, $25–40 | Interactive mingle or dinner party murder mystery | Same as Night of Mystery — static kits, no app layer |

### The White Space

No existing product combines:

1. Pre-game anticipation building (days/weeks before)
2. Real-time analog game facilitation (game night)
3. Beautiful post-game artifact generation (physical/digital keepsakes)
4. Multiple game types in a single platform (not just murder mystery OR just questions)
5. Procedural + curated + player-driven content (the replayability trinity)
6. LLM-powered scenario generation

---

## Pillar 5: Game Design for the Phone-as-Scaffold Model

### The Critical Distinction

"The game is on the phone" vs. "the phone enables the game in the room." The Ephemera Engine must be the latter. From the design document: "Analog warmth, digital scaffolding. The games live in the room, between people. Technology may generate the scenario, coordinate the menu, or compile the post-game artifact — but during the evening, the screen is dark."

### Lifecycle UX Pattern (Unique to This Product)

```
PRE-GAME (days/weeks)          GAME NIGHT (hours)           POST-GAME (days)
─────────────────────          ──────────────────           ────────────────
Async, individual              Sync, in-room                Async, individual
High phone engagement          Minimal phone use            Medium phone engagement
                               ("screen dark" principle)
• Create game session          • Host dashboard only        • Artifact generation
• Send invitations             • Timer/phase cues           • Album/dossier/zine PDF
• Assign roles/prompts         • Reveal orchestration       • Delayed letters/prompts
• Track contributions          • Voting/scoring             • Proust's answers
• Collect submissions          • Emergency reference        • Host's afterword
• Build anticipation           • The room IS the game       • Memory preservation
```

Jackbox's phone-as-controller model validates the hardware: one host device (TV/tablet) + player phones. But Jackbox is real-time-only with no lifecycle. The Ephemera Engine extends this to a multi-day arc.

---

## Pillar 6: Technical Architecture

### Framework Recommendation: React Native

Rationale:

- Primary stack is TypeScript — direct skill leverage
- React Native's ecosystem has mature libraries for: push notifications, offline storage, PDF generation, camera/photo, deep linking
- Flutter has marginally better rendering performance but TypeScript familiarity outweighs this for a solo/small team
- New Architecture (Hermes engine, TurboModules) has closed the performance gap
- Expo framework simplifies builds, OTA updates, push notifications

### Key Technical Components

| Component | Purpose | Libraries/Services |
|-----------|---------|-------------------|
| **Group/Session Management** | Create games, invite players, track RSVPs | Supabase or Firebase for real-time + auth |
| **Content Delivery** | Character sheets, question sets, prompts | Local content bundles + CDN for packs |
| **Push Notifications** | Pre-game reminders, contribution deadlines, post-game delivery | Expo Notifications / Firebase Cloud Messaging |
| **Artifact Generation** | Confession albums, dossiers, anthologies as beautiful PDFs | react-native-pdf-lib (on-device) or server-side with Puppeteer/wkhtmltopdf |
| **Offline Mode** | Game night must work without internet | WatermelonDB or SQLite for local-first |
| **LLM Integration** | Procedural scenario/character/question generation | Claude API (server-side, not on-device) |
| **Print-on-Demand Bridge** | Physical artifact fulfillment (stretch goal) | Lulu API, Peecho, or Blurb API |
| **Real-time Sync** | Host dashboard, voting, reveals during game night | Supabase Realtime or WebSockets |

---

## Pillar 7: Monetization Strategy

### Recommended Model: Premium App + Content Packs

- **Base app**: $9.99 one-time purchase. Includes the full framework + one game (The Confession Album — lowest host burden, broadest audience, fastest to experience value)
- **Game packs**: $4.99–$6.99 each (Murder Mystery, Whose Memory?, The Exquisite Corpse, future games)
- **Content expansions**: $2.99–$3.99 (new question lineages, new murder mystery setting seeds, new story themes, new structural templates)
- **Season pass / subscription**: $14.99/year for all new content as released
- **Premium artifacts**: $4.99–$9.99 per print-on-demand physical album/dossier (stretch goal — real revenue, real delight)

**Why NOT freemium/ads**: Ads destroy the magic circle. A game about intimacy and vulnerability cannot interrupt itself with a banner ad. The audience (dinner party hosts, 25–45, experience-oriented) will pay for quality.

**Why NOT subscription-only**: The games are played occasionally (monthly at most). A subscription feels extractive for a product used 6–12 times per year. The content pack model matches usage patterns.

---

## Pillar 8: Underexplored Pillars

### 1. Accessibility & Inclusion

- Neurodivergent players face barriers with time pressure, social performance demands, and sensory overload
- The Confession Album's "unhurried, no timer" design is naturally accommodating — but the app should formalize this: optional written-answer mode (type instead of speak), pass/skip mechanics without stigma, quiet-room cues for hosts
- Non-native English speakers: question sets should be available in multiple languages, or at minimum written in clear, culturally translatable English
- Physical accessibility: the "approach the board" mechanic needs a digital fallback for mobility-impaired players (the app shows the board; they select from their phone)
- **Recommendation**: build an accessibility philosophy into the product identity, not as an afterthought

### 2. The Host Economy

- The app's real user is **the host**, not the player. The host is the one who downloads, pays, prepares, and orchestrates. Players may never install the app (web-based join via link, à la Jackbox)
- Host tools are the premium: game setup wizard, contribution tracker, pacing dashboard, post-game compiler
- **"Host as player" principle from DESIGN.md must carry into the app** — the host dashboard should feel like a creative tool, not an admin panel

### 3. Content Curation & Moderation

- If players submit stories (Whose Memory?) or answers (Confession Album), the app handles personal, potentially sensitive content
- Privacy by design: submissions should be end-to-end encrypted or at minimum never stored on remote servers beyond the game session
- No social feed, no public profiles, no sharing to Instagram. The content belongs to the room.

### 4. Ritual Design / Ceremony Architecture

- The games as designed have strong ritual structure (invitation → gathering → activity → reflection → artifact → coda). This is closer to ceremony design than game design.
- Look at: liturgical design, retreat facilitation, Quaker meeting structure, Japanese tea ceremony — all are "designed experiences with phases that create meaning through form"
- The app should feel like a *ritual guide*, not a game controller. Warm, typographically beautiful, unhurried. The antithesis of a notification-heavy productivity app.

### 5. Network Effects & Community

- This is NOT a social network. But there are network effects: a great host invites 8 people, 3 of whom become hosts themselves. The growth model is viral through in-person experience, not through sharing.
- A "host community" (private, curated) could share game reports, custom question sets, and hosting tips
- User-generated content: hosts creating and sharing custom question lineages, murder mystery settings, story themes

### 6. Intellectual Property & Licensing

- The Proust Questionnaire itself is public domain
- Vanity Fair's specific questions are editorial content (fair use for inspiration, not verbatim reproduction)
- Pivot/Lipton questions are from broadcast — similar fair use considerations
- Original questions for the Ephemera Engine are owned IP and a competitive moat
- The *game mechanics* are not patentable, but the content library, artifact templates, and brand are protectable

### 7. Educator & Facilitator Market

- Originally run as a college course icebreaker — there is a clear B2B/institutional angle
- Corporate team building, retreat facilitation, therapy groups, religious communities, writing workshops
- An "Educator Edition" or "Facilitator License" with bulk pricing, custom branding, and reporting

---

## Deep Dive A: Ritual & Ceremony Design Theory

The Ephemera Engine's three-phase structure (pre-game → game night → post-game) is not a game lifecycle — it is a **ritual arc**. Understanding this reframes every design decision.

### Van Gennep / Turner: The Three Phases of Ritual

Arnold van Gennep (1909) identified three universal phases in rites of passage. Victor Turner (1969) expanded them into a general theory of transformation:

| Phase | Ritual Term | Ephemera Engine Equivalent |
|-------|------------|---------------------------|
| **Separation** | Detachment from ordinary life; crossing a threshold | **Pre-game**: the invitation arrives, roles are assigned, contributions are prepared. Guests leave their everyday selves and begin to inhabit the evening's logic. |
| **Liminality** | The "betwixt and between" — normal rules suspended, communitas emerges | **Game night**: the magic circle is open. Players are neither their ordinary selves nor fictional characters, but something in between. Hierarchy dissolves. Vulnerability becomes possible. |
| **Incorporation** | Return to ordinary life, transformed; new status or knowledge | **Post-game**: artifacts arrive. The confession album, the dossier, the anthology. The evening becomes memory. Proust's Answer arrives a week later — the final threshold back to the everyday, carrying something new. |

### Turner's "Communitas"

In the liminal phase, participants are stripped of their normal social roles and enter a state Turner called **communitas** — intense, egalitarian, unstructured togetherness. This is the feeling the Ephemera Engine is designed to produce: the moment when a room full of acquaintances becomes, briefly, a room full of people who *know* each other.

Turner distinguished **spontaneous communitas** (the raw experience) from **normative communitas** (rituals designed to reliably produce it). The Ephemera Engine is a normative communitas machine — a designed structure that creates the conditions for spontaneous connection.

### Turner's "Liminoid" — Games as Voluntary Ritual

Turner coined "liminoid" to describe liminal-like experiences that are voluntary and don't involve a life-status change — concerts, theater, games. The Ephemera Engine is liminoid: optional, bounded, but genuinely transformative within its scope. Players emerge knowing each other differently.

### Japanese Tea Ceremony as Design Precedent

The chanoyu (tea ceremony) is the clearest analog for the Ephemera Engine's design philosophy:

- **Spatial threshold**: guests pass through a garden (roji), wash at a stone basin (tsukubai), enter through a deliberately small door (nijiri-guchi) that forces everyone — regardless of rank — to bow. The Ephemera Engine's invitation and pre-game serve the same function: preparing the mind, crossing a threshold.
- **Ichigo-ichie** ("one time, one meeting"): every tea gathering is understood as unrepeatable. This is literally the Ephemera Engine's design ethos: "played once, remembered always, repeated never."
- **Wabi-sabi**: beauty in imperfection and transience. The confession album is handmade, not perfect. The zine is stapled, not bound. The ephemera is the point.
- **Ma** (negative space): silence and pause are designed into the ceremony. The Ephemera Engine's "no timer, unhurried" principle is ma.
- **The host as artist**: in chanoyu, the host selects every element — scroll, flower, tea bowl, sweet — to create a unified aesthetic experience for guests. The Ephemera Engine host does the same: question set, contribution brief, board design, pacing.

### Design Implications

- The app's UI should embody ritual aesthetics: transitions between phases should feel like crossing thresholds, not loading screens
- Typography, color, and pacing in the app should echo the register of the games themselves — contemplative, warm, unhurried
- The app is a **ritual guide** — it tells the host what to do when, helps them prepare the space, and then steps back. During game night, the phone is a candle on the table, not a flashlight in the face.

---

## Deep Dive B: Educator & Facilitator Market

### Market Size

- Global team building service market: **$3.2B in 2025 → $9.9B by 2033** (20.16% CAGR)
- Games sub-segment alone: $350M with 12.5% CAGR
- Virtual team building: $8.91B in 2025, growing to $15B by 2035

### Use Cases Beyond Dinner Parties

| Segment | Game Fit | Notes |
|---------|----------|-------|
| **College courses** | Confession Album, Whose Memory? | Original use case. Icebreakers, writing workshops, first-week orientation. |
| **Corporate team building** | All games | Offsites, retreats, new-team formation. Companies pay $50–200/person for facilitated experiences. |
| **Retreat facilitation** | Confession Album, Whose Memory? | Yoga retreats, leadership retreats, religious retreats. The contemplative register fits. |
| **Therapy / support groups** | Confession Album (adapted) | Structured self-disclosure is a therapeutic technique. Requires careful question curation. |
| **Writing workshops** | The Exquisite Corpse, Whose Memory? | Writers are the natural audience for collaborative narrative games. |
| **Wedding events** | Confession Album, Whose Memory? | Rehearsal dinners, bridal showers, anniversary parties. The artifact (album/anthology) becomes a keepsake. |
| **Community organizations** | All games | Book clubs, Rotary clubs, religious congregations, neighborhood associations. |

### B2B Pricing Model

- **Facilitator License**: $99–199/year. Unlimited plays, custom branding (their logo on artifacts), analytics (participation rates, engagement), bulk player access.
- **Institutional Site License**: $499–999/year. Multiple facilitators, custom question banks, organization-wide content library.
- **Per-event pricing**: $29–49/event for one-time facilitators (e.g., wedding planner running one game).
- **White-label**: $2,000+ custom setup for large organizations wanting fully branded experience.

### Distribution Strategy

- Partner with facilitation platforms (SessionLab, Mural, Butter) for visibility
- Educator conference presence (SXSW EDU, ISTE, ATD)
- Content marketing: "How to run a Proust Questionnaire at your next offsite" — the Proust name does the SEO work
- Free tier for educators: one game, up to 15 players, basic artifact generation

---

## Deep Dive C: Artifact Generation Technical Architecture

The post-game artifact is the Ephemera Engine's most distinctive feature and its hardest technical challenge. The artifact must be *beautiful* — not functional, not adequate, but genuinely beautiful. A confession album that looks like a database printout has failed.

### The Artifact Types

| Game | Artifact | Format | Content |
|------|----------|--------|---------|
| Murder Mystery | The Dossier | Case file / broadsheet | Timeline, accusations, true solution, society page photo |
| Murder Mystery | Menu of the Damned | Recipe card collection | Character-attributed cocktails and dishes |
| Whose Memory? | The Anthology | Stapled zine / booklet | Stories with author reveals, guess map |
| Confession Album | The Album | Saddle-stitched booklet | Questions with paired answers, contributor table |
| Confession Album | Proust's Answer | Letter / card | Personal letter with Proust's historical response |
| The Exquisite Corpse | The Chapbook | Literary magazine / zine | All assembled texts, colophon, fragment census |

### Technical Approaches (Ranked)

**1. Server-Side HTML → PDF (Recommended for V1)**

- Render beautiful HTML/CSS templates on a server (Node.js + Puppeteer, or Playwright)
- Full control over typography (web fonts, OpenType features, ligatures)
- Can produce print-ready PDFs with bleed, crop marks, and CMYK color
- The host triggers generation; PDF delivered via push notification or in-app download
- **Limitation**: requires internet connectivity for generation (acceptable — post-game, not game night)
- **Libraries**: Puppeteer, Playwright, Prince XML (premium, best typographic output), WeasyPrint (Python), react-pdf (server-side React components → PDF)

**2. On-Device HTML → PDF (Fallback)**

- React Native HTML to PDF: transforms HTML to PDF on-device
- Good for immediate "draft" artifacts; limited typographic control
- Useful for offline generation or instant preview
- **Libraries**: react-native-html-to-pdf, expo-print

**3. Template-Based PDF (Hybrid)**

- Pre-designed PDF templates with fillable fields (like a form)
- Use pdf-lib (JavaScript) to programmatically fill templates with game data
- Best for fixed-layout artifacts (Proust's Answer letters, recipe cards)
- **Libraries**: pdf-lib, pdfme (WYSIWYG template editor)

**4. Print-on-Demand Integration (Stretch Goal)**

- **Lulu API** (developers.lulu.com): full POD API, supports booklets, global fulfillment. Note: Lulu discontinued saddle-stitched printing for distribution in 2025 — perfect binding or stapled alternatives needed.
- **Peecho API** (peecho.com/print-api-documentation): global dropshipping, print API
- **Blurb API** (blurb.com/print-api-software): fully integrated POD
- Workflow: app generates print-ready PDF → uploads to POD API → physical booklet shipped to each guest
- **This is a genuine premium differentiator** — no competitor ships physical artifacts

### Typography & Design System for Artifacts

The artifacts need a coherent design language:

- **Display typeface**: a serif with personality (for questions, titles, section headers). Candidates: Playfair Display, Cormorant Garamond, EB Garamond (all open source).
- **Body typeface**: readable, warm serif for answers and narrative text. Candidates: Lora, Source Serif Pro, Literata.
- **Monospace/accent**: for labels, dates, player names. Candidates: JetBrains Mono, IBM Plex Mono.
- **Paper texture**: subtle background texture in digital PDFs to evoke physicality.
- **Color palette per game**:
  - Confession Album: warm cream, deep green, gold
  - Murder Mystery: noir — black, white, red accent
  - Whose Memory?: soft blues, kraft brown
  - The Exquisite Corpse: off-white, deep violet, charcoal

---

## Strategic Decisions

| Decision | Resolution |
|----------|-----------|
| **Scope** | Research & strategy document (no implementation plan yet) |
| **Launch games** | All games simultaneously — the platform ships complete |
| **Player access** | Hybrid: web join for game night, optional app install for pre/post-game features |
| **Game 4** | "The Exquisite Corpse" — cut-up / story spine collaborative fiction game (full design in DESIGN.md) |

---

## Recommended Next Steps

### Immediate (Design Phase)

1. **Create a Product Requirements Document (PRD)** — translate DESIGN.md's game designs into app features, screens, and user flows
2. **Design the artifact template system** — visual design for each game's post-game artifacts (confession album, dossier, anthology, chapbook)
3. **Build the content library** — 200+ Proust questions, 30+ era packets, 100+ story themes, 50+ structural templates, fragment prompt variations, constraint sets

### Medium-term (Architecture Phase)

4. **Technical architecture document** — data models, API design, auth flow, real-time sync strategy, offline-first patterns
5. **Choose backend** — Supabase (recommended for speed) vs custom (more control)
6. **Prototype artifact generation** — HTML/CSS templates → PDF pipeline proof of concept
7. **Map the educator/facilitator edition** — pricing, custom branding, institutional features

### Pre-Launch

8. **Brand identity** — name, visual language, App Store presence, landing page
9. **Content marketing** — "The History of the Proust Questionnaire" article, "How to Host a Murder Mystery" guide — SEO assets that establish authority before the app exists
10. **Beta program** — 10–20 hosts running real games with the app, providing feedback

---

## Sources

### Historical & Cultural

- [Proust Questionnaire — Wikipedia](https://en.wikipedia.org/wiki/Proust_Questionnaire)
- [Confession Album — Wikipedia](https://en.wikipedia.org/wiki/Confession_album)
- [Victorian Parlour Games — Chronicle Books](https://www.chroniclebooks.com/products/victorian-parlour-games)
- [Exquisite Corpse — Wikipedia](https://en.wikipedia.org/wiki/Exquisite_corpse)
- [Exquisite Corpse — MoMA](https://www.moma.org/collection/terms/exquisite-corpse)
- [Exquisite Corpse — Artsy](https://www.artsy.net/article/artsy-editorial-explaining-exquisite-corpse-surrealist-drawing-game-die)
- [The Story Spine — Aerogramme Studio](https://www.aerogrammestudio.com/2013/03/22/the-story-spine-pixars-4th-rule-of-storytelling/)
- [Story Spine — Kindlepreneur](https://kindlepreneur.com/story-spine/)

### Cultural Moment

- [Gen Z Dinner Parties: The Comeback Trend of 2025](https://3bhealthcare.us/gen-z-dinner-parties/)
- [Gen Z is Hosting A New Era of Dinner Parties — YPulse](https://www.ypulse.com/article/2025/09/15/gen-z-is-hosting-a-new-era-of-dinner-parties/)
- [Retro Dinner Party Culture — Style Rave](https://www.stylerave.com/retro-dinner-culture-party/)
- [Loneliness Epidemic — UCHealth](https://www.uchealth.com/en/media-room/articles/the-loneliness-epidemic-escaping-post-pandemic-social-isolation/)
- [Loneliness in U.S. Adults — Oregon State](https://health.oregonstate.edu/news-and-stories/2025-10/loneliness-us-adults-linked-amount-frequency-social-media-use)
- [The Loneliness Economy — Psychology Today](https://www.psychologytoday.com/us/blog/raising-resilient-children/202510/welcome-to-the-loneliness-economy)
- [Apps Solving Loneliness — NPR](https://www.npr.org/2025/03/20/nx-s1-5328750/lonely-theres-an-app-for-that)

### Game Design & Science

- [Arthur Aron's 36 Questions — UC Berkeley Greater Good](https://ggia.berkeley.edu/practice/36_questions_for_increasing_closeness)
- [Creating Love in the Lab — UC](https://www.universityofcalifornia.edu/news/creating-love-lab-36-questions-spark-intimacy)
- [Magic Circle — Wikipedia](https://en.wikipedia.org/wiki/Magic_circle_(games))
- [Victor Turner: Liminality and Communitas (PDF)](https://voidnetwork.gr/wp-content/uploads/2016/09/Liminality-and-Communitas-by-Victor-Turner.pdf)
- [How to Design a Social Game — Game Developer](https://www.gamedeveloper.com/business/how-to-design-a-social-game)
- [Kind Games: Designing for Prosocial Multiplayer — Polaris](https://polarisgamedesign.com/2022/kind-games-designing-for-prosocial-multiplayer/)

### Market & Competition

- [U.S. Immersive Entertainment Market — $281B by 2033](https://www.businesswire.com/news/home/20251202780657/en/)
- [Immersive Entertainment Market — Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/immersive-entertainment-market)
- [Escape Room Market — Verified Market Research](https://www.verifiedmarketresearch.com/product/escape-room-market/)
- [Team Building Service Market — $9.9B by 2033](https://www.businessresearchinsights.com/market-reports/team-building-service-market-119280)
- [Playing Cards & Board Games Market — $38.5B by 2033](https://www.imarcgroup.com/playing-cards-board-games-market)
- [Jackbox Games — Wikipedia](https://en.wikipedia.org/wiki/Jackbox_Games)
- [Jackbox Games — Game Developer Interview](https://www.gamedeveloper.com/business/allard-laban-dives-into-the-past-present-and-future-of-jackbox-games)
- [We're Not Really Strangers — Wikipedia](https://en.wikipedia.org/wiki/We%27re_Not_Really_Strangers)
- [Mystery Night App](https://mysterynightapp.com/)
- [Night of Mystery](https://www.nightofmystery.com/)
- [Shot in the Dark Mysteries](https://www.shotinthedarkmysteries.com/)

### Technical

- [Flutter vs React Native 2026 — CrustLab](https://crustlab.com/blog/flutter-vs-react-native/)
- [react-native-pdf-lib — GitHub](https://github.com/Hopding/react-native-pdf-lib)
- [PDF Generation in React Native — APITemplate.io](https://apitemplate.io/blog/how-to-generate-pdfs-in-react-native-using-html-and-css/)
- [Lulu Print API](https://developers.lulu.com/)
- [Peecho Print API](https://www.peecho.com/print-api-documentation)
- [Blurb Print API](https://www.blurb.com/print-api-software)
- [App Monetization 2025 — ASO Mobile](https://asomobile.net/en/blog/mobile-market-money-app-monetization-in-2025/)
- [Game Monetization Guide 2025 — Applixir](https://www.applixir.com/blog/the-ultimate-game-monetization-strategy-guide-in-2025-and-beyond/)
- [LLMs for Video Games: Narrative Generation — NHSJS](https://nhsjs.com/2025/llms-for-video-games-narrative-generation/)

### Accessibility & Inclusion

- [Neurodivergent Game Accessibility — MDPI](https://www.mdpi.com/2673-7272/6/1/18)
- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/)
- [Designing Neurodiverse-Friendly Games — Wayline](https://www.wayline.io/blog/designing-neurodiverse-friendly-games)

### Ritual & Ceremony

- [Liminality — Wikipedia](https://en.wikipedia.org/wiki/Liminality)
- [Japanese Tea Ceremony — Wikipedia](https://en.wikipedia.org/wiki/Japanese_tea_ceremony)
- [Architecture as Ritual — Dök Mimarlık](https://dokmimarlik.com/en/architecture-as-ritual-tea-rooms-temples-and-silence/)
- [Communitas Revisited — SAGE Journals (2025)](https://journals.sagepub.com/doi/10.1177/14634996241282143)

---

*Research synthesized for the Ephemera Engine. The path from here to a shipping app begins with the PRD.*
