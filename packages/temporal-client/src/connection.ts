import { Connection } from "@temporalio/client";

export interface ConnectionConfig {
  address?: string;
  namespace?: string;
  apiKey?: string;
}

export async function createConnection(
  config?: ConnectionConfig,
): Promise<Connection> {
  const address =
    config?.address ?? process.env.TEMPORAL_ADDRESS ?? "localhost:7233";
  const namespace =
    config?.namespace ?? process.env.TEMPORAL_NAMESPACE ?? "default";
  const apiKey = config?.apiKey ?? process.env.TEMPORAL_API_KEY;

  if (apiKey && address.includes("tmprl.cloud")) {
    return Connection.connect({
      address,
      tls: true,
      apiKey,
      metadata: {
        "temporal-namespace": namespace,
      },
    });
  }

  return Connection.connect({ address });
}
