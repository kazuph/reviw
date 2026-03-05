///| Parse markdown source into MarkdownData with HTML and frontmatter
pub fn parse_markdown(input : String) -> MarkdownData {
  if input.length() == 0 {
    return { source: "", html: "", frontmatter: {} }
  }
  let lines = split_to_lines(input)
  let frontmatter : Map[String, String] = {}
  let mut content_start = 0
  // Parse YAML frontmatter
  if lines.length() > 0 && lines[0] == "---" {
    let mut end_idx = -1
    for i in 1..<lines.length() {
      if lines[i] == "---" {
        end_idx = i
        break
      }
    }
    if end_idx > 0 {
      for i in 1..<end_idx {
        let line = lines[i]
        let colon = index_of_char(line, ':')
        if colon >= 0 {
          let key = trim(safe_slice_range(line, 0, colon))
          let val = trim(safe_slice(line, colon + 1))
          if key.length() > 0 {
            frontmatter[key] = val
          }
        }
      }
      content_start = end_idx + 1
    }
  }
  // Build content lines (skip frontmatter)
  let content_lines : Array[String] = []
  for i in content_start..<lines.length() {
    content_lines.push(lines[i])
  }
  let html = render_markdown_lines(content_lines)
  // Build source (content without frontmatter)
  let src_buf = StringBuilder::new()
  for i, line in content_lines {
    if i > 0 {
      src_buf.write_string("\n")
    }
    src_buf.write_string(line)
  }
  { source: src_buf.to_string(), html, frontmatter }
}

///| Find index of first occurrence of a char in string, -1 if not found
fn index_of_char(s : String, target : Char) -> Int {
  let chars = s.to_array()
  for i, ch in chars {
    if ch == target {
      return i
    }
  }
  -1
}

///| Trim leading and trailing whitespace
fn trim(s : String) -> String {
  let chars = s.to_array()
  let len = chars.length()
  if len == 0 {
    return ""
  }
  let mut start = 0
  while start < len && is_whitespace(chars[start]) {
    start = start + 1
  }
  let mut end = len - 1
  while end >= start && is_whitespace(chars[end]) {
    end = end - 1
  }
  if start > end {
    return ""
  }
  let buf = StringBuilder::new()
  for i in start..=end {
    buf.write_char(chars[i])
  }
  buf.to_string()
}

///| Check if char is whitespace
fn is_whitespace(ch : Char) -> Bool {
  ch == ' ' || ch == '\t' || ch == '\r' || ch == '\n'
}

