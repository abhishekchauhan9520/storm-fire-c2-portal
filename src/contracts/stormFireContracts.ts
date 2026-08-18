/**
 * Storm Fire canonical contracts.
 * These are platform/domain contracts, not React view models.
 */
export type ContractVersion = number;
export type OrganizationKind = "THEATRE" | "COMMAND" | "CORPS" | "DIVISION" | "BRIGADE" | "REGIMENT" | "BATTALION" | "COMPANY" | "PLATOON" | "SQUAD" | "SPECIALIST" | "SUPPORT" | "OTHER";
export type OrganizationStatus = "ACTIVE" | "INACTIVE";
export type ParticipantKind = "OPERATOR" | "UNIT" | "SERVICE" | "SENSOR" | "SYSTEM" | "APPLICATION";
export type ParticipantStatus = "ONLINE" | "DEGRADED" | "OFFLINE";
export type ServiceStatus = "REGISTERED" | "ACTIVE" | "PAUSED" | "OFFLINE";
export type InformationKind = "OBJECT" | "EVENT";
export type InformationQuality = "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH";
export type InformationClassification = "PUBLIC" | "CONTROLLED" | "RESTRICTED" | "MISSION";
export type RelationshipDirection = "VERTICAL" | "HORIZONTAL" | "DIAGONAL";
export type PolicyEffect = "ALLOW" | "DENY" | "FILTER" | "TRANSFORM";
export type AccessDecisionEffect = "ALLOW" | "DENY" | "FILTER" | "TRANSFORM";

export interface GeographicScope { id: string; label?: string; center?: { lat: number; lon: number }; radiusKm?: number; polygon?: Array<{ lat: number; lon: number }>; }
export interface OrganizationNode { id: string; name: string; kind: OrganizationKind; status: OrganizationStatus; parentIds: string[]; childIds: string[]; relationshipIds: string[]; areaOfResponsibilityIds: string[]; serviceIds: string[]; metadata?: Record<string, string>; }
export interface OrganizationRelationship { id: string; fromOrganizationId: string; toOrganizationId: string; kind: "COMMAND" | "SUPPORT" | "COORDINATION" | "ATTACHMENT" | "LIAISON" | "INFORMATION" | "GEOGRAPHIC" | "FUNCTIONAL"; enabled: boolean; }
export interface Participant { id: string; name: string; kind: ParticipantKind; status: ParticipantStatus; canProduce: boolean; canConsume: boolean; enabled: boolean; organizationIds: string[]; roleIds: string[]; serviceIds: string[]; geographicScopeIds: string[]; informationRelationshipIds: string[]; workspaceIds: string[]; metadata?: Record<string, string>; }
export interface ParticipantContext { participantId: string; organizationIds: string[]; roleIds: string[]; serviceIds: string[]; geographicScopeIds: string[]; informationRelationshipIds: string[]; subscriptionIds: string[]; workspaceIds: string[]; policyIds: string[]; classification?: InformationClassification; resolvedAt: string; }
export interface ServiceCapability { id: string; name: string; description?: string; }
export interface Service { id: string; name: string; version: string; description?: string; capabilities: ServiceCapability[]; informationTypesProduced: string[]; informationTypesConsumed: string[]; displaySurfaceIds: string[]; dependencyServiceIds: string[]; ownerParticipantId: string; status: ServiceStatus; }
export interface InformationRelationship { id: string; fromParticipantId: string; toParticipantId: string; direction: RelationshipDirection; allowedInformationTypes: string[]; enabled: boolean; relationshipType?: string; createdAt?: string; createdByParticipantId?: string; }
export interface Provenance { sourceId: string; producerId?: string; observedAt: string; receivedAt: string; confidence?: number; quality?: InformationQuality; lineageIds?: string[]; }
export interface InformationObject<T = unknown> { id: string; kind: InformationKind; type: string; schemaVersion: ContractVersion; version: number; occurredAt: string; producerServiceId?: string; producerParticipantId?: string; correlationId?: string; causationId?: string; classification: InformationClassification; geographicScopeIds: string[]; provenance: Provenance; payload: T; tags?: string[]; }
export interface EventMetadata { eventId: string; eventType: string; schemaVersion: ContractVersion; source: string; producer: string; timestamp: string; correlationId?: string; causationId?: string; provenance: Provenance; classification: InformationClassification; geographicScopeIds: string[]; }
export interface Event<T = unknown> { metadata: EventMetadata; payload: T; }
export interface Policy { id: string; version: ContractVersion; effect: PolicyEffect; participantIds?: string[]; organizationIds?: string[]; roleIds?: string[]; relationshipIds?: string[]; serviceIds?: string[]; informationTypes?: string[]; geographicScopeIds?: string[]; classifications?: InformationClassification[]; priority: number; enabled: boolean; }
export interface AccessDecision { requestId: string; effect: AccessDecisionEffect; participantId: string; informationType: string; matchedPolicyIds: string[]; reason: string; decidedAt: string; filteredFields?: string[]; }
export interface InformationSubscription { id: string; participantId: string; serviceId?: string; informationTypes: string[]; geographicScopeIds?: string[]; enabled: boolean; }
export interface Alert { id: string; objectId?: string; type: string; severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL"; state: "OPEN" | "ACKNOWLEDGED" | "RESOLVED"; createdAt: string; updatedAt: string; sourceParticipantId: string; recipientParticipantIds: string[]; geographicScopeIds: string[]; classification: InformationClassification; provenance: Provenance; }
export interface Workspace { id: string; name: string; participantId: string; domainScope: string[]; subscriptionIds: string[]; }
export interface COPContext { participantContext: ParticipantContext; objectIds: string[]; alertIds: string[]; serviceIds: string[]; generatedAt: string; sourceEventSequence?: number; }
