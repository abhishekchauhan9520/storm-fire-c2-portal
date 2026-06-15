export enum Role {
  COMMANDER = "COMMANDER",
  INTELLIGENCE_OFFICER = "INTELLIGENCE_OFFICER",
  FRONTLINE_OFFICER = "FRONTLINE_OFFICER"
}

export interface TacticalNode {
  id: string;
  name: string;
  type: "SATELLITE" | "EDGE_SERVER" | "AWACS" | "BASE" | "COMMS_SWITCHOVER";
  status: "ONLINE" | "JAMMED" | "OFFLINE";
  criticality: "CRITICAL" | "HIGH" | "MEDIUM";
  location: string;
}

export interface TacticalTrack {
  id: string;
  name: string;
  faction: "BLUE" | "RED" | "NEUTRAL";
  type: "INFANTRY" | "ARMOR" | "ARTILLERY" | "AIR" | "SATELLITE" | "AIR_DEFENSE" | "NAVAL" | "CYBER_ANOMALY" | "COMMS_HUB";
  x: number; // percentage coordinate 0 to 100 on battlefield map
  y: number; // percentage coordinate 0 to 100 on battlefield map
  status: "ACTIVE" | "ENGAGED" | "RETREAT" | "DESTRUCTED";
  speed: string;
  altitude?: string;
  health: number; // 0-100 indicating combat effectiveness
  coordinates: string; // MGRS/Grid Ref, e.g. "43Q KD 8532 9482"
  weapons?: string[];
  lastUpdated: string;
  sensorSource: string;
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

export enum KillChainState {
  FIND = "FIND",
  FIX = "FIX",
  TRACK = "TRACK",
  TARGET = "TARGET",
  ENGAGE = "ENGAGE",
  ASSESS = "ASSESS"
}

export interface AdviceMessage {
  id: string;
  role: "system" | "user" | "model";
  text: string;
  timestamp: string;
  isQuickPrompt?: boolean;
}

// DELTA COMMS: Element secure chat structures
export interface DeltaMessage {
  id: string;
  sender: string;
  role: "COMMAND" | "HQ" | "RECON_UNIT" | "AIR_PILOT" | "ARTILLERY_FIRE";
  text: string;
  timestamp: string;
  coordinates?: string; // Quick coordinate map reference pin
  encryptionStrength: string; // e.g. "AES-ASCON 256"
}

// DELTA SENSOR FUSION: Tube streams
export interface DeltaSensor {
  id: string;
  name: string;
  type: "RADAR_SAR" | "EO_THERMAL" | "ACOUSTIC_ARRAY" | "SATELLITE_SWEEP" | "SONAR_BUOY";
  status: "RECEIVING" | "DEGRADED" | "STANDBY" | "OFFLINE";
  location: string;
  strength: number; // Signal strength percentage 0-100
  recentDetectCount: number;
  feedUrl?: string; // Mock or visual URL placeholder description
  healthLog: string;
}

// DELTA DRONE WARFARE: Vezha UAV items
export interface DroneInventory {
  id: string;
  name: string;
  type: "RECON_UAV" | "FPV_ATTACK" | "LOITERING_MUNITION" | "SWARM_NODE";
  battery: number;
  ammoLoaded?: string;
  rangeKm: number;
  state: "STATIONARY" | "PATROL" | "ENGAGED" | "RETURNING";
  operator: string;
  latLong: string;
}

// DELTA KNOWLEDGE GRAPH: Sovereign-Style Entities
export interface FabricEntity {
  id: string;
  name: string;
  type: "HQ_BUNKER" | "MOBILE_SAM" | "SUPPLY_CONVOY" | "RADAR_TOWER" | "RECON_PATROL";
  confidence: number; // Entity resolution weight percentage (e.g. 98.4%)
  associatedTracks: string[]; // Track IDs
  lastInferred: string;
  connections: Array<{ targetId: string; relation: string }>;
}

