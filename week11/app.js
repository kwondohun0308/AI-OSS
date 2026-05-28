const http = require('http');
const { URL } = require('url');
const { evaluateFeatureFlags } = require('./feature-flags');
const { DEFAULT_VARIANTS, assignVariant, EventTracker } = require('./ab-test');
const { DEFAULT_STAGES, simulateCanaryRollout } = require('./canary');

const port = Number(process.env.PORT || 3000);
const tracker = new EventTracker();

function getQueryValue(url, request, key, fallback) {
  return url.searchParams.get(key) || request.headers[`x-${key}`] || fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function canaryHealthFromEnv() {
  const healthOk = process.env.CANARY_HEALTH_OK ?? process.env.HEALTHCHECK_OK;
  const errorRate = process.env.CANARY_ERROR_RATE ?? process.env.HEALTHCHECK_ERROR_RATE;
  const latencyMs = process.env.CANARY_LATENCY_MS ?? process.env.HEALTHCHECK_LATENCY_MS;

  return {
    healthy: healthOk === undefined ? true : healthOk !== 'false',
    errorRate: Number(errorRate || 0),
    latencyMs: Number(latencyMs || 120),
    maxErrorRate: Number(process.env.CANARY_MAX_ERROR_RATE || 0.02),
    maxLatencyMs: Number(process.env.CANARY_MAX_LATENCY_MS || 250),
  };
}

function buildCanaryReport() {
  const health = canaryHealthFromEnv();
  const healthChecks = Object.fromEntries(DEFAULT_STAGES.map((stage) => [stage, health]));
  return simulateCanaryRollout({ stages: DEFAULT_STAGES, healthChecks });
}

function renderPage({ userId, experimentKey, flags, assignment, canary, summary }) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Week11 Flags Lab</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4efe7;
      --panel: #fffaf3;
      --text: #1f2937;
      --muted: #6b7280;
      --accent: #0f766e;
      --accent-2: #f97316;
      --border: #e5d7c7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fffdf8 0%, var(--bg) 100%);
      color: var(--text);
    }
    .shell {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px 56px;
    }
    .hero {
      display: grid;
      gap: 16px;
      grid-template-columns: 1.2fr 0.8fr;
      align-items: start;
      margin-bottom: 24px;
    }
    .title {
      font-size: clamp(2rem, 4vw, 3.75rem);
      line-height: 1;
      letter-spacing: -0.04em;
      margin: 0;
    }
    .lead {
      margin: 0;
      max-width: 62ch;
      color: var(--muted);
      line-height: 1.65;
    }
    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    .chip {
      border: 1px solid var(--border);
      background: var(--panel);
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 0.92rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 18px;
    }
    .card {
      grid-column: span 6;
      border: 1px solid var(--border);
      background: rgba(255, 250, 243, 0.94);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 12px 32px rgba(31, 41, 55, 0.08);
    }
    .card h2 {
      margin: 0 0 8px;
      font-size: 1.1rem;
    }
    .meta {
      color: var(--muted);
      margin: 0 0 12px;
      font-size: 0.94rem;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.9rem;
      line-height: 1.55;
    }
    .full {
      grid-column: 1 / -1;
    }
    .status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.82rem;
    }
    .ok { background: #dcfce7; color: #166534; }
    .warn { background: #fee2e2; color: #991b1b; }
    @media (max-width: 800px) {
      .hero { grid-template-columns: 1fr; }
      .card { grid-column: 1 / -1; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <h1 class="title">Week11 Flags Lab</h1>
        <p class="lead">Feature flag 3개, 결정론적 A/B 테스트, 그리고 1%-10%-50%-100% 카나리 롤아웃과 자동 롤백 로직을 하나의 Node 샘플 앱에 묶었습니다.</p>
        <div class="chip-row">
          <span class="chip">user: ${escapeHtml(userId)}</span>
          <span class="chip">experiment: ${escapeHtml(experimentKey)}</span>
          <span class="chip">variants: ${escapeHtml(DEFAULT_VARIANTS.join(' / '))}</span>
          <span class="chip">canary stages: 1 / 10 / 50 / 100</span>
        </div>
      </div>
      <div class="card">
        <h2>Quick URLs</h2>
        <p class="meta">실행 후 아래 URL로 확인할 수 있습니다.</p>
        <pre>/api/decisions?user=alice&amp;experiment=pricing
/health
/api/events</pre>
      </div>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Feature Flags</h2>
        <p class="meta">환경 변수와 대상 사용자 기준으로 토글됩니다.</p>
        <pre>${escapeHtml(JSON.stringify(flags, null, 2))}</pre>
      </article>

      <article class="card">
        <h2>A/B Assignment</h2>
        <p class="meta">동일 userId + experimentKey는 항상 같은 variant를 받습니다.</p>
        <pre>${escapeHtml(JSON.stringify(assignment, null, 2))}</pre>
      </article>

      <article class="card full">
        <h2>Tracked Events</h2>
        <p class="meta">assignment, exposure, conversion 이벤트가 메모리 트래커에 누적됩니다.</p>
        <pre>${escapeHtml(JSON.stringify(summary, null, 2))}</pre>
      </article>

      <article class="card full">
        <h2>Canary Rollout</h2>
        <p class="meta">헬스체크 실패 시 자동으로 이전 안정 단계로 롤백합니다.</p>
        <pre>${escapeHtml(JSON.stringify(canary, null, 2))}</pre>
      </article>
    </section>
  </main>
</body>
</html>`;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const userId = getQueryValue(url, request, 'user', 'anonymous');
  const experimentKey = getQueryValue(url, request, 'experiment', 'hero-copy');
  const flags = evaluateFeatureFlags({ userId });
  const assignment = assignVariant({ experimentKey, userId });
  const canary = buildCanaryReport();

  tracker.recordAssignment(assignment);
  tracker.recordExposure({
    experimentKey,
    userId,
    variant: assignment.variant,
  });

  if (url.searchParams.get('converted') === '1') {
    tracker.recordConversion({
      experimentKey,
      userId,
      variant: assignment.variant,
    });
  }

  if (url.pathname === '/health') {
    response.writeHead(canary.outcome === 'rollback' ? 500 : 200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({
      ok: canary.outcome !== 'rollback',
      canary,
    }, null, 2));
    return;
  }

  if (url.pathname === '/api/decisions') {
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({
      userId,
      experimentKey,
      flags,
      assignment,
      canary,
      trackerSummary: tracker.summary(experimentKey),
    }, null, 2));
    return;
  }

  if (url.pathname === '/api/events') {
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({
      events: tracker.events,
      summary: tracker.summary(),
    }, null, 2));
    return;
  }

  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
  });
  response.end(renderPage({
    userId,
    experimentKey,
    flags,
    assignment,
    canary,
    summary: tracker.summary(experimentKey),
  }));
});

server.listen(port, () => {
  console.log(`week11 listening on ${port}`);
});
