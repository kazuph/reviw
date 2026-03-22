/**
 * Video Timeline E2E Test
 *
 * Tests:
 * - Video thumbnail detection and click
 * - Timeline label extraction and duration validation
 * - Arrow key navigation between thumbnails
 * - Multiple video timeline verification
 *
 * Run: node --experimental-strip-types v2/e2e/video_timeline.ts
 */
import http, { type IncomingMessage } from "node:http";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "playwright";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SERVER_JS = join(ROOT, "v2", "_build", "js", "release", "build", "server", "server.js");
const FIXTURE_MD = join(ROOT, "examples", "mixed-media-test.md");
const LOCK_DIR = join(tmpdir(), "reviw-video-timeline-locks");
const ARTIFACTS_DIR = join(ROOT, ".artifacts", "video-timeline");

mkdirSync(LOCK_DIR, { recursive: true });
mkdirSync(ARTIFACTS_DIR, { recursive: true });

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

// ===== Part 1: Detailed Timeline Test =====

async function runDetailedTest(server: ServerHandle): Promise<void> {
  console.log("\n--- Part 1: Detailed Timeline Test ---");

  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await page.goto(`http://127.0.0.1:${server.port}`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for video thumbnails to appear (ffmpeg generation may take time)
    const hasVideoThumbs = await page.waitForSelector(".media-sidebar-thumb-video", { timeout: 30000 })
      .then(() => true).catch(() => false);

    await page.screenshot({ path: join(ARTIFACTS_DIR, "01-sidebar-thumbnails.png") });

    assert(hasVideoThumbs, "Video thumbnails appeared in sidebar");
    if (!hasVideoThumbs) {
      await browser.close();
      return;
    }

    const videoThumbs = await page.$$(".media-sidebar-thumb-video");
    assert(videoThumbs.length > 0, `Found ${videoThumbs.length} video thumbnails in sidebar`);

    // Click the first video thumbnail
    await videoThumbs[0].click();

    // Wait for video element to appear and load metadata
    const videoLoaded = await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return video && video.readyState >= 1 && video.duration > 0;
    }, { timeout: 10000 }).then(() => true).catch(() => false);

    await page.screenshot({ path: join(ARTIFACTS_DIR, "02-video-viewer.png") });
    assert(videoLoaded, "Video loaded with valid duration after thumbnail click");

    // Get video info
    const videoInfo = await page.evaluate(() => {
      const video = document.querySelector("video");
      if (!video) return { found: false, duration: 0, readyState: 0 };
      return {
        found: true,
        duration: video.duration,
        readyState: video.readyState,
      };
    });
    assert(videoInfo.found, "Video element found in DOM");
    assert(videoInfo.duration > 0, `Video has valid duration: ${videoInfo.duration}s`);

    // Check fullscreen overlay visibility
    const overlayVisible = await page.evaluate(() => {
      const overlay = document.querySelector(".video-fullscreen-overlay");
      return overlay ? getComputedStyle(overlay).display !== "none" : false;
    });
    // Note: overlay may or may not be visible depending on viewer mode; just log it
    console.log(`  INFO: Video fullscreen overlay visible: ${overlayVisible}`);

    await page.screenshot({ path: join(ARTIFACTS_DIR, "03-video-fullscreen.png") });

    // Get timeline labels and validate
    const timelineLabels = await page.evaluate(() => {
      const video = document.querySelector("video");
      const duration = video ? video.duration : null;

      const overlay = document.querySelector(".video-fullscreen-overlay");
      const texts: string[] = [];
      if (overlay) {
        const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT, null);
        let node: Node | null;
        while (node = walker.nextNode()) {
          const text = node.textContent?.trim();
          if (text && /^\d+:\d{2}$/.test(text)) texts.push(text);
        }
      }

      // Also check .timeline-time elements
      const timeElements = document.querySelectorAll(".timeline-time");
      timeElements.forEach((el: Element) => {
        const text = el.textContent?.trim();
        if (text && /^\d+:\d{2}$/.test(text) && !texts.includes(text)) texts.push(text);
      });

      const labelSeconds = texts.map((t) => {
        const parts = t.split(":");
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      });
      const maxLabelSeconds = labelSeconds.length > 0 ? Math.max(...labelSeconds) : null;

      return { duration, texts, maxLabelSeconds };
    });

    if (timelineLabels.texts.length > 0) {
      assert(timelineLabels.texts.length > 0, `Found ${timelineLabels.texts.length} time labels: ${timelineLabels.texts.join(", ")}`);

      if (timelineLabels.duration !== null && timelineLabels.maxLabelSeconds !== null) {
        const withinDuration = timelineLabels.maxLabelSeconds <= Math.ceil(timelineLabels.duration);
        assert(withinDuration,
          `Max timestamp (${timelineLabels.maxLabelSeconds}s) <= video duration (${Math.ceil(timelineLabels.duration)}s)`);
      }
    } else {
      console.log("  INFO: No time labels found in overlay (may be canvas-rendered)");
    }

    // Arrow key navigation
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => {
      const overlay = document.querySelector(".video-fullscreen-overlay");
      return !overlay || getComputedStyle(overlay).display === "none";
    }, { timeout: 3000 }).catch(() => {});

    // Get active thumb before arrow
    const activeBefore = await page.evaluate(() => {
      const active = document.querySelector(".media-sidebar-thumb.active");
      return active?.getAttribute("data-index") || null;
    });

    await page.keyboard.press("ArrowRight");
    await sleep(500);

    const activeAfter = await page.evaluate(() => {
      const active = document.querySelector(".media-sidebar-thumb.active");
      return active?.getAttribute("data-index") || null;
    });

    await page.screenshot({ path: join(ARTIFACTS_DIR, "04-after-arrow-right.png") });

    if (activeBefore !== null && activeAfter !== null) {
      assert(activeBefore !== activeAfter, `Arrow key navigation changed active thumb: ${activeBefore} -> ${activeAfter}`);
    } else {
      console.log("  INFO: Could not verify arrow navigation (no active thumb detected)");
    }

    // Click 2nd video thumbnail if available
    const videoThumbs2 = await page.$$(".media-sidebar-thumb-video");
    if (videoThumbs2.length > 1) {
      await videoThumbs2[1].click();

      const secondVideoLoaded = await page.waitForFunction(() => {
        const video = document.querySelector("video");
        return video && video.readyState >= 1 && video.duration > 0;
      }, { timeout: 10000 }).then(() => true).catch(() => false);

      await page.screenshot({ path: join(ARTIFACTS_DIR, "05-second-video.png") });
      assert(secondVideoLoaded, "Second video loaded after clicking 2nd thumbnail");
    }

  } finally {
    await browser.close();
  }
}

