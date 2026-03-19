///| Comment stored in the app
struct AppComment {
  row : Int
  col : Int
  mut text : String
  mut image : String
}

///| Application state
let comments : Map[String, AppComment] = {}

///| Currently active comment card target
let active_key : Ref[String] = Ref::new("")

///| Scroll sync state
let scroll_sync_raf : Ref[Int] = Ref::new(0)
let scroll_sync_disabled_until : Ref[Double] = Ref::new(0.0)
let scroll_active_pane : Ref[String] = Ref::new("")

///| Drag selection state
let is_dragging : Ref[Bool] = Ref::new(false)
let drag_start_row : Ref[Int] = Ref::new(-1)
let drag_end_row : Ref[Int] = Ref::new(-1)

///| Image state for paste attachment
let current_comment_image : Ref[String] = Ref::new("")
let submit_images : Array[String] = []

///| Delegate to core's parse_int_safe
fn str_to_int(s : String) -> Int {
  @core.parse_int_safe(s)
}

///| Truncate string to max length
fn truncate(s : String, max : Int) -> String {
  if s.length() <= max {
    s
  } else {
    let buf = StringBuilder::new()
    let chars = s.to_array()
    for i in 0..<max {
      buf.write_char(chars[i])
    }
    buf.to_string()
  }
}

///| Get localStorage key for comment storage (cli.cjs compatible)
fn get_storage_key() -> String {
  let filename = get_reviw_filename()
  "reviw:comments:\{filename}"
}

///| Initialize the app - called on page load
pub fn init_app() -> Unit {
  let mode = get_reviw_mode()
  let port = get_reviw_port()
  // Restore theme from localStorage
  let saved_theme = local_storage_get("reviw:theme")
  if saved_theme.length() > 0 {
    set_theme(saved_theme)
    toggle_hljs_theme(saved_theme)
  }
  // Setup theme toggle with localStorage persistence
  let theme_btn = query("#theme-toggle")
  if not(is_null(theme_btn)) {
    on(
      theme_btn,
      "click",
      fn(_e) {
        let current = get_theme()
        if current == "dark" {
          set_theme("light")
          toggle_hljs_theme("light")
          local_storage_set("reviw:theme", "light")
        } else {
          set_theme("dark")
          toggle_hljs_theme("dark")
          local_storage_set("reviw:theme", "dark")
        }
      },
    )
  }
  // Setup submit button
  let submit_btn = query("#send-and-exit")
  if not(is_null(submit_btn)) {
    on(submit_btn, "click", fn(_e) { show_submit_modal() })
  }
  // Setup comment card buttons
  let close_btn = query("#close-card")
  if not(is_null(close_btn)) {
    on(close_btn, "click", fn(_e) { hide_comment_card() })
  }
  let clear_btn = query("#clear-comment")
  if not(is_null(clear_btn)) {
    on(clear_btn, "click", fn(_e) {
      let textarea = query("#comment-input")
      if not(is_null(textarea)) {
        set_value(textarea, "")
      }
      save_comment()
    })
  }
  let save_btn = query("#save-comment")
  if not(is_null(save_btn)) {
    on(save_btn, "click", fn(_e) { save_comment() })
  }
  // Copy selection button (cli.cjs compatible)
  let copy_btn = query("#copy-selection")
  if not(is_null(copy_btn)) {
    on(
      copy_btn,
      "click",
      fn(_e) {
        let cell_preview = query("#cell-preview")
        let text = if not(is_null(cell_preview)) {
          get_text_content(cell_preview)
        } else {
          ""
        }
        if text.length() > 0 {
          copy_to_clipboard(text)
          show_toast("Copied!")
        } else {
          show_toast("No content to copy")
        }
      },
    )
  }
  // Setup modal buttons
  let modal_cancel = query("#modal-cancel")
  if not(is_null(modal_cancel)) {
    on(modal_cancel, "click", fn(_e) { hide_submit_modal() })
  }
  let modal_submit = query("#modal-submit")
  if not(is_null(modal_submit)) {
    on(
      modal_submit,
      "click",
      fn(_e) { submit_review(port) },
    )
  }
  // Setup recovery modal buttons
  let recovery_restore = query("#recovery-restore")
  if not(is_null(recovery_restore)) {
    on(recovery_restore, "click", fn(_e) { restore_comments() })
  }
  let recovery_discard = query("#recovery-discard")
  if not(is_null(recovery_discard)) {
    on(recovery_discard, "click", fn(_e) { discard_comments() })
  }
  // Keyboard shortcut: Cmd/Ctrl+Enter context-dependent
  on_doc(
    "keydown",
    fn(e) {
      if event_key(e) == "Enter" && (event_meta_key(e) || event_ctrl_key(e)) {
        prevent_default(e)
        // If comment card is open, save comment
        let card = query("#comment-card")
        if not(is_null(card)) && not(is_element_hidden(card)) {
          save_comment()
          return
        }
        // If submit modal is open, do submit
        let modal = query("#submit-modal")
        if not(is_null(modal)) && has_class(modal, "visible") {
          submit_review(port)
          return
        }
        // Otherwise, open submit modal
        show_submit_modal()
      }
      if event_key(e) == "Escape" {
        hide_comment_card()
        hide_submit_modal()
      }
    },
  )
  // Also support Cmd/Ctrl+Enter from within submit modal textarea
  let global_comment_input = query("#global-comment")
  if not(is_null(global_comment_input)) {
    on(global_comment_input, "keydown", fn(e) {
      if event_key(e) == "Enter" && (event_meta_key(e) || event_ctrl_key(e)) {
        prevent_default(e)
        submit_review(port)
      }
    })
  }
  // Setup view toggle (cli.cjs L7232-7270: preview-only panel state)
  init_view_toggle()
  // Setup pill-comments (comment list toggle)
  let pill_comments = query("#pill-comments")
  if not(is_null(pill_comments)) {
    on(
      pill_comments,
      "click",
      fn(_e) {
        // Build comment list HTML and show in a panel or scrollTo first comment
        let first_commented = query(".has-comment")
        if not(is_null(first_commented)) {
          scroll_into_view(first_commented)
          // Trigger click to open comment card
          click_element(first_commented)
        } else {
          show_toast("No comments yet")
        }
      },
    )
  }
  // Setup click handlers based on mode
  match mode {
    "csv" => {
      setup_csv_clicks()
      init_csv_resizers_and_filters()
    }
    "diff" => setup_diff_clicks()
    "markdown" => setup_csv_clicks()
    _ => setup_text_clicks()
  }
  // Setup scroll sync and preview click for markdown mode
  if mode == "markdown" {
    setup_scroll_sync()
    setup_preview_click()
    setup_preview_mouseup()
    // Initialize heading toggles (collapsible sections)
    init_heading_toggles()
    // Setup fullscreen viewers with pure MoonBit ZoomPanViewer/VideoTimeline
    setup_mermaid_fullscreen_moonbit()
    setup_image_fullscreen_moonbit()
    setup_video_fullscreen_moonbit()
    // Initialize media sidebar (pure MoonBit implementation)
    ignore(
      set_timeout(
        fn() { init_media_sidebar() },
        500,
      ),
    )
  }
  // Setup drag selection handlers
  setup_drag_handlers()
  // Questions overlay, bar, and auto-popup
  setup_questions_ui()
  // Setup history toggle
  let history_btn = query("#history-toggle")
  if not(is_null(history_btn)) {
    on(history_btn, "click", fn(_e) { toggle_history_panel() })
  }
  let history_close = query("#history-panel-close")
  if not(is_null(history_close)) {
    on(history_close, "click", fn(_e) { toggle_history_panel() })
  }
  // Setup paste handler for image attachment
  setup_paste_handler()
  // Check for saved comments and show recovery modal if present
  check_recovery()
  // Setup SSE for live reload
  setup_sse(port)
}

///|
fn setup_csv_clicks() -> Unit {
  let cells = query_all("td[data-row]")
  for cell in cells {
    on(
      cell,
      "click",
      fn(e) {
        if is_dragging.val {
          return
        }
        let target = event_target(e)
        let row_str = get_attr(target, "data-row")
        let col_str = get_attr(target, "data-col")
        let key = "\{row_str}:\{col_str}"
        show_comment_card(target, key, str_to_int(row_str), str_to_int(col_str))
      },
    )
    on(
      cell,
      "mousedown",
      fn(e) {
        let target = event_target(e)
        let row_str = get_attr(target, "data-row")
        if row_str.length() > 0 {
          begin_drag(str_to_int(row_str))
        }
        ignore(e)
      },
    )
  }
}

///|
fn setup_diff_clicks() -> Unit {
  let lines = query_all(".diff-line")
  for line in lines {
    on(
      line,
      "click",
      fn(e) {
        let target = closest(event_target(e), ".diff-line")
        if not(is_null(target)) {
          let file = get_attr(target, "data-file")
          let content = get_text_content(target)
          let key = "\{file}:\{truncate(content, 20)}"
          show_comment_card(target, key, 0, 0)
        }
      },
    )
  }
}

///|
fn setup_text_clicks() -> Unit {
  let lines = query_all(".text-line")
  for line in lines {
    on(
      line,
      "click",
      fn(e) {
        if is_dragging.val {
          return
        }
        let target = closest(event_target(e), ".text-line")
        if not(is_null(target)) {
          let row_str = get_attr(target, "data-row")
          let key = "\{row_str}:0"
          show_comment_card(target, key, str_to_int(row_str), 0)
        }
      },
    )
    on(
      line,
      "mousedown",
      fn(e) {
        let target = closest(event_target(e), ".text-line")
        if not(is_null(target)) {
          let row_str = get_attr(target, "data-row")
          if row_str.length() > 0 {
            begin_drag(str_to_int(row_str))
          }
        }
      },
    )
  }
}

///| Check for saved comments and show recovery modal (with TTL validation)
fn check_recovery() -> Unit {
  let key = get_storage_key()
  let stored = ls_get(key)
  if stored.length() == 0 {
    return
  }
  if is_storage_expired(stored) {
    ls_remove(key)
    return
  }
  let modal = query("#recovery-modal")
  if not(is_null(modal)) {
    remove_class(modal, "hidden")
  }
}

///|
fn restore_comments() -> Unit {
  let key = get_storage_key()
  let stored = ls_get(key)
  if stored.length() > 0 {
    let entries = parse_stored_comments(stored)
    for entry in entries {
      if entry.length() >= 4 {
        let k = entry[0]
        let row = str_to_int(entry[1])
        let col = str_to_int(entry[2])
        let text = entry[3]
        if text.length() > 0 {
          comments.set(k, { row, col, text, image: "" })
        }
      }
    }
    update_comment_indicators()
  }
  hide_recovery_modal()
}

