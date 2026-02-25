import { Client } from "@temporalio/client";
import { createConnection, type ConnectionConfig } from "./connection.js";

let _client: Client | null = null;

export async function getTemporalClient(
  config?: ConnectionConfig,
): Promise<Client> {
  if (!_client) {
    const connection = await createConnection(config);
    const namespace =
      config?.namespace ?? process.env.TEMPORAL_NAMESPACE ?? "default";
    _client = new Client({ connection, namespace });
  }
  return _client;
}

export async function startWorkflow(
  workflowType: string,
  taskQueue: string,
  workflowId: string,
  args: unknown[],
  config?: ConnectionConfig,
): Promise<{ workflowId: string; firstExecutionRunId: string }> {
  const client = await getTemporalClient(config);
  const handle = await client.workflow.start(workflowType, {
    taskQueue,
    workflowId,
    args,
  });
  return {
    workflowId: handle.workflowId,
    firstExecutionRunId: handle.firstExecutionRunId,
  };
}
