# Righting Software - Book Synthesis

## Core Thesis

Juval Löwy's "Righting Software" presents a unified methodology for software engineering that treats **system design** and **project design** as inseparable, complementary disciplines. The fundamental insight is that the software industry's chronic failures—cost overruns, schedule slips, quality issues, maintenance burden—all trace to a single root cause: **poor design** of both the software architecture AND the project used to build it.

**The Method Formula:** System Design + Project Design = Success

Neither alone is sufficient. A brilliant architecture fails without viable project planning; a well-planned project fails if it builds the wrong architecture.

---

## Part I: System Design - The 3 Core Concepts

### 1. Volatility-Based Decomposition (Chapter 2)

**The Prime Directive:** Never decompose based on functionality or domain. Decompose based on volatility.

**Why it matters:** Functional decomposition (Invoicing, Billing, Shipping) and domain decomposition (Sales, Accounting, HR) couple your system to today's requirements. When requirements change—and they will—the change ripples through multiple components. Volatility-based decomposition contains change like a vault contains an explosion.

**The Process:**
1. Identify areas of potential change (volatilities)
2. Encapsulate each volatility into a component
3. Implement behavior as interaction between components
4. Validate: Every component maps to a volatility (not a function)

**The Two Axes of Volatility:**
- Same customer over time (will they need changes?)
- Same time across customers (do different customers need differences now?)

### 2. Layered Structure (Chapter 3)

**The Universal Template:** All well-designed systems follow the same pattern—like how biology uses the same architecture for mouse and elephant.

**The Four Layers:**
1. **Clients** - WHO uses the system (portals, apps)
2. **Managers** - WHAT sequences/orchestrates (business workflows)
3. **Engines** - HOW (business logic implementation)
4. **Resources** - WHERE data lives (storage, external systems)

Plus a **Utilities** bar cutting vertically (logging, security, etc.)

**The Four Questions for Classification:**
- WHO calls it? → Client
- WHAT does it orchestrate? → Manager
- HOW does it implement business logic? → Engine
- WHERE does it store/retrieve? → ResourceAccess/Resource

**Managers vs Engines:**
- Managers: Encapsulate **sequence volatility** (the order things happen)
- Engines: Encapsulate **activity volatility** (how things are done)
- Rule: If you have 8+ Managers, your design has failed

### 3. Composable Design (Chapter 4)

**The Design Prime Directive:** Never design against the requirements.

This sounds counterintuitive but is profound: Requirements are full of "solutions masquerading as requirements." Design against the underlying volatilities instead.

**Core Use Cases:** Every system has 2-6 "core use cases" that represent the essence of the business. The architect's mission is to find the ~10 components that can combine in different ways to satisfy all core use cases.

**"There Is No Feature":** Features are aspects of integration, not implementation. At every level of decomposition—system, subsystem, component, class—there's no "feature." Just smaller building blocks that compose.

---

## Part II: Project Design - The Complete Framework

### The Fundamental Insight

Project design is **more important** than system design. You can survive a mediocre architecture with good project design; you cannot survive bad project planning with any architecture.

### The Core Techniques

#### 1. Network-Based Planning

Projects are networks of activities with dependencies—not lists of tasks. The **critical path** (longest duration path through the network) determines the minimum possible duration.

Key concepts:
- **Float/Slack**: How much an activity can slip without affecting the project
- **Total Float**: Delay without delaying the project
- **Free Float**: Delay without affecting any other activity
- Activities on the critical path have zero float

#### 2. Time-Cost-Risk Tradeoffs

Every project has multiple viable solutions trading:
- **Time**: Duration to completion
- **Cost**: Resources required (direct + indirect)
- **Risk**: Probability and impact of failure

**The Time-Cost Curve:**
- Normal Solution: Minimum duration with no wasteful parallelism
- Compressed Solutions: Faster but more expensive/risky
- Full Compression: The minimum possible duration (~70% of normal)
- Death Zone: Beyond full compression—impossible

**The 30% Rule:** Maximum practical compression is ~30% of normal duration.

#### 3. Risk Management

**Criticality Risk Formula:**
```
Risk = (4×Critical + 3×Red + 2×Yellow + 1×Green) / (4×Total)
```

**Key Thresholds:**
- Risk > 0.75: Unacceptable
- Risk < 0.30: Wasteful (undercompressed)
- Target: 0.50
- Normal solutions: Max 0.70

**Risk Decompression:** When risk is too high, add duration to reduce it. Target 0.5 risk.

