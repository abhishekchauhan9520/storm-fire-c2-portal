# Storm Fire Operational Service Catalog v1

## Purpose

This catalog defines the functional services Storm Fire should provide as an operational information environment. A service is a reusable operational capability, not merely a dashboard. Services publish and consume canonical information through the Information Fabric and expose role- and mission-appropriate workspaces.

The catalog is deliberately capability-oriented. Exact implementation, external integrations, and deployment topology are separate engineering decisions.

## Service model

```text
                    STORM FIRE OS
                         |
                  SERVICE FABRIC
                         |
     +-------------------+-------------------+
     |                   |                   |
 OPERATIONAL         INFORMATION          PLATFORM
 SERVICES             SERVICES             SERVICES
     |                   |                   |
     +-------------------+-------------------+
                         |
                 INFORMATION FABRIC
                         |
                DYNAMIC WORKSPACES
```

A service can be both a producer and consumer of information. Multiple services may consume the same canonical object, and a participant may consume multiple services through one dynamically composed operational environment.

## Tier 0 — Core shared operational services

### 1. Common Operational Environment / COP Service
Purpose: compose the participant's operational picture from authorized services, data, geographic scope, relationships and context.

Capabilities:
- map and layer composition
- operational object visualization
- unit/organization views
- event and alert overlays
- service widgets and workspaces
- saved operational views
- context-aware filtering

### 2. GIS / Geospatial Service
Purpose: provide the common geospatial foundation used by other services.

Capabilities:
- maps and layers
- terrain/geospatial datasets
- coordinates and geometry
- areas and boundaries
- route/area visualization
- spatial queries
- geospatial data discovery

### 3. Information & Event Service
Purpose: canonical event, information-object and notification backbone for operational services.

Capabilities:
- publish/subscribe
- event identity
- provenance
- freshness
- correlation
- priority
- parallel distribution
- acknowledgement and delivery state

### 4. Organization & Participant Service
Purpose: represent mixed command structures, participants, roles and organizational context.

Capabilities:
- organization graph
- subordinate relationships
- participant assignment
- role/capability context
- service entitlement
- responsibility area
- workspace context

### 5. Identity, Access & Policy Service
Purpose: enforce who can access which information and services.

Capabilities:
- identity
- authentication integration
- authorization
- geographic scope
- role/mission policy
- data-level access controls
- audit

## Tier 1 — Major operational services

### 6. Intelligence / ISR Service
Purpose: manage intelligence information and ISR-derived products.

Capabilities:
- intelligence sources
- observations
- reports/products
- source/provenance tracking
- correlation
- intelligence requests
- dissemination
- intelligence workspace

### 7. UAV / Unmanned Systems Service
Purpose: provide a unified information and management environment for authorized unmanned-system assets and services.

Capabilities:
- asset registry
- availability/status
- mission/task information
- sensor metadata
- telemetry
- ISR products/feeds
- operator/service status
- integration with intelligence and COP services

### 8. Air Situational Awareness / Air Defence Service
Purpose: provide the common air situation to authorized participants and air-defence users.

Capabilities:
- air-picture objects
- sensor-derived information
- track lifecycle
- air alerts
- coverage/status
- relevant unit/service status
- integration with COP and intelligence

### 9. Electronic Warfare Service
Purpose: provide a shared EW information environment.

Capabilities:
- electromagnetic observations
- spectrum information
- EW events
- source/provenance
- alerts
- unit/service status
- integration with intelligence and COP

### 10. Logistics & Sustainment Service
Purpose: provide an end-to-end logistics operating environment rather than a simple logistics dashboard.

Capability domains:
- supply
- inventory
- requisitions/requests
- distribution
- transportation coordination
- fuel
- ammunition/resource accounting
- equipment availability
- sustainment status
- logistics reporting
- maintenance integration
- resupply planning
- logistics alerts

The service publishes relevant logistics status into the Information Fabric so commanders and other authorized services receive only the logistics information relevant to their context.

### 11. Maintenance & Readiness Service
Purpose: manage equipment/serviceability and readiness information.

Capabilities:
- equipment registry
- readiness status
- faults
- maintenance work
- repair lifecycle
- spare/parts requirements
- serviceability trends
- readiness reporting

### 12. Weather & Environmental Service
Purpose: provide environmental information to operational services.

Capabilities:
- weather observations
- forecasts
- alerts
- environmental layers
- service-specific weather context
- integration with GIS, UAV, operations and logistics

### 13. Communications Service
Purpose: expose operational communications/network information to authorized users and services.

Capabilities:
- communication service status
- endpoint/service availability
- connectivity state
- degraded-state reporting
- communications incidents
- service health

### 14. Medical / Casualty Support Service
Purpose: provide authorized medical and casualty-support information.

Capabilities:
- medical facility status
- support requests
- casualty status where authorized
- evacuation/support coordination
- medical logistics
- availability/status reporting

### 15. Personnel Service
Purpose: manage authorized personnel and staffing information relevant to operations.

Capabilities:
- personnel readiness/status
- staffing
- qualification/capability information
- availability
- organizational assignment
- personnel reporting

## Tier 2 — Mission and functional services

### 16. Fires Coordination Service
Purpose: provide authorized fire-support information and coordination workflows.

Capabilities:
- fire-support information
- requests
- status
- coordination measures
- event/status reporting
- integration with operations, GIS and logistics

