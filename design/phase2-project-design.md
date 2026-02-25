# Phase 2: Project Design — Scout Relationship Orchestration Engine

**Date:** 2026-02-25
**Author:** Paul Lockett (Pim & Co LLC) + Claude (design partner)
**Methodology:** Righting Software (Juval Lowy) — Chapter 6-7 Project Design
**Depends on:** Phase 1 System Design (Approved)

---

## 1. Project Context

### Resource Model

Paul is the sole developer with AI pair programming assistance (Claude). This means:

- **No parallelism** across activities — one developer means activities are sequential
- **AI acceleration** — implementation speed is compressed for well-defined tasks (scaffolding, CRUD, templates) but NOT for integration testing, domain decisions, or debugging unexpected behaviors
- **The critical path IS the project** — with one developer, every activity is on the critical path

### Build Strategy: Incremental Vertical Slices

Per Righting Software: "Design iteratively, build incrementally." Each slice delivers a working end-to-end capability, building bottom-up within the slice (ResourceAccess → Engine → Manager → Client). This means:

- Early slices produce working software Paul can use immediately
- Each slice validates the architecture with real usage
- Rework from discovery is contained to the current slice
- Progress is reportable as integrations, not features

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js (App Router) |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| Hosting | Railway |
| AI/LLM | Claude API (Anthropic) |
| Domain | pimandco.ai (configurable per scout) |

---

## 2. Activity List

Activities are derived from the Phase 1 architecture. Each maps to one or more components. Estimation uses PERT: E = (O + 4M + P) / 6, rounded to 5-day quantum.

### Slice 1: Core Pipeline — "Intake to Send"

The minimum viable vertical slice. A founder profile enters, the system generates a Boardy cc email from a template, queues it for review, and sends via Resend.

| ID | Activity | Components Touched | O | M | P | PERT | Quantum |
|----|----------|--------------------|---|---|---|------|---------|
| A1 | **Project Infrastructure** — Railway project, Supabase instance, Resend account, pimandco.ai domain verification, repo scaffolding, CI basics | Utilities, Resources | 2 | 4 | 8 | 4.3 | 5 |
| A2 | **Data Layer** — Supabase schema (founders, relationships, messages, scouts), FounderAccess + MessageAccess implementation | FounderAccess, MessageAccess, Founder Store, Message Store | 3 | 5 | 10 | 5.5 | 5 |
| A3 | **Delivery Pipeline** — Resend integration, domain verification, DeliveryAccess (Send, Track, VerifyDelivery) | DeliveryAccess, Email Provider | 2 | 3 | 7 | 3.5 | 5 |
| A4 | **Template Composition** — Boardy cc email template system, template interpolation with founder data, ComposingEngine template mode | ComposingEngine | 2 | 3 | 7 | 3.5 | 5 |
| A5 | **Core Orchestration** — RelationshipManager intake flow (normalize → store → compose → queue), review gate logic (draft → approved → sent), basic state transitions | RelationshipManager | 3 | 5 | 10 | 5.5 | 5 |
| A6 | **Ingestion Listener** — Webhook endpoint for Generator founder profiles, data normalization, integration with RelationshipManager | Ingestion Listener | 2 | 3 | 7 | 3.5 | 5 |
| A7 | **Scout Dashboard — MVP** — Next.js app with auth, pending drafts review (batch approval), pipeline list view, one-tap status updates (Boardy onboarding) | Scout Dashboard | 5 | 8 | 15 | 8.7 | 10 |
| A8 | **Slice 1 Integration** — End-to-end flow testing (ingest → compose → review → send), state transition verification, email delivery verification | All Slice 1 | 2 | 3 | 7 | 3.5 | 5 |

**Slice 1 Total: 45 days (9 weeks)**

### Slice 2: Enrichment + AI Personalization

Read.ai meeting transcripts feed into the system. The ComposingEngine generates AI-personalized follow-ups using enriched context. Post-meeting follow-ups become high-quality.

| ID | Activity | Components Touched | O | M | P | PERT | Quantum |
|----|----------|--------------------|---|---|---|------|---------|
| A9 | **Enrichment Pipeline** — Read.ai webhook handler, EnrichmentAccess (Lookup, Verify, Supplement), EnrichingEngine (transcript processing, context extraction) | EnrichmentAccess, EnrichingEngine, Ingestion Listener | 3 | 5 | 10 | 5.5 | 5 |
| A10 | **AI Composition** — LLM integration (Claude API), prompt engineering for personalized follow-ups, template-to-generation continuum logic, founder context + scout voice in prompts | ComposingEngine | 5 | 8 | 15 | 8.7 | 10 |
| A11 | **Slice 2 Integration** — Enriched profiles feeding ComposingEngine, post-meeting follow-up generation end-to-end, AI output quality review | All Slice 2 | 2 | 3 | 7 | 3.5 | 5 |

