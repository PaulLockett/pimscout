# Phase 1: System Design — Scout Relationship Orchestration Engine

**Date:** 2026-02-25
**Author:** Paul Lockett (Pim & Co LLC) + Claude (design partner)
**Methodology:** Righting Software (Juval Lowy) + AI Engineering (Chip Huyen)
**Status:** Approved — validated against 5 core use cases

---

## 1. Business Context

### What This System Is

An independent product owned by Pim & Co LLC that helps venture scouts manage, nurture, and convert founder relationships at scale. The system automates the relationship-building side of venture scouting — personalized outreach, follow-up cadences, meeting integration, and conversion tracking — while keeping the scout in control through human review gates.

### What This System Is Not

This is not a Boardy product. It is not commissioned by or built for Boardy. It is Paul's independent tool that happens to make him a better scout. The architecture is scout-agnostic and investor-partner-agnostic by design.

### The Problem

Paul receives 30+ founder introductions per week from VC Generator (could scale to 100-600/week). Each intro starts a relationship lifecycle that includes:

1. A Boardy referral (cc intro email) for investor network access
2. Follow-ups to ensure the founder completes Boardy's onboarding process (~10 min AI call + WhatsApp)
3. Parallel relationship-building for consulting opportunities (Pim & Co)
4. Long-tail nurture for future deal flow and network compounding

Today, all of this lives in Paul's email inbox and memory. There is no system of record, no automated follow-up, no pipeline visibility. At 30/week this is painful. At 600/week it's impossible.

### Four Conversion Paths

Every founder relationship can produce value through one or more paths:

| Path | Mechanism | Revenue |
|------|-----------|---------|
| **Boardy Referral** | Founder completes onboarding after cc intro | $1,000 per engaged founder + 50% carry on investments |
| **Pim & Co Consulting** | Founder hires Paul for technical consulting | Direct consulting revenue |
| **Warm Nurture** | Founder stays in network for future opportunities | Long-term deal flow |
| **Network Compounding** | Founder connects Paul to other founders | Expanded pipeline |

### Multi-User Vision

Designed for multi-user from day one. Boardy has ~1,000 Deal Partners. The beachhead market is Boardy scouts, but the architecture is not coupled to Boardy. Any venture scout working with any investor network should be able to use this system.

---

## 2. Core Use Cases

These five use cases represent the essence of the system. Every architectural decision was validated against them.

### Use Case 1: New Founder Intake

A VC partner (e.g., Generator) sends Paul an email introducing a founder. Paul replies-all with a semi-templated email that cc's Boardy. The system ingests the founder profile, enriches it with available data, creates a relationship record, generates the initial Boardy cc email (templated with light customization), and queues it for review.

**Key detail:** These intros are warm, not cold. The VC partner has already vetted the founder. The initial email is a mail merge, not AI-generated content.

### Use Case 2: Scheduled Touchpoint

A time-based trigger fires based on the relationship's cadence schedule. The system checks the relationship state, determines the appropriate next touchpoint (Boardy onboarding nudge, relationship-building message, or long-tail check-in), generates content at the appropriate personalization level, and queues it for review.

**Key detail:** Cadence follows exponential backoff (weekly, monthly, quarterly) with hard-signal restarts when new information arrives (meeting transcript, founder reply, status change).

### Use Case 3: Founder Responds

An inbound signal arrives — a founder replies to an email thread, or the system detects email activity involving a tracked founder. The system updates relationship state (last interaction timestamp, conversation context) and determines the next action: respond, adjust cadence, shift conversion path, or flag for scout attention.

**Key detail:** The system must detect email activity it didn't initiate. Founders reply in existing threads, Paul sends manual emails — the system needs awareness of all communication with tracked founders to avoid redundant or stale outreach.

### Use Case 4: Scout Reviews and Sends

The scout opens the dashboard, reviews queued drafts. For templated messages (initial Boardy intros, standard nudges), batch approval is the primary workflow — scan many, approve all that look good, edit individual exceptions. For personalized messages (post-meeting follow-ups, consulting-oriented outreach), individual review. On approval, the system dispatches through the appropriate channel and updates relationship state.

**Key detail:** The review model scales with volume. At 30/week, individual review is feasible. At 600/week, batch approval and eventually earned autonomy (auto-send for high-confidence templates) become necessary.

### Use Case 5: Scout Views Pipeline

