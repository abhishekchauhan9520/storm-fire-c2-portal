# Storm Fire Service Build Plan v1

## 1. Goal

Build Storm Fire as a unified operational information environment composed of reusable services. Each service owns a coherent functional capability and publishes/consumes information through the Information Fabric. A participant's operational workspace/COP is dynamically composed from authorized services, information, geographic scope, relationships and role/context.

The service model must preserve the core Storm Fire principle:

> Every authorized participant can be both a source and a consumer of information, with vertical, horizontal and diagonal information relationships and parallel distribution of relevant events.

This plan is for software architecture and situational-awareness/coordination capabilities. It does not implement autonomous weapons employment or autonomous lethal decision-making.

## 2. Research basis

Current public Army and NATO material reinforces the direction of a common data layer, shared services, integrated applications, data-centric architecture, interoperability, resilience, and functional applications over common infrastructure. The Army's 2026 NGC2 baseline includes a common data layer, edge-to-cloud data mesh, data/services registries, transformation and federation. Army CPCE work previously demonstrated common views, shared data/maps and common services across fires, logistics, intelligence, airspace and maneuver. NATO's current digital strategy and Digital Backbone likewise emphasize federated data, interoperable services, secure information sharing, edge/cloud resilience and data-centric security.

Storm Fire should adopt those useful architectural lessons without copying another system's organizational model. Its differentiator remains the dynamic information environment and flexible vertical/horizontal/diagonal information relationships.

## 3. Capability/service catalog

### Tier 0 — Core platform services

These are prerequisites for every operational service.

1. Identity & Participant Service
2. Organization/Command Graph Service
3. Policy & Access Service
4. Information Fabric Service
5. Service Registry & Discovery Service
6. Event & Alert Service
7. GIS/Geospatial Foundation Service
8. Audit/Provenance/Data Quality Service
9. Workspace/COP Composition Service
10. System Health/Observability Service

### Tier 1 — Core operational services

1. Logistics & Sustainment Service
2. Intelligence & ISR Service
3. UAV/UAS Service
4. Air Situational Awareness Service
5. EW Situational Awareness Service
6. Weather & Environmental Service
7. Communications/Network Status Service
8. Mission/Task Management Service
9. Operational Reporting Service
10. Collaboration/Messaging Service

### Tier 2 — Specialist operational services

1. Maintenance & Equipment Readiness Service
2. Medical/CASEVAC Coordination Service
3. Transportation & Movement Service
4. Engineering/Infrastructure Service
5. Personnel/Force Readiness Service
6. Fires Information/Coordination Service
7. Space-Derived Information Service
8. Airspace Coordination Service
9. Sensor/Collection Management Service
10. Common Data/Track Correlation Service

### Tier 3 — Advanced services

1. Analytics & Decision Support Service
2. Information Discovery/Catalog Service
3. Data Fusion Service
4. Predictive Sustainment Analytics
5. AI-assisted Information Triage
6. Training/Simulation/Rehearsal Service
7. Digital Engineering/Operational Modelling Service

## 4. What each service means

### Logistics & Sustainment

A complete logistics information environment, not merely a dashboard. It should eventually cover inventory, supply requests, distribution, transportation, maintenance dependencies, readiness, resupply status, resource forecasts and logistics events. It publishes relevant status to the Information Fabric while allowing authorized logistics users to manage detailed workflows.

### Intelligence & ISR

Provides an information environment for intelligence sources, reports, observations, products, provenance, confidence, correlation and authorized dissemination. It should support multiple sources feeding a common information environment rather than creating an isolated intelligence COP.

### UAV/UAS

Provides platform/service status, mission/task state, sensor/ISR data, telemetry, video-feed metadata, availability and service health. Detailed control interfaces should be isolated behind explicit service contracts and authorization.

### Air Situational Awareness

Provides a shared air-picture service based on authorized sensor/data sources, track state, provenance, confidence, freshness and alerts. It should be consumable by appropriate command and air-defence workspaces.

### EW Situational Awareness

Provides an electromagnetic-environment information service: observations, events, spectrum awareness, provenance, confidence, service status and authorized alerts. It should share appropriate information with the broader environment while preserving access policy.

### Weather & Environmental

Provides weather/environmental data, forecasts, alerts and context that other services can consume. It should be a reusable source for UAV, GIS, logistics and planning workspaces.

### Communications/Network Status

Provides network/service health, connectivity state, degradation indicators, latency/queue/error metrics and available communication paths. It supports operational awareness rather than being treated as invisible infrastructure.

### Mission/Task Management

Provides tasks, assignments, status, deadlines, dependencies, acknowledgements and completion state. It should remain separate from command authority while integrating with the organizational and information graphs.

### Maintenance & Equipment Readiness

Provides equipment status, readiness, faults, maintenance state, parts dependencies and lifecycle information to authorized users and logistics workflows.

### Medical/CASEVAC Coordination

Provides medical-status and support coordination information, availability/status of relevant resources and authorized requests/events. Sensitive personal data must be protected by policy.

### Transportation & Movement

