import { NativeConnection, Worker } from "@temporalio/worker";
import { COMPONENTS, VALID_COMPONENTS } from "@pimscout/temporal-client";

const COMPONENT = process.env.COMPONENT;

if (!COMPONENT) {
  console.error("COMPONENT env var is required.");
  console.error(`Valid components: ${VALID_COMPONENTS.join(", ")}`);
  process.exit(1);
}

const config = COMPONENTS[COMPONENT];
if (!config) {
  console.error(`Unknown COMPONENT: ${COMPONENT}`);
  console.error(`Valid components: ${VALID_COMPONENTS.join(", ")}`);
  process.exit(1);
}

async function run() {
  const address = process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const namespace = process.env.TEMPORAL_NAMESPACE ?? "default";
  const apiKey = process.env.TEMPORAL_API_KEY;

  console.log(`Starting ${COMPONENT} on queue: ${config.taskQueue}`);

  const connection = await NativeConnection.connect({
    address,
    ...(apiKey &&
    (address.includes("tmprl.cloud") || address.includes("temporal.io"))
      ? { tls: true, apiKey, metadata: { "temporal-namespace": namespace } }
      : {}),
  });

  let workflowsPath: string | undefined;
  if (config.workflowSubpath) {
    workflowsPath = new URL(
      `../../../packages/temporal-workflows/src/${config.workflowSubpath}/index.ts`,
      import.meta.url,
    ).pathname;
  }

  let activities: Record<string, (...args: unknown[]) => unknown> | undefined;
  if (config.activityModule && config.activityExport) {
    const mod = await import(config.activityModule);
    activities = mod[config.activityExport];
    if (!activities) {
      console.error(
        `Activity export "${config.activityExport}" not found in ${config.activityModule}`,
      );
      process.exit(1);
    }
  }

  const worker = await Worker.create({
    connection,
    namespace,
    taskQueue: config.taskQueue,
    ...(workflowsPath ? { workflowsPath } : {}),
    ...(activities ? { activities } : {}),
  });

  console.log(`${COMPONENT} worker started successfully`);

  const shutdown = () => {
    console.log(`Shutting down ${COMPONENT}...`);
    worker.shutdown();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await worker.run();
  console.log(`${COMPONENT} worker stopped`);
}

run().catch((err) => {
  console.error(`${COMPONENT} worker failed:`, err);
  process.exit(1);
});
