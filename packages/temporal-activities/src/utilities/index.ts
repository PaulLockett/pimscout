import * as llm from "./llm.js";

export const llmUtility = {
  composeEmail: llm.composeEmail,
  retrieveInteractions: llm.retrieveInteractions,
};

export type { RetrieveInteractionsOptions, LoggedInteraction } from "./llm.js";
