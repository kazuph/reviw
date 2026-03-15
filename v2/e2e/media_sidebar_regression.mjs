import { spawn } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE_PORT = 5349;
const SERVER_JS = new URL(
  "../_build/js/release/build/server/server.js",
  import.meta.url,
).pathname;
const FEATURES_MD = new URL("../../examples/test-features.md", import.meta.url).pathname;
const LOCK_DIR = join(tmpdir(), "reviw-media-sidebar-locks");

mkdirSync(LOCK_DIR, { recursive: true });

let failed = 0;

function pass(msg, detail) {
  console.log(`PASS: ${msg}`);
  if (detail !== undefined) {
    console.log(JSON.stringify(detail, null, 2));
  }
}

function fail(msg, detail) {
  failed++;
  console.error(`FAIL: ${msg}`);
  if (detail !== undefined) {
    console.error(JSON.stringify(detail, null, 2));
  }
}

function assert(condition, msg, detail) {
  if (condition) {
    pass(msg, detail);
  } else {
    fail(msg, detail);
  }
}

function waitForServerOutput(proc) {
  let stdout = "";
  let resolved = false;
  return new Promise((resolve, reject) => {
    proc.stdout.on("data", (chunk) => {
      stdout += String(chunk);
      if (resolved) return;
      const match = stdout.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        resolved = true;
        resolve(parseInt(match[1], 10));
      }
    });
    proc.stderr.on("data", (chunk) => {
      stdout += String(chunk);
    });
    proc.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`server exited before ready (code=${code})\n${stdout}`));
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`server startup timeout\n${stdout}`));
      }
    }, 10000);
  });
}

