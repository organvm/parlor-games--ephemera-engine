# Parlor Games: Ephemera Engine

## Series Design Document

A system for unrepeatable social games that privilege human interaction, creative contribution, and the residue of an evening that can never be reconstructed.

---

## I. Series Framework

### Three-Phase Structure

Every game in the series inherits this architecture. No phase is logistics — each is a designed experience.

| Phase | Timeframe | Purpose |
|-------|-----------|---------|
| **Pre-Game** | Days to weeks before | Assignment, preparation, anticipation-building. The first act. |
| **Game Night** | The evening itself | Live interaction, performance, revelation |
| **Post-Game** | Hours to days after | Artifact creation, memory preservation, narrative closure |

### The Replayability Trinity

Every game draws from all three sources of uniqueness simultaneously. If any leg is missing, the game becomes either sterile (no player input), repetitive (no procedural variation), or shallow (no authored depth).

**Procedural** — Algorithmic recombination of roles, prompts, scenarios, and constraints. No two configurations are identical. The system generates; it does not merely shuffle.

**Curated Library** — Hand-authored content pools (character archetypes, settings, story prompts, thematic palettes) deep enough to sustain dozens of plays. Each element is crafted, not random. The library gives the procedural engine good raw material.

**Player-Driven** — The players themselves supply irreplaceable content: their own stories, choices, improvisations, food, dress, and presence. This is the guarantee of true unrepeatability. No algorithm can reproduce what seven specific people did on a Tuesday in October.

### Design Principles

**Ephemera over permanence.** The best moments are the ones you had to be there for. The post-game preserves traces, not recordings. A case file, not a transcript. A zine, not a video.

**Preparation is play.** Pre-game is not logistics — it's the first act. Receiving your character sheet, choosing what to cook, deciding what story to tell — these are creative acts that build anticipation and investment. The game begins when the envelope arrives.

**No spectators.** Every guest has a role, a stake, a secret. No one watches. The wallflower gets the most dangerous secret. The shy guest gets the most compelling prop to present. The design must make participation irresistible and non-participation impossible.

**Analog warmth, digital scaffolding.** The games live in the room, between people. Technology may generate the scenario, coordinate the menu, or compile the post-game artifact — but during the evening, the screen is dark. Cards, not apps. Conversation, not interfaces.

**The host is a player.** The host has a role, not just responsibilities. They are the narrator, the detective, the editor — but also a character with secrets and stakes. Hosting is a creative act, not event management. In the Confession Album, the host answers the first question as a warm-up to set the tone, but is not in the rotating chain — their role during The Chain is facilitator, pacing the evening and managing the board. In Murder Mystery, the host is in character as the evening's convener.

---

## II. Game 1: Murder Mystery

### Concept

A fully immersive murder mystery where pre-game transforms guests into characters weeks before the party. Unlike commercial murder mystery kits, this system generates unique scenarios from combinatorial seeds and deeply involves guests in world-building through their contributions — food, drink, dress, and props that are narratively motivated, not decorative.

The murder is not a puzzle to solve. It is a story to inhabit.

### Player Count
6–12 guests + host

### Intimacy Level
Acquaintances or better. Requires willingness to perform.

---

### Pre-Game (2–4 weeks before)

#### Host Setup

The host selects — or the system generates — a **Setting Seed** composed of four elements:

| Element | Examples |
|---------|----------|
| **Era** | 1928, 1962, 1887, 2003, 1745 |
| **Location** | Riviera villa, Manhattan penthouse, Kyoto ryokan, Patagonian estancia, Venetian palazzo |
| **Social Milieu** | Art world, diplomatic corps, theatrical troupe, shipping dynasty, academic conference |
| **Central Tension** | An art theft ring, a contested inheritance, a defection, a poisoning, a vanished manuscript |

These four axes are combinatorial. Era × Location × Milieu × Tension produces thousands of unique scenarios before any character generation begins.

The host also sets practical parameters: guest count, dietary restrictions, venue constraints, and any accessibility considerations.

#### Role Assignment Packet

Each guest receives a sealed packet (physical or digital) containing:

**1. Character Sheet**

