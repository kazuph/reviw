/**
 * Video Viewer Check E2E Test
 * Converted from e2e/video-viewer-check.mjs
 *
 * Tests sidebar thumbnail clicks, viewer panel population,
 * timeline labels vs video duration, and arrow key navigation.
 *
 * Run: npx tsx v2/e2e/video_viewer.ts
 * Requires a running server (e.g. on localhost:18900)
 */
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:18900';
const SCREENSHOT_DIR = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/video-timeline-fix/check-yourself';

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function screenshot(page: Page, name: string): Promise<string> {
  const p = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  Screenshot saved: ${name}`);
  return p;
}

(async () => {
  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page: Page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  console.log('=== Step a: Opening page ===');
  await page.goto(BASE_URL, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '01-initial-page.png');

  // First, open the media sidebar if it's not already open
  const sidebarVisible = await page.evaluate(() => {
    const sidebar = document.getElementById('media-sidebar');
    if (!sidebar) return false;
    return sidebar.classList.contains('open') || getComputedStyle(sidebar).display !== 'none';
  });
  console.log(`  Sidebar visible: ${sidebarVisible}`);

  if (!sidebarVisible) {
    console.log('  Clicking sidebar toggle button...');
    await page.click('#media-sidebar-toggle');
    await page.waitForTimeout(500);
  }

  console.log('\n=== Step b: Count sidebar thumbnails ===');
  // Use the correct selector: .media-sidebar-thumb
  const thumbSelector = '.media-sidebar-thumb';
  const allThumbs = page.locator(thumbSelector);
  const thumbCount = await allThumbs.count();
  console.log(`  Thumbnail count: ${thumbCount}`);

  // Get details of each thumbnail
  const thumbDetails = await page.evaluate(() => {
    const thumbs = document.querySelectorAll('.media-sidebar-thumb');
    return Array.from(thumbs).map((t, i) => ({
      index: i,
      class: t.className,
      dataType: t.getAttribute('data-type'),
      dataIndex: t.getAttribute('data-index'),
      text: t.textContent?.trim().substring(0, 30) || '',
      hasCanvas: t.querySelector('canvas') !== null,
      hasImg: t.querySelector('img') !== null,
      isActive: t.classList.contains('active'),
    }));
  });
  console.log('  Thumbnail details:');
  thumbDetails.forEach((t) => console.log(`    [${t.index}] type=${t.dataType} active=${t.isActive} text="${t.text}"`));

  // Check media-sidebar-viewer state BEFORE click
  const viewerBefore = await page.evaluate(() => {
    const viewer = document.querySelector('.media-sidebar-viewer');
    if (!viewer) return { exists: false } as const;
    return {
      exists: true,
      className: (viewer as HTMLElement).className,
      display: getComputedStyle(viewer).display,
      width: getComputedStyle(viewer).width,
      innerHTML: viewer.innerHTML.substring(0, 300),
      childCount: viewer.children.length,
    };
  });
  console.log('  Viewer BEFORE click:', JSON.stringify(viewerBefore, null, 2));

  // === Step c: Click 1st thumbnail (Before image) ===
  console.log('\n=== Step c: Click 1st thumbnail ===');
  if (thumbCount >= 1) {
    await allThumbs.nth(0).click();
    await page.waitForTimeout(1000);
    await screenshot(page, '02-after-click-thumb1.png');

    const viewerAfter1 = await page.evaluate(() => {
      const viewer = document.querySelector('.media-sidebar-viewer');
      if (!viewer) return { exists: false, error: 'No .media-sidebar-viewer found' } as const;
      return {
        exists: true,
        className: (viewer as HTMLElement).className,
        display: getComputedStyle(viewer).display,
        width: getComputedStyle(viewer).width,
        height: getComputedStyle(viewer).height,
        overflow: getComputedStyle(viewer).overflow,
        innerHTML: viewer.innerHTML.substring(0, 1000),
        childCount: viewer.children.length,
        hasImg: viewer.querySelector('img') !== null,
        hasVideo: viewer.querySelector('video') !== null,
        hasCanvas: viewer.querySelector('canvas') !== null,
        imgSrc: viewer.querySelector('img')?.getAttribute('src')?.substring(0, 100) || null,
      };
    });
    console.log('  Viewer after click 1:', JSON.stringify(viewerAfter1, null, 2));

    // If viewer is blank, check if .open class was added to sidebar
    const sidebarState = await page.evaluate(() => {
      const sidebar = document.getElementById('media-sidebar');
      return {
        className: sidebar?.className || '',
        hasViewerOpen: sidebar?.classList.contains('viewer-open') || false,
        width: sidebar ? getComputedStyle(sidebar).width : 'N/A',
      };
    });
    console.log('  Sidebar state:', JSON.stringify(sidebarState));

    if (viewerAfter1.exists && viewerAfter1.childCount === 0) {
      console.log('  *** BUG CONFIRMED: Viewer panel is EMPTY after clicking thumbnail ***');
      console.log('  Console errors so far:', consoleErrors);

      // Check JS event handlers
      const handlers = await page.evaluate(() => {
        const thumb = document.querySelector('.media-sidebar-thumb');
        // Check if onclick is set
        return {
          hasOnclick: !!(thumb as HTMLElement)?.onclick,
          hasEventListeners: typeof thumb?.addEventListener === 'function',
        };
      });
      console.log('  Handler info:', JSON.stringify(handlers));
    }
  }

  // === Step d: Click 2nd thumbnail (video) ===
  console.log('\n=== Step d: Click 2nd thumbnail ===');
  if (thumbCount >= 2) {
    await allThumbs.nth(1).click();
    await page.waitForTimeout(1500);
    await screenshot(page, '03-after-click-thumb2.png');

    const viewerAfter2 = await page.evaluate(() => {
      const viewer = document.querySelector('.media-sidebar-viewer');
      if (!viewer) return { exists: false } as const;
      return {
        exists: true,
        className: (viewer as HTMLElement).className,
        innerHTML: viewer.innerHTML.substring(0, 1000),
        childCount: viewer.children.length,
        hasVideo: viewer.querySelector('video') !== null,
        display: getComputedStyle(viewer).display,
        width: getComputedStyle(viewer).width,
      };
    });
    console.log('  Viewer after click 2:', JSON.stringify(viewerAfter2, null, 2));

    // Check if there are timeline elements anywhere on the page
    const timelineAnywhere = await page.evaluate(() => {
      const all = document.querySelectorAll('[class*="timeline"]');
      return Array.from(all).map((el: Element) => ({
        class: el.className,
        visible: getComputedStyle(el).display !== 'none',
        text: el.textContent?.trim().substring(0, 80) || '',
        parent: el.parentElement?.className || '',
      }));
    });
    console.log('  All timeline elements on page:', JSON.stringify(timelineAnywhere, null, 2));
  }

  // === Step e & f: Get timeline labels and video duration ===
  console.log('\n=== Step e: Timeline labels ===');
  const timelineLabels = await page.evaluate(() => {
    // Check sidebar thumb timeline labels
    const thumbTimelines = document.querySelectorAll('.media-sidebar-thumb .video-timeline');
    const result: Array<{ thumbIndex: number; time: string; thumbClass: string }> = [];
    thumbTimelines.forEach((tl, i) => {
      const timeEl = tl.querySelector('.timeline-time');
      result.push({
        thumbIndex: i,
        time: timeEl?.textContent?.trim() || '',
        thumbClass: tl.closest('.media-sidebar-thumb')?.className || '',
      });
    });
    return result;
  });
  console.log('  Thumb timeline labels:', JSON.stringify(timelineLabels, null, 2));

  // All time-related elements
  const allTimeTexts = await page.evaluate(() => {
    const els = document.querySelectorAll('.timeline-time, .video-timeline, [class*="duration"]');
    return Array.from(els).map((el: Element) => ({
      class: el.className,
      text: el.textContent?.trim().substring(0, 50) || '',
      visible: getComputedStyle(el).display !== 'none',
    }));
  });
  console.log('  All time elements:', JSON.stringify(allTimeTexts));

  console.log('\n=== Step f: Video duration ===');
  const videoInfo = await page.evaluate(() => {
    const videos = document.querySelectorAll('video');
    return Array.from(videos).map((v, i) => ({
      index: i,
      duration: v.duration,
      currentTime: v.currentTime,
      readyState: v.readyState,
      src: v.src?.substring(0, 100),
      parentClass: v.parentElement?.className || '',
    }));
  });
  console.log('  All videos on page:', JSON.stringify(videoInfo, null, 2));

  // === Step g: Timeline vs duration ===
  console.log('\n=== Step g: Timeline label vs duration check ===');
  if (timelineLabels.length > 0 && videoInfo.length > 0) {
    timelineLabels.forEach((tl) => {
      if (tl.time) {
        const match = tl.time.match(/(\d+):(\d+)/);
        if (match) {
          const labelSec = parseInt(match[1]) * 60 + parseInt(match[2]);
          const vid = videoInfo[0];
          console.log(`  Thumb ${tl.thumbIndex}: label="${tl.time}" (${labelSec}s), video duration=${vid?.duration}s`);
          if (vid && labelSec > vid.duration) {
            console.log(`    *** BUG: Label exceeds video duration! ***`);
          }
        }
      }
    });
  }

  // === Step h: Click 5th thumbnail ===
  console.log('\n=== Step h: Click 5th thumbnail ===');
  if (thumbCount >= 5) {
    await allThumbs.nth(4).click();
    await page.waitForTimeout(1500);
    await screenshot(page, '04-after-click-thumb5.png');

    const viewerAfter5 = await page.evaluate(() => {
      const viewer = document.querySelector('.media-sidebar-viewer');
      return {
        innerHTML: viewer?.innerHTML?.substring(0, 500) || 'N/A',
        childCount: viewer?.children?.length ?? -1,
      };
    });
    console.log('  Viewer after click 5:', JSON.stringify(viewerAfter5));

    // Timeline labels for this video
    const labels5 = await page.evaluate(() => {
      const active = document.querySelector('.media-sidebar-thumb.active');
      if (!active) return { error: 'No active thumb' } as const;
      const tl = active.querySelector('.video-timeline');
      const time = active.querySelector('.timeline-time');
      return {
        error: null,
        activeIndex: active.getAttribute('data-index'),
        hasTimeline: !!tl,
        timeText: time?.textContent?.trim() || '',
        thumbHTML: active.innerHTML.substring(0, 500),
      };
    });
    console.log('  5th thumbnail details:', JSON.stringify(labels5, null, 2));
  } else {
    console.log(`  Only ${thumbCount} thumbnails, skipping`);
  }

  // === Step i: Arrow key navigation ===
  console.log('\n=== Step i: Right arrow key navigation ===');
  if (thumbCount >= 2) {
    // Start from thumb 2
    await allThumbs.nth(1).click();
    await page.waitForTimeout(500);

    const activeBefore = await page.evaluate(() => {
      const active = document.querySelector('.media-sidebar-thumb.active');
      return {
        index: active?.getAttribute('data-index') || null,
        text: active?.textContent?.trim().substring(0, 30) || '',
      };
    });
    console.log('  Active before ArrowRight:', JSON.stringify(activeBefore));
    await screenshot(page, '05-before-arrow-key.png');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    const activeAfter = await page.evaluate(() => {
      const active = document.querySelector('.media-sidebar-thumb.active');
      return {
        index: active?.getAttribute('data-index') || null,
        text: active?.textContent?.trim().substring(0, 30) || '',
      };
    });
    console.log('  Active after ArrowRight:', JSON.stringify(activeAfter));
    await screenshot(page, '06-after-arrow-right.png');

    const navigated = activeBefore.index !== activeAfter.index;
    console.log(`  Navigation worked: ${navigated}`);

    // Check viewer content after navigation
    const viewerNav = await page.evaluate(() => {
      const viewer = document.querySelector('.media-sidebar-viewer');
      return {
        childCount: viewer?.children?.length ?? -1,
        innerHTML: viewer?.innerHTML?.substring(0, 300) || 'empty',
      };
    });
    console.log('  Viewer after navigation:', JSON.stringify(viewerNav));
  }

  // === Final Summary ===
  console.log('\n========================================');
  console.log('=== FINAL SUMMARY ===');
  console.log('========================================');
  console.log(`Total thumbnails found: ${thumbCount}`);
  console.log(`Console errors: ${consoleErrors.length}`);
  consoleErrors.forEach((e, i) => console.log(`  Error ${i}: ${e}`));

  // Check the main bug
  const finalViewerState = await page.evaluate(() => {
    const viewer = document.querySelector('.media-sidebar-viewer');
    return {
      exists: !!viewer,
      childCount: viewer?.children?.length ?? -1,
      innerHTML: viewer?.innerHTML?.substring(0, 200) || 'N/A',
      display: viewer ? getComputedStyle(viewer).display : 'N/A',
      width: viewer ? getComputedStyle(viewer).width : 'N/A',
    };
  });
  console.log('Final viewer state:', JSON.stringify(finalViewerState, null, 2));

  if (finalViewerState.childCount === 0) {
    console.log('\n*** CONFIRMED BUG: .media-sidebar-viewer is always EMPTY ***');
    console.log('*** Clicking thumbnails does NOT populate the viewer panel ***');
    console.log('*** The viewer panel exists in DOM but has no content ***');
  }

  await browser.close();
  console.log('\nDone!');
})();