///| Render markdown lines to HTML
fn render_markdown_lines(lines : Array[String]) -> String {
  let buf = StringBuilder::new()
  let mut i = 0
  let len = lines.length()
  while i < len {
    let line = lines[i]
    // Skip empty lines
    if trim(line).length() == 0 {
      i = i + 1
      continue
    }
    // Heading
    if line.has_prefix("######") {
      buf.write_string("<h6>")
      buf.write_string(render_inline(trim(safe_slice(line, 7))))
      buf.write_string("</h6>\n")
      i = i + 1
      continue
    }
    if line.has_prefix("#####") {
      buf.write_string("<h5>")
      buf.write_string(render_inline(trim(safe_slice(line, 6))))
      buf.write_string("</h5>\n")
      i = i + 1
      continue
    }
    if line.has_prefix("####") {
      buf.write_string("<h4>")
      buf.write_string(render_inline(trim(safe_slice(line, 5))))
      buf.write_string("</h4>\n")
      i = i + 1
      continue
    }
    if line.has_prefix("###") {
      buf.write_string("<h3>")
      buf.write_string(render_inline(trim(safe_slice(line, 4))))
      buf.write_string("</h3>\n")
      i = i + 1
      continue
    }
    if line.has_prefix("##") {
      buf.write_string("<h2>")
      buf.write_string(render_inline(trim(safe_slice(line, 3))))
      buf.write_string("</h2>\n")
      i = i + 1
      continue
    }
    if line.has_prefix("#") {
      buf.write_string("<h1>")
      buf.write_string(render_inline(trim(safe_slice(line, 2))))
      buf.write_string("</h1>\n")
      i = i + 1
      continue
    }
    // Horizontal rule
    if is_horizontal_rule(line) {
      buf.write_string("<hr />\n")
      i = i + 1
      continue
    }
    // Code block
    if line.has_prefix("```") {
      i = i + 1
      let code_buf = StringBuilder::new()
      while i < len && not(lines[i].has_prefix("```")) {
        if code_buf.to_string().length() > 0 {
          code_buf.write_string("\n")
        }
        code_buf.write_string(lines[i])
        i = i + 1
      }
      if i < len {
        i = i + 1 // skip closing ```
      }
      buf.write_string("<pre><code>")
      buf.write_string(escape_html(code_buf.to_string()))
      buf.write_string("</code></pre>\n")
      continue
    }
    // Blockquote
    if line.has_prefix(">") {
      let quote_lines : Array[String] = []
      while i < len && lines[i].has_prefix(">") {
        let content = trim(safe_slice(lines[i], 1))
        quote_lines.push(content)
        i = i + 1
      }
      buf.write_string("<blockquote>")
      for ql in quote_lines {
        buf.write_string("<p>")
        buf.write_string(render_inline(ql))
        buf.write_string("</p>")
      }
      buf.write_string("</blockquote>\n")
      continue
    }
    // Unordered list
    if line.has_prefix("- ") || line.has_prefix("* ") {
      buf.write_string("<ul>\n")
      while i < len && (lines[i].has_prefix("- ") || lines[i].has_prefix("* ")) {
        buf.write_string("<li>")
        buf.write_string(render_inline(safe_slice(lines[i], 2)))
        buf.write_string("</li>\n")
        i = i + 1
      }
      buf.write_string("</ul>\n")
      continue
    }
    // Ordered list
    if is_ordered_list_item(line) {
      buf.write_string("<ol>\n")
      while i < len && is_ordered_list_item(lines[i]) {
        let content = extract_ordered_list_content(lines[i])
        buf.write_string("<li>")
        buf.write_string(render_inline(content))
        buf.write_string("</li>\n")
        i = i + 1
      }
      buf.write_string("</ol>\n")
      continue
    }
    // Table
    if i + 1 < len && is_table_separator(lines[i + 1]) {
      buf.write_string("<table>\n<thead>\n<tr>\n")
      let headers = parse_table_row(line)
      for h in headers {
        buf.write_string("<th>")
        buf.write_string(render_inline(trim(h)))
        buf.write_string("</th>\n")
      }
      buf.write_string("</tr>\n</thead>\n<tbody>\n")
      i = i + 2 // skip header + separator
      while i < len && lines[i].contains("|") {
        let cells = parse_table_row(lines[i])
        buf.write_string("<tr>\n")
        for cell in cells {
          buf.write_string("<td>")
          buf.write_string(render_inline(trim(cell)))
          buf.write_string("</td>\n")
        }
        buf.write_string("</tr>\n")
        i = i + 1
      }
      buf.write_string("</tbody>\n</table>\n")
      continue
    }
    // Paragraph (collect contiguous non-empty, non-block lines)
    let para_buf = StringBuilder::new()
    while i < len && trim(lines[i]).length() > 0 && not(is_block_start(lines[i])) {
      if para_buf.to_string().length() > 0 {
        para_buf.write_string(" ")
      }
      para_buf.write_string(lines[i])
      i = i + 1
    }
    let para_text = para_buf.to_string()
    if para_text.length() > 0 {
      buf.write_string("<p>")
      buf.write_string(render_inline(para_text))
      buf.write_string("</p>\n")
    }
  }
  trim(buf.to_string())
}

///| Check if line starts a block element
fn is_block_start(line : String) -> Bool {
  line.has_prefix("#") || line.has_prefix("```") || line.has_prefix(">") ||
  line.has_prefix("- ") || line.has_prefix("* ") || is_ordered_list_item(line) ||
  is_horizontal_rule(line)
}

///| Check if line is a horizontal rule (---, ***, ___)
fn is_horizontal_rule(line : String) -> Bool {
  let t = trim(line)
  if t.length() < 3 {
    return false
  }
  let chars = t.to_array()
  let first = chars[0]
  if first != '-' && first != '*' && first != '_' {
    return false
  }
  for ch in chars {
    if ch != first && ch != ' ' {
      return false
    }
  }
  true
}

