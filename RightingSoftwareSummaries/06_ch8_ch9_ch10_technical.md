# Chapters 8, 9, and 10: Technical Deep Dive

## Network Diagrams, Float Analysis, Time-Cost Tradeoffs, and Risk Modeling

---

## Chapter 8: Network and Float

### The Network Diagram

An **activity** in a software project is any task requiring both time and a resource. The **project network diagram** captures activities and their dependencies.

**Key Principles:**
- Network diagrams deliberately avoid scale to focus on dependencies and topology
- No notion of order of execution or concurrency between activities
- Drawing to scale imposes serious burden when estimations change

### Node vs Arrow Diagrams

#### Node Diagrams
- Each **node** represents an activity
- **Arrows** represent dependencies
- Length of arrow is irrelevant
- Time is spent inside nodes, not along arrows
- Intuitively easy to draw and understand
- No simple way to draw to scale

#### Arrow Diagrams
- **Arrows** represent activities
- **Nodes** represent dependencies and completion events
- Events are instantaneous (no time spent inside nodes)
- Can draw to scale by scaling time to arrow length
- All activities must have start and completion events
- Natural place to designate milestones

#### Dummy Activities
- Zero-duration activity expressed as dashed arrow
- Purpose: express dependency when you cannot split an arrow
- Introduced between completion event of one activity and start event of another

### When to Use Each Diagram Type

**The book strongly recommends arrow diagrams** despite the steeper learning curve.

**Critical flaw with node diagrams:** When you have repeated dependencies across layers (e.g., activities 4, 5, 6 all depending on activities 1, 2, 3), arrow diagrams remain straightforward while node diagrams become an "entangled cat's cradle."

This situation is **very common** in well-designed software systems with repeated dependencies across architectural layers. Node diagrams become "utterly incomprehensible" when you add Resources, Clients, and Utilities.

> "It is pointless to draw unintelligible network diagrams. The primary purpose of the network diagram is communication."

---

## Float Analysis

### What is Float?

**Float** = safety margins in the project. Activities can "float" until they must begin without slipping the schedule.

**Low-float projects are high-risk** - anything more than a minor delay on a low-float activity will cause that activity to become critical and derail the project.

### Total Float

**Definition:** By how much time you can delay the completion of an activity without delaying the project as a whole.

**Key Properties:**
- Total float is an aspect of a **chain** of activities, not just particular activities
- All activities on the same noncritical chain share some total float
- Consuming total float upstream drains it from downstream activities
- All noncritical activities have some total float

**When total float is consumed:**
- Downstream activities may be delayed
- Project completion is NOT delayed (if within total float)
- Makes downstream activities more critical and riskier

### Free Float

**Definition:** By how much time you can delay the completion of an activity without disturbing **any other activity** in the project.

**Key Properties:**
- An activity may or may not have free float (unlike total float)
- If noncritical activities scheduled back-to-back, free float is zero
- Last activity on noncritical chain connecting to critical path always has some free float
- Little use during project design, but invaluable during execution

**During Execution:**
- If delay < free float: nothing needs to be done
- If delay > free float (but < total float): subtract free float from delay to gauge interference with downstream activities

### Calculating Floats

Floats are a function of:
- Activity durations
- Dependencies
- Any delays introduced

**Important:** Floats can be calculated even if actual start date is undecided.

**Tools:** Use Microsoft Project's "Total Slack" and "Free Slack" columns.

### Visualizing Floats with Color Coding

Three classification methods:

#### 1. Relative Criticality
Divide maximum float into three equal parts.
- Example: Max float = 45 days
- Red: 1-15 days
- Yellow: 16-30 days
- Green: 31-45 days

Works well if max float is large (>30 days) and uniformly distributed.

#### 2. Exponential Criticality
Divide range into three unequal, exponentially smaller ranges at 1/9 and 1/3 of range.
- Example: Max float = 45 days
- Red: 1-5 days
- Yellow: 6-15 days
- Green: 16-45 days

More aggressive than 1/4 and 1/2 divisions; proportional to number of colors.

#### 3. Absolute Criticality
Independent of max float value or distribution.
- Red: 1-9 days
- Yellow: 10-26 days
- Green: 27+ days

Straightforward but may require customization (10 days may be green in 2-month project but red in year-long project).

---

## Float-Based Scheduling

### The Core Principle

**Assign resources based on float (total float), lowest to highest.**

This is:
- **Safest** because you address riskier activities first
- **Most efficient** because you maximize resource utilization percentage

