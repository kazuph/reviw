const { chromium } = require('playwright');

// Node.js Playwright quick diagnostics:
// - waits for networkidle
// - collects console errors and HTTP 4xx/5xx responses
// - takes a full-page screenshot for evidence
(async () => {
  const url = process.env.BASE_URL || 'http://localhost:3000';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  const httpFailures = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('response', (resp) => {
    const status = resp.status();
    if (status >= 400) httpFailures.push(`${status} ${resp.url()}`);
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/node_diag.png', fullPage: true });
  await browser.close();

  console.log('=== Site diagnostics (Node + Playwright) ===');
  console.log('URL:', url);
  console.log('Console errors:', consoleErrors.length);
  consoleErrors.slice(0, 10).forEach((m) => console.log('  ', m));
  console.log('HTTP failures:', httpFailures.length);
  httpFailures.slice(0, 10).forEach((r) => console.log('  ', r));
  console.log('Screenshot:', '/tmp/node_diag.png');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
