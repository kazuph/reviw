#!/usr/bin/env node
/**
 * 軽量CSVビューア＋コメント収集サーバー
 *
 * 使い方:
 *   annotab <ファイルパス> [--port 3000] [--encoding utf8|shift_jis|...]
 *
 * ブラウザでセルをクリックしてコメントを付ける。
 * タブを閉じる、または「コメント送信して終了」ボタンを押すと
 * navigator.sendBeacon でコメントがサーバーへ送られ、標準出力へ
 * 座標とコメントが出たあとプロセスが終了する（出力はYAML）。
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const chardet = require('chardet');
const iconv = require('iconv-lite');
const marked = require('marked');
const yaml = require('js-yaml');

// --- CLI引数 ---------------------------------------------------------------
const args = process.argv.slice(2);
if (!args.length) {
  console.error('使い方: annotab <ファイル> [--port 3000] [--encoding utf8|shift_jis|...]');
  process.exit(1);
}

let csvPath = null;
let port = 3000;
let encodingOpt = null;
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--port' && args[i + 1]) {
    port = Number(args[i + 1]);
    i += 1;
  } else if ((arg === '--encoding' || arg === '-e') && args[i + 1]) {
    encodingOpt = args[i + 1];
    i += 1;
  } else if (!csvPath) {
    csvPath = arg;
  }
}

if (!csvPath) {
  console.error('CSVファイルを指定してください');
  process.exit(1);
}

const resolvedPath = path.resolve(csvPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`ファイルが見つかりません: ${resolvedPath}`);
  process.exit(1);
}

// --- シンプルCSVパーサ（RFC4180風、"エスケープと改行対応） -----------------
function parseCsv(text) {
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
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (ch === '\r') {
      // CRは無視（CRLF対策）
    } else {
      field += ch;
    }
  }

  row.push(field);
  rows.push(row);

  // 末尾が完全に空行なら削る
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
      console.log(`推定エンコーディング: ${detected} -> ${encoding}`);
    }
  }
  try {
    return iconv.decode(buf, encoding);
  } catch (err) {
    console.warn(`decode失敗 (${encoding}): ${err.message}, utf8にフォールバックします`);
    return buf.toString('utf8');
  }
}

function loadCsv() {
  const raw = fs.readFileSync(resolvedPath);
  const csvText = decodeBuffer(raw);
  if (!csvText.includes('\n') && !csvText.includes(',')) {
    // heuristic: if no newline/commas, still treat as single row
  }
  const rows = parseCsv(csvText);
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return {
    rows,
    cols: Math.max(1, maxCols),
    title: path.basename(resolvedPath)
  };
}

function loadText() {
  const raw = fs.readFileSync(resolvedPath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);
  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    title: path.basename(resolvedPath),
    preview: null
  };
}

function loadMarkdown() {
  const raw = fs.readFileSync(resolvedPath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);
  const preview = marked.parse(text, { breaks: true });
  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    title: path.basename(resolvedPath),
    preview
  };
}

function loadData() {
  const ext = path.extname(resolvedPath).toLowerCase();
  if (ext === '.csv' || ext === '.tsv') {
    const data = loadCsv();
    return { ...data, mode: 'csv' };
  }
  if (ext === '.md' || ext === '.markdown') {
    const data = loadMarkdown();
    return { ...data, mode: 'markdown' };
  }
  // default text
  const data = loadText();
  return { ...data, mode: 'text' };
}

// --- HTMLテンプレート ------------------------------------------------------
function htmlTemplate(dataRows, cols, title, mode, previewHtml) {
  const serialized = JSON.stringify(dataRows);
  const modeJson = JSON.stringify(mode);
  const hasPreview = !!previewHtml;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title} | CSVコメントビューア</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f172a;
      --panel: #111827;
      --border: #1f2937;
      --accent: #60a5fa;
      --accent-2: #f472b6;
      --text: #e5e7eb;
      --muted: #94a3b8;
      --comment: #0f766e;
      --badge: #22c55e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Inter", "Hiragino Sans", system-ui, -apple-system, sans-serif;
      background: radial-gradient(circle at 20% 20%, #1e293b 0%, #0b1224 35%, #0b1224 60%, #0f172a 100%);
      color: var(--text);
      min-height: 100vh;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 5;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
    }
    header .meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    header h1 { font-size: 16px; margin: 0; font-weight: 700; }
    header .badge {
      background: rgba(96,165,250,0.15);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      border: 1px solid rgba(96,165,250,0.35);
    }
    header button {
      background: linear-gradient(135deg, #38bdf8, #6366f1);
      color: #0b1224;
      border: none;
      border-radius: 10px;
      padding: 10px 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(99,102,241,0.35);
      transition: transform 120ms ease, box-shadow 120ms ease;
    }
    header button:hover { transform: translateY(-1px); box-shadow: 0 16px 36px rgba(99,102,241,0.45); }
    header button:active { transform: translateY(0); }

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
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: auto;
      max-height: calc(100vh - 110px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      min-width: max(720px, 100%);
      table-layout: fixed;
    }
    thead th {
      position: sticky;
      top: 0;
      z-index: 3;
      background: #0b1224;
      color: var(--muted);
      font-size: 12px;
      text-align: center;
      padding: 0;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      white-space: nowrap;
    }
    thead th:first-child,
    tbody th {
      width: 52px;
      min-width: 52px;
      max-width: 52px;
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
      background: #0b1224;
      z-index: 4;
    }
    .freeze-row {
      position: sticky !important;
      background: #0b1224;
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
      background: #0b1224;
      color: var(--muted);
      text-align: right;
      padding: 8px 10px;
      font-size: 12px;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 10px 10px;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      background: rgba(255,255,255,0.01);
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
    td:hover { background: rgba(96,165,250,0.08); box-shadow: inset 0 0 0 1px rgba(96,165,250,0.25); }
    td.has-comment { background: rgba(34,197,94,0.12); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.35); }
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
      background: #0b1224;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      width: min(420px, calc(100vw - 32px));
      box-shadow: 0 20px 40px rgba(0,0,0,0.45);
      display: none;
    }
    .floating header {
      position: relative;
      top: 0;
      background: transparent;
      border: none;
      padding: 0 0 8px 0;
      justify-content: space-between;
    }
    .floating h2 { font-size: 14px; margin: 0; color: #fff; }
    .floating button {
      margin-left: 8px;
      background: rgba(96,165,250,0.15);
      color: #e5e7eb;
      border: 1px solid var(--border);
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
    }
    .floating textarea {
      width: 100%;
      min-height: 110px;
      resize: vertical;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.6);
      color: var(--text);
      padding: 10px;
      font-size: 13px;
      line-height: 1.4;
    }
    .floating .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .floating .actions button.primary {
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: #0b1224;
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
      background: rgba(11, 18, 36, 0.95);
      box-shadow: 0 18px 40px rgba(0,0,0,0.45);
      padding: 12px;
      backdrop-filter: blur(6px);
      transition: opacity 120ms ease, transform 120ms ease;
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
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: rgba(96,165,250,0.12); border: 1px solid rgba(96,165,250,0.3); font-size: 12px; color: var(--text); }
    .pill strong { color: #fff; }
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
      background: rgba(96,165,250,0.16);
      color: var(--text);
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
      font-size: 13px;
    }
    .md-preview {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 12px;
      overflow: auto;
      max-height: 280px;
    }
    .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 {
      margin: 0.4em 0 0.2em;
    }
    .md-preview p { margin: 0.3em 0; line-height: 1.5; }
    .md-preview code { background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; }
    .md-preview pre {
      background: rgba(255,255,255,0.06);
      padding: 8px 10px;
      border-radius: 8px;
      overflow: auto;
    }
    .filter-menu {
      position: absolute;
      background: #0b1224;
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 14px 30px rgba(0,0,0,0.35);
      padding: 8px;
      display: none;
      z-index: 12;
      width: 180px;
    }
    .filter-menu button {
      width: 100%;
      display: block;
      margin: 4px 0;
      padding: 8px 10px;
      background: rgba(96,165,250,0.12);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      font-size: 13px;
      text-align: left;
    }
    .filter-menu button:hover { background: rgba(96,165,250,0.2); }
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
      <span class="badge">クリックでコメント / ESCでキャンセル</span>
      <span class="pill">コメント数 <strong id="comment-count">0</strong></span>
    </div>
    <div>
      <button id="send-and-exit">コメント送信して終了</button>
    </div>
  </header>

  <div class="wrap">
    ${hasPreview ? `<div class="md-preview">${previewHtml}</div>` : ''}
    <div class="toolbar">
      <button id="fit-width">横幅にフィット</button>
      <span>ヘッダ右端をドラッグして列幅調整</span>
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
  </div>

  <div class="floating" id="comment-card">
    <header>
      <h2 id="card-title">セルコメント</h2>
      <div style="display:flex; gap:6px;">
        <button id="close-card">閉じる</button>
        <button id="clear-comment">削除</button>
      </div>
    </header>
    <div id="cell-preview" style="font-size:12px; color: var(--muted); margin-bottom:8px;"></div>
    <textarea id="comment-input" placeholder="このセルへのメモ・指摘を入力"></textarea>
    <div class="actions">
      <button class="primary" id="save-comment">保存</button>
    </div>
  </div>

  <aside class="comment-list">
    <h3>コメント一覧</h3>
    <ol id="comment-list"></ol>
    <p class="hint">タブを閉じるか「コメント送信して終了」で送信＆サーバー終了します。</p>
  </aside>
  <button class="comment-toggle" id="comment-toggle">コメント一覧 (0)</button>
  <div class="filter-menu" id="filter-menu">
    <label class="menu-check"><input type="checkbox" id="freeze-col-check" /> この列まで固定</label>
    <button data-action="not-empty">この列が空でない行</button>
    <button data-action="empty">この列が空の行</button>
    <button data-action="contains">値に含む…</button>
    <button data-action="not-contains">値に含まない…</button>
    <button data-action="reset">この列のフィルタ解除</button>
  </div>
  <div class="filter-menu" id="row-menu">
    <label class="menu-check"><input type="checkbox" id="freeze-row-check" /> この行まで固定</label>
  </div>

  <script>
    const DATA = ${serialized};
    const MAX_COLS = ${cols};
    const FILE_NAME = ${JSON.stringify(title)};
    const MODE = ${modeJson};

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

  const ROW_HEADER_WIDTH = 52;
  const MIN_COL_WIDTH = 80;
  const MAX_COL_WIDTH = 380;
  const DEFAULT_COL_WIDTH = 160;

  let colWidths = Array.from({ length: MAX_COLS }, () => DEFAULT_COL_WIDTH);
  let panelOpen = false;
  let filters = {}; // colIndex -> predicate
  let filterTargetCol = null;
  let freezeCols = 0;
  let freezeRows = 0;

    // --- ホットリロード (SSE) ----------------------------------------------
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

    const comments = {}; // key: "r-c" -> {row, col, text, value}
    let currentKey = null;

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
          td.addEventListener('click', () => openCard(td, val));
          tr.appendChild(td);
        }
        frag.appendChild(tr);
      });
      tbody.appendChild(frag);
    }

    function openCard(td, value) {
      const row = Number(td.dataset.row);
      const col = Number(td.dataset.col);
      currentKey = row + '-' + col;
      cardTitle.textContent = 'R' + row + ' C' + col + ' へのコメント';
      cellPreview.textContent = value ? 'セル値: ' + value : 'セル値: (空)';
      commentInput.value = comments[currentKey]?.text || '';

      card.style.display = 'block';
      const cardWidth = card.offsetWidth || 380;
      const cardHeight = card.offsetHeight || 220;
      const rect = td.getBoundingClientRect();
      const margin = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      const spaceRight = vw - rect.right - margin;
      const spaceLeft = rect.left - margin;
      const spaceBelow = vh - rect.bottom - margin;
      const spaceAbove = rect.top - margin;

      let left = sx + rect.right + margin;
      let top = sy + rect.top;

      if (spaceBelow >= cardHeight) {
        // 下に出す（優先）
        left = sx + clamp(rect.left, margin, vw - cardWidth - margin);
        top = sy + rect.bottom + margin;
      } else if (spaceAbove >= cardHeight) {
        // 上に出す
        left = sx + clamp(rect.left, margin, vw - cardWidth - margin);
        top = sy + rect.top - cardHeight - margin;
      } else if (spaceRight >= cardWidth) {
        // 右に出す
        left = sx + rect.right + margin;
        top = sy + clamp(rect.top, margin, vh - cardHeight - margin);
      } else if (spaceLeft >= cardWidth) {
        // 左に出す
        left = sx + rect.left - cardWidth - margin;
        top = sy + clamp(rect.top, margin, vh - cardHeight - margin);
      } else {
        // それでも無理ならできるだけ近く
        left = sx + clamp(rect.left, margin, vw - cardWidth - margin);
        top = sy + clamp(rect.bottom + margin, margin, vh - cardHeight - margin);
      }

      card.style.left = left + 'px';
      card.style.top = top + 'px';
      commentInput.focus();
    }

    function closeCard() {
      card.style.display = 'none';
      currentKey = null;
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
      const items = Object.values(comments).sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
      commentCount.textContent = items.length;
      commentToggle.textContent = 'コメント一覧 (' + items.length + ')';
      if (items.length === 0) {
        panelOpen = false;
      }
      commentPanel.classList.toggle('collapsed', !panelOpen || items.length === 0);
      if (!items.length) {
        const li = document.createElement('li');
        li.className = 'hint';
        li.textContent = 'まだコメントはありません';
        commentList.appendChild(li);
        return;
      }
      items.forEach((c) => {
        const li = document.createElement('li');
        li.innerHTML = '<strong>R' + c.row + 'C' + c.col + '</strong> ' + escapeHtml(c.text);
        li.addEventListener('click', () => {
          const td = tbody.querySelector('td[data-row="' + c.row + '"][data-col="' + c.col + '"]');
          if (td) openCard(td, td.textContent);
        });
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

    // --- フィルタ ----------------------------------------------------------
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
        const keyword = prompt('含めたい文字列を入力してください');
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

    // --- 行メニュー（固定行） ----------------------------------------------
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

    function saveCurrent() {
      if (!currentKey) return;
      const text = commentInput.value.trim();
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
      refreshList();
      closeCard();
    }

    function clearCurrent() {
      if (!currentKey) return;
      const [row, col] = currentKey.split('-').map(Number);
      delete comments[currentKey];
      setDot(row, col, false);
      refreshList();
      closeCard();
    }

    document.getElementById('save-comment').addEventListener('click', saveCurrent);
    document.getElementById('clear-comment').addEventListener('click', clearCurrent);
    document.getElementById('close-card').addEventListener('click', closeCard);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeCard();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveCurrent();
    });

    // --- 列リサイズ --------------------------------------------------------
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
      // 行ヘッダ（row番号）クリックで行固定メニュー
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

    // --- 固定列・固定行 ----------------------------------------------------
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
    freezeSelect.addEventListener('change', updateStickyOffsets);

    // --- 横幅フィット ------------------------------------------------------
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
    fitBtn.addEventListener('click', fitToWidth);

    // --- 送信＆終了 ---------------------------------------------------------
    let sent = false;
    function payload(reason) {
      return {
        file: FILE_NAME,
        mode: MODE,
        reason,
        at: new Date().toISOString(),
        comments: Object.values(comments)
      };
    }
    function sendAndExit(reason = 'pagehide') {
      if (sent) return;
      sent = true;
      const blob = new Blob([JSON.stringify(payload(reason))], { type: 'application/json' });
      navigator.sendBeacon('/exit', blob);
    }
    document.getElementById('send-and-exit').addEventListener('click', () => {
      sendAndExit('button');
      setTimeout(() => window.close(), 200);
    });
    window.addEventListener('pagehide', () => sendAndExit('pagehide'));
    window.addEventListener('beforeunload', () => sendAndExit('beforeunload'));

    syncColgroup();
    renderTable();
    attachResizers();
    updateStickyOffsets();
    updateFilterIndicators();
    refreshList();
  </script>
</body>
</html>`;
}

function buildHtml() {
  const { rows, cols, title, mode, preview } = loadData();
  return htmlTemplate(rows, cols, title, mode, preview);
}

// --- HTTPサーバー ---------------------------------------------------------
const baseName = path.basename(resolvedPath);

const sseClients = new Set();
let watcher = null;
let heartbeat = null;
let reloadTimer = null;
let server = null;
let opened = false;

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

function broadcast(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // ignore write errors
    }
  });
}

function notifyReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => broadcast('reload'), 150);
}

function startWatcher() {
  try {
    watcher = fs.watch(resolvedPath, { persistent: true }, notifyReload);
  } catch (err) {
    console.warn('ファイル監視開始に失敗しました', err);
  }
  heartbeat = setInterval(() => broadcast('ping'), 25000);
}

function shutdown() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
  if (heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
  sseClients.forEach((res) => {
    try { res.end(); } catch (_) {}
  });
  if (server) {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    try {
      const html = buildHtml();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      console.error('CSV読み込みエラー', err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('CSV読み込みに失敗しました。ファイルを確認してください。');
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
      const comments = Array.isArray(payload.comments) ? payload.comments : [];
      console.log('=== コメントを受信 ===');
      const yamlOut = yaml.dump(payload, { noRefs: true, lineWidth: 120 });
      console.log(yamlOut.trim());
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('bye');
    } catch (err) {
      console.error('payload parse error', err);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('bad request');
    } finally {
      // クライアントが閉じる前に送信されることを想定、即終了
      shutdown();
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
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('not found');
});

server.listen(port, () => {
  console.log(`CSVビューア起動: http://localhost:${port}  (ファイル: ${baseName})`);
  console.log('タブを閉じるとサーバーも終了します。');
  if (!opened) {
    const url = `http://localhost:${port}`;
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    try {
      spawn(opener, [url], { stdio: 'ignore', detached: true });
      opened = true;
    } catch (err) {
      console.warn('ブラウザ自動起動に失敗しました。URLを手動で開いてください:', url);
    }
  }
  startWatcher();
});