The scout views the aggregate state of all founder relationships — who needs attention, who's progressing through Boardy onboarding, who's warm for consulting, who's gone cold. This is a read-only client that queries relationship state and renders it.

**Key detail:** Per Righting Software, this is a Client concern — not a separate analytics component. The Scout Dashboard reads data through the Manager and renders it.

---

## 3. Volatility Analysis

### Methodology

Each candidate volatility was tested against Lowy's two axes:

- **Axis 1 (same scout over time):** Will this scout need this to change?
- **Axis 2 (across scouts now):** Do different scouts need this different right now?

Candidates were then filtered against: nature-of-business (rare + can only be encapsulated poorly), speculative design (unlikely use case), and solutions masquerading as requirements.

### Validated Volatilities

#### V1: Inbound Data Format

| Property | Analysis |
|----------|----------|
| **What changes** | Structure and source of founder data entering the system |
| **Axis 1** | New deal flow sources will be added; existing ones change format |
| **Axis 2** | Different scouts use different deal flow communities |
| **Current instances** | Generator structured profiles, Read.ai meeting webhooks, Gmail activity monitoring |
| **Encapsulated by** | Ingestion Listener (Client) + EnrichmentAccess (ResourceAccess) |

#### V2: Outreach Content Strategy

| Property | Analysis |
|----------|----------|
| **What changes** | How personalized content gets generated — prompts, templates, personalization depth, tone |
| **Axis 1** | Will evolve rapidly as scouts learn what messaging works |
| **Axis 2** | Different scouts have different voices, tones, goals |
| **Current instances** | Templated Boardy cc emails, light-AI nudges, full-AI personalized follow-ups |
| **Encapsulated by** | ComposingEngine |

#### V3: Communication Channel

| Property | Analysis |
|----------|----------|
| **What changes** | How messages get delivered to founders |
| **Axis 1** | Email today; LinkedIn, WhatsApp, SMS later |
| **Axis 2** | Different scouts prefer different channels |
| **Encapsulated by** | DeliveryAccess (ResourceAccess) |

#### V4: Founder Profile Enrichment

| Property | Analysis |
|----------|----------|
| **What changes** | Sources, APIs, and methods for supplementing founder profiles with external data |
| **Axis 1** | New enrichment sources, APIs, scraping strategies over time |
| **Axis 2** | Moderate — enrichment sources may differ by geography/sector |
| **Current instances** | Read.ai meeting data (transcript, summary, action items, topics), web search, future API integrations |
| **Encapsulated by** | EnrichingEngine + EnrichmentAccess (ResourceAccess) |

#### V5: Relationship Sequence Logic

| Property | Analysis |
|----------|----------|
| **What changes** | The order and conditions under which a founder relationship progresses — cadence rules, branching logic, conversion path routing |
| **Axis 1** | Rules evolve as scout learns what cadences and paths work |
| **Axis 2** | Different scouts have different engagement strategies and conversion targets |
| **Encapsulated by** | RelationshipManager |

#### V6: Storage Technology

| Property | Analysis |
|----------|----------|
| **What changes** | Where founder data, message drafts, and relationship state are persisted |
| **Axis 1** | Could migrate storage, add caching layers, change providers |
| **Axis 2** | Low variation (infrastructure choice) |
| **Encapsulated by** | FounderAccess, MessageAccess (ResourceAccess layer) |

#### V7: Message Delivery Provider

| Property | Analysis |
|----------|----------|
| **What changes** | Which email API provider sends messages |
| **Axis 1** | Will switch providers (SendGrid, Resend, SES, etc.) |
| **Axis 2** | Low variation |
| **Encapsulated by** | DeliveryAccess (ResourceAccess) |

### Volatilities Rejected

| Candidate | Reason for Rejection |
|-----------|---------------------|
| **Analytics/Reporting** | Not a volatility — reports are Clients that read data and render it (Lowy: "there is no Reporting component") |
| **Boardy-Specific Integration** | One customer's workflow, not a system volatility. Boardy is one configured conversion path within V5. |
| **Scoring/Prioritization** | For MVP, simple heuristics in the Manager's logic. Extract to an Engine when scoring becomes a genuinely complex, independently evolving algorithm. |
| **Scout Preferences/Style** | Data, not behavior. Stored via ResourceAccess, consumed as input by Engines. No separate component needed. |

