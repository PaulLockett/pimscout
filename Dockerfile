# Multi-stage build for all Railway services
# COMPONENT env var selects which service to run

# ── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./

# Copy all package.json files for dependency resolution
COPY packages/schemas/package.json packages/schemas/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/temporal-client/package.json packages/temporal-client/package.json
COPY packages/temporal-workflows/package.json packages/temporal-workflows/package.json
COPY packages/temporal-activities/package.json packages/temporal-activities/package.json
COPY workers/runner/package.json workers/runner/package.json
COPY apps/web/package.json apps/web/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ packages/
COPY workers/ workers/
COPY apps/web/ apps/web/

# Build all packages
RUN pnpm turbo build

# ── Runtime stage ────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app ./

# COMPONENT env var determines what runs
ENV COMPONENT=relationship-manager

COPY <<'ENTRYPOINT' /app/entrypoint.sh
#!/bin/sh
set -e
case "$COMPONENT" in
  web)
    echo "Starting PimScout Web (Scout Dashboard)..."
    cd apps/web && node .next/standalone/server.js
    ;;
  relationship-manager|composing-engine|enriching-engine|founder-access|message-access|delivery-access|enrichment-access)
    echo "Starting Temporal worker: $COMPONENT..."
    cd workers/runner && node dist/index.js
    ;;
  *)
    echo "Unknown COMPONENT: $COMPONENT"
    exit 1
    ;;
esac
ENTRYPOINT

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
