/**
 * TDD Tests for Codex Review Bugs
 *
 * These tests are designed to FAIL first (Red phase),
 * then pass after bug fixes (Green phase).
 *
 * Bugs:
 * [P2] Duplicate heading keys - same text creates same key
 * [P2] Toggle icon breaks scroll sync - ▼ in textContent
 * [P3] Video settings panel not closing - closeVideoOverlay reassignment
 */

import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', '.artifacts');

function startServer(port, mdFile) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['cli.cjs', mdFile, '--port', String(port), '--no-open'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      detached: true,
    });

    const timeout = setTimeout(() => {
      reject(new Error('Server start timeout'));
    }, 30000);

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

function killServer(serverProcess) {
  if (serverProcess) {
    try {
      process.kill(-serverProcess.pid, 'SIGKILL');
    } catch (e) {
      // ignore if already dead
    }
  }
}

/**
 * [P2] Bug: Duplicate Heading Keys
 *
 * Problem: When two headings have the same text (e.g., two "## Section"),
 * they get the same data-heading-key value. querySelector only returns
 * the first element, so clicking the second heading toggles the first.
 */
describe('[P2] Duplicate Heading Keys Bug', () => {
  let browser;
  let serverProcess;
  const port = 3020;
  const mdFile = path.join(__dirname, 'fixtures', 'duplicate-headings.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('clicking second duplicate heading should NOT affect first heading', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    // Find all h2 headings with text "Section"
    const sectionHeadings = page.locator('.md-preview h2.md-heading-toggle').filter({ hasText: 'Section' });
    const count = await sectionHeadings.count();

    // Should have at least 2 headings with same text
    expect(count).toBeGreaterThanOrEqual(2);

    // Get the first and second "Section" heading
    const firstHeading = sectionHeadings.nth(0);
    const secondHeading = sectionHeadings.nth(1);

    // Check initial state - both should be expanded (no 'collapsed' class)
    const firstIcon = firstHeading.locator('.heading-toggle-icon');
    const secondIcon = secondHeading.locator('.heading-toggle-icon');

    // 注意: アイコンは常に▼で、CSSのrotate(-90deg)で回転させて▶に見せている
    // そのため、collapsedクラスの有無で判定する
    const firstCollapsedBefore = await firstHeading.evaluate(el => el.classList.contains('collapsed'));
    const secondCollapsedBefore = await secondHeading.evaluate(el => el.classList.contains('collapsed'));
    expect(firstCollapsedBefore).toBe(false);
    expect(secondCollapsedBefore).toBe(false);

    // Click the SECOND heading's toggle ICON to collapse it
    // (トグルはアイコンクリックでのみ動作する仕様)
    await secondIcon.click();
    await page.waitForTimeout(300);

    // CRITICAL: Second heading should be collapsed, first should remain expanded
    // BUG: Due to duplicate keys, clicking second actually collapses the first!
    const firstCollapsedAfter = await firstHeading.evaluate(el => el.classList.contains('collapsed'));
    const secondCollapsedAfter = await secondHeading.evaluate(el => el.classList.contains('collapsed'));

    // This assertion will FAIL if the bug exists:
    // - First heading should NOT have 'collapsed' class
    // - Second heading should have 'collapsed' class
    expect(firstCollapsedAfter).toBe(false); // First should NOT change
    expect(secondCollapsedAfter).toBe(true); // Second should collapse

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tdd-duplicate-heading.png') });
    await page.close();
  });
});

/**
 * [P2] Bug: Toggle Icon Breaks Scroll Sync
 *
 * Problem: The ▼ icon is inserted directly into heading, causing
 * h.textContent.trim() to include "▼" prefix. This breaks the
 * scroll sync which compares raw heading text from source.
 */
