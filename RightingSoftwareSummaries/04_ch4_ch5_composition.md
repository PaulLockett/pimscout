# Chapters 4 & 5: Composition and System Design Example

## Chapter 4 Thesis

The chapter's central argument is that **validating your design requires demonstrating that the components of your architecture can compose at runtime to satisfy core use cases**. Since requirements constantly change, the only way to create a durable design is to never design against the requirements directly. Instead, identify the smallest set of components that can be combined to support all core use cases - present and future, known and unknown.

The hallmark of a bad design: **when the requirements change, the design has to change as well**.

---

## The Design Prime Directive

**"Never design against the requirements."**

This directive contradicts what most architects have been taught, yet the reasoning is straightforward:

1. **Requirements change** - this is what requirements do
2. **Designing against requirements maximizes affinity** between requirements and system design
3. **When requirements change, the design must change** - which is painful, destructive, and expensive
4. People learn to **resent changes** to requirements, literally resenting the hand that feeds them

The solution: Stop designing against requirements. Design against areas of volatility instead.

### Why Requirements Are Futile

- A decent-sized system has dozens of use cases; large systems have hundreds
- No one has ever had time to correctly spec-out hundreds of use cases at the beginning
- Given 300 use cases, the real number might be 330 (missing cases) or 200 (duplicates)
- Some use cases may be mutually exclusive
- Even perfect documentation becomes worthless because requirements will change

---

## Core Use Cases

### What They Are

Core use cases represent **the essence of the business** of the system. They are the fundamental behaviors that define what the system exists to do.

**Key characteristics:**
- Most use cases are variations of other use cases (normal case, error case, locale-specific, etc.)
- There are only two types: **core use cases** and **all other use cases**
- Core use cases **rarely change** because the nature of the business rarely changes
- Regular use cases change at great rate across customers; core use cases are shared by all

**Typical count:**
- Most systems have as few as **2-3 core use cases**
- The number seldom exceeds **6 core use cases**
- Count the bullets on a single-page marketing brochure - that is often your core use case count

### How to Identify Core Use Cases

1. **They will not be explicit** in requirements documents
2. **They are abstractions** of other use cases
3. **They may require new terminology** to differentiate from regular use cases
4. **Even flawed requirements** will contain them because they are the essence
5. **Look at the one-sentence definition** of the system

**Identification technique:**
- Consider what would be on a single-page marketing brochure
- Ask: What is the system's reason for being?
- Find what is shared across ALL customers, not customized per customer

**TradeMe Example:**
The provided use cases (Add Tradesman, Create Project, Pay Tradesman) were not core - they were simple functionalities. The actual core use case came from the opening definition: "TradeMe is a system for matching tradesmen to contractors and projects." The Match Tradesman use case was the only candidate for a core use case.

---

## The "There Is No Feature" Principle

**"Features are always and everywhere aspects of integration, not implementation."**

This is a universal design rule governing all systems.

### The Automobile Example

A car must transport you from A to B. Where is this feature manufactured? It **emerges** when you integrate:
- Chassis
- Engine block
- Gear box
- Seats
- Dashboard
- Driver
- Road
- Insurance
- Fuel

### The Fractal Nature

The rule applies at every level of decomposition:

**Laptop provides word processing:**
- Integrates keyboard, screen, hard drive, bus, CPU, memory
- No "Word Processing" box in the architecture

**Hard drive provides storage:**
- Integrates memory, internal bus, media, cables, ports, power regulators, screws
- No "Storage" block in the design

**Screw provides fastening:**
- Integrates head, thread, stem
- Fastening emerges from integration

You can drill down to quarks and never see a feature.

### Implications

If you are writing code that "implements a feature," you are going against the way the universe is put together. The feature should emerge from the integration of components that each encapsulate volatility.

---

## Composable Design

### The Concept

A composable design **does not aim to satisfy any use case in particular**. Instead:

