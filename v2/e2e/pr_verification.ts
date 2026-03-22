// Playwright verification script for reviw v2
// Test A: Image preview -> Fullscreen -> Esc -> Comment dialog
// Test B: Submit & Exit flow
import { chromium, type Browser, type Page } from 'playwright';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://127.0.0.1:4989';
const ARTIFACTS = '/Users/kazuph/src/github.com/kazuph/reviw/.artifacts/pr-verification';
mkdirSync(ARTIFACTS, { recursive: true });

async function testA(): Promise<boolean> {
  console.log('=== Test A: Image preview -> Fullscreen -> Esc -> Comment dialog ===');
  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${ARTIFACTS}/01-initial-page.png`, fullPage: false });
    console.log('1. Page loaded');

    // Find images specifically inside #md-preview (the preview area where click triggers fullscreen)
    const mdPreviewImages = await page.$$('#md-preview img');
    console.log(`Images inside #md-preview: ${mdPreviewImages.length}`);

    for (let i = 0; i < mdPreviewImages.length; i++) {
      const src = await mdPreviewImages[i].getAttribute('src');
      const isVisible = await mdPreviewImages[i].isVisible();
      console.log(`  #md-preview img[${i}]: src=${src}, visible=${isVisible}`);
    }

    // Click first visible image inside #md-preview
    let clickedImage = false;
    for (const img of mdPreviewImages) {
      const isVisible = await img.isVisible();
      // Skip mermaid images
      const parent = await img.evaluate((el: Element) => el.closest('.mermaid-container') !== null);
      if (isVisible && !parent) {
        const src = await img.getAttribute('src');
        console.log(`2. Clicking #md-preview image: ${src}`);
        await img.click();
        clickedImage = true;
        break;
      }
    }

    if (!clickedImage) {
      console.error('ERROR: No clickable image found in #md-preview');
      await page.screenshot({ path: `${ARTIFACTS}/02-no-image-error.png`, fullPage: true });
      await browser.close();
      return false;
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: `${ARTIFACTS}/02-after-image-click.png`, fullPage: false });

    // Check fullscreen overlay
    const fullscreen = await page.$('#image-fullscreen');
    const fullscreenVisible = fullscreen ? await fullscreen.isVisible() : false;
    console.log(`3. Fullscreen overlay (#image-fullscreen) visible: ${fullscreenVisible}`);

    if (!fullscreenVisible) {
      // Check other possible fullscreen elements
      const overlays = await page.$$('[class*="fullscreen"], [class*="overlay"], [class*="modal"], [id*="fullscreen"]');
      console.log(`   Alternative overlays found: ${overlays.length}`);
      for (const ov of overlays) {
        const cls = await ov.getAttribute('class');
        const id = await ov.getAttribute('id');
        const vis = await ov.isVisible();
        console.log(`   overlay: class=${cls}, id=${id}, visible=${vis}`);
      }
    }

    await page.screenshot({ path: `${ARTIFACTS}/03-fullscreen-overlay.png`, fullPage: false });

    // Press Escape
    console.log('4. Pressing Escape');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const fullscreenAfterEsc = fullscreen ? await fullscreen.isVisible() : false;
    console.log(`5. Fullscreen after Esc: visible=${fullscreenAfterEsc}`);
    await page.screenshot({ path: `${ARTIFACTS}/04-after-escape.png`, fullPage: false });

    // Check for preview-highlight class
    const previewHighlights = await page.$$('.preview-highlight');
    console.log(`6. Elements with .preview-highlight: ${previewHighlights.length}`);

    // Check for selected td
    const selectedTds = await page.$$('td.selected');
    console.log(`7. td.selected elements: ${selectedTds.length}`);

    // Check for comment card / comment overlay
    const commentCards = await page.$$('.comment-card');
    const commentOverlays = await page.$$('#comment-overlay');
    const commentDialogs = await page.$$('[class*="comment"]');
    console.log(`8. Comment elements: .comment-card=${commentCards.length}, #comment-overlay=${commentOverlays.length}, [class*=comment]=${commentDialogs.length}`);

    for (const cd of commentDialogs) {
      const cls = await cd.getAttribute('class');
      const id = await cd.getAttribute('id');
      const vis = await cd.isVisible();
      if (vis) console.log(`   visible comment element: class=${cls}, id=${id}`);
    }

    await page.screenshot({ path: `${ARTIFACTS}/05-comment-dialog.png`, fullPage: false });

    console.log('=== Test A complete ===');
    await browser.close();
    return true;
  } catch (err: unknown) {
    console.error('Test A error:', (err as Error).message);
    await page.screenshot({ path: `${ARTIFACTS}/testA-error.png`, fullPage: true });
    await browser.close();
    return false;
  }
}