///|
fn discard_comments() -> Unit {
  ls_remove(get_storage_key())
  hide_recovery_modal()
}

///|
fn hide_recovery_modal() -> Unit {
  let modal = query("#recovery-modal")
  if not(is_null(modal)) {
    add_class(modal, "hidden")
  }
}

///|
fn show_comment_card(target : Element, key : String, row : Int, col : Int) -> Unit {
  let card = query("#comment-card")
  let textarea = query("#comment-input")
  if is_null(card) || is_null(textarea) {
    return
  }
  active_key.val = key
  // Update card title and cell preview (cli.cjs compatible)
  let card_title = query("#card-title")
  let cell_preview = query("#cell-preview")
  if not(is_null(card_title)) {
    if col > 0 {
      set_text_content(card_title, "Comment on R\{row} C\{col}")
    } else if row > 0 {
      set_text_content(card_title, "Comment on line \{row}")
    } else {
      set_text_content(card_title, "Cell Comment")
    }
  }
  if not(is_null(cell_preview)) {
    let content = get_text_content(target)
    if content.length() > 0 {
      let preview = if col > 0 {
        "Cell value: " + truncate(content, 80)
      } else {
        truncate(content, 80)
      }
      set_text_content(cell_preview, preview)
    } else {
      set_text_content(cell_preview, "(empty)")
    }
  }
  let top = get_bounding_rect_bottom(target)
  let left = get_bounding_rect_left(target)
  let win_height = window_inner_height()
  let actual_top = if top.to_int() + 200 > win_height {
    get_bounding_rect_top(target).to_int() - 200
  } else {
    top.to_int()
  }
  set_style(card, "top", "\{actual_top}px")
  set_style(card, "left", "\{left.to_int()}px")
  set_style(card, "display", "block")
  match comments.get(key) {
    Some(comment) => {
      set_value(textarea, comment.text)
      current_comment_image.val = comment.image
    }
    None => {
      set_value(textarea, "")
      current_comment_image.val = ""
      comments.set(key, { row, col, text: "", image: "" })
    }
  }
  render_comment_image_preview()
  focus_element(textarea)
}

///|
fn hide_comment_card() -> Unit {
  let card = query("#comment-card")
  if not(is_null(card)) {
    set_style(card, "display", "none")
  }
  active_key.val = ""
}

///|
fn save_comment() -> Unit {
  let textarea = query("#comment-input")
  if is_null(textarea) {
    return
  }
  let text = get_value(textarea)
  let key = active_key.val
  if key.length() > 0 {
    match comments.get(key) {
      Some(comment) => {
        comment.text = text
        comment.image = current_comment_image.val
      }
      None => ()
    }
    if text.length() == 0 && current_comment_image.val.length() == 0 {
      ignore(comments.remove(key))
    }
  }
  current_comment_image.val = ""
  hide_comment_card()
  update_comment_indicators()
  persist_comments()
}

///|
fn update_comment_indicators() -> Unit {
  let all_commented = query_all(".has-comment")
  for el in all_commented {
    remove_class(el, "has-comment")
  }
  let mut count = 0
  comments.each(
    fn(_key, comment) {
      if comment.text.length() > 0 {
        count = count + 1
        let selector = "[data-row=\"\{comment.row}\"][data-col=\"\{comment.col}\"]"
        let el = query(selector)
        if not(is_null(el)) {
          add_class(el, "has-comment")
        }
      }
    },
  )
  // Update comment count badge
  let count_el = query("#comment-count")
  if not(is_null(count_el)) {
    set_text_content(count_el, count.to_string())
  }
}

///|
fn show_submit_modal() -> Unit {
  let modal = query("#submit-modal")
  let list = query("#modal-summary")
  if is_null(modal) || is_null(list) {
    return
  }
  let buf = StringBuilder::new()
  comments.each(
    fn(key, comment) {
      if comment.text.length() > 0 {
        buf.write_string("<li><span class=\"location\">")
        buf.write_string(@core.escape_html(key))
        buf.write_string("</span>: ")
        buf.write_string(@core.escape_html(comment.text))
        buf.write_string("</li>")
      }
    },
  )
  let html = buf.to_string()
  if html.length() == 0 {
    set_inner_html(list, "<li style=\"color:var(--text-dim)\">No comments yet</li>")
  } else {
    set_inner_html(list, html)
  }
  // Show mermaid errors if any
  // Show mermaid errors if any
  let mermaid_error_area = query("#mermaid-error-area")
  let mermaid_error_list = query("#mermaid-error-list")
  let err_count = get_mermaid_error_count()
  if err_count > 0 && not(is_null(mermaid_error_area)) && not(is_null(mermaid_error_list)) {
    let err_buf = StringBuilder::new()
    for i = 0; i < err_count; i = i + 1 {
      let line = get_mermaid_error_line(i)
      let msg = get_mermaid_error_message(i)
      err_buf.write_string("<li><strong>Line ")
      err_buf.write_string(line.to_string())
      err_buf.write_string(":</strong> ")
      err_buf.write_string(@core.escape_html(msg))
      err_buf.write_string("</li>")
    }
    set_inner_html(mermaid_error_list, err_buf.to_string())
    set_style(mermaid_error_area, "display", "block")
    log_mermaid_errors_to_console()
  } else if not(is_null(mermaid_error_area)) {
    set_style(mermaid_error_area, "display", "none")
  }
  add_class(modal, "visible")
  let summary = query("#global-comment")
  if not(is_null(summary)) {
    focus_element(summary)
  }
}

///|
fn hide_submit_modal() -> Unit {
  let modal = query("#submit-modal")
  if not(is_null(modal)) {
    remove_class(modal, "visible")
  }
}

///|
fn submit_review(port : Int) -> Unit {
  let summary_el = query("#global-comment")
  let summary = if is_null(summary_el) { "" } else { get_value(summary_el) }
  let buf = StringBuilder::new()
  buf.write_string("{\"summary\":")
  buf.write_string(json_encode_string(summary))
  buf.write_string(",\"comments\":[")
  let first = Ref::new(true)
  comments.each(
    fn(_key, comment) {
      if comment.text.length() > 0 {
        if not(first.val) {
          buf.write_char(',')
        }
        buf.write_string("{\"row\":")
        buf.write_string(comment.row.to_string())
        buf.write_string(",\"col\":")
        buf.write_string(comment.col.to_string())
        buf.write_string(",\"text\":")
        buf.write_string(json_encode_string(comment.text))
        if comment.image.length() > 0 {
          buf.write_string(",\"image\":")
          buf.write_string(json_encode_string(comment.image))
        }
        buf.write_char('}')
        first.val = false
      }
    },
  )
  buf.write_string("],\"summaryImages\":[")
  for i, img in submit_images {
    if i > 0 {
      buf.write_char(',')
    }
    buf.write_string(json_encode_string(img))
  }
  buf.write_string("],\"reviwAnswers\":")
  let answers_json = collect_reviw_answers()
  if answers_json.length() > 2 {
    buf.write_string(answers_json)
  } else {
    buf.write_string("{}")
  }
  // Include mermaid errors
  let merr_count = get_mermaid_error_count()
  if merr_count > 0 {
    buf.write_string(",\"mermaidErrors\":[")
    for i = 0; i < merr_count; i = i + 1 {
      if i > 0 {
        buf.write_char(',')
      }
      buf.write_string("{\"line\":")
      buf.write_string(get_mermaid_error_line(i).to_string())
      buf.write_string(",\"message\":")
      buf.write_string(json_encode_string(get_mermaid_error_message(i)))
      buf.write_char('}')
    }
    buf.write_string("]")
  }
  buf.write_string("}")
  let url = "http://127.0.0.1:\{port}/exit"
  fetch_post(
    url,
    buf.to_string(),
    fn(_response) {
      ls_remove(get_storage_key())
      window_close()
    },
  )
}

///|
fn json_encode_string(s : String) -> String {
  "\"" + @core.escape_js_string(s) + "\""
}

///| Panel state toggle — cli.cjs L7232-7270 initPanelState
fn init_view_toggle() -> Unit {
  let view_toggle = query("#view-toggle")
  let md_layout = query(".md-layout")
  if is_null(view_toggle) || is_null(md_layout) {
    return
  }
  // Load saved state
  let saved = local_storage_get("reviw-panel-state")
  if saved == "preview-only" {
    add_class(md_layout, "preview-only")
    set_text_content(view_toggle, "\u{1F441}")
    set_attribute(view_toggle, "title", "Show source panel")
    add_class(view_toggle, "active")
  }
  // Narrow viewport auto-hide
  init_view_toggle_narrow(view_toggle)
  on_window("resize", fn(_e) { init_view_toggle_narrow(view_toggle) })
  // Click handler
  on(
    view_toggle,
    "click",
    fn(_e) {
      let is_now_preview_only = not(has_class(md_layout, "preview-only"))
      if is_now_preview_only {
        add_class(md_layout, "preview-only")
        set_text_content(view_toggle, "\u{1F441}")
        set_attribute(view_toggle, "title", "Show source panel")
        add_class(view_toggle, "active")
      } else {
        remove_class(md_layout, "preview-only")
        set_text_content(view_toggle, "\u{1F4DD}")
        set_attribute(view_toggle, "title", "Hide source panel")
        remove_class(view_toggle, "active")
      }
      local_storage_set(
        "reviw-panel-state",
        if is_now_preview_only { "preview-only" } else { "both" },
      )
    },
  )
}

///| Hide view toggle on narrow viewports
fn init_view_toggle_narrow(view_toggle : Element) -> Unit {
  if window_inner_width() <= 960 {
    set_style(view_toggle, "display", "none")
  } else {
    set_style(view_toggle, "display", "")
  }
}

///|
fn setup_sse(port : Int) -> Unit {
  let url = "http://127.0.0.1:\{port}/sse"
  let es = new_event_source(url)
  sse_on(es, "reload", fn(_e) { location_reload() })
}