1. **Identify the smallest set of components** that can be put together to satisfy all core use cases
2. Since all other use cases are **variations of core use cases**, they represent **different interactions between the same components**, not different decomposition
3. When requirements change, **interaction changes** but **decomposition does not**

### Human Body Analogy

Homo sapiens appeared 200,000+ years ago when requirements did not include software architecture. The single core use case has not changed: **survive**. We use the same components as prehistoric humans, just integrated differently.

### The "Smallest Set"

**Why smallest?** Minimize work in detailed design and implementation. Less is more.

**Natural constraints:**
- 1 component (monolith): Too much internal complexity
- 300 components (one per use case): Too much integration cost
- Optimal: Order of magnitude of **10 components**

**Using The Method typically yields:**
- 2-5 Managers
- 2-3 Engines
- 3-8 ResourceAccess and Resources
- Half-dozen Utilities
- **Total: A dozen or two at most**

**Why ~10 works:** Combinatorics. Even without repetition or partial sets, 10 components yield a staggering number of possible combinations - enough to support an astronomical number of use cases.

---

## Architecture Validation

### The Process

Once you can produce an interaction between your services for each core use case, you have produced a **valid design**.

**Validation methods:**

1. **Call Chain Diagrams**
   - Simple diagrams showing interaction between components
   - Superimpose onto layered architecture
   - Solid black arrow: synchronous (request/response) calls
   - Dashed gray arrow: queued calls
   - Quick and easy; good for non-technical audiences
   - Downside: No notion of call order, duration, or multiple calls to same component

2. **Sequence Diagrams**
   - Vertical bars representing component lifelines
   - Time flows top to bottom
   - Bar length indicates relative duration
   - More detail; takes longer to produce
   - Best for complex use cases and technical audiences
   - Useful later for defining interfaces, methods, parameters

### Duration of Design Effort

- Requirements gathering and analysis: weeks or months
- Producing a valid design using The Method: **order of magnitude is days**
- With practice: **a few hours**

---

## Handling Change

### The Problem with Functional Decomposition

- Change is never in one place
- Change spreads across multiple components
- Change is expensive and painful
- People defer changes or fight them
- Fighting change = killing the system (pushing customers away)

### Containing the Change

With volatility-based decomposition:

1. **A change to a requirement = change to a use case**
2. **Some Manager implements the workflow** executing the use case
3. **The Manager may be gravely affected** - perhaps discarded entirely
4. **But underlying components are NOT affected** by the change

**The Manager is almost expendable.** This is by design.

### Where the Real Effort Goes

The bulk of effort goes into services the Manager uses:

| Component | Why It Is Expensive |
|-----------|---------------------|
| **Engines** | Vital business activities, encapsulate volatility and complexity |
| **ResourceAccess** | Identify atomic business verbs, translate to access methodologies, expose Resource-neutral interfaces |
| **Resources** | Scalable, reliable, performant, reusable; schemas, caching, partitioning, replication, transactions, etc. |
| **Utilities** | Top skills required; security, diagnostics, logging, instrumentation must be trustworthy |
| **Clients** | Superior UX or convenient APIs; must interface with Managers |

**The payoff:** When change happens to the Manager, you salvage and reuse all effort in Clients, Engines, ResourceAccess, Resources, and Utilities. You reintegrate them in the Manager.

This is the **essence of agility**.

---

## Step-by-Step Procedures

### Chapter 4: Validating a Design

1. **Identify the core use cases** (typically 2-6)
   - Look for the essence of the business
   - Abstract from the variations
   - May need new terminology

2. **Verify you have the smallest set of components**
   - Order of magnitude ~10
   - Cannot be reduced further without losing encapsulation
   - Cannot think of a smaller set that still supports core use cases

3. **For each core use case, produce a call chain or sequence diagram**
   - Show how components interact to support the use case
   - Use solid arrows for synchronous, dashed for queued
   - Color lifelines by architectural layer

4. **Validate that the same components support multiple use cases**
   - Different use cases = different interactions, same decomposition
   - If adding a use case requires new components, reevaluate volatility analysis

