import { chromium } from 'playwright';
import path from 'node:path';

const ARTIFACTS_DIR = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/video-timeline-fix';
const BASE_URL = 'http://localhost:18765';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    // 1. トップページにアクセス
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(10000); // ffmpegサムネイル生成待ち

    // 2. サイドバーのスクリーンショット
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '01-sidebar-thumbnails.png') });
    console.log('Screenshot: 01-sidebar-thumbnails.png');

    // 3. 動画サムネイルをクリック（media-sidebar-thumb-video クラスを使う）
    const videoThumbs = await page.$$('.media-sidebar-thumb-video');
    console.log(`Found ${videoThumbs.length} video thumbnails in sidebar`);

    if (videoThumbs.length > 0) {
      // 最初の動画サムネイルをクリック
      await videoThumbs[0].click();
      await page.waitForTimeout(2000);

      // 4. 動画ビューワーのスクリーンショット
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '02-video-viewer.png') });
      console.log('Screenshot: 02-video-viewer.png');

      // 5. 動画のdurationを取得
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

      // 6. フルスクリーンオーバーレイが開いているか確認
      const overlay = await page.$('.video-fullscreen-overlay, .fullscreen-overlay');
      if (overlay) {
        const overlayVisible = await overlay.isVisible();
        console.log('Fullscreen overlay visible:', overlayVisible);
      }

      // 7. video-fullscreen-overlayの中身を調査
      const overlayInfo = await page.evaluate(() => {
        const overlay = document.querySelector('.video-fullscreen-overlay');
        if (!overlay) return { found: false };
        return {
          found: true,
          display: getComputedStyle(overlay).display,
          visibility: getComputedStyle(overlay).visibility,
          innerHTML: overlay.innerHTML.substring(0, 3000),
          childClasses: Array.from(overlay.querySelectorAll('[class]')).map(el => el.className).slice(0, 30)
        };
      });
      console.log('Video fullscreen overlay:', JSON.stringify(overlayInfo, null, 2));

      // 8. タイムラインの中身を詳しく調査
      const timelineDetails = await page.evaluate(() => {
        // video-previewクラスの要素を探す
        const previews = document.querySelectorAll('.video-preview, [class*="preview"], [class*="timeline"]');
        const results = [];
        previews.forEach(el => {
          results.push({
            className: el.className,
            childCount: el.children.length,
            textContent: el.textContent?.substring(0, 500),
            visible: getComputedStyle(el).display !== 'none'
          });
        });

        // タイムスタンプラベルをcanvasやdivから探す
        const allText = [];
        document.querySelectorAll('*').forEach(el => {
          if (el.children.length === 0) {
            const text = el.textContent?.trim();
            if (text && text.length < 10 && /\d/.test(text)) {
              allText.push({ text, className: el.className, tag: el.tagName, parentClass: el.parentElement?.className });
            }
          }
        });

        return { previews: results, timestampCandidates: allText };
      });
      console.log('Timeline details:', JSON.stringify(timelineDetails, null, 2));

      // 9. サイドバーの動画サムネイルを再度クリックしてフルスクリーン動画ビューワーを開く
      // すでに開いているかチェック
      const videoFullscreen = await page.$('.video-fullscreen-overlay');
      if (!videoFullscreen || !(await videoFullscreen.isVisible())) {
        // サイドバーの動画サムネイルをクリック
        const vThumbs = await page.$$('.media-sidebar-thumb-video');
        if (vThumbs.length > 0) {
          await vThumbs[0].click();
          await page.waitForTimeout(2000);
        }
      }

      // 10. フルスクリーン動画ビューワーのスクリーンショット
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03-video-fullscreen.png') });
      console.log('Screenshot: 03-video-fullscreen.png');

      // 11. タイムラインのサムネイルとラベルをDOM内から取得
      const timelineLabels = await page.evaluate(() => {
        const video = document.querySelector('video');
        const duration = video ? video.duration : null;

        // フルスクリーンオーバーレイ内の全テキストノードを確認
        const overlay = document.querySelector('.video-fullscreen-overlay');
        const texts = [];
        if (overlay) {
          const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null);
          let node;
          while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            if (text) texts.push({ text, parentTag: node.parentElement?.tagName, parentClass: node.parentElement?.className });
          }
        }

        // 時間形式のラベル（M:SS or MM:SS）を抽出
        const timeLabels = texts.filter(t => /^\d+:\d{2}$/.test(t.text));

        // video-preview内のimg要素（サムネイル）を確認
        const previewImgs = [];
        if (overlay) {
          overlay.querySelectorAll('img').forEach(img => {
            previewImgs.push({
              src: img.src?.substring(img.src.lastIndexOf('/') + 1),
              alt: img.alt,
              title: img.title,
              width: img.naturalWidth,
              nextText: img.nextElementSibling?.textContent?.trim(),
              parentText: img.parentElement?.textContent?.trim()
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

      // 12. 検証結果
      const { videoDuration, maxTimeLabelSeconds, timeLabels } = timelineLabels;
      console.log('\n=== VERIFICATION RESULT ===');
      console.log(`Video duration: ${videoDuration}s (${timelineLabels.videoDurationFormatted})`);
      console.log(`Time labels found: ${timeLabels.length}`);
      if (timeLabels.length > 0) {
        console.log(`Time labels: ${timeLabels.map(t => t.text).join(', ')}`);
        console.log(`Max timestamp: ${maxTimeLabelSeconds}s`);
        if (maxTimeLabelSeconds > Math.ceil(videoDuration)) {
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

      // 13. 右矢印キーでのナビゲーション
      // まずESCでフルスクリーンを閉じる
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

      // 14. 2番目の動画サムネイルもクリックして確認
      const videoThumbs2 = await page.$$('.media-sidebar-thumb-video');
      if (videoThumbs2.length > 1) {
        await videoThumbs2[1].click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(ARTIFACTS_DIR, '06-second-video.png') });
        console.log('Screenshot: 06-second-video.png');

        const secondVideoInfo = await page.evaluate(() => {
          const video = document.querySelector('video');
          if (!video) return null;
          // タイムラインラベルを再取得
          const overlay = document.querySelector('.video-fullscreen-overlay');
          const timeLabels = [];
          if (overlay) {
            const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null);
            let node;
            while (node = walker.nextNode()) {
              const text = node.textContent?.trim();
              if (/^\d+:\d{2}$/.test(text)) timeLabels.push(text);
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

    console.log('\n=== TEST COMPLETE ===');

  } catch (err) {
    console.error('Error:', err.message, err.stack);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'error-screenshot.png') });
  } finally {
    await browser.close();
  }
}

run();
