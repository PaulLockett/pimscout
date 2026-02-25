# Context Seed: Venture Scout Relationship Orchestration Engine

## Who You're Working With

Paul Lockett — Technical Director at Innovation Portal (nonprofit startup incubator, Coastal Alabama), CFO/COO there as well. Recently formed Pim & Co LLC to formalize consulting and software engineering contracts. Former fullstack software engineer, Morehouse graduate. Paul thinks in systems, learns by building, and has deeply studied two methodologies that should guide this project:

1. **Righting Software** (Juval Löwy) — Volatility-based decomposition, layered architecture (Client→Manager→Engine→Resource), critical path analysis, PERT estimation. Paul wants this used for all system and project design decisions.
2. **AI Engineering** (Chip Huyen + Shankar/Husain) — Evaluation-first development, Three Gulfs diagnosis (comprehension/specification/generalization), adaptation hierarchy (prompting→RAG→finetuning), progressive architecture.

Both methodologies are available as skill files in `/mnt/skills/user/righting-software/SKILL.md` and `/mnt/skills/user/ai-engineering/SKILL.md`. **Read these before starting any design work.**

### How Paul Works
- Show reasoning, not just conclusions. Externalize how you're framing problems.
- Be direct. No hedging when you have relevant knowledge.
- Reduce ambiguity — help structure vague tasks into clear next steps.
- When suggesting architecture, use volatility-based decomposition (not functional decomposition).
- Present options with tradeoffs, don't prescribe a single path.
- For estimation, use PERT (optimistic, most likely, pessimistic).

---

## Business Context

### The Boardy Deal Partner Contract

Paul is a contracted Deal Partner (venture scout) for Boardy (YouCorp Technologies, Inc. dba "Boardy"). Key contract terms that constrain the product design:

**What Paul does for Boardy:**
- Source and evaluate early-stage founders raising seed rounds
- Introduce founders to Boardy via email cc (this is the attribution mechanism)
- Participate in Slack for advisory contributions

**Compensation:**
- $1,000 per founder that engages Boardy's Dealteam service and pays
- 50% carry on Boardy Ventures investments in referred founders (via AngelList)
- Must refer ≥1 founder/month to stay active; 2 consecutive misses = removal

