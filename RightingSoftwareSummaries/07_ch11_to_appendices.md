# Chapters 11-14 and Appendices: Project Design in Action, Complexity, Example, and Design Standard

## Chapter 11: Project Design in Action

### The Mission: Inputs to Project Design

Every project design effort requires:
1. **Static architecture** - Creates initial list of coding activities
2. **Call chains/sequence diagrams** - Provides rough cut of structural activity dependencies
3. **List of activities** - All activities, coding and noncoding
4. **Duration estimation** - For each activity with resources
5. **Planning assumptions** - Staffing, availability, ramp-up time, technology, quality
6. **Constraints** - Explicitly known and likely constraints

### Dependency Chart Process

1. Examine call chains and lay out first draft of dependencies
2. Account for implicit dependencies (e.g., all components depend on Logging)
3. Eliminate inherited/transitive dependencies to simplify the chart
4. Draw initial network diagram

### About Milestones

- **Definition**: Events denoting completion of significant parts of the project
- **M0**: SDP review milestone (completion of front end)
- **Public milestones**: Demonstrate progress for management/customers
- **Private milestones**: Internal hurdles for the team
- **Forced-dependency milestones**: Force dependencies even if call chains don't specify them

### Planning Assumptions Structure

Format: "One X for Y" - if you can't state staffing this way, you don't understand requirements.

**Example Role/Phase Table**:
| Role | Front End | Infrastructure | Services | Testing |
|------|-----------|----------------|----------|---------|
| Architect | X | X | X | X |
| Project Manager | X | X | X | X |
| Product Manager | X | X | X | X |
| DevOps | | X | X | X |
| Developers | | X | X | |
| Testers | | X | X | X |

### Finding the Normal Solution: Iteration Process

**Iteration 1: Unlimited Resources**
- Assume unlimited resources, utilize only as many as needed
- First pass results are NOT the normal solution
- Need to accommodate reality in subsequent iterations

**Iteration 2: Infrastructure First**
- Move infrastructure services to beginning of project
- Reduces complexity (fewer dependencies and crossing lines)
- Alleviates integration pressure at Managers
- Reduces initial staffing demand and volatility
- Provides early access to key infrastructure components

**Iteration 3: Limited Resources**
- Constrain initial developer availability
- Extending critical path increases float of noncritical activities
- Small changes in availability can dramatically affect floats

**Iteration 4: No Database Architects**
- Developers design databases
- May have minimal impact on duration

**Iteration 5: Further Limited Resources**
- Cap developers at three
- Trade fourth developer for float
- May reduce cost due to more efficient developer use

**Iteration 6: No Test Engineer**
- Consumes significant float (77% in example)
- Very risky - test engineers are crucial to success

**Iteration 7: Going Subcritical**
- Resource dependencies become primary dependencies
- Network becomes two long strings
- Increases risk (approaching 1.0 in extreme)
- Duration increases, cost increases due to mounting indirect cost
- Planned earned value becomes almost straight line (telltale sign)

### Choosing the Normal Solution

Criteria for best solution:
1. Complies with definition (lowest resources for unimpeded critical path)
2. Works around limitations while not compromising key resources
3. Doesn't expect all developers to start at once
4. Acceptable staffing distribution and earned value charts
5. Front end encompasses ~25% of duration
6. Efficiency ~23% (should not exceed 25%)

### Network Compression Techniques

**Compression Using Better Resources (Iterations 8-9)**:
- Simplest form - no changes to network or activities
- Assign top developer to critical path activities
- Consider number of activities AND days on critical path per person
- New critical paths may emerge, limiting compression benefit
- Indirect cost reduction often pays for compression

**Introducing Parallel Work**:

*Low-Hanging Fruit*:
- Infrastructure and Client designs (independent of business logic)
- Split Clients into design and development activities
- Move to parallel with front end

*Downsides*:
- Higher initial burn rate
- Starting work before commitment can bias decision to proceed

*Infrastructure and Client Designs First (Iteration 10)*:
- Defer start until activities become critical (reduces cost)
- Use same developers for infrastructure then Client designs
- Increases complexity, compensate by using top developers

**Compression with Simulators (Iteration 11)**:
- Develop simulators for Manager services
- Move Client development upstream, parallel to other activities
- Add explicit integration activities between Clients and Managers
- Best approach: simulate Managers only (not inner services)
- Networks with simulators are fairly complex - start early for higher float

### Throughput Analysis

- Compare slope (pitch) of shallow S curves between solutions
- Use linear regression trend lines to quantify throughput
- Compare ratio of average-to-peak staffing between solutions
- Larger teams with higher complexity may not achieve required throughput increase

### Efficiency Analysis

- Peak efficiency at normal solution (lowest resource utilization)
- Efficiency declines with compression
- Subcritical solutions have awful efficiency (poor direct/indirect cost ratio)

