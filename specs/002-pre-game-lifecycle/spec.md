# Spec 002: Pre-Game Lifecycle

**Status**: Draft
**Priority**: P0 (core platform), P1/P2 (subsystems as noted)
**Depends on**: 001-auth-and-sessions (User, Session, SessionParticipation)
**Depended on by**: 003-confession-album, 004-murder-mystery
**PRD Sections**: 2.3, 2.4, 2.5, 2.8

---

## Overview

The pre-game lifecycle covers everything between session creation and game night: inviting players, collecting RSVPs, assigning roles, gathering contributions, managing deadlines, delivering notifications, and browsing/purchasing content packs. This is the "preparation is play" phase -- where anticipation builds and the game's raw materials are assembled from player input.

This spec is technology-agnostic. Implementation details are in `plan.md`.

---

## User Stories

### Story 1: Deep Link Invitations and RSVP (P1 Priority: P0)

**As a** host,
**I want to** generate shareable invitation links for my session,
**so that** guests can join regardless of whether they have the app installed.

**As a** player (app or web),
**I want to** open an invitation link and see session details with a clear RSVP flow,
**so that** I can decide whether to attend and respond immediately.

#### Acceptance Criteria

**AC-1.1: Invitation Link Generation**

```gherkin
Given a host has a session in DRAFT or INVITING state
When the host taps "Send Invitations"
Then the system generates a unique deep link for the session
And the link is copyable to the clipboard or shareable via the system share sheet
And the link includes a session token but no personal data
And the deep link generation completes in <1 second
```

**AC-1.2: Deep Link Resolution -- App Installed**

```gherkin
Given a player has the Ephemera Engine app installed
When the player taps an invitation deep link
Then the app opens directly to the Session Invitation screen
And the screen displays: game name, date, host name, atmosphere text
And the player sees RSVP options: Accept / Decline / Maybe
```

**AC-1.3: Deep Link Resolution -- App Not Installed**

```gherkin
Given a player does not have the app installed
When the player taps an invitation deep link in a mobile browser
Then a web join page loads with session details
And the page displays the same information as the in-app invitation screen
And the player can RSVP without creating an account (display name only)
And the web page loads in <3 seconds on 3G connections
```

**AC-1.4: RSVP Submission**

```gherkin
Given a player is viewing the Session Invitation screen
When the player selects Accept, Decline, or Maybe
Then their RSVP status is recorded against the session
And the host's RSVP dashboard updates within 5 seconds
And the host receives a push notification for Accept/Decline
And the session moves to INVITING state if not already
```

**AC-1.5: RSVP Dashboard (Host)**

```gherkin
Given a host views their session dashboard during INVITING state
Then they see a breakdown: Accepted (N), Declined (N), Maybe (N), Pending (N)
And each guest is listed with their current status
And the host can send a reminder to any non-responder
And the host can manually add a guest (generates a new invitation link)
And the host can adjust session configuration based on confirmed count
```

**AC-1.6: RSVP Change**

```gherkin
Given a player has already RSVP'd to a session
When they reopen the invitation link or navigate to the session
Then they can change their RSVP (e.g., Maybe to Accept, Accept to Decline)
And the host dashboard reflects the change immediately
And the host is notified of the change
```

---

### Story 2: Contribution Submission and Host Review (P1 Priority: P0)

**As a** player,
**I want to** view my contribution brief and submit my pre-game contributions through structured forms,
**so that** my creative input becomes raw material for game night and the post-game artifacts.

**As a** host,
**I want to** see which guests have submitted contributions and review their content,
**so that** I can ensure the game is prepared and send targeted reminders to stragglers.

#### Acceptance Criteria

**AC-2.1: Contribution Brief Display**

```gherkin
Given a player has accepted an invitation
When they navigate to their session view
Then they see their contribution brief with:
  - Game-specific instructions
  - Tone guidance and examples
  - Submission deadline
  - Word count guidance (where applicable)
And the brief is narratively motivated, not a generic form
```

