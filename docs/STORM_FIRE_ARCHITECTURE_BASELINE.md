# Storm Fire Architecture Baseline — Information-Centric Iteration

## Core model

Storm Fire is an information-centric tactical command-and-control information environment. Hardware, screens, COP views, and individual services are not the architecture by themselves.

```text
Participants ↔ Information Fabric ↔ Services
      ↕                 ↕              ↕
 Relationships      Events/Alerts   Capabilities
      ↕                 ↕              ↕
 Applications / Workspaces / Displays
```

## Information Fabric

The Information Fabric is the common canonical boundary for operational information. It should preserve source identity, provenance, freshness, confidence, relationships, and lifecycle while allowing many authorized producers and consumers.

The current implementation already bridges existing operational objects and Service Fabric events into a canonical UI-side information boundary. This iteration extends that direction rather than creating a second data authority.

## Participant model

A participant is an authorized source and/or consumer of information. Participant identity is separate from application identity and formal organizational hierarchy.

A participant may:
- publish information;
- consume information;
- subscribe to events;
- participate in relationships;
- receive alerts;
- provide context to other participants.

## Relationship model

Storm Fire supports three information relationship axes:
- VERTICAL
- HORIZONTAL
- DIAGONAL

Relationships control permitted information interaction; they do not automatically imply command authority.

## Parallel Alert Fabric

An event can produce multiple authorized alert deliveries without serially routing the alert through one operator first. Alert routing remains policy-aware and auditable.

## Service Fabric

Services are capability providers/participants in the common information environment. A service contract declares capabilities, consumed information, produced information, relationship support, event participation, and parallel-alert support.

External capabilities such as an artillery C2 integration can therefore be represented as a service/adapter without becoming a competing Storm Fire information authority.

## Application and display model

The COP is one important workspace. Other workspaces may present GIS, UAV/ISR video, weather, logistics, intelligence, communications, or other authorized information. A command post can arrange these across multiple displays, while all views remain projections of shared information.

## Deliberate exclusions

Do not import features merely because they appear in earlier concept material. Exclude features that conflict with this baseline, duplicate canonical truth, hard-code rigid staff ownership, create autonomous weapons-control behavior, or exist only as decorative architecture.

## Engineering rule

Every new feature must identify the requirement it satisfies, the information it creates/consumes, the participants and relationships involved, the service or application boundary, the alert behavior if applicable, and the tests required to validate the information journey.