**Contract constraints relevant to product design:**
- Non-solicit: Cannot solicit founders introduced *through Boardy* to compete with Boardy offerings. General networking and pre-existing relationships are fine. (Clarified in Slack by Boardy's Maguire: applies only to founders actively in Boardy programs, and only if using the Deal Partner title to sell competing services.)
- Confidentiality: Boardy's strategies, client info, financial/technical info are confidential.
- IP: Work product *commissioned by Boardy in writing* belongs to them. Pre-existing IP, independent business activities, and work for third parties are explicitly carved out (Section 12(c) "No IP Contamination").
- Referral attribution: First introducer gets credit, valid for 12 months, must be documented in Boardy's systems.

**Key implication:** This tool is Paul's independent product under Pim & Co LLC. It is NOT built for or commissioned by Boardy. It must not expose Boardy's confidential information. It should be branded independently (not as a Boardy derivative). The tool happens to make Paul a better scout, but it's a general-purpose venture scout relationship engine.

### The Real Problem

Paul gets 30+ founder intros per week from VC Generator and other deal flow communities. Each intro comes with a structured profile (company name, stage, raise amount, sector, etc.). Some sources provide less structured data (just a deck or name+email).

**Current workflow (manual, doesn't scale):**
1. Review founder profile
2. Send email intro cc'ing Boardy → gets attribution credit
3. Try to build relationship with founder through follow-up emails
4. Hope founder completes Boardy's signup flow (10-min AI call + WhatsApp messages)

**Current conversion:** ~3 out of 15 founders (~20%) actually complete Boardy's full signup. The rest go cold.

**What Paul wants to automate:** The relationship-building side. AI-personalized, situationally-aware email sequences that:
- Are tailored to each founder's profile, stage, sector, and needs
- Adapt based on response/non-response patterns
- Build enough warmth that founders ask for help (opening consulting opportunities for Pim & Co)
- Increase conversion through the Boardy signup flow
- Track the state of every relationship across the funnel

### Four Conversion Paths (all matter for MVP)
1. **Founder completes Boardy signup flow** → Paul earns referral credit / carry
2. **Founder engages Pim & Co for consulting** → direct revenue for Paul's LLC
3. **Founder stays warm for future opportunities** → long-term deal flow
4. **Founder connects Paul to other founders** → network compounding

### Multi-User Vision

Paul intends this for multi-user from the start. Boardy has ~1,000 Deal Partners. The tool should be designed so other scouts could use it (different branding, independent of Boardy — a vertical SaaS for venture scouts generally). The beachhead market is Boardy scouts, but the architecture should not be coupled to Boardy specifically.

---

## Data Landscape

### Inbound Data (Founder Profiles)

**Primary source (VC Generator):** Structured profiles including:
- Founder name, email, company name
- Stage (pre-seed, seed, etc.), raise amount, sector
- Brief company description / one-liner
- Possibly deck or memo link

**Secondary sources:** Less structured — might be just a pitch deck, a memo, or a name + email. The system needs to handle varying levels of inbound data richness.

### Current State Tracking

Today: Paul's email inbox + memory. No CRM, no spreadsheet, no pipeline tracking. This is the core problem — there's no system of record for founder relationships.

### Outbound Communication

Email is the primary channel. The AI generates personalized sequences. The sequences need to be:
- **Situationally aware:** What does this founder need? What stage are they at? What's their sector?
- **Temporally aware:** When was the last touchpoint? How did they respond? What's the right cadence?
- **Goal-aware:** Which conversion path is this founder most likely suited for?
- **Human-reviewable:** Paul (or any scout) should be able to review/edit before sending, especially early on.

---

## Architectural Guidance

### Key Volatilities to Consider (starting point for decomposition)

These are hypotheses to validate during the Righting Software session:

1. **Inbound data format** — Different sources provide different structures. Will change as new sources are added.
2. **Outreach content strategy** — What to say, how to say it, when to say it. This is the core AI problem and will evolve rapidly.
3. **Communication channel** — Email today, possibly LinkedIn/WhatsApp/SMS later.
4. **Founder profile enrichment** — How much context we have about a founder changes over time and across sources.
5. **Conversion path routing** — Which path(s) to optimize for per founder. Rules will evolve.
6. **User preferences/style** — Each scout has a different voice, different goals, different network. Multi-user means this is a volatility axis.
7. **CRM/storage backend** — Where relationship state lives. Could be a simple DB, could integrate with external CRMs.
8. **Email delivery infrastructure** — How emails actually get sent. API provider will change.
9. **Analytics/reporting** — What metrics scouts care about. Will evolve.
10. **Boardy-specific integration** — The cc-intro step and signup tracking. This is ONE customer's workflow, not the system's core.

### Architectural Instinct (from prior conversation)

The temptation will be to build a CRM. Resist it. The CRM is the resource layer — use an existing one or a simple database. The defensible value is in the **engine layer**: the AI that decides what to do next for each founder based on their profile, stage, response history, and the scout's goals. That's the part that scales.

### AI Engineering Considerations

- **Evaluation-first:** Before building email generation, define what "good" outreach looks like. What's the failure mode? (Wrong tone? Wrong ask? Bad timing? Generic when it should be specific?)
- **Progressive architecture:** Start at Level 0 (founder profile → LLM → draft email). Add complexity only when measured failure modes demand it.
- **Adaptation hierarchy:** Start with prompting. Add RAG (founder context, past interactions) only when prompting alone can't personalize enough.
- **Human-in-loop:** This is email from a real person. The scout MUST review early on. The system earns autonomy through demonstrated quality.

---

## Session Goal

Run a full Righting Software Phase 1 (System Design):
1. Volatility identification with two-axis analysis
2. Layered architecture design (Client→Manager→Engine→Resource)
3. Validation against core use cases

Then proceed to Phase 2 (Project Planning) if time allows.

Apply AI Engineering principles to the engine layer specifically — evaluation criteria, progressive architecture decisions, and adaptation hierarchy for the email generation component.

---

## Branding Note

The product needs its own brand, independent of Boardy. Paul originally considered "Boardeux.ai" but that creates contract and brand-proximity risks. The naming/branding is a separate decision. For now, refer to the system by its function: "the scout engine" or "the relationship orchestration engine."
