const http = require('http');
const { createAppState, renderPage, createServer } = require('../src/app');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const requestOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path,
      method: 'GET',
    };

    const request = http.request(requestOptions, (response) => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ status: response.statusCode, body, headers: response.headers });
      });
    });

    request.on('error', reject);
    request.end();
  });
}

describe('app assembly', () => {
  test('createAppState wires the release snapshot', () => {
    const state = createAppState(new URL('http://localhost/?user=alice&experiment=pricing-copy&order=SKU-1|price=1000|qty=2|coupon=SAVE10'), {
      FEATURE_NEW_DASHBOARD_USERS: 'alice',
      CANARY_HEALTH_OK: 'true',
      CANARY_ERROR_RATE: '0.01',
      CANARY_LATENCY_MS: '120',
    });

    expect(state.userId).toBe('alice');
    expect(state.assignment.variant).toBeDefined();
    expect(state.flags.newDashboard.enabled).toBe(true);
    expect(state.pricing.finalTotal).toBe(1800);
  });

  test('renderPage includes the evaluated data', () => {
    const html = renderPage({
      userId: 'alice',
      experimentKey: 'pricing-copy',
      assignment: { variant: 'control' },
      flags: { newDashboard: { enabled: true } },
      canary: { outcome: 'complete' },
      order: { sku: 'SKU-1', price: 1000, qty: 2, coupon: 'SAVE10', customerType: 'standard' },
      pricing: { finalTotal: 1800 },
      trackerSummary: { total: 2 },
    });

    expect(html).toContain('Week12 Testing Lab');
    expect(html).toContain('alice');
    expect(html).toContain('pricing-copy');
    expect(html).toContain('1800');
  });

  test('http server serves all routes', async () => {
    const server = createServer({
      FEATURE_NEW_DASHBOARD_USERS: 'alice',
      CANARY_HEALTH_OK: 'true',
      CANARY_ERROR_RATE: '0.01',
      CANARY_LATENCY_MS: '120',
    });

    await new Promise((resolve) => server.listen(0, resolve));

    try {
      const page = await request(server, '/?user=alice&experiment=pricing-copy&order=SKU-1|price=1000|qty=2|coupon=SAVE10');
      expect(page.status).toBe(200);
      expect(page.body).toContain('Week12 Testing Lab');

      const health = await request(server, '/health');
      expect(health.status).toBe(200);
      expect(JSON.parse(health.body).ok).toBe(true);

      const state = await request(server, '/api/state?user=alice&experiment=pricing-copy');
      expect(state.status).toBe(200);
      expect(JSON.parse(state.body).userId).toBe('alice');

      const events = await request(server, '/api/events');
      expect(events.status).toBe(200);
      expect(JSON.parse(events.body).summary.total).toBeGreaterThan(0);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});