---

## 4. Layered Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Scout Dashboard  │  │Ingestion Listener│  │ Schedule Trigger  │  │
│  │   (web client)    │  │ (system client)  │  │ (system client)  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │            │
├───────────┼─────────────────────┼──────────────────────┼────────────┤
│           │          MANAGER LAYER                     │            │
│           │                     │                      │            │
│           └─────────────┐       │       ┌──────────────┘            │
│                    ┌────▼───────▼───────▼────┐                      │
│                    │  RelationshipManager     │                      │
│                    │  (sequence volatility)   │                      │
│                    └──┬──────────────────┬───┘                      │
│                       │                  │                           │
├───────────────────────┼──────────────────┼───────────────────────────┤
│                       │   ENGINE LAYER   │                           │
│                       │                  │                           │
│              ┌────────▼──────┐  ┌───────▼────────┐                  │
│              │ Enriching     │  │  Composing     │                  │
│              │ Engine        │  │  Engine        │                  │
│              │ (enrichment   │  │  (content      │                  │
│              │  activity)    │  │   strategy)    │                  │
│              └──────┬────────┘  └───────┬────────┘                  │
│                     │                   │                            │
├─────────────────────┼───────────────────┼────────────────────────────┤
│                     │  RESOURCE ACCESS LAYER                        │
│                     │                   │                            │
│  ┌──────────────────▼─┐ ┌──────────┐ ┌─▼────────────┐ ┌─────────┐ │
│  │ EnrichmentAccess   │ │ Founder  │ │ Message      │ │Delivery │ │
│  │                    │ │ Access   │ │ Access       │ │ Access  │ │
│  │ Lookup, Verify,    │ │ Qualify, │ │ Draft,       │ │ Send,   │ │
│  │ Supplement         │ │ Engage,  │ │ Approve,     │ │ Track,  │ │
│  │                    │ │ Advance, │ │ Dispatch,    │ │ Verify  │ │
│  │                    │ │ Archive, │ │ Retrieve     │ │Delivery │ │
│  │                    │ │ Retrieve │ │              │ │         │ │
│  └────────────────────┘ └──────────┘ └──────────────┘ └─────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                       RESOURCE LAYER                                │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ External │  │ Founder  │  │ Message  │  │ Email Provider     │ │
│  │ Data APIs│  │ Store    │  │ Store    │  │ (SendGrid/Resend)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

  ║                    UTILITIES BAR                    ║
  ║  Security  │  Logging/Diagnostics  │  Scheduling   ║
