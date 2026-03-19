///| Build the main CSS styles
fn build_css() -> String {
  let css =
    #|/* Dark theme (default) */
    #|:root {
    #|  color-scheme: dark;
    #|  --bg: #0f172a;
    #|  --bg-gradient: radial-gradient(circle at 20% 20%, #1e293b 0%, #0b1224 35%, #0b1224 60%, #0f172a 100%);
    #|  --panel: #111827;
    #|  --panel-alpha: rgba(15, 23, 42, 0.9);
    #|  --panel-solid: #0b1224;
    #|  --card-bg: rgba(11, 18, 36, 0.95);
    #|  --input-bg: rgba(15, 23, 42, 0.6);
    #|  --border: #1f2937;
    #|  --accent: #60a5fa;
    #|  --accent-2: #f472b6;
    #|  --text: #e5e7eb;
    #|  --text-inverse: #0b1224;
    #|  --muted: #94a3b8;
    #|  --comment: #0f766e;
    #|  --badge: #22c55e;
    #|  --table-bg: rgba(15, 23, 42, 0.7);
    #|  --row-even: rgba(30, 41, 59, 0.4);
    #|  --row-odd: rgba(15, 23, 42, 0.2);
    #|  --selected-bg: rgba(96,165,250,0.15);
    #|  --hover-bg: rgba(96,165,250,0.08);
    #|  --shadow-color: rgba(0,0,0,0.35);
    #|  --code-bg: #1e293b;
    #|  --error: #dc3545;
    #|}
    #|/* Light theme */
    #|[data-theme="light"] {
    #|  color-scheme: light;
    #|  --bg: #f8fafc;
    #|  --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    #|  --panel: #ffffff;
    #|  --panel-alpha: rgba(255, 255, 255, 0.95);
    #|  --panel-solid: #ffffff;
    #|  --card-bg: rgba(255, 255, 255, 0.98);
    #|  --input-bg: #f1f5f9;
    #|  --border: #e2e8f0;
    #|  --accent: #3b82f6;
    #|  --accent-2: #ec4899;
    #|  --text: #1e293b;
    #|  --text-inverse: #ffffff;
    #|  --muted: #64748b;
    #|  --comment: #14b8a6;
    #|  --badge: #22c55e;
    #|  --table-bg: #ffffff;
    #|  --row-even: #f8fafc;
    #|  --row-odd: #ffffff;
    #|  --selected-bg: rgba(59,130,246,0.12);
    #|  --hover-bg: rgba(59,130,246,0.06);
    #|  --shadow-color: rgba(0,0,0,0.1);
    #|  --code-bg: #f1f5f9;
    #|  --error: #dc3545;
    #|}
    #|* { box-sizing: border-box; }
    #|body {
    #|  margin: 0;
    #|  font-family: "Inter", "Hiragino Sans", system-ui, -apple-system, sans-serif;
    #|  background: var(--bg-gradient);
    #|  color: var(--text);
    #|  min-height: 100vh;
    #|  transition: background 200ms ease, color 200ms ease;
    #|}
    #|header {
    #|  position: sticky;
    #|  top: 0;
    #|  z-index: 5;
    #|  padding: 12px 16px;
    #|  background: var(--panel-alpha);
    #|  backdrop-filter: blur(8px);
    #|  border-bottom: 1px solid var(--border);
    #|  display: flex;
    #|  gap: 12px;
    #|  align-items: center;
    #|  justify-content: space-between;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|header .meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    #|header .actions { display: flex; gap: 8px; align-items: center; }
    #|header h1 { display: flex; flex-direction: column; margin: 0; line-height: 1.3; }
    #|header h1 .title-path { font-size: 11px; font-weight: 400; color: var(--muted); }
    #|header h1 .title-file { font-size: 16px; font-weight: 700; }
    #|header .badge {
    #|  background: var(--selected-bg);
    #|  color: var(--text);
    #|  padding: 6px 10px;
    #|  border-radius: 8px;
    #|  font-size: 12px;
    #|  border: 1px solid var(--border);
    #|}
    #|header button {
    #|  background: linear-gradient(135deg, #38bdf8, #6366f1);
    #|  color: var(--text-inverse);
    #|  border: none;
    #|  border-radius: 10px;
    #|  padding: 10px 14px;
    #|  font-weight: 700;
    #|  cursor: pointer;
    #|  box-shadow: 0 10px 30px var(--shadow-color);
    #|  transition: transform 120ms ease, box-shadow 120ms ease;
    #|}
    #|header button:hover { transform: translateY(-1px); box-shadow: 0 16px 36px var(--shadow-color); }
    #|header button:active { transform: translateY(0); }
    #|/* Theme toggle button */
    #|.theme-toggle {
    #|  background: var(--selected-bg);
    #|  color: var(--text);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 8px 10px;
    #|  font-size: 16px;
    #|  cursor: pointer;
    #|  transition: background 120ms ease, transform 120ms ease;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  width: 38px;
    #|  height: 38px;
    #|}
    #|.theme-toggle:hover { background: var(--hover-bg); transform: scale(1.05); }
    #|
    #|.wrap { padding: 12px 16px 12px; }
    #|.toolbar {
    #|  display: flex;
    #|  gap: 12px;
    #|  align-items: center;
    #|  flex-wrap: wrap;
    #|  margin: 10px 0 12px;
    #|  color: var(--muted);
    #|  font-size: 13px;
    #|}
    #|.toolbar button {
    #|  background: rgba(96,165,250,0.12);
    #|  color: var(--text);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 8px 10px;
    #|  font-size: 13px;
    #|  cursor: pointer;
    #|}
    #|.toolbar button:hover { background: rgba(96,165,250,0.2); }
    #|
    #|.table-box {
    #|  background: var(--table-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 12px;
    #|  overflow: auto;
    #|  max-height: calc(100vh - 110px);
    #|  box-shadow: 0 20px 50px var(--shadow-color);
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|table {
    #|  border-collapse: collapse;
    #|  width: 100%;
    #|  min-width: 540px;
    #|  table-layout: fixed;
    #|}
    #|thead th {
    #|  position: sticky;
    #|  top: 0;
    #|  z-index: 3;
    #|  background: var(--panel-solid) !important;
    #|  color: var(--muted);
    #|  font-size: 12px;
    #|  text-align: center;
    #|  padding: 0;
    #|  border-bottom: 1px solid var(--border);
    #|  border-right: 1px solid var(--border);
    #|  white-space: nowrap;
    #|  transition: background 200ms ease;
    #|}
    #|thead th:not(.selected) {
    #|  background: var(--panel-solid) !important;
    #|}
    #|thead th:first-child,
    #|tbody th {
    #|  width: 28px;
    #|  min-width: 28px;
    #|  max-width: 28px;
    #|}
    #|thead th .th-inner {
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  gap: 4px;
    #|  padding: 8px 6px;
    #|  position: relative;
    #|  height: 100%;
    #|}
    #|thead th.filtered .th-inner {
    #|  background: linear-gradient(135deg, rgba(96,165,250,0.18), rgba(34,197,94,0.18));
    #|  color: #e5e7eb;
    #|  border-radius: 6px;
    #|  box-shadow: inset 0 -1px 0 rgba(255,255,255,0.05);
    #|}
    #|thead th.filtered .th-inner::after {
    #|  content: 'FILTER';
    #|  font-size: 10px;
    #|  color: #c7d2fe;
    #|  background: rgba(99,102,241,0.24);
    #|  border: 1px solid rgba(99,102,241,0.45);
    #|  padding: 1px 6px;
    #|  border-radius: 999px;
    #|  position: absolute;
    #|  bottom: 4px;
    #|  right: 6px;
    #|}
    #|.resizer {
    #|  position: absolute;
    #|  right: 2px;
    #|  top: 0;
    #|  width: 6px;
    #|  height: 100%;
    #|  cursor: col-resize;
    #|  user-select: none;
    #|  touch-action: none;
    #|  opacity: 0.6;
    #|}
    #|.resizer::after {
    #|  content: '';
    #|  position: absolute;
    #|  top: 10%;
    #|  bottom: 10%;
    #|  left: 2px;
    #|  width: 2px;
    #|  background: rgba(96,165,250,0.6);
    #|  border-radius: 2px;
    #|  opacity: 0;
    #|  transition: opacity 120ms ease;
    #|}
    #|thead th:hover .resizer::after { opacity: 1; }
    #|
    #|.freeze {
    #|  position: sticky !important;
    #|  background: var(--panel-solid);
    #|  z-index: 4;
    #|}
    #|.freeze-row {
    #|  position: sticky !important;
    #|  background: var(--panel-solid);
    #|}
    #|.freeze-row.freeze {
    #|  z-index: 6;
    #|}
    #|th.freeze-row {
    #|  z-index: 6;
    #|}
    #|tbody th {
    #|  position: sticky;
    #|  left: 0;
    #|  z-index: 2;
    #|  background: var(--panel-solid);
    #|  color: var(--muted);
    #|  text-align: right;
    #|  padding: 8px 10px;
    #|  font-size: 12px;
    #|  border-right: 1px solid var(--border);
    #|  border-bottom: 1px solid var(--border);
    #|  transition: background 200ms ease;
    #|}
    #|td {
    #|  padding: 10px 10px;
    #|  border-bottom: 1px solid var(--border);
    #|  border-right: 1px solid var(--border);
    #|  background: var(--row-odd);
    #|  color: var(--text);
    #|  font-size: 13px;
    #|  line-height: 1.45;
    #|  cursor: pointer;
    #|  transition: background 120ms ease, box-shadow 120ms ease;
    #|  position: relative;
    #|  white-space: pre-wrap;
    #|  word-break: break-word;
    #|  max-width: 320px;
    #|}
    #|tr:nth-child(even) td:not(.selected):not(.has-comment) { background: var(--row-even); }
    #|td:hover:not(.selected) { background: var(--hover-bg); box-shadow: inset 0 0 0 1px rgba(96,165,250,0.25); }
    #|td.has-comment { background: rgba(34,197,94,0.12); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.35); }
    #|td.selected, tbody th.selected { background: rgba(99,102,241,0.22) !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }
    #|.preview-highlight { background: rgba(167,139,250,0.18) !important; box-shadow: inset 0 0 0 2px rgba(139,92,246,0.35); border-radius: 4px; transition: background 150ms ease, box-shadow 150ms ease; padding-left: 8px; margin-left: -8px; }
    #|thead th.selected { background: #c7d2fe !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }
    #|[data-theme="dark"] thead th.selected { background: #3730a3 !important; }
    #|body.dragging { user-select: none; cursor: crosshair; }
    #|body.dragging td, body.dragging tbody th { cursor: crosshair; }
    #|tbody th { cursor: pointer; }
    #|td .dot {
    #|  position: absolute;
    #|  right: 6px;
    #|  top: 6px;
    #|  width: 8px;
    #|  height: 8px;
    #|  border-radius: 99px;
    #|  background: var(--badge);
    #|  box-shadow: 0 0 0 4px rgba(34,197,94,0.15);
    #|}
    #|.floating {
    #|  position: absolute;
    #|  z-index: 10;
    #|  background: var(--panel-solid);
    #|  border: 1px solid var(--border);
    #|  border-radius: 12px;
    #|  padding: 12px;
    #|  width: min(420px, calc(100vw - 32px));
    #|  box-shadow: 0 20px 40px var(--shadow-color);
    #|  display: none;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.floating header {
    #|  position: static;
    #|  background: transparent;
    #|  backdrop-filter: none;
    #|  border: none;
    #|  padding: 0 0 8px 0;
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|}
    #|.floating h2 { font-size: 14px; margin: 0; color: var(--text); }
    #|.floating button {
    #|  margin-left: 8px;
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  border: 1px solid var(--accent);
    #|  padding: 6px 10px;
    #|  border-radius: 8px;
    #|  font-size: 12px;
    #|  font-weight: 600;
    #|  cursor: pointer;
    #|  transition: background 120ms ease, opacity 120ms ease;
    #|}
    #|.floating button.icon-only {
    #|  width: 32px;
    #|  height: 32px;
    #|  padding: 0;
    #|  display: inline-flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  font-size: 14px;
    #|  line-height: 1;
    #|}
    #|.floating button:hover { opacity: 0.85; }
    #|.floating textarea {
    #|  width: 100%;
    #|  min-height: 110px;
    #|  resize: vertical;
    #|  border-radius: 8px;
    #|  border: 1px solid var(--border);
    #|  background: var(--input-bg);
    #|  color: var(--text);
    #|  padding: 10px;
    #|  font-size: 13px;
    #|  line-height: 1.4;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.floating textarea:focus {
    #|  outline: none;
    #|  border-color: var(--accent);
    #|}
    #|.floating .actions {
    #|  display: flex;
    #|  gap: 8px;
    #|  justify-content: flex-end;
    #|  margin-top: 10px;
    #|}
    #|.floating .actions button.primary {
    #|  background: linear-gradient(135deg, #22c55e, #16a34a);
    #|  color: var(--text-inverse);
    #|  border: none;
    #|  font-weight: 700;
    #|  box-shadow: 0 10px 30px rgba(22,163,74,0.35);
    #|}
    #|.comment-list {
    #|  position: fixed;
    #|  right: 14px;
    #|  bottom: 14px;
    #|  width: 320px;
    #|  max-height: 60vh;
    #|  overflow: auto;
    #|  border: 1px solid var(--border);
    #|  border-radius: 12px;
    #|  background: var(--card-bg);
    #|  box-shadow: 0 18px 40px var(--shadow-color);
    #|  padding: 12px;
    #|  backdrop-filter: blur(6px);
    #|  transition: opacity 120ms ease, transform 120ms ease, background 200ms ease;
    #|}
    #|.comment-list h3 { margin: 0 0 8px 0; font-size: 13px; color: var(--muted); }
    #|.comment-list ol {
    #|  margin: 0;
    #|  padding-left: 18px;
    #|  color: var(--text);
    #|  font-size: 13px;
    #|  line-height: 1.45;
    #|}
    #|.comment-list li { margin-bottom: 6px; }
    #|.comment-list .hint { color: var(--muted); font-size: 12px; }
    #|.pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: var(--selected-bg); border: 1px solid var(--border); font-size: 12px; color: var(--text); cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }
    #|.pill:hover { background: var(--hover-bg); border-color: var(--accent); }
    #|.pill strong { color: var(--text); font-weight: 700; }
    #|.comment-list.collapsed {
    #|  opacity: 0;
    #|  pointer-events: none;
    #|  transform: translateY(8px) scale(0.98);
    #|}
    #|.md-preview {
    #|  background: var(--input-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 12px;
    #|  padding: 14px;
    #|  margin-bottom: 12px;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.md-layout {
    #|  display: flex;
    #|  gap: 16px;
    #|  align-items: stretch;
    #|  margin-top: 8px;
    #|  height: calc(100vh - 80px);
    #|}
    #|.md-left {
    #|  flex: 1;
    #|  min-width: 200px;
    #|  overflow-y: auto;
    #|  overflow-x: auto;
    #|  overscroll-behavior: contain;
    #|}
    #|.md-left .md-preview {
    #|  max-height: none;
    #|}
    #|.md-right {
    #|  flex: 1;
    #|  min-width: 0;
    #|  overflow-y: auto;
    #|  overflow-x: auto;
    #|  overscroll-behavior: contain;
    #|}
    #|.md-right .table-box {
    #|  max-width: none;
    #|  min-width: 0;
    #|  max-height: none;
    #|  overflow: visible;
    #|}
    #|/* Ensure thead is opaque in md-right to prevent content showing through */
    #|.md-right thead th {
    #|  background: var(--panel-solid) !important;
    #|}
    #|.md-right thead th.selected {
    #|  background: #c7d2fe !important;
    #|}
    #|[data-theme="dark"] .md-right thead th {
    #|  background: var(--panel-solid) !important;
    #|}
    #|[data-theme="dark"] .md-right thead th.selected {
    #|  background: #3730a3 !important;
    #|}
    #|
    #|/* === Media Sidebar === */
    #|.media-sidebar {
    #|  display: flex;
    #|  flex-shrink: 0;
    #|  height: calc(100vh - 80px);
    #|  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    #|  position: relative;
    #|  z-index: 10;
    #|  max-width: 60%;
    #|}
    #|.media-sidebar.hidden {
    #|  display: none;
    #|}
    #|.media-sidebar-thumbs {
    #|  width: 96px;
    #|  overflow-y: auto;
    #|  overflow-x: hidden;
    #|  padding: 8px;
    #|  border-right: 1px solid var(--border);
    #|  display: flex;
    #|  flex-direction: column;
    #|  gap: 8px;
    #|  background: var(--panel);
    #|  scrollbar-width: thin;
    #|  scrollbar-color: var(--border) transparent;
    #|}
    #|.media-sidebar-thumbs::-webkit-scrollbar {
    #|  width: 4px;
    #|}
    #|.media-sidebar-thumbs::-webkit-scrollbar-track {
    #|  background: transparent;
    #|}
    #|.media-sidebar-thumbs::-webkit-scrollbar-thumb {
    #|  background: var(--border);
    #|  border-radius: 4px;
    #|}
    #|.media-sidebar-thumb {
    #|  width: 80px;
    #|  height: 60px;
    #|  border-radius: 6px;
    #|  border: 2px solid var(--border);
    #|  overflow: hidden;
    #|  cursor: pointer;
    #|  position: relative;
    #|  flex-shrink: 0;
    #|  background: var(--bg);
    #|  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    #|}
    #|.media-sidebar-thumb:hover {
    #|  border-color: var(--accent);
    #|  transform: scale(1.05);
    #|  box-shadow: 0 2px 8px var(--shadow-color);
    #|}
    #|.media-sidebar-thumb.active {
    #|  border-color: var(--accent);
    #|  box-shadow: 0 0 0 2px var(--accent), 0 2px 8px var(--shadow-color);
    #|}
    #|.media-sidebar-thumb img {
    #|  width: 100%;
    #|  height: 100%;
    #|  object-fit: cover;
    #|  display: block;
    #|}
    #|.media-sidebar-thumb svg {
    #|  width: 100%;
    #|  height: 100%;
    #|  display: block;
    #|}
    #|.media-sidebar-thumb-video {
    #|  position: relative;
    #|  width: 100%;
    #|  height: 100%;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  background: #000;
    #|}
    #|.media-sidebar-thumb-video video {
    #|  width: 100%;
    #|  height: 100%;
    #|  object-fit: cover;
    #|}
    #|.media-sidebar-thumb-video::after {
    #|  content: '';
    #|  position: absolute;
    #|  width: 24px;
    #|  height: 24px;
    #|  background: rgba(255,255,255,0.85);
    #|  border-radius: 50%;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|}
    #|.media-sidebar-thumb-video::before {
    #|  content: '';
    #|  position: absolute;
    #|  z-index: 1;
    #|  width: 0;
    #|  height: 0;
    #|  border-style: solid;
    #|  border-width: 5px 0 5px 9px;
    #|  border-color: transparent transparent transparent #000;
    #|  margin-left: 2px;
    #|}
    #|.media-sidebar-thumb-mermaid {
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  width: 100%;
    #|  height: 100%;
    #|  padding: 2px;
    #|  background: var(--panel);
    #|  overflow: hidden;
    #|}
    #|.media-sidebar-thumb-mermaid svg {
    #|  width: 100% !important;
    #|  height: 100% !important;
    #|  max-width: 100%;
    #|  max-height: 100%;
    #|  display: block;
    #|}
    #|.media-sidebar-thumb-index {
    #|  position: absolute;
    #|  top: 2px;
    #|  left: 2px;
    #|  background: rgba(0,0,0,0.6);
    #|  color: #fff;
    #|  font-size: 9px;
    #|  font-weight: 600;
    #|  padding: 1px 4px;
    #|  border-radius: 3px;
    #|  line-height: 1.2;
    #|  pointer-events: none;
    #|  z-index: 1;
    #|}
    #|.media-sidebar-viewer {
    #|  width: 0;
    #|  overflow: hidden;
    #|  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    #|  background: var(--bg);
    #|  position: relative;
    #|}
    #|.media-sidebar-viewer.open {
    #|  width: 45vw;
    #|  max-width: calc(100vw - 400px);
    #|  overflow: hidden;
    #|  padding: 16px;
    #|  border-right: 1px solid var(--border);
    #|  display: flex;
    #|  flex-direction: column;
    #|}
    #|.media-sidebar-viewer-content {
    #|  display: flex;
    #|  flex-direction: column;
    #|  align-items: center;
    #|  justify-content: flex-start;
    #|  flex: 1;
    #|  min-height: 0;
    #|  overflow: hidden;
    #|  padding-top: 32px;
    #|}
    #|.media-sidebar-viewer-content img {
    #|  max-width: 100%;
    #|  max-height: calc(100vh - 170px);
    #|  object-fit: contain;
    #|  border-radius: 8px;
    #|}
    #|.media-sidebar-viewer-content video {
    #|  max-width: 100%;
    #|  max-height: calc(100vh - 170px);
    #|  border-radius: 8px;
    #|  background: #000;
    #|}
    #|.media-sidebar-viewer-content .viewer-mermaid-wrap {
    #|  width: 100%;
    #|  overflow: auto;
    #|  display: flex;
    #|  justify-content: center;
    #|  background: var(--panel);
    #|  border-radius: 8px;
    #|  padding: 16px;
    #|}
    #|.media-sidebar-viewer-content .viewer-mermaid-wrap svg {
    #|  width: 100% !important;
    #|  height: auto !important;
    #|  max-height: calc(100vh - 200px);
    #|}
    #|
    #|/* === Sidebar Rich Viewer: Mermaid zoom/pan/minimap === */
    #|.sidebar-mermaid-controls {
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 6px;
    #|  padding: 6px 10px;
    #|  background: var(--panel-alpha);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  margin-bottom: 8px;
    #|  width: 100%;
    #|  box-sizing: border-box;
    #|}
    #|.sidebar-mermaid-controls button {
    #|  background: var(--selected-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 5px;
    #|  padding: 4px 10px;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 13px;
    #|  line-height: 1;
    #|  transition: background 0.15s ease;
    #|}
    #|.sidebar-mermaid-controls button:hover { background: var(--hover-bg); }
    #|.sidebar-mermaid-controls .sidebar-zoom-info {
    #|  font-size: 11px;
    #|  color: var(--muted);
    #|  min-width: 40px;
    #|  text-align: center;
    #|  user-select: none;
    #|}
    #|.sidebar-mermaid-viewport {
    #|  width: 100%;
    #|  flex: 1;
    #|  overflow: hidden;
    #|  position: relative;
    #|  cursor: grab;
    #|  background: var(--panel);
    #|  border-radius: 8px;
    #|  border: 1px solid var(--border);
    #|}
    #|.sidebar-mermaid-viewport:active { cursor: grabbing; }
    #|.sidebar-mermaid-wrapper {
    #|  position: absolute;
    #|  transform-origin: 0 0;
    #|}
    #|.sidebar-mermaid-wrapper svg {
    #|  display: block;
    #|}
    #|.sidebar-minimap {
    #|  position: absolute;
    #|  bottom: 8px;
    #|  right: 8px;
    #|  width: 140px;
    #|  height: 100px;
    #|  background: var(--panel-alpha);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  overflow: hidden;
    #|  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    #|  z-index: 3;
    #|}
    #|.sidebar-minimap-content {
    #|  width: 100%;
    #|  height: 100%;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  padding: 6px;
    #|}
    #|.sidebar-minimap-content svg {
    #|  max-width: 100%;
    #|  max-height: 100%;
    #|  opacity: 0.6;
    #|}
    #|.sidebar-minimap-viewport {
    #|  position: absolute;
    #|  border: 2px solid var(--accent);
    #|  background: rgba(102, 126, 234, 0.2);
    #|  pointer-events: none;
    #|  border-radius: 2px;
    #|}
    #|
    #|/* === Sidebar Rich Viewer: Image zoom/pan === */
    #|.sidebar-image-viewport {
    #|  width: 100%;
    #|  flex: 1;
    #|  overflow: hidden;
    #|  position: relative;
    #|  cursor: grab;
    #|  border-radius: 8px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|}
    #|.sidebar-image-viewport.panning { cursor: grabbing; }
    #|.sidebar-image-viewport img {
    #|  transform-origin: 0 0;
    #|  max-width: none !important;
    #|  max-height: none !important;
    #|  border-radius: 0 !important;
    #|  user-select: none;
    #|  -webkit-user-drag: none;
    #|}
    #|.sidebar-zoom-indicator {
    #|  position: absolute;
    #|  bottom: 10px;
    #|  left: 50%;
    #|  transform: translateX(-50%);
    #|  background: rgba(0, 0, 0, 0.65);
    #|  color: #fff;
    #|  font-size: 11px;
    #|  font-weight: 600;
    #|  padding: 3px 10px;
    #|  border-radius: 12px;
    #|  pointer-events: none;
    #|  z-index: 3;
    #|  backdrop-filter: blur(4px);
    #|  transition: opacity 0.3s ease;
    #|  user-select: none;
    #|}
    #|.sidebar-zoom-indicator.hidden { opacity: 0; }
    #|.sidebar-image-hint {
    #|  position: absolute;
    #|  top: 50%;
    #|  left: 50%;
    #|  transform: translate(-50%, -50%);
    #|  font-size: 11px;
    #|  color: var(--muted);
    #|  pointer-events: none;
    #|  opacity: 0;
    #|  transition: opacity 0.4s ease;
    #|  text-align: center;
    #|  z-index: 2;
    #|}
    #|
    #|/* === Sidebar Rich Viewer: Video container (timeline uses shared .video-timeline classes) === */
    #|.sidebar-video-container {
    #|  width: 100%;
    #|  display: flex;
    #|  flex-direction: column;
    #|  gap: 0;
    #|}
    #|.sidebar-video-container video {
    #|  width: 100%;
    #|  border-radius: 8px 8px 0 0;
    #|  background: #000;
    #|  max-height: calc(100vh - 260px);
    #|}
    #|
    #|.media-sidebar-viewer-label {
    #|  margin-top: 12px;
    #|  font-size: 12px;
    #|  color: var(--muted);
    #|  text-align: center;
    #|  word-break: break-all;
    #|}
    #|.media-sidebar-viewer-close {
    #|  position: absolute;
    #|  top: 8px;
    #|  right: 8px;
    #|  background: var(--panel);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  width: 28px;
    #|  height: 28px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 14px;
    #|  z-index: 2;
    #|  transition: background 0.15s ease;
    #|}
    #|.media-sidebar-viewer-close:hover {
    #|  background: var(--hover-bg);
    #|}
    #|.sidebar-viewer-settings-btn {
    #|  position: absolute;
    #|  top: 8px;
    #|  right: 44px;
    #|  background: var(--panel);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  width: 28px;
    #|  height: 28px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 14px;
    #|  z-index: 2;
    #|  transition: background 0.15s ease;
    #|}
    #|.sidebar-viewer-settings-btn:hover {
    #|  background: var(--hover-bg);
    #|}
    #|.sidebar-viewer-settings-btn + .video-settings-panel {
    #|  position: absolute;
    #|  top: 44px;
    #|  right: 8px;
    #|}
    #|
    #|.media-sidebar-toggle {
    #|  background: var(--panel);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 6px 10px;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 14px;
    #|  transition: background 0.15s ease, border-color 0.15s ease;
    #|  display: none;
    #|}
    #|.media-sidebar-toggle.has-media {
    #|  display: inline-flex;
    #|  align-items: center;
    #|  gap: 4px;
    #|}
    #|.media-sidebar-toggle:hover {
    #|  background: var(--hover-bg);
    #|  border-color: var(--accent);
    #|}
    #|.media-sidebar-toggle .toggle-count {
    #|  font-size: 10px;
    #|  font-weight: 700;
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  padding: 1px 5px;
    #|  border-radius: 8px;
    #|  line-height: 1.4;
    #|}
    #|.view-toggle {
    #|  background: var(--panel);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 6px 10px;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 14px;
    #|  transition: background 0.15s ease, border-color 0.15s ease;
    #|}
    #|.view-toggle:hover { background: rgba(96,165,250,0.2); }
    #|.view-toggle.active { background: var(--accent); color: #fff; }
    #|@media (max-width: 1200px) {
    #|  .media-sidebar-viewer.open {
    #|    width: 40vw;
    #|    max-width: calc(100vw - 350px);
    #|  }
    #|}
    #|@media (max-width: 900px) {
    #|  .media-sidebar-thumbs {
    #|    width: 72px;
    #|  }
    #|  .media-sidebar-thumb {
    #|    width: 56px;
    #|    height: 42px;
    #|  }
    #|  .media-sidebar-viewer.open {
    #|    width: 35vw;
    #|    max-width: calc(100vw - 300px);
    #|  }
    #|}
    #|@media (prefers-reduced-motion: reduce) {
    #|  .media-sidebar,
    #|  .media-sidebar-viewer,
    #|  .media-sidebar-thumb {
    #|    transition: none !important;
    #|  }
    #|}
    #|
    #|.md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 {
    #|  margin: 0.4em 0 0.2em;
    #|}
    #|/* Heading toggle feature */
    #|.md-preview .md-heading-toggle {
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 6px;
    #|}
    #|.md-preview .heading-toggle-icon {
    #|  font-size: 0.6em;
    #|  transition: transform 150ms ease;
    #|  color: var(--muted);
    #|  flex-shrink: 0;
    #|  cursor: pointer;
    #|  padding: 4px 8px;
    #|  margin: -4px 0 -4px -8px;
    #|  border-radius: 4px;
    #|}
    #|.md-preview .heading-toggle-icon:hover {
    #|  background: var(--hover-bg);
    #|  color: var(--accent);
    #|}
    #|.md-preview .md-heading-toggle.collapsed .heading-toggle-icon {
    #|  transform: rotate(-90deg);
    #|}
    #|.md-preview details.heading-toggle {
    #|  margin: 0.2em 0;
    #|}
    #|.md-preview details.heading-toggle > summary {
    #|  list-style: none;
    #|  cursor: pointer;
    #|}
    #|.md-preview details.heading-toggle > summary::-webkit-details-marker {
    #|  display: none;
    #|}
    #|.md-preview details.heading-toggle:not([open]) > .toggle-content {
    #|  display: none;
    #|}
    #|.md-preview .heading-section-content {
    #|  /* Content wrapper for collapsible sections */
    #|}
    #|.md-preview .heading-section-content.hidden {
    #|  display: none;
    #|}
    #|.md-preview p { margin: 0.3em 0; line-height: 1.5; }
    #|.md-preview img { max-width: 100%; height: auto; border-radius: 8px; }
    #|.md-preview video.video-preview { max-width: 100%; height: auto; border-radius: 8px; background: #000; }
    #|.md-preview table video.video-preview {
    #|  display: block;
    #|  width: 100%;
    #|  height: auto;
    #|}
    #|.md-preview code { background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; }
    #|.md-preview pre {
    #|  background: var(--code-bg);
    #|  padding: 12px 16px;
    #|  border-radius: 8px;
    #|  overflow: auto;
    #|  border: 1px solid var(--border);
    #|}
    #|.md-preview pre code {
    #|  background: none;
    #|  padding: 0;
    #|  font-size: 13px;
    #|  line-height: 1.5;
    #|}
    #|.md-preview pre code.hljs {
    #|  background: transparent;
    #|  padding: 0;
    #|}
    #|/* YAML Frontmatter table */
    #|.frontmatter-table {
    #|  margin-bottom: 20px;
    #|  border-radius: 8px;
    #|  overflow: hidden;
    #|  border: 1px solid var(--border);
    #|  background: var(--panel);
    #|}
    #|.frontmatter-table table {
    #|  width: 100%;
    #|  border-collapse: collapse;
    #|  table-layout: fixed;
    #|}
    #|.frontmatter-table thead th {
    #|  background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(96, 165, 250, 0.15));
    #|  color: var(--text);
    #|  font-size: 12px;
    #|  font-weight: 600;
    #|  padding: 10px 16px;
    #|  text-align: left;
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.frontmatter-table tbody th {
    #|  background: rgba(147, 51, 234, 0.08);
    #|  color: #c084fc;
    #|  font-weight: 500;
    #|  font-size: 12px;
    #|  padding: 8px 10px;
    #|  text-align: left;
    #|  border-bottom: 1px solid var(--border);
    #|  vertical-align: top;
    #|}
    #|.frontmatter-table tbody td {
    #|  padding: 8px 14px;
    #|  font-size: 13px;
    #|  border-bottom: 1px solid var(--border);
    #|  word-break: break-word;
    #|}
    #|.frontmatter-table tbody tr:last-child th,
    #|.frontmatter-table tbody tr:last-child td {
    #|  border-bottom: none;
    #|}
    #|.frontmatter-table .fm-tag {
    #|  display: inline-block;
    #|  background: rgba(96, 165, 250, 0.15);
    #|  color: var(--accent);
    #|  padding: 2px 8px;
    #|  border-radius: 12px;
    #|  font-size: 11px;
    #|  margin-right: 4px;
    #|  margin-bottom: 4px;
    #|}
    #|.frontmatter-table pre {
    #|  margin: 0;
    #|  background: var(--code-bg);
    #|  padding: 8px;
    #|  border-radius: 4px;
    #|  font-size: 11px;
    #|}
    #|/* Reviw questions preview cards */
    #|.reviw-questions-preview {
    #|  display: flex;
    #|  flex-direction: column;
    #|  gap: 8px;
    #|}
    #|.reviw-q-card {
    #|  background: var(--code-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 10px 12px;
    #|}
    #|.reviw-q-card.resolved {
    #|  border-left: 3px solid #22c55e;
    #|}
    #|.reviw-q-card.pending {
    #|  border-left: 3px solid #f59e0b;
    #|}
    #|.reviw-q-header {
    #|  font-size: 12px;
    #|  color: var(--text-dim);
    #|  margin-bottom: 4px;
    #|}
    #|.reviw-q-header strong {
    #|  color: var(--accent);
    #|}
    #|.reviw-q-question {
    #|  font-size: 13px;
    #|  color: var(--text);
    #|  margin-bottom: 6px;
    #|}
    #|.reviw-q-options {
    #|  display: flex;
    #|  flex-wrap: wrap;
    #|  gap: 4px;
    #|  margin-bottom: 6px;
    #|}
    #|.reviw-q-answer {
    #|  font-size: 12px;
    #|  color: #22c55e;
    #|  background: rgba(34, 197, 94, 0.1);
    #|  padding: 4px 8px;
    #|  border-radius: 4px;
    #|}
    #|[data-theme="light"] .frontmatter-table tbody th {
    #|  color: #7c3aed;
    #|}
    #|/* Table scroll container and indicator */
    #|.table-scroll-container {
    #|  position: relative;
    #|  margin: 16px 0;
    #|}
    #|.table-scroll-wrapper {
    #|  overflow-x: auto;
    #|  border-radius: 8px;
    #|}
    #|.scroll-hint {
    #|  text-align: right;
    #|  font-size: 12px;
    #|  color: var(--accent);
    #|  padding: 4px 8px;
    #|  margin-bottom: 4px;
    #|  opacity: 0;
    #|  visibility: hidden;
    #|  transition: opacity 200ms ease;
    #|}
    #|.table-scroll-container.can-scroll .scroll-hint {
    #|  opacity: 0.8;
    #|  visibility: visible;
    #|}
    #|.table-scroll-container.scrolled-end .scroll-hint {
    #|  opacity: 0;
    #|  visibility: hidden;
    #|}
    #|/* Markdown tables in preview */
    #|.md-preview table:not(.frontmatter-table table) {
    #|  min-width: 100%;
    #|  width: max-content;
    #|  border-collapse: collapse;
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|}
    #|.md-preview table:not(.frontmatter-table table) th,
    #|.md-preview table:not(.frontmatter-table table) td {
    #|  padding: 10px 16px;
    #|  text-align: left;
    #|  border-bottom: 1px solid var(--border);
    #|  vertical-align: top;
    #|  word-break: break-word;
    #|  overflow-wrap: anywhere;
    #|  width: auto;
    #|}
    #|/* Force equal column widths when colgroup is not specified */
    #|.md-preview table:not(.frontmatter-table table) colgroup ~ * th,
    #|.md-preview table:not(.frontmatter-table table) colgroup ~ * td {
    #|  width: auto;
    #|}
    #|.md-preview table:not(.frontmatter-table table) td:has(video),
    #|.md-preview table:not(.frontmatter-table table) td:has(img) {
    #|  padding: 4px;
    #|  line-height: 0;
    #|}
    #|.md-preview table:not(.frontmatter-table table) td video,
    #|.md-preview table:not(.frontmatter-table table) td img {
    #|  width: 100%;
    #|  max-width: 100%;
    #|  height: auto;
    #|}
    #|.md-preview table:not(.frontmatter-table table) th {
    #|  background: var(--panel);
    #|  font-weight: 600;
    #|  font-size: 13px;
    #|}
    #|.md-preview table:not(.frontmatter-table table) td {
    #|  font-size: 13px;
    #|}
    #|.md-preview table:not(.frontmatter-table table) tr:last-child td {
    #|  border-bottom: none;
    #|}
    #|.md-preview table:not(.frontmatter-table table) tr:hover td {
    #|  background: var(--hover-bg);
    #|}
    #|/* Source table (右ペイン) */
    #|.table-box table {
    #|  table-layout: fixed;
    #|  width: 100%;
    #|}
    #|.table-box th,
    #|.table-box td {
    #|  word-break: break-word;
    #|  min-width: 140px;
    #|}
    #|.table-box th:first-child,
    #|.table-box td:first-child {
    #|  min-width: 320px;
    #|  max-width: 480px;
    #|}
    #|/* Image fullscreen overlay */
    #|.image-fullscreen-overlay {
    #|  position: fixed;
    #|  inset: 0;
    #|  background: var(--bg);
    #|  z-index: 1001;
    #|  display: none;
    #|  flex-direction: column;
    #|}
    #|.image-fullscreen-overlay.visible {
    #|  display: flex;
    #|}
    #|.image-fs-content {
    #|  flex: 1;
    #|  overflow: hidden;
    #|  position: relative;
    #|  cursor: grab;
    #|}
    #|.image-fs-content:active { cursor: grabbing; }
    #|.image-fs-content .image-fs-wrapper {
    #|  position: absolute;
    #|  transform-origin: 0 0;
    #|}
    #|.image-fs-content .image-fs-wrapper img {
    #|  display: block;
    #|}
    #|/* Video fullscreen overlay */
    #|.video-fullscreen-overlay {
    #|  position: fixed;
    #|  inset: 0;
    #|  background: rgba(0, 0, 0, 0.95);
    #|  z-index: 1001;
    #|  display: none;
    #|  justify-content: center;
    #|  align-items: center;
    #|}
    #|.video-fullscreen-overlay.visible {
    #|  display: flex;
    #|}
    #|.video-close-btn {
    #|  position: absolute;
    #|  top: 14px;
    #|  right: 14px;
    #|  width: 40px;
    #|  height: 40px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  background: rgba(0, 0, 0, 0.55);
    #|  border: 1px solid rgba(255, 255, 255, 0.25);
    #|  border-radius: 50%;
    #|  cursor: pointer;
    #|  color: #fff;
    #|  font-size: 18px;
    #|  z-index: 10;
    #|  backdrop-filter: blur(4px);
    #|  transition: background 120ms ease, transform 120ms ease;
    #|}
    #|.video-close-btn:hover {
    #|  background: rgba(0, 0, 0, 0.75);
    #|  transform: scale(1.04);
    #|}
    #|.video-container {
    #|  width: 90vw;
    #|  height: 90vh;
    #|  display: flex;
    #|  justify-content: center;
    #|  align-items: center;
    #|}
    #|.video-container video {
    #|  width: 100%;
    #|  height: 100%;
    #|  object-fit: contain;
    #|  border-radius: 8px;
    #|  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    #|}
    #|/* Video Timeline - shared base styles (used by both fullscreen and sidebar) */
    #|.video-timeline {
    #|  background: rgba(0, 0, 0, 0.85);
    #|  display: flex;
    #|  overflow-x: auto;
    #|  backdrop-filter: blur(8px);
    #|  height: 80px;
    #|  padding: 8px;
    #|  gap: 4px;
    #|}
    #|.video-timeline::-webkit-scrollbar {
    #|  height: 6px;
    #|}
    #|.video-timeline::-webkit-scrollbar-track {
    #|  background: rgba(255, 255, 255, 0.1);
    #|  border-radius: 3px;
    #|}
    #|.video-timeline::-webkit-scrollbar-thumb {
    #|  background: rgba(255, 255, 255, 0.3);
    #|  border-radius: 3px;
    #|}
    #|.video-timeline::-webkit-scrollbar-thumb:hover {
    #|  background: rgba(255, 255, 255, 0.5);
    #|}
    #|/* Fullscreen-specific video timeline positioning */
    #|.video-container .video-timeline {
    #|  position: absolute;
    #|  bottom: 0;
    #|  left: 0;
    #|  right: 0;
    #|  z-index: 5;
    #|}
    #|/* Sidebar-specific video timeline sizing */
    #|.sidebar-video-container .video-timeline {
    #|  width: 100%;
    #|  height: 72px;
    #|  padding: 6px;
    #|  gap: 3px;
    #|  border-radius: 0 0 8px 8px;
    #|  background: rgba(0, 0, 0, 0.88);
    #|}
    #|.sidebar-video-container .video-timeline::-webkit-scrollbar { height: 5px; }
    #|.sidebar-video-container .video-timeline::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.08); }
    #|.sidebar-video-container .video-timeline::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25); }
    #|.sidebar-video-container .video-timeline::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
    #|.timeline-thumb {
    #|  height: 64px;
    #|  cursor: pointer;
    #|  border: 2px solid transparent;
    #|  border-radius: 4px;
    #|  flex-shrink: 0;
    #|  transition: border-color 0.2s, transform 0.15s;
    #|  opacity: 0.85;
    #|}
    #|.sidebar-video-container .timeline-thumb {
    #|  height: 52px;
    #|  opacity: 0.8;
    #|}
    #|.timeline-thumb:hover {
    #|  border-color: rgba(59, 130, 246, 0.5);
    #|  opacity: 1;
    #|  transform: scale(1.05);
    #|}
    #|.timeline-thumb.active {
    #|  border-color: #3b82f6;
    #|  opacity: 1;
    #|  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
    #|}
    #|.sidebar-video-container .timeline-thumb.active {
    #|  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
    #|}
    #|.timeline-loading {
    #|  color: rgba(255, 255, 255, 0.6);
    #|  font-size: 12px;
    #|  padding: 8px 12px;
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 8px;
    #|}
    #|.sidebar-video-container .timeline-loading {
    #|  font-size: 11px;
    #|  padding: 6px 10px;
    #|  gap: 6px;
    #|  color: rgba(255, 255, 255, 0.5);
    #|}
    #|.timeline-loading::before {
    #|  content: '';
    #|  width: 14px;
    #|  height: 14px;
    #|  border: 2px solid rgba(255, 255, 255, 0.3);
    #|  border-top-color: #3b82f6;
    #|  border-radius: 50%;
    #|  animation: timeline-spin 0.8s linear infinite;
    #|}
    #|.sidebar-video-container .timeline-loading::before {
    #|  width: 12px;
    #|  height: 12px;
    #|  border-width: 2px;
    #|  border-color: rgba(255, 255, 255, 0.25);
    #|  border-top-color: #3b82f6;
    #|}
    #|@keyframes timeline-spin {
    #|  to { transform: rotate(360deg); }
    #|}
    #|.timeline-time {
    #|  position: absolute;
    #|  bottom: 2px;
    #|  right: 4px;
    #|  font-size: 9px;
    #|  color: #fff;
    #|  background: rgba(0, 0, 0, 0.7);
    #|  padding: 1px 4px;
    #|  border-radius: 2px;
    #|  pointer-events: none;
    #|}
    #|.sidebar-video-container .timeline-time {
    #|  font-size: 8px;
    #|  right: 3px;
    #|  padding: 1px 3px;
    #|}
    #|.timeline-thumb-wrapper {
    #|  position: relative;
    #|  flex-shrink: 0;
    #|}
    #|/* Video threshold settings panel */
    #|.video-settings-btn {
    #|  position: absolute;
    #|  top: 14px;
    #|  right: 64px;
    #|  width: 40px;
    #|  height: 40px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  background: rgba(0, 0, 0, 0.55);
    #|  border: 1px solid rgba(255, 255, 255, 0.25);
    #|  border-radius: 50%;
    #|  cursor: pointer;
    #|  color: #fff;
    #|  font-size: 18px;
    #|  z-index: 10;
    #|  backdrop-filter: blur(4px);
    #|  transition: background 120ms ease, transform 120ms ease;
    #|}
    #|.video-settings-btn:hover {
    #|  background: rgba(0, 0, 0, 0.75);
    #|  transform: scale(1.04);
    #|}
    #|.video-settings-panel {
    #|  position: absolute;
    #|  top: 60px;
    #|  right: 14px;
    #|  background: rgba(0, 0, 0, 0.9);
    #|  border: 1px solid rgba(255, 255, 255, 0.2);
    #|  border-radius: 12px;
    #|  padding: 16px;
    #|  z-index: 15;
    #|  min-width: 280px;
    #|  display: none;
    #|  backdrop-filter: blur(8px);
    #|}
    #|.video-settings-panel.visible {
    #|  display: block;
    #|}
    #|.video-settings-panel h4 {
    #|  margin: 0 0 8px;
    #|  color: #fff;
    #|  font-size: 14px;
    #|  font-weight: 500;
    #|}
    #|.video-settings-desc {
    #|  margin: 0 0 12px;
    #|  color: rgba(255, 255, 255, 0.6);
    #|  font-size: 11px;
    #|  line-height: 1.4;
    #|}
    #|.video-settings-buttons {
    #|  display: flex;
    #|  gap: 6px;
    #|  margin-bottom: 12px;
    #|}
    #|.video-settings-buttons button {
    #|  flex: 1;
    #|  padding: 8px 4px;
    #|  border: 1px solid rgba(255, 255, 255, 0.2);
    #|  border-radius: 6px;
    #|  background: rgba(255, 255, 255, 0.1);
    #|  color: rgba(255, 255, 255, 0.8);
    #|  font-size: 11px;
    #|  cursor: pointer;
    #|  transition: all 120ms ease;
    #|}
    #|.video-settings-buttons button:hover {
    #|  background: rgba(255, 255, 255, 0.2);
    #|  border-color: rgba(255, 255, 255, 0.3);
    #|}
    #|.video-settings-buttons button.selected {
    #|  background: #3b82f6;
    #|  border-color: #3b82f6;
    #|  color: #fff;
    #|}
    #|.video-settings-actions {
    #|  display: flex;
    #|  gap: 8px;
    #|  margin-top: 8px;
    #|}
    #|.video-settings-actions button {
    #|  flex: 1;
    #|  padding: 8px 12px;
    #|  border: none;
    #|  border-radius: 6px;
    #|  font-size: 12px;
    #|  cursor: pointer;
    #|  transition: background 120ms ease;
    #|}
    #|.video-settings-actions .reset-btn {
    #|  background: rgba(255, 255, 255, 0.15);
    #|  color: #fff;
    #|}
    #|.video-settings-actions .reset-btn:hover {
    #|  background: rgba(255, 255, 255, 0.25);
    #|}
    #|/* Video Shortcuts Help */
    #|.video-shortcuts-help {
    #|  opacity: 0.85;
    #|  transition: opacity 0.2s;
    #|}
    #|.video-shortcuts-help:hover {
    #|  opacity: 1;
    #|}
    #|.video-shortcuts-help .shortcuts-title {
    #|  font-weight: 600;
    #|  font-size: 11px;
    #|  text-transform: uppercase;
    #|  letter-spacing: 0.5px;
    #|  margin-bottom: 10px;
    #|  color: rgba(255, 255, 255, 0.7);
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 6px;
    #|}
    #|.video-shortcuts-help .shortcuts-title::before {
    #|  content: '\u2328';
    #|  font-size: 14px;
    #|}
    #|.video-shortcuts-help .shortcut-item {
    #|  margin-bottom: 6px;
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 4px;
    #|  flex-wrap: wrap;
    #|}
    #|.video-shortcuts-help .shortcut-item:last-child {
    #|  margin-bottom: 0;
    #|}
    #|.video-shortcuts-help kbd {
    #|  display: inline-block;
    #|  background: rgba(255, 255, 255, 0.15);
    #|  border: 1px solid rgba(255, 255, 255, 0.25);
    #|  border-radius: 4px;
    #|  padding: 2px 6px;
    #|  font-family: system-ui, -apple-system, sans-serif;
    #|  font-size: 10px;
    #|  font-weight: 500;
    #|  min-width: 18px;
    #|  text-align: center;
    #|  margin-right: 2px;
    #|}
    #|/* Reviw Questions Modal */
    #|.reviw-questions-overlay {
    #|  display: none;
    #|  position: fixed;
    #|  inset: 0;
    #|  background: rgba(0, 0, 0, 0.8);
    #|  z-index: 1100;
    #|  justify-content: center;
    #|  align-items: center;
    #|}
    #|.reviw-questions-overlay.visible {
    #|  display: flex;
    #|}
    #|.reviw-questions-modal {
    #|  background: var(--card-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 16px;
    #|  width: 90%;
    #|  max-width: 600px;
    #|  max-height: 80vh;
    #|  display: flex;
    #|  flex-direction: column;
    #|  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
    #|}
    #|.reviw-questions-header {
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|  padding: 16px 20px;
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.reviw-questions-header h2 {
    #|  margin: 0;
    #|  font-size: 16px;
    #|  font-weight: 600;
    #|  color: var(--text);
    #|}
    #|.reviw-questions-header h2 span {
    #|  font-size: 14px;
    #|  color: var(--text-dim);
    #|  font-weight: 400;
    #|}
    #|.reviw-questions-close {
    #|  width: 32px;
    #|  height: 32px;
    #|  border: none;
    #|  background: transparent;
    #|  color: var(--text-dim);
    #|  font-size: 18px;
    #|  cursor: pointer;
    #|  border-radius: 8px;
    #|  transition: all 150ms ease;
    #|}
    #|.reviw-questions-close:hover {
    #|  background: var(--border);
    #|  color: var(--text);
    #|}
    #|.reviw-questions-body {
    #|  flex: 1;
    #|  overflow-y: auto;
    #|  padding: 16px 20px;
    #|}
    #|.reviw-questions-footer {
    #|  padding: 12px 20px;
    #|  border-top: 1px solid var(--border);
    #|  display: flex;
    #|  justify-content: flex-end;
    #|}
    #|.reviw-questions-later {
    #|  padding: 8px 16px;
    #|  border: 1px solid var(--border);
    #|  background: transparent;
    #|  color: var(--text-dim);
    #|  border-radius: 8px;
    #|  cursor: pointer;
    #|  font-size: 13px;
    #|  transition: all 150ms ease;
    #|}
    #|.reviw-questions-later:hover {
    #|  background: var(--border);
    #|  color: var(--text);
    #|}
    #|/* Question Item */
    #|.reviw-question-item {
    #|  margin-bottom: 20px;
    #|  padding-bottom: 20px;
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.reviw-question-item:last-child {
    #|  margin-bottom: 0;
    #|  padding-bottom: 0;
    #|  border-bottom: none;
    #|}
    #|.reviw-question-text {
    #|  font-size: 14px;
    #|  color: var(--text);
    #|  margin-bottom: 12px;
    #|  line-height: 1.5;
    #|}
    #|.reviw-question-options {
    #|  display: flex;
    #|  flex-wrap: wrap;
    #|  gap: 8px;
    #|  margin-bottom: 12px;
    #|}
    #|.reviw-question-option {
    #|  padding: 8px 14px;
    #|  border: 1px solid var(--border);
    #|  background: transparent;
    #|  color: var(--text);
    #|  border-radius: 8px;
    #|  cursor: pointer;
    #|  font-size: 13px;
    #|  transition: all 150ms ease;
    #|}
    #|.reviw-question-option:hover {
    #|  border-color: var(--accent);
    #|  background: rgba(96, 165, 250, 0.1);
    #|}
    #|.reviw-question-option.selected {
    #|  border-color: var(--accent);
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|}
    #|.reviw-question-input {
    #|  width: 100%;
    #|  padding: 10px 12px;
    #|  border: 1px solid var(--border);
    #|  background: var(--input-bg);
    #|  color: var(--text);
    #|  border-radius: 8px;
    #|  font-size: 13px;
    #|  resize: vertical;
    #|  min-height: 60px;
    #|}
    #|.reviw-question-input:focus {
    #|  outline: none;
    #|  border-color: var(--accent);
    #|}
    #|.reviw-question-input::placeholder {
    #|  color: var(--text-dim);
    #|}
    #|.reviw-check-mark {
    #|  color: #22c55e;
    #|  font-weight: bold;
    #|}
    #|.reviw-question-item.answered {
    #|  border-color: #22c55e;
    #|  background: rgba(34, 197, 94, 0.05);
    #|}
    #|.reviw-question-submit {
    #|  margin-top: 10px;
    #|  padding: 8px 16px;
    #|  border: none;
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  border-radius: 8px;
    #|  cursor: pointer;
    #|  font-size: 13px;
    #|  font-weight: 500;
    #|  transition: all 150ms ease;
    #|}
    #|.reviw-question-submit:hover {
    #|  filter: brightness(1.1);
    #|}
    #|.reviw-question-submit:disabled {
    #|  opacity: 0.5;
    #|  cursor: not-allowed;
    #|}
    #|/* Resolved Section */
    #|.reviw-resolved-section {
    #|  margin-top: 16px;
    #|  border-top: 1px solid var(--border);
    #|  padding-top: 12px;
    #|}
    #|.reviw-resolved-toggle {
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 8px;
    #|  background: none;
    #|  border: none;
    #|  color: var(--text-dim);
    #|  font-size: 13px;
    #|  cursor: pointer;
    #|  padding: 4px 0;
    #|}
    #|.reviw-resolved-toggle:hover {
    #|  color: var(--text);
    #|}
    #|.reviw-resolved-toggle .arrow {
    #|  transition: transform 150ms ease;
    #|}
    #|.reviw-resolved-toggle.open .arrow {
    #|  transform: rotate(90deg);
    #|}
    #|.reviw-resolved-list {
    #|  display: none;
    #|  margin-top: 12px;
    #|}
    #|.reviw-resolved-list.visible {
    #|  display: block;
    #|}
    #|.reviw-resolved-item {
    #|  padding: 10px 12px;
    #|  background: var(--input-bg);
    #|  border-radius: 8px;
    #|  margin-bottom: 8px;
    #|  opacity: 0.7;
    #|}
    #|.reviw-resolved-item:last-child {
    #|  margin-bottom: 0;
    #|}
    #|.reviw-resolved-q {
    #|  font-size: 12px;
    #|  color: var(--text-dim);
    #|  margin-bottom: 4px;
    #|}
    #|.reviw-resolved-a {
    #|  font-size: 13px;
    #|  color: var(--text);
    #|}
    #|/* Notice Bar */
    #|.reviw-questions-bar {
    #|  display: none;
    #|  position: fixed;
    #|  top: 0;
    #|  left: 0;
    #|  right: 0;
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  padding: 8px 16px;
    #|  font-size: 13px;
    #|  z-index: 1050;
    #|  justify-content: center;
    #|  align-items: center;
    #|  gap: 12px;
    #|}
    #|.reviw-questions-bar.visible {
    #|  display: flex;
    #|}
    #|.reviw-questions-bar button {
    #|  padding: 4px 12px;
    #|  border: 1px solid rgba(255, 255, 255, 0.3);
    #|  background: rgba(255, 255, 255, 0.1);
    #|  color: var(--text-inverse);
    #|  border-radius: 6px;
    #|  cursor: pointer;
    #|  font-size: 12px;
    #|  transition: all 150ms ease;
    #|}
    #|.reviw-questions-bar button:hover {
    #|  background: rgba(255, 255, 255, 0.2);
    #|}
    #|/* Adjust layout when bar is visible */
    #|body.has-questions-bar header {
    #|  top: 36px;
    #|}
    #|body.has-questions-bar .toolbar,
    #|body.has-questions-bar .table-wrap {
    #|  margin-top: 36px;
    #|}
    #|/* Copy notification toast */
    #|.copy-toast {
    #|  position: fixed;
    #|  bottom: 60px;
    #|  left: 50%;
    #|  transform: translateX(-50%) translateY(20px);
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  padding: 8px 16px;
    #|  border-radius: 8px;
    #|  font-size: 13px;
    #|  opacity: 0;
    #|  pointer-events: none;
    #|  transition: opacity 200ms ease, transform 200ms ease;
    #|  z-index: 1000;
    #|}
    #|.copy-toast.visible {
    #|  opacity: 1;
    #|  transform: translateX(-50%) translateY(0);
    #|}
    #|@media (max-width: 960px) {
    #|  .md-layout { flex-direction: column; }
    #|  .md-left { max-width: 100%; flex: 1 1 0; min-height: 0; }
    #|  .md-right { display: none; }
    #|  .media-sidebar { display: none; }
    #|  .media-sidebar-toggle { display: none !important; }
    #|}
    #|.md-layout.preview-only .md-right { display: none; }
    #|.md-layout.preview-only .md-left { flex: 1 1 0; min-height: 0; max-width: 100%; }
    #|.filter-menu {
    #|  position: absolute;
    #|  background: var(--panel-solid);
    #|  border: 1px solid var(--border);
    #|  border-radius: 10px;
    #|  box-shadow: 0 14px 30px var(--shadow-color);
    #|  padding: 8px;
    #|  display: none;
    #|  z-index: 12;
    #|  width: 180px;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.filter-menu button {
    #|  width: 100%;
    #|  display: block;
    #|  margin: 4px 0;
    #|  padding: 8px 10px;
    #|  background: var(--selected-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  color: var(--text);
    #|  cursor: pointer;
    #|  font-size: 13px;
    #|  text-align: left;
    #|}
    #|.filter-menu button:hover { background: var(--hover-bg); }
    #|.modal-overlay {
    #|  position: fixed;
    #|  inset: 0;
    #|  background: rgba(0,0,0,0.6);
    #|  display: none;
    #|  align-items: center;
    #|  justify-content: center;
    #|  z-index: 100;
    #|}
    #|.modal-overlay.visible { display: flex; }
    #|/* Submit modal: top-right position, no blocking overlay */
    #|#submit-modal {
    #|  background: transparent;
    #|  pointer-events: none;
    #|  align-items: flex-start;
    #|  justify-content: flex-end;
    #|}
    #|#submit-modal.visible { display: flex; }
    #|#submit-modal .modal-dialog {
    #|  pointer-events: auto;
    #|  margin: 60px 20px 20px 20px; /* top margin avoids header button overlap */
    #|}
    #|.modal-dialog {
    #|  background: var(--panel-solid);
    #|  border: 1px solid var(--border);
    #|  border-radius: 14px;
    #|  padding: 20px;
    #|  width: 90%;
    #|  max-width: 480px;
    #|  box-shadow: 0 20px 40px var(--shadow-color);
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.modal-dialog h3 { margin: 0 0 12px; font-size: 18px; color: var(--accent); }
    #|.modal-summary { color: var(--muted); font-size: 13px; margin-bottom: 12px; }
    #|.modal-dialog label { display: block; font-size: 13px; margin-bottom: 6px; color: var(--muted); }
    #|.modal-dialog textarea {
    #|  width: 100%;
    #|  min-height: 100px;
    #|  background: var(--input-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  color: var(--text);
    #|  padding: 10px;
    #|  font-size: 14px;
    #|  resize: vertical;
    #|  box-sizing: border-box;
    #|  transition: background 200ms ease, border-color 200ms ease;
    #|}
    #|.modal-dialog textarea:focus { outline: none; border-color: var(--accent); }
    #|.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
    #|.modal-actions button {
    #|  padding: 8px 16px;
    #|  border-radius: 8px;
    #|  border: 1px solid var(--border);
    #|  background: var(--selected-bg);
    #|  color: var(--text);
    #|  cursor: pointer;
    #|  font-size: 14px;
    #|}
    #|.modal-actions button:hover { background: var(--hover-bg); }
    #|.modal-actions button.primary { background: var(--accent); color: var(--text-inverse); border-color: var(--accent); }
    #|.image-attach-area { margin: 12px 0; }
    #|.image-attach-area label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    #|.image-attach-area.image-attach-small { margin: 8px 0; }
    #|.image-attach-area.image-attach-small label { font-size: 11px; }
    #|.image-preview-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 24px; }
    #|.image-preview-item { position: relative; }
    #|.image-preview-item img { max-width: 80px; max-height: 60px; border-radius: 4px; border: 1px solid var(--border); object-fit: cover; }
    #|.image-preview-item .remove-image { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--error, #ef4444); color: #fff; border: none; cursor: pointer; font-size: 12px; line-height: 1; display: flex; align-items: center; justify-content: center; }
    #|.image-preview-item .remove-image:hover { background: #dc2626; }
    #|.modal-actions button.primary:hover { background: #7dd3fc; }
    #|
    #|.modal-checkboxes { margin: 12px 0; }
    #|.modal-checkboxes label {
    #|  display: flex;
    #|  align-items: flex-start;
    #|  gap: 8px;
    #|  font-size: 12px;
    #|  color: var(--text);
    #|  margin-bottom: 8px;
    #|  cursor: pointer;
    #|}
    #|.modal-checkboxes input[type="checkbox"] {
    #|  margin-top: 2px;
    #|  accent-color: var(--accent);
    #|}
    #|
    #|body.dragging { user-select: none; cursor: crosshair; }
    #|body.dragging .diff-line { cursor: crosshair; }
    #|@media (max-width: 840px) {
    #|  header { flex-direction: column; align-items: flex-start; }
    #|  .comment-list { width: calc(100% - 24px); right: 12px; }
    #|}
    #|/* Mermaid diagram styles */
    #|.mermaid-container {
    #|  position: relative;
    #|  margin: 16px 0;
    #|  background: var(--panel);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  padding: 16px;
    #|  overflow: hidden;
    #|}
    #|.mermaid-container .mermaid {
    #|  display: flex;
    #|  justify-content: center;
    #|}
    #|.mermaid-container .mermaid svg {
    #|  max-width: 100%;
    #|  height: auto;
    #|  cursor: pointer;
    #|  pointer-events: auto;
    #|}
    #|.mermaid-error-banner {
    #|  background: #fff3f3;
    #|  color: #c33;
    #|  border: 1px solid #e88;
    #|  border-radius: 4px;
    #|  padding: 6px 10px;
    #|  margin-bottom: 8px;
    #|  font-size: 12px;
    #|  font-weight: 500;
    #|}
    #|[data-theme="dark"] .mermaid-error-banner {
    #|  background: #3a1a1a;
    #|  color: #f88;
    #|  border-color: #744;
    #|}
    #|.mermaid-fullscreen-btn {
    #|  position: absolute;
    #|  top: 8px;
    #|  right: 8px;
    #|  background: var(--selected-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  padding: 6px 10px;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 12px;
    #|  z-index: 2;
    #|  display: flex;
    #|  align-items: center;
    #|  gap: 4px;
    #|}
    #|.mermaid-fullscreen-btn:hover { background: var(--hover-bg); }
    #|/* Fullscreen overlay */
    #|.fullscreen-overlay {
    #|  position: fixed;
    #|  inset: 0;
    #|  background: var(--bg);
    #|  z-index: 1000;
    #|  display: none;
    #|  flex-direction: column;
    #|}
    #|.fullscreen-overlay.visible { display: flex; }
    #|.fullscreen-header {
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|  padding: 12px 20px;
    #|  background: var(--panel-alpha);
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.fullscreen-header h3 { margin: 0; font-size: 14px; }
    #|.fullscreen-controls { display: flex; gap: 8px; align-items: center; }
    #|.fullscreen-controls button {
    #|  background: var(--selected-bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  padding: 6px 12px;
    #|  cursor: pointer;
    #|  color: var(--text);
    #|  font-size: 13px;
    #|}
    #|.fullscreen-controls button:hover { background: var(--hover-bg); }
    #|.fullscreen-controls .zoom-info { font-size: 12px; color: var(--muted); min-width: 50px; text-align: center; }
    #|.fullscreen-content {
    #|  flex: 1;
    #|  overflow: hidden;
    #|  position: relative;
    #|  cursor: grab;
    #|}
    #|.fullscreen-content:active { cursor: grabbing; }
    #|.fullscreen-content .mermaid-wrapper {
    #|  position: absolute;
    #|  transform-origin: 0 0;
    #|  padding: 40px;
    #|}
    #|.fullscreen-content .mermaid svg {
    #|  display: block;
    #|}
    #|/* Minimap */
    #|.minimap {
    #|  position: absolute;
    #|  top: 70px;
    #|  right: 20px;
    #|  width: 200px;
    #|  height: 150px;
    #|  background: var(--panel-alpha);
    #|  border: 1px solid var(--border);
    #|  border-radius: 8px;
    #|  overflow: hidden;
    #|  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    #|}
    #|.minimap-content {
    #|  width: 100%;
    #|  height: 100%;
    #|  box-sizing: border-box;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  padding: 8px;
    #|}
    #|.minimap-content svg {
    #|  max-width: 100%;
    #|  max-height: 100%;
    #|  opacity: 0.6;
    #|}
    #|.minimap-viewport {
    #|  position: absolute;
    #|  border: 2px solid var(--accent);
    #|  background: rgba(102, 126, 234, 0.2);
    #|  pointer-events: none;
    #|  border-radius: 2px;
    #|}
    #|/* Error toast */
    #|.mermaid-error-toast {
    #|  position: fixed;
    #|  bottom: 20px;
    #|  left: 50%;
    #|  transform: translateX(-50%);
    #|  background: var(--error);
    #|  color: white;
    #|  padding: 12px 24px;
    #|  border-radius: 8px;
    #|  font-size: 13px;
    #|  max-width: 80%;
    #|  z-index: 2000;
    #|  display: none;
    #|  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    #|  white-space: pre-wrap;
    #|  font-family: monospace;
    #|}
    #|.mermaid-error-toast.visible { display: block; }
    #|
    #|/* History Panel - Push layout */
    #|body { transition: margin-right 0.25s ease; }
    #|body.history-open { margin-right: 320px; }
    #|body.history-open header { right: 320px; }
    #|header { transition: right 0.25s ease; right: 0; }
    #|
    #|.history-toggle {
    #|  background: var(--selected-bg);
    #|  color: var(--text);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  padding: 6px 8px;
    #|  font-size: 14px;
    #|  cursor: pointer;
    #|  width: 34px;
    #|  height: 34px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|}
    #|.history-toggle:hover { background: var(--border); }
    #|.history-panel {
    #|  position: fixed;
    #|  top: 0;
    #|  right: 0;
    #|  width: 320px;
    #|  height: 100vh;
    #|  background: var(--panel-solid);
    #|  border-left: 1px solid var(--border);
    #|  z-index: 90;
    #|  transform: translateX(100%);
    #|  transition: transform 0.25s ease;
    #|  display: flex;
    #|  flex-direction: column;
    #|}
    #|.history-panel.open { transform: translateX(0); }
    #|.history-panel-header {
    #|  padding: 16px;
    #|  border-bottom: 1px solid var(--border);
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|}
    #|.history-panel-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
    #|.history-panel-close {
    #|  background: transparent;
    #|  border: none;
    #|  color: var(--muted);
    #|  cursor: pointer;
    #|  font-size: 18px;
    #|  padding: 4px;
    #|}
    #|.history-panel-close:hover { color: var(--text); }
    #|.history-panel-body {
    #|  flex: 1;
    #|  overflow-y: auto;
    #|  padding: 12px;
    #|}
    #|.history-empty {
    #|  color: var(--muted);
    #|  font-size: 13px;
    #|  text-align: center;
    #|  padding: 40px 20px;
    #|}
    #|.history-date-group { margin-bottom: 16px; }
    #|.history-date {
    #|  font-size: 11px;
    #|  font-weight: 600;
    #|  color: var(--muted);
    #|  margin-bottom: 8px;
    #|  text-transform: uppercase;
    #|}
    #|.history-item {
    #|  background: var(--bg);
    #|  border: 1px solid var(--border);
    #|  border-radius: 6px;
    #|  margin-bottom: 8px;
    #|  overflow: hidden;
    #|}
    #|.history-item-header {
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|  padding: 8px 10px;
    #|  background: var(--selected-bg);
    #|  cursor: pointer;
    #|}
    #|.history-item-header:hover { background: var(--hover-bg); }
    #|.history-item-file {
    #|  font-size: 12px;
    #|  font-weight: 600;
    #|  color: var(--text);
    #|  white-space: nowrap;
    #|  overflow: hidden;
    #|  text-overflow: ellipsis;
    #|  max-width: 180px;
    #|}
    #|.history-item-time { font-size: 10px; color: var(--muted); }
    #|.history-item-body {
    #|  display: none;
    #|  padding: 10px;
    #|  font-size: 12px;
    #|  border-top: 1px solid var(--border);
    #|}
    #|.history-item.expanded .history-item-body { display: block; }
    #|.history-summary {
    #|  color: var(--text);
    #|  margin-bottom: 8px;
    #|  padding-bottom: 8px;
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.history-summary-label {
    #|  font-size: 10px;
    #|  font-weight: 600;
    #|  color: var(--muted);
    #|  margin-bottom: 4px;
    #|}
    #|.history-summary-text { white-space: pre-wrap; line-height: 1.4; }
    #|.history-comments-label {
    #|  font-size: 10px;
    #|  font-weight: 600;
    #|  color: var(--muted);
    #|  margin-bottom: 6px;
    #|}
    #|.history-comment {
    #|  padding: 6px 0;
    #|  border-bottom: 1px solid var(--border);
    #|}
    #|.history-comment:last-child { border-bottom: none; }
    #|.history-comment-line {
    #|  font-size: 10px;
    #|  color: var(--accent);
    #|  font-weight: 600;
    #|  margin-bottom: 2px;
    #|}
    #|.history-comment-quote {
    #|  background: rgba(0, 0, 0, 0.3);
    #|  border-left: 2px solid var(--accent);
    #|  padding: 4px 8px;
    #|  margin: 4px 0;
    #|  font-family: 'SF Mono', Monaco, Consolas, monospace;
    #|  font-size: 11px;
    #|  color: var(--muted);
    #|  white-space: pre-wrap;
    #|  word-break: break-all;
    #|  max-height: 80px;
    #|  overflow-y: auto;
    #|}
    #|.history-comment-text {
    #|  color: var(--text);
    #|  line-height: 1.4;
    #|  white-space: pre-wrap;
    #|}
    #|.history-badge {
    #|  display: inline-block;
    #|  background: var(--accent);
    #|  color: var(--text-inverse);
    #|  font-size: 10px;
    #|  padding: 2px 6px;
    #|  border-radius: 10px;
    #|  margin-left: 6px;
    #|}
    #|/* Table scroll container */
    #|.table-container {
    #|  overflow-x: auto;
    #|  margin: 16px 0;
    #|  border-radius: 8px;
    #|  border: 1px solid var(--border);
    #|}
    #|.table-container table {
    #|  margin: 0;
    #|  border: none;
    #|  border-radius: 0;
    #|}
    #|.table-container::-webkit-scrollbar {
    #|  height: 6px;
    #|}
    #|.table-container::-webkit-scrollbar-track {
    #|  background: var(--bg);
    #|  border-radius: 3px;
    #|}
    #|.table-container::-webkit-scrollbar-thumb {
    #|  background: var(--border);
    #|  border-radius: 3px;
    #|}
    #|.table-container::-webkit-scrollbar-thumb:hover {
    #|  background: var(--muted);
    #|}
    #|/* Media sidebar */
    #|.media-sidebar {
    #|  display: flex;
    #|  flex-shrink: 0;
    #|  height: calc(100vh - 80px);
    #|  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    #|  position: relative;
    #|  z-index: 10;
    #|  max-width: 60%;
    #|}
    #|.media-sidebar.hidden { display: none; }
    #|.media-sidebar-thumbs {
    #|  width: 96px;
    #|  overflow-y: auto;
    #|  overflow-x: hidden;
    #|  padding: 8px;
    #|  border-right: 1px solid var(--border);
    #|  display: flex;
    #|  flex-direction: column;
    #|  gap: 8px;
    #|  background: var(--panel);
    #|  scrollbar-width: thin;
    #|  scrollbar-color: var(--border) transparent;
    #|}
    #|.media-sidebar-thumbs::-webkit-scrollbar { width: 4px; }
    #|.media-sidebar-thumbs::-webkit-scrollbar-track { background: transparent; }
    #|.media-sidebar-thumbs::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    #|.media-sidebar-thumb {
    #|  width: 80px;
    #|  height: 60px;
    #|  border-radius: 6px;
    #|  border: 2px solid var(--border);
    #|  overflow: hidden;
    #|  cursor: pointer;
    #|  position: relative;
    #|  flex-shrink: 0;
    #|  background: var(--bg);
    #|  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
    #|}
    #|.media-sidebar-thumb:hover { border-color: var(--accent); transform: scale(1.05); box-shadow: 0 2px 8px var(--shadow-color); }
    #|.media-sidebar-thumb.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent), 0 2px 8px var(--shadow-color); }
    #|.media-sidebar-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    #|.media-sidebar-thumb svg { width: 100%; height: 100%; display: block; }
    #|.media-sidebar-thumb-video {
    #|  position: relative;
    #|  width: 100%;
    #|  height: 100%;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  background: #000;
    #|}
    #|.media-sidebar-thumb-video video { width: 100%; height: 100%; object-fit: cover; }
    #|.media-sidebar-thumb-video::after {
    #|  content: '';
    #|  position: absolute;
    #|  width: 24px;
    #|  height: 24px;
    #|  background: rgba(255,255,255,0.85);
    #|  border-radius: 50%;
    #|}
    #|.media-sidebar-thumb-video::before {
    #|  content: '';
    #|  position: absolute;
    #|  z-index: 1;
    #|  width: 0;
    #|  height: 0;
    #|  border-style: solid;
    #|  border-width: 5px 0 5px 9px;
    #|  border-color: transparent transparent transparent #000;
    #|  margin-left: 2px;
    #|}
    #|.media-sidebar-thumb-mermaid {
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|  width: 100%;
    #|  height: 100%;
    #|  padding: 2px;
    #|  background: var(--panel);
    #|  overflow: hidden;
    #|}
    #|.media-sidebar-thumb-mermaid svg { width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%; display: block; }
    #|.media-sidebar-thumb-index {
    #|  position: absolute;
    #|  top: 2px;
    #|  left: 2px;
    #|  background: rgba(0,0,0,0.6);
    #|  color: #fff;
    #|  font-size: 9px;
    #|  font-weight: 600;
    #|  padding: 1px 4px;
    #|  border-radius: 3px;
    #|  line-height: 1.2;
    #|  pointer-events: none;
    #|  z-index: 1;
    #|}
    #|.media-sidebar-viewer {
    #|  width: 0;
    #|  overflow: hidden;
    #|  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    #|  background: var(--bg);
    #|  position: relative;
    #|}
    #|.media-sidebar-viewer.open {
    #|  width: 45vw;
    #|  max-width: calc(100vw - 400px);
    #|  overflow: hidden;
    #|  padding: 16px;
    #|  border-right: 1px solid var(--border);
    #|  display: flex;
    #|  flex-direction: column;
    #|}
    #|.media-sidebar-viewer-close {
    #|  position: absolute;
    #|  top: 8px;
    #|  right: 8px;
    #|  z-index: 2;
    #|  background: var(--selected-bg);
    #|  border: 1px solid var(--border);
    #|  color: var(--text);
    #|  width: 28px;
    #|  height: 28px;
    #|  border-radius: 50%;
    #|  cursor: pointer;
    #|  font-size: 14px;
    #|  display: flex;
    #|  align-items: center;
    #|  justify-content: center;
    #|}
    #|.media-sidebar-viewer-content {
    #|  display: flex;
    #|  flex-direction: column;
    #|  align-items: center;
    #|  justify-content: flex-start;
    #|  flex: 1;
    #|  min-height: 0;
    #|  overflow: hidden;
    #|}
    #|.media-sidebar-viewer-content img { max-width: 100%; max-height: calc(100vh - 140px); object-fit: contain; border-radius: 8px; }
    #|.media-sidebar-viewer-content video { max-width: 100%; max-height: calc(100vh - 140px); border-radius: 8px; background: #000; }
    #|.media-sidebar-viewer-label {
    #|  margin-top: 8px;
    #|  font-size: 12px;
    #|  color: var(--muted);
    #|  text-align: center;
    #|  white-space: nowrap;
    #|  overflow: hidden;
    #|  text-overflow: ellipsis;
    #|  max-width: 100%;
    #|}
    #|.sidebar-zoom-indicator {
    #|  position: absolute;
    #|  bottom: 12px;
    #|  right: 12px;
    #|  background: rgba(0,0,0,0.7);
    #|  color: #fff;
    #|  padding: 4px 8px;
    #|  border-radius: 4px;
    #|  font-size: 11px;
    #|  pointer-events: none;
    #|  transition: opacity 0.3s ease;
    #|}
    #|.sidebar-zoom-indicator.hidden { opacity: 0; }
    #|.sidebar-mermaid-viewport { overflow: hidden; position: relative; cursor: grab; }
    #|.sidebar-mermaid-wrapper { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
    #|.sidebar-video-container { width: 100%; }
    #|.sidebar-video-container video { width: 100%; max-height: calc(100vh - 200px); border-radius: 8px; background: #000; }
    #|/* Video timeline */
    #|.video-timeline {
    #|  display: flex;
    #|  gap: 8px;
    #|  padding: 8px;
    #|  overflow-x: auto;
    #|  background: var(--panel);
    #|  border-radius: 8px;
    #|  margin-top: 8px;
    #|  scrollbar-width: thin;
    #|  scrollbar-color: var(--border) transparent;
    #|}
    #|.timeline-loading { color: var(--muted); font-size: 12px; padding: 8px; }
    #|.timeline-thumb-wrapper {
    #|  flex-shrink: 0;
    #|  display: flex;
    #|  flex-direction: column;
    #|  align-items: center;
    #|  gap: 4px;
    #|  cursor: pointer;
    #|}
    #|.timeline-thumb {
    #|  width: 80px;
    #|  height: 60px;
    #|  object-fit: cover;
    #|  border-radius: 4px;
    #|  border: 2px solid transparent;
    #|  transition: border-color 0.2s ease;
    #|}
    #|.timeline-thumb.active { border-color: var(--accent); }
    #|.timeline-thumb:hover { border-color: var(--accent); opacity: 0.8; }
    #|.timeline-time { font-size: 10px; color: var(--muted); }
    #|/* Fullscreen overlay */
    #|.fullscreen-overlay {
    #|  display: none;
    #|  position: fixed;
    #|  top: 0;
    #|  left: 0;
    #|  width: 100%;
    #|  height: 100%;
    #|  background: rgba(0,0,0,0.9);
    #|  z-index: 1000;
    #|  flex-direction: column;
    #|}
    #|.fullscreen-overlay.visible { display: flex; }
    #|.fullscreen-header {
    #|  display: flex;
    #|  justify-content: space-between;
    #|  align-items: center;
    #|  padding: 12px 16px;
    #|  background: rgba(0,0,0,0.8);
    #|  border-bottom: 1px solid rgba(255,255,255,0.1);
    #|}
    #|.fullscreen-header h3 { margin: 0; color: #fff; font-size: 14px; }
    #|.fullscreen-controls { display: flex; gap: 6px; align-items: center; }
    #|.fullscreen-controls button {
    #|  background: rgba(255,255,255,0.1);
    #|  border: 1px solid rgba(255,255,255,0.2);
    #|  color: #fff;
    #|  padding: 6px 12px;
    #|  border-radius: 6px;
    #|  cursor: pointer;
    #|  font-size: 12px;
    #|}
    #|.fullscreen-controls button:hover { background: rgba(255,255,255,0.2); }
    #|.fullscreen-controls .zoom-info { color: #fff; font-size: 12px; min-width: 40px; text-align: center; }
    #|@media (max-width: 960px) {
    #|  .media-sidebar { display: none !important; }
    #|  .media-sidebar-toggle { display: none !important; }
    #|}
  css
}
