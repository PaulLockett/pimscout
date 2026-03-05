import { TASK_QUEUES, type TaskQueue } from "./task-queues.js";

export type ComponentType = "manager" | "engine" | "resource-access" | "utility";

export interface ComponentConfig {
  taskQueue: TaskQueue;
  type: ComponentType;
  workflowSubpath: string | null;
  activityModule: string | null;
  activityExport: string | null;
}

export const COMPONENTS: Record<string, ComponentConfig> = {
  "relationship-manager": {
    taskQueue: TASK_QUEUES.RELATIONSHIP_MANAGER,
    type: "manager",
    workflowSubpath: "relationship",
    activityModule: null,
    activityExport: null,
  },
  "composing-engine": {
    taskQueue: TASK_QUEUES.COMPOSING_ENGINE,
    type: "engine",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/engines",
    activityExport: "composingEngine",
  },
  "enriching-engine": {
    taskQueue: TASK_QUEUES.ENRICHING_ENGINE,
    type: "engine",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/engines",
    activityExport: "enrichingEngine",
  },
  "founder-access": {
    taskQueue: TASK_QUEUES.FOUNDER_ACCESS,
    type: "resource-access",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/resource-access",
    activityExport: "founderAccess",
  },
  "message-access": {
    taskQueue: TASK_QUEUES.MESSAGE_ACCESS,
    type: "resource-access",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/resource-access",
    activityExport: "messageAccess",
  },
  "delivery-access": {
    taskQueue: TASK_QUEUES.DELIVERY_ACCESS,
    type: "resource-access",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/resource-access",
    activityExport: "deliveryAccess",
  },
  "enrichment-access": {
    taskQueue: TASK_QUEUES.ENRICHMENT_ACCESS,
    type: "resource-access",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/resource-access",
    activityExport: "enrichmentAccess",
  },
  "llm-utility": {
    taskQueue: TASK_QUEUES.LLM_UTILITY,
    type: "utility",
    workflowSubpath: null,
    activityModule: "@pimscout/temporal-activities/utilities",
    activityExport: "llmUtility",
  },
} as const;

export const VALID_COMPONENTS = Object.keys(COMPONENTS);
