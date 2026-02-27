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
const testEmail = `${TEST_PREFIX}-founder@test.pimscout.dev`;

// Track IDs for cleanup
const createdEnrichmentIds: string[] = [];
let founderId: string;

async function ensureFounder(): Promise<string> {
  if (founderId) return founderId;

  const db = getDb();
  const [founder] = await db
    .insert(founders)
    .values({
      name: "Enrichment Test Founder",
      email: testEmail,
      companyName: "EnrichCo",
      source: "generator",
    })
    .returning();
  founderId = founder.id;
  return founderId;
}

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  // Clean up Redis keys for enrichments
  for (const enrId of createdEnrichmentIds) {
    await redis.del(`enr:${enrId}:raw`);
  }

  // Delete in reverse FK order: enrichment_changes → enrichments → founders
  for (const enrId of createdEnrichmentIds) {
    await db.delete(enrichmentChanges).where(eq(enrichmentChanges.enrichmentId, enrId));
    await db.delete(enrichments).where(eq(enrichments.id, enrId));
  }
  if (founderId) {
    await db.delete(founders).where(eq(founders.id, founderId));
  }
});

describe("EnrichmentAccess", () => {
  describe("supplement", () => {
    it("stores enrichment in Pg + raw data in Redis", async () => {
      const fId = await ensureFounder();

      const rawData = {
        meetingId: "mtg-123",
        transcript: "Discussion about Series A...",
        participants: ["paul@pimandco.ai", "founder@startup.com"],
      };

      const enrichmentId = await supplement({
        founderId: fId,
        source: "read-ai",
        protocol: "webhook",
        rawData,
      });

      createdEnrichmentIds.push(enrichmentId);
      expect(enrichmentId).toBeTruthy();

      // Verify Pg
      const db = getDb();
      const [row] = await db.select().from(enrichments).where(eq(enrichments.id, enrichmentId));
      expect(row.founderId).toBe(fId);
      expect(row.source).toBe("read-ai");
      expect(row.protocol).toBe("webhook");

      // Verify Redis
      const redis = getRedis();
      const stored = await redis.get<Record<string, unknown>>(`enr:${enrichmentId}:raw`);
      expect(stored).toBeTruthy();
      expect(stored!.meetingId).toBe("mtg-123");
      expect(stored!.transcript).toBe("Discussion about Series A...");
    });

    it("logs creation to enrichment_changes", async () => {
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

      expect(changes.length).toBeGreaterThanOrEqual(2); // source + protocol
      const sourceChange = changes.find((c) => c.fieldName === "source");
      expect(sourceChange).toBeTruthy();
      expect(sourceChange!.oldValue).toBeNull();
      expect(sourceChange!.newValue).toBe("apollo");
    });

    it("works with different sources and protocols", async () => {
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

      // All should have been created successfully
      const db = getDb();
      const [webhook] = await db.select().from(enrichments).where(eq(enrichments.id, webhookId));
      const [api] = await db.select().from(enrichments).where(eq(enrichments.id, apiId));
      const [file] = await db.select().from(enrichments).where(eq(enrichments.id, fileId));

      expect(webhook.protocol).toBe("webhook");
      expect(api.protocol).toBe("api");
      expect(file.protocol).toBe("file");
      expect(api.source).toBe("apollo");
      expect(file.source).toBe("manual-csv");
    });
  });

  describe("lookup", () => {
    it("returns all enrichments for founder with Redis data merged", async () => {
      const fId = await ensureFounder();

      const results = await lookup(fId);

      expect(results.length).toBeGreaterThanOrEqual(1);
      const first = results[0];
      expect(first.founderId).toBe(fId);
      expect(first.rawData).toBeTruthy();
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("source");
      expect(first).toHaveProperty("protocol");
      expect(first).toHaveProperty("createdAt");
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

    it("returns empty array for unknown founder", async () => {
      const results = await lookup("00000000-0000-0000-0000-000000000000");
      expect(results).toEqual([]);
    });
  });

  describe("verify", () => {
    it("returns true when Pg + Redis both present", async () => {
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

    it("returns false when Redis data missing", async () => {
      const fId = await ensureFounder();

      const enrichmentId = await supplement({
        founderId: fId,
        source: "verify-orphan-test",
        protocol: "api",
        rawData: { orphan: true },
      });
      createdEnrichmentIds.push(enrichmentId);

      // Delete Redis key to simulate orphan
      const redis = getRedis();
      await redis.del(`enr:${enrichmentId}:raw`);

      const result = await verify(enrichmentId);
      expect(result).toBe(false);
    });
  });
});
