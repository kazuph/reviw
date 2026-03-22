/**
 * Video Timeline E2E Test
 * Consolidated from e2e/video-timeline-test.mjs and e2e/video-timeline-verify.mjs
 *
 * Tests:
 * - Video thumbnail detection and click
 * - Timeline label extraction and duration validation
 * - Arrow key navigation between thumbnails
 * - Multiple video timeline verification
 *
 * Run: npx tsx v2/e2e/video_timeline.ts
 * Requires a running server (e.g. on localhost:18765)
 */
import { chromium, type Browser, type Page } from 'playwright';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

const ARTIFACTS_DIR = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/video-timeline-fix';
const BASE_URL = 'http://localhost:18765';

mkdirSync(ARTIFACTS_DIR, { recursive: true });

// ===== Part 1: Detailed DOM investigation (from video-timeline-test.mjs) =====

async function runDetailedTest(): Promise<void> {
  console.log('\n========================================');
  console.log('=== Part 1: Detailed Timeline Test ===');
  console.log('========================================');

  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    // 1. Access the page
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000); // Wait for ffmpeg thumbnail generation

    // 2. Screenshot of sidebar
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-sidebar-thumbnails.png') });
    console.log('Screenshot: 01-sidebar-thumbnails.png');

    // 3. Click video thumbnail (using media-sidebar-thumb-video class)
    const videoThumbs = await page.$$('.media-sidebar-thumb-video');
    console.log(`Found ${videoThumbs.length} video thumbnails in sidebar`);

    if (videoThumbs.length > 0) {
      // Click the first video thumbnail
      await videoThumbs[0].click();
      await page.waitForTimeout(2000);

      // 4. Video viewer screenshot
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-video-viewer.png') });
      console.log('Screenshot: 02-video-viewer.png');

      // 5. Get video duration
      const videoInfo = await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return { found: false };
        return {
          found: true,
          duration: video.duration,
          currentTime: video.currentTime,
          readyState: video.readyState,
          src: video.src?.substring(0, 200)
        };
      });
      console.log('Video info:', JSON.stringify(videoInfo));

      // 6. Check if fullscreen overlay is open
      const overlay = await page.$('.video-fullscreen-overlay, .fullscreen-overlay');
      if (overlay) {
        const overlayVisible = await overlay.isVisible();
        console.log('Fullscreen overlay visible:', overlayVisible);
      }

      // 7. Investigate video-fullscreen-overlay contents
      const overlayInfo = await page.evaluate(() => {
        const overlay = document.querySelector('.video-fullscreen-overlay');
        if (!overlay) return { found: false };
        return {
          found: true,
          display: getComputedStyle(overlay).display,
          visibility: getComputedStyle(overlay).visibility,
          innerHTML: overlay.innerHTML.substring(0, 3000),
          childClasses: Array.from(overlay.querySelectorAll('[class]')).map((el: Element) => el.className).slice(0, 30)
        };
      });
      console.log('Video fullscreen overlay:', JSON.stringify(overlayInfo, null, 2));

      // 8. Investigate timeline details
      const timelineDetails = await page.evaluate(() => {
        // Search for video-preview class elements
        const previews = document.querySelectorAll('.video-preview, [class*="preview"], [class*="timeline"]');
        const results: Array<{ className: string; childCount: number; textContent: string; visible: boolean }> = [];
        previews.forEach((el: Element) => {
          results.push({
            className: el.className,
            childCount: el.children.length,
            textContent: el.textContent?.substring(0, 500) || '',
            visible: getComputedStyle(el).display !== 'none'
          });
        });

        // Extract timestamp labels from canvas or div
        const allText: Array<{ text: string; className: string; tag: string; parentClass: string }> = [];
        document.querySelectorAll('*').forEach((el: Element) => {
          if (el.children.length === 0) {
            const text = el.textContent?.trim();
            if (text && text.length < 10 && /\d/.test(text)) {
              allText.push({
                text,
                className: el.className,
                tag: el.tagName,
                parentClass: el.parentElement?.className || ''
              });
            }
          }
        });

        return { previews: results, timestampCandidates: allText };
      });
      console.log('Timeline details:', JSON.stringify(timelineDetails, null, 2));

      // 9. Re-click sidebar video thumbnail to open fullscreen video viewer
      const videoFullscreen = await page.$('.video-fullscreen-overlay');
      if (!videoFullscreen || !(await videoFullscreen.isVisible())) {
        const vThumbs = await page.$$('.media-sidebar-thumb-video');
        if (vThumbs.length > 0) {
          await vThumbs[0].click();
          await page.waitForTimeout(2000);
        }
      }

      // 10. Fullscreen video viewer screenshot
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-video-fullscreen.png') });
      console.log('Screenshot: 03-video-fullscreen.png');

      // 11. Get timeline thumbnails and labels from DOM
      const timelineLabels = await page.evaluate(() => {
        const video = document.querySelector('video');
        const duration = video ? video.duration : null;

        // Check all text nodes in fullscreen overlay
        const overlay = document.querySelector('.video-fullscreen-overlay');
        const texts: Array<{ text: string; parentTag: string; parentClass: string }> = [];
        if (overlay) {
          const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null);
          let node: Node | null;
          while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            if (text) texts.push({
              text,
              parentTag: (node as ChildNode).parentElement?.tagName || '',
              parentClass: (node as ChildNode).parentElement?.className || ''
            });
          }
        }

        // Extract time-format labels (M:SS or MM:SS)
        const timeLabels = texts.filter(t => /^\d+:\d{2}$/.test(t.text));

        // Check img elements (thumbnails) in video-preview
        const previewImgs: Array<{
          src: string;
          alt: string;
          title: string;
          width: number;
          nextText: string;
          parentText: string;
        }> = [];
        if (overlay) {
          overlay.querySelectorAll('img').forEach((img: HTMLImageElement) => {
            previewImgs.push({
              src: img.src?.substring(img.src.lastIndexOf('/') + 1),
              alt: img.alt,
              title: img.title,
              width: img.naturalWidth,
              nextText: img.nextElementSibling?.textContent?.trim() || '',
              parentText: img.parentElement?.textContent?.trim() || ''
            });
          });
        }

        return {
          videoDuration: duration,
          videoDurationFormatted: duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : null,
          allTextsInOverlay: texts,
          timeLabels: timeLabels,
          previewImages: previewImgs,
          maxTimeLabelSeconds: timeLabels.length > 0 ?
            Math.max(...timeLabels.map(t => {
              const parts = t.text.split(':');
              return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            })) : null
        };
      });
      console.log('\n=== TIMELINE LABEL ANALYSIS ===');
      console.log(JSON.stringify(timelineLabels, null, 2));

      // 12. Verification result
      const { videoDuration, maxTimeLabelSeconds, timeLabels } = timelineLabels;
      console.log('\n=== VERIFICATION RESULT ===');
      console.log(`Video duration: ${videoDuration}s (${timelineLabels.videoDurationFormatted})`);
      console.log(`Time labels found: ${timeLabels.length}`);
      if (timeLabels.length > 0) {
        console.log(`Time labels: ${timeLabels.map(t => t.text).join(', ')}`);
        console.log(`Max timestamp: ${maxTimeLabelSeconds}s`);
        if (videoDuration !== null && maxTimeLabelSeconds !== null && maxTimeLabelSeconds > Math.ceil(videoDuration)) {
          console.log('BUG DETECTED: Timeline max timestamp exceeds video duration!');
          console.log(`  Max timestamp (${maxTimeLabelSeconds}s) > Video duration (${Math.ceil(videoDuration)}s)`);
        } else {
          console.log('OK: Timeline timestamps are within video duration');
        }
      } else {
        console.log('No time labels found - checking preview images for clues');
        if (timelineLabels.previewImages.length > 0) {
          console.log(`Found ${timelineLabels.previewImages.length} preview images`);
          timelineLabels.previewImages.forEach((img, i) => {
            console.log(`  Image ${i}: ${img.src} | parent text: "${img.parentText}"`);
          });
        }
      }

      // 13. Arrow key navigation
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04-after-arrow-right.png') });
      console.log('Screenshot: 04-after-arrow-right.png');

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05-after-second-arrow.png') });
      console.log('Screenshot: 05-after-second-arrow.png');

      // 14. Click 2nd video thumbnail and verify
      const videoThumbs2 = await page.$$('.media-sidebar-thumb-video');
      if (videoThumbs2.length > 1) {
        await videoThumbs2[1].click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-second-video.png') });
        console.log('Screenshot: 06-second-video.png');

        const secondVideoInfo = await page.evaluate(() => {
          const video = document.querySelector('video');
          if (!video) return null;
          // Re-fetch timeline labels
          const overlay = document.querySelector('.video-fullscreen-overlay');
          const timeLabels: string[] = [];
          if (overlay) {
            const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null);
            let node: Node | null;
            while (node = walker.nextNode()) {
              const text = node.textContent?.trim();
              if (text && /^\d+:\d{2}$/.test(text)) timeLabels.push(text);
            }
          }
          return {
            duration: video.duration,
            timeLabels: timeLabels
          };
        });
        console.log('Second video info:', JSON.stringify(secondVideoInfo));
      }
    } else {
      console.log('ERROR: No video thumbnails found!');
    }

    console.log('\n=== DETAILED TEST COMPLETE ===');

  } catch (err: unknown) {
    console.error('Error:', (err as Error).message, (err as Error).stack);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'error-screenshot.png') });
  } finally {
    await browser.close();
  }
}

