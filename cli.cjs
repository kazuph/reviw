#!/usr/bin/env node
/**
 * Lightweight CSV/Text/Markdown viewer with comment collection server
 *
 * Usage:
 *   annotab <file...> [--port 3000] [--encoding utf8|shift_jis|...] [--no-open]
 *
 * Multiple files can be specified. Each file opens on a separate port.
 * Click cells in the browser to add comments.
 * Close the tab or click "Submit & Exit" to send comments to the server.
 * When all files are closed, outputs combined YAML to stdout and exits.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const marked = require('marked');
const yaml = require('js-yaml');

// --- CLI arguments ---------------------------------------------------------
const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: annotab <file...> [--port 3000] [--encoding utf8|shift_jis|...] [--no-open]');
  process.exit(1);
}

const filePaths = [];
let basePort = 3000;
let encodingOpt = null;
let noOpen = false;
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--port' && args[i + 1]) {
    basePort = Number(args[i + 1]);
    i += 1;
  } else if ((arg === '--encoding' || arg === '-e') && args[i + 1]) {
    encodingOpt = args[i + 1];
    i += 1;
  } else if (arg === '--no-open') {
    noOpen = true;
  } else if (!arg.startsWith('-')) {
    filePaths.push(arg);
  }
}

if (!filePaths.length) {
  console.error('Please specify at least one file');
  process.exit(1);
}

// Validate all files exist
const resolvedPaths = [];
for (const fp of filePaths) {
  const resolved = path.resolve(fp);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }
  resolvedPaths.push(resolved);
}

// --- Multi-file state management -------------------------------------------
const allResults = [];
let serversRunning = 0;
let nextPort = basePort;

// --- Simple CSV/TSV parser (RFC4180-style, handles " escaping and newlines) ----
function parseCsv(text, separator = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === separator) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\r') {
      // Ignore CR (for CRLF handling)
    } else {
      field += ch;
    }
  }

  row.push(field);
  rows.push(row);

  // Remove trailing empty row if present
  const last = rows[rows.length - 1];
  if (last && last.every((v) => v === '')) {
    rows.pop();
  }

  return rows;
}

const ENCODING_MAP = {
  'utf-8': 'utf8',
  utf8: 'utf8',
  'shift_jis': 'shift_jis',
  sjis: 'shift_jis',
  'windows-31j': 'cp932',
  cp932: 'cp932',
  'euc-jp': 'euc-jp',
  'iso-8859-1': 'latin1',
  latin1: 'latin1'
};

function normalizeEncoding(name) {
  if (!name) return null;
  const key = String(name).toLowerCase();
  return ENCODING_MAP[key] || null;
}

function decodeBuffer(buf) {
  const specified = normalizeEncoding(encodingOpt);
  let encoding = specified;
  if (!encoding) {
    const detected = chardet.detect(buf) || '';
    encoding = normalizeEncoding(detected) || 'utf8';
    if (encoding !== 'utf8') {
      console.log(`Detected encoding: ${detected} -> ${encoding}`);
    }
  }
  try {
    return iconv.decode(buf, encoding);
  } catch (err) {
    console.warn(`Decode failed (${encoding}): ${err.message}, falling back to utf8`);
    return buf.toString('utf8');
  }
}

function loadCsv(filePath) {
  const raw = fs.readFileSync(filePath);
  const csvText = decodeBuffer(raw);
  const ext = path.extname(filePath).toLowerCase();
  const separator = ext === '.tsv' ? '\t' : ',';
  if (!csvText.includes('\n') && !csvText.includes(separator)) {
    // heuristic: if no newline/separators, still treat as single row
  }
  const rows = parseCsv(csvText, separator);
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return {
    rows,
    cols: Math.max(1, maxCols),
    title: path.basename(filePath)
  };
}

function loadText(filePath) {
  const raw = fs.readFileSync(filePath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);
  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    title: path.basename(filePath),
    preview: null
  };
}

function loadMarkdown(filePath) {
  const raw = fs.readFileSync(filePath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);
  const preview = marked.parse(text, { breaks: true });
  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    title: path.basename(filePath),
    preview
  };
}

function loadData(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv' || ext === '.tsv') {
    const data = loadCsv(filePath);
    return { ...data, mode: 'csv' };
  }
  if (ext === '.md' || ext === '.markdown') {
    const data = loadMarkdown(filePath);
    return { ...data, mode: 'markdown' };
  }
  // default text
  const data = loadText(filePath);
  return { ...data, mode: 'text' };
}

// --- HTML template ---------------------------------------------------------
function htmlTemplate(dataRows, cols, title, mode, previewHtml) {
  const serialized = JSON.stringify(dataRows);
  const modeJson = JSON.stringify(mode);
  const hasPreview = !!previewHtml;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>${title} | annotab</title>
  <style>
    /* Dark theme (default) */
    :root {
      color-scheme: dark;
      --bg: #0f172a;
      --bg-gradient: radial-gradient(circle at 20% 20%, #1e293b 0%, #0b1224 35%, #0b1224 60%, #0f172a 100%);
      --panel: #111827;
      --panel-alpha: rgba(15, 23, 42, 0.9);
      --panel-solid: #0b1224;
      --card-bg: rgba(11, 18, 36, 0.95);
      --input-bg: rgba(15, 23, 42, 0.6);
      --border: #1f2937;
      --accent: #60a5fa;
      --accent-2: #f472b6;
      --text: #e5e7eb;
      --text-inverse: #0b1224;
      --muted: #94a3b8;
      --comment: #0f766e;
      --badge: #22c55e;
      --table-bg: rgba(15, 23, 42, 0.7);
      --row-even: rgba(30, 41, 59, 0.4);
      --row-odd: rgba(15, 23, 42, 0.2);
      --selected-bg: rgba(96,165,250,0.15);
      --hover-bg: rgba(96,165,250,0.08);
      --shadow-color: rgba(0,0,0,0.35);
      --code-bg: #1e293b;
    }
    /* Light theme */
    [data-theme="light"] {
      color-scheme: light;
      --bg: #f8fafc;
      --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      --panel: #ffffff;
      --panel-alpha: rgba(255, 255, 255, 0.95);
      --panel-solid: #ffffff;
      --card-bg: rgba(255, 255, 255, 0.98);
      --input-bg: #f1f5f9;
      --border: #e2e8f0;
      --accent: #3b82f6;
      --accent-2: #ec4899;
      --text: #1e293b;
      --text-inverse: #ffffff;
      --muted: #64748b;
      --comment: #14b8a6;
      --badge: #22c55e;
      --table-bg: #ffffff;
      --row-even: #f8fafc;
      --row-odd: #ffffff;
      --selected-bg: rgba(59,130,246,0.12);
      --hover-bg: rgba(59,130,246,0.06);
      --shadow-color: rgba(0,0,0,0.1);
      --code-bg: #f1f5f9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Inter", "Hiragino Sans", system-ui, -apple-system, sans-serif;
      background: var(--bg-gradient);
      color: var(--text);
      min-height: 100vh;
      transition: background 200ms ease, color 200ms ease;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 5;
      padding: 12px 16px;
      background: var(--panel-alpha);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      transition: background 200ms ease, border-color 200ms ease;
    }
    header .meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    header .actions { display: flex; gap: 8px; align-items: center; }
    header h1 { font-size: 16px; margin: 0; font-weight: 700; }
    header .badge {
      background: var(--selected-bg);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid var(--border);
    }
    header button {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: var(--text-inverse);
      border: none;
      border-radius: 10px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 30px var(--shadow-color);
      transition: transform 120ms ease, box-shadow 120ms ease;
    }
    header button:hover { transform: translateY(-1px); box-shadow: 0 16px 36px var(--shadow-color); }
    header button:active { transform: translateY(0); }
    /* Theme toggle button */
    .theme-toggle {
      background: var(--selected-bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 16px;
      cursor: pointer;
      transition: background 120ms ease, transform 120ms ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
    }
    .theme-toggle:hover { background: var(--hover-bg); transform: scale(1.05); }

    .wrap { padding: 12px 16px 40px; }
    .toolbar {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      margin: 10px 0 12px;
      color: var(--muted);
      font-size: 13px;
    }
    .toolbar button {
      background: rgba(96,165,250,0.12);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13px;
      cursor: pointer;
    }
    .toolbar button:hover { background: rgba(96,165,250,0.2); }

    .table-box {
      background: var(--table-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: auto;
      max-height: calc(100vh - 110px);
      box-shadow: 0 20px 50px var(--shadow-color);
      transition: background 200ms ease, border-color 200ms ease;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      min-width: 540px;
      table-layout: fixed;
    }
    thead th {
      position: sticky;
      top: 0;
      z-index: 3;
      background: var(--panel-solid);
      color: var(--muted);
      font-size: 12px;
      text-align: center;
      padding: 0;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      white-space: nowrap;
      transition: background 200ms ease;
    }
    thead th:first-child,
    tbody th {
      width: 28px;
      min-width: 28px;
      max-width: 28px;
    }
    thead th .th-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 6px;
      position: relative;
      height: 100%;
    }
    thead th.filtered .th-inner {
      background: linear-gradient(135deg, rgba(96,165,250,0.18), rgba(34,197,94,0.18));
      color: #e5e7eb;
      border-radius: 6px;
      box-shadow: inset 0 -1px 0 rgba(255,255,255,0.05);
    }
    thead th.filtered .th-inner::after {
      content: 'FILTER';
      font-size: 10px;
      color: #c7d2fe;
      background: rgba(99,102,241,0.24);
      border: 1px solid rgba(99,102,241,0.45);
      padding: 1px 6px;
      border-radius: 999px;
      position: absolute;
      bottom: 4px;
      right: 6px;
    }
    .resizer {
      position: absolute;
      right: 2px;
      top: 0;
      width: 6px;
      height: 100%;
      cursor: col-resize;
      user-select: none;
      touch-action: none;
      opacity: 0.6;
    }
    .resizer::after {
      content: '';
      position: absolute;
      top: 10%;
      bottom: 10%;
      left: 2px;
      width: 2px;
      background: rgba(96,165,250,0.6);
      border-radius: 2px;
      opacity: 0;
      transition: opacity 120ms ease;
    }
    thead th:hover .resizer::after { opacity: 1; }

    .freeze {
      position: sticky !important;
      background: var(--panel-solid);
      z-index: 4;
    }
    .freeze-row {
      position: sticky !important;
      background: var(--panel-solid);
    }
    .freeze-row.freeze {
      z-index: 6;
    }
    th.freeze-row {
      z-index: 6;
    }
    tbody th {
      position: sticky;
      left: 0;
      z-index: 2;
      background: var(--panel-solid);
      color: var(--muted);
      text-align: right;
      padding: 8px 10px;
      font-size: 12px;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      transition: background 200ms ease;
    }
    td {
      padding: 10px 10px;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      background: var(--row-odd);
      color: var(--text);
      font-size: 13px;
      line-height: 1.45;
      cursor: pointer;
      transition: background 120ms ease, box-shadow 120ms ease;
      position: relative;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 320px;
    }
    tr:nth-child(even) td:not(.selected):not(.has-comment) { background: var(--row-even); }
    td:hover:not(.selected) { background: var(--hover-bg); box-shadow: inset 0 0 0 1px rgba(96,165,250,0.25); }
    td.has-comment { background: rgba(34,197,94,0.12); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.35); }
    td.selected, th.selected, thead th.selected { background: rgba(99,102,241,0.22) !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }
    body.dragging { user-select: none; cursor: crosshair; }
    body.dragging td, body.dragging tbody th { cursor: crosshair; }
    tbody th { cursor: pointer; }
    td .dot {
      position: absolute;
      right: 6px;
      top: 6px;
      width: 8px;
      height: 8px;
      border-radius: 99px;
      background: var(--badge);
      box-shadow: 0 0 0 4px rgba(34,197,94,0.15);
    }
    .floating {
      position: absolute;
      z-index: 10;
      background: var(--panel-solid);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      width: min(420px, calc(100vw - 32px));
      box-shadow: 0 20px 40px var(--shadow-color);
      display: none;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .floating header {
      position: relative;
      top: 0;
      background: transparent;
      border: none;
      padding: 0 0 8px 0;
      justify-content: space-between;
    }
    .floating h2 { font-size: 14px; margin: 0; color: var(--text); }
    .floating button {
      margin-left: 8px;
      background: var(--accent);
      color: var(--text-inverse);
      border: 1px solid var(--accent);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: background 120ms ease, opacity 120ms ease;
    }
    .floating button:hover { opacity: 0.85; }
    .floating textarea {
      width: 100%;
      min-height: 110px;
      resize: vertical;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .floating .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .floating .actions button.primary {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: var(--text-inverse);
      border: none;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(22,163,74,0.35);
    }
    .comment-list {
      position: fixed;
      right: 14px;
      bottom: 14px;
      width: 320px;
      max-height: 60vh;
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--card-bg);
      box-shadow: 0 18px 40px var(--shadow-color);
      padding: 12px;
      backdrop-filter: blur(6px);
      transition: opacity 120ms ease, transform 120ms ease, background 200ms ease;
    }
    .comment-list h3 { margin: 0 0 8px 0; font-size: 13px; color: var(--muted); }
    .comment-list ol {
      margin: 0;
      padding-left: 18px;
      color: var(--text);
      font-size: 13px;
      line-height: 1.45;
    }
    .comment-list li { margin-bottom: 6px; }
    .comment-list .hint { color: var(--muted); font-size: 12px; }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: var(--selected-bg); border: 1px solid var(--border); font-size: 12px; color: var(--text); }
    .pill strong { color: var(--text); font-weight: 700; }
    .comment-list.collapsed {
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px) scale(0.98);
    }
    .comment-toggle {
      position: fixed;
      right: 14px;
      bottom: 14px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--selected-bg);
      color: var(--text);
      cursor: pointer;
      box-shadow: 0 10px 24px var(--shadow-color);
      font-size: 13px;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .md-preview {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .md-layout {
      display: flex;
      gap: 16px;
      align-items: stretch;
      margin-top: 8px;
      height: calc(100vh - 140px);
    }
    .md-left {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .md-left .md-preview {
      max-height: none;
    }
    .md-right {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      overflow-x: auto;
    }
    .md-right .table-box {
      max-width: none;
      min-width: 0;
      max-height: none;
      overflow: visible;
    }
    .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 {
      margin: 0.4em 0 0.2em;
    }
    .md-preview p { margin: 0.3em 0; line-height: 1.5; }
    .md-preview img { max-width: 100%; height: auto; border-radius: 8px; }
    .md-preview code { background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; }
    .md-preview pre {
      background: rgba(255,255,255,0.06);
      padding: 8px 10px;
      border-radius: 8px;
      overflow: auto;
    }
    @media (max-width: 960px) {
      .md-layout { flex-direction: column; }
      .md-left { max-width: 100%; flex: 0 0 auto; }
    }
    .filter-menu {
      position: absolute;
      background: var(--panel-solid);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 14px 30px var(--shadow-color);
      padding: 8px;
      display: none;
      z-index: 12;
      width: 180px;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .filter-menu button {
      width: 100%;
      display: block;
      margin: 4px 0;
      padding: 8px 10px;
      background: var(--selected-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      font-size: 13px;
      text-align: left;
    }
    .filter-menu button:hover { background: var(--hover-bg); }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-overlay.visible { display: flex; }
    .modal-dialog {
      background: var(--panel-solid);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 20px 40px var(--shadow-color);
      transition: background 200ms ease, border-color 200ms ease;
    }
    .modal-dialog h3 { margin: 0 0 12px; font-size: 18px; color: var(--accent); }
    .modal-summary { color: var(--muted); font-size: 13px; margin-bottom: 12px; }
    .modal-dialog label { display: block; font-size: 13px; margin-bottom: 6px; color: var(--muted); }
    .modal-dialog textarea {
      width: 100%;
      min-height: 100px;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      padding: 10px;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .modal-dialog textarea:focus { outline: none; border-color: var(--accent); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
    .modal-actions button {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--selected-bg);
      color: var(--text);
      cursor: pointer;
      font-size: 14px;
    }
    .modal-actions button:hover { background: var(--hover-bg); }
    .modal-actions button.primary { background: var(--accent); color: var(--text-inverse); border-color: var(--accent); }
    .modal-actions button.primary:hover { background: #7dd3fc; }
    @media (max-width: 840px) {
      header { flex-direction: column; align-items: flex-start; }
      .comment-list { width: calc(100% - 24px); right: 12px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="meta">
      <h1>${title}</h1>
      <span class="badge">Click to comment / ESC to cancel</span>
      <span class="pill">Comments <strong id="comment-count">0</strong></span>
    </div>
    <div class="actions">
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">
        <span id="theme-icon">🌙</span>
      </button>
      <button id="send-and-exit">Submit & Exit</button>
    </div>
  </header>

  <div class="wrap">
    ${hasPreview && mode === 'markdown'
      ? `<div class="md-layout">
          <div class="md-left">
            <div class="md-preview">${previewHtml}</div>
          </div>
          <div class="md-right">
            <div class="table-box">
              <table id="csv-table">
                <colgroup id="colgroup"></colgroup>
                <thead>
                  <tr>
                    <th aria-label="row/col corner"></th>
                    ${Array.from({ length: cols }).map((_, i) => `<th data-col="${i + 1}"><div class="th-inner">${mode === 'csv' ? `C${i + 1}` : 'Text'}<span class="resizer" data-col="${i + 1}"></span></div></th>`).join('')}
                  </tr>
                </thead>
                <tbody id="tbody"></tbody>
              </table>
            </div>
          </div>
        </div>`
      : `
        ${hasPreview ? `<div class="md-preview">${previewHtml}</div>` : ''}
        <div class="toolbar">
          <button id="fit-width">Fit to width</button>
          <span>Drag header edge to resize columns</span>
        </div>
        <div class="table-box">
          <table id="csv-table">
            <colgroup id="colgroup"></colgroup>
            <thead>
              <tr>
                <th aria-label="row/col corner"></th>
                ${Array.from({ length: cols }).map((_, i) => `<th data-col="${i + 1}"><div class="th-inner">${mode === 'csv' ? `C${i + 1}` : 'Text'}<span class="resizer" data-col="${i + 1}"></span></div></th>`).join('')}
              </tr>
            </thead>
            <tbody id="tbody"></tbody>
          </table>
        </div>
      `}
  </div>

  <div class="floating" id="comment-card">
    <header>
      <h2 id="card-title">Cell Comment</h2>
      <div style="display:flex; gap:6px;">
        <button id="close-card">Close</button>
        <button id="clear-comment">Delete</button>
      </div>
    </header>
    <div id="cell-preview" style="font-size:12px; color: var(--muted); margin-bottom:8px;"></div>
    <textarea id="comment-input" placeholder="Enter your comment or note"></textarea>
    <div class="actions">
      <button class="primary" id="save-comment">Save</button>
    </div>
  </div>

  <aside class="comment-list">
    <h3>Comments</h3>
    <ol id="comment-list"></ol>
    <p class="hint">Close the tab or click "Submit & Exit" to send comments and stop the server.</p>
  </aside>
  <button class="comment-toggle" id="comment-toggle">Comments (0)</button>
  <div class="filter-menu" id="filter-menu">
    <label class="menu-check"><input type="checkbox" id="freeze-col-check" /> Freeze up to this column</label>
    <button data-action="not-empty">Rows where not empty</button>
    <button data-action="empty">Rows where empty</button>
    <button data-action="contains">Contains...</button>
    <button data-action="not-contains">Does not contain...</button>
    <button data-action="reset">Clear filter</button>
  </div>
  <div class="filter-menu" id="row-menu">
    <label class="menu-check"><input type="checkbox" id="freeze-row-check" /> Freeze up to this row</label>
  </div>

  <div class="modal-overlay" id="recovery-modal">
    <div class="modal-dialog">
      <h3>Previous Comments Found</h3>
      <p class="modal-summary" id="recovery-summary"></p>
      <div class="modal-actions">
        <button id="recovery-discard">Discard</button>
        <button class="primary" id="recovery-restore">Restore</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="submit-modal">
    <div class="modal-dialog">
      <h3>Submit Review</h3>
      <p class="modal-summary" id="modal-summary"></p>
      <label for="global-comment">Overall comment (optional)</label>
      <textarea id="global-comment" placeholder="Add a summary or overall feedback..."></textarea>
      <div class="modal-actions">
        <button id="modal-cancel">Cancel</button>
        <button class="primary" id="modal-submit">Submit</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${serialized};
    const MAX_COLS = ${cols};
    const FILE_NAME = ${JSON.stringify(title)};
    const MODE = ${modeJson};

  // --- Theme Management ---
  (function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function getStoredTheme() {
      return localStorage.getItem('annotab-theme');
    }

    function setTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
      }
      localStorage.setItem('annotab-theme', theme);
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }

    // Initialize theme: use stored preference, or fall back to system preference
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || getSystemTheme();
    setTheme(initialTheme);

    // Listen for system theme changes (only if no stored preference)
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!getStoredTheme()) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    });

    themeToggle.addEventListener('click', toggleTheme);
  })();

  const tbody = document.getElementById('tbody');
  const table = document.getElementById('csv-table');
  const colgroup = document.getElementById('colgroup');
  const card = document.getElementById('comment-card');
  const commentInput = document.getElementById('comment-input');
  const cardTitle = document.getElementById('card-title');
  const cellPreview = document.getElementById('cell-preview');
  const commentList = document.getElementById('comment-list');
  const commentCount = document.getElementById('comment-count');
  const fitBtn = document.getElementById('fit-width');
  const commentPanel = document.querySelector('.comment-list');
  const commentToggle = document.getElementById('comment-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const rowMenu = document.getElementById('row-menu');
  const freezeColCheck = document.getElementById('freeze-col-check');
  const freezeRowCheck = document.getElementById('freeze-row-check');

  const ROW_HEADER_WIDTH = 28;
    const MIN_COL_WIDTH = 80;
    const MAX_COL_WIDTH = 420;
    const DEFAULT_COL_WIDTH = 120;

  let colWidths = Array.from({ length: MAX_COLS }, () => DEFAULT_COL_WIDTH);
  let panelOpen = false;
  let filters = {}; // colIndex -> predicate
  let filterTargetCol = null;
  let freezeCols = 0;
  let freezeRows = 0;
  // Explicitly reset state to prevent stale data on reload
  function resetState() {
    filters = {};
    filterTargetCol = null;
    freezeCols = 0;
    freezeRows = 0;
    panelOpen = false;
    commentPanel.classList.add('collapsed');
    updateFilterIndicators();
    updateStickyOffsets();
    applyFilters();
  }

    // --- Hot reload (SSE) ---------------------------------------------------
    (() => {
      let es = null;
      const connect = () => {
        es = new EventSource('/sse');
        es.onmessage = (ev) => {
          if (ev.data === 'reload') {
            location.reload();
          }
        };
        es.onerror = () => {
          es.close();
          setTimeout(connect, 1500);
        };
      };
      connect();
    })();
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) location.reload();
    });

    const comments = {}; // key: "r-c" -> {row, col, text, value} or "r1-c1:r2-c2" for ranges
    let currentKey = null;
    // Drag selection state
    let isDragging = false;
    let dragStart = null; // {row, col}
    let dragEnd = null;   // {row, col}
    let selection = null; // {startRow, endRow, startCol, endCol}

    // --- localStorage Comment Persistence ---
    const STORAGE_KEY = 'annotab:comments:' + FILE_NAME;
    const STORAGE_TTL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    function saveCommentsToStorage() {
      const data = {
        comments: { ...comments },
        timestamp: Date.now()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('Failed to save comments to localStorage:', e);
      }
    }

    function loadCommentsFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        // Check TTL
        if (Date.now() - data.timestamp > STORAGE_TTL) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return data;
      } catch (e) {
        console.warn('Failed to load comments from localStorage:', e);
        return null;
      }
    }

    function clearCommentsFromStorage() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear comments from localStorage:', e);
      }
    }

    function getTimeAgo(timestamp) {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'just now';
      if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
      const hours = Math.floor(minutes / 60);
      return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"]/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s] || s));
    }

    function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

    function syncColgroup() {
      colgroup.innerHTML = '';
      const corner = document.createElement('col');
      corner.style.width = ROW_HEADER_WIDTH + 'px';
      colgroup.appendChild(corner);
      colWidths.forEach((w) => {
        const c = document.createElement('col');
        c.style.width = w + 'px';
        colgroup.appendChild(c);
      });
    }

    function clearSelection() {
      tbody.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      selection = null;
    }

    function updateSelectionVisual() {
      document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
      if (!selection) return;
      const { startRow, endRow, startCol, endCol } = selection;
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          const td = tbody.querySelector('td[data-row="' + r + '"][data-col="' + c + '"]');
          if (td) td.classList.add('selected');
        }
        // Also highlight row header
        const th = tbody.querySelector('tr:nth-child(' + r + ') th');
        if (th) th.classList.add('selected');
      }
      // Also highlight column headers
      for (let c = startCol; c <= endCol; c++) {
        const colHeader = document.querySelector('thead th[data-col="' + c + '"]');
        if (colHeader) colHeader.classList.add('selected');
      }
    }

    function computeSelection(start, end) {
      return {
        startRow: Math.min(start.row, end.row),
        endRow: Math.max(start.row, end.row),
        startCol: Math.min(start.col, end.col),
        endCol: Math.max(start.col, end.col)
      };
    }

    function renderTable() {
      const frag = document.createDocumentFragment();
      DATA.forEach((row, rIdx) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = rIdx + 1;
        tr.appendChild(th);
        for (let c = 0; c < MAX_COLS; c += 1) {
          const td = document.createElement('td');
          const val = row[c] || '';
          td.dataset.row = rIdx + 1;
          td.dataset.col = c + 1;
          td.textContent = val;
          tr.appendChild(td);
        }
        frag.appendChild(tr);
      });
      tbody.appendChild(frag);
      // Narrow column width for single-column text/Markdown
      if (MODE !== 'csv' && MAX_COLS === 1) {
        colWidths[0] = 240;
        syncColgroup();
      }
      attachDragHandlers();
    }

    function attachDragHandlers() {
      tbody.addEventListener('mousedown', (e) => {
        const td = e.target.closest('td');
        const th = e.target.closest('tbody th');

        if (td) {
          // Clicked on a cell
          e.preventDefault();
          isDragging = true;
          document.body.classList.add('dragging');
          dragStart = { row: Number(td.dataset.row), col: Number(td.dataset.col) };
          dragEnd = { ...dragStart };
          selection = computeSelection(dragStart, dragEnd);
          updateSelectionVisual();
        } else if (th) {
          // Clicked on row header - select entire row
          e.preventDefault();
          isDragging = true;
          document.body.classList.add('dragging');
          const row = Number(th.textContent);
          dragStart = { row, col: 1, isRowSelect: true };
          dragEnd = { row, col: MAX_COLS };
          selection = computeSelection(dragStart, dragEnd);
          updateSelectionVisual();
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const td = el?.closest('td');
        const th = el?.closest('tbody th');

        if (td && td.dataset.row && td.dataset.col) {
          if (dragStart.isRowSelect) {
            // Started from row header, extend row selection
            dragEnd = { row: Number(td.dataset.row), col: MAX_COLS };
          } else {
            dragEnd = { row: Number(td.dataset.row), col: Number(td.dataset.col) };
          }
          selection = computeSelection(dragStart, dragEnd);
          updateSelectionVisual();
        } else if (th) {
          // Moving over row header
          const row = Number(th.textContent);
          if (dragStart.isRowSelect) {
            dragEnd = { row, col: MAX_COLS };
          } else {
            dragEnd = { row, col: dragEnd.col };
          }
          selection = computeSelection(dragStart, dragEnd);
          updateSelectionVisual();
        }
      });

      document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('dragging');
        if (selection) {
          openCardForSelection();
        }
      });
    }

    function openCardForSelection() {
      if (!selection) return;
      const { startRow, endRow, startCol, endCol } = selection;
      const isSingleCell = startRow === endRow && startCol === endCol;

      if (isSingleCell) {
        // Single cell - use simple key
        currentKey = startRow + '-' + startCol;
        cardTitle.textContent = 'Comment on R' + startRow + ' C' + startCol;
        const td = tbody.querySelector('td[data-row="' + startRow + '"][data-col="' + startCol + '"]');
        cellPreview.textContent = td ? 'Cell value: ' + (td.textContent || '(empty)') : '';
      } else {
        // Range selection
        currentKey = startRow + '-' + startCol + ':' + endRow + '-' + endCol;
        const rowCount = endRow - startRow + 1;
        const colCount = endCol - startCol + 1;
        if (startCol === endCol) {
          cardTitle.textContent = 'Comment on R' + startRow + '-R' + endRow + ' C' + startCol;
          cellPreview.textContent = 'Selected ' + rowCount + ' rows';
        } else if (startRow === endRow) {
          cardTitle.textContent = 'Comment on R' + startRow + ' C' + startCol + '-C' + endCol;
          cellPreview.textContent = 'Selected ' + colCount + ' columns';
        } else {
          cardTitle.textContent = 'Comment on R' + startRow + '-R' + endRow + ' C' + startCol + '-C' + endCol;
          cellPreview.textContent = 'Selected ' + rowCount + ' x ' + colCount + ' cells';
        }
      }

      const existingComment = comments[currentKey];
      commentInput.value = existingComment?.text || '';

      card.style.display = 'block';
      positionCardForSelection(startRow, endRow, startCol, endCol);
      commentInput.focus();
    }

    function positionCardForSelection(startRow, endRow, startCol, endCol) {
      const cardWidth = card.offsetWidth || 380;
      const cardHeight = card.offsetHeight || 220;
      // Calculate bounding rect for entire selection
      const topLeftTd = tbody.querySelector('td[data-row="' + startRow + '"][data-col="' + startCol + '"]');
      const bottomRightTd = tbody.querySelector('td[data-row="' + endRow + '"][data-col="' + endCol + '"]');
      if (!topLeftTd) return;

      const topLeftRect = topLeftTd.getBoundingClientRect();
      const bottomRightRect = bottomRightTd ? bottomRightTd.getBoundingClientRect() : topLeftRect;

      // Combined bounding rect for the selection
      const rect = {
        left: topLeftRect.left,
        top: topLeftRect.top,
        right: bottomRightRect.right,
        bottom: bottomRightRect.bottom
      };
      const margin = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      const spaceRight = vw - rect.right - margin;
      const spaceLeft = rect.left - margin - ROW_HEADER_WIDTH; // Account for row header
      const spaceBelow = vh - rect.bottom - margin;
      const spaceAbove = rect.top - margin;

      // Minimum left position to avoid covering row header
      const minLeft = ROW_HEADER_WIDTH + margin;

      let left = sx + rect.right + margin;
      let top = sy + rect.top;

      // Priority: right > below > above > left > fallback right
      if (spaceRight >= cardWidth) {
        // Prefer right side of selection
        left = sx + rect.right + margin;
        top = sy + clamp(rect.top, margin, vh - cardHeight - margin);
      } else if (spaceBelow >= cardHeight) {
        left = sx + clamp(rect.left, minLeft, vw - cardWidth - margin);
        top = sy + rect.bottom + margin;
      } else if (spaceAbove >= cardHeight) {
        left = sx + clamp(rect.left, minLeft, vw - cardWidth - margin);
        top = sy + rect.top - cardHeight - margin;
      } else if (spaceLeft >= cardWidth) {
        left = sx + rect.left - cardWidth - margin;
        top = sy + clamp(rect.top, margin, vh - cardHeight - margin);
      } else {
        // Fallback: place to right side even if it means going off screen
        // Position card at right edge of selection, clamped to viewport
        left = sx + Math.max(rect.right + margin, minLeft);
        left = Math.min(left, sx + vw - cardWidth - margin);
        top = sy + clamp(rect.top, margin, vh - cardHeight - margin);
      }

      card.style.left = left + 'px';
      card.style.top = top + 'px';
    }

    function closeCard() {
      card.style.display = 'none';
      currentKey = null;
      clearSelection();
    }

    function setDot(row, col, on) {
      const td = tbody.querySelector('td[data-row="' + row + '"][data-col="' + col + '"]');
      if (!td) return;
      if (on) {
        td.classList.add('has-comment');
        if (!td.querySelector('.dot')) {
          const dot = document.createElement('span');
          dot.className = 'dot';
          td.appendChild(dot);
        }
      } else {
        td.classList.remove('has-comment');
        const dot = td.querySelector('.dot');
        if (dot) dot.remove();
      }
    }

    function refreshList() {
      commentList.innerHTML = '';
      const items = Object.values(comments).sort((a, b) => {
        const aRow = a.isRange ? a.startRow : a.row;
        const bRow = b.isRange ? b.startRow : b.row;
        const aCol = a.isRange ? a.startCol : a.col;
        const bCol = b.isRange ? b.startCol : b.col;
        return aRow === bRow ? aCol - bCol : aRow - bRow;
      });
      commentCount.textContent = items.length;
      commentToggle.textContent = 'Comments (' + items.length + ')';
      if (items.length === 0) {
        panelOpen = false;
      }
      commentPanel.classList.toggle('collapsed', !panelOpen || items.length === 0);
      if (!items.length) {
        const li = document.createElement('li');
        li.className = 'hint';
        li.textContent = 'No comments yet';
        commentList.appendChild(li);
        return;
      }
      items.forEach((c) => {
        const li = document.createElement('li');
        if (c.isRange) {
          // Format range label
          let label;
          if (c.startCol === c.endCol) {
            label = 'R' + c.startRow + '-R' + c.endRow + ' C' + c.startCol;
          } else if (c.startRow === c.endRow) {
            label = 'R' + c.startRow + ' C' + c.startCol + '-C' + c.endCol;
          } else {
            label = 'R' + c.startRow + '-R' + c.endRow + ' C' + c.startCol + '-C' + c.endCol;
          }
          li.innerHTML = '<strong>' + label + '</strong> ' + escapeHtml(c.text);
          li.addEventListener('click', () => {
            selection = { startRow: c.startRow, endRow: c.endRow, startCol: c.startCol, endCol: c.endCol };
            updateSelectionVisual();
            openCardForSelection();
          });
        } else {
          li.innerHTML = '<strong>R' + c.row + ' C' + c.col + '</strong> ' + escapeHtml(c.text);
          li.addEventListener('click', () => {
            selection = { startRow: c.row, endRow: c.row, startCol: c.col, endCol: c.col };
            updateSelectionVisual();
            openCardForSelection();
          });
        }
        commentList.appendChild(li);
      });
    }

    commentToggle.addEventListener('click', () => {
      panelOpen = !panelOpen;
      if (panelOpen && Object.keys(comments).length === 0) {
        panelOpen = false; // keep hidden if no comments
      }
      commentPanel.classList.toggle('collapsed', !panelOpen);
    });

    function updateFilterIndicators() {
      const headCells = document.querySelectorAll('thead th[data-col]');
      headCells.forEach((th, idx) => {
        const active = !!filters[idx];
        th.classList.toggle('filtered', active);
      });
    }

    // --- Filter -----------------------------------------------------------
    function closeFilterMenu() {
      filterMenu.style.display = 'none';
      filterTargetCol = null;
    }
    function openFilterMenu(col, anchorRect) {
      filterTargetCol = col;
      const margin = 8;
      const vw = window.innerWidth;
      const sx = window.scrollX;
      const sy = window.scrollY;
      const menuWidth = 200;
      const menuHeight = 260;
      let left = sx + clamp(anchorRect.left, margin, vw - menuWidth - margin);
      let top = sy + anchorRect.bottom + margin;
      filterMenu.style.left = left + 'px';
      filterMenu.style.top = top + 'px';
      filterMenu.style.display = 'block';
      freezeColCheck.checked = (freezeCols === col + 1);
    }

    function applyFilters() {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach((tr, rIdx) => {
        const visible = Object.entries(filters).every(([c, fn]) => {
          const val = DATA[rIdx]?.[Number(c)] || '';
          try { return fn(val); } catch (_) { return true; }
        });
        tr.style.display = visible ? '' : 'none';
      });
      updateStickyOffsets();
      updateFilterIndicators();
    }

    filterMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (!action || filterTargetCol == null) return;
      const col = filterTargetCol;
      if (action === 'not-empty') {
        filters[col] = (v) => (v ?? '').trim() !== '';
      } else if (action === 'empty') {
        filters[col] = (v) => (v ?? '').trim() === '';
      } else if (action === 'contains' || action === 'not-contains') {
        const keyword = prompt('Enter the text to filter by');
        if (keyword == null || keyword === '') { closeFilterMenu(); return; }
        const lower = keyword.toLowerCase();
        if (action === 'contains') {
          filters[col] = (v) => (v ?? '').toLowerCase().includes(lower);
        } else {
          filters[col] = (v) => !(v ?? '').toLowerCase().includes(lower);
        }
      } else if (action === 'reset') {
        delete filters[col];
      }
      closeFilterMenu();
      applyFilters();
      updateFilterIndicators();
    });

    freezeColCheck.addEventListener('change', () => {
      if (filterTargetCol == null) return;
      freezeCols = freezeColCheck.checked ? filterTargetCol + 1 : 0;
      updateStickyOffsets();
    });

    document.addEventListener('click', (e) => {
      if (filterMenu.style.display === 'block' && !filterMenu.contains(e.target)) {
        closeFilterMenu();
      }
    });

    // --- Row Menu (Freeze Row) ---------------------------------------------
    function closeRowMenu() {
      rowMenu.style.display = 'none';
      rowMenu.dataset.row = '';
    }
    function openRowMenu(row, anchorRect) {
      rowMenu.dataset.row = String(row);
      freezeRowCheck.checked = (freezeRows === row);
      const margin = 8;
      const vw = window.innerWidth;
      const sx = window.scrollX;
      const sy = window.scrollY;
      const menuWidth = 180;
      const menuHeight = 80;
      let left = sx + clamp(anchorRect.left, margin, vw - menuWidth - margin);
      let top = sy + anchorRect.bottom + margin;
      rowMenu.style.left = left + 'px';
      rowMenu.style.top = top + 'px';
      rowMenu.style.display = 'block';
    }
    freezeRowCheck.addEventListener('change', () => {
      const r = Number(rowMenu.dataset.row || 0);
      freezeRows = freezeRowCheck.checked ? r : 0;
      updateStickyOffsets();
    });
    document.addEventListener('click', (e) => {
      if (rowMenu.style.display === 'block' && !rowMenu.contains(e.target) && !(e.target.dataset && e.target.dataset.rowHeader)) {
        closeRowMenu();
      }
    });

    function isRangeKey(key) {
      return key && key.includes(':');
    }

    function parseRangeKey(key) {
      // Format: "startRow-startCol:endRow-endCol"
      const [start, end] = key.split(':');
      const [startRow, startCol] = start.split('-').map(Number);
      const [endRow, endCol] = end.split('-').map(Number);
      return { startRow, startCol, endRow, endCol };
    }

    function saveCurrent() {
      if (!currentKey) return;
      const text = commentInput.value.trim();

      if (isRangeKey(currentKey)) {
        // Range (rectangular) comment
        const { startRow, startCol, endRow, endCol } = parseRangeKey(currentKey);
        if (text) {
          comments[currentKey] = { startRow, startCol, endRow, endCol, text, isRange: true };
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              setDot(r, c, true);
            }
          }
        } else {
          delete comments[currentKey];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              const singleKey = r + '-' + c;
              if (!comments[singleKey]) {
                setDot(r, c, false);
              }
            }
          }
        }
      } else {
        // Single cell comment
        const [row, col] = currentKey.split('-').map(Number);
        const td = tbody.querySelector('td[data-row="' + row + '"][data-col="' + col + '"]');
        const value = td ? td.textContent : '';
        if (text) {
          comments[currentKey] = { row, col, text, value };
          setDot(row, col, true);
        } else {
          delete comments[currentKey];
          setDot(row, col, false);
        }
      }
      refreshList();
      closeCard();
      saveCommentsToStorage();
    }

    function clearCurrent() {
      if (!currentKey) return;

      if (isRangeKey(currentKey)) {
        const { startRow, startCol, endRow, endCol } = parseRangeKey(currentKey);
        delete comments[currentKey];
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const singleKey = r + '-' + c;
            if (!comments[singleKey]) {
              setDot(r, c, false);
            }
          }
        }
      } else {
        const [row, col] = currentKey.split('-').map(Number);
        delete comments[currentKey];
        setDot(row, col, false);
      }
      refreshList();
      closeCard();
      saveCommentsToStorage();
    }

    document.getElementById('save-comment').addEventListener('click', saveCurrent);
    document.getElementById('clear-comment').addEventListener('click', clearCurrent);
    document.getElementById('close-card').addEventListener('click', closeCard);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCard();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveCurrent();
    });

    // --- Column Resize -----------------------------------------------------
    function startResize(colIdx, event) {
      event.preventDefault();
      const startX = event.clientX;
      const startW = colWidths[colIdx - 1];
      function onMove(e) {
        const next = clamp(startW + (e.clientX - startX), MIN_COL_WIDTH, MAX_COL_WIDTH);
        colWidths[colIdx - 1] = next;
        syncColgroup();
        updateStickyOffsets();
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    function attachResizers() {
      document.querySelectorAll('.resizer').forEach((r) => {
        r.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          startResize(Number(r.dataset.col), e);
        });
      });
      document.querySelectorAll('thead th .th-inner').forEach((h) => {
        h.addEventListener('click', (e) => {
          const col = Number(h.parentElement.dataset.col);
          const rect = h.getBoundingClientRect();
          openFilterMenu(col - 1, rect);
          e.stopPropagation();
        });
      });
      // Click on row header (row number) to open freeze row menu
      tbody.querySelectorAll('th').forEach((th) => {
        th.dataset.rowHeader = '1';
        th.addEventListener('click', (e) => {
          const row = Number(th.textContent);
          const rect = th.getBoundingClientRect();
          openRowMenu(row, rect);
          e.stopPropagation();
        });
      });
    }

    // --- Freeze Columns/Rows -----------------------------------------------
    function updateStickyOffsets() {
      freezeCols = Number(freezeCols || 0);
      freezeRows = Number(freezeRows || 0);

      // columns
      const headCells = document.querySelectorAll('thead th[data-col]');
      let hLeft = ROW_HEADER_WIDTH;
      headCells.forEach((th, idx) => {
        if (idx < freezeCols) {
          th.classList.add('freeze');
          th.style.left = hLeft + 'px';
          hLeft += colWidths[idx];
        } else {
          th.classList.remove('freeze');
          th.style.left = null;
        }
      });

      // rows top offsets
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const headHeight = document.querySelector('thead').offsetHeight || 0;
      let accumTop = headHeight;
      rows.forEach((tr, rIdx) => {
        const isFrozen = rIdx < freezeRows;
        const rowTop = accumTop;
        const cells = Array.from(tr.children);
        cells.forEach((cell, cIdx) => {
          if (isFrozen) {
            cell.classList.add('freeze-row');
            cell.style.top = rowTop + 'px';
            // z-index handling for intersections
            if (cell.classList.contains('freeze')) {
              cell.style.zIndex = 7;
            } else if (cell.tagName === 'TH') {
              cell.style.zIndex = 6;
            } else {
              cell.style.zIndex = 5;
            }
          } else {
            cell.classList.remove('freeze-row');
            cell.style.top = null;
            if (!cell.classList.contains('freeze')) {
              cell.style.zIndex = null;
            }
          }
          // left offsets for frozen cols inside rows
          if (cIdx > 0) {
            const colIdx = cIdx - 1;
            if (colIdx < freezeCols) {
              cell.classList.add('freeze');
              const left = ROW_HEADER_WIDTH + colWidths.slice(0, colIdx).reduce((a, b) => a + b, 0);
              cell.style.left = left + 'px';
            } else {
              cell.classList.remove('freeze');
              cell.style.left = null;
            }
          }
        });
        accumTop += tr.offsetHeight;
      });
    }
    // --- Fit to Width ------------------------------------------------------
    function fitToWidth() {
      const box = document.querySelector('.table-box');
      const available = box.clientWidth - ROW_HEADER_WIDTH - 24;
      const sum = colWidths.reduce((a, b) => a + b, 0);
      if (sum === 0 || available <= 0) return;
      const scale = clamp(available / sum, 0.4, 2);
      colWidths = colWidths.map((w) => clamp(Math.round(w * scale), MIN_COL_WIDTH, MAX_COL_WIDTH));
      syncColgroup();
      updateStickyOffsets();
    }
    if (fitBtn) fitBtn.addEventListener('click', fitToWidth);

    // --- Submit & Exit -----------------------------------------------------
    let sent = false;
    let globalComment = '';
    const submitModal = document.getElementById('submit-modal');
    const modalSummary = document.getElementById('modal-summary');
    const globalCommentInput = document.getElementById('global-comment');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSubmit = document.getElementById('modal-submit');

    function payload(reason) {
      const data = {
        file: FILE_NAME,
        mode: MODE,
        reason,
        at: new Date().toISOString(),
        comments: Object.values(comments)
      };
      if (globalComment.trim()) {
        data.summary = globalComment.trim();
      }
      return data;
    }
    function sendAndExit(reason = 'pagehide') {
      if (sent) return;
      sent = true;
      clearCommentsFromStorage();
      const blob = new Blob([JSON.stringify(payload(reason))], { type: 'application/json' });
      navigator.sendBeacon('/exit', blob);
    }
    function showSubmitModal() {
      const count = Object.keys(comments).length;
      modalSummary.textContent = count === 0
        ? 'No comments added yet.'
        : count === 1 ? '1 comment will be submitted.' : count + ' comments will be submitted.';
      globalCommentInput.value = globalComment;
      submitModal.classList.add('visible');
      globalCommentInput.focus();
    }
    function hideSubmitModal() {
      submitModal.classList.remove('visible');
    }
    document.getElementById('send-and-exit').addEventListener('click', showSubmitModal);
    modalCancel.addEventListener('click', hideSubmitModal);
    function doSubmit() {
      globalComment = globalCommentInput.value;
      hideSubmitModal();
      sendAndExit('button');
      setTimeout(() => window.close(), 200);
    }
    modalSubmit.addEventListener('click', doSubmit);
    globalCommentInput.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        doSubmit();
      }
    });
    submitModal.addEventListener('click', (e) => {
      if (e.target === submitModal) hideSubmitModal();
    });
    // Note: We no longer auto-submit on page close/reload.
    // Users must explicitly click "Submit & Exit" to save comments.
    // This allows page refresh without losing the server connection.

    syncColgroup();
    renderTable();
    attachResizers();
    updateStickyOffsets();
    updateFilterIndicators();
    refreshList();
    resetState();

    // --- Comment Recovery from localStorage ---
    (function checkRecovery() {
      const stored = loadCommentsFromStorage();
      if (!stored || Object.keys(stored.comments).length === 0) return;

      const recoveryModal = document.getElementById('recovery-modal');
      const recoverySummary = document.getElementById('recovery-summary');
      const recoveryDiscard = document.getElementById('recovery-discard');
      const recoveryRestore = document.getElementById('recovery-restore');

      const count = Object.keys(stored.comments).length;
      const timeAgo = getTimeAgo(stored.timestamp);
      recoverySummary.textContent = count + ' comment' + (count === 1 ? '' : 's') + ' from ' + timeAgo;

      recoveryModal.classList.add('visible');

      function hideRecoveryModal() {
        recoveryModal.classList.remove('visible');
      }

      recoveryDiscard.addEventListener('click', () => {
        clearCommentsFromStorage();
        hideRecoveryModal();
      });

      recoveryRestore.addEventListener('click', () => {
        // Restore comments
        Object.assign(comments, stored.comments);
        // Update dots and list
        Object.values(stored.comments).forEach(c => {
          if (c.isRange) {
            for (let r = c.startRow; r <= c.endRow; r++) {
              for (let col = c.startCol; col <= c.endCol; col++) {
                setDot(r, col, true);
              }
            }
          } else {
            setDot(c.row, c.col, true);
          }
        });
        refreshList();
        hideRecoveryModal();
      });

      recoveryModal.addEventListener('click', (e) => {
        if (e.target === recoveryModal) {
          clearCommentsFromStorage();
          hideRecoveryModal();
        }
      });
    })();

    // --- Scroll Sync for Markdown Mode ---
    if (MODE === 'markdown') {
      const mdLeft = document.querySelector('.md-left');
      const mdRight = document.querySelector('.md-right');
      if (mdLeft && mdRight) {
        let activePane = null;
        let rafId = null;

        function syncScroll(source, target, sourceName) {
          // Only sync if this pane initiated the scroll
          if (activePane && activePane !== sourceName) return;
          activePane = sourceName;

          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const sourceMax = source.scrollHeight - source.clientHeight;
            const targetMax = target.scrollHeight - target.clientHeight;

            if (sourceMax <= 0 || targetMax <= 0) return;

            // Snap to edges for precision
            if (source.scrollTop <= 1) {
              target.scrollTop = 0;
            } else if (source.scrollTop >= sourceMax - 1) {
              target.scrollTop = targetMax;
            } else {
              const ratio = source.scrollTop / sourceMax;
              target.scrollTop = Math.round(ratio * targetMax);
            }

            // Release lock after scroll settles
            setTimeout(() => { activePane = null; }, 100);
          });
        }

        mdLeft.addEventListener('scroll', () => syncScroll(mdLeft, mdRight, 'left'), { passive: true });
        mdRight.addEventListener('scroll', () => syncScroll(mdRight, mdLeft, 'right'), { passive: true });
      }
    }
  </script>
