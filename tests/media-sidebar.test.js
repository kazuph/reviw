/**
 * E2E Tests for Media Sidebar, Fullscreen Image, and Text Selection Focus
 *
 * Tests cover:
 * 1. Media Sidebar - thumbnails, viewer centering, Mermaid, video timeline, wheel zoom, switching
 * 2. Fullscreen Image - overlay centering and sizing
 * 3. Text Selection Focus - duplicate heading disambiguation
 *
 * Uses: vitest + playwright (same patterns as bugfix-tdd.test.js)
 * Port: 4991
 * Test file: examples/test-features.md
 */

import { describe, test, beforeAll, afterAll } from 'vitest';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = '/tmp/media-sidebar-test';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Remove the lock file for a given md file so the CLI does not refuse to start.
 * The CLI creates lock files under ~/.reviw/locks/<hash>.lock keyed by absolute path.
 */
function removeLockFile(mdFile) {
  try {
    const absPath = path.resolve(mdFile);
    const hash = crypto.createHash('sha256').update(absPath).digest('hex').slice(0, 16);
    const lockPath = path.join(os.homedir(), '.reviw', 'locks', hash + '.lock');
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Kill any process currently listening on the given port.
 */
function killPort(port) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    if (pids) {
      for (const pid of pids.split('\n')) {
        try { process.kill(Number(pid), 'SIGKILL'); } catch (e) { /* ignore */ }
      }
    }
  } catch (e) {
    // no process on port
  }
}

