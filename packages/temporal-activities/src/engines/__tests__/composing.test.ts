import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before imports
vi.mock("../../resource-access/founder.js", () => ({
  retrieve: vi.fn(),
}));

vi.mock("../../resource-access/enrichment.js", () => ({
  lookup: vi.fn(),
}));

vi.mock("../../utilities/llm.js", () => ({
  composeEmail: vi.fn(),
}));

import { compose, selectTemplate } from "../composing.js";
import { retrieve } from "../../resource-access/founder.js";
import { lookup } from "../../resource-access/enrichment.js";
import { composeEmail } from "../../utilities/llm.js";
import type { RetrieveResult } from "../../resource-access/founder.js";

const mockRetrieve = vi.mocked(retrieve);
const mockLookup = vi.mocked(lookup);
const mockComposeEmail = vi.mocked(composeEmail);

const MOCK_RELATIONSHIP: RetrieveResult = {
  relationshipId: "rel-1",
  scoutId: "scout-1",
  founderId: "founder-1",
  stage: "intake",
  boardyStatus: "not-referred",
  cadencePosition: 0,
  interactionCount: 0,
  nextTouchpoint: null,
  lastInteractionAt: null,
  lastInteractionChannel: null,
  lastInteractionSummary: null,
  activePaths: ["boardy-referral"],
  founder: {
    id: "founder-1",
    name: "Sarah Chen",
    email: "sarah@quantumleap.ai",
    companyName: "QuantumLeap AI",
    source: "generator",
    stage: "Series A",
    raiseAmount: "$5M",
    sector: "AI/ML",
    oneLiner: "AI-powered quantum computing",
    deckLink: null,
    referringPartner: "Jessica from Generator",
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ComposingEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("selectTemplate", () => {
    it("returns template ID for intake boardy-intro", async () => {
      const id = await selectTemplate("intake", "boardy-intro");
      expect(id).toBe("boardy-intro-v1");
    });

    it("returns null for non-template combinations", async () => {
      expect(await selectTemplate("warm", "check-in")).toBeNull();
      expect(await selectTemplate("active-nurture", "relationship-building")).toBeNull();
    });
  });

  describe("compose — template path", () => {
    it("produces interpolated Boardy intro for intake + boardy-intro", async () => {
      mockRetrieve.mockResolvedValue(MOCK_RELATIONSHIP);

      const result = await compose({
        founderId: "founder-1",
        relationshipId: "rel-1",
        messageType: "boardy-intro",
      });

      expect(result.personalizationLevel).toBe("template");
      expect(result.subject).toContain("Sarah Chen");
      expect(result.subject).toContain("QuantumLeap AI");
      expect(result.body).toContain("Jessica from Generator, thank you for the introduction");
      expect(result.body).toContain("founder of QuantumLeap AI");
      expect(result.recipients).toEqual(["sarah@quantumleap.ai"]);
      expect(result.generationContext).toHaveProperty("templateId", "boardy-intro-v1");

      // Should NOT call LLM for template path
      expect(mockComposeEmail).not.toHaveBeenCalled();
    });
  });

  describe("compose — LLM path", () => {
    it("routes to LLM for non-template message types", async () => {
      const nurtureRelationship = {
        ...MOCK_RELATIONSHIP,
        stage: "active-nurture",
        interactionCount: 5,
        lastInteractionSummary: "Discussed product-market fit",
      };
      mockRetrieve.mockResolvedValue(nurtureRelationship);
      mockLookup.mockResolvedValue([]);
      mockComposeEmail.mockResolvedValue({
        subjectLine: "Following up on our chat",
        emailBody: "Hi Sarah, great talking about PMF...",
        interactionId: "inf-123",
      });

      const result = await compose({
        founderId: "founder-1",
        relationshipId: "rel-1",
        messageType: "relationship-building",
      });

      expect(result.personalizationLevel).toBe("full-ai");
      expect(result.subject).toBe("Following up on our chat");
      expect(result.body).toContain("great talking about PMF");
      expect(result.generationContext).toHaveProperty("interactionId", "inf-123");
      expect(mockComposeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          founderName: "Sarah Chen",
          companyName: "QuantumLeap AI",
          relationshipStage: "active-nurture",
          messageType: "relationship-building",
          interactionCount: 5,
        }),
      );
    });

    it("uses enriched context when enrichmentId is provided", async () => {
      const activeRelationship = {
        ...MOCK_RELATIONSHIP,
        stage: "active-nurture",
        interactionCount: 3,
      };
      mockRetrieve.mockResolvedValue(activeRelationship);
      mockLookup.mockResolvedValue([
        {
          id: "enr-1",
          founderId: "founder-1",
          source: "enriched-context",
          protocol: "api",
          rawData: {
            topics: ["AI agents", "fundraising"],
            actionItems: ["Send term sheet"],
            summaries: ["Explored AI agent capabilities"],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockComposeEmail.mockResolvedValue({
        subjectLine: "AI Agents & Next Steps",
        emailBody: "Hi Sarah, following up on AI agents...",
        interactionId: "inf-456",
      });

      const result = await compose({
        founderId: "founder-1",
        relationshipId: "rel-1",
        messageType: "follow-up",
        enrichmentId: "enr-1",
      });

      expect(result.personalizationLevel).toBe("full-ai");
      expect(mockComposeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          enrichedTopics: ["AI agents", "fundraising"],
          actionItems: ["Send term sheet"],
          lastInteractionSummary: "Explored AI agent capabilities",
        }),
      );
    });
  });

  describe("compose — error handling", () => {
    it("throws when relationship not found", async () => {
      mockRetrieve.mockResolvedValue(null);

      await expect(
        compose({
          founderId: "founder-1",
          relationshipId: "rel-nonexistent",
          messageType: "boardy-intro",
        }),
      ).rejects.toThrow("Relationship rel-nonexistent not found");
    });
  });
});