### Chapter 5: System Design Process (TradeMe Method)

**Phase 1: Business Alignment**

1. **Establish a shared vision** (one sentence)
   - Get all stakeholders to agree
   - Drives everything; justifies decisions
   - TradeMe: "A platform for building applications to support the TradeMe marketplace."

2. **Itemize business objectives**
   - Reject objectives that do not serve the vision
   - Include all essential objectives
   - Adopt business perspective (not engineering/marketing)
   - TradeMe had 7 objectives (unify repos, quick turnaround, customization, visibility, forward-looking, integration, security)

3. **Articulate mission statement** (how you will do it)
   - Connects vision to architecture
   - TradeMe: "Design and build a collection of software components that the development team can assemble into applications and features."
   - Note: Mission is to build components, not features

4. **Create the chain:** Vision -> Objectives -> Mission Statement -> Architecture

**Phase 2: Glossary and Initial Decomposition**

5. **Compile a glossary** - answer the four questions:
   - **Who:** Users, roles, external parties
   - **What:** Business entities and concepts
   - **How:** Activities and processes
   - **Where:** Storage, deployment, external systems

6. **Map answers to potential layers/components**
   - "What" hints at possible subsystems
   - Use swim lanes technique

**Phase 3: Volatility Analysis**

7. **For each candidate volatility, ask:**
   - What exactly is volatile?
   - Why is it volatile?
   - What risk does the volatility pose (likelihood and effect)?
   - Is it the true volatility or is there a more generic volatility?
   - Could this be domain decomposition in disguise?

8. **Identify volatile areas that merit architecture components**
   - Map each volatility to a component type (Manager, Engine, Resource, etc.)
   - Multiple volatilities may map to one component
   - Some volatilities may be outside system scope

9. **Identify weak volatilities** that do not merit components
   - Can be handled by existing components
   - May be speculative
   - May be outside business scope

**Phase 4: Architecture Creation**

10. **Create static architecture diagram**
    - Clients layer
    - Business Logic layer (Managers, Engines)
    - ResourceAccess layer
    - Resources layer
    - Utilities bar

11. **Define operational concepts**
    - How components communicate
    - Integration patterns (e.g., Message Bus)
    - Special patterns (e.g., Message Is the Application, Workflow Manager)

**Phase 5: Design Validation**

12. **Transform raw use cases** using swim lanes
    - Add swim lanes for areas of interaction
    - Clarify with decision boxes and synchronization bars
    - Refactor to map cleanly to subsystems

13. **For each core use case, create call chain diagram**
    - Show how architecture supports the use case
    - Demonstrate interaction between components
    - Verify all required volatilities are addressed

14. **Demonstrate support for non-core use cases**
    - Shows versatility of design
    - Same components, different interactions

15. **Present validation to stakeholders**
    - If validation is ambiguous, return to design

---

## TradeMe Case Study Summary

### Business Context

**What TradeMe Does:**
- Matches tradesmen (plumbers, electricians, carpenters, etc.) to contractors and projects
- Tradesmen are self-employed with varying skill levels and certifications
- Rates vary by discipline, experience, location, weather, regulations
- Contractors need tradesmen on ad hoc basis (days to weeks)
- System handles matching, dispatching, hours/wages tracking, regulatory reporting
- Makes money on spread between ask/bid rates plus membership fees

**The Legacy Problem:**
- Full-time call center users with two-tier desktop app
- Five different applications with manual integration
- Business logic in clients preventing modern UX
- Multiple repositories requiring manual reconciliation
- Security vulnerabilities, no design
- Cannot accommodate mobile, automation, cloud, fraud detection
- Cannot handle regulatory changes across locales

**The Company:**
- Views itself as tradesmen broker, not software company
- Past replacement attempts failed
- Has financial resources
- Ready to adopt sound approach

### Vision, Objectives, Mission

**Vision:** "A platform for building applications to support the TradeMe marketplace."

