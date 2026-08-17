# Storm Fire Service Fabric v1

The Service Fabric is the registration and capability-discovery layer for modular operational services.

```text
SERVICE
  ↓ registers manifest
SERVICE FABRIC
  ├── capability discovery
  ├── lifecycle state
  ├── information produced
  ├── information consumed
  └── display surfaces
          ↓
INFORMATION FABRIC ←→ SERVICE
          ↓
WORKSPACES / DISPLAY FABRIC
```

## Service manifest

Each service declares its stable ID, name/version, capabilities, information types produced and consumed, optional display surfaces, owner participant and lifecycle status.

## Example service model

An Artillery C2 service can be registered as a service that produces/consumes appropriate canonical information and exposes selected operational surfaces. UAV, weather, logistics, ISR and other future capabilities can use the same boundary.

The service is **not** a new independent information silo. Its operational information enters and leaves through the shared Information Fabric.

## Lifecycle

`REGISTERED → ACTIVE → PAUSED → OFFLINE`

The registry supports discovery of active producers and consumers for an information type.

## Architectural boundary

This version intentionally does not implement service-specific operational logic, remote plugin loading, process orchestration, authentication, deployment, or automatic command execution. Those are separate SDLC increments.
