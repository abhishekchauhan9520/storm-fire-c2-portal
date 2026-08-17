# Storm Fire Alert Lifecycle v1

Alert distribution now has an explicit human-controlled lifecycle.

```text
ACTIVE
  ├── ACKNOWLEDGED
  ├── ESCALATED
  ├── EXPIRED
  └── RESOLVED
```

An acknowledged alert may be escalated or resolved. An escalated alert may be acknowledged or resolved. Expired and resolved alerts are terminal.

## Purpose

The lifecycle separates information distribution from human attention state. An alert can be delivered to multiple authorized participants and surfaces while each participant's acknowledgement remains attributable.

## Recorded metadata

- alert ID
- lifecycle state
- creation/update time
- acknowledgement actor/time
- escalation time
- expiry time
- resolution actor/time
- transition history

## Architectural boundary

The lifecycle manager records human attention and state transitions. It does not issue operational commands, authorize actions, control weapons, or automatically escalate a military action.

This preserves Storm Fire's core model: parallel information distribution with human assessment and accountability.