### Resource Assignment Strategy

1. First assign to **critical activities** (no float)
2. Then assign to **lowest float** activities (red)
3. Then **medium float** activities (yellow)
4. Finally **high float** activities (green)

### Trading Float for Resources

When you have fewer developers than activities ready to start:
- Complete lower-float activities first
- Reschedule higher-float activities by consuming their float
- This effectively creates a **resource dependency** in the network

> "Pushing activity 3 down the timeline until the developer who worked on activity 2 is available is identical to making activity 3 dependent on activity 2."

### The Three-Way Trade

When trading resources for float:
- **Reduce cost** (fewer resources)
- **Increase risk** (reduced float)
- **Maintain schedule**

You're not just trading float for lower cost - you're trading **lower cost for higher risk**.

---

## Proactive Project Management

**Primary reason well-managed projects slip:** Noncritical activities become critical because they don't get resources on planned schedule, causing them to bleed out their total float.

**Solution:**
- Track total float of all noncritical activity chains
- Calculate total float for each chain on regular basis (weekly)
- Extrapolate trend line to see when chain becomes critical
- Track at high resolution because float often behaves as a step function

---

## Chapter 9: Time and Cost

### Accelerating Software Projects

**Best practices that accelerate any project:**

1. **Assure Quality** - True QA asks "What will it take to assure quality?" Focus on prevention, not testing.

2. **Employ Test Engineers** - Higher caliber than regular software engineers; write code to break the system.

3. **Add Software Testers** - Consider 1:1 or even 2:1 tester-to-developer ratio.

4. **Invest in Infrastructure** - Common utilities, DevOps, frameworks, security, logging.

5. **Improve Development Skills** - Train developers on technology, methodology, tools.

6. **Improve the Process** - Follow battle-proven best practices, write SOPs.

7. **Adopt Standards** - Comprehensive coding standards elevate novices to veteran level.

8. **Provide Access to External Experts** - Avoid reinventing the wheel (the 2% problem).

9. **Engage in Peer Reviews** - The best debugger is the human eye.

---

## Schedule Compression Techniques

### Two Immediate Acceleration Methods

#### 1. Working with Better Resources
- Senior developers complete tasks faster (not because they code faster)
- Senior developers spend time designing, testing, documenting
- Per unit of time they code more slowly but complete tasks more quickly
- **Only assign to critical activities** - leveraging them outside critical path won't alter schedule

#### 2. Working in Parallel

**Two approaches:**

**A. Splitting Activities**
Extract internal phases and move them elsewhere:
- **Upstream candidates:** detailed design, documentation, emulators, service test plan, API design, UI design
- **Downstream candidates:** integration, unit testing, repeated documentation

**B. Removing Dependencies**
Enable parallel work through:
- **Contract design** - provide interface/contract to consumers early
- **Emulators development** - simple service that emulates real service
- **Simulators development** - complete simulator maintaining state, injecting errors
- **Repeated integration and testing** - once real service completes

### Parallel Work Candidates

Look for **pulses** in staffing distribution chart. If there are several pulses done sequentially due to dependencies, perhaps you can decouple them.

### Cost of Parallel Work

- Requires additional resources
- Larger team, higher peak team size
- Increased noise, less efficient execution
- May require expensive external talent
- Increases cash flow rate

> "Parallel work is not free."

### Perils of Parallel Work

- Increases execution complexity
- Drastically increases demands on project manager
- Like defusing a bomb - do very carefully
- Before engaging in parallel work, invest in infrastructure that accelerates all activities without changing cross-activity dependencies

---

## The Time-Cost Curve

### The Idealized Curve

Trading time-for-cost is **not linear**. Initially adding cost delivers faster, but with diminishing returns.

Example (10 man-year project):
- 1 developer: 10 years, 10 man-years
- 2 developers: 7 years, 14 man-years
- 5-6 developers: 5 years, 30 man-years

### Key Points on the Time-Cost Curve

#### Normal Solution
- Assumes unlimited resources, every resource available when required
- Design with eye for minimum cost
- Lowest level of resources allowing unimpeded progress along critical path
- Most unconstrained/natural way of building the system
- Least expensive AND most efficient team

#### Uneconomical Zone
- Right of normal solution
- More time = more cost (overhead, gold plating, reduced probability of success)
- Never give project more time than required

#### Compressed Solutions
- Left of normal solution
- Shorter duration but higher cost (nonlinear)
- Only compress activities on critical path

