# Chapter 3: Structure - Summary

## 1. Main Argument/Thesis

The Method provides a **universal template for system architecture** based on common areas of volatility found across software systems. Rather than inventing structure from scratch for each project, architects can leverage recurring patterns of volatility, typical interactions, constraints, and runtime relationships. The key insight is that **good architectures, like biological designs, can apply across vastly different systems** - a mouse and elephant use identical architecture despite different detailed designs.

The chapter establishes that:
- Volatility-based decomposition produces predictable structural patterns
- These patterns can be formalized into layers with specific component types
- Clear nomenclature enables communication of design intent
- The structure provides both a starting point and validation mechanism

---

## 2. The Layered Architecture

The Method prescribes **four layers** plus a utilities bar:

### Layer 1: Client Layer (Top)
- **Purpose**: Encapsulates volatility in who/what interacts with the system
- **Contents**: Desktop apps, web portals, mobile apps, APIs, admin tools, other systems
- **Characteristics**: Most volatile layer; different technologies, deployments, versions, lifecycles
- **Key principle**: "Client" not "presentation" - all clients (human or system) are treated equally and use the same entry points

### Layer 2: Business Logic Layer
- **Purpose**: Encapsulates volatility in required behavior (use cases)
- **Contains two component types**:
  - **Managers**: Encapsulate sequence/orchestration volatility
  - **Engines**: Encapsulate activity/operation volatility
- **Key insight**: Use cases change in two ways - sequence changes OR activities change

### Layer 3: Resource Access Layer
- **Purpose**: Encapsulates volatility in accessing resources AND volatility in resources themselves
- **Critical rule**: Must NOT expose CRUD-like or I/O operations (Select, Insert, Open, Read, etc.)
- **Must expose**: Atomic business verbs (e.g., Credit, Debit for banking)
- **Why**: If you later change from database to distributed hash table, CRUD contracts become useless

### Layer 4: Resource Layer (Bottom)
- **Purpose**: Contains actual physical resources (database, file system, cache, message queue)
- **Characteristics**: Least volatile; may be external systems appearing as resources

### Utilities Bar (Vertical, cuts across all layers)
- **Purpose**: Infrastructure services needed by all layers
- **Examples**: Security, Logging, Diagnostics, Instrumentation, Pub/Sub, Message Bus, Hosting
- **Litmus test for inclusion**: "Could this plausibly be used in ANY other system, like a smart cappuccino machine?"

---

## 3. The Four Questions for Classification

The layers correspond to four English questions that help classify code:

| Question | Layer | Component Type |
|----------|-------|----------------|
| **WHO** interacts with the system? | Client | Clients |
| **WHAT** is required of the system? | Business Logic | Managers |
| **HOW** does the system perform activities? | Business Logic | Engines |
| **HOW** does the system access resources? | Resource Access | ResourceAccess |
| **WHERE** is the system state? | Resource | Resources |

**Usage for design initiation:**
1. List all "who" - candidates for Clients
2. List all "what" - candidates for Managers
3. List all "how" (business) - candidates for Engines
4. List all "how" (resource) - candidates for ResourceAccess
5. List all "where" - candidates for Resources

**Usage for design validation:**
- Are all Clients purely "who" with no "what"?
- Are all Managers purely "what" without "who" or "where"?
- If volatility justifies crossover, accept it; otherwise, investigate

---

## 4. Managers vs Engines

### Managers
- **Encapsulate**: Volatility in use case sequence/orchestration
- **Behavior**: Execute workflows, orchestrate activities
- **Scope**: Group logically related use cases (often per subsystem)
- **Can use**: Zero or more Engines
- **Naming**: Prefix = noun associated with encapsulated volatility (e.g., AccountManager, TradeManager)
- **Quality test**: Should be "almost expendable" - changing it requires thought but isn't devastating

### Engines
- **Encapsulate**: Volatility in activities/operations
- **Behavior**: Perform specific business activities (aggregate, adapt, validate, calculate, transform, etc.)
- **Scope**: More restricted than Managers
- **Design goal**: Reuse across Managers
- **Naming**: Prefix = gerund describing activity (e.g., CalculatingEngine, ValidatingEngine)

### The Golden Ratio (Manager-to-Engine Ratio)

| Managers | Expected Engines |
|----------|------------------|
| 1 | 0-1 |
| 2 | 1 |
| 3 | 2 |
| 5 | 3 |
| 8+ | Design has failed (functional decomposition detected) |

**Warning signs:**
- Too many Engines = likely functional decomposition
- If two Managers use different Engines for the same activity = functional decomposition OR missed activity volatility

### Manager Categories
1. **Expensive**: Change requests cause fear/resistance = Manager too big (functional decomposition)
2. **Expendable**: Change requests shrugged off = Pass-through Manager (design flaw, no real need)
3. **Almost Expendable**: Change requests cause contemplation = Correct design (orchestrates Engines/ResourceAccess)

---

## 5. Open vs Closed Architectures

