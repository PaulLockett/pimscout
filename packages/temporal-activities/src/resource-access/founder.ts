import { eq, sql } from "drizzle-orm";
import {
  getDb,
  getRedis,
  founders,
  relationships,
  founderChanges,
  relationshipChanges,
} from "@pimscout/db";

// ─── Input / Output Types ───────────────────────────────────────────────────

export interface QualifyInput {
  scoutId: string;
  name: string;
  email: string;
  companyName: string;
  source: string;
  stage?: string;
  raiseAmount?: string;
  sector?: string;
  oneLiner?: string;
  deckLink?: string;
  referringPartner?: string;
}

export interface QualifyResult {
  founderId: string;
  relationshipId: string;
}

export interface EngageInput {
  relationshipId: string;
  channel: string;
  summary: string;
}

export interface AdvanceInput {
  relationshipId: string;
  stage?: string;
  boardyStatus?: string;
  activePaths?: string[];
  nextTouchpoint?: Date;
  cadencePosition?: number;
}

export interface RetrieveResult {
  relationshipId: string;
  scoutId: string;
  founderId: string;
  stage: string;
  boardyStatus: string;
  cadencePosition: number;
  interactionCount: number;
  nextTouchpoint: Date | null;
  lastInteractionAt: Date | null;
  lastInteractionChannel: string | null;
  lastInteractionSummary: string | null;
  activePaths: string[];
  founder: {
    id: string;
    name: string;
    email: string;
    companyName: string;
    source: string;
    stage: string | null;
    raiseAmount: string | null;
    sector: string | null;
    oneLiner: string | null;
    deckLink: string | null;
    referringPartner: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ─── Change Logging Helper ──────────────────────────────────────────────────

type ChangeTable = "founder" | "relationship";

async function logChange(
  table: ChangeTable,
  entityId: string,
  fieldName: string,
  oldValue: string | null,
  newValue: string,
): Promise<void> {
  const db = getDb();
  if (table === "founder") {
    await db.insert(founderChanges).values({
      founderId: entityId,
      fieldName,
      oldValue,
      newValue,
    });
  } else {
    await db.insert(relationshipChanges).values({
      relationshipId: entityId,
      fieldName,
      oldValue,
      newValue,
    });
  }
}

// ─── Business Verbs ─────────────────────────────────────────────────────────

export async function qualify(input: QualifyInput): Promise<QualifyResult> {
  const db = getDb();
  const redis = getRedis();

  const [founder] = await db
    .insert(founders)
    .values({
      name: input.name,
      email: input.email,
      companyName: input.companyName,
      source: input.source,
      stage: input.stage,
      raiseAmount: input.raiseAmount,
      sector: input.sector,
      oneLiner: input.oneLiner,
      deckLink: input.deckLink,
      referringPartner: input.referringPartner,
    })
    .returning();

  const [relationship] = await db
    .insert(relationships)
    .values({
      scoutId: input.scoutId,
      founderId: founder.id,
    })
    .returning();

  const defaultPaths = ["boardy-referral"];
  await redis.set(`rel:${relationship.id}:paths`, defaultPaths);

  // Log creation records
  await logChange("founder", founder.id, "email", null, input.email);
  await logChange("founder", founder.id, "name", null, input.name);
  await logChange(
    "founder",
    founder.id,
    "companyName",
    null,
    input.companyName,
  );
  await logChange("relationship", relationship.id, "stage", null, "intake");
  await logChange(
    "relationship",
    relationship.id,
    "boardyStatus",
    null,
    "not-referred",
  );

  return { founderId: founder.id, relationshipId: relationship.id };
}

export async function engage(input: EngageInput): Promise<void> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(relationships)
    .where(eq(relationships.id, input.relationshipId));

  if (!existing) {
    throw new Error(`Relationship ${input.relationshipId} not found`);
  }

  const now = new Date();
  await db
    .update(relationships)
    .set({
      interactionCount: sql`${relationships.interactionCount} + 1`,
      lastInteractionAt: now,
      lastInteractionChannel: input.channel,
      lastInteractionSummary: input.summary,
      updatedAt: now,
    })
    .where(eq(relationships.id, input.relationshipId));

  await logChange(
    "relationship",
    input.relationshipId,
    "interactionCount",
    String(existing.interactionCount),
    String(existing.interactionCount + 1),
  );
  await logChange(
    "relationship",
    input.relationshipId,
    "lastInteractionChannel",
    existing.lastInteractionChannel,
    input.channel,
  );
  await logChange(
    "relationship",
    input.relationshipId,
    "lastInteractionSummary",
    existing.lastInteractionSummary,
    input.summary,
  );
}

export async function advance(input: AdvanceInput): Promise<void> {
  const db = getDb();
  const redis = getRedis();

  const [existing] = await db
    .select()
    .from(relationships)
    .where(eq(relationships.id, input.relationshipId));

  if (!existing) {
    throw new Error(`Relationship ${input.relationshipId} not found`);
  }

  // Build partial update object only for fields provided
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (input.stage !== undefined) updates.stage = input.stage;
  if (input.boardyStatus !== undefined)
    updates.boardyStatus = input.boardyStatus;
  if (input.nextTouchpoint !== undefined)
    updates.nextTouchpoint = input.nextTouchpoint;
  if (input.cadencePosition !== undefined)
    updates.cadencePosition = input.cadencePosition;

  await db
    .update(relationships)
    .set(updates)
    .where(eq(relationships.id, input.relationshipId));

  // Update Redis paths if provided
  if (input.activePaths !== undefined) {
    await redis.set(`rel:${input.relationshipId}:paths`, input.activePaths);
    const oldPaths = await redis.get<string[]>(
      `rel:${input.relationshipId}:paths`,
    );
    await logChange(
      "relationship",
      input.relationshipId,
      "activePaths",
      JSON.stringify(oldPaths),
      JSON.stringify(input.activePaths),
    );
  }

  // Log each changed Pg field
  if (input.stage !== undefined) {
    await logChange(
      "relationship",
      input.relationshipId,
      "stage",
      existing.stage,
      input.stage,
    );
  }
  if (input.boardyStatus !== undefined) {
    await logChange(
      "relationship",
      input.relationshipId,
      "boardyStatus",
      existing.boardyStatus,
      input.boardyStatus,
    );
  }
  if (input.nextTouchpoint !== undefined) {
    await logChange(
      "relationship",
      input.relationshipId,
      "nextTouchpoint",
      existing.nextTouchpoint?.toISOString() ?? null,
      input.nextTouchpoint.toISOString(),
    );
  }
  if (input.cadencePosition !== undefined) {
    await logChange(
      "relationship",
      input.relationshipId,
      "cadencePosition",
      String(existing.cadencePosition),
      String(input.cadencePosition),
    );
  }
}

export async function archive(relationshipId: string): Promise<void> {
  const db = getDb();

  const [existing] = await db
    .select()
    .from(relationships)
    .where(eq(relationships.id, relationshipId));

  if (!existing) {
    throw new Error(`Relationship ${relationshipId} not found`);
  }

  await db
    .update(relationships)
    .set({ stage: "archived", updatedAt: new Date() })
    .where(eq(relationships.id, relationshipId));

  await logChange(
    "relationship",
    relationshipId,
    "stage",
    existing.stage,
    "archived",
  );
}

export async function retrieve(
  relationshipId: string,
): Promise<RetrieveResult | null> {
  const db = getDb();
  const redis = getRedis();

  const result = await db.query.relationships.findFirst({
    where: eq(relationships.id, relationshipId),
    with: { founder: true },
  });

  if (!result) return null;

  const activePaths =
    (await redis.get<string[]>(`rel:${relationshipId}:paths`)) ?? [];

  return {
    relationshipId: result.id,
    scoutId: result.scoutId,
    founderId: result.founderId,
    stage: result.stage,
    boardyStatus: result.boardyStatus,
    cadencePosition: result.cadencePosition,
    interactionCount: result.interactionCount,
    nextTouchpoint: result.nextTouchpoint,
    lastInteractionAt: result.lastInteractionAt,
    lastInteractionChannel: result.lastInteractionChannel,
    lastInteractionSummary: result.lastInteractionSummary,
    activePaths,
    founder: {
      id: result.founder.id,
      name: result.founder.name,
      email: result.founder.email,
      companyName: result.founder.companyName,
      source: result.founder.source,
      stage: result.founder.stage,
      raiseAmount: result.founder.raiseAmount,
      sector: result.founder.sector,
      oneLiner: result.founder.oneLiner,
      deckLink: result.founder.deckLink,
      referringPartner: result.founder.referringPartner,
    },
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}
