///| Server context for one file
struct ServerContext {
  file_path : String
  filename : String
  mode : @core.FileMode
  mut port : Int
  mut html_cache : String
  sse_clients : Array[JsValue]
}

///| All active server contexts
let active_servers : Array[ServerContext] = []

///| Results collected from submissions
let all_results : Array[@core.ReviewResult] = []

///| Expected total number of files
let expected_count : Ref[Int] = Ref::new(0)

///| Cached ui.js content
let ui_js_cache : Ref[String] = Ref::new("")

///| Load ui.js from build output
fn load_ui_js() -> String {
  if ui_js_cache.val.length() > 0 {
    return ui_js_cache.val
  }
  let script_dir = get_script_dir()
  let ui_path = path_join(script_dir, "../ui/ui.js")
  if exists_sync(ui_path) {
    let content = read_file_sync(ui_path, "utf-8")
    ui_js_cache.val = content
    content
  } else {
    console_error("Warning: ui.js not found at \{ui_path}")
    "// ui.js not found"
  }
}

///| Get lock file directory
fn lock_dir() -> String {
  let home = os_homedir()
  path_join(home, ".reviw/locks")
}

///| Get lock file path for a port
fn lock_path(port : Int) -> String {
  let dir = lock_dir()
  path_join(dir, "\{port}.lock")
}

///| Ensure lock directory exists
fn ensure_lock_dir() -> Unit {
  let dir = lock_dir()
  if not(exists_sync(dir)) {
    mkdir_sync(dir, mkdir_recursive_opts())
  }
}

///| Check if a port is locked by another process
fn is_port_locked(port : Int) -> Bool {
  let lp = lock_path(port)
  exists_sync(lp)
}

///| Write lock file for a port
fn write_lock(port : Int) -> Unit {
  ensure_lock_dir()
  let lp = lock_path(port)
  write_file_sync(lp, port.to_string())
}

///| Remove lock file for a port
fn remove_lock(port : Int) -> Unit {
  let lp = lock_path(port)
  if exists_sync(lp) {
    unlink_sync(lp)
  }
}

///| Find first available port starting from base, skipping locked ports
fn find_available_port(base : Int) -> Int {
  let mut port = base
  let mut attempts = 0
  while attempts < max_port_attempts {
    if not(is_port_locked(port)) {
      return port
    }
    console_log("Port \{port} locked, trying \{port + 1}...")
    port = port + 1
    attempts = attempts + 1
  }
  base // fallback
}

///| Main entry point
fn main {
  let argv = get_argv()
  let args : Array[String] = []
  for i in 2..<argv.length() {
    args.push(argv[i])
  }
  let mut port = 4989
  let mut no_open = false
  let files : Array[String] = []
  let mut i = 0
  while i < args.length() {
    let arg = args[i]
    if arg == "--help" || arg == "-h" {
      print_usage()
      process_exit(0)
    } else if arg == "--version" || arg == "-v" {
      console_log("reviw 2.0.0 (moonbit)")
      process_exit(0)
    } else if arg == "--port" {
      i = i + 1
      if i < args.length() {
        port = parse_port(args[i])
      }
    } else if arg == "--no-open" {
      no_open = true
    } else if not(arg.has_prefix("-")) {
      files.push(arg)
    }
    i = i + 1
  }
  // Cleanup locks on SIGINT
  on_process_signal(
    "SIGINT",
    fn() {
      for srv in active_servers {
        remove_lock(srv.port)
      }
      process_exit(0)
    },
  )
  // Pre-load ui.js
  ignore(load_ui_js())
  // Check stdin if no files
  if files.is_empty() {
    if not(is_stdin_tty()) {
      let stdin_content = read_stdin_sync()
      if stdin_content.length() > 0 {
        start_stdin_server(stdin_content, port, no_open)
        return
      }
    }
    print_usage()
    process_exit(1)
  }
  // Start servers for each file
  expected_count.val = files.length()
  ensure_lock_dir()
  for idx, file_path in files {
    let current_port = find_available_port(port + idx)
    start_file_server(file_path, current_port, no_open)
  }
}

