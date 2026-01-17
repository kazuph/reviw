#!/usr/bin/env node
/**
 * Lightweight CSV/Text/Markdown viewer with comment collection server
 *
 * Usage:
 *   reviw <file...> [--port 4989] [--encoding utf8|shift_jis|...] [--no-open]
 *
 * Multiple files can be specified. Each file opens on a separate port.
 * Click cells in the browser to add comments.
 * Close the tab or click "Submit & Exit" to send comments to the server.
 * When all files are closed, outputs combined YAML to stdout and exits.
 */

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawn, execSync, spawnSync } = require("child_process");
const chardet = require("chardet");
const iconv = require("iconv-lite");
const marked = require("marked");
const yaml = require("js-yaml");

// --- XSS Protection for marked (Whitelist approach) ---
// 許可タグリスト（Markdown由来の安全なタグのみ）
const allowedTags = new Set([
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'em', 'strong', 'del', 's',
  'a', 'img', 'video',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', // Markdown拡張用
  'details', 'summary', // 折りたたみ用
]);

// 許可属性リスト（タグごとに定義）
const allowedAttributes = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'video': ['src', 'controls', 'width', 'height', 'poster', 'preload', 'muted', 'loop'],
  'code': ['class'], // 言語ハイライト用
  'pre': ['class'],
  'div': ['class'],
  'span': ['class'],
  'th': ['align'],
  'td': ['align'],
  'details': ['open'],
  'summary': [],
};

// HTMLエスケープ関数（XSS対策用）
function escapeHtmlForXss(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// href/src属性のURLバリデーション
function isSafeUrl(url) {
  if (!url) return true;
  // 空白・制御文字を除去して正規化
  var normalized = url.toLowerCase().replace(/[\s\x00-\x1f]/g, '');
  // HTMLエンティティのデコード（&#x0a; &#10; など）
  var decoded = normalized.replace(/&#x?[0-9a-f]+;?/gi, '');
  if (decoded.startsWith('javascript:')) return false;
  if (decoded.startsWith('vbscript:')) return false;
  if (decoded.startsWith('data:') && !decoded.startsWith('data:image/')) return false;
  return true;
}

// HTML文字列をサニタイズ（ホワイトリストに含まれないタグ/属性を除去）
function sanitizeHtml(html) {
  // より堅牢なタグマッチング：属性値内の < > を考慮
  // 引用符で囲まれた属性値を正しく処理するパターン
  var tagPattern = /<\/?([a-z][a-z0-9]*)((?:\s+[a-z][a-z0-9-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>"']*))?)*)\s*\/?>/gi;

  return html.replace(tagPattern, function(match, tag, attrsStr) {
    var tagLower = tag.toLowerCase();

    // 許可されていないタグはエスケープ
    if (!allowedTags.has(tagLower)) {
      return escapeHtmlForXss(match);
    }

    // 終了タグはそのまま
    if (match.startsWith('</')) {
      return '</' + tagLower + '>';
    }

    // 属性をフィルタリング
    var allowed = allowedAttributes[tagLower] || [];
    var safeAttrs = [];

    // 属性を解析（引用符で囲まれた値を正しく処理）
    var attrRegex = /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']*))/gi;
    var attrMatch;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      var attrName = attrMatch[1].toLowerCase();
      var attrValue = attrMatch[2] !== undefined ? attrMatch[2] :
                      attrMatch[3] !== undefined ? attrMatch[3] :
                      attrMatch[4] || '';

      // on*イベントハンドラは常に拒否
      if (attrName.startsWith('on')) continue;

      // 許可属性のみ
      if (!allowed.includes(attrName)) continue;

      // href/srcのURL検証
      if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attrValue)) {
        continue;
      }

      safeAttrs.push(attrName + '="' + attrValue.replace(/"/g, '&quot;') + '"');
    }

    var finalAttrs = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
    return '<' + tagLower + finalAttrs + '>';
  });
}

marked.use({
  hooks: {
    // テーブルをスクロールラッパーで囲む（後処理）
    postprocess: function(html) {
      return html.replace(/<table>/g, '<div class="table-scroll-container"><span class="scroll-hint">← scroll →</span><div class="table-scroll-wrapper"><table>')
                 .replace(/<\/table>/g, '</table></div></div>');
    }
  },
  renderer: {
    // 生HTMLブロックをサニタイズ
    html: function(token) {
      var text = token.raw || token.text || token;
      return sanitizeHtml(text);
    },
    // リンクに安全なURL検証を追加（別タブで開く）
    link: function(href, title, text) {
      href = href || "";
      title = title || "";
      text = text || "";
      if (!isSafeUrl(href)) {
        // 危険なURLはプレーンテキストとして表示
        return escapeHtmlForXss(text);
      }
      var titleAttr = title ? ' title="' + escapeHtmlForXss(title) + '"' : "";
      return '<a href="' + escapeHtmlForXss(href) + '"' + titleAttr + ' target="_blank" rel="noopener noreferrer">' + text + '</a>';
    },
    // 画像にも安全なURL検証を追加
    image: function(href, title, text) {
      href = href || "";
      title = title || "";
      text = text || "";
      if (!isSafeUrl(href)) {
        return escapeHtmlForXss(text || "image");
      }
      var titleAttr = title ? ' title="' + escapeHtmlForXss(title) + '"' : "";
      var altAttr = text ? ' alt="' + escapeHtmlForXss(text) + '"' : "";
      // Check if this is a video file - render as video element with thumbnail
      var videoExtensions = /\.(mp4|mov|webm|avi|mkv|m4v|ogv)$/i;
      if (videoExtensions.test(href)) {
        // For videos, render as video element with controls and thumbnail preview
        var displayText = text || href.split('/').pop();
        var dataAlt = text ? ' data-alt="' + escapeHtmlForXss(text) + '"' : "";
        return '<video src="' + escapeHtmlForXss(href) + '" controls preload="metadata" class="video-preview"' + titleAttr + dataAlt + '>' +
               '<a href="' + escapeHtmlForXss(href) + '">📹' + escapeHtmlForXss(displayText) + '</a></video>';
      }
      return '<img src="' + escapeHtmlForXss(href) + '"' + altAttr + titleAttr + '>';
    }
  }
});

// --- CLI arguments ---------------------------------------------------------
const VERSION = require("./package.json").version;

// ===== CLI設定のデフォルト値（import時に使用） =====
const DEFAULT_CONFIG = {
  basePort: 4989,
  encodingOpt: null,
  noOpen: false,
};

// ===== グローバル設定変数（デフォルト値で初期化、require.main時に更新） =====
let basePort = DEFAULT_CONFIG.basePort;
let encodingOpt = DEFAULT_CONFIG.encodingOpt;
let noOpen = DEFAULT_CONFIG.noOpen;
let stdinMode = false;
let diffMode = false;
let stdinContent = null;
let resolvedPaths = [];  // ファイルパス（require.main時に設定）

function showHelp() {
  console.log(`reviw v${VERSION} - Lightweight file reviewer with in-browser comments

Usage:
  reviw <file...> [options]      Review files (CSV, TSV, Markdown, Text)
  reviw <file.diff>              Review diff/patch file
  git diff | reviw [options]     Review diff from stdin
  reviw                          Auto run git diff HEAD

Supported Formats:
  CSV/TSV      Tabular data with sticky headers, filtering, column resizing
  Markdown     Side-by-side preview with synchronized scrolling, Mermaid diagrams
  Diff/Patch   GitHub-style view with syntax highlighting
  Text         Line-by-line commenting

Options:
  --port <number>       Server port (default: 4989)
  --encoding <enc>, -e  Force encoding (utf8, shift_jis, euc-jp, etc.)
  --no-open             Don't open browser automatically
  --help, -h            Show this help message
  --version, -v         Show version number

Examples:
  reviw data.csv                    # Review CSV file
  reviw README.md                   # Review Markdown with preview
  reviw file1.csv file2.md          # Multiple files on consecutive ports
  git diff | reviw                  # Review uncommitted changes
  git diff HEAD~3 | reviw           # Review last 3 commits
  reviw changes.patch               # Review patch file

Workflow:
  1. Browser opens automatically (use --no-open to disable)
  2. Click cells/lines to add comments, drag to select multiple
  3. Press Cmd/Ctrl+Enter or click "Submit & Exit"
  4. Comments are output as YAML to stdout

More info: https://github.com/kazuph/reviw`);
}

function showVersion() {
  console.log(VERSION);
}

// ===== CLI引数パース関数（require.main時のみ呼ばれる） =====
function parseCliArgs(argv) {
  const args = argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  const filePaths = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--port" && args[i + 1]) {
      config.basePort = Number(args[i + 1]);
      i += 1;
    } else if ((arg === "--encoding" || arg === "-e") && args[i + 1]) {
      config.encodingOpt = args[i + 1];
      i += 1;
    } else if (arg === "--no-open") {
      config.noOpen = true;
    } else if (arg === "--help" || arg === "-h") {
      showHelp();
      process.exit(0);
    } else if (arg === "--version" || arg === "-v") {
      showVersion();
      process.exit(0);
    } else if (!arg.startsWith("-")) {
      filePaths.push(arg);
    }
  }

  return { config, filePaths };
}

// ===== ファイルパス検証・解決関数（require.main時のみ呼ばれる） =====
function validateAndResolvePaths(filePaths) {
  const resolved = [];
  for (const fp of filePaths) {
    const resolvedPath = path.resolve(fp);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`File not found: ${resolvedPath}`);
      process.exit(1);
    }
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      console.error(`Cannot open directory: ${resolvedPath}`);
      console.error(`Usage: reviw <file> [file2...]`);
      console.error(`Please specify a file, not a directory.`);
      process.exit(1);
    }
    resolved.push(resolvedPath);
  }
  return resolved;
}

// Check if stdin has data (pipe mode)
async function checkStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve(false);
      return;
    }
    let data = "";
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(data.length > 0 ? data : false);
      }
    }, 100);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(data.length > 0 ? data : false);
      }
    });
    process.stdin.on("error", () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    });
  });
}

// Run git diff HEAD if no files and no stdin
function runGitDiff() {
  return new Promise((resolve, reject) => {
    const { execSync } = require("child_process");
    try {
      // Check if we're in a git repo
      execSync("git rev-parse --is-inside-work-tree", { stdio: "pipe" });
      // Run git diff HEAD
      const diff = execSync("git diff HEAD", { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
      resolve(diff);
    } catch (err) {
      reject(new Error("Not a git repository or git command failed"));
    }
  });
}

// --- Diff parsing -----------------------------------------------------------
function parseDiff(diffText) {
  const files = [];
  const lines = diffText.split("\n");
  let currentFile = null;
  let lineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // New file header
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);
      const match = line.match(/diff --git a\/(.+?) b\/(.+)/);
      currentFile = {
        oldPath: match ? match[1] : "",
        newPath: match ? match[2] : "",
        hunks: [],
        isNew: false,
        isDeleted: false,
        isBinary: false,
      };
      lineNumber = 0;
      continue;
    }

    if (!currentFile) continue;

    // File mode info
    if (line.startsWith("new file mode")) {
      currentFile.isNew = true;
      continue;
    }
    if (line.startsWith("deleted file mode")) {
      currentFile.isDeleted = true;
      continue;
    }
    if (line.startsWith("Binary files")) {
      currentFile.isBinary = true;
      continue;
    }

    // Hunk header
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/);
      if (match) {
        currentFile.hunks.push({
          oldStart: parseInt(match[1], 10),
          newStart: parseInt(match[2], 10),
          context: match[3] || "",
          lines: [],
        });
      }
      continue;
    }

    // Skip other headers
    if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("index ")) {
      continue;
    }

    // Diff content
    if (currentFile.hunks.length > 0) {
      const hunk = currentFile.hunks[currentFile.hunks.length - 1];
      if (line.startsWith("+")) {
        hunk.lines.push({ type: "add", content: line.slice(1), lineNum: ++lineNumber });
      } else if (line.startsWith("-")) {
        hunk.lines.push({ type: "del", content: line.slice(1), lineNum: ++lineNumber });
      } else if (line.startsWith(" ") || line === "") {
        hunk.lines.push({ type: "ctx", content: line.slice(1) || "", lineNum: ++lineNumber });
      }
    }
  }

  if (currentFile) files.push(currentFile);
  return files;
}

function loadDiff(diffText) {
  const files = parseDiff(diffText);

  // Sort files: non-binary first, binary last
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isBinary && !b.isBinary) return 1;
    if (!a.isBinary && b.isBinary) return -1;
    return 0;
  });

  // Calculate line count for each file
  const COLLAPSE_THRESHOLD = 50;
  sortedFiles.forEach((file) => {
    let lineCount = 0;
    if (!file.isBinary) {
      file.hunks.forEach((hunk) => {
        lineCount += hunk.lines.length;
      });
    }
    file.lineCount = lineCount;
    file.collapsed = lineCount > COLLAPSE_THRESHOLD;
  });

  // Convert to rows for display
  const rows = [];
  let rowIndex = 0;

  sortedFiles.forEach((file, fileIdx) => {
    // File header row
    let label = file.newPath || file.oldPath;
    if (file.isNew) label += " (new)";
    if (file.isDeleted) label += " (deleted)";
    if (file.isBinary) label += " (binary)";
    rows.push({
      type: "file",
      content: label,
      filePath: file.newPath || file.oldPath,
      fileIndex: fileIdx,
      lineCount: file.lineCount,
      collapsed: file.collapsed,
      isBinary: file.isBinary,
      rowIndex: rowIndex++,
    });

    if (file.isBinary) return;

    file.hunks.forEach((hunk) => {
      // Hunk header
      rows.push({
        type: "hunk",
        content: `@@ -${hunk.oldStart} +${hunk.newStart} @@${hunk.context}`,
        fileIndex: fileIdx,
        rowIndex: rowIndex++,
      });

      hunk.lines.forEach((line) => {
        rows.push({
          type: line.type,
          content: line.content,
          fileIndex: fileIdx,
          rowIndex: rowIndex++,
        });
      });
    });
  });

  return {
    rows,
    files: sortedFiles,
    projectRoot: "",
    relativePath: "Git Diff",
    mode: "diff",
  };
}

// --- Multi-file state management -------------------------------------------
const allResults = [];
let serversRunning = 0;
let nextPort = basePort;

// --- Simple CSV/TSV parser (RFC4180-style, handles " escaping and newlines) ----
function parseCsv(text, separator = ",") {
  const rows = [];
  let row = [];
  let field = "";
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
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // Ignore CR (for CRLF handling)
    } else {
      field += ch;
    }
  }

  row.push(field);
  rows.push(row);

  // Remove trailing empty row if present
  const last = rows[rows.length - 1];
  if (last && last.every((v) => v === "")) {
    rows.pop();
  }

  return rows;
}

const ENCODING_MAP = {
  "utf-8": "utf8",
  utf8: "utf8",
  shift_jis: "shift_jis",
  sjis: "shift_jis",
  "windows-31j": "cp932",
  cp932: "cp932",
  "euc-jp": "euc-jp",
  "iso-8859-1": "latin1",
  latin1: "latin1",
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
    const detected = chardet.detect(buf) || "";
    encoding = normalizeEncoding(detected) || "utf8";
    if (encoding !== "utf8") {
      console.log(`Detected encoding: ${detected} -> ${encoding}`);
    }
  }
  try {
    return iconv.decode(buf, encoding);
  } catch (err) {
    console.warn(`Decode failed (${encoding}): ${err.message}, falling back to utf8`);
    return buf.toString("utf8");
  }
}

function loadCsv(filePath) {
  const raw = fs.readFileSync(filePath);
  const csvText = decodeBuffer(raw);
  const ext = path.extname(filePath).toLowerCase();
  const separator = ext === ".tsv" ? "\t" : ",";
  if (!csvText.includes("\n") && !csvText.includes(separator)) {
    // heuristic: if no newline/separators, still treat as single row
  }
  const rows = parseCsv(csvText, separator);
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return {
    rows,
    cols: Math.max(1, maxCols),
    ...formatTitlePaths(filePath),
  };
}

function loadText(filePath) {
  const raw = fs.readFileSync(filePath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);
  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    ...formatTitlePaths(filePath),
    preview: null,
  };
}

function loadMarkdown(filePath) {
  const raw = fs.readFileSync(filePath);
  const text = decodeBuffer(raw);
  const lines = text.split(/\r?\n/);

  // Parse YAML frontmatter
  let frontmatterHtml = "";
  let contentStart = 0;
  let reviwQuestions = []; // Extract reviw questions for modal

  if (lines[0] && lines[0].trim() === "---") {
    let frontmatterEnd = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        frontmatterEnd = i;
        break;
      }
    }

    if (frontmatterEnd > 0) {
      const frontmatterLines = lines.slice(1, frontmatterEnd);
      const frontmatterText = frontmatterLines.join("\n");

      try {
        const frontmatter = yaml.load(frontmatterText);
        if (frontmatter && typeof frontmatter === "object") {
          // Extract reviw questions if present
          if (frontmatter.reviw && Array.isArray(frontmatter.reviw.questions)) {
            reviwQuestions = frontmatter.reviw.questions.map((q, idx) => ({
              id: q.id || "q" + (idx + 1),
              question: q.question || "",
              resolved: q.resolved === true,
              answer: q.answer || "",
              options: Array.isArray(q.options) ? q.options : [],
            }));
          }

          // Create HTML table for frontmatter (show reviw questions in detail for 1:1 correspondence with YAML source)
          const displayFrontmatter = { ...frontmatter };
          // Keep reviw as-is for detailed rendering

          if (Object.keys(displayFrontmatter).length > 0) {
            frontmatterHtml = '<div class="frontmatter-table"><table>';
            frontmatterHtml += '<colgroup><col style="width:12%"><col style="width:88%"></colgroup>';
            frontmatterHtml += '<thead><tr><th colspan="2">Document Metadata</th></tr></thead>';
            frontmatterHtml += "<tbody>";

            // Render reviw.questions as detailed cards
            function renderReviwQuestions(questions) {
              if (!Array.isArray(questions) || questions.length === 0) {
                return '<span class="fm-tag">質問なし</span>';
              }
              let html = '<div class="reviw-questions-preview">';
              questions.forEach((q, idx) => {
                const statusIcon = q.resolved ? '✅' : '⏳';
                const statusClass = q.resolved ? 'resolved' : 'pending';
                html += '<div class="reviw-q-card ' + statusClass + '">';
                html += '<div class="reviw-q-header">' + statusIcon + ' <strong>' + escapeHtmlChars(q.id || 'Q' + (idx + 1)) + '</strong></div>';
                html += '<div class="reviw-q-question">' + escapeHtmlChars(q.question || '') + '</div>';
                if (q.options && Array.isArray(q.options) && q.options.length > 0) {
                  html += '<div class="reviw-q-options">';
                  q.options.forEach(opt => {
                    html += '<span class="fm-tag">' + escapeHtmlChars(opt) + '</span>';
                  });
                  html += '</div>';
                }
                if (q.answer) {
                  html += '<div class="reviw-q-answer">💬 ' + escapeHtmlChars(q.answer) + '</div>';
                }
                html += '</div>';
              });
              html += '</div>';
              return html;
            }

            function renderValue(val, key) {
              // Special handling for reviw object
              if (key === 'reviw' && typeof val === 'object' && val !== null) {
                let html = '';
                if (val.questions && Array.isArray(val.questions)) {
                  html += renderReviwQuestions(val.questions);
                }
                // Render other reviw properties
                const { questions, ...rest } = val;
                if (Object.keys(rest).length > 0) {
                  html += '<div style="margin-top: 8px;">';
                  for (const [k, v] of Object.entries(rest)) {
                    html += '<div><strong>' + escapeHtmlChars(k) + ':</strong> ' + escapeHtmlChars(String(v)) + '</div>';
                  }
                  html += '</div>';
                }
                return html || '<span class="fm-tag">-</span>';
              }
              if (Array.isArray(val)) {
                return val
                  .map((v) => '<span class="fm-tag">' + escapeHtmlChars(String(v)) + "</span>")
                  .join(" ");
              }
              if (typeof val === "object" && val !== null) {
                return "<pre>" + escapeHtmlChars(JSON.stringify(val, null, 2)) + "</pre>";
              }
              return escapeHtmlChars(String(val));
            }

            for (const [key, val] of Object.entries(displayFrontmatter)) {
              frontmatterHtml +=
                "<tr><th>" + escapeHtmlChars(key) + "</th><td>" + renderValue(val, key) + "</td></tr>";
            }

            frontmatterHtml += "</tbody></table></div>";
          }
          contentStart = frontmatterEnd + 1;
        }
      } catch (e) {
        // Invalid YAML, skip frontmatter rendering
      }
    }
  }

  // Parse markdown content (without frontmatter)
  let contentText = lines.slice(contentStart).join("\n");

  // Preprocess <details> blocks to preserve their content
  // marked splits HTML blocks on blank lines, so we need to handle details specially
  const detailsBlocks = [];
  contentText = contentText.replace(/<details>([\s\S]*?)<\/details>/gi, function(match, inner) {
    const placeholder = `<!--DETAILS_PLACEHOLDER_${detailsBlocks.length}-->`;
    // Parse the inner content as markdown, preserving the details structure
    const summaryMatch = inner.match(/<summary>([\s\S]*?)<\/summary>/i);
    const summary = summaryMatch ? summaryMatch[1] : '';
    const content = summaryMatch ? inner.replace(/<summary>[\s\S]*?<\/summary>/i, '').trim() : inner.trim();
    const parsedContent = marked.parse(content, { breaks: true });
    detailsBlocks.push(`<details><summary>${summary}</summary>${parsedContent}</details>`);
    return placeholder;
  });

  let preview = frontmatterHtml + marked.parse(contentText, { breaks: true });

  // Restore details blocks
  detailsBlocks.forEach((block, i) => {
    preview = preview.replace(`<!--DETAILS_PLACEHOLDER_${i}-->`, block);
  });

  return {
    rows: lines.map((line) => [line]),
    cols: 1,
    ...formatTitlePaths(filePath),
    preview,
    reviwQuestions, // Pass questions to UI
  };
}