**Slice 2 Total: 20 days (4 weeks)**

### Slice 3: Cadence + Automation

Scheduled follow-ups fire automatically. Exponential backoff cadence manages the long-tail. Hard signals restart engagement.

| ID | Activity | Components Touched | O | M | P | PERT | Quantum |
|----|----------|--------------------|---|---|---|------|---------|
| A12 | **Schedule Trigger** — Cron/queue for scheduled touchpoints, exponential backoff implementation (weekly → monthly → quarterly), hard-signal restart mechanism | Schedule Trigger, Utilities (Scheduling) | 3 | 5 | 10 | 5.5 | 5 |
| A13 | **Cadence Orchestration** — RelationshipManager cadence logic, multi-stage follow-up sequences, conversion path routing rules, automatic draft generation on schedule | RelationshipManager | 3 | 5 | 10 | 5.5 | 5 |
| A14 | **Slice 3 Integration** — Scheduled touchpoints end-to-end, cadence state management, backoff/restart verification | All Slice 3 | 2 | 3 | 7 | 3.5 | 5 |

**Slice 3 Total: 15 days (3 weeks)**

### Slice 4: System Awareness + Full Dashboard

Gmail integration prevents blind spots. Full dashboard provides comprehensive pipeline management.

| ID | Activity | Components Touched | O | M | P | PERT | Quantum |
|----|----------|--------------------|---|---|---|------|---------|
| A15 | **Gmail Integration** — OAuth flow, email activity monitoring for tracked founder addresses, thread matching, automatic state updates (last interaction timestamp, cadence reset) | Ingestion Listener | 5 | 8 | 15 | 8.7 | 10 |
| A16 | **Scout Dashboard — Full** — Enhanced pipeline views (filters, sorting, search), founder detail pages with interaction history, scout preferences management, batch operations polish | Scout Dashboard | 5 | 8 | 15 | 8.7 | 10 |
| A17 | **Final Integration + Polish** — Full system end-to-end testing, edge cases, error handling, performance verification, deployment finalization | All | 3 | 5 | 10 | 5.5 | 5 |

**Slice 4 Total: 25 days (5 weeks)**

---

## 3. Dependency Network

```
A1 (Infrastructure)
 ├── A2 (Data Layer) ──────────────┐
 ├── A3 (Delivery Pipeline) ───────┤
 │                                 │
 │   A4 (Template Composition) ────┤  (depends on A2 for founder data contracts)
 │                                 │
 │                                 ▼
 │                          A5 (Core Orchestration)  (depends on A2, A3, A4)
 │                                 │
 │                                 ├── A6 (Ingestion Listener)
 │                                 │
 │                                 ├── A7 (Scout Dashboard MVP)
 │                                 │
 │                                 ▼
 │                          A8 (Slice 1 Integration)  (depends on A5, A6, A7)
 │                                 │
 │                          ═══════╪═══════  SLICE 1 COMPLETE
 │                                 │
 │                                 ├── A9 (Enrichment Pipeline)
 │                                 │
 │                                 ├── A10 (AI Composition)  (depends on A9 for enriched context)
 │                                 │
 │                                 ▼
 │                          A11 (Slice 2 Integration)  (depends on A9, A10)
 │                                 │
 │                          ═══════╪═══════  SLICE 2 COMPLETE
 │                                 │
 │                                 ├── A12 (Schedule Trigger)
 │                                 │
 │                                 ├── A13 (Cadence Orchestration)  (depends on A12)
 │                                 │
 │                                 ▼
 │                          A14 (Slice 3 Integration)  (depends on A12, A13)
 │                                 │
 │                          ═══════╪═══════  SLICE 3 COMPLETE
 │                                 │
 │                                 ├── A15 (Gmail Integration)
 │                                 │
 │                                 ├── A16 (Scout Dashboard Full)
 │                                 │
 │                                 ▼
 │                          A17 (Final Integration)  (depends on A15, A16)
 │                                 │
 │                          ═══════╪═══════  SLICE 4 COMPLETE / MVP DONE
```

### Critical Path (Solo Developer)

With one developer, every activity is sequential. The critical path is the entire project:

```
A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9 → A10 → A11 → A12 → A13 → A14 → A15 → A16 → A17
```

**Total duration: 105 days (21 weeks)**

However, within each slice, some activities have no data dependencies between them and could be interleaved or compressed by switching between them when blocked:

- A2 and A3 can be interleaved (both depend only on A1)
- A6 and A7 can be interleaved (both depend on A5)
- A15 and A16 can be interleaved (both depend on Slice 3)

