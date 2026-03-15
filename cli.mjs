import { dirname as dirname$2065, join as join$1985, resolve as resolve$2017, extname as extname$2005, basename as basename$2015 } from "node:path";
import { spawnSync as spawnSync$2087, execSync as execSync$2052, spawn as spawn$2082 } from "node:child_process";
import { createHash as createHash$2039 } from "node:crypto";
import { createServer as createServer$2022 } from "node:http";
import { tmpdir as tmpdir$2057, homedir as homedir$1990 } from "node:os";
import { statSync as statSync$2101, unwatchFile as unwatchFile$2045, readdirSync as readdirSync$2068, existsSync as existsSync$1982, rmSync as rmSync$2077, mkdtempSync as mkdtempSync$2056, createReadStream as createReadStream$2105, writeFileSync as writeFileSync$1996, unlinkSync as unlinkSync$1998, readFileSync as readFileSync$1988, watchFile as watchFile$2141, mkdirSync as mkdirSync$1993 } from "node:fs";
class $PanicError extends Error {}
function $panic() {
  throw new $PanicError();
}
function $bound_check(arr, index) {
  if (index < 0 || index >= arr.length) throw new Error("Index out of bounds");
}
function $compare_int(a, b) {
  return (a >= b) - (a <= b);
}
const _M0FP311moonbitlang4core7builtin12random__seed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0] | 0; // Convert to signed 32
  } else {
    return Math.floor(Math.random() * 0x100000000) | 0; // Fallback to Math.random
  }
};
function Result$Err$0$(param0) {
  this._0 = param0;
}
Result$Err$0$.prototype.$tag = 0;
function Result$Ok$0$(param0) {
  this._0 = param0;
}
Result$Ok$0$.prototype.$tag = 1;
const Error$moonbitlang$47$core$47$builtin$46$CreatingViewError$46$IndexOutOfBounds = { $tag: 1 };
const Error$moonbitlang$47$core$47$builtin$46$CreatingViewError$46$InvalidIndex = { $tag: 0 };
const _M0FP311moonbitlang4core7builtin19int__to__string__js = (x, radix) => {
  return x.toString(radix);
};
function $make_array_len_and_init(a, b) {
  const arr = new Array(a);
  arr.fill(b);
  return arr;
}
const _M0MP311moonbitlang4core7builtin7JSArray4push = (arr, val) => { arr.push(val); };
const _M0MP311moonbitlang4core7builtin7JSArray4copy = (arr) => arr.slice(0);
const _M0MP311moonbitlang4core7builtin7JSArray11set__length = (arr, len) => { arr.length = len; };
const _M0MP311moonbitlang4core7builtin7JSArray3pop = (arr) => arr.pop();
const _M0MP311moonbitlang4core7builtin7JSArray6splice = (arr, idx, cnt) => arr.splice(idx, cnt);
const Option$None$1$ = { $tag: 0 };
function Option$Some$1$(param0) {
  this._0 = param0;
}
Option$Some$1$.prototype.$tag = 1;
const _M0FP36kazuph5reviw6server14console__error = (msg) => console.error(msg);
const _M0FP36kazuph5reviw6server16get__script__dir = () => {
  const url = new URL(import.meta.url);
  const path = decodeURIComponent(url.pathname);
  return path.substring(0, path.lastIndexOf("/"));
};
const _M0FP36kazuph5reviw6server13get__env__var = (name) => process.env[name] || "";
const _M0FP36kazuph5reviw6server22mkdir__recursive__opts = () => ({ recursive: true });
const _M0FP36kazuph5reviw6server12console__log = (msg) => console.log(msg);
const _M0FP36kazuph5reviw6server9get__argv = () => process.argv;
const _M0FP36kazuph5reviw6server14is__stdin__tty = () => process.stdin.isTTY || false;
const _M0FP36kazuph5reviw6server19on__process__signal = (sig, handler) => process.on(sig, handler);
const _M0FP36kazuph5reviw6server13process__exit = (code) => process.exit(code);
const _M0FP36kazuph5reviw6server14decode__buffer = (buf, enc) => {
  try {
    if (enc === "utf-8" || enc === "utf8") return buf.toString("utf-8");
    const td = new TextDecoder(enc);
    return td.decode(buf);
  } catch(e) { return buf.toString("utf-8"); }
};
const _M0FP36kazuph5reviw6server10buffer__at = (buf, idx) => buf[idx];
const _M0FP36kazuph5reviw6server14buffer__length = (buf) => buf.length;
const _M0FP36kazuph5reviw6server9sse__send = (res, event, data) => res.write(`event: ${event}\ndata: ${data}\n\n`);
const _M0FP36kazuph5reviw6server11error__code = (err) => err.code || "";
const _M0FP36kazuph5reviw6server20buffer__from__base64 = (data) => Buffer.from(data, "base64");
const _M0FP36kazuph5reviw6server21extract__base64__data = (data) => {
  const m = data.match(/^data:image\/(\w+);base64,(.+)$/);
  return m ? m[2] : "";
};
const _M0FP36kazuph5reviw6server20extract__base64__ext = (data) => {
  const m = data.match(/^data:image\/(\w+);base64,/);
  return m ? (m[1] === "jpeg" ? "jpg" : m[1]) : "";
};
const _M0FP36kazuph5reviw6server17try__call__string = (fn, fb) => { try { return fn(); } catch(e) { return fb; } };
const _M0FP36kazuph5reviw6server8iso__now = () => new Date().toISOString();
const _M0FP36kazuph5reviw6server21json__parse__comments = (s) => {
  try {
    const obj = JSON.parse(s);
    return (obj.comments || []).map(c => [String(c.row), String(c.col), c.text || "", c.value || "", c.image || ""]);
  } catch(e) { return []; }
};
const _M0FP36kazuph5reviw6server19json__parse__images = (s) => { try { return JSON.parse(s).summaryImages || []; } catch(e) { return []; } };
const _M0FP36kazuph5reviw6server19json__parse__string = (key, s) => { try { return JSON.parse(s)[key] || ""; } catch(e) { return ""; } };
const _M0FP36kazuph5reviw6server22process__stdout__write = (data) => process.stdout.write(data);
const _M0FP36kazuph5reviw6server11chmod__sync = (path, mode) => { try { import("node:fs").then(fs => fs.chmodSync(path, mode)); } catch(e) {} };
const _M0FP36kazuph5reviw6server27hash__update__digest__hex16 = (h, d) => h.update(d).digest("hex").slice(0, 16);
const _M0FP36kazuph5reviw6server15try__call__void = (fn) => { try { fn(); } catch(e) {} };
const _M0FP36kazuph5reviw6server15js__stdio__pipe = () => ({ stdio: "pipe" });
const _M0FP36kazuph5reviw6server15try__call__bool = (fn) => { try { return fn(); } catch(e) { return false; } };
const _M0FP36kazuph5reviw6server16on__spawn__close = (proc, handler) => proc.on("close", (code) => handler(code || 0));
const _M0FP36kazuph5reviw6server16on__spawn__error = (proc, handler) => proc.on("error", () => handler());
const _M0FP36kazuph5reviw6server19parse__query__param = (url, key) => {
  try {
    const u = new URL("http://localhost" + url);
    return u.searchParams.get(key) || "";
  } catch(e) { return ""; }
};
const _M0FP36kazuph5reviw6server15buf__to__base64 = (buf) => buf.toString("base64");
const _M0FP36kazuph5reviw6server24try__call__array__string = (fn) => { try { return fn(); } catch(e) { return []; } };
const _M0FP36kazuph5reviw6server8res__end = (res, data) => res.end(data);
const _M0FP36kazuph5reviw6server16res__write__head = (res, status, ct) => res.writeHead(status, {"Content-Type": ct});
const _M0FP36kazuph5reviw6server12js__rm__opts = () => ({ recursive: true, force: true });
const _M0FP36kazuph5reviw6server10setup__sse = (res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  res.write("retry: 3000\n\n");
};
const _M0FP36kazuph5reviw6server15js__parse__json = (s) => JSON.parse(s);
const _M0FP36kazuph5reviw6server21js__spawn__opts__pipe = () => ({ stdio: ["pipe", "pipe", "pipe"] });
const _M0FP36kazuph5reviw6server15js__obj__stdout = (obj) => obj?.stdout || "";
const _M0FP36kazuph5reviw6server27js__spawn__opts__utf8__pipe = () => ({ encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
const _M0FP36kazuph5reviw6server9on__close = (obj, cb) => obj.on("close", cb);
const _M0FP36kazuph5reviw6server10read__body = (req, cb) => {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => cb(body));
};
const _M0FP36kazuph5reviw6server11js__ref__eq = (a, b) => a === b;
const _M0FP36kazuph5reviw6server11req__method = (req) => req.method;
const _M0FP36kazuph5reviw6server8req__url = (req) => req.url;
const _M0FP36kazuph5reviw6server18js__stat__is__file = (s) => s.isFile();
const _M0FP36kazuph5reviw6server8js__pipe = (r, w) => r.pipe(w);
const _M0FP36kazuph5reviw6server15js__range__opts = (s, e) => ({start: s, end: e});
const _M0FP36kazuph5reviw6server14js__stat__size = (s) => s.size;
const _M0FP36kazuph5reviw6server20parse__range__header = (rangeHeader, fileSize) => {
  const parts = rangeHeader.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  return {_0: start, _1: end};
};
const _M0FP36kazuph5reviw6server23res__write__head__range = (res, ct, start, end, fileSize, chunkSize) => {
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": ct
  });
};
const _M0FP36kazuph5reviw6server16res__set__header = (res, name, value) => { if (res && !res.headersSent) res.setHeader(name, value); };
const _M0FP36kazuph5reviw6server31res__write__head__with__headers = (res, status, ct, cl, cache) => {
  const headers = {"Content-Type": ct, "Content-Length": cl};
  if (cache) headers["Cache-Control"] = "public, max-age=3600";
  res.writeHead(status, headers);
};
const _M0FP36kazuph5reviw6server18req__range__header = (req) => req.headers.range || "";
const _M0FP36kazuph5reviw6server22child__spawn__detached = (cmd, args) => {
  import("node:child_process").then(m => {
    const c = m.spawn(cmd, Array.from(args), { detached: true, stdio: 'ignore' });
    if (c.unref) c.unref();
  });
};
const _M0FP36kazuph5reviw6server13get__platform = () => process.platform;
const _M0FP36kazuph5reviw6server21js__spawn__opts__utf8 = () => ({ encoding: "utf8", timeout: 3000 });
const _M0FP36kazuph5reviw6server14server__listen = (server, port, cb) => server.listen(port, "127.0.0.1", cb);
const _M0FP36kazuph5reviw6server17server__on__error = (server, cb) => server.on("error", cb);
const _M0FP36kazuph5reviw6server13set__interval = (cb, ms) => setInterval(cb, ms);
const _M0FP095_40moonbitlang_2fcore_2fbuiltin_2eStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger = { method_0: _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string, method_1: _M0IP016_24default__implP311moonbitlang4core7builtin6Logger16write__substringGRP311moonbitlang4core7builtin13StringBuilderE, method_2: _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__view, method_3: _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char };
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c639 = ":";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c640 = "#";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c641 = "'";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c642 = "\"";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c643 = "\n";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c644 = "[";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c645 = "]";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c646 = "{";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c647 = "}";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c648 = ",";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c649 = "&";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c650 = "*";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c651 = "!";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c652 = "|";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c653 = ">";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c654 = "%";
const _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c655 = "@";
const _M0FP36kazuph5reviw4core32split__to__lines_2e_2abind_7c680 = "\n";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c693 = "- ";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c694 = "    -";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c695 = "      ";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c696 = "    ";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c698 = "- ";
const _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c699 = "        ";
const _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c703 = "- ";
const _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c704 = "  ";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c719 = "<details";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c720 = "<div";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c721 = "<section";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c722 = "<article";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c723 = "<aside";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c724 = "<nav";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c725 = "<header";
const _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c726 = "<footer";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c728 = "#";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c729 = "```";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c730 = ">";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c731 = "- ";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c732 = "* ";
const _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c733 = "<";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c734 = "graph ";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c735 = "flowchart ";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c736 = "sequenceDiagram";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c737 = "classDiagram";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c738 = "stateDiagram";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c739 = "erDiagram";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c740 = "journey";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c741 = "gantt";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c742 = "pie";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c743 = "gitGraph";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c744 = "mindmap";
const _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c745 = "timeline";
const _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c746 = "|";
const _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c747 = "-";
const _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c760 = "|";
const _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c761 = "|";
const _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c762 = "|";
const _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c759 = "|";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c763 = ".mp4";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c764 = ".webm";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c765 = ".mov";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c766 = ".avi";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c767 = ".mkv";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c768 = ".m4v";
const _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c769 = ".ogv";
const _M0FP36kazuph5reviw4core30render__inline_2e_2abind_7c775 = "javascript:";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c788 = "expression(";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c789 = "url(";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c790 = "-moz-binding";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c791 = "behavior:";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c792 = "behaviour:";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c793 = "javascript:";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c794 = "vbscript:";
const _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c795 = "@import";
const _M0FP36kazuph5reviw4core40is__event__handler__attr_2e_2abind_7c796 = "on";
const _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c797 = "javascript:";
const _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c798 = "data:text/html";
const _M0FP36kazuph5reviw4core30sanitize__html_2e_2abind_7c814 = ">";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c816 = "<";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c818 = "<summary>";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c819 = "</details>";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c821 = "</details>";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c822 = "<details";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c826 = "#";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c827 = "```";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c829 = "```";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c830 = ">";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c832 = ">";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c835 = "- ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c836 = "* ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c841 = "- ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c842 = "* ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c838 = "[ ] ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c839 = "[x] ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c840 = "[X] ";
const _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c849 = "|";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c934 = "@@ ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c936 = "@@ ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c937 = "diff ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c938 = "--- ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c939 = "+";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c940 = "-";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c941 = " ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c942 = "diff ";
const _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c943 = "--- ";
const _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c945 = "a/";
const _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c946 = "b/";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c948 = "diff --git ";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c950 = "new file mode";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c951 = "deleted file mode";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c952 = "Binary files";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c953 = "index ";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c954 = "--- ";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c955 = "+++ ";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c956 = "--- ";
const _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c957 = "+++ ";
const _M0FP36kazuph5reviw6server15active__servers = [];
const _M0FP36kazuph5reviw6server12all__results = [];
const _M0FP36kazuph5reviw6server26print__usage_2eusage_7c384 = "Usage: reviw <file...> [options]\n\nOptions:\n  --port <n>        Base port (default: 4989)\n  --no-open         Don't open browser\n  -e, --encoding <enc>  Force encoding (e.g. shift-jis, euc-jp)\n  -h, --help        Show help\n  -v, --version     Show version\n\nSupported formats: CSV, TSV, Markdown, Diff, Plain text\nPipe stdin for diff: git diff | reviw";
const _M0FP36kazuph5reviw6server28detect__mode_2e_2abind_7c427 = ".";
const _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c458 = "..";
const _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c461 = "scene_";
const _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c462 = ".jpg";
const _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c489 = "/";
const _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c487 = "..";
const _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c488 = "video/";
const _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c491 = "/";
const _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c490 = "..";
const _M0FP36kazuph5reviw6server31handle__request_2e_2abind_7c492 = "/video-timeline?";
const _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c493 = "true";
const _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c494 = "true";
const _M0FP36kazuph5reviw6server26_2ainit_2a_2e_2abind_7c504 = "-";
const _M0FP36kazuph5reviw6server15expected__count = _M0MP311moonbitlang4core3ref3Ref3newGiE(0);
const _M0FP36kazuph5reviw6server18encoding__override = _M0MP311moonbitlang4core3ref3Ref3newGsE("");
const _M0FP311moonbitlang4core7builtin33brute__force__find_2econstr_2f241 = 0;
const _M0FP311moonbitlang4core7builtin43boyer__moore__horspool__find_2econstr_2f227 = 0;
const _M0FP36kazuph5reviw6server13ui__js__cache = _M0MP311moonbitlang4core3ref3Ref3newGsE("");
const _M0FP311moonbitlang4core7builtin4seed = _M0FP311moonbitlang4core7builtin12random__seed();
const _M0FP36kazuph5reviw4core16heading__counter = _M0MP311moonbitlang4core3ref3Ref3newGiE(0);
function _M0FP311moonbitlang4core5abort5abortGRP311moonbitlang4core6string10StringViewE(msg) {
  return $panic();
}
function _M0FP311moonbitlang4core5abort5abortGRP36kazuph5reviw6server7JsValueE(msg) {
  return $panic();
}
function _M0MP311moonbitlang4core7builtin6Hasher8consume4(self, input) {
  const _p = (self.acc >>> 0) + ((Math.imul(input, -1028477379) | 0) >>> 0) | 0;
  const _p$2 = 17;
  self.acc = Math.imul(_p << _p$2 | (_p >>> (32 - _p$2 | 0) | 0), 668265263) | 0;
}
function _M0MP311moonbitlang4core7builtin6Hasher13combine__uint(self, value) {
  self.acc = (self.acc >>> 0) + (4 >>> 0) | 0;
  _M0MP311moonbitlang4core7builtin6Hasher8consume4(self, value);
}
function _M0FP311moonbitlang4core7builtin5abortGRP311moonbitlang4core6string10StringViewE(string, loc) {
  return _M0FP311moonbitlang4core5abort5abortGRP311moonbitlang4core6string10StringViewE(`${string}\n  at ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGRP311moonbitlang4core7builtin9SourceLocE(loc)}\n`);
}
function _M0FP311moonbitlang4core7builtin5abortGRP36kazuph5reviw6server7JsValueE(string, loc) {
  return _M0FP311moonbitlang4core5abort5abortGRP36kazuph5reviw6server7JsValueE(`${string}\n  at ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGRP311moonbitlang4core7builtin9SourceLocE(loc)}\n`);
}
function _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(size_hint) {
  return { val: "" };
}
function _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(self, ch) {
  const _bind = self;
  _bind.val = `${_bind.val}${String.fromCodePoint(ch)}`;
}
function _M0MP311moonbitlang4core6uint166UInt1622is__leading__surrogate(self) {
  return _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__geGkE(self, 55296) && _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__leGkE(self, 56319);
}
function _M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(self) {
  return _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__geGkE(self, 56320) && _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__leGkE(self, 57343);
}
function _M0FP311moonbitlang4core7builtin32code__point__of__surrogate__pair(leading, trailing) {
  return (((Math.imul(leading - 55296 | 0, 1024) | 0) + trailing | 0) - 56320 | 0) + 65536 | 0;
}
function _M0MP311moonbitlang4core5array5Array2atGsE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MP311moonbitlang4core5array5Array2atGcE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MP311moonbitlang4core5array5Array2atGRP311moonbitlang4core7builtin5ArrayGsEE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MP311moonbitlang4core5array5Array2atGRP36kazuph5reviw4core12ReviewResultE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MP311moonbitlang4core7builtin13SourceLocRepr5parse(repr) {
  const _bind = { str: repr, start: 0, end: repr.length };
  const _data = _bind.str;
  const _start = _bind.start;
  const _end = _start + (_bind.end - _bind.start | 0) | 0;
  let _cursor = _start;
  let accept_state = -1;
  let match_end = -1;
  let match_tag_saver_0 = -1;
  let match_tag_saver_1 = -1;
  let match_tag_saver_2 = -1;
  let match_tag_saver_3 = -1;
  let match_tag_saver_4 = -1;
  let tag_0 = -1;
  let tag_1 = -1;
  let tag_1_1 = -1;
  let tag_1_2 = -1;
  let tag_3 = -1;
  let tag_2 = -1;
  let tag_2_1 = -1;
  let tag_4 = -1;
  _L: {
    if (_cursor < _end) {
      const _p = _cursor;
      const next_char = _data.charCodeAt(_p);
      _cursor = _cursor + 1 | 0;
      if (next_char === 64) {
        _L$2: while (true) {
          tag_0 = _cursor;
          if (_cursor < _end) {
            const _p$2 = _cursor;
            const next_char$2 = _data.charCodeAt(_p$2);
            _cursor = _cursor + 1 | 0;
            if (next_char$2 === 58) {
              if (_cursor < _end) {
                const _p$3 = _cursor;
                _data.charCodeAt(_p$3);
                _cursor = _cursor + 1 | 0;
                let _tmp = 0;
                _L$3: while (true) {
                  const dispatch_15 = _tmp;
                  _L$4: {
                    _L$5: {
                      switch (dispatch_15) {
                        case 3: {
                          tag_1_2 = tag_1_1;
                          tag_1_1 = tag_1;
                          tag_1 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 58) {
                                if (next_char$3 < 48) {
                                  break _L$6;
                                } else {
                                  tag_1 = _cursor;
                                  tag_2_1 = tag_2;
                                  tag_2 = _cursor;
                                  tag_3 = _cursor;
                                  if (_cursor < _end) {
                                    _L$7: {
                                      const _p$5 = _cursor;
                                      const next_char$4 = _data.charCodeAt(_p$5);
                                      _cursor = _cursor + 1 | 0;
                                      if (next_char$4 < 48) {
                                        if (next_char$4 === 45) {
                                          break _L$4;
                                        } else {
                                          break _L$7;
                                        }
                                      } else {
                                        if (next_char$4 > 57) {
                                          if (next_char$4 < 59) {
                                            _tmp = 3;
                                            continue _L$3;
                                          } else {
                                            break _L$7;
                                          }
                                        } else {
                                          _tmp = 6;
                                          continue _L$3;
                                        }
                                      }
                                    }
                                    _tmp = 0;
                                    continue _L$3;
                                  } else {
                                    break _L;
                                  }
                                }
                              } else {
                                if (next_char$3 > 58) {
                                  break _L$6;
                                } else {
                                  _tmp = 1;
                                  continue _L$3;
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L;
                          }
                        }
                        case 2: {
                          tag_1 = _cursor;
                          tag_2 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 58) {
                                if (next_char$3 < 48) {
                                  break _L$6;
                                } else {
                                  _tmp = 2;
                                  continue _L$3;
                                }
                              } else {
                                if (next_char$3 > 58) {
                                  break _L$6;
                                } else {
                                  _tmp = 3;
                                  continue _L$3;
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L;
                          }
                        }
                        case 0: {
                          tag_1 = _cursor;
                          if (_cursor < _end) {
                            const _p$4 = _cursor;
                            const next_char$3 = _data.charCodeAt(_p$4);
                            _cursor = _cursor + 1 | 0;
                            if (next_char$3 === 58) {
                              _tmp = 1;
                              continue _L$3;
                            } else {
                              _tmp = 0;
                              continue _L$3;
                            }
                          } else {
                            break _L;
                          }
                        }
                        case 4: {
                          tag_1 = _cursor;
                          tag_4 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 58) {
                                if (next_char$3 < 48) {
                                  break _L$6;
                                } else {
                                  _tmp = 4;
                                  continue _L$3;
                                }
                              } else {
                                if (next_char$3 > 58) {
                                  break _L$6;
                                } else {
                                  tag_1_2 = tag_1_1;
                                  tag_1_1 = tag_1;
                                  tag_1 = _cursor;
                                  if (_cursor < _end) {
                                    _L$7: {
                                      const _p$5 = _cursor;
                                      const next_char$4 = _data.charCodeAt(_p$5);
                                      _cursor = _cursor + 1 | 0;
                                      if (next_char$4 < 58) {
                                        if (next_char$4 < 48) {
                                          break _L$7;
                                        } else {
                                          tag_1 = _cursor;
                                          tag_2_1 = tag_2;
                                          tag_2 = _cursor;
                                          if (_cursor < _end) {
                                            _L$8: {
                                              const _p$6 = _cursor;
                                              const next_char$5 = _data.charCodeAt(_p$6);
                                              _cursor = _cursor + 1 | 0;
                                              if (next_char$5 < 58) {
                                                if (next_char$5 < 48) {
                                                  break _L$8;
                                                } else {
                                                  _tmp = 5;
                                                  continue _L$3;
                                                }
                                              } else {
                                                if (next_char$5 > 58) {
                                                  break _L$8;
                                                } else {
                                                  _tmp = 3;
                                                  continue _L$3;
                                                }
                                              }
                                            }
                                            _tmp = 0;
                                            continue _L$3;
                                          } else {
                                            break _L$5;
                                          }
                                        }
                                      } else {
                                        if (next_char$4 > 58) {
                                          break _L$7;
                                        } else {
                                          _tmp = 1;
                                          continue _L$3;
                                        }
                                      }
                                    }
                                    _tmp = 0;
                                    continue _L$3;
                                  } else {
                                    break _L;
                                  }
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L;
                          }
                        }
                        case 5: {
                          tag_1 = _cursor;
                          tag_2 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 58) {
                                if (next_char$3 < 48) {
                                  break _L$6;
                                } else {
                                  _tmp = 5;
                                  continue _L$3;
                                }
                              } else {
                                if (next_char$3 > 58) {
                                  break _L$6;
                                } else {
                                  _tmp = 3;
                                  continue _L$3;
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L$5;
                          }
                        }
                        case 6: {
                          tag_1 = _cursor;
                          tag_2 = _cursor;
                          tag_3 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 48) {
                                if (next_char$3 === 45) {
                                  break _L$4;
                                } else {
                                  break _L$6;
                                }
                              } else {
                                if (next_char$3 > 57) {
                                  if (next_char$3 < 59) {
                                    _tmp = 3;
                                    continue _L$3;
                                  } else {
                                    break _L$6;
                                  }
                                } else {
                                  _tmp = 6;
                                  continue _L$3;
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L;
                          }
                        }
                        case 1: {
                          tag_1_1 = tag_1;
                          tag_1 = _cursor;
                          if (_cursor < _end) {
                            _L$6: {
                              const _p$4 = _cursor;
                              const next_char$3 = _data.charCodeAt(_p$4);
                              _cursor = _cursor + 1 | 0;
                              if (next_char$3 < 58) {
                                if (next_char$3 < 48) {
                                  break _L$6;
                                } else {
                                  _tmp = 2;
                                  continue _L$3;
                                }
                              } else {
                                if (next_char$3 > 58) {
                                  break _L$6;
                                } else {
                                  _tmp = 1;
                                  continue _L$3;
                                }
                              }
                            }
                            _tmp = 0;
                            continue _L$3;
                          } else {
                            break _L;
                          }
                        }
                        default: {
                          break _L;
                        }
                      }
                    }
                    tag_1 = tag_1_2;
                    tag_2 = tag_2_1;
                    match_tag_saver_0 = tag_0;
                    match_tag_saver_1 = tag_1;
                    match_tag_saver_2 = tag_2;
                    match_tag_saver_3 = tag_3;
                    match_tag_saver_4 = tag_4;
                    accept_state = 0;
                    match_end = _cursor;
                    break _L;
                  }
                  tag_1_1 = tag_1_2;
                  tag_1 = _cursor;
                  tag_2 = tag_2_1;
                  if (_cursor < _end) {
                    _L$5: {
                      const _p$4 = _cursor;
                      const next_char$3 = _data.charCodeAt(_p$4);
                      _cursor = _cursor + 1 | 0;
                      if (next_char$3 < 58) {
                        if (next_char$3 < 48) {
                          break _L$5;
                        } else {
                          _tmp = 4;
                          continue;
                        }
                      } else {
                        if (next_char$3 > 58) {
                          break _L$5;
                        } else {
                          _tmp = 1;
                          continue;
                        }
                      }
                    }
                    _tmp = 0;
                    continue;
                  } else {
                    break _L;
                  }
                }
              } else {
                break _L;
              }
            } else {
              continue;
            }
          } else {
            break _L;
          }
        }
      } else {
        break _L;
      }
    } else {
      break _L;
    }
  }
  if (accept_state === 0) {
    let start_line;
    let _try_err;
    _L$2: {
      _L$3: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_1 + 1 | 0, match_tag_saver_2);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          start_line = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err = _err._0;
          break _L$3;
        }
        break _L$2;
      }
      start_line = $panic();
    }
    let start_column;
    let _try_err$2;
    _L$3: {
      _L$4: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_2 + 1 | 0, match_tag_saver_3);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          start_column = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err$2 = _err._0;
          break _L$4;
        }
        break _L$3;
      }
      start_column = $panic();
    }
    let pkg;
    let _try_err$3;
    _L$4: {
      _L$5: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, _start + 1 | 0, match_tag_saver_0);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          pkg = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err$3 = _err._0;
          break _L$5;
        }
        break _L$4;
      }
      pkg = $panic();
    }
    let filename;
    let _try_err$4;
    _L$5: {
      _L$6: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_0 + 1 | 0, match_tag_saver_1);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          filename = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err$4 = _err._0;
          break _L$6;
        }
        break _L$5;
      }
      filename = $panic();
    }
    let end_line;
    let _try_err$5;
    _L$6: {
      _L$7: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_3 + 1 | 0, match_tag_saver_4);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          end_line = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err$5 = _err._0;
          break _L$7;
        }
        break _L$6;
      }
      end_line = $panic();
    }
    let end_column;
    let _try_err$6;
    _L$7: {
      _L$8: {
        const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_4 + 1 | 0, match_end);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          end_column = _ok._0;
        } else {
          const _err = _bind$2;
          _try_err$6 = _err._0;
          break _L$8;
        }
        break _L$7;
      }
      end_column = $panic();
    }
    return { pkg: pkg, filename: filename, start_line: start_line, start_column: start_column, end_line: end_line, end_column: end_column };
  } else {
    return $panic();
  }
}
function _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(self, str) {
  const _bind = self;
  _bind.val = `${_bind.val}${str}`;
}
function _M0MP311moonbitlang4core7builtin6Hasher7combineGsE(self, value) {
  _M0IP311moonbitlang4core6string6StringP311moonbitlang4core7builtin4Hash13hash__combine(value, self);
}
function _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__leGkE(x, y) {
  return $compare_int(x, y) <= 0;
}
function _M0IP016_24default__implP311moonbitlang4core7builtin7Compare6op__geGkE(x, y) {
  return $compare_int(x, y) >= 0;
}
function _M0MP311moonbitlang4core7builtin6Hasher9avalanche(self) {
  let acc = self.acc;
  acc = acc ^ (acc >>> 15 | 0);
  acc = Math.imul(acc, -2048144777) | 0;
  acc = acc ^ (acc >>> 13 | 0);
  acc = Math.imul(acc, -1028477379) | 0;
  acc = acc ^ (acc >>> 16 | 0);
  return acc;
}
function _M0MP311moonbitlang4core7builtin6Hasher8finalize(self) {
  return _M0MP311moonbitlang4core7builtin6Hasher9avalanche(self);
}
function _M0MP311moonbitlang4core7builtin6Hasher11new_2einner(seed) {
  return { acc: (seed >>> 0) + (374761393 >>> 0) | 0 };
}
function _M0MP311moonbitlang4core7builtin6Hasher3new(seed$46$opt) {
  let seed;
  if (seed$46$opt === undefined) {
    seed = _M0FP311moonbitlang4core7builtin4seed;
  } else {
    const _Some = seed$46$opt;
    seed = _Some;
  }
  return _M0MP311moonbitlang4core7builtin6Hasher11new_2einner(seed);
}
function _M0IP016_24default__implP311moonbitlang4core7builtin4Hash4hashGsE(self) {
  const h = _M0MP311moonbitlang4core7builtin6Hasher3new(undefined);
  _M0MP311moonbitlang4core7builtin6Hasher7combineGsE(h, self);
  return _M0MP311moonbitlang4core7builtin6Hasher8finalize(h);
}
function _M0MP311moonbitlang4core6string6String11sub_2einner(self, start, end) {
  const len = self.length;
  let end$2;
  if (end === undefined) {
    end$2 = len;
  } else {
    const _Some = end;
    const _end = _Some;
    end$2 = _end < 0 ? len + _end | 0 : _end;
  }
  const start$2 = start < 0 ? len + start | 0 : start;
  if (start$2 >= 0 && (start$2 <= end$2 && end$2 <= len)) {
    if (start$2 < len && _M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(self.charCodeAt(start$2))) {
      return new Result$Err$0$(Error$moonbitlang$47$core$47$builtin$46$CreatingViewError$46$InvalidIndex);
    }
    if (end$2 < len && _M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(self.charCodeAt(end$2))) {
      return new Result$Err$0$(Error$moonbitlang$47$core$47$builtin$46$CreatingViewError$46$InvalidIndex);
    }
    return new Result$Ok$0$({ str: self, start: start$2, end: end$2 });
  } else {
    return new Result$Err$0$(Error$moonbitlang$47$core$47$builtin$46$CreatingViewError$46$IndexOutOfBounds);
  }
}
function _M0MP311moonbitlang4core6string6String3sub(self, start$46$opt, end) {
  let start;
  if (start$46$opt === undefined) {
    start = 0;
  } else {
    const _Some = start$46$opt;
    start = _Some;
  }
  return _M0MP311moonbitlang4core6string6String11sub_2einner(self, start, end);
}
function _M0IP016_24default__implP311moonbitlang4core7builtin6Logger16write__substringGRP311moonbitlang4core7builtin13StringBuilderE(self, value, start, len) {
  let _tmp;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0MP311moonbitlang4core6string6String11sub_2einner(value, start, start + len | 0);
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _tmp = _ok._0;
      } else {
        const _err = _bind;
        _try_err = _err._0;
        break _L$2;
      }
      break _L;
    }
    _tmp = $panic();
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__view(self, _tmp);
}
function _M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(self) {
  const logger = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core3int3IntP311moonbitlang4core7builtin4Show6output(self, { self: logger, method_table: _M0FP095_40moonbitlang_2fcore_2fbuiltin_2eStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger });
  return logger.val;
}
function _M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGRP311moonbitlang4core7builtin9SourceLocE(self) {
  const logger = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin9SourceLocP311moonbitlang4core7builtin4Show6output(self, { self: logger, method_table: _M0FP095_40moonbitlang_2fcore_2fbuiltin_2eStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger });
  return logger.val;
}
function _M0MP311moonbitlang4core7builtin4Iter4nextGcE(self) {
  const _func = self;
  return _func();
}
function _M0MP311moonbitlang4core7builtin4Iter4nextGRP311moonbitlang4core6string10StringViewE(self) {
  const _func = self;
  return _func();
}
function _M0MP311moonbitlang4core7builtin4Iter4nextGUicEE(self) {
  const _func = self;
  return _func();
}
function _M0MP311moonbitlang4core3int3Int18to__string_2einner(self, radix) {
  return _M0FP311moonbitlang4core7builtin19int__to__string__js(self, radix);
}
function _M0MP311moonbitlang4core6string10StringView12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.end - self.start | 0;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= (self.end - self.start | 0)) ? { str: self.str, start: self.start + start_offset | 0, end: self.start + end_offset$2 | 0 } : _M0FP311moonbitlang4core7builtin5abortGRP311moonbitlang4core6string10StringViewE("Invalid index for View", "@moonbitlang/core/builtin:stringview.mbt:113:5-113:36");
}
function _M0IP311moonbitlang4core6string10StringViewP311moonbitlang4core7builtin4Show10to__string(self) {
  return self.str.substring(self.start, self.end);
}
function _M0MP311moonbitlang4core6string10StringView4iter(self) {
  const start = self.start;
  const end = self.end;
  const index = { val: start };
  const _p = () => {
    if (index.val < end) {
      const c1 = self.str.charCodeAt(index.val);
      if (_M0MP311moonbitlang4core6uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < self.end) {
        const c2 = self.str.charCodeAt(index.val + 1 | 0);
        if (_M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(c2)) {
          index.val = index.val + 2 | 0;
          return _M0FP311moonbitlang4core7builtin32code__point__of__surrogate__pair(c1, c2);
        }
      }
      index.val = index.val + 1 | 0;
      return c1;
    } else {
      return -1;
    }
  };
  return _p;
}
function _M0MP311moonbitlang4core7builtin5Iter23newGicE(f) {
  return f;
}
function _M0MP311moonbitlang4core6string10StringView5iter2(self) {
  const start = self.start;
  const end = self.end;
  const index = { val: start };
  const char_index = { val: 0 };
  return _M0MP311moonbitlang4core7builtin5Iter23newGicE(() => {
    if (index.val < end) {
      const c1 = self.str.charCodeAt(index.val);
      if (_M0MP311moonbitlang4core6uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < self.end) {
        const c2 = self.str.charCodeAt(index.val + 1 | 0);
        if (_M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(c2)) {
          const result = { _0: char_index.val, _1: _M0FP311moonbitlang4core7builtin32code__point__of__surrogate__pair(c1, c2) };
          index.val = index.val + 2 | 0;
          char_index.val = char_index.val + 1 | 0;
          return result;
        }
      }
      const result = { _0: char_index.val, _1: c1 };
      index.val = index.val + 1 | 0;
      char_index.val = char_index.val + 1 | 0;
      return result;
    } else {
      return undefined;
    }
  });
}
function _M0MP311moonbitlang4core6string6String12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= self.length) ? { str: self, start: start_offset, end: end_offset$2 } : _M0FP311moonbitlang4core7builtin5abortGRP311moonbitlang4core6string10StringViewE("Invalid index for View", "@moonbitlang/core/builtin:stringview.mbt:399:5-399:36");
}
function _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__view(self, str) {
  const _bind = self;
  _bind.val = `${_bind.val}${_M0IP311moonbitlang4core6string10StringViewP311moonbitlang4core7builtin4Show10to__string(str)}`;
}
function _M0MP311moonbitlang4core7builtin13StringBuilder5reset(self) {
  self.val = "";
}
function _M0FP311moonbitlang4core7builtin28boyer__moore__horspool__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const skip_table = $make_array_len_and_init(256, needle_len);
      const _end4308 = needle_len - 1 | 0;
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i < _end4308) {
          const _tmp$2 = needle.str.charCodeAt(needle.start + i | 0) & 255;
          $bound_check(skip_table, _tmp$2);
          skip_table[_tmp$2] = (needle_len - 1 | 0) - i | 0;
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      let _tmp$2 = 0;
      while (true) {
        const i = _tmp$2;
        if (i <= (haystack_len - needle_len | 0)) {
          const _end4314 = needle_len - 1 | 0;
          let _tmp$3 = 0;
          while (true) {
            const j = _tmp$3;
            if (j <= _end4314) {
              const _p = i + j | 0;
              const _p$2 = haystack.str.charCodeAt(haystack.start + _p | 0);
              const _p$3 = needle.str.charCodeAt(needle.start + j | 0);
              if (_p$2 !== _p$3) {
                break;
              }
              _tmp$3 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          const _p = (i + needle_len | 0) - 1 | 0;
          const _tmp$4 = haystack.str.charCodeAt(haystack.start + _p | 0) & 255;
          $bound_check(skip_table, _tmp$4);
          _tmp$2 = i + skip_table[_tmp$4] | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FP311moonbitlang4core7builtin43boyer__moore__horspool__find_2econstr_2f227;
  }
}
function _M0FP311moonbitlang4core7builtin18brute__force__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const _p = 0;
      const needle_first = needle.str.charCodeAt(needle.start + _p | 0);
      const forward_len = haystack_len - needle_len | 0;
      let i = 0;
      while (true) {
        if (i <= forward_len) {
          while (true) {
            let _tmp;
            if (i <= forward_len) {
              const _p$2 = i;
              const _p$3 = haystack.str.charCodeAt(haystack.start + _p$2 | 0);
              _tmp = _p$3 !== needle_first;
            } else {
              _tmp = false;
            }
            if (_tmp) {
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (i <= forward_len) {
            let _tmp = 1;
            while (true) {
              const j = _tmp;
              if (j < needle_len) {
                const _p$2 = i + j | 0;
                const _p$3 = haystack.str.charCodeAt(haystack.start + _p$2 | 0);
                const _p$4 = needle.str.charCodeAt(needle.start + j | 0);
                if (_p$3 !== _p$4) {
                  break;
                }
                _tmp = j + 1 | 0;
                continue;
              } else {
                return i;
              }
            }
            i = i + 1 | 0;
          }
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FP311moonbitlang4core7builtin33brute__force__find_2econstr_2f241;
  }
}
function _M0MP311moonbitlang4core6string10StringView4find(self, str) {
  return (str.end - str.start | 0) <= 4 ? _M0FP311moonbitlang4core7builtin18brute__force__find(self, str) : _M0FP311moonbitlang4core7builtin28boyer__moore__horspool__find(self, str);
}
function _M0FP311moonbitlang4core7builtin33boyer__moore__horspool__rev__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const skip_table = $make_array_len_and_init(256, needle_len);
      let _tmp = needle_len - 1 | 0;
      while (true) {
        const i = _tmp;
        if (i > 0) {
          const _tmp$2 = needle.str.charCodeAt(needle.start + i | 0) & 255;
          $bound_check(skip_table, _tmp$2);
          skip_table[_tmp$2] = i;
          _tmp = i - 1 | 0;
          continue;
        } else {
          break;
        }
      }
      let _tmp$2 = haystack_len - needle_len | 0;
      while (true) {
        const i = _tmp$2;
        if (i >= 0) {
          let _tmp$3 = 0;
          while (true) {
            const j = _tmp$3;
            if (j < needle_len) {
              const _p = i + j | 0;
              const _p$2 = haystack.str.charCodeAt(haystack.start + _p | 0);
              const _p$3 = needle.str.charCodeAt(needle.start + j | 0);
              if (_p$2 !== _p$3) {
                break;
              }
              _tmp$3 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          const _tmp$4 = haystack.str.charCodeAt(haystack.start + i | 0) & 255;
          $bound_check(skip_table, _tmp$4);
          _tmp$2 = i - skip_table[_tmp$4] | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return haystack_len;
  }
}
function _M0MP311moonbitlang4core6string10StringView8find__by(self, pred) {
  const _it = _M0MP311moonbitlang4core6string10StringView5iter2(self);
  while (true) {
    const _bind = _M0MP311moonbitlang4core7builtin5Iter24nextGicE(_it);
    if (_bind === undefined) {
      break;
    } else {
      const _Some = _bind;
      const _x = _Some;
      const _i = _x._0;
      const _c = _x._1;
      if (pred(_c)) {
        return _i;
      }
      continue;
    }
  }
  return undefined;
}
function _M0MP311moonbitlang4core6string6String8find__by(self, pred) {
  return _M0MP311moonbitlang4core6string10StringView8find__by({ str: self, start: 0, end: self.length }, pred);
}
function _M0FP311moonbitlang4core7builtin23brute__force__rev__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const _p = 0;
      const needle_first = needle.str.charCodeAt(needle.start + _p | 0);
      let i = haystack_len - needle_len | 0;
      while (true) {
        if (i >= 0) {
          while (true) {
            let _tmp;
            if (i >= 0) {
              const _p$2 = i;
              const _p$3 = haystack.str.charCodeAt(haystack.start + _p$2 | 0);
              _tmp = _p$3 !== needle_first;
            } else {
              _tmp = false;
            }
            if (_tmp) {
              i = i - 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (i >= 0) {
            let _tmp = 1;
            while (true) {
              const j = _tmp;
              if (j < needle_len) {
                const _p$2 = i + j | 0;
                const _p$3 = haystack.str.charCodeAt(haystack.start + _p$2 | 0);
                const _p$4 = needle.str.charCodeAt(needle.start + j | 0);
                if (_p$3 !== _p$4) {
                  break;
                }
                _tmp = j + 1 | 0;
                continue;
              } else {
                return i;
              }
            }
            i = i - 1 | 0;
          }
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return haystack_len;
  }
}
function _M0MP311moonbitlang4core6string10StringView9rev__find(self, str) {
  return (str.end - str.start | 0) <= 4 ? _M0FP311moonbitlang4core7builtin23brute__force__rev__find(self, str) : _M0FP311moonbitlang4core7builtin33boyer__moore__horspool__rev__find(self, str);
}
function _M0MP311moonbitlang4core6string10StringView11has__suffix(self, str) {
  const _bind = _M0MP311moonbitlang4core6string10StringView9rev__find(self, str);
  if (_bind === undefined) {
    return false;
  } else {
    const _Some = _bind;
    const _i = _Some;
    return _i === ((self.end - self.start | 0) - (str.end - str.start | 0) | 0);
  }
}
function _M0MP311moonbitlang4core6string6String11has__suffix(self, str) {
  return _M0MP311moonbitlang4core6string10StringView11has__suffix({ str: self, start: 0, end: self.length }, str);
}
function _M0MP311moonbitlang4core6string10StringView11has__prefix(self, str) {
  const _bind = _M0MP311moonbitlang4core6string10StringView4find(self, str);
  if (_bind === undefined) {
    return false;
  } else {
    const _Some = _bind;
    const _i = _Some;
    return _i === 0;
  }
}
function _M0MP311moonbitlang4core6string6String11has__prefix(self, str) {
  return _M0MP311moonbitlang4core6string10StringView11has__prefix({ str: self, start: 0, end: self.length }, str);
}
function _M0MP311moonbitlang4core5array5Array11new_2einnerGcE(capacity) {
  return [];
}
function _M0MP311moonbitlang4core5array5Array4pushGsE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw6server13ServerContextE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGcE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffFileE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffLineE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffHunkE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP311moonbitlang4core7builtin5ArrayGsEE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw6server7JsValueE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core13ReviwQuestionE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core7CommentE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core12ReviewResultE(self, value) {
  _M0MP311moonbitlang4core7builtin7JSArray4push(self, value);
}
function _M0MP311moonbitlang4core6string10StringView8contains(self, str) {
  const _bind = _M0MP311moonbitlang4core6string10StringView4find(self, str);
  return !(_bind === undefined);
}
function _M0MP311moonbitlang4core6string6String8contains(self, str) {
  return _M0MP311moonbitlang4core6string10StringView8contains({ str: self, start: 0, end: self.length }, str);
}
function _M0MP311moonbitlang4core6string6String4iter(self) {
  const len = self.length;
  const index = { val: 0 };
  const _p = () => {
    if (index.val < len) {
      const c1 = self.charCodeAt(index.val);
      if (_M0MP311moonbitlang4core6uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < len) {
        const c2 = self.charCodeAt(index.val + 1 | 0);
        if (_M0MP311moonbitlang4core6uint166UInt1623is__trailing__surrogate(c2)) {
          const c = _M0FP311moonbitlang4core7builtin32code__point__of__surrogate__pair(c1, c2);
          index.val = index.val + 2 | 0;
          return c;
        }
      }
      index.val = index.val + 1 | 0;
      return c1;
    } else {
      return -1;
    }
  };
  return _p;
}
function _M0MP311moonbitlang4core7builtin4Iter3mapGcRP311moonbitlang4core6string10StringViewE(self, f) {
  return () => {
    const _bind = _M0MP311moonbitlang4core7builtin4Iter4nextGcE(self);
    if (_bind === -1) {
      return undefined;
    } else {
      const _Some = _bind;
      const _x = _Some;
      return f(_x);
    }
  };
}
function _M0IP311moonbitlang4core4char4CharP311moonbitlang4core7builtin4Show10to__string(self) {
  return String.fromCodePoint(self);
}
function _M0MP311moonbitlang4core6string10StringView5split(self, sep) {
  const sep_len = sep.end - sep.start | 0;
  if (sep_len === 0) {
    return _M0MP311moonbitlang4core7builtin4Iter3mapGcRP311moonbitlang4core6string10StringViewE(_M0MP311moonbitlang4core6string10StringView4iter(self), (c) => _M0MP311moonbitlang4core6string6String12view_2einner(_M0IP311moonbitlang4core4char4CharP311moonbitlang4core7builtin4Show10to__string(c), 0, undefined));
  }
  const remaining = { val: self };
  const _p = () => {
    const _bind = remaining.val;
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _view = _Some;
      const _bind$2 = _M0MP311moonbitlang4core6string10StringView4find(_view, sep);
      if (_bind$2 === undefined) {
        remaining.val = undefined;
        return _view;
      } else {
        const _Some$2 = _bind$2;
        const _end = _Some$2;
        remaining.val = _M0MP311moonbitlang4core6string10StringView12view_2einner(_view, _end + sep_len | 0, undefined);
        return _M0MP311moonbitlang4core6string10StringView12view_2einner(_view, 0, _end);
      }
    }
  };
  return _p;
}
function _M0MP311moonbitlang4core6string6String5split(self, sep) {
  return _M0MP311moonbitlang4core6string10StringView5split({ str: self, start: 0, end: self.length }, sep);
}
function _M0MP311moonbitlang4core4char4Char20is__ascii__uppercase(self) {
  return self >= 65 && self <= 90;
}
function _M0MP311moonbitlang4core6string6String9to__lower(self) {
  const _bind = _M0MP311moonbitlang4core6string6String8find__by(self, (x) => _M0MP311moonbitlang4core4char4Char20is__ascii__uppercase(x));
  if (_bind === undefined) {
    return self;
  } else {
    const _Some = _bind;
    const _idx = _Some;
    const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(self.length);
    const head = _M0MP311moonbitlang4core6string6String12view_2einner(self, 0, _idx);
    _M0IP016_24default__implP311moonbitlang4core7builtin6Logger16write__substringGRP311moonbitlang4core7builtin13StringBuilderE(buf, head.str, head.start, head.end - head.start | 0);
    const _it = _M0MP311moonbitlang4core6string10StringView4iter(_M0MP311moonbitlang4core6string6String12view_2einner(self, _idx, undefined));
    while (true) {
      const _bind$2 = _M0MP311moonbitlang4core7builtin4Iter4nextGcE(_it);
      if (_bind$2 === -1) {
        break;
      } else {
        const _Some$2 = _bind$2;
        const _c = _Some$2;
        if (_M0MP311moonbitlang4core4char4Char20is__ascii__uppercase(_c)) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _c + 32 | 0);
        } else {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _c);
        }
        continue;
      }
    }
    return buf.val;
  }
}
function _M0MP311moonbitlang4core6string6String17substring_2einner(self, start, end) {
  const len = self.length;
  let end$2;
  if (end === undefined) {
    end$2 = len;
  } else {
    const _Some = end;
    end$2 = _Some;
  }
  return start >= 0 && (start <= end$2 && end$2 <= len) ? self.substring(start, end$2) : $panic();
}
function _M0MP311moonbitlang4core6string6String9to__array(self) {
  const _p = _M0MP311moonbitlang4core6string6String4iter(self);
  const _p$2 = _M0MP311moonbitlang4core5array5Array11new_2einnerGcE(self.length);
  let _p$3 = _p$2;
  while (true) {
    const _p$4 = _M0MP311moonbitlang4core7builtin4Iter4nextGcE(_p);
    if (_p$4 === -1) {
      break;
    } else {
      const _p$5 = _p$4;
      const _p$6 = _p$5;
      const _p$7 = _p$3;
      _M0MP311moonbitlang4core5array5Array4pushGcE(_p$7, _p$6);
      _p$3 = _p$7;
      continue;
    }
  }
  return _p$3;
}
function _M0IP311moonbitlang4core3int3IntP311moonbitlang4core7builtin4Show6output(self, logger) {
  logger.method_table.method_0(logger.self, _M0MP311moonbitlang4core3int3Int18to__string_2einner(self, 10));
}
function _M0MP311moonbitlang4core3int3Int20next__power__of__two(self) {
  if (self >= 0) {
    if (self <= 1) {
      return 1;
    }
    if (self > 1073741824) {
      return 1073741824;
    }
    return (2147483647 >> (Math.clz32(self - 1 | 0) - 1 | 0)) + 1 | 0;
  } else {
    return $panic();
  }
}
function _M0MP311moonbitlang4core7builtin3Map11new_2einnerGssE(capacity) {
  const capacity$2 = _M0MP311moonbitlang4core3int3Int20next__power__of__two(capacity);
  const _bind = capacity$2 - 1 | 0;
  const _bind$2 = (Math.imul(capacity$2, 13) | 0) / 16 | 0;
  const _bind$3 = $make_array_len_and_init(capacity$2, undefined);
  const _bind$4 = undefined;
  return { entries: _bind$3, size: 0, capacity: capacity$2, capacity_mask: _bind, grow_at: _bind$2, head: _bind$4, tail: -1 };
}
function _M0MP311moonbitlang4core7builtin3Map20add__entry__to__tailGssE(self, idx, entry) {
  const _bind = self.tail;
  if (_bind === -1) {
    self.head = entry;
  } else {
    const _tmp = self.entries;
    $bound_check(_tmp, _bind);
    const _p = _tmp[_bind];
    let _tmp$2;
    if (_p === undefined) {
      _tmp$2 = $panic();
    } else {
      const _p$2 = _p;
      _tmp$2 = _p$2;
    }
    _tmp$2.next = entry;
  }
  self.tail = idx;
  const _tmp = self.entries;
  $bound_check(_tmp, idx);
  _tmp[idx] = entry;
  self.size = self.size + 1 | 0;
}
function _M0MP311moonbitlang4core7builtin3Map10set__entryGssE(self, entry, new_idx) {
  const _tmp = self.entries;
  $bound_check(_tmp, new_idx);
  _tmp[new_idx] = entry;
  const _bind = entry.next;
  if (_bind === undefined) {
    self.tail = new_idx;
    return;
  } else {
    const _Some = _bind;
    const _next = _Some;
    _next.prev = new_idx;
    return;
  }
}
function _M0MP311moonbitlang4core7builtin3Map10push__awayGssE(self, idx, entry) {
  let _tmp = entry.psl + 1 | 0;
  let _tmp$2 = idx + 1 & self.capacity_mask;
  let _tmp$3 = entry;
  while (true) {
    const psl = _tmp;
    const idx$2 = _tmp$2;
    const entry$2 = _tmp$3;
    const _tmp$4 = self.entries;
    $bound_check(_tmp$4, idx$2);
    const _bind = _tmp$4[idx$2];
    if (_bind === undefined) {
      entry$2.psl = psl;
      _M0MP311moonbitlang4core7builtin3Map10set__entryGssE(self, entry$2, idx$2);
      break;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (psl > _curr_entry.psl) {
        entry$2.psl = psl;
        _M0MP311moonbitlang4core7builtin3Map10set__entryGssE(self, entry$2, idx$2);
        _tmp = _curr_entry.psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        _tmp$3 = _curr_entry;
        continue;
      } else {
        _tmp = psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        continue;
      }
    }
  }
}
function _M0MP311moonbitlang4core7builtin3Map15set__with__hashGssE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MP311moonbitlang4core7builtin3Map4growGssE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = { prev: _bind$2, next: _bind$3, psl: psl, hash: hash, key: key, value: value };
      _M0MP311moonbitlang4core7builtin3Map20add__entry__to__tailGssE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MP311moonbitlang4core7builtin3Map4growGssE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MP311moonbitlang4core7builtin3Map10push__awayGssE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = { prev: _bind$2, next: _bind$3, psl: psl, hash: hash, key: key, value: value };
        _M0MP311moonbitlang4core7builtin3Map20add__entry__to__tailGssE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MP311moonbitlang4core7builtin3Map4growGssE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const _param = _tmp;
    if (_param === undefined) {
      return;
    } else {
      const _Some = _param;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MP311moonbitlang4core7builtin3Map15set__with__hashGssE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MP311moonbitlang4core7builtin3Map3setGssE(self, key, value) {
  _M0MP311moonbitlang4core7builtin3Map15set__with__hashGssE(self, key, value, _M0IP016_24default__implP311moonbitlang4core7builtin4Hash4hashGsE(key));
}
function _M0MP311moonbitlang4core7builtin3Map11from__arrayGssE(arr) {
  const length = arr.end - arr.start | 0;
  let capacity = _M0MP311moonbitlang4core3int3Int20next__power__of__two(length);
  const _p = capacity;
  if (length > ((Math.imul(_p, 13) | 0) / 16 | 0)) {
    capacity = Math.imul(capacity, 2) | 0;
  }
  const m = _M0MP311moonbitlang4core7builtin3Map11new_2einnerGssE(capacity);
  const _len = arr.end - arr.start | 0;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const e = arr.buf[arr.start + _i | 0];
      _M0MP311moonbitlang4core7builtin3Map3setGssE(m, e._0, e._1);
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return m;
}
function _M0MP311moonbitlang4core7builtin5Iter24nextGicE(self) {
  return _M0MP311moonbitlang4core7builtin4Iter4nextGUicEE(self);
}
function _M0MP311moonbitlang4core7builtin6Hasher15combine__string(self, value) {
  const _end2501 = value.length;
  let _tmp = 0;
  while (true) {
    const i = _tmp;
    if (i < _end2501) {
      _M0MP311moonbitlang4core7builtin6Hasher13combine__uint(self, value.charCodeAt(i));
      _tmp = i + 1 | 0;
      continue;
    } else {
      return;
    }
  }
}
function _M0IP311moonbitlang4core6string6StringP311moonbitlang4core7builtin4Hash13hash__combine(self, hasher) {
  _M0MP311moonbitlang4core7builtin6Hasher15combine__string(hasher, self);
}
function _M0IP311moonbitlang4core7builtin13SourceLocReprP311moonbitlang4core7builtin4Show6output(self, logger) {
  const pkg = self.pkg;
  const _data = pkg.str;
  const _start = pkg.start;
  const _end = _start + (pkg.end - pkg.start | 0) | 0;
  let _cursor = _start;
  let accept_state = -1;
  let match_end = -1;
  let match_tag_saver_0 = -1;
  let tag_0 = -1;
  let _bind;
  _L: {
    _L$2: {
      _L$3: while (true) {
        if (_cursor < _end) {
          const _p = _cursor;
          const next_char = _data.charCodeAt(_p);
          _cursor = _cursor + 1 | 0;
          if (next_char === 47) {
            _L$4: while (true) {
              tag_0 = _cursor;
              if (_cursor < _end) {
                const _p$2 = _cursor;
                const next_char$2 = _data.charCodeAt(_p$2);
                _cursor = _cursor + 1 | 0;
                if (next_char$2 === 47) {
                  while (true) {
                    if (_cursor < _end) {
                      const _p$3 = _cursor;
                      _data.charCodeAt(_p$3);
                      _cursor = _cursor + 1 | 0;
                      continue;
                    } else {
                      match_tag_saver_0 = tag_0;
                      accept_state = 0;
                      match_end = _cursor;
                      break _L$2;
                    }
                  }
                } else {
                  continue;
                }
              } else {
                break _L$2;
              }
            }
          } else {
            continue;
          }
        } else {
          break _L$2;
        }
      }
      break _L;
    }
    if (accept_state === 0) {
      let package_name;
      let _try_err;
      _L$3: {
        _L$4: {
          const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, match_tag_saver_0 + 1 | 0, match_end);
          if (_bind$2.$tag === 1) {
            const _ok = _bind$2;
            package_name = _ok._0;
          } else {
            const _err = _bind$2;
            _try_err = _err._0;
            break _L$4;
          }
          break _L$3;
        }
        package_name = $panic();
      }
      let module_name;
      let _try_err$2;
      _L$4: {
        _L$5: {
          const _bind$2 = _M0MP311moonbitlang4core6string6String3sub(_data, _start, match_tag_saver_0);
          if (_bind$2.$tag === 1) {
            const _ok = _bind$2;
            module_name = _ok._0;
          } else {
            const _err = _bind$2;
            _try_err$2 = _err._0;
            break _L$5;
          }
          break _L$4;
        }
        module_name = $panic();
      }
      _bind = { _0: module_name, _1: package_name };
    } else {
      _bind = { _0: pkg, _1: undefined };
    }
  }
  const _module_name = _bind._0;
  const _package_name = _bind._1;
  if (_package_name === undefined) {
  } else {
    const _Some = _package_name;
    const _pkg_name = _Some;
    logger.method_table.method_2(logger.self, _pkg_name);
    logger.method_table.method_3(logger.self, 47);
  }
  logger.method_table.method_2(logger.self, self.filename);
  logger.method_table.method_3(logger.self, 58);
  logger.method_table.method_2(logger.self, self.start_line);
  logger.method_table.method_3(logger.self, 58);
  logger.method_table.method_2(logger.self, self.start_column);
  logger.method_table.method_3(logger.self, 45);
  logger.method_table.method_2(logger.self, self.end_line);
  logger.method_table.method_3(logger.self, 58);
  logger.method_table.method_2(logger.self, self.end_column);
  logger.method_table.method_3(logger.self, 64);
  logger.method_table.method_2(logger.self, _module_name);
}
function _M0IP311moonbitlang4core7builtin9SourceLocP311moonbitlang4core7builtin4Show6output(self, logger) {
  _M0IP311moonbitlang4core7builtin13SourceLocReprP311moonbitlang4core7builtin4Show6output(_M0MP311moonbitlang4core7builtin13SourceLocRepr5parse(self), logger);
}
function _M0MP311moonbitlang4core5array5Array28unsafe__truncate__to__lengthGsE(self, new_len) {
  _M0MP311moonbitlang4core7builtin7JSArray11set__length(self, new_len);
}
function _M0MP311moonbitlang4core5array5Array11unsafe__popGRP311moonbitlang4core7builtin5ArrayGsEE(self) {
  return _M0MP311moonbitlang4core7builtin7JSArray3pop(self);
}
function _M0MP311moonbitlang4core5array5Array3popGRP311moonbitlang4core7builtin5ArrayGsEE(self) {
  if (self.length === 0) {
    return Option$None$1$;
  } else {
    const v = _M0MP311moonbitlang4core5array5Array11unsafe__popGRP311moonbitlang4core7builtin5ArrayGsEE(self);
    return new Option$Some$1$(v);
  }
}
function _M0MP311moonbitlang4core5array5Array6removeGRP36kazuph5reviw6server7JsValueE(self, index) {
  if (index >= 0 && index < self.length) {
    $bound_check(self, index);
    const value = self[index];
    _M0MP311moonbitlang4core7builtin7JSArray6splice(self, index, 1);
    return value;
  } else {
    return _M0FP311moonbitlang4core7builtin5abortGRP36kazuph5reviw6server7JsValueE(`index out of bounds: the len is from 0 to ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(self.length)} but the index is ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(index)}`, "@moonbitlang/core/builtin:arraycore_js.mbt:251:5-253:6");
  }
}
function _M0MP311moonbitlang4core5array5Array4copyGsE(self) {
  return _M0MP311moonbitlang4core7builtin7JSArray4copy(self);
}
function _M0MP311moonbitlang4core5array5Array5clearGsE(self) {
  _M0MP311moonbitlang4core5array5Array28unsafe__truncate__to__lengthGsE(self, 0);
}
function _M0MP311moonbitlang4core3ref3Ref3newGsE(x) {
  return { val: x };
}
function _M0MP311moonbitlang4core3ref3Ref3newGiE(x) {
  return { val: x };
}
function _M0IP36kazuph5reviw4core8FileModeP311moonbitlang4core7builtin2Eq5equal(_x_561, _x_562) {
  switch (_x_561) {
    case 0: {
      if (_x_562 === 0) {
        return true;
      } else {
        return false;
      }
    }
    case 1: {
      if (_x_562 === 1) {
        return true;
      } else {
        return false;
      }
    }
    case 2: {
      if (_x_562 === 2) {
        return true;
      } else {
        return false;
      }
    }
    case 3: {
      if (_x_562 === 3) {
        return true;
      } else {
        return false;
      }
    }
    default: {
      if (_x_562 === 4) {
        return true;
      } else {
        return false;
      }
    }
  }
}
function _M0FP36kazuph5reviw4core20yaml__escape__string(s) {
  const needs_quote = _M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c639, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c639.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c640, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c640.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c641, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c641.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c642, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c642.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c643, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c643.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c644, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c644.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c645, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c645.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c646, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c646.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c647, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c647.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c648, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c648.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c649, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c649.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c650, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c650.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c651, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c651.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c652, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c652.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c653, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c653.length }) || (_M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c654, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c654.length }) || _M0MP311moonbitlang4core6string6String8contains(s, { str: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c655, start: 0, end: _M0FP36kazuph5reviw4core36yaml__escape__string_2e_2abind_7c655.length }))))))))))))))));
  if (needs_quote) {
    const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 39);
    const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
    const _len = chars.length;
    let _tmp = 0;
    while (true) {
      const _i = _tmp;
      if (_i < _len) {
        const ch = chars[_i];
        if (ch === 39) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "''");
        } else {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, ch);
        }
        _tmp = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 39);
    return buf.val;
  } else {
    return s;
  }
}
function _M0MP36kazuph5reviw4core8FileMode10to__string(self) {
  switch (self) {
    case 0: {
      return "csv";
    }
    case 1: {
      return "tsv";
    }
    case 2: {
      return "markdown";
    }
    case 3: {
      return "diff";
    }
    default: {
      return "text";
    }
  }
}
function _M0FP36kazuph5reviw4core16review__to__yaml(result) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "file: ");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.file));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "mode: ");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP36kazuph5reviw4core8FileMode10to__string(result.mode));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "comments:\n");
  const _arr = result.comments;
  const _len = _arr.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const comment = _arr[_i];
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "  - row: ");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(comment.row, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    col: ");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(comment.col, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    text: ");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(comment.text));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
      if (comment.value.length > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    value: ");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(comment.value));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "summary: ");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.summary));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
  if (result.answers.length > 2) {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "answers: ");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.answers));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core17reviews__to__yaml(results) {
  if (results.length === 1) {
    return _M0FP36kazuph5reviw4core16review__to__yaml(_M0MP311moonbitlang4core5array5Array2atGRP36kazuph5reviw4core12ReviewResultE(results, 0));
  } else {
    const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "files:\n");
    const _len = results.length;
    let _tmp = 0;
    while (true) {
      const _i = _tmp;
      if (_i < _len) {
        const result = results[_i];
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "  - file: ");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.file));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    mode: ");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP36kazuph5reviw4core8FileMode10to__string(result.mode));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    comments:\n");
        const _arr = result.comments;
        const _len$2 = _arr.length;
        let _tmp$2 = 0;
        while (true) {
          const _i$2 = _tmp$2;
          if (_i$2 < _len$2) {
            const comment = _arr[_i$2];
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "      - row: ");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(comment.row, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "        col: ");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(comment.col, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "        text: ");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(comment.text));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
            _tmp$2 = _i$2 + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    summary: ");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.summary));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
        if (result.answers.length > 2) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "    answers: ");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core20yaml__escape__string(result.answers));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 10);
        }
        _tmp = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    return buf.val;
  }
}
function _M0FP36kazuph5reviw4core11safe__slice(s, start) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const len = chars.length;
  if (start >= len || start < 0) {
    return "";
  } else {
    const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
    let _tmp = start;
    while (true) {
      const i = _tmp;
      if (i < len) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
        _tmp = i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    return buf.val;
  }
}
function _M0FP36kazuph5reviw4core18safe__slice__range(s, start, end) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const len = chars.length;
  const actual_start = start < 0 ? 0 : start;
  const actual_end = end > len ? len : end;
  if (actual_start >= actual_end) {
    return "";
  } else {
    const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
    let _tmp = actual_start;
    while (true) {
      const i = _tmp;
      if (i < actual_end) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
        _tmp = i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    return buf.val;
  }
}
function _M0FP36kazuph5reviw4core16parse__int__safe(s) {
  let n = 0;
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch >= 48 && ch <= 57) {
        n = (Math.imul(n, 10) | 0) + (ch - 48 | 0) | 0;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return n;
}
function _M0FP36kazuph5reviw4core16split__to__lines(input) {
  const result = [];
  const _it = _M0MP311moonbitlang4core6string6String5split(input, { str: _M0FP36kazuph5reviw4core32split__to__lines_2e_2abind_7c680, start: 0, end: _M0FP36kazuph5reviw4core32split__to__lines_2e_2abind_7c680.length });
  while (true) {
    const _bind = _M0MP311moonbitlang4core7builtin4Iter4nextGRP311moonbitlang4core6string10StringViewE(_it);
    if (_bind === undefined) {
      break;
    } else {
      const _Some = _bind;
      const _sv = _Some;
      _M0MP311moonbitlang4core5array5Array4pushGsE(result, _M0IP311moonbitlang4core6string10StringViewP311moonbitlang4core7builtin4Show10to__string(_sv));
      continue;
    }
  }
  return result;
}
function _M0MP36kazuph5reviw4core8FileMode15from__extension(ext) {
  _L: {
    _L$2: {
      _L$3: {
        switch (ext) {
          case "csv": {
            return 0;
          }
          case "tsv": {
            break _L$3;
          }
          case "tab": {
            break _L$3;
          }
          case "md": {
            break _L$2;
          }
          case "markdown": {
            break _L$2;
          }
          case "diff": {
            break _L;
          }
          case "patch": {
            break _L;
          }
          default: {
            return 4;
          }
        }
      }
      return 1;
    }
    return 2;
  }
  return 3;
}
function _M0FP36kazuph5reviw4core15index__of__char(s, target) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch === target) {
        return _i;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return -1;
}
function _M0FP36kazuph5reviw4core14is__whitespace(ch) {
  return ch === 32 || (ch === 9 || (ch === 13 || ch === 10));
}
function _M0FP36kazuph5reviw4core4trim(s) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const len = chars.length;
  if (len === 0) {
    return "";
  }
  let start = 0;
  while (true) {
    if (start < len && _M0FP36kazuph5reviw4core14is__whitespace(_M0MP311moonbitlang4core5array5Array2atGcE(chars, start))) {
      start = start + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  let end = len - 1 | 0;
  while (true) {
    if (end >= start && _M0FP36kazuph5reviw4core14is__whitespace(_M0MP311moonbitlang4core5array5Array2atGcE(chars, end))) {
      end = end - 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (start > end) {
    return "";
  }
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const _start452 = start;
  const _end453 = end;
  let _tmp = _start452;
  while (true) {
    const i = _tmp;
    if (i <= _end453) {
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
      _tmp = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core23parse__single__question(lines, start, end) {
  let id = "";
  let question = "";
  let resolved = false;
  let answer = "";
  const options = [];
  const first = _M0FP36kazuph5reviw4core4trim(_M0MP311moonbitlang4core5array5Array2atGsE(lines, start));
  const first_content = _M0FP36kazuph5reviw4core11safe__slice(first, 2);
  const colon = _M0FP36kazuph5reviw4core15index__of__char(first_content, 58);
  if (colon >= 0) {
    const key = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core18safe__slice__range(first_content, 0, colon));
    const val = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(first_content, colon + 1 | 0));
    if (key === "id") {
      id = val;
    }
    if (key === "question") {
      question = val;
    }
    if (key === "resolved") {
      resolved = val === "true";
    }
    if (key === "answer") {
      answer = val;
    }
  }
  let i = start + 1 | 0;
  while (true) {
    if (i < end) {
      const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
      const trimmed = _M0FP36kazuph5reviw4core4trim(line);
      if (_M0MP311moonbitlang4core6string6String11has__prefix(trimmed, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c693, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c693.length }) && _M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c694, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c694.length })) {
        break;
      }
      if (trimmed.length === 0 || !_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c695, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c695.length }) && !_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c696, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c696.length })) {
        break;
      }
      const content_colon = _M0FP36kazuph5reviw4core15index__of__char(trimmed, 58);
      if (content_colon >= 0) {
        const key = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core18safe__slice__range(trimmed, 0, content_colon));
        const val = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(trimmed, content_colon + 1 | 0));
        if (key === "id") {
          id = val;
        }
        if (key === "question") {
          question = val;
        }
        if (key === "resolved") {
          resolved = val === "true";
        }
        if (key === "answer") {
          answer = val;
        }
        if (key === "options") {
          i = i + 1 | 0;
          while (true) {
            if (i < end) {
              const opt_line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
              const opt_trimmed = _M0FP36kazuph5reviw4core4trim(opt_line);
              if (_M0MP311moonbitlang4core6string6String11has__prefix(opt_trimmed, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c698, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c698.length }) && _M0MP311moonbitlang4core6string6String11has__prefix(opt_line, { str: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c699, start: 0, end: _M0FP36kazuph5reviw4core39parse__single__question_2e_2abind_7c699.length })) {
                _M0MP311moonbitlang4core5array5Array4pushGsE(options, _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(opt_trimmed, 2)));
                i = i + 1 | 0;
              } else {
                break;
              }
              continue;
            } else {
              break;
            }
          }
          continue;
        }
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return { _0: { id: id, question: question, resolved: resolved, answer: answer, options: options }, _1: i };
}
function _M0FP36kazuph5reviw4core23parse__reviw__questions(lines, start, end) {
  const questions = [];
  let i = start;
  while (true) {
    if (i < end) {
      const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
      if (_M0FP36kazuph5reviw4core4trim(line) === "reviw:") {
        i = i + 1 | 0;
        while (true) {
          if (i < end) {
            const ql = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
            const tql = _M0FP36kazuph5reviw4core4trim(ql);
            if (tql === "questions:" || tql === `questions: `) {
              i = i + 1 | 0;
              while (true) {
                if (i < end) {
                  const item_line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
                  const trimmed = _M0FP36kazuph5reviw4core4trim(item_line);
                  if (_M0MP311moonbitlang4core6string6String11has__prefix(trimmed, { str: _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c703, start: 0, end: _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c703.length })) {
                    const q = _M0FP36kazuph5reviw4core23parse__single__question(lines, i, end);
                    _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core13ReviwQuestionE(questions, q._0);
                    i = q._1;
                  } else {
                    if (trimmed.length === 0 || !_M0MP311moonbitlang4core6string6String11has__prefix(item_line, { str: _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c704, start: 0, end: _M0FP36kazuph5reviw4core39parse__reviw__questions_2e_2abind_7c704.length })) {
                      break;
                    } else {
                      i = i + 1 | 0;
                    }
                  }
                  continue;
                } else {
                  break;
                }
              }
              break;
            }
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        break;
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return questions;
}
function _M0FP36kazuph5reviw4core21count__heading__level(line) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(line);
  let count = 0;
  while (true) {
    if (count < chars.length && _M0MP311moonbitlang4core5array5Array2atGcE(chars, count) === 35) {
      count = count + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return count > 0 && (count < chars.length && _M0MP311moonbitlang4core5array5Array2atGcE(chars, count) === 32) ? count : 0;
}
function _M0FP36kazuph5reviw4core12escape__html(s) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      switch (ch) {
        case 38: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&amp;");
          break;
        }
        case 60: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&lt;");
          break;
        }
        case 62: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&gt;");
          break;
        }
        case 34: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&quot;");
          break;
        }
        case 39: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&#39;");
          break;
        }
        default: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, ch);
        }
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core24extract__html__tag__name(line) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(line);
  const len = chars.length;
  let start = 0;
  while (true) {
    if (start < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, start) !== 60) {
      start = start + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  start = start + 1 | 0;
  let end = start;
  while (true) {
    if (end < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, end) !== 32 && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, end) !== 62 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, end) !== 47))) {
      end = end + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return _M0FP36kazuph5reviw4core18safe__slice__range(line, start, end);
}
function _M0FP36kazuph5reviw4core31extract__ordered__list__content(line) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(line);
  let i = 0;
  while (true) {
    if (i < chars.length && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) >= 48 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) <= 57)) {
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return _M0FP36kazuph5reviw4core11safe__slice(line, i + 2 | 0);
}
function _M0FP36kazuph5reviw4core20is__horizontal__rule(line) {
  const t = _M0FP36kazuph5reviw4core4trim(line);
  if (t.length < 3) {
    return false;
  }
  const chars = _M0MP311moonbitlang4core6string6String9to__array(t);
  const first = _M0MP311moonbitlang4core5array5Array2atGcE(chars, 0);
  if (first !== 45 && (first !== 42 && first !== 95)) {
    return false;
  }
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch !== first && ch !== 32) {
        return false;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP36kazuph5reviw4core22is__html__block__start(line) {
  const t = _M0FP36kazuph5reviw4core4trim(line);
  return _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c719, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c719.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c720, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c720.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c721, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c721.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c722, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c722.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c723, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c723.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c724, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c724.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c725, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c725.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c726, start: 0, end: _M0FP36kazuph5reviw4core38is__html__block__start_2e_2abind_7c726.length })))))));
}
function _M0FP36kazuph5reviw4core23is__ordered__list__item(line) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(line);
  let i = 0;
  while (true) {
    if (i < chars.length && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) >= 48 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) <= 57)) {
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (i === 0) {
    return false;
  }
  return i < (chars.length - 1 | 0) && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 46 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 32);
}
function _M0FP36kazuph5reviw4core16is__block__start(line) {
  return _M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c728, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c728.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c729, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c729.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c730, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c730.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c731, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c731.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c732, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c732.length }) || (_M0FP36kazuph5reviw4core23is__ordered__list__item(line) || (_M0FP36kazuph5reviw4core20is__horizontal__rule(line) || _M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c733, start: 0, end: _M0FP36kazuph5reviw4core32is__block__start_2e_2abind_7c733.length }) && _M0FP36kazuph5reviw4core22is__html__block__start(line)))))));
}
function _M0FP36kazuph5reviw4core20is__mermaid__content(text) {
  const t = _M0FP36kazuph5reviw4core4trim(text);
  return _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c734, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c734.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c735, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c735.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c736, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c736.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c737, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c737.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c738, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c738.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c739, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c739.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c740, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c740.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c741, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c741.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c742, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c742.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c743, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c743.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c744, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c744.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c745, start: 0, end: _M0FP36kazuph5reviw4core36is__mermaid__content_2e_2abind_7c745.length })))))))))));
}
function _M0FP36kazuph5reviw4core20is__table__separator(line) {
  const t = _M0FP36kazuph5reviw4core4trim(line);
  if (!_M0MP311moonbitlang4core6string6String8contains(t, { str: _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c746, start: 0, end: _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c746.length }) || !_M0MP311moonbitlang4core6string6String8contains(t, { str: _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c747, start: 0, end: _M0FP36kazuph5reviw4core36is__table__separator_2e_2abind_7c747.length })) {
    return false;
  }
  const chars = _M0MP311moonbitlang4core6string6String9to__array(t);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch !== 124 && (ch !== 45 && (ch !== 58 && ch !== 32))) {
        return false;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP36kazuph5reviw4core18make__heading__key(text, counter) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(text);
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch >= 97 && ch <= 122 || ch >= 48 && ch <= 57) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, ch);
      } else {
        if (ch >= 65 && ch <= 90) {
          const lower = ch + 32 | 0;
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, lower);
        } else {
          if (ch === 32 || ch === 45) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 45);
          }
        }
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 45);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(counter, 10));
  return buf.val;
}
function _M0FP36kazuph5reviw4core17parse__table__row(line) {
  const result = [];
  const t = _M0FP36kazuph5reviw4core4trim(line);
  const inner = _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c760, start: 0, end: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c760.length }) && _M0MP311moonbitlang4core6string6String11has__suffix(t, { str: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c761, start: 0, end: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c761.length }) ? _M0FP36kazuph5reviw4core18safe__slice__range(t, 1, t.length - 1 | 0) : _M0MP311moonbitlang4core6string6String11has__prefix(t, { str: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c762, start: 0, end: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c762.length }) ? _M0FP36kazuph5reviw4core11safe__slice(t, 1) : t;
  const _it = _M0MP311moonbitlang4core6string6String5split(inner, { str: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c759, start: 0, end: _M0FP36kazuph5reviw4core33parse__table__row_2e_2abind_7c759.length });
  while (true) {
    const _bind = _M0MP311moonbitlang4core7builtin4Iter4nextGRP311moonbitlang4core6string10StringViewE(_it);
    if (_bind === undefined) {
      break;
    } else {
      const _Some = _bind;
      const _part = _Some;
      _M0MP311moonbitlang4core5array5Array4pushGsE(result, _M0IP311moonbitlang4core6string10StringViewP311moonbitlang4core7builtin4Show10to__string(_part));
      continue;
    }
  }
  return result;
}
function _M0FP36kazuph5reviw4core14is__video__url(url) {
  const lower = _M0MP311moonbitlang4core6string6String9to__lower(url);
  return _M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c763, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c763.length }) || (_M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c764, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c764.length }) || (_M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c765, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c765.length }) || (_M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c766, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c766.length }) || (_M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c767, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c767.length }) || (_M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c768, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c768.length }) || _M0MP311moonbitlang4core6string6String11has__suffix(lower, { str: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c769, start: 0, end: _M0FP36kazuph5reviw4core30is__video__url_2e_2abind_7c769.length }))))));
}
function _M0FP36kazuph5reviw4core14render__inline(text) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(text);
  const len = chars.length;
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  let i = 0;
  while (true) {
    if (i < len) {
      if ((i + 1 | 0) < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 33 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 91)) {
        const alt_start = i + 2 | 0;
        let alt_end = -1;
        let j = alt_start;
        while (true) {
          if (j < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 93) {
              alt_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (alt_end > 0 && ((alt_end + 1 | 0) < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, alt_end + 1 | 0) === 40)) {
          const url_start = alt_end + 2 | 0;
          let url_end = -1;
          j = url_start;
          while (true) {
            if (j < len) {
              if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 41) {
                url_end = j;
                break;
              }
              j = j + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (url_end > 0) {
            const alt = _M0FP36kazuph5reviw4core18safe__slice__range(text, alt_start, alt_end);
            const src = _M0FP36kazuph5reviw4core18safe__slice__range(text, url_start, url_end);
            const escaped_src = _M0FP36kazuph5reviw4core12escape__html(src);
            if (_M0FP36kazuph5reviw4core14is__video__url(src)) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<video class=\"video-preview\" controls preload=\"metadata\" src=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, escaped_src);
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" title=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(alt));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"></video>");
            } else {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<img src=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, escaped_src);
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" alt=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(alt));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" />");
            }
            i = url_end + 1 | 0;
            continue;
          }
        }
      }
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 91) {
        const text_start = i + 1 | 0;
        let text_end = -1;
        let j = text_start;
        while (true) {
          if (j < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 93) {
              text_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (text_end > 0 && ((text_end + 1 | 0) < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, text_end + 1 | 0) === 40)) {
          const url_start = text_end + 2 | 0;
          let url_end = -1;
          j = url_start;
          while (true) {
            if (j < len) {
              if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 41) {
                url_end = j;
                break;
              }
              j = j + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (url_end > 0) {
            const link_text = _M0FP36kazuph5reviw4core18safe__slice__range(text, text_start, text_end);
            const link_url = _M0FP36kazuph5reviw4core18safe__slice__range(text, url_start, url_end);
            const lower_url = _M0MP311moonbitlang4core6string6String9to__lower(link_url);
            if (_M0MP311moonbitlang4core6string6String11has__prefix(lower_url, { str: _M0FP36kazuph5reviw4core30render__inline_2e_2abind_7c775, start: 0, end: _M0FP36kazuph5reviw4core30render__inline_2e_2abind_7c775.length })) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(link_text));
            } else {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<a href=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(link_url));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(link_text));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</a>");
            }
            i = url_end + 1 | 0;
            continue;
          }
        }
      }
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 96) {
        const code_start = i + 1 | 0;
        let code_end = -1;
        let j = code_start;
        while (true) {
          if (j < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 96) {
              code_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (code_end > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<code>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_M0FP36kazuph5reviw4core18safe__slice__range(text, code_start, code_end)));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</code>");
          i = code_end + 1 | 0;
          continue;
        }
      }
      if ((i + 1 | 0) < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 126 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 126)) {
        const del_start = i + 2 | 0;
        let del_end = -1;
        let j = del_start;
        while (true) {
          if ((j + 1 | 0) < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 126 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + 1 | 0) === 126) {
              del_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (del_end > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<del>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_M0FP36kazuph5reviw4core18safe__slice__range(text, del_start, del_end)));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</del>");
          i = del_end + 2 | 0;
          continue;
        }
      }
      if ((i + 1 | 0) < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 42 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 42)) {
        const bold_start = i + 2 | 0;
        let bold_end = -1;
        let j = bold_start;
        while (true) {
          if ((j + 1 | 0) < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 42 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + 1 | 0) === 42) {
              bold_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (bold_end > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<strong>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_M0FP36kazuph5reviw4core18safe__slice__range(text, bold_start, bold_end)));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</strong>");
          i = bold_end + 2 | 0;
          continue;
        }
      }
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 42) {
        const em_start = i + 1 | 0;
        let em_end = -1;
        let j = em_start;
        while (true) {
          if (j < len) {
            if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 42) {
              em_end = j;
              break;
            }
            j = j + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (em_end > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<em>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_M0FP36kazuph5reviw4core18safe__slice__range(text, em_start, em_end)));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</em>");
          i = em_end + 1 | 0;
          continue;
        }
      }
      const _bind = _M0MP311moonbitlang4core5array5Array2atGcE(chars, i);
      switch (_bind) {
        case 60: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&lt;");
          break;
        }
        case 62: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&gt;");
          break;
        }
        case 38: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&amp;");
          break;
        }
        case 34: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&quot;");
          break;
        }
        default: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _bind);
        }
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core17is__allowed__attr(name) {
  switch (name) {
    case "class": {
      return true;
    }
    case "id": {
      return true;
    }
    case "style": {
      return true;
    }
    case "href": {
      return true;
    }
    case "src": {
      return true;
    }
    case "alt": {
      return true;
    }
    case "title": {
      return true;
    }
    case "width": {
      return true;
    }
    case "height": {
      return true;
    }
    case "colspan": {
      return true;
    }
    case "rowspan": {
      return true;
    }
    case "target": {
      return true;
    }
    case "rel": {
      return true;
    }
    case "controls": {
      return true;
    }
    case "preload": {
      return true;
    }
    case "open": {
      return true;
    }
    default: {
      return false;
    }
  }
}
function _M0FP36kazuph5reviw4core18is__dangerous__css(value) {
  const lower = _M0MP311moonbitlang4core6string6String9to__lower(value);
  return _M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c788, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c788.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c789, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c789.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c790, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c790.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c791, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c791.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c792, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c792.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c793, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c793.length }) || (_M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c794, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c794.length }) || _M0MP311moonbitlang4core6string6String8contains(lower, { str: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c795, start: 0, end: _M0FP36kazuph5reviw4core34is__dangerous__css_2e_2abind_7c795.length })))))));
}
function _M0FP36kazuph5reviw4core24is__event__handler__attr(name) {
  return _M0MP311moonbitlang4core6string6String11has__prefix(name, { str: _M0FP36kazuph5reviw4core40is__event__handler__attr_2e_2abind_7c796, start: 0, end: _M0FP36kazuph5reviw4core40is__event__handler__attr_2e_2abind_7c796.length });
}
function _M0FP36kazuph5reviw4core13is__safe__url(url) {
  const lower = _M0MP311moonbitlang4core6string6String9to__lower(url);
  const trimmed = _M0FP36kazuph5reviw4core4trim(lower);
  if (_M0MP311moonbitlang4core6string6String11has__prefix(trimmed, { str: _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c797, start: 0, end: _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c797.length })) {
    return false;
  }
  if (_M0MP311moonbitlang4core6string6String11has__prefix(trimmed, { str: _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c798, start: 0, end: _M0FP36kazuph5reviw4core29is__safe__url_2e_2abind_7c798.length })) {
    return false;
  }
  return true;
}
function _M0FP36kazuph5reviw4core18filter__attributes(attr_str, _tag_name) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(attr_str);
  const len = chars.length;
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  let i = 0;
  while (true) {
    if (i < len) {
      while (true) {
        if (i < len && _M0FP36kazuph5reviw4core14is__whitespace(_M0MP311moonbitlang4core5array5Array2atGcE(chars, i))) {
          i = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      if (i >= len) {
        break;
      }
      const name_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
      while (true) {
        if (i < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 61 && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 32 && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 62 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 47)))) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(name_buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
          i = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const attr_name = _M0MP311moonbitlang4core6string6String9to__lower(name_buf.val);
      if (attr_name.length === 0) {
        break;
      }
      let attr_value = "";
      if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 61) {
        i = i + 1 | 0;
        if (i < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 34 || _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 39)) {
          const quote = _M0MP311moonbitlang4core5array5Array2atGcE(chars, i);
          i = i + 1 | 0;
          const val_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
          while (true) {
            if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== quote) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(val_buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (i < len) {
            i = i + 1 | 0;
          }
          attr_value = val_buf.val;
        } else {
          const val_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
          while (true) {
            if (i < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 32 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 62)) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(val_buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          attr_value = val_buf.val;
        }
      }
      if (_M0FP36kazuph5reviw4core24is__event__handler__attr(attr_name)) {
        continue;
      }
      if (!_M0FP36kazuph5reviw4core17is__allowed__attr(attr_name)) {
        continue;
      }
      if ((attr_name === "href" || attr_name === "src") && !_M0FP36kazuph5reviw4core13is__safe__url(attr_value)) {
        continue;
      }
      if (attr_name === "style" && _M0FP36kazuph5reviw4core18is__dangerous__css(attr_value)) {
        continue;
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 32);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, attr_name);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(attr_value));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core16is__allowed__tag(tag) {
  switch (tag) {
    case "b": {
      return true;
    }
    case "i": {
      return true;
    }
    case "em": {
      return true;
    }
    case "strong": {
      return true;
    }
    case "code": {
      return true;
    }
    case "br": {
      return true;
    }
    case "a": {
      return true;
    }
    case "img": {
      return true;
    }
    case "span": {
      return true;
    }
    case "div": {
      return true;
    }
    case "p": {
      return true;
    }
    case "ul": {
      return true;
    }
    case "ol": {
      return true;
    }
    case "li": {
      return true;
    }
    case "table": {
      return true;
    }
    case "tr": {
      return true;
    }
    case "td": {
      return true;
    }
    case "th": {
      return true;
    }
    case "thead": {
      return true;
    }
    case "tbody": {
      return true;
    }
    case "del": {
      return true;
    }
    case "sup": {
      return true;
    }
    case "sub": {
      return true;
    }
    case "h1": {
      return true;
    }
    case "h2": {
      return true;
    }
    case "h3": {
      return true;
    }
    case "h4": {
      return true;
    }
    case "h5": {
      return true;
    }
    case "h6": {
      return true;
    }
    case "blockquote": {
      return true;
    }
    case "pre": {
      return true;
    }
    case "hr": {
      return true;
    }
    case "details": {
      return true;
    }
    case "summary": {
      return true;
    }
    case "section": {
      return true;
    }
    case "article": {
      return true;
    }
    case "aside": {
      return true;
    }
    case "nav": {
      return true;
    }
    case "header": {
      return true;
    }
    case "footer": {
      return true;
    }
    case "video": {
      return true;
    }
    case "source": {
      return true;
    }
    default: {
      return false;
    }
  }
}
function _M0FP36kazuph5reviw4core18is__dangerous__tag(tag) {
  switch (tag) {
    case "script": {
      return true;
    }
    case "iframe": {
      return true;
    }
    case "object": {
      return true;
    }
    case "embed": {
      return true;
    }
    case "form": {
      return true;
    }
    case "input": {
      return true;
    }
    default: {
      return false;
    }
  }
}
function _M0FP36kazuph5reviw4core14sanitize__html(input) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(input);
  const len = chars.length;
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  let i = 0;
  while (true) {
    if (i < len) {
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 60) {
        const tag_start = i;
        i = i + 1 | 0;
        const is_closing = i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 47;
        if (is_closing) {
          i = i + 1 | 0;
        }
        const name_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
        while (true) {
          if (i < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 32 && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 62 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) !== 47))) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(name_buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        const tag_name = _M0MP311moonbitlang4core6string6String9to__lower(name_buf.val);
        let tag_end = i;
        while (true) {
          if (tag_end < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, tag_end) !== 62) {
            tag_end = tag_end + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (tag_end < len) {
          tag_end = tag_end + 1 | 0;
        }
        if (_M0FP36kazuph5reviw4core18is__dangerous__tag(tag_name)) {
          if (!is_closing) {
            const close_tag = `</${tag_name}>`;
            let j = tag_end;
            while (true) {
              if ((j + close_tag.length | 0) <= len) {
                const close_chars = _M0MP311moonbitlang4core6string6String9to__array(close_tag);
                const close_len = close_chars.length;
                let match_ = true;
                let _tmp = 0;
                while (true) {
                  const k = _tmp;
                  if (k < close_len) {
                    if ((j + k | 0) >= len) {
                      match_ = false;
                      break;
                    }
                    const ch_lower = _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + k | 0) >= 65 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + k | 0) <= 90 ? _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + k | 0) + 32 | 0 : _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + k | 0);
                    if (ch_lower !== _M0MP311moonbitlang4core5array5Array2atGcE(close_chars, k)) {
                      match_ = false;
                      break;
                    }
                    _tmp = k + 1 | 0;
                    continue;
                  } else {
                    break;
                  }
                }
                if (match_) {
                  i = j + close_len | 0;
                  break;
                }
                j = j + 1 | 0;
                continue;
              } else {
                break;
              }
            }
            if ((j + close_tag.length | 0) > len) {
              i = tag_end;
            }
          } else {
            i = tag_end;
          }
          continue;
        }
        if (!_M0FP36kazuph5reviw4core16is__allowed__tag(tag_name) && tag_name.length > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&lt;");
          const tag_content = _M0FP36kazuph5reviw4core18safe__slice__range(input, tag_start + 1 | 0, tag_end);
          const trimmed_content = _M0MP311moonbitlang4core6string6String11has__suffix(tag_content, { str: _M0FP36kazuph5reviw4core30sanitize__html_2e_2abind_7c814, start: 0, end: _M0FP36kazuph5reviw4core30sanitize__html_2e_2abind_7c814.length }) ? _M0FP36kazuph5reviw4core18safe__slice__range(tag_content, 0, tag_content.length - 1 | 0) : tag_content;
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(trimmed_content));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "&gt;");
          i = tag_end;
          continue;
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 60);
        if (is_closing) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 47);
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, tag_name);
        const attr_region = _M0FP36kazuph5reviw4core18safe__slice__range(input, i, tag_end > 0 ? tag_end - 1 | 0 : i);
        const filtered = _M0FP36kazuph5reviw4core18filter__attributes(attr_region, tag_name);
        if (filtered.length > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, filtered);
        }
        if (tag_end > 1 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, tag_end - 2 | 0) === 47) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " /");
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 62);
        i = tag_end;
      } else {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, _M0MP311moonbitlang4core5array5Array2atGcE(chars, i));
        i = i + 1 | 0;
      }
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core23render__markdown__lines(lines) {
  _M0FP36kazuph5reviw4core16heading__counter.val = 0;
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  let i = 0;
  const len = lines.length;
  while (true) {
    if (i < len) {
      const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
      if (_M0FP36kazuph5reviw4core4trim(line).length === 0) {
        i = i + 1 | 0;
        continue;
      }
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c816, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c816.length }) && _M0FP36kazuph5reviw4core22is__html__block__start(line)) {
        const tag_name = _M0FP36kazuph5reviw4core24extract__html__tag__name(line);
        if (tag_name === "details") {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<details>\n");
          i = i + 1 | 0;
          while (true) {
            if (i < len) {
              const current = _M0FP36kazuph5reviw4core4trim(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
              if (_M0MP311moonbitlang4core6string6String11has__prefix(current, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c818, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c818.length })) {
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14sanitize__html(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i)));
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\n");
                i = i + 1 | 0;
                break;
              } else {
                if (_M0MP311moonbitlang4core6string6String11has__prefix(current, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c819, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c819.length })) {
                  break;
                }
              }
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          const inner_lines = [];
          let depth = 1;
          while (true) {
            if (i < len && depth > 0) {
              const current = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
              if (_M0MP311moonbitlang4core6string6String8contains(current, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c821, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c821.length })) {
                depth = depth - 1 | 0;
                if (depth === 0) {
                  i = i + 1 | 0;
                  break;
                }
              }
              if (_M0MP311moonbitlang4core6string6String8contains(current, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c822, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c822.length })) {
                depth = depth + 1 | 0;
              }
              _M0MP311moonbitlang4core5array5Array4pushGsE(inner_lines, current);
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          if (inner_lines.length > 0) {
            const inner_html = _M0FP36kazuph5reviw4core23render__markdown__lines(inner_lines);
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, inner_html);
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\n");
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</details>\n");
        } else {
          const html_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
          let depth = 1;
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(html_buf, line);
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(html_buf, "\n");
          i = i + 1 | 0;
          while (true) {
            if (i < len && depth > 0) {
              const current = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
              const _bind = `<${tag_name}`;
              if (_M0MP311moonbitlang4core6string6String8contains(current, { str: _bind, start: 0, end: _bind.length })) {
                depth = depth + 1 | 0;
              }
              const _bind$2 = `</${tag_name}>`;
              if (_M0MP311moonbitlang4core6string6String8contains(current, { str: _bind$2, start: 0, end: _bind$2.length })) {
                depth = depth - 1 | 0;
              }
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(html_buf, current);
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(html_buf, "\n");
              i = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14sanitize__html(html_buf.val));
        }
        continue;
      }
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c826, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c826.length })) {
        const level = _M0FP36kazuph5reviw4core21count__heading__level(line);
        if (level >= 1 && level <= 6) {
          const content = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(line, level + 1 | 0));
          const heading_key = _M0FP36kazuph5reviw4core18make__heading__key(content, _M0FP36kazuph5reviw4core16heading__counter.val);
          _M0FP36kazuph5reviw4core16heading__counter.val = _M0FP36kazuph5reviw4core16heading__counter.val + 1 | 0;
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(level, 10));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " class=\"md-heading-toggle\" data-heading-key=\"");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(heading_key));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-heading-level=\"");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(level, 10));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"><span class=\"heading-toggle-icon\">▼</span>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(content));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</h");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(level, 10));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ">\n");
          i = i + 1 | 0;
          continue;
        }
      }
      if (_M0FP36kazuph5reviw4core20is__horizontal__rule(line)) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<hr />\n");
        i = i + 1 | 0;
        continue;
      }
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c827, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c827.length })) {
        const lang = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(line, 3));
        i = i + 1 | 0;
        const code_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
        let code_first = true;
        while (true) {
          if (i < len && !_M0MP311moonbitlang4core6string6String11has__prefix(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c829, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c829.length })) {
            if (!code_first) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(code_buf, "\n");
            }
            code_first = false;
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(code_buf, _M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        if (i < len) {
          i = i + 1 | 0;
        }
        const code_text = code_buf.val;
        if (lang === "mermaid" || _M0FP36kazuph5reviw4core20is__mermaid__content(code_text)) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"mermaid-container\"><div class=\"mermaid\" data-source=\"");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(code_text));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(code_text));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div><button class=\"mermaid-fullscreen-btn\" title=\"Fullscreen\">⛶</button></div>\n");
        } else {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<pre><code");
          if (lang.length > 0) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " class=\"language-");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(lang));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"");
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ">");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(code_text));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</code></pre>\n");
        }
        continue;
      }
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c830, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c830.length })) {
        const quote_lines = [];
        while (true) {
          if (i < len && _M0MP311moonbitlang4core6string6String11has__prefix(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c832, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c832.length })) {
            const content = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), 1));
            _M0MP311moonbitlang4core5array5Array4pushGsE(quote_lines, content);
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<blockquote>");
        const _len = quote_lines.length;
        let _tmp = 0;
        while (true) {
          const _i = _tmp;
          if (_i < _len) {
            const ql = quote_lines[_i];
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p>");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(ql));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</p>");
            _tmp = _i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</blockquote>\n");
        continue;
      }
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c835, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c835.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c836, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c836.length })) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<ul>\n");
        while (true) {
          if (i < len && (_M0MP311moonbitlang4core6string6String11has__prefix(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c841, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c841.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c842, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c842.length }))) {
            const item_text = _M0FP36kazuph5reviw4core11safe__slice(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), 2);
            if (_M0MP311moonbitlang4core6string6String11has__prefix(item_text, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c838, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c838.length })) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<li class=\"task-list-item\"><input type=\"checkbox\" disabled /> ");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(_M0FP36kazuph5reviw4core11safe__slice(item_text, 4)));
            } else {
              if (_M0MP311moonbitlang4core6string6String11has__prefix(item_text, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c839, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c839.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(item_text, { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c840, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c840.length })) {
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled /> ");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(_M0FP36kazuph5reviw4core11safe__slice(item_text, 4)));
              } else {
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<li>");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(item_text));
              }
            }
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</li>\n");
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</ul>\n");
        continue;
      }
      if (_M0FP36kazuph5reviw4core23is__ordered__list__item(line)) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<ol>\n");
        while (true) {
          if (i < len && _M0FP36kazuph5reviw4core23is__ordered__list__item(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i))) {
            const content = _M0FP36kazuph5reviw4core31extract__ordered__list__content(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<li>");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(content));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</li>\n");
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</ol>\n");
        continue;
      }
      if ((i + 1 | 0) < len && _M0FP36kazuph5reviw4core20is__table__separator(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i + 1 | 0))) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"table-container\">\n");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<table>\n<thead>\n<tr>\n");
        const headers = _M0FP36kazuph5reviw4core17parse__table__row(line);
        const _len = headers.length;
        let _tmp = 0;
        while (true) {
          const _i = _tmp;
          if (_i < _len) {
            const h = headers[_i];
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<th>");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(_M0FP36kazuph5reviw4core4trim(h)));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</th>\n");
            _tmp = _i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tr>\n</thead>\n<tbody>\n");
        i = i + 2 | 0;
        while (true) {
          if (i < len && _M0MP311moonbitlang4core6string6String8contains(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c849, start: 0, end: _M0FP36kazuph5reviw4core39render__markdown__lines_2e_2abind_7c849.length })) {
            const cells = _M0FP36kazuph5reviw4core17parse__table__row(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tr>\n");
            const _len$2 = cells.length;
            let _tmp$2 = 0;
            while (true) {
              const _i = _tmp$2;
              if (_i < _len$2) {
                const cell = cells[_i];
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<td>");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(_M0FP36kazuph5reviw4core4trim(cell)));
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</td>\n");
                _tmp$2 = _i + 1 | 0;
                continue;
              } else {
                break;
              }
            }
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tr>\n");
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tbody>\n</table>\n</div>\n");
        continue;
      }
      const para_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
      let para_first = true;
      while (true) {
        if (i < len && (_M0FP36kazuph5reviw4core4trim(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i)).length > 0 && !_M0FP36kazuph5reviw4core16is__block__start(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i)))) {
          if (!para_first) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(para_buf, " ");
          }
          para_first = false;
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(para_buf, _M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
          i = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const para_text = para_buf.val;
      if (para_text.length > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p>");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core14render__inline(para_text));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</p>\n");
      }
      continue;
    } else {
      break;
    }
  }
  return _M0FP36kazuph5reviw4core4trim(buf.val);
}
function _M0FP36kazuph5reviw4core15parse__markdown(input) {
  if (input.length === 0) {
    const _bind = [];
    return { source: "", html: "", frontmatter: _M0MP311moonbitlang4core7builtin3Map11from__arrayGssE({ buf: _bind, start: 0, end: 0 }), questions: [] };
  }
  const lines = _M0FP36kazuph5reviw4core16split__to__lines(input);
  const _bind = [];
  const frontmatter = _M0MP311moonbitlang4core7builtin3Map11from__arrayGssE({ buf: _bind, start: 0, end: 0 });
  let content_start = 0;
  if (lines.length > 0 && _M0MP311moonbitlang4core5array5Array2atGsE(lines, 0) === "---") {
    let end_idx = -1;
    const _end471 = lines.length;
    let _tmp = 1;
    while (true) {
      const i = _tmp;
      if (i < _end471) {
        if (_M0MP311moonbitlang4core5array5Array2atGsE(lines, i) === "---") {
          end_idx = i;
          break;
        }
        _tmp = i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    if (end_idx > 0) {
      const _end476 = end_idx;
      let _tmp$2 = 1;
      while (true) {
        const i = _tmp$2;
        if (i < _end476) {
          const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
          const colon = _M0FP36kazuph5reviw4core15index__of__char(line, 58);
          if (colon >= 0) {
            const key = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core18safe__slice__range(line, 0, colon));
            const val = _M0FP36kazuph5reviw4core4trim(_M0FP36kazuph5reviw4core11safe__slice(line, colon + 1 | 0));
            if (key.length > 0) {
              _M0MP311moonbitlang4core7builtin3Map3setGssE(frontmatter, key, val);
            }
          }
          _tmp$2 = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      content_start = end_idx + 1 | 0;
    }
  }
  const content_lines = [];
  const _start485 = content_start;
  const _end486 = lines.length;
  let _tmp = _start485;
  while (true) {
    const i = _tmp;
    if (i < _end486) {
      _M0MP311moonbitlang4core5array5Array4pushGsE(content_lines, _M0MP311moonbitlang4core5array5Array2atGsE(lines, i));
      _tmp = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const html = _M0FP36kazuph5reviw4core23render__markdown__lines(content_lines);
  const src_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const _len = content_lines.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len) {
      const line = content_lines[_i];
      if (_i > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(src_buf, "\n");
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(src_buf, line);
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const questions = _M0FP36kazuph5reviw4core23parse__reviw__questions(lines, 0, content_start > 0 ? content_start : 0);
  return { source: src_buf.val, html: html, frontmatter: frontmatter, questions: questions };
}
function _M0FP36kazuph5reviw4core26build__mermaid__fullscreen(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-overlay\" id=\"mermaid-fullscreen\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-header\"><h3>Mermaid Diagram</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-controls\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"fs-zoom-out\">&minus;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"zoom-info\" id=\"fs-zoom-info\">100%</span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"fs-zoom-in\">+</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"fs-reset\">Reset</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"fs-close\">Close (ESC)</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-content\" id=\"fs-content\" style=\"overflow:hidden;position:relative;cursor:grab;flex:1;\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div id=\"fs-wrapper\" style=\"position:absolute;left:0;top:0;transform-origin:0 0;\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap\" id=\"fs-minimap\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap-content\" id=\"fs-minimap-content\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap-viewport\" id=\"fs-minimap-viewport\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core24build__image__fullscreen(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-overlay\" id=\"image-fullscreen\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-header\"><h3>Image</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-controls\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-zoom-out\">&minus;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"zoom-info\" id=\"img-fs-zoom-info\">100%</span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-zoom-in\">+</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span id=\"img-fs-counter\" style=\"margin:0 8px;font-size:12px;color:var(--muted);\"></span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-prev\" title=\"Previous\">&larr;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-next\" title=\"Next\">&rarr;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-reset\">Reset</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"img-fs-close\">Close (ESC)</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"fullscreen-content\" id=\"image-fs-content\" style=\"overflow:hidden;position:relative;cursor:grab;flex:1;\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div id=\"image-fs-wrapper\" style=\"position:absolute;left:0;top:0;transform-origin:0 0;\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap\" id=\"image-fs-minimap\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap-content\" id=\"image-fs-minimap-content\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"minimap-viewport\" id=\"image-fs-minimap-viewport\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core21build__media__sidebar(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"media-sidebar hidden\" id=\"media-sidebar\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"media-sidebar-thumbs\" id=\"media-sidebar-thumbs\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"media-sidebar-viewer\" id=\"media-sidebar-viewer\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core24build__video__fullscreen(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"video-fullscreen-overlay\" id=\"video-fullscreen\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"video-close-btn\" id=\"video-close\" aria-label=\"Close video\" title=\"Close (ESC)\">&#10005;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"video-settings-btn\" id=\"video-settings-btn\" aria-label=\"Timeline settings\" title=\"Timeline settings\">&#9881;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"video-settings-panel\" id=\"video-settings-panel\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h4>タイムライン設定</h4>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p class=\"video-settings-desc\">シーン感度: 映像変化の検出しきい値</p>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"video-settings-buttons\" id=\"scene-buttons\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-scene=\"0.3\">少なめ</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-scene=\"0.1\">やや少</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-scene=\"0.01\" class=\"selected\">標準</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-scene=\"0.003\">やや多</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-scene=\"0.001\">多め</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p class=\"video-settings-desc\">グルーピング: 連続する変化をまとめる秒数</p>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"video-settings-buttons\" id=\"stab-buttons\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-stab=\"0.5\">0.5s</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-stab=\"0.3\">0.3s</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-stab=\"0.1\" class=\"selected\">0.1s</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-stab=\"0.05\">0.05s</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button data-stab=\"0.02\">0.02s</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"video-container\" id=\"video-container\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span id=\"vid-fs-counter\" style=\"position:absolute;bottom:100px;left:50%;transform:translateX(-50%);color:#fff;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;font-size:14px;z-index:10;\"></span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core20build__comment__card(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"floating\" id=\"comment-card\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<header><h2 id=\"card-title\">Cell Comment</h2>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div style=\"display:flex; gap:6px;\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"icon-only\" id=\"copy-selection\" title=\"Copy selected lines\">&#128203;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"close-card\">Close</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"clear-comment\">Delete</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></header>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div id=\"cell-preview\" style=\"font-size:12px; color: var(--muted); margin-bottom:8px;\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<textarea id=\"comment-input\" placeholder=\"Enter your comment or note\"></textarea>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"image-attach-area image-attach-small\" id=\"comment-image-area\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<label>Image (Paste, max 1)</label>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"image-preview-list\" id=\"comment-image-preview\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"actions\"><button class=\"primary\" id=\"save-comment\">Save</button></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core27build__comment__list__aside(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<aside class=\"comment-list collapsed\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h3>Comments</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<ol id=\"comment-list\"></ol>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p class=\"hint\">Click \"Submit &amp; Exit\" to send comments and stop the server.</p>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</aside>");
}
function _M0FP36kazuph5reviw4core21build__history__panel(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<aside class=\"history-panel\" id=\"history-panel\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"history-panel-header\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h3>Review History</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"history-panel-close\" id=\"history-panel-close\">&#10005;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"history-panel-body\" id=\"history-panel-body\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"history-empty\">No review history yet.</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></aside>");
}
function _M0FP36kazuph5reviw4core26build__page__start_2einner(buf, filename, file_path) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<!DOCTYPE html><html lang=\"en\" data-theme=\"light\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<meta http-equiv=\"Cache-Control\" content=\"no-store, no-cache, must-revalidate\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<meta http-equiv=\"Pragma\" content=\"no-cache\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<meta http-equiv=\"Expires\" content=\"0\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<title>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(filename));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " | reviw</title>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github-dark.min.css\" id=\"hljs-theme-dark\" disabled>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/styles/github.min.css\" id=\"hljs-theme-light\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script src=\"https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js\"></script>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<style>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "/* Dark theme (default) */\n:root {\n  color-scheme: dark;\n  --bg: #0f172a;\n  --bg-gradient: radial-gradient(circle at 20% 20%, #1e293b 0%, #0b1224 35%, #0b1224 60%, #0f172a 100%);\n  --panel: #111827;\n  --panel-alpha: rgba(15, 23, 42, 0.9);\n  --panel-solid: #0b1224;\n  --card-bg: rgba(11, 18, 36, 0.95);\n  --input-bg: rgba(15, 23, 42, 0.6);\n  --border: #1f2937;\n  --accent: #60a5fa;\n  --accent-2: #f472b6;\n  --text: #e5e7eb;\n  --text-inverse: #0b1224;\n  --muted: #94a3b8;\n  --comment: #0f766e;\n  --badge: #22c55e;\n  --table-bg: rgba(15, 23, 42, 0.7);\n  --row-even: rgba(30, 41, 59, 0.4);\n  --row-odd: rgba(15, 23, 42, 0.2);\n  --selected-bg: rgba(96,165,250,0.15);\n  --hover-bg: rgba(96,165,250,0.08);\n  --shadow-color: rgba(0,0,0,0.35);\n  --code-bg: #1e293b;\n  --error: #dc3545;\n}\n/* Light theme */\n[data-theme=\"light\"] {\n  color-scheme: light;\n  --bg: #f8fafc;\n  --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);\n  --panel: #ffffff;\n  --panel-alpha: rgba(255, 255, 255, 0.95);\n  --panel-solid: #ffffff;\n  --card-bg: rgba(255, 255, 255, 0.98);\n  --input-bg: #f1f5f9;\n  --border: #e2e8f0;\n  --accent: #3b82f6;\n  --accent-2: #ec4899;\n  --text: #1e293b;\n  --text-inverse: #ffffff;\n  --muted: #64748b;\n  --comment: #14b8a6;\n  --badge: #22c55e;\n  --table-bg: #ffffff;\n  --row-even: #f8fafc;\n  --row-odd: #ffffff;\n  --selected-bg: rgba(59,130,246,0.12);\n  --hover-bg: rgba(59,130,246,0.06);\n  --shadow-color: rgba(0,0,0,0.1);\n  --code-bg: #f1f5f9;\n  --error: #dc3545;\n}\n* { box-sizing: border-box; }\nbody {\n  margin: 0;\n  font-family: \"Inter\", \"Hiragino Sans\", system-ui, -apple-system, sans-serif;\n  background: var(--bg-gradient);\n  color: var(--text);\n  min-height: 100vh;\n  transition: background 200ms ease, color 200ms ease;\n}\nheader {\n  position: sticky;\n  top: 0;\n  z-index: 5;\n  padding: 12px 16px;\n  background: var(--panel-alpha);\n  backdrop-filter: blur(8px);\n  border-bottom: 1px solid var(--border);\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  justify-content: space-between;\n  transition: background 200ms ease, border-color 200ms ease;\n}\nheader .meta { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }\nheader .actions { display: flex; gap: 8px; align-items: center; }\nheader h1 { display: flex; flex-direction: column; margin: 0; line-height: 1.3; }\nheader h1 .title-path { font-size: 11px; font-weight: 400; color: var(--muted); }\nheader h1 .title-file { font-size: 16px; font-weight: 700; }\nheader .badge {\n  background: var(--selected-bg);\n  color: var(--text);\n  padding: 6px 10px;\n  border-radius: 8px;\n  font-size: 12px;\n  border: 1px solid var(--border);\n}\nheader button {\n  background: linear-gradient(135deg, #38bdf8, #6366f1);\n  color: var(--text-inverse);\n  border: none;\n  border-radius: 10px;\n  padding: 10px 14px;\n  font-weight: 700;\n  cursor: pointer;\n  box-shadow: 0 10px 30px var(--shadow-color);\n  transition: transform 120ms ease, box-shadow 120ms ease;\n}\nheader button:hover { transform: translateY(-1px); box-shadow: 0 16px 36px var(--shadow-color); }\nheader button:active { transform: translateY(0); }\n/* Theme toggle button */\n.theme-toggle {\n  background: var(--selected-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 8px 10px;\n  font-size: 16px;\n  cursor: pointer;\n  transition: background 120ms ease, transform 120ms ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 38px;\n  height: 38px;\n}\n.theme-toggle:hover { background: var(--hover-bg); transform: scale(1.05); }\n\n.wrap { padding: 12px 16px 12px; }\n.toolbar {\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  flex-wrap: wrap;\n  margin: 10px 0 12px;\n  color: var(--muted);\n  font-size: 13px;\n}\n.toolbar button {\n  background: rgba(96,165,250,0.12);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 8px 10px;\n  font-size: 13px;\n  cursor: pointer;\n}\n.toolbar button:hover { background: rgba(96,165,250,0.2); }\n\n.table-box {\n  background: var(--table-bg);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  overflow: auto;\n  max-height: calc(100vh - 110px);\n  box-shadow: 0 20px 50px var(--shadow-color);\n  transition: background 200ms ease, border-color 200ms ease;\n}\ntable {\n  border-collapse: collapse;\n  width: 100%;\n  min-width: 540px;\n  table-layout: fixed;\n}\nthead th {\n  position: sticky;\n  top: 0;\n  z-index: 3;\n  background: var(--panel-solid) !important;\n  color: var(--muted);\n  font-size: 12px;\n  text-align: center;\n  padding: 0;\n  border-bottom: 1px solid var(--border);\n  border-right: 1px solid var(--border);\n  white-space: nowrap;\n  transition: background 200ms ease;\n}\nthead th:not(.selected) {\n  background: var(--panel-solid) !important;\n}\nthead th:first-child,\ntbody th {\n  width: 28px;\n  min-width: 28px;\n  max-width: 28px;\n}\nthead th .th-inner {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  padding: 8px 6px;\n  position: relative;\n  height: 100%;\n}\nthead th.filtered .th-inner {\n  background: linear-gradient(135deg, rgba(96,165,250,0.18), rgba(34,197,94,0.18));\n  color: #e5e7eb;\n  border-radius: 6px;\n  box-shadow: inset 0 -1px 0 rgba(255,255,255,0.05);\n}\nthead th.filtered .th-inner::after {\n  content: 'FILTER';\n  font-size: 10px;\n  color: #c7d2fe;\n  background: rgba(99,102,241,0.24);\n  border: 1px solid rgba(99,102,241,0.45);\n  padding: 1px 6px;\n  border-radius: 999px;\n  position: absolute;\n  bottom: 4px;\n  right: 6px;\n}\n.resizer {\n  position: absolute;\n  right: 2px;\n  top: 0;\n  width: 6px;\n  height: 100%;\n  cursor: col-resize;\n  user-select: none;\n  touch-action: none;\n  opacity: 0.6;\n}\n.resizer::after {\n  content: '';\n  position: absolute;\n  top: 10%;\n  bottom: 10%;\n  left: 2px;\n  width: 2px;\n  background: rgba(96,165,250,0.6);\n  border-radius: 2px;\n  opacity: 0;\n  transition: opacity 120ms ease;\n}\nthead th:hover .resizer::after { opacity: 1; }\n\n.freeze {\n  position: sticky !important;\n  background: var(--panel-solid);\n  z-index: 4;\n}\n.freeze-row {\n  position: sticky !important;\n  background: var(--panel-solid);\n}\n.freeze-row.freeze {\n  z-index: 6;\n}\nth.freeze-row {\n  z-index: 6;\n}\ntbody th {\n  position: sticky;\n  left: 0;\n  z-index: 2;\n  background: var(--panel-solid);\n  color: var(--muted);\n  text-align: right;\n  padding: 8px 10px;\n  font-size: 12px;\n  border-right: 1px solid var(--border);\n  border-bottom: 1px solid var(--border);\n  transition: background 200ms ease;\n}\ntd {\n  padding: 10px 10px;\n  border-bottom: 1px solid var(--border);\n  border-right: 1px solid var(--border);\n  background: var(--row-odd);\n  color: var(--text);\n  font-size: 13px;\n  line-height: 1.45;\n  cursor: pointer;\n  transition: background 120ms ease, box-shadow 120ms ease;\n  position: relative;\n  white-space: pre-wrap;\n  word-break: break-word;\n  max-width: 320px;\n}\ntr:nth-child(even) td:not(.selected):not(.has-comment) { background: var(--row-even); }\ntd:hover:not(.selected) { background: var(--hover-bg); box-shadow: inset 0 0 0 1px rgba(96,165,250,0.25); }\ntd.has-comment { background: rgba(34,197,94,0.12); box-shadow: inset 0 0 0 1px rgba(34,197,94,0.35); }\ntd.selected, tbody th.selected { background: rgba(99,102,241,0.22) !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }\n.preview-highlight { background: rgba(167,139,250,0.18) !important; box-shadow: inset 0 0 0 2px rgba(139,92,246,0.35); border-radius: 4px; transition: background 150ms ease, box-shadow 150ms ease; padding-left: 8px; margin-left: -8px; }\nthead th.selected { background: #c7d2fe !important; box-shadow: inset 0 0 0 1px rgba(99,102,241,0.45); }\n[data-theme=\"dark\"] thead th.selected { background: #3730a3 !important; }\nbody.dragging { user-select: none; cursor: crosshair; }\nbody.dragging td, body.dragging tbody th { cursor: crosshair; }\ntbody th { cursor: pointer; }\ntd .dot {\n  position: absolute;\n  right: 6px;\n  top: 6px;\n  width: 8px;\n  height: 8px;\n  border-radius: 99px;\n  background: var(--badge);\n  box-shadow: 0 0 0 4px rgba(34,197,94,0.15);\n}\n.floating {\n  position: absolute;\n  z-index: 10;\n  background: var(--panel-solid);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 12px;\n  width: min(420px, calc(100vw - 32px));\n  box-shadow: 0 20px 40px var(--shadow-color);\n  display: none;\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.floating header {\n  position: static;\n  background: transparent;\n  backdrop-filter: none;\n  border: none;\n  padding: 0 0 8px 0;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.floating h2 { font-size: 14px; margin: 0; color: var(--text); }\n.floating button {\n  margin-left: 8px;\n  background: var(--accent);\n  color: var(--text-inverse);\n  border: 1px solid var(--accent);\n  padding: 6px 10px;\n  border-radius: 8px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background 120ms ease, opacity 120ms ease;\n}\n.floating button.icon-only {\n  width: 32px;\n  height: 32px;\n  padding: 0;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 14px;\n  line-height: 1;\n}\n.floating button:hover { opacity: 0.85; }\n.floating textarea {\n  width: 100%;\n  min-height: 110px;\n  resize: vertical;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  background: var(--input-bg);\n  color: var(--text);\n  padding: 10px;\n  font-size: 13px;\n  line-height: 1.4;\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.floating textarea:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.floating .actions {\n  display: flex;\n  gap: 8px;\n  justify-content: flex-end;\n  margin-top: 10px;\n}\n.floating .actions button.primary {\n  background: linear-gradient(135deg, #22c55e, #16a34a);\n  color: var(--text-inverse);\n  border: none;\n  font-weight: 700;\n  box-shadow: 0 10px 30px rgba(22,163,74,0.35);\n}\n.comment-list {\n  position: fixed;\n  right: 14px;\n  bottom: 14px;\n  width: 320px;\n  max-height: 60vh;\n  overflow: auto;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: var(--card-bg);\n  box-shadow: 0 18px 40px var(--shadow-color);\n  padding: 12px;\n  backdrop-filter: blur(6px);\n  transition: opacity 120ms ease, transform 120ms ease, background 200ms ease;\n}\n.comment-list h3 { margin: 0 0 8px 0; font-size: 13px; color: var(--muted); }\n.comment-list ol {\n  margin: 0;\n  padding-left: 18px;\n  color: var(--text);\n  font-size: 13px;\n  line-height: 1.45;\n}\n.comment-list li { margin-bottom: 6px; }\n.comment-list .hint { color: var(--muted); font-size: 12px; }\n.pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 999px; background: var(--selected-bg); border: 1px solid var(--border); font-size: 12px; color: var(--text); cursor: pointer; transition: background 150ms ease, border-color 150ms ease; }\n.pill:hover { background: var(--hover-bg); border-color: var(--accent); }\n.pill strong { color: var(--text); font-weight: 700; }\n.comment-list.collapsed {\n  opacity: 0;\n  pointer-events: none;\n  transform: translateY(8px) scale(0.98);\n}\n.md-preview {\n  background: var(--input-bg);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 14px;\n  margin-bottom: 12px;\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.md-layout {\n  display: flex;\n  gap: 16px;\n  align-items: stretch;\n  margin-top: 8px;\n  height: calc(100vh - 80px);\n}\n.md-left {\n  flex: 1;\n  min-width: 0;\n  overflow-y: auto;\n  overflow-x: auto;\n  overscroll-behavior: contain;\n}\n.md-left .md-preview {\n  max-height: none;\n}\n.md-right {\n  flex: 1;\n  min-width: 0;\n  overflow-y: auto;\n  overflow-x: auto;\n  overscroll-behavior: contain;\n}\n.md-right .table-box {\n  max-width: none;\n  min-width: 0;\n  max-height: none;\n  overflow: visible;\n}\n/* Ensure thead is opaque in md-right to prevent content showing through */\n.md-right thead th {\n  background: var(--panel-solid) !important;\n}\n.md-right thead th.selected {\n  background: #c7d2fe !important;\n}\n[data-theme=\"dark\"] .md-right thead th {\n  background: var(--panel-solid) !important;\n}\n[data-theme=\"dark\"] .md-right thead th.selected {\n  background: #3730a3 !important;\n}\n\n/* === Media Sidebar === */\n.media-sidebar {\n  display: flex;\n  flex-shrink: 0;\n  height: calc(100vh - 80px);\n  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  position: relative;\n  z-index: 10;\n}\n.media-sidebar.hidden {\n  display: none;\n}\n.media-sidebar-thumbs {\n  width: 96px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 8px;\n  border-right: 1px solid var(--border);\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  background: var(--panel);\n  scrollbar-width: thin;\n  scrollbar-color: var(--border) transparent;\n}\n.media-sidebar-thumbs::-webkit-scrollbar {\n  width: 4px;\n}\n.media-sidebar-thumbs::-webkit-scrollbar-track {\n  background: transparent;\n}\n.media-sidebar-thumbs::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 4px;\n}\n.media-sidebar-thumb {\n  width: 80px;\n  height: 60px;\n  border-radius: 6px;\n  border: 2px solid var(--border);\n  overflow: hidden;\n  cursor: pointer;\n  position: relative;\n  flex-shrink: 0;\n  background: var(--bg);\n  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;\n}\n.media-sidebar-thumb:hover {\n  border-color: var(--accent);\n  transform: scale(1.05);\n  box-shadow: 0 2px 8px var(--shadow-color);\n}\n.media-sidebar-thumb.active {\n  border-color: var(--accent);\n  box-shadow: 0 0 0 2px var(--accent), 0 2px 8px var(--shadow-color);\n}\n.media-sidebar-thumb img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  display: block;\n}\n.media-sidebar-thumb svg {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n.media-sidebar-thumb-video {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #000;\n}\n.media-sidebar-thumb-video video {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.media-sidebar-thumb-video::after {\n  content: '';\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  background: rgba(255,255,255,0.85);\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.media-sidebar-thumb-video::before {\n  content: '';\n  position: absolute;\n  z-index: 1;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 5px 0 5px 9px;\n  border-color: transparent transparent transparent #000;\n  margin-left: 2px;\n}\n.media-sidebar-thumb-mermaid {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  padding: 2px;\n  background: var(--panel);\n  overflow: hidden;\n}\n.media-sidebar-thumb-mermaid svg {\n  width: 100% !important;\n  height: 100% !important;\n  max-width: 100%;\n  max-height: 100%;\n  display: block;\n}\n.media-sidebar-thumb-index {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  background: rgba(0,0,0,0.6);\n  color: #fff;\n  font-size: 9px;\n  font-weight: 600;\n  padding: 1px 4px;\n  border-radius: 3px;\n  line-height: 1.2;\n  pointer-events: none;\n  z-index: 1;\n}\n.media-sidebar-viewer {\n  width: 0;\n  overflow: hidden;\n  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  background: var(--bg);\n  position: relative;\n}\n.media-sidebar-viewer.open {\n  width: 45vw;\n  overflow: hidden;\n  padding: 16px;\n  border-right: 1px solid var(--border);\n  display: flex;\n  flex-direction: column;\n}\n.media-sidebar-viewer-content {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-start;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.media-sidebar-viewer-content img {\n  max-width: 100%;\n  max-height: calc(100vh - 140px);\n  object-fit: contain;\n  border-radius: 8px;\n}\n.media-sidebar-viewer-content video {\n  max-width: 100%;\n  max-height: calc(100vh - 140px);\n  border-radius: 8px;\n  background: #000;\n}\n.media-sidebar-viewer-content .viewer-mermaid-wrap {\n  width: 100%;\n  overflow: auto;\n  display: flex;\n  justify-content: center;\n  background: var(--panel);\n  border-radius: 8px;\n  padding: 16px;\n}\n.media-sidebar-viewer-content .viewer-mermaid-wrap svg {\n  width: 100% !important;\n  height: auto !important;\n  max-height: calc(100vh - 200px);\n}\n\n/* === Sidebar Rich Viewer: Mermaid zoom/pan/minimap === */\n.sidebar-mermaid-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 6px 10px;\n  background: var(--panel-alpha);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  margin-bottom: 8px;\n  width: 100%;\n  box-sizing: border-box;\n}\n.sidebar-mermaid-controls button {\n  background: var(--selected-bg);\n  border: 1px solid var(--border);\n  border-radius: 5px;\n  padding: 4px 10px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 13px;\n  line-height: 1;\n  transition: background 0.15s ease;\n}\n.sidebar-mermaid-controls button:hover { background: var(--hover-bg); }\n.sidebar-mermaid-controls .sidebar-zoom-info {\n  font-size: 11px;\n  color: var(--muted);\n  min-width: 40px;\n  text-align: center;\n  user-select: none;\n}\n.sidebar-mermaid-viewport {\n  width: 100%;\n  flex: 1;\n  overflow: hidden;\n  position: relative;\n  cursor: grab;\n  background: var(--panel);\n  border-radius: 8px;\n  border: 1px solid var(--border);\n}\n.sidebar-mermaid-viewport:active { cursor: grabbing; }\n.sidebar-mermaid-wrapper {\n  position: absolute;\n  transform-origin: 0 0;\n}\n.sidebar-mermaid-wrapper svg {\n  display: block;\n}\n.sidebar-minimap {\n  position: absolute;\n  bottom: 8px;\n  right: 8px;\n  width: 140px;\n  height: 100px;\n  background: var(--panel-alpha);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  overflow: hidden;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.12);\n  z-index: 3;\n}\n.sidebar-minimap-content {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 6px;\n}\n.sidebar-minimap-content svg {\n  max-width: 100%;\n  max-height: 100%;\n  opacity: 0.6;\n}\n.sidebar-minimap-viewport {\n  position: absolute;\n  border: 2px solid var(--accent);\n  background: rgba(102, 126, 234, 0.2);\n  pointer-events: none;\n  border-radius: 2px;\n}\n\n/* === Sidebar Rich Viewer: Image zoom/pan === */\n.sidebar-image-viewport {\n  width: 100%;\n  flex: 1;\n  overflow: hidden;\n  position: relative;\n  cursor: grab;\n  border-radius: 8px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.sidebar-image-viewport.panning { cursor: grabbing; }\n.sidebar-image-viewport img {\n  transform-origin: 0 0;\n  max-width: none !important;\n  max-height: none !important;\n  border-radius: 0 !important;\n  user-select: none;\n  -webkit-user-drag: none;\n}\n.sidebar-zoom-indicator {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  transform: translateX(-50%);\n  background: rgba(0, 0, 0, 0.65);\n  color: #fff;\n  font-size: 11px;\n  font-weight: 600;\n  padding: 3px 10px;\n  border-radius: 12px;\n  pointer-events: none;\n  z-index: 3;\n  backdrop-filter: blur(4px);\n  transition: opacity 0.3s ease;\n  user-select: none;\n}\n.sidebar-zoom-indicator.hidden { opacity: 0; }\n.sidebar-image-hint {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-size: 11px;\n  color: var(--muted);\n  pointer-events: none;\n  opacity: 0;\n  transition: opacity 0.4s ease;\n  text-align: center;\n  z-index: 2;\n}\n\n/* === Sidebar Rich Viewer: Video container (timeline uses shared .video-timeline classes) === */\n.sidebar-video-container {\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n.sidebar-video-container video {\n  width: 100%;\n  border-radius: 8px 8px 0 0;\n  background: #000;\n  max-height: calc(100vh - 260px);\n}\n\n.media-sidebar-viewer-label {\n  margin-top: 12px;\n  font-size: 12px;\n  color: var(--muted);\n  text-align: center;\n  word-break: break-all;\n}\n.media-sidebar-viewer-close {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 14px;\n  z-index: 2;\n  transition: background 0.15s ease;\n}\n.media-sidebar-viewer-close:hover {\n  background: var(--hover-bg);\n}\n.sidebar-settings-wrapper {\n  position: absolute;\n  top: 8px;\n  right: 40px;\n  z-index: 2;\n}\n.sidebar-settings-btn {\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 14px;\n  transition: background 0.15s ease;\n}\n.sidebar-settings-btn:hover {\n  background: var(--hover-bg);\n}\n.sidebar-settings-panel {\n  display: none;\n  position: absolute;\n  top: 36px;\n  right: 0;\n  min-width: 200px;\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 12px;\n  box-shadow: 0 4px 16px rgba(0,0,0,0.3);\n  z-index: 10;\n}\n.sidebar-settings-panel.open {\n  display: block;\n}\n.media-sidebar-toggle {\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 6px 10px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 14px;\n  transition: background 0.15s ease, border-color 0.15s ease;\n  display: none;\n}\n.media-sidebar-toggle.has-media {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}\n.media-sidebar-toggle:hover {\n  background: var(--hover-bg);\n  border-color: var(--accent);\n}\n.media-sidebar-toggle .toggle-count {\n  font-size: 10px;\n  font-weight: 700;\n  background: var(--accent);\n  color: var(--text-inverse);\n  padding: 1px 5px;\n  border-radius: 8px;\n  line-height: 1.4;\n}\n.view-toggle {\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 6px 10px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 14px;\n  transition: background 0.15s ease, border-color 0.15s ease;\n}\n.view-toggle:hover { background: rgba(96,165,250,0.2); }\n.view-toggle.active { background: var(--accent); color: #fff; }\n@media (max-width: 1200px) {\n  .media-sidebar-viewer.open {\n    width: 40vw;\n  }\n}\n@media (max-width: 900px) {\n  .media-sidebar-thumbs {\n    width: 72px;\n  }\n  .media-sidebar-thumb {\n    width: 56px;\n    height: 42px;\n  }\n  .media-sidebar-viewer.open {\n    width: 35vw;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .media-sidebar,\n  .media-sidebar-viewer,\n  .media-sidebar-thumb {\n    transition: none !important;\n  }\n}\n\n.md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 {\n  margin: 0.4em 0 0.2em;\n}\n/* Heading toggle feature */\n.md-preview .md-heading-toggle {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.md-preview .heading-toggle-icon {\n  font-size: 0.6em;\n  transition: transform 150ms ease;\n  color: var(--muted);\n  flex-shrink: 0;\n  cursor: pointer;\n  padding: 4px 8px;\n  margin: -4px 0 -4px -8px;\n  border-radius: 4px;\n}\n.md-preview .heading-toggle-icon:hover {\n  background: var(--hover-bg);\n  color: var(--accent);\n}\n.md-preview .md-heading-toggle.collapsed .heading-toggle-icon {\n  transform: rotate(-90deg);\n}\n.md-preview details.heading-toggle {\n  margin: 0.2em 0;\n}\n.md-preview details.heading-toggle > summary {\n  list-style: none;\n  cursor: pointer;\n}\n.md-preview details.heading-toggle > summary::-webkit-details-marker {\n  display: none;\n}\n.md-preview details.heading-toggle:not([open]) > .toggle-content {\n  display: none;\n}\n.md-preview .heading-section-content {\n  /* Content wrapper for collapsible sections */\n}\n.md-preview .heading-section-content.hidden {\n  display: none;\n}\n.md-preview p { margin: 0.3em 0; line-height: 1.5; }\n.md-preview img { max-width: 100%; height: auto; border-radius: 8px; }\n.md-preview video.video-preview { max-width: 100%; height: auto; border-radius: 8px; background: #000; }\n.md-preview table video.video-preview {\n  display: block;\n  width: 100%;\n  height: auto;\n}\n.md-preview code { background: rgba(255,255,255,0.08); padding: 2px 4px; border-radius: 4px; }\n.md-preview pre {\n  background: var(--code-bg);\n  padding: 12px 16px;\n  border-radius: 8px;\n  overflow: auto;\n  border: 1px solid var(--border);\n}\n.md-preview pre code {\n  background: none;\n  padding: 0;\n  font-size: 13px;\n  line-height: 1.5;\n}\n.md-preview pre code.hljs {\n  background: transparent;\n  padding: 0;\n}\n/* YAML Frontmatter table */\n.frontmatter-table {\n  margin-bottom: 20px;\n  border-radius: 8px;\n  overflow: hidden;\n  border: 1px solid var(--border);\n  background: var(--panel);\n}\n.frontmatter-table table {\n  width: 100%;\n  border-collapse: collapse;\n  table-layout: fixed;\n}\n.frontmatter-table thead th {\n  background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(96, 165, 250, 0.15));\n  color: var(--text);\n  font-size: 12px;\n  font-weight: 600;\n  padding: 10px 16px;\n  text-align: left;\n  border-bottom: 1px solid var(--border);\n}\n.frontmatter-table tbody th {\n  background: rgba(147, 51, 234, 0.08);\n  color: #c084fc;\n  font-weight: 500;\n  font-size: 12px;\n  padding: 8px 10px;\n  text-align: left;\n  border-bottom: 1px solid var(--border);\n  vertical-align: top;\n}\n.frontmatter-table tbody td {\n  padding: 8px 14px;\n  font-size: 13px;\n  border-bottom: 1px solid var(--border);\n  word-break: break-word;\n}\n.frontmatter-table tbody tr:last-child th,\n.frontmatter-table tbody tr:last-child td {\n  border-bottom: none;\n}\n.frontmatter-table .fm-tag {\n  display: inline-block;\n  background: rgba(96, 165, 250, 0.15);\n  color: var(--accent);\n  padding: 2px 8px;\n  border-radius: 12px;\n  font-size: 11px;\n  margin-right: 4px;\n  margin-bottom: 4px;\n}\n.frontmatter-table pre {\n  margin: 0;\n  background: var(--code-bg);\n  padding: 8px;\n  border-radius: 4px;\n  font-size: 11px;\n}\n/* Reviw questions preview cards */\n.reviw-questions-preview {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.reviw-q-card {\n  background: var(--code-bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 10px 12px;\n}\n.reviw-q-card.resolved {\n  border-left: 3px solid #22c55e;\n}\n.reviw-q-card.pending {\n  border-left: 3px solid #f59e0b;\n}\n.reviw-q-header {\n  font-size: 12px;\n  color: var(--text-dim);\n  margin-bottom: 4px;\n}\n.reviw-q-header strong {\n  color: var(--accent);\n}\n.reviw-q-question {\n  font-size: 13px;\n  color: var(--text);\n  margin-bottom: 6px;\n}\n.reviw-q-options {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n  margin-bottom: 6px;\n}\n.reviw-q-answer {\n  font-size: 12px;\n  color: #22c55e;\n  background: rgba(34, 197, 94, 0.1);\n  padding: 4px 8px;\n  border-radius: 4px;\n}\n[data-theme=\"light\"] .frontmatter-table tbody th {\n  color: #7c3aed;\n}\n/* Table scroll container and indicator */\n.table-scroll-container {\n  position: relative;\n  margin: 16px 0;\n}\n.table-scroll-wrapper {\n  overflow-x: auto;\n  border-radius: 8px;\n}\n.scroll-hint {\n  text-align: right;\n  font-size: 12px;\n  color: var(--accent);\n  padding: 4px 8px;\n  margin-bottom: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition: opacity 200ms ease;\n}\n.table-scroll-container.can-scroll .scroll-hint {\n  opacity: 0.8;\n  visibility: visible;\n}\n.table-scroll-container.scrolled-end .scroll-hint {\n  opacity: 0;\n  visibility: hidden;\n}\n/* Markdown tables in preview */\n.md-preview table:not(.frontmatter-table table) {\n  min-width: 100%;\n  width: max-content;\n  border-collapse: collapse;\n  border: 1px solid var(--border);\n  border-radius: 8px;\n}\n.md-preview table:not(.frontmatter-table table) th,\n.md-preview table:not(.frontmatter-table table) td {\n  padding: 10px 16px;\n  text-align: left;\n  border-bottom: 1px solid var(--border);\n  vertical-align: top;\n  word-break: break-word;\n  overflow-wrap: anywhere;\n  width: auto;\n}\n/* Force equal column widths when colgroup is not specified */\n.md-preview table:not(.frontmatter-table table) colgroup ~ * th,\n.md-preview table:not(.frontmatter-table table) colgroup ~ * td {\n  width: auto;\n}\n.md-preview table:not(.frontmatter-table table) td:has(video),\n.md-preview table:not(.frontmatter-table table) td:has(img) {\n  padding: 4px;\n  line-height: 0;\n}\n.md-preview table:not(.frontmatter-table table) td video,\n.md-preview table:not(.frontmatter-table table) td img {\n  width: 100%;\n  max-width: 100%;\n  height: auto;\n}\n.md-preview table:not(.frontmatter-table table) th {\n  background: var(--panel);\n  font-weight: 600;\n  font-size: 13px;\n}\n.md-preview table:not(.frontmatter-table table) td {\n  font-size: 13px;\n}\n.md-preview table:not(.frontmatter-table table) tr:last-child td {\n  border-bottom: none;\n}\n.md-preview table:not(.frontmatter-table table) tr:hover td {\n  background: var(--hover-bg);\n}\n/* Source table (右ペイン) */\n.table-box table {\n  table-layout: fixed;\n  width: 100%;\n}\n.table-box th,\n.table-box td {\n  word-break: break-word;\n  min-width: 140px;\n}\n.table-box th:first-child,\n.table-box td:first-child {\n  min-width: 320px;\n  max-width: 480px;\n}\n/* Image fullscreen overlay */\n.image-fullscreen-overlay {\n  position: fixed;\n  inset: 0;\n  background: var(--bg);\n  z-index: 1001;\n  display: none;\n  flex-direction: column;\n}\n.image-fullscreen-overlay.visible {\n  display: flex;\n}\n.image-fs-content {\n  flex: 1;\n  overflow: hidden;\n  position: relative;\n  cursor: grab;\n}\n.image-fs-content:active { cursor: grabbing; }\n.image-fs-content .image-fs-wrapper {\n  position: absolute;\n  transform-origin: 0 0;\n}\n.image-fs-content .image-fs-wrapper img {\n  display: block;\n}\n/* Video fullscreen overlay */\n.video-fullscreen-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.95);\n  z-index: 1001;\n  display: none;\n  justify-content: center;\n  align-items: center;\n}\n.video-fullscreen-overlay.visible {\n  display: flex;\n}\n.video-close-btn {\n  position: absolute;\n  top: 14px;\n  right: 14px;\n  width: 40px;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.55);\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  border-radius: 50%;\n  cursor: pointer;\n  color: #fff;\n  font-size: 18px;\n  z-index: 10;\n  backdrop-filter: blur(4px);\n  transition: background 120ms ease, transform 120ms ease;\n}\n.video-close-btn:hover {\n  background: rgba(0, 0, 0, 0.75);\n  transform: scale(1.04);\n}\n.video-container {\n  width: 90vw;\n  height: 90vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n.video-container video {\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n  border-radius: 8px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\n}\n/* Video Timeline - shared base styles (used by both fullscreen and sidebar) */\n.video-timeline {\n  background: rgba(0, 0, 0, 0.85);\n  display: flex;\n  overflow-x: auto;\n  backdrop-filter: blur(8px);\n  height: 80px;\n  padding: 8px;\n  gap: 4px;\n}\n.video-timeline::-webkit-scrollbar {\n  height: 6px;\n}\n.video-timeline::-webkit-scrollbar-track {\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 3px;\n}\n.video-timeline::-webkit-scrollbar-thumb {\n  background: rgba(255, 255, 255, 0.3);\n  border-radius: 3px;\n}\n.video-timeline::-webkit-scrollbar-thumb:hover {\n  background: rgba(255, 255, 255, 0.5);\n}\n/* Fullscreen-specific video timeline positioning */\n.video-container .video-timeline {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 5;\n}\n/* Sidebar-specific video timeline sizing */\n.sidebar-video-container .video-timeline {\n  width: 100%;\n  height: 72px;\n  padding: 6px;\n  gap: 3px;\n  border-radius: 0 0 8px 8px;\n  background: rgba(0, 0, 0, 0.88);\n}\n.sidebar-video-container .video-timeline::-webkit-scrollbar { height: 5px; }\n.sidebar-video-container .video-timeline::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.08); }\n.sidebar-video-container .video-timeline::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.25); }\n.sidebar-video-container .video-timeline::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }\n.timeline-thumb {\n  height: 64px;\n  cursor: pointer;\n  border: 2px solid transparent;\n  border-radius: 4px;\n  flex-shrink: 0;\n  transition: border-color 0.2s, transform 0.15s;\n  opacity: 0.85;\n}\n.sidebar-video-container .timeline-thumb {\n  height: 52px;\n  opacity: 0.8;\n}\n.timeline-thumb:hover {\n  border-color: rgba(59, 130, 246, 0.5);\n  opacity: 1;\n  transform: scale(1.05);\n}\n.timeline-thumb.active {\n  border-color: #3b82f6;\n  opacity: 1;\n  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);\n}\n.sidebar-video-container .timeline-thumb.active {\n  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);\n}\n.timeline-loading {\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 12px;\n  padding: 8px 12px;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.sidebar-video-container .timeline-loading {\n  font-size: 11px;\n  padding: 6px 10px;\n  gap: 6px;\n  color: rgba(255, 255, 255, 0.5);\n}\n.timeline-loading::before {\n  content: '';\n  width: 14px;\n  height: 14px;\n  border: 2px solid rgba(255, 255, 255, 0.3);\n  border-top-color: #3b82f6;\n  border-radius: 50%;\n  animation: timeline-spin 0.8s linear infinite;\n}\n.sidebar-video-container .timeline-loading::before {\n  width: 12px;\n  height: 12px;\n  border-width: 2px;\n  border-color: rgba(255, 255, 255, 0.25);\n  border-top-color: #3b82f6;\n}\n@keyframes timeline-spin {\n  to { transform: rotate(360deg); }\n}\n.timeline-time {\n  position: absolute;\n  bottom: 2px;\n  right: 4px;\n  font-size: 9px;\n  color: #fff;\n  background: rgba(0, 0, 0, 0.7);\n  padding: 1px 4px;\n  border-radius: 2px;\n  pointer-events: none;\n}\n.sidebar-video-container .timeline-time {\n  font-size: 8px;\n  right: 3px;\n  padding: 1px 3px;\n}\n.timeline-thumb-wrapper {\n  position: relative;\n  flex-shrink: 0;\n}\n/* Video threshold settings panel */\n.video-settings-btn {\n  position: absolute;\n  top: 14px;\n  right: 64px;\n  width: 40px;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(0, 0, 0, 0.55);\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  border-radius: 50%;\n  cursor: pointer;\n  color: #fff;\n  font-size: 18px;\n  z-index: 10;\n  backdrop-filter: blur(4px);\n  transition: background 120ms ease, transform 120ms ease;\n}\n.video-settings-btn:hover {\n  background: rgba(0, 0, 0, 0.75);\n  transform: scale(1.04);\n}\n.video-settings-panel {\n  position: absolute;\n  top: 60px;\n  right: 14px;\n  background: rgba(0, 0, 0, 0.9);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 12px;\n  padding: 16px;\n  z-index: 15;\n  min-width: 280px;\n  display: none;\n  backdrop-filter: blur(8px);\n}\n.video-settings-panel.visible {\n  display: block;\n}\n.video-settings-panel h4 {\n  margin: 0 0 8px;\n  color: #fff;\n  font-size: 14px;\n  font-weight: 500;\n}\n.video-settings-desc {\n  margin: 0 0 12px;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 11px;\n  line-height: 1.4;\n}\n.video-settings-buttons {\n  display: flex;\n  gap: 6px;\n  margin-bottom: 12px;\n}\n.video-settings-buttons button {\n  flex: 1;\n  padding: 8px 4px;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 6px;\n  background: rgba(255, 255, 255, 0.1);\n  color: rgba(255, 255, 255, 0.8);\n  font-size: 11px;\n  cursor: pointer;\n  transition: all 120ms ease;\n}\n.video-settings-buttons button:hover {\n  background: rgba(255, 255, 255, 0.2);\n  border-color: rgba(255, 255, 255, 0.3);\n}\n.video-settings-buttons button.selected {\n  background: #3b82f6;\n  border-color: #3b82f6;\n  color: #fff;\n}\n.video-settings-actions {\n  display: flex;\n  gap: 8px;\n  margin-top: 8px;\n}\n.video-settings-actions button {\n  flex: 1;\n  padding: 8px 12px;\n  border: none;\n  border-radius: 6px;\n  font-size: 12px;\n  cursor: pointer;\n  transition: background 120ms ease;\n}\n.video-settings-actions .reset-btn {\n  background: rgba(255, 255, 255, 0.15);\n  color: #fff;\n}\n.video-settings-actions .reset-btn:hover {\n  background: rgba(255, 255, 255, 0.25);\n}\n/* Video Shortcuts Help */\n.video-shortcuts-help {\n  opacity: 0.85;\n  transition: opacity 0.2s;\n}\n.video-shortcuts-help:hover {\n  opacity: 1;\n}\n.video-shortcuts-help .shortcuts-title {\n  font-weight: 600;\n  font-size: 11px;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 10px;\n  color: rgba(255, 255, 255, 0.7);\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.video-shortcuts-help .shortcuts-title::before {\n  content: '\\u2328';\n  font-size: 14px;\n}\n.video-shortcuts-help .shortcut-item {\n  margin-bottom: 6px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  flex-wrap: wrap;\n}\n.video-shortcuts-help .shortcut-item:last-child {\n  margin-bottom: 0;\n}\n.video-shortcuts-help kbd {\n  display: inline-block;\n  background: rgba(255, 255, 255, 0.15);\n  border: 1px solid rgba(255, 255, 255, 0.25);\n  border-radius: 4px;\n  padding: 2px 6px;\n  font-family: system-ui, -apple-system, sans-serif;\n  font-size: 10px;\n  font-weight: 500;\n  min-width: 18px;\n  text-align: center;\n  margin-right: 2px;\n}\n/* Reviw Questions Modal */\n.reviw-questions-overlay {\n  display: none;\n  position: fixed;\n  inset: 0;\n  background: rgba(0, 0, 0, 0.8);\n  z-index: 1100;\n  justify-content: center;\n  align-items: center;\n}\n.reviw-questions-overlay.visible {\n  display: flex;\n}\n.reviw-questions-modal {\n  background: var(--card-bg);\n  border: 1px solid var(--border);\n  border-radius: 16px;\n  width: 90%;\n  max-width: 600px;\n  max-height: 80vh;\n  display: flex;\n  flex-direction: column;\n  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);\n}\n.reviw-questions-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  border-bottom: 1px solid var(--border);\n}\n.reviw-questions-header h2 {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--text);\n}\n.reviw-questions-header h2 span {\n  font-size: 14px;\n  color: var(--text-dim);\n  font-weight: 400;\n}\n.reviw-questions-close {\n  width: 32px;\n  height: 32px;\n  border: none;\n  background: transparent;\n  color: var(--text-dim);\n  font-size: 18px;\n  cursor: pointer;\n  border-radius: 8px;\n  transition: all 150ms ease;\n}\n.reviw-questions-close:hover {\n  background: var(--border);\n  color: var(--text);\n}\n.reviw-questions-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px 20px;\n}\n.reviw-questions-footer {\n  padding: 12px 20px;\n  border-top: 1px solid var(--border);\n  display: flex;\n  justify-content: flex-end;\n}\n.reviw-questions-later {\n  padding: 8px 16px;\n  border: 1px solid var(--border);\n  background: transparent;\n  color: var(--text-dim);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 150ms ease;\n}\n.reviw-questions-later:hover {\n  background: var(--border);\n  color: var(--text);\n}\n/* Question Item */\n.reviw-question-item {\n  margin-bottom: 20px;\n  padding-bottom: 20px;\n  border-bottom: 1px solid var(--border);\n}\n.reviw-question-item:last-child {\n  margin-bottom: 0;\n  padding-bottom: 0;\n  border-bottom: none;\n}\n.reviw-question-text {\n  font-size: 14px;\n  color: var(--text);\n  margin-bottom: 12px;\n  line-height: 1.5;\n}\n.reviw-question-options {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  margin-bottom: 12px;\n}\n.reviw-question-option {\n  padding: 8px 14px;\n  border: 1px solid var(--border);\n  background: transparent;\n  color: var(--text);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 13px;\n  transition: all 150ms ease;\n}\n.reviw-question-option:hover {\n  border-color: var(--accent);\n  background: rgba(96, 165, 250, 0.1);\n}\n.reviw-question-option.selected {\n  border-color: var(--accent);\n  background: var(--accent);\n  color: var(--text-inverse);\n}\n.reviw-question-input {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid var(--border);\n  background: var(--input-bg);\n  color: var(--text);\n  border-radius: 8px;\n  font-size: 13px;\n  resize: vertical;\n  min-height: 60px;\n}\n.reviw-question-input:focus {\n  outline: none;\n  border-color: var(--accent);\n}\n.reviw-question-input::placeholder {\n  color: var(--text-dim);\n}\n.reviw-check-mark {\n  color: #22c55e;\n  font-weight: bold;\n}\n.reviw-question-item.answered {\n  border-color: #22c55e;\n  background: rgba(34, 197, 94, 0.05);\n}\n.reviw-question-submit {\n  margin-top: 10px;\n  padding: 8px 16px;\n  border: none;\n  background: var(--accent);\n  color: var(--text-inverse);\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 13px;\n  font-weight: 500;\n  transition: all 150ms ease;\n}\n.reviw-question-submit:hover {\n  filter: brightness(1.1);\n}\n.reviw-question-submit:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n/* Resolved Section */\n.reviw-resolved-section {\n  margin-top: 16px;\n  border-top: 1px solid var(--border);\n  padding-top: 12px;\n}\n.reviw-resolved-toggle {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  background: none;\n  border: none;\n  color: var(--text-dim);\n  font-size: 13px;\n  cursor: pointer;\n  padding: 4px 0;\n}\n.reviw-resolved-toggle:hover {\n  color: var(--text);\n}\n.reviw-resolved-toggle .arrow {\n  transition: transform 150ms ease;\n}\n.reviw-resolved-toggle.open .arrow {\n  transform: rotate(90deg);\n}\n.reviw-resolved-list {\n  display: none;\n  margin-top: 12px;\n}\n.reviw-resolved-list.visible {\n  display: block;\n}\n.reviw-resolved-item {\n  padding: 10px 12px;\n  background: var(--input-bg);\n  border-radius: 8px;\n  margin-bottom: 8px;\n  opacity: 0.7;\n}\n.reviw-resolved-item:last-child {\n  margin-bottom: 0;\n}\n.reviw-resolved-q {\n  font-size: 12px;\n  color: var(--text-dim);\n  margin-bottom: 4px;\n}\n.reviw-resolved-a {\n  font-size: 13px;\n  color: var(--text);\n}\n/* Notice Bar */\n.reviw-questions-bar {\n  display: none;\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  background: var(--accent);\n  color: var(--text-inverse);\n  padding: 8px 16px;\n  font-size: 13px;\n  z-index: 1050;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n}\n.reviw-questions-bar.visible {\n  display: flex;\n}\n.reviw-questions-bar button {\n  padding: 4px 12px;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--text-inverse);\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 12px;\n  transition: all 150ms ease;\n}\n.reviw-questions-bar button:hover {\n  background: rgba(255, 255, 255, 0.2);\n}\n/* Adjust layout when bar is visible */\nbody.has-questions-bar header {\n  top: 36px;\n}\nbody.has-questions-bar .toolbar,\nbody.has-questions-bar .table-wrap {\n  margin-top: 36px;\n}\n/* Copy notification toast */\n.copy-toast {\n  position: fixed;\n  bottom: 60px;\n  left: 50%;\n  transform: translateX(-50%) translateY(20px);\n  background: var(--accent);\n  color: var(--text-inverse);\n  padding: 8px 16px;\n  border-radius: 8px;\n  font-size: 13px;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 200ms ease, transform 200ms ease;\n  z-index: 1000;\n}\n.copy-toast.visible {\n  opacity: 1;\n  transform: translateX(-50%) translateY(0);\n}\n@media (max-width: 960px) {\n  .md-layout { flex-direction: column; }\n  .md-left { max-width: 100%; flex: 1 1 0; min-height: 0; }\n  .md-right { display: none; }\n  .media-sidebar { display: none; }\n  .media-sidebar-toggle { display: none !important; }\n}\n.md-layout.preview-only .md-right { display: none; }\n.md-layout.preview-only .md-left { flex: 1 1 0; min-height: 0; max-width: 100%; }\n.filter-menu {\n  position: absolute;\n  background: var(--panel-solid);\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  box-shadow: 0 14px 30px var(--shadow-color);\n  padding: 8px;\n  display: none;\n  z-index: 12;\n  width: 180px;\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.filter-menu button {\n  width: 100%;\n  display: block;\n  margin: 4px 0;\n  padding: 8px 10px;\n  background: var(--selected-bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  color: var(--text);\n  cursor: pointer;\n  font-size: 13px;\n  text-align: left;\n}\n.filter-menu button:hover { background: var(--hover-bg); }\n.modal-overlay {\n  position: fixed;\n  inset: 0;\n  background: rgba(0,0,0,0.6);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  z-index: 100;\n}\n.modal-overlay.visible { display: flex; }\n/* Submit modal: top-right position, no blocking overlay */\n#submit-modal {\n  background: transparent;\n  pointer-events: none;\n  align-items: flex-start;\n  justify-content: flex-end;\n}\n#submit-modal.visible { display: flex; }\n#submit-modal .modal-dialog {\n  pointer-events: auto;\n  margin: 60px 20px 20px 20px; /* top margin avoids header button overlap */\n}\n.modal-dialog {\n  background: var(--panel-solid);\n  border: 1px solid var(--border);\n  border-radius: 14px;\n  padding: 20px;\n  width: 90%;\n  max-width: 480px;\n  box-shadow: 0 20px 40px var(--shadow-color);\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.modal-dialog h3 { margin: 0 0 12px; font-size: 18px; color: var(--accent); }\n.modal-summary { color: var(--muted); font-size: 13px; margin-bottom: 12px; }\n.modal-dialog label { display: block; font-size: 13px; margin-bottom: 6px; color: var(--muted); }\n.modal-dialog textarea {\n  width: 100%;\n  min-height: 100px;\n  background: var(--input-bg);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  color: var(--text);\n  padding: 10px;\n  font-size: 14px;\n  resize: vertical;\n  box-sizing: border-box;\n  transition: background 200ms ease, border-color 200ms ease;\n}\n.modal-dialog textarea:focus { outline: none; border-color: var(--accent); }\n.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }\n.modal-actions button {\n  padding: 8px 16px;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  background: var(--selected-bg);\n  color: var(--text);\n  cursor: pointer;\n  font-size: 14px;\n}\n.modal-actions button:hover { background: var(--hover-bg); }\n.modal-actions button.primary { background: var(--accent); color: var(--text-inverse); border-color: var(--accent); }\n.image-attach-area { margin: 12px 0; }\n.image-attach-area label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px; }\n.image-attach-area.image-attach-small { margin: 8px 0; }\n.image-attach-area.image-attach-small label { font-size: 11px; }\n.image-preview-list { display: flex; flex-wrap: wrap; gap: 8px; min-height: 24px; }\n.image-preview-item { position: relative; }\n.image-preview-item img { max-width: 80px; max-height: 60px; border-radius: 4px; border: 1px solid var(--border); object-fit: cover; }\n.image-preview-item .remove-image { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--error, #ef4444); color: #fff; border: none; cursor: pointer; font-size: 12px; line-height: 1; display: flex; align-items: center; justify-content: center; }\n.image-preview-item .remove-image:hover { background: #dc2626; }\n.modal-actions button.primary:hover { background: #7dd3fc; }\n\n.modal-checkboxes { margin: 12px 0; }\n.modal-checkboxes label {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  font-size: 12px;\n  color: var(--text);\n  margin-bottom: 8px;\n  cursor: pointer;\n}\n.modal-checkboxes input[type=\"checkbox\"] {\n  margin-top: 2px;\n  accent-color: var(--accent);\n}\n\nbody.dragging { user-select: none; cursor: crosshair; }\nbody.dragging .diff-line { cursor: crosshair; }\n@media (max-width: 840px) {\n  header { flex-direction: column; align-items: flex-start; }\n  .comment-list { width: calc(100% - 24px); right: 12px; }\n}\n/* Mermaid diagram styles */\n.mermaid-container {\n  position: relative;\n  margin: 16px 0;\n  background: var(--panel);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  padding: 16px;\n  overflow: hidden;\n}\n.mermaid-container .mermaid {\n  display: flex;\n  justify-content: center;\n}\n.mermaid-container .mermaid svg {\n  max-width: 100%;\n  height: auto;\n  cursor: pointer;\n  pointer-events: auto;\n}\n.mermaid-fullscreen-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  background: var(--selected-bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 6px 10px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 12px;\n  z-index: 2;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.mermaid-fullscreen-btn:hover { background: var(--hover-bg); }\n/* Fullscreen overlay */\n.fullscreen-overlay {\n  position: fixed;\n  inset: 0;\n  background: var(--bg);\n  z-index: 1000;\n  display: none;\n  flex-direction: column;\n}\n.fullscreen-overlay.visible { display: flex; }\n.fullscreen-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 20px;\n  background: var(--panel-alpha);\n  border-bottom: 1px solid var(--border);\n}\n.fullscreen-header h3 { margin: 0; font-size: 14px; }\n.fullscreen-controls { display: flex; gap: 8px; align-items: center; }\n.fullscreen-controls button {\n  background: var(--selected-bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 6px 12px;\n  cursor: pointer;\n  color: var(--text);\n  font-size: 13px;\n}\n.fullscreen-controls button:hover { background: var(--hover-bg); }\n.fullscreen-controls .zoom-info { font-size: 12px; color: var(--muted); min-width: 50px; text-align: center; }\n.fullscreen-content {\n  flex: 1;\n  overflow: hidden;\n  position: relative;\n  cursor: grab;\n}\n.fullscreen-content:active { cursor: grabbing; }\n.fullscreen-content .mermaid-wrapper {\n  position: absolute;\n  transform-origin: 0 0;\n  padding: 40px;\n}\n.fullscreen-content .mermaid svg {\n  display: block;\n}\n/* Minimap */\n.minimap {\n  position: absolute;\n  top: 70px;\n  right: 20px;\n  width: 200px;\n  height: 150px;\n  background: var(--panel-alpha);\n  border: 1px solid var(--border);\n  border-radius: 8px;\n  overflow: hidden;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n}\n.minimap-content {\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 8px;\n}\n.minimap-content svg {\n  max-width: 100%;\n  max-height: 100%;\n  opacity: 0.6;\n}\n.minimap-viewport {\n  position: absolute;\n  border: 2px solid var(--accent);\n  background: rgba(102, 126, 234, 0.2);\n  pointer-events: none;\n  border-radius: 2px;\n}\n/* Error toast */\n.mermaid-error-toast {\n  position: fixed;\n  bottom: 20px;\n  left: 50%;\n  transform: translateX(-50%);\n  background: var(--error);\n  color: white;\n  padding: 12px 24px;\n  border-radius: 8px;\n  font-size: 13px;\n  max-width: 80%;\n  z-index: 2000;\n  display: none;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.3);\n  white-space: pre-wrap;\n  font-family: monospace;\n}\n.mermaid-error-toast.visible { display: block; }\n\n/* History Panel - Push layout */\nbody { transition: margin-right 0.25s ease; }\nbody.history-open { margin-right: 320px; }\nbody.history-open header { right: 320px; }\nheader { transition: right 0.25s ease; right: 0; }\n\n.history-toggle {\n  background: var(--selected-bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  padding: 6px 8px;\n  font-size: 14px;\n  cursor: pointer;\n  width: 34px;\n  height: 34px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.history-toggle:hover { background: var(--border); }\n.history-panel {\n  position: fixed;\n  top: 0;\n  right: 0;\n  width: 320px;\n  height: 100vh;\n  background: var(--panel-solid);\n  border-left: 1px solid var(--border);\n  z-index: 90;\n  transform: translateX(100%);\n  transition: transform 0.25s ease;\n  display: flex;\n  flex-direction: column;\n}\n.history-panel.open { transform: translateX(0); }\n.history-panel-header {\n  padding: 16px;\n  border-bottom: 1px solid var(--border);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.history-panel-header h3 { margin: 0; font-size: 14px; font-weight: 600; }\n.history-panel-close {\n  background: transparent;\n  border: none;\n  color: var(--muted);\n  cursor: pointer;\n  font-size: 18px;\n  padding: 4px;\n}\n.history-panel-close:hover { color: var(--text); }\n.history-panel-body {\n  flex: 1;\n  overflow-y: auto;\n  padding: 12px;\n}\n.history-empty {\n  color: var(--muted);\n  font-size: 13px;\n  text-align: center;\n  padding: 40px 20px;\n}\n.history-date-group { margin-bottom: 16px; }\n.history-date {\n  font-size: 11px;\n  font-weight: 600;\n  color: var(--muted);\n  margin-bottom: 8px;\n  text-transform: uppercase;\n}\n.history-item {\n  background: var(--bg);\n  border: 1px solid var(--border);\n  border-radius: 6px;\n  margin-bottom: 8px;\n  overflow: hidden;\n}\n.history-item-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 8px 10px;\n  background: var(--selected-bg);\n  cursor: pointer;\n}\n.history-item-header:hover { background: var(--hover-bg); }\n.history-item-file {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--text);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 180px;\n}\n.history-item-time { font-size: 10px; color: var(--muted); }\n.history-item-body {\n  display: none;\n  padding: 10px;\n  font-size: 12px;\n  border-top: 1px solid var(--border);\n}\n.history-item.expanded .history-item-body { display: block; }\n.history-summary {\n  color: var(--text);\n  margin-bottom: 8px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid var(--border);\n}\n.history-summary-label {\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--muted);\n  margin-bottom: 4px;\n}\n.history-summary-text { white-space: pre-wrap; line-height: 1.4; }\n.history-comments-label {\n  font-size: 10px;\n  font-weight: 600;\n  color: var(--muted);\n  margin-bottom: 6px;\n}\n.history-comment {\n  padding: 6px 0;\n  border-bottom: 1px solid var(--border);\n}\n.history-comment:last-child { border-bottom: none; }\n.history-comment-line {\n  font-size: 10px;\n  color: var(--accent);\n  font-weight: 600;\n  margin-bottom: 2px;\n}\n.history-comment-quote {\n  background: rgba(0, 0, 0, 0.3);\n  border-left: 2px solid var(--accent);\n  padding: 4px 8px;\n  margin: 4px 0;\n  font-family: 'SF Mono', Monaco, Consolas, monospace;\n  font-size: 11px;\n  color: var(--muted);\n  white-space: pre-wrap;\n  word-break: break-all;\n  max-height: 80px;\n  overflow-y: auto;\n}\n.history-comment-text {\n  color: var(--text);\n  line-height: 1.4;\n  white-space: pre-wrap;\n}\n.history-badge {\n  display: inline-block;\n  background: var(--accent);\n  color: var(--text-inverse);\n  font-size: 10px;\n  padding: 2px 6px;\n  border-radius: 10px;\n  margin-left: 6px;\n}\n/* Table scroll container */\n.table-container {\n  overflow-x: auto;\n  margin: 16px 0;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n}\n.table-container table {\n  margin: 0;\n  border: none;\n  border-radius: 0;\n}\n.table-container::-webkit-scrollbar {\n  height: 6px;\n}\n.table-container::-webkit-scrollbar-track {\n  background: var(--bg);\n  border-radius: 3px;\n}\n.table-container::-webkit-scrollbar-thumb {\n  background: var(--border);\n  border-radius: 3px;\n}\n.table-container::-webkit-scrollbar-thumb:hover {\n  background: var(--muted);\n}\n/* Media sidebar */\n.media-sidebar {\n  display: flex;\n  flex-shrink: 0;\n  height: calc(100vh - 80px);\n  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  position: relative;\n  z-index: 10;\n}\n.media-sidebar.hidden { display: none; }\n.media-sidebar-thumbs {\n  width: 96px;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 8px;\n  border-right: 1px solid var(--border);\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  background: var(--panel);\n  scrollbar-width: thin;\n  scrollbar-color: var(--border) transparent;\n}\n.media-sidebar-thumbs::-webkit-scrollbar { width: 4px; }\n.media-sidebar-thumbs::-webkit-scrollbar-track { background: transparent; }\n.media-sidebar-thumbs::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }\n.media-sidebar-thumb {\n  width: 80px;\n  height: 60px;\n  border-radius: 6px;\n  border: 2px solid var(--border);\n  overflow: hidden;\n  cursor: pointer;\n  position: relative;\n  flex-shrink: 0;\n  background: var(--bg);\n  transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;\n}\n.media-sidebar-thumb:hover { border-color: var(--accent); transform: scale(1.05); box-shadow: 0 2px 8px var(--shadow-color); }\n.media-sidebar-thumb.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent), 0 2px 8px var(--shadow-color); }\n.media-sidebar-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\n.media-sidebar-thumb svg { width: 100%; height: 100%; display: block; }\n.media-sidebar-thumb-video {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #000;\n}\n.media-sidebar-thumb-video video { width: 100%; height: 100%; object-fit: cover; }\n.media-sidebar-thumb-video::after {\n  content: '';\n  position: absolute;\n  width: 24px;\n  height: 24px;\n  background: rgba(255,255,255,0.85);\n  border-radius: 50%;\n}\n.media-sidebar-thumb-video::before {\n  content: '';\n  position: absolute;\n  z-index: 1;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 5px 0 5px 9px;\n  border-color: transparent transparent transparent #000;\n  margin-left: 2px;\n}\n.media-sidebar-thumb-mermaid {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  padding: 2px;\n  background: var(--panel);\n  overflow: hidden;\n}\n.media-sidebar-thumb-mermaid svg { width: 100% !important; height: 100% !important; max-width: 100%; max-height: 100%; display: block; }\n.media-sidebar-thumb-index {\n  position: absolute;\n  top: 2px;\n  left: 2px;\n  background: rgba(0,0,0,0.6);\n  color: #fff;\n  font-size: 9px;\n  font-weight: 600;\n  padding: 1px 4px;\n  border-radius: 3px;\n  line-height: 1.2;\n  pointer-events: none;\n  z-index: 1;\n}\n.media-sidebar-viewer {\n  width: 0;\n  overflow: hidden;\n  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  background: var(--bg);\n  position: relative;\n}\n.media-sidebar-viewer.open {\n  width: 45vw;\n  overflow: hidden;\n  padding: 16px;\n  border-right: 1px solid var(--border);\n  display: flex;\n  flex-direction: column;\n}\n.media-sidebar-viewer-close {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 2;\n  background: var(--selected-bg);\n  border: 1px solid var(--border);\n  color: var(--text);\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  cursor: pointer;\n  font-size: 14px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.media-sidebar-viewer-content {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: flex-start;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n.media-sidebar-viewer-content img { max-width: 100%; max-height: calc(100vh - 140px); object-fit: contain; border-radius: 8px; }\n.media-sidebar-viewer-content video { max-width: 100%; max-height: calc(100vh - 140px); border-radius: 8px; background: #000; }\n.media-sidebar-viewer-label {\n  margin-top: 8px;\n  font-size: 12px;\n  color: var(--muted);\n  text-align: center;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 100%;\n}\n.sidebar-zoom-indicator {\n  position: absolute;\n  bottom: 12px;\n  right: 12px;\n  background: rgba(0,0,0,0.7);\n  color: #fff;\n  padding: 4px 8px;\n  border-radius: 4px;\n  font-size: 11px;\n  pointer-events: none;\n  transition: opacity 0.3s ease;\n}\n.sidebar-zoom-indicator.hidden { opacity: 0; }\n.sidebar-mermaid-viewport { overflow: hidden; position: relative; cursor: grab; }\n.sidebar-mermaid-wrapper { position: absolute; left: 0; top: 0; transform-origin: 0 0; }\n.sidebar-video-container { width: 100%; }\n.sidebar-video-container video { width: 100%; max-height: calc(100vh - 200px); border-radius: 8px; background: #000; }\n/* Video timeline */\n.video-timeline {\n  display: flex;\n  gap: 8px;\n  padding: 8px;\n  overflow-x: auto;\n  background: var(--panel);\n  border-radius: 8px;\n  margin-top: 8px;\n  scrollbar-width: thin;\n  scrollbar-color: var(--border) transparent;\n}\n.timeline-loading { color: var(--muted); font-size: 12px; padding: 8px; }\n.timeline-thumb-wrapper {\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n}\n.timeline-thumb {\n  width: 80px;\n  height: 60px;\n  object-fit: cover;\n  border-radius: 4px;\n  border: 2px solid transparent;\n  transition: border-color 0.2s ease;\n}\n.timeline-thumb.active { border-color: var(--accent); }\n.timeline-thumb:hover { border-color: var(--accent); opacity: 0.8; }\n.timeline-time { font-size: 10px; color: var(--muted); }\n/* Fullscreen overlay */\n.fullscreen-overlay {\n  display: none;\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0,0,0,0.9);\n  z-index: 1000;\n  flex-direction: column;\n}\n.fullscreen-overlay.visible { display: flex; }\n.fullscreen-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 16px;\n  background: rgba(0,0,0,0.8);\n  border-bottom: 1px solid rgba(255,255,255,0.1);\n}\n.fullscreen-header h3 { margin: 0; color: #fff; font-size: 14px; }\n.fullscreen-controls { display: flex; gap: 6px; align-items: center; }\n.fullscreen-controls button {\n  background: rgba(255,255,255,0.1);\n  border: 1px solid rgba(255,255,255,0.2);\n  color: #fff;\n  padding: 6px 12px;\n  border-radius: 6px;\n  cursor: pointer;\n  font-size: 12px;\n}\n.fullscreen-controls button:hover { background: rgba(255,255,255,0.2); }\n.fullscreen-controls .zoom-info { color: #fff; font-size: 12px; min-width: 40px; text-align: center; }");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</style></head><body>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<header><div class=\"meta\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h1>");
  if (file_path.length > 0) {
    let last_slash = -1;
    const chars = _M0MP311moonbitlang4core6string6String9to__array(file_path);
    const _len = chars.length;
    let _tmp = 0;
    while (true) {
      const _i = _tmp;
      if (_i < _len) {
        const ch = chars[_i];
        if (ch === 47) {
          last_slash = _i;
        }
        _tmp = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    const dir_end = last_slash;
    if (dir_end >= 0) {
      const dir_path = _M0MP311moonbitlang4core6string6String17substring_2einner(file_path, 0, dir_end + 1 | 0);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"title-path\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(dir_path));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span>");
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"title-file\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(filename));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span></h1>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"badge\">Click to comment / ESC to cancel</span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"pill\" id=\"pill-comments\" title=\"Toggle comment panel\">Comments <strong id=\"comment-count\">0</strong></button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div><div class=\"actions\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"media-sidebar-toggle\" id=\"media-sidebar-toggle\" title=\"Media Gallery\" aria-label=\"Toggle media gallery\">🖼<span class=\"toggle-count\" id=\"media-toggle-count\"></span></button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"view-toggle\" id=\"view-toggle\" title=\"Hide source panel\">&#128221;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"history-toggle\" id=\"history-toggle\" title=\"Review History\">&#9776;</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"theme-toggle\" id=\"theme-toggle\" title=\"Toggle theme\"><span id=\"theme-icon\">&#127769;</span></button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"send-and-exit\">Submit &amp; Exit</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></header>");
}
function _M0FP36kazuph5reviw4core23build__questions__modal(buf, questions) {
  if (questions.length === 0) {
    return undefined;
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-overlay\" id=\"reviw-questions-overlay\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-modal\" id=\"reviw-questions-modal\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-header\"><h2>📋 AIからの質問 <span id=\"reviw-questions-count\"></span></h2>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"btn\" id=\"reviw-questions-close\">✕</button></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-body\" id=\"reviw-questions-body\">");
  let unresolved_count = 0;
  const _len = questions.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const q = questions[_i];
      if (!q.resolved) {
        unresolved_count = unresolved_count + 1 | 0;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _len$2 = questions.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len$2) {
      _L: {
        const q = questions[_i];
        if (q.resolved) {
          break _L;
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"question-card\" data-qid=\"");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.id));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"q-header\">⏳ <strong>");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.id.length > 0 ? q.id : `Q${_M0MP311moonbitlang4core3int3Int18to__string_2einner(_i + 1 | 0, 10)}`));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</strong> <span class=\"q-check\" id=\"q-check-");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"></span></div>");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"q-body\">");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.question));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
        if (q.options.length > 0) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"q-options\">");
          const _arr = q.options;
          const _len$3 = _arr.length;
          let _tmp$3 = 0;
          while (true) {
            const _i$2 = _tmp$3;
            if (_i$2 < _len$3) {
              const opt = _arr[_i$2];
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"q-option-btn\" data-qi=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-oi=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i$2, 10));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-val=\"");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(opt));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(opt));
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</button>");
              _tmp$3 = _i$2 + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
        }
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<textarea class=\"q-answer\" data-qi=\"");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" placeholder=\"回答を入力...\" style=\"width:100%;min-height:60px;margin-top:8px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:8px\">");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.answer));
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</textarea>");
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
        break _L;
      }
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const resolved_count = questions.length - unresolved_count | 0;
  if (resolved_count > 0) {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-resolved-section\">");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"reviw-resolved-toggle\">✅ 解決済み (");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(resolved_count, 10));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ")</button><div class=\"reviw-resolved-list\">");
    const _len$3 = questions.length;
    let _tmp$3 = 0;
    while (true) {
      const _i = _tmp$3;
      if (_i < _len$3) {
        _L: {
          const q = questions[_i];
          if (!q.resolved) {
            break _L;
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"question-card resolved\"><div class=\"q-header\">✅ <strong>");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.id.length > 0 ? q.id : `Q${_M0MP311moonbitlang4core3int3Int18to__string_2einner(_i + 1 | 0, 10)}`));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</strong></div><div class=\"q-body\">");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.question));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
          if (q.answer.length > 0) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"q-answer-display\">");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(q.answer));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
          break _L;
        }
        _tmp$3 = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div>");
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-footer\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"btn\" id=\"reviw-questions-later\">後で回答する</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"reviw-questions-bar\" id=\"reviw-questions-bar\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span id=\"reviw-questions-bar-message\">🗂️ 未回答の質問が<span id=\"reviw-questions-bar-count\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(unresolved_count, 10));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span>件あります</span>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"btn\" id=\"reviw-questions-bar-open\">質問を見る</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
}
function _M0FP36kazuph5reviw4core24build__questions__notice(buf, questions) {
  if (questions.length === 0) {
    return undefined;
  }
  let pending = 0;
  const _len = questions.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const q = questions[_i];
      if (!q.resolved) {
        pending = pending + 1 | 0;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (pending > 0) {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div id=\"questions-notice\" style=\"display:none\"></div>");
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw4core22build__recovery__modal(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-overlay\" id=\"recovery-modal\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-dialog\"><h3>Restore Previous Comments?</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p class=\"modal-summary\" id=\"recovery-summary\">Found saved comments from a previous session.</p>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-actions\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"recovery-discard\">Discard</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"primary\" id=\"recovery-restore\">Restore</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div></div>");
}
function _M0FP36kazuph5reviw4core18escape__js__string(s) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      switch (ch) {
        case 92: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\\\");
          break;
        }
        case 34: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\\"");
          break;
        }
        case 10: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\n");
          break;
        }
        case 13: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\r");
          break;
        }
        case 9: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\t");
          break;
        }
        case 60: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\u003c");
          break;
        }
        default: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, ch);
        }
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return buf.val;
}
function _M0FP36kazuph5reviw4core21build__script__footer(buf, port, mode, filename) {
  if (mode === "markdown") {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script src=\"https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js\"></script>");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "mermaid.initialize({startOnLoad:false,theme:document.documentElement.getAttribute('data-theme')==='light'?'default':'dark',securityLevel:'loose'});");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "mermaid.run().catch(function(e){console.error('Mermaid error:',e);});");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "window.__reRenderMermaid=function(theme){");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "mermaid.initialize({startOnLoad:false,theme:theme!=='light'?'dark':'default',securityLevel:'loose'});");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "var divs=document.querySelectorAll('.mermaid');");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "divs.forEach(function(d){d.removeAttribute('data-processed');d.innerHTML=d.getAttribute('data-source');});");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "if(divs.length>0)mermaid.run({nodes:Array.from(divs)}).catch(function(){});");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "};");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</script>");
  }
  if (mode === "markdown") {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "if(typeof hljs!=='undefined'){");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "var preview=document.querySelector('.md-preview');");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "if(preview){preview.querySelectorAll('pre code').forEach(function(block){");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "if(block.closest('.mermaid-container')||block.classList.contains('hljs'))return;");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "hljs.highlightElement(block);");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "});}");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "}");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</script>");
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script type=\"module\" src=\"/ui.js\"></script>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>window.__REVIW_PORT__=");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(port, 10));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ";window.__REVIW_MODE__=\"");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(mode));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\";window.__REVIW_FILENAME__=\"");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(filename));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\";</script></body></html>");
}
function _M0FP36kazuph5reviw4core20build__submit__modal(buf) {
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-overlay\" id=\"submit-modal\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-dialog\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<h3>Submit Review</h3>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<p class=\"modal-summary\" id=\"modal-summary\"></p>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<label for=\"global-comment\">Overall comment (optional)</label>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<textarea id=\"global-comment\" placeholder=\"Add a summary or overall feedback...\"></textarea>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"image-attach-area\" id=\"submit-image-area\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<label>Attach images (Paste, max 5)</label>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"image-preview-list\" id=\"submit-image-preview\"></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"modal-actions\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button id=\"modal-cancel\">Cancel</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<button class=\"primary\" id=\"modal-submit\">Submit</button>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div></div>");
}
function _M0FP36kazuph5reviw4core11json__quote(s) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(s));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
  return buf.val;
}
function _M0FP36kazuph5reviw4core26serialize__questions__json(questions) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 91);
  const _len = questions.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const q = questions[_i];
      if (_i > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "{\"id\":");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core11json__quote(q.id));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",\"question\":");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core11json__quote(q.question));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",\"resolved\":");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, q.resolved ? "true" : "false");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",\"answer\":");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core11json__quote(q.answer));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",\"options\":[");
      const _arr = q.options;
      const _len$2 = _arr.length;
      let _tmp$2 = 0;
      while (true) {
        const _i$2 = _tmp$2;
        if (_i$2 < _len$2) {
          const opt = _arr[_i$2];
          if (_i$2 > 0) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core11json__quote(opt));
          _tmp$2 = _i$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "]}");
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 93);
  return buf.val;
}
function _M0FP36kazuph5reviw4core30serialize__source__lines__json(lines) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 91);
  const _len = lines.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const line = lines[_i];
      if (_i > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "[\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(line));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"]");
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 93);
  return buf.val;
}
function _M0FP36kazuph5reviw4core29build__markdown__html_2einner(md, filename, port, file_path) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0FP36kazuph5reviw4core26build__page__start_2einner(buf, filename, file_path);
  _M0FP36kazuph5reviw4core21build__history__panel(buf);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"wrap\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"md-layout\">");
  _M0FP36kazuph5reviw4core21build__media__sidebar(buf);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"md-left\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"md-preview\" id=\"md-preview\">");
  const _p = md.frontmatter;
  if (_p.size > 0) {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"frontmatter-header\">Document Metadata</div>");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<table class=\"frontmatter-table\"><tbody>");
    const _p$2 = md.frontmatter;
    let _tmp = _p$2.head;
    while (true) {
      const _p$3 = _tmp;
      if (_p$3 === undefined) {
        break;
      } else {
        const _p$4 = _p$3;
        const _p$5 = _p$4;
        const _p$6 = _p$5.key;
        const _p$7 = _p$5.value;
        const _p$8 = _p$5.next;
        let _p$9;
        _L: {
          _L$2: {
            if (_p$6 === "reviw") {
              _p$9 = undefined;
              break _L$2;
            }
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tr><th>");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_p$6));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</th><td>");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(_p$7));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</td></tr>");
            break _L;
          }
        }
        _tmp = _p$8;
        continue;
      }
    }
    if (md.questions.length > 0) {
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tr><th>reviw questions</th><td>");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(md.questions.length, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " question(s)</td></tr>");
    }
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tbody></table>");
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, md.html);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"md-right\"><div class=\"table-box\">");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<table id=\"csv-table\"><colgroup id=\"colgroup\"></colgroup>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<thead><tr><th aria-label=\"row/col corner\"></th>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<th data-col=\"1\"><div class=\"th-inner\">Text<span class=\"resizer\" data-col=\"1\"></span></div></th>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tr></thead>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tbody id=\"tbody\">");
  const source_lines = _M0FP36kazuph5reviw4core16split__to__lines(md.source);
  const _len = source_lines.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const line = source_lines[_i];
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tr data-row=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"><th>");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i + 1 | 0, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</th><td data-row=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-col=\"1\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(line));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</td></tr>");
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tbody></table>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0FP36kazuph5reviw4core20build__comment__card(buf);
  _M0FP36kazuph5reviw4core27build__comment__list__aside(buf);
  _M0FP36kazuph5reviw4core20build__submit__modal(buf);
  _M0FP36kazuph5reviw4core22build__recovery__modal(buf);
  _M0FP36kazuph5reviw4core26build__mermaid__fullscreen(buf);
  _M0FP36kazuph5reviw4core24build__image__fullscreen(buf);
  _M0FP36kazuph5reviw4core24build__video__fullscreen(buf);
  _M0FP36kazuph5reviw4core23build__questions__modal(buf, md.questions);
  _M0FP36kazuph5reviw4core24build__questions__notice(buf, md.questions);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>window.__DATA__=");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core30serialize__source__lines__json(source_lines));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ";</script>");
  if (md.questions.length > 0) {
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>window.__REVIW_QUESTIONS__=");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core26serialize__questions__json(md.questions));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ";</script>");
  }
  _M0FP36kazuph5reviw4core21build__script__footer(buf, port, "markdown", filename);
  return buf.val;
}
function _M0FP36kazuph5reviw4core26serialize__csv__data__json(data) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "{\"headers\":[");
  const _arr = data.headers;
  const _len = _arr.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const h = _arr[_i];
      if (_i > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(h));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "],\"rows\":[");
  const _arr$2 = data.rows;
  const _len$2 = _arr$2.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len$2) {
      const row = _arr$2[_i];
      if (_i > 0) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 91);
      const _len$3 = row.length;
      let _tmp$3 = 0;
      while (true) {
        const _i$2 = _tmp$3;
        if (_i$2 < _len$3) {
          const cell = row[_i$2];
          if (_i$2 > 0) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 44);
          }
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core18escape__js__string(cell));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
          _tmp$3 = _i$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 93);
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "]}");
  return buf.val;
}
function _M0FP36kazuph5reviw4core16build__csv__html(data, filename, port) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0FP36kazuph5reviw4core26build__page__start_2einner(buf, filename, "");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"filter-menu\" id=\"filter-menu\"><label class=\"menu-check\"><input type=\"checkbox\" id=\"freeze-col-check\" /> Freeze up to this column</label><button data-action=\"not-empty\">Rows where not empty</button><button data-action=\"empty\">Rows where empty</button><button data-action=\"contains\">Contains...</button><button data-action=\"not-contains\">Does not contain...</button><button data-action=\"reset\">Clear filter</button></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"filter-menu\" id=\"row-menu\"><label class=\"menu-check\"><input type=\"checkbox\" id=\"freeze-row-check\" /> Freeze up to this row</label></div>");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div style=\"padding:16px;overflow-x:auto\"><table id=\"csv-table\"><thead><tr>");
  const _arr = data.headers;
  const _len = _arr.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const header = _arr[_i];
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<th data-col=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"><div class=\"th-inner\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(header));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"resizer\" data-col=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"></span></div></th>");
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tr></thead><tbody id=\"tbody\">");
  const _arr$2 = data.rows;
  const _len$2 = _arr$2.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len$2) {
      const row = _arr$2[_i];
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<tr data-row=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
      const _len$3 = row.length;
      let _tmp$3 = 0;
      while (true) {
        const _i$2 = _tmp$3;
        if (_i$2 < _len$3) {
          const cell = row[_i$2];
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<td data-row=\"");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-col=\"");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i$2, 10));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(cell));
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</td>");
          _tmp$3 = _i$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tr>");
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</tbody></table></div>");
  _M0FP36kazuph5reviw4core20build__comment__card(buf);
  _M0FP36kazuph5reviw4core20build__submit__modal(buf);
  _M0FP36kazuph5reviw4core21build__history__panel(buf);
  _M0FP36kazuph5reviw4core22build__recovery__modal(buf);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<script>const DATA = ");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core26serialize__csv__data__json(data));
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ";</script>");
  _M0FP36kazuph5reviw4core21build__script__footer(buf, port, "csv", filename);
  return buf.val;
}
function _M0FP36kazuph5reviw4core17build__diff__html(data, filename, port) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0FP36kazuph5reviw4core26build__page__start_2einner(buf, filename, "");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"diff-view\">");
  const _arr = data.files;
  const _len = _arr.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const file = _arr[_i];
      const display_path = file.new_path.length > 0 ? file.new_path : file.old_path;
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"diff-file-header\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(display_path));
      if (file.is_new) {
        _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " <span class=\"diff-label new\">new file</span>");
      } else {
        if (file.is_deleted) {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " <span class=\"diff-label deleted\">deleted</span>");
        } else {
          if (file.is_binary) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " <span class=\"diff-label binary\">binary</span>");
          }
        }
      }
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
      if (!file.is_binary) {
        const _arr$2 = file.hunks;
        const _len$2 = _arr$2.length;
        let _tmp$2 = 0;
        while (true) {
          const _i$2 = _tmp$2;
          if (_i$2 < _len$2) {
            const hunk = _arr$2[_i$2];
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"diff-hunk-header\">@@ -");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(hunk.old_start, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(hunk.old_count, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " +");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(hunk.new_start, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, ",");
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(hunk.new_count, 10));
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " @@");
            if (hunk.context.length > 0) {
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, " ");
              _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(hunk.context));
            }
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
            let old_line = hunk.old_start;
            let new_line = hunk.new_start;
            const _arr$3 = hunk.lines;
            const _len$3 = _arr$3.length;
            let _tmp$3 = 0;
            while (true) {
              const _i$3 = _tmp$3;
              if (_i$3 < _len$3) {
                const line = _arr$3[_i$3];
                const _bind = line.kind;
                let css_class;
                switch (_bind) {
                  case 1: {
                    css_class = "diff-line addition";
                    break;
                  }
                  case 2: {
                    css_class = "diff-line deletion";
                    break;
                  }
                  default: {
                    css_class = "diff-line";
                  }
                }
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, css_class);
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\" data-file=\"");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(display_path));
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\">");
                const _bind$2 = line.kind;
                switch (_bind$2) {
                  case 2: {
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"line-num\">");
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(old_line, 10));
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span><span class=\"line-num\"></span>");
                    old_line = old_line + 1 | 0;
                    break;
                  }
                  case 1: {
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"line-num\"></span><span class=\"line-num\">");
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(new_line, 10));
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span>");
                    new_line = new_line + 1 | 0;
                    break;
                  }
                  default: {
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"line-num\">");
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(old_line, 10));
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span><span class=\"line-num\">");
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(new_line, 10));
                    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span>");
                    old_line = old_line + 1 | 0;
                    new_line = new_line + 1 | 0;
                  }
                }
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<span class=\"line-content\">");
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(line.content));
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span></div>");
                _tmp$3 = _i$3 + 1 | 0;
                continue;
              } else {
                break;
              }
            }
            _tmp$2 = _i$2 + 1 | 0;
            continue;
          } else {
            break;
          }
        }
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0FP36kazuph5reviw4core20build__comment__card(buf);
  _M0FP36kazuph5reviw4core20build__submit__modal(buf);
  _M0FP36kazuph5reviw4core21build__history__panel(buf);
  _M0FP36kazuph5reviw4core22build__recovery__modal(buf);
  _M0FP36kazuph5reviw4core21build__script__footer(buf, port, "diff", filename);
  return buf.val;
}
function _M0FP36kazuph5reviw4core17build__text__html(lines, filename, port) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0FP36kazuph5reviw4core26build__page__start_2einner(buf, filename, "");
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"text-view\">");
  const _len = lines.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const line = lines[_i];
      const line_num = _i + 1 | 0;
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "<div class=\"text-line\" data-row=\"");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(_i, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\"><span class=\"line-num\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(line_num, 10));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span><span class=\"line-content\">");
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, _M0FP36kazuph5reviw4core12escape__html(line));
      _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</span></div>");
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "</div>");
  _M0FP36kazuph5reviw4core20build__comment__card(buf);
  _M0FP36kazuph5reviw4core20build__submit__modal(buf);
  _M0FP36kazuph5reviw4core21build__history__panel(buf);
  _M0FP36kazuph5reviw4core22build__recovery__modal(buf);
  _M0FP36kazuph5reviw4core21build__script__footer(buf, port, "text", filename);
  return buf.val;
}
function _M0FP36kazuph5reviw4core16parse__int__from(chars, start, len) {
  let n = 0;
  let i = start;
  while (true) {
    if (i < len && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) >= 48 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) <= 57)) {
      n = (Math.imul(n, 10) | 0) + (_M0MP311moonbitlang4core5array5Array2atGcE(chars, i) - 48 | 0) | 0;
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return { _0: n, _1: i };
}
function _M0FP36kazuph5reviw4core19parse__hunk__header(line) {
  let old_start = 0;
  let old_count = 0;
  let new_start = 0;
  let new_count = 0;
  const chars = _M0MP311moonbitlang4core6string6String9to__array(line);
  const len = chars.length;
  let i = 3;
  if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 45) {
    i = i + 1 | 0;
    const result = _M0FP36kazuph5reviw4core16parse__int__from(chars, i, len);
    old_start = result._0;
    i = result._1;
    if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 44) {
      i = i + 1 | 0;
      const result2 = _M0FP36kazuph5reviw4core16parse__int__from(chars, i, len);
      old_count = result2._0;
      i = result2._1;
    } else {
      old_count = 1;
    }
  }
  if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 32) {
    i = i + 1 | 0;
  }
  if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 43) {
    i = i + 1 | 0;
    const result = _M0FP36kazuph5reviw4core16parse__int__from(chars, i, len);
    new_start = result._0;
    i = result._1;
    if (i < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i) === 44) {
      i = i + 1 | 0;
      const result2 = _M0FP36kazuph5reviw4core16parse__int__from(chars, i, len);
      new_count = result2._0;
      result2._1;
    } else {
      new_count = 1;
    }
  }
  let context = "";
  let close_pos = -1;
  let j = 3;
  while (true) {
    if ((j + 1 | 0) < len) {
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, j) === 64 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, j + 1 | 0) === 64) {
        close_pos = j;
        break;
      }
      j = j + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (close_pos >= 0) {
    context = _M0FP36kazuph5reviw4core11safe__slice(line, close_pos + 2 | 0);
  }
  return { _0: old_start, _1: old_count, _2: new_start, _3: new_count, _4: context };
}
function _M0FP36kazuph5reviw4core14collect__hunks(lines, start, len) {
  const hunks = [];
  let i = start;
  while (true) {
    if (i < len) {
      const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c934, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c934.length })) {
        const header = _M0FP36kazuph5reviw4core19parse__hunk__header(line);
        const hunk_lines = [];
        i = i + 1 | 0;
        while (true) {
          if (i < len) {
            const l = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
            if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c936, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c936.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c937, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c937.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c938, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c938.length }))) {
              break;
            }
            if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c939, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c939.length })) {
              _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffLineE(hunk_lines, { kind: 1, content: _M0FP36kazuph5reviw4core11safe__slice(l, 1) });
            } else {
              if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c940, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c940.length })) {
                _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffLineE(hunk_lines, { kind: 2, content: _M0FP36kazuph5reviw4core11safe__slice(l, 1) });
              } else {
                if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c941, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c941.length })) {
                  _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffLineE(hunk_lines, { kind: 0, content: _M0FP36kazuph5reviw4core11safe__slice(l, 1) });
                } else {
                  _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffLineE(hunk_lines, { kind: 0, content: l });
                }
              }
            }
            i = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffHunkE(hunks, { old_start: header._0, old_count: header._1, new_start: header._2, new_count: header._3, context: header._4, lines: hunk_lines });
      } else {
        if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c942, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c942.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c943, start: 0, end: _M0FP36kazuph5reviw4core30collect__hunks_2e_2abind_7c943.length })) {
          break;
        } else {
          i = i + 1 | 0;
        }
      }
      continue;
    } else {
      break;
    }
  }
  return { _0: hunks, _1: i };
}
function _M0FP36kazuph5reviw4core19extract__git__paths(line) {
  const rest = _M0FP36kazuph5reviw4core11safe__slice(line, 13);
  const chars = _M0MP311moonbitlang4core6string6String9to__array(rest);
  const len = chars.length;
  let sep_pos = -1;
  let idx = 0;
  while (true) {
    if ((idx + 2 | 0) < len) {
      if (_M0MP311moonbitlang4core5array5Array2atGcE(chars, idx) === 32 && (_M0MP311moonbitlang4core5array5Array2atGcE(chars, idx + 1 | 0) === 98 && _M0MP311moonbitlang4core5array5Array2atGcE(chars, idx + 2 | 0) === 47)) {
        sep_pos = idx;
        break;
      }
      idx = idx + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (sep_pos < 0) {
    return { _0: rest, _1: rest };
  } else {
    const old_path = _M0FP36kazuph5reviw4core18safe__slice__range(rest, 0, sep_pos);
    const new_path = _M0FP36kazuph5reviw4core11safe__slice(rest, sep_pos + 3 | 0);
    return { _0: old_path, _1: new_path };
  }
}
function _M0FP36kazuph5reviw4core19strip__diff__prefix(path) {
  return _M0MP311moonbitlang4core6string6String11has__prefix(path, { str: _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c945, start: 0, end: _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c945.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(path, { str: _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c946, start: 0, end: _M0FP36kazuph5reviw4core35strip__diff__prefix_2e_2abind_7c946.length }) ? _M0FP36kazuph5reviw4core11safe__slice(path, 2) : path;
}
function _M0FP36kazuph5reviw4core11parse__diff(input) {
  const files = [];
  const lines = _M0FP36kazuph5reviw4core16split__to__lines(input);
  const len = lines.length;
  let i = 0;
  while (true) {
    if (i < len) {
      const line = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
      if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c948, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c948.length })) {
        const paths = _M0FP36kazuph5reviw4core19extract__git__paths(line);
        let is_new = false;
        let is_deleted = false;
        let is_binary = false;
        i = i + 1 | 0;
        while (true) {
          if (i < len) {
            const l = _M0MP311moonbitlang4core5array5Array2atGsE(lines, i);
            if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c950, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c950.length })) {
              is_new = true;
              i = i + 1 | 0;
            } else {
              if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c951, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c951.length })) {
                is_deleted = true;
                i = i + 1 | 0;
              } else {
                if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c952, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c952.length })) {
                  is_binary = true;
                  i = i + 1 | 0;
                } else {
                  if (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c953, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c953.length }) || (_M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c954, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c954.length }) || _M0MP311moonbitlang4core6string6String11has__prefix(l, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c955, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c955.length }))) {
                    i = i + 1 | 0;
                  } else {
                    break;
                  }
                }
              }
            }
            continue;
          } else {
            break;
          }
        }
        const result = _M0FP36kazuph5reviw4core14collect__hunks(lines, i, len);
        i = result._1;
        _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffFileE(files, { old_path: paths._0, new_path: paths._1, is_new: is_new, is_deleted: is_deleted, is_binary: is_binary, hunks: result._0 });
      } else {
        if (_M0MP311moonbitlang4core6string6String11has__prefix(line, { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c956, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c956.length })) {
          const old_path = _M0FP36kazuph5reviw4core19strip__diff__prefix(_M0FP36kazuph5reviw4core11safe__slice(line, 4));
          let new_path = "";
          i = i + 1 | 0;
          if (i < len && _M0MP311moonbitlang4core6string6String11has__prefix(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), { str: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c957, start: 0, end: _M0FP36kazuph5reviw4core27parse__diff_2e_2abind_7c957.length })) {
            new_path = _M0FP36kazuph5reviw4core19strip__diff__prefix(_M0FP36kazuph5reviw4core11safe__slice(_M0MP311moonbitlang4core5array5Array2atGsE(lines, i), 4));
            i = i + 1 | 0;
          }
          const result = _M0FP36kazuph5reviw4core14collect__hunks(lines, i, len);
          i = result._1;
          _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core8DiffFileE(files, { old_path: old_path, new_path: new_path, is_new: false, is_deleted: false, is_binary: false, hunks: result._0 });
        } else {
          i = i + 1 | 0;
        }
      }
      continue;
    } else {
      break;
    }
  }
  return { files: files };
}
function _M0FP36kazuph5reviw4core10parse__csv(input, delimiter) {
  if (input === "") {
    return [];
  }
  const rows = [];
  const current_field = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  const current_row = [];
  const chars = _M0MP311moonbitlang4core6string6String9to__array(input);
  const len = chars.length;
  let i = 0;
  let in_quotes = false;
  while (true) {
    if (i < len) {
      const ch = _M0MP311moonbitlang4core5array5Array2atGcE(chars, i);
      if (in_quotes) {
        if (ch === 34) {
          if ((i + 1 | 0) < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 34) {
            _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(current_field, 34);
            i = i + 2 | 0;
          } else {
            in_quotes = false;
            i = i + 1 | 0;
          }
        } else {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(current_field, ch);
          i = i + 1 | 0;
        }
      } else {
        if (ch === 34) {
          in_quotes = true;
          i = i + 1 | 0;
        } else {
          if (ch === delimiter) {
            _M0MP311moonbitlang4core5array5Array4pushGsE(current_row, current_field.val);
            _M0MP311moonbitlang4core7builtin13StringBuilder5reset(current_field);
            i = i + 1 | 0;
          } else {
            if (ch === 13) {
              _M0MP311moonbitlang4core5array5Array4pushGsE(current_row, current_field.val);
              _M0MP311moonbitlang4core7builtin13StringBuilder5reset(current_field);
              const row_copy = _M0MP311moonbitlang4core5array5Array4copyGsE(current_row);
              _M0MP311moonbitlang4core5array5Array4pushGRP311moonbitlang4core7builtin5ArrayGsEE(rows, row_copy);
              _M0MP311moonbitlang4core5array5Array5clearGsE(current_row);
              if ((i + 1 | 0) < len && _M0MP311moonbitlang4core5array5Array2atGcE(chars, i + 1 | 0) === 10) {
                i = i + 2 | 0;
              } else {
                i = i + 1 | 0;
              }
            } else {
              if (ch === 10) {
                _M0MP311moonbitlang4core5array5Array4pushGsE(current_row, current_field.val);
                _M0MP311moonbitlang4core7builtin13StringBuilder5reset(current_field);
                const row_copy = _M0MP311moonbitlang4core5array5Array4copyGsE(current_row);
                _M0MP311moonbitlang4core5array5Array4pushGRP311moonbitlang4core7builtin5ArrayGsEE(rows, row_copy);
                _M0MP311moonbitlang4core5array5Array5clearGsE(current_row);
                i = i + 1 | 0;
              } else {
                _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(current_field, ch);
                i = i + 1 | 0;
              }
            }
          }
        }
      }
      continue;
    } else {
      break;
    }
  }
  if (current_field.val.length > 0 || current_row.length > 0) {
    _M0MP311moonbitlang4core5array5Array4pushGsE(current_row, current_field.val);
    _M0MP311moonbitlang4core5array5Array4pushGRP311moonbitlang4core7builtin5ArrayGsEE(rows, _M0MP311moonbitlang4core5array5Array4copyGsE(current_row));
  }
  if (rows.length > 0) {
    const last_row = _M0MP311moonbitlang4core5array5Array2atGRP311moonbitlang4core7builtin5ArrayGsEE(rows, rows.length - 1 | 0);
    if (last_row.length === 1 && _M0MP311moonbitlang4core5array5Array2atGsE(last_row, 0) === "") {
      _M0MP311moonbitlang4core5array5Array3popGRP311moonbitlang4core7builtin5ArrayGsEE(rows);
    }
  }
  return rows;
}
function _M0FP36kazuph5reviw4core21csv__data__from__flat(flat) {
  if (flat.length === 0) {
    return { headers: [], rows: [] };
  } else {
    const headers = _M0MP311moonbitlang4core5array5Array2atGRP311moonbitlang4core7builtin5ArrayGsEE(flat, 0);
    const data_rows = [];
    const _end6 = flat.length;
    let _tmp = 1;
    while (true) {
      const i = _tmp;
      if (i < _end6) {
        _M0MP311moonbitlang4core5array5Array4pushGRP311moonbitlang4core7builtin5ArrayGsEE(data_rows, _M0MP311moonbitlang4core5array5Array2atGRP311moonbitlang4core7builtin5ArrayGsEE(flat, i));
        _tmp = i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    return { headers: headers, rows: data_rows };
  }
}
function _M0FP36kazuph5reviw6server12exists__sync(_tmp) {
  return existsSync$1982(_tmp);
}
function _M0FP36kazuph5reviw6server10path__join(_tmp, _tmp$2) {
  return join$1985(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server16read__file__sync(_tmp, _tmp$2) {
  return readFileSync$1988(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server12load__ui__js() {
  if (_M0FP36kazuph5reviw6server13ui__js__cache.val.length > 0) {
    return _M0FP36kazuph5reviw6server13ui__js__cache.val;
  }
  const script_dir = _M0FP36kazuph5reviw6server16get__script__dir();
  const ui_path = _M0FP36kazuph5reviw6server10path__join(script_dir, "../ui/ui.js");
  if (_M0FP36kazuph5reviw6server12exists__sync(ui_path)) {
    const content = _M0FP36kazuph5reviw6server16read__file__sync(ui_path, "utf-8");
    _M0FP36kazuph5reviw6server13ui__js__cache.val = content;
    return content;
  } else {
    _M0FP36kazuph5reviw6server14console__error(`Warning: ui.js not found at ${ui_path}`);
    return "// ui.js not found";
  }
}
function _M0FP36kazuph5reviw6server11os__homedir() {
  return homedir$1990();
}
function _M0FP36kazuph5reviw6server9lock__dir() {
  const override_dir = _M0FP36kazuph5reviw6server13get__env__var("REVIW_LOCK_DIR");
  return override_dir.length > 0 ? override_dir : _M0FP36kazuph5reviw6server10path__join(_M0FP36kazuph5reviw6server11os__homedir(), ".reviw/locks");
}
function _M0FP36kazuph5reviw6server10lock__path(port) {
  const dir = _M0FP36kazuph5reviw6server9lock__dir();
  return _M0FP36kazuph5reviw6server10path__join(dir, `${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port)}.lock`);
}
function _M0FP36kazuph5reviw6server11mkdir__sync(_tmp, _tmp$2) {
  return mkdirSync$1993(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server17ensure__lock__dir() {
  const dir = _M0FP36kazuph5reviw6server9lock__dir();
  if (!_M0FP36kazuph5reviw6server12exists__sync(dir)) {
    _M0FP36kazuph5reviw6server11mkdir__sync(dir, _M0FP36kazuph5reviw6server22mkdir__recursive__opts());
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw6server16is__port__locked(port) {
  const lp = _M0FP36kazuph5reviw6server10lock__path(port);
  return _M0FP36kazuph5reviw6server12exists__sync(lp);
}
function _M0FP36kazuph5reviw6server17write__file__sync(_tmp, _tmp$2) {
  return writeFileSync$1996(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server11write__lock(port) {
  _M0FP36kazuph5reviw6server17ensure__lock__dir();
  const lp = _M0FP36kazuph5reviw6server10lock__path(port);
  _M0FP36kazuph5reviw6server17write__file__sync(lp, _M0MP311moonbitlang4core3int3Int18to__string_2einner(port, 10));
}
function _M0FP36kazuph5reviw6server12unlink__sync(_tmp) {
  return unlinkSync$1998(_tmp);
}
function _M0FP36kazuph5reviw6server12remove__lock(port) {
  const lp = _M0FP36kazuph5reviw6server10lock__path(port);
  if (_M0FP36kazuph5reviw6server12exists__sync(lp)) {
    _M0FP36kazuph5reviw6server12unlink__sync(lp);
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw6server21find__available__port(base) {
  let port = base;
  let attempts = 0;
  while (true) {
    if (attempts < 10) {
      if (!_M0FP36kazuph5reviw6server16is__port__locked(port)) {
        return port;
      }
      _M0FP36kazuph5reviw6server12console__log(`Port ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port)} locked, trying ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port + 1 | 0)}...`);
      port = port + 1 | 0;
      attempts = attempts + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return base;
}
function _M0FP36kazuph5reviw6server11parse__port(s) {
  let n = 0;
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch >= 48 && ch <= 57) {
        n = (Math.imul(n, 10) | 0) + (ch - 48 | 0) | 0;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return n === 0 ? 4989 : n;
}
function _M0FP36kazuph5reviw6server12print__usage() {
  _M0FP36kazuph5reviw6server12console__log(_M0FP36kazuph5reviw6server26print__usage_2eusage_7c384);
}
function _M0FP36kazuph5reviw6server17read__stdin__sync() {
  return _M0FP36kazuph5reviw6server16read__file__sync("/dev/stdin", "utf-8");
}
function _M0FP36kazuph5reviw6server13path__extname(_tmp) {
  return extname$2005(_tmp);
}
function _M0FP36kazuph5reviw6server12detect__mode(file_path) {
  const ext = _M0FP36kazuph5reviw6server13path__extname(file_path);
  const ext_lower = _M0MP311moonbitlang4core6string6String11has__prefix(ext, { str: _M0FP36kazuph5reviw6server28detect__mode_2e_2abind_7c427, start: 0, end: _M0FP36kazuph5reviw6server28detect__mode_2e_2abind_7c427.length }) ? _M0MP311moonbitlang4core6string6String9to__lower(_M0FP36kazuph5reviw4core11safe__slice(ext, 1)) : _M0MP311moonbitlang4core6string6String9to__lower(ext);
  return _M0MP36kazuph5reviw4core8FileMode15from__extension(ext_lower);
}
function _M0FP36kazuph5reviw6server16detect__encoding(buf) {
  const len = _M0FP36kazuph5reviw6server14buffer__length(buf);
  if (len === 0) {
    return "utf-8";
  }
  if (len >= 3 && (_M0FP36kazuph5reviw6server10buffer__at(buf, 0) === 239 && (_M0FP36kazuph5reviw6server10buffer__at(buf, 1) === 187 && _M0FP36kazuph5reviw6server10buffer__at(buf, 2) === 191))) {
    return "utf-8";
  }
  if (len >= 2 && (_M0FP36kazuph5reviw6server10buffer__at(buf, 0) === 255 && _M0FP36kazuph5reviw6server10buffer__at(buf, 1) === 254)) {
    return "utf-16le";
  }
  if (len >= 2 && (_M0FP36kazuph5reviw6server10buffer__at(buf, 0) === 254 && _M0FP36kazuph5reviw6server10buffer__at(buf, 1) === 255)) {
    return "utf-16be";
  }
  let i = 0;
  let is_utf8 = true;
  const check_limit = len < 4096 ? len : 4096;
  while (true) {
    if (i < check_limit) {
      const b = _M0FP36kazuph5reviw6server10buffer__at(buf, i);
      if (b < 128) {
        i = i + 1 | 0;
        continue;
      }
      const expected = b >= 240 ? 4 : b >= 224 ? 3 : b >= 192 ? 2 : 0;
      if (expected === 0) {
        is_utf8 = false;
        break;
      }
      if ((i + expected | 0) > check_limit) {
        break;
      }
      let valid = true;
      let _tmp = 1;
      while (true) {
        const j = _tmp;
        if (j < expected) {
          const cb = _M0FP36kazuph5reviw6server10buffer__at(buf, i + j | 0);
          if (cb < 128 || cb >= 192) {
            valid = false;
            break;
          }
          _tmp = j + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      if (!valid) {
        is_utf8 = false;
        break;
      }
      i = i + expected | 0;
      continue;
    } else {
      break;
    }
  }
  if (is_utf8) {
    return "utf-8";
  }
  let sjis_score = 0;
  let euc_score = 0;
  i = 0;
  while (true) {
    if (i < (check_limit - 1 | 0)) {
      const b1 = _M0FP36kazuph5reviw6server10buffer__at(buf, i);
      const b2 = _M0FP36kazuph5reviw6server10buffer__at(buf, i + 1 | 0);
      if (b1 >= 129 && b1 <= 159 || b1 >= 224 && b1 <= 252) {
        if (b2 >= 64 && b2 <= 126 || b2 >= 128 && b2 <= 252) {
          sjis_score = sjis_score + 1 | 0;
          i = i + 2 | 0;
          continue;
        }
      }
      if (b1 >= 161 && (b1 <= 254 && (b2 >= 161 && b2 <= 254))) {
        euc_score = euc_score + 1 | 0;
        i = i + 2 | 0;
        continue;
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (sjis_score > euc_score && sjis_score > 0) {
    return "shift-jis";
  }
  if (euc_score > sjis_score && euc_score > 0) {
    return "euc-jp";
  }
  return "utf-8";
}
function _M0FP36kazuph5reviw6server18read__file__buffer(_tmp) {
  return readFileSync$1988(_tmp);
}
function _M0FP36kazuph5reviw6server12decode__file(path, override_enc) {
  const buf = _M0FP36kazuph5reviw6server18read__file__buffer(path);
  const encoding = override_enc.length > 0 ? override_enc : _M0FP36kazuph5reviw6server16detect__encoding(buf);
  const _p = "utf-8";
  if (!(encoding === _p)) {
    _M0FP36kazuph5reviw6server12console__log(`Detected encoding: ${encoding}`);
  }
  return _M0FP36kazuph5reviw6server14decode__buffer(buf, encoding);
}
function _M0FP36kazuph5reviw6server22load__and__build__html(ctx) {
  const content = _M0FP36kazuph5reviw6server12decode__file(ctx.file_path, _M0FP36kazuph5reviw6server18encoding__override.val);
  _L: {
    const _bind = ctx.mode;
    switch (_bind) {
      case 0: {
        break _L;
      }
      case 1: {
        break _L;
      }
      case 3: {
        const data = _M0FP36kazuph5reviw4core11parse__diff(content);
        return _M0FP36kazuph5reviw4core17build__diff__html(data, ctx.filename, ctx.port);
      }
      case 2: {
        const md = _M0FP36kazuph5reviw4core15parse__markdown(content);
        return _M0FP36kazuph5reviw4core29build__markdown__html_2einner(md, ctx.filename, ctx.port, ctx.file_path);
      }
      default: {
        const lines = _M0FP36kazuph5reviw4core16split__to__lines(content);
        return _M0FP36kazuph5reviw4core17build__text__html(lines, ctx.filename, ctx.port);
      }
    }
  }
  const delimiter = _M0IP36kazuph5reviw4core8FileModeP311moonbitlang4core7builtin2Eq5equal(ctx.mode, 1) ? 9 : 44;
  const flat = _M0FP36kazuph5reviw4core10parse__csv(content, delimiter);
  const data = _M0FP36kazuph5reviw4core21csv__data__from__flat(flat);
  return _M0FP36kazuph5reviw4core16build__csv__html(data, ctx.filename, ctx.port);
}
function _M0FP36kazuph5reviw6server14path__basename(_tmp) {
  return basename$2015(_tmp);
}
function _M0FP36kazuph5reviw6server13path__resolve(_tmp) {
  return resolve$2017(_tmp);
}
function _M0FP36kazuph5reviw6server25http__create__server__raw(_tmp) {
  return createServer$2022(_tmp);
}
function _M0FP36kazuph5reviw6server14create__server(handler) {
  return _M0FP36kazuph5reviw6server25http__create__server__raw(handler);
}
function _M0FP36kazuph5reviw6server22write__file__sync__buf(_tmp, _tmp$2) {
  return writeFileSync$1996(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server16base64__to__file(data, dir, index) {
  const ext = _M0FP36kazuph5reviw6server20extract__base64__ext(data);
  if (ext.length === 0) {
    return "";
  }
  const b64_data = _M0FP36kazuph5reviw6server21extract__base64__data(data);
  if (b64_data.length === 0) {
    return "";
  }
  return _M0FP36kazuph5reviw6server17try__call__string(() => {
    if (!_M0FP36kazuph5reviw6server12exists__sync(dir)) {
      _M0FP36kazuph5reviw6server11mkdir__sync(dir, _M0FP36kazuph5reviw6server22mkdir__recursive__opts());
    }
    const filepath = _M0FP36kazuph5reviw6server10path__join(dir, `image_${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(index)}.${ext}`);
    _M0FP36kazuph5reviw6server22write__file__sync__buf(filepath, _M0FP36kazuph5reviw6server20buffer__from__base64(b64_data));
    return filepath;
  }, "");
}
function _M0FP36kazuph5reviw6server12history__dir() {
  return _M0FP36kazuph5reviw6server10path__join(_M0FP36kazuph5reviw6server11os__homedir(), ".reviw/history");
}
function _M0FP36kazuph5reviw6server20ensure__history__dir() {
  const dir = _M0FP36kazuph5reviw6server12history__dir();
  if (!_M0FP36kazuph5reviw6server12exists__sync(dir)) {
    _M0FP36kazuph5reviw6server11mkdir__sync(dir, _M0FP36kazuph5reviw6server22mkdir__recursive__opts());
    _M0FP36kazuph5reviw6server11chmod__sync(dir, 448);
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw6server20crypto__create__hash(_tmp) {
  return createHash$2039(_tmp);
}
function _M0FP36kazuph5reviw6server14crypto__sha256(s) {
  return _M0FP36kazuph5reviw6server27hash__update__digest__hex16(_M0FP36kazuph5reviw6server20crypto__create__hash("sha256"), s);
}
function _M0FP36kazuph5reviw6server13history__path(file_path) {
  const hash = _M0FP36kazuph5reviw6server14crypto__sha256(_M0FP36kazuph5reviw6server13path__resolve(file_path));
  return _M0FP36kazuph5reviw6server10path__join(_M0FP36kazuph5reviw6server12history__dir(), `${hash}.json`);
}
function _M0FP36kazuph5reviw6server16read__file__safe(path) {
  return _M0FP36kazuph5reviw6server17try__call__string(() => _M0FP36kazuph5reviw6server16read__file__sync(path, "utf-8"), "");
}
function _M0FP36kazuph5reviw6server17trim__json__array(json, max_entries) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(json);
  const len = chars.length;
  let depth = 0;
  let count = 0;
  let cut_pos = -1;
  let i = 0;
  _L: while (true) {
    if (i < len) {
      const _bind = _M0MP311moonbitlang4core5array5Array2atGcE(chars, i);
      switch (_bind) {
        case 123: {
          depth = depth + 1 | 0;
          break;
        }
        case 125: {
          depth = depth - 1 | 0;
          if (depth === 0) {
            count = count + 1 | 0;
            if (count === max_entries) {
              cut_pos = i + 1 | 0;
              break _L;
            }
          }
          break;
        }
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return cut_pos > 0 && count >= max_entries ? `${_M0FP36kazuph5reviw4core18safe__slice__range(json, 0, cut_pos)}]` : json;
}
function _M0FP36kazuph5reviw6server19write__file__secure(path, data) {
  _M0FP36kazuph5reviw6server15try__call__void(() => {
    _M0FP36kazuph5reviw6server17write__file__sync(path, data);
  });
}
function _M0FP36kazuph5reviw6server13save__history(file_path, entry_json) {
  _M0FP36kazuph5reviw6server20ensure__history__dir();
  const hp = _M0FP36kazuph5reviw6server13history__path(file_path);
  const existing = _M0FP36kazuph5reviw6server16read__file__safe(hp);
  const new_data = existing.length > 2 ? `[${entry_json},${_M0FP36kazuph5reviw4core11safe__slice(existing, 1)}` : `[${entry_json}]`;
  const trimmed = _M0FP36kazuph5reviw6server17trim__json__array(new_data, 50);
  _M0FP36kazuph5reviw6server19write__file__secure(hp, trimmed);
  _M0FP36kazuph5reviw6server11chmod__sync(hp, 384);
}
function _M0FP36kazuph5reviw6server13unwatch__file(_tmp) {
  return unwatchFile$2045(_tmp);
}
function _M0FP36kazuph5reviw6server14handle__submit(ctx, body) {
  const summary = _M0FP36kazuph5reviw6server19json__parse__string("summary", body);
  const raw_comments = _M0FP36kazuph5reviw6server21json__parse__comments(body);
  const comments = [];
  const _len = raw_comments.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const c = raw_comments[_i];
      if (c.length >= 3) {
        _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core7CommentE(comments, { row: _M0FP36kazuph5reviw4core16parse__int__safe(_M0MP311moonbitlang4core5array5Array2atGsE(c, 0)), col: _M0FP36kazuph5reviw4core16parse__int__safe(_M0MP311moonbitlang4core5array5Array2atGsE(c, 1)), text: _M0MP311moonbitlang4core5array5Array2atGsE(c, 2), value: c.length > 3 ? _M0MP311moonbitlang4core5array5Array2atGsE(c, 3) : "" });
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const answers = _M0FP36kazuph5reviw6server19json__parse__string("reviwAnswers", body);
  const result = { file: ctx.filename, mode: ctx.mode, comments: comments, summary: summary, answers: answers };
  _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw4core12ReviewResultE(_M0FP36kazuph5reviw6server12all__results, result);
  if (comments.length > 0 || summary.length > 0) {
    const entry_buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, "{\"timestamp\":\"");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, _M0FP36kazuph5reviw6server8iso__now());
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, "\",\"file\":\"");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, _M0FP36kazuph5reviw4core18escape__js__string(ctx.filename));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, "\",\"summary\":\"");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, _M0FP36kazuph5reviw4core18escape__js__string(summary));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, "\",\"commentCount\":");
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, _M0MP311moonbitlang4core3int3Int18to__string_2einner(comments.length, 10));
    _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(entry_buf, "}");
    _M0FP36kazuph5reviw6server13save__history(ctx.file_path, entry_buf.val);
  }
  const images = _M0FP36kazuph5reviw6server19json__parse__images(body);
  const output_dir = _M0FP36kazuph5reviw6server10path__join(_M0FP36kazuph5reviw6server11os__homedir(), ".reviw/outputs");
  const _len$2 = images.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len$2) {
      const img = images[_i];
      if (img.length > 0) {
        _M0FP36kazuph5reviw6server16base64__to__file(img, output_dir, _i);
      }
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  let comment_img_idx = images.length;
  const _len$3 = raw_comments.length;
  let _tmp$3 = 0;
  while (true) {
    const _i = _tmp$3;
    if (_i < _len$3) {
      const c = raw_comments[_i];
      if (c.length >= 5 && _M0MP311moonbitlang4core5array5Array2atGsE(c, 4).length > 0) {
        _M0FP36kazuph5reviw6server16base64__to__file(_M0MP311moonbitlang4core5array5Array2atGsE(c, 4), output_dir, comment_img_idx);
        comment_img_idx = comment_img_idx + 1 | 0;
      }
      _tmp$3 = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0FP36kazuph5reviw6server12console__log(`Received review for ${ctx.filename} (${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(comments.length)} comments)`);
  if (_M0FP36kazuph5reviw6server12all__results.length >= _M0FP36kazuph5reviw6server15expected__count.val) {
    const yaml = _M0FP36kazuph5reviw4core17reviews__to__yaml(_M0FP36kazuph5reviw6server12all__results);
    _M0FP36kazuph5reviw6server22process__stdout__write(yaml);
    const _len$4 = _M0FP36kazuph5reviw6server15active__servers.length;
    let _tmp$4 = 0;
    while (true) {
      const _i = _tmp$4;
      if (_i < _len$4) {
        const srv = _M0FP36kazuph5reviw6server15active__servers[_i];
        const _p = srv.file_path;
        const _p$2 = "<stdin>";
        if (!(_p === _p$2)) {
          _M0FP36kazuph5reviw6server13unwatch__file(srv.file_path);
        }
        _M0FP36kazuph5reviw6server12remove__lock(srv.port);
        _tmp$4 = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0FP36kazuph5reviw6server13process__exit(0);
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw6server17child__exec__sync(_tmp, _tmp$2) {
  return execSync$2052(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server15command__exists(cmd) {
  return _M0FP36kazuph5reviw6server15try__call__bool(() => {
    _M0FP36kazuph5reviw6server17child__exec__sync(`${cmd} -version`, _M0FP36kazuph5reviw6server15js__stdio__pipe());
    return true;
  });
}
function _M0FP36kazuph5reviw6server19json__encode__value(s) {
  const buf = _M0MP311moonbitlang4core7builtin13StringBuilder11new_2einner(0);
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      switch (ch) {
        case 92: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\\\");
          break;
        }
        case 34: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\\"");
          break;
        }
        case 10: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\n");
          break;
        }
        case 13: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\r");
          break;
        }
        case 9: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger13write__string(buf, "\\t");
          break;
        }
        default: {
          _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, ch);
        }
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0IP311moonbitlang4core7builtin13StringBuilderP311moonbitlang4core7builtin6Logger11write__char(buf, 34);
  return buf.val;
}
function _M0FP36kazuph5reviw6server17fs__mkdtemp__sync(_tmp) {
  return mkdtempSync$2056(_tmp);
}
function _M0FP36kazuph5reviw6server10os__tmpdir() {
  return tmpdir$2057();
}
function _M0FP36kazuph5reviw6server15make__temp__dir() {
  return _M0FP36kazuph5reviw6server17fs__mkdtemp__sync(`${_M0FP36kazuph5reviw6server10os__tmpdir()}/reviw-`);
}
function _M0FP36kazuph5reviw6server13path__dirname(_tmp) {
  return dirname$2065(_tmp);
}
function _M0FP36kazuph5reviw6server18read__file__base64(path) {
  return _M0FP36kazuph5reviw6server17try__call__string(() => _M0FP36kazuph5reviw6server15buf__to__base64(_M0FP36kazuph5reviw6server18read__file__buffer(path)), "");
}
function _M0FP36kazuph5reviw6server22fs__readdir__sync__raw(_tmp) {
  return readdirSync$2068(_tmp);
}
function _M0FP36kazuph5reviw6server13readdir__sync(path) {
  return _M0FP36kazuph5reviw6server24try__call__array__string(() => _M0FP36kazuph5reviw6server22fs__readdir__sync__raw(path));
}
function _M0FP36kazuph5reviw6server12fs__rm__sync(_tmp, _tmp$2) {
  return rmSync$2077(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server18rm__dir__recursive(path) {
  _M0FP36kazuph5reviw6server15try__call__void(() => {
    _M0FP36kazuph5reviw6server12fs__rm__sync(path, _M0FP36kazuph5reviw6server12js__rm__opts());
  });
}
function _M0FP36kazuph5reviw6server12child__spawn(_tmp, _tmp$2, _tmp$3) {
  return spawn$2082(_tmp, _tmp$2, _tmp$3);
}
function _M0FP36kazuph5reviw6server12spawn__async(cmd, args_json) {
  return _M0FP36kazuph5reviw6server12child__spawn(cmd, _M0FP36kazuph5reviw6server15js__parse__json(args_json), _M0FP36kazuph5reviw6server21js__spawn__opts__pipe());
}
function _M0FP36kazuph5reviw6server18child__spawn__sync(_tmp, _tmp$2, _tmp$3) {
  return spawnSync$2087(_tmp, _tmp$2, _tmp$3);
}
function _M0FP36kazuph5reviw6server19spawn__sync__stdout(cmd, args_json) {
  return _M0FP36kazuph5reviw6server17try__call__string(() => _M0FP36kazuph5reviw6server15js__obj__stdout(_M0FP36kazuph5reviw6server18child__spawn__sync(cmd, _M0FP36kazuph5reviw6server15js__parse__json(args_json), _M0FP36kazuph5reviw6server27js__spawn__opts__utf8__pipe())), "");
}
function _M0FP36kazuph5reviw6server23handle__video__timeline(ctx, url, res) {
  const video_path = _M0FP36kazuph5reviw6server19parse__query__param(url, "path");
  const scene_str = _M0FP36kazuph5reviw6server19parse__query__param(url, "scene");
  if (_M0MP311moonbitlang4core6string6String8contains(video_path, { str: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c458, start: 0, end: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c458.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 400, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "Invalid path");
    return undefined;
  }
  const base_dir = _M0FP36kazuph5reviw6server13path__dirname(ctx.file_path);
  const resolved_video = _M0FP36kazuph5reviw6server13path__resolve(_M0FP36kazuph5reviw6server10path__join(base_dir, video_path));
  const resolved_base = _M0FP36kazuph5reviw6server13path__resolve(base_dir);
  if (!_M0MP311moonbitlang4core6string6String11has__prefix(resolved_video, { str: resolved_base, start: 0, end: resolved_base.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 403, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "Forbidden");
    return undefined;
  }
  if (!_M0FP36kazuph5reviw6server12exists__sync(resolved_video)) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 404, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "File not found");
    return undefined;
  }
  if (!_M0FP36kazuph5reviw6server15command__exists("ffmpeg")) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 500, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "ffmpeg not available");
    return undefined;
  }
  _M0FP36kazuph5reviw6server10setup__sse(res);
  const tmp_dir = _M0FP36kazuph5reviw6server15make__temp__dir();
  const first_frame = _M0FP36kazuph5reviw6server10path__join(tmp_dir, "first_frame.jpg");
  _M0FP36kazuph5reviw6server19spawn__sync__stdout("ffmpeg", `[\"-y\", \"-i\", ${_M0FP36kazuph5reviw6server19json__encode__value(resolved_video)}, \"-vf\", \"scale=160:-1\", \"-vframes\", \"1\", \"-q:v\", \"5\", ${_M0FP36kazuph5reviw6server19json__encode__value(first_frame)}]`);
  if (_M0FP36kazuph5reviw6server12exists__sync(first_frame)) {
    const b64 = _M0FP36kazuph5reviw6server18read__file__base64(first_frame);
    if (b64.length > 0) {
      _M0FP36kazuph5reviw6server9sse__send(res, "message", `{\"type\":\"thumbnail\",\"time\":0,\"index\":0,\"data\":\"data:image/jpeg;base64,${b64}\"}`);
    }
  }
  const scene_threshold = scene_str.length > 0 ? scene_str : "0.01";
  const ffmpeg_proc = _M0FP36kazuph5reviw6server12spawn__async("ffmpeg", `[\"-i\", ${_M0FP36kazuph5reviw6server19json__encode__value(resolved_video)}, \"-vf\", \"select='gt(scene,${scene_threshold})',showinfo,scale=160:-1\", \"-vsync\", \"vfr\", \"-q:v\", \"5\", ${_M0FP36kazuph5reviw6server19json__encode__value(_M0FP36kazuph5reviw6server10path__join(tmp_dir, "scene_%04d.jpg"))}]`);
  const scene_index = _M0MP311moonbitlang4core3ref3Ref3newGiE(1);
  _M0FP36kazuph5reviw6server16on__spawn__close(ffmpeg_proc, (_code) => {
    const files = _M0FP36kazuph5reviw6server13readdir__sync(tmp_dir);
    const _len = files.length;
    let _tmp = 0;
    while (true) {
      const _i = _tmp;
      if (_i < _len) {
        const file = files[_i];
        if (_M0MP311moonbitlang4core6string6String11has__prefix(file, { str: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c461, start: 0, end: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c461.length }) && _M0MP311moonbitlang4core6string6String11has__suffix(file, { str: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c462, start: 0, end: _M0FP36kazuph5reviw6server39handle__video__timeline_2e_2abind_7c462.length })) {
          const fpath = _M0FP36kazuph5reviw6server10path__join(tmp_dir, file);
          const b64 = _M0FP36kazuph5reviw6server18read__file__base64(fpath);
          if (b64.length > 0) {
            _M0FP36kazuph5reviw6server9sse__send(res, "message", `{\"type\":\"thumbnail\",\"time\":${_M0MP311moonbitlang4core3int3Int18to__string_2einner(scene_index.val, 10)},\"index\":${_M0MP311moonbitlang4core3int3Int18to__string_2einner(scene_index.val, 10)},\"data\":\"data:image/jpeg;base64,${b64}\"}`);
            scene_index.val = scene_index.val + 1 | 0;
          }
        }
        _tmp = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0FP36kazuph5reviw6server9sse__send(res, "message", `{\"type\":\"complete\",\"total\":${_M0MP311moonbitlang4core3int3Int18to__string_2einner(scene_index.val, 10)}}`);
    _M0FP36kazuph5reviw6server8res__end(res, "");
    _M0FP36kazuph5reviw6server18rm__dir__recursive(tmp_dir);
  });
  _M0FP36kazuph5reviw6server16on__spawn__error(ffmpeg_proc, () => {
    _M0FP36kazuph5reviw6server9sse__send(res, "message", "{\"type\":\"complete\",\"total\":1}");
    _M0FP36kazuph5reviw6server8res__end(res, "");
    _M0FP36kazuph5reviw6server18rm__dir__recursive(tmp_dir);
  });
}
function _M0FP36kazuph5reviw6server13load__history(file_path) {
  const hp = _M0FP36kazuph5reviw6server13history__path(file_path);
  if (!_M0FP36kazuph5reviw6server12exists__sync(hp)) {
    return "[]";
  }
  const data = _M0FP36kazuph5reviw6server16read__file__safe(hp);
  return data.length === 0 ? "[]" : data;
}
function _M0FP36kazuph5reviw6server19remove__sse__client(ctx, client) {
  let idx = -1;
  const _arr = ctx.sse_clients;
  const _len = _arr.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const c = _arr[_i];
      if (_M0FP36kazuph5reviw6server11js__ref__eq(c, client)) {
        idx = _i;
        break;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (idx >= 0 && idx < ctx.sse_clients.length) {
    _M0MP311moonbitlang4core5array5Array6removeGRP36kazuph5reviw6server7JsValueE(ctx.sse_clients, idx);
    return;
  } else {
    return;
  }
}
function _M0FP36kazuph5reviw6server15get__mime__type(ext) {
  switch (ext) {
    case ".png": {
      return "image/png";
    }
    case ".jpg": {
      return "image/jpeg";
    }
    case ".jpeg": {
      return "image/jpeg";
    }
    case ".gif": {
      return "image/gif";
    }
    case ".webp": {
      return "image/webp";
    }
    case ".svg": {
      return "image/svg+xml";
    }
    case ".ico": {
      return "image/x-icon";
    }
    case ".mp4": {
      return "video/mp4";
    }
    case ".webm": {
      return "video/webm";
    }
    case ".mov": {
      return "video/quicktime";
    }
    case ".avi": {
      return "video/x-msvideo";
    }
    case ".mkv": {
      return "video/x-matroska";
    }
    case ".m4v": {
      return "video/x-m4v";
    }
    case ".ogv": {
      return "video/ogg";
    }
    case ".css": {
      return "text/css";
    }
    case ".js": {
      return "application/javascript";
    }
    case ".json": {
      return "application/json";
    }
    case ".pdf": {
      return "application/pdf";
    }
    case ".woff": {
      return "font/woff";
    }
    case ".woff2": {
      return "font/woff2";
    }
    default: {
      return "application/octet-stream";
    }
  }
}
function _M0FP36kazuph5reviw6server9index__of(s, target) {
  const chars = _M0MP311moonbitlang4core6string6String9to__array(s);
  const _len = chars.length;
  let _tmp = 0;
  while (true) {
    const _i = _tmp;
    if (_i < _len) {
      const ch = chars[_i];
      if (ch === target) {
        return _i;
      }
      _tmp = _i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return -1;
}
function _M0FP36kazuph5reviw6server14fs__stat__sync(_tmp) {
  return statSync$2101(_tmp);
}
function _M0FP36kazuph5reviw6server14is__file__sync(path) {
  return _M0FP36kazuph5reviw6server18js__stat__is__file(_M0FP36kazuph5reviw6server14fs__stat__sync(path));
}
function _M0FP36kazuph5reviw6server30fs__create__read__stream__opts(_tmp, _tmp$2) {
  return createReadStream$2105(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server17pipe__file__range(file_path, res, content_type, range_header) {
  const stat = _M0FP36kazuph5reviw6server14fs__stat__sync(file_path);
  const file_size = _M0FP36kazuph5reviw6server14js__stat__size(stat);
  const range_info = _M0FP36kazuph5reviw6server20parse__range__header(range_header, file_size);
  const start = range_info._0;
  const end = range_info._1;
  const chunk_size = (end - start | 0) + 1 | 0;
  _M0FP36kazuph5reviw6server23res__write__head__range(res, content_type, start, end, file_size, chunk_size);
  const opts = _M0FP36kazuph5reviw6server15js__range__opts(start, end);
  const stream = _M0FP36kazuph5reviw6server30fs__create__read__stream__opts(file_path, opts);
  _M0FP36kazuph5reviw6server8js__pipe(stream, res);
}
function _M0FP36kazuph5reviw6server24fs__create__read__stream(_tmp) {
  return createReadStream$2105(_tmp);
}
function _M0FP36kazuph5reviw6server24pipe__file__to__response(file_path, res, content_type) {
  const stat = _M0FP36kazuph5reviw6server14fs__stat__sync(file_path);
  const size = _M0FP36kazuph5reviw6server14js__stat__size(stat);
  _M0FP36kazuph5reviw6server16res__set__header(res, "Accept-Ranges", "bytes");
  _M0FP36kazuph5reviw6server31res__write__head__with__headers(res, 200, content_type, size, true);
  const stream = _M0FP36kazuph5reviw6server24fs__create__read__stream(file_path);
  _M0FP36kazuph5reviw6server8js__pipe(stream, res);
}
function _M0FP36kazuph5reviw6server19serve__static__file(ctx, url, req, res) {
  const qmark = _M0FP36kazuph5reviw6server9index__of(url, 63);
  const url_path = qmark >= 0 ? _M0FP36kazuph5reviw4core18safe__slice__range(url, 0, qmark) : url;
  const relative_path = _M0MP311moonbitlang4core6string6String11has__prefix(url_path, { str: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c489, start: 0, end: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c489.length }) ? _M0FP36kazuph5reviw4core11safe__slice(url_path, 1) : url_path;
  if (_M0MP311moonbitlang4core6string6String8contains(relative_path, { str: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c487, start: 0, end: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c487.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 403, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "Forbidden");
    return undefined;
  }
  const base_dir = _M0FP36kazuph5reviw6server13path__dirname(ctx.file_path);
  const static_path = _M0FP36kazuph5reviw6server10path__join(base_dir, relative_path);
  const resolved_static = _M0FP36kazuph5reviw6server13path__resolve(static_path);
  const resolved_base = _M0FP36kazuph5reviw6server13path__resolve(base_dir);
  if (!_M0MP311moonbitlang4core6string6String11has__prefix(resolved_static, { str: resolved_base, start: 0, end: resolved_base.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 403, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "Forbidden");
    return undefined;
  }
  if (_M0FP36kazuph5reviw6server12exists__sync(resolved_static) && _M0FP36kazuph5reviw6server14is__file__sync(resolved_static)) {
    const ext = _M0MP311moonbitlang4core6string6String9to__lower(_M0FP36kazuph5reviw6server13path__extname(resolved_static));
    const content_type = _M0FP36kazuph5reviw6server15get__mime__type(ext);
    const is_video = _M0MP311moonbitlang4core6string6String11has__prefix(content_type, { str: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c488, start: 0, end: _M0FP36kazuph5reviw6server35serve__static__file_2e_2abind_7c488.length });
    const range = _M0FP36kazuph5reviw6server18req__range__header(req);
    if (is_video && range.length > 0) {
      _M0FP36kazuph5reviw6server17pipe__file__range(resolved_static, res, content_type, range);
      return;
    } else {
      _M0FP36kazuph5reviw6server24pipe__file__to__response(resolved_static, res, content_type);
      return;
    }
  } else {
    _M0FP36kazuph5reviw6server16res__write__head(res, 404, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "Not Found");
    return;
  }
}
function _M0FP36kazuph5reviw6server25serve__static__file__head(ctx, url, res) {
  const qmark = _M0FP36kazuph5reviw6server9index__of(url, 63);
  const url_path = qmark >= 0 ? _M0FP36kazuph5reviw4core18safe__slice__range(url, 0, qmark) : url;
  const relative_path = _M0MP311moonbitlang4core6string6String11has__prefix(url_path, { str: _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c491, start: 0, end: _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c491.length }) ? _M0FP36kazuph5reviw4core11safe__slice(url_path, 1) : url_path;
  if (_M0MP311moonbitlang4core6string6String8contains(relative_path, { str: _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c490, start: 0, end: _M0FP36kazuph5reviw6server41serve__static__file__head_2e_2abind_7c490.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 403, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "");
    return undefined;
  }
  const base_dir = _M0FP36kazuph5reviw6server13path__dirname(ctx.file_path);
  const static_path = _M0FP36kazuph5reviw6server10path__join(base_dir, relative_path);
  const resolved_static = _M0FP36kazuph5reviw6server13path__resolve(static_path);
  const resolved_base = _M0FP36kazuph5reviw6server13path__resolve(base_dir);
  if (!_M0MP311moonbitlang4core6string6String11has__prefix(resolved_static, { str: resolved_base, start: 0, end: resolved_base.length })) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 403, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "");
    return undefined;
  }
  if (_M0FP36kazuph5reviw6server12exists__sync(resolved_static) && _M0FP36kazuph5reviw6server14is__file__sync(resolved_static)) {
    const ext = _M0MP311moonbitlang4core6string6String9to__lower(_M0FP36kazuph5reviw6server13path__extname(resolved_static));
    const content_type = _M0FP36kazuph5reviw6server15get__mime__type(ext);
    const stat = _M0FP36kazuph5reviw6server14fs__stat__sync(resolved_static);
    const size = _M0FP36kazuph5reviw6server14js__stat__size(stat);
    _M0FP36kazuph5reviw6server16res__set__header(res, "Accept-Ranges", "bytes");
    _M0FP36kazuph5reviw6server31res__write__head__with__headers(res, 200, content_type, size, true);
    _M0FP36kazuph5reviw6server8res__end(res, "");
    return;
  } else {
    _M0FP36kazuph5reviw6server16res__write__head(res, 404, "text/plain");
    _M0FP36kazuph5reviw6server8res__end(res, "");
    return;
  }
}
function _M0FP36kazuph5reviw6server15handle__request(ctx, req, res) {
  const http_method = _M0FP36kazuph5reviw6server11req__method(req);
  const url = _M0FP36kazuph5reviw6server8req__url(req);
  if (http_method === "GET" && (url === "/" || url === "/index.html")) {
    _M0FP36kazuph5reviw6server16res__write__head(res, 200, "text/html; charset=utf-8");
    _M0FP36kazuph5reviw6server8res__end(res, ctx.html_cache);
    return;
  } else {
    if (http_method === "GET" && url === "/ui.js") {
      _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/javascript; charset=utf-8");
      _M0FP36kazuph5reviw6server8res__end(res, _M0FP36kazuph5reviw6server12load__ui__js());
      return;
    } else {
      if (http_method === "GET" && url === "/healthz") {
        _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/json");
        _M0FP36kazuph5reviw6server8res__end(res, "{\"ok\":true}");
        return;
      } else {
        if (http_method === "GET" && url === "/sse") {
          _M0FP36kazuph5reviw6server10setup__sse(res);
          _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw6server7JsValueE(ctx.sse_clients, res);
          _M0FP36kazuph5reviw6server9on__close(req, () => {
            _M0FP36kazuph5reviw6server19remove__sse__client(ctx, res);
          });
          return;
        } else {
          if (http_method === "GET" && url === "/history") {
            const history_json = _M0FP36kazuph5reviw6server13load__history(ctx.file_path);
            _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/json");
            _M0FP36kazuph5reviw6server8res__end(res, history_json);
            return;
          } else {
            if (http_method === "GET" && _M0MP311moonbitlang4core6string6String11has__prefix(url, { str: _M0FP36kazuph5reviw6server31handle__request_2e_2abind_7c492, start: 0, end: _M0FP36kazuph5reviw6server31handle__request_2e_2abind_7c492.length })) {
              _M0FP36kazuph5reviw6server23handle__video__timeline(ctx, url, res);
              return;
            } else {
              if (http_method === "POST" && url === "/exit") {
                _M0FP36kazuph5reviw6server10read__body(req, (body) => {
                  _M0FP36kazuph5reviw6server14handle__submit(ctx, body);
                  _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/json");
                  _M0FP36kazuph5reviw6server8res__end(res, "{\"ok\":true}");
                });
                return;
              } else {
                if (http_method === "HEAD") {
                  if (url === "/" || url === "/index.html") {
                    _M0FP36kazuph5reviw6server16res__write__head(res, 200, "text/html; charset=utf-8");
                    _M0FP36kazuph5reviw6server8res__end(res, "");
                    return;
                  } else {
                    if (url === "/healthz") {
                      _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/json");
                      _M0FP36kazuph5reviw6server8res__end(res, "");
                      return;
                    } else {
                      if (url === "/ui.js") {
                        _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/javascript; charset=utf-8");
                        _M0FP36kazuph5reviw6server8res__end(res, "");
                        return;
                      } else {
                        if (url === "/history") {
                          _M0FP36kazuph5reviw6server16res__write__head(res, 200, "application/json");
                          _M0FP36kazuph5reviw6server8res__end(res, "");
                          return;
                        } else {
                          _M0FP36kazuph5reviw6server25serve__static__file__head(ctx, url, res);
                          return;
                        }
                      }
                    }
                  }
                } else {
                  if (http_method === "GET") {
                    _M0FP36kazuph5reviw6server19serve__static__file(ctx, url, req, res);
                    return;
                  } else {
                    _M0FP36kazuph5reviw6server16res__write__head(res, 404, "text/plain");
                    _M0FP36kazuph5reviw6server8res__end(res, "Not Found");
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
function _M0FP36kazuph5reviw6server17child__exec__file(cmd, args) {
  _M0FP36kazuph5reviw6server22child__spawn__detached(cmd, args);
}
function _M0FP36kazuph5reviw6server19spawn__sync__result(cmd, args_json) {
  return _M0FP36kazuph5reviw6server17try__call__string(() => _M0FP36kazuph5reviw6server15js__obj__stdout(_M0FP36kazuph5reviw6server18child__spawn__sync(cmd, _M0FP36kazuph5reviw6server15js__parse__json(args_json), _M0FP36kazuph5reviw6server21js__spawn__opts__utf8())), "");
}
function _M0FP36kazuph5reviw6server28try__activate__existing__tab(url) {
  const _p = _M0FP36kazuph5reviw6server13get__platform();
  const _p$2 = "darwin";
  if (!(_p === _p$2)) {
    return false;
  }
  const chrome_script = `set found to false\ntell application \"System Events\"\n  if exists process \"Google Chrome\" then\n    tell application \"Google Chrome\"\n      set targetUrl to \"${url}\"\n      repeat with w in windows\n        set tabIndex to 1\n        repeat with t in tabs of w\n          if URL of t starts with targetUrl then\n            set active tab index of w to tabIndex\n            set index of w to 1\n            activate\n            set found to true\n            exit repeat\n          end if\n          set tabIndex to tabIndex + 1\n        end repeat\n        if found then exit repeat\n      end repeat\n    end tell\n  end if\nend tell\nfound`;
  const chrome_result = _M0FP36kazuph5reviw6server19spawn__sync__result("osascript", `[\"-e\", ${_M0FP36kazuph5reviw6server19json__encode__value(chrome_script)}]`);
  if (_M0MP311moonbitlang4core6string6String8contains(chrome_result, { str: _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c493, start: 0, end: _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c493.length })) {
    _M0FP36kazuph5reviw6server12console__log(`Activated existing Chrome tab: ${url}`);
    return true;
  }
  const safari_script = `set found to false\ntell application \"System Events\"\n  if exists process \"Safari\" then\n    tell application \"Safari\"\n      set targetUrl to \"${url}\"\n      repeat with w in windows\n        repeat with t in tabs of w\n          if URL of t starts with targetUrl then\n            set current tab of w to t\n            set index of w to 1\n            activate\n            set found to true\n            exit repeat\n          end if\n        end repeat\n        if found then exit repeat\n      end repeat\n    end tell\n  end if\nend tell\nfound`;
  const safari_result = _M0FP36kazuph5reviw6server19spawn__sync__result("osascript", `[\"-e\", ${_M0FP36kazuph5reviw6server19json__encode__value(safari_script)}]`);
  if (_M0MP311moonbitlang4core6string6String8contains(safari_result, { str: _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c494, start: 0, end: _M0FP36kazuph5reviw6server44try__activate__existing__tab_2e_2abind_7c494.length })) {
    _M0FP36kazuph5reviw6server12console__log(`Activated existing Safari tab: ${url}`);
    return true;
  }
  return false;
}
function _M0FP36kazuph5reviw6server13open__browser(url) {
  const platform = _M0FP36kazuph5reviw6server13get__platform();
  if (platform === "darwin") {
    if (_M0FP36kazuph5reviw6server28try__activate__existing__tab(url)) {
      return undefined;
    }
    _M0FP36kazuph5reviw6server17child__exec__file("open", [url]);
    return;
  } else {
    if (platform === "win32") {
      _M0FP36kazuph5reviw6server17child__exec__file("cmd", ["/c", "start", url]);
      return;
    } else {
      _M0FP36kazuph5reviw6server17child__exec__file("xdg-open", [url]);
      return;
    }
  }
}
function _M0FP36kazuph5reviw6server11try__listen(ctx, port, attempt, no_open) {
  if (attempt >= 10) {
    _M0FP36kazuph5reviw6server14console__error(`Failed to find available port after ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(10)} attempts`);
    _M0FP36kazuph5reviw6server13process__exit(1);
  }
  const server = _M0FP36kazuph5reviw6server14create__server((req, res) => {
    _M0FP36kazuph5reviw6server15handle__request(ctx, req, res);
  });
  _M0FP36kazuph5reviw6server17server__on__error(server, (err) => {
    if (_M0FP36kazuph5reviw6server11error__code(err) === "EADDRINUSE") {
      _M0FP36kazuph5reviw6server12console__log(`Port ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port)} in use, trying ${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port + 1 | 0)}...`);
      _M0FP36kazuph5reviw6server11try__listen(ctx, port + 1 | 0, attempt + 1 | 0, no_open);
      return;
    } else {
      _M0FP36kazuph5reviw6server14console__error("Server error");
      _M0FP36kazuph5reviw6server13process__exit(1);
      return;
    }
  });
  _M0FP36kazuph5reviw6server14server__listen(server, port, () => {
    ctx.port = port;
    _M0FP36kazuph5reviw6server11write__lock(port);
    const url = `http://127.0.0.1:${_M0IP016_24default__implP311moonbitlang4core7builtin4Show10to__stringGiE(port)}`;
    _M0FP36kazuph5reviw6server12console__log(`reviw serving ${ctx.filename} at ${url}`);
    if (!no_open) {
      _M0FP36kazuph5reviw6server13open__browser(url);
      return;
    } else {
      return;
    }
  });
  _M0FP36kazuph5reviw6server13set__interval(() => {
    const _arr = ctx.sse_clients;
    const _len = _arr.length;
    let _tmp = 0;
    while (true) {
      const _i = _tmp;
      if (_i < _len) {
        const client = _arr[_i];
        _M0FP36kazuph5reviw6server9sse__send(client, "ping", "");
        _tmp = _i + 1 | 0;
        continue;
      } else {
        return;
      }
    }
  }, 25000);
}
function _M0FP36kazuph5reviw6server19start__http__server(ctx, no_open) {
  _M0FP36kazuph5reviw6server11try__listen(ctx, ctx.port, 0, no_open);
}
function _M0FP36kazuph5reviw6server11watch__file(_tmp, _tmp$2) {
  return watchFile$2141(_tmp, _tmp$2);
}
function _M0FP36kazuph5reviw6server19start__file__server(file_path, port, no_open) {
  const resolved = _M0FP36kazuph5reviw6server13path__resolve(file_path);
  const filename = _M0FP36kazuph5reviw6server14path__basename(resolved);
  const mode = _M0FP36kazuph5reviw6server12detect__mode(resolved);
  const ctx = { file_path: resolved, filename: filename, mode: mode, port: port, html_cache: "", sse_clients: [] };
  ctx.html_cache = _M0FP36kazuph5reviw6server22load__and__build__html(ctx);
  _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw6server13ServerContextE(_M0FP36kazuph5reviw6server15active__servers, ctx);
  const _p = ctx.file_path;
  const _p$2 = "<stdin>";
  if (!(_p === _p$2)) {
    const clients = ctx.sse_clients;
    _M0FP36kazuph5reviw6server11watch__file(resolved, (_curr, _prev) => {
      ctx.html_cache = _M0FP36kazuph5reviw6server22load__and__build__html(ctx);
      const _len = clients.length;
      let _tmp = 0;
      while (true) {
        const _i = _tmp;
        if (_i < _len) {
          const client = clients[_i];
          _M0FP36kazuph5reviw6server9sse__send(client, "reload", "");
          _tmp = _i + 1 | 0;
          continue;
        } else {
          return;
        }
      }
    });
  }
  _M0FP36kazuph5reviw6server19start__http__server(ctx, no_open);
}
function _M0FP36kazuph5reviw6server20start__stdin__server(content, port, no_open) {
  const data = _M0FP36kazuph5reviw4core11parse__diff(content);
  const html = _M0FP36kazuph5reviw4core17build__diff__html(data, "stdin", port);
  const ctx = { file_path: "<stdin>", filename: "stdin", mode: 3, port: port, html_cache: html, sse_clients: [] };
  _M0MP311moonbitlang4core5array5Array4pushGRP36kazuph5reviw6server13ServerContextE(_M0FP36kazuph5reviw6server15active__servers, ctx);
  _M0FP36kazuph5reviw6server15expected__count.val = 1;
  _M0FP36kazuph5reviw6server19start__http__server(ctx, no_open);
}
(() => {
  const argv = _M0FP36kazuph5reviw6server9get__argv();
  const args = [];
  const _end388 = argv.length;
  let _tmp = 2;
  while (true) {
    const i = _tmp;
    if (i < _end388) {
      _M0MP311moonbitlang4core5array5Array4pushGsE(args, _M0MP311moonbitlang4core5array5Array2atGsE(argv, i));
      _tmp = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  let port = 4989;
  let no_open = false;
  const files = [];
  let i = 0;
  while (true) {
    if (i < args.length) {
      const arg = _M0MP311moonbitlang4core5array5Array2atGsE(args, i);
      if (arg === "--help" || arg === "-h") {
        _M0FP36kazuph5reviw6server12print__usage();
        _M0FP36kazuph5reviw6server13process__exit(0);
      } else {
        if (arg === "--version" || arg === "-v") {
          _M0FP36kazuph5reviw6server12console__log("reviw 2.0.0 (moonbit)");
          _M0FP36kazuph5reviw6server13process__exit(0);
        } else {
          if (arg === "--port") {
            i = i + 1 | 0;
            if (i < args.length) {
              port = _M0FP36kazuph5reviw6server11parse__port(_M0MP311moonbitlang4core5array5Array2atGsE(args, i));
            }
          } else {
            if (arg === "--no-open") {
              no_open = true;
            } else {
              if (arg === "--encoding" || arg === "-e") {
                i = i + 1 | 0;
                if (i < args.length) {
                  _M0FP36kazuph5reviw6server18encoding__override.val = _M0MP311moonbitlang4core5array5Array2atGsE(args, i);
                }
              } else {
                if (!_M0MP311moonbitlang4core6string6String11has__prefix(arg, { str: _M0FP36kazuph5reviw6server26_2ainit_2a_2e_2abind_7c504, start: 0, end: _M0FP36kazuph5reviw6server26_2ainit_2a_2e_2abind_7c504.length })) {
                  _M0MP311moonbitlang4core5array5Array4pushGsE(files, arg);
                }
              }
            }
          }
        }
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0FP36kazuph5reviw6server19on__process__signal("SIGINT", () => {
    const _len = _M0FP36kazuph5reviw6server15active__servers.length;
    let _tmp$2 = 0;
    while (true) {
      const _i = _tmp$2;
      if (_i < _len) {
        const srv = _M0FP36kazuph5reviw6server15active__servers[_i];
        _M0FP36kazuph5reviw6server12remove__lock(srv.port);
        _tmp$2 = _i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0FP36kazuph5reviw6server13process__exit(0);
  });
  _M0FP36kazuph5reviw6server12load__ui__js();
  if (files.length === 0) {
    if (!_M0FP36kazuph5reviw6server14is__stdin__tty()) {
      const stdin_content = _M0FP36kazuph5reviw6server17read__stdin__sync();
      if (stdin_content.length > 0) {
        _M0FP36kazuph5reviw6server20start__stdin__server(stdin_content, port, no_open);
        return;
      }
    }
    _M0FP36kazuph5reviw6server12print__usage();
    _M0FP36kazuph5reviw6server13process__exit(1);
  }
  _M0FP36kazuph5reviw6server15expected__count.val = files.length;
  _M0FP36kazuph5reviw6server17ensure__lock__dir();
  const _len = files.length;
  let _tmp$2 = 0;
  while (true) {
    const _i = _tmp$2;
    if (_i < _len) {
      const file_path = files[_i];
      const current_port = _M0FP36kazuph5reviw6server21find__available__port(port + _i | 0);
      _M0FP36kazuph5reviw6server19start__file__server(file_path, current_port, no_open);
      _tmp$2 = _i + 1 | 0;
      continue;
    } else {
      return;
    }
  }
})();
