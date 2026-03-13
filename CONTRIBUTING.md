# Contributing Guide

## 1. Branch Strategy
Use feature-branch workflow from `main`.

Allowed branch prefixes:
- `feature/<scope>-<short-desc>`
- `fix/<scope>-<short-desc>`
- `docs/<scope>-<short-desc>`
- `refactor/<scope>-<short-desc>`
- `test/<scope>-<short-desc>`
- `chore/<scope>-<short-desc>`
- `hotfix/<scope>-<short-desc>`

Examples:
- `feature/dashboard-burndown-chart`
- `fix/metrics-null-cycle-time`

## 2. Commit Convention (Conventional Commits)
Format:

`<type>(<scope>): <subject>`

Types:
- `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`

Examples:
- `feat(sprint): add burndown chart`
- `fix(metrics): handle null cycle time`
- `docs(readme): add collaboration rules`

## 3. Pull Request Rules
- Open PR from feature branch into `main`
- PR title must follow Conventional Commits
- Fill all sections in PR template
- Link issue(s)
- Pass all required checks

## 4. Review Rules
- Use tags in each review comment:
  - `[MUST]` merge-blocking problem
  - `[SHOULD]` recommended improvement
  - `[NIT]` minor suggestion
- Example: `[SHOULD] Consider adding a small regression test for this parser edge case.`
- At least 1 approval is required by branch protection
- For assignment: perform at least 3 review comments in total using `[MUST]/[SHOULD]`

## 5. Merge Rules
- Prefer `Squash and merge`
- Final commit title should remain Conventional Commit