- Full name, occupation, and public reputation
- A personality sketch: 2–3 sentences establishing voice, temperament, and social posture
- One secret: something the character is hiding, relevant to the crime <!-- allow-secret -->
- One or more relationships to other characters: defined by role, not by player ("You owe a great debt to the art dealer" — but the guest doesn't yet know who plays the art dealer). Relationship types include ally, rival, secret, obligation, kin, and professional. Complex motive geometry requires multiple relationship edges per character.

**2. Contribution Brief**

Each guest's contribution to the evening is narratively motivated, not arbitrary:

- **Food or drink**: Tied to their character's identity. "Your character is a Marseille spice merchant — bring a cocktail or appetizer that tells that story." The brief suggests a direction, not a recipe. Guests interpret freely.
- **Dress code**: A color palette, a silhouette suggestion, and one signature accessory tied to character and era. Not a costume — a direction. "Deep jewel tones. Something with structure. You carry a pocket watch you never look at."
- **Prop or artifact**: One object their character would carry. A letter, a locket, a business card, a map fragment, a pressed flower, a key. The prop has narrative significance that may or may not become relevant during the game.

**3. Preparation Prompts**

2–3 questions to answer privately before game night. These answers become ammunition for gameplay — they're the character's inner life, generated by the player's creativity:

- "What is your character's alibi for the evening of the crime?"
- "What do you owe the victim?"
- "What would you kill to protect?"
- "What is the last thing you said to the deceased?"

Answers are submitted to the host before game night.

**4. Coordination Channel**

A host-mediated back-channel (group chat, shared doc) where guests see the emerging menu and drink list. They can riff off each other's contributions ("I see someone's bringing a gin fizz — I'll make mine a bitter counterpoint") without breaking character secrecy. The menu becomes a collaborative creative act.

#### The Murder Itself

Designed by the host (or generated by the system) but not yet revealed to any guest:

- The victim, the murderer, the weapon, and the motive are derived from the character relationship graph
- The murderer does not know they are the murderer until game night (or knows but doesn't know the full picture)
- 2–3 red herrings are baked into character secrets — plausible alternative motives and suspicious behavior
- A timeline of the evening (within the fiction) is generated, with 4–6 key events that must occur at specific dramatic beats

---

### Game Night

#### Act I — Arrival & Establishment (45 minutes)

Guests arrive in character. The host — also in character as the evening's convener — introduces the setting and the occasion within the fiction: "Welcome to the Villa Soleil for the unveiling of Madame Arceneaux's private collection..."

Each guest presents their contributions as a small performance moment:
- The cocktail they brought, introduced with a line in character
- The dish, placed on the table with its story
- Their prop, worn or carried, available for others to notice and inquire about

Social mixing in character. Characters discover their relationships organically through conversation. ("Ah, so YOU'RE the one who sold my father that painting...") The host guides introductions if needed but lets the room find its own rhythm.

By the end of Act I, every guest should have:
- Introduced themselves in character
- Discovered at least one relationship
- Presented their contribution
- Begun to suspect something is wrong

#### Act II — The Crime (30 minutes)

A triggering event shatters the evening's surface. The host orchestrates the moment:
- Discovery of the body (a prop, a dramatic announcement, a guest who was "away" returning with news)
- Or: revelation of a theft, a confession, a collapse
- The tone shifts from social to investigative

**Clue distribution** operates on two channels:
- **Physical clues**: Cards or objects placed around the venue before the party. Guests must search the space. Clues are cryptic enough to require interpretation.
- **Character knowledge**: Each guest has information only they possess (from their preparation prompts and character sheet). This knowledge is revealed through conversation, not cards.

**Structured interrogation rounds**: The host divides guests into rotating pairs or trios. A timer (5–7 minutes per round) or host cue rotates groups. Each rotation is a chance to question, lie, accuse, or confide. Guests take notes.

Between rounds, the host may introduce new evidence — a telegram arrives, a second object is found missing, a witness changes their story.

#### Act III — Accusation & Reveal (30 minutes)

**Private accusation**: Each guest writes down their accusation — who committed the crime, how, and why — and seals it. No deliberation, no consensus. Individual judgment.

**The reveal**: The host orchestrates the climax:
1. Accusations are read aloud (or the host summarizes the spread of suspicion)
2. The true murderer confesses — in character, with full dramatic weight
3. The host narrates the complete timeline: what actually happened, what the red herrings were, whose secrets were innocent and whose were damning

**Awards** (voted by guests or awarded by the host):
- Best Performance — the most fully inhabited character
- Most Convincing Liar — the guest who best deflected suspicion
- Best Cocktail — voted by the room
- Best Dressed — most evocative interpretation of the brief
- Closest to the Truth — the most accurate accusation

---

### Post-Game

#### Immediate (that night or next morning)

**The Dossier.** A one-page "case file" summarizing the true events of the evening — the real timeline, the red herrings that worked, who guessed what, and how the crime was solved (or wasn't). Written in the voice of a detective, journalist, or archivist from the game's era and setting. Sent to all guests.

**The Menu of the Damned.** The full cocktail and food menu as contributed by guests, compiled with character attributions. Each item listed with the character who brought it and the story behind it. Formatted as a keepsake recipe card collection or a single broadsheet menu — the kind you'd find framed in an old restaurant.

**The Society Page.** During the party, a single group photo is taken in character. Post-game, it's formatted as a "society page clipping" or "crime scene evidence photo" — captioned in-fiction with character names and the evening's date within the story. Printed or digitally composited.

#### Delayed (1 week after)

**The Sealed Envelope.** Each guest receives a brief, personalized note — what happened to their character after the events of the evening. A narrative epilogue written by the host in the voice of the game's world:

> "After the trial, the spice merchant returned to Marseille, but the taste of that evening's gin never left his mouth. He sold the shop in spring. The new owners found a letter behind the counter, addressed to no one."

This is the final beat. The game is now truly over.

---

### Replayability Mechanisms

**Procedural**: Setting seeds are combinatorial across four axes (era × location × milieu × tension). Character relationship graphs are generated to ensure unique tension webs — no two mystery structures share the same motive geometry. The murder solution, red herrings, and timeline are derived from the specific character constellation, not selected from a fixed pool.

**Curated**: A content library provides the raw material the procedural engine draws from:
- 30+ eras with period-specific detail packets (slang, fashion, technology, social norms)
- 40+ location archetypes with spatial and atmospheric descriptions
- 50+ character archetypes with occupation, personality range, and secret templates
- 20+ crime mechanics (poison, staged accident, framing, theft-as-murder, etc.)
- Red herring templates and prop suggestion banks

Each element is authored with enough specificity to feel crafted, not generated.

**Player-Driven**: Guest contributions — food, drink, dress, preparation answers, in-character improvisation, the specific chemistry between these specific people — make every instance singular. The same Setting Seed played by different groups would produce entirely different evenings.

---

## III. Game 2: Whose Memory?

### Concept

An intimate storytelling game where anonymous personal stories become the medium for knowing each other more deeply. Players submit true stories on a theme before the party; during the evening, the group reads the stories, discusses them, and tries to match each story to its author — revealing how well (or poorly) we truly know each other.

The game surface is simple. The depth comes from the stories people choose to tell, the assumptions the group makes, and the conversations that follow the reveal. It is a game about perception, intimacy, and the distance between who we are and who others think we are.

### Player Count
5–15 guests + host

### Intimacy Level
Acquaintances to close friends. Works at any intimacy level — the stories self-calibrate.

---

### Pre-Game (1–2 weeks before)

#### Host Setup

The host selects — or the system generates — a **Theme**: a single evocative prompt that invites personal stories without demanding vulnerability. The prompt must be specific enough to constrain ("a memory" is too broad) but open enough to invite range ("a meal that changed something" allows comedy, grief, romance, or revelation).

**Example themes:**
- "A meal that changed something"
- "The last time you were genuinely lost"
- "A stranger you still think about"
- "Something you built with your hands"
- "A sound that takes you somewhere"
- "The worst advice you ever followed"
- "A door you almost didn't walk through"
- "Something you learned too late"
- "A gift you couldn't give"
- "The first time you realized you were wrong"

The theme is announced to all guests with a submission deadline (3–5 days before game night).

#### Story Submission

Each guest submits one anonymous story (200–500 words) to the host via private message, email, or form.

**Submission guidelines given to guests:**
- Write in first person
- The story must be true and personal, but the level of revelation is entirely your choice. A funny anecdote and a quietly devastating confession both work.
- Don't include identifying details that make attribution trivial — names of partners, workplaces, or cities you're known to have lived in. The game is in the ambiguity.
- Do include sensory details, emotional texture, and specificity. "A restaurant" is less interesting than "a place with orange vinyl booths and a jukebox that only played Patsy Cline."
- The story should be one you'd be willing to own publicly by the end of the night.

#### Host Preparation

The host reviews all submissions:
- Checks for accidental identifiers (removes or flags them with the author privately)
- Assigns each story a poetic alias: "The Story of Salt," "The Story of the Green Door," "The Story of the Wrong Train." The alias evokes without revealing.
- Prepares story booklets or cards — one complete set for each guest, anonymized and numbered
- Optional: writes a brief "theme essay" — a short meditation on the theme (200–300 words) to read aloud as an opening. Not analytical. Atmospheric.

---

### Game Night

#### Act I — The Reading (30–45 minutes)

The host distributes story booklets. The host may briefly introduce the evening with the theme essay — setting the tone without explaining what the game "is about."

Stories are read in one of three formats (host chooses based on group size and temperament):

**Format A — Read aloud by the host.** Preserves anonymity of voice and affect. More theatrical. The host becomes a neutral vessel. Best for groups of 8+.

**Format B — Read silently by each guest.** More intimate. Allows re-reading, note-taking, and private reaction. Best for smaller groups or groups that value reflection over performance.

**Format C — Read aloud by volunteers who are NOT the author.** A hybrid. Each story gets a voice, but not its own. Adds an element of interpretation and performance. The author hears their story in someone else's mouth.

After each story (or after all are read), a moment of silence. Brief open reactions are welcome — what resonated, what surprised — but **no guessing yet**. This is the listening phase.

#### Act II — The Guessing (30–45 minutes)

Each guest receives a **Guess Sheet**: a grid with story aliases along one axis and guest names along the other.

Three structured rounds before final guesses:

**Round 1 — Open Table.** Free-form conversation about the stories as a collection. No direct accusations. The group talks about what they noticed, what patterns emerged, what felt familiar or foreign. This is the group calibrating — forming theories, testing assumptions, revealing their own frameworks. ("I think whoever wrote 'The Story of Salt' has lived abroad." "Really? I read it as someone who grew up in a kitchen.")

**Round 2 — The Interview.** Each guest is briefly "interviewed" by the group — but not about which story is theirs. Instead, they're asked about the theme itself:
- "What does 'lost' mean to you?"
- "When was the last time you cooked for someone?"
- "Do you keep things or throw them away?"

The answers become evidence. Not because they match a story directly, but because they reveal sensibility, vocabulary, emotional register. The group is reading people against stories.

**Optional mechanic — The Bluff.** Each guest may, once during the interview round, tell one deliberate lie to throw off guessers. ("I've never been to Europe." When in fact they wrote the story set in Lisbon.) This adds a strategic layer without overwhelming the intimacy.

**Round 3 — Private Deliberation.** Guests fill in their guess sheets silently. No conferring. Final answers.

#### Act III — The Reveal (20–30 minutes)

Stories are revealed one by one. The host reads the alias, reads a key line from the story, and asks: "Whose memory is this?"

The author stands or raises a hand.

After each reveal, the author may — but is never required to — share one additional detail:
- What they left out of the story
- Why they chose this particular memory
- What it means to them now, years later
- What surprised them about how the group discussed it

**Scoring:**
- 1 point per correct guess
- **"Most Surprising Match"** award — the story-to-person pairing that shocked the most people (voted by the group)
- **"Best Story"** — optional, voted by the group, but handle with care. Every story is an act of generosity.

---

### Post-Game

#### Immediate (that night)

**The Anthology.** All stories compiled into a small booklet or zine, now with author names attached. Each guest takes one home.

The format matters: this should feel handmade. Folded, stapled, maybe hand-stamped with the theme. A photocopied zine, not a PDF. If the group is remote, a carefully typeset digital booklet with a cover page bearing the theme, the date, and the names of the participants. Something worth keeping.

**The Guess Map.** A visual (hand-drawn or simply tabulated) showing who guessed whom. The web of correct matches, near-misses, and wild misattributions. This is a portrait of the group — not of accuracy, but of perception. Who do we think each other are?

#### Delayed (1 week after)

**The Afterword.** The host writes a brief reflection (300–500 words) on the evening. Not a summary, not a ranking. A mood piece. What the stories, taken together, said about this particular group of people at this particular moment. What it felt like to hear them read aloud. What surprised the host.

Sent to all guests. The host's voice as editor, not judge.

**The Prompt That Never Was.** Each guest receives one final communication: a second theme prompt — one they could write to but will never submit. A private invitation to continue the practice of noticing their own stories:

> "The next one would have been: *A thing you kept that you should have thrown away.*"

No obligation. No submission channel. Just the prompt, sitting in their inbox, doing its quiet work.

---

### Replayability Mechanisms

**Procedural**: Theme prompts are generated from a combinatorial grammar across four dimensions:

| Dimension | Examples |
|-----------|----------|
| **Sense** | a sound, a taste, a smell, a texture, a color |
| **Emotion** | that changed you, that you can't explain, that embarrassed you, that you're proud of |
| **Temporality** | the first time, the last time, a time you almost, a time you didn't |
| **Specificity** | a meal, a room, a stranger, a letter, a drive, a mistake |

Combinations across these axes produce thousands of unique, evocative prompts. Game mechanics can also be remixed: reading format, interview structure, bluff rules, scoring.

**Curated**: A library of 100+ hand-authored theme prompts, organized by:
- Intimacy level (light / medium / deep)
- Group size suitability (small intimate / large party)
- Season or occasion (summer gathering, holiday, reunion, first meeting)

Each prompt tested for its ability to produce varied, compelling, non-obvious stories across different kinds of people.

**Player-Driven**: The stories ARE the game. Different people, different stories, different evening. Even with the identical prompt, no two groups will produce the same anthology. The game is unrepeatable by definition — it is made of the people who play it.

---

## IV. Game 3: The Confession Album

### Concept

A chain-answering game built on the Victorian confession album tradition — the parlor game that Marcel Proust made famous when he filled one out at age thirteen. Questions are displayed on a physical board. Players take turns: each inherits the previous player's question and answers it, then approaches the board, selects a new question, reads it aloud, answers it, and removes it. Two people answer every question — the one who chose it and the one who inherits it. The board visibly diminishes as the evening progresses.

The game appears to be about answering questions. It is actually about *choosing* them — for yourself and, indirectly, for the next person. And about hearing the same question land differently in two different people. Character is revealed not through any single disclosure but through the composite portrait that emerges across thirty-five small ones. The Proust Questionnaire asks about preferences and ideals, not facts or confessions. People reveal more than they intend precisely because they don't feel threatened.

### Player Count
4–12 guests + host

### Intimacy Level
Any. The questionnaire is uniquely self-calibrating — it asks what you admire, what you value, what you fear, not what you've done. Strangers discover each other. Close friends discover what they assumed wrong. The host need not choose a variant; the questions themselves modulate.

---

### Pre-Game (1 week before)

#### Host Setup

The host selects — or the system generates — a **Question Set** drawn from the curated library. Four lineages are available, each with a distinct register:

| Lineage | Character | Source |
|---------|-----------|--------|
| **Classic Proust** | Romantic, philosophical, concerned with ideals and virtues | Proust's 1886 and 1892 confession albums |
| **Vanity Fair** | Contemporary, celebrity-inflected, sharper-edged | The magazine's long-running back-page feature |
| **Pivot / Lipton** | Compressed, rapid-fire, theatrical | Bernard Pivot's *Bouillon de Culture*, adopted by James Lipton on *Inside the Actors Studio* |
| **Thematic Remix** | Curated around a single axis — sensory, mortality, creativity, memory, appetite | Original to the Ephemera Engine |

The host selects one lineage as the base, then adjusts: removing questions that feel too light or too heavy for the group, substituting from other lineages, or adding originals. The final set should contain **N + 5 questions**, where N is the number of guests — enough that the board is not exhausted but few enough that it visibly thins. A set of 25–40 questions is typical.

The host also determines board format and player order (see below).

#### The Invitation

Each guest receives an invitation that introduces the confession album tradition. Not a rules document — an atmosphere. A brief note about the history: how confession albums were commercially printed books kept on Victorian parlor tables, how guests would fill in their answers over tea, how a young Proust answered one at a birthday party in 1886 and his responses became the most famous self-portrait in literary history.

The invitation names the evening, sets the date, and tells guests what to expect in tone — contemplative, unhurried, revelatory in the way that small admissions are revelatory. It does not explain the chain mechanic. That is discovered in the room.

#### Contribution Brief

Each guest brings one item tied to a question archetype from the Proust tradition. The brief offers a menu of archetypes and asks the guest to choose one:

- **"Your idea of happiness"** — bring a drink that embodies it
- **"Your favorite food"** — bring it, or bring something that tells the story of it
- **"Your most treasured possession"** — bring the object itself, to display (not surrender) for the evening
- **"Your favorite word"** — write it on a card, in your hand, to pin to the board alongside the questions
- **"The quality you most admire"** — bring a piece of music that demonstrates it (a single track, queued on a phone, to play during the evening)

The brief is evocative, not prescriptive. A guest assigned "your idea of happiness" might bring a thermos of the coffee their grandmother made, or a bottle of cheap champagne, or a glass of cold water. The interpretation is the first creative act.

#### The Board

The host prepares the physical question board. The physicality matters: removing a question is a visible, tactile act that reshapes the landscape of possibility for everyone who follows. The board should be beautiful.

**Format options:**
- Cards pinned to a corkboard, removed by hand
- Tiles laid on a table, flipped or taken
- Slips arranged in a wooden rack, drawn out
- Questions chalked on a blackboard, erased after answering
- Letterpress or risograph-printed cards on a magnetic surface

Each question card is legible from a few feet away. The board is placed where all guests can see it — a wall, an easel, the center of the table. As questions are removed, the gaps are visible. The board becomes a record of what has been asked and what remains.

---

### Game Night

#### Act I — The Board & The Tradition (15 minutes)

The host introduces the evening. The board is revealed — all questions visible, arranged but not numbered, a field of possibilities.

The host tells the story of the confession album. Not a lecture — a few sentences, warm, specific. The key beats: Victorian parlor tables. Commercially printed albums with questions like "Your favorite virtue" and "Your idea of misery." Guests filling them in over an evening. A thirteen-year-old Marcel Proust, at a birthday party, answering with startling sincerity: his favorite virtue was "the need to be loved, or, more precisely, the need to be caressed and spoiled." The idea that preferences — what you love, what you fear, what you wish for — reveal character more honestly than confessions ever could.

Guests present their contributions. Each item is placed or displayed with a brief word about what it is and which archetype it answers. The table fills. Music plays if someone brought a track. The room becomes furnished with the group's collective taste.

**The warm-up:** The host answers the first question. This question is either chosen by the group ("pick one from the board for me") or drawn at random. The host answers honestly — modeling the register the evening requires. Not performance, not confession. Just candor. Then the host removes the question from the board. The game has begun.

#### Act II — The Chain (60–90 minutes)

The core game. Player order is established — by seating arrangement (clockwise), by drawing lots, or by host discretion. The host may arrange the order to alternate temperaments: the forthcoming next to the reserved, the comic next to the contemplative.

**The mechanic:**

The first player has no inherited question — they go to the board, choose a question, read it aloud, answer it, and remove it from the board.

Every subsequent player does two things:
1. **The Inheritance.** They answer the previous player's chosen question — the one just removed from the board. They do not choose this question; it is given to them by the chain. They answer from where they sit.
2. **The Choice.** They approach the board, survey what remains, select a new question, read it aloud, answer it, and remove it. This question will be inherited by the next player.

The rhythm is: inherit, then choose. Compulsion, then agency. Every question except the first and last is answered by exactly two people — the one who chose it and the one who inherited it. The contrast between a chosen answer and a compelled answer is where the game lives. The chooser had time to consider, to select something they wanted to speak to. The inheritor must answer cold — the question arrives without preparation, and their response is instinctive, unguarded.

**Pacing and host role:**

The pace is unhurried. There is no timer. The host is not a moderator but a gentle conductor — they may invite a brief follow-up question from the table after a particularly striking answer, or allow a moment of silence after a quiet one. The host does not comment on every answer. Some answers need nothing but the room's attention.

Between players, the host may observe aloud what the board looks like — "we've lost all the questions about virtue; what remains is appetite and fear" — to make the diminishing visible as narrative.

**The arc:**

The diminishing board creates a natural dramatic structure without any design intervention. Early in the game, the board is full and choices are free — a player can dodge difficult questions, select crowd-pleasers, play it safe. As the board thins, the remaining questions become charged with meaning. Choosing one of the last three questions is a statement. Leaving the other two for those who follow is an act with consequences. "You chose *that* one?" becomes an unspoken question the room asks itself.

The final player inherits the second-to-last question and answers the last remaining question on the board. The board is now empty. The chain is complete.

**Optional variant — The Return:**

After the board is empty, one final round. Each player may re-ask any question from the evening to any other player. No obligation to answer — but the act of choosing whom to ask, and what, is itself a disclosure. This round is brief and voluntary. It produces the evening's most electric moments or its quietest ones.

#### Act III — The Portrait (15–20 minutes)

The host reads back selected answer-pairs — the same question as answered by two different people. Not all pairs; the host curates during the game, noting the contrasts that were most striking, most funny, most quietly devastating.

The format: "The question was: *What is your idea of perfect happiness?* [Name] said: [answer]. [Name] said: [answer]."

No commentary between pairs unless the room wants to talk. The pairs speak for themselves. Hearing your answer next to someone else's — on a question you chose versus one you inherited — is the game's final act of revelation.

The group reflects: what surprised them, what they recognized in someone else's answer, what they heard themselves say that they hadn't expected. No scoring. The game does not rank. Awards only if the group wants them:

- **"Most Surprising Answer"** — the response no one expected from that person
- **"Best Pair"** — the two answers to the same question whose contrast was most revealing
- **"The Question That Changed the Room"** — the question whose answers shifted the evening's temperature

---

### Post-Game

#### Immediate (that night)

**The Album.** All questions and all answers compiled into a physical confession album — a small bound or stapled booklet, one question per page. Each question appears with both answers, attributed by name. The format echoes the Victorian original: a book of confessions, now filled.

The design should evoke the confession albums themselves — a cover with the date and the words "Confession Album," interiors with the question in a display typeface and the two answers in a readable serif, names in a contrasting weight. Hand-assembled if possible: folded, saddle-stapled, perhaps with a card-stock cover. Each guest takes one home.

If a physical album is impractical, a carefully typeset PDF — but never a spreadsheet, never a Google Doc. The form is the meaning. A confession album that looks like a database has confessed nothing.

**The Contributions Table.** A photograph or description of the assembled contributions — every object, drink, dish, and word-card — with attributions. What archetype each guest chose, what they brought, and any story they told about it. A still life of the group's collective taste.

#### Delayed (1 week after)

**Proust's Answer.** For each question a guest answered, they receive a private letter containing Proust's own response to the same question — from the 1886 album (age thirteen) or the 1892 album (age twenty).

The format: a brief, personal note.

> "You were asked: *What is your idea of perfect happiness?*
> You said: *[their answer].*
> At age thirteen, Marcel Proust said: *To live close to all those I love, with the beauties of nature, a quantity of books and music, and, near at hand, a French theater.*"

No analysis. No comparison. Just the two answers, separated by a century and change, in quiet conversation. The guest decides what to make of the resonance — or the distance.

For questions drawn from the Vanity Fair, Pivot, or original lineages (which Proust never answered), the letter instead offers a related Proust answer and notes the connection: "Proust was never asked your question. But he was asked something adjacent..."

This is the game's final gesture: a conversation across time, delivered privately, after the evening has settled into memory.

---

### Replayability Mechanisms

**Procedural**: Question sets are modular and combinatorial. The four lineages (Proust, Vanity Fair, Pivot, Thematic Remix) can be drawn from independently or blended. Within each lineage, questions are tagged by register (light, medium, deep) and by domain (virtue, appetite, memory, imagination, mortality, relationship, aesthetics, identity). A question-set generator can filter by group size, intimacy level, and thematic emphasis — producing a tuned board for any occasion. Player order, board layout, and the presence or absence of The Return variant further multiply configurations.

**Curated**: A library of 200+ questions organized by lineage and register:

| Category | Depth |
|----------|-------|
| 35 Classic Proust questions (1886 + 1892 combined) | Light to medium |
| 40 Vanity Fair variations and originals | Medium |
| 20 Pivot/Lipton compressions | Light |
| 50+ thematic questions across six domains | Light to deep |
| 60+ original questions for the Ephemera Engine | Mixed |

Each question is authored or selected for its ability to produce varied, honest, non-obvious answers. The library is deep enough to sustain dozens of plays without repetition — and the chain mechanic means that even repeated questions produce new meaning, because the person who inherits a question is never the person who chose it.

**Player-Driven**: The answers. The choices — which question to take from the board, which to leave for those who follow, whom to ask in The Return. The specific chain that forms: the accident of order, the rhythm of inheritance. The contributions brought to the table. The room's silence after an unexpected answer. Different people, different evening. The confession album is always the same book; it is never the same confessions.

---

## V. Game 4: The Exquisite Corpse

### Concept

A collaborative fiction game where players contribute fragments — sentences, phrases, images, lines of dialogue — and then assemble them into narratives using structural templates. The name honors the Surrealist parlor game invented by André Breton and friends around 1925, which produced the phrase *"Le cadavre exquis boira le vin nouveau"* ("The exquisite corpse shall drink the new wine"). The mechanic sits at the intersection of three traditions: the Victorian game of Consequences (blind sequential writing), the Surrealist exquisite corpse (chance-driven composition), and the Story Spine (Kenn Adams's improv structure, later adopted by Pixar for rapid story prototyping).

The game oscillates between individual creation and collective assembly. Players write alone, then build together. The constraint — random fragments forced into fixed structures — produces surprising, often beautiful narratives from collision. Where the other games in the series are about disclosure (of character, of memory, of preference), this one is about *making* — creating something together from pieces no one planned to combine. It is the most collaborative game in the series and the least vulnerable, making it a natural complement to the other three.

### Player Count
4–10 guests + host (sweet spot: 6–8, to produce enough fragments for rich assembly without diluting collaborative focus)

### Intimacy Level
Acquaintances to close friends. Best with people who enjoy language — writers, readers, teachers, word-nerds. The lightest performance demand in the series: no one speaks in character, no one confesses, no one is guessed. You just write, and then you build.

---

### Pre-Game (1–2 weeks before)

#### Host Setup

The host selects — or the system generates — a **Fragment Prompt Set** and a **Constraint**. The prompt set directs what kind of fragments players will write. The constraint provides a through-line.

**Fragment Prompt Types:**

| Type | Instruction | Example Fragment |
|------|-------------|-----------------|
| **First Lines** | "Write 3 sentences that could open a story" | "The dog had been dead for a week, but it still came when she called." |
| **Last Lines** | "Write 3 sentences that could end a story" | "He never went back, and he never stopped wanting to." |
| **Overheard** | "Write 3 lines of dialogue between people you'll never meet" | "You promised me a Tuesday." / "I promised you nothing." |
| **Images** | "Write 3 sentences that describe a scene with no people in it" | "A piano in a wheat field, lid open, keys wet with rain." |
| **Confessions** | "Write 3 sentences a character might whisper in the dark" | "I knew about the money. I knew the whole time." |
| **Headlines** | "Write 3 headlines from a newspaper that doesn't exist" | "LOCAL RIVER REVERSES COURSE; FISH UNIMPRESSED" |
| **Instructions** | "Write 3 sentences that tell someone how to do something impossible" | "To fold time, begin with the corners." |

The host selects 2–3 prompt types per game (mixing types produces the richest collisions). Each player will submit fragments across all selected types.

**Constraints** (optional, one per game):

- A color that must appear in every fragment
- A season or weather condition
- A specific object (a key, a window, a letter, a bridge)
- A sense (every fragment must include a sound, a taste, a texture)
- A temporal anchor ("before dawn," "in the last hour," "years later")

The constraint provides a subtle connective tissue. When fragments share a color or a season, the assembled stories feel mysteriously coherent — as if they were always meant to be together.

The host also selects the **Structural Templates** for game night assembly (see Act II below) and determines the physical format — slips of paper in a bowl, cards on a table, or digital display.

#### Guest Assignment

Each guest receives their fragment prompt set 7–10 days before game night:

- 2–3 prompt types, each requesting 3–5 fragments
- The constraint, if one is set
- Submission guidelines: each fragment should be one sentence (two at most). Not a story — a shard. A beginning without a middle. A middle without an end. An image, a voice, a moment. Quality matters less than specificity. "A sad woman" is nothing. "A woman eating cold rice from the pot at 2 AM" is a fragment.
- Total submission: 6–15 fragments per player (calibrated by host to produce a pool of 50–120 fragments for the evening)

Fragments are submitted to the host, who collects them anonymously. Authors are not identified during game night. The fragments belong to the room.

#### Contribution Brief

Each guest brings one item to furnish the creative atmosphere:

- **A book** — any book, opened to any page. It sits on the table. During the game, anyone may read a sentence from any open book as inspiration, attribution, or found material. The books are the room's unconscious.
- **A drink** — tied to their fragments' mood. "Bring something that tastes like what you wrote." A guest who wrote noir fragments brings whiskey. A guest who wrote pastoral images brings chamomile tea. The interpretation is the first creative act.

#### Host Preparation

The host:
- Collects all fragments and removes author identification
- Transcribes each fragment onto an individual slip of paper, card, or tile (physical) or enters them into the digital system
- Shuffles thoroughly — the anonymity and randomness are essential
- Prepares structural templates (printed or displayed) for Act II
- Prepares the Fragment Pool — all slips in a bowl, box, or spread on a table
- Sets aside 1 fragment per player (randomly) for the post-game "Fragment That Got Away"

---

### Game Night

#### Act I — The Pool (20–30 minutes)

The host introduces the evening. The Fragment Pool is revealed — all slips spread across a table, or fanned in a bowl, or pinned to a board. The mass of language is visible. No one knows which fragments are theirs.

**The Reading Aloud.** Before any assembly, the fragments are heard. The host (or a volunteer) picks up fragments one by one and reads them to the room. Not all of them — a sampling, 20–30 fragments, chosen at random. The room listens. Laughter, recognition, surprise, quiet. This is the group hearing its own collective voice for the first time.

The host notes: "These are all yours. Every fragment was written by someone in this room. By the end of the night, they'll be stories."

**The Books.** Guests place their brought books on the table, open to their chosen pages. The books become part of the landscape — available as found material throughout the evening.

**The Drinks.** Guests introduce their drinks with a single line: "I brought gin and tonic because what I wrote tastes like cold and bitter." No further explanation. The tone is playful, not precious.

By the end of Act I, the room has heard the raw material, the table is furnished, and the players are primed. The fragments are no longer private — they belong to the evening.

#### Act II — The Assembly (60–90 minutes)

The core game. Players divide into groups of 2–4 (host assigns, aiming for mixed temperaments). Each round uses a different structural template. Between rounds, groups may reshuffle.

**Round 1 — The Story Spine** (20–25 minutes)

Each group receives a Story Spine template — the structured narrative skeleton created by Kenn Adams and made famous by Pixar:

```
Once upon a time, ___
Every day, ___
Until one day, ___
Because of that, ___
Because of that, ___
Because of that, ___
Until finally, ___
And ever since then, ___
```

Each group draws 10–15 fragments from the Pool. They must fill the Story Spine using their drawn fragments as raw material. The rules:

- Each slot must contain at least one drawn fragment (used verbatim or lightly adapted)
- Groups may write original connective tissue between fragments — glue, not replacement
- Fragments can be trimmed, reordered within a slot, or combined, but their language must survive
- If a fragment doesn't fit, it goes back to the Pool
- Any open book on the table may be raided for a single sentence (credited: "from page 47")

The constraint is that the fragments drive the story. The group discovers what narrative their random collection wants to become. The structure provides the spine; the fragments provide the flesh.

**Round 2 — The Exquisite Corpse** (15–20 minutes)

The classic Surrealist mechanic, adapted. Each group takes a fresh sheet. The first player writes an opening line (drawn from a new set of fragments or written fresh, their choice). They fold the paper to conceal everything except the last few words, and pass it to the next player. The next player writes a continuation — seeing only the last few words of what came before — using a drawn fragment as their seed. Fold, pass, continue.

After each player has contributed 2–3 lines, the paper is unfolded and the result is read aloud to the group. The blind assembly produces surreal, accidental narratives — the Surrealists' original discovery that chance creates meaning the conscious mind would never permit.

**Round 3 — The Cut-Up** (15–20 minutes)

An homage to William Burroughs and Brion Gysin's cut-up technique. Each group takes the Story Spine narrative they assembled in Round 1. They physically cut it apart — sentence by sentence, or phrase by phrase. They also draw 5 new fragments from the Pool. They rearrange the pieces, intercutting the old narrative with new fragments, reordering, disrupting. The original story is destroyed and rebuilt.

The Cut-Up produces the evening's strangest and often most poetic texts. The familiar becomes alien. Narrative logic dissolves into lyric logic. The constraint of pre-existing material means the result has resonance — it echoes the original story while becoming something entirely new.

**Round 4 — The Rewrite** (15–20 minutes)

Groups exchange their Cut-Up texts with another group. Each group now rewrites the other's text — keeping every drawn fragment intact (verbatim) but replacing all the connective tissue with new writing. The fragments are the fixed stars; everything else is recomposed.

This round produces the most collaborative result: one group's fragments, assembled by a second group, cut up and rearranged, then rewritten by a third set of hands. The final text belongs to everyone and no one.

**Host role during Act II:**

The host circulates, keeps time gently (no hard buzzer — "start wrapping up" is sufficient), ensures the Fragment Pool is accessible, and handles logistics. The host may also participate as a member of a group. Between rounds, the host reads one result aloud to the full room — a preview, building energy for the final readings.

#### Act III — The Reading (20–30 minutes)

All groups reconvene. The room becomes an audience.

Each group's final text (from Round 4, the Rewrite) is read aloud. The reader may be anyone in the group — the best reader, the most theatrical, or the person who contributed least to the writing (giving them the performance role). The host may also read, as a neutral voice.

After each reading, a moment. Then:
- The room responds — what they heard, what surprised them, what image or line will stay with them
- Authors of original fragments may (but need not) claim their words: "That line about the piano was mine." The group discovers how its fragments traveled — from one person's private imagination, through the Pool, through assembly and cutting and rewriting, into a story no one planned

**Optional — The Fragment Auction.** Before the evening ends, the remaining unused fragments in the Pool are auctioned. Each guest may claim one fragment to keep — written by someone else, anonymous, a piece of language they want to own. No bidding; if two people want the same fragment, they read it aloud together and the room decides who needs it more.

**Awards** (voted by the room):
- **Best Line** — the single fragment or composed line that haunted the room
- **Best Collision** — the most surprising juxtaposition of two fragments that had no business being next to each other
- **Best Reader** — the performance that made the text land
- **Best Book Raid** — the most perfectly stolen sentence from an open book

---

### Post-Game

#### Immediate (that night or next morning)

**The Chapbook.** All final texts compiled into a small literary magazine or chapbook. Author credits list all players — since fragments are communal, every text is collectively authored. The chapbook includes:
- Each group's final text (from the Rewrite), typeset with care
- The Story Spines (from Round 1) as an appendix — the "first drafts"
- The Exquisite Corpse texts (from Round 2) as a second appendix — the "automatic writing"
- A colophon page listing: the date, the players, the prompt types, the constraint, the books that were present on the table

The format should evoke a small press literary journal or a hand-assembled zine. Card-stock cover with the date and the words *The Exquisite Corpse* and the constraint ("in which everything was blue"). Interior pages typeset in a readable serif with generous margins. Saddle-stapled or folded. If digital, a PDF that honors the same aesthetic — not a document, but a publication.

**The Fragment Census.** A complete list of all fragments submitted, now revealed with author names. The group can see who wrote what — and trace how their fragments traveled through the evening's assembly. A cartography of language: from private imagination to shared story.

#### Delayed (1 week after)

**The Fragment That Got Away.** Each player receives one fragment — set aside by the host before the game — that was never used. It sat in the Pool all evening and no one drew it. The fragment is sent privately, with a brief note:

> "This one never made it into a story. It's yours now — or maybe it was always yours. Do with it what you want."

The fragment may or may not be the player's own. They'll never know. It's a private invitation to continue writing.

**The Constraint Echo.** A single-line prompt, related to the evening's constraint, sent to all players one week after the game:

> "The constraint was: *a sound.* Here is another: Write one sentence that contains a silence."

No submission channel. No obligation. Just the prompt, an echo of the evening, doing its quiet work.

---

### Replayability Mechanisms

**Procedural**: Fragment prompt types are combinatorial across seven categories (First Lines, Last Lines, Overheard, Images, Confessions, Headlines, Instructions), with 2–3 selected per game. Constraints span five dimensions (color, weather, object, sense, temporal anchor). Structural templates for assembly can be varied and expanded: the Story Spine is one of many possible scaffolds (others: the Kishōtenketsu four-act structure, the sonnet form, the epistolary format, the recipe, the field guide entry, the encyclopedia article). Round ordering and group composition further multiply configurations. The Cut-Up and Rewrite rounds introduce genuine randomness — no algorithmic seed can reproduce the specific cuts a human hand makes.

**Curated**: A content library provides material the host can draw from:
- 50+ fragment prompt variations across the seven categories
- 30+ constraint themes with evocative descriptions
- 20+ structural templates beyond the Story Spine, each with instructions and examples
- 15+ round format variations (the four rounds above are one configuration; others substitute translation exercises, erasure poetry, or constraint-based rewriting)
- Suggested book lists — "books that produce good sentences when opened at random"

Each element is authored for its ability to produce rich, surprising fragments and productive collisions.

**Player-Driven**: The fragments themselves. Different writers produce different raw material, and no two Fragment Pools will contain the same language. The assembly process is irreducibly human — the choices made during the Story Spine, the blind continuations in the Exquisite Corpse, the specific cuts in the Cut-Up, the interpretive rewriting in the Rewrite. Even with identical prompts and constraints, the game is unrepeatable because the writers are unrepeatable. The game is made of their language, recombined.

---

## VI. Appendix: Game Seed Template

For designing future games in the series. Every field is required. If a field doesn't apply, explain why — the absence is part of the design.

```
GAME TITLE:
  [Name]

TAGLINE:
  [One sentence. What is this game about? Not what players do — what the game IS.]

PLAYER COUNT:
  [Min–Max, with a sweet spot noted]

INTIMACY LEVEL:
  [Strangers / Acquaintances / Close Friends / Any]
  [Note any calibration: does the game self-adjust, or must the host choose a variant?]

CORE MECHANIC:
  [What do players DO? One paragraph. Be specific. "Players tell stories" is too
  vague. "Players submit anonymous true stories on a theme, then the group tries
  to match stories to authors" is a mechanic.]

PRE-GAME:
  Host Setup:
    [What does the host prepare? What does the system generate?]
  Guest Assignment:
    [What does each guest receive or do before the party?]
  Contribution:
    [What does each guest bring to the party? How is it narratively motivated?]
  Timeline:
    [How far in advance does pre-game start? What are the deadlines?]

GAME NIGHT:
  Act I — [Title]:
    [Setup/establishment. What happens first? How do guests enter the game?]
    [Duration estimate]
  Act II — [Title]:
    [Core gameplay. The main activity. Be specific about structure, timing, and
    how the host manages flow.]
    [Duration estimate]
  Act III — [Title]:
    [Climax/reveal. How does it resolve? What is the dramatic arc?]
    [Duration estimate]
  Total Duration:
    [Estimated total time for game night]

POST-GAME:
  Immediate (that night / next morning):
    [What artifact is produced? What is its format and voice?]
  Delayed (days later):
    [What arrives later? How does it close the experience?]
  Ephemera:
    [What physical or digital artifacts survive the evening? What is their form?]

REPLAYABILITY:
  Procedural:
    [What can be algorithmically varied? What are the combinatorial axes?]
  Curated:
    [What content libraries support it? How deep must they be?]
  Player-Driven:
    [What makes each instance inherently unique? What do players supply that no
    system can replicate?]

DESIGN CONSIDERATIONS:
  Accessibility:
    [How does the game accommodate different physical abilities, social comfort
    levels, dietary restrictions?]
  Edge Cases:
    [What happens if a guest drops out? Arrives late? Doesn't submit on time?
    Is too shy? Is too dominant?]
  Group Dynamics:
    [What group sizes and compositions does this game serve well? Poorly?]
  Host Burden:
    [How much work is this for the host? Where can the system help?]
```

---

*Designed for the Ephemera Engine. Each game played once, remembered always, repeated never.*
