///| DOM external types
#external
pub type Element

#external
pub type Event

#external
pub type EventSource

///| DOM query
extern "js" fn query(selector : String) -> Element =
  #|(s) => document.querySelector(s)

extern "js" fn query_all(selector : String) -> Array[Element] =
  #|(s) => [...document.querySelectorAll(s)]

///| Element properties
extern "js" fn get_attr(el : Element, name : String) -> String =
  #|(el, name) => el?.getAttribute(name) || ""

extern "js" fn set_attr(el : Element, name : String, value : String) -> Unit =
  #|(el, name, val) => el?.setAttribute(name, val)

extern "js" fn get_inner_html(el : Element) -> String =
  #|(el) => el?.innerHTML || ""

extern "js" fn set_inner_html(el : Element, html : String) -> Unit =
  #|(el, html) => { if (el) el.innerHTML = html; }

extern "js" fn get_text_content(el : Element) -> String =
  #|(el) => el?.textContent || ""

extern "js" fn get_value(el : Element) -> String =
  #|(el) => el?.value || ""

extern "js" fn set_value(el : Element, val : String) -> Unit =
  #|(el, val) => { if (el) el.value = val; }

extern "js" fn add_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el?.classList.add(cls)

extern "js" fn remove_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el?.classList.remove(cls)

extern "js" fn has_class(el : Element, cls : String) -> Bool =
  #|(el, cls) => el?.classList.contains(cls) || false

extern "js" fn toggle_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => el?.classList.toggle(cls)

///| Event handling
extern "js" fn on(el : Element, event : String, handler : (Event) -> Unit) -> Unit =
  #|(el, event, handler) => el?.addEventListener(event, handler)

extern "js" fn on_doc(event : String, handler : (Event) -> Unit) -> Unit =
  #|(event, handler) => document.addEventListener(event, handler)

extern "js" fn event_target(e : Event) -> Element =
  #|(e) => e.target

extern "js" fn event_key(e : Event) -> String =
  #|(e) => e.key || ""

extern "js" fn event_meta_key(e : Event) -> Bool =
  #|(e) => e.metaKey || false

extern "js" fn event_ctrl_key(e : Event) -> Bool =
  #|(e) => e.ctrlKey || false

extern "js" fn prevent_default(e : Event) -> Unit =
  #|(e) => e.preventDefault()

extern "js" fn closest(el : Element, selector : String) -> Element =
  #|(el, sel) => el?.closest(sel)

///| Position and size
extern "js" fn get_bounding_rect_top(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().top || 0

extern "js" fn get_bounding_rect_left(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().left || 0

extern "js" fn get_bounding_rect_bottom(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().bottom || 0

extern "js" fn get_offset_height(el : Element) -> Int =
  #|(el) => el?.offsetHeight || 0

extern "js" fn window_inner_height() -> Int =
  #|() => window.innerHeight

///| Style
extern "js" fn set_style(el : Element, prop : String, value : String) -> Unit =
  #|(el, prop, val) => { if (el) el.style[prop] = val; }

///| Theme
extern "js" fn get_theme() -> String =
  #|() => document.documentElement.getAttribute("data-theme") || "dark"

extern "js" fn set_theme(theme : String) -> Unit =
  #|(theme) => document.documentElement.setAttribute("data-theme", theme)

///| SSE
extern "js" fn new_event_source(url : String) -> EventSource =
  #|(url) => new EventSource(url)

extern "js" fn sse_on(
  es : EventSource,
  event : String,
  handler : (Event) -> Unit
) -> Unit =
  #|(es, event, handler) => es.addEventListener(event, handler)

///| Fetch POST
extern "js" fn fetch_post(url : String, body : String, callback : (String) -> Unit) -> Unit =
  #|(url, body, cb) => {
  #|  fetch(url, {
  #|    method: "POST",
  #|    headers: {"Content-Type": "application/json"},
  #|    body: body
  #|  }).then(r => r.text()).then(cb).catch(() => cb("error"));
  #|}

///| localStorage
extern "js" fn ls_get(key : String) -> String =
  #|(key) => localStorage.getItem(key) || ""

extern "js" fn ls_set(key : String, value : String) -> Unit =
  #|(key, val) => localStorage.setItem(key, val)

extern "js" fn ls_remove(key : String) -> Unit =
  #|(key) => localStorage.removeItem(key)

///| Window globals
extern "js" fn get_reviw_port() -> Int =
  #|() => window.__REVIW_PORT__ || 4989

extern "js" fn get_reviw_mode() -> String =
  #|() => window.__REVIW_MODE__ || "text"

///| Focus
extern "js" fn focus_element(el : Element) -> Unit =
  #|(el) => el?.focus()

///| is null check
extern "js" fn is_null(el : Element) -> Bool =
  #|(el) => el == null || el == undefined

///| Scroll into view
extern "js" fn scroll_into_view(el : Element) -> Unit =
  #|(el) => el?.scrollIntoView({ behavior: "smooth", block: "center" })

///| Parse stored comments JSON and return array of [key, row, col, text]
extern "js" fn parse_stored_comments(json : String) -> Array[Array[String]] =
  #|(json) => {
  #|  try {
  #|    const obj = JSON.parse(json);
  #|    return Object.entries(obj).map(([k, v]) => [k, String(v.row||0), String(v.col||0), v.text||""]);
  #|  } catch(e) { return []; }
  #|}

///| Window close
extern "js" fn window_close() -> Unit =
  #|() => window.close()

///| Location reload
extern "js" fn location_reload() -> Unit =
  #|() => location.reload()