### 17. Space Information Service
Purpose: expose authorized space-derived information and space-service status.

Capabilities:
- space-derived information
- satellite/service status
- relevant observation products
- event/alert information
- integration with intelligence and COP

### 18. Engineering & Infrastructure Service
Purpose: manage engineering and infrastructure information.

Capabilities:
- infrastructure registry
- engineering status
- construction/repair tasks
- route/infrastructure constraints
- infrastructure incidents
- resource requirements

### 19. Mobility / Transportation Service
Purpose: manage movement and transportation information as a specialized capability that can integrate with Logistics.

Capabilities:
- movement requests
- vehicle/transport availability
- movement status
- route information
- transportation constraints
- logistics integration

### 20. Mission / Task Management Service
Purpose: represent tasks, assignments, status and completion across the command environment.

Capabilities:
- task creation
- assignment
- dependencies
- priorities
- status
- acknowledgements
- completion
- reporting
- links to operational objects and services

### 21. Operations / Battle Management Service
Purpose: provide command-staff operational management without replacing the underlying services.

Capabilities:
- operational events
- decisions/records
- operational status
- coordination
- commander's operational view
- links to tasks, alerts and information objects

### 22. Collaborative Planning Service
Purpose: support collaborative planning and controlled distribution of operational plans and supporting information.

Capabilities:
- planning workspaces
- plan versions
- collaboration
- approvals
- dependencies
- synchronization
- publication

## Tier 3 — Information advantage services

### 23. Alert & Notification Service
Purpose: resolve and distribute multiple simultaneous alerts to authorized recipients.

Capabilities:
- rules
- recipient resolution
- severity/priority
- parallel fan-out
- acknowledgement
- escalation
- expiry
- deduplication
- delivery tracking

### 24. Data Catalog / Discovery Service
Purpose: make authorized information sources, datasets, services and products discoverable.

Capabilities:
- metadata
- search
- service discovery
- information-source registry
- data-product registry
- lineage references
- access-aware discovery

### 25. Analytics & Decision-Support Service
Purpose: provide analysis without turning Storm Fire into an autonomous command system.

Capabilities:
- trend analysis
- correlation
- anomaly detection
- operational summaries
- predictive/forecasting tools where appropriate
- decision-support products
- explainability/provenance references

### 26. Operational Reporting Service
Purpose: standardize operational reports and status products while keeping them connected to canonical information.

Capabilities:
- report templates
- situation reports
- status reports
- automated data population
- approvals
- distribution
- report history

## Tier 4 — Platform services supporting all operational services

### 27. Service Registry
- service discovery
- capability metadata
- API/contract metadata
- versions
- dependencies
- health
- entitlement requirements

### 28. Provenance & Data Quality Service
- source
- origin
- timestamps
- freshness
- confidence
- validation state
- lineage
- quality indicators

### 29. Synchronization / Edge Service
- disconnected operation
- local persistence
- store-and-forward
- synchronization
- conflict handling
- priority queues
- degraded mode

### 30. Audit & Observability Service
- service health
- information flow health
- audit trails
- latency
- errors
- delivery state
- synchronization state
- operational diagnostics

## Cross-service integration principle

No major service should become an information silo.

```text
                    INFORMATION FABRIC
                           |
     +---------+----------+----------+---------+
     |         |          |          |         |
 Logistics    UAV        EW      Air Defence  Intel
     |         |          |          |         |
     +---------+----------+----------+---------+
                           |
                       PARTICIPANTS
                           |
              +------------+------------+
              |                         |
         COMPANY COP              DIVISION COP
```

For example, Logistics can consume equipment status from Maintenance and publish sustainment status to authorized command workspaces. UAV can consume weather information and publish ISR information. Air Defence can consume relevant sensor information and publish an authorized air situation. Intelligence can correlate information from multiple services and publish intelligence products. The Information Fabric controls the shared information flow; the services retain responsibility for their functional domains.

## What should NOT be built as separate duplicate COPs

Do not create:

- a separate logistics COP database
- a separate UAV operational truth database
- a separate EW truth database
- a separate brigade information universe
- a separate company information universe

Instead, create service-owned functional data/capabilities connected to canonical shared information and generate role/context-specific workspaces.

## Priority for implementation

### P0 — Build first
1. Information/Event Service
2. Organization & Participant Service
3. Identity/Access/Policy Service
4. Service Registry
5. GIS/COP foundation
6. Logistics service foundation
7. UAV/ISR service foundation
8. Alert service foundation
9. Provenance/Data Quality foundation

### P1 — Build next
10. Intelligence/ISR expansion
11. EW service
12. Air Situational Awareness service
13. Weather
14. Maintenance/Readiness
15. Communications
16. Mission/Task Management
17. Mobility/Transportation
18. Data Discovery

### P2 — Expand after the core is stable
19. Medical
20. Personnel
21. Fires
22. Space
23. Engineering
24. Collaborative Planning
25. Analytics/Decision Support
26. Advanced reporting
27. Edge synchronization at scale

## Design rule

The service catalog is not a fixed final list. Storm Fire must be able to register and integrate future capabilities without redesigning the Information Fabric or the participant COP model.

The defining rule remains:

> Every authorized participant can be both a source and a consumer of information; services provide reusable capabilities; the Information Fabric connects them; and each participant's operational environment is dynamically composed from the services, information, relationships, geographic scope and policies applicable to that participant.
