# Netz: specification-driven development

Read `docs/openspec-workflow.md` and `openspec/config.yaml` before implementation.
GitHub Issues are the primary task tracker. Start from an issue and inherit its purpose,
scope, acceptance criteria and dependencies into an OpenSpec change before implementation.
Follow the mandatory Issue → OpenSpec → implementation → verification flow in
`docs/openspec-workflow.md`.

- Link the source issue in the OpenSpec proposal and map implementation tasks to it.
- Record newly discovered constraints/problems and evidence in OpenSpec before affected implementation proceeds.
- Prefer removing technical constraints or fixing root causes when feasible within accepted requirements.
- If direct resolution is difficult, record why and choose a verified workaround that preserves the requirements.
- Record alternatives, residual limitations, follow-up work and verification in design/tasks; update delta specs/scenarios for behavior changes.
- Reflect material scope, acceptance, blocker and follow-up changes back into Issues; keep fine-grained implementation steps in OpenSpec.
- A workaround does not authorize weakening owner-only access, zero spending, shared budgets or evidence criteria.
- If no compliant solution exists, mark the affected work blocked with evidence and options; continue independent work.
Current MVP change: `openspec/changes/implement-research-workflow/` (not implemented yet).

- Read relevant main specs and active delta specs, design and tasks before editing code.
- When implementation reveals a detail change, update design/tasks and its rationale.
- When observable behavior changes, update delta requirements and scenarios in the same PR.
- Preserve owner-only access, zero additional spending, shared request budgets and evidence-based sufficiency.
- Do not silently weaken accepted constraints or a running research plan to match implementation.
- Resolve documented adoption gates before dependent implementation; distinguish mocks from live evidence.
- Run `openspec validate --all --strict --no-interactive` and relevant scenario checks.
- Artifact readiness and syntax validation do not prove implementation completion. Do not archive unfinished work.
- Generated `.claude` / `.agents` OpenSpec integrations are CLI-owned. Put custom rules in config/docs.

# Effect TypeScript

For Effect implementation or review, read `.agents/skills/write-effect-typescript/SKILL.md`
and its relevant references. This repository-owned skill is separate from generated OpenSpec skills.
Check the installed Effect version first; bundled examples target 4.1.0.
The skill does not install Effect or imply that the foundation in PR #9 is merged.

# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Local Explorer (Debugging & Inspection)

When running `npx wrangler dev`, a Local Explorer API is available for inspecting and debugging local Workers, bindings, and storage state. The API base URL is printed in the terminal when the dev server starts.

Key endpoints (relative to the dev server URL):

| Endpoint | Description |
|----------|-------------|
| `GET /cdn-cgi/local/explorer/api/local/workers` | List local Workers and their bindings |
| `GET /cdn-cgi/local/explorer/api/storage/kv/namespaces` | List KV namespaces |
| `GET /cdn-cgi/local/explorer/api/d1/database` | List D1 databases |
| `GET /cdn-cgi/local/explorer/api/r2/buckets` | List R2 buckets |
| `GET /cdn-cgi/local/explorer/api/workers/durable_objects/namespaces` | List Durable Object namespaces |
| `GET /cdn-cgi/local/explorer/api/workflows` | List Workflows |
| `POST /cdn-cgi/local/explorer/api/local/observability/query` | Run a read-only SQL query (SELECT/WITH only) over captured request traces and console logs. Tables: `spans`, `logs` (read attributes via `json(attributes)`). Example: `curl -X POST <base>/cdn-cgi/local/explorer/api/local/observability/query -H 'Content-Type: application/json' -d '{"sql":"SELECT service, name, outcome, duration_ms FROM spans WHERE parent_id IS NULL LIMIT 20"}'` |
| `POST /cdn-cgi/local/explorer/api/local/observability/clear` | Clear all captured traces and logs |

If the routes above don't cover what you need, fetch the full OpenAPI schema (large - use only as a last resort): `GET /cdn-cgi/local/explorer/api`

Use the Local Explorer to debug issues by inspecting storage state (KV keys, D1 rows, R2 objects, DO storage), viewing Worker bindings, and querying request traces and logs captured during the dev session.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
