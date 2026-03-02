///| External reference type for opaque JS objects
#external
pub type JsValue

///| Node.js fs module
#module("node:fs")
extern "js" fn read_file_sync(path : String, encoding : String) -> String = "readFileSync"

#module("node:fs")
extern "js" fn write_file_sync(path : String, data : String) -> Unit = "writeFileSync"

#module("node:fs")
extern "js" fn exists_sync(path : String) -> Bool = "existsSync"

#module("node:fs")
extern "js" fn mkdir_sync(path : String, options : JsValue) -> Unit = "mkdirSync"

#module("node:fs")
extern "js" fn unwatch_file(path : String) -> Unit = "unwatchFile"

#module("node:fs")
extern "js" fn unlink_sync(path : String) -> Unit = "unlinkSync"

///| watchFile - import via #module
#module("node:fs")
extern "js" fn watch_file(path : String, callback : (JsValue, JsValue) -> Unit) -> JsValue = "watchFile"

///| Node.js path module
#module("node:path")
extern "js" fn path_basename(path : String) -> String = "basename"

#module("node:path")
extern "js" fn path_extname(path : String) -> String = "extname"

#module("node:path")
extern "js" fn path_join(a : String, b : String) -> String = "join"

#module("node:path")
extern "js" fn path_resolve(path : String) -> String = "resolve"

///| Node.js process
extern "js" fn get_argv() -> Array[String] =
  #|() => process.argv

extern "js" fn process_exit(code : Int) -> Unit =
  #|(code) => process.exit(code)

extern "js" fn process_stdout_write(data : String) -> Unit =
  #|(data) => process.stdout.write(data)

///| Read stdin via /dev/stdin (Linux/macOS)
fn read_stdin_sync() -> String {
  read_file_sync("/dev/stdin", "utf-8")
}

extern "js" fn is_stdin_tty() -> Bool =
  #|() => process.stdin.isTTY || false

///| Node.js http module - import createServer via #module
#module("node:http")
extern "js" fn http_create_server_raw(handler : (JsValue, JsValue) -> Unit) -> JsValue = "createServer"

///|
fn create_server(handler : (JsValue, JsValue) -> Unit) -> JsValue {
  http_create_server_raw(handler)
}

extern "js" fn server_listen(server : JsValue, port : Int, callback : () -> Unit) -> Unit =
  #|(server, port, cb) => server.listen(port, "127.0.0.1", cb)

///| HTTP request helpers
extern "js" fn req_method(req : JsValue) -> String =
  #|(req) => req.method

extern "js" fn req_url(req : JsValue) -> String =
  #|(req) => req.url

extern "js" fn read_body(req : JsValue, callback : (String) -> Unit) -> Unit =
  #|(req, cb) => {
  #|  let body = "";
  #|  req.on("data", (chunk) => { body += chunk; });
  #|  req.on("end", () => cb(body));
  #|}

///| HTTP response helpers
extern "js" fn res_write_head(res : JsValue, status : Int, content_type : String) -> Unit =
  #|(res, status, ct) => res.writeHead(status, {"Content-Type": ct})

extern "js" fn res_write_head_with_headers(res : JsValue, status : Int, headers : String) -> Unit =
  #|(res, status, hdrs) => res.writeHead(status, JSON.parse(hdrs))

extern "js" fn res_write(res : JsValue, data : String) -> Unit =
  #|(res, data) => res.write(data)

extern "js" fn res_end(res : JsValue, data : String) -> Unit =
  #|(res, data) => res.end(data)

///| SSE helpers
extern "js" fn setup_sse(res : JsValue) -> Unit =
  #|(res) => {
  #|  res.writeHead(200, {
  #|    "Content-Type": "text/event-stream",
  #|    "Cache-Control": "no-cache",
  #|    "Connection": "keep-alive",
  #|    "Access-Control-Allow-Origin": "*"
  #|  });
  #|  res.write("retry: 3000\n\n");
  #|}

extern "js" fn sse_send(res : JsValue, event : String, data : String) -> Unit =
  #|(res, event, data) => res.write(`event: ${event}\ndata: ${data}\n\n`)

extern "js" fn on_close(obj : JsValue, callback : () -> Unit) -> Unit =
  #|(obj, cb) => obj.on("close", cb)

///| Timer
extern "js" fn set_interval(callback : () -> Unit, ms : Int) -> JsValue =
  #|(cb, ms) => setInterval(cb, ms)

extern "js" fn clear_interval(id : JsValue) -> Unit =
  #|(id) => clearInterval(id)

///| Open browser - import exec via #module
#module("node:child_process")
extern "js" fn child_exec(cmd : String) -> Unit = "exec"

///|
fn open_browser(url : String) -> Unit {
  let platform = get_platform()
  if platform == "darwin" {
    child_exec("open \"\{url}\"")
  } else if platform == "win32" {
    child_exec("start \"\{url}\"")
  } else {
    child_exec("xdg-open \"\{url}\" 2>/dev/null || termux-open-url \"\{url}\"")
  }
}

extern "js" fn get_platform() -> String =
  #|() => process.platform

///| Console
extern "js" fn console_log(msg : String) -> Unit =
  #|(msg) => console.log(msg)

extern "js" fn console_error(msg : String) -> Unit =
  #|(msg) => console.error(msg)

///| JSON
extern "js" fn json_parse_string(key : String, json_str : String) -> String =
  #|(key, s) => { try { return JSON.parse(s)[key] || ""; } catch(e) { return ""; } }

extern "js" fn json_parse_int(key : String, json_str : String) -> Int =
  #|(key, s) => { try { return JSON.parse(s)[key] || 0; } catch(e) { return 0; } }

///| Create options object for mkdirSync recursive
extern "js" fn mkdir_recursive_opts() -> JsValue =
  #|() => ({ recursive: true })

///| Get the directory of the current script (ESM compatible)
extern "js" fn get_script_dir() -> String =
  #|() => {
  #|  const url = new URL(import.meta.url);
  #|  const path = decodeURIComponent(url.pathname);
  #|  return path.substring(0, path.lastIndexOf("/"));
  #|}

///| Server error handler
extern "js" fn server_on_error(server : JsValue, callback : (JsValue) -> Unit) -> Unit =
  #|(server, cb) => server.on("error", cb)

///| Get error code from error object
extern "js" fn error_code(err : JsValue) -> String =
  #|(err) => err.code || ""

///| JSON parse comments array from body
extern "js" fn json_parse_comments(json_str : String) -> Array[Array[String]] =
  #|(s) => {
  #|  try {
  #|    const obj = JSON.parse(s);
  #|    return (obj.comments || []).map(c => [String(c.row), String(c.col), c.text || "", c.value || ""]);
  #|  } catch(e) { return []; }
  #|}

///| Home directory
#module("node:os")
extern "js" fn os_homedir() -> String = "homedir"

///|
fn get_home_dir() -> String {
  os_homedir()
}

///| Process signal handler
extern "js" fn on_process_signal(signal : String, handler : () -> Unit) -> Unit =
  #|(sig, handler) => process.on(sig, handler)

///| Crypto - createHash returns an object, need inline wrapper
extern "js" fn sha256_hex(data : String) -> String =
  #|(data) => {
  #|  const encoder = new TextEncoder();
  #|  const bytes = encoder.encode(data);
  #|  let hash = 0;
  #|  for (let i = 0; i < bytes.length; i++) {
  #|    hash = ((hash << 5) - hash + bytes[i]) | 0;
  #|  }
  #|  return (hash >>> 0).toString(16).padStart(8, "0");
  #|}
