import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MD_FILE = path.join(__dirname, 'fixtures', 'preview-only.md');

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

describe('Preview-Only Mode E2E', () => {
  let browser;
  let serverProcess;
  const port = 3015;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port);
  }, 30000);

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

  // --- Task #1: Narrow viewport scroll ---

  test('preview panel is scrollable in narrow viewport (width <= 960px)', async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const mdLeft = page.locator('.md-left');
    // Verify preview panel exists and has scrollable content
    const scrollHeight = await mdLeft.evaluate(el => el.scrollHeight);
    const clientHeight = await mdLeft.evaluate(el => el.clientHeight);

    // Content should be taller than the visible area (scrollable)
    expect(scrollHeight).toBeGreaterThan(clientHeight);

    // Verify we can actually scroll
    const initialScrollTop = await mdLeft.evaluate(el => el.scrollTop);
    await mdLeft.evaluate(el => el.scrollTo({ top: 200, behavior: 'instant' }));
    await page.waitForTimeout(100);
    const afterScrollTop = await mdLeft.evaluate(el => el.scrollTop);

    expect(afterScrollTop).toBeGreaterThan(initialScrollTop);
    expect(afterScrollTop).toBeCloseTo(200, -1);

    await page.close();
  });

  test('source panel is hidden in narrow viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const mdRight = page.locator('.md-right');
    // Source panel should be hidden via CSS
    const isVisible = await mdRight.evaluate(el => {
      const style = getComputedStyle(el);
      return style.display !== 'none';
    });
    expect(isVisible).toBe(false);

    await page.close();
  });

  // --- Task #2: Dialog position below clicked element ---

  test('comment dialog appears below clicked element in narrow viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Click on the first paragraph in the preview
    const paragraph = page.locator('.md-preview p').first();
    await paragraph.click();
    await page.waitForTimeout(500);

    // Comment card should be visible
    const card = page.locator('#comment-card');
    const cardDisplay = await card.evaluate(el => el.style.display);
    expect(cardDisplay).toBe('block');

    // Re-measure paragraph position AFTER click (scroll may have occurred)
    const paragraphBoxAfter = await paragraph.boundingBox();
    expect(paragraphBoxAfter).not.toBeNull();

    // Card should be positioned below the clicked element's current position
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(cardBox.y).toBeGreaterThanOrEqual(paragraphBoxAfter.y + paragraphBoxAfter.height - 10);

    await page.close();
  });

  test('comment dialog does not obscure clicked element in narrow viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Click on a heading
    const heading = page.locator('.md-preview h2').first();
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();

    await heading.click();
    await page.waitForTimeout(500);

    const card = page.locator('#comment-card');
    const cardDisplay = await card.evaluate(el => el.style.display);

    if (cardDisplay === 'block') {
      const cardBox = await card.boundingBox();
      expect(cardBox).not.toBeNull();
      // Card top should be at or below the bottom of the clicked element
      expect(cardBox.y).toBeGreaterThanOrEqual(headingBox.y);
    }

    await page.close();
  });

  // --- Task #3: Preview-only toggle and state persistence ---

  test('view toggle button is visible on wide viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const viewToggle = page.locator('#view-toggle');
    await expect(viewToggle).toBeVisible();

    await page.close();
  });

  test('view toggle button is hidden on narrow viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const viewToggle = page.locator('#view-toggle');
    // Should be hidden in narrow mode (CSS handles source panel)
    const isHidden = await viewToggle.evaluate(el => el.style.display === 'none');
    expect(isHidden).toBe(true);

    await page.close();
  });

  test('clicking view toggle hides source panel on wide viewport', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForSelector('.md-right');
    await page.waitForTimeout(500);

    // Source panel should be visible initially
    const mdRight = page.locator('.md-right');
    await expect(mdRight).toBeVisible();

    // Click toggle to hide source
    const viewToggle = page.locator('#view-toggle');
    await viewToggle.click();
    await page.waitForTimeout(300);

    // Source panel should now be hidden
    const isSourceHidden = await mdRight.evaluate(el => {
      return getComputedStyle(el).display === 'none';
    });
    expect(isSourceHidden).toBe(true);

    // md-layout should have preview-only class
    const hasClass = await page.locator('.md-layout').evaluate(el => {
      return el.classList.contains('preview-only');
    });
    expect(hasClass).toBe(true);

    // Click toggle again to show source
    await viewToggle.click();
    await page.waitForTimeout(300);

    await expect(mdRight).toBeVisible();

    await page.close();
  });

  test('preview-only state persists across page reloads', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForSelector('.md-right');
    await page.waitForTimeout(500);

    // Enable preview-only mode
    const viewToggle = page.locator('#view-toggle');
    await viewToggle.click();
    await page.waitForTimeout(300);

    // Verify localStorage was set
    const savedState = await page.evaluate(() => localStorage.getItem('reviw-panel-state'));
    expect(savedState).toBe('preview-only');

    // Reload the page
    await page.reload();
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Source panel should still be hidden after reload
    const isSourceHidden = await page.locator('.md-right').evaluate(el => {
      return getComputedStyle(el).display === 'none';
    });
    expect(isSourceHidden).toBe(true);

    // Toggle button should show preview-only state
    const toggleText = await page.locator('#view-toggle').textContent();
    expect(toggleText.trim()).toContain('👁');

    // Clean up: reset state
    await page.evaluate(() => localStorage.removeItem('reviw-panel-state'));
    await context.close();
  });

  test('preview is scrollable in explicit preview-only mode on wide viewport', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Enable preview-only
    await page.locator('#view-toggle').click();
    await page.waitForTimeout(300);

    const mdLeft = page.locator('.md-left');
    const scrollHeight = await mdLeft.evaluate(el => el.scrollHeight);
    const clientHeight = await mdLeft.evaluate(el => el.clientHeight);

    // Content should be scrollable
    expect(scrollHeight).toBeGreaterThan(clientHeight);

    // Verify scroll works
    await mdLeft.evaluate(el => el.scrollTo({ top: 200, behavior: 'instant' }));
    await page.waitForTimeout(100);
    const scrollTop = await mdLeft.evaluate(el => el.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // Clean up
    await page.evaluate(() => localStorage.removeItem('reviw-panel-state'));
    await context.close();
  });

  test('comment dialog appears below clicked element in explicit preview-only mode', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Enable preview-only
    await page.locator('#view-toggle').click();
    await page.waitForTimeout(300);

    // Click on a paragraph
    const paragraph = page.locator('.md-preview p').first();
    const paragraphBox = await paragraph.boundingBox();
    expect(paragraphBox).not.toBeNull();

    await paragraph.click();
    await page.waitForTimeout(500);

    const card = page.locator('#comment-card');
    const cardDisplay = await card.evaluate(el => el.style.display);
    expect(cardDisplay).toBe('block');

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    // Card should be below the clicked element
    expect(cardBox.y).toBeGreaterThanOrEqual(paragraphBox.y + paragraphBox.height - 10);

    // Clean up
    await page.evaluate(() => localStorage.removeItem('reviw-panel-state'));
    await context.close();
  });

  // --- Task #5: Preview highlight ---

  test('clicked preview element gets highlight class', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const paragraph = page.locator('.md-preview p').first();
    await paragraph.click();
    await page.waitForTimeout(500);

    // Element should have preview-highlight class
    const hasHighlight = await paragraph.evaluate(el => el.classList.contains('preview-highlight'));
    expect(hasHighlight).toBe(true);

    // Verify highlight color is light purple
    const bg = await paragraph.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bg).toContain('167');  // rgba(167,139,250,0.18)

    await page.close();
  });

  test('previous highlight is removed when clicking a new element', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    // Click first paragraph
    const para1 = page.locator('.md-preview p').first();
    await para1.click();
    await page.waitForTimeout(500);

    expect(await para1.evaluate(el => el.classList.contains('preview-highlight'))).toBe(true);

    // Click a list item
    const li = page.locator('.md-preview li').first();
    await li.click();
    await page.waitForTimeout(500);

    // First paragraph should no longer be highlighted
    expect(await para1.evaluate(el => el.classList.contains('preview-highlight'))).toBe(false);
    // List item should be highlighted
    expect(await li.evaluate(el => el.classList.contains('preview-highlight'))).toBe(true);

    await page.close();
  });

  test('highlight is removed when card is closed via ESC', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForSelector('.md-preview');
    await page.waitForTimeout(500);

    const paragraph = page.locator('.md-preview p').first();
    await paragraph.click();
    await page.waitForTimeout(500);

    expect(await paragraph.evaluate(el => el.classList.contains('preview-highlight'))).toBe(true);

    // Press ESC to close card
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Highlight should be removed
    const remaining = await page.locator('.preview-highlight').count();
    expect(remaining).toBe(0);

    await page.close();
  });
});
