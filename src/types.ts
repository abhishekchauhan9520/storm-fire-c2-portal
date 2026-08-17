// Canonical platform contracts are authoritative. UI modules may import them from
// this compatibility barrel, but should prefer ../contracts/stormFireContracts.
export type {
  AccessDecision,
  Alert,
  ContractVersion,
  COPContext,
  Event,
  EventMetadata,
  GeographicScope,
  InformationClassification,
  InformationObject,
  InformationRelationship,
  InformationSubscription,
  OrganizationKind,
  OrganizationNode,
  OrganizationRelationship,
  OrganizationStatus,
  Participant,
  ParticipantContext,
  ParticipantKind,
  ParticipantStatus,
  Policy,
  PolicyEffect,
  Provenance,
  Service,
  ServiceCapability,
  ServiceStatus,
  Workspace,
} from "./contracts/stormFireContracts";

// UI projection/view-model types. These are deliberately not authoritative
// operational state and should be derived from platform contracts/projections.
export type Domain = "LAND" | "AIR" | "MARITIME" | "SPACE" | "CYBER" | "EW" | "LOGISTICS" | "JOINT";

export interface CanonicalOperationalObject {
  id: string;
  kind: string;
  version: number;
  timestamp: string;
  sourceParticipantId: string;
  domains: Domain[];
  classification: "PUBLIC" | "CONTROLLED" | "RESTRICTED" | "MISSION";
  confidence: number;
  geometry?: { lat: number; lon: number; altitude?: number };
  attributes: Record<string, unknown>;
}

export interface OperationalAlert {
  id: string;
  objectId: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  state: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  recipients: string[];
}

export interface InformationEvent {
  id: string;
  type: string;
  occurredAt: string;
  participantId: string;
  sequence: number;
  payload: Record<string, unknown>;
}

export enum Role {
  COMMANDER = "COMMANDER",
  INTELLIGENCE_OFFICER = "INTELLIGENCE_OFFICER",
  FRONTLINE_OFFICER = "FRONTLINE_OFFICER",
}

export enum KillChainState {
  FIND = "FIND",
  FIX = "FIX",
  TRACK = "TRACK",
  TARGET = "TARGET",
  ENGAGE = "ENGAGE",
  ASSESS = "ASSESS",
}

export interface TacticalTrack {
  id: string;
  name: string;
  faction: "BLUE" | "RED" | "NEUTRAL";
  type: "INFANTRY" | "ARMOR" | "ARTILLERY" | "AIR" | "SATELLITE" | "AIR_DEFENSE" | "NAVAL" | "CYBER_ANOMALY" | "COMMS_HUB";
  x: number;
  y: number;
  status: "ACTIVE" | "ENGAGED" | "RETREAT" | "DESTRUCTED";
  speed: string;
  altitude?: string;
  health: number;
  coordinates: string;
  weapons?: string[];
  lastUpdated: string;
  sensorSource: string;
}

export interface TacticalNode {
  id: string;
  name: string;
  type: "SATELLITE" | "EDGE_SERVER" | "AWACS" | "BASE" | "COMMS_SWITCHOVER";
  status: "ONLINE" | "JAMMED" | "OFFLINE";
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  location: string;
}

export interface CommandSystem {
  id: string;
  name: string;
  acronym: string;
  branch: "ARMY" | "AIR_FORCE" | "NAVY" | "TRI_SERVICE" | "SPACE_ISR" | "CYBER_EW" | "LOGISTICS";
  status: "INTEGRATED" | "STANDBY" | "COGNITIVE_DEGRADED" | "OFFLINE";
  description: string;
  activeOverlay: boolean;
}

export interface CombatPowerIndex {
  id: string;
  name: string;
  unit: string;
  health: number;
  ammo: number;
  fuel: number;
  personnel: number;
  status: "OPERATIONAL" | "WARNING" | "CRITICAL";
}

export interface TacticalLog {
  id: string;
  timestamp: string;
  source: string;
  type: "ALERT" | "INFO" | "SUCCESS" | "WARNING";
  message: string;
}

export interface AdviceMessage {
  id: string;
  role: "system" | "user" | "model";
  text: string;
  timestamp: string;
  isQuickPrompt?: boolean;
}

// Transitional UI-only compatibility records. They are not platform contracts.
export interface DeltaMessage { id: string; sender: string; role: string; text: string; timestamp: string; coordinates?: string; encryptionStrength: string; }
export interface DeltaSensor { id: string; name: string; type: string; status: string; location: string; strength: number; recentDetectCount: number; feedUrl?: string; healthLog: string; }
export interface DroneInventory { id: string; name: string; type: string; battery: number; ammoLoaded?: string; rangeKm: number; state: string; operator: string; latLong: string; }
export interface FabricEntity { id: string; name: string; type: string; confidence: number; associatedTracks: string[]; lastInferred: string; connections: Array<{ targetId: string; relation: string }>; }