// ===== Part 2: Timeline label verification loop (from video-timeline-verify.mjs) =====

async function runLabelVerification(): Promise<void> {
  console.log('\n========================================');
  console.log('=== Part 2: Timeline Label Verification ===');
  console.log('========================================');

  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    // Click all video thumbnails and verify labels
    const videoThumbs = await page.$$('.media-sidebar-thumb-video');
    console.log(`Found ${videoThumbs.length} video thumbnails`);

    // Iterate through all video thumbnails
    for (let vi = 0; vi < videoThumbs.length; vi++) {
      const vt = (await page.$$('.media-sidebar-thumb-video'))[vi];
      await vt.click();
      await page.waitForTimeout(3000);

      // Get timeline labels
      const result = await page.evaluate(() => {
        const video = document.querySelector('video');
        const duration = video ? video.duration : null;

        // Get labels from timeline-time class elements
        const timeElements = document.querySelectorAll('.timeline-time');
        const labels = Array.from(timeElements).map((el: Element) => el.textContent?.trim() || '');

        // Convert labels to seconds
        const labelSeconds = labels.map((label: string) => {
          if (!label) return 0;
          const parts = label.split(':');
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });

        const maxLabelSeconds = labelSeconds.length > 0 ? Math.max(...labelSeconds) : null;

        return {
          videoDuration: duration,
          labels,
          labelSeconds,
          maxLabelSeconds,
          exceedsDuration: duration !== null && maxLabelSeconds !== null && maxLabelSeconds > Math.ceil(duration)
        };
      });

      console.log(`\n--- Video ${vi + 1} ---`);
      console.log(`Duration: ${result.videoDuration}s`);
      console.log(`Timeline labels: ${result.labels.join(', ')}`);
      console.log(`Label seconds: ${result.labelSeconds.join(', ')}`);
      console.log(`Max label: ${result.maxLabelSeconds}s`);

      if (result.exceedsDuration) {
        console.log(`FAIL: Max label (${result.maxLabelSeconds}s) > duration (${result.videoDuration}s)`);
      } else if (result.labels.length === 0) {
        console.log('WARN: No timeline labels found');
      } else {
        console.log(`PASS: All labels within duration`);
      }

      // Timeline screenshot
      const timeline = await page.$('.video-timeline');
      if (timeline) {
        await timeline.screenshot({ path: path.join(ARTIFACTS_DIR, `07-timeline-video-${vi + 1}.png`) });
        console.log(`Screenshot: 07-timeline-video-${vi + 1}.png`);
      }

      // Close with X button
      const closeBtn = await page.$('.video-close-btn');
      if (closeBtn && await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    console.log('\n=== LABEL VERIFICATION COMPLETE ===');

  } catch (err: unknown) {
    console.error('Error:', (err as Error).message, (err as Error).stack);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'error-verify.png') });
  } finally {
    await browser.close();
  }
}

// ===== Run both parts =====
await runDetailedTest();
await runLabelVerification();
console.log('\n=== ALL TESTS COMPLETE ===');
