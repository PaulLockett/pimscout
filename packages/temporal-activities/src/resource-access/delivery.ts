// DeliveryAccess activities — SCO-8
// Stub activities for infrastructure validation

export async function send(
  messageId: string,
  _payload: unknown,
): Promise<string> {
  console.log(
    `DeliveryAccess.send not yet implemented — see SCO-8. messageId: ${messageId}`,
  );
  return `delivery-pending-${messageId}`;
}

export async function track(deliveryId: string): Promise<string> {
  console.log(
    `DeliveryAccess.track not yet implemented — see SCO-8. deliveryId: ${deliveryId}`,
  );
  return "unknown";
}

export async function verifyDelivery(deliveryId: string): Promise<boolean> {
  console.log(
    `DeliveryAccess.verifyDelivery not yet implemented — see SCO-8. deliveryId: ${deliveryId}`,
  );
  return false;
}
