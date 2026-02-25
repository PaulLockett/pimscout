import { describe, it, expect, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import {
  getDb,
  getRedis,
  founders,
  scouts,
  relationships,
  founderChanges,
  relationshipChanges,
} from "@pimscout/db";
import { qualify, engage, advance, archive, retrieve } from "../founder.js";

const TEST_PREFIX = `test-${Date.now()}`;
const testEmail = (n: number) => `${TEST_PREFIX}-founder-${n}@test.pimscout.dev`;
const scoutEmail = `${TEST_PREFIX}-scout@test.pimscout.dev`;

// Track IDs for cleanup
const createdFounderIds: string[] = [];
const createdRelationshipIds: string[] = [];
let scoutId: string;

afterAll(async () => {
  const db = getDb();
  const redis = getRedis();

  // Delete in reverse FK order: changes → messages → relationships → founders → scouts
  for (const relId of createdRelationshipIds) {
    await db.delete(relationshipChanges).where(eq(relationshipChanges.relationshipId, relId));
    await db.delete(relationships).where(eq(relationships.id, relId));
    await redis.del(`rel:${relId}:paths`);
  }
  for (const fId of createdFounderIds) {
    await db.delete(founderChanges).where(eq(founderChanges.founderId, fId));
    await db.delete(founders).where(eq(founders.id, fId));
  }
  if (scoutId) {
    await db.delete(scouts).where(eq(scouts.id, scoutId));
  }
});

// Create a scout for all tests to use
async function ensureScout(): Promise<string> {
  if (scoutId) return scoutId;
  const db = getDb();
  const [scout] = await db
    .insert(scouts)
    .values({ name: "Test Scout", email: scoutEmail })
    .returning();
  scoutId = scout.id;
  return scoutId;
}

describe("FounderAccess", () => {
  describe("qualify", () => {
    it("creates founder + relationship in Pg, activePaths in Redis, and logs changes", async () => {
      const sid = await ensureScout();
      const result = await qualify({
        scoutId: sid,
        name: "Jane Doe",
        email: testEmail(1),
        companyName: "Acme Inc",
        source: "generator",
      });

      createdFounderIds.push(result.founderId);
      createdRelationshipIds.push(result.relationshipId);

      expect(result.founderId).toBeTruthy();
      expect(result.relationshipId).toBeTruthy();

      // Verify Pg data
      const db = getDb();
      const [founder] = await db.select().from(founders).where(eq(founders.id, result.founderId));
      expect(founder.name).toBe("Jane Doe");
      expect(founder.email).toBe(testEmail(1));
      expect(founder.companyName).toBe("Acme Inc");

      const [rel] = await db.select().from(relationships).where(eq(relationships.id, result.relationshipId));
      expect(rel.stage).toBe("intake");
      expect(rel.boardyStatus).toBe("not-referred");
      expect(rel.interactionCount).toBe(0);

      // Verify Redis paths
      const redis = getRedis();
      const paths = await redis.get<string[]>(`rel:${result.relationshipId}:paths`);
      expect(paths).toEqual(["boardy-referral"]);

      // Verify change records
      const fChanges = await db.select().from(founderChanges).where(eq(founderChanges.founderId, result.founderId));
      expect(fChanges.length).toBeGreaterThanOrEqual(3); // email, name, companyName

      const rChanges = await db.select().from(relationshipChanges).where(eq(relationshipChanges.relationshipId, result.relationshipId));
      expect(rChanges.length).toBeGreaterThanOrEqual(2); // stage, boardyStatus
    });

    it("stores optional fields correctly", async () => {
      const sid = await ensureScout();
      const result = await qualify({
        scoutId: sid,
        name: "Bob Smith",
        email: testEmail(2),
        companyName: "WidgetCo",
        source: "generator",
        stage: "Series A",
        raiseAmount: "$5M",
        sector: "fintech",
        oneLiner: "Payments for everyone",
        deckLink: "https://deck.example.com",
        referringPartner: "Partner X",
      });

      createdFounderIds.push(result.founderId);
      createdRelationshipIds.push(result.relationshipId);

      const db = getDb();
      const [founder] = await db.select().from(founders).where(eq(founders.id, result.founderId));
      expect(founder.stage).toBe("Series A");
      expect(founder.raiseAmount).toBe("$5M");
      expect(founder.sector).toBe("fintech");
      expect(founder.oneLiner).toBe("Payments for everyone");
      expect(founder.deckLink).toBe("https://deck.example.com");
      expect(founder.referringPartner).toBe("Partner X");
    });
  });

  describe("engage", () => {
    it("increments interactionCount, updates interaction fields, and logs changes", async () => {
      const sid = await ensureScout();
      const { relationshipId, founderId } = await qualify({
        scoutId: sid,
        name: "Engage Test",
        email: testEmail(3),
        companyName: "EngageCo",
        source: "generator",
      });
      createdFounderIds.push(founderId);
      createdRelationshipIds.push(relationshipId);

      await engage({ relationshipId, channel: "email", summary: "Initial outreach" });

      const db = getDb();
      const [rel] = await db.select().from(relationships).where(eq(relationships.id, relationshipId));
      expect(rel.interactionCount).toBe(1);
      expect(rel.lastInteractionChannel).toBe("email");
      expect(rel.lastInteractionSummary).toBe("Initial outreach");
      expect(rel.lastInteractionAt).toBeInstanceOf(Date);

      // Engage again
      await engage({ relationshipId, channel: "meeting", summary: "Follow-up call" });
      const [rel2] = await db.select().from(relationships).where(eq(relationships.id, relationshipId));
      expect(rel2.interactionCount).toBe(2);
      expect(rel2.lastInteractionChannel).toBe("meeting");

      // Verify change records
      const changes = await db.select().from(relationshipChanges).where(eq(relationshipChanges.relationshipId, relationshipId));
      const countChanges = changes.filter((c) => c.fieldName === "interactionCount");
      expect(countChanges.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("advance", () => {
    it("updates stage/boardyStatus in Pg, activePaths in Redis, and logs changes", async () => {
      const sid = await ensureScout();
      const { relationshipId, founderId } = await qualify({
        scoutId: sid,
        name: "Advance Test",
        email: testEmail(4),
        companyName: "AdvanceCo",
        source: "generator",
      });
      createdFounderIds.push(founderId);
      createdRelationshipIds.push(relationshipId);

      await advance({
        relationshipId,
        stage: "active-boardy-onboarding",
        boardyStatus: "referred",
        activePaths: ["boardy-referral", "consulting"],
        cadencePosition: 1,
      });

      const db = getDb();
      const [rel] = await db.select().from(relationships).where(eq(relationships.id, relationshipId));
      expect(rel.stage).toBe("active-boardy-onboarding");
      expect(rel.boardyStatus).toBe("referred");
      expect(rel.cadencePosition).toBe(1);

      // Check Redis paths updated
      const redis = getRedis();
      const paths = await redis.get<string[]>(`rel:${relationshipId}:paths`);
      expect(paths).toEqual(["boardy-referral", "consulting"]);

      // Verify change records
      const changes = await db.select().from(relationshipChanges).where(eq(relationshipChanges.relationshipId, relationshipId));
      const stageChange = changes.find((c) => c.fieldName === "stage" && c.newValue === "active-boardy-onboarding");
      expect(stageChange).toBeTruthy();
      expect(stageChange!.oldValue).toBe("intake");
    });
  });

  describe("archive", () => {
    it("sets stage to archived and logs change", async () => {
      const sid = await ensureScout();
      const { relationshipId, founderId } = await qualify({
        scoutId: sid,
        name: "Archive Test",
        email: testEmail(5),
        companyName: "ArchiveCo",
        source: "generator",
      });
      createdFounderIds.push(founderId);
      createdRelationshipIds.push(relationshipId);

      await archive(relationshipId);

      const db = getDb();
      const [rel] = await db.select().from(relationships).where(eq(relationships.id, relationshipId));
      expect(rel.stage).toBe("archived");

      const changes = await db.select().from(relationshipChanges).where(eq(relationshipChanges.relationshipId, relationshipId));
      const archiveChange = changes.find((c) => c.fieldName === "stage" && c.newValue === "archived");
      expect(archiveChange).toBeTruthy();
    });
  });

  describe("retrieve", () => {
    it("returns hydrated object with Redis data merged", async () => {
      const sid = await ensureScout();
      const { relationshipId, founderId } = await qualify({
        scoutId: sid,
        name: "Retrieve Test",
        email: testEmail(6),
        companyName: "RetrieveCo",
        source: "generator",
      });
      createdFounderIds.push(founderId);
      createdRelationshipIds.push(relationshipId);

      const result = await retrieve(relationshipId);
      expect(result).not.toBeNull();
      expect(result!.relationshipId).toBe(relationshipId);
      expect(result!.founderId).toBe(founderId);
      expect(result!.stage).toBe("intake");
      expect(result!.activePaths).toEqual(["boardy-referral"]);
      expect(result!.founder.name).toBe("Retrieve Test");
      expect(result!.founder.email).toBe(testEmail(6));
      expect(result!.founder.companyName).toBe("RetrieveCo");
    });

    it("returns null for missing relationship", async () => {
      const result = await retrieve("00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("change history", () => {
    it("is queryable across founder_changes and relationship_changes", async () => {
      const sid = await ensureScout();
      const { relationshipId, founderId } = await qualify({
        scoutId: sid,
        name: "History Test",
        email: testEmail(7),
        companyName: "HistoryCo",
        source: "generator",
      });
      createdFounderIds.push(founderId);
      createdRelationshipIds.push(relationshipId);

      const db = getDb();

      // Founder changes from creation
      const fChanges = await db.select().from(founderChanges).where(eq(founderChanges.founderId, founderId));
      const emailChange = fChanges.find((c) => c.fieldName === "email");
      expect(emailChange).toBeTruthy();
      expect(emailChange!.oldValue).toBeNull();
      expect(emailChange!.newValue).toBe(testEmail(7));

      // Relationship changes from creation
      const rChanges = await db.select().from(relationshipChanges).where(eq(relationshipChanges.relationshipId, relationshipId));
      const stageChange = rChanges.find((c) => c.fieldName === "stage");
      expect(stageChange).toBeTruthy();
      expect(stageChange!.oldValue).toBeNull();
      expect(stageChange!.newValue).toBe("intake");
    });
  });
});
