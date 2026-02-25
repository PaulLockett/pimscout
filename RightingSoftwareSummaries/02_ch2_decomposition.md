# Chapter 2: Decomposition - Deep Summary

## Main Argument/Thesis

System decomposition is the most critical architectural decision because wrong decomposition means wrong architecture, which inflicts enormous future pain and often leads to complete system rewrites. The vast majority of software systems are designed incorrectly using functional or domain decomposition, which couples services to requirements and maximizes the effect of change. **The Method's directive: Decompose based on volatility** - identify areas of potential change, encapsulate them into services, then implement required behavior as interactions between these encapsulated areas. This contains change like a vault contains an explosion.

---

## Key Concepts

### Why Functional Decomposition Fails

Functional decomposition creates components based on system functionality (e.g., Invoicing, Billing, Shipping services). Its problems are fundamental:

**1. Precludes Reuse**
- Services become temporally coupled (A then B then C)
- Built into service B is the assumption it was called after A and before C
- Lifting B for reuse fails because A and C are "hanging off it"
- Services form "cliques of tightly coupled services"

**2. Creates Either Too Many or Too Big Services**
- Fine-grained approach: explosion of services with duplicated functionality
- Coarse-grained approach: bloated "god monoliths" - ugly dumping grounds

**3. Bloats Clients with Business Logic**
- Clients must orchestrate functional services (stitch A, B, C together)
- System becomes flat two-tier: clients and services
- Client becomes intimately aware of all services, error handling, compensation
- Multiple clients duplicate this logic - maintenance nightmare
- "The hallmark of a bad design is when any change to the system affects the client"

**4. Creates Multiple Points of Entry**
- Multiple places for authentication, authorization, scalability concerns
- Changes must be made in multiple places

**5. Bloats Services When Chained**
- If A calls B calls C, each service must know about downstream services
- A's contract must accommodate parameters for B and C
- Error compensation creates tight coupling - B must know how to undo A
- Services become "one fused mess"

**6. Thermodynamic Impossibility**
- Design should be high-value activity requiring effort
- Functional decomposition is "easy and straightforward" - no sweat required
- This violates first law of thermodynamics: cannot add value without effort
- "Precisely because it is fast, easy, mechanistic... it cannot add value"

**7. Testability Destruction**
- Complexity so high that only unit testing is possible
- Unit testing is "borderline useless" - defects emerge from interactions
- "Would you board an airplane where only unit testing was performed on components?"
- Precludes regression testing, making systems untestable and defect-ridden

### Why Domain Decomposition Fails

Domain decomposition (Kitchen, Bedroom, Garage) is "functional decomposition in disguise":
- Kitchen = where you do cooking
- Bedroom = where you do sleeping
- Each functional area maps to a domain

**Problems:**
- Must duplicate functionality across domains (sleeping in bedroom AND living room)
- Each domain becomes "ugly grab bag of functionality"
- Cross-domain communication reduced to CRUD
- Some behaviors impossible (where does barbecue go if not in Kitchen?)
- Building incrementally by domain means constant rebuilding of completed domains

### What Volatility-Based Decomposition Is

**Core Principle:** Identify areas of potential change and encapsulate them into building blocks. Implement required behavior as interaction between these encapsulated areas.

**The Vault Metaphor:**
- Think of system as series of vaults
- Change is like a hand grenade with pin pulled
- Open appropriate vault door, toss grenade in, close door
- Whatever inside may be destroyed, but no shrapnel flying everywhere
- "You have contained the change"

**Key Distinction from Functional:**
- Functional decomposition: building blocks represent areas of functionality
- When change happens, it affects multiple/most components by definition
- Functional decomposition "maximizes the effect of change"
- Volatility-based: changes contained in single module with no side effects

**Benefits:**
- Easy maintenance with no side effects outside module boundary
- Lower complexity, higher quality
- Real chance at reuse
- Can extend by adding new volatility areas or integrating existing ones differently
- Resilient to feature creep during development
- Enables comprehensive regression testing

### The Axes of Volatility

Two and only two ways change comes to any system:

**Axis 1: Same Customer Over Time**
- Even if system perfectly aligned today, customer's context will change
- Use of system itself changes requirements (Jevons paradox)
- Question: "Could you use this component with this customer forever?"

**Axis 2: Same Time Across Customers**
- Different customers using system differently right now
- Question: "Are all customers using the system exactly the same way?"

**Key Properties:**
- Axes should be independent
- Something changing for one customer over time should NOT change as much across customers at same time (and vice versa)
- If areas of change cannot be isolated to one axis, indicates functional decomposition in disguise
- Assignment to axis helps discover volatility - volatility is more apparent on one axis

**Design Factoring Process:**
1. Start with one big component (diagram A)
2. Ask: Could you use this with one customer forever? If no, why?
3. Encapsulate what would change (diagram B)
4. Ask: Could you use this across all customers now? If no, why?
5. Encapsulate difference (diagram C)
6. Repeat until all points on both axes are encapsulated

### How to Identify Volatility

**Volatile vs. Variable:**
- Not everything that changes is volatile
- Encapsulate at system level only when open-ended and expensive to contain otherwise
- Variability = handled easily with conditional logic in code
- Volatility = changes that would have ripple effects across system, would invalidate architecture

**Solutions Masquerading as Requirements:**
- Customers provide solutions, not true requirements
- Example: "Cooking" is solution to requirement of "feeding occupants"
- Technique: Point out solutions, ask "are there other possible solutions?"
- If yes, what were real requirements and underlying volatility?
- Keep scrubbing until only true volatilities remain

**Design for Competitors:**
- Could competitor use your system? Could you use theirs?
- List barriers to such reuse
- If two ways of doing something exist, there may be many more - encapsulate it
- If you and all competitors do something identically, it's nature of business - don't encapsulate

**Volatility and Longevity:**
- Longer something hasn't changed, longer until it does change
- Rate of change is roughly constant (tied to nature of business)
- If payroll system changes every 2 years, it will likely change in next 2 years
- Encapsulate changes expected within life of system (typically 5-7 years)
- Good starting point: identify what changed in domain over past 7 years

**What NOT to Encapsulate:**
1. **Nature of the Business** - two indicators:
   - Change is rare (once in a million)
   - Any attempt to encapsulate can only be done poorly
   - Example: Single-family home converting to 50-story skyscraper
   - When nature of business changes, kill old system and start fresh

2. **Speculative Design** - over-encapsulating everything
   - Example: SCUBA-ready lady's high heels
   - Extremely unlikely use case
   - Everything provided is done poorly
   - Most such designs are frivolous speculation on change to nature of business

---

## Step-by-Step Frameworks

### Procedure 1: Volatility Identification Process

**Pre-work:**
1. Gather requirements documentation
2. Schedule interviews with project stakeholders
3. Create blank "Volatilities List" document

**Discovery Steps:**
1. For each requirement, ask: "Is this a solution masquerading as a requirement?"
   - If yes: What are other possible solutions? What is the real underlying requirement?
   - Keep peeling back until you reach true volatility

2. Apply Axis 1 questions:
   - "Could we use this exact system with Customer X forever?"
   - "What will Customer X want to change over time?"
   - "How has Customer X's usage already evolved?"

3. Apply Axis 2 questions:
   - "Are all customers using this the same way right now?"
   - "What are some customers doing differently?"
   - "Do we have to accommodate such differences?"

4. Apply competitor analysis:
   - "Could our competitor use this system?"
   - "What would prevent them from using it?"
   - Each barrier is a candidate volatility

5. Apply longevity analysis:
   - "What has changed in this domain over past 7 years?"
   - "What external systems do we interface with? When did they last change?"
   - "What is the expected lifespan of this system?"

6. For each candidate volatility, apply the "nature of business" filter:
   - Is this change rare (once in a million)?
   - Can this only be encapsulated poorly?
   - If both yes: Do NOT encapsulate - this is nature of business

**Output:** Prioritized volatilities list with rationale for each

### Procedure 2: Design Factoring Iteration

