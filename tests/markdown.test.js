import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');
const MD_FILE = path.join(__dirname, '..', 'test-sample.md');

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
    const codeBlock = preview.locator('pre').first();
    await expect(codeBlock).toBeVisible();

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-05-code-block.png'), fullPage: true });

    // 5. Mermaid fullscreen opens and closes
    const mermaidOverlay = page.locator('#mermaid-fullscreen');
    const hasMermaid = await page.evaluate(() => typeof window.mermaid !== 'undefined');
    if (hasMermaid) {
      const mermaidCount = await page.$$eval('.mermaid-container', els => els.length);
      if (mermaidCount > 0) {
        const mermaidContainer = preview.locator('.mermaid-container').first();
        await mermaidContainer.scrollIntoViewIfNeeded();
        await mermaidContainer.click();
        await expect(mermaidOverlay).toHaveClass(/visible/);
        await page.locator('#fs-close').click();
        await expect(mermaidOverlay).not.toHaveClass(/visible/);
      }
    }

    // 6. Image fullscreen uses dedicated overlay (no mermaid minimap bleed)
    const image = preview.locator('img').first();
    await image.scrollIntoViewIfNeeded();
    await image.click();
    const imageOverlay = page.locator('#image-fullscreen');
    await expect(imageOverlay).toHaveClass(/visible/);
    await expect(mermaidOverlay).not.toHaveClass(/visible/);
    await page.locator('#image-close').click();
    await expect(imageOverlay).not.toHaveClass(/visible/);

    await page.close();
  });

  test('image fullscreen navigation with arrow keys', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);

    const preview = page.locator('.md-preview');
    const imageOverlay = page.locator('#image-fullscreen');
    const imageContainer = page.locator('#image-container');

    // Count images in preview
    const imageCount = await preview.locator('img').count();
    if (imageCount < 2) {
      console.log('Skipping image navigation test: need at least 2 images');
      await page.close();
      return;
    }

    // 1. Click first image to open fullscreen
    const firstImage = preview.locator('img').first();
    await firstImage.scrollIntoViewIfNeeded();
    await firstImage.click();
    await expect(imageOverlay).toHaveClass(/visible/);

    // 2. Check counter shows "1 / N"
    const counter = imageContainer.locator('.fullscreen-counter');
    await expect(counter).toContainText(`1 / ${imageCount}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-nav-01-first-image.png') });

    // 3. Press ArrowRight to go to next image
    await page.keyboard.press('ArrowRight');
    await expect(counter).toContainText(`2 / ${imageCount}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-nav-02-second-image.png') });

    // 4. Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toContainText(`1 / ${imageCount}`);

    // 5. Press Escape to close
    await page.keyboard.press('Escape');
    await expect(imageOverlay).not.toHaveClass(/visible/);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-nav-03-closed.png') });

    await page.close();
  });

  test('scroll sync between source and preview', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);

    const mdLeft = page.locator('.md-left');
    const mdRight = page.locator('.md-right');

    // Get initial scroll positions
    const initialLeftScroll = await mdLeft.evaluate(el => el.scrollTop);
    const initialRightScroll = await mdRight.evaluate(el => el.scrollTop);

    // Both should start at top
    expect(initialLeftScroll).toBeLessThan(10);
    expect(initialRightScroll).toBeLessThan(10);

    // Scroll left pane down
    await mdLeft.evaluate(el => {
      el.scrollTop = el.scrollHeight * 0.5;
    });

    // Wait for sync
    await page.waitForTimeout(200);

    // Right pane should have scrolled too
    const rightScrollAfter = await mdRight.evaluate(el => el.scrollTop);
    expect(rightScrollAfter).toBeGreaterThan(100);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-sync-01-scrolled.png') });

    // Scroll to bottom
    await mdLeft.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });

    await page.waitForTimeout(200);

    // Right pane should be near bottom
    const rightScrollBottom = await mdRight.evaluate(el => ({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
    const rightMaxScroll = rightScrollBottom.scrollHeight - rightScrollBottom.clientHeight;
    expect(rightScrollBottom.scrollTop).toBeGreaterThan(rightMaxScroll * 0.8);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-sync-02-bottom.png') });

    await page.close();
  });

  test('comment dialog positioning at bottom', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);

    const mdLeft = page.locator('.md-left');
    const preview = page.locator('.md-preview');
    const commentCard = page.locator('#comment-card');

    // Scroll to bottom of preview
    await preview.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });

    await page.waitForTimeout(200);

    // Click on last paragraph in preview
    const lastParagraph = preview.locator('p').last();
    await lastParagraph.scrollIntoViewIfNeeded();
    await lastParagraph.click();

    // Wait for comment card to appear
    await page.waitForTimeout(400);

    // Check if comment card is visible and within viewport
    const isVisible = await commentCard.isVisible();
    if (isVisible) {
      const cardBox = await commentCard.boundingBox();
      const viewportSize = page.viewportSize();

      // Card should be within viewport (not cut off)
      expect(cardBox.y).toBeGreaterThanOrEqual(0);
      expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(viewportSize.height + 50); // Allow small overflow

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'md-comment-01-bottom.png') });
    }

    await page.close();
  });
});
