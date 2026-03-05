///| Comment stored in the app
struct AppComment {
  row : Int
  col : Int
  mut text : String
}

///| Application state
let comments : Map[String, AppComment] = {}

///| Currently active comment card target
let active_key : Ref[String] = Ref::new("")

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
  // Setup theme toggle
  let theme_btn = query("#theme-toggle")
  if not(is_null(theme_btn)) {
    on(
      theme_btn,
      "click",
      fn(_e) {
        let current = get_theme()
        if current == "dark" {
          set_theme("light")
        } else {
          set_theme("dark")
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
  let cancel_btn = query("#comment-cancel")
  if not(is_null(cancel_btn)) {
    on(cancel_btn, "click", fn(_e) { hide_comment_card() })
  }
  let save_btn = query("#save-comment")
  if not(is_null(save_btn)) {
    on(save_btn, "click", fn(_e) { save_comment() })
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
  // Keyboard shortcut: Cmd/Ctrl+Enter to open submit modal
  on_doc(
    "keydown",
    fn(e) {
      if event_key(e) == "Enter" && (event_meta_key(e) || event_ctrl_key(e)) {
        prevent_default(e)
        show_submit_modal()
      }
      if event_key(e) == "Escape" {
        hide_comment_card()
        hide_submit_modal()
      }
    },
  )
  // Setup click handlers based on mode
  match mode {
    "csv" => setup_csv_clicks()
    "diff" => setup_diff_clicks()
    "markdown" => setup_csv_clicks()
    _ => setup_text_clicks()
  }
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
        let target = event_target(e)
        let row_str = get_attr(target, "data-row")
        let col_str = get_attr(target, "data-col")
        let key = "\{row_str}:\{col_str}"
        show_comment_card(target, key, str_to_int(row_str), str_to_int(col_str))
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
        let target = closest(event_target(e), ".text-line")
        if not(is_null(target)) {
          let row_str = get_attr(target, "data-row")
          let key = "\{row_str}:0"
          show_comment_card(target, key, str_to_int(row_str), 0)
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
          comments.set(k, { row, col, text })
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
  remove_class(card, "hidden")
  match comments.get(key) {
    Some(comment) => set_value(textarea, comment.text)
    None => {
      set_value(textarea, "")
      comments.set(key, { row, col, text: "" })
    }
  }
  focus_element(textarea)
}

///|
fn hide_comment_card() -> Unit {
  let card = query("#comment-card")
  if not(is_null(card)) {
    add_class(card, "hidden")
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
      Some(comment) => comment.text = text
      None => ()
    }
    if text.length() == 0 {
      ignore(comments.remove(key))
    }
  }
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
  comments.each(
    fn(_key, comment) {
      if comment.text.length() > 0 {
        let selector = "[data-row=\"\{comment.row}\"][data-col=\"\{comment.col}\"]"
        let el = query(selector)
        if not(is_null(el)) {
          add_class(el, "has-comment")
        }
      }
    },
  )
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
  remove_class(modal, "hidden")
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
    add_class(modal, "hidden")
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
        buf.write_char('}')
        first.val = false
      }
    },
  )
  buf.write_string("]}")
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

///| Entry point: auto-init on module load
fn main {
  init_app()
}