///| Save comments to localStorage in cli.cjs-compatible { comments, timestamp } format
fn persist_comments() -> Unit {
  let key = get_storage_key()
  let buf = StringBuilder::new()
  buf.write_string("{\"comments\":{")
  let first = Ref::new(true)
  comments.each(
    fn(k, comment) {
      if not(first.val) {
        buf.write_char(',')
      }
      buf.write_string(json_encode_string(k))
      buf.write_string(":{\"row\":")
      buf.write_string(comment.row.to_string())
      buf.write_string(",\"col\":")
      buf.write_string(comment.col.to_string())
      buf.write_string(",\"text\":")
      buf.write_string(json_encode_string(comment.text))
      buf.write_char('}')
      first.val = false
    },
  )
  buf.write_string("},\"timestamp\":")
  buf.write_string(date_now_string())
  buf.write_char('}')
  ls_set(key, buf.to_string())
}

///| Toggle history panel
fn toggle_history_panel() -> Unit {
  let panel = query("#history-panel")
  if is_null(panel) {
    return
  }
  let body = query("body")
  let is_open = get_attr(panel, "class").contains("open")
  if is_open {
    remove_class(panel, "open")
    if not(is_null(body)) {
      remove_class(body, "history-open")
    }
  } else {
    add_class(panel, "open")
    if not(is_null(body)) {
      add_class(body, "history-open")
    }
    load_history_data()
  }
}

///| Load history data from server
fn load_history_data() -> Unit {
  let port = get_reviw_port()
  let url = "http://127.0.0.1:\{port}/history"
  fetch_get(
    url,
    fn(data) {
      let panel_body = query("#history-panel-body")
      if not(is_null(panel_body)) {
        if data.length() <= 2 {
          set_inner_html(
            panel_body,
            "<div style=\"color:var(--text-dim);padding:16px;text-align:center\">No history yet</div>",
          )
        } else {
          let buf = StringBuilder::new()
          buf.write_string("<ul class=\"history-entries\" style=\"list-style:none;padding:0;margin:0\">")
          buf.write_string(render_history_entries(data))
          buf.write_string("</ul>")
          set_inner_html(panel_body, buf.to_string())
        }
      }
    },
  )
}

///| Render history entries from JSON array to HTML list items
fn render_history_entries(json : String) -> String {
  let buf = StringBuilder::new()
  let entries = split_json_array(json)
  for entry in entries {
    let ts = json_extract_field(entry, "timestamp")
    let file = json_extract_field(entry, "file")
    let summary = json_extract_field(entry, "summary")
    let count = json_extract_field(entry, "commentCount")
    buf.write_string("<li class=\"history-entry\" style=\"padding:12px 16px;border-bottom:1px solid var(--border)\">")
    buf.write_string("<div style=\"font-size:12px;color:var(--text-dim)\">")
    buf.write_string(@core.escape_html(ts))
    buf.write_string("</div>")
    buf.write_string("<div style=\"font-weight:600;margin:4px 0\">")
    buf.write_string(@core.escape_html(file))
    buf.write_string("</div>")
    if summary.length() > 0 {
      buf.write_string("<div style=\"font-size:13px;color:var(--text-dim)\">")
      buf.write_string(@core.escape_html(summary))
      buf.write_string("</div>")
    }
    if count.length() > 0 {
      buf.write_string("<div style=\"font-size:12px;color:var(--accent)\">")
      buf.write_string(@core.escape_html(count))
      buf.write_string(" comments</div>")
    }
    buf.write_string("</li>")
  }
  buf.to_string()
}

///| Split a JSON array string into individual object strings
fn split_json_array(json : String) -> Array[String] {
  let result : Array[String] = []
  let chars = json.to_array()
  let len = chars.length()
  let mut depth = 0
  let mut start = -1
  let mut in_string = false
  let mut i = 0
  while i < len {
    let ch = chars[i]
    if in_string {
      if ch == '\\' {
        i = i + 2 // skip escaped char
        continue
      }
      if ch == '"' {
        in_string = false
      }
      i = i + 1
      continue
    }
    match ch {
      '"' => in_string = true
      '{' => {
        if depth == 0 {
          start = i
        }
        depth = depth + 1
      }
      '}' => {
        depth = depth - 1
        if depth == 0 && start >= 0 {
          result.push(@core.safe_slice_range(json, start, i + 1))
          start = -1
        }
      }
      _ => ()
    }
    i = i + 1
  }
  result
}

///| Extract a field value from a JSON object string
fn json_extract_field(json : String, field : String) -> String {
  let key = "\"" + field + "\""
  let chars = json.to_array()
  let len = chars.length()
  let key_chars = key.to_array()
  let key_len = key_chars.length()
  let mut i = 0
  while i + key_len < len {
    let mut match_ = true
    for k = 0; k < key_len; k = k + 1 {
      if chars[i + k] != key_chars[k] {
        match_ = false
        break
      }
    }
    if match_ {
      let mut j = i + key_len
      while j < len && (chars[j] == ':' || chars[j] == ' ') {
        j = j + 1
      }
      if j < len {
        if chars[j] == '"' {
          let val_start = j + 1
          let mut val_end = val_start
          while val_end < len && chars[val_end] != '"' {
            if chars[val_end] == '\\' {
              val_end = val_end + 1
            }
            val_end = val_end + 1
          }
          return @core.safe_slice_range(json, val_start, val_end)
        } else {
          let val_start = j
          let mut val_end = j
          while val_end < len && chars[val_end] != ',' && chars[val_end] != '}' {
            val_end = val_end + 1
          }
          return @core.safe_slice_range(json, val_start, val_end)
        }
      }
    }
    i = i + 1
  }
  ""
}

///| Setup paste handler for image attachment
fn setup_paste_handler() -> Unit {
  on_paste_image(
    fn(base64) {
      let submit_modal = query("#submit-modal")
      let comment_card = query("#comment-card")
      let submit_visible = not(is_null(submit_modal)) &&
        (get_attr(submit_modal, "class").contains("visible") ||
         get_computed_style(submit_modal, "display") != "none")
      let comment_visible = not(is_null(comment_card)) &&
        (get_attr(comment_card, "class").contains("visible") ||
         get_computed_style(comment_card, "display") != "none")
      if submit_visible {
        if submit_images.length() < 5 {
          submit_images.push(base64)
          render_submit_image_preview()
        }
      } else if comment_visible {
        if current_comment_image.val.length() == 0 {
          current_comment_image.val = base64
          render_comment_image_preview()
        }
      }
    },
  )
}

///| Render submit image preview
fn render_submit_image_preview() -> Unit {
  let container = query("#submit-image-preview")
  if is_null(container) {
    return
  }
  let buf = StringBuilder::new()
  for i, img in submit_images {
    buf.write_string(
      "<div class=\"image-preview-item\" style=\"position:relative;display:inline-block;margin:4px\"><img src=\"",
    )
    buf.write_string(img)
    buf.write_string(
      "\" alt=\"attached\" style=\"max-width:60px;max-height:60px;border-radius:4px\"><button class=\"remove-image\" data-idx=\"",
    )
    buf.write_string(i.to_string())
    buf.write_string(
      "\" style=\"position:absolute;top:-4px;right:-4px;background:var(--accent);color:#fff;border:none;border-radius:50%;width:16px;height:16px;cursor:pointer;font-size:10px;line-height:16px;text-align:center\">\u{00D7}</button></div>",
    )
  }
  set_inner_html(container, buf.to_string())
  let remove_btns = query_all(".remove-image")
  for btn in remove_btns {
    on(
      btn,
      "click",
      fn(e) {
        let target = event_target(e)
        let idx_str = get_attr(target, "data-idx")
        let idx = str_to_int(idx_str)
        if idx >= 0 && idx < submit_images.length() {
          ignore(submit_images.remove(idx))
          render_submit_image_preview()
        }
      },
    )
  }
}

///| Render comment image preview
fn render_comment_image_preview() -> Unit {
  let container = query("#comment-image-preview")
  if is_null(container) {
    return
  }
  if current_comment_image.val.length() == 0 {
    set_inner_html(container, "")
    return
  }
  let buf = StringBuilder::new()
  buf.write_string(
    "<div class=\"image-preview-item\" style=\"position:relative;display:inline-block;margin:4px\"><img src=\"",
  )
  buf.write_string(current_comment_image.val)
  buf.write_string(
    "\" alt=\"attached\" style=\"max-width:60px;max-height:60px;border-radius:4px\"><button id=\"remove-comment-image\" style=\"position:absolute;top:-4px;right:-4px;background:var(--accent);color:#fff;border:none;border-radius:50%;width:16px;height:16px;cursor:pointer;font-size:10px;line-height:16px;text-align:center\">\u{00D7}</button></div>",
  )
  set_inner_html(container, buf.to_string())
  let remove_btn = query("#remove-comment-image")
  if not(is_null(remove_btn)) {
    on(
      remove_btn,
      "click",
      fn(_e) {
        current_comment_image.val = ""
        render_comment_image_preview()
      },
    )
  }
}

///| Scroll sync for markdown split view
fn setup_scroll_sync() -> Unit {
  let md_left = query(".md-left")
  let md_right = query(".md-right")
  if is_null(md_left) || is_null(md_right) {
    return
  }
  on(md_left, "scroll", fn(_e) { sync_scroll(md_left, md_right, "left") })
  on(md_right, "scroll", fn(_e) { sync_scroll(md_right, md_left, "right") })
}

///| Heading anchor for scroll sync
struct HeadingAnchor {
  line : Int // 0-indexed source line
  preview_el : Element
}

///| Build heading anchors map for scroll sync
fn build_heading_anchors() -> Array[HeadingAnchor] {
  let anchors : Array[HeadingAnchor] = []
  let preview = query("#md-preview")
  if is_null(preview) {
    return anchors
  }
  let headings = query_all_in(preview, "h1, h2, h3, h4, h5, h6")
  let data = js_get_data()
  for h in headings {
    let text = normalize_text(get_text_content(h))
    let stripped = strip_markdown(text)
    for i, row in data {
      if row.length() > 0 {
        let src = row[0]
        if src.has_prefix("#") {
          let src_stripped = strip_markdown(src)
          if src_stripped == stripped {
            anchors.push({ line: i, preview_el: h })
            break
          }
        }
      }
    }
  }
  anchors
}

///| Cached heading anchors
let heading_anchors_cache : Array[HeadingAnchor] = []
let heading_anchors_built : Ref[Bool] = Ref::new(false)

///| Get or build heading anchors
fn get_heading_anchors() -> Array[HeadingAnchor] {
  if not(heading_anchors_built.val) {
    let anchors = build_heading_anchors()
    for a in anchors {
      heading_anchors_cache.push(a)
    }
    heading_anchors_built.val = true
  }
  heading_anchors_cache
}