///| Check if line is an ordered list item (e.g., "1. text")
fn is_ordered_list_item(line : String) -> Bool {
  let chars = line.to_array()
  let mut i = 0
  while i < chars.length() && chars[i] >= '0' && chars[i] <= '9' {
    i = i + 1
  }
  if i == 0 {
    return false
  }
  i < chars.length() - 1 && chars[i] == '.' && chars[i + 1] == ' '
}

///| Extract content after "N. " in ordered list
fn extract_ordered_list_content(line : String) -> String {
  let chars = line.to_array()
  let mut i = 0
  while i < chars.length() && chars[i] >= '0' && chars[i] <= '9' {
    i = i + 1
  }
  // skip ". "
  safe_slice(line, i + 2)
}

///| Check if line is a table separator (|---|---|)
fn is_table_separator(line : String) -> Bool {
  let t = trim(line)
  if not(t.contains("|")) || not(t.contains("-")) {
    return false
  }
  let chars = t.to_array()
  for ch in chars {
    if ch != '|' && ch != '-' && ch != ':' && ch != ' ' {
      return false
    }
  }
  true
}

///| Parse a table row into cells
fn parse_table_row(line : String) -> Array[String] {
  let result : Array[String] = []
  let t = trim(line)
  // Remove leading and trailing |
  let inner = if t.has_prefix("|") && t.has_suffix("|") {
    safe_slice_range(t, 1, t.length() - 1)
  } else if t.has_prefix("|") {
    safe_slice(t, 1)
  } else {
    t
  }
  for part in inner.split("|") {
    result.push(part.to_string())
  }
  result
}

///| Render inline markdown (bold, italic, code, links, images)
fn render_inline(text : String) -> String {
  let chars = text.to_array()
  let len = chars.length()
  let buf = StringBuilder::new()
  let mut i = 0
  while i < len {
    // Image: ![alt](src)
    if i + 1 < len && chars[i] == '!' && chars[i + 1] == '[' {
      let alt_start = i + 2
      let mut alt_end = -1
      let mut j = alt_start
      while j < len {
        if chars[j] == ']' {
          alt_end = j
          break
        }
        j = j + 1
      }
      if alt_end > 0 && alt_end + 1 < len && chars[alt_end + 1] == '(' {
        let url_start = alt_end + 2
        let mut url_end = -1
        j = url_start
        while j < len {
          if chars[j] == ')' {
            url_end = j
            break
          }
          j = j + 1
        }
        if url_end > 0 {
          let alt = safe_slice_range(text, alt_start, alt_end)
          let src = safe_slice_range(text, url_start, url_end)
          buf.write_string("<img src=\"")
          buf.write_string(src)
          buf.write_string("\" alt=\"")
          buf.write_string(alt)
          buf.write_string("\" />")
          i = url_end + 1
          continue
        }
      }
    }
    // Link: [text](url)
    if chars[i] == '[' {
      let text_start = i + 1
      let mut text_end = -1
      let mut j = text_start
      while j < len {
        if chars[j] == ']' {
          text_end = j
          break
        }
        j = j + 1
      }
      if text_end > 0 && text_end + 1 < len && chars[text_end + 1] == '(' {
        let url_start = text_end + 2
        let mut url_end = -1
        j = url_start
        while j < len {
          if chars[j] == ')' {
            url_end = j
            break
          }
          j = j + 1
        }
        if url_end > 0 {
          let link_text = safe_slice_range(text, text_start, text_end)
          let link_url = safe_slice_range(text, url_start, url_end)
          buf.write_string("<a href=\"")
          buf.write_string(link_url)
          buf.write_string("\">")
          buf.write_string(link_text)
          buf.write_string("</a>")
          i = url_end + 1
          continue
        }
      }
    }
    // Inline code: `code`
    if chars[i] == '`' {
      let code_start = i + 1
      let mut code_end = -1
      let mut j = code_start
      while j < len {
        if chars[j] == '`' {
          code_end = j
          break
        }
        j = j + 1
      }
      if code_end > 0 {
        buf.write_string("<code>")
        buf.write_string(escape_html(safe_slice_range(text, code_start, code_end)))
        buf.write_string("</code>")
        i = code_end + 1
        continue
      }
    }
    // Bold: **text**
    if i + 1 < len && chars[i] == '*' && chars[i + 1] == '*' {
      let bold_start = i + 2
      // Find closing **
      let mut bold_end = -1
      let mut j = bold_start
      while j + 1 < len {
        if chars[j] == '*' && chars[j + 1] == '*' {
          bold_end = j
          break
        }
        j = j + 1
      }
      if bold_end > 0 {
        buf.write_string("<strong>")
        buf.write_string(safe_slice_range(text, bold_start, bold_end))
        buf.write_string("</strong>")
        i = bold_end + 2
        continue
      }
    }
    // Italic: *text*
    if chars[i] == '*' {
      let em_start = i + 1
      let mut em_end = -1
      let mut j = em_start
      while j < len {
        if chars[j] == '*' {
          em_end = j
          break
        }
        j = j + 1
      }
      if em_end > 0 {
        buf.write_string("<em>")
        buf.write_string(safe_slice_range(text, em_start, em_end))
        buf.write_string("</em>")
        i = em_end + 1
        continue
      }
    }
    // Regular character
    buf.write_char(chars[i])
    i = i + 1
  }
  buf.to_string()
}