---

## 4. Schedule Options

Per Righting Software, present multiple viable options trading schedule, cost, and risk.

### Option A: Full MVP — All Four Slices

| Property | Value |
|----------|-------|
| **Duration** | 105 days / 21 weeks |
| **Scope** | Complete MVP as designed in Phase 1 |
| **Risk** | 0.45 — Moderate. Each slice validates before the next. Bottom-up build contains risk. |
| **Delivers** | All 5 core use cases fully operational |
| **Milestone 1** | Slice 1 complete at week 9 — can process founders and send Boardy cc emails |
| **Milestone 2** | Slice 2 complete at week 13 — AI-personalized follow-ups with meeting context |
| **Milestone 3** | Slice 3 complete at week 16 — automated cadence management |
| **Milestone 4** | Slice 4 complete at week 21 — Gmail awareness + full dashboard |

### Option B: Fast Start — Slice 1 + Slice 3 First

Defer enrichment/AI personalization (Slice 2) and Gmail integration (part of Slice 4) to get automated cadence running sooner with templates only.

| Property | Value |
|----------|-------|
| **Duration** | 85 days / 17 weeks (full), 60 days / 12 weeks (to working automation) |
| **Scope** | Templated outreach with automated cadence by week 12; AI personalization added after |
| **Risk** | 0.50 — Moderate. Reorders build but doesn't skip architecture validation. Cadence logic may need adjustment when AI composition is added. |
| **Tradeoff** | Gets automation value faster at the cost of initially lower-quality follow-ups (templates only, no AI personalization until later) |

### Option C: Minimum Viable Slice — Slice 1 Only, Then Reassess

Ship Slice 1, use it for 2-4 weeks to validate the architecture against real usage, then decide on Slice 2-4 priorities based on what Paul actually needs.

| Property | Value |
|----------|-------|
| **Duration** | 45 days / 9 weeks (to working product) |
| **Scope** | Intake, templated Boardy emails, manual review, send. No AI personalization, no automated cadence, no Gmail awareness. |
| **Risk** | 0.35 — Low. Smallest scope, fastest feedback. But follow-up sequences are entirely manual. |
| **Tradeoff** | Fastest to value. But only automates the Boardy cc email — follow-ups, cadence, and relationship-building are still manual. Paul must still track follow-ups in his head. |

### Recommendation

**Option A** is the right call. The 21-week timeline is honest, and each slice delivers usable capability at its milestone. Slice 1 at week 9 immediately handles the Boardy cc email workflow for 30 founders/week. Slice 2 at week 13 adds the personalization that makes follow-ups effective. Slice 3 at week 16 removes the need to manually track follow-up timing. Slice 4 at week 21 eliminates the blind spot problem.

The alternative is Option C if Paul wants to validate assumptions before committing to the full build. Ship Slice 1, use it with real founders for 2-3 weeks, then commit to the remaining slices with real-world feedback.

---

## 5. Build Order Within Each Slice

Per Righting Software: build bottom-up within each slice. ResourceAccess first (stable, reusable, expensive but durable), then Engines, then Manager, then Clients.

### Slice 1 Build Order

```
Week 1:     A1 - Infrastructure (Railway, Supabase, Resend, domain, repo)
Week 2:     A2 - Data Layer (schema + FounderAccess + MessageAccess)
Week 3:     A3 - Delivery Pipeline (DeliveryAccess + Resend)
Week 4:     A4 - Template Composition (ComposingEngine templates)
Week 5:     A5 - Core Orchestration (RelationshipManager core flow)
Week 6:     A6 - Ingestion Listener (webhook handler)
Week 7-8:   A7 - Scout Dashboard MVP (Next.js app)
Week 9:     A8 - Slice 1 Integration Testing
            ── MILESTONE: Can process Generator founders and send Boardy cc emails ──
```

### Slice 2 Build Order

```
Week 10:    A9  - Enrichment Pipeline (Read.ai webhooks + EnrichingEngine)
Week 11-12: A10 - AI Composition (LLM integration + prompt engineering)
Week 13:    A11 - Slice 2 Integration Testing
            ── MILESTONE: AI-personalized follow-ups with meeting context ──
```

### Slice 3 Build Order

```
Week 14:    A12 - Schedule Trigger (cron/queue + backoff logic)
Week 15:    A13 - Cadence Orchestration (RelationshipManager cadence logic)
Week 16:    A14 - Slice 3 Integration Testing
            ── MILESTONE: Automated follow-up cadence with exponential backoff ──
```

### Slice 4 Build Order

