export const TASK_QUEUES = {
  RELATIONSHIP_MANAGER: "relationship-manager",
  COMPOSING_ENGINE: "composing-engine",
  ENRICHING_ENGINE: "enriching-engine",
  FOUNDER_ACCESS: "founder-access",
  MESSAGE_ACCESS: "message-access",
  DELIVERY_ACCESS: "delivery-access",
  ENRICHMENT_ACCESS: "enrichment-access",
  LLM_UTILITY: "llm-utility",
} as const;

export type TaskQueue = (typeof TASK_QUEUES)[keyof typeof TASK_QUEUES];
