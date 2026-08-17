# Storm Fire Information Subscriptions v1

## Purpose

Information subscriptions are the next step in making the Information Fabric an active shared information environment rather than only a canonical in-memory store.

A participant may subscribe to one or more canonical information kinds. Delivery is relationship-aware: a subscription does not bypass the Information Fabric's authorization/relationship checks.

## Flow

```text
Producer / Service
        |
        v
Canonical Information Record
        |
        v
Information Fabric
        |
        +--> provenance/version update
        |
        +--> relationship authorization
        |
        +--> subscription matching
        |
        +--> parallel delivery to eligible subscribers
```

## Contract

`subscribeParticipant(participantId, informationTypes, listener)` registers a local delivery listener.

The returned function removes the subscription.

A subscriber receives a record only when:

1. the participant has an active relationship or explicit authorized-consumer relationship for the record; and
2. the subscription includes the record's canonical information kind.

## Important boundary

This is a local runtime implementation for the current Storm Fire application. It is **not** yet a distributed message broker, durable subscription service, or network synchronization layer.

Those capabilities belong to later SDLC increments.

## SDLC validation targets

- source -> authorized consumer delivery
- multiple authorized consumers receiving the same record
- vertical relationship delivery
- horizontal relationship delivery
- diagonal relationship delivery
- rejected delivery when no eligible relationship exists
- unsubscribe behavior
- version and lineage preservation on updates