**AC-2.2: Contribution Form Submission**

```gherkin
Given a player is viewing their contribution brief
When they tap "Begin" or "Write"
Then a structured form loads with game-appropriate fields:
  - Text fields for written answers, stories, descriptions
  - Optional photo upload for contribution descriptions
And the form loads in <2 seconds
And the player can complete submission in <10 minutes
```

**AC-2.3: Draft Saving**

```gherkin
Given a player has started writing a contribution
When they leave the form or the app backgrounds
Then their work is saved as a draft
And drafts auto-save every 30 seconds
And the player sees a "Draft saved" indicator
And the player can return later to continue editing
```

**AC-2.4: Contribution Submission Confirmation**

```gherkin
Given a player has completed their contribution form
When they tap "Submit"
Then the contribution status changes from "draft" to "submitted"
And the host receives a notification (batched, max 1/hour)
And the player sees a confirmation with the option to edit until contributions are locked
And the contribution is viewable by the host immediately
```

**AC-2.5: Contribution Editing**

```gherkin
Given a player has submitted a contribution
And the session has not yet moved to ACTIVE state
When the player returns to their contribution
Then they can edit and resubmit
And the host sees the updated version
```

**AC-2.6: Host Contribution Dashboard**

```gherkin
Given a host navigates to their session during INVITING or PREPARING state
When they view the contribution dashboard
Then they see a matrix with:
  - Rows: each guest
  - Columns: required contribution types (varies by game)
  - Cells: submitted (green), pending (yellow), overdue (red)
And the dashboard loads in <1 second
And it updates in real-time as contributions arrive
And the summary bar shows: X/Y contributions received, Z days until deadline
```

**AC-2.7: Targeted Reminder from Dashboard**

```gherkin
Given a host is viewing the contribution dashboard
When they tap a "pending" or "overdue" cell for a specific guest
Then they can send a targeted reminder to that guest
And the reminder is not sent to guests who have already submitted
And the host can optionally include a custom message
```

**AC-2.8: Host Review of Submissions**

```gherkin
Given a host taps a "submitted" cell on the contribution dashboard
Then they can read the full submission content
And they can flag a submission for follow-up (e.g., identifying details in anonymous content)
And they can mark a guest as "excused" if they won't submit
```

**AC-2.9: Web Player Contribution Parity**

```gherkin
Given a web player has accepted an invitation via the web join page
When they are directed to the contribution flow
Then they see the same brief, same form fields, and same submission experience as app players
And their submissions appear identically on the host's dashboard
```

---

### Story 3: Deadline Reminders (P1 Priority: P1)

**As a** host,
**I want** automated reminders sent to players with pending contributions before the deadline,
**so that** I don't have to manually chase every guest.

#### Acceptance Criteria

**AC-3.1: Automated 3-Day Reminder**

```gherkin
Given a session has a contribution deadline
And a player has not submitted all required contributions
When the time is 3 days before the deadline
Then the player receives a push notification: "Your contribution for [Session Name] is due in 3 days."
And web players receive an email equivalent
```

**AC-3.2: Automated 1-Day Reminder**

```gherkin
Given a session has a contribution deadline
And a player has not submitted all required contributions
When the time is 1 day before the deadline
Then the player receives a push notification: "Tomorrow is the deadline for [Session Name]."
And this notification is sent regardless of whether the 3-day reminder was sent
```

**AC-3.3: Grace Period**

```gherkin
Given the contribution deadline has passed
And a player has not yet submitted
When the grace period is active (default: until session moves to ACTIVE)
Then the player receives a notification: "The deadline has passed, but you can still submit."
And the contribution form remains accessible
And the host can manually lock contributions at any time
```

**AC-3.4: No Duplicate Reminders**

```gherkin
Given a player has received a reminder
When another reminder trigger fires within 12 hours
Then no duplicate reminder is sent
And the system logs the suppression
```

