import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the enrichment RA before importing the engine
vi.mock("../../resource-access/enrichment.js", () => ({
  consolidate: vi.fn(),
  supplement: vi.fn(),
}));

import { enrich } from "../enriching.js";
import { consolidate, supplement } from "../../resource-access/enrichment.js";
import type { ConsolidatedEnrichment } from "@pimscout/schemas";

const mockConsolidate = vi.mocked(consolidate);
const mockSupplement = vi.mocked(supplement);

describe("EnrichingEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("enrich", () => {
    it("consolidates data from RA and persists enriched context", async () => {
      const founderId = "founder-123";
      const consolidated: ConsolidatedEnrichment = {
        founderId,
        topics: ["AI", "Series A"],
        actionItems: ["Send deck"],
        keyQuestions: ["What's the TAM?"],
        summaries: ["Discussed AI startup raising Series A"],
        companyContext: { sector: "AI/ML", stage: "Series A" },
        sources: ["read-ai"],
        lastConsolidatedAt: new Date(),
      };

      mockConsolidate.mockResolvedValue(consolidated);
      mockSupplement.mockResolvedValue("enrichment-456");

      const enrichmentId = await enrich(founderId);

      expect(mockConsolidate).toHaveBeenCalledWith(founderId);
      expect(mockSupplement).toHaveBeenCalledWith({
        founderId,
        source: "enriched-context",
        protocol: "api",
        rawData: consolidated,
      });
      expect(enrichmentId).toBe("enrichment-456");
    });

    it("returns enrichmentId even when no enrichments exist", async () => {
      const founderId = "founder-empty";
      const emptyConsolidated: ConsolidatedEnrichment = {
        founderId,
        topics: [],
        actionItems: [],
        keyQuestions: [],
        summaries: [],
        companyContext: {},
        sources: [],
        lastConsolidatedAt: new Date(),
      };

      mockConsolidate.mockResolvedValue(emptyConsolidated);
      mockSupplement.mockResolvedValue("enrichment-789");

      const enrichmentId = await enrich(founderId);

      expect(enrichmentId).toBe("enrichment-789");
      expect(mockSupplement).toHaveBeenCalledWith(
        expect.objectContaining({
          source: "enriched-context",
          protocol: "api",
        }),
      );
    });
  });
});
