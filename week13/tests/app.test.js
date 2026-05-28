const http = require('http');
const { createServer, createState, renderPage } = require('../src/app');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request({ hostname: '127.0.0.1', port: address.port, path, method: 'GET' }, (res) => {
      let body = '';

      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });

    req.on('error', reject);
    req.end();
  });
}

describe('app', () => {
  test('builds state with report and experiment data', () => {
    const state = createState(new URL('http://localhost/?user=amy&experiment=homepage-cta'), {
      FEATURE_EXPERIMENT_ENABLED: 'true',
    });

    expect(state.userId).toBe('amy');
    expect(state.report).toContain('Week13 Experiment Report');
    expect(state.experiment.feedback).toHaveLength(20);
  });

  test('renders the dashboard html', () => {
    const html = renderPage(createState(new URL('http://localhost/'), {}));

    expect(html).toContain('Week13 Experiment Lab');
    expect(html).toContain('Pivot / Persevere');
    expect(html).toContain('Persona Feedback');
  });

  test('serves api and health routes', async () => {
    const server = createServer();
    await new Promise((resolve) => server.listen(0, resolve));

    try {
      const health = await request(server, '/health');
      expect(health.status).toBe(200);

      const report = await request(server, '/api/report');
      expect(report.status).toBe(200);
      expect(JSON.parse(report.body).decision.decision).toBe('Persevere');

      const feedback = await request(server, '/api/feedback');
      expect(feedback.status).toBe(200);
      expect(JSON.parse(feedback.body).feedback).toHaveLength(20);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});