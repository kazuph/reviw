const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  try {
    // ページにアクセス（リトライ機能付き）
    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto('http://localhost:4989', { waitUntil: 'load', timeout: 10000 });
        console.log('ページ読み込み完了');
        break;
      } catch (e) {
        retries--;
        if (retries > 0) {
          console.log(`リトライ中... (${3 - retries}/3)`);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          throw e;
        }
      }
    }

    // 初期状態のスクリーンショット（モーダルが開いた状態）
    const outputDir = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/yaml-questions/images';
    const filePath = path.join(outputDir, '05-fixed-metadata.png');
    
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`スクリーンショット保存: ${filePath}`);

    // ページのHTMLを取得
    const html = await page.content();

    // Document Metadataを探す
    const docMetadataMatch = html.match(/<h2[^>]*>Document Metadata<\/h2>/i);
    console.log(`\n=== Document Metadata テーブルの検索 ===`);
    console.log(docMetadataMatch ? '見つかりました' : '見つかりません');

    // すべてのh2を列挙
    const h2Count = await page.locator('h2').count();
    console.log(`\n=== ページ内のh2タグ数: ${h2Count} ===`);
    for (let i = 0; i < Math.min(h2Count, 10); i++) {
      const h2Text = await page.locator('h2').nth(i).textContent();
      console.log(`h2[${i}]: ${h2Text}`);
    }

    // すべてのテーブルを確認
    const tableCount = await page.locator('table').count();
    console.log(`\n=== ページ内のテーブル数: ${tableCount} ===`);

    // reviw を含む要素を探す
    console.log(`\n=== reviw キーの検索 ===`);
    const reviwElements = await page.locator('text=/reviw/i').count();
    console.log(`reviw を含む要素数: ${reviwElements}`);

    // ページ内のすべてのテキストで reviw を検索
    const bodyText = await page.locator('body').textContent();
    if (bodyText && bodyText.includes('reviw')) {
      console.log('✓ ページ内に reviw キーが存在します');

      // reviw の前後のテキストを表示
      const reviwIndex = bodyText.indexOf('reviw');
      const context = bodyText.substring(Math.max(0, reviwIndex - 100), Math.min(bodyText.length, reviwIndex + 200));
      console.log(`\n前後のコンテキスト:\n${context}`);
    } else {
      console.log('✗ reviw キーが見つかりません');
    }

    // Document Metadata のテーブルを探す
    console.log(`\n=== Document Metadata テーブル情報 ===`);
    const docMetaTables = await page.locator('table').filter({ hasText: 'Document Metadata' });
    const docMetaCount = await docMetaTables.count();
    console.log(`Document Metadata を含むテーブル数: ${docMetaCount}`);

    if (docMetaCount > 0) {
      const docMetaTable = await docMetaTables.first().textContent();
      console.log(`\nDocument Metadata テーブル内容:\n${docMetaTable}`);
    }

    // ページのスクロール位置を確認して、最上部へスクロール
    await page.evaluate(() => window.scrollTo(0, 0));
    console.log('\n最上部へスクロール完了、再度スクリーンショットを撮影します...');

    // 最上部のスクリーンショットを撮影
    const topFilePath = path.join(outputDir, '05-fixed-metadata-top.png');
    await page.screenshot({ path: topFilePath, fullPage: false });
    console.log(`最上部スクリーンショット保存: ${topFilePath}`);

    // フルページスクリーンショットを撮影
    const fullFilePath = path.join(outputDir, '05-fixed-metadata-full.png');
    await page.screenshot({ path: fullFilePath, fullPage: true });
    console.log(`フルページスクリーンショット保存: ${fullFilePath}`);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
})();