1. Start with single-component conceptual diagram
2. Select one volatility from list
3. Ask: "Does encapsulating this pass both axes tests?"
   - Axis 1: Same customer over time - would this encapsulation help?
   - Axis 2: Across customers now - would this encapsulation help?
4. If yes to either: Create component to encapsulate that volatility
5. Verify axes are independent - if volatility maps to both equally, may be functional decomposition in disguise
6. Repeat for next volatility
7. Verify: No component exists that doesn't map to a volatility (would indicate functional decomposition)

### Procedure 3: Anti-Design Effort (Convincing Stakeholders)

Use when facing resistance to volatility-based decomposition:

1. Split team into two halves in separate rooms
2. Give Team A: "Produce the best design for this system"
3. Give Team B: "Produce the worst possible design - maximize inability to extend/maintain, disallow reuse"
4. Allow one afternoon
5. Bring together and compare
6. They will typically produce the same design (functional decomposition)
7. Reveal the different assignments
8. Discuss implications
9. Propose different approach

### Procedure 4: Volatility Validation Checklist

For each proposed component, verify:
- [ ] Maps to specific volatility, not functionality
- [ ] Would same customer need this to change over time? OR
- [ ] Would different customers need this different right now?
- [ ] Is NOT rare (once in a million probability)
- [ ] CAN be encapsulated properly with available resources
- [ ] Does NOT represent nature of the business
- [ ] Is NOT speculative design for unlikely future
- [ ] Competitor analysis confirms this varies across industry

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Requirements-to-Design Mapping
**Pattern:** Creating components that mirror requirements specification
**Problem:** Requirements are full of solutions masquerading as requirements
**Signal:** Component names match requirement document headings
**Fix:** Peel back solutions to find underlying volatilities

### Anti-Pattern 2: The Siren Song
**Pattern:** Adding components because "we've always had them" (e.g., Reporting block)
**Problem:** Previous bad habits calling you back to functional decomposition
**Signal:** Cannot articulate what volatility the component encapsulates
**Fix:** Tie yourself to the mast (volatility-based decomposition) - resist the song

### Anti-Pattern 3: Domain as Volatility
**Pattern:** Creating components for business domains (Sales, Engineering, Accounting)
**Problem:** Domain decomposition is functional decomposition in disguise
**Signal:** Domain maps directly to a functionality (Kitchen = Cooking)
**Fix:** Ask what volatility within the domain needs encapsulation

### Anti-Pattern 4: Speculative Over-Engineering
**Pattern:** Encapsulating everything that could theoretically change
**Problem:** Creates numerous building blocks, poor implementations
**Signal:** SCUBA high heels - everything done poorly, unlikely use cases
**Fix:** Apply nature-of-business filter: Is it rare? Can it only be done poorly?

### Anti-Pattern 5: Functional Service Chaining
**Pattern:** Having functional services call each other (A calls B calls C)
**Problem:** Each service bloated with downstream parameters and upstream compensation
**Signal:** Service contract contains parameters it doesn't use directly
**Fix:** Redesign around volatility, use workflow/orchestration patterns

### Anti-Pattern 6: Client Orchestration
**Pattern:** Client stitches functional services together
**Problem:** Business logic in client, multiple clients duplicate logic
**Signal:** Client code contains sequencing, error compensation, service knowledge
**Fix:** Encapsulate orchestration in services, keep clients simple

### Anti-Pattern 7: Settling for Unit Testing
**Pattern:** Only unit testing because system too complex for integration testing
**Problem:** Unit testing alone is "borderline useless" - defects in interactions
**Signal:** Team says "we can't do regression testing, it's too complex"
**Fix:** Volatility-based decomposition enables proper regression testing

---

## The Trading System Example

### Functional Design (Wrong)
Components: Web Portal, Buying Stocks, Selling Stocks, Trade Scheduling, Reporting, Analyzing (all hitting DB)

**Problems identified:**
- Client orchestrates buy/sell - contains business logic for price changes, insufficient funds
- Changing client type (web to mobile) requires duplicating business logic
- Email notification hardcoded - changing to SMS requires modifying 5 components
- Local database hardcoded - moving to cloud requires changing 5 components
- Synchronous calls hardcoded - async requires rewriting all components
- Only handles stocks - currencies/bonds require new components or bloating
- Localization requires massive rework across all components
- Feed provider change affects all components