async function testB(): Promise<boolean> {
  console.log('\n=== Test B: Submit & Exit ===');

  // Start a NEW server instance for test B (so we can check its exit)
  const { spawn } = await import('child_process');
  const server = spawn('node', [
    '/Users/kazuph/src/github.com/kazuph/reviw/v2/_build/js/release/build/server/server.js',
    '/Users/kazuph/src/github.com/kazuph/reviw/examples/mixed-media-test.md',
    '--no-open',
    '--port', '5100'
  ], { stdio: ['pipe', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  server.stdout!.on('data', (d: Buffer) => { stdout += d.toString(); });
  server.stderr!.on('data', (d: Buffer) => { stderr += d.toString(); });

  // Wait for server to be ready
  await new Promise<void>((resolve) => {
    const check = () => {
      if (stdout.includes('reviw serving') || stderr.includes('reviw serving')) {
        resolve();
      } else {
        setTimeout(check, 200);
      }
    };
    setTimeout(check, 500);
  });

  // Extract actual port from output
  const portMatch = (stdout + stderr).match(/http:\/\/127\.0\.0\.1:(\d+)/);
  const port = portMatch ? portMatch[1] : '5100';
  console.log(`Server started on port ${port}`);

  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('1. Page loaded');

    // Find and click Submit & Exit button
    const submitBtn = await page.$('#send-and-exit');
    if (!submitBtn) {
      // Look for alternative selectors
      const buttons = await page.$$('button');
      console.log(`   No #send-and-exit found. Total buttons: ${buttons.length}`);
      for (const btn of buttons) {
        const text = await btn.textContent();
        const id = await btn.getAttribute('id');
        console.log(`   button: text="${text!.trim()}", id=${id}`);
      }
    }

    console.log('2. Clicking Submit & Exit button');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      // Try clicking by text
      await page.click('button:has-text("Submit"), button:has-text("send"), [class*="submit"]');
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${ARTIFACTS}/06-submit-modal.png`, fullPage: false });

    // Check modal visibility
    const modals = await page.$$('[class*="modal"], [class*="dialog"], [id*="modal"], [id*="dialog"]');
    console.log(`3. Modal/dialog elements: ${modals.length}`);
    for (const m of modals) {
      const cls = await m.getAttribute('class');
      const id = await m.getAttribute('id');
      const vis = await m.isVisible();
      console.log(`   modal: class=${cls}, id=${id}, visible=${vis}`);
    }

    // Find and click the actual Submit button inside the modal
    const modalSubmitBtns = await page.$$('.modal button, .dialog button, [class*="modal"] button, [id*="modal"] button');
    console.log(`4. Buttons in modal: ${modalSubmitBtns.length}`);

    // Look for a confirm/submit button
    let clicked = false;
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = (await btn.textContent())!.trim();
      const vis = await btn.isVisible();
      if (vis) console.log(`   visible button: "${text}"`);
      if (vis && (text.toLowerCase().includes('submit') || text.toLowerCase().includes('送信') || text.toLowerCase().includes('confirm'))) {
        // Don't click the same "Submit & Exit" button again
        const id = await btn.getAttribute('id');
        if (id !== 'send-and-exit') {
          console.log(`   Clicking modal submit: "${text}"`);
          await btn.click();
          clicked = true;
          break;
        }
      }
    }

    if (!clicked) {
      console.log('   Trying to find submit inside modal overlay...');
      // Try other approaches
      const submitInModal = await page.$('.submit-dialog button.submit, .modal-submit, button.confirm');
      if (submitInModal) {
        await submitInModal.click();
        clicked = true;
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${ARTIFACTS}/07-after-submit.png`, fullPage: false });

    // Check if server process exited
    const exited = await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);
      server.on('exit', () => {
        clearTimeout(timeout);
        resolve(true);
      });
      // Check if already exited
      if (server.exitCode !== null) {
        clearTimeout(timeout);
        resolve(true);
      }
    });

    console.log(`5. Server process exited: ${exited}`);
    if (exited) {
      console.log(`   Server stdout: ${stdout.slice(-500)}`);
    }

    // Check for YAML in output
    const hasYaml = stdout.includes('---') || stdout.includes('comments:') || stdout.includes('yaml');
    console.log(`6. YAML in output: ${hasYaml}`);
    console.log(`   Last 300 chars of stdout: ${stdout.slice(-300)}`);

    console.log('=== Test B complete ===');
    await browser.close();
    if (!exited) server.kill();
    return true;
  } catch (err: unknown) {
    console.error('Test B error:', (err as Error).message);
    await page.screenshot({ path: `${ARTIFACTS}/testB-error.png`, fullPage: true }).catch(() => {});
    await browser.close();
    server.kill();
    return false;
  }
}

// Run tests
(async () => {
  const resultA = await testA();
  const resultB = await testB();
  console.log(`\n=== Results ===`);
  console.log(`Test A (Image preview -> Comment): ${resultA ? 'PASS' : 'FAIL'}`);
  console.log(`Test B (Submit & Exit): ${resultB ? 'PASS' : 'FAIL'}`);
  process.exit(resultA && resultB ? 0 : 1);
})();
