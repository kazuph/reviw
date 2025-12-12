import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');
const MD_FILE = path.join(__dirname, 'fixtures', 'simple.md');

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

describe('Link Click E2E Tests', () => {
  let browser;
  let serverProcess;
  const port = 3010;

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

  test('clicking link in preview should select corresponding source line', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);

    // Wait for page to load - use correct selectors for markdown mode
    await page.waitForSelector('.md-preview');
    await page.waitForSelector('.md-right');

    // Find the link element in preview
    const link = page.locator('.md-preview a').first();
    await expect(link).toBeVisible();

    // Log the link text for debugging
    const linkText = await link.textContent();
    console.log('Link text:', linkText);

    // Log parent element text for debugging
    const parentText = await link.evaluate(el => el.closest('p, li, h1, h2, h3')?.textContent || 'no parent');
    console.log('Parent text:', parentText);

    // Click on the link (with modifier to prevent navigation)
    await link.click({ modifiers: ['Meta'] }); // Cmd+click on macOS to keep focus

    // Wait a moment for selection to happen
    await page.waitForTimeout(500);

    // Take screenshot for debugging
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'link-click-test.png') });

    // Check if source has selected cell (td.selected in the source table)
    const selectedCell = page.locator('.md-right td.selected');
    const selectedCount = await selectedCell.count();
    console.log('Selected cells count:', selectedCount);

    // Log any cells that contain the link text to debug findSourceLine
    const allCells = await page.locator('.md-right tbody td').allTextContents();
    console.log('Source lines containing "リンク":', allCells.filter(t => t.includes('リンク')));

    // The test should find at least one selected cell
    expect(selectedCount).toBeGreaterThan(0);

    await page.close();
  });
});
