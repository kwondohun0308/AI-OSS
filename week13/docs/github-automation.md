# GitHub Automation Plan

This note explains how Issues, Projects, and Actions work together for week13.

## Issues

- Use Issues as the experiment backlog.
- Attach the `type: experiment`, `type: analytics`, or `type: report` label.
- Keep the issue body aligned with the measurement goal.

## Projects

- Use the project board as the experiment operating board.
- Move issues through Backlog, Ready, In Progress, Review, and Done.
- Keep the board status in sync with the current week of the experiment.

## Actions

- Schedule the experiment report weekly.
- Run `node week13/simulate.js --write-report` on dispatch and schedule.
- Upload the report markdown and JSON summary as artifacts.
- Run unit tests and Playwright on every week13 path change.

## Weekly Ritual

1. Review the latest report artifact.
2. Check whether the decision is Pivot or Persevere.
3. Update the project board and linked issues.
4. Capture new follow-up issues if the decision is Pivot.