#### 4. Effort Estimation

**PERT Formula:** (Optimistic + 4×MostLikely + Pessimistic) / 6

**Broadband Estimation:** 12-30 people estimate independently, iterate until convergence.

**Golden Rules:**
- Use 5-day quantum (one workweek)
- Activity vs. Overall estimations are unrelated (use both to cross-validate)
- Duration ≠ Effort / Resources

#### 5. Project Tracking

**Earned Value:** Progress = Completed Effort / Total Effort

**The Shallow S Curve:** A well-designed project always produces a smooth, shallow S-curve of progress. Straight lines, rocket launches, or plateaus indicate problems.

**Activity Lifecycle:**
1. Not Started
2. In Progress
3. Testing/Validation
4. Code Complete

---

## The Design Standard (Quick Reference)

### The 9 Directives (Never Violate)

1. Design for volatility, not functionality
2. Strive for a handful of building blocks (~10)
3. Use layered architecture (Client → Manager → Engine → Resource)
4. Maximize encapsulation; avoid open architectures
5. Managers orchestrate sequences; Engines implement activities
6. Never have Managers call Managers synchronously
7. Present multiple project options with schedule/cost/risk tradeoffs
8. Always identify the critical path
9. Track earned value, not features

### Key Ratios and Thresholds

| Metric | Target | Red Flag |
|--------|--------|----------|
| Building blocks | ~10 | >20 |
| Managers per subsystem | 1-3 | >8 |
| Service operations | 3-5 | >20 |
| Project efficiency | 15-25% | >25% |
| Risk | 0.50 | >0.75 |
| Compression | <30% | >30% |
| Cyclomatic complexity | 10-12 | >15 |

---

## Key Procedural Frameworks

### System Design Procedure

1. **Gather requirements** (3-5 days max)
2. **Identify volatilities:**
   - Apply two-axis analysis
   - Scrub solutions masquerading as requirements
   - Competitor analysis
   - Longevity analysis
3. **Create component diagram:**
   - One component per volatility
   - Classify into layers (Client/Manager/Engine/Resource)
   - Add Utilities bar
4. **Validate with core use cases:**
   - Draw sequence diagrams for each
   - Every component should participate
   - No component should exist without a volatility
5. **Verify architecture properties:**
   - ~10 building blocks
   - 1-3 Managers per subsystem
   - Closed architecture (with defined relaxations)
   - Symmetric structure

### Project Design Procedure

1. **Create activity list** from architecture (one per service)
2. **Build network diagram** with dependencies
3. **Estimate effort** for each activity (PERT + broadband)
4. **Find normal solution:**
   - Calculate critical path
   - Assign resources (lowest float first)
   - Verify efficiency 15-25%
   - Check for shallow S-curve
5. **Compress network** to create options:
   - Better resources
   - Parallel work (split activities, add infrastructure)
   - Track cost and risk at each step
6. **Present options** at SDP review:
   - 3-4 viable options
   - Each with schedule/cost/risk
   - Management chooses
7. **Track during execution:**
   - Earned value against plan
   - Projection formulas for course correction

---

## Anti-Patterns to Avoid

### System Design
- Functional decomposition (services = functions)
- Domain decomposition (services = business domains)
- Client orchestration (business logic in clients)
- Service chaining (A calls B calls C)
- Open architectures (any-to-any calls)
- "There is no Reporting component" (unless volatility-justified)

### Project Design
- Back-scheduling (deadline → backwards estimation)
- Elastic staffing (assuming more people = faster)
- Feature-based progress reporting
- Ignoring the critical path
- Single-option planning
- Efficiency > 25%

---

## Transformative Insights

1. **Constraints enable design.** A clean canvas is the worst design problem. More constraints = easier decisions.

2. **Time-box design.** 3-5 days for system design; longer doesn't improve results.

3. **Project design > System design.** In terms of project success, planning matters more than architecture.

4. **The thermodynamic argument.** If design is "easy and straightforward," it cannot add value. Good design requires effort.

5. **Unit testing is borderline useless.** Defects emerge from interactions. Volatility-based decomposition enables real testing.

6. **Features are integration, not implementation.** At every level of decomposition, there are only building blocks that compose.

7. **The design of the system IS the design of the team.** One developer per service. The architecture mirrors the organization.

8. **Report on integrations, not features.** Features appear late; integrations provide steady good news.

9. **All well-designed systems look the same.** Like biology—mouse and elephant use the same architecture. Your system should fit the universal template.
