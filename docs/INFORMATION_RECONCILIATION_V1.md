# Storm Fire Information Reconciliation v1

The first reconciliation boundary for recovering local Information Fabric state after degraded or disconnected operation.

## Implemented

- Compare local canonical object versions with recorded history.
- Detect newer recorded versions.
- Select the newest recorded version deterministically.
- Return `NO_CHANGE` or `APPLY_LATEST`.
- Expose latest-record lookup and history-size inspection.

## Recovery flow

```text
LOCAL STATE
    |
    | reconnect
    v
RECORDED INFORMATION HISTORY
    |
    v
VERSION COMPARISON
    |
    +---- same/newer ----> NO CHANGE
    |
    +---- older ---------> APPLY LATEST
```

## Boundary

This increment calculates reconciliation decisions. It does not yet mutate remote nodes, perform distributed conflict resolution, or guarantee network delivery. Those belong to later durable/distributed synchronization stages.

## Next

- reconciliation integration tests
- durable synchronization cursor
- concurrent-update conflict policy
- idempotent replay
- reconnect orchestration
- delivery and synchronization metrics
