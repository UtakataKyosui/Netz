# Netz: Claude Code

Read `AGENTS.md` before working in this repository and follow its specification, budget and verification rules.

Start implementation from a GitHub Issue, inherit its requirements into OpenSpec, and follow the constraint/problem resolution flow in `docs/openspec-workflow.md`.
Record discoveries and decisions in OpenSpec, then reflect material changes and follow-up tasks back into Issues.

For Effect TypeScript implementation or review, use `/write-effect-typescript`.
Claude Code discovers its entry point at `.claude/skills/write-effect-typescript/SKILL.md`.
The implementation guidance, references and examples are maintained in `.agents/skills/write-effect-typescript/`; read the shared skill before applying it.

The custom Effect skill is repository-owned. OpenSpec-generated skills and commands remain managed by the OpenSpec CLI.
