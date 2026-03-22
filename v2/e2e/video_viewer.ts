/**
 * Video Viewer Check E2E Test
 *
 * Tests sidebar thumbnail clicks, viewer panel population,
 * timeline labels vs video duration, and arrow key navigation.
 *
 * Run: node --experimental-strip-types v2/e2e/video_viewer.ts
 */
import http, { type IncomingMessage } from "node:http";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page, type BrowserContext } from "playwright";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SERVER_JS = join(ROOT, "v2", "_build", "js", "release", "build", "server", "server.js");
const FIXTURE_MD = join(ROOT, "examples", "mixed-media-test.md");
const LOCK_DIR = join(tmpdir(), "reviw-video-viewer-locks");
const SCREENSHOT_DIR = join(ROOT, ".artifacts", "video-viewer");

mkdirSync(LOCK_DIR, { recursive: true });
mkdirSync(SCREENSHOT_DIR, { recursive: true });

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string): void {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForServer(port: number, timeoutMs = 15000): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();
    const poll = () => {
      if (Date.now() - start > timeoutMs) { resolve(false); return; }
      http
        .get(`http://127.0.0.1:${port}/healthz`, (res: IncomingMessage) => {
          if (res.statusCode === 200) resolve(true);
          else setTimeout(poll, 200);
          res.resume();
        })
        .on("error", () => setTimeout(poll, 200));
    };
    poll();
  });
}

interface ServerHandle {
  proc: ChildProcess;
  port: number;
}

