# PimScout

Scout Relationship Orchestration Engine — automates founder relationship management for venture scouts.

## Architecture

pnpm + Turbo monorepo with Temporal workflows, Vercel frontend, and Railway workers.

| Layer | Components |
|-------|-----------|
| Client | Scout Dashboard (Next.js), Ingestion Listener, Schedule Trigger |
| Manager | RelationshipManager (Temporal workflow) |
| Engine | ComposingEngine, EnrichingEngine (Temporal activities) |
| ResourceAccess | FounderAccess, MessageAccess, DeliveryAccess, EnrichmentAccess |

## Quick Start

```bash
pnpm install
pnpm turbo build
pnpm --filter web dev      # Scout Dashboard on localhost:3000
```

## Project Structure

```
apps/web/               → Scout Dashboard (Next.js → Vercel)
workers/runner/          → Unified Temporal worker (→ Railway)
packages/schemas/        → Shared TypeScript types
packages/db/             → Drizzle ORM + Supabase
packages/temporal-client/ → Temporal connection + component registry
packages/temporal-workflows/ → Workflow definitions
packages/temporal-activities/ → Activity implementations
```

## Infrastructure

- **Database:** Supabase (PostgreSQL)
- **Workflows:** Temporal Cloud
- **Frontend:** Vercel
- **Workers:** Railway (7 services, same Docker image, different COMPONENT env var)
- **Email:** Resend
- **LLM:** OpenRouter (model-agnostic via DSPy)
