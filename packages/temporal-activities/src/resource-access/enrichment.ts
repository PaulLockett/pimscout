// EnrichmentAccess — encapsulates enrichment source volatility
// Source-agnostic: any string source identifier + stable protocol enum (webhook/api/file)
// Three business verbs: supplement, lookup, verify

import { eq, and } from "drizzle-orm";
import { getDb, getRedis, enrichments, enrichmentChanges } from "@pimscout/db";
import type { EnrichmentProtocol } from "@pimscout/schemas";

// ─── Input / Output Types ───────────────────────────────────────────────────

export interface SupplementInput {
  founderId: string;
  source: string;
  protocol: EnrichmentProtocol;
  rawData: Record<string, unknown>;
}

export interface LookupOptions {
  source?: string;
  protocol?: EnrichmentProtocol;
}

export interface HydratedEnrichment {
  id: string;
  founderId: string;
  source: string;
  protocol: string;
  rawData: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Change Logging Helper ──────────────────────────────────────────────────

async function logEnrichmentChange(
  enrichmentId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string,
): Promise<void> {
  const db = getDb();
  await db.insert(enrichmentChanges).values({
    enrichmentId,
    fieldName,
    oldValue,
    newValue,
  });
}

// ─── Business Verbs ─────────────────────────────────────────────────────────

export async function supplement(input: SupplementInput): Promise<string> {
  const db = getDb();
  const redis = getRedis();

  const [enrichment] = await db
    .insert(enrichments)
    .values({
      founderId: input.founderId,
      source: input.source,
      protocol: input.protocol as (typeof enrichments.protocol.enumValues)[number],
    })
    .returning();

  // Store raw data blob in Redis
  await redis.set(`enr:${enrichment.id}:raw`, input.rawData);

  // Log creation to change history
  await logEnrichmentChange(enrichment.id, "source", null, input.source);
  await logEnrichmentChange(enrichment.id, "protocol", null, input.protocol);

  return enrichment.id;
}

export async function lookup(
  founderId: string,
  options?: LookupOptions,
): Promise<HydratedEnrichment[]> {
  const db = getDb();
  const redis = getRedis();

  const conditions = [eq(enrichments.founderId, founderId)];
  if (options?.source) {
    conditions.push(eq(enrichments.source, options.source));
  }
  if (options?.protocol) {
    conditions.push(
      eq(
        enrichments.protocol,
        options.protocol as (typeof enrichments.protocol.enumValues)[number],
      ),
    );
  }

  const rows = await db
    .select()
    .from(enrichments)
    .where(and(...conditions));

  if (rows.length === 0) return [];

  // Batch-fetch Redis raw data via pipeline
  const pipeline = redis.pipeline();
  for (const row of rows) {
    pipeline.get(`enr:${row.id}:raw`);
  }
  const redisResults = await pipeline.exec();

  return rows.map((row, i) => ({
    id: row.id,
    founderId: row.founderId,
    source: row.source,
    protocol: row.protocol,
    rawData: (redisResults[i] as Record<string, unknown>) ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function verify(enrichmentId: string): Promise<boolean> {
  const db = getDb();
  const redis = getRedis();

  // Check Pg
  const [row] = await db
    .select()
    .from(enrichments)
    .where(eq(enrichments.id, enrichmentId));

  if (!row) return false;

  // Check Redis raw data
  const rawData = await redis.get(`enr:${enrichmentId}:raw`);
  return rawData !== null;
}