///|
fn sync_scroll(source : Element, target : Element, source_name : String) -> Unit {
  if date_now() < scroll_sync_disabled_until.val {
    return
  }
  if scroll_active_pane.val.length() > 0 && scroll_active_pane.val != source_name {
    return
  }
  scroll_active_pane.val = source_name
  if scroll_sync_raf.val != 0 {
    cancel_animation_frame(scroll_sync_raf.val)
  }
  scroll_sync_raf.val = request_animation_frame(fn() {
    if date_now() < scroll_sync_disabled_until.val {
      return
    }
    let source_max = get_scroll_height(source) - get_client_height(source)
    let target_max = get_scroll_height(target) - get_client_height(target)
    if source_max <= 0.0 || target_max <= 0.0 {
      return
    }
    // Edge snap: top
    if get_scroll_top(source) <= 1.0 {
      set_scroll_top(target, 0.0)
      ignore(set_timeout(fn() { scroll_active_pane.val = "" }, 100))
      return
    }
    // Edge snap: bottom
    if get_scroll_top(source) >= source_max - 1.0 {
      set_scroll_top(target, target_max)
      ignore(set_timeout(fn() { scroll_active_pane.val = "" }, 100))
      return
    }
    // Heading-based sync: find closest heading anchor to viewport midpoint
    let anchors = get_heading_anchors()
    if anchors.length() >= 2 {
      let source_scroll = get_scroll_top(source)
      let source_height = get_client_height(source)
      let source_mid = source_scroll + source_height / 2.0
      // Find closest anchor in source
      let mut best_idx = 0
      let mut best_dist = 99999999.0
      for i, anchor in anchors {
        // Get position of this anchor in the source pane
        let src_pos = if source_name == "left" {
          // Source is preview (md-left), find preview element position
          get_offset_top(anchor.preview_el)
        } else {
          // Source is source table (md-right), find source row position
          let cell = query("td[data-row=\"\{anchor.line}\"][data-col=\"1\"]")
          if not(is_null(cell)) { get_offset_top(cell) } else { 0.0 }
        }
        let dist = (src_pos - source_mid).abs()
        if dist < best_dist {
          best_dist = dist
          best_idx = i
        }
      }
      // Get corresponding position in target
      let anchor = anchors[best_idx]
      let src_anchor_pos = if source_name == "left" {
        get_offset_top(anchor.preview_el)
      } else {
        let cell = query("td[data-row=\"\{anchor.line}\"][data-col=\"1\"]")
        if not(is_null(cell)) { get_offset_top(cell) } else { 0.0 }
      }
      let tgt_anchor_pos = if source_name == "left" {
        let cell = query("td[data-row=\"\{anchor.line}\"][data-col=\"1\"]")
        if not(is_null(cell)) { get_offset_top(cell) } else { 0.0 }
      } else {
        get_offset_top(anchor.preview_el)
      }
      let offset_in_source = source_scroll - src_anchor_pos
      let ratio_in_section = if source_max > 0.0 { offset_in_source / source_height } else { 0.0 }
      let target_scroll = tgt_anchor_pos + ratio_in_section * get_client_height(target)
      let clamped = if target_scroll < 0.0 { 0.0 } else if target_scroll > target_max { target_max } else { target_scroll }
      set_scroll_top(target, clamped)
      ignore(set_timeout(fn() { scroll_active_pane.val = "" }, 100))
      return
    }
    // Fallback: Ratio-based sync
    let ratio = get_scroll_top(source) / source_max
    set_scroll_top(target, ratio * target_max)
    ignore(set_timeout(fn() { scroll_active_pane.val = "" }, 100))
  })
}

///| Drag selection: begin
fn begin_drag(row : Int) -> Unit {
  is_dragging.val = true
  add_class_body("dragging")
  drag_start_row.val = row
  drag_end_row.val = row
  update_selection_highlight()
}

///| Drag selection: update during mouse move
fn update_drag(row : Int) -> Unit {
  if not(is_dragging.val) {
    return
  }
  if row == drag_end_row.val {
    return
  }
  drag_end_row.val = row
  update_selection_highlight()
}

///| Drag selection: finish and open comment card
fn finish_drag() -> Unit {
  if not(is_dragging.val) {
    return
  }
  is_dragging.val = false
  remove_class_body("dragging")
  let start = if drag_start_row.val < drag_end_row.val {
    drag_start_row.val
  } else {
    drag_end_row.val
  }
  let end = if drag_start_row.val > drag_end_row.val {
    drag_start_row.val
  } else {
    drag_end_row.val
  }
  let key = if start == end {
    start.to_string() + ":0"
  } else {
    start.to_string() + "-" + end.to_string()
  }
  let target_el = query("[data-row=\"" + start.to_string() + "\"]")
  if not(is_null(target_el)) {
    show_comment_card(target_el, key, start, 0)
  }
}

///| Update visual highlight for selected rows
fn update_selection_highlight() -> Unit {
  let old_selected = query_all(".selected")
  for el in old_selected {
    remove_class(el, "selected")
  }
  if not(is_dragging.val) {
    return
  }
  let start = if drag_start_row.val < drag_end_row.val {
    drag_start_row.val
  } else {
    drag_end_row.val
  }
  let end = if drag_start_row.val > drag_end_row.val {
    drag_start_row.val
  } else {
    drag_end_row.val
  }
  for r = start; r <= end; r = r + 1 {
    let el = query("[data-row=\"" + r.to_string() + "\"]")
    if not(is_null(el)) {
      add_class(el, "selected")
    }
  }
}

///| Setup global mouse handlers for drag selection
fn setup_drag_handlers() -> Unit {
  on_window(
    "mousemove",
    fn(e) {
      if not(is_dragging.val) {
        return
      }
      let x = get_event_client_x(e)
      let y = get_event_client_y(e)
      let el = element_from_point(x, y)
      if not(is_null(el)) {
        let row_el = closest(el, "[data-row]")
        if not(is_null(row_el)) {
          let row_str = get_attr(row_el, "data-row")
          update_drag(str_to_int(row_str))
        }
      }
    },
  )
  on_window(
    "mouseup",
    fn(_e) {
      if is_dragging.val {
        finish_drag()
      }
    },
  )
}

///| Setup video timeline for a video element
fn setup_video_timeline(video_path : String) -> Unit {
  let container = query("#video-timeline")
  if is_null(container) {
    return
  }
  let port = get_reviw_port()
  let url = "http://127.0.0.1:\{port}/video-timeline?path=" + video_path
  let es = new_event_source_url(url)
  sse_on_message(es, fn(data) {
    if data.contains("\"type\":\"thumbnail\"") {
      // Extract data URL from JSON
      let marker = "\"data\":\""
      let data_start = find_substring(data, marker)
      if data_start >= 0 {
        let value_start = data_start + marker.length()
        let value_end = find_char_from(data, '"', value_start)
        if value_end > value_start {
          let src = @core.safe_slice_range(data, value_start, value_end)
          let time_marker = "\"time\":"
          let time_start = find_substring(data, time_marker)
          let time_str = if time_start >= 0 {
            let ts = time_start + time_marker.length()
            let te = find_char_from(data, ',', ts)
            if te > ts { @core.safe_slice_range(data, ts, te) } else { "0" }
          } else {
            "0"
          }
          create_timeline_thumb(container, src, time_str)
        }
      }
    }
    if data.contains("\"type\":\"complete\"") {
      sse_close(es)
    }
  })
}

///| Find substring index in string, returns -1 if not found
fn find_substring(haystack : String, needle : String) -> Int {
  let h = haystack.to_array()
  let n = needle.to_array()
  let hlen = h.length()
  let nlen = n.length()
  if nlen == 0 || nlen > hlen {
    return -1
  }
  for i in 0..=(hlen - nlen) {
    let mut match_ = true
    for j in 0..<nlen {
      if h[i + j] != n[j] {
        match_ = false
        break
      }
    }
    if match_ {
      return i
    }
  }
  -1
}

///| Find char from a given start position, returns -1 if not found
fn find_char_from(s : String, target : Char, start : Int) -> Int {
  let chars = s.to_array()
  for i in start..<chars.length() {
    if chars[i] == target {
      return i
    }
  }
  -1
}

// ===== Preview-to-source line mapping (cli.cjs compatible) =====

///| Normalize text for comparison: collapse whitespace, trim
fn normalize_text(s : String) -> String {
  let chars = s.to_array()
  let buf = StringBuilder::new()
  let mut prev_space = true
  for ch in chars {
    if ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' {
      if not(prev_space) {
        buf.write_char(' ')
        prev_space = true
      }
    } else {
      buf.write_char(ch)
      prev_space = false
    }
  }
  let result = buf.to_string()
  // Trim trailing space
  let rchars = result.to_array()
  if rchars.length() > 0 && rchars[rchars.length() - 1] == ' ' {
    @core.safe_slice_range(result, 0, rchars.length() - 1)
  } else {
    result
  }
}

///| Strip markdown formatting from text for comparison
fn strip_markdown(s : String) -> String {
  let chars = s.to_array()
  let buf = StringBuilder::new()
  let len = chars.length()
  let mut i = 0
  while i < len {
    // Skip leading # for headings
    if i == 0 && chars[i] == '#' {
      while i < len && chars[i] == '#' {
        i = i + 1
      }
      if i < len && chars[i] == ' ' {
        i = i + 1
      }
      continue
    }
    // Skip ** (bold)
    if i + 1 < len && chars[i] == '*' && chars[i + 1] == '*' {
      i = i + 2
      continue
    }
    // Skip * (italic) — only if not **
    if chars[i] == '*' {
      i = i + 1
      continue
    }
    // Skip ` (inline code)
    if chars[i] == '`' {
      i = i + 1
      continue
    }
    // Skip toggle icons
    if chars[i] == '\u{25BC}' || chars[i] == '\u{25B6}' || chars[i] == '\u{25C0}' ||
       chars[i] == '\u{25BA}' || chars[i] == '\u{25C6}' || chars[i] == '\u{25C7}' {
      i = i + 1
      continue
    }
    buf.write_char(chars[i])
    i = i + 1
  }
  normalize_text(buf.to_string())
}

///| Find closest heading above the given element in the preview DOM
fn find_closest_heading_above(el : Element) -> Element {
  // Walk up and back through siblings to find nearest heading
  let mut current = el
  while not(is_null(current)) {
    let tag = get_tag_name(current)
    if tag == "H1" || tag == "H2" || tag == "H3" || tag == "H4" || tag == "H5" || tag == "H6" {
      return current
    }
    // Check previous siblings
    let mut sib = previous_element_sibling(current)
    while not(is_null(sib)) {
      let sib_tag = get_tag_name(sib)
      if sib_tag == "H1" || sib_tag == "H2" || sib_tag == "H3" || sib_tag == "H4" || sib_tag == "H5" || sib_tag == "H6" {
        return sib
      }
      sib = previous_element_sibling(sib)
    }
    current = parent_element(current)
  }
  // Return null element (is_null will be true)
  current
}

