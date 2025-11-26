import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');
const MD_FILE = path.join(__dirname, 'fixtures', 'sample.md');

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

describe('Markdown E2E Tests', () => {
  let browser;
  let serverProcess;
  const port = 3002;

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

  test('preview, comment, and code block', async () => {
    const page = await browser.newPage();

    await page.goto(`http://localhost:${port}`);

    // 1. Check preview and source display
    await expect(page.locator('header h1')).toContainText('sample.md');
    const preview = page.locator('.md-preview');
    await expect(preview).toBeVisible();
    await expect(preview.locator('h1')).toContainText('Sample Document');
    const table = page.locator('#csv-table');
    await expect(table).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-01-initial.png'), fullPage: true });

    // 2. Add comment to source line
    const cell = page.locator('td[data-row="1"][data-col="1"]');
    await cell.click();
    const commentCard = page.locator('#comment-card');
    await expect(commentCard).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-02-comment-card.png'), fullPage: true });

    const textarea = page.locator('#comment-input');
    await textarea.fill('Title needs to be updated');
    await page.locator('#save-comment').click();
    await expect(cell).toHaveClass(/has-comment/);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-03-comment-saved.png'), fullPage: true });

    // 3. Toggle comment list panel
    const cell2 = page.locator('td[data-row="7"][data-col="1"]');
    await cell2.click();
    await page.locator('#comment-input').fill('Update feature list');
    await page.locator('#save-comment').click();

    const toggleBtn = page.locator('#comment-toggle');
    await toggleBtn.click();
    const commentList = page.locator('.comment-list');
    await expect(commentList).not.toHaveClass(/collapsed/);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-04-comment-list.png'), fullPage: true });

    // 4. Check code block in preview
    const codeBlock = preview.locator('pre');
    await expect(codeBlock).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-05-code-block.png'), fullPage: true });

    await page.close();
  });
});
