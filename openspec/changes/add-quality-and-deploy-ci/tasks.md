## 1. Quality and deployment

- [x] 1.1 Pin and configure Biome/fallow with source scope and documented exceptions (#12).
- [x] 1.2 Add reusable quality checks and main-only gated manual deployment (#12).
- [x] 1.3 Document secrets, readiness, existing resource setup and free-plan verification (#12, #2, #7).
- [x] 1.4 Run quality, type, test, OpenSpec, dry-run and negative quality-gate probes; record limitations (#12).

Local verification passed: frozen install; Biome; fallow; typecheck; 7 tests; 3 strict OpenSpec changes; Wrangler dry-run; git diff --check. Negative Biome/fallow probes exit 1. Readiness shell rejects missing/false and accepts true. YAML parsed locally. GitHub-hosted execution and actual deployment remain external verification; credentials/readiness are not configured by this change.