#### Minimum Duration Solution
- Leftmost practical point
- Critical path fully compressed
- No more parallel work candidates
- Best people already on critical activities
- **No amount of money can deliver faster**

#### Full Compression Solution
- All activities compressed (critical and noncritical)
- Does NOT complete faster than minimum duration
- Just costs more - wastes money

### The 30% Rule

> "My personal experience indicates that 30% compression is likely the upper compression limit for any software project, and even that level of compression is hard to achieve."

Use this to validate deadline constraints. Example: 12-month normal solution with 7-month deadline requires 41% compression - **project cannot be built**.

---

## Finding Normal Solutions

### The Iterative Process

Finding minimum staffing level is iterative because it's often unknown up front.

```
For each iterative attempt:
    1. Trade more float for resources
    2. This increases risk (reduced float)
    3. Stop when lowest staffing level still has sufficient float
```

### Accommodating Reality

Make minor adjustments for practical concerns:
- Avoid hiring another resource by extending schedule by a week
- Simplify execution or reduce integration risk for slight extension
- **Rule of thumb:** Anything less than 2-3% of schedule/cost is noise level

2-3% guideline relates to design and tracking resolution (e.g., weekly activities in year-long project = 2% resolution).

---

## Project Cost Elements

### The Total Cost Formula

```
Total Cost = Direct Cost + Indirect Cost
```

### Direct Cost

Activities that add **direct measurable value**:
- Developers working on services
- Testers performing system testing
- Database architect designing database
- Test engineers building test harness
- UI/UX experts designing interface
- Architect designing system or project

Direct cost curve looks like time-cost curve (with minimum at normal solution).

### Indirect Cost

Activities that add **indirect immeasurable value** (ongoing, not in earned value charts):
- Core team (architect, project manager, product manager) after SDP review
- Ongoing configuration management, daily build/test, DevOps
- Vacations and holidays
- Committed resources between assignments

**Indirect cost is largely proportional to duration** - roughly a straight line when plotted.

### The Death Zone

**Solutions above time-cost curve:** Feasible (though possibly suboptimal)

**Solutions below time-cost curve:** Impossible - the Death Zone

> "Projects in the death zone have failed before anyone writes the first line of code. The key to success is neither architecture nor technology, but rather avoiding picking a project in the death zone."

### Compression and Cost Elements

Compressed solutions reduce duration, therefore reduce indirect cost, **offsetting compression cost**.

**Key insight:** With high indirect cost, the minimum total cost point shifts left of normal solution. This means compression may actually reduce total cost while delivering faster.

**But this creates a problem:** More compressed solutions carry higher risk. High indirect cost projects have their optimal point at a risky option.

> "Projects with high indirect cost are almost always also high-risk projects."

### Direct vs Indirect Cost Ratio

Typical software projects have more indirect than direct cost. A ratio of 1:2 (direct:indirect) is common but can be higher.

**Key observation:** All things being equal, shorter projects always cost less because they incur less indirect cost.

**Classic mistake:** Managers try to reduce cost by throttling resources (quality or quantity). This makes projects longer, costing much more.

### Fixed Cost

Computer hardware, software licenses - constant shift up of indirect cost line.

Usually 1-2% of total cost in decent-size software projects - typically negligible.

---

## Network Compression Flow

### Step-by-Step Procedure

1. **Start from normal solution** - most flat part of time-cost curve, best ROI for compression

