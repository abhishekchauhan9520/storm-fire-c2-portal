# Storm Fire Operational Service Capability Matrix v1

## Purpose

This matrix translates the Storm Fire service architecture into implementable functional capabilities. A service is a complete operational capability, not a dashboard. Each service owns domain workflows and state, consumes relevant information, publishes authorized information/events into the Information Fabric, and exposes an appropriate operational environment to authorized participants.

## Core rule

```text
SERVICE
  ├── Functional capability
  ├── Domain workflows
  ├── Domain state
  ├── Inputs / information consumption
  ├── Outputs / information production
  ├── Events / alerts
  └── Authorized operational workspace
              ↓
       INFORMATION FABRIC
              ↓
      DYNAMIC PARTICIPANT COP
```

The service is not an isolated COP or database. The Information Fabric remains the shared information environment.

## Tier 1 — Core platform services

| Service | Functional capability | Primary consumers | Information Fabric role | Priority |
|---|---|---|---|---|
| Common Operational Environment | Shared operational state and integrated views | Authorized participants | Consumes/fuses/publishes operational information | P0 |
| GIS / Mapping | Geospatial visualization, layers, operational geography | All relevant users/services | Shared geospatial context | P0 |
| Organization & Participant | Organization graph, participant context, assignments | Command/admin/platform | Defines organizational context | P0 |
| Identity / Access / Policy | Identity, entitlements, geographic and information scope | All services | Enforces access before distribution | P0 |
| Information / Event | Canonical events, objects, subscriptions and distribution | All services | Core event transport/model | P0 |
| Service Registry | Capability discovery, service metadata, health and entitlements | All services | Describes available capabilities | P0 |
| Alert & Notification | Parallel alerts, acknowledgement, escalation and delivery state | Authorized participants | Distributes events according to policy | P0 |
| Provenance / Data Quality | Source, lineage, freshness, confidence and quality | All information consumers | Makes information trustworthy and traceable | P0 |

## Tier 2 — Major operational services

### Logistics & Sustainment Service

A complete logistics operating environment rather than a status dashboard.

Capabilities:

- supply management
- inventory and stock visibility
- requisition/request workflows
- distribution and resupply workflows
- transportation coordination
- fuel and consumable status
- ammunition/resource accounting where authorized
- equipment sustainment status
- logistics tasking and status
- warehouse/location management
- maintenance integration
- shortages and priority management
- logistics alerts and exceptions
- logistics reporting and history

Outputs include authorized logistics status, requests, shortages, movement status, readiness impacts and alerts for consumption by command, units and relevant services.

**Priority: P0/P1**

### UAV / UAS Service

A complete unmanned-systems operating environment.

Capabilities:

- platform registry
- availability/readiness
- mission management
- crew/operator assignment
- sensor configuration
- task/status management
- telemetry ingestion
- video/ISR feed integration
- mission history
- service health
- authorized tasking and information publication

**Priority: P0/P1**

### Intelligence / ISR Service

A complete intelligence information environment.

Capabilities:

- collection/source management
- observations
- intelligence products
- correlation/fusion
- source/provenance tracking
- confidence and freshness
- reporting workflows
- intelligence requests
- relevant alerts
- authorized dissemination

**Priority: P0/P1**

### Air Defence / Air Situational Awareness Service

A shared air-situation capability.

Capabilities:

- air-picture ingestion
- track/object management
- sensor/source metadata
- track status and freshness
- threat/event representation
- coverage/status
- alerting
- authorized dissemination to command and relevant users

**Priority: P1**

### EW Service

A complete electromagnetic operational information environment.

Capabilities:

- spectrum-awareness data
- observations/events
- emitter/activity records where authorized
- source/provenance
- status and freshness
- EW alerts
- reporting
- authorized dissemination

**Priority: P1**

### Weather / Environmental Service

Capabilities:

- current conditions
- forecasts
- environmental observations
- geospatial weather layers
- operational weather alerts
- service/API ingestion
- weather context for relevant services

**Priority: P1**

### Communications Service

Capabilities:

- communications/service status
- endpoint/service registry
- connectivity state
- degraded/disconnected state
- network/service health
- relevant communication alerts
- integration with edge synchronization

**Priority: P0/P1**

### Maintenance & Readiness Service

Capabilities:

- equipment registry
- readiness state
- maintenance requests
- faults
- repair workflow
- parts requirements
- maintenance history
- readiness reporting
- logistics integration

**Priority: P1**

### Medical / CASEVAC Service

Capabilities:

- medical status information
- casualty/event records where authorized
- medical resource status
- support requests
- evacuation coordination information
- facility/resource availability
- relevant alerts