```

### Component Count

| Layer | Components | Count |
|-------|-----------|-------|
| Client | Scout Dashboard, Ingestion Listener, Schedule Trigger | 3 |
| Manager | RelationshipManager | 1 |
| Engine | EnrichingEngine, ComposingEngine | 2 |
| ResourceAccess | FounderAccess, MessageAccess, DeliveryAccess, EnrichmentAccess | 4 |
| **Total** | | **10** |

Target: ~10 building blocks. Achieved.

### Component Specifications

#### Client Layer — WHO interacts with the system

**Scout Dashboard** (Web Client)
- Technology: Web application (Next.js)
- Purpose: Scout reviews drafts, manages pipeline, updates relationship status, configures preferences
- Key interactions: Batch review/approval, one-tap status updates (e.g., "Boardy onboarding complete"), pipeline visualization
- Calls: RelationshipManager only

**Ingestion Listener** (System Client)
- Purpose: Receives inbound data from external sources and feeds it into the system
- Inbound channels:
  - Generator founder profiles (webhook or structured import)
  - Read.ai meeting transcripts (webhook on `meeting_end` — delivers transcript, summary, action items, topics, participant emails)
  - Gmail activity monitoring (API polling/watching for email threads with tracked founders)
- Calls: RelationshipManager only

**Schedule Trigger** (System Client)
- Purpose: Fires time-based events when scheduled touchpoints are due
- Pattern: Exponential backoff (weekly → monthly → quarterly) with hard-signal restarts
- Hard signals that restart cadence: new meeting transcript, founder reply detected, manual scout reactivation, status change
- Calls: RelationshipManager only

#### Manager Layer — WHAT the system orchestrates

**RelationshipManager**
- Volatility encapsulated: Sequence — the order and conditions under which founder relationships progress
- Orchestrates all 5 core use cases
- Owns cadence logic, conversion path routing, review gate decisions
- Calls: EnrichingEngine, ComposingEngine, FounderAccess, MessageAccess, DeliveryAccess
- Does NOT call: Other Managers (there are none), Clients (never calls up)
- Expendability test: "Almost expendable" — if the outreach sequence changes from 3-touch to 5-touch, we modify this Manager's orchestration, but Engines and ResourceAccess are untouched

#### Engine Layer — HOW business activities are performed

**EnrichingEngine**
- Volatility encapsulated: Activity — how founder profiles get supplemented with external data
- Inputs: Sparse founder profile (from Generator), meeting data (from Read.ai webhook), email thread context
- Outputs: Enriched founder context document combining all available signals
- Calls: EnrichmentAccess
- Read.ai webhook data available: full transcript (speaker-attributed, timestamped), AI summary, action items, key questions, topics, chapter summaries, participant emails

**ComposingEngine**
- Volatility encapsulated: Activity — how personalized outreach content gets generated
- Operates on a template-to-generation continuum:

| Relationship Stage | Personalization Level | Mechanism |
|---|---|---|
| Initial Boardy cc email | Template + field swaps | Code interpolation (no LLM) |
| Boardy onboarding nudges | Light template variations | Light AI or templated |
| Early relationship building | Moderate personalization | LLM with profile context |
| Post-meeting follow-ups | Heavy personalization | LLM with transcript + profile + history |
| Long-tail nurture | Deep personalization | LLM with full relationship history |

- Inputs: Founder context (profile, enrichment, interaction history), scout preferences (voice, goals, conversion targets), relationship state (stage, last interaction, cadence position)
- Outputs: Draft message ready for review
- Calls: EnrichmentAccess (to retrieve enriched context), FounderAccess (to read relationship history)
- AI Engineering considerations detailed in Section 6

#### ResourceAccess Layer — HOW resources are accessed

All ResourceAccess components expose business verbs, not CRUD operations.

**FounderAccess**
- Volatility encapsulated: Storage technology for founder/relationship state
- Business verbs:
  - `Qualify` — Create initial founder record with intake data
  - `Engage` — Record an interaction (sent message, received reply, meeting held)
  - `Advance` — Move relationship to next stage or update conversion path status
  - `Archive` — Mark relationship as dormant (can be reactivated)
  - `Retrieve` — Get founder state for one or many founders (supports pipeline views)

**MessageAccess**
- Volatility encapsulated: Storage technology for outreach messages and drafts
- Business verbs:
  - `Draft` — Persist a generated draft for review
  - `Approve` — Mark draft as scout-approved (supports batch approval)
  - `Dispatch` — Mark message as sent, record delivery metadata
  - `Retrieve` — Get pending drafts, sent messages, or message history

**DeliveryAccess**
- Volatility encapsulated: Email delivery provider
- Business verbs:
  - `Send` — Dispatch a message through the configured provider
  - `Track` — Check delivery status (delivered, opened, bounced)
  - `VerifyDelivery` — Confirm message was received

**EnrichmentAccess**
- Volatility encapsulated: External data source APIs
- Business verbs:
  - `Lookup` — Query external source for founder/company data
  - `Verify` — Cross-reference data across sources
  - `Supplement` — Add enrichment data to existing founder record

#### Utilities Bar

- **Security** — Authentication, authorization (standard, passes cappuccino machine test)
- **Logging/Diagnostics** — Structured logging, error tracking (standard)
- **Scheduling** — Cron/queue infrastructure for time-based triggers (standard)

---

## 5. Use Case Validation

Each core use case traced through the architecture to verify: every component participates, no component is orphaned, call patterns are symmetric, closed architecture is maintained.

### UC1: New Founder Intake

```
Ingestion Listener
  → RelationshipManager
    → EnrichingEngine → EnrichmentAccess.Lookup (supplement profile if possible)
    → FounderAccess.Qualify (create founder record)
    → ComposingEngine (generate Boardy cc email from template)
    → MessageAccess.Draft (queue for review)
```

### UC2: Scheduled Touchpoint

```
Schedule Trigger
  → RelationshipManager
    → FounderAccess.Retrieve (get relationship state + history)
    → ComposingEngine (generate touchpoint at appropriate personalization level)
    → MessageAccess.Draft (queue for review)
