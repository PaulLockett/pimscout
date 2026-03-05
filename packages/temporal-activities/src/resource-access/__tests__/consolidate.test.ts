import { describe, it, expect, vi, beforeEach } from "vitest";

// Shared mock state — single instance returned by getDb/getRedis
const mockRows: Array<Record<string, unknown>> = [];
const mockRedisResults: Array<Record<string, unknown> | null> = [];

const mockPipeline = {
  get: vi.fn().mockReturnThis(),
  exec: vi.fn(() => Promise.resolve(mockRedisResults)),
};

const mockDb = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([]),
    }),
  }),
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn(() => Promise.resolve(mockRows)),
    }),
  }),
};

const mockRedis = {
  set: vi.fn().mockResolvedValue("OK"),
  get: vi.fn().mockResolvedValue(null),
  pipeline: vi.fn(() => mockPipeline),
};

vi.mock("@pimscout/db", () => ({
  getDb: () => mockDb,
  getRedis: () => mockRedis,
  enrichments: {
    id: {},
    founderId: {},
    source: {},
    protocol: { enumValues: ["webhook", "api", "file"] },
    createdAt: {},
    updatedAt: {},
  },
  enrichmentChanges: {},
}));

import { consolidate } from "../enrichment.js";

describe("EnrichmentAccess.consolidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRows.length = 0;
    mockRedisResults.length = 0;
    // Re-wire the mock chain after clearAllMocks
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn(() => Promise.resolve(mockRows)),
      }),
    });
    mockRedis.pipeline.mockReturnValue(mockPipeline);
    mockPipeline.exec.mockImplementation(() => Promise.resolve(mockRedisResults));
  });

  it("returns empty consolidation when no enrichments exist", async () => {
    const result = await consolidate("founder-empty");

    expect(result.founderId).toBe("founder-empty");
    expect(result.topics).toEqual([]);
    expect(result.actionItems).toEqual([]);
    expect(result.keyQuestions).toEqual([]);
    expect(result.summaries).toEqual([]);
    expect(result.sources).toEqual([]);
  });

  it("normalizes Read.ai webhook data correctly", async () => {
    mockRows.push({
      id: "enr-1",
      founderId: "founder-1",
      source: "read-ai",
      protocol: "webhook",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRedisResults.push({
      topics: ["AI infrastructure", "Series A"],
      action_items: ["Send pitch deck", "Schedule follow-up"],
      key_questions: ["What is the TAM?"],
      summary: { overview: "Discussed AI infrastructure startup raising Series A" },
    });

    const result = await consolidate("founder-1");

    expect(result.topics).toEqual(["AI infrastructure", "Series A"]);
    expect(result.actionItems).toEqual(["Send pitch deck", "Schedule follow-up"]);
    expect(result.keyQuestions).toEqual(["What is the TAM?"]);
    expect(result.summaries).toEqual(["Discussed AI infrastructure startup raising Series A"]);
    expect(result.sources).toEqual(["read-ai"]);
  });

  it("uses fallback normalizer for unknown sources", async () => {
    mockRows.push({
      id: "enr-2",
      founderId: "founder-2",
      source: "apollo",
      protocol: "api",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRedisResults.push({
      topics: ["Fintech"],
      summary: "A fintech startup overview",
    });

    const result = await consolidate("founder-2");

    expect(result.topics).toEqual(["Fintech"]);
    expect(result.summaries).toEqual(["A fintech startup overview"]);
    expect(result.sources).toEqual(["apollo"]);
  });

  it("deduplicates topics and action items across sources", async () => {
    mockRows.push(
      { id: "enr-1", founderId: "f-1", source: "read-ai", protocol: "webhook", createdAt: new Date(), updatedAt: new Date() },
      { id: "enr-2", founderId: "f-1", source: "manual", protocol: "api", createdAt: new Date(), updatedAt: new Date() },
    );

    mockRedisResults.push(
      { topics: ["AI", "ML"], action_items: ["Send deck"], summary: { overview: "Meeting 1" } },
      { topics: ["AI", "Robotics"], action_items: ["Send deck", "Review pitch"] },
    );

    const result = await consolidate("f-1");

    expect(result.topics).toEqual(["AI", "ML", "Robotics"]);
    expect(result.actionItems).toEqual(["Send deck", "Review pitch"]);
    expect(result.sources).toEqual(["read-ai", "manual"]);
  });

  it("skips enrichments with null rawData (orphaned Pg rows)", async () => {
    mockRows.push({
      id: "enr-1",
      founderId: "f-1",
      source: "read-ai",
      protocol: "webhook",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRedisResults.push(null);

    const result = await consolidate("f-1");

    expect(result.topics).toEqual([]);
    expect(result.sources).toEqual([]);
  });
});
