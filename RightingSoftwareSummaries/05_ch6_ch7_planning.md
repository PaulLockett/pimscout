# Chapters 6-7: Project Design - The Actionable Planning Framework

## Executive Summary

These chapters establish that **project design is to project management what architecture is to programming**. The architect must design both the system AND the project to build it. Project design provides the "assembly instructions" for the system, multiple execution options for management, and validates that the plan is feasible before work begins.

---

## Chapter 6: Motivation - Why Project Design Matters

### The IKEA Assembly Instructions Metaphor

> Would you buy a well-designed IKEA furniture set without the assembly instructions booklet?

Your software system is significantly more complex than furniture, yet architects often presume developers can "figure it out as they go along." This ad hoc approach is clearly not efficient.

**Key insight**: The only way to know how long it will take and how much it will cost is to figure out FIRST how you will build it. Each project design option comes with its own set of assembly instructions.

### Why Project Design?

No project has infinite time, money, or resources. Project design must provide management with **several viable options** trading schedule, cost, and risk.

**The key design options to provide**:
1. The least expensive way to build the system
2. The fastest way to deliver the system
3. The safest way of meeting commitments
4. The best combination of schedule, cost, and risk

**Critical dynamic**: If you present just architecture, management ordains arbitrary constraints ("You have a year and four developers"). If you present architecture WITH 3-4 project design options, the discussion becomes WHICH option to choose. All options should be good - whichever they choose becomes a good decision.

### Project Design and Project Sanity

Project design:
- Sheds light on dark corners (up-front visibility on true scope)
- Forces thinking through work before it begins
- Recognizes unsuspected relationships and limits
- Allows determination of whether project should even proceed
- Eliminates gambling with costs, death marches, and wishful thinking
- Enables evaluation of proposed changes on schedule and budget

### The Hierarchy of Needs for Projects

Adapted from Maslow's hierarchy, projects have five levels of needs (from foundational to pinnacle):

```
                    +-----------------+
                    |   Technology    |  <- Tools, Languages, Frameworks
                    +-----------------+
                    |   Engineering   |  <- Architecture, Design, QA, UX
                    +-----------------+
                    |  Repeatability  |  <- Project Management, Requirements, Config
                    +-----------------+
                    |     Safety      |  <- Adequate Funding, Time, Acceptable Risk
                    +-----------------+
                    |    Physical     |  <- Workplace, Staff, Computers, Legal, IP
                    +-----------------+
```

**Critical insights**:
1. Higher needs serve lower needs (technology serves engineering, engineering serves safety)
2. You must design the system FIRST, then design the project
3. **Project design operates at the Safety level** - more foundational than architecture
4. A classic failure pattern is the **inverted pyramid**: teams focus on technology/frameworks while ignoring time, cost, and risk

**The revealing question**: Would you rather have:
- Project A: Tightly coupled design, high maintenance cost, low reuse, BUT adequate time and proper staffing
- Project B: Amazing modular architecture, BUT understaffed and insufficient time

**Answer: Unequivocally Project A**. Project design must rank LOWER (more foundational) than architecture.

---

## Chapter 7: Project Design Overview

### Defining Success

The software industry has redefined success as "anything that doesn't bankrupt the company right now." This low bar allows anything to go.

**Lonnqvist's definition**: Success is **meeting your commitments**.

- If you call for 1 year and $1M, deliver in 1 year for $1M, not 2 years for $3M
- Higher bar: Deliver the fastest, least costly, and safest way
- Highest bar: Architecture remains good for decades (requires Part 1 system design)

### Reporting Success

**Universal rule**: Features are always and everywhere aspects of integration, not implementation.

**The problem**: The "system" (features working together) only appears toward the end. Management wants to see features early. If you report progress based on features, you're asking to be canceled.

**The solution**:
> Never base progress reports on features. Always base progress reports on integration.

Method-based projects perform lots of small integrations continuously, creating a constant stream of good news. (Like a contractor showing foundation, walls bolted, utilities connected - not because homeowner cares about these details, but to alleviate concerns.)

