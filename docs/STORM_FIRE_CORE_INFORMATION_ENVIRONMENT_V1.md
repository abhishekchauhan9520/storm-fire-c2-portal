# Storm Fire Core Information Environment v1

## Architectural principle

Storm Fire is a shared operational information environment, not a collection of isolated COP applications.

The command hierarchy represents organizational authority and responsibility. The Information Fabric represents the shared information environment. A participant's COP is a dynamically composed view of that environment based on the participant's assigned organization, services, information permissions, geographic scope, functional responsibilities, and active relationships.

## Command hierarchy

Storm Fire must support flexible, mixed task organizations rather than a fixed chain. A command may contain corps, divisions, brigades, regiments, independent formations, and support elements. A corps may contain multiple brigades, a division, or other subordinate/support elements. The data model must therefore represent arbitrary parent-child organizational relationships and one-to-many membership.

Example:

```text
THEATRE COMMAND
  └── NORTHERN COMMAND
       ├── CORPS A
       │    ├── BRIGADE A
       │    ├── BRIGADE B
       │    ├── BRIGADE C
       │    ├── DIVISION A
       │    └── SUPPORT ELEMENTS
       ├── DIVISION B
       │    ├── BRIGADE
       │    ├── REGIMENT
       │    └── SUPPORT ELEMENTS
       ├── INDEPENDENT BRIGADE
       ├── AIR DEFENCE
       ├── EW
       ├── UNMANNED SYSTEMS
       └── OTHER SUPPORTING ELEMENTS
```

This is an illustrative model, not a fixed order of battle.

## Common operational environment

All authorized participants operate against the same logical information environment. Storm Fire must not create a separate source-of-truth COP database for every echelon or service.

```text
                    COMMON INFORMATION ENVIRONMENT
                              │
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
      ORGANIZATIONS        SERVICES            SOURCES
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ↓
                       INFORMATION FABRIC
                              ↓
                    DYNAMIC COP / WORKSPACE
```

## Dynamic COP principle

A participant's COP is generated from what that participant is authorized and required to use. It is not a separate information universe.

Conceptually:

`COP = services + information + geographic scope + relationships + permissions + operational context`

A company commander and a division commander can therefore consume information from the same underlying environment while receiving different geographic scopes, services, functions, and levels of detail.

## Example access model

A division commander may receive a broad operational air picture covering the division's authorized area, while a brigade commander receives a narrower picture appropriate to the brigade's responsibility. Exact distances such as 80 km or 20 km are configuration examples, not hard-coded system constants.

Access must be multidimensional:

- organizational position
- assigned formation
- responsibility
- geographic scope
- information/service permissions
- functional capabilities
- security/access policy
- workspace permissions

## Source and consumer model

Every authorized participant can be both a source and a consumer.

```text
PARTICIPANT
  ├── CONSUME information
  ├── PRODUCE information
  ├── CORRELATE information
  ├── DISTRIBUTE information
  └── GENERATE alerts/events
```

A company can contribute information upward to its battalion, brigade, division, or higher headquarters while also sharing authorized information horizontally with peers and diagonally with functional organizations such as EW, air defence, ISR, or unmanned-system services.

## Vertical, horizontal, and diagonal relationships

Information relationships are independent from command authority:

- Vertical: higher/lower organizational or functional levels.
- Horizontal: peer organizations or services.
- Diagonal: cross-functional and/or cross-level relationships.

These relationships describe information connectivity and do not automatically grant command authority.

## Services

Services are reusable capabilities in the Service Fabric. A service is not an isolated application with its own operational truth.

Examples include:

- mapping/GIS
- UAV/UAS
- ISR
- air situational awareness
- EW situational awareness
- weather
- logistics
- intelligence
- communications
- artillery C2
- future specialist capabilities

A service can have many authorized consumers and can itself consume information from many sources. A participant's workspace is composed from the services and information capabilities available to that participant.

## Parallel information and alert propagation

An information event may have multiple authorized consumers simultaneously rather than being forced through a sequential reporting chain.

```text
                       EVENT
                         ↓
                INFORMATION FABRIC
                         ↓
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
      CORPS           BRIGADE         AIR DEFENCE
        ↓                ↓                ↓
     INTEL             UAV              EW
        ↓                ↓                ↓
     WORKSPACE        WORKSPACE        WORKSPACE
```

The same underlying event may be represented differently for different recipients according to access, scope, role, and service availability.

## Information environment construction

The environment should be understood as:

`organization + services + sources + access policy + geographic scope + functional relationships + information + alerts + workspace = participant operational environment`

This is the central Storm Fire organizational and staffing model.

## Architectural boundaries

The core model does not imply that every participant automatically sees every datum. Authorization, classification, mission need, geographic scope, service entitlements, and other policy constraints remain mandatory.

It also does not imply that the logical information environment is one physical network. Multiple transport networks, tactical links, radio systems, satellite links, enclaves, or disconnected environments may exist underneath the logical Information Fabric.

## SDLC implications

The following capabilities should be treated as foundational architecture before advanced routing is implemented:

1. Organizational graph with mixed formations and arbitrary subordinate relationships.
2. Participant identity and organizational assignment.
3. Service entitlement/capability model.
4. Geographic and functional access scope.
5. Information source/consumer model.
6. Vertical/horizontal/diagonal relationship model.
7. Dynamic workspace/COP composition.
8. Parallel event and alert distribution.
9. Provenance and delivery history.
10. Policy enforcement before multi-hop information routing.

The Service Relationship Fabric remains a component of this larger model rather than the complete architecture.