///| Get the source line number for a heading element (0-indexed, returns -1 if not found)
fn get_heading_source_line(heading_el : Element) -> Int {
  if is_null(heading_el) {
    return -1
  }
  let text = normalize_text(get_text_content(heading_el))
  // Strip toggle icon characters
  let cleaned = strip_markdown(text)
  let data = js_get_data()
  for i, row in data {
    if row.length() > 0 {
      let src_line = row[0]
      // Check if source line is a heading
      if src_line.has_prefix("#") {
        let stripped_src = strip_markdown(src_line)
        if stripped_src == cleaned {
          return i
        }
      }
    }
  }
  -1
}

///| Find source line matching text, starting from start_from (1-indexed result, -1 if not found)
fn find_source_line(text : String, _element : Element, start_from : Int) -> Int {
  let data = js_get_data()
  let search_text = normalize_text(text)
  if search_text.length() == 0 {
    return -1
  }
  let stripped_search = strip_markdown(search_text)
  // First pass: search from start_from onwards
  let start = if start_from >= 0 { start_from } else { 0 }
  for i = start; i < data.length(); i = i + 1 {
    if data[i].length() > 0 {
      let src = strip_markdown(data[i][0])
      if src == stripped_search || src.contains(stripped_search) || stripped_search.contains(src) {
        return i + 1 // 1-indexed
      }
    }
  }
  // Second pass: search from beginning
  if start > 0 {
    for i = 0; i < start; i = i + 1 {
      if data[i].length() > 0 {
        let src = strip_markdown(data[i][0])
        if src == stripped_search || src.contains(stripped_search) || stripped_search.contains(src) {
          return i + 1
        }
      }
    }
  }
  -1
}

///| Find source line for table cell
fn find_table_source_line(text : String, start_from : Int) -> Int {
  let data = js_get_data()
  let search = normalize_text(text)
  if search.length() == 0 {
    return -1
  }
  let start = if start_from >= 0 { start_from } else { 0 }
  // Search for table row containing this text
  for i = start; i < data.length(); i = i + 1 {
    if data[i].length() > 0 {
      let src = data[i][0]
      if src.contains("|") && src.contains(search) {
        return i + 1
      }
    }
  }
  // Fallback: search from beginning
  if start > 0 {
    for i = 0; i < start; i = i + 1 {
      if data[i].length() > 0 {
        let src = data[i][0]
        if src.contains("|") && src.contains(search) {
          return i + 1
        }
      }
    }
  }
  find_source_line(text, query("body"), start_from)
}

///| Find code block range in source (returns (start_line_1indexed, end_line_1indexed))
fn find_code_block_range(code_text : String) -> (Int, Int) {
  let data = js_get_data()
  let search = normalize_text(code_text)
  let mut i = 0
  while i < data.length() {
    if data[i].length() > 0 && data[i][0].has_prefix("\u{0060}\u{0060}\u{0060}") {
      let block_start = i
      i = i + 1
      // Collect code block content
      let code_buf = StringBuilder::new()
      while i < data.length() {
        if data[i].length() > 0 && data[i][0].has_prefix("\u{0060}\u{0060}\u{0060}") {
          break
        }
        if code_buf.to_string().length() > 0 {
          code_buf.write_string("\n")
        }
        if data[i].length() > 0 {
          code_buf.write_string(data[i][0])
        }
        i = i + 1
      }
      let block_end = i
      let block_text = normalize_text(code_buf.to_string())
      if block_text.contains(search) || search.contains(block_text) {
        return (block_start + 1, block_end + 1) // 1-indexed
      }
      i = i + 1
      continue
    }
    i = i + 1
  }
  (-1, -1)
}

///| Find image source line by src attribute
fn find_image_source_line(src : String, start_from : Int) -> Int {
  let data = js_get_data()
  // Extract filename from src
  let filename = extract_filename(src)
  let start = if start_from >= 0 { start_from } else { 0 }
  // Search from start_from
  for i = start; i < data.length(); i = i + 1 {
    if data[i].length() > 0 {
      let line = data[i][0]
      if line.contains(filename) || line.contains(src) {
        return i + 1
      }
    }
  }
  // Search from beginning
  if start > 0 {
    for i = 0; i < start; i = i + 1 {
      if data[i].length() > 0 {
        let line = data[i][0]
        if line.contains(filename) || line.contains(src) {
          return i + 1
        }
      }
    }
  }
  -1
}

///| Extract filename from path/URL
fn extract_filename(path : String) -> String {
  let chars = path.to_array()
  let mut last_slash = -1
  for i, ch in chars {
    if ch == '/' || ch == '\\' {
      last_slash = i
    }
  }
  if last_slash >= 0 {
    @core.safe_slice(path, last_slash + 1)
  } else {
    path
  }
}

///| Select source range and open comment card (mirrors cli.cjs selectSourceRange)
fn select_source_range(start_row : Int, end_row : Int, preview_el : Element, col~ : Int = 0) -> Unit {
  // Disable scroll sync for 2 seconds
  scroll_sync_disabled_until.val = date_now() + 2000.0
  // Cancel pending RAF
  if scroll_sync_raf.val != 0 {
    cancel_animation_frame(scroll_sync_raf.val)
    scroll_sync_raf.val = 0
  }
  // Update visual selection on source table
  let actual_end = if end_row > 0 { end_row } else { start_row }
  let old_selected = query_all(".selected")
  for el in old_selected {
    remove_class(el, "selected")
  }
  // Remove old preview highlight
  let old_highlights = query_all(".preview-highlight")
  for el in old_highlights {
    remove_class(el, "preview-highlight")
  }
  // Add preview highlight to clicked element
  if not(is_null(preview_el)) {
    add_class(preview_el, "preview-highlight")
  }
  // Highlight source rows
  for r = start_row; r <= actual_end; r = r + 1 {
    let row_idx = r - 1 // Convert 1-indexed to 0-indexed data-row
    let cell = query("td[data-row=\"\{row_idx}\"][data-col=\"1\"]")
    if not(is_null(cell)) {
      add_class(cell, "selected")
    }
  }
  // Scroll source pane to target row
  let md_right = query(".md-right")
  if not(is_null(md_right)) {
    let target_row = start_row - 1
    let target_cell = query("td[data-row=\"\{target_row}\"][data-col=\"1\"]")
    if not(is_null(target_cell)) {
      let cell_top = get_offset_top(target_cell)
      let container_height = get_client_height(md_right)
      let scroll_target = cell_top - container_height / 2.0
      scroll_to_instant(md_right, if scroll_target > 0.0 { scroll_target } else { 0.0 })
    }
  }
  // Open comment card
  let key = if start_row == actual_end {
    (start_row - 1).to_string() + ":" + col.to_string()
  } else {
    (start_row - 1).to_string() + "-" + (actual_end - 1).to_string()
  }
  // Position card: check if source is hidden (preview-only mode)
  let is_source_hidden = not(is_null(md_right)) && is_element_hidden(md_right)
  if is_source_hidden && not(is_null(preview_el)) {
    // Preview-only mode: position card below clicked element
    show_comment_card_below(preview_el, key, start_row - 1, col)
  } else {
    let target = if not(is_null(preview_el)) {
      preview_el
    } else {
      let cell = query("td[data-row=\"\{start_row - 1}\"][data-col=\"1\"]")
      cell
    }
    if not(is_null(target)) {
      show_comment_card(target, key, start_row - 1, col)
    }
  }
  // Re-enable scroll sync after 500ms
  ignore(set_timeout(fn() {
    scroll_sync_disabled_until.val = 0.0
    scroll_active_pane.val = ""
  }, 500))
}

///| Show comment card below element (for preview-only mode)
fn show_comment_card_below(target : Element, key : String, row : Int, col : Int) -> Unit {
  let card = query("#comment-card")
  let textarea = query("#comment-input")
  if is_null(card) || is_null(textarea) {
    return
  }
  active_key.val = key
  let rect_bottom = get_bounding_rect_bottom(target)
  let rect_left = get_bounding_rect_left(target)
  let rect_top = get_bounding_rect_top(target)
  let win_height = window_inner_height()
  let card_height = 200
  let margin = 12
  // Try below first
  let top = if rect_bottom.to_int() + card_height + margin < win_height {
    rect_bottom.to_int() + margin
  } else if rect_top.to_int() - card_height - margin > 0 {
    // Above
    rect_top.to_int() - card_height - margin
  } else {
    // Fallback: center
    (win_height - card_height) / 2
  }
  set_style(card, "top", "\{top}px")
  set_style(card, "left", "\{rect_left.to_int()}px")
  set_style(card, "display", "block")
  match comments.get(key) {
    Some(comment) => {
      set_value(textarea, comment.text)
      current_comment_image.val = comment.image
    }
    None => {
      set_value(textarea, "")
      current_comment_image.val = ""
      comments.set(key, { row, col, text: "", image: "" })
    }
  }
  render_comment_image_preview()
  focus_element(textarea)
}

