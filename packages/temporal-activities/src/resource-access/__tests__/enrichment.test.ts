import { describe, it, expect, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  getDb,
  getRedis,
  founders,
  enrichments,
  enrichmentChanges,
} from "@pimscout/db";
import { supplement, lookup, verify } from "../enrichment.js";

const TEST_PREFIX = `test-enr-${Date.now()}`;
const testEmail = (n: number) => `${TEST_PREFIX}-founder-${n}@test.pimscout.dev`;

// Track IDs for cleanup
const createdEnrichmentIds: string[] = [];
const createdFounderIds: string[] = [];

async function createFounder(n: number): Promise<string> {
  const db = getDb();
  const [founder] = await db
    .insert(founders)
    .values({
      name: `Enrichment Test Founder ${n}`,
      email: testEmail(n),
      companyName: `EnrichCo-${n}`,
      source: "generator",
    })
    .returning();
  createdFounderIds.push(founder.id);
  return founder.id;
}

// Primary founder, lazily initialized
let primaryFounderId: string;
async function ensureFounder(): Promise<string> {
  if (primaryFounderId) return primaryFounderId;
  primaryFounderId = await createFounder(0);
  return primaryFounderId;
}

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  for (const enrId of createdEnrichmentIds) {
    await redis.del(`enr:${enrId}:raw`);
  }

  for (const enrId of createdEnrichmentIds) {
    await db.delete(enrichmentChanges).where(eq(enrichmentChanges.enrichmentId, enrId));
    await db.delete(enrichments).where(eq(enrichments.id, enrId));
  }
  for (const fId of createdFounderIds) {
    await db.delete(founders).where(eq(founders.id, fId));
  }
});

