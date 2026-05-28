# Week13: Persona-Driven Experiment Lab

This folder contains a self-contained Node sample for running a feature-flagged A/B experiment across 10 distinct user personas, measuring the result over two weeks, and documenting the outcome as Pivot or Persevere.

## What is included

- 10 generated personas with different goals, risks, and feedback patterns
- deterministic A/B assignment and feature-flag rollout control
- two-week experiment simulation with metric deltas and feedback sampling
- GitHub Issues/Projects/Actions operating model for experiment backlog and weekly reporting
- a browser dashboard, unit tests, and an end-to-end scenario

## Run locally

```bash
cd week13
npm install
npm test
npm run test:e2e
npm run report
npm start
```

Open `http://localhost:4180` after starting the app.

## Operating model

1. Create experiment backlog issues from [docs/backlog.md](docs/backlog.md).
2. Track the work in a GitHub Project board with Backlog, Ready, In Progress, Review, and Done.
3. Let GitHub Actions run the experiment simulation and publish the weekly report artifact.
4. Use [docs/decision.md](docs/decision.md) to record the final Pivot or Persevere outcome.

## Core workflows

- `src/experiment.js`: persona assignment, A/B exposure, metric collection, and decision logic
- `src/report.js`: weekly markdown report generation and decision notes
- `src/app.js`: dashboard and JSON API for scenario review
- `simulate.js`: writes the latest report to `reports/weekly-report.md`

## Generated results

The default scenario produces 20 feedback entries across 10 personas and two weeks. The treatment group is expected to outperform control on satisfaction and activation, so the default decision is Persevere unless the thresholds are changed.

## AI disclosure

This document was created with GitHub Copilot.