**Seven Business Objectives:**
1. Unify repositories and applications
2. Quick turnaround for new requirements
3. High customization across countries/markets
4. Full business visibility and accountability
5. Forward-looking on technology and regulations
6. Integrate well with external systems
7. Streamlined security

**Mission Statement:** "Design and build a collection of software components that the development team can assemble into applications and features."

### Volatilities Identified

| Volatility | Component | Reasoning |
|------------|-----------|-----------|
| Client applications | Multiple Clients | Different users, technologies, devices, connectivity |
| Managing membership | Membership Manager | Activities change across locales and over time |
| Fees | Market Manager | Multiple ways to make money |
| Projects | Market Manager | Project requirements volatile, affect workflows |
| Disputes | Membership Manager | Handling dispute resolution varies |
| Matching algorithms | Search Engine | Open-ended ways to find matches |
| Search criteria definition | Market Manager | What constitutes a good match |
| Education workflow | Education Manager | Matching classes to tradesmen |
| Regulations | Regulation Engine | Change over time and by country |
| Reports/Auditing | Regulation Engine | Compliance requirements |
| Localization | Clients + Regulation Engine | Language/culture in UI, regulations in engine |
| Resources | Multiple Resources | Nature of storage is volatile |
| Resource access | ResourceAccess components | Location, type, technology of access |
| Deployment model | Message Bus + Subsystem composition | Data locality, cloud options |
| Auth/authz | Security Utility | Multiple authentication/authorization options |

**Rejected as Domain Decomposition:**
- "Tradesman" - variable but not volatile; would signal domain decomposition
- "Education certificates" - certification is attribute; volatility is in workflow
- "Projects" - Project Manager implies project context; Market Manager is better

**Weak Volatilities Not Reflected:**
- Notification - Message Bus encapsulates this
- Analysis - Company not in optimization business; folded into Market Manager

### The Architecture Created

**Clients:**
- Tradesman Portal
- Contractors Portal
- Education Portal
- Marketplace App
- Timer (external process)

**Business Logic (Managers):**
- Membership Manager
- Market Manager
- Education Manager

**Business Logic (Engines):**
- Regulation Engine
- Search Engine

**ResourceAccess:**
- Regulations Access
- Payments Access
- Members Access
- Projects Access
- Contractors Access
- Education Access
- Workflows Access

**Resources:**
- Regulations, Payments, Members, Projects, Contractors, Education, Workflows

**Utilities:**
- Security
- Message Bus
- Logging

### Key Operational Concepts

**1. Message Bus**
- Queued Pub/Sub for N:M communication
- All Client-to-Manager communication goes through it
- Provides decoupling, availability, robustness
- High throughput via queues

**2. Message Is the Application Pattern**
- No identifiable "application" - just services posting/receiving messages
- Each service does unit of work, posts back to bus
- Services transform messages, add context
- Application behavior = aggregate of transformations + local work
- Changes induce changes in how services respond, not architecture
- Supports extensibility: add message processing services without modifying existing ones

**3. Workflow Manager Pattern**
- All Managers are workflow managers
- Load workflow type and instance with state/context
- Execute workflow
- Persist back to workflow store
- Supports long-running workflows
- No session with Client while remaining state-aware
- Changes = edit workflows, deploy generated code
- Product owners can potentially edit behavior directly

### How Use Cases Were Validated

**Add Tradesman/Contractor:**
- Swim lanes: Tradesman | Membership
- Call chain: Portal -> Message Bus -> Membership Manager -> (Regulation Engine, Members Access, Payments Access, Workflows Access)

**Request Tradesman:**
- Swim lanes: Contractor | Market
- Call chain: Portal/App -> Message Bus -> Market Manager -> (Regulation Engine, Projects Access, Workflows Access)
- Triggers Match Tradesman

**Match Tradesman (Core Use Case):**
- Initial swim lanes: Client | Market | Regulations | Search | Membership
- Refactored: Client | Market | Membership
- Call chain: App -> Message Bus -> Market Manager -> (Search Engine, Projects Access, Contractors Access, Workflows Access) -> Message Bus -> Membership Manager