function escapeHtmlChars(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTitlePaths(filePath) {
  const cwd = process.cwd();
  const home = os.homedir();
  const relativePath = path.relative(cwd, filePath) || path.basename(filePath);
  let projectRoot = cwd;
  if (projectRoot.startsWith(home)) {
    projectRoot = "~" + projectRoot.slice(home.length);
  }
  if (!projectRoot.endsWith("/")) {
    projectRoot += "/";
  }
  return { projectRoot, relativePath };
}

function loadData(filePath) {
  // Check if path exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Check if path is a directory
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    throw new Error(
      `Cannot open directory: ${filePath}\n` +
      `Usage: reviw <file> [file2...]\n` +
      `Please specify a file, not a directory.`
    );
  }
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv" || ext === ".tsv") {
    const data = loadCsv(filePath);
    return { ...data, mode: "csv" };
  }
  if (ext === ".md" || ext === ".markdown") {
    const data = loadMarkdown(filePath);
    return { ...data, mode: "markdown" };
  }
  if (ext === ".diff" || ext === ".patch") {
    const content = fs.readFileSync(filePath, "utf8");
    const data = loadDiff(content);
    return { ...data, mode: "diff" };
  }
  // default text
  const data = loadText(filePath);
  return { ...data, mode: "text" };
}