```

### UC3: Founder Responds / Email Activity Detected

```
Ingestion Listener (Gmail monitoring detects activity)
  → RelationshipManager
    → FounderAccess.Engage (update last interaction, record context)
    → [if response requires action] ComposingEngine (generate reply draft)
    → [if response requires action] MessageAccess.Draft (queue for review)
    → [if status change needed] FounderAccess.Advance (update stage/conversion path)
```

### UC4: Scout Reviews and Sends

```
Scout Dashboard
  → RelationshipManager
    → MessageAccess.Retrieve (get pending drafts)
    → [scout reviews, edits, approves — batch or individual]
    → MessageAccess.Approve (mark approved)
    → DeliveryAccess.Send (dispatch through channel)
    → FounderAccess.Engage (record sent touchpoint)
```

### UC5: Scout Views Pipeline

```
Scout Dashboard
  → RelationshipManager
    → FounderAccess.Retrieve (all relationships for this scout, with filters/sorting)
```

### Validation Checklist

| Check | Result |
|-------|--------|
| Every component participates in at least one use case | Pass |
| No component exists without a mapped volatility | Pass |
| Clients never call multiple Managers in same use case | Pass |
| Clients never call Engines directly | Pass |
| Engines never call each other | Pass |
| ResourceAccess never call each other | Pass |
| No component calls upward | Pass |
| Call patterns are symmetric across use cases | Pass |
| Manager is "almost expendable" | Pass |
| Building block count ~10 | Pass (exactly 10) |
| Manager count < 8 | Pass (1) |
| Manager:Engine ratio reasonable | 1:2 (slightly over 0-1 expected; justified by independent volatilities) |

---

## 6. AI Engineering Overlay — ComposingEngine

The ComposingEngine is the core AI component and the primary source of defensible value. AI Engineering principles (Chip Huyen) are applied here specifically.

### Evaluation Criteria (Define Before Building)

**What does "good" outreach look like?**

| Criterion | Good | Failure Mode |
|-----------|------|-------------|
| Specificity | References founder's actual context (company, stage, sector, meeting topics) | Generic message that could go to anyone |
| Tone | Matches scout's voice; appropriate formality for relationship stage | Too salesy, too casual, or tone-deaf to context |
| Ask | Appropriate for where the founder is in the relationship | Asking for consulting when they just met; nudging Boardy when they already completed it |
| Brevity | Respects founder's time; gets to the point | Rambling, over-explaining, padding |
| Timing signal | Message implies the right level of urgency/casualness | Forced urgency when there's none; too casual about time-sensitive matters |

**Minimum quality bar:** A scout should approve >80% of generated drafts without edits for templated messages, >50% for personalized messages.

### Progressive Architecture

Start at Level 0. Add complexity only when measured failure modes demand it.

| Level | What | When to Add |
|-------|------|-------------|
| **0 (MVP)** | Template interpolation for Boardy cc emails; basic LLM prompting for follow-ups using founder profile + scout preferences | Day one |
| **1** | Add retrieval: pull interaction history, meeting transcripts, past successful emails into the prompt context | When personalization quality is insufficient from profile alone |
| **2** | Add guardrails: tone validation, appropriateness checking, cc-field verification | When harmful/embarrassing outputs are observed |
| **3** | Add routing: different generation strategies for different relationship stages/conversion paths | When one-size-fits-all prompting can't handle the stage diversity |
| **4** | Add caching: reuse successful templates/patterns, reduce LLM calls for common scenarios | After stabilization, when volume demands efficiency |

### Adaptation Hierarchy

```
PROMPTING (always first)
  ↓ Not personalizing enough?
RAG (interaction history, meeting transcripts, sector knowledge)
  ↓ Still insufficient?
