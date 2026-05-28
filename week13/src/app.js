const http = require('http');
const { URL } = require('url');
const { loadWeek13Config } = require('./config');
const { runTwoWeekExperiment } = require('./experiment');
const { generateWeeklyReport } = require('./report');

const port = Number(process.env.PORT || 4180);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createState(requestUrl, env = process.env) {
  const config = loadWeek13Config(env);
  const userId = requestUrl.searchParams.get('user') || config.userId;
  const experimentKey = requestUrl.searchParams.get('experiment') || config.experimentKey;
  const report = generateWeeklyReport({ env });
  const experiment = runTwoWeekExperiment({ env });

  return {
    userId,
    experimentKey,
    config,
    report,
    experiment,
  };
}

function renderPage(state) {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Week13 Experiment Lab</title>
  <style>
    :root {
      --bg: #f3efe8;
      --panel: #fffdf7;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #e6d8c8;
      --accent: #1d4ed8;
      --accent-2: #c2410c;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: linear-gradient(180deg, #fffdf8 0%, var(--bg) 100%);
      color: var(--text);
    }
    .shell { max-width: 1180px; margin: 0 auto; padding: 36px 20px 56px; }
    .hero { display: grid; gap: 18px; grid-template-columns: 1.15fr 0.85fr; margin-bottom: 24px; }
    .title { margin: 0; font-size: clamp(2rem, 4vw, 3.6rem); letter-spacing: -0.04em; line-height: 1; }
    .lead { margin: 12px 0 0; max-width: 64ch; color: var(--muted); line-height: 1.65; }
    .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .chip { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 999px; background: rgba(255,255,255,0.7); padding: 8px 12px; font-size: 0.92rem; font-weight: 600; }
    .grid { display: grid; gap: 18px; grid-template-columns: repeat(12, 1fr); }
    .card { grid-column: span 6; border: 1px solid var(--border); background: var(--panel); border-radius: 20px; padding: 18px; box-shadow: 0 12px 32px rgba(31, 41, 55, 0.08); }
    .card h2 { margin: 0 0 10px; font-size: 1.08rem; }
    .card pre { margin: 0; white-space: pre-wrap; word-break: break-word; line-height: 1.55; font-size: 0.92rem; }
    .full { grid-column: 1 / -1; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    .table th, .table td { padding: 10px 8px; border-bottom: 1px solid var(--border); text-align: left; }
    .table th { color: var(--muted); font-weight: 700; }
    .persona-list { display: grid; gap: 12px; }
    .persona { border: 1px solid var(--border); border-radius: 14px; padding: 12px; background: rgba(255,255,255,0.7); }
    .persona h3 { margin: 0 0 6px; font-size: 1rem; }
    .persona p { margin: 0; color: var(--muted); line-height: 1.55; }
    .form-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    label { display: grid; gap: 6px; font-size: 0.92rem; color: var(--muted); }
    input { width: 100%; border: 1px solid var(--border); background: white; border-radius: 12px; padding: 10px 12px; font: inherit; color: var(--text); }
    button { border: 0; border-radius: 12px; background: linear-gradient(135deg, var(--accent), #0f766e); color: white; padding: 11px 16px; font-weight: 700; cursor: pointer; }
    @media (max-width: 860px) {
      .hero { grid-template-columns: 1fr; }
      .card { grid-column: 1 / -1; }
      .form-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <h1 class="title">Week13 Experiment Lab</h1>
        <p class="lead">Ten different personas provide feedback across a two-week feature-flag experiment. The report below shows whether we should Pivot or Persevere and how the GitHub operating model supports the result.</p>
        <div class="chips">
          <span class="chip">user: ${escapeHtml(state.userId)}</span>
          <span class="chip">experiment: ${escapeHtml(state.experimentKey)}</span>
          <span class="chip">decision: ${escapeHtml(state.experiment.decision.decision)}</span>
        </div>
      </div>
      <section class="card">
        <h2>Run parameters</h2>
        <form method="GET" class="form-grid">
          <label>
            User
            <input name="user" value="${escapeHtml(state.userId)}" />
          </label>
          <label>
            Experiment
            <input name="experiment" value="${escapeHtml(state.experimentKey)}" />
          </label>
          <div style="grid-column: 1 / -1; display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center;">
            <button type="submit">Refresh scenario</button>
            <span style="color: var(--muted);">Default rollouts: week 1 ${state.config.rolloutSchedule[0]}%, week 2 ${state.config.rolloutSchedule[1]}%</span>
          </div>
        </form>
      </section>
    </section>

    <section class="grid">
      <article class="card">
        <h2>Experiment Summary</h2>
        <table class="table">
          <tbody>
            <tr><th>Control activation</th><td>${(state.experiment.summary.control.activation * 100).toFixed(1)}%</td></tr>
            <tr><th>Treatment activation</th><td>${(state.experiment.summary.treatment.activation * 100).toFixed(1)}%</td></tr>
            <tr><th>Control satisfaction</th><td>${state.experiment.summary.control.satisfaction.toFixed(2)}</td></tr>
            <tr><th>Treatment satisfaction</th><td>${state.experiment.summary.treatment.satisfaction.toFixed(2)}</td></tr>
            <tr><th>Support ticket delta</th><td>${state.experiment.summary.lift.supportTickets.toFixed(3)}</td></tr>
          </tbody>
        </table>
      </article>

      <article class="card">
        <h2>Pivot / Persevere</h2>
        <pre>${escapeHtml(JSON.stringify(state.experiment.decision, null, 2))}</pre>
      </article>

      <article class="card full">
        <h2>Persona Feedback</h2>
        <div class="persona-list">
          ${state.experiment.feedback.map((record) => `
            <div class="persona">
              <h3>${escapeHtml(record.personaName)} - ${escapeHtml(record.archetype)} - Week ${record.week}</h3>
              <p>${escapeHtml(record.comment)}</p>
            </div>
          `).join('')}
        </div>
      </article>

      <article class="card full">
        <h2>Weekly Report Snapshot</h2>
        <pre>${escapeHtml(state.report)}</pre>
      </article>
    </section>
  </main>
</body>
</html>`;
}

function createServer(env = process.env) {
  return http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const state = createState(url, env);

    if (url.pathname === '/health') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ ok: true, decision: state.experiment.decision.decision }, null, 2));
      return;
    }

    if (url.pathname === '/api/report') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(state.experiment, null, 2));
      return;
    }

    if (url.pathname === '/api/feedback') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ feedback: state.experiment.feedback }, null, 2));
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderPage(state));
  });
}

if (require.main === module) {
  createServer().listen(port, () => {
    console.log(`week13 listening on ${port}`);
  });
}

module.exports = {
  createState,
  renderPage,
  createServer,
};