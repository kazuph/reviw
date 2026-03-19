import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACTS_DIR = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/video-timeline-fix';
const BASE_URL = 'http://localhost:18765';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000);

    // 2番目の動画サムネイル（#5、複数シーンがある動画）をクリック
    const videoThumbs = await page.$$('.media-sidebar-thumb-video');
    console.log(`Found ${videoThumbs.length} video thumbnails`);

    // 全動画サムネイルを順にクリックして検証
    for (let vi = 0; vi < videoThumbs.length; vi++) {
      const vt = (await page.$$('.media-sidebar-thumb-video'))[vi];
      await vt.click();
      await page.waitForTimeout(3000);

      // タイムラインのラベルを取得
      const result = await page.evaluate(() => {
        const video = document.querySelector('video');
        const duration = video ? video.duration : null;

        // timeline-time クラスの要素からラベルを取得
        const timeElements = document.querySelectorAll('.timeline-time');
        const labels = Array.from(timeElements).map(el => el.textContent?.trim());

        // ラベルを秒数に変換
        const labelSeconds = labels.map(label => {
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

      // タイムラインのスクリーンショット
      const timeline = await page.$('.video-timeline');
      if (timeline) {
        await timeline.screenshot({ path: path.join(ARTIFACTS_DIR, `07-timeline-video-${vi + 1}.png`) });
        console.log(`Screenshot: 07-timeline-video-${vi + 1}.png`);
      }

      // Xボタンで閉じる
      const closeBtn = await page.$('.video-close-btn');
      if (closeBtn && await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }

    console.log('\n=== ALL TESTS COMPLETE ===');

  } catch (err) {
    console.error('Error:', err.message, err.stack);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'error-verify.png') });
  } finally {
    await browser.close();
  }
}

run();
