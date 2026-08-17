# Storm Fire Information Fabric v2

## Purpose

Information Fabric is the shared canonical information boundary for Storm Fire. It is not a replacement for the COP and it is not a single UI. It allows authorized participants and services to produce and consume canonical information while preserving source, provenance, relationships, freshness and version history.

## Core invariants

- Every participant may be both a source and a consumer.
- Information relationships may be vertical, horizontal or diagonal.
- Applications are projections over canonical information; they do not create competing operational truths.
- Multiple relevant alerts may be distributed in parallel.
- Source/provenance must remain visible through the information lifecycle.
- Information may become stale and must not silently appear current.
- Service integrations enter through canonical contracts rather than private operational object models.

## v2 capabilities implemented

### Canonical records

Canonical records now carry:

- stable identifier
- information kind
- source
- observation time
- payload
- relationships
- provenance
- confidence
- classification metadata
- lineage
- version
- optional expiry

### Query boundary

The Information Fabric exposes filtered queries by kind, source and authorized consumer. Stale records are excluded by default when an expiry is present.

### Relationship-aware access

Consumer eligibility can be resolved through explicit authorized-consumer relationships or through enabled Storm Fire information relationships. This is the first implementation step toward making vertical/horizontal/diagonal relationships affect actual information routing rather than merely being displayed.

### Parallel alert routing

The Parallel Alert Fabric can resolve recipients from information relationships and distribute one alert event to multiple enabled participants. Explicit recipient lists remain supported for controlled workflows.

## Current limitation

This is still an application-side foundation. It is not yet a distributed production event bus, persistent event store, classification enforcement engine, or network synchronization implementation. Those are subsequent SDLC increments and must not be simulated as complete capabilities.

## Next increments

1. Persistent canonical information store.
2. Subscription model.
3. Relationship-aware information fan-out.
4. Provenance/lineage inspection UI.
5. Stale/reconnect/reconciliation lifecycle.
6. Information Fabric integration tests.
7. Workspace/Display Fabric integration.