### Volatilities Identified

1. **User volatility** - traders, end customers, administrators
2. **Client application volatility** - web, rich desktop, mobile
3. **Security volatility** - domain auth, username/password, federated SSO
4. **Notification volatility** - email, SMS, paper, fax; single/broadcast recipients
5. **Storage volatility** - local DB, cloud, cache, distributed hash table
6. **Connection/synchronization volatility** - sync, async, queued, out-of-order
7. **Duration/device volatility** - short session vs. days-long multi-device trades
8. **Trade item volatility** - stocks, commodities, bonds, currencies, futures
9. **Workflow volatility** - different processes for different trade items
10. **Locale/regulations volatility** - rules, UI localization, compliance
11. **Market feed volatility** - different providers, formats, costs, protocols

### Volatility-Based Design (Correct)

Components organized by volatility encapsulation:
- **Client Apps:** Customer Portal, Trader App A, Trader App B (each encapsulates rendering volatility)
- **Security:** Encapsulates auth/authz volatility
- **Trade Workflow:** Encapsulates trading process volatility, uses Workflow Storage
- **Analysis Workflow:** Encapsulates analysis process volatility
- **Notification:** Encapsulates transport and recipient volatility
- **Feed Transformation:** Encapsulates data format volatility
- **Feed Access:** Encapsulates connection protocol volatility
- **Trades Access, Workflow Access, Customers Access:** Encapsulate storage technology volatility
- **Trades Storage, Workflow Storage, Customers Storage:** Actual storage (implementation detail)

**Key observations:**
- Storage abstracted as "Storage" not "Database" - enables cache, cloud, file system
- NO dedicated Reporting component (not identified as volatile - would be functional decomposition)
- Workflow storage enables long-running, multi-session, multi-device trades
- Same architecture handles connected single-session AND distributed multi-day trades

---

## Important Quotes

On the fundamental flaw of functional decomposition:
> "The problem with functional decomposition is that it endeavors to cheat the first law of thermodynamics... Precisely because it is a fast, easy, mechanistic, and straightforward design, it also manifests a contradiction to the first law of thermodynamics."

On containing change:
> "With volatility-based decomposition, you start thinking of your system as a series of vaults... Any change is potentially very dangerous, like a hand grenade with the pin pulled out. Yet, with volatility-based decomposition, you open the door of the appropriate vault, toss the grenade inside, and close the door."

On the hallmark of bad design:
> "The hallmark of a bad design is when any change to the system affects the client. Ideally, the client and services should be able to evolve independently."

---

## The 2% Problem and Dunning-Kruger Effect

**The 2% Problem:**
- Architects decompose systems only during major revolutions (every few years)
- Manager allows weeks for architecture, but cycles measured in years
- Week-to-year ratio is roughly 2%
- At 2%, you will never be good at anything
- Manager spends even less time managing architects during architecture phase
- Manager genuinely doesn't understand why functional decomposition is wrong

**Dunning-Kruger Application:**
- People unskilled in a domain think it's less complex than it is
- Manager really doesn't understand why you can't just do A, B, C
- Don't be upset - educate them
- They "by their own admission, do not understand"

**The Solution: Practice**
- Practice on everyday systems (insurance, bank, online store)
- Examine past projects - in hindsight, what were pain points?
- Look at current project - can you save it?
- Analyze non-software systems (bicycle, laptop, house)
- After 3-5 systems, you should get the general technique
- "You cannot learn to ride a bicycle from a book"

---

## Relationship to Physical Systems

Software requires design *more* than physical systems because complexity is uncapped:
- Physical systems have natural constraints (walls too heavy, cost too much)
- Software has no such natural restraints
- Complexity can spiral out of control without good engineering

Key difference is **visibility**:
- Building a house functionally would get someone fired on the spot
- The waste is visible to everyone
- In software, waste is hidden - "wasted career prospects, energy, and youth"
- "The insanity is not only permitted but encouraged"

Well-designed software systems ARE like physical entities - like well-designed machines.