FINETUNING (on scout's approved emails to capture voice)
  ↓ Still insufficient?
RECONSIDER whether this touchpoint should be AI-generated at all
```

### Human-in-Loop Model

The system starts with full human review and earns autonomy through demonstrated quality:

1. **MVP:** All drafts queued for review. Scout approves/edits/rejects every message.
2. **Batch mode:** Templated messages get batch approval. Personalized messages get individual review.
3. **Earned autonomy:** After N consecutive approvals without edits for a given template/stage, offer auto-send option. Scout can revoke at any time.
4. **Full autonomy:** Not in scope. The scout always has the ability to intervene.

---

## 7. The System Awareness Problem

### Problem Statement

The system can only orchestrate relationships it knows about. But relationships live in email inboxes, meetings, and conversations — not exclusively in the system. If the system has blind spots, it produces redundant or stale outreach that damages trust.

### Two Flavors

**Outbound blind spots:** Paul sends a manual email to a founder. The system doesn't know. The cadence timer fires and sends a redundant follow-up.

**Inbound blind spots:** A founder replies in a thread the system didn't initiate. The system misses the signal and keeps nudging about something already resolved.

### Solution

The Ingestion Listener monitors Paul's email activity with tracked founders via Gmail API integration. When the system detects email activity it didn't generate:

1. Update last interaction timestamp on the founder's relationship record
2. Reset or adjust the cadence timer (prevent redundant follow-ups)
3. Surface the interaction for the scout if it contains actionable signals

This makes the email inbox the implicit source of truth for "when did we last interact?" without requiring the scout to manually log every touchpoint.

### Boardy Onboarding Status

For MVP, Boardy onboarding completion is tracked manually. The scout marks the status via a one-tap action in the Scout Dashboard based on whatever signal they receive (founder reply, Boardy Slack, dashboard check). The follow-up nudge sequence asks about Boardy and provides natural opportunities for the founder to confirm.

Rationale: Boardy's dashboard is unstable and subject to change. Building automation against it is fragile. The founder's own confirmation is the most reliable signal.

---

## 8. Data Model (Conceptual)

Not a schema — a conceptual model of the entities and their relationships. Implementation details belong to the ResourceAccess layer.

### Founder

The central entity. Represents a person Paul has been introduced to.

- Identity: name, email, company name
- Profile: stage, raise amount, sector, one-liner, deck link
- Enrichment: meeting transcripts, topics discussed, action items, supplementary data
- Source: which deal flow source introduced them, referring VC partner

### Relationship

The state of the connection between a scout and a founder. One scout can have one relationship with one founder.

- Stage: intake, active-boardy-onboarding, active-nurture, warm, dormant, converted, archived
- Conversion paths: which paths are active (boardy-referral, consulting, nurture, network)
- Boardy status: not-referred, referred, onboarding-in-progress, onboarded, declined
- Cadence: current position in the backoff schedule, next scheduled touchpoint
- Last interaction: timestamp, channel, summary
- Interaction count: total touchpoints (sent + received)

### Message

A unit of outreach — generated, reviewed, and potentially sent.

- Type: boardy-intro, onboarding-nudge, relationship-building, follow-up, check-in
- Status: drafted, queued-for-review, approved, sent, bounced
- Personalization level: template, light-ai, full-ai
- Content: subject, body, recipients, cc list
- Generation context: what inputs the ComposingEngine used

### Scout

The user of the system.

- Identity: name, email
- Preferences: voice/tone settings, default cadence, conversion path priorities
- Email integration: connected email account for monitoring + sending
- Conversion partners: configured investor networks (Boardy is one instance)

---

## 9. Key Design Decisions and Rationale

### D1: One Manager, Not Two

**Decision:** Single RelationshipManager handles all five core use cases.

**Alternatives considered:** IntakeManager + OutreachManager (split by lifecycle phase).

**Rationale:** "Intake" and "Outreach" are functions, not volatilities. The underlying volatility is sequence — the order things happen in the relationship lifecycle — and that's one thing. Splitting would be functional decomposition in disguise. The Manager orchestrates Engines and ResourceAccess; changing the sequence (e.g., adding a step between intake and first outreach) modifies the Manager's orchestration without touching anything else. It's almost expendable — the correct design.

### D2: No ScoringEngine for MVP

**Decision:** Founder scoring/prioritization lives as simple heuristics in the RelationshipManager.

**Rationale:** At 30/week, scoring is "stage = seed AND raise > $500K AND sector in [edtech, healthcare, fintech] → high priority." This is a few conditionals, not a complex algorithm. Extracting an Engine for this would create a pass-through component (expendable, not almost-expendable). When scoring becomes genuinely complex (ML model, multi-factor weighted scoring), extract it then.

### D3: Template-to-Generation Continuum in ComposingEngine

**Decision:** The ComposingEngine handles both template interpolation and AI generation as a single component.

**Rationale:** The volatility being encapsulated is "outreach content strategy" — that strategy includes both templated and AI-generated approaches. The *decision* of which approach to use for a given message is part of the content strategy. Splitting templates from AI generation would be functional decomposition (one component per technique rather than per volatility).

### D4: Gmail Integration for System Awareness

**Decision:** The Ingestion Listener monitors email activity with tracked founders via Gmail API.

**Rationale:** The alternative (require Paul to manually log every interaction) doesn't scale and creates dangerous blind spots. The system's worst failure mode is sending stale outreach to someone Paul just talked to. Passive email monitoring prevents this without adding friction to Paul's workflow.

### D5: Manual Boardy Onboarding Tracking

**Decision:** Boardy onboarding status is updated manually by the scout.

**Rationale:** Boardy's dashboard is unstable. Building automation against it creates fragile coupling to a system Paul doesn't control. The follow-up sequence naturally prompts the founder about onboarding, and their response (or lack thereof) is the most reliable signal. One-tap status update in the dashboard keeps friction minimal.

### D6: Exponential Backoff with Hard-Signal Restarts

**Decision:** Default cadence is weekly → monthly → quarterly, with hard signals (meeting, reply, status change) restarting a more frequent cadence.

**Rationale:** Paul's stated preference. Also matches the nature of venture relationships — early engagement needs frequency, but pushing too hard on cold relationships is counterproductive. Hard-signal restarts capture the web-not-funnel nature of these relationships: a founder who went quiet 3 months ago and just raised a round is suddenly high-priority again.

---

## 10. Architectural Properties

### Closed Architecture

Components call only the adjacent lower layer, with Lowy's standard relaxations:
- Utilities can be called by any layer
- ResourceAccess can be called by both Managers and Engines
- Engines are called directly by the Manager

No component calls upward. No sideways calls between components in the same layer.

### Symmetry

All use cases follow the same call pattern: Client → RelationshipManager → [Engine(s)] → ResourceAccess. The Manager orchestrates; Engines do activity work; ResourceAccess handles data. No asymmetric exceptions.

### Extensibility

The system extends by adding new components, not modifying existing ones:
- New deal flow source → new handler in Ingestion Listener (or new Client if fundamentally different)
- New communication channel → new implementation behind DeliveryAccess
- New enrichment source → new implementation behind EnrichmentAccess
- New conversion partner (not Boardy) → new configuration in RelationshipManager's routing logic
- Scoring becomes complex → extract ScoringEngine from Manager

### Volatility Decreases Top-Down

| Layer | Volatility Level | Rationale |
|-------|-----------------|-----------|
| Client | Highest | New UIs, new inbound sources, new trigger mechanisms |
| Manager | High | Engagement sequences, cadence rules, routing logic evolve |
| Engine | Moderate | Enrichment methods and AI strategy change, but less frequently than sequences |
| ResourceAccess | Low | Business verbs are stable; implementations swap behind the contract |
| Resource | Lowest | Storage and delivery infrastructure changes rarely |

---

## 11. MVP Scope

**Target:** Handle Paul's current 30 founders/week from Generator.

**What's in:**
- Ingestion of Generator founder profiles
- Read.ai meeting transcript integration
- Gmail activity monitoring for tracked founders
- Semi-templated Boardy cc email generation
- Follow-up sequence with exponential backoff
- Scout Dashboard with batch review/approval and pipeline view
- Manual Boardy onboarding status tracking
- Basic personalization for post-meeting follow-ups

**What's deferred:**
- Multi-user support (architecture supports it; implementation is single-user)
- ScoringEngine extraction
- Auto-send / earned autonomy
- Non-email channels (LinkedIn, WhatsApp, SMS)
- Advanced enrichment sources beyond Read.ai
- Conversion path analytics
- Multiple conversion partner configurations

---

## 12. Resolved Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js | Paul's preferred framework |
| **Database** | Supabase | Local/cloud/staging parity, MCP support |
| **Email Provider** | Resend | Paul's choice; good DX, domain verification support |
| **Infrastructure** | Railway | Independent PR environments, Paul's preferred hosting |
| **Email Identity** | paul@pimandco.ai | Custom domain under Pim & Co; architecture supports any domain per scout |
| **Evaluation Dataset** | Defer | Start with one template + prompts; collect examples over time from real usage; evaluate and select good examples retroactively |

See Phase 2 document (`design/phase2-project-design.md`) for build plan, estimates, and Linear integration.