### Time-Cost Curve Construction

**Cost Elements Table**:
| Design Option | Duration | Total Cost | Direct Cost | Indirect Cost |
|---------------|----------|------------|-------------|---------------|
| (months) | (man-months) | (man-months) | (man-months) |

**Correlation Models**:
- Indirect cost: straight line
- Direct cost: polynomial of second degree
- Total cost: sum of direct and indirect cost equations
- R-squared > 0.9 indicates excellent fit

**Death Zone**:
- Area under time-cost curve
- Any project design solution in this area is impossible to build
- Enables quick answers to "can we build X in Y months with Z people?"

### Planning and Risk

**Risk Decompression Process**:
1. All solutions may have high risk - decompress normal solution
2. Inject float along critical path until risk drops
3. Iterate with different decompression amounts
4. First iteration: decompress to furthest subcritical point
5. Subsequent iterations: halve decompression amount

**Adjusting Outliers**:
- Activity risk model has limitations with non-uniform float distribution
- Replace outlier floats with: average of floats + one standard deviation
- Makes risk models correlate more closely

**Risk Tipping Point**:
- Most important aspect of risk curve
- Small decompression past tipping point decreases risk substantially
- Decompress past the knee in the curves

**Direct Cost and Decompression**:
- Decompression points provide duration and risk, not cost
- Extrapolate indirect cost from known solutions (straight line)
- Direct cost: additional cost from longer critical path and idle time
- Planning assumption: developers between activities = direct cost

### Rebuilding the Time-Cost Curve

After decompression analysis:
1. Exclude bad data points (subcritical solution)
2. Include decompression points
3. Recalculate correlation models
4. Find minimum total cost point
5. Find minimum direct cost point

**Key Formulas**:
- Minimum point of polynomial y = ax^2 + bx + c is at x = -b/(2a)
- Minimum direct cost ideally at 0.5 risk (recommended decompression target)

### Modeling Risk

- Create trend line models for discrete risk points
- Use more conservative model (higher values across range)
- Risk formula enables calculating:
  - Point of minimum risk
  - Risk at any duration
  - Risk inclusion/exclusion zones

### Risk Inclusion and Exclusion

**Guidelines**:
- Maximum risk for any solution: 0.75
- Minimum risk: 0.3
- Optimal decompression target: 0.5

**Da Vinci Effect**: More compressed solutions past maximum risk have decreased risk levels.

### SDP Review Presentation

**Options to Present**:
1. First compression point
2. Normal solution
3. Optimal decompression point
4. Subcritical solution (to dispel cost-saving notions)

**Presentation Tips**:
- Round schedule and cost numbers for credibility
- Keep risk numbers precise (best evaluation tool)
- Explain nonlinear nature of risk (Richter scale analogy)
- Steer decision toward 0.50 risk point

---

## Chapter 12: Complexity (Advanced Techniques)

### God Activities

**Definition**: Activities too large for your project
- Relative: differs by >= 1 standard deviation from average duration
- Absolute: 40-60+ days is too large

**Problems**:
- Placeholders for great uncertainty
- Duration estimation almost always low-grade
- Almost always part of critical path
- Risk models produce misleadingly low numbers

**Handling God Activities**:
1. Break down into smaller independent activities
2. Treat as mini-projects and compress
3. Identify internal phases and find parallel work
4. Develop simulators to reduce dependencies
5. Factor into separate side projects

### Risk Crossover Point

**Definition**: Point where risk curve stops rising faster than direct cost curve.

**Deriving the Crossover Point**:

Compare first derivatives of risk and direct cost curves:

For risk R = at^3 + bt^2 + ct + d:
```
R' = 3at^2 + 2bt + c
```

For direct cost C = at^2 + bt + c:
```
C' = 2at + b
```

**Scaling Factor**:
```
F = R(t_mr) / C(t_mr)
```
Where t_mr is time at maximum risk.

**Acceptable Risk Condition**:
```
F * |R'| > |C'|
```

**Risk Crossover Points** (example project):
- Too risky crossover: 9.03 months (risk = 0.81)
- Too safe crossover: 12.31 months (risk = 0.28)
- Acceptable range: between the two crossover points

### Finding the Decompression Target

**Principle**: Risk level 0.5 is the steepest point (inflection point) in the risk curve - ideal decompression target.

**Mathematical Approach**:
- At inflection point, second derivative = 0
- For R = at^3 + bt^2 + ct + d:
  - R' = 3at^2 + 2bt + c
  - R'' = 6at + 2b
  - When R'' = 0: t = -b/(3a)

**Example Calculation**:
```
R = 0.01t^3 - 0.36t^2 + 3.67t - 11.07
t = -(-0.36)/(3*0.01) = 10.62 months
Risk at 10.62 months = 0.55 (differs 10% from ideal 0.5)
```

### Geometric Risk