///| Setup preview click handler for markdown mode
fn setup_preview_click() -> Unit {
  let preview = query("#md-preview")
  if is_null(preview) {
    return
  }
  on(preview, "click", fn(e) {
    let target = event_target(e)
    if is_null(target) {
      return
    }
    let tag = get_tag_name(target)
    // Image click
    if tag == "IMG" {
      let src = get_src(target)
      let heading = find_closest_heading_above(target)
      let h_line = get_heading_source_line(heading)
      let line = find_image_source_line(src, h_line)
      if line > 0 {
        select_source_range(line, line, target)
      }
      return
    }
    // Code block click (<pre> or <code> inside <pre>)
    let pre = closest(target, "pre")
    if not(is_null(pre)) {
      let code_text = get_text_content(pre)
      let range = find_code_block_range(code_text)
      if range.0 > 0 {
        select_source_range(range.0, range.1, pre)
      }
      return
    }
    // Link click: find parent block, sync to source, but don't prevent default
    if tag == "A" {
      let parent_block = closest(target, "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th")
      if not(is_null(parent_block)) {
        let text = get_text_content(parent_block)
        let heading = find_closest_heading_above(parent_block)
        let h_line = get_heading_source_line(heading)
        let parent_tag = get_tag_name(parent_block)
        let line = if parent_tag == "TD" || parent_tag == "TH" {
          find_table_source_line(text, h_line)
        } else {
          find_source_line(text, parent_block, h_line)
        }
        if line > 0 {
          let cell_col = if parent_tag == "TD" || parent_tag == "TH" {
            get_cell_index(parent_block) + 1 // 1-indexed: col=0 is line comment, col>=1 is cell comment
          } else {
            0
          }
          select_source_range(line, line, parent_block, col=cell_col)
        }
      }
      return // Don't prevent default for links
    }
    // Generic block element click
    let block = closest(target, "p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th, summary")
    if not(is_null(block)) {
      let text = get_text_content(block)
      let heading = find_closest_heading_above(block)
      let h_line = get_heading_source_line(heading)
      let block_tag = get_tag_name(block)
      let line = if block_tag == "TD" || block_tag == "TH" {
        find_table_source_line(text, h_line)
      } else {
        find_source_line(text, block, h_line)
      }
      if line > 0 {
        let cell_col = if block_tag == "TD" || block_tag == "TH" {
          get_cell_index(block) + 1 // 1-indexed: col=0 is line comment, col>=1 is cell comment
        } else {
          0
        }
        select_source_range(line, line, block, col=cell_col)
      }
    }
  })
}

///| Setup preview mouseup handler for text selection → range comment
fn setup_preview_mouseup() -> Unit {
  let preview = query("#md-preview")
  if is_null(preview) {
    return
  }
  on(preview, "mouseup", fn(_e) {
    ignore(set_timeout(fn() {
      let sel = window_get_selection()
      if is_null(sel) || selection_is_collapsed(sel) {
        return
      }
      let text = selection_to_string(sel)
      if text.length() < 5 {
        return
      }
      // Get container element
      let container = selection_get_range_container(sel)
      if is_null(container) {
        return
      }
      // Find heading context
      let heading = find_closest_heading_above(container)
      let h_line = get_heading_source_line(heading)
      // Split text into lines and find start/end
      let lines_arr : Array[String] = []
      for part in text.split("\n") {
        let s = part.to_string()
        if s.length() > 0 {
          lines_arr.push(s)
        }
      }
      let first_line = if lines_arr.length() > 0 { lines_arr[0] } else { "" }
      let last_line = if lines_arr.length() > 1 { lines_arr[lines_arr.length() - 1] } else { first_line }
      let start_line = find_source_line(first_line, container, h_line)
      let end_line = if lines_arr.length() > 1 {
        find_source_line(last_line, container, h_line)
      } else {
        start_line
      }
      if start_line <= 0 {
        return
      }
      selection_remove_all_ranges(sel)
      let actual_end = if end_line > 0 { end_line } else { start_line }
      select_source_range(start_line, actual_end, container)
    }, 10))
  })
}

///| Setup questions UI (overlay, bar, auto-popup, answer tracking)
fn setup_questions_ui() -> Unit {
  let overlay = query("#reviw-questions-overlay")
  let bar = query("#reviw-questions-bar")
  if is_null(overlay) {
    return
  }
  // Close button
  let close_btn = query("#reviw-questions-close")
  if not(is_null(close_btn)) {
    on(close_btn, "click", fn(_e) { close_questions_modal(false) })
  }
  // Later button
  let later_btn = query("#reviw-questions-later")
  if not(is_null(later_btn)) {
    on(later_btn, "click", fn(_e) { close_questions_modal(false) })
  }
  // Bar open button
  let bar_open = query("#reviw-questions-bar-open")
  if not(is_null(bar_open)) {
    on(bar_open, "click", fn(_e) { open_questions_modal() })
  }
  // Click overlay background to close
  on(overlay, "click", fn(e) {
    if elem_eq(event_target(e), overlay) {
      close_questions_modal(false)
    }
  })
  // Escape to close
  on_doc("keydown", fn(e) {
    if event_key(e) == "Escape" {
      let ov = query("#reviw-questions-overlay")
      if not(is_null(ov)) && has_class(ov, "visible") {
        close_questions_modal(false)
      }
    }
  })
  // Setup option buttons
  let option_btns = query_all(".q-option-btn")
  for btn in option_btns {
    on(btn, "click", fn(e) {
      let target = event_target(e)
      let was_selected = has_class(target, "selected")
      // Deselect all options in same question
      let qi = get_attr(target, "data-qi")
      let siblings = query_all(".q-option-btn[data-qi=\"" + qi + "\"]")
      for sib in siblings {
        remove_class(sib, "selected")
      }
      if not(was_selected) {
        add_class(target, "selected")
      }
      update_questions_count()
    })
  }
  // Setup answer textareas
  let answer_areas = query_all(".q-answer")
  for area in answer_areas {
    on(area, "input", fn(_e) { update_questions_count() })
  }
  // Resolved toggle
  let resolved_toggle = query(".reviw-resolved-toggle")
  if not(is_null(resolved_toggle)) {
    on(resolved_toggle, "click", fn(_e) {
      if has_class(resolved_toggle, "open") {
        remove_class(resolved_toggle, "open")
      } else {
        add_class(resolved_toggle, "open")
      }
    })
  }
  // Auto-popup if there are unresolved questions
  let count_el = query("#reviw-questions-bar-count")
  if not(is_null(count_el)) {
    let count_text = get_text_content(count_el)
    if count_text != "0" {
      // Auto-open after short delay
      ignore(set_timeout(fn() { open_questions_modal() }, 500))
    }
  }
}

///| Open questions modal
fn open_questions_modal() -> Unit {
  let overlay = query("#reviw-questions-overlay")
  if not(is_null(overlay)) {
    add_class(overlay, "visible")
  }
  let bar = query("#reviw-questions-bar")
  if not(is_null(bar)) {
    remove_class(bar, "visible")
    remove_class_body("has-questions-bar")
  }
}

///| Close questions modal
fn close_questions_modal(_all_answered : Bool) -> Unit {
  let overlay = query("#reviw-questions-overlay")
  if not(is_null(overlay)) {
    remove_class(overlay, "visible")
  }
  // Show bar if there are unanswered questions
  let unanswered = count_unanswered_questions()
  let bar = query("#reviw-questions-bar")
  if unanswered > 0 && not(is_null(bar)) {
    add_class(bar, "visible")
    add_class_body("has-questions-bar")
  }
}

///| Count unanswered questions
fn count_unanswered_questions() -> Int {
  let cards = query_all(".question-card:not(.resolved)")
  let mut unanswered = 0
  for card in cards {
    let qi = get_attr(card, "data-qid")
    ignore(qi)
    // Check if any option selected
    let selected = query_in(card, ".q-option-btn.selected")
    let textarea = query_in(card, ".q-answer")
    let has_option = not(is_null(selected))
    let has_text = if not(is_null(textarea)) { get_value(textarea).length() > 0 } else { false }
    if not(has_option) && not(has_text) {
      unanswered = unanswered + 1
    }
  }
  unanswered
}

///| Update questions count display
fn update_questions_count() -> Unit {
  let unanswered = count_unanswered_questions()
  let count_el = query("#reviw-questions-count")
  if not(is_null(count_el)) {
    if unanswered > 0 {
      set_inner_html(count_el, "(" + unanswered.to_string() + ")")
    } else {
      set_inner_html(count_el, "")
    }
  }
  let bar_count = query("#reviw-questions-bar-count")
  if not(is_null(bar_count)) {
    set_inner_html(bar_count, unanswered.to_string())
  }
  // Auto-close if all answered
  if unanswered == 0 {
    ignore(set_timeout(fn() {
      close_questions_modal(true)
    }, 500))
  }
}

///| Setup heading toggle (collapse/expand sections)
fn setup_heading_toggles() -> Unit {
  let headings = query_all(".md-heading-toggle")
  for heading in headings {
    let key = get_attr(heading, "data-heading-key")
    let level = str_to_int(get_attr(heading, "data-heading-level"))
    // Restore state from localStorage
    let stored = ls_get("reviw:heading:" + key)
    if stored == "collapsed" {
      collapse_heading_section(heading, level)
      let icon = query_in(heading, ".heading-toggle-icon")
      if not(is_null(icon)) {
        add_class(icon, "collapsed")
        set_inner_html(icon, "\u{25B6}")
      }
    }
    // Toggle icon click handler
    let icon = query_in(heading, ".heading-toggle-icon")
    if not(is_null(icon)) {
      on(icon, "click", fn(e) {
        prevent_default(e)
        // Stop propagation to prevent preview click handler
        stop_propagation(e)
        let is_collapsed = has_class(icon, "collapsed")
        if is_collapsed {
          // Expand
          remove_class(icon, "collapsed")
          set_inner_html(icon, "\u{25BC}")
          expand_heading_section(heading, level)
          ls_set("reviw:heading:" + key, "expanded")
        } else {
          // Collapse
          add_class(icon, "collapsed")
          set_inner_html(icon, "\u{25B6}")
          collapse_heading_section(heading, level)
          ls_set("reviw:heading:" + key, "collapsed")
        }
      })
    }
  }
}

///| Collapse all sibling elements until next heading of same or higher level
fn collapse_heading_section(heading : Element, level : Int) -> Unit {
  let mut sib = next_element_sibling(heading)
  while not(is_null(sib)) {
    let tag = get_tag_name(sib)
    // Stop at heading of same or higher level
    if (tag == "H1" || tag == "H2" || tag == "H3" || tag == "H4" || tag == "H5" || tag == "H6") {
      let sib_level = str_to_int(get_attr(sib, "data-heading-level"))
      if sib_level > 0 && sib_level <= level {
        break
      }
    }
    add_class(sib, "heading-collapsed")
    sib = next_element_sibling(sib)
  }
}

///| Expand all sibling elements until next heading of same or higher level
fn expand_heading_section(heading : Element, level : Int) -> Unit {
  let mut sib = next_element_sibling(heading)
  while not(is_null(sib)) {
    let tag = get_tag_name(sib)
    if (tag == "H1" || tag == "H2" || tag == "H3" || tag == "H4" || tag == "H5" || tag == "H6") {
      let sib_level = str_to_int(get_attr(sib, "data-heading-level"))
      if sib_level > 0 && sib_level <= level {
        break
      }
    }
    remove_class(sib, "heading-collapsed")
    sib = next_element_sibling(sib)
  }
}

///| Mermaid fullscreen ZoomPanViewer handle (MoonBit native)
let fs_mermaid_zpv : Ref[ZPVState?] = Ref::new(None)

