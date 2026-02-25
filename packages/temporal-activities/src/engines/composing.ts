// ComposingEngine activities — SCO-7
// Stub activities for infrastructure validation

export async function compose(
  founderId: string,
  _messageType: string,
): Promise<string> {
  console.log(`compose not yet implemented — see SCO-7. founderId: ${founderId}`);
  return `draft-pending-${founderId}`;
}

export async function selectTemplate(
  _stage: string,
  _messageType: string,
): Promise<string> {
  console.log("selectTemplate not yet implemented — see SCO-7");
  return "default-template";
}
