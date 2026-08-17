# Storm Fire Information-Centric SDLC

## Purpose

Storm Fire is developed as an information-centric operational software platform. The SDLC therefore validates the information environment, participants, relationships, services, alerts, applications, and display workspaces—not only source code.

## Architectural invariants

1. Every authorized participant can be both a source and a consumer of information/intelligence.
2. Information relationships may be vertical, horizontal, or diagonal and are not limited to formal hierarchy.
3. Multiple relevant alerts may be distributed in parallel to authorized consumers.
4. The Information Fabric is the shared canonical information environment.
5. The Service Fabric provides independently discoverable capabilities that participate in the common information environment.
6. The COP is a specialized application/workspace over shared information, not the entire operating environment.
7. Specialized applications and command-post displays are projections of shared state and must not create competing operational truths.
8. Identity, policy, authorization, provenance, audit, and information quality remain explicit.
9. Resilience, degraded connectivity, synchronization, reconciliation, and recovery are lifecycle concerns.
10. Human authority remains explicit; the platform is not an autonomous weapons-control layer.

## Lifecycle

### 0. Architectural invariants
Freeze the principles above and review proposed changes against them.

### 1. Operational requirements
Capture the operational purpose, information involved, sources, consumers, relationships, alert behavior, services, workspaces, security, performance, and validation criteria.

### 2. Information model
Define canonical objects, identity, provenance, timestamps, freshness, confidence, classification, relationships, lifecycle, and versioning before building competing application models.

### 3. Participant and relationship model
Define participants and their permitted vertical/horizontal/diagonal information relationships independently from command hierarchy.

### 4. Service model
Define each service's identity, capabilities, inputs, outputs, information objects, events, relationships, alerts, dependencies, lifecycle, policy, and health.

### 5. Information-flow and alert design
Design source → fabric → correlation/fusion → relationship resolution → authorized consumers → parallel alerts → applications/workspaces. Include normal, conflict, stale, disconnected, and recovery paths.

### 6. Application/workspace design
Build COP, GIS, UAV/ISR, weather, logistics, intelligence, communications, and other views as specialized projections and interaction surfaces over shared information.

### 7. Display/command-post design
Compose multiple workspaces across displays without hard-coding the information architecture to a fixed screen arrangement.

### 8. Implementation
Implement the Information Fabric, Relationship Fabric, Alert Fabric, Service Fabric, applications, and display capabilities incrementally with contract boundaries.

### 9. Integration
Verify service-to-fabric, participant-to-fabric, relationship routing, alert fan-out, application consumption, and workspace synchronization.

### 10. Information-centric verification
Test source/consumer duality, vertical/horizontal/diagonal relationships, provenance, freshness, conflict handling, parallel alert fan-out, authorization, degraded operation, synchronization, and reconciliation.

### 11. Security, resilience, performance
Measure identity/policy enforcement, information integrity, service health, propagation latency, alert latency, throughput, recovery, and synchronization.

### 12. Operational validation
Validate complete information journeys against the originating requirement and human/operator workflow.

### 13. Deployment
Promote validated builds with versioned service contracts, configuration, policies, workspaces, and rollback capability.

### 14. Operations and feedback
Monitor information flow, relationship health, alert delivery, service health, freshness, synchronization, errors, and security events. Feed operational findings back into requirements.

## Definition of Done

A major capability is complete only when its requirement traces to an architecture decision, canonical information model, implementation, integration path, information-centric tests, security/resilience/performance validation, and operational acceptance.