// --- Safe JSON serialization for inline scripts ---------------------------
// Prevents </script> breakage and template literal injection while keeping
// the original values intact once parsed by JS.
function serializeForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c") // avoid closing the script tag
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028") // line separator
    .replace(/\u2029/g, "\\u2029") // paragraph separator
    .replace(/`/g, "\\`") // keep template literal boundaries safe
    .replace(/\$\{/g, "\\${");
}

function diffHtmlTemplate(diffData, history = []) {
  const { rows, projectRoot, relativePath } = diffData;
  const serialized = serializeForScript(rows);
  const historyJson = serializeForScript(history);
  const fileCount = rows.filter((r) => r.type === "file").length;

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>${relativePath} | reviw</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0d1117;
      --bg-gradient: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
      --panel: #161b22;
      --panel-alpha: rgba(22, 27, 34, 0.95);
      --border: #30363d;
      --accent: #58a6ff;
      --text: #c9d1d9;
      --text-inverse: #0d1117;
      --muted: #8b949e;
      --add-bg: rgba(35, 134, 54, 0.15);
      --add-line: rgba(35, 134, 54, 0.4);
      --add-text: #3fb950;
      --del-bg: rgba(248, 81, 73, 0.15);
      --del-line: rgba(248, 81, 73, 0.4);
      --del-text: #f85149;
      --hunk-bg: rgba(56, 139, 253, 0.15);
      --file-bg: #161b22;
      --selected-bg: rgba(88, 166, 255, 0.15);
      --shadow-color: rgba(0,0,0,0.4);
    }
    [data-theme="light"] {
      color-scheme: light;
      --bg: #ffffff;
      --bg-gradient: linear-gradient(135deg, #ffffff 0%, #f6f8fa 100%);
      --panel: #f6f8fa;
      --panel-alpha: rgba(246, 248, 250, 0.95);
      --border: #d0d7de;
      --accent: #0969da;
      --text: #24292f;
      --text-inverse: #ffffff;
      --muted: #57606a;
      --add-bg: rgba(35, 134, 54, 0.1);
      --add-line: rgba(35, 134, 54, 0.3);
      --add-text: #1a7f37;
      --del-bg: rgba(248, 81, 73, 0.1);
      --del-line: rgba(248, 81, 73, 0.3);
      --del-text: #cf222e;
      --hunk-bg: rgba(56, 139, 253, 0.1);
      --file-bg: #f6f8fa;
      --selected-bg: rgba(9, 105, 218, 0.1);
      --shadow-color: rgba(0,0,0,0.1);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      background: var(--bg-gradient);
      color: var(--text);
      min-height: 100vh;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 12px 20px;
      background: var(--panel-alpha);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
    }
    header .meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    header .actions { display: flex; gap: 8px; align-items: center; }
    header h1 { display: flex; flex-direction: column; margin: 0; line-height: 1.3; }
    header h1 .title-path { font-size: 11px; font-weight: 400; color: var(--muted); }
    header h1 .title-file { font-size: 16px; font-weight: 600; }
    header .badge {
      background: var(--selected-bg);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      border: 1px solid var(--border);
    }
    header button {
      background: linear-gradient(135deg, #238636, #2ea043);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
    }
    header button:hover { opacity: 0.9; }
    .theme-toggle {
      background: var(--selected-bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 14px;
      cursor: pointer;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .theme-toggle:hover { background: var(--border); }

    .wrap { padding: 16px 20px 16px; max-width: 1200px; margin: 0 auto; }
    .diff-container {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .diff-line {
      display: flex;
      font-size: 12px;
      line-height: 20px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      transition: background 80ms ease;
    }
    .diff-line:last-child { border-bottom: none; }
    .diff-line:hover { filter: brightness(1.05); }
    .diff-line.selected { background: var(--selected-bg) !important; box-shadow: inset 3px 0 0 var(--accent); }
    .diff-line.file-header {
      background: var(--file-bg);
      font-weight: 600;
      padding: 10px 12px;
      font-size: 13px;
      color: var(--text);
      border-bottom: 1px solid var(--border);
      cursor: default;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .file-header-left { display: flex; align-items: center; gap: 8px; }
    .file-header-info {
      font-size: 11px;
      color: var(--muted);
      font-weight: 400;
    }
    .toggle-btn {
      background: var(--selected-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      color: var(--text);
    }
    .toggle-btn:hover { background: var(--border); }
    .hidden-lines { display: none; }
    .load-more-row {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      background: var(--hunk-bg);
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      font-size: 12px;
      color: var(--accent);
      gap: 8px;
    }
    .load-more-row:hover { background: var(--selected-bg); }
    .load-more-row .expand-icon { font-size: 10px; }
    .diff-line.hunk-header {
      background: var(--hunk-bg);
      color: var(--muted);
      padding: 6px 12px;
      font-size: 11px;
    }
    .diff-line.add { background: var(--add-bg); }
    .diff-line.add .line-content { color: var(--add-text); }
    .diff-line.add .line-num { background: var(--add-line); color: var(--add-text); }
    .diff-line.del { background: var(--del-bg); }
    .diff-line.del .line-content { color: var(--del-text); }
    .diff-line.del .line-num { background: var(--del-line); color: var(--del-text); }
    .diff-line.ctx { background: transparent; }

    .line-num {
      min-width: 40px;
      padding: 0 8px;
      text-align: right;
      color: var(--muted);
      user-select: none;
      border-right: 1px solid var(--border);
      flex-shrink: 0;
    }
    .line-sign {
      width: 20px;
      text-align: center;
      color: var(--muted);
      user-select: none;
      flex-shrink: 0;
    }
    .diff-line.add .line-sign { color: var(--add-text); }
    .diff-line.del .line-sign { color: var(--del-text); }
    .line-content {
      flex: 1;
      padding: 0 12px;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: break-word;
    }
    .line-content.empty { color: var(--muted); font-style: italic; }

    .has-comment { position: relative; }
    .has-comment::after {
      content: '';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }

    .floating {
      position: fixed;
      z-index: 20;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      width: min(420px, calc(100vw - 32px));
      box-shadow: 0 16px 40px var(--shadow-color);
      display: none;
    }
    .floating header {
      position: static;
      background: transparent;
      backdrop-filter: none;
      border: none;
      padding: 0 0 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .floating h2 { font-size: 14px; margin: 0; font-weight: 600; }
    .floating button {
      background: var(--accent);
      color: var(--text-inverse);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .floating textarea {
      width: 100%;
      min-height: 100px;
      resize: vertical;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      padding: 10px;
      font-size: 13px;
      font-family: inherit;
    }
    .floating textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    .floating .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 10px;
    }
    .floating .actions button.primary {
      background: #238636;
      color: #fff;
    }

    .comment-list {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: 300px;
      max-height: 50vh;
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--panel-alpha);
      backdrop-filter: blur(6px);
      padding: 12px;
      box-shadow: 0 16px 40px var(--shadow-color);
    }
    .comment-list h3 { margin: 0 0 8px; font-size: 13px; color: var(--muted); font-weight: 600; }
    .comment-list ol { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.5; }
    .comment-list li { margin-bottom: 6px; cursor: pointer; }
    .comment-list li:hover { color: var(--accent); }
    .comment-list .hint { color: var(--muted); font-size: 11px; margin-top: 8px; }
    .comment-list.collapsed { opacity: 0; pointer-events: none; transform: translateY(8px); }
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: var(--selected-bg); border: 1px solid var(--border); font-size: 12px; cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
    .pill:hover { background: var(--hover-bg); border-color: var(--accent); }
    .pill strong { font-weight: 700; }

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
    /* Submit modal: top-right position, no blocking overlay */
    #submit-modal {
      background: transparent;
      pointer-events: none;
      align-items: flex-start;
      justify-content: flex-end;
    }
    #submit-modal.visible { display: flex; }
    #submit-modal .modal-dialog {
      pointer-events: auto;
      margin: 60px 20px 20px 20px; /* top margin avoids header button overlap */
    }
    .modal-dialog {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 20px 40px var(--shadow-color);
    }
    .modal-dialog h3 { margin: 0 0 12px; font-size: 18px; color: var(--accent); }
    .modal-summary { color: var(--muted); font-size: 13px; margin-bottom: 12px; }
    .modal-dialog label { display: block; font-size: 13px; margin-bottom: 6px; color: var(--muted); }
    .modal-dialog textarea {
      width: 100%;
      min-height: 100px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      padding: 10px;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
    .modal-actions button {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--selected-bg);
      color: var(--text);
      cursor: pointer;
      font-size: 14px;
    }
    .modal-actions button:hover { background: var(--border); }
    .modal-actions button.primary { background: var(--accent); color: var(--text-inverse); border-color: var(--accent); }
    .image-attach-area { margin: 12px 0; }
    .image-attach-area label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .image-attach-area.image-attach-small { margin: 8px 0; }
    .image-attach-area.image-attach-small label { font-size: 11px; }
    .image-preview-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 24px; }
    .image-preview-item { position: relative; }
    .image-preview-item img { max-width: 80px; max-height: 60px; border-radius: 4px; border: 1px solid var(--border); object-fit: cover; }
    .image-preview-item .remove-image { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--error, #ef4444); color: #fff; border: none; cursor: pointer; font-size: 12px; line-height: 1; display: flex; align-items: center; justify-content: center; }
    .image-preview-item .remove-image:hover { background: #dc2626; }

    .modal-checkboxes { margin: 12px 0; }
    .modal-checkboxes label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: var(--text);
      margin-bottom: 8px;
      cursor: pointer;
    }
    .modal-checkboxes input[type="checkbox"] {
      margin-top: 2px;
      accent-color: var(--accent);
    }

    .no-diff {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted);
    }
    .no-diff h2 { font-size: 20px; margin: 0 0 8px; color: var(--text); }
    .no-diff p { font-size: 14px; margin: 0; }

    /* History Panel - Push layout */
    body { transition: margin-right 0.25s ease; }
    body.history-open { margin-right: 320px; }
    body.history-open header { right: 320px; }
    header { transition: right 0.25s ease; right: 0; }

    .history-toggle {
      background: var(--selected-bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 14px;
      cursor: pointer;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .history-toggle:hover { background: var(--border); }
    .history-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: var(--panel);
      border-left: 1px solid var(--border);
      z-index: 90;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      display: flex;
      flex-direction: column;
    }
    .history-panel.open { transform: translateX(0); }
    .history-panel-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .history-panel-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
    .history-panel-close {
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
    }
    .history-panel-close:hover { color: var(--text); }
    .history-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .history-empty {
      color: var(--muted);
      font-size: 13px;
      text-align: center;
      padding: 40px 20px;
    }
    .history-date-group {
      margin-bottom: 16px;
    }
    .history-date {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .history-item {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .history-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: var(--selected-bg);
      cursor: pointer;
    }
    .history-item-header:hover { background: var(--border); }
    .history-item-file {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
    .history-item-time {
      font-size: 10px;
      color: var(--muted);
    }
    .history-item-body {
      display: none;
      padding: 10px;
      font-size: 12px;
      border-top: 1px solid var(--border);
    }
    .history-item.expanded .history-item-body { display: block; }
    .history-summary {
      color: var(--text);
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .history-summary-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .history-summary-text {
      white-space: pre-wrap;
      line-height: 1.4;
    }
    .history-comments-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .history-comment {
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .history-comment:last-child { border-bottom: none; }
    .history-comment-line {
      font-size: 10px;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .history-comment-quote {
      background: rgba(0, 0, 0, 0.3);
      border-left: 2px solid var(--accent);
      padding: 4px 8px;
      margin: 4px 0;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--muted);
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 80px;
      overflow-y: auto;
    }
    .history-comment-text {
      color: var(--text);
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .history-badge {
      display: inline-block;
      background: var(--accent);
      color: var(--text-inverse);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 6px;
    }

    /* Past comment indicator on lines */
    .diff-line[data-has-history]::before {
      content: '💬';
      position: absolute;
      left: 4px;
      font-size: 10px;
      opacity: 0.6;
    }
    .diff-line { position: relative; }
    .past-comment-overlay {
      background: var(--selected-bg);
      border-left: 3px solid var(--muted);
      margin: 0;
      padding: 8px 12px;
      font-size: 11px;
      color: var(--muted);
      display: none;
    }
    .past-comment-overlay.visible { display: block; }
    .past-comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .past-comment-date {
      font-size: 10px;
      color: var(--muted);
    }
    .past-comment-toggle {
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 10px;
      padding: 2px 4px;
    }
    .past-comment-toggle:hover { color: var(--text); }
    .past-comment-text {
      color: var(--text);
      white-space: pre-wrap;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <header>
    <div class="meta">
      <h1>${projectRoot ? `<span class="title-path">${projectRoot}</span>` : ""}<span class="title-file">${relativePath}</span></h1>
      <span class="badge">${fileCount} file${fileCount !== 1 ? "s" : ""} changed</span>
      <button class="pill" id="pill-comments" title="Toggle comment panel">Comments <strong id="comment-count">0</strong></button>
    </div>
    <div class="actions">
      <button class="history-toggle" id="history-toggle" title="Review History">☰</button>
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme"><span id="theme-icon">🌙</span></button>
      <button id="send-and-exit">Submit & Exit</button>
    </div>
  </header>

  <!-- History Panel -->
  <aside class="history-panel" id="history-panel">
    <div class="history-panel-header">
      <h3>📜 Review History</h3>
      <button class="history-panel-close" id="history-panel-close">✕</button>
    </div>
    <div class="history-panel-body" id="history-panel-body">
      <div class="history-empty">No review history yet.</div>
    </div>
  </aside>

  <div class="wrap">
    ${rows.length === 0 ? '<div class="no-diff"><h2>No changes</h2><p>Working tree is clean</p></div>' : '<div class="diff-container" id="diff-container"></div>'}
  </div>

  <div class="floating" id="comment-card">
    <header>
      <h2 id="card-title">Line Comment</h2>
      <div style="display:flex; gap:6px;">
        <button id="close-card">Close</button>
        <button id="clear-comment">Delete</button>
      </div>
    </header>
    <div id="cell-preview" style="font-size:11px; color: var(--muted); margin-bottom:8px; white-space: pre-wrap; max-height: 60px; overflow: hidden;"></div>
    <textarea id="comment-input" placeholder="Enter your comment"></textarea>
    <div class="image-attach-area image-attach-small" id="comment-image-area">
      <label>📎 Image (⌘V, max 1)</label>
      <div class="image-preview-list" id="comment-image-preview"></div>
    </div>
    <div class="actions">
      <button class="primary" id="save-comment">Save</button>
    </div>
  </div>

  <aside class="comment-list collapsed">
    <h3>Comments</h3>
    <ol id="comment-list"></ol>
    <p class="hint">Click "Submit & Exit" to finish review.</p>
  </aside>

  <div class="modal-overlay" id="submit-modal">
    <div class="modal-dialog">
      <h3>Submit Review</h3>
      <p class="modal-summary" id="modal-summary"></p>
      <label for="global-comment">Overall comment (optional)</label>
      <textarea id="global-comment" placeholder="Add a summary or overall feedback..."></textarea>
      <div class="image-attach-area" id="submit-image-area">
        <label>📎 Attach images (⌘V to paste, max 5)</label>
        <div class="image-preview-list" id="submit-image-preview"></div>
      </div>
      <div class="modal-checkboxes">
        <label><input type="checkbox" id="prompt-subagents" checked /> 🤖 Delegate to sub-agents (implement, verify, report)</label>
        <label><input type="checkbox" id="prompt-reviw" checked /> 👁️ Open in REVIW next time</label>
        <label><input type="checkbox" id="prompt-screenshots" checked /> 📸 Update all screenshots/videos</label>
        <label><input type="checkbox" id="prompt-user-feedback-todo" checked /> ✅ Add feedback to Todo (require approval)</label>
        <label><input type="checkbox" id="prompt-deep-dive" checked /> 🔍 Probe requirements before implementing</label>
      </div>
      <div class="modal-actions">
        <button id="modal-cancel">Cancel</button>
        <button class="primary" id="modal-submit">Submit</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${serialized};
    const FILE_NAME = ${serializeForScript(relativePath)};
    const MODE = 'diff';
    const HISTORY_DATA = ${historyJson};

    // Theme
    (function initTheme() {
      const toggle = document.getElementById('theme-toggle');
      const icon = document.getElementById('theme-icon');
      function getSystem() { return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
      function getStored() { return localStorage.getItem('reviw-theme'); }
      function set(t) {
        if (t === 'light') { document.documentElement.setAttribute('data-theme', 'light'); icon.textContent = '☀️'; }
        else { document.documentElement.removeAttribute('data-theme'); icon.textContent = '🌙'; }
        localStorage.setItem('reviw-theme', t);
      }
      set(getStored() || getSystem());
      toggle.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        set(cur === 'light' ? 'dark' : 'light');
      });
    })();

    // --- History Management ---
    // History is now server-side (file-based), HISTORY_DATA is provided by server

    function loadHistory() {
      // Return server-provided history data
      return Array.isArray(HISTORY_DATA) ? HISTORY_DATA : [];
    }

    // saveToHistory is handled server-side via /exit endpoint
    function saveToHistory(payload) {
      // No-op on client - server saves history when receiving /exit
    }

    function formatDate(isoString) {
      const d = new Date(isoString);
      return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function formatTime(isoString) {
      const d = new Date(isoString);
      return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    function getBasename(filepath) {
      return filepath.split('/').pop() || filepath;
    }

    function renderHistoryPanel() {
      const body = document.getElementById('history-panel-body');
      const history = loadHistory();
      if (history.length === 0) {
        body.innerHTML = '<div class="history-empty">No review history yet.</div>';
        return;
      }

      const grouped = {};
      history.forEach((item, idx) => {
        const date = formatDate(item.submittedAt);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ ...item, _idx: idx });
      });

      let html = '';
      for (const date of Object.keys(grouped)) {
        html += \`<div class="history-date-group">
          <div class="history-date">\${date}</div>\`;
        for (const item of grouped[date]) {
          const commentCount = item.comments?.length || 0;
          html += \`<div class="history-item" data-idx="\${item._idx}">
            <div class="history-item-header">
              <span class="history-item-file">\${getBasename(item.file)}</span>
              <span class="history-item-time">\${formatTime(item.submittedAt)}<span class="history-badge">\${commentCount}</span></span>
            </div>
            <div class="history-item-body">\`;
          if (item.summary) {
            html += \`<div class="history-summary">
              <div class="history-summary-label">Summary</div>
              <div class="history-summary-text">\${escapeHtmlForHistory(item.summary)}</div>
            </div>\`;
          }
          if (commentCount > 0) {
            html += \`<div class="history-comments-label">Line Comments (\${commentCount})</div>\`;
            for (const c of item.comments) {
              const lineLabel = c.line ? \`L\${c.line}\${c.lineEnd ? '-' + c.lineEnd : ''}\` : (c.row != null ? \`L\${c.row}\` : '');
              const text = c.comment || c.text || '';
              // Support both direct content and context.content structures
              const content = c.content || c.context?.content || '';
              html += \`<div class="history-comment">
                <div class="history-comment-line">\${lineLabel}</div>\`;
              if (content) {
                html += \`<div class="history-comment-quote">\${escapeHtmlForHistory(content)}</div>\`;
              }
              html += \`<div class="history-comment-text">\${escapeHtmlForHistory(text)}</div>
              </div>\`;
            }
          }
          html += \`</div></div>\`;
        }
        html += \`</div>\`;
      }
      body.innerHTML = html;

      body.querySelectorAll('.history-item-header').forEach(header => {
        header.addEventListener('click', () => {
          header.parentElement.classList.toggle('expanded');
        });
      });
    }

    function escapeHtmlForHistory(s) {
      if (!s) return '';
      return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c));
    }

    function getHistoryForFile(filename) {
      const history = loadHistory();
      return history.filter(h => h.file === filename || getBasename(h.file) === getBasename(filename));
    }

    function renderPastCommentsOnLines() {
      const fileHistory = getHistoryForFile(FILE_NAME);
      if (fileHistory.length === 0) return;

      const lineComments = {};
      fileHistory.forEach(h => {
        if (!h.comments) return;
        h.comments.forEach(c => {
          const line = c.line || c.row;
          if (!line) return;
          if (!lineComments[line]) lineComments[line] = [];
          lineComments[line].push({
            date: formatDate(h.submittedAt),
            text: c.comment || c.text || ''
          });
        });
      });

      Object.entries(lineComments).forEach(([line, comments]) => {
        const lineEl = document.querySelector('[data-row="' + line + '"]');
        if (lineEl && !lineEl.dataset.hasHistory) {
          lineEl.dataset.hasHistory = 'true';
          lineEl.title = comments.length + ' past comment(s) - click to view in History panel';
        }
      });
    }

    // History Panel Toggle
    (function initHistoryPanel() {
      const toggle = document.getElementById('history-toggle');
      const panel = document.getElementById('history-panel');
      const closeBtn = document.getElementById('history-panel-close');

      function openPanel() {
        panel.classList.add('open');
        document.body.classList.add('history-open');
        renderHistoryPanel();
      }

      function closePanel() {
        panel.classList.remove('open');
        document.body.classList.remove('history-open');
      }

      toggle?.addEventListener('click', () => {
        if (panel.classList.contains('open')) {
          closePanel();
        } else {
          openPanel();
        }
      });

      closeBtn?.addEventListener('click', closePanel);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('open')) {
          closePanel();
        }
      });
    })();

    const container = document.getElementById('diff-container');
    const card = document.getElementById('comment-card');
    const commentInput = document.getElementById('comment-input');
    const cardTitle = document.getElementById('card-title');
    const cellPreview = document.getElementById('cell-preview');
    const commentList = document.getElementById('comment-list');
    const commentCount = document.getElementById('comment-count');
    const commentPanel = document.querySelector('.comment-list');
    const pillComments = document.getElementById('pill-comments');

    const comments = {};
    let currentKey = null;
    let panelOpen = false;
    let isDragging = false;
    let dragStart = null;
    let dragEnd = null;
    let selection = null;

    // Image attachment state
    const submitImages = []; // base64 images for submit modal (max 5)
    let currentCommentImage = null; // base64 image for current comment (max 1)

    // Image attachment handlers
    const submitImagePreview = document.getElementById('submit-image-preview');
    const commentImagePreview = document.getElementById('comment-image-preview');

    function addImageToPreview(container, images, maxCount, base64) {
      if (images.length >= maxCount) return;
      images.push(base64);
      renderImagePreviews(container, images);
    }

    function renderImagePreviews(container, images) {
      container.innerHTML = '';
      images.forEach((base64, idx) => {
        const item = document.createElement('div');
        item.className = 'image-preview-item';
        item.innerHTML = \`<img src="\${base64}" alt="attached image"><button class="remove-image" data-idx="\${idx}">×</button>\`;
        item.querySelector('.remove-image').addEventListener('click', () => {
          images.splice(idx, 1);
          renderImagePreviews(container, images);
        });
        container.appendChild(item);
      });
    }

    function renderCommentImagePreview() {
      commentImagePreview.innerHTML = '';
      if (currentCommentImage) {
        const item = document.createElement('div');
        item.className = 'image-preview-item';
        item.innerHTML = \`<img src="\${currentCommentImage}" alt="attached image"><button class="remove-image">×</button>\`;
        item.querySelector('.remove-image').addEventListener('click', () => {
          currentCommentImage = null;
          renderCommentImagePreview();
        });
        commentImagePreview.appendChild(item);
      }
    }

    // Global paste handler
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            const activeEl = document.activeElement;
            // Prioritize comment card if its textarea has focus
            if (card.style.display !== 'none' && activeEl === commentInput) {
              if (!currentCommentImage) {
                currentCommentImage = base64;
                renderCommentImagePreview();
              }
            } else if (submitModal.classList.contains('visible')) {
              addImageToPreview(submitImagePreview, submitImages, 5, base64);
            } else if (card.style.display !== 'none') {
              if (!currentCommentImage) {
                currentCommentImage = base64;
                renderCommentImagePreview();
              }
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    });

    function makeKey(start, end) {
      return start === end ? String(start) : (start + '-' + end);
    }

    function keyToRange(key) {
      if (!key) return null;
      if (String(key).includes('-')) {
        const [a, b] = String(key).split('-').map((n) => parseInt(n, 10));
        return { start: Math.min(a, b), end: Math.max(a, b) };
      }
      const n = parseInt(key, 10);
      return { start: n, end: n };
    }

    // localStorage
    const STORAGE_KEY = 'reviw:comments:' + FILE_NAME;
    const STORAGE_TTL = 3 * 60 * 60 * 1000;
    function saveToStorage() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ comments: { ...comments }, timestamp: Date.now() })); } catch (_) {}
    }
    function loadFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (Date.now() - d.timestamp > STORAGE_TTL) { localStorage.removeItem(STORAGE_KEY); return null; }
        return d;
      } catch (_) { return null; }
    }
    function clearStorage() { try { localStorage.removeItem(STORAGE_KEY); } catch (_) {} }

    function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c)); }

    function clearSelectionHighlight() {
      container?.querySelectorAll('.diff-line.selected').forEach(el => el.classList.remove('selected'));
    }

    function updateSelectionHighlight() {
      clearSelectionHighlight();
      if (!selection) return;
      for (let r = selection.start; r <= selection.end; r++) {
        const el = container?.querySelector('[data-row="' + r + '"]');
        if (el) el.classList.add('selected');
      }
    }

    function beginDrag(row) {
      isDragging = true;
      document.body.classList.add('dragging');
      dragStart = row;
      dragEnd = row;
      selection = { start: row, end: row };
      updateSelectionHighlight();
    }

    function updateDrag(row) {
      if (!isDragging) return;
      const next = Math.max(0, Math.min(DATA.length - 1, row));
      if (next === dragEnd) return;
      dragEnd = next;
      selection = { start: Math.min(dragStart, dragEnd), end: Math.max(dragStart, dragEnd) };
      updateSelectionHighlight();
    }

    function finishDrag() {
      if (!isDragging) return;
      isDragging = false;
      document.body.classList.remove('dragging');
      if (!selection) { clearSelectionHighlight(); return; }
      openCardRange(selection.start, selection.end);
    }

    const expandedFiles = {};
    const PREVIEW_LINES = 10;

    function renderDiff() {
      if (!container) return;
      container.innerHTML = '';
      let currentFileIdx = null;
      let currentFileContent = null;
      let fileLineCount = 0;
      let hiddenWrapper = null;
      let hiddenCount = 0;

      DATA.forEach((row, idx) => {
        const div = document.createElement('div');
        div.className = 'diff-line';
        div.dataset.row = idx;

        if (row.type === 'file') {
          currentFileIdx = row.fileIndex;
          fileLineCount = 0;
          hiddenWrapper = null;
          hiddenCount = 0;

          div.classList.add('file-header');
          const leftSpan = document.createElement('span');
          leftSpan.className = 'file-header-left';
          leftSpan.innerHTML = '<span>' + escapeHtml(row.content) + '</span>';
          if (row.lineCount > 0) {
            leftSpan.innerHTML += '<span class="file-header-info">(' + row.lineCount + ' lines)</span>';
          }
          div.appendChild(leftSpan);
          div.style.cursor = 'default';
          container.appendChild(div);

          currentFileContent = document.createElement('div');
          currentFileContent.className = 'file-content';
          currentFileContent.dataset.fileIndex = row.fileIndex;
          container.appendChild(currentFileContent);
        } else if (row.type === 'hunk') {
          div.classList.add('hunk-header');
          div.innerHTML = '<span class="line-content">' + escapeHtml(row.content) + '</span>';
          if (currentFileContent) currentFileContent.appendChild(div);
          else container.appendChild(div);
        } else {
          fileLineCount++;
          const isExpanded = expandedFiles[currentFileIdx];
          const fileRow = DATA.find(r => r.type === 'file' && r.fileIndex === currentFileIdx);
          const shouldCollapse = fileRow && fileRow.collapsed && !isExpanded;

          div.classList.add(row.type);
          const sign = row.type === 'add' ? '+' : row.type === 'del' ? '-' : ' ';
          div.innerHTML = '<span class="line-num">' + (idx + 1) + '</span>' +
            '<span class="line-sign">' + sign + '</span>' +
            '<span class="line-content' + (row.content === '' ? ' empty' : '') + '">' + escapeHtml(row.content || '(empty line)') + '</span>';

          if (shouldCollapse && fileLineCount > PREVIEW_LINES) {
            if (!hiddenWrapper) {
              hiddenWrapper = document.createElement('div');
              hiddenWrapper.className = 'hidden-lines';
              hiddenWrapper.dataset.fileIndex = currentFileIdx;
              currentFileContent.appendChild(hiddenWrapper);
            }
            hiddenWrapper.appendChild(div);
            hiddenCount++;
          } else {
            if (currentFileContent) currentFileContent.appendChild(div);
            else container.appendChild(div);
          }
        }

        // Insert "Load more" button after processing file content
        const nextRow = DATA[idx + 1];
        if (hiddenWrapper && hiddenCount > 0 && (nextRow?.type === 'file' || idx === DATA.length - 1)) {
          const loadMore = document.createElement('div');
          loadMore.className = 'load-more-row';
          const fileIdxForClick = currentFileIdx;
          const count = hiddenCount;
          loadMore.innerHTML = '<span class="expand-icon">▼</span> Show ' + count + ' more lines';
          loadMore.addEventListener('click', function() {
            expandedFiles[fileIdxForClick] = true;
            renderDiff();
          });
          currentFileContent.insertBefore(loadMore, hiddenWrapper);
          hiddenWrapper = null;
          hiddenCount = 0;
        }
      });
    }

    function openCardRange(startRow, endRow) {
      const start = Math.min(startRow, endRow);
      const end = Math.max(startRow, endRow);
      const first = DATA[start];
      const last = DATA[end];
      if (!first || first.type === 'file' || first.type === 'hunk') return;
      selection = { start, end };
      currentKey = makeKey(start, end);
      const label = start === end
        ? 'Comment on line ' + (start + 1)
        : 'Comment on lines ' + (start + 1) + '–' + (end + 1);
      cardTitle.textContent = label;
      const previewText = start === end
        ? (first.content || '(empty)')
        : (first.content || '(empty)') + ' … ' + (last.content || '(empty)');
      cellPreview.textContent = previewText;
      commentInput.value = comments[currentKey]?.text || '';
      card.style.display = 'block';
      positionCard(start);
      commentInput.focus();
      updateSelectionHighlight();
    }

    function positionCard(rowIdx) {
      const el = container.querySelector('[data-row="' + rowIdx + '"]');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cardW = 420, cardH = 260;
      const margin = 12;
      let left = rect.right + margin;
      let top = rect.top;
      if (left + cardW > window.innerWidth) {
        left = rect.left - cardW - margin;
      }
      if (left < margin) left = margin;
      if (top + cardH > window.innerHeight) {
        top = window.innerHeight - cardH - margin;
      }
      card.style.left = left + 'px';
      card.style.top = Math.max(margin, top) + 'px';
    }

    function closeCard() {
      card.style.display = 'none';
      currentKey = null;
      selection = null;
      clearSelectionHighlight();
    }

    function setDotRange(start, end, on) {
      for (let r = start; r <= end; r++) {
        const el = container?.querySelector('[data-row="' + r + '"]');
        if (el) el.classList.toggle('has-comment', on);
      }
    }

    function refreshList() {
      commentList.innerHTML = '';
      const items = Object.values(comments).sort((a, b) => (a.startRow ?? a.row) - (b.startRow ?? b.row));
      commentCount.textContent = items.length;
      if (items.length === 0) panelOpen = false;
      commentPanel.classList.toggle('collapsed', !panelOpen || items.length === 0);
      if (!items.length) {
        const li = document.createElement('li');
        li.className = 'hint';
        li.textContent = 'No comments yet';
        commentList.appendChild(li);
        return;
      }
      items.forEach(c => {
        const li = document.createElement('li');
        const label = c.isRange
          ? 'L' + (c.startRow + 1) + '-L' + (c.endRow + 1)
          : 'L' + (c.row + 1);
        li.innerHTML = '<strong>' + label + '</strong> ' + escapeHtml(c.text.slice(0, 50)) + (c.text.length > 50 ? '...' : '');
        li.addEventListener('click', () => openCardRange(c.startRow ?? c.row, c.endRow ?? c.row));
        commentList.appendChild(li);
      });
    }

    pillComments.addEventListener('click', () => {
      panelOpen = !panelOpen;
      if (panelOpen && Object.keys(comments).length === 0) panelOpen = false;
      commentPanel.classList.toggle('collapsed', !panelOpen);
    });

    function saveCurrent() {
      if (currentKey == null) return;
      const text = commentInput.value.trim();
      const range = keyToRange(currentKey);
      if (!range) return;
      const rowIdx = range.start;
      if (text || currentCommentImage) {
        if (range.start === range.end) {
          comments[currentKey] = { row: rowIdx, text, content: DATA[rowIdx]?.content || '' };
        } else {
          comments[currentKey] = {
            startRow: range.start,
            endRow: range.end,
            isRange: true,
            text,
            content: DATA.slice(range.start, range.end + 1).map(r => r?.content || '').join('\\n')
          };
        }
        if (currentCommentImage) {
          comments[currentKey].image = currentCommentImage;
        }
        setDotRange(range.start, range.end, true);
      } else {
        delete comments[currentKey];
        setDotRange(range.start, range.end, false);
      }
      currentCommentImage = null;
      renderCommentImagePreview();
      refreshList();
      closeCard();
      saveToStorage();
    }

    function clearCurrent() {
      if (currentKey == null) return;
      const range = keyToRange(currentKey);
      if (!range) return;
      delete comments[currentKey];
      setDotRange(range.start, range.end, false);
      refreshList();
      closeCard();
      saveToStorage();
    }

    document.getElementById('save-comment').addEventListener('click', saveCurrent);
    document.getElementById('clear-comment').addEventListener('click', clearCurrent);
    document.getElementById('close-card').addEventListener('click', closeCard);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        // Don't close card if any fullscreen overlay is open
        const imageOverlay = document.getElementById('image-fullscreen');
        const videoOverlay = document.getElementById('video-fullscreen');
        const mermaidOverlay = document.getElementById('mermaid-fullscreen');
        if (imageOverlay?.classList.contains('visible') ||
            videoOverlay?.classList.contains('visible') ||
            mermaidOverlay?.classList.contains('visible')) {
          return; // Let the fullscreen handlers handle ESC
        }
        closeCard();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveCurrent();
    });

    container?.addEventListener('mousedown', e => {
      const line = e.target.closest('.diff-line');
      if (!line || line.classList.contains('file-header') || line.classList.contains('hunk-header')) return;
      e.preventDefault();
      if (window.getSelection) { const sel = window.getSelection(); if (sel && sel.removeAllRanges) sel.removeAllRanges(); }
      beginDrag(parseInt(line.dataset.row, 10));
    });

    container?.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const line = e.target.closest('.diff-line');
      if (!line || line.classList.contains('file-header') || line.classList.contains('hunk-header')) return;
      updateDrag(parseInt(line.dataset.row, 10));
    });

    container?.addEventListener('mouseup', () => finishDrag());
    window.addEventListener('mouseup', () => { if (isDragging) finishDrag(); });

    // Submit
    let sent = false;
    let globalComment = '';
    const submitModal = document.getElementById('submit-modal');
    const modalSummary = document.getElementById('modal-summary');
    const globalCommentInput = document.getElementById('global-comment');

    // Prompt checkboxes - text is the strong enforcement prompt for YAML output
    const promptCheckboxes = [
      { id: 'prompt-subagents', text: 'MANDATORY: You MUST delegate ALL implementation, verification, and report creation to sub-agents. Direct execution on the main thread is PROHIBITED.' },
      { id: 'prompt-reviw', text: 'REQUIRED: Before reporting completion, you MUST open the result in REVIW for user review. Skipping this step is NOT allowed.' },
      { id: 'prompt-screenshots', text: 'MANDATORY: You MUST update ALL screenshots and videos as evidence. Reports without visual proof are REJECTED.' },
      { id: 'prompt-user-feedback-todo', text: "STRICT RULE: Add ALL user feedback to the Todo list. You are FORBIDDEN from marking any item complete without explicit user approval." },
      { id: 'prompt-deep-dive', text: "REQUIRED: Before ANY implementation, you MUST deeply probe the user's requirements using AskUserQuestion and EnterPlanMode. Starting implementation without thorough requirement analysis is PROHIBITED." }
    ];
    const PROMPT_STORAGE_KEY = 'reviw-prompt-prefs';

    // Load saved preferences
    function loadPromptPrefs() {
      try {
        const saved = localStorage.getItem(PROMPT_STORAGE_KEY);
        if (saved) {
          const prefs = JSON.parse(saved);
          promptCheckboxes.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && typeof prefs[p.id] === 'boolean') el.checked = prefs[p.id];
          });
        }
      } catch (e) {}
    }

    // Save preferences
    function savePromptPrefs() {
      try {
        const prefs = {};
        promptCheckboxes.forEach(p => {
          const el = document.getElementById(p.id);
          if (el) prefs[p.id] = el.checked;
        });
        localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(prefs));
      } catch (e) {}
    }

    // Initialize checkbox listeners
    promptCheckboxes.forEach(p => {
      const el = document.getElementById(p.id);
      if (el) el.addEventListener('change', savePromptPrefs);
    });
    loadPromptPrefs();

    function getSelectedPrompts() {
      const prompts = [];
      promptCheckboxes.forEach(p => {
        const el = document.getElementById(p.id);
        if (el && el.checked) prompts.push(p.text);
      });
      return prompts;
    }

    function payload(reason) {
      const data = { file: FILE_NAME, mode: MODE, submittedBy: reason, submittedAt: new Date().toISOString(), comments: Object.values(comments) };
      if (globalComment.trim()) data.summary = globalComment.trim();
      if (submitImages.length > 0) data.summaryImages = submitImages;
      const prompts = getSelectedPrompts();
      if (prompts.length > 0) data.prompts = prompts;
      return data;
    }
    async function sendAndExit(reason = 'button') {
      if (sent) return;
      sent = true;
      clearStorage();
      const p = payload(reason);
      saveToHistory(p);
      try {
        // Use fetch with keepalive to handle large payloads (images)
        await fetch('/exit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
          // Note: keepalive has 64KB limit like sendBeacon, so we don't use it for large payloads
        });
      } catch (err) {
        console.error('Failed to send exit request:', err);
      }
    }
    function showSubmitModal() {
      const count = Object.keys(comments).length;
      modalSummary.textContent = count === 0 ? 'No comments added yet.' : count + ' comment' + (count === 1 ? '' : 's') + ' will be submitted.';
      globalCommentInput.value = globalComment;
      submitModal.classList.add('visible');
      globalCommentInput.focus();
    }
    function hideSubmitModal() { submitModal.classList.remove('visible'); }
    document.getElementById('send-and-exit').addEventListener('click', showSubmitModal);
    document.getElementById('modal-cancel').addEventListener('click', hideSubmitModal);
    async function doSubmit() {
      globalComment = globalCommentInput.value;
      savePromptPrefs();
      hideSubmitModal();
      await sendAndExit('button');
      // Try to close window; if it fails (browser security), show completion message
      setTimeout(() => {
        window.close();
        // If window.close() didn't work, show a completion message
        setTimeout(() => {
          document.body.innerHTML = \`
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:var(--bg,#1a1a2e);color:var(--text,#e0e0e0);font-family:system-ui,sans-serif;">
              <h1 style="font-size:2rem;margin-bottom:1rem;">✅ Review Submitted</h1>
              <p style="color:var(--muted,#888);">You can close this tab now.</p>
            </div>
          \`;
        }, 100);
      }, 200);
    }
    document.getElementById('modal-submit').addEventListener('click', doSubmit);
    globalCommentInput.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        doSubmit();
      }
    });
    submitModal.addEventListener('click', e => { if (e.target === submitModal) hideSubmitModal(); });

    // SSE
    (() => {
      let es = null;
      const connect = () => {
        es = new EventSource('/sse');
        es.onmessage = ev => {
          if (ev.data === 'reload') location.reload();
          if (ev.data === 'submitted') {
            // Another tab submitted - try to close this tab
            window.close();
            // If window.close() didn't work, show completion message
            setTimeout(() => {
              document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:var(--bg,#1a1a2e);color:var(--text,#e0e0e0);font-family:system-ui,sans-serif;"><h1 style="font-size:2rem;margin-bottom:1rem;">✅ Review Submitted</h1><p style="color:var(--muted,#888);">Submitted from another tab. You can close this tab now.</p></div>';
            }, 100);
          }
        };
        es.onerror = () => { es.close(); setTimeout(connect, 1500); };
      };
      connect();
    })();

    renderDiff();
    refreshList();
    renderPastCommentsOnLines();

    // Recovery
    (function checkRecovery() {
      const stored = loadFromStorage();
      if (!stored || Object.keys(stored.comments).length === 0) return;
      if (confirm('Restore ' + Object.keys(stored.comments).length + ' previous comment(s)?')) {
        Object.assign(comments, stored.comments);
        Object.values(stored.comments).forEach(c => setDot(c.row, true));
        refreshList();
      } else {
        clearStorage();
      }
    })();
  </script>
</body>
</html>`;
}

// --- HTML template ---------------------------------------------------------
function htmlTemplate(dataRows, cols, projectRoot, relativePath, mode, previewHtml, reviwQuestions = [], history = []) {
  const serialized = serializeForScript(dataRows);
  const modeJson = serializeForScript(mode);
  const titleJson = serializeForScript(relativePath); // Use relativePath as file identifier
  const questionsJson = serializeForScript(reviwQuestions || []);
  const historyJson = serializeForScript(history);
  const hasPreview = !!previewHtml;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <title>${relativePath} | reviw</title>
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
      --error: #dc3545;
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
      --error: #dc3545;
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
    header h1 { display: flex; flex-direction: column; margin: 0; line-height: 1.3; }
    header h1 .title-path { font-size: 11px; font-weight: 400; color: var(--muted); }
    header h1 .title-file { font-size: 16px; font-weight: 700; }
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

    .wrap { padding: 12px 16px 12px; }
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
      background: var(--panel-solid) !important;
      color: var(--muted);
      font-size: 12px;
      text-align: center;
      padding: 0;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      white-space: nowrap;
      transition: background 200ms ease;
    }
    thead th:not(.selected) {
      background: var(--panel-solid) !important;
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
    td.selected, tbody th.selected { background: rgba(99,102,241,0.22) !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }
    thead th.selected { background: #c7d2fe !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }
    [data-theme="dark"] thead th.selected { background: #3730a3 !important; }
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
      position: static;
      background: transparent;
      backdrop-filter: none;
      border: none;
      padding: 0 0 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .floating textarea:focus {
      outline: none;
      border-color: var(--accent);
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
    .pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: var(--selected-bg); border: 1px solid var(--border); font-size: 12px; color: var(--text); cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
    .pill:hover { background: var(--hover-bg); border-color: var(--accent); }
    .pill strong { color: var(--text); font-weight: 700; }
    .comment-list.collapsed {
      opacity: 0;
      pointer-events: none;
      transform: translateY(8px) scale(0.98);
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
      height: calc(100vh - 80px);
    }
    .md-left {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      overflow-x: auto;
      overscroll-behavior: contain;
    }
    .md-left .md-preview {
      max-height: none;
    }
    .md-right {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
      overflow-x: auto;
      overscroll-behavior: contain;
    }
    .md-right .table-box {
      max-width: none;
      min-width: 0;
      max-height: none;
      overflow: visible;
    }
    /* Ensure thead is opaque in md-right to prevent content showing through */
    .md-right thead th {
      background: var(--panel-solid) !important;
    }
    .md-right thead th.selected {
      background: #c7d2fe !important;
    }
    [data-theme="dark"] .md-right thead th {
      background: var(--panel-solid) !important;
    }
    [data-theme="dark"] .md-right thead th.selected {
      background: #3730a3 !important;
    }
    .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 {
      margin: 0.4em 0 0.2em;
    }
    .md-preview p { margin: 0.3em 0; line-height: 1.5; }
    .md-preview img { max-width: 100%; height: auto; border-radius: 8px; }
    .md-preview video.video-preview { max-width: 100%; height: auto; border-radius: 8px; background: #000; }
    .md-preview table video.video-preview {
      display: block;
      width: 100%;
      height: auto;
    }
    .md-preview code { background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; }
    .md-preview pre {
      background: var(--code-bg);
      padding: 12px 16px;
      border-radius: 8px;
      overflow: auto;
      border: 1px solid var(--border);
    }
    .md-preview pre code {
      background: none;
      padding: 0;
      font-size: 13px;
      line-height: 1.5;
    }
    .md-preview pre code.hljs {
      background: transparent;
      padding: 0;
    }
    /* YAML Frontmatter table */
    .frontmatter-table {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: var(--panel);
    }
    .frontmatter-table table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .frontmatter-table thead th {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(96, 165, 250, 0.15));
      color: var(--text);
      font-size: 12px;
      font-weight: 600;
      padding: 10px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .frontmatter-table tbody th {
      background: rgba(147, 51, 234, 0.08);
      color: #c084fc;
      font-weight: 500;
      font-size: 12px;
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    .frontmatter-table tbody td {
      padding: 8px 14px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      word-break: break-word;
    }
    .frontmatter-table tbody tr:last-child th,
    .frontmatter-table tbody tr:last-child td {
      border-bottom: none;
    }
    .frontmatter-table .fm-tag {
      display: inline-block;
      background: rgba(96, 165, 250, 0.15);
      color: var(--accent);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      margin-right: 4px;
      margin-bottom: 4px;
    }
    .frontmatter-table pre {
      margin: 0;
      background: var(--code-bg);
      padding: 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    /* Reviw questions preview cards */
    .reviw-questions-preview {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .reviw-q-card {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .reviw-q-card.resolved {
      border-left: 3px solid #22c55e;
    }
    .reviw-q-card.pending {
      border-left: 3px solid #f59e0b;
    }
    .reviw-q-header {
      font-size: 12px;
      color: var(--text-dim);
      margin-bottom: 4px;
    }
    .reviw-q-header strong {
      color: var(--accent);
    }
    .reviw-q-question {
      font-size: 13px;
      color: var(--text);
      margin-bottom: 6px;
    }
    .reviw-q-options {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 6px;
    }
    .reviw-q-answer {
      font-size: 12px;
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
    [data-theme="light"] .frontmatter-table tbody th {
      color: #7c3aed;
    }
    /* Table scroll container and indicator */
    .table-scroll-container {
      position: relative;
      margin: 16px 0;
    }
    .table-scroll-wrapper {
      overflow-x: auto;
      border-radius: 8px;
    }
    .scroll-hint {
      text-align: right;
      font-size: 12px;
      color: var(--accent);
      padding: 4px 8px;
      margin-bottom: 4px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 200ms ease;
    }
    .table-scroll-container.can-scroll .scroll-hint {
      opacity: 0.8;
      visibility: visible;
    }
    .table-scroll-container.scrolled-end .scroll-hint {
      opacity: 0;
      visibility: hidden;
    }
    /* Markdown tables in preview */
    .md-preview table:not(.frontmatter-table table) {
      min-width: 100%;
      width: max-content;
      border-collapse: collapse;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    .md-preview table:not(.frontmatter-table table) th,
    .md-preview table:not(.frontmatter-table table) td {
      padding: 10px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: anywhere;
      width: auto;
    }
    /* Force equal column widths when colgroup is not specified */
    .md-preview table:not(.frontmatter-table table) colgroup ~ * th,
    .md-preview table:not(.frontmatter-table table) colgroup ~ * td {
      width: auto;
    }
    .md-preview table:not(.frontmatter-table table) td:has(video),
    .md-preview table:not(.frontmatter-table table) td:has(img) {
      padding: 4px;
      line-height: 0;
    }
    .md-preview table:not(.frontmatter-table table) td video,
    .md-preview table:not(.frontmatter-table table) td img {
      width: 100%;
      max-width: 100%;
      height: auto;
    }
    .md-preview table:not(.frontmatter-table table) th {
      background: var(--panel);
      font-weight: 600;
      font-size: 13px;
    }
    .md-preview table:not(.frontmatter-table table) td {
      font-size: 13px;
    }
    .md-preview table:not(.frontmatter-table table) tr:last-child td {
      border-bottom: none;
    }
    .md-preview table:not(.frontmatter-table table) tr:hover td {
      background: var(--hover-bg);
    }
    /* Source table (右ペイン) */
    .table-box table {
      table-layout: fixed;
      width: 100%;
    }
    .table-box th,
    .table-box td {
      word-break: break-word;
      min-width: 140px;
    }
    .table-box th:first-child,
    .table-box td:first-child {
      min-width: 320px;
      max-width: 480px;
    }
    /* Image fullscreen overlay */
    .image-fullscreen-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1001;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .image-fullscreen-overlay.visible {
      display: flex;
    }
    .image-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      cursor: pointer;
      color: #fff;
      font-size: 18px;
      z-index: 10;
      backdrop-filter: blur(4px);
      transition: background 120ms ease, transform 120ms ease;
    }
    .image-close-btn:hover {
      background: rgba(0, 0, 0, 0.75);
      transform: scale(1.04);
    }
    .image-container {
      width: 90vw;
      height: 90vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    /* Video fullscreen overlay */
    .video-fullscreen-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 1001;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .video-fullscreen-overlay.visible {
      display: flex;
    }
    .video-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      cursor: pointer;
      color: #fff;
      font-size: 18px;
      z-index: 10;
      backdrop-filter: blur(4px);
      transition: background 120ms ease, transform 120ms ease;
    }
    .video-close-btn:hover {
      background: rgba(0, 0, 0, 0.75);
      transform: scale(1.04);
    }
    .video-container {
      width: 90vw;
      height: 90vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .video-container video {
      max-width: 100%;
      max-height: 100%;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    /* Reviw Questions Modal */
    .reviw-questions-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1100;
      justify-content: center;
      align-items: center;
    }
    .reviw-questions-overlay.visible {
      display: flex;
    }
    .reviw-questions-modal {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
    }
    .reviw-questions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
    }
    .reviw-questions-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }
    .reviw-questions-header h2 span {
      font-size: 14px;
      color: var(--text-dim);
      font-weight: 400;
    }
    .reviw-questions-close {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      font-size: 18px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 150ms ease;
    }
    .reviw-questions-close:hover {
      background: var(--border);
      color: var(--text);
    }
    .reviw-questions-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
    }
    .reviw-questions-footer {
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
    }
    .reviw-questions-later {
      padding: 8px 16px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-dim);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 150ms ease;
    }
    .reviw-questions-later:hover {
      background: var(--border);
      color: var(--text);
    }
    /* Question Item */
    .reviw-question-item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .reviw-question-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .reviw-question-text {
      font-size: 14px;
      color: var(--text);
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .reviw-question-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .reviw-question-option {
      padding: 8px 14px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 150ms ease;
    }
    .reviw-question-option:hover {
      border-color: var(--accent);
      background: rgba(96, 165, 250, 0.1);
    }
    .reviw-question-option.selected {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--text-inverse);
    }
    .reviw-question-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border);
      background: var(--input-bg);
      color: var(--text);
      border-radius: 8px;
      font-size: 13px;
      resize: vertical;
      min-height: 60px;
    }
    .reviw-question-input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .reviw-question-input::placeholder {
      color: var(--text-dim);
    }
    .reviw-check-mark {
      color: #22c55e;
      font-weight: bold;
    }
    .reviw-question-item.answered {
      border-color: #22c55e;
      background: rgba(34, 197, 94, 0.05);
    }
    .reviw-question-submit {
      margin-top: 10px;
      padding: 8px 16px;
      border: none;
      background: var(--accent);
      color: var(--text-inverse);
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 150ms ease;
    }
    .reviw-question-submit:hover {
      filter: brightness(1.1);
    }
    .reviw-question-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    /* Resolved Section */
    .reviw-resolved-section {
      margin-top: 16px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }
    .reviw-resolved-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      color: var(--text-dim);
      font-size: 13px;
      cursor: pointer;
      padding: 4px 0;
    }
    .reviw-resolved-toggle:hover {
      color: var(--text);
    }
    .reviw-resolved-toggle .arrow {
      transition: transform 150ms ease;
    }
    .reviw-resolved-toggle.open .arrow {
      transform: rotate(90deg);
    }
    .reviw-resolved-list {
      display: none;
      margin-top: 12px;
    }
    .reviw-resolved-list.visible {
      display: block;
    }
    .reviw-resolved-item {
      padding: 10px 12px;
      background: var(--input-bg);
      border-radius: 8px;
      margin-bottom: 8px;
      opacity: 0.7;
    }
    .reviw-resolved-item:last-child {
      margin-bottom: 0;
    }
    .reviw-resolved-q {
      font-size: 12px;
      color: var(--text-dim);
      margin-bottom: 4px;
    }
    .reviw-resolved-a {
      font-size: 13px;
      color: var(--text);
    }
    /* Notice Bar */
    .reviw-questions-bar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--accent);
      color: var(--text-inverse);
      padding: 8px 16px;
      font-size: 13px;
      z-index: 1050;
      justify-content: center;
      align-items: center;
      gap: 12px;
    }
    .reviw-questions-bar.visible {
      display: flex;
    }
    .reviw-questions-bar button {
      padding: 4px 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-inverse);
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 150ms ease;
    }
    .reviw-questions-bar button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    /* Adjust layout when bar is visible */
    body.has-questions-bar header {
      top: 36px;
    }
    body.has-questions-bar .toolbar,
    body.has-questions-bar .table-wrap {
      margin-top: 36px;
    }
    /* Copy notification toast */
    .copy-toast {
      position: fixed;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--accent);
      color: var(--text-inverse);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease, transform 200ms ease;
      z-index: 1000;
    }
    .copy-toast.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
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
    /* Submit modal: top-right position, no blocking overlay */
    #submit-modal {
      background: transparent;
      pointer-events: none;
      align-items: flex-start;
      justify-content: flex-end;
    }
    #submit-modal.visible { display: flex; }
    #submit-modal .modal-dialog {
      pointer-events: auto;
      margin: 60px 20px 20px 20px; /* top margin avoids header button overlap */
    }
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
    .image-attach-area { margin: 12px 0; }
    .image-attach-area label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .image-attach-area.image-attach-small { margin: 8px 0; }
    .image-attach-area.image-attach-small label { font-size: 11px; }
    .image-preview-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 24px; }
    .image-preview-item { position: relative; }
    .image-preview-item img { max-width: 80px; max-height: 60px; border-radius: 4px; border: 1px solid var(--border); object-fit: cover; }
    .image-preview-item .remove-image { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--error, #ef4444); color: #fff; border: none; cursor: pointer; font-size: 12px; line-height: 1; display: flex; align-items: center; justify-content: center; }
    .image-preview-item .remove-image:hover { background: #dc2626; }
    .modal-actions button.primary:hover { background: #7dd3fc; }

    .modal-checkboxes { margin: 12px 0; }
    .modal-checkboxes label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: var(--text);
      margin-bottom: 8px;
      cursor: pointer;
    }
    .modal-checkboxes input[type="checkbox"] {
      margin-top: 2px;
      accent-color: var(--accent);
    }

    body.dragging { user-select: none; cursor: crosshair; }
    body.dragging .diff-line { cursor: crosshair; }
    @media (max-width: 840px) {
      header { flex-direction: column; align-items: flex-start; }
      .comment-list { width: calc(100% - 24px); right: 12px; }
    }
    /* Mermaid diagram styles */
    .mermaid-container {
      position: relative;
      margin: 16px 0;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      overflow: hidden;
    }
    .mermaid-container .mermaid {
      display: flex;
      justify-content: center;
    }
    .mermaid-container .mermaid svg {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      pointer-events: auto;
    }
    .mermaid-fullscreen-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--selected-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      color: var(--text);
      font-size: 12px;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mermaid-fullscreen-btn:hover { background: var(--hover-bg); }
    /* Fullscreen overlay */
    .fullscreen-overlay {
      position: fixed;
      inset: 0;
      background: var(--bg);
      z-index: 1000;
      display: none;
      flex-direction: column;
    }
    .fullscreen-overlay.visible { display: flex; }
    .fullscreen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: var(--panel-alpha);
      border-bottom: 1px solid var(--border);
    }
    .fullscreen-header h3 { margin: 0; font-size: 14px; }
    .fullscreen-controls { display: flex; gap: 8px; align-items: center; }
    .fullscreen-controls button {
      background: var(--selected-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 12px;
      cursor: pointer;
      color: var(--text);
      font-size: 13px;
    }
    .fullscreen-controls button:hover { background: var(--hover-bg); }
    .fullscreen-controls .zoom-info { font-size: 12px; color: var(--muted); min-width: 50px; text-align: center; }
    .fullscreen-content {
      flex: 1;
      overflow: hidden;
      position: relative;
      cursor: grab;
    }
    .fullscreen-content:active { cursor: grabbing; }
    .fullscreen-content .mermaid-wrapper {
      position: absolute;
      transform-origin: 0 0;
      padding: 40px;
    }
    .fullscreen-content .mermaid svg {
      display: block;
    }
    /* Minimap */
    .minimap {
      position: absolute;
      top: 70px;
      right: 20px;
      width: 200px;
      height: 150px;
      background: var(--panel-alpha);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .minimap-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }
    .minimap-content svg {
      max-width: 100%;
      max-height: 100%;
      opacity: 0.6;
    }
    .minimap-viewport {
      position: absolute;
      border: 2px solid var(--accent);
      background: rgba(102, 126, 234, 0.2);
      pointer-events: none;
      border-radius: 2px;
    }
    /* Error toast */
    .mermaid-error-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--error);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 13px;
      max-width: 80%;
      z-index: 2000;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      white-space: pre-wrap;
      font-family: monospace;
    }
    .mermaid-error-toast.visible { display: block; }

    /* History Panel - Push layout */
    body { transition: margin-right 0.25s ease; }
    body.history-open { margin-right: 320px; }
    body.history-open header { right: 320px; }
    header { transition: right 0.25s ease; right: 0; }

    .history-toggle {
      background: var(--selected-bg);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 14px;
      cursor: pointer;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .history-toggle:hover { background: var(--border); }
    .history-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: var(--panel-solid);
      border-left: 1px solid var(--border);
      z-index: 90;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      display: flex;
      flex-direction: column;
    }
    .history-panel.open { transform: translateX(0); }
    .history-panel-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .history-panel-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
    .history-panel-close {
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
    }
    .history-panel-close:hover { color: var(--text); }
    .history-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .history-empty {
      color: var(--muted);
      font-size: 13px;
      text-align: center;
      padding: 40px 20px;
    }
    .history-date-group { margin-bottom: 16px; }
    .history-date {
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .history-item {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-bottom: 8px;
      overflow: hidden;
    }
    .history-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      background: var(--selected-bg);
      cursor: pointer;
    }
    .history-item-header:hover { background: var(--hover-bg); }
    .history-item-file {
      font-size: 12px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
    .history-item-time { font-size: 10px; color: var(--muted); }
    .history-item-body {
      display: none;
      padding: 10px;
      font-size: 12px;
      border-top: 1px solid var(--border);
    }
    .history-item.expanded .history-item-body { display: block; }
    .history-summary {
      color: var(--text);
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
    }
    .history-summary-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .history-summary-text { white-space: pre-wrap; line-height: 1.4; }
    .history-comments-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .history-comment {
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .history-comment:last-child { border-bottom: none; }
    .history-comment-line {
      font-size: 10px;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .history-comment-quote {
      background: rgba(0, 0, 0, 0.3);
      border-left: 2px solid var(--accent);
      padding: 4px 8px;
      margin: 4px 0;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 11px;
      color: var(--muted);
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 80px;
      overflow-y: auto;
    }
    .history-comment-text {
      color: var(--text);
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .history-badge {
      display: inline-block;
      background: var(--accent);
      color: var(--text-inverse);
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 6px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css" id="hljs-theme-dark">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css" id="hljs-theme-light" disabled>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js"></script>
</head>
<body>
  <header>
    <div class="meta">
      <h1><span class="title-path">${projectRoot}</span><span class="title-file">${relativePath}</span></h1>
      <span class="badge">Click to comment / ESC to cancel</span>
      <button class="pill" id="pill-comments" title="Toggle comment panel">Comments <strong id="comment-count">0</strong></button>
    </div>
    <div class="actions">
      <button class="history-toggle" id="history-toggle" title="Review History">☰</button>
      <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">
        <span id="theme-icon">🌙</span>
      </button>
      <button id="send-and-exit">Submit & Exit</button>
    </div>
  </header>

  <!-- History Panel -->
  <aside class="history-panel" id="history-panel">
    <div class="history-panel-header">
      <h3>📜 Review History</h3>
      <button class="history-panel-close" id="history-panel-close">✕</button>
    </div>
    <div class="history-panel-body" id="history-panel-body">
      <div class="history-empty">No review history yet.</div>
    </div>
  </aside>

  <div class="wrap">
    ${
      hasPreview && mode === "markdown"
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
                    ${Array.from({ length: cols })
                      .map(
                        (_, i) =>
                          `<th data-col="${i + 1}"><div class="th-inner">${mode === "csv" ? `C${i + 1}` : "Text"}<span class="resizer" data-col="${i + 1}"></span></div></th>`,
                      )
                      .join("")}
                  </tr>
                </thead>
                <tbody id="tbody"></tbody>
              </table>
            </div>
          </div>
        </div>`
        : `
        ${hasPreview ? `<div class="md-preview">${previewHtml}</div>` : ""}
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
                ${Array.from({ length: cols })
                  .map(
                    (_, i) =>
                      `<th data-col="${i + 1}"><div class="th-inner">${mode === "csv" ? `C${i + 1}` : "Text"}<span class="resizer" data-col="${i + 1}"></span></div></th>`,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody id="tbody"></tbody>
          </table>
        </div>
      `
    }
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
    <div class="image-attach-area image-attach-small" id="comment-image-area">
      <label>📎 Image (⌘V, max 1)</label>
      <div class="image-preview-list" id="comment-image-preview"></div>
    </div>
    <div class="actions">
      <button class="primary" id="save-comment">Save</button>
    </div>
  </div>

  <aside class="comment-list collapsed">
    <h3>Comments</h3>
    <ol id="comment-list"></ol>
    <p class="hint">Close the tab or click "Submit & Exit" to send comments and stop the server.</p>
  </aside>
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
      <div class="image-attach-area" id="submit-image-area">
        <label>📎 Attach images (⌘V to paste, max 5)</label>
        <div class="image-preview-list" id="submit-image-preview"></div>
      </div>
      <div class="modal-checkboxes">
        <label><input type="checkbox" id="prompt-subagents" checked /> 🤖 Delegate to sub-agents (implement, verify, report)</label>
        <label><input type="checkbox" id="prompt-reviw" checked /> 👁️ Open in REVIW next time</label>
        <label><input type="checkbox" id="prompt-screenshots" checked /> 📸 Update all screenshots/videos</label>
        <label><input type="checkbox" id="prompt-user-feedback-todo" checked /> ✅ Add feedback to Todo (require approval)</label>
        <label><input type="checkbox" id="prompt-deep-dive" checked /> 🔍 Probe requirements before implementing</label>
      </div>
      <div class="modal-actions">
        <button id="modal-cancel">Cancel</button>
        <button class="primary" id="modal-submit">Submit</button>
      </div>
    </div>
  </div>

  <div class="fullscreen-overlay" id="mermaid-fullscreen">
    <div class="fullscreen-header">
      <h3>Mermaid Diagram</h3>
      <div class="fullscreen-controls">
        <button id="fs-zoom-out">−</button>
        <span class="zoom-info" id="fs-zoom-info">100%</span>
        <button id="fs-zoom-in">+</button>
        <button id="fs-reset">Reset</button>
        <button id="fs-close">Close (ESC)</button>
      </div>
    </div>
    <div class="fullscreen-content" id="fs-content">
      <div class="mermaid-wrapper" id="fs-wrapper"></div>
    </div>
    <div class="minimap" id="fs-minimap">
      <div class="minimap-content" id="fs-minimap-content"></div>
      <div class="minimap-viewport" id="fs-minimap-viewport"></div>
    </div>
  </div>
  <div class="mermaid-error-toast" id="mermaid-error-toast"></div>
  <div class="copy-toast" id="copy-toast">Copied to clipboard!</div>
  <div class="image-fullscreen-overlay" id="image-fullscreen">
    <button class="image-close-btn" id="image-close" aria-label="Close image" title="Close (ESC)">✕</button>
    <div class="image-container" id="image-container"></div>
  </div>
  <div class="video-fullscreen-overlay" id="video-fullscreen">
    <button class="video-close-btn" id="video-close" aria-label="Close video" title="Close (ESC)">✕</button>
    <div class="video-container" id="video-container"></div>
  </div>

  <!-- Reviw Questions Modal -->
  <div class="reviw-questions-overlay" id="reviw-questions-overlay">
    <div class="reviw-questions-modal" id="reviw-questions-modal">
      <div class="reviw-questions-header">
        <h2>📋 AIからの質問 <span id="reviw-questions-count"></span></h2>
        <button class="reviw-questions-close" id="reviw-questions-close" aria-label="Close">✕</button>
      </div>
      <div class="reviw-questions-body" id="reviw-questions-body"></div>
      <div class="reviw-questions-footer">
        <button class="reviw-questions-later" id="reviw-questions-later">後で回答する</button>
      </div>
    </div>
  </div>

  <!-- Reviw Questions Notice Bar -->
  <div class="reviw-questions-bar" id="reviw-questions-bar">
    <span id="reviw-questions-bar-message">\ud83d\udccb \u672a\u56de\u7b54\u306e\u8cea\u554f\u304c<span id="reviw-questions-bar-count">0</span>\u4ef6\u3042\u308a\u307e\u3059</span>
    <button id="reviw-questions-bar-open">\u8cea\u554f\u3092\u898b\u308b</button>
  </div>

  <script>
    const DATA = ${serialized};
    const MAX_COLS = ${cols};
    const FILE_NAME = ${titleJson};
    const MODE = ${modeJson};
    const REVIW_QUESTIONS = ${questionsJson};
    const HISTORY_DATA = ${historyJson};

  // --- Theme Management ---
  (function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function getStoredTheme() {
      return localStorage.getItem('reviw-theme');
    }

    function setTheme(theme) {
      const hljsDark = document.getElementById('hljs-theme-dark');
      const hljsLight = document.getElementById('hljs-theme-light');
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        if (hljsDark) hljsDark.disabled = true;
        if (hljsLight) hljsLight.disabled = false;
      } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        if (hljsDark) hljsDark.disabled = false;
        if (hljsLight) hljsLight.disabled = true;
      }
      localStorage.setItem('reviw-theme', theme);
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

  // --- Table Scroll Indicator ---
  (function initTableScrollIndicators() {
    function updateScrollIndicator(wrapper) {
      const container = wrapper.closest('.table-scroll-container');
      if (!container) return;

      const canScroll = wrapper.scrollWidth > wrapper.clientWidth;
      const isAtEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 5;

      container.classList.toggle('can-scroll', canScroll && !isAtEnd);
      container.classList.toggle('scrolled-end', isAtEnd);
    }

    function initWrapper(wrapper) {
      updateScrollIndicator(wrapper);
      wrapper.addEventListener('scroll', () => updateScrollIndicator(wrapper));
    }

    // Initialize existing wrappers
    document.querySelectorAll('.table-scroll-wrapper').forEach(initWrapper);

    // Watch for dynamically added wrappers
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.classList?.contains('table-scroll-wrapper')) {
              initWrapper(node);
            }
            node.querySelectorAll?.('.table-scroll-wrapper').forEach(initWrapper);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Update on resize
    window.addEventListener('resize', () => {
      document.querySelectorAll('.table-scroll-wrapper').forEach(updateScrollIndicator);
    });
  })();

  // --- History Management ---
  // History is now server-side (file-based), HISTORY_DATA is provided by server

  function loadHistory() {
    // Return server-provided history data
    return Array.isArray(HISTORY_DATA) ? HISTORY_DATA : [];
  }

  // saveToHistory is handled server-side via /exit endpoint
  function saveToHistory(payload) {
    // No-op on client - server saves history when receiving /exit
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function formatTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }

  function getBasename(filepath) {
    return filepath.split('/').pop() || filepath;
  }

  function escapeHtmlForHistory(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] || c));
  }

  function renderHistoryPanel() {
    const body = document.getElementById('history-panel-body');
    const history = loadHistory();
    if (history.length === 0) {
      body.innerHTML = '<div class="history-empty">No review history yet.</div>';
      return;
    }

    const grouped = {};
    history.forEach((item, idx) => {
      const date = formatDate(item.submittedAt);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ ...item, _idx: idx });
    });

    let html = '';
    for (const date of Object.keys(grouped)) {
      html += \`<div class="history-date-group">
        <div class="history-date">\${date}</div>\`;
      for (const item of grouped[date]) {
        const commentCount = item.comments?.length || 0;
        html += \`<div class="history-item" data-idx="\${item._idx}">
          <div class="history-item-header">
            <span class="history-item-file">\${escapeHtmlForHistory(getBasename(item.file))}</span>
            <span class="history-item-time">\${formatTime(item.submittedAt)}<span class="history-badge">\${commentCount}</span></span>
          </div>
          <div class="history-item-body">\`;
        if (item.summary) {
          html += \`<div class="history-summary">
            <div class="history-summary-label">Summary</div>
            <div class="history-summary-text">\${escapeHtmlForHistory(item.summary)}</div>
          </div>\`;
        }
        if (commentCount > 0) {
          html += \`<div class="history-comments-label">Line Comments (\${commentCount})</div>\`;
          for (const c of item.comments) {
            const lineLabel = c.line ? \`L\${c.line}\${c.lineEnd ? '-' + c.lineEnd : ''}\` : (c.row != null ? \`L\${c.row}\` : '');
            const text = c.comment || c.text || '';
            // Support both direct content and context.content structures
            const content = c.content || c.context?.content || c.value || '';
            html += \`<div class="history-comment">
              <div class="history-comment-line">\${lineLabel}</div>\`;
            if (content) {
              html += \`<div class="history-comment-quote">\${escapeHtmlForHistory(content)}</div>\`;
            }
            html += \`<div class="history-comment-text">\${escapeHtmlForHistory(text)}</div>
            </div>\`;
          }
        }
        html += \`</div></div>\`;
      }
      html += \`</div>\`;
    }
    body.innerHTML = html;

    body.querySelectorAll('.history-item-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('expanded');
      });
    });
  }

  // History Panel Toggle
  (function initHistoryPanel() {
    const toggle = document.getElementById('history-toggle');
    const panel = document.getElementById('history-panel');
    const closeBtn = document.getElementById('history-panel-close');

    function openPanel() {
      panel.classList.add('open');
      document.body.classList.add('history-open');
      renderHistoryPanel();
    }

    function closePanel() {
      panel.classList.remove('open');
      document.body.classList.remove('history-open');
    }

    toggle?.addEventListener('click', () => {
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    closeBtn?.addEventListener('click', closePanel);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) {
        closePanel();
      }
    });
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
  const pillComments = document.getElementById('pill-comments');
  const filterMenu = document.getElementById('filter-menu');
  const rowMenu = document.getElementById('row-menu');
  const freezeColCheck = document.getElementById('freeze-col-check');
  const freezeRowCheck = document.getElementById('freeze-row-check');

  const ROW_HEADER_WIDTH = 28;
    const MIN_COL_WIDTH = 140;
    const MAX_COL_WIDTH = 520;
    const DEFAULT_COL_WIDTH = 240;

  let colWidths = Array.from({ length: MAX_COLS }, () => DEFAULT_COL_WIDTH);
  if (MODE !== 'csv' && MAX_COLS === 1) {
    colWidths[0] = 480;
  }
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
          if (ev.data === 'submitted') {
            // Another tab submitted - try to close this tab
            window.close();
            // If window.close() didn't work, show completion message
            setTimeout(() => {
              document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:var(--bg,#1a1a2e);color:var(--text,#e0e0e0);font-family:system-ui,sans-serif;"><h1 style="font-size:2rem;margin-bottom:1rem;">✅ Review Submitted</h1><p style="color:var(--muted,#888);">Submitted from another tab. You can close this tab now.</p></div>';
            }, 100);
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

    // Image attachment state
    const submitImages = []; // base64 images for submit modal (max 5)
    let currentCommentImage = null; // base64 image for current comment (max 1)

    // Image attachment handlers
    const submitImagePreview = document.getElementById('submit-image-preview');
    const commentImagePreview = document.getElementById('comment-image-preview');

    function addImageToPreview(container, images, maxCount, base64) {
      if (images.length >= maxCount) return;
      images.push(base64);
      renderImagePreviews(container, images);
    }

    function renderImagePreviews(container, images) {
      container.innerHTML = '';
      images.forEach((base64, idx) => {
        const item = document.createElement('div');
        item.className = 'image-preview-item';
        item.innerHTML = \`<img src="\${base64}" alt="attached image"><button class="remove-image" data-idx="\${idx}">×</button>\`;
        item.querySelector('.remove-image').addEventListener('click', () => {
          images.splice(idx, 1);
          renderImagePreviews(container, images);
        });
        container.appendChild(item);
      });
    }

    function renderCommentImagePreview() {
      commentImagePreview.innerHTML = '';
      if (currentCommentImage) {
        const item = document.createElement('div');
        item.className = 'image-preview-item';
        item.innerHTML = \`<img src="\${currentCommentImage}" alt="attached image"><button class="remove-image">×</button>\`;
        item.querySelector('.remove-image').addEventListener('click', () => {
          currentCommentImage = null;
          renderCommentImagePreview();
        });
        commentImagePreview.appendChild(item);
      }
    }

    // Global paste handler for images
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            const modal = document.getElementById('submit-modal');
            const commentCard = document.getElementById('comment-card');
            const activeEl = document.activeElement;
            const commentInput = document.getElementById('comment-input');

            // Prioritize comment card if its textarea has focus
            if (commentCard?.style.display !== 'none' && activeEl === commentInput) {
              if (!currentCommentImage) {
                currentCommentImage = base64;
                renderCommentImagePreview();
              }
            } else if (modal?.classList.contains('visible')) {
              addImageToPreview(submitImagePreview, submitImages, 5, base64);
            } else if (commentCard?.style.display !== 'none') {
              if (!currentCommentImage) {
                currentCommentImage = base64;
                renderCommentImagePreview();
              }
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    });

    // --- localStorage Comment Persistence ---
    const STORAGE_KEY = 'reviw:comments:' + FILE_NAME;
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
          // Copy selected text to clipboard
          copySelectionToClipboard(selection);
          openCardForSelection();
        }
      });
    }

    // Copy selected range to clipboard
    function copySelectionToClipboard(sel) {
      const { startRow, endRow, startCol, endCol } = sel;
      const lines = [];
      for (let r = startRow; r <= endRow; r++) {
        const rowData = [];
        for (let c = startCol; c <= endCol; c++) {
          const td = tbody.querySelector('td[data-row="' + r + '"][data-col="' + c + '"]');
          if (td) {
            // Get text content (strip HTML tags from inline code highlighting)
            rowData.push(td.textContent || '');
          }
        }
        lines.push(rowData.join('\\t'));
      }
      const text = lines.join('\\n');
      if (text && navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showCopyToast();
        }).catch(() => {
          // Fallback: silent fail
        });
      }
    }

    // Show copy toast notification
    function showCopyToast() {
      const toast = document.getElementById('copy-toast');
      if (!toast) return;
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 1500);
    }

    function openCardForSelection(previewElement) {
      if (!selection) return;
      // Don't open card while image/video modal is visible
      const imageOverlay = document.getElementById('image-fullscreen');
      const videoOverlay = document.getElementById('video-fullscreen');
      if (imageOverlay?.classList.contains('visible') || videoOverlay?.classList.contains('visible')) {
        return;
      }
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
      // 常にソーステーブルの選択セル位置を基準にカードを配置
      // これにより、プレビューからクリックしてもソースからクリックしても
      // 同じ行に対しては同じ位置にダイアログが表示される
      positionCardForSelection(startRow, endRow, startCol, endCol);
      commentInput.focus();
    }

    // Position card near a clicked preview element (used when clicking from preview pane)
    // Note: Uses viewport-relative coordinates directly since .md-left/.md-right containers scroll,
    // not the document. The card uses position:absolute but with no positioned ancestor,
    // so it's positioned relative to the initial containing block.
    function positionCardNearElement(element) {
      const cardWidth = card.offsetWidth || 380;
      const cardHeight = card.offsetHeight || 220;
      const rect = element.getBoundingClientRect();
      const margin = 12;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Use viewport-relative coordinates directly from getBoundingClientRect()
      // No need to add window.scrollX/Y since the containers scroll, not the document
      let left = rect.right + margin;
      let top = rect.top;

      // If card would go off the right edge, position it below the element
      if (left + cardWidth > vw - margin) {
        left = Math.max(rect.left, margin);
        left = Math.min(left, vw - cardWidth - margin);
        top = rect.bottom + margin;
      }

      // If card would go off the bottom, position it above the element
      if (top + cardHeight > vh - margin) {
        top = rect.top - cardHeight - margin;
      }

      // Ensure card stays within viewport
      top = Math.max(margin, Math.min(top, vh - cardHeight - margin));
      left = Math.max(margin, Math.min(left, vw - cardWidth - margin));

      card.style.left = left + 'px';
      card.style.top = top + 'px';
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

      // Check if the selection is within viewport
      const isInViewport = rect.top >= 0 && rect.top < vh && rect.bottom > 0;

      const spaceRight = vw - rect.right - margin;
      const spaceLeft = rect.left - margin - ROW_HEADER_WIDTH; // Account for row header
      const spaceBelow = vh - rect.bottom - margin;
      const spaceAbove = rect.top - margin;

      // Minimum left position to avoid covering row header
      const minLeft = ROW_HEADER_WIDTH + margin;

      let left = sx + rect.right + margin;
      let top = sy + rect.top;

      // If selection is outside viewport, position card in center of viewport
      if (!isInViewport) {
        left = sx + Math.max(vw / 2 - cardWidth / 2, minLeft);
        top = sy + Math.max(vh / 2 - cardHeight / 2, margin);
      } else {
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
      }

      // Final clamp to ensure card stays within viewport
      left = clamp(left, margin, sx + vw - cardWidth - margin);
      top = clamp(top, sy + margin, sy + vh - cardHeight - margin);

      card.style.left = left + 'px';
      card.style.top = top + 'px';
    }

    function closeCard() {
      card.style.display = 'none';
      currentKey = null;
      clearSelection();
      // Re-enable scroll sync when card is closed
      window._disableScrollSync = false;
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

    pillComments.addEventListener('click', () => {
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
        if (text || currentCommentImage) {
          comments[currentKey] = { startRow, startCol, endRow, endCol, text, isRange: true };
          if (currentCommentImage) {
            comments[currentKey].image = currentCommentImage;
          }
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
        if (text || currentCommentImage) {
          comments[currentKey] = { row, col, text, value };
          if (currentCommentImage) {
            comments[currentKey].image = currentCommentImage;
          }
          setDot(row, col, true);
        } else {
          delete comments[currentKey];
          setDot(row, col, false);
        }
      }
      currentCommentImage = null;
      renderCommentImagePreview();
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
      if (e.key === 'Escape') {
        // Don't close card if any fullscreen overlay is open
        const imageOverlay = document.getElementById('image-fullscreen');
        const videoOverlay = document.getElementById('video-fullscreen');
        const mermaidOverlay = document.getElementById('mermaid-fullscreen');
        if (imageOverlay?.classList.contains('visible') ||
            videoOverlay?.classList.contains('visible') ||
            mermaidOverlay?.classList.contains('visible')) {
          return; // Let the fullscreen handlers handle ESC
        }
        closeCard();
      }
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

    // Prompt checkboxes - text is the strong enforcement prompt for YAML output
    const promptCheckboxes = [
      { id: 'prompt-subagents', text: 'MANDATORY: You MUST delegate ALL implementation, verification, and report creation to sub-agents. Direct execution on the main thread is PROHIBITED.' },
      { id: 'prompt-reviw', text: 'REQUIRED: Before reporting completion, you MUST open the result in REVIW for user review. Skipping this step is NOT allowed.' },
      { id: 'prompt-screenshots', text: 'MANDATORY: You MUST update ALL screenshots and videos as evidence. Reports without visual proof are REJECTED.' },
      { id: 'prompt-user-feedback-todo', text: "STRICT RULE: Add ALL user feedback to the Todo list. You are FORBIDDEN from marking any item complete without explicit user approval." },
      { id: 'prompt-deep-dive', text: "REQUIRED: Before ANY implementation, you MUST deeply probe the user's requirements using AskUserQuestion and EnterPlanMode. Starting implementation without thorough requirement analysis is PROHIBITED." }
    ];
    const PROMPT_STORAGE_KEY = 'reviw-prompt-prefs';

    // Load saved preferences
    function loadPromptPrefs() {
      try {
        const saved = localStorage.getItem(PROMPT_STORAGE_KEY);
        if (saved) {
          const prefs = JSON.parse(saved);
          promptCheckboxes.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && typeof prefs[p.id] === 'boolean') el.checked = prefs[p.id];
          });
        }
      } catch (e) {}
    }

    // Save preferences
    function savePromptPrefs() {
      try {
        const prefs = {};
        promptCheckboxes.forEach(p => {
          const el = document.getElementById(p.id);
          if (el) prefs[p.id] = el.checked;
        });
        localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(prefs));
      } catch (e) {}
    }

    // Initialize checkbox listeners
    promptCheckboxes.forEach(p => {
      const el = document.getElementById(p.id);
      if (el) el.addEventListener('change', savePromptPrefs);
    });
    loadPromptPrefs();

    function getSelectedPrompts() {
      const prompts = [];
      promptCheckboxes.forEach(p => {
        const el = document.getElementById(p.id);
        if (el && el.checked) prompts.push(p.text);
      });
      return prompts;
    }

    // Find nearest heading for a given line number (markdown context)
    function findNearestHeading(lineNum) {
      let nearestHeading = null;
      for (let i = lineNum - 1; i >= 0; i--) {
        const line = DATA[i] ? DATA[i][0] : '';
        const match = line.match(/^(#{1,6})\\s+(.+)/);
        if (match) {
          nearestHeading = match[2].trim();
          break;
        }
      }
      return nearestHeading;
    }

    // Check if line is inside a table
    function getTableContext(lineNum) {
      const line = DATA[lineNum] ? DATA[lineNum][0] : '';
      if (!line.includes('|')) return null;
      // Find table header (look backwards for header row)
      for (let i = lineNum; i >= 0; i--) {
        const l = DATA[i] ? DATA[i][0] : '';
        if (!l.includes('|')) break;
        // Check if next line is separator (---|---)
        const nextLine = DATA[i + 1] ? DATA[i + 1][0] : '';
        if (nextLine && nextLine.match(/^\\|?[\\s-:|]+\\|/)) {
          // This is the header row
          return l.replace(/^\\|\\s*/, '').replace(/\\s*\\|$/, '').split('|').map(h => h.trim()).slice(0, 3).join(' | ') + (l.split('|').length > 4 ? ' ...' : '');
        }
      }
      return null;
    }

    // Transform comments for markdown mode
    function transformMarkdownComments(rawComments) {
      return rawComments.map(c => {
        const lineNum = c.row || c.startRow || 0;
        const section = findNearestHeading(lineNum);
        const tableHeader = getTableContext(lineNum);
        const content = c.content || c.value || '';
        const truncatedContent = content.length > 60 ? content.substring(0, 60) + '...' : content;

        const transformed = {
          line: lineNum + 1,
          context: {}
        };
        if (section) transformed.context.section = section;
        if (tableHeader) transformed.context.table = tableHeader;
        if (truncatedContent) transformed.context.content = truncatedContent;
        transformed.comment = c.text;

        if (c.isRange) {
          transformed.lineEnd = (c.endRow || c.startRow) + 1;
        }
        // Preserve image attachment
        if (c.image) {
          transformed.image = c.image;
        }
        return transformed;
      });
    }

    function payload(reason) {
      const rawComments = Object.values(comments);
      const transformedComments = MODE === 'markdown'
        ? transformMarkdownComments(rawComments)
        : rawComments;

      const data = {
        file: FILE_NAME,
        mode: MODE,
        submittedBy: reason,
        submittedAt: new Date().toISOString(),
        comments: transformedComments
      };
      if (globalComment.trim()) {
        data.summary = globalComment.trim();
      }
      if (submitImages.length > 0) data.summaryImages = submitImages;
      const prompts = getSelectedPrompts();
      if (prompts.length > 0) data.prompts = prompts;
      // Include answered questions
      if (window.REVIW_ANSWERS) {
        const answeredQuestions = [];
        for (const [id, answer] of Object.entries(window.REVIW_ANSWERS)) {
          if (answer.selected || answer.text.trim()) {
            answeredQuestions.push({
              id,
              selected: answer.selected,
              text: answer.text.trim()
            });
          }
        }
        if (answeredQuestions.length > 0) {
          data.reviwAnswers = answeredQuestions;
        }
      }
      return data;
    }
    async function sendAndExit(reason = 'pagehide') {
      if (sent) return;
      sent = true;
      clearCommentsFromStorage();
      const p = payload(reason);
      saveToHistory(p);
      try {
        // Use fetch with keepalive to handle large payloads (images)
        // keepalive allows the request to outlive the page
        await fetch('/exit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
          // Note: keepalive has 64KB limit like sendBeacon, so we don't use it for large payloads
        });
      } catch (err) {
        console.error('Failed to send exit request:', err);
      }
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
    async function doSubmit() {
      globalComment = globalCommentInput.value;
      savePromptPrefs();
      hideSubmitModal();
      await sendAndExit('button');
      // Try to close window; if it fails (browser security), show completion message
      setTimeout(() => {
        window.close();
        // If window.close() didn't work, show a completion message
        setTimeout(() => {
          document.body.innerHTML = \`
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:var(--bg,#1a1a2e);color:var(--text,#e0e0e0);font-family:system-ui,sans-serif;">
              <h1 style="font-size:2rem;margin-bottom:1rem;">✅ Review Submitted</h1>
              <p style="color:var(--muted,#888);">You can close this tab now.</p>
            </div>
          \`;
        }, 100);
      }, 200);
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
    // Global flag to temporarily disable scroll sync (used by selectSourceRange)
    window._disableScrollSync = false;
    // Global RAF ID so we can cancel pending scroll syncs from selectSourceRange
    window._scrollSyncRafId = null;

    if (MODE === 'markdown') {
      const mdLeft = document.querySelector('.md-left');
      const mdRight = document.querySelector('.md-right');
      if (mdLeft && mdRight) {
        let activePane = null;

        // Build anchor map for section-based sync
        // Maps line numbers to heading elements in preview
        const headingAnchors = [];
        const preview = document.querySelector('.md-preview');
        if (preview) {
          const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
          headings.forEach(h => {
            const text = h.textContent.trim();
            // Find corresponding line in source
            for (let i = 0; i < DATA.length; i++) {
              const lineText = (DATA[i][0] || '').trim();
              if (lineText.match(/^#+\\s/) && lineText.replace(/^#+\\s*/, '').trim() === text) {
                headingAnchors.push({
                  line: i + 1,
                  sourceEl: mdLeft.querySelector('td[data-row="' + (i + 1) + '"]'),
                  previewEl: h
                });
                break;
              }
            }
          });
        }

        function syncScroll(source, target, sourceName) {
          // Skip if scroll sync is temporarily disabled
          if (window._disableScrollSync) return;
          // Skip if scroll sync is disabled until a certain time (for preview click scroll)
          if (window._scrollSyncDisableUntil && Date.now() < window._scrollSyncDisableUntil) return;

          // Only sync if this pane initiated the scroll
          if (activePane && activePane !== sourceName) return;
          activePane = sourceName;

          if (window._scrollSyncRafId) cancelAnimationFrame(window._scrollSyncRafId);
          window._scrollSyncRafId = requestAnimationFrame(() => {
            // Check again inside RAF in case _disableScrollSync was set after RAF was scheduled
            if (window._disableScrollSync) return;
            if (window._scrollSyncDisableUntil && Date.now() < window._scrollSyncDisableUntil) return;

            const sourceMax = source.scrollHeight - source.clientHeight;
            const targetMax = target.scrollHeight - target.clientHeight;

            if (sourceMax <= 0 || targetMax <= 0) return;

            // Snap to edges for precision
            if (source.scrollTop <= 1) {
              target.scrollTop = 0;
              setTimeout(() => { activePane = null; }, 100);
              return;
            }
            if (source.scrollTop >= sourceMax - 1) {
              target.scrollTop = targetMax;
              setTimeout(() => { activePane = null; }, 100);
              return;
            }

            // Try section-based sync if anchors exist
            if (headingAnchors.length > 0) {
              const sourceRect = source.getBoundingClientRect();
              const viewportTop = sourceRect.top;
              const viewportMid = viewportTop + sourceRect.height / 3;

              // Find the heading closest to viewport top in source
              let closestAnchor = null;
              let closestDistance = Infinity;

              for (const anchor of headingAnchors) {
                const el = sourceName === 'left' ? anchor.sourceEl : anchor.previewEl;
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                const distance = Math.abs(rect.top - viewportMid);
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestAnchor = anchor;
                }
              }

              if (closestAnchor) {
                const sourceEl = sourceName === 'left' ? closestAnchor.sourceEl : closestAnchor.previewEl;
                const targetEl = sourceName === 'left' ? closestAnchor.previewEl : closestAnchor.sourceEl;

                if (sourceEl && targetEl) {
                  const sourceElRect = sourceEl.getBoundingClientRect();
                  const sourceOffset = sourceElRect.top - sourceRect.top;

                  // Calculate where target element should be
                  const targetRect = target.getBoundingClientRect();
                  const targetElRect = targetEl.getBoundingClientRect();
                  const currentTargetOffset = targetElRect.top - targetRect.top;

                  // Adjust target scroll to align the anchor
                  const adjustment = currentTargetOffset - sourceOffset;
                  target.scrollTop = target.scrollTop + adjustment;

                  setTimeout(() => { activePane = null; }, 100);
                  return;
                }
              }
            }

            // Fallback to ratio-based sync
            const ratio = source.scrollTop / sourceMax;
            target.scrollTop = Math.round(ratio * targetMax);

            // Release lock after scroll settles
            setTimeout(() => { activePane = null; }, 100);
          });
        }

        // Store scroll handlers for temporary removal
        const leftScrollHandler = () => syncScroll(mdLeft, mdRight, 'left');
        const rightScrollHandler = () => syncScroll(mdRight, mdLeft, 'right');
        mdLeft.addEventListener('scroll', leftScrollHandler, { passive: true });
        mdRight.addEventListener('scroll', rightScrollHandler, { passive: true });

        // Expose handlers for temporary removal during preview click
        window._scrollHandlers = {
          left: leftScrollHandler,
          right: rightScrollHandler,
          mdLeft: mdLeft,
          mdRight: mdRight
        };
      }
    }

    // --- Mermaid Initialization ---
    (function initMermaid() {
      if (typeof mermaid === 'undefined') return;

      const errorToast = document.getElementById('mermaid-error-toast');
      let errorTimeout;

      function showError(msg) {
        errorToast.textContent = msg;
        errorToast.classList.add('visible');
        console.error('[Mermaid Error]', msg);
        clearTimeout(errorTimeout);
        errorTimeout = setTimeout(() => errorToast.classList.remove('visible'), 8000);
      }

      mermaid.initialize({
        startOnLoad: false,
        theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'default' : 'dark',
        securityLevel: 'loose',
        logLevel: 'error'
      });

      // Find all mermaid code blocks in preview
      const preview = document.querySelector('.md-preview');
      if (!preview) return;

      const codeBlocks = preview.querySelectorAll('pre code.language-mermaid, pre code');
      codeBlocks.forEach((code, idx) => {
        const pre = code.parentElement;
        const text = code.textContent.trim();

        // Check if it's mermaid content
        if (!code.classList.contains('language-mermaid') && !text.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|gitGraph|mindmap|timeline)/)) {
          return;
        }

        // Create container
        const container = document.createElement('div');
        container.className = 'mermaid-container';
        container.style.cursor = 'pointer';
        container.title = 'Click to view fullscreen';

        const mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.id = 'mermaid-' + idx;
        mermaidDiv.textContent = text;

        // Click anywhere on container to open fullscreen
        container.addEventListener('click', () => openFullscreen(mermaidDiv));

        container.appendChild(mermaidDiv);
        pre.replaceWith(container);
      });

      // Render all mermaid diagrams with error handling
      mermaid.run().catch(err => {
        showError('Mermaid Syntax Error: ' + (err.message || err));
      });

      // Watch for render errors in DOM
      setTimeout(() => {
        document.querySelectorAll('.mermaid').forEach(el => {
          if (el.querySelector('.error-text, .error-icon')) {
            const errText = el.textContent;
            showError('Mermaid Parse Error: ' + errText.slice(0, 200));
          }
        });
      }, 500);

      // Fullscreen functionality
      const fsOverlay = document.getElementById('mermaid-fullscreen');
      const fsWrapper = document.getElementById('fs-wrapper');
      const fsContent = document.getElementById('fs-content');
      const fsZoomInfo = document.getElementById('fs-zoom-info');
      const minimapContent = document.getElementById('fs-minimap-content');
      const minimapViewport = document.getElementById('fs-minimap-viewport');
      let currentZoom = 1;
      let initialZoom = 1;
      let panX = 0, panY = 0;
      let isPanning = false;
      let startX, startY;
      let svgNaturalWidth = 0, svgNaturalHeight = 0;
      let minimapScale = 1;

      function openFullscreen(mermaidEl) {
        const svg = mermaidEl.querySelector('svg');
        if (!svg) return;
        fsWrapper.innerHTML = '';
        const clonedSvg = svg.cloneNode(true);
        fsWrapper.appendChild(clonedSvg);

        // Setup minimap
        minimapContent.innerHTML = '';
        const minimapSvg = svg.cloneNode(true);
        minimapContent.appendChild(minimapSvg);

        // Get SVG's intrinsic/natural size from viewBox or attributes
        const viewBox = svg.getAttribute('viewBox');
        let naturalWidth, naturalHeight;

        if (viewBox) {
          const parts = viewBox.split(/[\\s,]+/);
          naturalWidth = parseFloat(parts[2]) || 800;
          naturalHeight = parseFloat(parts[3]) || 600;
        } else {
          naturalWidth = parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width || 800;
          naturalHeight = parseFloat(svg.getAttribute('height')) || svg.getBoundingClientRect().height || 600;
        }

        svgNaturalWidth = naturalWidth;
        svgNaturalHeight = naturalHeight;

        // Calculate minimap scale
        const minimapMaxWidth = 184; // 200 - 16 padding
        const minimapMaxHeight = 134; // 150 - 16 padding
        minimapScale = Math.min(minimapMaxWidth / naturalWidth, minimapMaxHeight / naturalHeight);

        clonedSvg.style.width = naturalWidth + 'px';
        clonedSvg.style.height = naturalHeight + 'px';

        // Calculate fit-to-viewport zoom
        const viewportHeight = window.innerHeight - 80;
        const viewportWidth = window.innerWidth - 40;

        const zoomForHeight = viewportHeight / naturalHeight;
        const zoomForWidth = viewportWidth / naturalWidth;
        const fitZoom = Math.min(zoomForHeight, zoomForWidth);

        currentZoom = fitZoom;
        initialZoom = fitZoom;

        // Center the SVG in viewport
        const scaledWidth = naturalWidth * currentZoom;
        const scaledHeight = naturalHeight * currentZoom;
        panX = (viewportWidth - scaledWidth) / 2 + 20;
        panY = (viewportHeight - scaledHeight) / 2 + 60;

        fsOverlay.classList.add('visible');
        // Wait for DOM to render before calculating minimap position
        requestAnimationFrame(() => {
          updateTransform();
        });
      }

      function closeFullscreen() {
        fsOverlay.classList.remove('visible');
      }

      function updateTransform() {
        fsWrapper.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentZoom + ')';
        fsZoomInfo.textContent = Math.round(currentZoom * 100) + '%';
        updateMinimap();
      }

      function updateMinimap() {
        if (!svgNaturalWidth || !svgNaturalHeight) return;

        const viewportWidth = fsContent.clientWidth;
        const viewportHeight = fsContent.clientHeight;

        // Minimap container dimensions (inner area)
        const mmWidth = 184;  // 200 - 16 padding
        const mmHeight = 134; // 150 - 16 padding
        const mmPadding = 8;

        // SVG thumbnail size in minimap (scaled to fit)
        const mmSvgWidth = svgNaturalWidth * minimapScale;
        const mmSvgHeight = svgNaturalHeight * minimapScale;
        // SVG thumbnail position (centered in minimap)
        const mmSvgLeft = (mmWidth - mmSvgWidth) / 2 + mmPadding;
        const mmSvgTop = (mmHeight - mmSvgHeight) / 2 + mmPadding;

        // Calculate which part of the SVG is visible in the viewport
        // transform: translate(panX, panY) scale(currentZoom)
        // The viewport shows SVG region starting at (-panX/zoom, -panY/zoom)
        const svgVisibleLeft = -panX / currentZoom;
        const svgVisibleTop = -panY / currentZoom;
        const svgVisibleWidth = viewportWidth / currentZoom;
        const svgVisibleHeight = viewportHeight / currentZoom;

        // Convert to minimap coordinates
        let vpLeft = mmSvgLeft + svgVisibleLeft * minimapScale;
        let vpTop = mmSvgTop + svgVisibleTop * minimapScale;
        let vpWidth = svgVisibleWidth * minimapScale;
        let vpHeight = svgVisibleHeight * minimapScale;

        // Clamp to minimap bounds (the viewport rect should stay within minimap)
        const mmLeft = mmPadding;
        const mmTop = mmPadding;
        const mmRight = mmWidth + mmPadding;
        const mmBottom = mmHeight + mmPadding;

        // Adjust if viewport extends beyond minimap bounds
        if (vpLeft < mmLeft) {
          vpWidth -= (mmLeft - vpLeft);
          vpLeft = mmLeft;
        }
        if (vpTop < mmTop) {
          vpHeight -= (mmTop - vpTop);
          vpTop = mmTop;
        }
        if (vpLeft + vpWidth > mmRight) {
          vpWidth = mmRight - vpLeft;
        }
        if (vpTop + vpHeight > mmBottom) {
          vpHeight = mmBottom - vpTop;
        }

        // Ensure minimum size and positive dimensions
        vpWidth = Math.max(20, vpWidth);
        vpHeight = Math.max(15, vpHeight);

        minimapViewport.style.left = vpLeft + 'px';
        minimapViewport.style.top = vpTop + 'px';
        minimapViewport.style.width = vpWidth + 'px';
        minimapViewport.style.height = vpHeight + 'px';
      }

      // Use multiplicative zoom for consistent behavior
      function zoomAt(factor, clientX, clientY) {
        const oldZoom = currentZoom;
        currentZoom = Math.max(0.1, Math.min(10, currentZoom * factor));

        // Zoom around mouse position
        const fsRect = fsContent.getBoundingClientRect();
        const mouseX = clientX - fsRect.left;
        const mouseY = clientY - fsRect.top;

        const zoomRatio = currentZoom / oldZoom;
        panX = mouseX - (mouseX - panX) * zoomRatio;
        panY = mouseY - (mouseY - panY) * zoomRatio;

        updateTransform();
      }

      function zoom(factor) {
        const fsRect = fsContent.getBoundingClientRect();
        zoomAt(factor, fsRect.left + fsRect.width / 2, fsRect.top + fsRect.height / 2);
      }

      document.getElementById('fs-zoom-in').addEventListener('click', () => zoom(1.25));
      document.getElementById('fs-zoom-out').addEventListener('click', () => zoom(0.8));
      document.getElementById('fs-reset').addEventListener('click', () => {
        currentZoom = initialZoom;
        const viewportHeight = window.innerHeight - 80;
        const viewportWidth = window.innerWidth - 40;
        const scaledWidth = svgNaturalWidth * currentZoom;
        const scaledHeight = svgNaturalHeight * currentZoom;
        panX = (viewportWidth - scaledWidth) / 2 + 20;
        panY = (viewportHeight - scaledHeight) / 2 + 60;
        updateTransform();
      });
      document.getElementById('fs-close').addEventListener('click', closeFullscreen);

      // Pan with mouse drag
      fsContent.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        fsContent.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
      });

      document.addEventListener('mouseup', () => {
        isPanning = false;
        fsContent.style.cursor = 'grab';
      });

      // Trackpad/Mouse wheel handling
      // - ctrlKey/shiftKey true (pinch gesture on trackpad, or Ctrl/Shift+wheel) → zoom
      // - ctrlKey/shiftKey false (two-finger scroll) → pan
      fsContent.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.shiftKey) {
          // Pinch zoom on trackpad (or Ctrl/Shift+wheel on mouse)
          const factor = e.deltaY > 0 ? 0.9 : 1.1;
          zoomAt(factor, e.clientX, e.clientY);
        } else {
          // Two-finger scroll → pan
          panX -= e.deltaX;
          panY -= e.deltaY;
          updateTransform();
        }
      }, { passive: false });

      // Touch support for pinch-to-zoom and two-finger pan
      let lastTouchDistance = 0;
      let lastTouchCenter = { x: 0, y: 0 };
      let touchStartPanX = 0;
      let touchStartPanY = 0;

      function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function getTouchCenter(touches) {
        return {
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2
        };
      }

      fsContent.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          lastTouchDistance = getTouchDistance(e.touches);
          lastTouchCenter = getTouchCenter(e.touches);
          touchStartPanX = panX;
          touchStartPanY = panY;
        }
      }, { passive: false });

      fsContent.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = getTouchDistance(e.touches);
          const currentCenter = getTouchCenter(e.touches);

          // Pinch zoom
          if (lastTouchDistance > 0) {
            const scale = currentDistance / lastTouchDistance;
            if (Math.abs(scale - 1) > 0.01) {
              zoomAt(scale, currentCenter.x, currentCenter.y);
              lastTouchDistance = currentDistance;
            }
          }

          // Two-finger pan
          const dx = currentCenter.x - lastTouchCenter.x;
          const dy = currentCenter.y - lastTouchCenter.y;
          panX += dx;
          panY += dy;
          updateTransform();

          lastTouchCenter = currentCenter;
        }
      }, { passive: false });

      fsContent.addEventListener('touchend', () => {
        lastTouchDistance = 0;
      });

      // ESC to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fsOverlay.classList.contains('visible')) {
          closeFullscreen();
        }
      });
    })();

    // --- Highlight.js Initialization ---
    (function initHighlightJS() {
      if (typeof hljs === 'undefined') return;

      // Highlight all code blocks in preview (skip mermaid blocks)
      const preview = document.querySelector('.md-preview');
      if (preview) {
        preview.querySelectorAll('pre code').forEach(block => {
          // Skip if inside mermaid container or already highlighted
          if (block.closest('.mermaid-container') || block.classList.contains('hljs')) {
            return;
          }
          hljs.highlightElement(block);
        });
      }
    })();

    // --- Image Fullscreen ---
    (function initImageFullscreen() {
      const preview = document.querySelector('.md-preview');
      if (!preview) return;

      const imageOverlay = document.getElementById('image-fullscreen');
      const imageContainer = document.getElementById('image-container');
      const imageClose = document.getElementById('image-close');
      if (!imageOverlay || !imageContainer) return;

      // Collect all images for navigation
      const allImages = Array.from(preview.querySelectorAll('img'));
      let currentImageIndex = -1;

      function showImage(index) {
        if (index < 0 || index >= allImages.length) return;
        currentImageIndex = index;
        const img = allImages[index];

        imageContainer.innerHTML = '';
        const clonedImg = img.cloneNode(true);
        // CSSで制御するためインラインスタイルはリセット
        clonedImg.style.width = '';
        clonedImg.style.height = '';
        clonedImg.style.maxWidth = '';
        clonedImg.style.maxHeight = '';
        clonedImg.style.cursor = 'default';
        imageContainer.appendChild(clonedImg);

        // Show navigation hint
        const counter = document.createElement('div');
        counter.className = 'fullscreen-counter';
        counter.textContent = \`\${index + 1} / \${allImages.length}\`;
        counter.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;font-size:14px;';
        imageContainer.appendChild(counter);

        imageOverlay.classList.add('visible');
      }

      function closeImageOverlay() {
        imageOverlay.classList.remove('visible');
        imageContainer.innerHTML = '';
        currentImageIndex = -1;
      }

      function navigateImage(direction) {
        if (!imageOverlay.classList.contains('visible')) return;
        const newIndex = currentImageIndex + direction;
        if (newIndex >= 0 && newIndex < allImages.length) {
          showImage(newIndex);
        }
      }

      if (imageClose) {
        imageClose.addEventListener('click', closeImageOverlay);
      }

      if (imageOverlay) {
        // Close on any click (including image itself)
        imageOverlay.addEventListener('click', (e) => {
          closeImageOverlay();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (!imageOverlay.classList.contains('visible')) return;

        switch (e.key) {
          case 'Escape':
            closeImageOverlay();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            navigateImage(-1);
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            navigateImage(1);
            break;
        }
      });

      allImages.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.title = 'Click to view fullscreen (← → to navigate)';

        img.addEventListener('click', (e) => {
          // Don't stop propagation - allow select to work
          e.preventDefault();
          showImage(index);
        });
      });
    })();

    // --- Video Fullscreen ---
    (function initVideoFullscreen() {
      const preview = document.querySelector('.md-preview');
      if (!preview) return;

      const videoOverlay = document.getElementById('video-fullscreen');
      const videoContainer = document.getElementById('video-container');
      const videoClose = document.getElementById('video-close');
      if (!videoOverlay || !videoContainer) return;

      const videoExtensions = /\\.(mp4|mov|webm|avi|mkv|m4v|ogv)$/i;

      // Collect all video links for navigation
      const allVideoLinks = Array.from(preview.querySelectorAll('a')).filter(link => {
        const href = link.getAttribute('href');
        return href && videoExtensions.test(href);
      });
      let currentVideoIndex = -1;

      function showVideo(index) {
        if (index < 0 || index >= allVideoLinks.length) return;
        currentVideoIndex = index;
        const link = allVideoLinks[index];
        const href = link.getAttribute('href');

        // Remove existing video if any
        const existingVideo = videoContainer.querySelector('video');
        if (existingVideo) {
          existingVideo.pause();
          existingVideo.src = '';
          existingVideo.remove();
        }

        // Remove existing counter
        const existingCounter = videoContainer.querySelector('.fullscreen-counter');
        if (existingCounter) existingCounter.remove();

        const video = document.createElement('video');
        video.src = href;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = '100%';
        video.style.maxHeight = '100%';
        // Prevent click on video from closing overlay
        video.addEventListener('click', (e) => e.stopPropagation());
        videoContainer.appendChild(video);

        // Show navigation hint
        if (allVideoLinks.length > 1) {
          const counter = document.createElement('div');
          counter.className = 'fullscreen-counter';
          counter.textContent = \`\${index + 1} / \${allVideoLinks.length}\`;
          counter.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;font-size:14px;';
          videoContainer.appendChild(counter);
        }

        videoOverlay.classList.add('visible');
      }

      function closeVideoOverlay() {
        videoOverlay.classList.remove('visible');
        currentVideoIndex = -1;
        // Stop and remove video
        const video = videoContainer.querySelector('video');
        if (video) {
          video.pause();
          video.src = '';
          video.remove();
        }
      }

      function navigateVideo(direction) {
        if (!videoOverlay.classList.contains('visible')) return;
        const newIndex = currentVideoIndex + direction;
        if (newIndex >= 0 && newIndex < allVideoLinks.length) {
          showVideo(newIndex);
        }
      }

      if (videoClose) {
        videoClose.addEventListener('click', closeVideoOverlay);
      }

      if (videoOverlay) {
        // Close on any click (including video itself)
        videoOverlay.addEventListener('click', (e) => {
          closeVideoOverlay();
        });
      }

      document.addEventListener('keydown', (e) => {
        if (!videoOverlay.classList.contains('visible')) return;

        switch (e.key) {
          case 'Escape':
            closeVideoOverlay();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            navigateVideo(-1);
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            navigateVideo(1);
            break;
        }
      });

      // Intercept video link clicks
      allVideoLinks.forEach((link, index) => {
        link.style.cursor = 'pointer';
        link.title = allVideoLinks.length > 1
          ? 'Click to play video fullscreen (← → to navigate)'
          : 'Click to play video fullscreen';

        link.addEventListener('click', (e) => {
          e.preventDefault();
          // Don't stop propagation - allow select to work
          showVideo(index);
        });
      });
    })();

    // --- Preview Commenting ---
    (function initPreviewCommenting() {
      if (MODE !== 'markdown') return;

      const preview = document.querySelector('.md-preview');
      if (!preview) return;

      // Add visual hint for clickable elements
      const style = document.createElement('style');
      style.textContent = \`
        .md-preview > p:hover, .md-preview > h1:hover, .md-preview > h2:hover,
        .md-preview > h3:hover, .md-preview > h4:hover, .md-preview > h5:hover,
        .md-preview > h6:hover, .md-preview > ul > li:hover, .md-preview > ol > li:hover,
        .md-preview > pre:hover, .md-preview > blockquote:hover {
          background: rgba(99, 102, 241, 0.08);
          cursor: pointer;
          border-radius: 4px;
        }
        .md-preview img:hover {
          outline: 2px solid var(--accent);
          cursor: pointer;
        }
      \`;
      document.head.appendChild(style);

      // Helper: strip markdown formatting from text
      function stripMarkdown(text) {
        return text
          .replace(/^[-*+]\\s+/, '')           // List markers: - * +
          .replace(/^\\d+\\.\\s+/, '')          // Numbered list: 1. 2.
          .replace(/\\*\\*([^*]+)\\*\\*/g, '$1') // Bold: **text**
          .replace(/\\*([^*]+)\\*/g, '$1')     // Italic: *text*
          .replace(/__([^_]+)__/g, '$1')      // Bold: __text__
          .replace(/_([^_]+)_/g, '$1')        // Italic: _text_
          .replace(/\`([^\`]+)\`/g, '$1')     // Inline code: \`code\`
          .replace(/\\[([^\\]]+)\\]\\([^)]+\\)/g, '$1') // Links: [text](url)
          .trim();
      }

      // Helper: find matching source line for text or element
      // If element is provided, also searches by media src attributes
      function findSourceLine(text, element = null) {
        // First, try to find by media src (images, videos) in the element
        if (element) {
          const mediaElements = element.querySelectorAll('img, video');
          for (const m of mediaElements) {
            const src = m.getAttribute('src');
            if (!src) continue;

            const fileName = src.split('/').pop();
            const alt = m.getAttribute('alt') || m.getAttribute('data-alt') || m.getAttribute('title') || '';

            // Search for lines containing this media file (![...](path) syntax)
            // Prioritize exact match with alt text
            let bestMatch = -1;
            for (let i = 0; i < DATA.length; i++) {
              const lineText = (DATA[i][0] || '');
              if (!lineText.includes(fileName)) continue;

              // Check if it's an image/video markdown syntax
              const match = lineText.match(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/);
              if (!match) continue;

              const [, mdAlt, mdPath] = match;

              // Exact path match
              if (mdPath.includes(fileName)) {
                // If alt text matches exactly, this is definitely the right one
                if (alt && mdAlt && mdAlt === alt) {
                  return i + 1;
                }
                // Otherwise, remember as fallback (prefer first match)
                if (bestMatch === -1) bestMatch = i + 1;
              }
            }
            if (bestMatch !== -1) return bestMatch;
          }
        }

        if (!text) return -1;
        const normalized = text.trim().replace(/\\s+/g, ' ').slice(0, 100);
        if (!normalized) return -1;

        for (let i = 0; i < DATA.length; i++) {
          const lineText = (DATA[i][0] || '').trim();
          if (!lineText) continue;

          const lineNorm = lineText.replace(/\\s+/g, ' ').slice(0, 100);
          if (lineNorm === normalized) return i + 1;
          if (lineNorm.includes(normalized.slice(0, 30)) && normalized.length > 5) return i + 1;
          if (normalized.includes(lineNorm.slice(0, 30)) && lineNorm.length > 5) return i + 1;

          // Check for markdown headings: strip # from source and compare
          if (lineText.match(/^#+\\s/)) {
            const headingText = lineText.replace(/^#+\\s*/, '').trim();
            if (headingText === normalized || headingText.toLowerCase() === normalized.toLowerCase()) {
              return i + 1;
            }
          }

          // Try stripping all markdown formatting (links, bold, italic, etc.)
          const strippedLine = stripMarkdown(lineText).replace(/\\s+/g, ' ').slice(0, 100);
          if (strippedLine === normalized) return i + 1;
          if (strippedLine.includes(normalized.slice(0, 30)) && normalized.length > 5) return i + 1;
          if (normalized.includes(strippedLine.slice(0, 30)) && strippedLine.length > 5) return i + 1;
        }
        return -1;
      }

      // Helper: find matching source line for table cell (prioritizes table rows)
      function findTableSourceLine(text) {
        if (!text) return -1;
        const normalized = text.trim().replace(/\\s+/g, ' ').slice(0, 100);
        if (!normalized) return -1;

        // First pass: look for table rows (lines starting with |) containing the text
        for (let i = 0; i < DATA.length; i++) {
          const lineText = (DATA[i][0] || '').trim();
          if (!lineText || !lineText.startsWith('|')) continue;

          const lineNorm = lineText.replace(/\\s+/g, ' ').slice(0, 100);
          if (lineNorm.includes(normalized.slice(0, 30)) && normalized.length > 5) return i + 1;
        }

        // Fallback to normal search
        return findSourceLine(text);
      }

      // Helper: find code block range in source (fenced code blocks)
      function findCodeBlockRange(codeText) {
        const clickedLines = codeText.split('\\n').map(l => l.trim()).filter(l => l);
        const clickedContent = clickedLines.join('\\n');

        // Extract all code blocks from DATA
        const codeBlocks = [];
        let currentBlock = null;

        for (let i = 0; i < DATA.length; i++) {
          const lineText = (DATA[i][0] || '').trim();

          if (lineText.startsWith('\`\`\`') && !currentBlock) {
            // Start of a code block
            currentBlock = { startLine: i + 1, lines: [] };
          } else if (lineText === '\`\`\`' && currentBlock) {
            // End of a code block
            currentBlock.endLine = i + 1;
            currentBlock.content = currentBlock.lines.map(l => l.trim()).filter(l => l).join('\\n');
            codeBlocks.push(currentBlock);
            currentBlock = null;
          } else if (currentBlock) {
            // Inside a code block
            currentBlock.lines.push(DATA[i][0] || '');
          }
        }

        // Find the best matching code block by content similarity
        let bestMatch = null;
        let bestScore = 0;

        for (const block of codeBlocks) {
          // Calculate similarity score
          let score = 0;

          // Exact match
          if (block.content === clickedContent) {
            score = 1000;
          } else {
            // Check line-by-line matches
            const blockLines = block.content.split('\\n');
            for (const clickedLine of clickedLines) {
              if (clickedLine.length > 3) {
                for (const blockLine of blockLines) {
                  if (blockLine.includes(clickedLine) || clickedLine.includes(blockLine)) {
                    score += clickedLine.length;
                  }
                }
              }
            }
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = block;
          }
        }

        if (bestMatch) {
          return { startLine: bestMatch.startLine, endLine: bestMatch.endLine };
        }

        // Fallback: find by first line content matching
        const firstCodeLine = clickedLines[0];
        if (firstCodeLine && firstCodeLine.length > 3) {
          for (let i = 0; i < DATA.length; i++) {
            const lineText = (DATA[i][0] || '').trim();
            if (lineText.includes(firstCodeLine.slice(0, 30))) {
              return { startLine: i + 1, endLine: i + 1 };
            }
          }
        }

        return { startLine: -1, endLine: -1 };
      }

      // Helper: find source line for image by src
      function findImageSourceLine(src) {
        if (!src) return -1;
        const filename = src.split('/').pop().split('?')[0];
        for (let i = 0; i < DATA.length; i++) {
          const lineText = DATA[i][0] || '';
          if (lineText.includes(filename) || lineText.includes(src)) {
            return i + 1;
          }
        }
        return -1;
      }

      // Trigger source cell selection (reuse existing comment flow)
      // When clickedPreviewElement is provided (from preview click), position card near that element
      function selectSourceRange(startRow, endRow, clickedPreviewElement) {
        // IMMEDIATELY disable scroll sync at the very start
        window._disableScrollSync = true;
        window._scrollSyncDisableUntil = Date.now() + 2000;

        // Cancel any pending scroll sync RAF
        if (window._scrollSyncRafId) {
          cancelAnimationFrame(window._scrollSyncRafId);
          window._scrollSyncRafId = null;
        }

        // TEMPORARILY REMOVE scroll event listeners to prevent any interference
        const handlers = window._scrollHandlers;
        if (handlers) {
          handlers.mdLeft.removeEventListener('scroll', handlers.left);
          handlers.mdRight.removeEventListener('scroll', handlers.right);
        }

        selection = { startRow, endRow: endRow || startRow, startCol: 1, endCol: 1 };
        updateSelectionVisual();

        // Clear header selection
        document.querySelectorAll('thead th.selected').forEach(el => el.classList.remove('selected'));

        // Scroll source pane FIRST (before opening card) to ensure target is visible
        const targetRow = startRow;
        const mdRight = document.querySelector('.md-right');
        const sourceTd = document.querySelector('td[data-row="' + targetRow + '"][data-col="1"]');
        if (mdRight && sourceTd) {
          const tdOffsetTop = sourceTd.offsetTop;
          const containerHeight = mdRight.clientHeight;
          const tdHeight = sourceTd.offsetHeight;
          const scrollTarget = tdOffsetTop - (containerHeight / 2) + (tdHeight / 2);
          // Use scrollTo with instant behavior to ensure immediate scroll
          mdRight.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: 'instant'
          });
        }

        // Open the card (synchronously) - now target cell should be visible for positioning
        openCardForSelection();

        // Re-add scroll handlers after a delay to allow scroll to settle
        setTimeout(() => {
          if (handlers) {
            handlers.mdLeft.addEventListener('scroll', handlers.left, { passive: true });
            handlers.mdRight.addEventListener('scroll', handlers.right, { passive: true });
          }
          window._disableScrollSync = false;
          window._scrollSyncDisableUntil = 0;
        }, 500);
      }

      // Click on block elements
      preview.addEventListener('click', (e) => {
        // Handle image clicks - always select, even if modal is showing
        if (e.target.tagName === 'IMG') {
          const line = findImageSourceLine(e.target.src);
          if (line > 0) {
            selectSourceRange(line, null, e.target);
          }
          return;
        }

        // Handle links - sync to source but let link work normally
        const link = e.target.closest('a');
        if (link) {
          // Find the parent block element containing this link
          const parentBlock = link.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th');
          if (parentBlock) {
            const isTableCell = parentBlock.tagName === 'TD' || parentBlock.tagName === 'TH';
            const line = isTableCell ? findTableSourceLine(parentBlock.textContent) : findSourceLine(parentBlock.textContent);
            if (line > 0) {
              selectSourceRange(line, null, parentBlock);
            }
          }
          // Let the link open naturally (target="_blank" is set by marked)
          return;
        }

        // Ignore clicks on mermaid, video overlay
        if (e.target.closest('.mermaid-container, .video-fullscreen-overlay')) return;

        // Handle code blocks - select entire block
        const pre = e.target.closest('pre');
        if (pre) {
          const code = pre.querySelector('code') || pre;
          const { startLine, endLine } = findCodeBlockRange(code.textContent);
          if (startLine > 0) {
            e.preventDefault();
            selectSourceRange(startLine, endLine, pre);
          }
          return;
        }

        const target = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th');
        if (!target) return;

        // Use table-specific search for table cells, otherwise use element-aware search
        const isTableCell = target.tagName === 'TD' || target.tagName === 'TH';
        const line = isTableCell ? findTableSourceLine(target.textContent) : findSourceLine(target.textContent, target);
        if (line <= 0) return;

        e.preventDefault();
        selectSourceRange(line, null, target);
      });

      // Text selection to open comment for range
      preview.addEventListener('mouseup', (e) => {
        setTimeout(() => {
          const sel = window.getSelection();
          if (!sel || sel.isCollapsed) return;

          const text = sel.toString().trim();
          if (!text || text.length < 5) return;

          const lines = text.split('\\n').filter(l => l.trim());
          if (lines.length === 0) return;

          const startLine = findSourceLine(lines[0]);
          const endLine = lines.length > 1 ? findSourceLine(lines[lines.length - 1]) : startLine;

          if (startLine <= 0) return;

          // Get the element containing the selection for positioning
          const range = sel.getRangeAt(0);
          const container = range.commonAncestorContainer;
          const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

          sel.removeAllRanges();
          selectSourceRange(startLine, endLine > 0 ? endLine : startLine, element);
        }, 10);
      });
    })();

    // --- Reviw Questions Modal ---
    (function initReviwQuestions() {
      if (MODE !== 'markdown') return;
      if (!REVIW_QUESTIONS || REVIW_QUESTIONS.length === 0) return;

      const overlay = document.getElementById('reviw-questions-overlay');
      const modal = document.getElementById('reviw-questions-modal');
      const body = document.getElementById('reviw-questions-body');
      const closeBtn = document.getElementById('reviw-questions-close');
      const laterBtn = document.getElementById('reviw-questions-later');
      const countSpan = document.getElementById('reviw-questions-count');
      const bar = document.getElementById('reviw-questions-bar');
      const barMessage = document.getElementById('reviw-questions-bar-message');
      const barCount = document.getElementById('reviw-questions-bar-count');
      const barOpenBtn = document.getElementById('reviw-questions-bar-open');

      if (!overlay || !modal || !body) return;

      // Store answers locally
      const answers = {};
      REVIW_QUESTIONS.forEach(q => {
        answers[q.id] = { selected: '', text: '' };
      });

      // Count unresolved questions
      const unresolvedQuestions = REVIW_QUESTIONS.filter(q => !q.resolved);
      const resolvedQuestions = REVIW_QUESTIONS.filter(q => q.resolved);

      function getUnansweredCount() {
        // Count questions that have no answer (no selection and no text)
        return unresolvedQuestions.filter(q => {
          const a = answers[q.id];
          return !a.selected && !a.text.trim();
        }).length;
      }

      function updateCounts() {
        const unansweredCount = getUnansweredCount();
        if (unansweredCount > 0) {
          countSpan.textContent = '(' + unansweredCount + '\u4ef6\u672a\u56de\u7b54)';
          barMessage.innerHTML = '\ud83d\udccb \u672a\u56de\u7b54\u306e\u8cea\u554f\u304c<span id="reviw-questions-bar-count">' + unansweredCount + '</span>\u4ef6\u3042\u308a\u307e\u3059';
          laterBtn.textContent = '\u5f8c\u3067\u56de\u7b54\u3059\u308b';
        } else {
          countSpan.textContent = '(\u5168\u3066\u56de\u7b54\u6e08\u307f)';
          barMessage.innerHTML = '\u2705 \u5168\u3066\u306e\u8cea\u554f\u306b\u56de\u7b54\u3057\u307e\u3057\u305f';
          laterBtn.textContent = '\u9589\u3058\u308b';
        }
      }

      function checkAllAnswered() {
        if (getUnansweredCount() === 0) {
          // All answered - close modal but keep bar visible
          setTimeout(() => {
            overlay.classList.remove('visible');
            // Keep bar visible with different message
            bar.classList.add('visible');
            document.body.classList.add('has-questions-bar');
          }, 500);
        }
      }

      function renderQuestions() {
        body.innerHTML = '';

        // Render unresolved questions
        unresolvedQuestions.forEach((q, idx) => {
          const item = document.createElement('div');
          item.className = 'reviw-question-item';
          item.dataset.id = q.id;

          let optionsHtml = '';
          if (q.options && q.options.length > 0) {
            optionsHtml = '<div class="reviw-question-options">' +
              q.options.map(opt =>
                '<button class="reviw-question-option" data-value="' + escapeAttr(opt) + '">' + escapeHtml(opt) + '</button>'
              ).join('') +
              '</div>';
          }

          const isOkOnly = q.options && q.options.length === 1 && q.options[0] === 'OK';

          item.innerHTML =
            '<div class="reviw-question-text">Q' + (idx + 1) + '. ' + escapeHtml(q.question) + '<span class="reviw-check-mark"></span></div>' +
            optionsHtml +
            (isOkOnly ? '' : '<textarea class="reviw-question-input" placeholder="\u30c6\u30ad\u30b9\u30c8\u3067\u56de\u7b54\u30fb\u88dc\u8db3..."></textarea>');

          body.appendChild(item);

          // Check mark element
          const checkMark = item.querySelector('.reviw-check-mark');

          function updateCheckMark() {
            const answer = answers[q.id];
            const hasAnswer = answer.selected || answer.text.trim();
            if (hasAnswer) {
              checkMark.textContent = ' \u2713';
              item.classList.add('answered');
            } else {
              checkMark.textContent = '';
              item.classList.remove('answered');
            }
          }

          // Option click handlers - always toggle
          const optionBtns = item.querySelectorAll('.reviw-question-option');
          optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              const wasSelected = btn.classList.contains('selected');
              optionBtns.forEach(b => b.classList.remove('selected'));
              if (!wasSelected) {
                btn.classList.add('selected');
                answers[q.id].selected = btn.dataset.value;
              } else {
                answers[q.id].selected = '';
              }
              updateCheckMark();
              updateCounts();
              checkAllAnswered();
            });
          });

          // Text input handler
          const textarea = item.querySelector('.reviw-question-input');
          if (textarea) {
            textarea.addEventListener('input', () => {
              answers[q.id].text = textarea.value;
              updateCheckMark();
              updateCounts();
              checkAllAnswered();
            });
          }

          updateCheckMark();
        });

        // Render resolved questions (collapsed)
        if (resolvedQuestions.length > 0) {
          const section = document.createElement('div');
          section.className = 'reviw-resolved-section';
          section.innerHTML =
            '<button class="reviw-resolved-toggle">' +
              '<span class="arrow">\u25b6</span> \u89e3\u6c7a\u6e08\u307f (' + resolvedQuestions.length + '\u4ef6)' +
            '</button>' +
            '<div class="reviw-resolved-list">' +
              resolvedQuestions.map(q =>
                '<div class="reviw-resolved-item">' +
                  '<div class="reviw-resolved-q">' + escapeHtml(q.question) + '</div>' +
                  '<div class="reviw-resolved-a">\u2192 ' + escapeHtml(q.answer || '(no answer)') + '</div>' +
                '</div>'
              ).join('') +
            '</div>';
          body.appendChild(section);

          const toggle = section.querySelector('.reviw-resolved-toggle');
          const list = section.querySelector('.reviw-resolved-list');
          toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            list.classList.toggle('visible');
          });
        }
      }

      function escapeHtml(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      function escapeAttr(str) {
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;');
      }

      function openModal() {
        overlay.classList.add('visible');
        bar.classList.remove('visible');
        document.body.classList.remove('has-questions-bar');
      }

      function closeModal(allAnswered) {
        overlay.classList.remove('visible');
        const unansweredCount = getUnansweredCount();
        if (unansweredCount > 0 && !allAnswered) {
          bar.classList.add('visible');
          document.body.classList.add('has-questions-bar');
        } else {
          bar.classList.remove('visible');
          document.body.classList.remove('has-questions-bar');
        }
      }

      // Event listeners
      closeBtn.addEventListener('click', () => closeModal(false));
      laterBtn.addEventListener('click', () => closeModal(false));
      barOpenBtn.addEventListener('click', openModal);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(false);
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('visible')) {
          closeModal(false);
        }
      });

      // Expose answers for submit (only answered ones)
      window.REVIW_ANSWERS = answers;

      // Initialize
      updateCounts();
      renderQuestions();

      // Show modal on load if there are unresolved questions
      if (unresolvedQuestions.length > 0) {
        setTimeout(() => openModal(), 300);
      }
    })();
  </script>
</body>
</html>`;
}

function buildHtml(filePath) {
  const data = loadData(filePath);
  const history = loadHistoryFromFile(filePath);
  if (data.mode === "diff") {
    return diffHtmlTemplate(data, history);
  }
  const { rows, cols, projectRoot, relativePath, mode, preview, reviwQuestions } = data;
  return htmlTemplate(rows, cols, projectRoot, relativePath, mode, preview, reviwQuestions, history);
}

// --- HTTP Server -----------------------------------------------------------
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const MAX_PORT_ATTEMPTS = 100;
const activeServers = new Map();

// --- Lock File Management (for detecting existing servers) ---
const LOCK_DIR = path.join(os.homedir(), '.reviw', 'locks');

function getLockFilePath(filePath) {
  // Use SHA256 hash of absolute path to prevent path traversal attacks
  const hash = crypto.createHash('sha256').update(path.resolve(filePath)).digest('hex').slice(0, 16);
  return path.join(LOCK_DIR, hash + '.lock');
}

function ensureLockDir() {
  try {
    if (!fs.existsSync(LOCK_DIR)) {
      fs.mkdirSync(LOCK_DIR, { recursive: true, mode: 0o700 });
    }
  } catch (err) {
    // Ignore errors - locks are optional optimization
  }
}

function writeLockFile(filePath, port) {
  try {
    ensureLockDir();
    const lockPath = getLockFilePath(filePath);
    const lockData = {
      pid: process.pid,
      port: port,
      file: path.resolve(filePath),
      created: Date.now()
    };
    fs.writeFileSync(lockPath, JSON.stringify(lockData), { mode: 0o600 });
  } catch (err) {
    // Ignore errors - locks are optional
  }
}

function removeLockFile(filePath) {
  try {
    const lockPath = getLockFilePath(filePath);
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch (err) {
    // Ignore errors
  }
}

// --- Image Saving Helper ---
function saveBase64Image(base64Data, baseDir) {
  try {
    // Parse data URL: data:image/png;base64,iVBORw0K...
    const match = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return null;

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const data = match[2];

    // Create ./tmp/ directory if it doesn't exist
    const tmpDir = path.join(baseDir, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Generate unique filename using timestamp and random string
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const filename = `reviw-${timestamp}-${random}.${ext}`;
    const filepath = path.join(tmpDir, filename);

    // Decode base64 and save to file
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filepath, buffer);

    // Return relative path (./tmp/filename)
    return `./tmp/${filename}`;
  } catch (err) {
    console.error('Failed to save image:', err);
    return null;
  }
}

// Process payload images: save to disk and replace base64 with paths
function processPayloadImages(payload, baseDir) {
  // Process summaryImages (images attached to summary)
  if (payload.summaryImages && Array.isArray(payload.summaryImages)) {
    const imagePaths = [];
    for (const base64 of payload.summaryImages) {
      const savedPath = saveBase64Image(base64, baseDir);
      if (savedPath) {
        imagePaths.push(savedPath);
      }
    }
    // Replace base64 array with file paths (keeps same key position)
    payload.summaryImages = imagePaths.length > 0 ? imagePaths : undefined;
    if (!payload.summaryImages) delete payload.summaryImages;
  }

  // Process comment images
  if (payload.comments && Array.isArray(payload.comments)) {
    for (const comment of payload.comments) {
      if (comment.image) {
        const savedPath = saveBase64Image(comment.image, baseDir);
        if (savedPath) {
          comment.imagePath = savedPath;
        }
        delete comment.image; // Remove base64 data from comment
      }
    }
  }

  // Add image reading instruction if any images are attached
  const hasCommentImages = payload.comments?.some(c => c.imagePath);
  const hasSummaryImages = payload.summaryImages?.length > 0;
  if (hasCommentImages || hasSummaryImages) {
    payload._imageReadingNote = "MANDATORY: You MUST read ALL images (imagePath and summaryImages) using the Read tool. Skipping image reading is PROHIBITED.";
  }

  return payload;
}

function checkExistingServer(filePath) {
  try {
    const lockPath = getLockFilePath(filePath);
    if (!fs.existsSync(lockPath)) {
      return null;
    }

    const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

    // Verify the process is still alive
    try {
      process.kill(lockData.pid, 0); // Signal 0 just checks if process exists
    } catch (err) {
      // Process doesn't exist - stale lock
      fs.unlinkSync(lockPath);
      return null;
    }

    // Verify the server is actually responding
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: lockData.port,
        path: '/healthz',
        method: 'GET',
        timeout: 1000
      }, (res) => {
        if (res.statusCode === 200) {
          resolve(lockData);
        } else {
          // Server not healthy - remove stale lock
          try { fs.unlinkSync(lockPath); } catch (e) {}
          resolve(null);
        }
      });
      req.on('error', () => {
        // Server not responding - remove stale lock
        try { fs.unlinkSync(lockPath); } catch (e) {}
        resolve(null);
      });
      req.on('timeout', () => {
        req.destroy();
        try { fs.unlinkSync(lockPath); } catch (e) {}
        resolve(null);
      });
      req.end();
    });
  } catch (err) {
    return null;
  }
}

// --- History File Management ---
const HISTORY_DIR = path.join(os.homedir(), '.reviw', 'history');
const HISTORY_MAX = 50;

function getHistoryFilePath(filePath) {
  // Use SHA256 hash of absolute path (same as lock files)
  const hash = crypto.createHash('sha256').update(path.resolve(filePath)).digest('hex').slice(0, 16);
  return path.join(HISTORY_DIR, hash + '.json');
}

function ensureHistoryDir() {
  try {
    if (!fs.existsSync(HISTORY_DIR)) {
      fs.mkdirSync(HISTORY_DIR, { recursive: true, mode: 0o700 });
    }
  } catch (err) {
    // Ignore errors
  }
}

function loadHistoryFromFile(filePath) {
  try {
    const historyPath = getHistoryFilePath(filePath);
    if (!fs.existsSync(historyPath)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveHistoryToFile(filePath, historyEntry) {
  try {
    ensureHistoryDir();
    const historyPath = getHistoryFilePath(filePath);
    let history = loadHistoryFromFile(filePath);
    history.unshift(historyEntry);
    if (history.length > HISTORY_MAX) {
      history = history.slice(0, HISTORY_MAX);
    }
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), { mode: 0o600 });
  } catch (err) {
    // Ignore errors - history is optional
  }
}

// Try to activate an existing browser tab with the given URL (macOS only)
// Returns true if a tab was activated, false otherwise
function tryActivateExistingTab(url) {
  if (process.platform !== "darwin") {
    return false;
  }

  try {
    // AppleScript to find and activate Chrome tab with URL
    // Uses "found" variable instead of return (AppleScript doesn't allow return at top level)
    const chromeScript = [
      'set found to false',
      'tell application "System Events"',
      '  if exists process "Google Chrome" then',
      '    tell application "Google Chrome"',
      '      set targetUrl to "' + url + '"',
      '      repeat with w in windows',
      '        set tabIndex to 1',
      '        repeat with t in tabs of w',
      '          if URL of t starts with targetUrl then',
      '            set active tab index of w to tabIndex',
      '            set index of w to 1',
      '            activate',
      '            set found to true',
      '            exit repeat',
      '          end if',
      '          set tabIndex to tabIndex + 1',
      '        end repeat',
      '        if found then exit repeat',
      '      end repeat',
      '    end tell',
      '  end if',
      'end tell',
      'found'
    ].join('\n');

    const chromeResult = spawnSync('osascript', ['-e', chromeScript], {
      encoding: "utf8",
      timeout: 3000
    });

    if (chromeResult.stdout && chromeResult.stdout.trim() === "true") {
      console.log("Activated existing Chrome tab: " + url);
      return true;
    }

    // Try Safari as fallback
    const safariScript = [
      'set found to false',
      'tell application "System Events"',
      '  if exists process "Safari" then',
      '    tell application "Safari"',
      '      set targetUrl to "' + url + '"',
      '      repeat with w in windows',
      '        repeat with t in tabs of w',
      '          if URL of t starts with targetUrl then',
      '            set current tab of w to t',
      '            set index of w to 1',
      '            activate',
      '            set found to true',
      '            exit repeat',
      '          end if',
      '        end repeat',
      '        if found then exit repeat',
      '      end repeat',
      '    end tell',
      '  end if',
      'end tell',
      'found'
    ].join('\n');

    const safariResult = spawnSync('osascript', ['-e', safariScript], {
      encoding: "utf8",
      timeout: 3000
    });

    if (safariResult.stdout && safariResult.stdout.trim() === "true") {
      console.log("Activated existing Safari tab: " + url);
      return true;
    }

    return false;
  } catch (err) {
    // AppleScript failed (not macOS, Chrome/Safari not installed, etc.)
    return false;
  }
}

// Open browser with the given URL, trying to reuse existing tab first (macOS)
function openBrowser(url, delay = 0) {
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  setTimeout(function() {
    // On macOS, try to activate existing tab first
    if (process.platform === "darwin") {
      var activated = tryActivateExistingTab(url);
      if (activated) {
        return;  // Successfully activated existing tab
      }
      // If activation failed, fall through to open new tab
    }

    try {
      var child = spawn(opener, [url], { stdio: "ignore", detached: true });
      child.on('error', function(err) {
        console.warn(
          "Failed to open browser automatically. Please open this URL manually:",
          url
        );
      });
      child.unref();
    } catch (err) {
      console.warn(
        "Failed to open browser automatically. Please open this URL manually:",
        url
      );
    }
  }, delay);
}

function outputAllResults() {
  console.log("=== All comments received ===");
  if (allResults.length === 1) {
    const yamlOut = yaml.dump(allResults[0], { noRefs: true, lineWidth: 120 });
    console.log(yamlOut.trim());
  } else {
    const combined = { files: allResults };
    const yamlOut = yaml.dump(combined, { noRefs: true, lineWidth: 120 });
    console.log(yamlOut.trim());
  }

  // Output answered questions if any
  const allAnswers = [];
  for (const result of allResults) {
    if (result.reviwAnswers && result.reviwAnswers.length > 0) {
      allAnswers.push(...result.reviwAnswers);
    }
  }
  if (allAnswers.length > 0) {
    console.log("\n[REVIW_ANSWERS]");
    const answersYaml = yaml.dump(allAnswers, { noRefs: true, lineWidth: 120 });
    console.log(answersYaml.trim());
    console.log("[/REVIW_ANSWERS]");
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
    ctx.sseClients.forEach((res) => {
      try {
        res.end();
      } catch (_) {}
    });
    if (ctx.server) ctx.server.close();
  }
  outputAllResults();
  setTimeout(() => process.exit(0), 500).unref();
}

process.on("SIGINT", shutdownAll);
process.on("SIGTERM", shutdownAll);

function createFileServer(filePath, fileIndex = 0) {
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
      port: 0,
    };

    function broadcast(data) {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      ctx.sseClients.forEach((res) => {
        try {
          res.write(`data: ${payload}\n\n`);
        } catch (_) {}
      });
    }

    function notifyReload() {
      clearTimeout(ctx.reloadTimer);
      ctx.reloadTimer = setTimeout(() => broadcast("reload"), 150);
    }

    function startWatcher() {
      try {
        ctx.watcher = fs.watch(filePath, { persistent: true }, notifyReload);
      } catch (err) {
        console.warn(`Failed to start file watcher for ${baseName}:`, err);
      }
      ctx.heartbeat = setInterval(() => broadcast("ping"), 25000);
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
      ctx.sseClients.forEach((res) => {
        try {
          res.end();
        } catch (_) {}
      });
      if (ctx.server) {
        ctx.server.close();
        ctx.server = null;
      }
      activeServers.delete(filePath);
      removeLockFile(filePath);  // Clean up lock file
      if (result) allResults.push(result);
      serversRunning--;
      console.log(`Server for ${baseName} closed. (${serversRunning} remaining)`);
      checkAllDone();
    }

    ctx.server = http.createServer(async (req, res) => {
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        try {
          const html = buildHtml(filePath);
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          });
          res.end(html);
        } catch (err) {
          console.error("File load error", err);
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Failed to load file. Please check the file.");
        }
        return;
      }

      if (req.method === "GET" && req.url === "/healthz") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        return;
      }

      if (req.method === "POST" && req.url === "/exit") {
        try {
          const raw = await readBody(req);
          let payload = {};
          if (raw && raw.trim()) {
            payload = JSON.parse(raw);
          }
          // Process images: save to ./tmp/ and replace base64 with paths
          if (payload) {
            payload = processPayloadImages(payload, ctx.baseDir);
          }
          // Save to file-based history (only if there are comments)
          if (payload && (payload.comments?.length > 0 || payload.submitComment)) {
            saveHistoryToFile(ctx.filePath, payload);
          }
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("bye");
          // Notify all tabs to close before shutting down
          broadcast("submitted");
          setTimeout(() => shutdownServer(payload), 300);
        } catch (err) {
          console.error("payload parse error", err);
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("bad request");
          broadcast("submitted");
          setTimeout(() => shutdownServer(null), 300);
        }
        return;
      }

      if (req.method === "GET" && req.url === "/sse") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });
        res.write("retry: 3000\n\n");
        ctx.sseClients.add(res);
        req.on("close", () => ctx.sseClients.delete(res));
        return;
      }

      // Static file serving for images and other assets
      if (req.method === "GET" || req.method === "HEAD") {
        const MIME_TYPES = {
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".css": "text/css",
          ".js": "application/javascript",
          ".json": "application/json",
          ".pdf": "application/pdf",
          // Video formats
          ".mp4": "video/mp4",
          ".webm": "video/webm",
          ".mov": "video/quicktime",
          ".avi": "video/x-msvideo",
          ".mkv": "video/x-matroska",
          ".m4v": "video/x-m4v",
          ".ogv": "video/ogg",
        };
        try {
          let urlPath = decodeURIComponent(req.url.split("?")[0]);
          // Remove leading slash so path.join works correctly with relative baseDir
          if (urlPath.startsWith("/")) {
            urlPath = urlPath.slice(1);
          }
          if (urlPath.includes("..")) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.end("forbidden");
            return;
          }
          const staticPath = path.join(baseDir, urlPath);
          if (!staticPath.startsWith(baseDir)) {
            res.writeHead(403, { "Content-Type": "text/plain" });
            res.end("forbidden");
            return;
          }
          if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
            const ext = path.extname(staticPath).toLowerCase();
            const contentType = MIME_TYPES[ext] || "application/octet-stream";
            const stat = fs.statSync(staticPath);
            const fileSize = stat.size;

            // Check if this is a video file that needs Range Request support
            const isVideo = contentType.startsWith("video/");
            const rangeHeader = req.headers.range;

            if (isVideo && rangeHeader) {
              // Parse Range header (e.g., "bytes=0-1023")
              const parts = rangeHeader.replace(/bytes=/, "").split("-");
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunkSize = end - start + 1;

              res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": contentType,
              });

              if (req.method === "HEAD") {
                res.end();
              } else {
                const stream = fs.createReadStream(staticPath, { start, end });
                stream.pipe(res);
              }
            } else {
              // Non-range request or non-video file
              const headers = {
                "Content-Type": contentType,
                "Content-Length": fileSize,
              };
              // Add Accept-Ranges for video files so browser knows it can seek
              if (isVideo) {
                headers["Accept-Ranges"] = "bytes";
              }
              res.writeHead(200, headers);

              // HEAD requests don't need body
              if (req.method === "HEAD") {
                res.end();
              } else if (fileSize > 1024 * 1024) {
                // Use streaming for large files (> 1MB)
                const stream = fs.createReadStream(staticPath);
                stream.pipe(res);
              } else {
                const content = fs.readFileSync(staticPath);
                res.end(content);
              }
            }
            return;
          }
        } catch (err) {
          // fall through to 404
        }
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    });

    let serverStarted = false;

    function tryListen(attemptPort, attempts = 0) {
      if (serverStarted) return; // Prevent double-start race condition
      // Clear previous listeners from failed attempts to avoid duplicate
      // "listening" callbacks firing after a later successful bind.
      ctx.server.removeAllListeners("error");
      ctx.server.removeAllListeners("listening");
      if (attempts >= MAX_PORT_ATTEMPTS) {
        console.error(
          `Could not find an available port for ${baseName} after ${MAX_PORT_ATTEMPTS} attempts.`,
        );
        serversRunning--;
        checkAllDone();
        return;
      }

      ctx.server.once("error", (err) => {
        if (serverStarted) return; // Already started on another port
        if (err.code === "EADDRINUSE") {
          tryListen(attemptPort + 1, attempts + 1);
        } else {
          console.error(`Server error for ${baseName}:`, err);
          serversRunning--;
          checkAllDone();
        }
      });

      ctx.server.listen(attemptPort, () => {
        if (serverStarted) {
          // Race condition: server started on multiple ports, close this one
          try { ctx.server.close(); } catch (_) {}
          return;
        }
        serverStarted = true;
        ctx.port = attemptPort;
        nextPort = attemptPort + 1;
        activeServers.set(filePath, ctx);
        console.log(`Viewer started: http://localhost:${attemptPort}  (file: ${baseName})`);
        writeLockFile(filePath, attemptPort);  // Write lock file for server detection
        if (!noOpen) {
          const url = `http://localhost:${attemptPort}`;
          // Add delay for multiple files to avoid browser ignoring rapid open commands
          const delay = fileIndex * 300;
          openBrowser(url, delay);
        }
        startWatcher();
        resolve(ctx);
      });
    }

    tryListen(nextPort);
  });
}

// Create server for diff mode
function createDiffServer(diffContent) {
  return new Promise((resolve) => {
    const diffData = loadDiff(diffContent);

    const ctx = {
      diffData,
      sseClients: new Set(),
      heartbeat: null,
      server: null,
      port: 0,
    };

    function broadcast(data) {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      ctx.sseClients.forEach((res) => {
        try {
          res.write(`data: ${payload}\n\n`);
        } catch (_) {}
      });
    }

    function shutdownServer(result) {
      if (ctx.heartbeat) {
        clearInterval(ctx.heartbeat);
        ctx.heartbeat = null;
      }
      ctx.sseClients.forEach((res) => {
        try {
          res.end();
        } catch (_) {}
      });
      if (ctx.server) {
        ctx.server.close();
        ctx.server = null;
      }
      if (result) allResults.push(result);
      serversRunning--;
      console.log(`Diff server closed. (${serversRunning} remaining)`);
      checkAllDone();
    }

    ctx.server = http.createServer(async (req, res) => {
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        try {
          const html = diffHtmlTemplate(diffData);
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          });
          res.end(html);
        } catch (err) {
          console.error("Diff render error", err);
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Failed to render diff view.");
        }
        return;
      }

      if (req.method === "GET" && req.url === "/healthz") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        return;
      }

      if (req.method === "POST" && req.url === "/exit") {
        try {
          const raw = await readBody(req);
          let payload = {};
          if (raw && raw.trim()) {
            payload = JSON.parse(raw);
          }
          // Process images: save to ./tmp/ and replace base64 with paths
          // For diff mode, use current working directory
          if (payload) {
            payload = processPayloadImages(payload, process.cwd());
          }
          // Save to file-based history (only if there are comments)
          // For diff mode, use relativePath as identifier
          if (payload && (payload.comments?.length > 0 || payload.submitComment)) {
            const filePath = ctx.diffData?.relativePath || 'stdin-diff';
            saveHistoryToFile(filePath, payload);
          }
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("bye");
          // Notify all tabs to close before shutting down
          broadcast("submitted");
          setTimeout(() => shutdownServer(payload), 300);
        } catch (err) {
          console.error("payload parse error", err);
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("bad request");
          broadcast("submitted");
          setTimeout(() => shutdownServer(null), 300);
        }
        return;
      }

      if (req.method === "GET" && req.url === "/sse") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        });
        res.write("retry: 3000\n\n");
        ctx.sseClients.add(res);
        req.on("close", () => ctx.sseClients.delete(res));
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    });

    let serverStarted = false;

    function tryListen(attemptPort, attempts = 0) {
      if (serverStarted) return; // Prevent double-start race condition
      // Clear listeners from previous failed attempts to prevent stale
      // "listening" handlers from firing on the successful bind.
      ctx.server.removeAllListeners("error");
      ctx.server.removeAllListeners("listening");
      if (attempts >= MAX_PORT_ATTEMPTS) {
        console.error(
          `Could not find an available port for diff viewer after ${MAX_PORT_ATTEMPTS} attempts.`,
        );
        serversRunning--;
        checkAllDone();
        return;
      }

      ctx.server.once("error", (err) => {
        if (serverStarted) return; // Already started on another port
        if (err.code === "EADDRINUSE") {
          tryListen(attemptPort + 1, attempts + 1);
        } else {
          console.error("Diff server error:", err);
          serversRunning--;
          checkAllDone();
        }
      });

      ctx.server.listen(attemptPort, () => {
        if (serverStarted) {
          // Race condition: server started on multiple ports, close this one
          try { ctx.server.close(); } catch (_) {}
          return;
        }
        serverStarted = true;
        ctx.port = attemptPort;
        ctx.heartbeat = setInterval(() => broadcast("ping"), 25000);
        console.log(`Diff viewer started: http://localhost:${attemptPort}`);
        if (!noOpen) {
          const url = `http://localhost:${attemptPort}`;
          openBrowser(url, 0);
        }
        resolve(ctx);
      });
    }

    tryListen(basePort);
  });
}

