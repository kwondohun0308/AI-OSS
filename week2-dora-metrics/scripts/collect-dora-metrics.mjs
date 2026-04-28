import fs from 'node:fs/promises';

const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
const token = process.env.GITHUB_TOKEN;

if (!owner || !repo) {
  throw new Error('GITHUB_REPOSITORY is required.');
}

if (!token) {
  throw new Error('GITHUB_TOKEN is required.');
}

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

async function githubGet(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${path} (${response.status})`);
  }
  return response.json();
}

function daysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function average(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hoursBetween(start, end) {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

async function collectLeadTime(windowStart) {
  const search = await githubGet(`/search/issues?q=repo:${owner}/${repo}+is:pr+is:merged+merged:>=${windowStart.slice(0, 10)}&per_page=20`);
  const prs = search.items ?? [];
  const values = [];

  for (const item of prs) {
    const pr = await githubGet(`/repos/${owner}/${repo}/pulls/${item.number}`);
    const commits = await githubGet(`/repos/${owner}/${repo}/pulls/${item.number}/commits?per_page=100`);
    const firstCommitDate = commits.reduce((earliest, commit) => {
      const date = commit?.commit?.author?.date || commit?.commit?.committer?.date;
      if (!date) return earliest;
      return !earliest || new Date(date) < new Date(earliest) ? date : earliest;
    }, null);

    if (firstCommitDate && pr.merged_at) {
      values.push(hoursBetween(firstCommitDate, pr.merged_at));
    }
  }

  return {
    count: values.length,
    averageHours: average(values),
    samples: values,
  };
}

async function collectDeploymentFrequency(windowStart) {
  const runs = await githubGet(`/repos/${owner}/${repo}/actions/runs?per_page=100`);
  const filtered = (runs.workflow_runs ?? []).filter((run) => {
    const name = `${run.name || ''} ${run.display_title || ''}`.toLowerCase();
    const createdAt = new Date(run.created_at).toISOString();
    return createdAt >= windowStart && /deploy|release|publish/.test(name);
  });

  return {
    count: filtered.filter((run) => run.conclusion === 'success').length,
    totalRuns: filtered.length,
    failedRuns: filtered.filter((run) => run.conclusion && run.conclusion !== 'success').length,
  };
}

async function collectMttr(windowStart) {
  const issues = await githubGet(`/search/issues?q=repo:${owner}/${repo}+is:issue+closed:>=${windowStart.slice(0, 10)}+(label:incident+OR+label:outage+OR+label:production-incident)&per_page=20`);
  const values = [];

  for (const item of issues.items ?? []) {
    if (item.closed_at && item.created_at) {
      values.push(hoursBetween(item.created_at, item.closed_at));
    }
  }

  return {
    count: values.length,
    averageHours: average(values),
    samples: values,
  };
}

async function main() {
  const windowStart = daysAgo(7);
  const leadTime = await collectLeadTime(windowStart);
  const deployment = await collectDeploymentFrequency(windowStart);
  const mttr = await collectMttr(windowStart);

  const data = {
    generatedAt: new Date().toISOString(),
    window: {
      start: windowStart,
      end: new Date().toISOString(),
    },
    metrics: {
      leadTime: {
        unit: 'hours',
        count: leadTime.count,
        average: leadTime.averageHours,
        samples: leadTime.samples,
      },
      deploymentFrequency: {
        unit: 'deployments/week',
        count: deployment.count,
        totalRuns: deployment.totalRuns,
        failedRuns: deployment.failedRuns,
      },
      mttr: {
        unit: 'hours',
        count: mttr.count,
        average: mttr.averageHours,
        samples: mttr.samples,
      },
      changeFailureRate: {
        unit: 'ratio',
        value: deployment.totalRuns === 0 ? null : deployment.failedRuns / deployment.totalRuns,
        failedRuns: deployment.failedRuns,
        totalRuns: deployment.totalRuns,
      },
    },
    notes: [
      'Lead Time는 PR 최초 커밋부터 머지까지의 시간을 사용했다.',
      'Deployment Frequency와 Change Failure Rate는 deploy/release/publish 계열 워크플로우 실행을 기준으로 계산했다.',
      'MTTR는 incident/outage/production-incident 라벨이 붙은 이슈의 등록~종료 시간을 대체 지표로 사용했다.',
    ],
  };

  await fs.mkdir('week2-dora-metrics/artifacts', { recursive: true });
  await fs.writeFile('week2-dora-metrics/artifacts/dora-metrics.json', `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  process.stdout.write(JSON.stringify(data, null, 2));
}

await main();