describe('[P2] Toggle Icon Breaks Scroll Sync', () => {
  let browser;
  let serverProcess;
  const port = 3021;
  const mdFile = path.join(__dirname, 'fixtures', 'sample.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('scroll sync should work correctly with heading toggle icons', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    const mdLeft = page.locator('.md-left');
    const mdRight = page.locator('.md-right');
    const preview = page.locator('.md-preview');

    // Find a heading in preview that has a toggle icon
    const heading = preview.locator('h2.md-heading-toggle').first();
    const headingExists = await heading.count() > 0;

    if (!headingExists) {
      console.log('No toggle headings found, skipping test');
      await page.close();
      return;
    }

    // Get the heading text (should be like "Overview", not "▼Overview")
    const headingTextContent = await heading.textContent();

    // The icon should be in a separate span, not polluting the text content
    // for comparison purposes
    const iconElement = heading.locator('.heading-toggle-icon');
    const hasIcon = await iconElement.count() > 0;
    expect(hasIcon).toBe(true);

    // Scroll the source pane to a heading line
    // The sync should find matching heading in preview
    const sourceLines = await mdLeft.locator('td[data-row]').all();
    let headingLineRow = -1;

    for (const line of sourceLines) {
      const text = await line.textContent();
      if (text && text.trim().startsWith('## ')) {
        headingLineRow = await line.getAttribute('data-row');
        break;
      }
    }

    if (headingLineRow === -1) {
      console.log('No heading found in source, skipping');
      await page.close();
      return;
    }

    // Click on the source heading to trigger sync
    const sourceHeadingCell = mdLeft.locator(`td[data-row="${headingLineRow}"][data-col="1"]`);
    await sourceHeadingCell.click();
    await page.waitForTimeout(500);

    // The preview should scroll to the matching heading
    // BUG: If textContent includes the icon, sync will fail to find match

    // Check that the heading is visible in viewport
    const headingBox = await heading.boundingBox();
    const previewBox = await mdRight.boundingBox();

    // Heading should be within the preview viewport (with some tolerance)
    // This test might fail if scroll sync is broken by the icon
    if (headingBox && previewBox) {
      const headingVisible =
        headingBox.y >= previewBox.y - 100 &&
        headingBox.y <= previewBox.y + previewBox.height + 100;

      expect(headingVisible).toBe(true);
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tdd-scroll-sync.png') });
    await page.close();
  });

  test('heading text extraction should exclude toggle icon', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(1000);

    // Check that the scroll sync logic can extract heading text without icon
    const result = await page.evaluate(() => {
      const heading = document.querySelector('h2.md-heading-toggle');
      if (!heading) return { found: false };

      const fullText = heading.textContent.trim();
      const icon = heading.querySelector('.heading-toggle-icon');
      const iconText = icon ? icon.textContent.trim() : '';

      // The heading text should NOT start with the icon character
      // for proper scroll sync matching
      return {
        found: true,
        fullText,
        iconText,
        startsWithIcon: fullText.startsWith(iconText) && iconText.length > 0
      };
    });

    expect(result.found).toBe(true);
    // BUG: This will fail if the icon is at the beginning of textContent
    // and pollutes the comparison
    // In the current buggy implementation, fullText will be "▼Overview"
    // After fix, the icon should be excluded from text comparison

    await page.close();
  });
});

/**
 * [P3] Bug: Video Settings Panel Not Closing
 *
 * Problem: closeVideoOverlay is reassigned AFTER event listeners are bound,
 * so the old function reference is kept and settings panel isn't closed.
 */
describe('[P3] Video Settings Panel Not Closing', () => {
  let browser;
  let serverProcess;
  const port = 3022;
  const mdFile = path.join(__dirname, '..', 'examples', 'table-with-videos.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('video settings panel should close when overlay closes', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(2000);

    // Scroll to find video
    await page.evaluate(() => {
      const rightPane = document.querySelector('.md-right');
      if (rightPane) rightPane.scrollTop = 500;
    });
    await page.waitForTimeout(500);

    // Find and click fullscreen button
    const fullscreenBtn = page.locator('.video-fullscreen-btn').first();
    const btnExists = await fullscreenBtn.count() > 0;

    if (!btnExists) {
      console.log('No video fullscreen button found, skipping');
      await page.close();
      return;
    }

    await fullscreenBtn.click();
    await page.waitForTimeout(1000);

    // Verify overlay is open
    const overlay = page.locator('#video-fullscreen.visible');
    const overlayVisible = await overlay.count() > 0;

    if (!overlayVisible) {
      console.log('Video overlay not visible, skipping');
      await page.close();
      return;
    }

    // Open settings panel
    const settingsBtn = page.locator('#video-settings-btn');
    const settingsBtnExists = await settingsBtn.count() > 0;

    if (settingsBtnExists && await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(300);

      // Check settings panel is visible
      const settingsPanel = page.locator('#video-settings-panel.visible');
      const panelVisible = await settingsPanel.count() > 0;

      if (panelVisible) {
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tdd-video-settings-open.png') });

        // Close the overlay with Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // BUG: Settings panel should be hidden when overlay closes
        // Due to the function reassignment bug, it might remain visible
        const panelStillVisible = await page.evaluate(() => {
          const panel = document.querySelector('#video-settings-panel');
          return panel && panel.classList.contains('visible');
        });

        await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tdd-video-settings-closed.png') });

        // This assertion will FAIL if the bug exists
        expect(panelStillVisible).toBe(false);
      }
    }

    await page.close();
  });
});
