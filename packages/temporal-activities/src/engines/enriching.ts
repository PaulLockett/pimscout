// EnrichingEngine — decides when and why to enrich, not how to parse source data
// Coordinates: get normalized data from RA, persist enriched context, return reference ID
// The RA handles source-specific parsing. The engine coordinates the flow.

import { consolidate, supplement } from "../resource-access/enrichment.js";

export async function enrich(founderId: string): Promise<string> {
  // 1. Get all enrichments for this founder, normalized and merged by RA
  const consolidated = await consolidate(founderId);

  // 2. Persist the enriched context document back to EnrichmentAccess
  const enrichmentId = await supplement({
    founderId,
    source: "enriched-context",
    protocol: "api",
    rawData: consolidated as unknown as Record<string, unknown>,
  });

  // 3. Return reference ID — Manager passes this to ComposingEngine
  return enrichmentId;
}
