import type { StormFireResolvedOperationalContext } from "./participantOperationalContext";

declare module "./participantOperationalContext" {
  interface StormFireResolvedOperationalContext {
    /** Compatibility alias for realtime/policy consumers during context convergence. */
    readonly informationRelationshipIds: StormFireResolvedOperationalContext["relationshipIds"];
  }
}