### Project Initial Staffing

#### Architect, NOT Architects

The principal risk in any project is **not having an architect accountable for the architecture**.

**Why a single architect is crucial**:
1. Requirements analysis and architecture are contemplative activities - more architects doesn't expedite them
2. Multiple senior architects contest with each other instead of producing designs
3. Design committees kill everything they oversee
4. Carving up the system creates "Chimera" designs - each part optimized but the whole inferior
5. With multiple architects, no one owns the in-betweens or cross-subsystem aspects
6. Accountability is the only way to earn management respect

**Junior architects**: Large projects can assign junior architects to handle secondary tasks, allowing the architect to focus on design. Clear lines of responsibility prevent competition.

#### The Core Team

Three logical roles (may or may not map to three individuals):

| Role | Primary Function | Key Responsibilities |
|------|------------------|---------------------|
| **Project Manager** | Shield team from organization | Block noise, track progress, assign work, keep project on schedule/budget/quality |
| **Product Manager** | Encapsulate customers | Proxy for customers, resolve conflicts, negotiate requirements, define priorities |
| **Architect** | Technical manager | Design lead, process lead, technical lead; designs system AND project |

**Critical note**: Developers and testers are TRANSIENT resources that come and go. The core team stays throughout.

#### The Core Mission

The mission is to design the project - reliably answering how long and how much. This is impossible without project design, which requires architecture. Architecture is merely a means to an end: project design.

### The Fuzzy Front End

The period from project idea to construction start:
- Often lasts considerably longer than recognized
- Duration depends on constraints (more constrained = less front end time)
- **Recommended: 15-25% of entire project duration**
- Software projects are never constraint-free
- Vital to verify explicit constraints and discover implicit ones

### Educated Decisions

It's pointless to:
- Approve a project without knowing true schedule, cost, and risk
- Staff a project before the organization is committed

**Staffing before commitment tends to force the project ahead regardless of affordability.**

The key to success is making educated decisions based on sound design and scope calculations. Wishful thinking is not a strategy; intuition is not knowledge.

### Plans, NOT Plan

The result of project design is a **set of plans**, not a single plan.