</body>
</html>`;
}

function buildHtml(filePath) {
  const { rows, cols, title, mode, preview } = loadData(filePath);
  return htmlTemplate(rows, cols, title, mode, preview);
}

// --- HTTP Server -----------------------------------------------------------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const MAX_PORT_ATTEMPTS = 100;
const activeServers = new Map();

function outputAllResults() {
  console.log('=== All comments received ===');
  if (allResults.length === 1) {
    const yamlOut = yaml.dump(allResults[0], { noRefs: true, lineWidth: 120 });
    console.log(yamlOut.trim());
  } else {
    const combined = { files: allResults };
    const yamlOut = yaml.dump(combined, { noRefs: true, lineWidth: 120 });
    console.log(yamlOut.trim());
  }
}

function checkAllDone() {
  if (serversRunning === 0) {
    outputAllResults();
    process.exit(0);
  }
}

function shutdownAll() {
  for (const ctx of activeServers.values()) {
    if (ctx.watcher) ctx.watcher.close();
    if (ctx.heartbeat) clearInterval(ctx.heartbeat);
    ctx.sseClients.forEach((res) => { try { res.end(); } catch (_) {} });
    if (ctx.server) ctx.server.close();
  }
  outputAllResults();
  setTimeout(() => process.exit(0), 500).unref();
}

process.on('SIGINT', shutdownAll);
process.on('SIGTERM', shutdownAll);

function createFileServer(filePath) {
  return new Promise((resolve) => {
    const baseName = path.basename(filePath);
    const baseDir = path.dirname(filePath);

    const ctx = {
      filePath,
      baseName,
      baseDir,
      sseClients: new Set(),
      watcher: null,
      heartbeat: null,
      reloadTimer: null,
      server: null,
      opened: false,
      port: 0
    };

    function broadcast(data) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      ctx.sseClients.forEach((res) => {
        try { res.write(`data: ${payload}\n\n`); } catch (_) {}
      });
    }

    function notifyReload() {
      clearTimeout(ctx.reloadTimer);
      ctx.reloadTimer = setTimeout(() => broadcast('reload'), 150);
    }

    function startWatcher() {
      try {
        ctx.watcher = fs.watch(filePath, { persistent: true }, notifyReload);
      } catch (err) {
        console.warn(`Failed to start file watcher for ${baseName}:`, err);
      }
      ctx.heartbeat = setInterval(() => broadcast('ping'), 25000);
    }

    function shutdownServer(result) {
      if (ctx.watcher) {
        ctx.watcher.close();
        ctx.watcher = null;
      }
      if (ctx.heartbeat) {
        clearInterval(ctx.heartbeat);
        ctx.heartbeat = null;
      }
      ctx.sseClients.forEach((res) => { try { res.end(); } catch (_) {} });
      if (ctx.server) {
        ctx.server.close();
        ctx.server = null;
      }
      activeServers.delete(filePath);
      if (result) allResults.push(result);
      serversRunning--;
      console.log(`Server for ${baseName} closed. (${serversRunning} remaining)`);
      checkAllDone();
    }

    ctx.server = http.createServer(async (req, res) => {
      if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        try {
          const html = buildHtml(filePath);
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          });
          res.end(html);
        } catch (err) {
          console.error('File load error', err);
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Failed to load file. Please check the file.');
        }
        return;
      }

      if (req.method === 'GET' && req.url === '/healthz') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
        return;
      }

      if (req.method === 'POST' && req.url === '/exit') {
        try {
          const raw = await readBody(req);
          let payload = {};
          if (raw && raw.trim()) {
            payload = JSON.parse(raw);
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('bye');
          shutdownServer(payload);
        } catch (err) {
          console.error('payload parse error', err);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('bad request');
          shutdownServer(null);
        }
        return;
      }

      if (req.method === 'GET' && req.url === '/sse') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no'
        });
        res.write('retry: 3000\n\n');
        ctx.sseClients.add(res);
        req.on('close', () => ctx.sseClients.delete(res));
        return;
      }

      // Static file serving for images and other assets
      if (req.method === 'GET') {
        const MIME_TYPES = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.pdf': 'application/pdf',
        };
        try {
          const urlPath = decodeURIComponent(req.url.split('?')[0]);
          if (urlPath.includes('..')) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('forbidden');
            return;
          }
          const staticPath = path.join(baseDir, urlPath);
          if (!staticPath.startsWith(baseDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('forbidden');
            return;
          }
          if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
            const ext = path.extname(staticPath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            const content = fs.readFileSync(staticPath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
            return;
          }
        } catch (err) {
          // fall through to 404
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
    });

    function tryListen(attemptPort, attempts = 0) {
      if (attempts >= MAX_PORT_ATTEMPTS) {
        console.error(`Could not find an available port for ${baseName} after ${MAX_PORT_ATTEMPTS} attempts.`);
        serversRunning--;
        checkAllDone();
        return;
      }

      ctx.server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          tryListen(attemptPort + 1, attempts + 1);
        } else {
          console.error(`Server error for ${baseName}:`, err);
          serversRunning--;
          checkAllDone();
        }
      });

      ctx.server.listen(attemptPort, () => {
        ctx.port = attemptPort;
        nextPort = attemptPort + 1;
        activeServers.set(filePath, ctx);
        console.log(`Viewer started: http://localhost:${attemptPort}  (file: ${baseName})`);
        if (!noOpen) {
          const url = `http://localhost:${attemptPort}`;
          const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
          try {
            spawn(opener, [url], { stdio: 'ignore', detached: true });
          } catch (err) {
            console.warn('Failed to open browser automatically. Please open this URL manually:', url);
          }
        }
        startWatcher();
        resolve(ctx);
      });
    }

    tryListen(nextPort);
  });
}

// Start all servers
console.log(`Starting servers for ${resolvedPaths.length} file(s)...`);
serversRunning = resolvedPaths.length;

(async () => {
  for (const filePath of resolvedPaths) {
    await createFileServer(filePath);
  }
  console.log('Close all browser tabs or Submit & Exit to finish.');
})();