// Main entry point - only run when executed directly (not when required for testing)
if (require.main === module) {
  // Parse CLI arguments and apply configuration
  const { config, filePaths } = parseCliArgs(process.argv);
  basePort = config.basePort;
  encodingOpt = config.encodingOpt;
  noOpen = config.noOpen;
  nextPort = config.basePort;  // Update nextPort to match configured basePort

  // Validate and resolve file paths
  resolvedPaths = validateAndResolvePaths(filePaths);

(async () => {
  // Check for stdin input first
  const stdinData = await checkStdin();

  if (stdinData) {
    // Pipe mode: stdin has data
    stdinMode = true;
    stdinContent = stdinData;

    // Check if it looks like a diff
    if (
      stdinContent.startsWith("diff --git") ||
      stdinContent.includes("\n+++ ") ||
      stdinContent.includes("\n--- ")
    ) {
      diffMode = true;
      console.log("Starting diff viewer from stdin...");
      serversRunning = 1;
      await createDiffServer(stdinContent);
      console.log("Close the browser tab or Submit & Exit to finish.");
    } else {
      // Treat as plain text
      console.log("Starting text viewer from stdin...");
      // For now, just show message - could enhance to support any text
      console.error("Non-diff stdin content is not supported yet. Use a file instead.");
      process.exit(1);
    }
  } else if (resolvedPaths.length > 0) {
    // File mode: files specified
    // Check for existing servers first
    let filesToStart = [];
    for (const fp of resolvedPaths) {
      const existing = await checkExistingServer(fp);
      if (existing) {
        console.log(`Server already running for ${path.basename(fp)} on port ${existing.port}`);
        const url = `http://localhost:${existing.port}`;
        if (!noOpen) {
          openBrowser(url, 0);
        }
      } else {
        filesToStart.push(fp);
      }
    }

    if (filesToStart.length === 0) {
      console.log("All files already have running servers. Activating existing tabs.");
      // Wait a moment for browser activation to complete before exiting
      setTimeout(() => process.exit(0), 500);
      return;
    }

    console.log(`Starting servers for ${filesToStart.length} file(s)...`);
    serversRunning = filesToStart.length;
    for (let i = 0; i < filesToStart.length; i++) {
      await createFileServer(filesToStart[i], i);
    }
    console.log("Close all browser tabs or Submit & Exit to finish.");
  } else {
    // No files and no stdin: try auto git diff
    console.log(`reviw v${VERSION}`);
    console.log("No files specified. Running git diff HEAD...");
    try {
      const gitDiff = await runGitDiff();
      if (gitDiff.trim() === "") {
        console.log("No changes detected (working tree clean).");
        console.log("");
        console.log("Usage: reviw <file...> [options]");
        console.log("       git diff | reviw [options]");
        console.log("       reviw              (auto runs git diff HEAD)");
        console.log("");
        console.log("Run 'reviw --help' for more information.");
        process.exit(0);
      }
      diffMode = true;
      stdinContent = gitDiff;
      console.log("Starting diff viewer...");
      serversRunning = 1;
      await createDiffServer(gitDiff);
      console.log("Close the browser tab or Submit & Exit to finish.");
    } catch (err) {
      console.error(err.message);
      console.log("");
      console.log("Usage: reviw <file...> [options]");
      console.log("       git diff | reviw [options]");
      console.log("");
      console.log("Run 'reviw --help' for more information.");
      process.exit(1);
    }
  }
})();
}

// Export parser functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseDiff, parseCsv, DEFAULT_CONFIG };
}