**AC-3.5: Quiet Hours**

```gherkin
Given a notification is scheduled for delivery
When the delivery time falls between 10 PM and 8 AM in the player's local timezone
Then the notification is queued for 8 AM delivery
And the queued notification is not duplicated if a morning batch already contains it
```

**AC-3.6: Host Manual Reminder**

```gherkin
Given a host views their session dashboard
When they choose to send a manual reminder to one or more players
Then the reminder is delivered immediately (subject to quiet hours)
And the host can include a custom message
And the system records who received which reminders and when
```

**AC-3.7: Host Deadline Extension**

```gherkin
Given a host views their session dashboard
When they choose to extend the contribution deadline
Then the deadline is updated
And future automated reminders are recalculated based on the new deadline
And players with pending contributions are notified of the extension
```

---

### Story 4: Content Pack Browsing and Purchase (P1 Priority: P1)

**As a** host,
**I want to** browse and purchase content packs to expand my game library,
**so that** each session I create offers fresh, unique content for my guests.

#### Acceptance Criteria

**AC-4.1: Store Navigation**

```gherkin
Given a host navigates to the Content Store
Then they see content packs organized by game type
And each pack shows: name, description, content count, price, game compatibility
And the store loads in <2 seconds
```

**AC-4.2: Pack Preview**

```gherkin
Given a host taps on a content pack
Then they see the full description and a preview of sample items (preview_items count)
And they see a "Purchase" button with the price
And they can return to the store listing without purchasing
```

**AC-4.3: In-App Purchase Flow**

```gherkin
Given a host taps "Purchase" on a content pack
Then the native platform IAP dialog appears (Apple App Store / Google Play)
And no external payment page is shown
When the purchase completes successfully
Then the content pack downloads and merges into the local content library
And the pack is marked as owned in the store
And the content is available immediately in session configuration
```

**AC-4.4: Purchase Restoration**

```gherkin
Given a host has purchased content packs on a previous device or after a reinstall
When they sign in and visit the store
Then previously purchased packs are marked as owned
And the host can re-download any owned pack
And purchases are tied to the user account, not the device
```

**AC-4.5: Content Integration**

```gherkin
Given a host has purchased a content pack
When they configure a new session
Then the purchased content appears alongside bundled content
And it is clearly labeled with its pack origin
And it can be mixed with bundled content in any configuration
```

**AC-4.6: Contextual Store Prompts**

```gherkin
Given a host is configuring a session and has exhausted bundled content for a category
When additional content would improve the experience
Then the system shows a non-intrusive "Get more content" prompt
And tapping it navigates to the relevant content pack in the store
And the prompt is dismissible and does not reappear for 7 days
```

---

### Story 5: Role Assignment for Murder Mystery (P1 Priority: P2)

**As a** host of a Murder Mystery session,
**I want to** assign characters to confirmed guests after RSVP,
**so that** each player receives a personalized character packet to prepare for game night.

#### Acceptance Criteria

**AC-5.1: Character Roster Display**

```gherkin
Given a Murder Mystery session has confirmed guests (accepted RSVPs)
When the host navigates to the Character Assignment screen
Then they see the character roster (generated from the setting seed) alongside the guest list
And each character shows: name, occupation, personality sketch (1-line summary)
And unassigned characters and unassigned guests are clearly indicated
```

**AC-5.2: Auto-Assignment**

```gherkin
Given a host taps "Auto-assign"
Then the system distributes characters to confirmed guests
And the host sees the proposed assignments for review
And the host can modify any assignment before confirming
```

**AC-5.3: Manual Assignment**

```gherkin
Given a host is on the Character Assignment screen
When they drag a character to a guest name (or tap to assign)
Then the assignment is recorded
And the assignment screen updates to reflect the pairing
And the host can reassign any character before delivery
```

**AC-5.4: Preference-Based Assignment**