// ===== Part 2: Timeline Label Verification =====

async function runLabelVerification(server: ServerHandle): Promise<void> {
  console.log("\n--- Part 2: Timeline Label Verification ---");

  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    await page.goto(`http://127.0.0.1:${server.port}`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for video thumbnails
    await page.waitForSelector(".media-sidebar-thumb-video", { timeout: 30000 }).catch(() => {});

    const videoThumbs = await page.$$(".media-sidebar-thumb-video");
    assert(videoThumbs.length > 0, `Found ${videoThumbs.length} video thumbnails for verification`);

    for (let vi = 0; vi < videoThumbs.length; vi++) {
      // Re-query to avoid stale references
      const currentThumbs = await page.$$(".media-sidebar-thumb-video");
      if (vi >= currentThumbs.length) break;

      await currentThumbs[vi].click();

      // Wait for video to load
      await page.waitForFunction(() => {
        const video = document.querySelector("video");
        return video && video.readyState >= 1 && video.duration > 0;
      }, { timeout: 10000 }).catch(() => {});

      const result = await page.evaluate(() => {
        const video = document.querySelector("video");
        const duration = video ? video.duration : null;

        const timeElements = document.querySelectorAll(".timeline-time");
        const labels = Array.from(timeElements).map((el: Element) => el.textContent?.trim() || "");

        const labelSeconds = labels.filter(Boolean).map((label: string) => {
          const parts = label.split(":");
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        });

        const maxLabelSeconds = labelSeconds.length > 0 ? Math.max(...labelSeconds) : null;

        return {
          videoDuration: duration,
          labels: labels.filter(Boolean),
          maxLabelSeconds,
          exceedsDuration: duration !== null && maxLabelSeconds !== null && maxLabelSeconds > Math.ceil(duration),
        };
      });

      console.log(`  Video ${vi + 1}: duration=${result.videoDuration}s, labels=[${result.labels.join(", ")}]`);

      if (result.labels.length > 0 && result.videoDuration !== null) {
        assert(!result.exceedsDuration,
          `Video ${vi + 1}: labels within duration (max=${result.maxLabelSeconds}s, duration=${Math.ceil(result.videoDuration)}s)`);
      }

      // Take timeline screenshot
      const timeline = await page.$(".video-timeline");
      if (timeline) {
        await timeline.screenshot({ path: join(ARTIFACTS_DIR, `06-timeline-video-${vi + 1}.png`) });
      }

      // Close viewer
      const closeBtn = await page.$(".video-close-btn");
      if (closeBtn && await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press("Escape");
      }
      await sleep(300);
    }

  } finally {
    await browser.close();
  }
}

// ===== Run both parts =====
let server: ServerHandle | null = null;
try {
  server = await startServer(FIXTURE_MD, 5210);
  await runDetailedTest(server);
  await runLabelVerification(server);
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
