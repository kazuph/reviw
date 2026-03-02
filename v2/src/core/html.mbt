///| HTML entity escaping
pub fn escape_html(s : String) -> String {
  let buf = StringBuilder::new()
  let chars = s.to_array()
  for ch in chars {
    match ch {
      '&' => buf.write_string("&amp;")
      '<' => buf.write_string("&lt;")
      '>' => buf.write_string("&gt;")
      '"' => buf.write_string("&quot;")
      '\'' => buf.write_string("&#39;")
      _ => buf.write_char(ch)
    }
  }
  buf.to_string()
}

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
    #|.toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--panel); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    #|.toolbar h1 { font-size: 14px; font-weight: 600; }
    #|.toolbar .filename { color: var(--accent); margin-left: 4px; }
    #|.btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text); cursor: pointer; font-size: 12px; }
    #|.btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
    #|.btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    #|table { border-collapse: collapse; width: 100%; font-size: 13px; }
    #|th, td { padding: 6px 10px; border: 1px solid var(--border); text-align: left; cursor: pointer; position: relative; }
    #|th { background: var(--panel); position: sticky; top: 40px; z-index: 10; font-weight: 600; }
    #|tr:hover { background: var(--hover); }
    #|td.commented { background: var(--comment-bg); }
    #|td.commented::after { content: ''; position: absolute; top: 2px; right: 2px; width: 6px; height: 6px; border-radius: 50%; background: var(--comment-dot); }
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
    #|.md-container { display: flex; height: calc(100vh - 48px); }
    #|.md-preview, .md-source { flex: 1; overflow-y: auto; padding: 24px; }
    #|.md-source { background: var(--panel); font-family: monospace; font-size: 13px; white-space: pre-wrap; border-left: 1px solid var(--border); }
    #|.md-source .line { display: block; padding: 1px 8px; cursor: pointer; }
    #|.md-source .line:hover { background: var(--hover); }
    #|.md-source .line.highlighted { background: rgba(233, 69, 96, 0.2); }
    #|.text-view { padding: 16px; font-family: monospace; font-size: 13px; }
    #|.text-line { display: flex; cursor: pointer; }
    #|.text-line:hover { background: var(--hover); }
    #|.text-line .line-num { min-width: 50px; padding: 0 8px; color: var(--text-dim); text-align: right; user-select: none; }
    #|.text-line .line-content { padding: 0 8px; white-space: pre-wrap; }
    #|.hidden { display: none; }
  css
}

