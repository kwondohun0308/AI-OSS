# Deployment Strategy & Automation

This document describes the automated deployment options added to the repository and instructions to configure them.

Overview
- Frontend: GitHub Pages automatic deploy + per-PR preview directories (see `.github/workflows/deploy-gh-pages.yml`). Publishes `docs/` on push to `main` and creates `gh-pages/pr-<number>/` preview folders for PRs.
- Docker deployment: images are built and pushed to registries (GHCR already configured for week9, and an AWS ECR workflow template is included).
- Cloud deployment: an example workflow to deploy to AWS ECS (Fargate) is included (`.github/workflows/deploy-aws-ecr-ecs.yml`). This workflow requires repository secrets and a task definition template.

Required repository secrets (examples):
- `GITHUB_TOKEN` (already provided by Actions) — used to push to `gh-pages`.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`, `HEALTHCHECK_URL` — used by the AWS deploy workflow.

How to enable GitHub Pages
1. In repository settings → Pages, set source to `gh-pages` branch (root). The deploy workflow will push content to the `gh-pages` branch.

PR preview URLs
- Once a PR triggers the preview deploy, the preview will be available at:
  `https://<repo-owner>.github.io/<repo-name>/pr-<pr-number>/`

AWS ECS Task Definition template
- A sample template is included at `.github/aws/ecs-task-def.json`. Edit the container definitions (CPU/memory/port mappings) as required.

Monitoring & Health
- The AWS workflow registers a new task definition and forces a new deployment; health is checked via `HEALTHCHECK_URL` (set as a repo secret). You can extend the workflow to create CloudWatch alarms — a helper script template is provided.

If you want me to enable Vercel/Netlify instead for richer PR previews, I can add Netlify/GitHub app integration steps and a workflow that triggers deploy previews (requires Netlify token or Vercel integration).
