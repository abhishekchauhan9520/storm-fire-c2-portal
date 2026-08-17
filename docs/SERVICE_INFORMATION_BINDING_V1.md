# Storm Fire Service ↔ Information Fabric v1

Registered services now have a formal binding to the shared Information Fabric.

```text
SERVICE MANIFEST
      ↓
SERVICE FABRIC
      ↓
ACTIVE SERVICE
      ↓
┌───────────────┬────────────────┐
│ PRODUCES      │ CONSUMES       │
│ canonical     │ authorized     │
│ information   │ information    │
└───────┬───────┴───────┬────────┘
        ↓               ↓
          INFORMATION FABRIC
                  ↓
       WORKSPACES / PARTICIPANTS
```

## Consumption

An active service can bind to the information types declared in its manifest. Delivery is recorded against the service's owner participant identity and uses the existing Information Fabric subscription boundary.

## Production

A service may record a canonical information record as produced when the record kind is declared in its manifest and the service is active. The service-specific implementation remains responsible for creating the canonical record; this layer only validates the declared production capability and records the participation event.

## Architectural principle

Services are participants in the same information environment. A service does not create a private information silo, private COP, or independent source-of-truth database.

This allows an Artillery C2, UAV, weather, logistics, ISR or future service to be added through the same contract while preserving the source/consumer model.

## Boundary

This increment does not implement remote plugin execution, service deployment, process supervision, service-to-service RPC, or automatic operational action. Those remain separate SDLC increments.
