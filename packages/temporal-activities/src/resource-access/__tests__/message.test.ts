import { describe, it, expect, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  getDb,
  getRedis,
  founders,
  scouts,
  relationships,
  messages,
  founderChanges,
  relationshipChanges,
} from "@pimscout/db";
import { draft, approve, dispatch, retrieveMessages } from "../message.js";

const TEST_PREFIX = `test-msg-${Date.now()}`;
const testEmail = (n: number) => `${TEST_PREFIX}-founder-${n}@test.pimscout.dev`;
const scoutEmail = `${TEST_PREFIX}-scout@test.pimscout.dev`;

// Track IDs for cleanup
const createdMessageIds: string[] = [];
let scoutId: string;
let founderId: string;
let relationshipId: string;

async function ensureFixtures(): Promise<string> {
  if (relationshipId) return relationshipId;

  const db = getDb();

  const [scout] = await db
    .insert(scouts)
    .values({ name: "Msg Test Scout", email: scoutEmail })
    .returning();
  scoutId = scout.id;

  const [founder] = await db
    .insert(founders)
    .values({
      name: "Msg Test Founder",
      email: testEmail(1),
      companyName: "MsgCo",
      source: "generator",
    })
    .returning();
  founderId = founder.id;

  const [rel] = await db
    .insert(relationships)
    .values({ scoutId: scout.id, founderId: founder.id })
    .returning();
  relationshipId = rel.id;

  return relationshipId;
}

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  // Clean up Redis keys for messages
  for (const msgId of createdMessageIds) {
    await redis.del(`msg:${msgId}:envelope`);
    await redis.del(`msg:${msgId}:context`);
  }

  // Delete in reverse FK order
  for (const msgId of createdMessageIds) {
    await db.delete(messages).where(eq(messages.id, msgId));
  }
  if (relationshipId) {
    await db.delete(relationshipChanges).where(eq(relationshipChanges.relationshipId, relationshipId));
    await db.delete(relationships).where(eq(relationships.id, relationshipId));
  }
  if (founderId) {
    await db.delete(founderChanges).where(eq(founderChanges.founderId, founderId));
    await db.delete(founders).where(eq(founders.id, founderId));
  }
  if (scoutId) {
    await db.delete(scouts).where(eq(scouts.id, scoutId));
  }
});

describe("MessageAccess", () => {
  describe("draft", () => {
    it("creates message in Pg (status drafted), envelope + context in Redis", async () => {
      const relId = await ensureFixtures();

      const msgId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Intro to Boardy",
        body: "Hi, meet Boardy!",
        recipients: ["founder@example.com"],
        cc: ["boardy@boardy.ai"],
        generationContext: { templateId: "boardy-intro-v1" },
      });

      createdMessageIds.push(msgId);
      expect(msgId).toBeTruthy();

      // Verify Pg
      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("drafted");
      expect(msg.type).toBe("boardy-intro");
      expect(msg.subject).toBe("Intro to Boardy");

      // Verify Redis envelope
      const redis = getRedis();
      const envelope = await redis.get<{ recipients: string[]; cc: string[] }>(`msg:${msgId}:envelope`);
      expect(envelope).toBeTruthy();
      expect(envelope!.recipients).toEqual(["founder@example.com"]);
      expect(envelope!.cc).toEqual(["boardy@boardy.ai"]);

      // Verify Redis context
      const context = await redis.get<Record<string, unknown>>(`msg:${msgId}:context`);
      expect(context).toBeTruthy();
      expect(context!.templateId).toBe("boardy-intro-v1");
    });

    it("works without generationContext — context key not set", async () => {
      const relId = await ensureFixtures();

      const msgId = await draft({
        relationshipId: relId,
        type: "follow-up",
        personalizationLevel: "light-ai",
        subject: "Following up",
        body: "Just checking in",
        recipients: ["founder@example.com"],
        cc: [],
      });

      createdMessageIds.push(msgId);

      const redis = getRedis();
      const context = await redis.get(`msg:${msgId}:context`);
      expect(context).toBeNull();
    });
  });

  describe("approve", () => {
    it("approves a single message", async () => {
      const relId = await ensureFixtures();

      const msgId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Approval Test",
        body: "Test body",
        recipients: ["test@example.com"],
        cc: [],
      });
      createdMessageIds.push(msgId);

      await approve(msgId);

      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("approved");
    });

    it("approves a batch of messages", async () => {
      const relId = await ensureFixtures();

      const id1 = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Batch 1",
        body: "Body 1",
        recipients: ["a@example.com"],
        cc: [],
      });
      const id2 = await draft({
        relationshipId: relId,
        type: "follow-up",
        personalizationLevel: "template",
        subject: "Batch 2",
        body: "Body 2",
        recipients: ["b@example.com"],
        cc: [],
      });
      createdMessageIds.push(id1, id2);

      await approve([id1, id2]);

      const db = getDb();
      const [msg1] = await db.select().from(messages).where(eq(messages.id, id1));
      const [msg2] = await db.select().from(messages).where(eq(messages.id, id2));
      expect(msg1.status).toBe("approved");
      expect(msg2.status).toBe("approved");
    });
  });

  describe("dispatch", () => {
    it("marks message as sent", async () => {
      const relId = await ensureFixtures();

      const msgId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Dispatch Test",
        body: "Sending...",
        recipients: ["test@example.com"],
        cc: [],
      });
      createdMessageIds.push(msgId);

      await approve(msgId);
      await dispatch(msgId);

      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("sent");
    });
  });

  describe("retrieveMessages", () => {
    it("returns all messages for relationship with Redis data merged", async () => {
      const relId = await ensureFixtures();

      const msgId = await draft({
        relationshipId: relId,
        type: "check-in",
        personalizationLevel: "full-ai",
        subject: "Retrieve Test",
        body: "Checking...",
        recipients: ["r@example.com"],
        cc: ["cc@example.com"],
        generationContext: { model: "gpt-4" },
      });
      createdMessageIds.push(msgId);

      const results = await retrieveMessages({ relationshipId: relId });
      expect(results.length).toBeGreaterThanOrEqual(1);

      const found = results.find((m) => m.id === msgId);
      expect(found).toBeTruthy();
      expect(found!.recipients).toEqual(["r@example.com"]);
      expect(found!.cc).toEqual(["cc@example.com"]);
      expect(found!.generationContext).toEqual({ model: "gpt-4" });
    });

    it("filters by status", async () => {
      const relId = await ensureFixtures();

      const draftedId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Filter Drafted",
        body: "...",
        recipients: ["f@example.com"],
        cc: [],
      });
      const approvedId = await draft({
        relationshipId: relId,
        type: "follow-up",
        personalizationLevel: "template",
        subject: "Filter Approved",
        body: "...",
        recipients: ["g@example.com"],
        cc: [],
      });
      createdMessageIds.push(draftedId, approvedId);
      await approve(approvedId);

      const drafted = await retrieveMessages({ relationshipId: relId, status: "drafted" });
      const approved = await retrieveMessages({ relationshipId: relId, status: "approved" });

      expect(drafted.every((m) => m.status === "drafted")).toBe(true);
      expect(approved.every((m) => m.status === "approved")).toBe(true);
      expect(drafted.find((m) => m.id === draftedId)).toBeTruthy();
      expect(approved.find((m) => m.id === approvedId)).toBeTruthy();
    });

    it("returns empty array for no matches", async () => {
      const results = await retrieveMessages({
        relationshipId: "00000000-0000-0000-0000-000000000000",
      });
      expect(results).toEqual([]);
    });
  });
});
