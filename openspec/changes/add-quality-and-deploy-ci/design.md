## Context

The Worker still accepts unauthenticated HTTP requests and queues request headers. Publishing it automatically would violate accepted owner-only requirements. Existing Effect foundation includes intentionally unconnected exports. Agent examples and generated declarations are not application sources.

## Decisions

- Use pinned local Biome/fallow CLIs through pnpm; no cloud analysis or paid license.
- Biome formats/lints application/tests/config. Exclude CLI-generated agent integrations and worker declarations.
- fallow checks dead code with an explicit failing exit flag. Configure runtime/test entry points and document narrowly scoped exceptions for pending MVP integration. Avoid a blanket baseline.
- Reusable quality workflow runs without secrets and includes OpenSpec strict validation plus Wrangler dry-run. It runs for all PR/main changes, eliminating path-filter gaps.
- Deployment uses workflow_dispatch on main only, runs the same checks, and requires DEPLOYMENT_READY=true in the production environment. Never deploy PR code with secrets. Use locked local Wrangler rather than a second action-managed version.
- Serialize production deployments; do not cancel an in-progress deployment. Validate credentials only in deployment job.
- Current credentials, resource existence, auth/budget readiness and free-plan suitability cannot be proved locally. Keep deployment disabled until owner configures and verifies them. Do not auto-create infrastructure or upgrade plans.

## Risks and Verification

Wrangler dry-run proves bundling, not provider access or runtime correctness. Quality tools may report legitimate pending entry exports; inspect findings and use explicit temporary configuration only. Run local checks and negative probes to prove findings fail. Record discovered tool constraints below.

## Findings during implementation
Biome 2.6.4 supports formatting Markdown as well as code; restrict includes to code/config to avoid unrelated document churn. The recommended field migrated to preset. Effect TaggedError empty-field types need a file-scoped noBannedTypes exception. Removing the unused template import exposes the pending src/notion.ts as an unused file; use a single-file ignoreFindings exception until Issue #6 integration, retaining dependency graph analysis. Wrangler entry detection already finds src/index.ts; keep only test entries explicit.

PR #13 review found that `pnpm deploy` selects pnpm's built-in workspace packaging command instead of the package script. Invoke `pnpm run deploy` explicitly to reach the locked Wrangler, preserving all readiness and credential gates. Verify the actual script with `pnpm run deploy --dry-run`; this checks command routing and bundling without publishing. This directly fixes the invocation and requires no dependency or requirement changes. References: https://pnpm.io/cli/run and https://developers.cloudflare.com/workers/wrangler/commands/.