///|
fn print_usage() -> Unit {
  let usage =
    #|Usage: reviw <file...> [options]
    #|
    #|Options:
    #|  --port <n>   Base port (default: 4989)
    #|  --no-open    Don't open browser
    #|  -h, --help   Show help
    #|  -v, --version Show version
    #|
    #|Supported formats: CSV, TSV, Markdown, Diff, Plain text
    #|Pipe stdin for diff: git diff | reviw
  console_log(usage)
}

///|
fn parse_port(s : String) -> Int {
  let mut n = 0
  let chars = s.to_array()
  for ch in chars {
    if ch >= '0' && ch <= '9' {
      n = n * 10 + (ch.to_int() - '0'.to_int())
    }
  }
  if n == 0 { 4989 } else { n }
}

///|
fn detect_mode(file_path : String) -> @core.FileMode {
  let ext = path_extname(file_path)
  let ext_lower = if ext.has_prefix(".") {
    @core.safe_slice(ext, 1).to_lower()
  } else {
    ext.to_lower()
  }
  @core.FileMode::from_extension(ext_lower)
}

///|
fn load_and_build_html(ctx : ServerContext) -> String {
  let content = read_file_sync(ctx.file_path, "utf-8")
  match ctx.mode {
    @core.FileMode::Csv => {
      let data = try {
        @core.parse_csv(content, ',')
      } catch {
        _ => { headers: ["Error"], rows: [["Failed to parse CSV"]] }
      }
      @core.build_csv_html(data, ctx.filename, ctx.port)
    }
    @core.FileMode::Tsv => {
      let data = try {
        @core.parse_csv(content, '\t')
      } catch {
        _ => { headers: ["Error"], rows: [["Failed to parse TSV"]] }
      }
      @core.build_csv_html(data, ctx.filename, ctx.port)
    }
    @core.FileMode::Diff => {
      let data = @core.parse_diff(content)
      @core.build_diff_html(data, ctx.filename, ctx.port)
    }
    @core.FileMode::Markdown => {
      let md = @core.parse_markdown(content)
      @core.build_markdown_html(md, ctx.filename, ctx.port)
    }
    @core.FileMode::Text => {
      let lines = @core.split_to_lines(content)
      @core.build_text_html(lines, ctx.filename, ctx.port)
    }
  }
}

///|
fn start_stdin_server(content : String, port : Int, no_open : Bool) -> Unit {
  let data = @core.parse_diff(content)
  let html = @core.build_diff_html(data, "stdin", port)
  let ctx : ServerContext = {
    file_path: "<stdin>",
    filename: "stdin",
    mode: @core.FileMode::Diff,
    port,
    html_cache: html,
    sse_clients: [],
  }
  active_servers.push(ctx)
  expected_count.val = 1
  start_http_server(ctx, no_open)
}

///|
fn start_file_server(file_path : String, port : Int, no_open : Bool) -> Unit {
  let resolved = path_resolve(file_path)
  let filename = path_basename(resolved)
  let mode = detect_mode(resolved)
  let ctx : ServerContext = {
    file_path: resolved,
    filename,
    mode,
    port,
    html_cache: "",
    sse_clients: [],
  }
  ctx.html_cache = load_and_build_html(ctx)
  active_servers.push(ctx)
  // Watch for file changes
  if ctx.file_path != "<stdin>" {
    let clients = ctx.sse_clients
    ignore(
      watch_file(
        resolved,
        fn(_curr, _prev) {
          ctx.html_cache = load_and_build_html(ctx)
          for client in clients {
            sse_send(client, "reload", "")
          }
        },
      ),
    )
  }
  start_http_server(ctx, no_open)
}

///| Max port retry attempts
let max_port_attempts : Int = 10

///|
fn start_http_server(ctx : ServerContext, no_open : Bool) -> Unit {
  try_listen(ctx, ctx.port, 0, no_open)
}

