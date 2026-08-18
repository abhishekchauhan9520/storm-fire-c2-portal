# Storm Fire C2 Portal

Storm Fire is a **Situational Awareness for Tactical Command and Control Personnel (SATCP)** platform. The software improves the information environment available to participants; it is not an autonomous command authority and does not make lethal or command decisions.

The repository is being incrementally migrated from the original React simulation into the Storm Fire information-centric platform architecture.

## Current implementation status

### Implemented / active

- Canonical platform contracts under `src/contracts/`
- Flexible Organization Graph
- Participant and Participant Context registries
- Canonical Service Fabric
- Canonical Information Fabric adapter
- Typed Event Spine with idempotent delivery
- Policy / Access Decision engine with default-deny behavior
- Dynamic COP projection boundary
- Logistics reference vertical with API, workflow, repository and persistence adapter boundaries
- Runtime composition root
- CI typecheck, tests and production build

### Transitional

- Express remains the current API/migration boundary.
- The existing React operator surface is being migrated incrementally; legacy UI projection types remain explicitly non-authoritative.
- In-memory stores are test/development adapters. Durable infrastructure is represented through repository/persistence boundaries and remains a deployment phase.

### Not claimed as complete

- Production identity provider / trust infrastructure
- Durable production database deployment
- Full Go service migration
- Complete migration of every legacy UI module
- Production-grade distributed messaging
- Full observability stack

## Architecture direction

```text
Operator Interfaces
        |
   API / Realtime
        |
+-----------------------------+
| Storm Fire Platform         |
|                             |
| Identity / Trust            |
| Organization Graph          |
| Participant Context         |
| Service Fabric              |
| Information Fabric          |
| Relationship / Geography   |
| Policy / Access Decision    |
| Event Spine                 |
| Persistence                 |
| Dynamic COP                 |
| Workspace Fabric            |
+-----------------------------+
        |
   Domain Services
        |
 Logistics / ISR-UAV / EW / Intelligence / ...
```

The Dynamic COP is a projection of shared platform state. React must not become the authoritative operational source of truth.

## First Run

Prerequisites:

- Node.js 22 or newer

Install:

```powershell
npm.cmd install
```

Create local environment configuration:

```powershell
Copy-Item .env.example .env.local
```

Run:

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:3000`.

## Validation

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Health endpoint:

```text
http://127.0.0.1:3000/api/health
```

Canonical platform endpoints include:

- `/api/participants`
- `/api/participant-context/:participantId`
- `/api/services`
- `/api/objects`
- `/api/events`
- `/api/alerts`
- `/api/cop/:participantId`
- `/api/access/decide`
- `/api/logistics/resources`
- `/api/logistics/requests`

## Repository structure

- `src/contracts/` — authoritative platform contracts
- `src/core/` — runtime composition
- `src/domain/` — domain and platform behavior
- `src/platform/` — platform boundaries such as Event Spine and persistence
- `src/service-fabric/` — canonical service and participant registries
- `src/services/logistics/` — first reference vertical slice
- `src/components/` — operator UI modules and transitional projections
- `docs/` — architecture and SDLC material
- `.github/workflows/` — CI validation

Documentation is expected to describe actual implementation status rather than planned capabilities as if they were already production services.