Provides movement status, transport resources, route/status information and logistics movement events to authorized users.

### Engineering/Infrastructure

Provides infrastructure status, engineering assessments, work requests, dependencies and relevant geospatial information.

### Personnel/Force Readiness

Provides authorized aggregate personnel and readiness information. Individual sensitive personnel data must be separately governed.

### Fires Information/Coordination

Provides authorized fires-related information, coordination status, requests and reporting. It is an information/coordination service, not an autonomous weapon-employment engine.

### Space-Derived Information

Provides authorized space-derived observations/products and metadata to intelligence, planning and other permitted services.

### Airspace Coordination

Provides airspace structures, coordination status and relevant deconfliction information for authorized users and services.

## 5. Shared service contract

Every operational service should expose common metadata:

```text
serviceId
name
version
owner
status
health
capabilities
inputTypes
outputTypes
requiredPermissions
supportedGeographicScopes
provenancePolicy
retentionPolicy
availability
```

Every information object should eventually carry common concepts such as:

```text
id
source
createdAt
updatedAt
freshness
provenance
confidence
classification/accessPolicy
geographicScope
organizationScope
correlationState
lifecycleState
```

## 6. Service interaction model

Services are not isolated silos.

```text
                  SERVICE FABRIC
                       |
       +---------------+---------------+
       |               |               |
   LOGISTICS          UAV              EW
       |               |               |
       +---------------+---------------+
                       |
                INFORMATION FABRIC
                       |
       +---------------+---------------+
       |               |               |
   COMPANY COP     BRIGADE COP     DIVISION COP
```

A service may have many producers and many consumers. The Information Fabric handles publication, discovery, policy-aware distribution, provenance and event fan-out.

## 7. Dynamic COP composition

The COP/workspace generator resolves:

```text
participant
+ organization
+ role/capabilities
+ service entitlements
+ geographic scope
+ information permissions
+ information relationships
+ current operational context
= operational workspace
```

The result can contain a master map plus service-specific panels such as logistics, UAV/ISR, weather, EW, air picture, intelligence or communications, depending on the participant's authorized context.

## 8. Build sequence

### Phase A — Foundation

- Domain contracts
- Organization graph
- Participant model
- Service registry
- Access/policy model
- Geographic scope model
- Information object model
- Provenance model
- Event model

### Phase B — Information Fabric

- Publish/subscribe model
- Relationship graph
- Policy-aware routing
- Parallel fan-out
- Event lifecycle
- Acknowledgement/delivery state
- Data freshness and provenance

### Phase C — Dynamic Workspace

- Workspace context resolver
- Service entitlement resolver
- COP composition engine
- Map foundation
- Configurable panels/widgets
- Role/mission/geography-aware views

### Phase D — First operational services

Implement in this order:

1. Logistics & Sustainment
2. Intelligence/ISR
3. UAV/UAS
4. Air Situational Awareness
5. EW Situational Awareness
6. Weather/Environment
7. Communications Status
8. Mission/Task Management
9. Maintenance/Readiness
10. Operational Reporting

### Phase E — Expanded services

- Medical
- Transportation
- Engineering
- Personnel readiness
- Fires coordination
- Space-derived information
- Airspace coordination
- Sensor/collection management

### Phase F — Resilience and interoperability

- Edge/local operation
- Store-and-forward
- Synchronization
- Conflict handling
- Service federation
- External adapters
- Data transformation
- Service health and graceful degradation

### Phase G — Advanced decision support

- Search/discovery
- Analytics
- Data fusion
- Predictive sustainment
- AI-assisted triage/summarization
- Training/rehearsal

## 9. First milestone

Do not attempt to build every service UI immediately. The first implementation milestone is a vertical slice proving the architecture:

```text
Organization
   -> Participant
   -> Service entitlement
   -> Information object
   -> Information Fabric
   -> Policy-aware routing
   -> Dynamic workspace
   -> COP/service panel
   -> Parallel event/alert
```

The first functional service should be Logistics because it demonstrates the service model particularly well: structured entities, workflows, status, geographic information, events, multiple consumers and integration with the common operational environment.

Once that vertical slice works, the same contracts should be reused to add UAV/ISR, EW, Air SA, Weather and the remaining services instead of creating separate architectures for each module.

## 10. Definition of done for the service architecture

The service architecture is considered mature when:

- adding a new service does not require redesigning the Information Fabric;
- one service can publish information to multiple authorized consumers;
- participants can consume multiple services in one workspace;
- information can traverse vertical, horizontal and diagonal authorized relationships;
- a participant can both publish and consume information;
- COP composition is policy/context driven;
- events can fan out to multiple authorized recipients in parallel;
- provenance and access policy travel with information;
- services remain independently deployable and observable;
- degraded connectivity does not destroy the logical operational environment;
- external data/services can be integrated through explicit adapters/contracts.

## 11. Immediate next coding step

Implement the canonical TypeScript domain contracts and the first end-to-end Logistics vertical slice. Do not create disconnected mock modules. Every new service must connect to the same Organization Graph, Participant Context, Service Registry and Information Fabric.