async function waitForHealth(port) {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/healthz`);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`healthz timeout on ${port}`);
}

async function measureMinimap(page, selectors) {
  return page.evaluate((sel) => {
    const source = document.querySelector(sel.source);
    const wrapper = document.querySelector(sel.wrapper);
    const viewport = document.querySelector(sel.viewport);
    const minimap = document.querySelector(sel.minimap);
    const minimapSvg = document.querySelector(sel.minimapSvg);
    const minimapViewport = document.querySelector(sel.minimapViewport);

    if (!source || !wrapper || !viewport || !minimap || !minimapSvg || !minimapViewport) {
      return {
        ok: false,
        reason: "missing-elements",
        found: {
          source: !!source,
          wrapper: !!wrapper,
          viewport: !!viewport,
          minimap: !!minimap,
          minimapSvg: !!minimapSvg,
          minimapViewport: !!minimapViewport,
        },
      };
    }

    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };

    const sourceRect = rect(source);
    const wrapperRect = rect(wrapper);
    const viewportRect = rect(viewport);
    const minimapRect = rect(minimap);
    const minimapSvgRect = rect(minimapSvg);
    const actualRect = rect(minimapViewport);

    const matrix = new DOMMatrixReadOnly(
      getComputedStyle(wrapper).transform === "none" ? undefined : getComputedStyle(wrapper).transform,
    );
    const zoom = matrix.a || 1;
    const panX = matrix.e || 0;
    const panY = matrix.f || 0;
    const naturalWidth = wrapperRect.width / zoom;
    const naturalHeight = wrapperRect.height / zoom;

    if (
      sourceRect.width <= 0 ||
      sourceRect.height <= 0 ||
      naturalWidth <= 0 ||
      naturalHeight <= 0 ||
      viewportRect.width <= 0 ||
      viewportRect.height <= 0
    ) {
      return {
        ok: false,
        reason: "invalid-geometry",
        sourceRect,
        wrapperRect,
        viewportRect,
        minimapRect,
        minimapSvgRect,
        actualRect,
      };
    }

    const visibleW = viewportRect.width / zoom;
    const visibleH = viewportRect.height / zoom;
    const worldX = -panX / zoom;
    const worldY = -panY / zoom;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const visibleLeft = clamp(worldX, 0, naturalWidth);
    const visibleTop = clamp(worldY, 0, naturalHeight);
    const visibleRight = clamp(worldX + visibleW, 0, naturalWidth);
    const visibleBottom = clamp(worldY + visibleH, 0, naturalHeight);
    const scaleX = minimapSvgRect.width / naturalWidth;
    const scaleY = minimapSvgRect.height / naturalHeight;
    const expectedRect = {
      left:
        (minimapSvgRect.left - minimapRect.left) +
        visibleLeft * scaleX,
      top:
        (minimapSvgRect.top - minimapRect.top) +
        visibleTop * scaleY,
      width: Math.max(0, visibleRight - visibleLeft) * scaleX,
      height: Math.max(0, visibleBottom - visibleTop) * scaleY,
    };
    const actualNormalized = {
      left: actualRect.left - minimapRect.left,
      top: actualRect.top - minimapRect.top,
      width: actualRect.width,
      height: actualRect.height,
    };

    const delta = {
      left: actualNormalized.left - expectedRect.left,
      top: actualNormalized.top - expectedRect.top,
      width: actualNormalized.width - expectedRect.width,
      height: actualNormalized.height - expectedRect.height,
    };
    const maxAbsDelta = Math.max(
      Math.abs(delta.left),
      Math.abs(delta.top),
      Math.abs(delta.width),
      Math.abs(delta.height),
    );

    return {
      ok: true,
      sourceRect,
      wrapperRect,
      viewportRect,
      minimapRect,
      minimapSvgRect,
      actualRect: actualNormalized,
      expectedRect,
      delta,
      maxAbsDelta,
      zoom,
      panX,
      panY,
    };
  }, selectors);
}

const proc = spawn(
  "node",
  [SERVER_JS, "--no-open", "--port", String(BASE_PORT), FEATURES_MD],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR },
  },
);

let browser;

try {
  const port = await waitForServerOutput(proc);
  await waitForHealth(port);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const pageErrors = [];

  page.on("pageerror", (err) => {
    pageErrors.push(String(err));
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      pageErrors.push(`console:${msg.text()}`);
    }
  });

  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const thumbSummary = await page.evaluate(() => {
    const preview = document.querySelector(".md-preview");
    const thumbs = Array.from(document.querySelectorAll(".media-sidebar-thumb"));
    const expected = preview
      ? preview.querySelectorAll("img, video.video-preview, .mermaid-container").length
      : 0;
    return {
      expected,
      actual: thumbs.length,
      details: thumbs.map((thumb, index) => {
        const media = thumb.querySelector("img, video, svg");
        const rect = media?.getBoundingClientRect();
        return {
          index,
          childTag: media?.tagName || null,
          width: rect?.width || 0,
          height: rect?.height || 0,
          text: thumb.textContent.trim().slice(0, 80),
        };
      }),
    };
  });

  assert(pageErrors.length === 0, "ページ初期化でJS例外が出ない", pageErrors);
  assert(
    thumbSummary.actual === thumbSummary.expected && thumbSummary.actual > 0,
    "Media Sidebar が全メディア分のサムネイルを描画する",
    thumbSummary,
  );
  assert(
    thumbSummary.details.every((item) => item.width >= 20 && item.height >= 20),
    "各サムネイルに可視メディアが入る",
    thumbSummary.details,
  );

  await page.locator(".media-sidebar-thumb-mermaid").first().click();
  await page.waitForTimeout(800);
  const sidebarMeasure = await measureMinimap(page, {
    source: ".sidebar-mermaid-wrapper svg",
    wrapper: ".sidebar-mermaid-wrapper",
    viewport: ".sidebar-mermaid-viewport",
    minimap: ".sidebar-minimap",
    minimapSvg: ".sidebar-minimap-content svg",
    minimapViewport: ".sidebar-minimap-viewport",
  });
  assert(
    sidebarMeasure.ok && sidebarMeasure.maxAbsDelta <= 3,
    "Sidebar Mermaid ミニマップが表示領域に追従する",
    sidebarMeasure,
  );

  const sidebarViewport = page.locator(".sidebar-mermaid-viewport");
  const sidebarBox = await sidebarViewport.boundingBox();
  await page.mouse.move(sidebarBox.x + sidebarBox.width * 0.72, sidebarBox.y + sidebarBox.height * 0.46);
  await page.mouse.down();
  await page.mouse.move(sidebarBox.x + sidebarBox.width * 0.54, sidebarBox.y + sidebarBox.height * 0.34, {
    steps: 8,
  });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const sidebarAfterPan = await measureMinimap(page, {
    source: ".sidebar-mermaid-wrapper svg",
    wrapper: ".sidebar-mermaid-wrapper",
    viewport: ".sidebar-mermaid-viewport",
    minimap: ".sidebar-minimap",
    minimapSvg: ".sidebar-minimap-content svg",
    minimapViewport: ".sidebar-minimap-viewport",
  });
  assert(
    sidebarAfterPan.ok && sidebarAfterPan.maxAbsDelta <= 3,
    "Sidebar Mermaid ミニマップがパン後も表示領域に追従する",
    sidebarAfterPan,
  );

  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await page.locator(".mermaid-fullscreen-btn").first().click();
  await page.waitForTimeout(800);
  const fullscreenMeasure = await measureMinimap(page, {
    source: "#fs-wrapper svg",
    wrapper: "#fs-wrapper",
    viewport: "#fs-content",
    minimap: "#fs-minimap",
    minimapSvg: "#fs-minimap-content svg",
    minimapViewport: "#fs-minimap-viewport",
  });
  assert(
    fullscreenMeasure.ok && fullscreenMeasure.maxAbsDelta <= 3,
    "Fullscreen Mermaid ミニマップが表示領域に追従する",
    fullscreenMeasure,
  );

  const fullscreenViewport = page.locator("#fs-content");
  const fullscreenBox = await fullscreenViewport.boundingBox();
  await page.mouse.move(fullscreenBox.x + fullscreenBox.width * 0.72, fullscreenBox.y + fullscreenBox.height * 0.46);
  await page.mouse.down();
  await page.mouse.move(fullscreenBox.x + fullscreenBox.width * 0.54, fullscreenBox.y + fullscreenBox.height * 0.34, {
    steps: 8,
  });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const fullscreenAfterPan = await measureMinimap(page, {
    source: "#fs-wrapper svg",
    wrapper: "#fs-wrapper",
    viewport: "#fs-content",
    minimap: "#fs-minimap",
    minimapSvg: "#fs-minimap-content svg",
    minimapViewport: "#fs-minimap-viewport",
  });
  assert(
    fullscreenAfterPan.ok && fullscreenAfterPan.maxAbsDelta <= 3,
    "Fullscreen Mermaid ミニマップがパン後も表示領域に追従する",
    fullscreenAfterPan,
  );

  await page.keyboard.down("Control");
  await page.mouse.move(fullscreenBox.x + fullscreenBox.width / 2, fullscreenBox.y + fullscreenBox.height / 2);
  await page.mouse.wheel(0, -500);
  await page.keyboard.up("Control");
  await page.waitForTimeout(250);
  const fullscreenAfterZoom = await measureMinimap(page, {
    source: "#fs-wrapper svg",
    wrapper: "#fs-wrapper",
    viewport: "#fs-content",
    minimap: "#fs-minimap",
    minimapSvg: "#fs-minimap-content svg",
    minimapViewport: "#fs-minimap-viewport",
  });
  assert(
    fullscreenAfterZoom.ok && fullscreenAfterZoom.maxAbsDelta <= 3,
    "Fullscreen Mermaid ミニマップがズーム後も表示領域に追従する",
    fullscreenAfterZoom,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
} catch (err) {
  fail("media sidebar regression test aborted", { message: err.message, stack: err.stack });
  process.exitCode = 1;
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
  proc.kill("SIGKILL");
}