///|
fn try_listen(ctx : ServerContext, port : Int, attempt : Int, no_open : Bool) -> Unit {
  if attempt >= max_port_attempts {
    console_error("Failed to find available port after \{max_port_attempts} attempts")
    process_exit(1)
  }
  let server = create_server(
    fn(req, res) { handle_request(ctx, req, res) },
  )
  server_on_error(
    server,
    fn(err) {
      if error_code(err) == "EADDRINUSE" {
        console_log("Port \{port} in use, trying \{port + 1}...")
        try_listen(ctx, port + 1, attempt + 1, no_open)
      } else {
        console_error("Server error")
        process_exit(1)
      }
    },
  )
  server_listen(
    server,
    port,
    fn() {
      ctx.port = port
      write_lock(port)
      let url = "http://127.0.0.1:\{port}"
      console_log("reviw serving \{ctx.filename} at \{url}")
      if not(no_open) {
        open_browser(url)
      }
    },
  )
  // Heartbeat for SSE
  ignore(
    set_interval(
      fn() {
        for client in ctx.sse_clients {
          sse_send(client, "ping", "")
        }
      },
      25000,
    ),
  )
}

///|
fn handle_request(ctx : ServerContext, req : JsValue, res : JsValue) -> Unit {
  let http_method = req_method(req)
  let url = req_url(req)
  if http_method == "GET" && (url == "/" || url == "/index.html") {
    res_write_head(res, 200, "text/html; charset=utf-8")
    res_end(res, ctx.html_cache)
  } else if http_method == "GET" && url == "/ui.js" {
    res_write_head(res, 200, "application/javascript; charset=utf-8")
    res_end(res, load_ui_js())
  } else if http_method == "GET" && url == "/healthz" {
    res_write_head(res, 200, "application/json")
    res_end(res, "{\"ok\":true}")
  } else if http_method == "GET" && url == "/sse" {
    setup_sse(res)
    ctx.sse_clients.push(res)
    on_close(
      req,
      fn() {
        remove_sse_client(ctx, res)
      },
    )
  } else if http_method == "POST" && url == "/exit" {
    read_body(
      req,
      fn(body) {
        handle_submit(ctx, body)
        res_write_head(res, 200, "application/json")
        res_end(res, "{\"ok\":true}")
      },
    )
  } else {
    res_write_head(res, 404, "text/plain")
    res_end(res, "Not Found")
  }
}

///| Remove SSE client by reference equality
extern "js" fn js_ref_eq(a : JsValue, b : JsValue) -> Bool =
  #|(a, b) => a === b

///|
fn remove_sse_client(ctx : ServerContext, client : JsValue) -> Unit {
  let mut idx = -1
  for i, c in ctx.sse_clients {
    if js_ref_eq(c, client) {
      idx = i
      break
    }
  }
  if idx >= 0 && idx < ctx.sse_clients.length() {
    ignore(ctx.sse_clients.remove(idx))
  }
}

///|
fn handle_submit(ctx : ServerContext, body : String) -> Unit {
  let summary = json_parse_string("summary", body)
  // Parse comments from JSON body
  let raw_comments = json_parse_comments(body)
  let comments : Array[@core.Comment] = []
  for c in raw_comments {
    if c.length() >= 3 {
      comments.push({
        row: @core.parse_int_safe(c[0]),
        col: @core.parse_int_safe(c[1]),
        text: c[2],
        value: if c.length() > 3 { c[3] } else { "" },
      })
    }
  }
  let result : @core.ReviewResult = {
    file: ctx.filename,
    mode: ctx.mode,
    comments,
    summary,
  }
  all_results.push(result)
  console_log("Received review for \{ctx.filename} (\{comments.length()} comments)")
  if all_results.length() >= expected_count.val {
    let yaml = @core.reviews_to_yaml(all_results)
    process_stdout_write(yaml)
    for srv in active_servers {
      if srv.file_path != "<stdin>" {
        unwatch_file(srv.file_path)
      }
      remove_lock(srv.port)
    }
    process_exit(0)
  }
}