///| Build complete HTML page for CSV viewer
pub fn build_csv_html(data : CsvData, filename : String, port : Int) -> String {
  let buf = StringBuilder::new()
  buf.write_string("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>reviw - ")
  buf.write_string(escape_html(filename))
  buf.write_string("</title><style>")
  buf.write_string(build_css())
  buf.write_string("</style></head><body>")
  // Toolbar
  buf.write_string("<div class=\"toolbar\"><h1>reviw <span class=\"filename\">")
  buf.write_string(escape_html(filename))
  buf.write_string("</span></h1><div style=\"flex:1\"></div>")
  buf.write_string("<button class=\"btn\" id=\"theme-toggle\">Theme</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"submit-btn\">Submit &amp; Exit</button></div>")
  // Table
  buf.write_string("<div style=\"padding:16px;overflow-x:auto\"><table id=\"data-table\"><thead><tr>")
  for header in data.headers {
    buf.write_string("<th>")
    buf.write_string(escape_html(header))
    buf.write_string("</th>")
  }
  buf.write_string("</tr></thead><tbody>")
  for i, row in data.rows {
    buf.write_string("<tr data-row=\"")
    buf.write_string(i.to_string())
    buf.write_string("\">")
    for j, cell in row {
      buf.write_string("<td data-row=\"")
      buf.write_string(i.to_string())
      buf.write_string("\" data-col=\"")
      buf.write_string(j.to_string())
      buf.write_string("\">")
      buf.write_string(escape_html(cell))
      buf.write_string("</td>")
    }
    buf.write_string("</tr>")
  }
  buf.write_string("</tbody></table></div>")
  // Comment card (hidden initially)
  buf.write_string("<div id=\"comment-card\" class=\"comment-card hidden\">")
  buf.write_string("<textarea id=\"comment-text\" placeholder=\"Add your comment...\"></textarea>")
  buf.write_string("<div class=\"actions\">")
  buf.write_string("<button class=\"btn\" id=\"comment-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"comment-save\">Save</button>")
  buf.write_string("</div></div>")
  // Submit modal (hidden initially)
  buf.write_string("<div id=\"submit-modal\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"modal\"><h2>Submit Review</h2>")
  buf.write_string("<ul id=\"comment-list\" class=\"comment-list\"></ul>")
  buf.write_string("<textarea id=\"summary-text\" placeholder=\"Overall summary...\"></textarea>")
  buf.write_string("<div style=\"display:flex;gap:8px;justify-content:flex-end\">")
  buf.write_string("<button class=\"btn\" id=\"modal-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"modal-submit\">Submit &amp; Exit</button>")
  buf.write_string("</div></div></div>")
  // Inline MoonBit-generated Wasm script will be loaded separately
  buf.write_string("<script type=\"module\" src=\"/ui.js\"></script>")
  buf.write_string("<script>window.__REVIW_PORT__=")
  buf.write_string(port.to_string())
  buf.write_string(";window.__REVIW_MODE__=\"csv\";</script>")
  buf.write_string("</body></html>")
  buf.to_string()
}

///| Build HTML page for diff viewer
pub fn build_diff_html(data : DiffData, filename : String, port : Int) -> String {
  let buf = StringBuilder::new()
  buf.write_string("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>reviw - ")
  buf.write_string(escape_html(filename))
  buf.write_string("</title><style>")
  buf.write_string(build_css())
  buf.write_string("</style></head><body>")
  // Toolbar
  buf.write_string("<div class=\"toolbar\"><h1>reviw <span class=\"filename\">")
  buf.write_string(escape_html(filename))
  buf.write_string("</span></h1><div style=\"flex:1\"></div>")
  buf.write_string("<button class=\"btn\" id=\"theme-toggle\">Theme</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"submit-btn\">Submit &amp; Exit</button></div>")
  // Diff content
  buf.write_string("<div class=\"diff-view\">")
  for file in data.files {
    let display_path = if file.new_path.length() > 0 {
      file.new_path
    } else {
      file.old_path
    }
    buf.write_string("<div class=\"diff-file-header\">")
    buf.write_string(escape_html(display_path))
    buf.write_string("</div>")
    for hunk in file.hunks {
      let mut old_line = hunk.old_start
      let mut new_line = hunk.new_start
      for line in hunk.lines {
        let css_class = match line.kind {
          Addition => "diff-line addition"
          Deletion => "diff-line deletion"
          Context => "diff-line"
        }
        buf.write_string("<div class=\"")
        buf.write_string(css_class)
        buf.write_string("\" data-file=\"")
        buf.write_string(escape_html(display_path))
        buf.write_string("\">")
        // Line numbers
        match line.kind {
          Deletion => {
            buf.write_string("<span class=\"line-num\">")
            buf.write_string(old_line.to_string())
            buf.write_string("</span><span class=\"line-num\"></span>")
            old_line = old_line + 1
          }
          Addition => {
            buf.write_string("<span class=\"line-num\"></span><span class=\"line-num\">")
            buf.write_string(new_line.to_string())
            buf.write_string("</span>")
            new_line = new_line + 1
          }
          Context => {
            buf.write_string("<span class=\"line-num\">")
            buf.write_string(old_line.to_string())
            buf.write_string("</span><span class=\"line-num\">")
            buf.write_string(new_line.to_string())
            buf.write_string("</span>")
            old_line = old_line + 1
            new_line = new_line + 1
          }
        }
        buf.write_string("<span class=\"line-content\">")
        buf.write_string(escape_html(line.content))
        buf.write_string("</span></div>")
      }
    }
  }
  buf.write_string("</div>")
  // Comment card + modal (same as CSV)
  buf.write_string("<div id=\"comment-card\" class=\"comment-card hidden\">")
  buf.write_string("<textarea id=\"comment-text\" placeholder=\"Add your comment...\"></textarea>")
  buf.write_string("<div class=\"actions\">")
  buf.write_string("<button class=\"btn\" id=\"comment-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"comment-save\">Save</button>")
  buf.write_string("</div></div>")
  buf.write_string("<div id=\"submit-modal\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"modal\"><h2>Submit Review</h2>")
  buf.write_string("<ul id=\"comment-list\" class=\"comment-list\"></ul>")
  buf.write_string("<textarea id=\"summary-text\" placeholder=\"Overall summary...\"></textarea>")
  buf.write_string("<div style=\"display:flex;gap:8px;justify-content:flex-end\">")
  buf.write_string("<button class=\"btn\" id=\"modal-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"modal-submit\">Submit &amp; Exit</button>")
  buf.write_string("</div></div></div>")
  buf.write_string("<script type=\"module\" src=\"/ui.js\"></script>")
  buf.write_string("<script>window.__REVIW_PORT__=")
  buf.write_string(port.to_string())
  buf.write_string(";window.__REVIW_MODE__=\"diff\";</script>")
  buf.write_string("</body></html>")
  buf.to_string()
}

