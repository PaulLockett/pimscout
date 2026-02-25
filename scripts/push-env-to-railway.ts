#!/usr/bin/env tsx
/**
 * Routes environment variables to the correct Railway services.
 * Follows principle of least privilege: each service only gets the vars it needs.
 *
 * Usage:
 *   pnpm tsx scripts/push-env-to-railway.ts              # apply
 *   pnpm tsx scripts/push-env-to-railway.ts --dry-run    # preview only
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ALL_SERVICES = [
  "relationship-manager",
  "composing-engine",
  "enriching-engine",
  "founder-access",
  "message-access",
  "delivery-access",
  "enrichment-access",
] as const;

// Which services need which env vars
const VAR_ROUTING: Record<string, readonly string[]> = {
  // Temporal — all workers need these
  TEMPORAL_ADDRESS: ALL_SERVICES,
  TEMPORAL_NAMESPACE: ALL_SERVICES,
  TEMPORAL_API_KEY: ALL_SERVICES,

  // Database — resource-access services + manager
  DATABASE_URL: [
    "relationship-manager",
    "founder-access",
    "message-access",
    "delivery-access",
    "enrichment-access",
  ],

  // Email — only delivery-access sends email
  RESEND_API_KEY: ["delivery-access"],

  // LLM — engines do AI work
  OPENROUTER_API_KEY: ["composing-engine", "enriching-engine"],
};

function parseEnvFile(path: string): Record<string, string> {
  const content = readFileSync(path, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    let value = trimmed.slice(eqIdx + 1);
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const dryRun = process.argv.includes("--dry-run");
const envPath = resolve(process.cwd(), ".env");
const envVars = parseEnvFile(envPath);

for (const [varName, services] of Object.entries(VAR_ROUTING)) {
  const value = envVars[varName];
  if (!value) {
    console.log(`⏭️  ${varName}: not set in .env, skipping`);
    continue;
  }

  for (const service of services) {
    const cmd = `railway variables set "${varName}=${value}" --service "${service}"`;
    if (dryRun) {
      console.log(`[DRY RUN] ${service}: ${varName}=***`);
    } else {
      console.log(`Setting ${varName} on ${service}...`);
      try {
        execSync(cmd, { stdio: "pipe" });
      } catch (err) {
        console.error(`  Failed for ${service}:`, (err as Error).message);
      }
    }
  }
}

// Set COMPONENT on each service
for (const service of ALL_SERVICES) {
  const cmd = `railway variables set "COMPONENT=${service}" --service "${service}"`;
  if (dryRun) {
    console.log(`[DRY RUN] ${service}: COMPONENT=${service}`);
  } else {
    console.log(`Setting COMPONENT=${service} on ${service}...`);
    try {
      execSync(cmd, { stdio: "pipe" });
    } catch (err) {
      console.error(`  Failed for ${service}:`, (err as Error).message);
    }
  }
}

console.log(dryRun ? "\nDry run complete." : "\nAll variables pushed.");
