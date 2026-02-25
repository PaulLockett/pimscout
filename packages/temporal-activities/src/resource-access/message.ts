// MessageAccess activities — SCO-6
// Stub activities for infrastructure validation

export async function draft(
  relationshipId: string,
  _content: unknown,
): Promise<string> {
  console.log(
    `MessageAccess.draft not yet implemented — see SCO-6. relationshipId: ${relationshipId}`,
  );
  return `message-drafted-${relationshipId}`;
}

export async function approve(messageId: string): Promise<void> {
  console.log(
    `MessageAccess.approve not yet implemented — see SCO-6. messageId: ${messageId}`,
  );
}

export async function dispatch(messageId: string): Promise<void> {
  console.log(
    `MessageAccess.dispatch not yet implemented — see SCO-6. messageId: ${messageId}`,
  );
}

export async function retrieveMessages(
  relationshipId: string,
): Promise<unknown[]> {
  console.log(
    `MessageAccess.retrieve not yet implemented — see SCO-6. relationshipId: ${relationshipId}`,
  );
  return [];
}
