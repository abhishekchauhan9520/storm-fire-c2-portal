# Storm Fire Service Implementation Roadmap v1

## Objective

Turn the approved Storm Fire functional-service architecture into software incrementally without creating disconnected dashboards.

The governing model is:

```text
COMMAND / ORGANIZATIONAL GRAPH
            │
            ▼
      SERVICE FABRIC
            │
   ┌────────┼─────────┐
   ▼        ▼         ▼
Logistics  UAV       EW ...
   │        │         │
   └────────┼─────────┘
            ▼
     INFORMATION FABRIC
            │
            ▼
   PARTICIPANT CONTEXT
            │
            ▼
       DYNAMIC COP
```

Every functional service is both an operational capability and a producer/consumer of information. The COP is a generated operational view, not a second source of truth.

## Development principles

1. Canonical operational objects are authoritative; UI state is not.
2. Services own domain workflows and domain state.
3. Information Fabric carries shared events and operational information.
4. Organization hierarchy determines command context; information relationships can be vertical, horizontal, or diagonal.
5. Every authorized participant can be both a source and consumer.
6. Service access is policy/context based, not hard-coded by rank or screen.
7. Geographic scope is configurable policy, not a universal echelon rule.
8. Provenance, freshness and confidence travel with information.
9. Alerts can fan out to multiple authorized recipients in parallel.
10. Connectivity degradation must eventually be a first-class state.
11. No service is considered complete because a screen exists; functional workflows and contracts must exist.
12. Safety boundaries remain explicit: operational decision support and coordination are supported; autonomous lethal decision-making is not a Storm Fire responsibility.

## Phase 0 — Repository and architecture baseline

### Deliverables

- canonical domain package layout
- shared TypeScript contracts
- API/event naming conventions
- service manifest format
- organization/participant graph contracts
- information object envelope
- event envelope
- provenance metadata
- policy reference model
- service health model
- architecture decision records

### Acceptance

A new service can be described and registered without creating an isolated data model or bypassing the Information Fabric.

## Phase 1 — Information Fabric foundation

### Build

- canonical event envelope
- operational object envelope
- event identifiers and correlation identifiers
- source/provenance metadata
- timestamps and freshness
- confidence/quality fields
- subscriptions
- authorized fan-out
- acknowledgement state
- event history/audit hooks
- basic persistence abstraction

### Target flow

```text
SOURCE
  ↓
CANONICAL OBJECT/EVENT
  ↓
INFORMATION FABRIC
  ├── Participant A
  ├── Participant B
  ├── Service X
  └── Service Y
```

## Phase 2 — Organization + Participant Context

Implement the model documented in `ORGANIZATIONAL_GRAPH_AND_PARTICIPANT_MODEL_V1.md`.

### Build

- OrganizationNode
- Participant
- service entitlement
- geographic scope
- information relationship
- role/capability
- workspace assignment
- policy references
- context resolver

### Result

Storm Fire can answer:

> What operational information and services should this participant receive right now?

without duplicating the underlying information.

## Phase 3 — Service Registry

### Build

Every service publishes a machine-readable manifest containing:

- service identity
- version
- capabilities
- APIs/contracts
- event types
- consumed information types
- produced information types
- required entitlements
- health/status
- dependencies
- workspace modules

### Initial registered services

1. Information/Event
2. Organization/Participant
3. Identity/Policy
4. GIS/COP
5. Alerting
6. Provenance/Data Quality
7. Logistics
8. Mission/Task
9. Operational Reporting
10. Communications
11. UAV/ISR
12. Intelligence
13. Air Defence
14. EW
15. Weather
16. Maintenance
17. Mobility/Transportation
18. Planning
19. Medical
20. Personnel
21. Fires Coordination
22. Space Information
23. Engineering
24. Analytics/Decision Support

Registration does not mean every service is immediately fully implemented.

## Phase 4 — Dynamic COP / Operational Environment

The COP should be assembled from:

```text
participant
+ organization
+ role
+ service entitlements
+ information policy
+ geographic scope
+ active relationships
+ operational context
```

### Build

- shared map foundation
- operational object layers
- service-provided layers
- participant-specific layer selection
- geographic filtering
- information authorization filtering
- stale-data indicators
- provenance display
- service status indicators
- workspace composition

### Result

Two participants may see different COPs while using the same canonical information environment.

## Phase 5 — First complete operational services

Build services as complete vertical slices rather than creating every module superficially.

### 5.1 Logistics & Sustainment

Initial scope:

- asset/resource registry
- inventory
- supply requests
- distribution status
- transport status
- sustainment tasks
- maintenance links
- shortages
- priority queues
- alerts
- logistics reporting
- participant-specific logistics workspace
- Information Fabric publication

### 5.2 Mission / Task Management

- task creation
- assignment
- status
- dependencies
- deadlines
- completion evidence
- event history
- cross-service task links
- authorized publication

### 5.3 Operational Reporting

- structured reports
- event reporting
- unit status
- templates
- workflow/status
- report history
- Information Fabric publication

These establish the pattern that later services should follow.

## Phase 6 — ISR and information-producing services

### UAV/UAS

- platform registry
- readiness
- mission/task state
- telemetry ingestion
- sensor metadata
- ISR/video integration boundary
- mission history
- health
- authorized publication

### Intelligence/ISR

- source registry
- observations
- intelligence objects/products
- correlation state
- provenance
- confidence
- requests
- reporting
- dissemination

### Weather

- observations
- forecast objects
- geospatial layers
- alerts
- source/freshness

The emphasis is on making these services **information producers and consumers**, not merely video/map viewers.

## Phase 7 — Air Defence and EW information environments

### Air Defence

- air object/track model
- source metadata
- track freshness
- status/coverage
- threat/event representation
- alerts
- authorized dissemination

### EW

- spectrum observation model
- event model
- source/provenance
- activity/status representation
- alerts
- reporting
- authorized dissemination

These services should feed the common environment while preserving domain-specific controls and data policy.

## Phase 8 — Sustainment, mobility and support services

- Maintenance & Readiness
- Mobility / Transportation
- Medical / CASEVAC
- Personnel
- Engineering / Infrastructure

Each follows the same service contract and Information Fabric pattern.

## Phase 9 — Planning and coordination

Build:

- collaborative planning objects
- plan versions
- coordination workflows
- approval/status
- task generation
- plan-to-operation relationships
- operational assessment hooks

## Phase 10 — Edge and degraded operation

### Required architecture

```text
CONNECTED
   ↓
DEGRADED
   ↓
DISCONNECTED
   ↓
LOCAL OPERATION
   ↓
RECONNECT
   ↓
SYNC
   ↓
CONFLICT RESOLUTION
```

Build only after canonical objects and event semantics are stable.

Required capabilities:

- local persistence
- prioritized queues
- store-and-forward
- synchronization
- conflict handling
- stale-state detection
- recovery
- service-local operation

## Phase 11 — Advanced information advantage

- data catalog/discovery
- advanced correlation
- anomaly detection
- information prioritization
- analytics
- controlled AI-assisted triage/summarization
- natural-language operational search
- simulation/modelling

AI remains decision support with human authority and explicit provenance.

## Service completion gate

Before calling any operational service complete, verify:

- [ ] Domain model exists.
- [ ] Domain workflow exists.
- [ ] API/service contract exists.
- [ ] Events are canonical.
- [ ] Information Fabric integration exists.
- [ ] Source/consumer behavior is defined.
- [ ] Provenance is retained.
- [ ] Freshness/quality is represented.
- [ ] Authorization is enforced.
- [ ] Geographic scope is enforced where applicable.
- [ ] Dynamic COP/workspace integration exists.
- [ ] Alerts are integrated where applicable.
- [ ] Service health is observable.
- [ ] History/audit requirements are handled.
- [ ] Degraded behavior is documented.
- [ ] Tests cover domain and integration behavior.

## What we must not do

- Do not create one database per screen.
- Do not hard-code different COP implementations for company/brigade/division.
- Do not make hierarchy the only information path.
- Do not make every participant automatically see everything.
- Do not treat raw feeds as automatically authoritative.
- Do not build every service as a shallow dashboard.
- Do not introduce autonomous lethal decision-making.
- Do not couple all services directly to one another when an Information Fabric contract is sufficient.

## Immediate engineering sequence

The next code-level work should be performed in this order:

1. Inspect the current repository and identify existing domain/service boundaries.
2. Create shared canonical domain contracts.
3. Implement organization/participant context types.
4. Implement service manifest/registry types.
5. Implement event/object envelopes and Information Fabric interfaces.
6. Implement authorization-aware participant context resolution.
7. Connect the existing UI to canonical context rather than hard-coded role views.
8. Implement dynamic COP composition.
9. Build the first complete Logistics vertical slice.
10. Build Mission/Task and Operational Reporting integrations.
11. Add UAV/ISR and Intelligence contracts.
12. Add Alert fan-out and provenance across all completed services.

This sequence deliberately prioritizes the information environment and reusable service contracts before expanding the number of visible modules.
