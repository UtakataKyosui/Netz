## ADDED Requirements

### Requirement: Reproducible quality gates

The repository SHALL run pinned Biome and fallow checks, type checking, tests, OpenSpec strict validation and a Worker dry-run build on pull requests and main pushes without deployment credentials.

#### Scenario: Quality finding

- **WHEN** an in-scope Biome or fallow finding is introduced
- **THEN** the quality job fails instead of silently reporting success

#### Scenario: Untrusted pull request

- **WHEN** a pull request runs CI
- **THEN** checks execute without Cloudflare deployment secrets and no Worker is published

### Requirement: Gated production deployment

The deployment workflow SHALL accept only manual execution from main, require successful quality checks and explicit production readiness, and use production credentials with serialized deployments.

#### Scenario: Not ready

- **WHEN** production readiness has not been configured as true
- **THEN** deployment is rejected before any Cloudflare deployment command

#### Scenario: Deploy a ready revision

- **WHEN** a main revision passes checks and production readiness and credentials are configured
- **THEN** the workflow can deploy that checked revision using the locked Wrangler dependency