**Priority: P1/P2**

### Personnel Service

Capabilities:

- personnel/crew status
- role and assignment information
- availability
- organizational assignment
- personnel readiness indicators
- administrative workflows where appropriate

**Priority: P2**

## Tier 3 — Mission and specialist services

### Fires Coordination Service

Capabilities should focus on coordination, information sharing, task/status workflows, deconfliction and authorized fire-support information rather than implementing autonomous weapon control.

**Priority: P1/P2**

### Space Information Service

Capabilities:

- space-derived information ingestion
- source/provenance
- relevant imagery/data products
- event/status information
- authorized dissemination

**Priority: P2**

### Engineering & Infrastructure Service

Capabilities:

- infrastructure status
- engineering tasks
- route/structure information
- damage/status reporting
- resource requirements
- engineering requests

**Priority: P2**

### Mobility / Transportation Service

Capabilities:

- vehicle/transport registry
- movement requests
- movement status
- route/context information
- transport capacity
- logistics integration

**Priority: P1/P2**

### Mission / Task Management Service

Capabilities:

- task creation
- assignment
- status
- dependencies
- deadlines
- completion evidence
- task history
- cross-service task relationships

**Priority: P0/P1**

### Battle / Operational Reporting Service

Capabilities:

- structured reports
- situation reports
- event reporting
- unit status
- templates/workflows
- report history
- Information Fabric publication

**Priority: P0/P1**

### Planning & Coordination Service

Capabilities:

- collaborative planning
- shared planning objects
- coordination workflows
- versioning
- approvals
- plan status
- relationship to tasks and operational objects

**Priority: P1/P2**

### Analytics / Decision Support Service

Capabilities:

- operational analytics
- trend analysis
- anomaly detection
- information prioritization
- decision-support views
- controlled AI-assisted analysis in later phases

This service must remain decision-support oriented; it does not autonomously exercise command authority.

**Priority: P2**

## Tier 4 — Future information-environment capabilities

- Data Catalog / Discovery
- Edge / Disconnected Operations
- Synchronization and conflict handling
- Advanced correlation/fusion
- AI-assisted information triage
- Natural-language operational search
- Advanced simulation/modelling
- Cross-system interoperability adapters
- Federation with external information environments

## Service interaction model

```text
                         SERVICE FABRIC
                              │
      ┌──────────┬────────────┼────────────┬──────────┐
      ↓          ↓            ↓            ↓          ↓
  Logistics     UAV          EW       Air Defence  Intel
      │          │            │            │          │
      └──────────┴────────────┼────────────┴──────────┘
                              ↓
                     INFORMATION FABRIC
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
          Company          Brigade          Division
            COP              COP               COP
```

A service may consume information from other services and publish information that becomes available to other authorized services and participants. This creates a shared environment without turning services into tightly coupled monoliths.

## Participant-specific service composition

A participant does not automatically receive every service.

```text
Participant
   ↓
Organization + Role + Responsibility
   ↓
Service Entitlements + Information Policy + Geographic Scope
   ↓
Participant Context
   ↓
Dynamic Operational Environment / COP
```

A company commander may receive a subset of Logistics, UAV, EW, Air Defence, Intelligence, Weather, GIS, communications and task information appropriate to the commander's authorized responsibility. A brigade or division commander can receive broader scope and additional service capabilities. Exact scope remains policy/configuration, not a hard-coded echelon rule.

## Functional service acceptance criteria

A new service is not complete merely because a screen exists. It should have:

1. Domain data model.
2. Domain workflows.
3. Service API/contracts.
4. Information Fabric integration.
5. Source/consumer definitions.
6. Event and alert integration.
7. Provenance and freshness.
8. Authorization and geographic scope.
9. Participant workspace/COP integration.
10. Health and operational status.
11. Audit/history where required.
12. Degraded/offline behavior where applicable.

## Development order

### P0 foundation

Organization & Participant → Identity/Policy → Information/Event → Service Registry → GIS/COP foundation → Alerting → Provenance/Data Quality.

### P0/P1 operational services

Logistics → Mission/Task → Operational Reporting → Communications → UAV/ISR → Intelligence.

### P1 services

Air Defence → EW → Weather → Maintenance → Mobility → Planning.

### P2 services

Medical → Personnel → Fires coordination → Space → Engineering → Analytics/Decision Support.

### Future

Edge/disconnected synchronization → advanced interoperability/federation → advanced analytics/AI → simulation/modelling.

## Design rule

Storm Fire should continuously prefer a smaller number of complete, composable operational services over a large number of shallow dashboards. Every service must strengthen the shared Information Fabric and the participant's dynamically composed operational environment.