```
Week 17-18: A15 - Gmail Integration (OAuth + monitoring + thread matching)
Week 19-20: A16 - Scout Dashboard Full (pipeline views, detail pages, preferences)
Week 21:    A17 - Final Integration + Polish
            ── MILESTONE: Full MVP — system awareness + complete dashboard ──
```

---

## 6. Risk Assessment

### Risk per Slice

| Slice | Primary Risk | Mitigation |
|-------|-------------|------------|
| **1: Core Pipeline** | Resend domain verification delays; Supabase schema rework after real usage | Start domain verification on day 1; schema supports evolution via migrations |
| **2: Enrichment + AI** | AI output quality insufficient; prompt engineering iteration takes longer | Start with simple prompts, iterate based on Paul's review; evaluation criteria defined in Phase 1 |
| **3: Cadence** | Cadence logic edge cases (timezone, holidays, rate limits) | Simple rules first; complexity added based on observed failures |
| **4: Awareness** | Gmail API OAuth complexity; rate limits; thread matching accuracy | Google Cloud project setup early; conservative polling intervals; fuzzy matching by email address |

### Overall Risk: 0.45

Below the 0.50 target. Each slice's integration testing catches issues before the next slice begins. The incremental approach means the worst case is "later slices take longer," not "the whole project fails."

---

## 7. Earned Value Plan

| Week | Activity Completed | Cumulative Effort | Earned Value |
|------|-------------------|-------------------|-------------|
| 1 | A1 (Infrastructure) | 5 | 4.8% |
| 2 | A2 (Data Layer) | 10 | 9.5% |
| 3 | A3 (Delivery Pipeline) | 15 | 14.3% |
| 4 | A4 (Template Composition) | 20 | 19.0% |
| 5 | A5 (Core Orchestration) | 25 | 23.8% |
| 6 | A6 (Ingestion Listener) | 30 | 28.6% |
| 8 | A7 (Scout Dashboard MVP) | 40 | 38.1% |
| 9 | A8 (Slice 1 Integration) | 45 | **42.9% — Slice 1 Done** |
| 10 | A9 (Enrichment Pipeline) | 50 | 47.6% |
| 12 | A10 (AI Composition) | 60 | 57.1% |
| 13 | A11 (Slice 2 Integration) | 65 | **61.9% — Slice 2 Done** |
| 14 | A12 (Schedule Trigger) | 70 | 66.7% |
| 15 | A13 (Cadence Orchestration) | 75 | 71.4% |
| 16 | A14 (Slice 3 Integration) | 80 | **76.2% — Slice 3 Done** |
| 18 | A15 (Gmail Integration) | 90 | 85.7% |
| 20 | A16 (Scout Dashboard Full) | 100 | 95.2% |
| 21 | A17 (Final Integration) | 105 | **100% — MVP Done** |

This produces the shallow S-curve Lowy prescribes — steady progress with slight acceleration during the middle slices (more infrastructure is already in place) and slight deceleration at the end (integration and polish).

---

## 8. Linear Issue Structure

Issues are created in the `pimscout` Linear team. Each activity maps to one issue. Slices are tracked via naming convention and dependencies in descriptions.

| Linear Issue | Activity | Slice | Priority |
|-------------|----------|-------|----------|
| `[S1] Project Infrastructure` | A1 | 1 | Urgent |
| `[S1] Data Layer — Schema + FounderAccess + MessageAccess` | A2 | 1 | Urgent |
| `[S1] Delivery Pipeline — DeliveryAccess + Resend` | A3 | 1 | High |
| `[S1] Template Composition — ComposingEngine Templates` | A4 | 1 | High |
| `[S1] Core Orchestration — RelationshipManager` | A5 | 1 | High |
| `[S1] Ingestion Listener — Generator Webhooks` | A6 | 1 | High |
| `[S1] Scout Dashboard — MVP` | A7 | 1 | High |
| `[S1] Slice 1 Integration Testing` | A8 | 1 | High |
| `[S2] Enrichment Pipeline — Read.ai + EnrichingEngine` | A9 | 2 | Normal |
| `[S2] AI Composition — LLM Personalization` | A10 | 2 | Normal |
| `[S2] Slice 2 Integration Testing` | A11 | 2 | Normal |
| `[S3] Schedule Trigger — Cadence Automation` | A12 | 3 | Normal |
| `[S3] Cadence Orchestration — RelationshipManager` | A13 | 3 | Normal |
| `[S3] Slice 3 Integration Testing` | A14 | 3 | Normal |
| `[S4] Gmail Integration — System Awareness` | A15 | 4 | Low |
| `[S4] Scout Dashboard — Full` | A16 | 4 | Low |
| `[S4] Final Integration + Polish` | A17 | 4 | Low |