function startServer(port, mdFile) {
  // Clean up any existing lock / port usage so the server actually starts fresh
  removeLockFile(mdFile);
  killPort(port);

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

// ---------------------------------------------------------------------------
// 1. Media Sidebar Tests
// ---------------------------------------------------------------------------
describe('Media Sidebar', () => {
  let browser;
  let serverProcess;
  const port = 4991;
  const mdFile = path.join(__dirname, '..', 'examples', 'test-features.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('sidebar shows thumbnails for images, mermaid, and videos', async () => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${port}`);
    // Wait for Mermaid rendering (SSE keeps connection open, so do NOT use networkidle)
    await page.waitForTimeout(5000);

    // Sidebar should be visible (not hidden)
    const sidebar = page.locator('#media-sidebar');
    const isHidden = await sidebar.evaluate(el => el.classList.contains('hidden'));
    expect(isHidden).toBe(false);

    // Collect all thumbnails
    const thumbs = page.locator('.media-sidebar-thumb');
    const thumbCount = await thumbs.count();
    expect(thumbCount).toBeGreaterThanOrEqual(3); // at least some images + mermaid + videos

    // Verify at least one image thumbnail (has an <img> inside)
    const imageThumbs = page.locator('.media-sidebar-thumb img');
    const imageThumbCount = await imageThumbs.count();
    expect(imageThumbCount).toBeGreaterThanOrEqual(1);

    // Verify at least one mermaid thumbnail
    const mermaidThumbs = page.locator('.media-sidebar-thumb-mermaid');
    const mermaidThumbCount = await mermaidThumbs.count();
    expect(mermaidThumbCount).toBeGreaterThanOrEqual(1);

    // Verify at least one video thumbnail
    const videoThumbs = page.locator('.media-sidebar-thumb-video');
    const videoThumbCount = await videoThumbs.count();
    expect(videoThumbCount).toBeGreaterThanOrEqual(1);

    // Each thumb should have an index badge
    const badges = page.locator('.media-sidebar-thumb-index');
    const badgeCount = await badges.count();
    expect(badgeCount).toBe(thumbCount);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-thumbnails.png') });
    await page.close();
  });

  test('clicking image thumbnail opens sidebar viewer centered correctly', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // Find the first image thumbnail and click it
    const firstImageThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('img')
    }).first();
    const thumbExists = await firstImageThumb.count() > 0;
    expect(thumbExists).toBe(true);

    await firstImageThumb.click();
    // Wait for viewer open transition + image load + fitToViewport
    await page.waitForTimeout(2000);

    // Viewer panel should have 'open' class
    const viewerPanel = page.locator('#media-sidebar-viewer');
    const isOpen = await viewerPanel.evaluate(el => el.classList.contains('open'));
    expect(isOpen).toBe(true);

    // The clicked thumbnail should have 'active' class
    const isActive = await firstImageThumb.evaluate(el => el.classList.contains('active'));
    expect(isActive).toBe(true);

    // Check that the image inside viewer is centered within the viewport
    const centering = await page.evaluate(() => {
      const viewport = document.querySelector('.sidebar-image-viewport');
      const wrapper = viewport?.querySelector('div[style*="transform-origin"]');
      const img = wrapper?.querySelector('img');
      if (!viewport || !wrapper || !img) return { found: false };

      const vpRect = viewport.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      const vpCenterX = vpRect.left + vpRect.width / 2;
      const vpCenterY = vpRect.top + vpRect.height / 2;
      const imgCenterX = imgRect.left + imgRect.width / 2;
      const imgCenterY = imgRect.top + imgRect.height / 2;

      return {
        found: true,
        vpCenter: { x: vpCenterX, y: vpCenterY },
        imgCenter: { x: imgCenterX, y: imgCenterY },
        diffX: Math.abs(vpCenterX - imgCenterX),
        diffY: Math.abs(vpCenterY - imgCenterY),
        imgVisible: imgRect.width > 0 && imgRect.height > 0,
        wrapperVisible: wrapper.style.visibility !== 'hidden'
      };
    });

    expect(centering.found).toBe(true);
    expect(centering.imgVisible).toBe(true);
    expect(centering.wrapperVisible).toBe(true);
    // Image center should be within 50px of viewport center
    expect(centering.diffX).toBeLessThan(50);
    expect(centering.diffY).toBeLessThan(50);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-image-centered.png') });
    await page.close();
  });

  test('clicking mermaid thumbnail shows diagram without flicker', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // Find the first mermaid thumbnail
    const mermaidThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('.media-sidebar-thumb-mermaid')
    }).first();
    const thumbExists = await mermaidThumb.count() > 0;
    expect(thumbExists).toBe(true);

    await mermaidThumb.click();
    // Wait for viewer transition + mermaid viewer initialization
    await page.waitForTimeout(2000);

    // Viewer should be open
    const viewerPanel = page.locator('#media-sidebar-viewer');
    const isOpen = await viewerPanel.evaluate(el => el.classList.contains('open'));
    expect(isOpen).toBe(true);

    // Check for flicker: the wrapper should be visible and zoom should NOT be '100%'
    // (fitToViewport should set a calculated zoom, not the default 100%)
    // The mermaid wrapper uses class 'sidebar-mermaid-wrapper' and starts with
    // visibility:hidden until fitToViewport completes after CSS transition.
    const mermaidState = await page.evaluate(() => {
      const viewer = document.getElementById('media-sidebar-viewer');
      if (!viewer) return { found: false };

      const wrapper = viewer.querySelector('.sidebar-mermaid-wrapper');
      const zoomInfo = viewer.querySelector('.sidebar-zoom-info');
      const controls = viewer.querySelector('.sidebar-mermaid-controls');

      return {
        found: true,
        hasWrapper: !!wrapper,
        wrapperVisible: wrapper ? wrapper.style.visibility !== 'hidden' : false,
        hasSvg: !!viewer.querySelector('svg'),
        zoomText: zoomInfo ? zoomInfo.textContent : null,
        controlsOpacity: controls ? controls.style.opacity : null,
      };
    });

    expect(mermaidState.found).toBe(true);
    expect(mermaidState.hasSvg).toBe(true);

    // After 1500ms additional wait (for CSS transition + fitToViewport), check stable state
    await page.waitForTimeout(1500);

    const stableState = await page.evaluate(() => {
      const viewer = document.getElementById('media-sidebar-viewer');
      const wrapper = viewer?.querySelector('.sidebar-mermaid-wrapper');
      const zoomInfo = viewer?.querySelector('.sidebar-zoom-info');
      const controls = viewer?.querySelector('.sidebar-mermaid-controls');
      return {
        wrapperVisible: wrapper ? wrapper.style.visibility !== 'hidden' : false,
        zoomText: zoomInfo ? zoomInfo.textContent : null,
        controlsVisible: controls ? controls.style.opacity !== '0' : true,
      };
    });

    expect(stableState.wrapperVisible).toBe(true);
    // Zoom should have been calculated (not the default empty or '100%')
    if (stableState.zoomText) {
      expect(stableState.zoomText).not.toBe('100%');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-mermaid-no-flicker.png') });
    await page.close();
  });

  test('clicking video thumbnail loads timeline with arrow key navigation', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // Find the first video thumbnail
    const videoThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('.media-sidebar-thumb-video')
    }).first();
    const thumbExists = await videoThumb.count() > 0;
    expect(thumbExists).toBe(true);

    await videoThumb.click();
    // Wait for viewer transition + SSE video timeline loading
    await page.waitForTimeout(5000);

    // Viewer should be open
    const viewerPanel = page.locator('#media-sidebar-viewer');
    const isOpen = await viewerPanel.evaluate(el => el.classList.contains('open'));
    expect(isOpen).toBe(true);

    // Video element should exist in the viewer
    const viewerVideo = page.locator('#media-sidebar-viewer video');
    const videoExists = await viewerVideo.count() > 0;
    expect(videoExists).toBe(true);

    // Timeline should be present (the SSE-loaded thumbnail strip)
    const timeline = page.locator('#media-sidebar-viewer .video-timeline');
    const timelineExists = await timeline.count() > 0;
    expect(timelineExists).toBe(true);

    // Wait a bit more for timeline thumbnails to load via SSE
    await page.waitForTimeout(3000);

    // Check if timeline has thumbnails
    const timelineThumbs = page.locator('#media-sidebar-viewer .timeline-thumb');
    const timelineThumbCount = await timelineThumbs.count();

    if (timelineThumbCount > 1) {
      // Get the initial video time
      const initialState = await page.evaluate(() => {
        const video = document.querySelector('#media-sidebar-viewer video');
        return {
          videoTime: video ? video.currentTime : -1,
        };
      });

      // Press ArrowRight to navigate to next scene
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Video currentTime should have changed
      const afterArrowState = await page.evaluate(() => {
        const video = document.querySelector('#media-sidebar-viewer video');
        return {
          videoTime: video ? video.currentTime : -1,
        };
      });

      // After ArrowRight, the video time should be different from initial (scene navigation)
      expect(afterArrowState.videoTime).not.toBe(initialState.videoTime);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-video-arrow-nav.png') });
    } else {
      // If no thumbnails loaded (e.g. ffmpeg not available), at least verify the timeline container exists
      console.log('No timeline thumbnails loaded (ffmpeg may not be available), skipping arrow navigation test');
    }

    await page.close();
  });

  test('image viewer supports wheel zoom', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // Open the first image thumbnail
    const firstImageThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('img')
    }).first();
    const thumbExists = await firstImageThumb.count() > 0;
    expect(thumbExists).toBe(true);

    await firstImageThumb.click();
    await page.waitForTimeout(2000);

    // Get initial zoom text
    const initialZoom = await page.evaluate(() => {
      const indicator = document.querySelector('.sidebar-zoom-indicator');
      return indicator ? indicator.textContent : null;
    });

    // Perform wheel zoom on the image viewport
    const viewport = page.locator('.sidebar-image-viewport');
    const vpExists = await viewport.count() > 0;
    expect(vpExists).toBe(true);

    const vpBox = await viewport.boundingBox();
    expect(vpBox).not.toBeNull();

    // Ctrl+Scroll up (zoom in) at the center of the viewport (Figma-style: Ctrl+wheel = zoom)
    await page.mouse.move(vpBox.x + vpBox.width / 2, vpBox.y + vpBox.height / 2);
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, -300); // negative deltaY = zoom in
    await page.keyboard.up('Control');
    await page.waitForTimeout(500);

    // Get zoom text after scrolling
    const afterZoom = await page.evaluate(() => {
      const indicator = document.querySelector('.sidebar-zoom-indicator');
      return indicator ? indicator.textContent : null;
    });

    // Zoom percentage should have changed
    if (initialZoom && afterZoom) {
      const initialPercent = parseInt(initialZoom.replace('%', ''), 10);
      const afterPercent = parseInt(afterZoom.replace('%', ''), 10);
      // After zooming in, percentage should be higher
      expect(afterPercent).toBeGreaterThan(initialPercent);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-image-zoom.png') });
    await page.close();
  });

  test('switching between different media types works', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    const thumbs = page.locator('.media-sidebar-thumb');
    const thumbCount = await thumbs.count();
    expect(thumbCount).toBeGreaterThanOrEqual(3);

    // Click first thumb (likely image)
    await thumbs.nth(0).click();
    await page.waitForTimeout(1500);

    const firstType = await page.evaluate(() => {
      const viewer = document.getElementById('media-sidebar-viewer');
      if (!viewer) return 'none';
      if (viewer.querySelector('.sidebar-image-viewport')) return 'image';
      if (viewer.querySelector('.sidebar-video-container')) return 'video';
      if (viewer.querySelector('.sidebar-mermaid-viewport')) return 'mermaid';
      if (viewer.querySelector('.viewer-mermaid-wrap')) return 'mermaid';
      return 'unknown';
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-switch-first.png') });

    // Find a different media type and click it
    // Try to find a mermaid thumb specifically
    const mermaidThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('.media-sidebar-thumb-mermaid')
    }).first();
    const hasMermaid = await mermaidThumb.count() > 0;

    if (hasMermaid) {
      await mermaidThumb.click();
      await page.waitForTimeout(1500);

      const secondType = await page.evaluate(() => {
        const viewer = document.getElementById('media-sidebar-viewer');
        if (!viewer) return 'none';
        if (viewer.querySelector('.sidebar-image-viewport')) return 'image';
        if (viewer.querySelector('.sidebar-video-container')) return 'video';
        if (viewer.querySelector('.sidebar-mermaid-viewport')) return 'mermaid';
        if (viewer.querySelector('.viewer-mermaid-wrap')) return 'mermaid';
        return 'unknown';
      });

      // Types should be different after switching
      expect(secondType).not.toBe(firstType);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-switch-second.png') });
    }

    // Now switch to a video if available
    const videoThumb = page.locator('.media-sidebar-thumb').filter({
      has: page.locator('.media-sidebar-thumb-video')
    }).first();
    const hasVideo = await videoThumb.count() > 0;

    if (hasVideo) {
      await videoThumb.click();
      await page.waitForTimeout(1500);

      const thirdType = await page.evaluate(() => {
        const viewer = document.getElementById('media-sidebar-viewer');
        if (!viewer) return 'none';
        if (viewer.querySelector('.sidebar-image-viewport')) return 'image';
        if (viewer.querySelector('.sidebar-video-container')) return 'video';
        if (viewer.querySelector('.sidebar-mermaid-viewport')) return 'mermaid';
        if (viewer.querySelector('.viewer-mermaid-wrap')) return 'mermaid';
        return 'unknown';
      });

      expect(thirdType).toBe('video');

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sidebar-switch-third.png') });
    }

    // Verify the viewer can be closed
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const viewerClosed = await page.evaluate(() => {
      const viewer = document.getElementById('media-sidebar-viewer');
      return viewer ? !viewer.classList.contains('open') : true;
    });
    expect(viewerClosed).toBe(true);

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// 2. Fullscreen Image Tests
// ---------------------------------------------------------------------------
describe('Fullscreen Image', () => {
  let browser;
  let serverProcess;
  const port = 4992;
  const mdFile = path.join(__dirname, '..', 'examples', 'test-features.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('clicking preview image opens fullscreen overlay centered and large', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // Find an image in the preview pane
    const previewImage = page.locator('.md-preview img').first();
    const imgExists = await previewImage.count() > 0;
    expect(imgExists).toBe(true);

    // Click the image to open fullscreen overlay
    await previewImage.click();
    await page.waitForTimeout(1000);

    // The image-fullscreen overlay should be visible
    const overlay = page.locator('#image-fullscreen');
    const isVisible = await overlay.evaluate(el => el.classList.contains('visible'));
    expect(isVisible).toBe(true);

    // Check the fullscreen image is centered and takes up significant screen space
    const layout = await page.evaluate(() => {
      const overlay = document.getElementById('image-fullscreen');
      const wrapper = document.getElementById('image-fs-wrapper');
      const img = wrapper ? wrapper.querySelector('img') : null;
      if (!overlay || !wrapper || !img) return { found: false };

      const overlayRect = overlay.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Check centering - image should be centered via createZoomPanViewer
      const imgCenterX = imgRect.left + imgRect.width / 2;
      const imgCenterY = imgRect.top + imgRect.height / 2;
      const vpCenterX = viewportW / 2;
      const vpCenterY = viewportH / 2;

      // Check counter in header
      const counter = document.getElementById('image-fs-counter');

      return {
        found: true,
        overlayCoversViewport: overlayRect.width >= viewportW * 0.9 && overlayRect.height >= viewportH * 0.9,
        imgWidth: imgRect.width,
        imgHeight: imgRect.height,
        imgVisible: imgRect.width > 50 && imgRect.height > 50,
        centerDiffX: Math.abs(imgCenterX - vpCenterX),
        centerDiffY: Math.abs(imgCenterY - vpCenterY),
        hasCounter: !!(counter && counter.textContent.trim()),
      };
    });

    expect(layout.found).toBe(true);
    expect(layout.overlayCoversViewport).toBe(true);
    expect(layout.imgVisible).toBe(true);
    // Overlay should be roughly centered on viewport
    expect(layout.centerDiffX).toBeLessThan(50);
    expect(layout.centerDiffY).toBeLessThan(50);
    // Should show navigation counter
    expect(layout.hasCounter).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'fullscreen-image-centered.png') });

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const isClosed = await overlay.evaluate(el => !el.classList.contains('visible'));
    expect(isClosed).toBe(true);

    await page.close();
  });
});

