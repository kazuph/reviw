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

///| Escape string for embedding in JavaScript (also prevents script injection)
pub fn escape_js_string(s : String) -> String {
  let buf = StringBuilder::new()
  let chars = s.to_array()
  for ch in chars {
    match ch {
      '\\' => buf.write_string("\\\\")
      '"' => buf.write_string("\\\"")
      '\n' => buf.write_string("\\n")
      '\r' => buf.write_string("\\r")
      '\t' => buf.write_string("\\t")
      '<' => buf.write_string("\\u003c")
      _ => buf.write_char(ch)
    }
  }
  buf.to_string()
}

///| Serialize CsvData as JSON for DATA variable injection
fn serialize_csv_data_json(data : CsvData) -> String {
  let buf = StringBuilder::new()
  buf.write_string("{\"headers\":[")
  for i, h in data.headers {
    if i > 0 {
      buf.write_char(',')
    }
    buf.write_char('"')
    buf.write_string(escape_js_string(h))
    buf.write_char('"')
  }
  buf.write_string("],\"rows\":[")
  for i, row in data.rows {
    if i > 0 {
      buf.write_char(',')
    }
    buf.write_char('[')
    for j, cell in row {
      if j > 0 {
        buf.write_char(',')
      }
      buf.write_char('"')
      buf.write_string(escape_js_string(cell))
      buf.write_char('"')
    }
    buf.write_char(']')
  }
  buf.write_string("]}")
  buf.to_string()
}

fn build_page_start(buf : StringBuilder, filename : String) -> Unit {
  buf.write_string("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>reviw - ")
  buf.write_string(escape_html(filename))
  buf.write_string("</title><style>")
  buf.write_string(build_css())
  buf.write_string("</style></head><body>")
  buf.write_string("<header class=\"toolbar\"><h1>reviw <span class=\"filename\">")
  buf.write_string(escape_html(filename))
  buf.write_string("</span></h1><div style=\"flex:1\"></div>")
  buf.write_string("<button class=\"btn\" id=\"theme-toggle\">Theme</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"send-and-exit\">Submit &amp; Exit</button></header>")
}

fn build_comment_card(buf : StringBuilder) -> Unit {
  buf.write_string("<div id=\"comment-card\" class=\"comment-card hidden\">")
  buf.write_string("<textarea id=\"comment-input\" placeholder=\"Add your comment...\"></textarea>")
  buf.write_string("<div class=\"actions\">")
  buf.write_string("<button class=\"btn\" id=\"comment-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"save-comment\">Save</button>")
  buf.write_string("</div></div>")
}

fn build_submit_modal(buf : StringBuilder) -> Unit {
  buf.write_string("<div id=\"submit-modal\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"modal\"><h2>Submit Review</h2>")
  buf.write_string("<ul id=\"modal-summary\" class=\"comment-list\"></ul>")
  buf.write_string("<textarea id=\"global-comment\" placeholder=\"Overall summary...\"></textarea>")
  buf.write_string("<div style=\"display:flex;gap:8px;justify-content:flex-end\">")
  buf.write_string("<button class=\"btn\" id=\"modal-cancel\">Cancel</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"modal-submit\">Submit &amp; Exit</button>")
  buf.write_string("</div></div></div>")
}

fn build_recovery_modal(buf : StringBuilder) -> Unit {
  buf.write_string("<div id=\"recovery-modal\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"modal\"><h2>Restore Previous Comments?</h2>")
  buf.write_string("<p id=\"recovery-summary\">Found saved comments from a previous session.</p>")
  buf.write_string("<div style=\"display:flex;gap:8px;justify-content:flex-end\">")
  buf.write_string("<button class=\"btn\" id=\"recovery-discard\">Discard</button>")
  buf.write_string("<button class=\"btn btn-primary\" id=\"recovery-restore\">Restore</button>")
  buf.write_string("</div></div></div>")
}

fn build_script_footer(
  buf : StringBuilder,
  port : Int,
  mode : String,
  filename : String
) -> Unit {
  buf.write_string("<script type=\"module\" src=\"/ui.js\"></script>")
  buf.write_string("<script>window.__REVIW_PORT__=")
  buf.write_string(port.to_string())
  buf.write_string(";window.__REVIW_MODE__=\"")
  buf.write_string(escape_js_string(mode))
  buf.write_string("\";window.__REVIW_FILENAME__=\"")
  buf.write_string(escape_js_string(filename))
  buf.write_string("\";</script></body></html>")
}

///| Build complete HTML page for CSV viewer (cli.cjs compatible selectors)
pub fn build_csv_html(data : CsvData, filename : String, port : Int) -> String {
  let buf = StringBuilder::new()
  build_page_start(buf, filename)
  buf.write_string("<div id=\"filter-menu\"></div>")
  buf.write_string("<div style=\"padding:16px;overflow-x:auto\"><table id=\"csv-table\"><thead><tr>")
  for i, header in data.headers {
    buf.write_string("<th data-col=\"")
    buf.write_string(i.to_string())
    buf.write_string("\"><span class=\"th-inner\">")
    buf.write_string(escape_html(header))
    buf.write_string("</span></th>")
  }
  buf.write_string("</tr></thead><tbody id=\"tbody\">")
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
  build_comment_card(buf)
  build_submit_modal(buf)
  build_recovery_modal(buf)
  buf.write_string("<script>const DATA = ")
  buf.write_string(serialize_csv_data_json(data))
  buf.write_string(";</script>")
  build_script_footer(buf, port, "csv", filename)
  buf.to_string()
}

///| Build HTML page for diff viewer
pub fn build_diff_html(data : DiffData, filename : String, port : Int) -> String {
  let buf = StringBuilder::new()
  build_page_start(buf, filename)
  buf.write_string("<div class=\"diff-view\">")
  for file in data.files {
    let display_path = if file.new_path.length() > 0 {
      file.new_path
    } else {
      file.old_path
    }
    buf.write_string("<div class=\"diff-file-header\">")
    buf.write_string(escape_html(display_path))
    if file.is_new {
      buf.write_string(" <span class=\"diff-label new\">new file</span>")
    } else if file.is_deleted {
      buf.write_string(" <span class=\"diff-label deleted\">deleted</span>")
    } else if file.is_binary {
      buf.write_string(" <span class=\"diff-label binary\">binary</span>")
    }
    buf.write_string("</div>")
    if not(file.is_binary) {
      for hunk in file.hunks {
        buf.write_string("<div class=\"diff-hunk-header\">@@ -")
        buf.write_string(hunk.old_start.to_string())
        buf.write_string(",")
        buf.write_string(hunk.old_count.to_string())
        buf.write_string(" +")
        buf.write_string(hunk.new_start.to_string())
        buf.write_string(",")
        buf.write_string(hunk.new_count.to_string())
        buf.write_string(" @@")
        if hunk.context.length() > 0 {
          buf.write_string(" ")
          buf.write_string(escape_html(hunk.context))
        }
        buf.write_string("</div>")
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
  }
  buf.write_string("</div>")
  build_comment_card(buf)
  build_submit_modal(buf)
  build_recovery_modal(buf)
  build_script_footer(buf, port, "diff", filename)
  buf.to_string()
}

///| Build HTML page for text viewer
pub fn build_text_html(
  lines : Array[String],
  filename : String,
  port : Int
) -> String {
  let buf = StringBuilder::new()
  build_page_start(buf, filename)
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
  build_comment_card(buf)
  build_submit_modal(buf)
  build_recovery_modal(buf)
  build_script_footer(buf, port, "text", filename)
  buf.to_string()
}