describe("EnrichmentAccess", () => {
  describe("supplement", () => {
    it("stores enrichment in Pg + raw data in Redis with exact deep equality", async () => {
      const fId = await ensureFounder();

      const rawData = {
        meetingId: "mtg-123",
        transcript: "Discussion about Series A...",
        participants: ["paul@pimandco.ai", "founder@startup.com"],
        metadata: { duration: 1800, platform: "zoom" },
      };

      const enrichmentId = await supplement({
        founderId: fId,
        source: "read-ai",
        protocol: "webhook",
        rawData,
      });

      createdEnrichmentIds.push(enrichmentId);
      expect(enrichmentId).toBeTruthy();

      // Verify Pg row
      const db = getDb();
      const [row] = await db.select().from(enrichments).where(eq(enrichments.id, enrichmentId));
      expect(row.founderId).toBe(fId);
      expect(row.source).toBe("read-ai");
      expect(row.protocol).toBe("webhook");
      expect(row.createdAt).toBeInstanceOf(Date);
      expect(row.updatedAt).toBeInstanceOf(Date);

      // Verify Redis raw data with deep equality (not spot-checks)
      const redis = getRedis();
      const stored = await redis.get<Record<string, unknown>>(`enr:${enrichmentId}:raw`);
      expect(stored).toEqual(rawData);
    });

    it("logs exactly 2 change entries on creation (source + protocol)", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "apollo",
        protocol: "api",
        rawData: { company: "TechStartup", funding: "$2M" },
      });
      createdEnrichmentIds.push(enrichmentId);

      const db = getDb();
      const changes = await db
        .select()
        .from(enrichmentChanges)
        .where(eq(enrichmentChanges.enrichmentId, enrichmentId));

      // Exact count — supplement logs source + protocol, nothing else
      expect(changes).toHaveLength(2);

      const sourceChange = changes.find((c) => c.fieldName === "source");
      const protocolChange = changes.find((c) => c.fieldName === "protocol");

      expect(sourceChange).toBeTruthy();
      expect(sourceChange!.oldValue).toBeNull();
      expect(sourceChange!.newValue).toBe("apollo");

      expect(protocolChange).toBeTruthy();
      expect(protocolChange!.oldValue).toBeNull();
      expect(protocolChange!.newValue).toBe("api");
    });

    it("handles all three protocol values correctly", async () => {
      const fId = await ensureFounder();

      const webhookId = await supplement({
        founderId: fId,
        source: "read-ai",
        protocol: "webhook",
        rawData: { type: "meeting-transcript" },
      });
      createdEnrichmentIds.push(webhookId);

      const apiId = await supplement({
        founderId: fId,
        source: "apollo",
        protocol: "api",
        rawData: { type: "company-profile" },
      });
      createdEnrichmentIds.push(apiId);

      const fileId = await supplement({
        founderId: fId,
        source: "manual-csv",
        protocol: "file",
        rawData: { type: "batch-import", rows: 42 },
      });
      createdEnrichmentIds.push(fileId);

      const db = getDb();
      const [webhook] = await db.select().from(enrichments).where(eq(enrichments.id, webhookId));
      const [api] = await db.select().from(enrichments).where(eq(enrichments.id, apiId));
      const [file] = await db.select().from(enrichments).where(eq(enrichments.id, fileId));

      expect(webhook.protocol).toBe("webhook");
      expect(webhook.source).toBe("read-ai");
      expect(api.protocol).toBe("api");
      expect(api.source).toBe("apollo");
      expect(file.protocol).toBe("file");
      expect(file.source).toBe("manual-csv");
    });

    it("preserves complex nested rawData (arrays, objects, nulls)", async () => {
      const fId = await ensureFounder();

      const complexRawData = {
        participants: [
          { email: "a@test.com", role: "host" },
          { email: "b@test.com", role: "guest" },
        ],
        actionItems: ["Follow up on term sheet", "Schedule board meeting"],
        sentiment: { positive: 0.7, neutral: 0.2, negative: 0.1 },
        followUp: null,
        tags: [],
      };

      const enrichmentId = await supplement({
        founderId: fId,
        source: "read-ai",
        protocol: "webhook",
        rawData: complexRawData,
      });
      createdEnrichmentIds.push(enrichmentId);

      const redis = getRedis();
      const stored = await redis.get<Record<string, unknown>>(`enr:${enrichmentId}:raw`);
      expect(stored).toEqual(complexRawData);
    });
  });

  describe("lookup", () => {
    it("returns enrichments with full HydratedEnrichment shape", async () => {
      const fId = await ensureFounder();

      const results = await lookup(fId);
      expect(results.length).toBeGreaterThanOrEqual(1);

      const first = results[0];
      expect(typeof first.id).toBe("string");
      expect(first.founderId).toBe(fId);
      expect(typeof first.source).toBe("string");
      expect(typeof first.protocol).toBe("string");
      expect(first.createdAt).toBeInstanceOf(Date);
      expect(first.updatedAt).toBeInstanceOf(Date);
      // rawData should be an object or null
      expect(
        first.rawData === null || typeof first.rawData === "object",
      ).toBe(true);
    });

    it("filters by source", async () => {
      const fId = await ensureFounder();

      const results = await lookup(fId, { source: "apollo" });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every((r) => r.source === "apollo")).toBe(true);
    });

    it("filters by protocol", async () => {
      const fId = await ensureFounder();

      const results = await lookup(fId, { protocol: "webhook" });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every((r) => r.protocol === "webhook")).toBe(true);
    });

    it("filters by both source and protocol simultaneously", async () => {
      const fId = await ensureFounder();

      const results = await lookup(fId, { source: "read-ai", protocol: "webhook" });

      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.every((r) => r.source === "read-ai" && r.protocol === "webhook")).toBe(true);
    });

    it("returns rawData as null when Redis key is missing (orphaned Pg row)", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "orphan-test",
        protocol: "api",
        rawData: { willBeDeleted: true },
      });
      createdEnrichmentIds.push(enrichmentId);

      // Delete Redis key to create orphan
      const redis = getRedis();
      await redis.del(`enr:${enrichmentId}:raw`);

      const results = await lookup(fId, { source: "orphan-test" });
      expect(results).toHaveLength(1);
      expect(results[0].rawData).toBeNull();
    });

    it("does not leak enrichments from other founders", async () => {
      const founderA = await createFounder(10);
      const founderB = await createFounder(11);

      const enrA = await supplement({
        founderId: founderA,
        source: "isolation-test",
        protocol: "api",
        rawData: { owner: "A" },
      });
      createdEnrichmentIds.push(enrA);

      const enrB = await supplement({
        founderId: founderB,
        source: "isolation-test",
        protocol: "api",
        rawData: { owner: "B" },
      });
      createdEnrichmentIds.push(enrB);

      const resultsA = await lookup(founderA, { source: "isolation-test" });
      const resultsB = await lookup(founderB, { source: "isolation-test" });

      expect(resultsA).toHaveLength(1);
      expect(resultsA[0].founderId).toBe(founderA);
      expect(resultsB).toHaveLength(1);
      expect(resultsB[0].founderId).toBe(founderB);
    });

    it("returns empty array for unknown founder", async () => {
      const results = await lookup("00000000-0000-0000-0000-000000000000");
      expect(results).toEqual([]);
    });
  });

  describe("verify", () => {
    it("returns true when Pg row and Redis raw data both present", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "verify-test",
        protocol: "api",
        rawData: { test: true },
      });
      createdEnrichmentIds.push(enrichmentId);

      const result = await verify(enrichmentId);
      expect(result).toBe(true);
    });

    it("returns false when Redis data is missing (orphaned Pg row)", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "verify-orphan-test",
        protocol: "api",
        rawData: { orphan: true },
      });
      createdEnrichmentIds.push(enrichmentId);

      const redis = getRedis();
      await redis.del(`enr:${enrichmentId}:raw`);

      const result = await verify(enrichmentId);
      expect(result).toBe(false);
    });

    it("returns false for completely non-existent enrichmentId", async () => {
      const result = await verify("00000000-0000-0000-0000-000000000000");
      expect(result).toBe(false);
    });

    it("is read-only — does not create any side effects", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "verify-readonly-test",
        protocol: "webhook",
        rawData: { readonly: true },
      });
      createdEnrichmentIds.push(enrichmentId);

      const db = getDb();

      // Count change log entries before verify
      const changesBefore = await db
        .select()
        .from(enrichmentChanges)
        .where(eq(enrichmentChanges.enrichmentId, enrichmentId));

      await verify(enrichmentId);

      // Count change log entries after verify — should be identical
      const changesAfter = await db
        .select()
        .from(enrichmentChanges)
        .where(eq(enrichmentChanges.enrichmentId, enrichmentId));

      expect(changesAfter).toHaveLength(changesBefore.length);
    });
  });
});
