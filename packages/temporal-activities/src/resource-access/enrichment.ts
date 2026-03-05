// EnrichmentAccess — encapsulates enrichment source volatility
// Source-agnostic: any string source identifier + stable protocol enum (webhook/api/file)
// Three business verbs: supplement, lookup, verify

import { eq, and } from "drizzle-orm";
import { getDb, getRedis, enrichments, enrichmentChanges } from "@pimscout/db";
import type { EnrichmentProtocol, ConsolidatedEnrichment } from "@pimscout/schemas";

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

// ─── Source-Specific Normalizers ─────────────────────────────────────────────
// Adding a new enrichment source = adding one function to this map.
// This is the volatility this RA encapsulates.

interface NormalizedFields {
  topics: string[];
  actionItems: string[];
  keyQuestions: string[];
  summary: string | null;
  companyContext: {
    sector?: string;
    stage?: string;
    raiseAmount?: string;
    oneLiner?: string;
  };
}

type Normalizer = (rawData: Record<string, unknown>) => NormalizedFields;

function normalizeReadAi(raw: Record<string, unknown>): NormalizedFields {
  const summary = raw["summary"] as Record<string, unknown> | undefined;
  const transcript = raw["transcript"] as Record<string, unknown> | undefined;

  return {
    topics: Array.isArray(raw["topics"])
      ? (raw["topics"] as string[])
      : Array.isArray(summary?.["topics"])
        ? (summary["topics"] as string[])
        : [],
    actionItems: Array.isArray(raw["action_items"])
      ? (raw["action_items"] as string[])
      : Array.isArray(summary?.["action_items"])
        ? (summary["action_items"] as string[])
        : [],
    keyQuestions: Array.isArray(raw["key_questions"])
      ? (raw["key_questions"] as string[])
      : [],
    summary: (summary?.["overview"] as string) ?? (raw["summary"] as string) ?? null,
    companyContext: {
      sector: transcript?.["sector"] as string | undefined,
      stage: transcript?.["stage"] as string | undefined,
      raiseAmount: transcript?.["raise_amount"] as string | undefined,
      oneLiner: transcript?.["one_liner"] as string | undefined,
    },
  };
}

function normalizeFallback(raw: Record<string, unknown>): NormalizedFields {
  return {
    topics: Array.isArray(raw["topics"]) ? (raw["topics"] as string[]) : [],
    actionItems: Array.isArray(raw["action_items"]) ? (raw["action_items"] as string[]) : [],
    keyQuestions: Array.isArray(raw["key_questions"]) ? (raw["key_questions"] as string[]) : [],
    summary: (raw["summary"] as string) ?? null,
    companyContext: {
      sector: raw["sector"] as string | undefined,
      stage: raw["stage"] as string | undefined,
      raiseAmount: raw["raise_amount"] as string | undefined,
      oneLiner: raw["one_liner"] as string | undefined,
    },
  };
}

const NORMALIZERS: Record<string, Normalizer> = {
  "read-ai": normalizeReadAi,
};

function getNormalizer(source: string): Normalizer {
  return NORMALIZERS[source] ?? normalizeFallback;
}

export async function consolidate(founderId: string): Promise<ConsolidatedEnrichment> {
  const enrichmentsList = await lookup(founderId);

  const allTopics: string[] = [];
  const allActionItems: string[] = [];
  const allKeyQuestions: string[] = [];
  const allSummaries: string[] = [];
  const sources: string[] = [];
  let companyContext: ConsolidatedEnrichment["companyContext"] = {};

  for (const enrichment of enrichmentsList) {
    if (!enrichment.rawData) continue;

    const normalizer = getNormalizer(enrichment.source);
    const normalized = normalizer(enrichment.rawData);

    allTopics.push(...normalized.topics);
    allActionItems.push(...normalized.actionItems);
    allKeyQuestions.push(...normalized.keyQuestions);
    if (normalized.summary) allSummaries.push(normalized.summary);

    // Merge company context — later sources overwrite earlier ones
    companyContext = {
      ...companyContext,
      ...Object.fromEntries(
        Object.entries(normalized.companyContext).filter(([, v]) => v !== undefined),
      ),
    };

    if (!sources.includes(enrichment.source)) {
      sources.push(enrichment.source);
    }
  }

  return {
    founderId,
    topics: [...new Set(allTopics)],
    actionItems: [...new Set(allActionItems)],
    keyQuestions: [...new Set(allKeyQuestions)],
    summaries: allSummaries,
    companyContext,
    sources,
    lastConsolidatedAt: new Date(),
  };
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
