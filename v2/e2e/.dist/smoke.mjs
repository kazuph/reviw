// v2/e2e/smoke.ts
import http from "node:http";
import { spawn } from "node:child_process";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { writeFileSync } from "node:fs";
var BASE_PORT = 5199;
var SERVER_JS = new URL(
  "../_build/js/release/build/server/server.js",
  import.meta.url
).pathname;
var LOCK_DIR = join(tmpdir(), "reviw-test-locks");
mkdirSync(LOCK_DIR, { recursive: true });
var TMP_DIR = join(tmpdir(), "reviw-test-tmp");
mkdirSync(TMP_DIR, { recursive: true });
var TEST_MD = join(TMP_DIR, "test.md");
writeFileSync(
  TEST_MD,
  "# Hello\n\nTest content\n\n## Section 2\n\n- item 1\n- item 2\n"
);
var TEST_CSV = join(TMP_DIR, "test.csv");
writeFileSync(TEST_CSV, "name,age\nAlice,30\nBob,25\n");
var passed = 0;
var failed = 0;
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
    http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}
function httpPost(port, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://127.0.0.1:${port}${path}`,
      { method: "POST", headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (c) => data += c);
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
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
    } catch (_) {
    }
    await sleep(200);
  }
  return false;
}
function waitForProcessExit(proc, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      resolve(result);
    };
    proc.once("exit", (code) => finish({ exited: true, code: code ?? 0 }));
    setTimeout(() => finish({ exited: false, code: "timeout" }), timeoutMs);
  });
}
async function runTest(label, testFile, mode, testFn) {
  console.log(`
--- ${label} ---`);
  const proc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT), testFile], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR }
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
    proc.stderr.on("data", (d) => stdout += d);
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
    }, 1e4);
  });
  try {
    actualPort = await portDetected;
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${err.message}`);
    try {
      proc.kill("SIGKILL");
    } catch (_) {
    }
    return { stdout, port: BASE_PORT };
  }
  const ready = await waitForServer(actualPort, 5e3);
  if (!ready) {
    failed++;
    console.error(`  FAIL: Server not ready on port ${actualPort} after 5s`);
    try {
      proc.kill("SIGKILL");
    } catch (_) {
    }
    return { stdout, port: actualPort };
  }
  try {
    await testFn(mode, actualPort);
  } catch (err) {
    failed++;
    console.error(`  FAIL: ${err.message}`);
  }
  try {
    await httpPost(
      actualPort,
      "/exit",
      JSON.stringify({
        summary: "test review",
        comments: [{ row: 0, col: 0, text: "test comment" }]
      })
    );
  } catch (_) {
  }
  await sleep(500);
  try {
    proc.kill("SIGKILL");
  } catch (_) {
  }
  return { stdout, port: actualPort };
}
var lastTestResult;
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
lastTestResult = await runTest("CSV Server", TEST_CSV, "csv", async (mode, port) => {
  const html = await httpGet(port, "/");
  assert(html.status === 200, "CSV HTML returns 200");
  assert(html.body.includes(`__REVIW_MODE__="${mode}"`), `Mode is ${mode}`);
  assert(html.body.includes("<table"), "Has table element");
  assert(html.body.includes("Alice"), "Contains CSV data");
  assert(html.body.includes("data-row"), "Has data-row attributes");
  assert(html.body.includes("recovery-modal"), "CSV has recovery modal");
});
var TEST_STATIC_DIR = join(TMP_DIR, "assets");
mkdirSync(TEST_STATIC_DIR, { recursive: true });
var TEST_STATIC_FILE = join(TEST_STATIC_DIR, "test-image.png");
var PNG_HEADER = Buffer.from([
  137,
  80,
  78,
  71,
  13,
  10,
  26,
  10,
  // PNG signature
  0,
  0,
  0,
  13,
  73,
  72,
  68,
  82,
  // IHDR chunk
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  1,
  // 1x1
  8,
  2,
  0,
  0,
  0,
  144,
  119,
  83,
  // 8-bit RGB
  222,
  0,
  0,
  0,
  12,
  73,
  68,
  65,
  // IDAT chunk
  84,
  8,
  215,
  99,
  248,
  207,
  192,
  0,
  // compressed data
  0,
  0,
  2,
  0,
  1,
  226,
  33,
  188,
  // ...
  51,
  0,
  0,
  0,
  0,
  73,
  69,
  78,
  // IEND chunk
  68,
  174,
  66,
  96,
  130
]);
writeFileSync(TEST_STATIC_FILE, PNG_HEADER);
var TEST_VIDEO_FILE = join(TEST_STATIC_DIR, "test.mp4");
var VIDEO_BYTES = Buffer.alloc(4096);
for (let i = 0; i < 4096; i++) VIDEO_BYTES[i] = i & 255;
writeFileSync(TEST_VIDEO_FILE, VIDEO_BYTES);
lastTestResult = await runTest("Static File Serving", TEST_MD, "markdown", async (mode, port) => {
  const img = await httpGet(port, "/assets/test-image.png");
  assert(img.status === 200, "Static image returns 200");
  const missing = await httpGet(port, "/assets/nonexistent.png");
  assert(missing.status === 404, "Missing static file returns 404");
  const traversal = await new Promise((resolve, reject) => {
    const opts = {
      hostname: "127.0.0.1",
      port,
      method: "GET",
      path: "/assets/..%2F..%2Fetc/passwd"
    };
    http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject).end();
  });
  assert(traversal.status === 403, "Path traversal returns 403");
  const rangeRes = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/assets/test.mp4`, {
      headers: { "Range": "bytes=0-99" }
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        bodyLength: Buffer.concat(chunks).length
      }));
    }).on("error", reject);
  });
  assert(rangeRes.status === 206, "Range request returns 206");
  assert(rangeRes.headers["content-range"] === "bytes 0-99/4096", "Range response has correct Content-Range");
  assert(rangeRes.bodyLength === 100, "Range response body is 100 bytes");
  const midRange = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/assets/test.mp4`, {
      headers: { "Range": "bytes=1000-1999" }
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        headers: res.headers,
        bodyLength: Buffer.concat(chunks).length
      }));
    }).on("error", reject);
  });
  assert(midRange.status === 206, "Mid-file range returns 206");
  assert(midRange.headers["content-range"] === "bytes 1000-1999/4096", "Mid-file range has correct Content-Range");
  assert(midRange.bodyLength === 1e3, "Mid-file range body is 1000 bytes");
  const fullVideo = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/assets/test.mp4`, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({
        status: res.statusCode,
        bodyLength: Buffer.concat(chunks).length
      }));
    }).on("error", reject);
  });
  assert(fullVideo.status === 200, "Full video GET returns 200");
  assert(fullVideo.bodyLength === 4096, "Full video body is 4096 bytes");
});
lastTestResult = await runTest("Video Timeline Security", TEST_MD, "markdown", async (mode, port) => {
  const vtTraversal = await httpGet(port, "/video-timeline?path=../../etc/passwd&scene=0.01");
  assert(vtTraversal.status === 400 || vtTraversal.status === 403, "video-timeline rejects path traversal");
  const vtAbsolute = await httpGet(port, "/video-timeline?path=/etc/passwd&scene=0.01");
  assert(vtAbsolute.status === 403 || vtAbsolute.status === 404, "video-timeline rejects absolute path outside base_dir");
});
console.log("\n--- localStorage Format Compatibility ---");
function parseStoredComments(json) {
  try {
    const data = JSON.parse(json);
    const comments = data.comments;
    if (!comments || typeof comments !== "object") return [];
    return Object.entries(comments).map(([k, v]) => [k, String(v.row || 0), String(v.col || 0), v.text || ""]);
  } catch (e) {
    return [];
  }
}
function isStorageExpired(json) {
  try {
    const data = JSON.parse(json);
    const TTL = 3 * 60 * 60 * 1e3;
    return !data.timestamp || Date.now() - data.timestamp > TTL;
  } catch (e) {
    return true;
  }
}
{
  const cliCjsData = JSON.stringify({
    comments: {
      "2:3": { row: 2, col: 3, text: "fix this" },
      "5:0": { row: 5, col: 0, text: "needs review" }
    },
    timestamp: Date.now()
  });
  const entries = parseStoredComments(cliCjsData);
  assert(entries.length === 2, "Parses cli.cjs format: 2 entries");
  assert(entries[0][0] === "2:3", "Parses cli.cjs format: correct key");
  assert(entries[0][1] === "2", "Parses cli.cjs format: correct row");
  assert(entries[0][2] === "3", "Parses cli.cjs format: correct col");
  assert(entries[0][3] === "fix this", "Parses cli.cjs format: correct text");
}
{
  const oldFormat = JSON.stringify({
    "2:3": { row: 2, col: 3, text: "fix this" }
  });
  const entries = parseStoredComments(oldFormat);
  assert(entries.length === 0, "Rejects old unwrapped format");
}
{
  const empty = JSON.stringify({ comments: {}, timestamp: Date.now() });
  const entries = parseStoredComments(empty);
  assert(entries.length === 0, "Handles empty comments");
}
{
  const recent = JSON.stringify({ comments: {}, timestamp: Date.now() });
  assert(!isStorageExpired(recent), "Recent timestamp is not expired");
}
{
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1e3;
  const old = JSON.stringify({ comments: {}, timestamp: fourHoursAgo });
  assert(isStorageExpired(old), "4-hour-old timestamp is expired");
}
{
  const noTs = JSON.stringify({ comments: { "1:0": { row: 1, col: 0, text: "hi" } } });
  assert(isStorageExpired(noTs), "Missing timestamp is treated as expired");
}
{
  assert(isStorageExpired("not json"), "Invalid JSON is treated as expired");
}
console.log("\n--- Recovery Restore/Discard Logic (CRV-007) ---");
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
{
  const stored = JSON.stringify({
    comments: {
      "2:3": { row: 2, col: 3, text: "fix this" },
      "5:0": { row: 5, col: 0, text: "needs review" },
      "1:1": { row: 1, col: 1, text: "" }
    },
    timestamp: Date.now()
  });
  const restored = simulateRestore(stored);
  assert(Object.keys(restored).length === 2, "CRV-007: restore skips empty-text entries");
  assert(restored["2:3"] !== void 0, "CRV-007: restore maps key 2:3");
  assert(restored["2:3"].text === "fix this", "CRV-007: restore preserves comment text");
  assert(restored["5:0"].row === 5, "CRV-007: restore preserves row number");
  assert(restored["5:0"].col === 0, "CRV-007: restore preserves col number");
  assert(restored["1:1"] === void 0, "CRV-007: restore skips entry with empty text");
}
{
  const discarded = simulateRestore("{}");
  assert(Object.keys(discarded).length === 0, "CRV-007: discard (empty storage) yields no comments");
}
{
  const expiredStored = JSON.stringify({
    comments: { "3:0": { row: 3, col: 0, text: "old comment" } },
    timestamp: Date.now() - 4 * 60 * 60 * 1e3
  });
  assert(isStorageExpired(expiredStored), "CRV-007: expired data is detected before restore");
}
console.log("\n--- Lock File Cleanup ---");
var lockFile = join(LOCK_DIR, `${lastTestResult.port}.lock`);
assert(!existsSync(lockFile), "Lock file cleaned up after exit");
lastTestResult = await runTest("HEAD Method Extended", TEST_MD, "markdown", async (mode, port) => {
  const headUiJs = await new Promise((resolve, reject) => {
    http.request(`http://127.0.0.1:${port}/ui.js`, { method: "HEAD" }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject).end();
  });
  assert(headUiJs.status === 200, "HEAD /ui.js returns 200");
  assert((headUiJs.headers["content-type"] || "").includes("javascript"), "HEAD /ui.js has JS content-type");
  assert(headUiJs.body.length === 0, "HEAD /ui.js has empty body");
  const headHistory = await new Promise((resolve, reject) => {
    http.request(`http://127.0.0.1:${port}/history`, { method: "HEAD" }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject).end();
  });
  assert(headHistory.status === 200, "HEAD /history returns 200");
  assert((headHistory.headers["content-type"] || "").includes("json"), "HEAD /history has JSON content-type");
  assert(headHistory.body.length === 0, "HEAD /history has empty body");
  const headHealth = await new Promise((resolve, reject) => {
    http.request(`http://127.0.0.1:${port}/healthz`, { method: "HEAD" }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject).end();
  });
  assert(headHealth.status === 200, "HEAD /healthz returns 200");
  assert(headHealth.body.length === 0, "HEAD /healthz has empty body");
});
console.log("\n--- Submit Data Persistence ---");
{
  const submitProc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT + 30), TEST_MD], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR }
  });
  let sStdout = "";
  let sResolved = false;
  const sPortDetected = new Promise((resolve, reject) => {
    submitProc.stdout.on("data", (d) => {
      sStdout += d;
      if (sResolved) return;
      const match = sStdout.match(/at http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        sResolved = true;
        resolve(parseInt(match[1], 10));
      }
    });
    submitProc.stderr.on("data", (d) => sStdout += d);
    submitProc.on("exit", () => {
      if (!sResolved) {
        sResolved = true;
        reject(new Error("Server exited"));
      }
    });
    setTimeout(() => {
      if (!sResolved) {
        sResolved = true;
        reject(new Error("Timeout"));
      }
    }, 1e4);
  });
  try {
    const submitPort = await sPortDetected;
    await waitForServer(submitPort, 5e3);
    const payload = JSON.stringify({
      summary: "e2e test review summary",
      comments: [
        { row: 1, col: 0, text: "line 1 comment", image: "" },
        { row: 3, col: 0, text: "line 3 comment with {braces} in text", image: "" }
      ],
      summaryImages: [],
      reviwAnswers: { "q1": "answer to question 1" }
    });
    let submitOk = false;
    try {
      const submitRes = await httpPost(submitPort, "/exit", payload);
      submitOk = submitRes.status === 200;
    } catch (e) {
      submitOk = e.message.includes("socket hang up") || e.message.includes("ECONNRESET");
    }
    assert(submitOk, "Submit with comments+answers accepted by server");
    await sleep(1e3);
    assert(sStdout.includes("line 1 comment"), "Submit: server output includes comment text");
    assert(sStdout.includes("e2e test review summary"), "Submit: server output includes summary");
  } catch (err) {
    failed++;
    console.error(`  FAIL: Submit test: ${err.message}`);
  }
  try {
    submitProc.kill("SIGKILL");
  } catch (_) {
  }
}
console.log("\n--- Session Close Ordering ---");
{
  const sessionProc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT + 31), TEST_MD], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR }
  });
  let sessionStdout = "";
  let sessionResolved = false;
  const sessionPortDetected = new Promise((resolve, reject) => {
    sessionProc.stdout.on("data", (d) => {
      sessionStdout += d;
      if (sessionResolved) return;
      const match = sessionStdout.match(/at http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        sessionResolved = true;
        resolve(parseInt(match[1], 10));
      }
    });
    sessionProc.stderr.on("data", (d) => sessionStdout += d);
    sessionProc.on("exit", () => {
      if (!sessionResolved) {
        sessionResolved = true;
        reject(new Error("Server exited before port detection"));
      }
    });
    setTimeout(() => {
      if (!sessionResolved) {
        sessionResolved = true;
        reject(new Error("Timeout"));
      }
    }, 1e4);
  });
  try {
    const sessionPort = await sessionPortDetected;
    await waitForServer(sessionPort, 5e3);
    const tabId = "tab-1";
    const oldInstance = "instance-old";
    const newInstance = "instance-new";
    await httpPost(sessionPort, "/session/open", JSON.stringify({ tabId, instanceId: oldInstance }));
    await httpPost(sessionPort, "/session/open", JSON.stringify({ tabId, instanceId: newInstance }));
    await httpPost(sessionPort, "/close", JSON.stringify({
      tabId,
      instanceId: oldInstance,
      draft: JSON.stringify({ summary: "stale close", comments: [{ row: 1, col: 0, text: "stale comment" }] })
    }));
    await sleep(900);
    const staleHealth = await httpGet(sessionPort, "/healthz");
    assert(staleHealth.status === 200, "Session Close: stale close from previous instance does not terminate the server");
    const exitResult = waitForProcessExit(sessionProc, 5e3);
    await httpPost(sessionPort, "/close", JSON.stringify({
      tabId,
      instanceId: newInstance,
      draft: JSON.stringify({ summary: "fresh close", comments: [{ row: 2, col: 0, text: "fresh comment" }] })
    }));
    const closed = await exitResult;
    assert(closed.exited === true, "Session Close: latest instance close terminates the server");
    assert(sessionStdout.includes("fresh comment"), "Session Close: latest instance draft is the one that gets flushed");
    assert(!sessionStdout.includes("stale comment"), "Session Close: stale instance draft is ignored");
  } catch (err) {
    failed++;
    console.error(`  FAIL: Session close ordering test: ${err.message}`);
  }
  try {
    sessionProc.kill("SIGKILL");
  } catch (_) {
  }
}
console.log("\n--- split_json_array String Safety ---");
{
  let splitJsonArray = function(json) {
    const chars = [...json];
    const len = chars.length;
    const result = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let i = 0;
    while (i < len) {
      const ch = chars[i];
      if (inString) {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === '"') {
          inString = false;
        }
        i++;
        continue;
      }
      if (ch === '"') {
        inString = true;
      } else if (ch === "{") {
        if (depth === 0) {
          start = i;
        }
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0 && start >= 0) {
          result.push(json.substring(start, i + 1));
          start = -1;
        }
      }
      i++;
    }
    return result;
  };
  const basic = '[{"a":1},{"b":2}]';
  const basicResult = splitJsonArray(basic);
  assert(basicResult.length === 2, "split_json_array: basic array -> 2 entries");
  const withBraces = '[{"summary":"value with {braces} inside"},{"other":"normal"}]';
  const bracesResult = splitJsonArray(withBraces);
  assert(bracesResult.length === 2, "split_json_array: strings with {} -> 2 entries (not split wrongly)");
  assert(bracesResult[0].includes("{braces}"), "split_json_array: first entry preserves {braces} in string");
  const escaped = '[{"text":"he said \\"hello\\" and {left}"}]';
  const escapedResult = splitJsonArray(escaped);
  assert(escapedResult.length === 1, "split_json_array: escaped quotes handled correctly");
  const nested = '[{"data":{"inner":1}},{"other":"val"}]';
  const nestedResult = splitJsonArray(nested);
  assert(nestedResult.length === 2, "split_json_array: nested objects -> 2 entries");
  const empty = "[]";
  const emptyResult = splitJsonArray(empty);
  assert(emptyResult.length === 0, "split_json_array: empty array -> 0 entries");
}
var playwrightAvailable = false;
try {
  const { chromium } = await import("playwright");
  playwrightAvailable = true;
} catch (_) {
  console.log("\n--- Playwright Browser E2E (SKIPPED: playwright not installed) ---");
}
if (playwrightAvailable) {
  const { chromium } = await import("playwright");
  console.log("\n--- Playwright Browser E2E ---");
  const browserProc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT + 50), TEST_MD], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR }
  });
  let bStdout = "";
  let bResolved = false;
  const bPortDetected = new Promise((resolve, reject) => {
    browserProc.stdout.on("data", (d) => {
      bStdout += d;
      if (bResolved) return;
      const match = bStdout.match(/at http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        bResolved = true;
        resolve(parseInt(match[1], 10));
      }
    });
    browserProc.stderr.on("data", (d) => bStdout += d);
    browserProc.on("exit", () => {
      if (!bResolved) {
        bResolved = true;
        reject(new Error("Server exited"));
      }
    });
    setTimeout(() => {
      if (!bResolved) {
        bResolved = true;
        reject(new Error("Timeout"));
      }
    }, 1e4);
  });
  let browserPort;
  try {
    browserPort = await bPortDetected;
  } catch (err) {
    failed++;
    console.error(`  FAIL: Browser test server start: ${err.message}`);
    try {
      browserProc.kill("SIGKILL");
    } catch (_) {
    }
  }
  if (browserPort) {
    await waitForServer(browserPort, 5e3);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const BASE = `http://127.0.0.1:${browserPort}`;
    await page.goto(BASE, { waitUntil: "load", timeout: 3e4 });
    await page.waitForSelector("#md-preview", { timeout: 1e4 });
    const themeResult = await page.evaluate(() => {
      const html = document.documentElement;
      const initialTheme = html.getAttribute("data-theme");
      const themeBtn = document.getElementById("theme-toggle");
      if (!themeBtn) return { error: "no theme button" };
      themeBtn.click();
      const afterToggle = html.getAttribute("data-theme");
      const stored = localStorage.getItem("reviw:theme");
      themeBtn.click();
      const afterSecond = html.getAttribute("data-theme");
      const storedAfter = localStorage.getItem("reviw:theme");
      return { initialTheme, afterToggle, stored, afterSecond, storedAfter };
    });
    assert(themeResult.afterToggle !== themeResult.initialTheme, "Browser: theme toggles data-theme attribute");
    assert(themeResult.stored === themeResult.afterToggle, "Browser: theme persisted to localStorage");
    assert(themeResult.afterSecond === themeResult.initialTheme, "Browser: theme toggles back correctly");
    const viewResult = await page.evaluate(() => {
      const layout = document.querySelector(".md-layout");
      const viewBtn = document.getElementById("view-toggle");
      if (!layout || !viewBtn) return { error: "missing elements" };
      const initialPreviewOnly = layout.classList.contains("preview-only");
      viewBtn.click();
      const afterClick = layout.classList.contains("preview-only");
      const stored = localStorage.getItem("reviw-panel-state");
      viewBtn.click();
      const afterSecond = layout.classList.contains("preview-only");
      const storedAfter = localStorage.getItem("reviw-panel-state");
      return { initialPreviewOnly, afterClick, stored, afterSecond, storedAfter };
    });
    assert(viewResult.afterClick !== viewResult.initialPreviewOnly, "Browser: view toggle changes preview-only class");
    assert(viewResult.stored !== null, "Browser: view state persisted to localStorage");
    assert(viewResult.afterSecond === viewResult.initialPreviewOnly, "Browser: view toggles back correctly");
    const historyResult = await page.evaluate(() => {
      const panel = document.getElementById("history-panel");
      const btn = document.getElementById("history-toggle");
      if (!panel || !btn) return { error: "missing history elements" };
      btn.click();
      const afterOpen = panel.classList.contains("open");
      const bodyHasClass = document.body.classList.contains("history-open");
      const closeBtn = document.getElementById("history-panel-close");
      if (closeBtn) closeBtn.click();
      const afterClose = panel.classList.contains("open");
      return { afterOpen, bodyHasClass, afterClose };
    });
    assert(historyResult.afterOpen === true, "Browser: history panel opens with .open class");
    assert(historyResult.bodyHasClass === true, "Browser: body gets .history-open class");
    assert(historyResult.afterClose === false, "Browser: history panel closes correctly");
    const headUiJs = await page.request.head(`${BASE}/ui.js`);
    assert(headUiJs.status() === 200, "Browser HEAD: /ui.js returns 200");
    assert((headUiJs.headers()["content-type"] || "").includes("javascript"), "Browser HEAD: /ui.js content-type");
    const headHistory = await page.request.head(`${BASE}/history`);
    assert(headHistory.status() === 200, "Browser HEAD: /history returns 200");
    assert((headHistory.headers()["content-type"] || "").includes("json"), "Browser HEAD: /history content-type");
    const selectorCheck = await page.evaluate(() => {
      const oldCards = document.querySelectorAll(".reviw-question-item");
      return { oldSelectorCount: oldCards.length };
    });
    assert(selectorCheck.oldSelectorCount === 0, "Browser: no .reviw-question-item in DOM (old selector removed)");
    const xssCheck = await page.evaluate(() => {
      const preview = document.getElementById("md-preview");
      if (!preview) return { scriptTags: -1 };
      return { scriptTags: preview.querySelectorAll("script").length };
    });
    assert(xssCheck.scriptTags === 0, "Browser: no <script> tags in preview (XSS safe)");
    const imgPreview = await page.evaluate(() => !!document.getElementById("comment-image-preview"));
    assert(imgPreview, "Browser: comment image preview container exists");
    const sourceCell = page.locator("td[data-row]").first();
    await sourceCell.waitFor({ state: "visible", timeout: 5e3 });
    const box = await sourceCell.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForFunction(() => {
      const card = document.getElementById("comment-card");
      return card && getComputedStyle(card).display !== "none";
    }, { timeout: 5e3 });
    const commentFlowResult = await page.evaluate(() => {
      const card = document.getElementById("comment-card");
      const preview = document.getElementById("comment-image-preview");
      return {
        cardVisible: card && getComputedStyle(card).display !== "none",
        previewInCard: !!preview
      };
    });
    assert(commentFlowResult.cardVisible === true, "Browser: comment card opens on mousedown+mouseup");
    assert(commentFlowResult.previewInCard === true, "Browser: comment card has image preview area");
    const pasteResult = await page.evaluate(`(async () => {
      const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      const binaryStr = atob(base64Png);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/png" });
      const file = new File([blob], "test.png", { type: "image/png" });
      const mockClipboardData = { items: [{ type: "image/png", getAsFile: function() { return file; } }] };
      const pasteEvent = new Event("paste", { bubbles: true, cancelable: true });
      Object.defineProperty(pasteEvent, "clipboardData", { value: mockClipboardData });
      document.dispatchEvent(pasteEvent);
      await new Promise(function(r) { setTimeout(r, 500); });
      const previewEl = document.getElementById("comment-image-preview");
      const hasImage = previewEl && previewEl.querySelector("img") !== null;
      const imgSrc = hasImage ? previewEl.querySelector("img").src.substring(0, 30) : "";
      return { hasImage: hasImage, imgSrc: imgSrc };
    })()`);
    assert(pasteResult.hasImage === true, "Browser: paste event renders image in comment preview");
    assert(pasteResult.imgSrc.startsWith("data:image"), "Browser: pasted image has data:image src");
    const saveResult = await page.evaluate(() => {
      const textarea = document.getElementById("comment-input");
      if (textarea) textarea.value = "comment with image";
      const saveBtn = document.getElementById("save-comment");
      if (saveBtn) saveBtn.click();
      const indicators = document.querySelectorAll(".has-comment");
      return { indicatorCount: indicators.length };
    });
    assert(saveResult.indicatorCount >= 1, "Browser: saved comment with image shows indicator");
    await page.evaluate(() => {
      const card = document.getElementById("comment-card");
      if (card) card.style.display = "none";
    });
    const globalComment = page.locator("#global-comment");
    if (await globalComment.isVisible().catch(() => false)) {
      await globalComment.fill("Browser E2E test summary");
    }
    const serverExited = new Promise((resolve) => {
      browserProc.on("exit", resolve);
      setTimeout(() => resolve("timeout"), 8e3);
    });
    const submitBtn = page.locator("#send-and-exit");
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForFunction(() => {
        const modal = document.getElementById("submit-modal");
        return modal && modal.classList.contains("visible");
      }, { timeout: 5e3 }).catch(() => {
      });
      const confirmBtn = page.locator("#modal-submit");
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await serverExited;
      }
    }
    assert(
      bStdout.includes("Browser E2E test summary") || bStdout.includes("comment with image"),
      "Browser Submit: server output contains submitted data"
    );
    const closeProc = spawn("node", [SERVER_JS, "--no-open", "--port", String(BASE_PORT + 51), TEST_MD], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, REVIW_LOCK_DIR: LOCK_DIR }
    });
    let closeStdout = "";
    let closeResolved = false;
    const closePortDetected = new Promise((resolve, reject) => {
      closeProc.stdout.on("data", (d) => {
        closeStdout += d;
        if (closeResolved) return;
        const match = closeStdout.match(/at http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) {
          closeResolved = true;
          resolve(parseInt(match[1], 10));
        }
      });
      closeProc.stderr.on("data", (d) => closeStdout += d);
      closeProc.on("exit", () => {
        if (!closeResolved) {
          closeResolved = true;
          reject(new Error("Close test server exited before port detected"));
        }
      });
      setTimeout(() => {
        if (!closeResolved) {
          closeResolved = true;
          reject(new Error("Close test server start timed out"));
        }
      }, 1e4);
    });
    const closePort = await closePortDetected;
    await waitForServer(closePort, 5e3);
    const closePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const CLOSE_BASE = `http://127.0.0.1:${closePort}`;
    await closePage.goto(CLOSE_BASE, { waitUntil: "load", timeout: 3e4 });
    await closePage.waitForSelector("#md-preview", { timeout: 1e4 });
    await closePage.reload({ waitUntil: "load", timeout: 3e4 });
    await closePage.waitForSelector("#md-preview", { timeout: 1e4 });
    await sleep(1200);
    const afterReload = await httpGet(closePort, "/healthz");
    assert(afterReload.status === 200, "Browser Close: reload does not terminate the server");
    const draftCell = closePage.locator("td[data-row]").first();
    await draftCell.waitFor({ state: "visible", timeout: 5e3 });
    const draftBox = await draftCell.boundingBox();
    await closePage.mouse.move(draftBox.x + draftBox.width / 2, draftBox.y + draftBox.height / 2);
    await closePage.mouse.down();
    await closePage.mouse.up();
    await closePage.waitForFunction(() => {
      const card = document.getElementById("comment-card");
      return card && getComputedStyle(card).display !== "none";
    }, { timeout: 5e3 });
    await closePage.locator("#comment-input").fill("Close draft comment");
    const closedResult = waitForProcessExit(closeProc, 5e3);
    await closePage.goto("about:blank", { waitUntil: "load", timeout: 3e4 });
    await closePage.close();
    const closed = await closedResult;
    assert(closed.exited === true, "Browser Close: closing the page exits the server quickly");
    assert(closeStdout.includes("Close draft comment"), "Browser Close: closing flushes the in-progress draft");
    await browser.close();
    try {
      browserProc.kill("SIGKILL");
    } catch (_) {
    }
    try {
      closeProc.kill("SIGKILL");
    } catch (_) {
    }
  }
}
try {
  unlinkSync(TEST_MD);
  unlinkSync(TEST_CSV);
  unlinkSync(TEST_STATIC_FILE);
  unlinkSync(TEST_VIDEO_FILE);
} catch (_) {
}
console.log(`
============================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`============================`);
if (failed > 0) process.exit(1);