### Open Architecture
- **Definition**: Any component can call any other regardless of layer
- **Problems**:
  - Calling up: Imports volatility from higher to lower layers
  - Calling sideways: Couples components within layer
  - Calling multiple layers down: Sacrifices encapsulation
- **Verdict**: "Trading encapsulation for flexibility is a bad trade"

### Closed Architecture
- **Definition**: Components can ONLY call the adjacent lower layer
- **Benefits**: Maximum decoupling and encapsulation
- **Drawback**: Can be inflexible, lead to Byzantine complexity
- **Verdict**: Best choice for business systems

### Semi-Closed/Semi-Open Architecture
- **Definition**: Allows calling more than one layer down
- **Justified only when**:
  1. Designing key infrastructure requiring maximum performance (e.g., TCP stack)
  2. Codebase hardly ever changes
- **Verdict**: Has its place, but most systems don't qualify

### The Method's Relaxations of Closed Architecture

1. **Utilities**: Can be called by any layer (hence the vertical bar)
2. **ResourceAccess**: Can be called by both Managers AND Engines
3. **Engines**: Can be called directly by Managers (Strategy pattern implementation)
4. **Queued Manager-to-Manager**: Allowed because:
   - Technically: Goes through ResourceAccess (queue) and queue listener (Client)
   - Semantically: Represents independent, deferred use cases

---

## 6. Microservices Critique

Lowy's position (as a credited pioneer of microservices):

### Core Assertion
**"There are no microservices - only services."** The water pump in a car (8 inches) and municipal water pump (8 feet) are both just pumps. Size doesn't create a category.

### Three Problems with Microservices as Practiced

1. **Implied size constraint is wrong**: Stopping at subsystem level is still too big. Manager, Engine, and ResourceAccess within subsystems must ALSO be services.

2. **Functional decomposition is rampant**: Most microservices efforts use functional decomposition, dooming them to deal with complexity of both functional decomposition AND service-orientation without benefits.

3. **Wrong communication protocols**: REST/HTTP designed for PUBLIC-FACING services, but most microservices use them INTERNALLY.

### Protocol Principle
**"Never use the same communication mechanism internally and externally."**

Examples:
- Laptop: TCP/IP externally, SATA internally
- Human body: English to customers, nerves/hormones to liver

**External protocols**: Low bandwidth, slow, expensive, error-prone (high decoupling)
**Internal protocols**: Must be fast, reliable, high-performance (TCP/IP, named pipes, IPC, Domain Sockets, message queues)

### Prediction
"Microservices will be the biggest failure in the history of software" (when combined with functional decomposition and wrong protocols).

---

## 7. Subsystems and Services

### Definition
A **subsystem** is a vertical slice through the architecture - a cohesive interaction between Manager, Engines, and ResourceAccess that constitutes a single logical service to external consumers.

### Guidelines
- Avoid over-partitioning into subsystems
- Most systems should have only a handful of subsystems
- Limit Managers per subsystem to three
- Can increase total Managers across all subsystems

### Incremental Construction Principle
**"Design iteratively, build incrementally."**

- Simple systems: No sense releasing just Engines or ResourceAccess alone
- Large systems: Can deliver one slice at a time for early feedback
- Never build iteratively (skateboard -> scooter -> bike -> car) - wasteful and intermediate iterations have no business value
- Build incrementally: Foundation -> walls -> utilities -> second floor -> roof

### Extensibility
Correct extension = Add new slices/subsystems, leave existing components alone.
Incorrect extension = Opening up existing components and modifying them (this is rework, not extensibility).

---

## 8. Design "Don'ts" - Specific Rules

### Client Layer Rules
1. **Clients do not call multiple Managers in same use case** (indicates functional decomposition)
2. **Clients do not call Engines** (Engines are internal implementation detail)
3. **Clients do not publish events** (no need to notify self; requires internal knowledge)

### Manager Layer Rules
4. **Managers do not queue calls to more than one Manager in same use case** (use Pub/Sub instead)