```gherkin
Given a host enables "Preference-based" assignment mode
Then each confirmed guest receives a character archetype preference form
And the form presents archetype descriptions (not character names or plot details)
And each guest can rank their top 3 preferences in <2 minutes
When all preferences are collected (or the host proceeds without waiting)
Then the system optimizes assignments based on preferences
And the host reviews and confirms the optimized assignments
```

**AC-5.5: Character Packet Delivery**

```gherkin
Given a host confirms character assignments
Then each guest receives a push notification: "Your character has arrived."
And the notification opens the Character Packet screen containing:
  - Character sheet (name, occupation, personality, secret, relationships)
  - Contribution brief (food/drink, dress code, prop, preparation prompts)
And the host dashboard shows delivery confirmation per guest
```

**AC-5.6: Post-Delivery Reassignment**

```gherkin
Given a host has delivered character packets
When a guest drops out or a new guest joins
Then the host can reassign characters
And affected guests receive updated character packets
And the original guest's data is removed from the session
```

---

## Functional Requirements

### Invitation System

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-201 | System generates unique, session-scoped deep links with cryptographically random tokens | P0 | 1 |
| FR-202 | Deep links resolve to the app via Universal Links (iOS) and App Links (Android) | P0 | 1 |
| FR-203 | Deep links fall back to a web join page when the app is not installed | P0 | 1 |
| FR-204 | Invitation links contain no personally identifiable information in the URL | P0 | 1 |
| FR-205 | Host can generate a single shared link or individual per-invitee links | P0 | 1 |
| FR-206 | Invitation links expire when the session moves to ARCHIVED or CANCELED state | P0 | 1 |

### RSVP

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-210 | Players can RSVP as Accept, Decline, or Maybe | P0 | 1 |
| FR-211 | RSVP status updates are visible to the host within 5 seconds | P0 | 1 |
| FR-212 | Players can change their RSVP at any time before the session enters ACTIVE state | P0 | 1 |
| FR-213 | Host can send reminders to non-responders without affecting those who already responded | P0 | 1 |
| FR-214 | Host can manually add a guest and generate a new invitation link for them | P0 | 1 |

### Contributions

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-220 | Players view a narratively-framed contribution brief before submitting | P0 | 2 |
| FR-221 | Contribution forms support structured text fields and optional photo upload | P0 | 2 |
| FR-222 | Contributions auto-save as drafts every 30 seconds | P0 | 2 |
| FR-223 | Players can edit submitted contributions until the host locks them | P0 | 2 |
| FR-224 | Host sees a contribution matrix: guest x contribution type with status indicators | P0 | 2 |
| FR-225 | Host can review individual submissions, flag for follow-up, or mark guest as excused | P0 | 2 |
| FR-226 | Web player contribution flow is identical in functionality to the app flow | P0 | 2 |
| FR-227 | Photo uploads are compressed client-side to <2MB before upload | P0 | 2 |

### Notifications

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-230 | Full notification catalog (N01-N16) is implemented per PRD 5.4 | P0 | 3 |
| FR-231 | Push notifications delivered within 30 seconds of trigger event | P0 | 3 |
| FR-232 | Automated reminders fire at 3 days and 1 day before contribution deadline | P1 | 3 |
| FR-233 | No duplicate notifications within a 12-hour window | P1 | 3 |
| FR-234 | Quiet hours (10 PM - 8 AM local) respected; notifications queued for morning delivery | P1 | 3 |
| FR-235 | Host contribution-received notifications batched (max 1/hour) | P1 | 3 |
| FR-236 | Web players receive all notifications via email with session deep links | P0 | 3 |
| FR-237 | Users can configure notification preferences per category | P0 | 3 |
| FR-238 | Emails include SPF/DKIM/DMARC and an unsubscribe link | P0 | 3 |