**Assign Tradesman:**
- Swim lanes: Client | Membership | Market
- Collaborative work between Membership Manager and Market Manager via Message Bus

**Terminate Tradesman:**
- Bidirectional - can be triggered by contractor or tradesman
- Market Manager <-> Message Bus <-> Membership Manager

**Pay Tradesman:**
- Triggered by external Timer
- Timer -> Message Bus -> Market Manager -> (Workflows Access, Payment Access) -> External Payment System

**Create/Close Project:**
- Market Manager workflow execution
- Close Project involves both Market Manager and Membership Manager

---

## Key Quotes

### On the Design Prime Directive
> "Never design against the requirements."

### On Resenting Change
> "Most developers and architects design their system against the requirements... However, when the requirements change, their design also must change. In any system, a change to the design is very painful, often destructive, and always expensive. Since nobody likes pain (even when it is self-inflicted, as in this case), people have learned to resent changes to requirements, literally resenting the hand that feeds them."

### On Composable Design
> "Your mission as an architect is to identify the smallest set of components that you can put together to satisfy all the core use cases. Since all the other use cases are merely variations of the core use cases, the regular use cases simply represent a different interaction between the components, not a different decomposition. Now when the requirements change, your design does not."

### On "There Is No Feature"
> "Features are always and everywhere aspects of integration, not implementation."

### On Core Use Cases
> "While the system may have hundreds of use cases, the saving grace is that the system will have only a handful of core use cases. In our practice at IDesign, we commonly see systems with surprisingly few core use cases. Most systems have as few as two or three core use cases, and the number seldom exceeds six."

### On Fighting Change
> "Unfortunately, fighting the change is tantamount to killing the system. Live systems are systems that customers use, and dead systems are systems that customers do not use."

### On Design Validation
> "Once you can produce an interaction between your services for each core use case, you have produced a valid design. There is no need to know the unknown or to predict the future."

### On The Mission Statement
> "This mission statement deliberately does not identify developing features as the mission. The mission is not to build features - the mission is to build components."

### On Business Alignment
> "It now becomes much easier to justify volatility-based decomposition that serves the mission statement because all the dots are connected: Vision -> Objectives -> Mission Statement -> Architecture"

### On The Message Is the Application
> "The paramount aspect of the Message Is the Application pattern is that the required behavior of the application is the aggregate of those transformations plus the local work done by the individual services. Any required behavior changes induce changes in the way your services respond to the messages, rather than the architecture or the services."

### On Agility
> "When a change happens to the Manager, you get to salvage and reuse all the effort that went into the Clients, the Engines, the ResourceAccess, the Resources, and the Utilities. By reintegrating these services in the Manager, you have contained the change and can quickly and efficiently respond to changes. Is that not the essence of agility?"

---

## Extractable Techniques Summary

### For Composing Systems

1. **Design for integration, not implementation** - Features emerge from component integration
2. **Target ~10 components** - Combinatorics provides astronomical use case coverage
3. **Use message bus for decoupling** - Especially when extensibility is a key objective
4. **Apply Message Is the Application pattern** - When volatility in workflows is high
5. **Use Workflow Managers** - When workflow changes exceed developer ability to keep up with code

### For Validating Designs

1. **Identify 2-6 core use cases** - The essence of business
2. **Transform use cases with swim lanes** - Map to areas of interaction
3. **Create call chain diagrams** - Quick validation showing component interaction
4. **Create sequence diagrams** - Detailed validation with timing
5. **Test composability** - Same components should support multiple use cases with different interactions

### For Handling Change

1. **Make Managers expendable** - They absorb the cost of change
2. **Invest in underlying services** - Engines, Resources, Utilities are expensive but reusable
3. **Contain change to integration** - Not decomposition
4. **Never fight change** - It kills the system
5. **Respond quickly** - Part of responding to change is responding fast