// ---------------------------------------------------------------------------
// 3. Text Selection Focus Tests
// ---------------------------------------------------------------------------
describe('Text Selection Focus', () => {
  let browser;
  let serverProcess;
  const port = 4993;
  const mdFile = path.join(__dirname, '..', 'examples', 'test-features.md');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
    serverProcess = await startServer(port, mdFile);
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    killServer(serverProcess);
  });

  test('clicking repeated heading focuses correct source line (not first occurrence)', async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:${port}`);
    await page.waitForTimeout(5000);

    // The test file has "goto制限チェック" at line 26 (inside <details>) and line 104 (under ## 4.)
    // We need to click the SECOND occurrence (under "## 4. E2E Health Review")
    // and verify the source scrolls to line 104, NOT line 26.

    // First, find all headings containing the target text in the preview
    const matchingHeadings = await page.evaluate(() => {
      const preview = document.querySelector('.md-preview');
      if (!preview) return [];
      // h3 elements containing the target text
      const headings = Array.from(preview.querySelectorAll('h3'));
      return headings
        .filter(h => h.textContent.includes('goto'))
        .map((h, i) => {
          const rect = h.getBoundingClientRect();
          return {
            index: i,
            text: h.textContent.replace(/[^\u0000-\uFFFF]/g, '').trim(),
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        });
    });

    // There should be at least 2 occurrences
    expect(matchingHeadings.length).toBeGreaterThanOrEqual(2);

    // Scroll the preview to make the second (last) occurrence visible
    await page.evaluate(() => {
      const preview = document.querySelector('.md-preview');
      if (!preview) return;
      const headings = Array.from(preview.querySelectorAll('h3'));
      const targets = headings.filter(h => h.textContent.includes('goto'));
      const lastTarget = targets[targets.length - 1];
      if (lastTarget) {
        lastTarget.scrollIntoView({ block: 'center' });
      }
    });
    await page.waitForTimeout(1000);

    // Now click on the second (last) occurrence
    const allGotoHeadings = page.locator('.md-preview h3').filter({ hasText: 'goto' });
    const headingCount = await allGotoHeadings.count();
    expect(headingCount).toBeGreaterThanOrEqual(2);

    const secondGotoHeading = allGotoHeadings.last();

    // Click the heading text (avoiding the toggle icon if present)
    await secondGotoHeading.click({ position: { x: 100, y: 10 } });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'text-selection-focus.png') });

    // Check which source line got selected
    const selectionInfo = await page.evaluate(() => {
      // Find selected cells in the source pane
      const selectedCells = document.querySelectorAll('td.selected');
      if (selectedCells.length === 0) return { found: false, selectedRows: [] };

      const rows = Array.from(selectedCells).map(td => {
        const row = td.getAttribute('data-row');
        return row ? parseInt(row, 10) : -1;
      }).filter(r => r > 0);

      // Also check the scroll position of the source pane
      const mdRight = document.querySelector('.md-right');
      const scrollTop = mdRight ? mdRight.scrollTop : -1;

      return {
        found: rows.length > 0,
        selectedRows: rows,
        minRow: Math.min(...rows),
        maxRow: Math.max(...rows),
        scrollTop: scrollTop,
      };
    });

    expect(selectionInfo.found).toBe(true);

    // The selected row should be around line 104 (the second occurrence under ## 4.)
    // NOT line 26 (the first occurrence inside <details>)
    // Allow some tolerance: the heading "### goto..." is at line 104
    const selectedRow = selectionInfo.minRow;
    expect(selectedRow).toBeGreaterThan(80); // Should be well past the first occurrence at line 26
    expect(selectedRow).toBeLessThan(120); // Should be near line 104

    await page.close();
  });
});
