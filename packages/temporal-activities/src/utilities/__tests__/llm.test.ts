import { describe, it, expect, vi, beforeEach } from "vitest";

// Build a query chain mock that's thenable (resolves to resultRows)
const resultRows: Array<Record<string, unknown>> = [];

function makeThenableChain() {
  const chain: Record<string, unknown> = {};
  const thenable = {
    then: (resolve: (v: unknown) => void) => resolve(resultRows),
  };
  chain.where = vi.fn(() => thenable);
  chain.limit = vi.fn(() => ({ ...thenable, where: chain.where }));
  chain.orderBy = vi.fn(() => ({ ...thenable, limit: chain.limit }));
  chain.from = vi.fn(() => ({ ...thenable, orderBy: chain.orderBy }));
  return chain;
}

const mockInsertRow = {
  id: "interaction-1",
  programName: "compose-email",
  callerEngine: "composing-engine",
  model: "anthropic/claude-sonnet-4-20250514",
  inputTokens: 0,
  outputTokens: 0,
  latencyMs: 100,
  status: "success",
  createdAt: new Date(),
};

const mockDb = {
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([mockInsertRow]),
    }),
  }),
  select: vi.fn(() => makeThenableChain()),
};

const mockPipeline = {
  get: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue([]),
};

const mockRedis = {
  set: vi.fn().mockResolvedValue("OK"),
  pipeline: vi.fn(() => mockPipeline),
};

vi.mock("@pimscout/db", () => ({
  getDb: () => mockDb,
  getRedis: () => mockRedis,
  aiInteractions: {
    id: {},
    programName: {},
    callerEngine: {},
    model: {},
    inputTokens: {},
    outputTokens: {},
    latencyMs: {},
    status: { enumValues: ["success", "error", "retry"] },
    createdAt: {},
  },
}));

vi.mock("@pimscout/ai", () => ({
  getAx: vi.fn(() => ({})),
}));

vi.mock("@pimscout/ai/programs", () => ({
  runComposeEmail: vi.fn().mockResolvedValue({
    subjectLine: "Test Subject",
    emailBody: "Test body content",
  }),
}));

import { composeEmail, retrieveInteractions } from "../llm.js";

describe("LLM Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resultRows.length = 0;
    // Re-wire mocks after clear
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockInsertRow]),
      }),
    });
    mockDb.select.mockImplementation(() => makeThenableChain());
    mockRedis.pipeline.mockReturnValue(mockPipeline);
    mockPipeline.exec.mockResolvedValue([]);
  });

  describe("composeEmail", () => {
    it("runs the Ax program and logs interaction", async () => {
      const result = await composeEmail({
        founderName: "Alice",
        companyName: "StartupCo",
        relationshipStage: "active-nurture",
        messageType: "follow-up",
        interactionCount: 3,
      });

      expect(result.subjectLine).toBe("Test Subject");
      expect(result.emailBody).toBe("Test body content");
      expect(result.interactionId).toBe("interaction-1");
    });

    it("logs error interaction when Ax program fails", async () => {
      const { runComposeEmail } = await import("@pimscout/ai/programs");
      vi.mocked(runComposeEmail).mockRejectedValueOnce(new Error("LLM timeout"));

      await expect(
        composeEmail({
          founderName: "Bob",
          companyName: "FailCo",
          relationshipStage: "warm",
          messageType: "check-in",
          interactionCount: 1,
        }),
      ).rejects.toThrow("compose-email failed");
    });
  });

  describe("retrieveInteractions", () => {
    it("returns empty array when no interactions exist", async () => {
      const result = await retrieveInteractions({ limit: 10 });
      expect(result).toEqual([]);
    });
  });
});
