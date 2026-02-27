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
import { draft, approve } from "../message.js";
import { dispatch, track } from "../delivery.js";

const TEST_PREFIX = `test-dlv-${Date.now()}`;
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
    .values({ name: "Delivery Test Scout", email: scoutEmail })
    .returning();
  scoutId = scout.id;

  const [founder] = await db
    .insert(founders)
    .values({
      name: "Delivery Test Founder",
      email: testEmail(1),
      companyName: "DeliveryCo",
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

/** Create an approved message ready for dispatch */
async function createApprovedMessage(overrides?: { cc?: string[] }): Promise<string> {
  const relId = await ensureFixtures();

  const msgId = await draft({
    relationshipId: relId,
    type: "boardy-intro",
    personalizationLevel: "template",
    subject: "Test Delivery Subject",
    body: "<p>Hello from DeliveryAccess tests</p>",
    recipients: ["delivered@resend.dev"],
    cc: overrides?.cc ?? [],
  });
  createdMessageIds.push(msgId);

  await approve(msgId);
  return msgId;
}

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  // Clean up Redis keys for messages
  for (const msgId of createdMessageIds) {
    await redis.del(`msg:${msgId}:envelope`);
    await redis.del(`msg:${msgId}:context`);
    await redis.del(`msg:${msgId}:delivery`);
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

describe("DeliveryAccess", () => {
  describe("dispatch", () => {
    it("sends approved message via Resend, stores delivery record in Redis, updates Pg status to sent", async () => {
      const msgId = await createApprovedMessage();

      const result = await dispatch({ messageId: msgId, from: "onboarding@resend.dev" });

      expect(result.resendId).toBeTruthy();
      expect(result.messageId).toBe(msgId);

      // Verify Redis delivery record
      const redis = getRedis();
      const delivery = await redis.get<{ resendId: string; sentAt: string; status: string }>(
        `msg:${msgId}:delivery`,
      );
      expect(delivery).toBeTruthy();
      expect(delivery!.resendId).toBe(result.resendId);
      expect(delivery!.status).toBe("sent");

      // Verify Pg status updated
      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("sent");
    });

    it("supports cc field for Boardy intro pattern (TO founder, CC boardy + VC)", async () => {
      const msgId = await createApprovedMessage({ cc: ["delivered@resend.dev"] });

      const result = await dispatch({ messageId: msgId, from: "onboarding@resend.dev" });

      expect(result.resendId).toBeTruthy();

      // Verify Pg status updated
      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("sent");
    });

    it("throws if message not found", async () => {
      await expect(
        dispatch({ messageId: "00000000-0000-0000-0000-000000000000" }),
      ).rejects.toThrow("not found");
    });

    it("throws if message not approved", async () => {
      const relId = await ensureFixtures();

      // Create a drafted (not approved) message
      const msgId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Not Approved",
        body: "Should fail",
        recipients: ["delivered@resend.dev"],
        cc: [],
      });
      createdMessageIds.push(msgId);

      await expect(dispatch({ messageId: msgId })).rejects.toThrow(
        'must be "approved"',
      );
    });
  });

  describe("track", () => {
    it("returns delivery status after dispatch", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId, from: "onboarding@resend.dev" });

      const result = await track(msgId);

      expect(result.messageId).toBe(msgId);
      expect(result.resendId).toBeTruthy();
      expect(["delivered", "bounced", "sent", "opened"]).toContain(result.status);
    });

    it("throws if no delivery record found", async () => {
      await expect(
        track("00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow("No delivery record found");
    });

    it("returns structured status object with lastEventAt", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId, from: "onboarding@resend.dev" });

      const result = await track(msgId);

      expect(result).toHaveProperty("messageId");
      expect(result).toHaveProperty("resendId");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("lastEventAt");
    });
  });
});
