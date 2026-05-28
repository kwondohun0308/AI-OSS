# Week12: TDD, Testing, and Refactoring Lab

This folder contains a self-contained Node sample that demonstrates:

- 5+ core behaviors implemented as small, testable modules
- Jest unit tests with an 80%+ coverage threshold
- one Playwright end-to-end flow with failure screenshots
- legacy code protection before refactoring
- CI that runs unit and E2E tests automatically

## What is covered

- Feature flags with environment and allowlist controls
- Deterministic A/B assignment and event tracking
- Canary rollout with 1%-10%-50%-100% stages and rollback
- Legacy order parsing and pricing calculations
- A small browser UI for manual verification and Playwright tests

## Run locally

```bash
cd week12
npm install
npm test
npm run test:e2e
npm start
```

Open `http://localhost:4173` after starting the app.

## TDD notes

The code is organized around small units so each behavior can be exercised in isolation:

1. Config parsing
2. Feature flag evaluation
3. A/B assignment and tracking
4. Canary progression and rollback
5. Legacy pricing parsing and total calculation

The browser scenario verifies that the assembled release snapshot still works after refactoring.
