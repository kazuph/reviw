///| Build the main CSS styles
fn build_css() -> String {
  let css =
    #|:root {
    #|  --bg: #1a1a2e;
    #|  --panel: #16213e;
    #|  --surface: #0f3460;
    #|  --accent: #e94560;
    #|  --text: #eee;
    #|  --text-dim: #999;
    #|  --border: #333;
    #|  --comment-bg: #2a2a4a;
    #|  --comment-dot: #e94560;
    #|  --hover: rgba(233, 69, 96, 0.1);
    #|}
    #|[data-theme="light"] {
    #|  --bg: #f5f5f5;
    #|  --panel: #fff;
    #|  --surface: #e8e8e8;
    #|  --accent: #d63384;
    #|  --text: #333;
    #|  --text-dim: #666;
    #|  --border: #ddd;
    #|  --comment-bg: #fff3cd;
    #|  --comment-dot: #d63384;
    #|  --hover: rgba(214, 51, 132, 0.1);
    #|}
    #|* { box-sizing: border-box; margin: 0; padding: 0; }
    #|body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); }
    #|header.toolbar, .toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--panel); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    #|.toolbar h1 { font-size: 14px; font-weight: 600; }
    #|.toolbar .filename { color: var(--accent); margin-left: 4px; }
    #|.btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text); cursor: pointer; font-size: 12px; }
    #|.btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    #|.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    #|table { border-collapse: collapse; width: 100%; font-size: 13px; }
    #|th, td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; cursor: pointer; position: relative; }
    #|th { background: var(--panel); position: sticky; top: 40px; z-index: 10; font-weight: 600; }
    #|tr:hover { background: var(--hover); }
    #|td.has-comment { background: var(--comment-bg); }
    #|td.has-comment::after { content: ''; position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; border-radius: 50%; background: var(--comment-dot); }
    #|.comment-card { position: fixed; z-index: 200; background: var(--panel); border: 1px solid var(--accent); border-radius: 8px; padding: 12px; width: 320px; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
    #|.comment-card textarea { width: 100%; min-height: 80px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: 8px; resize: vertical; font-family: inherit; }
    #|.comment-card .actions { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }
    #|.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; display: flex; align-items: center; justify-content: center; }
    #|.modal { background: var(--panel); border-radius: 12px; padding: 24px; width: 90%; max-width: 600px; max-height: 80vh; overflow-y: auto; }
    #|.modal h2 { margin-bottom: 16px; }
    #|.modal textarea { width: 100%; min-height: 120px; background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px; padding: 12px; font-family: inherit; margin-bottom: 16px; }
    #|.comment-list { list-style: none; margin-bottom: 16px; }
    #|.comment-list li { padding: 8px; border-bottom: 1px solid var(--border); font-size: 13px; }
    #|.comment-list .location { color: var(--accent); font-weight: 600; }
    #|#filter-menu { display: none; position: absolute; background: var(--panel); border: 1px solid var(--border); border-radius: 4px; padding: 8px; z-index: 50; }
    #|.diff-view { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; }
    #|.diff-line { display: flex; white-space: pre-wrap; word-break: break-all; }
    #|.diff-line:hover { background: var(--hover); cursor: pointer; }
    #|.diff-line .line-num { min-width: 50px; padding: 0 8px; color: var(--text-dim); text-align: right; user-select: none; border-right: 1px solid var(--border); }
    #|.diff-line .line-content { padding: 0 8px; flex: 1; }
    #|.diff-line.addition { background: rgba(46, 160, 67, 0.15); }
    #|.diff-line.addition .line-content { color: #3fb950; }
    #|.diff-line.deletion { background: rgba(248, 81, 73, 0.15); }
    #|.diff-line.deletion .line-content { color: #f85149; }
    #|.diff-file-header { padding: 8px 16px; background: var(--surface); border: 1px solid var(--border); font-weight: 600; font-size: 14px; margin-top: 16px; }
    #|.md-layout { display: flex; height: calc(100vh - 48px); }
    #|.md-preview { flex: 1; overflow-y: auto; padding: 24px; }
    #|.md-left { flex: 1; overflow-y: auto; padding: 24px; }
    #|.md-right { flex: 1; overflow-y: auto; background: var(--panel); border-left: 1px solid var(--border); }
    #|.text-view { padding: 16px; font-family: monospace; font-size: 13px; }
    #|.text-line { display: flex; cursor: pointer; }
    #|.text-line:hover { background: var(--hover); }
    #|.text-line .line-num { min-width: 50px; padding: 0 8px; color: var(--text-dim); text-align: right; user-select: none; }
    #|.text-line .line-content { padding: 0 8px; white-space: pre-wrap; }
    #|.hidden { display: none; }
  css
}
