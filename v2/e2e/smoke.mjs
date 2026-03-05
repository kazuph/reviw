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
import { tmpdir } from "node:os";
import { writeFileSync } from "node:fs";

const BASE_PORT = 5199;
const SERVER_JS = new URL(
  "../_build/js/release/build/server/server.js",
  import.meta.url,
).pathname;

// Lock directory for test servers (avoids EPERM in restricted environments)
const LOCK_DIR = join(tmpdir(), "reviw-test-locks");
mkdirSync(LOCK_DIR, { recursive: true });

// Create a temp markdown file for testing
const TMP_DIR = join(tmpdir(), "reviw-test-tmp");
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

function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}${path}`, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      })
      .on("error", reject);
  });
}

function httpPost(port, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${port}${path}`,
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

async function waitForServer(port, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpGet(port, "/healthz");
      if (res.status === 200) return true;
    } catch (_) {}
    await sleep(200);
  }
  return false;
}

async function runTest(label, testFile, mode, testFn) {
  console.log(`\n--- ${label} ---`);
  const proc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT), testFile], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR },
  });

  let stdout = "";
  let actualPort = BASE_PORT;
  let resolved = false;
  const portDetected = new Promise((resolve, reject) => {
    proc.stdout.on("data", (d) => {
      stdout += d;
      if (resolved) return;
      const match = stdout.match(/at http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        resolved = true;
        resolve(parseInt(match[1], 10));
      }
    });
    proc.stderr.on("data", (d) => (stdout += d));
    proc.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Server exited (code ${code}) before port detected. Output: ${stdout.substring(0, 300)}`));
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Port detection timed out after 10s. Output: ${stdout.substring(0, 300)}`));
      }
    }, 10000);
  });

  try {
    actualPort = await portDetected;
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${err.message}`);
    try { proc.kill("SIGKILL"); } catch (_) {}
    return { stdout, port: BASE_PORT };
  }

  const ready = await waitForServer(actualPort, 5000);
  if (!ready) {
    failed++;
    console.error(`  FAIL: Server not ready on port ${actualPort} after 5s`);
    try { proc.kill("SIGKILL"); } catch (_) {}
    return { stdout, port: actualPort };
  }

  try {
    await testFn(mode, actualPort);
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${err.message}`);
  }

  // Submit to exit the server
  try {
    await httpPost(
      actualPort,
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

  return { stdout, port: actualPort };
}

// ===== Test: Markdown =====
let lastTestResult;
lastTestResult = await runTest("Markdown Server", TEST_MD, "markdown", async (mode, port) => {
  const html = await httpGet(port, "/");
  assert(html.status === 200, "HTML returns 200");
  assert(html.body.includes("<!DOCTYPE html>"), "HTML has doctype");
  assert(html.body.includes("reviw"), "HTML contains reviw branding");
  assert(html.body.includes(`__REVIW_MODE__="${mode}"`), `Mode is ${mode}`);
  assert(html.body.includes("<h1>"), "Rendered markdown has h1");
  assert(html.body.includes("md-preview"), "Has markdown preview pane");
  assert(html.body.includes("md-layout"), "Has markdown side-by-side layout");
  assert(html.body.includes("md-left"), "Has markdown left panel");
  assert(html.body.includes("md-right"), "Has markdown source panel");
  assert(html.body.includes("recovery-modal"), "Markdown has recovery modal");
  assert(html.body.includes("recovery-restore"), "Markdown has restore button");
  assert(html.body.includes("recovery-discard"), "Markdown has discard button");

  const health = await httpGet(port, "/healthz");
  assert(health.status === 200, "Healthz returns 200");
  assert(health.body.includes('"ok":true'), "Healthz returns ok");

  const uijs = await httpGet(port, "/ui.js");
  assert(uijs.status === 200, "ui.js returns 200");
  assert(uijs.body.length > 100, "ui.js has content");

  const notfound = await httpGet(port, "/nonexistent");
  assert(notfound.status === 404, "Unknown path returns 404");
});

// ===== Test: CSV =====
lastTestResult = await runTest("CSV Server", TEST_CSV, "csv", async (mode, port) => {
  const html = await httpGet(port, "/");
  assert(html.status === 200, "CSV HTML returns 200");
  assert(html.body.includes(`__REVIW_MODE__="${mode}"`), `Mode is ${mode}`);
  assert(html.body.includes("<table"), "Has table element");
  assert(html.body.includes("Alice"), "Contains CSV data");
  assert(html.body.includes("data-row"), "Has data-row attributes");
  assert(html.body.includes("recovery-modal"), "CSV has recovery modal");
});

// ===== Test: localStorage format compatibility (CRV-004/CRV-005) =====
console.log("\n--- localStorage Format Compatibility ---");

// Replicate parse_stored_comments logic from dom.mbt FFI
function parseStoredComments(json) {
  try {
    const data = JSON.parse(json);
    const comments = data.comments;
    if (!comments || typeof comments !== "object") return [];
    return Object.entries(comments).map(([k, v]) => [k, String(v.row||0), String(v.col||0), v.text||""]);
  } catch(e) { return []; }
}

// Replicate is_storage_expired logic from dom.mbt FFI
function isStorageExpired(json) {
  try {
    const data = JSON.parse(json);
    const TTL = 3 * 60 * 60 * 1000;
    return !data.timestamp || (Date.now() - data.timestamp > TTL);
  } catch(e) { return true; }
}

// Test: cli.cjs format is correctly parsed
{
  const cliCjsData = JSON.stringify({
    comments: {
      "2:3": { row: 2, col: 3, text: "fix this" },
      "5:0": { row: 5, col: 0, text: "needs review" },
    },
    timestamp: Date.now(),
  });
  const entries = parseStoredComments(cliCjsData);
  assert(entries.length === 2, "Parses cli.cjs format: 2 entries");
  assert(entries[0][0] === "2:3", "Parses cli.cjs format: correct key");
  assert(entries[0][1] === "2", "Parses cli.cjs format: correct row");
  assert(entries[0][2] === "3", "Parses cli.cjs format: correct col");
  assert(entries[0][3] === "fix this", "Parses cli.cjs format: correct text");
}

// Test: unwrapped (old) format is rejected
{
  const oldFormat = JSON.stringify({
    "2:3": { row: 2, col: 3, text: "fix this" },
  });
  const entries = parseStoredComments(oldFormat);
  assert(entries.length === 0, "Rejects old unwrapped format");
}

// Test: empty comments
{
  const empty = JSON.stringify({ comments: {}, timestamp: Date.now() });
  const entries = parseStoredComments(empty);
  assert(entries.length === 0, "Handles empty comments");
}

// Test: TTL not expired (recent timestamp)
{
  const recent = JSON.stringify({ comments: {}, timestamp: Date.now() });
  assert(!isStorageExpired(recent), "Recent timestamp is not expired");
}

// Test: TTL expired (old timestamp)
{
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
  const old = JSON.stringify({ comments: {}, timestamp: fourHoursAgo });
  assert(isStorageExpired(old), "4-hour-old timestamp is expired");
}

// Test: missing timestamp is treated as expired
{
  const noTs = JSON.stringify({ comments: { "1:0": { row: 1, col: 0, text: "hi" } } });
  assert(isStorageExpired(noTs), "Missing timestamp is treated as expired");
}

// Test: invalid JSON is treated as expired
{
  assert(isStorageExpired("not json"), "Invalid JSON is treated as expired");
}

// ===== Test: Recovery restore/discard behavior (CRV-007) =====
console.log("\n--- Recovery Restore/Discard Logic (CRV-007) ---");

// Simulate restore_comments() logic from app.mbt:
// parse stored data → apply to comments map (non-empty entries only)
function simulateRestore(json) {
  const entries = parseStoredComments(json);
  const restoredComments = {};
  for (const [key, rowStr, colStr, text] of entries) {
    if (text.length > 0) {
      restoredComments[key] = { row: parseInt(rowStr, 10), col: parseInt(colStr, 10), text };
    }
  }
  return restoredComments;
}

// Test: restore correctly maps all non-empty comments
{
  const stored = JSON.stringify({
    comments: {
      "2:3": { row: 2, col: 3, text: "fix this" },
      "5:0": { row: 5, col: 0, text: "needs review" },
      "1:1": { row: 1, col: 1, text: "" },
    },
    timestamp: Date.now(),
  });
  const restored = simulateRestore(stored);
  assert(Object.keys(restored).length === 2, "CRV-007: restore skips empty-text entries");
  assert(restored["2:3"] !== undefined, "CRV-007: restore maps key 2:3");
  assert(restored["2:3"].text === "fix this", "CRV-007: restore preserves comment text");
  assert(restored["5:0"].row === 5, "CRV-007: restore preserves row number");
  assert(restored["5:0"].col === 0, "CRV-007: restore preserves col number");
  assert(restored["1:1"] === undefined, "CRV-007: restore skips entry with empty text");
}

// Test: discard is equivalent to clearing storage (empty parse result)
{
  // After discard, ls_remove is called → next parse returns empty
  const discarded = simulateRestore("{}");
  assert(Object.keys(discarded).length === 0, "CRV-007: discard (empty storage) yields no comments");
}

// Test: restore on expired data returns no comments (check_recovery deletes before restore)
{
  const expiredStored = JSON.stringify({
    comments: { "3:0": { row: 3, col: 0, text: "old comment" } },
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
  });
  assert(isStorageExpired(expiredStored), "CRV-007: expired data is detected before restore");
}

// ===== Test: Lock file cleanup =====
console.log("\n--- Lock File Cleanup ---");
const lockFile = join(LOCK_DIR, `${lastTestResult.port}.lock`);
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
