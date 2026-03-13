#!/usr/bin/env python3
"""
Set branch protection rules for main branch.
Requires admin permission for the repository.

Env:
  GITHUB_TOKEN: PAT with repo admin rights
  REPO: owner/repo (default: kwondohun0308/AI-OSS)
"""
import os
import sys
import requests

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
REPO = os.environ.get("REPO", "kwondohun0308/AI-OSS")
BASE = "https://api.github.com"

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def main() -> None:
    if not GITHUB_TOKEN:
        print("ERROR: GITHUB_TOKEN is not set.")
        sys.exit(1)

    url = f"{BASE}/repos/{REPO}/branches/main/protection"

    payload = {
        "required_status_checks": {
            "strict": True,
            "contexts": [
                "Branch Strategy",
                "PR Title Conventional Commit",
                "Commit Messages Conventional"
            ]
        },
        "enforce_admins": True,
        "required_pull_request_reviews": {
            "dismiss_stale_reviews": True,
            "require_code_owner_reviews": True,
            "required_approving_review_count": 1
        },
        "restrictions": None,
        "required_linear_history": True,
        "allow_force_pushes": False,
        "allow_deletions": False,
        "block_creations": False,
        "required_conversation_resolution": True
    }

    resp = requests.put(url, headers=HEADERS, json=payload, timeout=30)
    if resp.status_code >= 300:
        print("Failed:", resp.status_code)
        print(resp.text)
        sys.exit(1)

    print("Branch protection configured for main branch")


if __name__ == "__main__":
    main()
