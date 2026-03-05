// LLM Utility — wraps Ax (TypeScript DSPy) and logs every AI interaction
// Encapsulates AI provider volatility. Each language program is its own activity.
// Callable by everyone (Engines, Manager, RAs, Clients) — no layer restrictions.

import { eq, desc } from "drizzle-orm";
import { getDb, getRedis, aiInteractions } from "@pimscout/db";
import { getAx, type ComposeEmailInput, type ComposeEmailOutput } from "@pimscout/ai";
import { runComposeEmail } from "@pimscout/ai/programs";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RetrieveInteractionsOptions {
  programName?: string;
  callerEngine?: string;
  limit?: number;
}

export interface LoggedInteraction {
  id: string;
  programName: string;
  callerEngine: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: string;
  createdAt: Date;
  exchange: { input: Record<string, unknown>; output: Record<string, unknown> } | null;
}

// ─── Interaction Logging ────────────────────────────────────────────────────

async function logInteraction(params: {
  programName: string;
  callerEngine: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: "success" | "error" | "retry";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}): Promise<string> {
  const db = getDb();
  const redis = getRedis();

  const [row] = await db
    .insert(aiInteractions)
    .values({
      programName: params.programName,
      callerEngine: params.callerEngine,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      latencyMs: params.latencyMs,
      status: params.status as (typeof aiInteractions.status.enumValues)[number],
    })
    .returning();

  await redis.set(`inf:${row.id}:exchange`, {
    input: params.input,
    output: params.output,
  });

  return row.id;
}

// ─── Program Activities ─────────────────────────────────────────────────────

export async function composeEmail(
  input: ComposeEmailInput & { callerEngine?: string },
): Promise<ComposeEmailOutput & { interactionId: string }> {
  const llm = getAx();
  const model = process.env.COMPOSE_MODEL ?? "anthropic/claude-sonnet-4-20250514";
  const callerEngine = input.callerEngine ?? "composing-engine";

  const start = Date.now();
  let status: "success" | "error" = "success";
  let result: ComposeEmailOutput;

  try {
    result = await runComposeEmail(llm, input);
  } catch (err) {
    status = "error";
    const interactionId = await logInteraction({
      programName: "compose-email",
      callerEngine,
      model,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - start,
      status: "error",
      input: input as unknown as Record<string, unknown>,
      output: { error: err instanceof Error ? err.message : String(err) },
    });
    throw new Error(
      `compose-email failed (interaction: ${interactionId}): ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const latencyMs = Date.now() - start;

  const interactionId = await logInteraction({
    programName: "compose-email",
    callerEngine,
    model,
    // Token counts are estimates — Ax doesn't expose them directly yet.
    // Real counts will come from OpenRouter usage headers in future.
    inputTokens: 0,
    outputTokens: 0,
    latencyMs,
    status,
    input: input as unknown as Record<string, unknown>,
    output: result as unknown as Record<string, unknown>,
  });

  return { ...result, interactionId };
}

// ─── Query Activities ───────────────────────────────────────────────────────

export async function retrieveInteractions(
  options: RetrieveInteractionsOptions = {},
): Promise<LoggedInteraction[]> {
  const db = getDb();
  const redis = getRedis();
  const limit = options.limit ?? 20;

  const conditions = [];
  if (options.programName) {
    conditions.push(eq(aiInteractions.programName, options.programName));
  }
  if (options.callerEngine) {
    conditions.push(eq(aiInteractions.callerEngine, options.callerEngine));
  }

  let query = db.select().from(aiInteractions).orderBy(desc(aiInteractions.createdAt)).limit(limit);
  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    query = query.where(and(...conditions)) as typeof query;
  }

  const rows = await query;
  if (rows.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const row of rows) {
    pipeline.get(`inf:${row.id}:exchange`);
  }
  const redisResults = await pipeline.exec();

  return rows.map((row, i) => ({
    id: row.id,
    programName: row.programName,
    callerEngine: row.callerEngine,
    model: row.model,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    latencyMs: row.latencyMs,
    status: row.status,
    createdAt: row.createdAt,
    exchange: (redisResults[i] as { input: Record<string, unknown>; output: Record<string, unknown> }) ?? null,
  }));
}
