# Week9: NPM publish + Docker + Security

This folder contains a minimal Node.js package and Dockerfile for Week9 tasks.

- Publish: GitHub Actions workflow will publish to GitHub Packages.
- Docker: workflow builds and pushes image to GHCR and runs a container to verify.
- Security: workflow runs `npm audit` and optionally Snyk (requires `SNYK_TOKEN`).

Required repository secrets:
- `GITHUB_TOKEN` (provided by GitHub Actions)
- `SNYK_TOKEN` (optional, for Snyk scans)

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
