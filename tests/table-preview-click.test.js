import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MD_FILE = path.join(__dirname, 'fixtures', 'table-click.md');

function startServer(port) {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['cli.cjs', MD_FILE, '--port', String(port), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      detached: true,
    });
    const checkReady = setInterval(() => {
      http.get(`http://localhost:${port}/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkReady);
          resolve(serverProcess);
        }
      }).on('error', () => {});
    }, 200);
  });
}

describe('Table Preview Click E2E', () => {
  let browser;
  let serverProcess;
  const port = 3011;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port);
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid, 'SIGKILL');
      } catch (_) {
        // ignore if already dead
      }
    }
  });

  test('clicking link inside markdown table maps to correct source row', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForSelector('.md-right');

    await page.locator('.md-preview table a', { hasText: 'Example' }).first().click({ modifiers: ['Meta'] });
    await page.waitForTimeout(500);

    const selected = page.locator('.md-right td.selected').first();
    await expect(selected).toBeVisible();
    await expect(selected).toContainText('[Example](https://example.com)');

    await page.close();
  });

  test('clicking short plain table cell still selects source row', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForSelector('.md-right');

    await page.locator('.md-preview table td', { hasText: 'NG' }).first().click();
    await page.waitForTimeout(500);

    const selected = page.locator('.md-right td.selected').first();
    await expect(selected).toBeVisible();
    await expect(selected).toContainText('| NG | blocked |');

    await page.close();
  });
});