2. **Avoid compressing activities that won't respond well:**
   - Architecture (doesn't compress well)
   - Already fully compressed activities
   - Activities have their own time-cost curve

3. **Compress only critical path activities** - compressing noncritical activities just increases cost without shortening schedule

4. **Select best ROI activities** - most reduction in schedule for least additional cost

5. **Prefer larger activities** - compression techniques are disruptive; better to incur on large activity

6. **Watch for new critical paths** - as you shorten critical path, another path may become longest

7. **If multiple critical paths emerge** - compress them concurrently by identical amounts

8. **Compound compression** - compress previously compressed solution, not just new technique on baseline normal

### Stop Compressing When:

- Desired deadline is met
- Cost exceeds budget
- Network too complex for any project manager
- Duration 25-30% shorter than normal solution
- Solutions too risky or risk decreasing (past maximum)
- Run out of ideas/options
- Too many critical paths or all paths critical
- Can only compress noncritical activities (reached full compression)

---

## Chapter 10: Risk

### The Three-Dimensional Problem

Each project design option is a point in space with axes:
- Time
- Cost
- **Risk**

Most people ignore risk because they cannot measure it, leading to poor results from applying a two-dimensional model to a three-dimensional problem.

### Prospect Theory

Kahneman and Tversky (1979): People make decisions based on risk rather than expected gain. People disproportionally suffer more for loss than they enjoy for same gain, seeking to reduce risk over maximizing gains.

---

## The Time-Risk Curve

### Ideal Curve

A **logistic function** (S-curve):
- Risk increases nonlinearly as you compress
- Has a **tipping point** where risk drastically increases
- Flattens as risk approaches maximum

### Actual Time-Risk Curve

More complex than ideal:

**Left of normal (compressed solutions):**
- Risk rises then levels off
- Gets maximized BEFORE minimum duration point
- Even drops a bit (concave shape) due to **da Vinci effect**

**The da Vinci Effect:**
Shorter wires are stronger because probability of defect is proportional to length.
- 1 person for 10 years vs 3650 people for 1 day
- 1-day project is much safer (likelihood of bad event nearly certain in 10 years)

**Right of normal:**
- Risk goes down initially (extra time reduces risk)
- Becomes minimized at some value > 0
- Then climbs again (Parkinson's law)
- Convex shape

---

## Risk Modeling

### Normalizing Risk

Risk normalized to range **0 to 1**:
- **0** = minimized risk (not risk-free)
- **1** = maximized risk (not guaranteed failure)

Risk value is **not probability** - project with risk 1 can still deliver; project with risk 0 can still fail.

### Design Risk vs Other Risks

Other risks (independent of float-based design risk):
- Staffing risk
- Duration risk
- Technological risk
- Human factors
- Execution risk

**Design risk** = project's sensitivity to schedule slips; quantifies fragility - "degree to which project resembles a house of cards."

---

## Criticality Risk Model

### Risk Categories

| Color | Category | Weight |
|-------|----------|--------|
| Black | Critical (0 float) | 4 |
| Red | High risk (low float) | 3 |
| Yellow | Medium risk (medium float) | 2 |
| Green | Low risk (high float) | 1 |

Exclude zero-duration activities (milestones, dummies).

### Criticality Risk Formula

```
Risk = (W_C * N_C + W_R * N_R + W_Y * N_Y + W_G * N_G) / (W_C * N)
```

Where:
- W_C, W_R, W_Y, W_G = weights for each category
- N_C, N_R, N_Y, N_G = number of activities in each category
- N = total number of activities (N_C + N_R + N_Y + N_G)

### With Standard Weights [4, 3, 2, 1]:

```
Risk = (4*N_C + 3*N_R + 2*N_Y + 1*N_G) / (4*N)
```

### Example Calculation

Network with: 6 critical, 4 red, 2 yellow, 4 green (16 total)

```
Risk = (4*6 + 3*4 + 2*2 + 1*4) / (4*16)
     = (24 + 12 + 4 + 4) / 64
     = 44 / 64
     = 0.69
```

### Criticality Risk Values

- **Maximum:** 1.0 (all activities critical)
- **Minimum:** W_G / W_C = 0.25 (all activities green, using [1,2,3,4] weights)

Risk can never be zero - anything worth doing requires risk.

### Customizing Criticality Risk

1. Calibrate color ranges appropriate to project duration
2. Define near-critical activities (1 day float) as critical
3. Examine chains - long chain with only 10 days float should be treated as critical

---

## Fibonacci Risk Model

### Fibonacci Series

```
Fib_n = Fib_(n-1) + Fib_(n-2)
Fib_1 = Fib_2 = 1

Series: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377...
```

### Golden Ratio (phi)

```
phi = 1.618...
Fib_i = phi * Fib_(i-1)
```

### Fibonacci Weights

Any four consecutive Fibonacci numbers maintain ratio of phi.

If W_G is green weight:
```
W_Y = phi * W_G
W_R = phi^2 * W_G
W_C = phi^3 * W_G
```

### Simplified Fibonacci Risk Formula

```
Risk = (4.24*N_C + 2.62*N_R + 1.62*N_Y + N_G) / (4.24*N)
```

### Fibonacci Risk Values

- **Maximum:** 1.0
- **Minimum:** 0.24 (1/4.24)

Supports notion that risk has natural lower limit of about 0.25.

---

## Activity Risk Model

### Activity Risk Formula

```
Risk = 1 - (Sum of all floats) / (M * N)
     = 1 - (F_1 + F_2 + ... + F_N) / (M * N)
```

Where:
- F_i = float of activity i
- N = number of activities
- M = maximum float of any activity in project

Exclude zero-duration activities.

### Example Calculation

Network floats: 30, 30, 30, 30, 10, 10, 5, 5, 5, 5 (and 6 critical with 0 float)
M = 30, N = 16

```
Risk = 1 - (30+30+30+30+10+10+5+5+5+5) / (30*16)
     = 1 - 160 / 480
     = 1 - 0.33
     = 0.67
```

### Activity Risk Values

- **Maximum:** approaches 1.0 (undefined when all critical; at limit with one noncritical activity)
- **Minimum:** 0 (all activities have same float M)

### Calculation Pitfall

**Outlier high float** skews calculation:
- Single activity with enormous float compared to others
- Produces incorrectly high risk value
- Detect and adjust outliers

**Incorrectly low risk** when:
- Few activities
- All noncritical floats similar/identical

---

## Criticality vs Activity Risk Comparison

| Aspect | Criticality Risk | Activity Risk |
|--------|------------------|---------------|
| Reflects human intuition | Better | Less intuitive |
| Sensitivity to differences | Broad categories | Individual activities |
| Calibration required | Often | Minimal |
| Float uniformity sensitivity | Indifferent | Sensitive to outliers |
| Calculation | Simple | Simple, automatable |

**When they differ greatly:** Investigate root cause. Consider Fibonacci model as arbitrator.

---

## Compression and Risk

### Why Highly Compressed Projects May Show Lower Risk

High compression introduces parallel work:
- Fewer critical activities
- Shorter critical path
- More noncritical activities in parallel
- More activities with float = lower measured design risk

### Execution Risk

Highly parallel project converts **design risk into execution risk**:
- More challenging to execute
- Additional dependencies
- More activities to schedule and track
- Demanding scheduling constraints
- Larger team required

---

## Risk Decompression

### What is Risk Decompression?

Deliberately designing project for later delivery by **introducing float along critical path**.

Best way to reduce fragility and sensitivity to unforeseen events.

### When to Decompress

- Available solutions too risky
- Poor past track record
- Too many unknowns
- Volatile environment (changing priorities/resources)

### How NOT to Decompress

**Do not pad estimations** - this decreases probability of success.

Keep original estimations unchanged; increase float along all network paths instead.

### How to Decompress

**Simple method:**
Push last activity/event down timeline, adding float to all prior activities.

**Sophisticated method:**
Also decompress one or two key activities along critical path.

**Rule:** The further down the network you decompress, the more you need to decompress (upstream slips consume downstream float).

### Decompression Target

**Target risk of 0.5**

At risk = 0.5:
- Steepest point of logistic risk curve
- Best return on decompression (most risk reduction for least time added)
- Where concave becomes convex
- Coincides with minimum direct cost

**0.5 is minimum decompression target** - risk keeps descending past 0.5.

**Do not over-decompress:**
- Diminishing returns when all activities have high float
- Additional decompression increases overestimation risk
- Wastes time

---

## Risk Metrics Summary

### Key Guidelines

| Metric | Value | Meaning |
|--------|-------|---------|
| Minimum bound | 0.3 | Risk cannot practically go below ~0.25; round up |
| Maximum bound | 0.75 | Stop compressing well before 1.0 |
| Decompression target | 0.5 | Optimal tipping point |
| Normal solution max | 0.7 | Decompress high-risk normal solutions |

### Rules of Thumb

1. **Keep risk between 0.3 and 0.75** - never extreme values
2. **Decompress to 0.5** - targets tipping point in risk curve
3. **Do not over-decompress** - diminishing returns, increases risk
4. **Keep normal solutions under 0.7** - elevated risk acceptable only for compressed solutions

---

## Complete Formula Reference

### Float Formulas

```
Total Float = Latest Finish - Earliest Finish
            = Latest Start - Earliest Start

Free Float = Earliest Start of next activity - Earliest Finish of current activity
```

### Cost Formulas

```
Total Cost = Direct Cost + Indirect Cost

Indirect Cost ~ Duration (proportional, roughly linear)
```

### Criticality Risk Formula

```
Risk = (W_C * N_C + W_R * N_R + W_Y * N_Y + W_G * N_G) / (W_C * N)

Standard weights: [4, 3, 2, 1]

Risk = (4*N_C + 3*N_R + 2*N_Y + 1*N_G) / (4*N)

Range: [0.25, 1.0]
```

### Fibonacci Risk Formula

```
Risk = (phi^3 * N_C + phi^2 * N_R + phi * N_Y + N_G) / (phi^3 * N)

Where phi = 1.618...

Simplified:
Risk = (4.24*N_C + 2.62*N_R + 1.62*N_Y + N_G) / (4.24*N)

Range: [0.24, 1.0]
```

### Activity Risk Formula

```
Risk = 1 - (Sum of all F_i) / (M * N)

Where:
- F_i = float of activity i
- M = max float in project
- N = number of activities

Range: [0, 1.0]
```

---

## Step-by-Step Procedures

### Procedure 1: Calculate Total Float for Network

1. Perform forward pass to calculate earliest start (ES) and earliest finish (EF) for all activities
2. Perform backward pass to calculate latest start (LS) and latest finish (LF) for all activities
3. For each activity: Total Float = LS - ES = LF - EF
4. Activities with Total Float = 0 are on critical path

### Procedure 2: Find Normal Solution

1. Start with unlimited resource assumption
2. Assign resources to progress unimpeded along critical path
3. Calculate initial staffing level
4. Iteratively reduce staffing by trading float for resources:
   a. Identify activities that can be rescheduled
   b. Consume float to reduce peak staffing
   c. Recalculate risk after each iteration
5. Stop when sufficient float remains for acceptable risk level
6. Allow 2-3% adjustments for practical accommodations

### Procedure 3: Compress the Network

1. Start from normal solution
2. Identify critical path activities
3. Rank activities by compression ROI (schedule reduction / cost increase)
4. Select highest ROI activity that:
   - Has not been fully compressed
   - Responds well to compression (not architecture)
   - Is on critical path
5. Apply compression technique:
   - Use better resources, OR
   - Split activity, OR
   - Remove dependencies for parallel work
6. Recalculate network:
   - Update durations
   - Recalculate floats
   - Identify new critical path
7. Calculate new risk value
8. Repeat until stop condition met

### Procedure 4: Calculate Criticality Risk

1. Classify all non-zero-duration activities by float:
   - Black (critical): 0 float
   - Red: 1-9 days (customize to project)
   - Yellow: 10-26 days
   - Green: 27+ days
2. Count activities in each category (N_C, N_R, N_Y, N_G)
3. Calculate total N = N_C + N_R + N_Y + N_G
4. Apply formula: Risk = (4*N_C + 3*N_R + 2*N_Y + 1*N_G) / (4*N)

### Procedure 5: Calculate Activity Risk

1. List float for each non-zero-duration activity
2. Find maximum float M
3. Sum all floats
4. Count total activities N
5. Apply formula: Risk = 1 - (Sum of floats) / (M * N)
6. Check for outliers:
   - If one float >> all others, adjust or remove outlier
   - Recalculate

### Procedure 6: Decompress the Project

1. Calculate current risk (criticality or activity model)
2. If risk > 0.5, proceed with decompression
3. Push last activity/event down timeline by increment (e.g., 5-10 days)
4. Optionally decompress 1-2 key activities mid-critical-path
5. Recalculate all floats
6. Recalculate risk
7. Repeat until risk approaches 0.5
8. Do not over-decompress past 0.5

### Procedure 7: Build Time-Cost Curve

1. Design normal solution (find minimum direct cost)
2. Calculate indirect cost rate ($/time)
3. Plot normal point (Time_normal, DirectCost_normal)
4. Compress solution 1:
   - Apply compression techniques
   - Calculate new duration and direct cost
   - Plot point
5. Compress solution 2 (from compressed 1, not normal)
6. Continue until stop conditions
7. Calculate total cost for each point: Total = Direct + (Indirect rate * Duration)
8. Identify:
   - Minimum duration point
   - Full compression point (if applicable)
   - Minimum total cost point (may be left of normal)

---

## Key Insights Summary

1. **Arrow diagrams >> Node diagrams** for real software projects with layered dependencies

2. **Float is the safety margin** - manage it actively throughout project design

3. **Trade float for resources** - a three-way trade between cost, risk, and schedule

4. **30% compression limit** - practical maximum for any software project

5. **Normal solution is minimum direct cost, not minimum total cost** - high indirect cost shifts optimal point left

6. **Death zone is real** - projects below time-cost curve have failed before starting

7. **Shorter projects cost less** - indirect cost dominates total cost

8. **Risk target is 0.5** - the tipping point offering best risk/schedule tradeoff

9. **Design risk != Execution risk** - highly compressed projects convert one to the other

10. **Risk is relative** - always compare options, never declare anything "safe" or "risky" in absolute terms