fn build_mermaid_fullscreen(buf : StringBuilder) -> Unit {
  buf.write_string("<div id=\"mermaid-fullscreen\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"fullscreen-content\">")
  buf.write_string("<button class=\"btn\" id=\"mermaid-fullscreen-close\">Close</button>")
  buf.write_string("<div id=\"mermaid-fullscreen-body\"></div>")
  buf.write_string("</div></div>")
}

fn build_image_fullscreen(buf : StringBuilder) -> Unit {
  buf.write_string("<div id=\"image-fullscreen\" class=\"modal-overlay hidden\">")
  buf.write_string("<div class=\"fullscreen-content\">")
  buf.write_string("<button class=\"btn\" id=\"image-fullscreen-close\">Close</button>")
  buf.write_string("<img id=\"image-fullscreen-img\" src=\"\" alt=\"\" />")
  buf.write_string("</div></div>")
}

///| Build HTML page for markdown viewer (cli.cjs-compatible structure)
pub fn build_markdown_html(
  md : MarkdownData,
  filename : String,
  port : Int
) -> String {
  let buf = StringBuilder::new()
  build_page_start(buf, filename)
  // View and comment toolbar buttons
  buf.write_string("<button class=\"btn\" id=\"view-toggle\">View</button>")
  buf.write_string("<button class=\"btn\" id=\"comment-toggle\">Comments</button>")
  // Side-by-side layout: md-left = preview, md-right = source table
  buf.write_string("<div class=\"md-layout\">")
  // Left panel: rendered markdown preview
  buf.write_string("<div class=\"md-left\">")
  buf.write_string("<div class=\"md-preview\" id=\"md-preview\">")
  buf.write_string(md.html)
  buf.write_string("</div></div>")
  // Right panel: source as table (mirrors #csv-table structure for click events)
  buf.write_string("<div class=\"md-right\">")
  buf.write_string("<table id=\"csv-table\"><tbody id=\"tbody\">")
  let source_lines = split_to_lines(md.source)
  for i, line in source_lines {
    buf.write_string("<tr data-row=\"")
    buf.write_string(i.to_string())
    buf.write_string("\"><td data-row=\"")
    buf.write_string(i.to_string())
    buf.write_string("\" data-col=\"1\">")
    buf.write_string(escape_html(line))
    buf.write_string("</td></tr>")
  }
  buf.write_string("</tbody></table>")
  buf.write_string("</div></div>")
  build_mermaid_fullscreen(buf)
  build_image_fullscreen(buf)
  build_comment_card(buf)
  build_submit_modal(buf)
  build_recovery_modal(buf)
  build_script_footer(buf, port, "markdown", filename)
  buf.to_string()
}
