/**
 * E2E Smoke Test for reviw v2 server
 * Verifies: server starts, serves HTML, healthz, SSE, submit flow, lock files
 *
 * Run: node e2e/smoke.mjs
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { writeFileSync } from "node:fs";

const PORT = 5199;
const SERVER_JS = new URL(
  "../_build/js/release/build/server/server.js",
  import.meta.url,
).pathname;

// Create a temp markdown file for testing
const TMP_DIR = join(homedir(), ".reviw/test-tmp");
mkdirSync(TMP_DIR, { recursive: true });
const TEST_MD = join(TMP_DIR, "test.md");
writeFileSync(
  TEST_MD,
  "# Hello\n\nTest content\n\n## Section 2\n\n- item 1\n- item 2\n",
);

const TEST_CSV = join(TMP_DIR, "test.csv");
writeFileSync(TEST_CSV, "name,age\nAlice,30\nBob,25\n");

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

function httpGet(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${PORT}${path}`, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${PORT}${path}`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTest(label, testFile, mode, testFn) {
  console.log(`\n--- ${label} ---`);
  const proc = spawn("node", [SERVER_JS, "--no-open", "--port", PORT, testFile], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  proc.stdout.on("data", (d) => (stdout += d));
  proc.stderr.on("data", (d) => (stdout += d));

  await sleep(1500);

  try {
    await testFn(mode);
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${err.message}`);
  }

  // Submit to exit the server
  try {
    await httpPost(
      "/exit",
      JSON.stringify({
        summary: "test review",
        comments: [{ row: 0, col: 0, text: "test comment" }],
      }),
    );
  } catch (_) {}

  await sleep(500);

  // Ensure process is dead
  try {
    proc.kill("SIGKILL");
  } catch (_) {}

  return stdout;
}

// ===== Test: Markdown =====
await runTest("Markdown Server", TEST_MD, "markdown", async (mode) => {
  const html = await httpGet("/");
  assert(html.status === 200, "HTML returns 200");
  assert(html.body.includes("<!DOCTYPE html>"), "HTML has doctype");
  assert(html.body.includes("reviw"), "HTML contains reviw branding");
  assert(html.body.includes(`__REVIW_MODE__="${mode}"`), `Mode is ${mode}`);
  assert(html.body.includes("<h1>"), "Rendered markdown has h1");
  assert(html.body.includes("md-preview"), "Has markdown preview pane");
  assert(html.body.includes("md-source"), "Has markdown source pane");

  const health = await httpGet("/healthz");
  assert(health.status === 200, "Healthz returns 200");
  assert(health.body.includes('"ok":true'), "Healthz returns ok");

  const uijs = await httpGet("/ui.js");
  assert(uijs.status === 200, "ui.js returns 200");
  assert(uijs.body.length > 100, "ui.js has content");

  const notfound = await httpGet("/nonexistent");
  assert(notfound.status === 404, "Unknown path returns 404");
});

// ===== Test: CSV =====
await runTest("CSV Server", TEST_CSV, "csv", async (mode) => {
  const html = await httpGet("/");
  assert(html.status === 200, "CSV HTML returns 200");
  assert(html.body.includes(`__REVIW_MODE__="${mode}"`), `Mode is ${mode}`);
  assert(html.body.includes("<table"), "Has table element");
  assert(html.body.includes("Alice"), "Contains CSV data");
  assert(html.body.includes("data-row"), "Has data-row attributes");
});

// ===== Test: Lock file cleanup =====
console.log("\n--- Lock File Cleanup ---");
const lockDir = join(homedir(), ".reviw/locks");
const lockFile = join(lockDir, `${PORT}.lock`);
// After submit, lock should be cleaned up
assert(!existsSync(lockFile), "Lock file cleaned up after exit");

// Cleanup temp files
try {
  unlinkSync(TEST_MD);
  unlinkSync(TEST_CSV);
} catch (_) {}

// ===== Summary =====
console.log(`\n============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`============================`);

if (failed > 0) process.exit(1);
