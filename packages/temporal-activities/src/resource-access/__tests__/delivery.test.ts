import { vi, describe, it, expect, beforeEach, afterAll } from "vitest";
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

// ─── Mock Resend SDK ────────────────────────────────────────────────────────
// Resend is an external email API — mock it so tests verify our business logic
// without network calls, real email sends, or API key requirements.
// Supabase + Redis remain real (our controlled infrastructure).

const { mockSend, mockGet } = vi.hoisted(() => ({
  mockSend: vi.fn(),
  mockGet: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: { send: mockSend, get: mockGet },
  })),
}));

// Guard in getResend() checks this env var before constructing the client
process.env.RESEND_API_KEY = "test-key-for-mock";

import { dispatch, track } from "../delivery.js";

// ─── Test Fixtures ──────────────────────────────────────────────────────────

const TEST_PREFIX = `test-dlv-${Date.now()}`;
const testEmail = (n: number) => `${TEST_PREFIX}-founder-${n}@test.pimscout.dev`;
const scoutEmail = `${TEST_PREFIX}-scout@test.pimscout.dev`;

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

async function createApprovedMessage(overrides?: {
  cc?: string[];
  recipients?: string[];
  subject?: string;
  body?: string;
}): Promise<string> {
  const relId = await ensureFixtures();

  const msgId = await draft({
    relationshipId: relId,
    type: "boardy-intro",
    personalizationLevel: "template",
    subject: overrides?.subject ?? "Test Delivery Subject",
    body: overrides?.body ?? "<p>Hello from DeliveryAccess tests</p>",
    recipients: overrides?.recipients ?? ["founder@example.com"],
    cc: overrides?.cc ?? [],
  });
  createdMessageIds.push(msgId);

  await approve(msgId);
  return msgId;
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  mockSend.mockReset();
  mockGet.mockReset();

  // Default: Resend send returns a successful response
  mockSend.mockResolvedValue({
    data: { id: "resend-test-id-001" },
    error: null,
  });

  // Default: Resend get returns a delivered status
  mockGet.mockResolvedValue({
    data: { last_event: "delivered" },
    error: null,
  });
});

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  for (const msgId of createdMessageIds) {
    await redis.del(`msg:${msgId}:envelope`);
    await redis.del(`msg:${msgId}:context`);
    await redis.del(`msg:${msgId}:delivery`);
  }

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

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("DeliveryAccess", () => {
  describe("dispatch", () => {
    it("sends approved message via Resend, stores delivery record in Redis, updates Pg status", async () => {
      const msgId = await createApprovedMessage({
        recipients: ["founder@example.com"],
        subject: "Intro to Boardy",
        body: "<p>Meet Boardy</p>",
      });

      const result = await dispatch({ messageId: msgId, from: "onboarding@resend.dev" });

      // Verify return shape
      expect(result.resendId).toBe("resend-test-id-001");
      expect(result.messageId).toBe(msgId);

      // Verify Resend was called with correct args
      expect(mockSend).toHaveBeenCalledOnce();
      expect(mockSend).toHaveBeenCalledWith({
        from: "onboarding@resend.dev",
        to: ["founder@example.com"],
        cc: undefined,
        subject: "Intro to Boardy",
        html: "<p>Meet Boardy</p>",
      });

      // Verify Redis delivery record persisted
      const redis = getRedis();
      const delivery = await redis.get<{ resendId: string; sentAt: string; status: string }>(
        `msg:${msgId}:delivery`,
      );
      expect(delivery).toBeTruthy();
      expect(delivery!.resendId).toBe("resend-test-id-001");
      expect(delivery!.status).toBe("sent");
      expect(delivery!.sentAt).toBeTruthy();

      // Verify Pg status updated to sent
      const db = getDb();
      const [msg] = await db.select().from(messages).where(eq(messages.id, msgId));
      expect(msg.status).toBe("sent");
    });

    it("uses default from address when none provided", async () => {
      const msgId = await createApprovedMessage();

      await dispatch({ messageId: msgId });

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.from).toBe("paul@pimandco.ai");
    });

    it("includes cc in Resend call for Boardy intro pattern (TO founder, CC boardy + VC)", async () => {
      const msgId = await createApprovedMessage({
        cc: ["boardy@boardy.ai", "vc@generator.com"],
      });

      await dispatch({ messageId: msgId });

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.cc).toEqual(["boardy@boardy.ai", "vc@generator.com"]);
    });

    it("omits cc from Resend call when envelope cc is empty", async () => {
      const msgId = await createApprovedMessage({ cc: [] });

      await dispatch({ messageId: msgId });

      expect(mockSend).toHaveBeenCalledOnce();
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.cc).toBeUndefined();
    });

    it("throws if message not found — never touches Resend", async () => {
      await expect(
        dispatch({ messageId: "00000000-0000-0000-0000-000000000000" }),
      ).rejects.toThrow("not found");

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("throws if message not approved — never touches Resend", async () => {
      const relId = await ensureFixtures();
      const msgId = await draft({
        relationshipId: relId,
        type: "boardy-intro",
        personalizationLevel: "template",
        subject: "Not Approved",
        body: "Should fail",
        recipients: ["founder@example.com"],
        cc: [],
      });
      createdMessageIds.push(msgId);

      await expect(dispatch({ messageId: msgId })).rejects.toThrow(
        'must be "approved"',
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("throws if no envelope in Redis — never touches Resend", async () => {
      const relId = await ensureFixtures();
      const db = getDb();

      // Insert message directly into Pg (bypassing draft to avoid Redis envelope)
      const [msg] = await db
        .insert(messages)
        .values({
          relationshipId: relId,
          type: "boardy-intro",
          status: "approved",
          personalizationLevel: "template",
          subject: "No Envelope",
          body: "Should fail",
        })
        .returning();
      createdMessageIds.push(msg.id);

      await expect(dispatch({ messageId: msg.id })).rejects.toThrow("No envelope found");

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("propagates Resend API errors with descriptive message", async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: "Rate limit exceeded", name: "rate_limit_error" },
      });

      const msgId = await createApprovedMessage();

      await expect(dispatch({ messageId: msgId })).rejects.toThrow(
        "Resend send failed: Rate limit exceeded",
      );
    });
  });

  describe("track", () => {
    it("returns delivery status from Resend after dispatch", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: { last_event: "delivered" },
        error: null,
      });

      const result = await track(msgId);

      expect(result.messageId).toBe(msgId);
      expect(result.resendId).toBe("resend-test-id-001");
      expect(result.status).toBe("delivered");
      expect(result.lastEventAt).toBeTruthy();

      // Verify Resend get was called with the correct resendId
      expect(mockGet).toHaveBeenCalledWith("resend-test-id-001");
    });

    it("maps 'bounced' status from Resend", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: { last_event: "bounced" },
        error: null,
      });

      const result = await track(msgId);
      expect(result.status).toBe("bounced");
    });

    it("maps 'opened' status from Resend", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: { last_event: "opened" },
        error: null,
      });

      const result = await track(msgId);
      expect(result.status).toBe("opened");
    });

    it("maps unknown Resend events to 'sent' as safe fallback", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: { last_event: "clicked" },
        error: null,
      });

      const result = await track(msgId);
      expect(result.status).toBe("sent");
    });

    it("returns null lastEventAt when Resend has no last_event", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: { last_event: null },
        error: null,
      });

      const result = await track(msgId);
      expect(result.status).toBe("sent");
      expect(result.lastEventAt).toBeNull();
    });

    it("throws if no delivery record found — never touches Resend", async () => {
      await expect(
        track("00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow("No delivery record found");

      expect(mockGet).not.toHaveBeenCalled();
    });

    it("propagates Resend API errors with descriptive message", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      mockGet.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid email ID", name: "not_found" },
      });

      await expect(track(msgId)).rejects.toThrow(
        "Resend get failed: Invalid email ID",
      );
    });

    it("returns structured result with all required fields", async () => {
      const msgId = await createApprovedMessage();
      await dispatch({ messageId: msgId });

      const result = await track(msgId);

      expect(result).toHaveProperty("messageId");
      expect(result).toHaveProperty("resendId");
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("lastEventAt");
      expect(typeof result.messageId).toBe("string");
      expect(typeof result.resendId).toBe("string");
      expect(["delivered", "bounced", "sent", "opened"]).toContain(result.status);
    });
  });
});
