export function bindAuthenticatedRequester<T extends Record<string, unknown>>(body: T, participantId: string): T & { requesterParticipantId: string } {
  return { ...body, requesterParticipantId: participantId };
}
