const http = require('http');
const { URL } = require('url');
const { loadWeek12Config } = require('./config');
const { EventTracker, buildReleaseSnapshot } = require('./release-engine');
const { formatCurrency } = require('./legacy-pricing');

const port = Number(process.env.PORT || 4173);
const tracker = new EventTracker();

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createAppState(requestUrl, env = process.env) {
  const config = loadWeek12Config(env);
  const userId = requestUrl.searchParams.get('user') || config.userId;
  const experimentKey = requestUrl.searchParams.get('experiment') || config.experimentKey;
  const orderText = requestUrl.searchParams.get('order') || config.orderText;
  const converted = requestUrl.searchParams.get('converted') === '1';

  const snapshot = buildReleaseSnapshot({
    userId,
    experimentKey,
    orderText,
    env,
    tracker,
  });

  if (converted) {
    tracker.recordConversion({
      experimentKey,
      userId,
      variant: snapshot.assignment.variant,
    });
    snapshot.trackerSummary = tracker.summary(experimentKey);
  }

  return snapshot;
}

function renderBadge(text, tone = 'neutral') {
  return `<span class="badge badge-${tone}">${escapeHtml(text)}</span>`;
}

function renderPanel(title, body, accent = 'indigo') {
  return `
    <section class="panel panel-${accent}">
      <h2>${escapeHtml(title)}</h2>
      <pre>${escapeHtml(JSON.stringify(body, null, 2))}</pre>
    </section>
  `;
}

function renderPage(snapshot) {
  const pricingLabel = formatCurrency(snapshot.pricing.finalTotal);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Week12 Testing Lab</title>
  <style>
    :root {
      --bg: #f7f4ef;
      --panel: #fffdf8;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #e7ddd0;
      --accent: #1f4b99;
      --accent-2: #b45309;
      --accent-3: #0f766e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fffdf9 0%, var(--bg) 100%);
      color: var(--text);
    }
    .shell {
      max-width: 1160px;
      margin: 0 auto;
      padding: 36px 20px 56px;
    }
    .hero {
      display: grid;
      gap: 16px;
      grid-template-columns: 1.15fr 0.85fr;
      align-items: start;
      margin-bottom: 24px;
    }
    .title {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.6rem);
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .lead {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.65;
      max-width: 62ch;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.7);
      padding: 8px 12px;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .badge-positive { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-neutral { background: #eff6ff; color: #1d4ed8; }
    .grid {
      display: grid;
      gap: 18px;
      grid-template-columns: repeat(12, 1fr);
    }
    .panel {
      grid-column: span 6;
      border: 1px solid var(--border);
      background: var(--panel);
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 12px 32px rgba(31, 41, 55, 0.08);
    }
    .panel h2 {
      margin: 0 0 10px;
      font-size: 1.08rem;
    }
    .panel pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.55;
      font-size: 0.92rem;
    }
    .full { grid-column: 1 / -1; }
    form {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    label {
      display: grid;
      gap: 6px;
      font-size: 0.92rem;
      color: var(--muted);
    }
    input {
      width: 100%;
      border: 1px solid var(--border);
      background: white;
      border-radius: 12px;
      padding: 10px 12px;
      font: inherit;
      color: var(--text);
    }
    .submit-row {
      grid-column: 1 / -1;
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    button {
      border: 0;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--accent), #0f766e);
      color: white;
      padding: 11px 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .summary-line {
      color: var(--muted);
      font-size: 0.94rem;
    }
    @media (max-width: 840px) {
      .hero { grid-template-columns: 1fr; }
      .panel { grid-column: 1 / -1; }
      form { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <h1 class="title">Week12 Testing Lab</h1>
        <p class="lead">Small, pure modules are covered with Jest, the browser flow is verified with Playwright, and the legacy pricing parser is pinned by tests before refactoring.</p>
        <div class="chips">
          ${renderBadge(`user: ${snapshot.userId}`, 'neutral')}
          ${renderBadge(`experiment: ${snapshot.experimentKey}`, 'neutral')}
          ${renderBadge(`variant: ${snapshot.assignment.variant}`, 'positive')}
          ${renderBadge(`canary: ${snapshot.canary.outcome}`, snapshot.canary.outcome === 'rollback' ? 'warning' : 'positive')}
        </div>
      </div>
      <section class="panel panel-warning">
        <h2>Try it</h2>
        <p class="summary-line">Submit the form to re-evaluate the release snapshot.</p>
        <form method="GET">
          <label>
            User
            <input name="user" value="${escapeHtml(snapshot.userId)}" />
          </label>
          <label>
            Experiment
            <input name="experiment" value="${escapeHtml(snapshot.experimentKey)}" />
          </label>
          <label style="grid-column: 1 / -1;">
            Legacy order text
            <input name="order" value="${escapeHtml(snapshot.order.sku ? `${snapshot.order.sku}|price=${snapshot.order.price}|qty=${snapshot.order.qty}|coupon=${snapshot.order.coupon}|customerType=${snapshot.order.customerType}` : '')}" />
          </label>
          <div class="submit-row">
            <button type="submit">Analyze release</button>
            <span class="summary-line">Final total: ${escapeHtml(pricingLabel)}</span>
          </div>
        </form>
      </section>
    </section>

    <section class="grid">
      <article class="panel">
        <h2>Feature Flags</h2>
        <pre>${escapeHtml(JSON.stringify(snapshot.flags, null, 2))}</pre>
      </article>

      <article class="panel">
        <h2>A/B Assignment</h2>
        <pre>${escapeHtml(JSON.stringify(snapshot.assignment, null, 2))}</pre>
      </article>

      <article class="panel full">
        <h2>Legacy Pricing</h2>
        <pre>${escapeHtml(JSON.stringify({ order: snapshot.order, pricing: snapshot.pricing }, null, 2))}</pre>
      </article>

      <article class="panel full">
        <h2>Canary Rollout</h2>
        <pre>${escapeHtml(JSON.stringify(snapshot.canary, null, 2))}</pre>
      </article>

      <article class="panel full">
        <h2>Event Tracker</h2>
        <pre>${escapeHtml(JSON.stringify(snapshot.trackerSummary, null, 2))}</pre>
      </article>
    </section>
  </main>
</body>
</html>`;
}

function createServer(env = process.env) {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const snapshot = createAppState(requestUrl, env);

    if (requestUrl.pathname === '/health') {
      response.writeHead(snapshot.canary.outcome === 'rollback' ? 500 : 200, {
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.end(JSON.stringify({ ok: snapshot.canary.outcome !== 'rollback', canary: snapshot.canary }, null, 2));
      return;
    }

    if (requestUrl.pathname === '/api/state') {
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.end(JSON.stringify(snapshot, null, 2));
      return;
    }

    if (requestUrl.pathname === '/api/events') {
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.end(JSON.stringify({ summary: snapshot.trackerSummary, events: tracker.events }, null, 2));
      return;
    }

    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    response.end(renderPage(snapshot));
  });
}

if (require.main === module) {
  createServer().listen(port, () => {
    console.log(`week12 listening on ${port}`);
  });
}

module.exports = {
  createAppState,
  renderPage,
  createServer,
};