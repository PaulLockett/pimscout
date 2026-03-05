// ComposingEngine — content strategy volatility
// Template path: Boardy intro only (regex interpolation)
// LLM path: all other message types via Ax programs through LLM Utility

import type { PersonalizationLevel, ComposeInput, ComposeResult } from "@pimscout/schemas";
import { retrieve } from "../resource-access/founder.js";
import { lookup } from "../resource-access/enrichment.js";
import { composeEmail } from "../utilities/llm.js";
import { findTemplate, interpolate, type TemplateVars } from "./templates.js";

// ─── Personalization Decision Map ───────────────────────────────────────────
// Data table, not if/else. stage + messageType → personalization level.

const PERSONALIZATION_MAP: Record<string, PersonalizationLevel> = {
  "intake:boardy-intro": "template",
  "intake:onboarding-nudge": "light-ai",
  "active-boardy-onboarding:onboarding-nudge": "light-ai",
  "active-boardy-onboarding:follow-up": "light-ai",
  "active-nurture:relationship-building": "full-ai",
  "active-nurture:follow-up": "full-ai",
  "active-nurture:check-in": "full-ai",
  "warm:relationship-building": "full-ai",
  "warm:check-in": "full-ai",
  "dormant:check-in": "light-ai",
};

function resolvePersonalization(stage: string, messageType: string): PersonalizationLevel {
  return PERSONALIZATION_MAP[`${stage}:${messageType}`] ?? "light-ai";
}

// ─── Business Verbs ─────────────────────────────────────────────────────────

export async function selectTemplate(
  stage: string,
  messageType: string,
): Promise<string | null> {
  const template = findTemplate(stage, messageType);
  return template?.id ?? null;
}

export async function compose(input: ComposeInput): Promise<ComposeResult> {
  // 1. Get relationship + founder data
  const relationship = await retrieve(input.relationshipId);
  if (!relationship) {
    throw new Error(`Relationship ${input.relationshipId} not found`);
  }

  const stage = relationship.stage;
  const personalizationLevel = resolvePersonalization(stage, input.messageType);

  // 2. Template path
  if (personalizationLevel === "template") {
    const template = findTemplate(stage, input.messageType);
    if (template) {
      const vars: TemplateVars = {
        founderName: relationship.founder.name,
        companyName: relationship.founder.companyName,
        referringPartner: relationship.founder.referringPartner ?? "Partner",
      };

      return {
        subject: interpolate(template.subject, vars),
        body: interpolate(template.body, vars),
        personalizationLevel,
        recipients: [relationship.founder.email],
        cc: [],
        generationContext: { templateId: template.id, vars },
      };
    }
  }

  // 3. LLM path — pull enriched context if available
  let enrichedTopics: string[] = [];
  let actionItems: string[] = [];
  let lastInteractionSummary: string | undefined;

  if (input.enrichmentId) {
    const enrichments = await lookup(input.founderId, { source: "enriched-context" });
    if (enrichments.length > 0) {
      const latest = enrichments[enrichments.length - 1];
      if (latest.rawData) {
        enrichedTopics = (latest.rawData["topics"] as string[]) ?? [];
        actionItems = (latest.rawData["actionItems"] as string[]) ?? [];
        const summaries = latest.rawData["summaries"] as string[];
        lastInteractionSummary = summaries?.[summaries.length - 1];
      }
    }
  }

  if (!lastInteractionSummary) {
    lastInteractionSummary = relationship.lastInteractionSummary ?? undefined;
  }

  // 4. Call LLM via utility
  const llmResult = await composeEmail({
    founderName: relationship.founder.name,
    companyName: relationship.founder.companyName,
    sector: relationship.founder.sector ?? undefined,
    relationshipStage: stage,
    messageType: input.messageType,
    enrichedTopics,
    actionItems,
    lastInteractionSummary,
    interactionCount: relationship.interactionCount,
    callerEngine: "composing-engine",
  });

  return {
    subject: llmResult.subjectLine,
    body: llmResult.emailBody,
    personalizationLevel,
    recipients: [relationship.founder.email],
    cc: [],
    generationContext: { interactionId: llmResult.interactionId, personalizationLevel },
  };
}
