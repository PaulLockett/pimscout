export { createConnection, type ConnectionConfig } from "./connection.js";
export { getTemporalClient, startWorkflow } from "./client.js";
export { TASK_QUEUES, type TaskQueue } from "./task-queues.js";
export {
  COMPONENTS,
  VALID_COMPONENTS,
  type ComponentConfig,
  type ComponentType,
} from "./registry.js";