///| Build HTML page for text viewer
pub fn build_text_html(
  lines : Array[String],
  filename : String,
  port : Int
) -> String {
  let buf = StringBuilder::new()
  buf.write_string("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>reviw - ")
  buf.write_string(escape_html(filename))
  buf.write_string("</title><style>")
  buf.write_string(build_css())
  buf.write_string("</style></head><body>")
  buf.write_string("<div class=\"toolbar\"><h1>reviw <span class=\"filename\">")
  buf.write_string(escape_html(filename))
  buf.write_string("</span></h1><div style=\"flex:1\"></div>")
  buf.write_string("<button class=\"btn\" id=\"theme-toggle\">Theme</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"submit-btn\">Submit &amp; Exit</button></div>")
  buf.write_string("<div class=\"text-view\">")
  for i, line in lines {
    let line_num = i + 1
    buf.write_string("<div class=\"text-line\" data-row=\"")
    buf.write_string(i.to_string())
    buf.write_string("\"><span class=\"line-num\">")
    buf.write_string(line_num.to_string())
    buf.write_string("</span><span class=\"line-content\">")
    buf.write_string(escape_html(line))
    buf.write_string("</span></div>")
  }
  buf.write_string("</div>")
  // Comment card + modal
  buf.write_string("<div id=\"comment-card\" class=\"comment-card hidden\">")
  buf.write_string("<textarea id=\"comment-text\" placeholder=\"Add your comment...\"></textarea>")
  buf.write_string("<div class=\"actions\">")
  buf.write_string("<button class=\"btn\" id=\"comment-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"comment-save\">Save</button>")
  buf.write_string("</div></div>")
  buf.write_string("<div id=\"submit-modal\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"modal\"><h2>Submit Review</h2>")
  buf.write_string("<ul id=\"comment-list\" class=\"comment-list\"></ul>")
  buf.write_string("<textarea id=\"summary-text\" placeholder=\"Overall summary...\"></textarea>")
  buf.write_string("<div style=\"display:flex;gap:8px;justify-content:flex-end\">")
  buf.write_string("<button class=\"btn\" id=\"modal-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"modal-submit\">Submit &amp; Exit</button>")
  buf.write_string("</div></div></div>")
  buf.write_string("<script type=\"module\" src=\"/ui.js\"></script>")
  buf.write_string("<script>window.__REVIW_PORT__=")
  buf.write_string(port.to_string())
  buf.write_string(";window.__REVIW_MODE__=\"text\";</script>")
  buf.write_string("</body></html>")
  buf.to_string()
}
