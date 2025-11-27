const { chromium } = require('playwright');

const PORT = process.env.TEST_PORT || 9900;

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Test 1: Add comment, reload, verify recovery modal appears
  console.log('=== Test 1: localStorage recovery modal ===');
  console.log(`Using port: ${PORT}`);

  await page.goto(`http://localhost:${PORT}`);
  await page.waitForTimeout(2000);

  // Clear any existing localStorage
  await page.evaluate(() => {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('annotab:')) localStorage.removeItem(k);
    });
  });

  // Reload to start fresh
  await page.reload();
  await page.waitForTimeout(2000);

  // Verify no recovery modal shown
  const modalVisible1 = await page.locator('#recovery-modal.visible').isVisible().catch(() => false);
  console.log('Recovery modal visible after fresh start:', modalVisible1, modalVisible1 ? 'FAIL' : 'PASS');

  // Click on a data cell (row=2 is first data row, col=1 is "Product" column)
  // Using Playwright's locator instead of JS click
  await page.locator('td[data-row="2"][data-col="1"]').click();
  await page.waitForTimeout(500);

  // Check if comment card is visible (uses display:block, not .visible class)
  const cardVisible = await page.evaluate(() => {
    const card = document.querySelector('#comment-card');
    return card && card.style.display === 'block';
  });
  console.log('Comment card opened:', cardVisible);

  if (!cardVisible) {
    await page.screenshot({ path: '.artifacts/v050-debug-no-card.png' });
    console.log('Screenshot: debug-no-card saved');
    await browser.close();
    console.log('FAILED: Comment card did not open');
    return;
  }

  await page.fill('#comment-input', 'テストコメント for localStorage');
  await page.click('#save-comment');
  await page.waitForTimeout(500);

  // Verify localStorage has data
  const hasData = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('annotab:'));
    return keys.length > 0;
  });
  console.log('localStorage has data after comment:', hasData, hasData ? 'PASS' : 'FAIL');

  // Take screenshot before reload
  await page.screenshot({ path: '.artifacts/v050-before-reload.png' });
  console.log('Screenshot: before-reload saved');

  // Reload page (should trigger recovery modal)
  await page.reload();
  await page.waitForTimeout(1500);

  // Verify recovery modal is visible
  const modalVisible2 = await page.locator('#recovery-modal.visible').isVisible().catch(() => false);
  console.log('Recovery modal visible after reload:', modalVisible2, modalVisible2 ? 'PASS' : 'FAIL');

  // Take screenshot of recovery modal
  await page.screenshot({ path: '.artifacts/v050-recovery-modal.png' });
  console.log('Screenshot: recovery-modal saved');

  if (!modalVisible2) {
    console.log('FAILED: Recovery modal not shown after reload');
    await browser.close();
    return;
  }

  // Click Restore button
  await page.click('#recovery-restore');
  await page.waitForTimeout(500);

  // Verify modal is hidden
  const modalHidden = await page.locator('#recovery-modal.visible').isVisible().catch(() => false);
  const modalHiddenResult = !modalHidden;
  console.log('Recovery modal hidden after restore:', modalHiddenResult, modalHiddenResult ? 'PASS' : 'FAIL');

  // Verify comment was restored (check for any dot)
  const hasDot = await page.evaluate(() => {
    return document.querySelectorAll('.dot').length > 0;
  });
  console.log('Comment dot visible after restore:', hasDot, hasDot ? 'PASS' : 'FAIL');

  // Take screenshot after restore
  await page.screenshot({ path: '.artifacts/v050-after-restore.png' });
  console.log('Screenshot: after-restore saved');

  // Test 2: Discard functionality
  console.log('');
  console.log('=== Test 2: Discard clears localStorage and modal ===');

  // Reload again to see modal
  await page.reload();
  await page.waitForTimeout(1500);

  const modalVisible3 = await page.locator('#recovery-modal.visible').isVisible().catch(() => false);
  console.log('Recovery modal shown after 2nd reload:', modalVisible3, modalVisible3 ? 'PASS' : 'FAIL');

  // Click Discard
  await page.click('#recovery-discard');
  await page.waitForTimeout(500);

  // Verify localStorage cleared
  const hasDataAfterDiscard = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('annotab:'));
    return keys.length > 0;
  });
  const discardCleared = !hasDataAfterDiscard;
  console.log('localStorage cleared after discard:', discardCleared, discardCleared ? 'PASS' : 'FAIL');

  // Reload - no modal should appear
  await page.reload();
  await page.waitForTimeout(1500);

  const modalVisible4 = await page.locator('#recovery-modal.visible').isVisible().catch(() => false);
  const noModalAfterDiscard = !modalVisible4;
  console.log('No recovery modal after discard:', noModalAfterDiscard, noModalAfterDiscard ? 'PASS' : 'FAIL');

  // Take screenshot
  await page.screenshot({ path: '.artifacts/v050-after-discard.png' });
  console.log('Screenshot: after-discard saved');

  // Test 3: Submit & Exit clears localStorage
  console.log('');
  console.log('=== Test 3: Submit & Exit clears localStorage ===');

  // Add another comment
  await page.locator('td[data-row="3"][data-col="2"]').click();
  await page.waitForTimeout(500);
  await page.fill('#comment-input', 'Submit test comment');
  await page.click('#save-comment');
  await page.waitForTimeout(500);

  const hasDataBeforeSubmit = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('annotab:'));
    return keys.length > 0;
  });
  console.log('localStorage has data before submit:', hasDataBeforeSubmit, hasDataBeforeSubmit ? 'PASS' : 'FAIL');

  // Submit & Exit - opens modal first
  await page.click('#send-and-exit');
  await page.waitForTimeout(500);
  // Click the Submit button in the modal
  await page.click('#modal-submit');
  await page.waitForTimeout(500);

  // Check localStorage (should be cleared by sendAndExit)
  const hasDataAfterSubmit = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('annotab:'));
    return keys.length > 0;
  });
  const submitCleared = !hasDataAfterSubmit;
  console.log('localStorage cleared after submit:', submitCleared, submitCleared ? 'PASS' : 'FAIL');

  await browser.close();
  console.log('');
  console.log('=== All tests completed ===');
})();
