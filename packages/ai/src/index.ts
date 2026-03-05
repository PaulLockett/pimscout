// @pimscout/ai — Ax client factory + shared AI types
// Encapsulates AI provider volatility (OpenRouter today, direct APIs tomorrow)

import { ai, type AxAIService } from "@ax-llm/ax";

// ─── Ax Client (lazy singleton) ─────────────────────────────────────────────

let axClient: AxAIService | null = null;

export function getAx(): AxAIService {
  if (!axClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }
    axClient = ai({
      name: "openrouter",
      apiKey,
      config: {
        model: process.env.COMPOSE_MODEL ?? "anthropic/claude-sonnet-4-20250514",
      },
    });
  }
  return axClient;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AiInteraction {
  id: string;
  programName: string;
  callerEngine: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: "success" | "error" | "retry";
  createdAt: Date;
}

export interface ComposeEmailInput {
  founderName: string;
  companyName: string;
  sector?: string;
  relationshipStage: string;
  messageType: string;
  enrichedTopics?: string[];
  actionItems?: string[];
  lastInteractionSummary?: string;
  interactionCount: number;
}

export interface ComposeEmailOutput {
  subjectLine: string;
  emailBody: string;
}

export { ax, type AxAIService } from "@ax-llm/ax";
