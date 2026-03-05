// compose-email — Ax DSPy-style email composition signature
// Typed signature: enrichment context in → subject + body out
// reasoning! field enables chain-of-thought without leaking to caller

import { ax, type AxAIService } from "@ax-llm/ax";
import type { ComposeEmailInput, ComposeEmailOutput } from "../index.js";

const emailComposer = ax(`
  "Compose a personalized email from a venture scout to a startup founder.
  The tone should be warm, professional, and concise. Reference specific details
  from the enrichment context when available."
  founderName:string,
  companyName:string,
  sector?:string,
  relationshipStage:string,
  messageType:string,
  enrichedTopics?:string[],
  actionItems?:string[],
  lastInteractionSummary?:string,
  interactionCount:number
  ->
  reasoning!:string "Step-by-step thinking about personalization approach",
  subjectLine:string "Email subject line, concise and relevant",
  emailBody:string "Full email body with greeting and sign-off"
`);

export async function runComposeEmail(
  llm: AxAIService,
  input: ComposeEmailInput,
): Promise<ComposeEmailOutput> {
  const result = await emailComposer.forward(llm, input);
  return {
    subjectLine: result.subjectLine as string,
    emailBody: result.emailBody as string,
  };
}