**Why Geometric Mean?**
- Arithmetic mean handles uneven distributions poorly
- Geometric mean: nth root of product of n values
- Always less than or equal to arithmetic mean
- Better handles outliers

**Geometric Criticality Risk**:
```
Risk = (N-root of (W_C^N_C * W_R^N_R * W_Y^N_Y * W_G^N_G)) / W_C
```
- Maximum: 1.0 (all activities critical)
- Minimum: W_G/W_C (all activities green)

**Geometric Fibonacci Risk**:
```
Risk = phi^((3N_C + 2N_R + N_Y - 3)/N)
```
- Maximum: 1.0
- Minimum: 0.24 (phi^-3)

**Geometric Activity Risk**:
```
Risk = 1 - ((N-root of product(F_i + 1)) - 1) / M
```
- Add 1 to all values, subtract 1 from result (handles zero floats)
- Maximum: approaches 1.0
- Minimum: 0 (all activities have same float)

**When to Use Geometric Risk**:
- Geometric activity risk is last resort for projects with god activities
- God activities cause arithmetic risk to be misleadingly low
- Geometric activity risk provides expected high value

### Execution Complexity

**Cyclomatic Complexity Formula**:
```
Complexity = E - N + 2*P
```
Where:
- E = number of dependencies in project
- N = number of activities in project
- P = number of disconnected networks (should be 1)

**Example**:
| ID | Activity | Depends On |
|----|----------|------------|
| 1 | A | |
| 2 | B | |
| 3 | C | 1,2 |
| 4 | D | 1,2 |
| 5 | E | 3,4 |

E = 6, N = 5, P = 1: Complexity = 6 - 5 + 2*1 = 3

**Project Type and Complexity**:
- Maximum complexity: O(N^2) - every activity depends on all others
- More parallel work = higher execution complexity
- More sequential = simpler to execute
- Minimum complexity: 1 (serial string of activities)
- **Well-designed projects: complexity of 10-12**

**Compression and Complexity**:
- Complexity increases with compression (nonlinearly)
- Complexity curve resembles logistic function
- Flat area = better resources
- Sharp rise left = parallel work/compression
- Sharp drop right = subcritical solutions

### Very Large Projects (Megaprojects)

**Why Megaprojects Fail**:
- Size maps directly to poor outcomes
- Larger project = larger deviation from commitments
- Complex systems respond nonlinearly to minute condition changes