**Why managers' stated preferences don't work**:
- "Least costly" = 1 person for 10 years (management won't wait)
- "Quickest possible" = 3,650 people for 1 day (management won't hire this way)
- "Safest" = Not worth doing (safe projects add no value)
- "Riskiest" = Will fail

**The Software Development Plan (SDP) Review** (a.k.a. "Feed Me/Kill Me" meeting):
1. Present buffet of good options
2. "Feed Me" = management chooses option and commits resources
3. "Kill Me" = project not done (always a valid option)
4. Management literally signs off on SDP document
5. This becomes your project's life insurance policy

**If no option is palatable**: Kill the project. A doomed project wastes funds, time, AND opportunity cost of other doable projects. It also damages careers.

### Services and Developers

**The 1:1 Rule**: Always assign services to developers in a 1:1 ratio.

This doesn't mean a developer works on only one service ever, but at any cross-section in time, each developer works on exactly one service, and each service has exactly one developer.

**Why other approaches fail**:

| Approach | Problem | Result |
|----------|---------|--------|
| Multiple developers per service (serialized) | Context switch overhead | Longer than single developer |
| Multiple developers per service (parallel) | Integration overhead, voided testing | At least as long, more risk |
| Multiple services per developer | Constant switching, reduced efficiency | 3-4x longer than estimated |

Either bad assignment causes a **mushroom cloud of delays** throughout the project.

### Design and Team Efficiency

**When using 1:1 assignments, the design of the system IS the design of the team.**

The interaction between services is isomorphic to the interaction between developers.

**Loosely coupled system** = Most efficient team (minimal communication overhead, issues contained locally, near-independent work)

**Tightly coupled system** = High-stress, fragile team (territorial, resist change, inordinate meeting time)

**Paramount insight**: The only way to meet an aggressive deadline is with a world-class design that yields the most efficient team. Good design helps with IMMEDIATE objectives - long-term benefits flow from that.

### Task Continuity

When assigning activities, maintain logical continuation:
- If service A depends on service B, assign A to developer of B
- Reduces ramp-up time
- Aligns project and developer win criteria (do good job on B to avoid suffering on A)
- Consider personal technical proclivities (security expert shouldn't design UI)

---

## Effort Estimation Techniques

### Why Estimations Fail

1. **Uncertainty** is the primary cause (not the result) of poor accuracy
2. Few people are trained in effective estimation techniques
3. Overestimation and underestimation compound problems
4. Looking at just the tip of the iceberg (omitting activities)

### Classic Mistakes: Over and Under Estimation

#### Overestimation (Parkinson's Law)
- Give 3 weeks for a 2-week task
- Developer works all 3 weeks (work expands to fill time)
- Extra week goes to "gold plating" (unnecessary features)
- Increased complexity reduces success probability
- Task takes 4-6 weeks instead
- Project now owns needlessly complex code for years

#### Underestimation (Quick-and-Dirty Myth)
- Give 2 days for a 2-week task
- Developer cuts corners, disregards best practices
- There is no "quick-and-dirty" - only "quick-and-clean" or "dirty-and-slow"
- Worst possible execution method
- Task takes 4-6+ weeks instead
- Project owns code done the worst possible way

### Probability of Success Function

```
Probability
of Success
    ^
    |           _____
    |          /     \
    |         /       \
    |        /         \
    |_______/           \_______
    +----------------------------> Time
                N (Normal)
```

- To the left of N: Tipping point where probability dramatically improves
- To the right of N: Tipping point where probability collapses (Parkinson's law)
- **Good nominal estimations maximize probability of success in a nonlinear way**

### Estimation Techniques

#### Accuracy Over Precision
- Better to estimate 10 days for a 13-day task than 23.8 days
- Estimations must match tracking resolution (if weekly tracking, don't estimate to hours)
- Better to estimate 15 days than 12.5 days - allows errors to cancel out
- Asking for accurate (not precise) estimations makes them quick and simple

#### Reducing Uncertainty
- Ask for order of magnitude first (day, week, month, year?)
- Use factor of 2 to narrow down (2 weeks, 1 month, 2 months, 4 months?)
- List areas of uncertainty explicitly
- Break down large activities into smaller ones
- Invest in exploratory discovery
- Review organizational history

#### PERT Estimations
For high uncertainty activities:

```
E = (O + 4*M + P) / 6

Where:
- E = Calculated estimation
- O = Optimistic estimation
- M = Most likely estimation
- P = Pessimistic estimation
```

**Example**: O=10 days, M=25 days, P=90 days
E = (10 + 4*25 + 90) / 6 = 33.3 days

### Activity vs Overall Estimation

These are **unrelated** because overall duration is NOT sum of effort divided by resources (due to inefficiency, dependencies, and risk mitigation).

### Overall Project Estimation Techniques

1. **Historical Records**: Your track record matters most. If similar projects took 1 year, this one takes 1 year (at your organization).

2. **Estimation Tools**: Use power functions and Monte Carlo simulations with training data from previous projects.

3. **Broadband Estimation** (adapted from Wideband Delphi):
   - Assemble 12-30 diverse stakeholders
   - Brief them on project state
   - Each estimates months and people required
   - Calculate average and standard deviation
   - Identify outliers (1+ std dev from average)
   - Solicit input from outliers (they may know something)
   - Repeat until convergence (typically 3 rounds)

**Important**: Overall estimations, while accurate, are NOT actionable alone. They only augment and verify detailed project design.

### Activity Estimations

**Preparation**:
- Prepare meticulous list of ALL activities (coding and non-coding)
- Avoid focusing only on structural coding from architecture
- Look below the waterline at full iceberg
- Have colleagues review and challenge your list

**Best practice**: Use 5-day quantum
- 1-2 day activities shouldn't be in the plan
- 3-4 day activities = 5 days
- Activities are 5, 10, 15, 20, 25, 30, or 35 days
- 40+ days = candidates for breakdown

**The Estimation Dialog**:
- NEVER dictate ("You have two weeks!")
- NEVER lead ("It's going to take two weeks, right?")
- Always ask open questions: "How long will it take?"
- Force people to get back to you later (make them itemize and reflect)

---

## Critical Path Analysis

**The single most important project design technique.**

### Prerequisites

1. **System architecture** (decomposition into services, valid and stable)
2. **List of all project activities** (coding and non-coding)
3. **Activity effort estimations** (accurate)
4. **Services dependency tree** (from call chains)
5. **Activity dependencies** (including explicit integration activities)
6. **Planning assumptions** (resource availability scenarios)

### Project Network

Graphically arrange activities showing all dependencies:
- Derive from call chain propagation through system
- Include ALL activities (coding, noncoding, integration)
- Avoid grouping activities together
- The network is actually a **network of dependencies**, not just activities

### Activity Times Formula

```
T_i = E_i + Max(T_{i-1}, T_{i-2}, ..., T_{i-n})

Where:
- T_i = Time to complete activity i
- E_i = Effort estimation for activity i
- n = Number of activities leading directly to activity i
```

### The Critical Path

The **longest path** in the network (greatest duration, not necessarily most activities).

**Key properties**:
- Represents the shortest possible project duration
- Any delay on critical path delays entire project
- No project can be accelerated beyond its critical path
- You must build along critical path for quickest delivery
- Critical path exists whether you acknowledge it or not
- Without analysis, likelihood of building along critical path is nearly zero

**Note**: Projects can have multiple critical paths (all equal duration) - this is risky.

### Assigning Resources

**During project design**: Architect assigns abstract resources (Developer 1, 2, etc.)
**After option selected**: Project manager assigns actual resources

**Rules**:
1. Always assign resources to critical path FIRST
2. Assign BEST (most reliable) resources to critical path
3. Avoid classic mistake of assigning first to high-visibility but noncritical activities

### Staffing Level Discovery

Iterate to find the answer to:
> What is the lowest level of resources that allows the project to progress unimpeded along the critical path?

**Process**:
1. Start with some resource level
2. Assign based on critical path and dependencies
3. If successful, try with fewer resources
4. Stop when activities become blocked (subcritical staffing)

**Subcritical staffing**: When lack of resources causes noncritical activities to become critical, creating a new, longer critical path. The project will miss its deadline.

### Float-Based Assignment

**Float**: The amount of time you can delay an activity without delaying the project.
- Critical activities have zero float
- Noncritical activities have positive float

**Rule**: Always assign resources based on float (low to high).

**Process**:
1. Calculate float for all available activities
2. Assign developer to lowest float first (critical path)
3. Assign next developer to next lowest float
4. While activities are unassigned, you consume their float
5. If float reaches zero before assignment, activity becomes critical

**Key advantage**: Float-based assignment is also the SAFEST - activities with least float are riskiest.

**Critical observation**: Resource dependencies ARE dependencies. A single-resource project has a completely different (linear) network than the activity-dependency network.

### The Classic Pitfall (Tom DeMarco)

Organizations incentivize wrong behavior:
1. Manager can't assign developers without project design
2. Project design requires completed architecture
3. Architecture follows fuzzy front end (months)
4. Empty desks make manager look bad
5. Manager fears blame when project is late
6. Manager hires developers immediately
7. Developers have nothing to do (or worse, get assigned arbitrary features)
8. Architecture becomes irrelevant
9. Project grossly misses schedule
10. Manager looks no worse than other managers

**Solution**: Confront this pitfall head-on in project design.

---

## Scheduling Activities

Convert workday-based network to calendar dates using tools (Microsoft Project, spreadsheet):
1. Define all activities
2. Add dependencies as predecessors
3. Assign resources according to plan
4. Select start date
5. Tool schedules all activities

**Caution**: Gantt charts in isolation are detrimental - they give illusion of planning without full project design.

### Staffing Distribution

**Correct pattern**:
```
Staffing
    ^
    |           _______
    |          /       \
    |         /         \
    |        /           \
    |_______/             \______
    +-----------------------------> Time
         ^     ^    ^      ^    ^
         |     |    |      |    |
       Front  Ramp Peak  Phase System
       End    Up   Staff  Out   Test
```

**Phases**:
1. Front end (core team only)
2. SDP review (approve/kill)
3. Initial ramp-up (enabling activities)
4. Peak staffing (system appears at end)
5. Phase out (most dependent activities)
6. System testing and release

### Staffing Distribution Mistakes

| Pattern | Problem | Root Cause |
|---------|---------|------------|
| Rectangular | Constant staffing (wasteful) | No phasing |
| Huge peak | Waste in hiring/training | Not consuming enough float |
| Flat line (valley) | Subcritical, missing resources | Insufficient staffing |
| Erratic (up/down) | Unrealistic elasticity | Staffing can't be that elastic |
| High ramp-up | Wishful thinking | Can't instantly be productive |

### Smoothing the Curve

Good projects have **smooth** staffing distributions.

**Two root causes of incorrect staffing**:
1. Assuming too elastic staffing
2. Not consuming float when assigning resources

**Better design = more elasticity possible** (developers come to terms faster)

---

## Project Cost

Software cost is overwhelmingly **labor**. No cost of goods or raw materials.

```
Cost = Staffing * Time
```

This equals the **area under the staffing distribution chart**.

### Cost Calculation Formula

```
Cost = Sum over i=1 to n of: S_i * (T_i - T_{i-1})

Where:
- S_i = Staffing level at date of interest i
- T_i = Date of interest i (T_0 is start date)
- n = Number of dates of interest
```

Use man-months or man-years (not currency) to objectively compare options.

**This is the only way to answer how much the project will cost.**

### Project Efficiency

```
Efficiency = Sum of effort across all activities / Actual project cost
```

**Expected efficiency for well-designed projects**: 15-25%

**Why higher efficiency is a red flag**:
- No process in nature approaches 100%
- Constraints prevent optimal resource leverage
- Core team, testers, DevOps, etc. reduce coding portion
- 40% efficiency projects are simply impossible

**Efficiency correlates with**:
- Staffing elasticity (more elastic = higher efficiency)
- Network criticality (more critical paths = higher efficiency but higher risk)

**Use efficiency as estimation**: If historical efficiency is 20%, multiply sum of effort by 5 for rough cost.

---

## Earned Value Planning

Assign value to each activity toward project completion, then combine with schedule.

### Planned Earned Value Formula

```
EV(t) = (Sum of E_i for completed activities) / (Sum of E_i for all activities)

Where:
- E_i = Estimated duration for activity i
- t = Point in time
```

**Key insight**: The pitch of the planned earned value curve represents team throughput. Better team = steeper line = same 100% sooner.

### Classic Mistakes in Earned Value Charts

#### Unrealistically Optimistic (Back-Scheduling)
```
Earned Value
    ^
    |              /
    |             /
    |            /
    |___________/
    +-----------------> Time
```

Shallow for most of project, then rocket launch at end. Usually from back-scheduling against arbitrary deadline.

#### Unrealistically Pessimistic
```
Earned Value
    ^         _______
    |        /
    |       /
    |      /
    |_____/
    +-----------------> Time
```

Healthy start, then productivity expected to suddenly diminish. Will fail due to gold plating and complexity.

### The Shallow S Curve

**A properly staffed, well-designed project ALWAYS results in a shallow S curve.**

```
Earned Value
    ^                    ___100%
    |                ___/
    |            ___/
    |         __/
    |      __/
    |_____/
    +-------------------------> Time
         ^      ^     ^      ^
         |      |     |      |
       Core   SDP   Peak   Phase
       Team   Rev  Staff   Out
```

**The shape relates to staffing distribution**:
1. Front end: Flat (only core team)
2. After SDP: Steeper (adding people)
3. Peak staffing: Straight line (maximum throughput)
4. Phasing out: Levels off until completion

**The shallow S is a special case of the logistic function** - the single most important function for modeling dynamic change.

### Using Earned Value for Validation

If planned earned value is:
- Straight line = Problem (fixed team size, not phasing)
- Optimistic rocket launch = Danger
- Pessimistic plateau = Danger
- Shallow S = Plan is sound and sensible

---

## Roles and Responsibilities Summary

| Role | System Design | Project Design | Project Execution |
|------|--------------|----------------|-------------------|
| **Architect** | Creates | Creates (with PM input) | Technical leadership |
| **Project Manager** | Input | Input | Assigns actual resources, tracks progress |
| **Product Manager** | Essential collaborator | - | - |
| **Management** | - | Selects option | - |
| **Developers** | - | - | Execute assigned activities |

**Critical realization**: Project design is part of the engineering effort, never left for construction workers to figure out on-site.

**The architect's design attributes include**: maintainability, reusability, extensibility, feasibility, scalability, throughput, availability, responsiveness, performance, security, AND **schedule, cost, and risk**.

---

## Step-by-Step Project Design Procedure

### Phase 1: Prerequisites (Core Team)
1. Gather and analyze requirements
2. Identify core use cases and areas of volatility
3. Complete system architecture (1-2 weeks actual design)
4. Validate architecture (may take months to reach this point)

### Phase 2: Activity Planning
1. Derive coding activities from architecture (services, modules)
2. List ALL non-coding activities (testing, compliance, integration, etc.)
3. Break down large activities (40+ days) into smaller ones
4. Have colleagues review and challenge activity list

### Phase 3: Estimation
1. Estimate each activity using 5-day quantum
2. Use multiple techniques (order of magnitude, PERT, historical)
3. Use open questions, force reflection
4. Perform overall estimation (broadband, historical, tools)
5. Cross-validate activity sum vs overall estimation

### Phase 4: Network and Critical Path
1. Create activity dependency network from call chains
2. Add non-coding activity dependencies
3. Calculate activity times using formula
4. Identify critical path (longest duration path)
5. Calculate float for all activities

### Phase 5: Staffing Options
1. Try different staffing levels (start high, reduce)
2. Assign based on float (lowest first)
3. Find lowest level that doesn't go subcritical
4. Create multiple options (fastest, cheapest, safest, balanced)

### Phase 6: Scheduling and Validation
1. Convert to calendar dates
2. Create staffing distribution chart
3. Check for smooth curve (no peaks, valleys, erratic patterns)
4. Calculate project cost (area under staffing chart)
5. Calculate efficiency (should be 15-25%)
6. Create earned value chart
7. Verify shallow S curve

### Phase 7: SDP Review
1. Prepare 3-4 viable options
2. Include "Kill Me" option (not doing project)
3. Present at Software Development Plan Review
4. Get management sign-off on chosen option
5. Only THEN assign actual developers

---

## Key Formulas Reference

| Calculation | Formula |
|-------------|---------|
| **PERT Estimation** | E = (O + 4M + P) / 6 |
| **Activity Time** | T_i = E_i + Max(T_{i-1}, ..., T_{i-n}) |
| **Project Cost** | Sum of: S_i * (T_i - T_{i-1}) |
| **Project Efficiency** | Sum(Activity Effort) / Project Cost |
| **Earned Value** | Sum(Completed E_i) / Sum(All E_i) |

---

## Red Flags Checklist

- [ ] No single architect accountable for design
- [ ] Project approved without knowing true cost/schedule
- [ ] Single plan instead of options
- [ ] Resources assigned before architecture complete
- [ ] Multiple developers per service OR multiple services per developer
- [ ] Progress reported on features instead of integration
- [ ] Estimations dictated or leading questions used
- [ ] Activities over 40 days not broken down
- [ ] Efficiency over 25% (unrealistic)
- [ ] Staffing distribution not smooth
- [ ] Earned value not shallow S curve
- [ ] Critical path not identified
- [ ] Resources not assigned by float
