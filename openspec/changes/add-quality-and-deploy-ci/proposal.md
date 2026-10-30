## Why

Issue #12 (https://github.com/UtakataKyosui/Netz/issues/12) requires reproducible quality checks and a gated deployment workflow. Current CI checks types/tests but not formatting, dead code or the Worker bundle.

## What Changes

- Pin Biome and fallow, configure source scope and fail on findings.
- Reuse quality/type/test/spec/build checks for PRs, main and deployment.
- Add main-only manual deployment with readiness gate and environment secrets.
- Document preparation and zero-additional-spending constraints.

## Capabilities

### New Capabilities

- `delivery-pipeline`: quality gates and controlled deployment.
### Modified Capabilities

None.

## Impact

Issue #12; related #2/#7. No live deployment or external API calls. Owner authentication and persistent budgets remain separate MVP tasks.