### Content Store

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-240 | Store displays content packs organized by game type | P1 | 4 |
| FR-241 | Each pack shows name, description, content count, price, preview items | P1 | 4 |
| FR-242 | Purchase uses native platform IAP (Apple/Google) | P1 | 4 |
| FR-243 | Purchased content downloads and merges into local content library | P1 | 4 |
| FR-244 | Purchases persist across reinstalls, tied to user account | P1 | 4 |
| FR-245 | Content packs follow the YAML schema defined in PRD 5.6 | P1 | 4 |
| FR-246 | Bundled content supports >=5 unique sessions per game without repetition | P0 | 4 |

### Role Assignment

| ID | Requirement | Priority | Story |
|----|-------------|----------|-------|
| FR-250 | Host can auto-assign, manually assign, or use preference-based character assignment | P2 | 5 |
| FR-251 | Character packets delivered via push notification after host confirms assignments | P2 | 5 |
| FR-252 | Host can reassign characters after initial delivery | P2 | 5 |
| FR-253 | Preference-based mode collects archetype rankings from guests in <2 minutes each | P2 | 5 |

---

## Non-Functional Requirements

| ID | Requirement | Category |
|----|-------------|----------|
| NFR-201 | Deep link resolution completes in <1 second on 4G | Performance |
| NFR-202 | Web join page loads in <3 seconds on 3G | Performance |
| NFR-203 | Contribution form loads in <2 seconds | Performance |
| NFR-204 | Host dashboard loads in <1 second | Performance |
| NFR-205 | Store loads in <2 seconds | Performance |
| NFR-206 | Invitation tokens are 128-bit cryptographically random | Security |
| NFR-207 | Contribution content encrypted at rest in the database | Privacy |
| NFR-208 | No recipient tracking via invitation link (host cannot see who opened without RSVPing) | Privacy |
| NFR-209 | Contribution forms and RSVP work fully offline with sync on reconnect | Offline |
| NFR-210 | Email deliverability >95% (SPF/DKIM/DMARC configured) | Reliability |
| NFR-211 | Push notification registration succeeds on first app launch | Reliability |
| NFR-212 | All notification copy follows the tone guidelines in DESIGN.md | UX |

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invitation-to-RSVP conversion | >70% of invited players RSVP within 48 hours | Analytics |
| Contribution completion rate | >80% of accepted players submit before deadline | Analytics |
| Reminder effectiveness | >50% of reminded players submit within 24 hours of reminder | Analytics |
| Deep link resolution success | >95% of link taps resolve correctly (app or web) | Error tracking |
| Push notification delivery | >90% delivery rate within 30 seconds | Push provider metrics |
| Content pack purchase completion | >60% of users who view a pack detail page complete purchase | IAP analytics |
| Host dashboard load time | p95 <1 second | APM |

---

## Out of Scope

- In-app group chat for pre-game coordination (hosts use existing messaging apps)
- Custom question authoring by hosts (V2 feature)
- Multi-device session sharing during pre-game (host uses one device)
- Social features: public profiles, sharing, discoverability
- Game night dashboard (covered in specs 003 and 004)
- Artifact generation (covered in a separate spec)

---

## Open Questions

| # | Question | Impact | Proposed Resolution |
|---|----------|--------|-------------------|
| 1 | Should per-invitee links be the default, or shared links? Per-invitee enables delivery tracking but increases host friction. | FR-205 | Default to shared link; per-invitee as an option |
| 2 | Should web player sessions use server-side sessions or JWT tokens for identity? | FR-226 | JWT with session-scoped claims, stored in httpOnly cookie |
| 3 | Should contribution photos be stored in Supabase Storage or an external CDN? | FR-227 | Supabase Storage with CDN transform (built-in) |
| 4 | Should the content pack catalog be fetched from the server or bundled in the app? | FR-240 | Server-fetched catalog; content downloaded on purchase |
| 5 | Grace period duration: fixed or host-configurable? | AC-3.3 | Host-configurable with a sensible default (until ACTIVE) |
