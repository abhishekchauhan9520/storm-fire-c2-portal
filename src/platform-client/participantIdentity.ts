const DEFAULT_PARTICIPANT_ID = "operator-command";

/**
 * Transitional client identity resolver. Production identity must eventually
 * come from the authenticated session; until then the development client may
 * use an explicit Vite setting or URL participantId.
 */
export function getStormFireClientParticipantId(): string {
  const queryParticipant = new URLSearchParams(window.location.search).get("participantId")?.trim();
  if (queryParticipant) return queryParticipant;

  const configuredParticipant = import.meta.env.VITE_STORM_FIRE_PARTICIPANT_ID?.trim();
  if (configuredParticipant) return configuredParticipant;

  return DEFAULT_PARTICIPANT_ID;
}