///| Setup mermaid fullscreen with pure MoonBit ZoomPanViewer (cli.cjs L7398-7500)
fn setup_mermaid_fullscreen_moonbit() -> Unit {
  let overlay = query("#mermaid-fullscreen")
  let fs_content = query("#fs-content")
  let fs_wrapper = query("#fs-wrapper")
  let fs_zoom_info = query("#fs-zoom-info")
  if is_null(overlay) || is_null(fs_content) || is_null(fs_wrapper) {
    return
  }
  // Click handler: open mermaid fullscreen
  on_doc(
    "click",
    fn(e) {
      let target = event_target(e)
      let btn = closest(target, ".mermaid-fullscreen-btn")
      let cont = closest(target, ".mermaid-container")
      if not(is_null(btn)) || not(is_null(cont)) {
        let container = if not(is_null(btn)) {
          closest(btn, ".mermaid-container")
        } else {
          cont
        }
        let svg = query_in(container, ".mermaid svg")
        if not(is_null(svg)) {
          // Don't open fullscreen for error SVGs
          let err_icon = query_in(svg, ".error-icon")
          if not(is_null(err_icon)) {
            return
          }
          open_mermaid_fullscreen_moonbit(svg, overlay, fs_content, fs_wrapper, fs_zoom_info)
          stop_propagation(e)
        }
      }
    },
  )
  // Controls
  let zoom_in_btn = query("#fs-zoom-in")
  let zoom_out_btn = query("#fs-zoom-out")
  let fs_reset = query("#fs-reset")
  let fs_close = query("#fs-close")
  if not(is_null(zoom_in_btn)) {
    on(zoom_in_btn, "click", fn(_e) {
      if fs_mermaid_zpv.val.is_some() {
        zoom_in(fs_mermaid_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(zoom_out_btn)) {
    on(zoom_out_btn, "click", fn(_e) {
      if fs_mermaid_zpv.val.is_some() {
        zoom_out(fs_mermaid_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(fs_reset)) {
    on(fs_reset, "click", fn(_e) {
      if fs_mermaid_zpv.val.is_some() {
        reset_view(fs_mermaid_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(fs_close)) {
    on(fs_close, "click", fn(_e) { close_mermaid_fullscreen_moonbit(overlay) })
  }
  // ESC to close + overlay background click
  on(overlay, "click", fn(e) {
    if elem_eq(event_target(e), overlay) {
      close_mermaid_fullscreen_moonbit(overlay)
    }
  })
  on_doc(
    "keydown",
    fn(e) {
      if event_key(e) == "Escape" && has_class_visible(overlay) {
        close_mermaid_fullscreen_moonbit(overlay)
        prevent_default(e)
      }
    },
  )
}

///| Open mermaid diagram in fullscreen with pure MoonBit ZoomPanViewer
fn open_mermaid_fullscreen_moonbit(
  svg : Element,
  overlay : Element,
  fs_content : Element,
  fs_wrapper : Element,
  fs_zoom_info : Element
) -> Unit {
  // Destroy previous viewer
  if fs_mermaid_zpv.val.is_some() {
    destroy_zoom_pan_viewer(fs_mermaid_zpv.val.unwrap())
    fs_mermaid_zpv.val = None
  }
  clear_children(fs_wrapper)
  set_class_name(fs_wrapper, "mermaid-wrapper")
  let cloned = clone_node_deep(svg)
  let size = get_svg_natural_size(svg)
  let nw = size[0]
  let nh = size[1]
  set_style(fs_wrapper, "padding", "0")
  set_style(cloned, "width", nw.to_string() + "px")
  set_style(cloned, "height", nh.to_string() + "px")
  append_child(fs_wrapper, cloned)
  // Hide wrapper until fitToViewport positions it
  set_visibility(fs_wrapper, false)
  // Setup minimap: clone SVG into minimap-content
  let minimap_content = query("#fs-minimap-content")
  let minimap_viewport = query("#fs-minimap-viewport")
  if not(is_null(minimap_content)) {
    clear_children(minimap_content)
    let minimap_svg = clone_node_deep(svg)
    append_child(minimap_content, minimap_svg)
  }
  // Create ZoomPanViewer with padding for margin and minimap enabled
  let zpv = create_zoom_pan_viewer_moonbit(
    fs_content,
    fs_wrapper,
    nw,
    nh,
    fs_zoom_info,
    true,
    minimap_viewport,
    184.0,
    134.0,
    8.0,
    0.1,
    10.0,
    true,
  )
  fs_mermaid_zpv.val = Some(zpv)
  show_overlay(overlay)
  // Fit after render
  ignore(
    request_animation_frame(
      fn() {
        fit_to_viewport(zpv)
        set_visibility(fs_wrapper, true)
      },
    ),
  )
}

///| Close mermaid fullscreen (MoonBit native)
fn close_mermaid_fullscreen_moonbit(overlay : Element) -> Unit {
  if fs_mermaid_zpv.val.is_some() {
    destroy_zoom_pan_viewer(fs_mermaid_zpv.val.unwrap())
    fs_mermaid_zpv.val = None
  }
  hide_overlay(overlay)
}

///| Image fullscreen ZoomPanViewer handle (MoonBit native)
let fs_image_zpv : Ref[ZPVState?] = Ref::new(None)
let current_image_index : Ref[Int] = Ref::new(-1)

///| Setup image fullscreen with pure MoonBit ZoomPanViewer
fn setup_image_fullscreen_moonbit() -> Unit {
  let overlay = query("#image-fullscreen")
  let fs_content = query("#image-fs-content")
  let fs_wrapper = query("#image-fs-wrapper")
  let fs_zoom_info = query("#img-fs-zoom-info")
  let fs_counter = query("#img-fs-counter")
  if is_null(overlay) || is_null(fs_content) || is_null(fs_wrapper) {
    return
  }
  let preview = query("#md-preview")
  if is_null(preview) {
    return
  }
  // Click handler: open image fullscreen when clicking images in preview
  on(preview, "click", fn(e) {
    let target = event_target(e)
    if get_tag_name(target) == "IMG" {
      // Don't open if inside mermaid container
      if not(is_null(closest(target, ".mermaid-container"))) {
        return
      }
      let all_images = query_all_in(preview, "img")
      // Filter out mermaid images
      let images : Array[Element] = []
      for img in all_images {
        if is_null(closest(img, ".mermaid-container")) {
          images.push(img)
        }
      }
      // Find index of clicked image
      let mut idx = -1
      for i, img in images {
        if elem_eq(img, target) {
          idx = i
          break
        }
      }
      if idx >= 0 {
        show_image_fullscreen_moonbit(
          images, idx, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
        )
      }
    }
  })
  // Controls
  let zoom_in_btn = query("#img-fs-zoom-in")
  let zoom_out_btn = query("#img-fs-zoom-out")
  let fs_reset = query("#img-fs-reset")
  let fs_close = query("#img-fs-close")
  let fs_prev = query("#img-fs-prev")
  let fs_next = query("#img-fs-next")
  if not(is_null(zoom_in_btn)) {
    on(zoom_in_btn, "click", fn(_e) {
      if fs_image_zpv.val.is_some() {
        zoom_in(fs_image_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(zoom_out_btn)) {
    on(zoom_out_btn, "click", fn(_e) {
      if fs_image_zpv.val.is_some() {
        zoom_out(fs_image_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(fs_reset)) {
    on(fs_reset, "click", fn(_e) {
      if fs_image_zpv.val.is_some() {
        reset_view(fs_image_zpv.val.unwrap())
      }
    })
  }
  if not(is_null(fs_close)) {
    on(fs_close, "click", fn(_e) { close_image_fullscreen_moonbit(overlay) })
  }
  // Previous/Next navigation buttons
  if not(is_null(fs_prev)) {
    on(fs_prev, "click", fn(_e) {
      navigate_image_fullscreen_moonbit(
        -1, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
      )
    })
  }
  if not(is_null(fs_next)) {
    on(fs_next, "click", fn(_e) {
      navigate_image_fullscreen_moonbit(
        1, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
      )
    })
  }
  // ESC to close + overlay background click + arrow key navigation
  on(overlay, "click", fn(e) {
    if elem_eq(event_target(e), overlay) {
      close_image_fullscreen_moonbit(overlay)
    }
  })
  on_doc(
    "keydown",
    fn(e) {
      if not(has_class_visible(overlay)) {
        return
      }
      let key = event_key(e)
      if key == "Escape" {
        close_image_fullscreen_moonbit(overlay)
        prevent_default(e)
      } else if key == "ArrowLeft" {
        navigate_image_fullscreen_moonbit(
          -1, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
        )
        prevent_default(e)
      } else if key == "ArrowRight" {
        navigate_image_fullscreen_moonbit(
          1, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
        )
        prevent_default(e)
      }
    },
  )
}

///| Collect images from preview (excluding mermaid)
fn collect_preview_images() -> Array[Element] {
  let preview = query("#md-preview")
  if is_null(preview) {
    return []
  }
  let all = query_all_in(preview, "img")
  let result : Array[Element] = []
  for img in all {
    if is_null(closest(img, ".mermaid-container")) {
      result.push(img)
    }
  }
  result
}

///| Show image in fullscreen with pure MoonBit ZoomPanViewer
fn show_image_fullscreen_moonbit(
  images : Array[Element],
  index : Int,
  overlay : Element,
  fs_content : Element,
  fs_wrapper : Element,
  fs_zoom_info : Element,
  fs_counter : Element
) -> Unit {
  if index < 0 || index >= images.length() {
    return
  }
  current_image_index.val = index
  // Destroy previous viewer
  if fs_image_zpv.val.is_some() {
    destroy_zoom_pan_viewer(fs_image_zpv.val.unwrap())
    fs_image_zpv.val = None
  }
  clear_children(fs_wrapper)
  let img = images[index]
  let cloned = clone_node_deep(img)
  set_style(cloned, "maxWidth", "none")
  set_style(cloned, "maxHeight", "none")
  set_style(cloned, "cursor", "")
  set_style(cloned, "display", "block")
  set_draggable(cloned, false)
  let nw = get_natural_width(img)
  let nh = get_natural_height(img)
  let nat_w = if nw > 0.0 { nw } else { 800.0 }
  let nat_h = if nh > 0.0 { nh } else { 600.0 }
  set_style(cloned, "width", nat_w.to_string() + "px")
  set_style(cloned, "height", nat_h.to_string() + "px")
  append_child(fs_wrapper, cloned)
  // Update counter
  if not(is_null(fs_counter)) {
    set_text_content(
      fs_counter,
      (index + 1).to_string() + " / " + images.length().to_string(),
    )
  }
  // Hide wrapper until fit
  set_visibility(fs_wrapper, false)
  // Setup image minimap
  let img_minimap_content = query("#image-fs-minimap-content")
  let img_minimap_viewport = query("#image-fs-minimap-viewport")
  if not(is_null(img_minimap_content)) {
    clear_children(img_minimap_content)
    let minimap_img = clone_node_deep(cloned)
    set_style(minimap_img, "width", "100%")
    set_style(minimap_img, "height", "100%")
    set_style(minimap_img, "objectFit", "contain")
    append_child(img_minimap_content, minimap_img)
  }
  let zpv = create_zoom_pan_viewer_moonbit(
    fs_content,
    fs_wrapper,
    nat_w,
    nat_h,
    fs_zoom_info,
    true,
    img_minimap_viewport,
    184.0,
    134.0,
    8.0,
    0.1,
    20.0,
    true,
  )
  fs_image_zpv.val = Some(zpv)
  show_overlay(overlay)
  ignore(
    request_animation_frame(
      fn() {
        fit_to_viewport(zpv)
        set_visibility(fs_wrapper, true)
      },
    ),
  )
}

///| Navigate image fullscreen by direction (-1=prev, 1=next)
fn navigate_image_fullscreen_moonbit(
  direction : Int,
  overlay : Element,
  fs_content : Element,
  fs_wrapper : Element,
  fs_zoom_info : Element,
  fs_counter : Element
) -> Unit {
  let images = collect_preview_images()
  if images.length() == 0 {
    return
  }
  let new_idx = current_image_index.val + direction
  if new_idx >= 0 && new_idx < images.length() {
    show_image_fullscreen_moonbit(
      images, new_idx, overlay, fs_content, fs_wrapper, fs_zoom_info, fs_counter,
    )
  }
}

///| Close image fullscreen (MoonBit native)
fn close_image_fullscreen_moonbit(overlay : Element) -> Unit {
  if fs_image_zpv.val.is_some() {
    destroy_zoom_pan_viewer(fs_image_zpv.val.unwrap())
    fs_image_zpv.val = None
  }
  current_image_index.val = -1
  hide_overlay(overlay)
}

///| Video fullscreen state (MoonBit native)
let fs_video_timeline : Ref[VTLState?] = Ref::new(None)
let current_video_index : Ref[Int] = Ref::new(-1)
let current_scene_threshold : Ref[Double] = Ref::new(0.01)
let current_stab_threshold : Ref[Double] = Ref::new(0.1)
let current_video_path : Ref[String] = Ref::new("")

///| Setup video fullscreen with pure MoonBit VideoTimeline
fn setup_video_fullscreen_moonbit() -> Unit {
  let overlay = query("#video-fullscreen")
  let container = query("#video-container")
  let fs_counter = query("#vid-fs-counter")
  if is_null(overlay) || is_null(container) {
    return
  }
  let preview = query("#md-preview")
  if is_null(preview) {
    return
  }
  // Collect all video sources from preview
  // Click handler: open video fullscreen when clicking video elements in preview
  on(preview, "click", fn(e) {
    let target = event_target(e)
    if get_tag_name(target) == "VIDEO" {
      let all_videos = query_all_in(preview, "video")
      let mut idx = -1
      for i, vid in all_videos {
        if elem_eq(vid, target) {
          idx = i
          break
        }
      }
      if idx >= 0 {
        show_video_fullscreen_moonbit(all_videos, idx, overlay, container, fs_counter)
        stop_propagation(e)
      }
    }
  })
  // Close button
  let fs_close = query("#video-close")
  if not(is_null(fs_close)) {
    on(fs_close, "click", fn(_e) { close_video_fullscreen_moonbit(overlay, container) })
  }
  // ESC + overlay click + keyboard
  on(overlay, "click", fn(e) {
    if elem_eq(event_target(e), overlay) {
      close_video_fullscreen_moonbit(overlay, container)
    }
  })
  on_doc(
    "keydown",
    fn(e) {
      if not(has_class_visible(overlay)) {
        return
      }
      let key = event_key(e)
      if key == "Escape" {
        close_video_fullscreen_moonbit(overlay, container)
        prevent_default(e)
      } else if key == "ArrowLeft" || key == "j" {
        if fs_video_timeline.val.is_some() {
          navigate(fs_video_timeline.val.unwrap(), -1)
        }
        prevent_default(e)
      } else if key == "ArrowRight" || key == "l" {
        if fs_video_timeline.val.is_some() {
          navigate(fs_video_timeline.val.unwrap(), 1)
        }
        prevent_default(e)
      } else if key == "ArrowUp" {
        navigate_video_fullscreen_moonbit(-1, overlay, container, fs_counter)
        prevent_default(e)
      } else if key == "ArrowDown" {
        navigate_video_fullscreen_moonbit(1, overlay, container, fs_counter)
        prevent_default(e)
      } else if key == " " || key == "k" {
        let vid = query_in(container, "video")
        if not(is_null(vid)) {
          if video_is_paused(vid) { video_play(vid) } else { video_pause(vid) }
        }
        prevent_default(e)
      }
    },
  )
  // --- Settings panel ---
  setup_video_settings_moonbit(overlay, container, fs_counter)
}

///| Setup video settings panel (scene threshold / stabilization buttons) - MoonBit native
fn setup_video_settings_moonbit(
  overlay : Element,
  container : Element,
  fs_counter : Element
) -> Unit {
  let settings_btn = query("#video-settings-btn")
  let settings_panel = query("#video-settings-panel")
  let scene_buttons_div = query("#scene-buttons")
  let stab_buttons_div = query("#stab-buttons")
  if is_null(settings_btn) || is_null(settings_panel) {
    return
  }
  // Toggle panel
  on(settings_btn, "click", fn(e) {
    stop_propagation(e)
    toggle_class(settings_panel, "visible")
  })
  on(settings_panel, "click", fn(e) { stop_propagation(e) })
  // Scene threshold buttons
  if not(is_null(scene_buttons_div)) {
    let btns = query_all_in(scene_buttons_div, "button")
    for btn in btns {
      on(btn, "click", fn(_e) {
        let all = query_all_in(scene_buttons_div, "button")
        for b in all { remove_class(b, "selected") }
        add_class(btn, "selected")
        let val = get_attr(btn, "data-scene")
        current_scene_threshold.val = parse_float(val)
        regenerate_timeline_moonbit(overlay, container, fs_counter)
      })
    }
  }
  // Stabilization threshold buttons
  if not(is_null(stab_buttons_div)) {
    let btns = query_all_in(stab_buttons_div, "button")
    for btn in btns {
      on(btn, "click", fn(_e) {
        let all = query_all_in(stab_buttons_div, "button")
        for b in all { remove_class(b, "selected") }
        add_class(btn, "selected")
        let val = get_attr(btn, "data-stab")
        current_stab_threshold.val = parse_float(val)
        regenerate_timeline_moonbit(overlay, container, fs_counter)
      })
    }
  }
}

///| Regenerate video timeline with updated thresholds (MoonBit native)
fn regenerate_timeline_moonbit(
  _overlay : Element,
  container : Element,
  _fs_counter : Element
) -> Unit {
  if current_video_path.val.length() == 0 {
    return
  }
  let vid = query_in(container, "video")
  if is_null(vid) {
    return
  }
  // Destroy old timeline and recreate
  if fs_video_timeline.val.is_some() {
    let new_vtl = recreate_timeline(
      fs_video_timeline.val.unwrap(),
      current_scene_threshold.val,
      current_stab_threshold.val,
    )
    fs_video_timeline.val = Some(new_vtl)
  }
}

///| Show video in fullscreen with pure MoonBit VideoTimeline
fn show_video_fullscreen_moonbit(
  videos : Array[Element],
  index : Int,
  overlay : Element,
  container : Element,
  fs_counter : Element
) -> Unit {
  if index < 0 || index >= videos.length() {
    return
  }
  current_video_index.val = index
  // Cleanup previous timeline
  if fs_video_timeline.val.is_some() {
    destroy_video_timeline(fs_video_timeline.val.unwrap())
    fs_video_timeline.val = None
  }
  // Remove existing video
  let existing_vid = query_in(container, "video")
  if not(is_null(existing_vid)) {
    video_pause(existing_vid)
    remove_element(existing_vid)
  }
  // Create new video element dynamically
  let vid = videos[index]
  let src = get_src(vid)
  let new_video = create_video_element(src)
  append_child(container, new_video)
  // Update counter
  if not(is_null(fs_counter)) {
    set_text_content(
      fs_counter,
      (index + 1).to_string() + " / " + videos.length().to_string(),
    )
  }
  // Create timeline — use pathname only (get_src returns full URL)
  let video_path = url_to_pathname(src)
  current_video_path.val = video_path
  let vtl = create_video_timeline_moonbit(
    new_video, container, video_path,
    current_scene_threshold.val, current_stab_threshold.val, true,
  )
  fs_video_timeline.val = Some(vtl)
  show_overlay(overlay)
  // Close settings panel when opening new video
  let settings_panel = query("#video-settings-panel")
  if not(is_null(settings_panel)) {
    remove_class(settings_panel, "visible")
  }
}

///| Navigate video fullscreen by direction (-1=prev, 1=next)
fn navigate_video_fullscreen_moonbit(
  direction : Int,
  overlay : Element,
  container : Element,
  fs_counter : Element
) -> Unit {
  let preview = query("#md-preview")
  if is_null(preview) {
    return
  }
  let all_videos = query_all_in(preview, "video")
  if all_videos.length() == 0 {
    return
  }
  let new_idx = current_video_index.val + direction
  if new_idx >= 0 && new_idx < all_videos.length() {
    show_video_fullscreen_moonbit(all_videos, new_idx, overlay, container, fs_counter)
  }
}

///| Close video fullscreen and pause video (MoonBit native)
fn close_video_fullscreen_moonbit(overlay : Element, container : Element) -> Unit {
  // Pause and remove video
  let vid = query_in(container, "video")
  if not(is_null(vid)) {
    video_pause(vid)
    remove_element(vid)
  }
  // Cleanup timeline
  if fs_video_timeline.val.is_some() {
    destroy_video_timeline(fs_video_timeline.val.unwrap())
    fs_video_timeline.val = None
  }
  current_video_index.val = -1
  current_video_path.val = ""
  hide_overlay(overlay)
}

///| Entry point: auto-init on module load
fn main {
  init_app()
}
