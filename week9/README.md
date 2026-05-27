# Week9: NPM publish + Docker + Security

This folder contains a minimal Node.js package and Dockerfile for Week9 tasks.

- Publish: workflow bumps patch version and publishes package to GitHub Packages.
- Docker: workflow builds and pushes image to GHCR and verifies runtime via local HTTP check.
- Security: workflow runs npm audit and optional Snyk scan, then uploads reports and opens/updates issues when vulnerabilities exist.
- Dependabot: weekly grouped updates for npm and GitHub Actions, with auto-merge for safe patch/minor updates.

Required repository secrets:
- `GITHUB_TOKEN` (provided by GitHub Actions)
- `SNYK_TOKEN` (optional, for Snyk scans)

Week9-related workflows:
- `.github/workflows/week9-publish-npm.yml`
- `.github/workflows/week9-docker.yml`
- `.github/workflows/week9-security-scan.yml`
- `.github/workflows/dependabot-auto-merge.yml`

Dependabot policy:
- Config file: `.github/dependabot.yml`
- npm updates are grouped as patch/minor in `/week9`
- GitHub Actions updates are grouped as patch/minor in `/`

Local run:

```bash
cd week9
npm install
npm start
# or build and run docker
docker build -t week9-sample:latest .
docker run --rm -p 3000:3000 week9-sample:latest
curl http://localhost:3000/
```
