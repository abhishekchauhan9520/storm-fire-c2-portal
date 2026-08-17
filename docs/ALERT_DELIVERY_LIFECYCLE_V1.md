# Storm Fire Alert Delivery Lifecycle v1

This increment connects parallel workspace alert delivery to the shared alert lifecycle.

```text
CANONICAL ALERT
      ↓
PARALLEL DELIVERY
      ↓
WORKSPACE / SURFACES
      ↓
DELIVERY RECORD
      ↓
ACTIVE
  ↓ ACKNOWLEDGE
  ↓ ESCALATE
  ↓ RESOLVE / EXPIRE
```

The same alert ID is used to correlate delivery records with its lifecycle. A delivery records the workspace, participant, surfaces reached and delivery timestamp.

Lifecycle state remains shared for the alert, while delivery records remain scoped to each workspace. This preserves the distinction between what happened operationally and who/where received it.

No automatic operational action is triggered by acknowledgement, escalation or expiry.