**Complexity Drivers**:
1. **Connectivity**: Complexity grows proportional to n^2 (Metcalfe's law) or even n^n
2. **Diversity**: Different teams, tools, coding standards increase complexity
3. **Interactions**: Intense interactions cause destabilizing consequences
4. **Feedback loops**: Magnify problems beyond control

**Size, Complexity, and Quality**:
- Overall quality = product of individual element qualities
- Example: 10 tasks at 99% quality = 90% aggregate (0.99^10 = 0.904)
- 10 tasks at 90% quality = 35% aggregate
- More components = worse cumulative effect

### Network of Networks

**Key Principle**: Break large projects into smaller, less complex projects.

**Designing a Network of Networks**:
1. Design the megaproject first
2. Chop into individual manageable projects along mega critical path
3. Look for junctions (dependency junctions and time junctions)
4. Look for segmentation that minimizes total cyclomatic complexity
5. Invest in simplifying/improving design to identify the network

**Decoupling Networks**:
- Architecture and interfaces
- Simulators
- Development standards
- Build, test, and deployment automation
- Quality assurance (not mere quality control)

**Creative Solutions for Non-Technical Problems**:
- Political struggles concentrating work
- Cross-organizational rivalries
- Functional decomposition by location
- Legacy groups creating choke points

**Countering Conway's Law**:
- Organizations produce designs that copy their communication structures
- Solution: Restructure organization to reflect correct design
- Propose reorganization as part of SDP review recommendations

### Small Projects

- Even more susceptible to project design mistakes
- Respond much more to changes in conditions
- Assignment mistake: affects 20% with 5 people vs 7% with 15 people
- May be so simple they need minimal project design
- Single resource = string of activities, duration = sum of all activities

### Design by Layers

**Approach**: Build project according to architecture layers rather than logical dependencies.

**Structure**:
1. Series of pulses corresponding to architecture layers
2. Pulses are sequential, internally parallel
3. Example order: Utilities, Resources, ResourceAccess, Engines, Managers, Clients

**Pros**:
- Very simple project to execute
- Reduces cyclomatic complexity by half or more
- Best antidote for complex project networks
- Project manager contends with only one pulse's complexity at a time
- Typical Method-based pulse complexity: 4-5

**Cons**:
- Increases risk (if all services equal duration, all are critical, risk approaches 1.0)
- Any layer delay immediately delays entire project
- May increase team size and direct cost

**Mitigations**:
- Use risk decompression (mandatory for design-by-layers)
- Decompress to risk less than 0.5, perhaps 0.4
- Projects designed by layers take longer than design by dependencies

**Layers and Construction**:
- Features are always aspects of integration, not implementation
- Only after all layers complete can you integrate into features
- Well-suited to regular projects (not megaprojects with multiple subsystems)
- Breaking project by layers = breaking into smaller sequential subprojects

---

## Chapter 13: Project Design Example (TradeMe Case Study)

### Estimations

**Activity Categories**:
1. Structural coding activities (from architecture)
2. Nonstructural coding activities (operational concept, development process)
3. Noncoding activities (requirements, architecture, testing, deployment)

**Estimation Assumptions**:
- Detailed design: Individual developers capable, each activity contains detailed design
- Development process: Build quickly and cleanly with best practices

**Overall Project Estimation**:
- Used broadband estimation with 20 people
- Duration: 10.5 months
- Average staffing: 7.1 people
- Total cost: 74.6 man-months (validation benchmark)

### Dependencies and Project Network

**Behavioral Dependencies**:
- Examine use cases and call chains
- List components in chain, add dependencies
- Multiple passes required (each call chain reveals different dependencies)

**Abstract Structural Dependencies**:
- Abstract Manager encapsulates common workflow actions
- Other Managers depend on Abstract Manager
- Message Bus dependency provided through Abstract Manager

**Operational Dependencies**:
- Implicit in call chains due to operational concept
- All Client-Manager communication flows over message bus

**Nonbehavioral Dependencies**:
- Development process requirements
- Planning assumptions
- Legacy data migration
- Internal release procedures

**Overriding Dependencies**:
- Message Bus: Address first (choice may invalidate prior decisions)
- Security: Complete before all business logic activities

**Reducing Complexity**:
- Infrastructure first: drastically reduces dependencies
- Add milestones: SDP Review, Infrastructure Complete, Managers Complete
- Consolidate inherited dependencies

**Sanity Checks**:
1. Single start and single end activity
2. Every activity on path ending on critical path
3. Initial risk yields relatively low number
4. Duration without resource assignment (serves as check)

### The Normal Solution (TradeMe)

**Planning Assumptions**:
- Core team (architect, project manager, product manager) throughout
- Access to experts (test engineers, DB architects, UX/UI designers)
- 1:1 assignment of developers to services
- Task continuity when possible
- Quality control tester from construction start to end
- Build/DevOps specialist from construction to end
- Developers between tasks = direct cost

**First Normal Solution Metrics**:
| Metric | Value |
|--------|-------|
| Duration | 7.8 months |
| Total cost | 59 man-months |
| Direct cost | 32 man-months |
| Peak staffing | 12 |
| Average staffing | 7.5 |
| Average developers | 3.5 |
| Efficiency | 32% |
| Activity risk | 0.7 |
| Criticality risk | 0.7 |

**Problems Identified**:
- Efficiency 32% exceeds practical limit of 25%
- Staffing distribution has conspicuous peak
- Direct cost > indirect cost (very left of time-cost curve)
- Assumes very efficient team, likely too efficient

### Compressed Solution

**Enabling Activities Added**:
1. Contract design activities (5 days each) - decouples Clients from Managers
2. Manager simulators (15 days each) - enable full Client development
3. Integration activities (5 days each) - integrate/retest Clients against Managers

**Results**:
| Metric | Value |
|--------|-------|
| Duration | 7.1 months (9% acceleration) |
| Total cost | 58.5 man-months |
| Direct cost | 36.7 man-months |
| Efficiency | 37% |
| Risk | 0.74 |

**Conclusion**: Not a good trade - less than one month compression for increased execution complexity and integration risk.

### Design by Layers Solution

**Structure**: String of pulses (front end, infrastructure, Resources, ResourceAccess, Engines, Managers, Clients, release)

**Complexity Reduction**:
- Network dramatically simpler than design-by-dependencies
- Individual pulse complexity: 2, 4, 5, 4, 4, 4, 4, 2
- Total cyclomatic complexity of original: 33 units

**Results**:
| Metric | Value |
|--------|-------|
| Duration | 8.1 months |
| Total cost | 60.8 man-months |
| Direct cost | 32.2 man-months |
| Peak staffing | 11 |
| Average staffing | 7.5 |
| Average developers | 3.4 |
| Efficiency | 31% |
| Risk | 0.76 |

### Subcritical Solution

Two developers, designed by layers.

**Results**:
| Metric | Value |
|--------|-------|
| Duration | 11.1 months |
| Total cost | 74.1 man-months |
| Direct cost | 30.4 man-months |
| Peak staffing | 9 |
| Average developers | 2 |
| Efficiency | 25% (more reasonable) |
| Risk | 0.85 |

**Comparison with Overall Estimation**:
- Duration: 11.1 vs 10.5 months (5% difference)
- Cost: 74.1 vs 74.6 man-months (<1% difference)
- Suggests subcritical numbers are likely option

### Comparing Options

**Key Observations**:
- Duration largely same for design-by-layers vs design-by-dependencies
- Average developer staffing and efficiency unchanged
- Main differences: drastically reduced execution complexity, higher risk
- Design-by-layers better in every respect except risk

### Planning and Risk (TradeMe)

**Risk Decompression Points**:
| Option | Duration | Criticality Risk | Activity Risk |
|--------|----------|------------------|---------------|
| Compressed | 7.1 | 0.75 | 0.73 |
| By Dependencies | 7.8 | 0.70 | 0.70 |
| By Layers | 8.1 | 0.76 | 0.75 |
| D1 | 8.3 | 0.60 | 0.65 |
| D2 | 8.5 | 0.48 | 0.57 |
| D3 | 9.0 | 0.42 | 0.46 |
| D4 | 9.4 | 0.27 | 0.39 |
| D5 | 9.9 | 0.27 | 0.34 |

**Risk Model**:
```
Risk = 0.09t^3 - 2.28t^2 + 19.19t - 52.40 (R^2 = 0.96)
```

**Key Points**:
- Maximum risk: 7.4 months (risk = 0.78)
- Minimum risk: 9.7 months (risk = 0.25)
- Minimum decompression target: 8.6 months (risk = 0.52)
- Minimum direct cost: 8.46 months

**Finding Decompression Target**:
- Second derivative zero at 8.6 months (risk = 0.52)
- Falls between D2 and D3
- D3 recommended as decompression target
- Aligns with Chapter 12 recommendation to decompress design-by-layers to 0.4

### Preparing for SDP Review

**Viable Options Table**:
| Project Option | Duration | Total Cost | Risk | Complexity |
|----------------|----------|------------|------|------------|
| Activity Driven | 8 | 61 | 0.74 | High |
| Architecture Driven | 9 | 68 | 0.38 | Low |
| Understaffed | 12 | 80 | 0.47 | Low |

**Presentation Tips**:
- Renamed options to avoid jargon
- Used plain-language terms (High/Low for complexity)
- Rounded numbers
- Gently prodded toward decompressed design-by-layers

---

## Chapter 14: Concluding Thoughts

### When to Design a Project

**Answers**:
1. "Always" - compared to dismal state of most projects
2. ROI perspective - few days to a week vs optimal solution benefits
3. Whenever you have aggressive deadline
4. **The real answer: when you have integrity**

**Self-Funding Scenario Test**:
- Would you invest in project design if your house was at stake?
- Would you skip any techniques or analysis?
- Would you repeat calculations for good measure?

### Getting Ahead in Life

**Cardinal Advice**: Treat the company's money as your own.

- Managers can't tell good design from bad design
- But they notice respect for the company's money
- Accountable actions earn trust
- Trust leads to opportunities

### Financial Analysis

- Calculate cost of each time slice from staffing distribution
- Present as running sum (absolute or percentages)
- Direct vs total cost over time (use monetary units)
- Win ally in financial officer/executive who needs this data

### General Guidelines

**Do Not Design a Clock**:
- Project design enables educated decisions, not perfect precision
- Actual execution will differ from design
- Think sundial (good enough) not clock (every detail perfect)
- Optimal precise solutions nice, normal doable solution is a must

**Architecture vs Estimations**:
- Never design project without solid volatility-encapsulating architecture
- Without correct architecture, system design changes void project design
- Estimations and specific resources are secondary
- Network topology (from architecture) dictates duration
- Estimation variations tend to cancel each other

**Design Stance**:
- Don't apply ideas dogmatically
- Adapt tools to circumstances
- Don't design in secret - build trust
- Educate stakeholders

### Optionality

**Definition**: Succinctly describing options with objective evaluation criteria.

**Guidelines for Number of Options**:
- 2 options: too few (too close to no options)
- 3 options: ideal
- 4 options: fine if at least one is obvious mistake
- 5 options: too many (paradox of choice)

### Compression Guidelines

**Maximum Compression**: 30% reduction (avoid >25% when building competency)

**Always Compress** (even if unlikely to pursue):
- Reveals true nature and behavior of project
- Enables time-cost curve modeling
- Enables quick assessment of schedule changes
- "No" backed by numbers is more effective

**Compressing with Top Resources**:
- May not be available
- Can make things worse (new critical path emerges)
- Top resources often idle waiting for others
- May need larger team to compress other paths
- Evaluate which path benefits most

**Trimming the Fuzzy Front End**:
- Easiest compression method
- Work in parallel on preparatory/evaluation tasks
- No change to rest of project required

### Planning and Risk

**Preempt the Unforeseen with Float**:
- Risk index indicates project resilience
- Float gives chance to thrive with unforeseen
- Psychological need: peace of mind, focus, delivery

**Behavior Over Values**:
- Look for risk tipping point, not specific value
- Curve may be skewed higher or lower
- Still decompress by using tipping-point behavior

### Design of Project Design

**Common Design Activities**:
1. Gather core use cases
2. Design system, produce call chains and components
3. List noncoding activities
4. Estimate duration and resources
5. Estimate overall project (broadband/tool)
6. Design normal solution
7. Explore limited-resources solution
8. Find subcritical solution
9. Compress using top resources
10. Compress using parallel work
11. Compress using activity changes
12. Compress to minimum duration
13. Throughput, efficiency, complexity analysis
14. Produce time-cost curve
15. Decompress normal solution
16. Rebuild time-cost curve
17. Compare to overall estimation
18. Quantify and model risk
19. Find inclusion/exclusion and risk zones
20. Identify viable options
21. Prepare for SDP review

**Activities per Solution**:
1. Discover planning assumptions
2. Gather staffing requirements
3. Review/revise activities, estimations, resources
4. Decide on dependencies
5. Modify network for constraints
6. Modify network to reduce complexity
7. Assign resources, rework network
8. Draw network diagram
9. Evaluate shallow S curve
10. Evaluate staffing distribution
11. Modify planning assumptions, rework network
12. Calculate cost elements
13. Analyze floats
14. Calculate risk

### The Hand-Off

**Junior Hand-Off**:
- Architect provides detailed design
- Disproportionally increases architect workload (3-4 months in 12-month project)
- Designing all services up front sets very high bar
- Management will force handoff, doom project

**Senior Hand-Off**:
- Senior developers can perform detailed design
- Architect hands off soon after SDP review
- Architect provides general outline, reviews and amends
- Safest way to accelerate (compresses without changing critical path)
- Senior developers actually cost less than junior developers

**Senior Developers as Junior Architects**:
1. Architect provides comprehensive architecture
2. Front end contains detailed design of first handful of services
3. Senior developers do design as training/learning under architect guidance
4. Junior developers construct, consult senior developers for refinements
5. Code review with senior developers
6. Senior developers design next batch of services

### Debriefing Project Design

**Debrief Topics**:
1. **Estimations and accuracy**: Compare initial vs actual, patterns, missed/superfluous activities
2. **Design efficacy and accuracy**: Broad estimation vs detailed design vs actual, throughput assessment, decompression needs
3. **Individual and team work**: Collaboration, bad apples, tools/technology, communication
4. **What to avoid/improve next time**: Prioritized mistakes list, detection methods
5. **Recurring issues from previous debriefs**: Eliminate repeated mistakes
6. **Commitment to quality**: Level present, relation to success

### About Quality

**Quality-Control Activities**:
- Service-level testing (test plan, unit test, integration testing)
- System test plan
- System test harness
- System testing
- Daily smoke tests (clean build, flush water down pipes)
- Indirect cost (quality not free but pays for itself)
- Test automation scripting
- Regression testing design and implementation
- System-level reviews (structured, designated roles)

**Quality-Assurance Activities**:
- Training (don't let developers figure out new tech on their own)
- Authoring key SOPs
- Adopting standards (design standard, coding standard)
- Engaging QA (true quality assurance, not control)
- Collecting and analyzing key metrics
- Debriefing

**Quality and Culture**:
- Micromanagement = chronic trust deficit
- Infect team with relentless quality obsession
- Transition from micromanagement to quality assurance
- Quality = ultimate project management technique

---

## Appendix A: Project Tracking

### Activity Life Cycle and Status

**Phase Exit Criteria**:
- Binary criterion for each phase (done or not done)
- Example: Construction phase complete after code review, not just check-in

**Phase Weight**:
- Percentage contribution to activity completion
- Allocation methods:
  - Estimate importance
  - Estimate duration, divide by sum
  - Divide by number of phases
  - Consider activity type

**Activity Status Formula**:
```
A(t) = sum of W_j for j=1 to m
```
Where:
- W_j = weight of phase j
- m = number of completed phases at time t

**Activity Effort Formula**:
```
C(t) = S(t) / R
```
Where:
- S(t) = cumulative direct cost spent at time t
- R = estimated direct cost for activity

**Key Distinction**: Effort is unrelated to progress. 60% complete at 150% of planned cost.

### Project Status

**Progress Formula**:
```
P(t) = (sum of E_i * A_i(t)) / (sum of E_i)
```
Where:
- E_i = estimated duration of activity i
- A_i(t) = progress of activity i at time t

**Progress and Earned Value**:
- If activities complete as planned, progress matches planned earned value
- Progress = actual earned value to date

**Accumulated Effort Formula**:
```
D(t) = (sum of S_i(t)) / (sum of R_i)
```
= sum of direct cost spent / sum of direct cost estimates

**Tracking Indirect Cost**:
- Mostly function of time and team structure
- Independent of effort or progress
- Useful only for total cost reporting

### Projections

**Process**:
1. Plot planned earned value, actual progress, actual effort
2. Create linear regression trend lines for progress and effort
3. Extrapolate to find:
   - Projected completion date (progress line reaches 100%)
   - Projected schedule overrun (difference from planned)
   - Projected cost overrun (effort at projected completion)

**Key Insight**: Slope of earned value curve = throughput of team. Early projections (1 month into year-long project) already calibrated to actual throughput.

### Projections and Corrective Actions

**All Is Well**:
- Progress and effort align with plan
- Do nothing - knowing when not to act is important

**Cardinal Rule of Project Management**:
> The only way to meet the deadline at the end is to be on time throughout the project.

**Underestimating** (progress below plan, effort above plan):
- Corrective actions:
  1. Revise estimations upward (push deadline) - feature-driven projects
  2. Reduce scope (move progress up) - date-driven projects
  3. Combination of both
- **Do NOT throw more people** - makes matters worse:
  - Onboarding interrupts critical path people
  - Pay for ramp-up AND time lost from existing team
  - Larger team = less efficient
- Exception: Near project origin, can pivot to compressed solution

**Resource Leak** (progress below effort, both below plan):
- People assigned but working elsewhere
- Corrective action: Meeting with other project manager and overseeing manager
- Present options: move deadline OR revoke source control access

**Overestimating** (progress above plan):
- Project in danger despite appearances
- Corrective actions:
  1. Revise estimations downward (bring deadline in) - often no benefits
  2. Keep deadline, increase scope (add value)
  3. **Release some resources** (best option) - reduces cost and progress

### More on Projections

**Driving the Project**:
- Frequent small corrections vs few drastic ones
- Analyze trend, not actual project
- Drive looking forward (where car will be), not at pavement or rear-view

**The Essence of a Project**:
> "Project" is both noun and verb. The essence of a project is the ability to project. If you do not project, you do not have a project.

### Handling Scope Creep

**Process**:
1. Ask to get back with answer
2. Redesign project to assess consequences
3. Use projections to judge delivery capability
4. Present new duration and cost requirements
5. If they accept, new commitments; if not, nothing changed

### Building Trust

- Share projections with decision makers
- Demonstrate ability to detect problems months ahead
- Take corrective actions
- Establish as responsible, accountable, trustworthy professional
- Trust leads to being left alone to succeed

---

## Appendix C: Design Standard

### The Prime Directive

> **Never design against the requirements.**

### Directives (Never Violate)

1. Avoid functional decomposition
2. Decompose based on volatility
3. Provide a composable design
4. Offer features as aspects of integration, not implementation
5. Design iteratively, build incrementally
6. Design the project to build the system
7. Drive educated decisions with viable options differing by schedule, cost, and risk
8. Build the project along its critical path
9. Be on time throughout the project

### System Design Guidelines

**Requirements**:
- Capture required behavior, not functionality
- Describe behavior with use cases
- Document nested conditions with activity diagrams
- Eliminate solutions masquerading as requirements
- Validate by ensuring support for all core use cases

**Cardinality**:
- Avoid >5 Managers without subsystems
- Avoid >handful of subsystems
- Avoid >3 Managers per subsystem
- Strive for golden ratio of Engines to Managers
- ResourceAccess can access >1 Resource if necessary

**Attributes**:
- Volatility should decrease top-down
- Reuse should increase top-down
- Don't encapsulate changes to business nature
- Managers should be almost expendable
- Design should be symmetric
- Never use public channels for internal interactions

**Layers**:
- Avoid open architecture
- Avoid semi-closed/semi-open architecture
- Prefer closed architecture:
  - Don't call up
  - Don't call sideways (except queued Manager calls)
  - Don't call >1 layer down
  - Resolve opening attempts with queued calls or async events
- Extend system by implementing subsystems

**Interaction Rules**:
- All components can call Utilities
- Managers and Engines can call ResourceAccess
- Managers can call Engines
- Managers can queue calls to another Manager

**Interaction Don'ts**:
- Clients don't call multiple Managers in same use case
- Managers don't queue to >1 Manager in same use case
- Engines don't receive queued calls
- ResourceAccess don't receive queued calls
- Clients, Engines, ResourceAccess, Resources don't publish events
- Engines, ResourceAccess, Resources don't subscribe to events

### Project Design Guidelines

**General**:
- Don't design a clock
- Never design without volatility-encapsulating architecture
- Capture and verify planning assumptions
- Follow design of project design
- Design several options (minimum: normal, compressed, subcritical)
- Communicate in Optionality
- Always go through SDP review before main work

**Staffing**:
- Avoid multiple architects
- Have core team at beginning
- Ask for lowest staffing for unimpeded critical path
- Always assign resources based on float
- Ensure correct staffing distribution
- Ensure shallow S curve for planned earned value
- Always assign components 1:1 to developers
- Strive for task continuity

**Integration**:
- Avoid mass integration points
- Avoid integration at end of project

**Estimations**:
- Don't overestimate
- Don't underestimate
- Strive for accuracy, not precision
- Always use 5-day quantum for activity estimation
- Estimate project as whole to validate design
- Reduce estimation uncertainty
- Maintain correct estimation dialog when required

**Project Network**:
- Treat resource dependencies as dependencies
- Verify all activities on chain starting/ending on critical path
- Verify all activities have resource assigned
- Avoid node diagrams, prefer arrow diagrams
- Avoid god activities
- Break large projects into network of networks
- Treat near-critical chains as critical
- **Strive for cyclomatic complexity of 10-12**
- Design by layers to reduce complexity

**Time and Cost**:
- Accelerate first by quick/clean practices, not compression
- Never commit to project in death zone
- Compress with parallel work rather than top resources
- Compress with top resources carefully and judiciously
- **Avoid compression >30%**
- **Avoid efficiency >25%**
- Compress even if unlikely to pursue compressed options

**Risk**:
- Customize criticality risk ranges to your project
- Adjust float outliers with activity risk
- Decompress normal solution past tipping point
  - Target 0.5 risk
  - Value tipping point over specific number
- Don't over-decompress
- Decompress design-by-layers solutions (perhaps aggressively)
- **Keep normal solutions at <0.7 risk**
- **Avoid risk <0.3**
- **Avoid risk >0.75**
- Avoid options riskier/safer than risk crossover points

### Project Tracking Guidelines

1. Adopt binary exit criteria for internal phases
2. Assign consistent phase weights across all activities
3. Track progress and effort on weekly basis
4. **Never base progress reports on features**
5. **Always base progress reports on integration points**
6. Track float of near-critical chains

### Service Contract Design Guidelines

1. Design reusable service contracts
2. Comply with design metrics:
   - Avoid contracts with single operation
   - **Strive for 3-5 operations per contract**
   - Avoid contracts with >12 operations
   - **Reject contracts with >=20 operations**
3. Avoid property-like operations
4. Limit contracts per service to 1 or 2
5. Avoid junior hand-offs
6. Only architect or competent senior developers design contracts

---

## Key Thresholds and Metrics Summary

### Risk Thresholds
| Threshold | Value | Meaning |
|-----------|-------|---------|
| Maximum risk | 0.75 | Avoid solutions above this |
| Minimum risk | 0.30 | Avoid solutions below this |
| Target decompression | 0.50 | Ideal risk level |
| Normal solution maximum | 0.70 | Keep normal solutions below |

### Complexity Thresholds
| Threshold | Value |
|-----------|-------|
| Target cyclomatic complexity | 10-12 |
| Design-by-layers pulse complexity | 4-5 |

### Efficiency Thresholds
| Threshold | Value |
|-----------|-------|
| Maximum efficiency | 25% |
| Compression maximum | 30% |

### Service Contract Metrics
| Metric | Value |
|--------|-------|
| Operations per contract (ideal) | 3-5 |
| Operations per contract (maximum) | 12 |
| Operations per contract (reject) | 20+ |
| Contracts per service | 1-2 |

### Estimation Guidelines
| Guideline | Value |
|-----------|-------|
| Activity estimation quantum | 5 days |
| Front end duration | ~25% of project |

---

## Complete Formulas Reference

### Cyclomatic Complexity
```
Complexity = E - N + 2*P
```

### Risk Models

**Criticality Risk**:
```
Risk = (N_C*W_C + N_R*W_R + N_Y*W_Y + N_G*W_G) / (N*W_C)
```

**Activity Risk**:
```
Risk = 1 - (Average Float / Maximum Float)
```

**Fibonacci Risk**:
```
Risk = (3*N_C + 2*N_R + N_Y) / (3*N)
```

### Cost Models
```
Total Cost = Direct Cost + Indirect Cost
Direct Cost = at^2 + bt + c (polynomial)
Indirect Cost = mt + n (linear)
Minimum cost at: t = -b/(2a)
```

### Risk Model
```
R = at^3 + bt^2 + ct + d
Maximum risk at: R' = 0 -> t = (-b +/- sqrt(b^2 - 3ac)) / (3a)
Decompression target at: R'' = 0 -> t = -b/(3a)
```

### Project Tracking
```
Activity Progress: A(t) = sum of completed phase weights
Activity Effort: C(t) = S(t) / R
Project Progress: P(t) = sum(E_i * A_i(t)) / sum(E_i)
Project Effort: D(t) = sum(S_i(t)) / sum(R_i)
```

### Risk Crossover
```
Scaling Factor: F = R(t_mr) / C(t_mr)
Acceptable Risk Condition: F * |R'| > |C'|
```