### Engine Layer Rules
5. **Engines do not receive queued calls** (have no independent meaning outside use case)
6. **Engines do not publish events** (don't know context of activity or use case state)
7. **Engines never call each other** (violates closed architecture; indicates functional decomposition)

### ResourceAccess Layer Rules
8. **ResourceAccess do not receive queued calls** (have no meaning independent of Manager/Engine)
9. **ResourceAccess do not publish events** (don't know significance of Resource state to system)
10. **ResourceAccess never call each other** (atomic verbs don't require other atomic verbs)

### Resource Layer Rules
11. **Resources do not publish events** (indicates tightly coupled functional decomposition)

### Subscription Rules
12. **Engines, ResourceAccess, and Resources do not subscribe to events** (processing events starts use cases, belongs in Clients/Managers)

### Symmetry Rule
- **Strive for symmetry** in call patterns across use cases
- Asymmetry is a design smell requiring investigation
- Same call patterns should appear across Managers

---

## 9. Step-by-Step Classification Procedure

### Phase 1: Initial Classification (The Four Questions)

```
FOR each identified component:
    ASK: Is this WHO interacts with system?
        YES -> Candidate for Client layer
    ASK: Is this WHAT is required (behavior/use case)?
        YES -> Candidate for Manager
    ASK: Is this HOW to perform business activity?
        YES -> Candidate for Engine
    ASK: Is this HOW to access a resource?
        YES -> Candidate for ResourceAccess
    ASK: Is this WHERE state is stored?
        YES -> Candidate for Resource
    ASK: Is this infrastructure needed by all layers?
        Passes cappuccino machine test? -> Utility
```

### Phase 2: Naming Validation

```
FOR each service name:
    VERIFY: Two-part compound word in Pascal case
    VERIFY: Suffix matches type (Manager, Engine, Access)

    IF Manager:
        Prefix should be noun (encapsulated volatility)
        Red flag: gerund prefix (doing) = functional decomposition
    IF Engine:
        Prefix should be gerund (activity: Calculating, Validating)
        Red flag: noun prefix without activity indication
    IF ResourceAccess:
        Prefix should be noun (data/resource provided)
        Red flag: CRUD-like operations in contract
```

### Phase 3: Ratio Check

```
COUNT: Total Managers
COUNT: Total Engines

IF Managers >= 8:
    FAIL: Functional decomposition detected

EXPECTED_ENGINES = rough_fibonacci(managers - 1)
    1 Manager -> 0-1 Engine
    2 Managers -> 1 Engine
    3 Managers -> 2 Engines
    5 Managers -> 3 Engines

IF actual_engines >> expected_engines:
    WARNING: Possible functional decomposition
```

### Phase 4: Call Pattern Validation

```
FOR each call in the design:

    IF Client -> Multiple Managers (same use case):
        FAIL: Functional decomposition

    IF Client -> Engine:
        FAIL: Business logic leaking to client

    IF Component -> Higher Layer:
        FAIL: Calling up (importing volatility)

    IF Manager -> Manager (direct, not queued):
        FAIL: Sideways call (functional decomposition)

    IF Engine -> Engine:
        FAIL: Functional decomposition

    IF ResourceAccess -> ResourceAccess:
        FAIL: Atomic verbs wrongly decomposed

    IF queued call to Engine or ResourceAccess:
        FAIL: These have no independent meaning
```

### Phase 5: Event/Pub-Sub Validation

```
FOR each event publisher:
    IF publisher is Client: FAIL
    IF publisher is Engine: FAIL
    IF publisher is ResourceAccess: FAIL
    IF publisher is Resource: FAIL
    ONLY Managers should publish events

FOR each event subscriber:
    IF subscriber is Engine: FAIL
    IF subscriber is ResourceAccess: FAIL
    IF subscriber is Resource: FAIL
    ONLY Clients and Managers should subscribe
```

### Phase 6: Symmetry Check

```
FOR each Manager:
    DOCUMENT: Call patterns in each use case

COMPARE: Call patterns across all Managers

IF asymmetric pattern found:
    INVESTIGATE: Why is this case different?
    Is the Manager real or functionally decomposed?
```

### Phase 7: Expendability Test

```
FOR each Manager:
    SIMULATE: Stakeholder requests change to use case

    IF response is fear/resistance:
        WARNING: Manager too big (expensive)
    IF response is shrug/trivial:
        WARNING: Pass-through Manager (expendable)
    IF response is thoughtful consideration:
        GOOD: Almost expendable (correct design)
```

---

## 10. Important Quotes

### On Architecture Universality
> "Good architectures allow use in different contexts. A mouse and an elephant are vastly different, yet they use identical architecture."

### On Use Cases vs Functional Requirements
> "Requirements should capture the required behavior rather than the required functionality. You should specify how the system is required to operate as opposed to what it should do."

### On Volatility Distribution
> "In a well-designed system, volatility should decrease top-down across the layers... The components in the lower layers have more items that depend on them. If the components you depend upon the most are also the most volatile, your system will implode."

### On ResourceAccess Contracts
> "A well-designed ResourceAccess component exposes in its contract the atomic business verbs around a resource."

### On Almost-Expendable Managers
> "If the Manager merely orchestrates the Engines and the ResourceAccess, encapsulating the sequence volatility, you have a great Manager service, albeit an almost expendable one."

### On Microservices
> "There are no microservices - only services."

> "Microservices will be the biggest failure in the history of software."

### On Protocols
> "In any well-designed system you should never use the same communication mechanism both internally and externally."

> "It is not the end of the world if you cannot talk with your boss or have a misunderstanding with a customer, but you will die if you cannot communicate correctly or at all with your liver."

### On Open Architecture
> "In general, in software engineering, trading encapsulation for flexibility is a bad trade."

### On Construction
> "Design iteratively, build incrementally."

### On Functional Decomposition Detection
> "If your system has eight Managers, then you have already failed to produce a good design."

### On Symmetry
> "All good architectures are symmetric... Symmetry is so fundamental for good design that you should generally see the same call patterns across Managers."

### On Guideline Violations
> "Nearly always, the discovery of such a transgression indicates some underlying need that made developers violate the guidelines. You must address that need correctly, in a way that complies with the closed architecture principle."
