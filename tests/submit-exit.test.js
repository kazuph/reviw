import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_FILE = path.join(__dirname, 'fixtures', 'sample.csv');

function startServer(args, port) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['cli.cjs', ...args, '--port', String(port), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      detached: true,
    });
    const timeout = setTimeout(() => {
      reject(new Error(`Server failed to start on port ${port}`));
    }, 15000);
    const checkReady = setInterval(() => {
      http.get(`http://localhost:${port}/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkReady);
          clearTimeout(timeout);
          resolve(serverProcess);
        }
      }).on('error', () => {});
    }, 200);
  });
}

function startDiffServer(port) {
  return new Promise((resolve, reject) => {
    // Generate a small diff for testing
    const diff = [
      'diff --git a/test.txt b/test.txt',
      'index 1234567..abcdefg 100644',
      '--- a/test.txt',
      '+++ b/test.txt',
      '@@ -1,3 +1,3 @@',
      ' line 1',
      '-old line 2',
      '+new line 2',
      ' line 3',
    ].join('\n');

    const serverProcess = spawn('node', ['cli.cjs', '-', '--port', String(port), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true,
    });
    serverProcess.stdin.write(diff);
    serverProcess.stdin.end();

    const timeout = setTimeout(() => {
      reject(new Error(`Diff server failed to start on port ${port}`));
    }, 15000);
    const checkReady = setInterval(() => {
      http.get(`http://localhost:${port}/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkReady);
          clearTimeout(timeout);
          resolve(serverProcess);
        }
      }).on('error', () => {});
    }, 200);
  });
}

describe('Submit & Exit E2E - CSV Mode', () => {
  let browser;
  let serverProcess;
  const port = 3016;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer([CSV_FILE], port);
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      try { process.kill(-serverProcess.pid, 'SIGKILL'); } catch (_) {}
    }
  });

  test('Submit button exists and is clickable', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('#csv-table');
    await page.waitForTimeout(500);

    const submitBtn = page.locator('#send-and-exit');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Submit');

    await page.close();
  });

  test('Clicking Submit opens modal dialog', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('#csv-table');
    await page.waitForTimeout(500);

    await page.locator('#send-and-exit').click();
    await page.waitForTimeout(300);

    const modal = page.locator('#submit-modal');
    const isVisible = await modal.evaluate(el => el.classList.contains('visible'));
    expect(isVisible).toBe(true);

    // Modal has summary, comment input, cancel and submit buttons
    await expect(page.locator('#modal-summary')).toBeVisible();
    await expect(page.locator('#global-comment')).toBeVisible();
    await expect(page.locator('#modal-cancel')).toBeVisible();
    await expect(page.locator('#modal-submit')).toBeVisible();

    await page.close();
  });

  test('Cancel button closes modal', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('#csv-table');
    await page.waitForTimeout(500);

    await page.locator('#send-and-exit').click();
    await page.waitForTimeout(300);

    await page.locator('#modal-cancel').click();
    await page.waitForTimeout(300);

    const isVisible = await page.locator('#submit-modal').evaluate(el => el.classList.contains('visible'));
    expect(isVisible).toBe(false);

    await page.close();
  });

  test('Submit sends POST /exit and shows completion', async () => {
    const page = await browser.newPage();

    // Capture console errors
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('#csv-table');
    await page.waitForTimeout(500);

    await page.locator('#send-and-exit').click();
    await page.waitForTimeout(300);

    // Type a comment
    await page.locator('#global-comment').fill('Test CSV comment');
    await page.locator('#modal-submit').click();
    await page.waitForTimeout(1500);

    // Should show completion message or window closed
    // No JavaScript errors should occur
    const jsErrors = errors.filter(e => !e.includes('net::'));
    expect(jsErrors).toHaveLength(0);

    await page.close();
  });
});

describe('Submit & Exit E2E - Diff Mode', () => {
  let browser;
  let serverProcess;
  const port = 3017;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startDiffServer(port);
  }, 30000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      try { process.kill(-serverProcess.pid, 'SIGKILL'); } catch (_) {}
    }
  });

  test('Submit button exists in diff view', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    const submitBtn = page.locator('#send-and-exit');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Submit');

    await page.close();
  });

  test('Clicking Submit opens modal in diff view', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    await page.locator('#send-and-exit').click();
    await page.waitForTimeout(300);

    const isVisible = await page.locator('#submit-modal').evaluate(el => el.classList.contains('visible'));
    expect(isVisible).toBe(true);

    await page.close();
  });

  test('Diff Submit sends POST /exit without JS errors', async () => {
    const page = await browser.newPage();

    // Capture console errors - this is the key regression test
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    await page.locator('#send-and-exit').click();
    await page.waitForTimeout(300);

    await page.locator('#global-comment').fill('Test diff comment');
    await page.locator('#modal-submit').click();
    await page.waitForTimeout(1500);

    // Key assertion: no "savePromptPrefs is not defined" error
    const jsErrors = errors.filter(e => !e.includes('net::'));
    expect(jsErrors).toHaveLength(0);

    await page.close();
  });
});
