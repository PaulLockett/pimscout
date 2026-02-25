// RelationshipManager workflows — SCO-5
// Stub workflows for infrastructure validation.
// Temporal workflows run in a deterministic sandbox — no console, no I/O.

export async function founderIntakeWorkflow(
  founderId: string,
): Promise<string> {
  return `intake-pending-${founderId}`;
}

export async function scheduledTouchpointWorkflow(
  relationshipId: string,
): Promise<string> {
  return `touchpoint-pending-${relationshipId}`;
}

export async function reviewAndSendWorkflow(
  messageId: string,
): Promise<string> {
  return `send-pending-${messageId}`;
}
