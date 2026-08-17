# Storm Fire Organizational Graph & Participant Model v1

## Purpose

This model is the next foundation for the Storm Fire Information Fabric. It represents real-world mixed task organizations without assuming a fixed order of battle, while keeping command hierarchy separate from information connectivity.

## Core objects

### OrganizationNode

Represents any command, formation, unit, support element, specialist organization, or other organizational participant.

Required concepts:

- stable identifier
- display name
- organization type
- parent relationship(s)
- child relationships
- status
- area of responsibility/reference geography
- assigned services/capabilities

The model must support one-to-many relationships and mixed structures.

### Participant

Represents a person, team, workstation, operational cell, or service actor operating in Storm Fire.

A participant may be associated with an organization but is not itself limited to that organization's hierarchy for information consumption.

Required concepts:

- stable identifier
- participant type
- organization assignment
- roles/capabilities
- service entitlements
- geographic scope
- information-access policy references
- workspace assignment

### ServiceCapability

Represents a reusable Storm Fire capability exposed through the Service Fabric.

Examples include mapping/GIS, UAV/ISR, air situational awareness, EW situational awareness, weather, logistics, intelligence, communications, and future specialist C2 services.

A service can have many authorized consumers and can consume information from many sources.

### InformationRelationship

Represents an authorized information relationship between participants, organizations, services, or other information actors.

Relationship types:

- VERTICAL
- HORIZONTAL
- DIAGONAL

The relationship is informational. It does not itself grant command authority.

## Command hierarchy versus information graph

Command hierarchy:

```text
THEATRE COMMAND
  └── COMMAND
       ├── CORPS
       │    ├── BRIGADE
       │    ├── BRIGADE
       │    ├── DIVISION
       │    └── SUPPORT
       ├── DIVISION
       │    ├── BRIGADE
       │    ├── REGIMENT
       │    └── SUPPORT
       ├── INDEPENDENT BRIGADE
       ├── AIR DEFENCE
       ├── EW
       └── OTHER ELEMENTS
```

Information graph:

```text
             INFORMATION FABRIC
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
    VERTICAL       HORIZONTAL      DIAGONAL
       │              │              │
    Corps↔Div       Bde↔Bde       Bde↔EW
    Div↔Bde         Co↔Co         Co↔UAV
    Bde↔Bn          Unit↔Unit      Div↔Air Defence
```

The two graphs overlap but are not identical.

## Dynamic participant environment

A participant's operational environment is composed from:

`organization + role + services + information permissions + geographic scope + relationships + operational context`

A COP is therefore a generated view, not an independent operational database.

## Access scope

Access is multidimensional rather than role-only. A policy may combine:

- organizational responsibility
- functional responsibility
- geographic scope
- service entitlement
- information sensitivity/access level
- relationship permissions
- workspace permissions
- mission/context constraints

Geographic ranges must be configurable and must never be hard-coded as universal echelon values.

## Source/consumer symmetry

Every authorized participant may publish information and consume information. The model must not encode an assumption that lower echelons only report upward or that specialist services only provide data.

```text
PARTICIPANT
  ↕ publish
  ↕ consume
  ↕ correlate
  ↕ redistribute
  ↕ alert
```

## Parallel distribution

When an event is published, the Information Fabric can resolve multiple authorized recipients in parallel. Recipients can include command-hierarchy peers/superiors/subordinates and cross-functional participants.

Delivery must preserve authorization, provenance, event identity, and delivery/acknowledgement state.

## Implementation sequence

1. Define canonical OrganizationNode and Participant contracts.
2. Define service entitlement contracts.
3. Define geographic scope and policy references.
4. Integrate InformationRelationship with the organizational graph.
5. Build authorization-aware participant context resolution.
6. Build dynamic COP/workspace composition from that context.
7. Build parallel event/alert fan-out.
8. Add multi-hop routing only after authorization and provenance are enforced.

## Non-goals of this increment

This model does not hard-code a real-world order of battle, create automatic command authority, or implement automatic unrestricted information sharing. It is the structural foundation for those capabilities to be implemented with explicit policy controls.
