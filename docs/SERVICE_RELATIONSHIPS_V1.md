# Storm Fire Flexible Service Relationships v1

The Service Fabric now supports explicit information relationships between services.

```text
                 INFORMATION FABRIC
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    SERVICE A  ←────→ SERVICE B ←────→ SERVICE C
        │                │                │
        └────────────── SERVICE D ─────────┘
```

## Relationship directions

- **VERTICAL** — information relationship between services at different organizational or functional levels.
- **HORIZONTAL** — peer-to-peer information relationship.
- **DIAGONAL** — cross-functional or cross-level information relationship.

These labels describe information relationships only. They do not create command authority or a mandatory hierarchy.

## Relationship contract

A relationship declares the source service, target service, information types, direction, lifecycle status, and timestamps.

Lifecycle: `PROPOSED → ACTIVE → SUSPENDED → ACTIVE → CLOSED`. A closed relationship is terminal.

## Storm Fire principle

This represents the flexible connectivity model: information can move between participants/services through multiple organizational paths rather than being restricted to a fixed vertical chain.

The Information Fabric remains the common information environment. The relationship layer describes service relationships; it does not create a second transport or data store.

## Example

A future Artillery C2 service could have a horizontal relationship with a UAV service for target-related information, a diagonal relationship with a weather service for environmental information, and a vertical relationship with another service representing a higher/lower operational layer. These are information relationships, not automatic command links.

## Boundary

This version records and discovers relationships. It does not yet execute multi-hop routing, automatically create relationships, or bypass Information Fabric authorization.
