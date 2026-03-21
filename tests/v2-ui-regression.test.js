import { afterAll, beforeAll, describe, test } from 'vitest';
import { expect } from '@playwright/test';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SERVER_JS = path.join(ROOT, 'v2', '_build', 'js', 'release', 'build', 'server', 'server.js');
const MD_FILE = path.join(ROOT, 'examples', 'test-features.md');
const LOCK_DIR = path.join(os.tmpdir(), 'reviw-v2-ui-regression-locks');

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 30000);
    const timer = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(timer);
          clearTimeout(timeout);
          resolve();
        }
      }).on('error', () => {});
    }, 200);
  });
}

function startServer(port) {
  const serverProcess = spawn('node', [SERVER_JS, MD_FILE, '--port', String(port), '--no-open'], {
    cwd: ROOT,
    stdio: 'pipe',
    detached: true,
    env: {
      ...process.env,
      REVIW_LOCK_DIR: LOCK_DIR,
    },
  });

  return waitForServer(port).then(() => serverProcess);
}

function killServer(serverProcess) {
  if (!serverProcess) {
    return;
  }
  try {
    process.kill(-serverProcess.pid, 'SIGKILL');
  } catch (_) {
    // ignore
  }
}

describe('v2 UI regressions', () => {
  let browser;
  let serverProcess;
  const port = 5311;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port);
  }, 60000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    killServer(serverProcess);
  });

  test('heading text keeps selection behavior while icon alone toggles open state', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const state = async () => {
      return page.evaluate(() => {
        const details = document.querySelector('.md-preview details.heading-toggle');
        const summary = details?.querySelector('summary.heading-summary');
        const icon = details?.querySelector('.heading-toggle-icon');
        const content = details?.querySelector('.toggle-content');
        if (!details || !summary || !icon || !content) {
          return { found: false };
        }
        const style = getComputedStyle(content);
        return {
          found: true,
          open: details.hasAttribute('open'),
          icon: icon.textContent?.trim() || '',
          ariaExpanded: summary.getAttribute('aria-expanded') || '',
          display: style.display,
          hidden: content.getAttribute('aria-hidden') || '',
          contentHeight: content.getBoundingClientRect().height,
        };
      });
    };

    const before = await state();
    expect(before.found).toBe(true);
    expect(before.open).toBe(true);
    expect(before.icon).toBe('▼');
    expect(before.ariaExpanded).toBe('true');
    expect(before.display).not.toBe('none');

    const summary = page.locator('.md-preview details.heading-toggle > summary.heading-summary').first();
    const heading = summary.locator('.md-heading-toggle').first();
    const icon = summary.locator('.heading-toggle-icon').first();

    await heading.click({ position: { x: 48, y: 10 } });
    await page.waitForTimeout(300);

    const afterTextClick = await state();
    expect(afterTextClick.open).toBe(true);
    expect(afterTextClick.icon).toBe('▼');
    expect(afterTextClick.ariaExpanded).toBe('true');
    await expect(page.locator('#comment-card')).toBeVisible();

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await expect(page.locator('#comment-card')).not.toBeVisible();

    await icon.click();
    await page.waitForTimeout(300);

    const collapsed = await state();
    expect(collapsed.open).toBe(false);
    expect(collapsed.icon).toBe('▶');
    expect(collapsed.ariaExpanded).toBe('false');
    expect(collapsed.display).toBe('none');
    expect(collapsed.hidden).toBe('true');
    await expect(page.locator('#comment-card')).not.toBeVisible();

    await page.close();
  });

  test('inline body text in preview still maps to the markdown source row', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const inlineStrong = page.locator('.md-preview p strong').first();
    await inlineStrong.click();
    await page.waitForTimeout(250);

    const selectedRows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.md-right td.selected'))
        .map((cell) => Number(cell.getAttribute('data-row')))
        .sort((a, b) => a - b);
    });

    expect(selectedRows).toEqual([56]);
    await expect(page.locator('#comment-card')).toBeVisible();

    await page.close();
  });

  test('media sidebar initializes thumbnails without dataset errors', async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const sidebarState = await page.evaluate(() => {
      const sidebar = document.getElementById('media-sidebar');
      const thumbs = document.querySelectorAll('.media-sidebar-thumb');
      const firstThumb = document.querySelector('.media-sidebar-thumb');
      const toggleCount = document.getElementById('media-toggle-count');
      return {
        sidebarExists: !!sidebar,
        thumbCount: thumbs.length,
        firstThumbIndex: firstThumb?.getAttribute('data-media-index') || '',
        toggleCount: toggleCount?.textContent?.trim() || '',
      };
    });

    expect(sidebarState.sidebarExists).toBe(true);
    expect(sidebarState.thumbCount).toBeGreaterThan(0);
    expect(sidebarState.firstThumbIndex).toBe('0');
    expect(sidebarState.toggleCount).not.toBe('');
    expect(pageErrors.join('\n')).not.toContain('media-index');
    expect(consoleErrors.join('\n')).not.toContain('media-index');
    expect(pageErrors.join('\n')).not.toContain('DOMStringMap');
    expect(consoleErrors.join('\n')).not.toContain('DOMStringMap');

    await page.close();
  });
});
