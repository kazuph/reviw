const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    // ページにアクセス
    await page.goto('http://localhost:4989', { waitUntil: 'networkidle' });
    console.log('ページ読み込み完了');

    // 初期状態のスクリーンショット（モーダルが開いた状態）
    const outputDir = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/yaml-questions/images';
    const filePath = path.join(outputDir, '05-fixed-metadata.png');
    
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`スクリーンショット保存: ${filePath}`);

    // Document Metadataテーブルを確認
    const metadataTable = await page.locator('table').first().textContent();
    console.log('\n=== Document Metadata テーブル ===');
    console.log(metadataTable);

    // reviw キーが表示されていることを確認
    if (metadataTable && metadataTable.includes('reviw')) {
      console.log('\n✓ reviw キーが確認されました');
    } else {
      console.log('\n✗ reviw キーが見つかりません');
    }

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await browser.close();
  }
})();
