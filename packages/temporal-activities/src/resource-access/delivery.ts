// DeliveryAccess — encapsulates delivery provider volatility (Resend today, SendGrid/SES tomorrow)
// Two business verbs: dispatch (deliver an approved message) and track (check delivery status)

import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { getDb, getRedis, messages } from "@pimscout/db";

// ─── Resend Client (lazy singleton) ─────────────────────────────────────────

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY environment variable is required");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// ─── Input / Output Types ───────────────────────────────────────────────────

export interface DispatchInput {
  messageId: string;
  from?: string;
}

export interface DispatchResult {
  resendId: string;
  messageId: string;
}

export interface TrackResult {
  messageId: string;
  resendId: string;
  status: "delivered" | "bounced" | "sent" | "opened";
  lastEventAt: string | null;
}

interface DeliveryRecord {
  resendId: string;
  sentAt: string;
  status: string;
}

// ─── Business Verbs ─────────────────────────────────────────────────────────

export async function dispatch(input: DispatchInput): Promise<DispatchResult> {
  const db = getDb();
  const redis = getRedis();

  // Guard: message must exist
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, input.messageId));

  if (!message) {
    throw new Error(`Message ${input.messageId} not found`);
  }

  // Guard: message must be approved
  if (message.status !== "approved") {
    throw new Error(
      `Message ${input.messageId} is "${message.status}", must be "approved" to dispatch`,
    );
  }

  // Read envelope from Redis (recipients, cc)
  const envelope = await redis.get<{ recipients: string[]; cc: string[] }>(
    `msg:${input.messageId}:envelope`,
  );

  if (!envelope || !envelope.recipients?.length) {
    throw new Error(`No envelope found for message ${input.messageId}`);
  }

  // All guards passed — now touch external service
  const resend = getResend();
  const from = input.from ?? "paul@pimandco.ai";
  const { data, error } = await resend.emails.send({
    from,
    to: envelope.recipients,
    cc: envelope.cc.length > 0 ? envelope.cc : undefined,
    subject: message.subject,
    html: message.body,
  });

  if (error || !data) {
    throw new Error(`Resend send failed: ${error?.message ?? "unknown error"}`);
  }

  // Store delivery metadata in Redis
  const deliveryRecord: DeliveryRecord = {
    resendId: data.id,
    sentAt: new Date().toISOString(),
    status: "sent",
  };
  await redis.set(`msg:${input.messageId}:delivery`, deliveryRecord);

  // Update message status to sent in Pg
  await db
    .update(messages)
    .set({ status: "sent", updatedAt: new Date() })
    .where(eq(messages.id, input.messageId));

  return { resendId: data.id, messageId: input.messageId };
}

export async function track(messageId: string): Promise<TrackResult> {
  const redis = getRedis();

  // Read delivery record from Redis
  const delivery = await redis.get<DeliveryRecord>(
    `msg:${messageId}:delivery`,
  );

  if (!delivery) {
    throw new Error(`No delivery record found for message ${messageId}`);
  }

  // Delivery record exists — now fetch from external service
  const resend = getResend();
  const { data, error } = await resend.emails.get(delivery.resendId);

  if (error || !data) {
    throw new Error(
      `Resend get failed: ${error?.message ?? "unknown error"}`,
    );
  }

  // Map Resend's last_event to our status
  const lastEvent = data.last_event;
  const status = (
    ["delivered", "bounced", "opened"].includes(lastEvent ?? "")
      ? lastEvent
      : "sent"
  ) as TrackResult["status"];

  return {
    messageId,
    resendId: delivery.resendId,
    status,
    lastEventAt: data.last_event ? new Date().toISOString() : null,
  };
}
