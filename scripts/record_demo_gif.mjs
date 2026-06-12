// Records the README demo: open showcase-report.md in yunomi, scroll,
// leave a comment, approve & submit. Produces a webm under scripts/_rec/.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import http from "node:http";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = path.join(ROOT, "v2/_build/js/release/build/server/server.js");
const REPORT = path.join(ROOT, "examples/showcase-report.md");
const REC_DIR = path.join(ROOT, "scripts/_rec");
const PORT = 8742;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const waitForServer = async (port, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const req = http.get({ host: "127.0.0.1", port, path: "/" }, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
    });
    if (ok) return;
    await sleep(150);
  }
  throw new Error("server did not start");
};

const server = spawn("node", [SERVER, "--no-open", "--port", String(PORT), REPORT], {
  cwd: ROOT,
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOut = "";
server.stdout.on("data", (d) => (serverOut += d));
server.stderr.on("data", (d) => (serverOut += d));
const serverExited = new Promise((resolve) => server.on("exit", resolve));

try {
  await waitForServer(PORT, 8000);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: REC_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  // Fake cursor + click ripple so the GIF viewer can follow the action.
  await page.addInitScript(() => {
    addEventListener("DOMContentLoaded", () => {
      const cur = document.createElement("div");
      cur.style.cssText =
        "position:fixed;z-index:2147483647;width:18px;height:18px;border-radius:50%;" +
        "background:rgba(99,102,241,.85);border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4);" +
        "pointer-events:none;left:-50px;top:-50px;transform:translate(-50%,-50%);";
      document.body.appendChild(cur);
      addEventListener("mousemove", (e) => {
        cur.style.left = e.clientX + "px";
        cur.style.top = e.clientY + "px";
      }, true);
      addEventListener("mousedown", (e) => {
        const r = document.createElement("div");
        r.style.cssText =
          "position:fixed;z-index:2147483646;width:14px;height:14px;border-radius:50%;" +
          "border:3px solid rgba(99,102,241,.9);pointer-events:none;transform:translate(-50%,-50%);" +
          `left:${e.clientX}px;top:${e.clientY}px;transition:all .45s ease-out;opacity:1;`;
        document.body.appendChild(r);
        requestAnimationFrame(() => {
          r.style.width = "56px";
          r.style.height = "56px";
          r.style.opacity = "0";
        });
        setTimeout(() => r.remove(), 600);
      }, true);
    });
  });

  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.waitForSelector(".md-preview");
  await page.waitForSelector(".md-preview .mermaid-container svg", { timeout: 15000 }).catch(() => {});
  await page.waitForSelector(".md-preview img", { timeout: 10000 }).catch(() => {});
  await page.mouse.move(640, 300);
  await sleep(2200); // opening beat: title + request visible

  // Scroll through the report with the wheel (smooth-ish steps).
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 130);
    await sleep(170);
  }
  await sleep(1400); // rest on evidence / test results

  // Comment on the closing paragraph.
  const target = page.locator(".md-preview p", { hasText: "Ready for your verdict" }).first();
  await target.scrollIntoViewIfNeeded();
  await sleep(700);
  const box = await target.boundingBox();
  const cx = box.x + Math.min(box.width / 2, 320);
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy, { steps: 22 });
  await sleep(350);
  await page.mouse.down();
  await sleep(90);
  await page.mouse.up();
  await page.waitForSelector("#comment-card", { state: "visible", timeout: 5000 });
  await sleep(500);
  await page.locator("#comment-input").pressSequentially(
    "Love it — no flash on reload. Ship it 🍵", { delay: 42 });
  await sleep(700);
  const saveBtn = page.locator("#save-comment");
  const sb = await saveBtn.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 14 });
  await sleep(250);
  await saveBtn.click();
  await sleep(1100);

  // Submit & approve.
  const submitBtn = page.locator("#send-and-exit");
  const bb = await submitBtn.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 18 });
  await sleep(350);
  await submitBtn.click();
  await page.waitForFunction(() => {
    const m = document.getElementById("submit-modal");
    return m && m.classList.contains("visible");
  }, { timeout: 5000 });
  await sleep(900);
  const summary = page.locator("#global-comment");
  if (await summary.isVisible().catch(() => false)) {
    await summary.pressSequentially("Approved. Nice work!", { delay: 45 });
    await sleep(500);
  }
  const approve = page.locator("#modal-approve");
  const ab = await approve.boundingBox();
  await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2, { steps: 16 });
  await sleep(400);
  await approve.click();
  await sleep(1800); // closing beat

  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  await browser.close();

  await serverExited;
  try { server.kill("SIGKILL"); } catch {}
  console.log("=== server stdout (verdict YAML) ===");
  console.log(serverOut);
  console.log("=== video:", videoPath);
} catch (e) {
  try { server.kill("SIGKILL"); } catch {}
  console.error(e);
  process.exit(1);
}
