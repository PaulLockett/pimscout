import { eq, and, inArray } from "drizzle-orm";
import { getDb, getRedis, messages } from "@pimscout/db";
import type { MessageStatus } from "@pimscout/schemas";

// ─── Input / Output Types ───────────────────────────────────────────────────

export interface DraftInput {
  relationshipId: string;
  type: string;
  personalizationLevel: string;
  subject: string;
  body: string;
  recipients: string[];
  cc: string[];
  generationContext?: Record<string, unknown>;
}

export interface RetrieveMessagesOptions {
  relationshipId: string;
  status?: MessageStatus;
}

export interface HydratedMessage {
  id: string;
  relationshipId: string;
  type: string;
  status: string;
  personalizationLevel: string;
  subject: string;
  body: string;
  recipients: string[];
  cc: string[];
  generationContext: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Business Verbs ─────────────────────────────────────────────────────────

export async function draft(input: DraftInput): Promise<string> {
  const db = getDb();
  const redis = getRedis();

  const [message] = await db
    .insert(messages)
    .values({
      relationshipId: input.relationshipId,
      type: input.type as (typeof messages.type.enumValues)[number],
      status: "drafted",
      personalizationLevel:
        input.personalizationLevel as (typeof messages.personalizationLevel.enumValues)[number],
      subject: input.subject,
      body: input.body,
    })
    .returning();

  await redis.set(`msg:${message.id}:envelope`, {
    recipients: input.recipients,
    cc: input.cc,
  });

  if (input.generationContext) {
    await redis.set(`msg:${message.id}:context`, input.generationContext);
  }

  return message.id;
}

export async function approve(
  messageIds: string | string[],
): Promise<void> {
  const db = getDb();
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds];

  await db
    .update(messages)
    .set({ status: "approved", updatedAt: new Date() })
    .where(inArray(messages.id, ids));
}

export async function dispatch(messageId: string): Promise<void> {
  const db = getDb();

  await db
    .update(messages)
    .set({ status: "sent", updatedAt: new Date() })
    .where(eq(messages.id, messageId));
}

export async function retrieveMessages(
  options: RetrieveMessagesOptions,
): Promise<HydratedMessage[]> {
  const db = getDb();
  const redis = getRedis();

  const conditions = [eq(messages.relationshipId, options.relationshipId)];
  if (options.status) {
    conditions.push(
      eq(
        messages.status,
        options.status as (typeof messages.status.enumValues)[number],
      ),
    );
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions));

  if (rows.length === 0) return [];

  // Batch fetch Redis data for all messages
  const pipeline = redis.pipeline();
  for (const row of rows) {
    pipeline.get(`msg:${row.id}:envelope`);
    pipeline.get(`msg:${row.id}:context`);
  }
  const redisResults = await pipeline.exec();

  return rows.map((row, i) => {
    const envelope = (redisResults[i * 2] as {
      recipients: string[];
      cc: string[];
    }) ?? { recipients: [], cc: [] };
    const context = (redisResults[i * 2 + 1] as Record<string, unknown>) ?? null;

    return {
      id: row.id,
      relationshipId: row.relationshipId,
      type: row.type,
      status: row.status,
      personalizationLevel: row.personalizationLevel,
      subject: row.subject,
      body: row.body,
      recipients: envelope.recipients,
      cc: envelope.cc,
      generationContext: context,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}