async function startServer(testFile: string, preferredPort: number): Promise<ServerHandle> {
  const proc = spawn("node", [SERVER_JS, testFile, "--no-open", "--port", String(preferredPort)], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR },
  });

  let stdout = "";
  proc.stdout!.on("data", (d: Buffer) => { stdout += d.toString(); });
  proc.stderr!.on("data", (d: Buffer) => { stdout += d.toString(); });

  const port = await new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server start timed out. Output: ${stdout.substring(0, 300)}`)), 15000);
    const check = () => {
      const match = stdout.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(parseInt(match[1], 10));
      } else if (proc.exitCode !== null) {
        clearTimeout(timeout);
        reject(new Error(`Server exited before ready. Output: ${stdout.substring(0, 300)}`));
      } else {
        setTimeout(check, 200);
      }
    };
    setTimeout(check, 300);
  });

  const ready = await waitForServer(port);
  if (!ready) throw new Error(`Server on port ${port} never became healthy`);

  return { proc, port };
}

function killServer(handle: ServerHandle): void {
  try { handle.proc.kill("SIGKILL"); } catch (_: unknown) {}
}

async function screenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: join(SCREENSHOT_DIR, name), fullPage: false });
}

// ===== Main test =====
let server: ServerHandle | null = null;

try {
  server = await startServer(FIXTURE_MD, 5220);

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page: Page = await context.newPage();

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  console.log("\n--- Step a: Opening page ---");
  await page.goto(`http://127.0.0.1:${server.port}`, { waitUntil: "load", timeout: 15000 });
  await page.waitForSelector("#md-preview", { timeout: 10000 });
  await screenshot(page, "01-initial-page.png");

  // Ensure media sidebar is open
  const sidebarVisible = await page.evaluate(() => {
    const sidebar = document.getElementById("media-sidebar");
    if (!sidebar) return false;
    return sidebar.classList.contains("open") || getComputedStyle(sidebar).display !== "none";
  });

  if (!sidebarVisible) {
    // Click toggle button to open sidebar
    const toggle = page.locator("#media-sidebar-toggle");
    if (await toggle.count() > 0) {
      await toggle.click();
      // Wait for sidebar to become visible
      await page.waitForFunction(() => {
        const sidebar = document.getElementById("media-sidebar");
        return sidebar && getComputedStyle(sidebar).display !== "none" && sidebar.offsetWidth > 0;
      }, { timeout: 5000 }).catch(() => {
        console.log("  INFO: Sidebar did not open after toggle click");
      });
    }
  }

  // Double-check sidebar is open, retry if needed
  const sidebarCheck = await page.evaluate(() => {
    const sidebar = document.getElementById("media-sidebar");
    return { display: sidebar ? getComputedStyle(sidebar).display : "missing", width: sidebar?.offsetWidth ?? 0 };
  });
  if (sidebarCheck.display === "none" || sidebarCheck.width === 0) {
    console.log("  INFO: Sidebar still not visible, attempting force-open via toggle");
    await page.locator("#media-sidebar-toggle").click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  console.log("\n--- Step b: Count sidebar thumbnails ---");
  // Wait for thumbnails to load (may need ffmpeg processing)
  await page.waitForSelector(".media-sidebar-thumb", { timeout: 30000 }).catch(() => {});

  const thumbSelector = ".media-sidebar-thumb";
  const allThumbs = page.locator(thumbSelector);
  const thumbCount = await allThumbs.count();
  assert(thumbCount > 0, `Found ${thumbCount} sidebar thumbnails`);

  // Get thumbnail type details
  const thumbDetails = await page.evaluate(() => {
    const thumbs = document.querySelectorAll(".media-sidebar-thumb");
    return Array.from(thumbs).map((t, i) => ({
      index: i,
      dataType: t.getAttribute("data-type"),
      dataIndex: t.getAttribute("data-index"),
      isActive: t.classList.contains("active"),
    }));
  });
  console.log(`  Thumbnail types: ${thumbDetails.map(t => t.dataType).join(", ")}`);

  // Check viewer state before any click
  const viewerExistsBefore = await page.$(".media-sidebar-viewer") !== null;
  assert(viewerExistsBefore, "Media sidebar viewer element exists in DOM");

  // === Step c: Click 1st thumbnail ===
  console.log("\n--- Step c: Click 1st thumbnail ---");
  if (thumbCount >= 1) {
    await allThumbs.nth(0).click({ timeout: 5000 });

    // Wait for viewer to populate
    const viewerPopulated = await page.waitForFunction(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      return viewer && viewer.children.length > 0;
    }, { timeout: 5000 }).then(() => true).catch(() => false);

    await screenshot(page, "02-after-click-thumb1.png");

    const viewerAfter1 = await page.evaluate(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      if (!viewer) return { exists: false, childCount: 0, hasImg: false, hasVideo: false };
      return {
        exists: true,
        childCount: viewer.children.length,
        hasImg: viewer.querySelector("img") !== null,
        hasVideo: viewer.querySelector("video") !== null,
        display: getComputedStyle(viewer).display,
      };
    });

    assert(viewerAfter1.childCount > 0, `Viewer has content after click (${viewerAfter1.childCount} children)`);
    assert(viewerAfter1.hasImg || viewerAfter1.hasVideo, "Viewer contains img or video element");

    if (viewerAfter1.childCount === 0) {
      console.error("  BUG: Viewer panel is EMPTY after clicking thumbnail");
      console.error("  Console errors:", consoleErrors);
    }
  }

  // === Step d: Click 2nd thumbnail (video) ===
  console.log("\n--- Step d: Click 2nd thumbnail ---");
  if (thumbCount >= 2) {
    await allThumbs.nth(1).click();

    // Wait for viewer update
    await page.waitForFunction(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      return viewer && viewer.children.length > 0;
    }, { timeout: 5000 }).catch(() => {});

    await screenshot(page, "03-after-click-thumb2.png");

    const viewerAfter2 = await page.evaluate(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      if (!viewer) return { exists: false, childCount: 0, hasVideo: false };
      return {
        exists: true,
        childCount: viewer.children.length,
        hasVideo: viewer.querySelector("video") !== null,
        display: getComputedStyle(viewer).display,
      };
    });

    assert(viewerAfter2.childCount > 0, `Viewer has content after 2nd click (${viewerAfter2.childCount} children)`);

    // Check for timeline elements
    const timelineExists = await page.$('[class*="timeline"]') !== null;
    console.log(`  INFO: Timeline elements present: ${timelineExists}`);
  }

  // === Step e: Timeline labels ===
  console.log("\n--- Step e: Timeline labels ---");
  const timelineLabels = await page.evaluate(() => {
    const timeElements = document.querySelectorAll(".timeline-time");
    return Array.from(timeElements).map((el: Element) => el.textContent?.trim() || "").filter(Boolean);
  });
  console.log(`  Timeline labels found: ${timelineLabels.length} [${timelineLabels.join(", ")}]`);

  // === Step f: Video duration ===
  console.log("\n--- Step f: Video duration ---");
  const videoInfo = await page.evaluate(() => {
    const videos = document.querySelectorAll("video");
    return Array.from(videos).map((v, i) => ({
      index: i,
      duration: v.duration,
      readyState: v.readyState,
    }));
  });

  let validVideoCount = 0;
  for (const vi of videoInfo) {
    if (!isNaN(vi.duration) && vi.duration > 0) {
      validVideoCount++;
      console.log(`  Video ${vi.index}: duration ${vi.duration}s (ready=${vi.readyState})`);
    } else {
      console.log(`  INFO: Video ${vi.index}: metadata not yet loaded (duration=${vi.duration}, ready=${vi.readyState})`);
    }
  }
  assert(validVideoCount > 0, `At least one video has valid duration (${validVideoCount}/${videoInfo.length})`);

  // === Step g: Timeline label vs duration check ===
  console.log("\n--- Step g: Timeline label vs duration check ---");
  if (timelineLabels.length > 0 && videoInfo.length > 0) {
    for (const label of timelineLabels) {
      const match = label.match(/(\d+):(\d+)/);
      if (match) {
        const labelSec = parseInt(match[1]) * 60 + parseInt(match[2]);
        const vid = videoInfo[0];
        if (vid && !isNaN(vid.duration)) {
          assert(labelSec <= Math.ceil(vid.duration),
            `Label "${label}" (${labelSec}s) <= video duration (${Math.ceil(vid.duration)}s)`);
        }
      }
    }
  } else {
    console.log("  INFO: Skipping label vs duration check (no labels or no video)");
  }

  // === Step h: Click 5th thumbnail ===
  console.log("\n--- Step h: Click 5th thumbnail ---");
  if (thumbCount >= 5) {
    await allThumbs.nth(4).click();

    await page.waitForFunction(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      return viewer && viewer.children.length > 0;
    }, { timeout: 5000 }).catch(() => {});

    await screenshot(page, "04-after-click-thumb5.png");

    const viewerAfter5 = await page.evaluate(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      return { childCount: viewer?.children?.length ?? -1 };
    });
    assert(viewerAfter5.childCount > 0, `Viewer populated after 5th thumbnail click (${viewerAfter5.childCount} children)`);
  } else {
    console.log(`  INFO: Only ${thumbCount} thumbnails, skipping 5th thumbnail test`);
  }

  // === Step i: Arrow key navigation ===
  console.log("\n--- Step i: Right arrow key navigation ---");
  if (thumbCount >= 2) {
    await allThumbs.nth(1).click();
    await sleep(300);

    const activeBefore = await page.evaluate(() => {
      const active = document.querySelector(".media-sidebar-thumb.active");
      return active?.getAttribute("data-index") || null;
    });
    await screenshot(page, "05-before-arrow-key.png");

    await page.keyboard.press("ArrowRight");

    // Wait for active thumb to change
    if (activeBefore !== null) {
      await page.waitForFunction((prevIndex: string) => {
        const active = document.querySelector(".media-sidebar-thumb.active");
        return active && active.getAttribute("data-index") !== prevIndex;
      }, activeBefore, { timeout: 3000 }).catch(() => {});
    } else {
      await sleep(500);
    }

    const activeAfter = await page.evaluate(() => {
      const active = document.querySelector(".media-sidebar-thumb.active");
      return active?.getAttribute("data-index") || null;
    });
    await screenshot(page, "06-after-arrow-right.png");

    if (activeBefore !== null && activeAfter !== null) {
      assert(activeBefore !== activeAfter, `Arrow navigation changed active: ${activeBefore} -> ${activeAfter}`);
    } else {
      console.log("  INFO: Could not verify arrow navigation (active thumb not detected)");
    }

    // Check viewer has content after navigation
    const viewerNav = await page.evaluate(() => {
      const viewer = document.querySelector(".media-sidebar-viewer");
      return { childCount: viewer?.children?.length ?? -1 };
    });
    assert(viewerNav.childCount > 0, `Viewer has content after arrow navigation (${viewerNav.childCount} children)`);
  }

  // === Final Summary ===
  console.log("\n--- Final Summary ---");
  if (consoleErrors.length > 0) {
    console.log(`  INFO: ${consoleErrors.length} console errors (non-fatal):`);
    consoleErrors.forEach((e, i) => console.log(`    ${i}: ${e}`));
  }
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e, i) => console.error(`    Error ${i}: ${e}`));
  }

  const finalViewerState = await page.evaluate(() => {
    const viewer = document.querySelector(".media-sidebar-viewer");
    return {
      exists: !!viewer,
      childCount: viewer?.children?.length ?? -1,
    };
  });

  if (finalViewerState.childCount === 0) {
    console.error("  BUG CONFIRMED: .media-sidebar-viewer is always EMPTY");
  }

  await browser.close();

} catch (err: unknown) {
  failed++;
  console.error(`  FAIL: ${(err as Error).message}`);
} finally {
  if (server) killServer(server);
}

console.log(`\n============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`============================`);
if (failed > 0) process.exit(1);
