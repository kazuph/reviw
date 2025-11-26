import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');
const TSV_FILE = path.join(__dirname, 'fixtures', 'sample.tsv');

function startServer(port) {
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['cli.cjs', TSV_FILE, '--port', String(port), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
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

describe('TSV E2E Tests', () => {
  let browser;
  let serverProcess;
  const port = 3003;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port);
  });

  afterAll(async () => {
    if (browser) await browser.close();
    if (serverProcess) {
      try {
        process.kill(-serverProcess.pid, 'SIGKILL');
      } catch (e) {
        // ignore if already dead
      }
    }
  });

  test('displays table, add comment, filter', async () => {
    const page = await browser.newPage();

    await page.goto(`http://localhost:${port}`);

    // 1. Check initial display
    await expect(page.locator('header h1')).toContainText('sample.tsv');
    const table = page.locator('#csv-table');
    await expect(table).toBeVisible();
    const headerRow = page.locator('thead tr');
    expect(await headerRow.locator('th').count()).toBe(6);
    const tbody = page.locator('#tbody');
    expect(await tbody.locator('tr').count()).toBe(6);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tsv-01-initial.png'), fullPage: true });

    // 2. Add comment to cell
    const cell = page.locator('td[data-row="2"][data-col="2"]');
    await cell.click();
    const commentCard = page.locator('#comment-card');
    await expect(commentCard).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tsv-02-comment-card.png'), fullPage: true });

    const textarea = page.locator('#comment-input');
    await textarea.fill('This product is popular');
    await page.locator('#save-comment').click();
    await expect(cell).toHaveClass(/has-comment/);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tsv-03-comment-saved.png'), fullPage: true });

    // 3. Filter column
    const header = page.locator('thead th[data-col="5"] .th-inner');
    await header.click();
    const filterMenu = page.locator('#filter-menu');
    await expect(filterMenu).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tsv-04-filter-menu.png'), fullPage: true });

    page.once('dialog', async dialog => {
      await dialog.accept('Fruit');
    });
    await page.locator('#filter-menu button[data-action="contains"]').click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tsv-05-filtered.png'), fullPage: true });

    await page.close();
  });
});
