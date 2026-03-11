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

extern "js" fn get_reviw_filename() -> String =
  #|() => window.__REVIW_FILENAME__ || ""

///| Focus
extern "js" fn focus_element(el : Element) -> Unit =
  #|(el) => el?.focus()

///| is null check
extern "js" fn is_null(el : Element) -> Bool =
  #|(el) => el == null || el == undefined

///| Parse stored comments JSON (cli.cjs { comments, timestamp } format)
extern "js" fn parse_stored_comments(json : String) -> Array[Array[String]] =
  #|(json) => {
  #|  try {
  #|    const data = JSON.parse(json);
  #|    const comments = data.comments;
  #|    if (!comments || typeof comments !== "object") return [];
  #|    return Object.entries(comments).map(([k, v]) => [k, String(v.row||0), String(v.col||0), v.text||""]);
  #|  } catch(e) { return []; }
  #|}

///| Check if stored comments JSON has expired (TTL: 3 hours)
extern "js" fn is_storage_expired(json : String) -> Bool =
  #|(json) => {
  #|  try {
  #|    const data = JSON.parse(json);
  #|    const TTL = 3 * 60 * 60 * 1000;
  #|    return !data.timestamp || (Date.now() - data.timestamp > TTL);
  #|  } catch(e) { return true; }
  #|}

///| Current timestamp as string for JSON embedding
extern "js" fn date_now_string() -> String =
  #|() => String(Date.now())

///| Window close
extern "js" fn window_close() -> Unit =
  #|() => window.close()

///| Location reload
extern "js" fn location_reload() -> Unit =
  #|() => location.reload()

///| Scroll
extern "js" fn get_scroll_top(el : Element) -> Double =
  #|(el) => el?.scrollTop || 0

extern "js" fn set_scroll_top(el : Element, val : Double) -> Unit =
  #|(el, val) => { if (el) el.scrollTop = val; }

extern "js" fn get_scroll_height(el : Element) -> Double =
  #|(el) => el?.scrollHeight || 0

extern "js" fn get_client_height(el : Element) -> Double =
  #|(el) => el?.clientHeight || 0

///| Animation frame
extern "js" fn request_animation_frame(callback : () -> Unit) -> Int =
  #|(cb) => requestAnimationFrame(cb)

extern "js" fn cancel_animation_frame(id : Int) -> Unit =
  #|(id) => cancelAnimationFrame(id)

///| Query within parent
extern "js" fn query_all_in(parent : Element, selector : String) -> Array[Element] =
  #|(parent, s) => [...(parent?.querySelectorAll(s) || [])]

///| Timers
extern "js" fn date_now() -> Double =
  #|() => Date.now()

extern "js" fn set_timeout(callback : () -> Unit, ms : Int) -> Int =
  #|(cb, ms) => setTimeout(cb, ms)

///| Window events
extern "js" fn on_window(event : String, handler : (Event) -> Unit) -> Unit =
  #|(event, handler) => window.addEventListener(event, handler)

///| Body class manipulation
extern "js" fn add_class_body(cls : String) -> Unit =
  #|(cls) => document.body.classList.add(cls)

extern "js" fn remove_class_body(cls : String) -> Unit =
  #|(cls) => document.body.classList.remove(cls)

///| Event coordinates
extern "js" fn get_event_client_x(e : Event) -> Int =
  #|(e) => e.clientX || 0

extern "js" fn get_event_client_y(e : Event) -> Int =
  #|(e) => e.clientY || 0

extern "js" fn element_from_point(x : Int, y : Int) -> Element =
  #|(x, y) => document.elementFromPoint(x, y)

///| Fetch GET with callback
extern "js" fn fetch_get(url : String, callback : (String) -> Unit) -> Unit =
  #|(url, cb) => fetch(url).then(r => r.text()).then(cb).catch(() => cb("[]"))

///| Paste event handler for images
extern "js" fn on_paste_image(handler : (String) -> Unit) -> Unit =
  #|(handler) => {
  #|  document.addEventListener("paste", (e) => {
  #|    const items = e.clipboardData?.items;
  #|    if (!items) return;
  #|    for (const item of items) {
  #|      if (item.type.startsWith("image/")) {
  #|        e.preventDefault();
  #|        const file = item.getAsFile();
  #|        const reader = new FileReader();
  #|        reader.onload = () => handler(reader.result);
  #|        reader.readAsDataURL(file);
  #|        break;
  #|      }
  #|    }
  #|  });
  #|}

///| Extract pathname from URL (e.g., "http://localhost:19876/videos/foo.mp4" → "/videos/foo.mp4")
extern "js" fn url_to_pathname(url : String) -> String =
  #|(u) => { try { return new URL(u).pathname; } catch(_) { return u; } }

///| Create new EventSource by URL
extern "js" fn new_event_source_url(url : String) -> EventSource =
  #|(url) => new EventSource(url)

///| EventSource on message
extern "js" fn sse_on_message(es : EventSource, handler : (String) -> Unit) -> Unit =
  #|(es, handler) => es.addEventListener("message", (e) => handler(e.data))

///| EventSource close
extern "js" fn sse_close(es : EventSource) -> Unit =
  #|(es) => es.close()

///| Tag name
extern "js" fn get_tag_name(el : Element) -> String =
  #|(el) => (el?.tagName || "").toUpperCase()

///| Get attribute (already exists as get_attr, but need src specifically)
extern "js" fn get_src(el : Element) -> String =
  #|(el) => el?.src || el?.getAttribute("src") || ""

///| Parent element
extern "js" fn parent_element(el : Element) -> Element =
  #|(el) => el?.parentElement

///| Previous element sibling
extern "js" fn previous_element_sibling(el : Element) -> Element =
  #|(el) => el?.previousElementSibling

///| Next element sibling
extern "js" fn next_element_sibling(el : Element) -> Element =
  #|(el) => el?.nextElementSibling

///| Stop event propagation
extern "js" fn stop_propagation(e : Event) -> Unit =
  #|(e) => e.stopPropagation()

///| Scroll to position instantly
extern "js" fn scroll_to_instant(el : Element, top : Double) -> Unit =
  #|(el, top) => { if (el) el.scrollTo({ top, behavior: 'instant' }); }

///| Offset properties
extern "js" fn get_offset_top(el : Element) -> Double =
  #|(el) => el?.offsetTop || 0

extern "js" fn get_offset_height(el : Element) -> Double =
  #|(el) => el?.offsetHeight || 0

///| Window inner width
extern "js" fn window_inner_width() -> Int =
  #|() => window.innerWidth

///| Get bounding rect right
extern "js" fn get_bounding_rect_right(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().right || 0

///| Get bounding rect width
extern "js" fn get_bounding_rect_width(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().width || 0

///| Get bounding rect height
extern "js" fn get_bounding_rect_height(el : Element) -> Double =
  #|(el) => el?.getBoundingClientRect().height || 0

///| Get DATA array from window (injected by server)
extern "js" fn js_get_data() -> Array[Array[String]] =
  #|() => window.__DATA__ || []

///| Window selection API (returns Selection object, typed as Element for FFI convenience)
extern "js" fn window_get_selection() -> Element =
  #|() => window.getSelection()

extern "js" fn selection_is_collapsed(sel : Element) -> Bool =
  #|(sel) => !sel || sel.isCollapsed

extern "js" fn selection_to_string(sel : Element) -> String =
  #|(sel) => sel ? sel.toString() : ""

extern "js" fn selection_remove_all_ranges(sel : Element) -> Unit =
  #|(sel) => { if (sel) sel.removeAllRanges(); }

extern "js" fn selection_get_range_container(sel : Element) -> Element =
  #|(sel) => {
  #|  if (!sel || sel.rangeCount === 0) return null;
  #|  const range = sel.getRangeAt(0);
  #|  const c = range.commonAncestorContainer;
  #|  return c.nodeType === 3 ? c.parentElement : c;
  #|}

///| Query within parent element
extern "js" fn query_in(parent : Element, selector : String) -> Element =
  #|(parent, s) => parent?.querySelector(s)

///| Scroll element by delta
extern "js" fn scroll_by_instant(el : Element, delta : Double) -> Unit =
  #|(el, delta) => { if (el) el.scrollBy({ top: delta, behavior: 'instant' }); }

///| Check computed display
extern "js" fn is_element_hidden(el : Element) -> Bool =
  #|(el) => !el || el.offsetParent === null || getComputedStyle(el).display === 'none'

///| Has class check
extern "js" fn has_class(el : Element, cls : String) -> Bool =
  #|(el, cls) => el?.classList.contains(cls) || false

///| Toggle class
extern "js" fn toggle_class(el : Element, cls : String) -> Unit =
  #|(el, cls) => { if (el) el.classList.toggle(cls); }

///| Remove element from its parent
extern "js" fn remove_element(el : Element) -> Unit =
  #|(el) => { if (el && el.parentNode) el.parentNode.removeChild(el); }

///| Parse float from string (returns 0.0 on failure)
extern "js" fn parse_float(s : String) -> Double =
  #|(s) => { var v = parseFloat(s); return isNaN(v) ? 0.0 : v; }

///| Create a video element with controls for fullscreen use
extern "js" fn create_video_element(src : String) -> Element =
  #|(src) => {
  #|  var v = document.createElement('video');
  #|  v.src = src; v.controls = true;
  #|  v.style.width = '100%';
  #|  v.style.height = 'calc(100% - 80px)';
  #|  v.style.objectFit = 'contain';
  #|  v.addEventListener('click', function(e) { e.stopPropagation(); });
  #|  return v;
  #|}

///| Element reference equality
extern "js" fn elem_eq(a : Element, b : Element) -> Bool =
  #|(a, b) => a === b

///| ZoomPanViewer opaque handle
#external
type ZoomPanViewerHandle

///| Create a ZoomPanViewer — delegates to window.__createZPV (defined in expose_zpv_creator)
///  Returns an opaque handle for the viewer instance.
extern "js" fn create_zoom_pan_viewer(
  viewport : Element,
  wrapper : Element,
  natural_width : Double,
  natural_height : Double,
  zoom_info_el : Element,
  has_minimap : Bool,
  minimap_viewport_el : Element,
  mm_max_w : Double,
  mm_max_h : Double,
  mm_pad : Double,
  zoom_min : Double,
  zoom_max : Double,
  use_ctrl_for_zoom : Bool
) -> ZoomPanViewerHandle =
  #|(viewport,wrapper,nw,nh,zoomInfoEl,hasMm,mmVpEl,mmMaxW,mmMaxH,mmPad,zMin,zMax,useCtrl) => {
  #|  return window.__createZPV(viewport,wrapper,nw,nh,zoomInfoEl,hasMm,mmVpEl,mmMaxW,mmMaxH,mmPad,zMin,zMax,useCtrl);
  #|}

///| ZoomPanViewer methods
extern "js" fn zpv_fit_to_viewport(viewer : ZoomPanViewerHandle) -> Unit =
  #|(v) => { if (v) v.fitToViewport(); }

extern "js" fn zpv_zoom_in(viewer : ZoomPanViewerHandle) -> Unit =
  #|(v) => { if (v) v.zoomIn(); }

extern "js" fn zpv_zoom_out(viewer : ZoomPanViewerHandle) -> Unit =
  #|(v) => { if (v) v.zoomOut(); }

extern "js" fn zpv_destroy(viewer : ZoomPanViewerHandle) -> Unit =
  #|(v) => { if (v) v.destroy(); }

extern "js" fn zpv_get_zoom(viewer : ZoomPanViewerHandle) -> Double =
  #|(v) => v ? v.getZoom() : 1

extern "js" fn zpv_is_null(viewer : ZoomPanViewerHandle) -> Bool =
  #|(v) => v == null || v == undefined

///| DOM element creation helpers for fullscreen overlays
extern "js" fn create_element(tag : String) -> Element =
  #|(tag) => document.createElement(tag)

extern "js" fn set_class_name(el : Element, cls : String) -> Unit =
  #|(el, cls) => { if (el) el.className = cls; }

extern "js" fn set_id(el : Element, id : String) -> Unit =
  #|(el, id) => { if (el) el.id = id; }

extern "js" fn append_child(parent : Element, child : Element) -> Unit =
  #|(p, c) => { if (p && c) p.appendChild(c); }

extern "js" fn remove_child(parent : Element, child : Element) -> Unit =
  #|(p, c) => { if (p && c) p.removeChild(c); }

extern "js" fn set_text_content(el : Element, text : String) -> Unit =
  #|(el, t) => { if (el) el.textContent = t; }

extern "js" fn set_attribute(el : Element, name : String, value : String) -> Unit =
  #|(el, n, v) => { if (el) el.setAttribute(n, v); }

extern "js" fn get_client_width(el : Element) -> Double =
  #|(el) => el?.clientWidth || 0

extern "js" fn clone_node_deep(el : Element) -> Element =
  #|(el) => el ? el.cloneNode(true) : null

extern "js" fn get_natural_width(el : Element) -> Double =
  #|(el) => el?.naturalWidth || 0

extern "js" fn get_natural_height(el : Element) -> Double =
  #|(el) => el?.naturalHeight || 0

extern "js" fn set_draggable(el : Element, val : Bool) -> Unit =
  #|(el, v) => { if (el) el.draggable = v; }

extern "js" fn query_body() -> Element =
  #|() => document.body

///| Get SVG natural dimensions from viewBox or width/height attributes
extern "js" fn get_svg_natural_size(svg : Element) -> Array[Double] =
  #|(svg) => {
  #|  if (!svg) return [800, 600];
  #|  var vb = svg.getAttribute('viewBox');
  #|  if (vb) {
  #|    var p = vb.split(/[\s,]+/);
  #|    return [parseFloat(p[2]) || 800, parseFloat(p[3]) || 600];
  #|  }
  #|  return [parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width || 800,
  #|          parseFloat(svg.getAttribute('height')) || svg.getBoundingClientRect().height || 600];
  #|}

///| Expand SVG viewBox by padding (e.g. 40px each side for +80 total)
///| This makes the minimap SVG match the padded naturalWidth/Height used by ZoomPanViewer
extern "js" fn expand_svg_viewbox(svg : Element, pad : Double) -> Unit =
  #|(svg, pad) => {
  #|  if (!svg) return;
  #|  var vb = svg.getAttribute('viewBox');
  #|  if (vb) {
  #|    var p = vb.split(/[\s,]+/).map(Number);
  #|    svg.setAttribute('viewBox', (p[0]-pad)+' '+(p[1]-pad)+' '+(p[2]+pad*2)+' '+(p[3]+pad*2));
  #|  } else {
  #|    var w = parseFloat(svg.getAttribute('width')) || svg.getBoundingClientRect().width || 800;
  #|    var h = parseFloat(svg.getAttribute('height')) || svg.getBoundingClientRect().height || 600;
  #|    svg.setAttribute('viewBox', (-pad)+' '+(-pad)+' '+(w+pad*2)+' '+(h+pad*2));
  #|  }
  #|}

///| Set element visibility
extern "js" fn set_visibility(el : Element, visible : Bool) -> Unit =
  #|(el, v) => { if (el) el.style.visibility = v ? 'visible' : 'hidden'; }

///| Remove all children of an element
extern "js" fn clear_children(el : Element) -> Unit =
  #|(el) => { if (el) el.innerHTML = ''; }

///| Check if element has a specific CSS class (visible state)
extern "js" fn has_class_visible(el : Element) -> Bool =
  #|(el) => el?.classList.contains('visible') || false

///| Add 'visible' class
extern "js" fn show_overlay(el : Element) -> Unit =
  #|(el) => { if (el) el.classList.add('visible'); }

///| Remove 'visible' class
extern "js" fn hide_overlay(el : Element) -> Unit =
  #|(el) => { if (el) el.classList.remove('visible'); }

///| Get computed style property value
extern "js" fn get_computed_style(el : Element, prop : String) -> String =
  #|(el, prop) => { if (!el) return ''; return el.style[prop] || getComputedStyle(el)[prop] || ''; }

///| Get children count
extern "js" fn children_count(el : Element) -> Int =
  #|(el) => el?.children?.length || 0

///| Collect reviw answers from question panel
extern "js" fn collect_reviw_answers() -> String =
  #|() => {
  #|  var answers = {};
  #|  document.querySelectorAll('.question-card').forEach(function(item) {
  #|    var id = item.dataset.qid || '';
  #|    var textarea = item.querySelector('.q-answer');
  #|    if (id && textarea && textarea.value) {
  #|      answers[id] = textarea.value;
  #|    }
  #|  });
  #|  return JSON.stringify(answers);
  #|}

///| Copy text to clipboard
extern "js" fn copy_to_clipboard(text : String) -> Unit =
  #|(text) => {
  #|  if (navigator.clipboard && navigator.clipboard.writeText) {
  #|    navigator.clipboard.writeText(text).catch(()=>{});
  #|  } else {
  #|    var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
  #|    document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
  #|  }
  #|}

///| Show a brief toast notification
extern "js" fn show_toast(msg : String) -> Unit =
  #|(msg) => {
  #|  var t=document.createElement('div');t.textContent=msg;
  #|  t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 16px;border-radius:6px;z-index:99999;font-size:13px;';
  #|  document.body.appendChild(t);setTimeout(()=>t.remove(),2000);
  #|}

///| Scroll element into view
extern "js" fn scroll_into_view(el : Element) -> Unit =
  #|(el) => { if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

///| Programmatic click
extern "js" fn click_element(el : Element) -> Unit =
  #|(el) => { if (el) el.click(); }

///| localStorage get (returns "" if not found)
extern "js" fn local_storage_get(key : String) -> String =
  #|(key) => { try { return localStorage.getItem(key) || ""; } catch(e) { return ""; } }

///| localStorage set
extern "js" fn local_storage_set(key : String, value : String) -> Unit =
  #|(key, value) => { try { localStorage.setItem(key, value); } catch(e) {} }

///| VideoTimeline opaque handle
#external
type VideoTimelineHandle

///| Create a video timeline with SSE-based thumbnails (cli.cjs L5136-5287)
///| Create a video timeline — delegates to window.__createVTL (defined in expose_zpv_creator)
extern "js" fn create_video_timeline(
  video_el : Element,
  container : Element,
  video_path : String,
  scene_threshold : Double,
  stabilization_threshold : Double,
  prevent_bubble : Bool
) -> VideoTimelineHandle =
  #|(videoEl,container,videoPath,sceneThreshold,stabThreshold,preventBubble) => {
  #|  return window.__createVTL(videoEl,container,videoPath,sceneThreshold,stabThreshold,preventBubble);
  #|}

///| VideoTimeline methods
extern "js" fn vtl_destroy(handle : VideoTimelineHandle) -> Unit =
  #|(h) => { if (h) h.destroy(); }

extern "js" fn vtl_navigate(handle : VideoTimelineHandle, direction : Int) -> Unit =
  #|(h, d) => { if (h) h.navigate(d); }

extern "js" fn vtl_is_null(handle : VideoTimelineHandle) -> Bool =
  #|(h) => h == null || h == undefined

extern "js" fn create_null_vtl_handle() -> VideoTimelineHandle =
  #|() => null

///| Video element control
extern "js" fn video_pause(el : Element) -> Unit =
  #|(el) => { if (el) el.pause(); }

extern "js" fn video_play(el : Element) -> Unit =
  #|(el) => { if (el) el.play(); }

extern "js" fn video_is_paused(el : Element) -> Bool =
  #|(el) => el?.paused !== false

///| Initialize media sidebar (cli.cjs L7597-8216 initMediaSidebar)
///  Creates thumbnails, wires up click handlers, viewer panel with
///  ZoomPanViewer for images/mermaid and VideoTimeline for videos.
extern "js" fn init_media_sidebar_js() -> Unit =
  #|() => {
  #|  var mdLayout=document.querySelector('.md-layout');if(!mdLayout)return;
  #|  var preview=mdLayout.querySelector('.md-preview');if(!preview)return;
  #|  var sidebar=document.getElementById('media-sidebar');
  #|  var thumbsC=document.getElementById('media-sidebar-thumbs');
  #|  var viewerP=document.getElementById('media-sidebar-viewer');
  #|  var toggleBtn=document.getElementById('media-sidebar-toggle');
  #|  var toggleCount=document.getElementById('media-toggle-count');
  #|  if(!sidebar||!thumbsC||!viewerP||!toggleBtn)return;
  #|  function cloneSvg(s,sfx){var c=s.cloneNode(true);var oid=s.getAttribute('id');if(oid){var nid=oid+'-sb-'+sfx;c.setAttribute('id',nid);var st=c.querySelector('style');if(st&&st.textContent)st.textContent=st.textContent.split(oid).join(nid);}if(!c.getAttribute('viewBox')&&c.getAttribute('width')&&c.getAttribute('height'))c.setAttribute('viewBox','0 0 '+parseFloat(c.getAttribute('width'))+' '+parseFloat(c.getAttribute('height')));c.removeAttribute('width');c.removeAttribute('height');return c;}
  #|  var items=[],ic=0,vc=0,mc=0;
  #|  var allM=Array.from(preview.querySelectorAll('img,video.video-preview,.mermaid-container'));
  #|  allM.forEach(function(el){
  #|    if(el.tagName==='IMG'){ic++;items.push({type:'image',element:el,src:el.src,alt:el.alt||'Image '+ic});}
  #|    else if(el.tagName==='VIDEO'&&el.classList.contains('video-preview')){var s=el.getAttribute('src');if(s&&/\.(mp4|mov|webm|avi|mkv|m4v|ogv)$/i.test(s)){vc++;items.push({type:'video',element:el,src:s,alt:el.getAttribute('title')||'Video '+vc});}}
  #|    else if(el.classList.contains('mermaid-container')){mc++;var svg=el.querySelector('svg');items.push({type:'mermaid',element:el,svg:svg,alt:'Diagram '+mc});}
  #|  });
  #|  if(items.length===0)return;
  #|  toggleBtn.style.display='';toggleBtn.classList.add('has-media');
  #|  if(toggleCount)toggleCount.textContent=String(items.length);
  #|  sidebar.classList.remove('hidden');
  #|  var activeIdx=-1,sbVisible=true,sbCleanup=null,sbPendingFit=null;
  #|  items.forEach(function(item,idx){
  #|    var th=document.createElement('div');th.className='media-sidebar-thumb';th.setAttribute('data-media-index',String(idx));th.tabIndex=0;th.setAttribute('aria-label',item.alt);
  #|    var badge=document.createElement('span');badge.className='media-sidebar-thumb-index';badge.textContent=String(idx+1);th.appendChild(badge);
  #|    if(item.type==='image'){var im=document.createElement('img');im.src=item.src;im.alt=item.alt;im.loading='lazy';th.appendChild(im);}
  #|    else if(item.type==='video'){var vw=document.createElement('div');vw.className='media-sidebar-thumb-video';var vi=document.createElement('video');vi.src=item.src+'#t=0.1';vi.preload='metadata';vi.muted=true;vi.addEventListener('loadeddata',function(){if(vi.currentTime<0.01)vi.currentTime=0.1;});vw.appendChild(vi);th.appendChild(vw);}
  #|    else if(item.type==='mermaid'){var mw=document.createElement('div');mw.className='media-sidebar-thumb-mermaid';if(item.svg){var cl=cloneSvg(item.svg,'thumb-'+idx);cl.setAttribute('preserveAspectRatio','xMidYMid meet');cl.style.width='100%';cl.style.height='100%';mw.appendChild(cl);}else{mw.textContent='Diagram';mw.style.fontSize='9px';mw.style.color='var(--muted)';}th.appendChild(mw);}
  #|    th.addEventListener('click',function(e){e.stopPropagation();if(activeIdx===idx)closeViewer();else openViewer(idx);});
  #|    thumbsC.appendChild(th);
  #|  });
  #|  function openViewer(idx){
  #|    if(idx<0||idx>=items.length)return;
  #|    if(sbCleanup){sbCleanup();sbCleanup=null;}
  #|    var item=items[idx];activeIdx=idx;
  #|    var allTh=thumbsC.querySelectorAll('.media-sidebar-thumb');allTh.forEach(function(t){t.classList.remove('active');});allTh[idx].classList.add('active');
  #|    allTh[idx].scrollIntoView({block:'nearest',behavior:'smooth'});
  #|    var mdRight=mdLayout.querySelector('.md-right');if(mdRight)mdRight.style.display='none';
  #|    viewerP.innerHTML='';
  #|    var closeBtn=document.createElement('button');closeBtn.className='media-sidebar-viewer-close';closeBtn.innerHTML='\u2715';closeBtn.title='Close viewer (ESC)';closeBtn.addEventListener('click',function(e){e.stopPropagation();closeViewer();});viewerP.appendChild(closeBtn);
  #|    var content=document.createElement('div');content.className='media-sidebar-viewer-content';
  #|    if(item.type==='image'){
  #|      var imgVp=document.createElement('div');imgVp.style.cssText='height:calc(100vh - 140px);overflow:hidden;position:relative;cursor:grab;';
  #|      var imgWr=document.createElement('div');imgWr.style.cssText='position:absolute;left:0;top:0;transform-origin:0 0;';
  #|      var img=document.createElement('img');img.src=item.src;img.alt=item.alt;img.draggable=false;imgWr.appendChild(img);imgVp.appendChild(imgWr);
  #|      var zi=document.createElement('div');zi.className='sidebar-zoom-indicator';zi.textContent='100%';imgVp.appendChild(zi);
  #|      content.appendChild(imgVp);imgWr.style.visibility='hidden';
  #|      var imgV=null,ziTO=null;
  #|      function initIV(){if(!img.naturalWidth||!img.naturalHeight)return;if(imgV)imgV.destroy();
  #|        img.style.width=img.naturalWidth+'px';img.style.height=img.naturalHeight+'px';
  #|        imgV=window.__createZPV(imgVp,imgWr,img.naturalWidth,img.naturalHeight,null,false,null,184,134,8,0.1,20,true);
  #|        imgV.fitToViewport();imgWr.style.visibility='visible';
  #|        function onUpd(){zi.textContent=Math.round(imgV.getZoom()*100)+'%';zi.classList.remove('hidden');clearTimeout(ziTO);ziTO=setTimeout(function(){zi.classList.add('hidden');},1500);}
  #|        var origUT=imgV.updateTransform;imgV.updateTransform=function(){origUT();onUpd();};
  #|      }
  #|      img.addEventListener('load',function(){if(viewerP.offsetWidth>100)initIV();});
  #|      if(img.complete&&img.naturalWidth)img.naturalWidth;
  #|      sbPendingFit=function(){initIV();};
  #|      sbCleanup=function(){if(imgV)imgV.destroy();clearTimeout(ziTO);};
  #|    }else if(item.type==='video'){
  #|      var vc2=document.createElement('div');vc2.className='sidebar-video-container';
  #|      var vid=document.createElement('video');vid.src=item.src;vid.controls=true;vid.preload='metadata';vc2.appendChild(vid);content.appendChild(vc2);
  #|      var tl=window.__createVTL(vid,vc2,item.src,0.01,0.1,false);
  #|      var sbVidKey=function(e){if(activeIdx===-1)return;var fi=document.getElementById('video-fullscreen');var ii=document.getElementById('image-fullscreen');if((fi&&fi.classList.contains('visible'))||(ii&&ii.classList.contains('visible')))return;if(items[activeIdx].type!=='video')return;if(e.key==='ArrowLeft'||e.key==='j'){e.preventDefault();e.stopPropagation();if(tl)tl.navigate(-1);}else if(e.key==='ArrowRight'||e.key==='l'){e.preventDefault();e.stopPropagation();if(tl)tl.navigate(1);}else if(e.key===' '||e.key==='k'){e.preventDefault();e.stopPropagation();if(vid.paused)vid.play();else vid.pause();}};
  #|      document.addEventListener('keydown',sbVidKey,true);
  #|      var settingsBtn=document.createElement('button');settingsBtn.className='sidebar-settings-btn';settingsBtn.textContent='\u2699\uFE0F';settingsBtn.title='Video settings';settingsBtn.style.cssText='position:absolute;top:8px;right:8px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 8px;cursor:pointer;font-size:14px;z-index:5;';
  #|      var settingsPanel=document.createElement('div');settingsPanel.className='sidebar-settings-panel';settingsPanel.style.cssText='display:none;position:absolute;top:36px;right:8px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.15);min-width:200px;';
  #|      var sceneLevels=[{l:'少なめ',v:0.3},{l:'やや少',v:0.1},{l:'標準',v:0.01},{l:'やや多',v:0.005},{l:'多め',v:0.001}];
  #|      var stabLevels=[{l:'弱め',v:0.5},{l:'やや弱',v:0.2},{l:'標準',v:0.1},{l:'やや強',v:0.05},{l:'強め',v:0.02}];
  #|      var curScene=0.01,curStab=0.1;
  #|      function mkBtnGrp(label,levels,cur,cb){var g=document.createElement('div');g.style.marginBottom='8px';var lb=document.createElement('div');lb.textContent=label;lb.style.cssText='font-size:11px;color:var(--muted);margin-bottom:4px;';g.appendChild(lb);var row=document.createElement('div');row.style.cssText='display:flex;gap:4px;';levels.forEach(function(lv){var b=document.createElement('button');b.textContent=lv.l;b.style.cssText='padding:2px 6px;border:1px solid var(--border);border-radius:4px;font-size:10px;cursor:pointer;background:'+(lv.v===cur?'var(--primary)':'var(--surface)')+';color:'+(lv.v===cur?'white':'inherit');b.addEventListener('click',function(){curScene=label.includes('\u30B7\u30FC\u30F3')?lv.v:curScene;curStab=label.includes('\u5B89\u5B9A')?lv.v:curStab;cb(lv.v);row.querySelectorAll('button').forEach(function(bt){bt.style.background='var(--surface)';bt.style.color='inherit';});b.style.background='var(--primary)';b.style.color='white';});row.appendChild(b);});g.appendChild(row);return g;}
  #|      settingsPanel.appendChild(mkBtnGrp('シーン感度',sceneLevels,curScene,function(){if(tl)tl.destroy();tl=window.__createVTL(vid,vc2,item.src,curScene,curStab,false);}));
  #|      settingsPanel.appendChild(mkBtnGrp('安定化閾値',stabLevels,curStab,function(){if(tl)tl.destroy();tl=window.__createVTL(vid,vc2,item.src,curScene,curStab,false);}));
  #|      settingsBtn.addEventListener('click',function(e){e.stopPropagation();settingsPanel.style.display=settingsPanel.style.display==='none'?'block':'none';});
  #|      vc2.style.position='relative';vc2.appendChild(settingsBtn);vc2.appendChild(settingsPanel);
  #|      sbCleanup=function(){document.removeEventListener('keydown',sbVidKey,true);if(tl)tl.destroy();vid.pause();};
  #|    }else if(item.type==='mermaid'){
  #|      var svgSrc=item.element.querySelector('svg')||item.svg;
  #|      if(!svgSrc){var ew=document.createElement('div');ew.className='viewer-mermaid-wrap';ew.textContent='Diagram not yet rendered';ew.style.color='var(--muted)';ew.style.padding='20px';content.appendChild(ew);}
  #|      else{
  #|        var vp=document.createElement('div');vp.className='sidebar-mermaid-viewport';vp.style.height='calc(100vh - 180px)';
  #|        var wr=document.createElement('div');wr.className='sidebar-mermaid-wrapper';
  #|        var vb=svgSrc.getAttribute('viewBox');var mNW,mNH;
  #|        if(vb){var pts=vb.split(/[\s,]+/);mNW=parseFloat(pts[2])||800;mNH=parseFloat(pts[3])||600;}
  #|        else{mNW=parseFloat(svgSrc.getAttribute('width'))||800;mNH=parseFloat(svgSrc.getAttribute('height'))||600;}
  #|        var cl2=cloneSvg(svgSrc,'viewer-'+idx);cl2.style.width=mNW+'px';cl2.style.height=mNH+'px';cl2.removeAttribute('preserveAspectRatio');
  #|        wr.style.visibility='hidden';wr.appendChild(cl2);vp.appendChild(wr);content.appendChild(vp);
  #|        var mV=window.__createZPV(vp,wr,mNW,mNH,null,false,null,128,88,6,0.1,10,true);
  #|        sbPendingFit=function(){mV.fitToViewport();wr.style.visibility='visible';};
  #|        sbCleanup=function(){mV.destroy();};
  #|      }
  #|    }
  #|    var lbl=document.createElement('div');lbl.className='media-sidebar-viewer-label';lbl.textContent=item.alt;content.appendChild(lbl);
  #|    viewerP.appendChild(content);viewerP.classList.add('open');
  #|    if(sbPendingFit){var onTE=function(e){if(e.propertyName==='width'){viewerP.removeEventListener('transitionend',onTE);sbPendingFit();sbPendingFit=null;}};viewerP.addEventListener('transitionend',onTE);setTimeout(function(){if(sbPendingFit){viewerP.removeEventListener('transitionend',onTE);sbPendingFit();sbPendingFit=null;}},400);}
  #|  }
  #|  function closeViewer(){
  #|    if(sbCleanup){sbCleanup();sbCleanup=null;}activeIdx=-1;viewerP.classList.remove('open');
  #|    var allTh=thumbsC.querySelectorAll('.media-sidebar-thumb');allTh.forEach(function(t){t.classList.remove('active');});
  #|    var mdRight=mdLayout.querySelector('.md-right');if(mdRight)mdRight.style.display='';
  #|    setTimeout(function(){if(activeIdx===-1)viewerP.innerHTML='';},350);
  #|  }
  #|  function navThumbs(d){var total=items.length;if(total===0)return;var ni=activeIdx===-1?(d>0?0:total-1):activeIdx+d;if(ni<0)ni=0;if(ni>=total)ni=total-1;if(ni!==activeIdx)openViewer(ni);}
  #|  toggleBtn.addEventListener('click',function(){sbVisible=!sbVisible;if(sbVisible)sidebar.classList.remove('hidden');else{sidebar.classList.add('hidden');closeViewer();}});
  #|  document.addEventListener('keydown',function(e){
  #|    if(!sbVisible)return;
  #|    var io=document.getElementById('image-fullscreen'),vo=document.getElementById('video-fullscreen'),mo=document.getElementById('mermaid-fullscreen');
  #|    if(io&&io.classList.contains('visible'))return;if(vo&&vo.classList.contains('visible'))return;if(mo&&mo.classList.contains('visible'))return;
  #|    var ac=document.activeElement;if(ac&&(ac.tagName==='INPUT'||ac.tagName==='TEXTAREA'))return;
  #|    if(e.key==='Escape'&&activeIdx!==-1){e.preventDefault();closeViewer();return;}
  #|    var tf=ac&&ac.classList.contains('media-sidebar-thumb');
  #|    if(tf||activeIdx!==-1){if(e.key==='ArrowUp'){e.preventDefault();navThumbs(-1);}else if(e.key==='ArrowDown'){e.preventDefault();navThumbs(1);}}
  #|  });
  #|  // Watch for late-rendered Mermaid diagrams
  #|  function updateMermaidThumbs(){items.forEach(function(item,idx){if(item.type!=='mermaid')return;var svg=item.element.querySelector('svg');if(!svg)return;if(!svg.querySelector('.node,.cluster,.edgePath,.label,path,rect,circle,text'))return;if(item.svg===svg&&item._tu)return;item.svg=svg;item._tu=true;var th=thumbsC.querySelector('[data-media-index="'+idx+'"]');if(th){var mw=th.querySelector('.media-sidebar-thumb-mermaid');if(mw){mw.innerHTML='';var cl=cloneSvg(svg,'thumb-'+idx);cl.setAttribute('preserveAspectRatio','xMidYMid meet');cl.style.width='100%';cl.style.height='100%';mw.appendChild(cl);}}});}
  #|  var mo2=new MutationObserver(function(){updateMermaidThumbs();});
  #|  mo2.observe(preview,{childList:true,subtree:true,attributes:true});
  #|  setTimeout(updateMermaidThumbs,1000);setTimeout(updateMermaidThumbs,3000);
  #|}

///| Expose ZoomPanViewer creator to JS global for media sidebar use
extern "js" fn expose_zpv_creator() -> Unit =
  #|() => {
  #|  // Re-export createZoomPanViewer as window.__createZPV for sidebar JS
  #|  // This is the same function from dom.mbt's create_zoom_pan_viewer FFI
  #|  window.__createZPV = function(vp,wr,nw,nh,zi,hm,mv,mw,mh,mp,zmin,zmax,uc) {
  #|    var cz=1,iz=1,px=0,py=0,ip=false,sx=0,sy=0;
  #|    function ut(){wr.style.transform='translate('+px+'px,'+py+'px) scale('+cz+')';if(zi)zi.textContent=Math.round(cz*100)+'%';}
  #|    function ftv(){var vpW=vp.clientWidth,vpH=vp.clientHeight;cz=Math.min(vpW/nw,vpH/nh);iz=cz;var sw=nw*cz,sh=nh*cz;px=(vpW-sw)/2;py=(vpH-sh)/2;ut();}
  #|    function za(f,cx,cy){var old=cz;cz=Math.max(zmin,Math.min(zmax,cz*f));var r=vp.getBoundingClientRect();var mx=cx-r.left,my=cy-r.top,rt=cz/old;px=mx-(mx-px)*rt;py=my-(my-py)*rt;ut();}
  #|    function zc(f){var r=vp.getBoundingClientRect();za(f,r.left+r.width/2,r.top+r.height/2);}
  #|    function omd(e){if(e.button!==0)return;ip=true;sx=e.clientX-px;sy=e.clientY-py;vp.style.cursor='grabbing';e.preventDefault();}
  #|    function omm(e){if(!ip)return;px=e.clientX-sx;py=e.clientY-sy;ut();}
  #|    function omu(){if(ip){ip=false;vp.style.cursor='grab';}}
  #|    vp.addEventListener('mousedown',omd);document.addEventListener('mousemove',omm);document.addEventListener('mouseup',omu);
  #|    function ow(e){e.preventDefault();if(uc){if(e.ctrlKey||e.shiftKey)za(e.deltaY>0?0.9:1.1,e.clientX,e.clientY);else{px-=e.deltaX;py-=e.deltaY;ut();}}else za(e.deltaY>0?0.9:1.1,e.clientX,e.clientY);}
  #|    vp.addEventListener('wheel',ow,{passive:false});
  #|    vp.addEventListener('dblclick',function(){ftv();});
  #|    var ld=0,lc={x:0,y:0};
  #|    function td(t){var dx=t[0].clientX-t[1].clientX,dy=t[0].clientY-t[1].clientY;return Math.sqrt(dx*dx+dy*dy);}
  #|    function tc(t){return{x:(t[0].clientX+t[1].clientX)/2,y:(t[0].clientY+t[1].clientY)/2};}
  #|    function ots(e){if(e.touches.length===2){e.preventDefault();ld=td(e.touches);lc=tc(e.touches);}}
  #|    function otm(e){if(e.touches.length===2){e.preventDefault();var cd=td(e.touches),cc=tc(e.touches);if(ld>0){var s=cd/ld;if(Math.abs(s-1)>0.01){za(s,cc.x,cc.y);ld=cd;}}px+=cc.x-lc.x;py+=cc.y-lc.y;ut();lc=cc;}}
  #|    function ote(){ld=0;}
  #|    vp.addEventListener('touchstart',ots,{passive:false});vp.addEventListener('touchmove',otm,{passive:false});vp.addEventListener('touchend',ote);
  #|    return{destroy:function(){vp.removeEventListener('mousedown',omd);document.removeEventListener('mousemove',omm);document.removeEventListener('mouseup',omu);vp.removeEventListener('wheel',ow);vp.removeEventListener('touchstart',ots);vp.removeEventListener('touchmove',otm);vp.removeEventListener('touchend',ote);},fitToViewport:ftv,zoomIn:function(){zc(1.25);},zoomOut:function(){zc(0.8);},getZoom:function(){return cz;},updateTransform:ut};
  #|  };
  #|  // Re-export VideoTimeline creator
  #|  window.__createVTL = function(videoEl,container,videoPath,sceneThreshold,stabThreshold,preventBubble){
  #|    var thumbs=[],es=null;
  #|    function fmtTime(s){var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec;}
  #|    var tl=document.createElement('div');tl.className='video-timeline';
  #|    if(preventBubble)tl.addEventListener('click',function(e){e.stopPropagation();});
  #|    var loading=document.createElement('div');loading.className='timeline-loading';loading.textContent='Loading timeline...';
  #|    tl.appendChild(loading);container.appendChild(tl);
  #|    var ep=encodeURIComponent(videoPath);
  #|    es=new EventSource('/video-timeline?path='+ep+'&scene='+sceneThreshold+'&stabilization='+stabThreshold);
  #|    es.onmessage=function(e){
  #|      var d=JSON.parse(e.data);
  #|      if(d.type==='thumbnail'){var l=tl.querySelector('.timeline-loading');if(l)l.remove();var w=document.createElement('div');w.className='timeline-thumb-wrapper';var t=document.createElement('img');t.className='timeline-thumb';t.src=d.data;t.dataset.time=d.time;t.title='Jump to '+fmtTime(d.time);t.addEventListener('click',function(){videoEl.currentTime=parseFloat(t.dataset.time);});var lb=document.createElement('span');lb.className='timeline-time';lb.textContent=fmtTime(d.time);w.appendChild(t);w.appendChild(lb);tl.appendChild(w);thumbs.push({element:t,time:d.time});}
  #|      else if(d.type==='complete'){es.close();es=null;if(thumbs.length===0){var cl=tl.querySelector('.timeline-loading');if(cl)cl.textContent='No scene changes detected';}}
  #|      else if(d.type==='error'){es.close();es=null;tl.remove();}
  #|    };
  #|    es.onerror=function(){es.close();es=null;tl.remove();};
  #|    function onTU(){if(thumbs.length===0)return;var ct=videoEl.currentTime,ci=0,cd=Infinity;for(var i=0;i<thumbs.length;i++){var df=Math.abs(thumbs[i].time-ct);if(df<cd){cd=df;ci=i;}}thumbs.forEach(function(t,idx){if(idx===ci){t.element.classList.add('active');t.element.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});}else{t.element.classList.remove('active');}});}
  #|    videoEl.addEventListener('timeupdate',onTU);
  #|    return{destroy:function(){if(es){es.close();es=null;}videoEl.removeEventListener('timeupdate',onTU);thumbs=[];tl.remove();},navigate:function(dir){if(thumbs.length===0)return;var ct=videoEl.currentTime,ci=0,cd=Infinity;for(var i=0;i<thumbs.length;i++){var df=Math.abs(thumbs[i].time-ct);if(df<cd){cd=df;ci=i;}}var ti=ci+dir;if(ti>=0&&ti<thumbs.length)videoEl.currentTime=thumbs[ti].time;}};
  #|  };
  #|}

///| Initialize column resizers and filter menu (cli.cjs L6686-6720, L6428-6496)
extern "js" fn init_csv_resizers_and_filters() -> Unit =
  #|() => {
  #|  var table=document.getElementById('csv-table');if(!table)return;
  #|  var tbody=document.getElementById('tbody');if(!tbody)return;
  #|  var filterMenu=document.getElementById('filter-menu');
  #|  var rowMenu=document.getElementById('row-menu');
  #|  var freezeColCheck=document.getElementById('freeze-col-check');
  #|  var freezeRowCheck=document.getElementById('freeze-row-check');
  #|  var MIN_COL_WIDTH=40,MAX_COL_WIDTH=800,ROW_HEADER_WIDTH=50;
  #|  var colWidths=[],filters={},filterTargetCol=null,freezeCols=0,freezeRows=0;
  #|  var ths=table.querySelectorAll('thead th[data-col]');
  #|  ths.forEach(function(th){colWidths.push(th.offsetWidth||100);});
  #|  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  #|  function syncColgroup(){
  #|    var cg=table.querySelector('colgroup');
  #|    if(!cg){cg=document.createElement('colgroup');table.prepend(cg);}
  #|    cg.innerHTML='';colWidths.forEach(function(w){var c=document.createElement('col');c.style.width=w+'px';cg.appendChild(c);});
  #|  }
  #|  function updateStickyOffsets(){
  #|    freezeCols=Number(freezeCols||0);freezeRows=Number(freezeRows||0);
  #|    var headCells=document.querySelectorAll('thead th[data-col]');
  #|    var hLeft=ROW_HEADER_WIDTH;
  #|    headCells.forEach(function(th,idx){if(idx<freezeCols){th.classList.add('freeze');th.style.left=hLeft+'px';hLeft+=colWidths[idx];}else{th.classList.remove('freeze');th.style.left=null;}});
  #|  }
  #|  function updateFilterIndicators(){
  #|    ths.forEach(function(th){var ci=Number(th.dataset.col);if(filters[ci])th.classList.add('filtered');else th.classList.remove('filtered');});
  #|  }
  #|  function applyFilters(){
  #|    var rows=tbody.querySelectorAll('tr');
  #|    rows.forEach(function(tr,rIdx){
  #|      var visible=Object.entries(filters).every(function(e){var c=e[0],fn=e[1];var val=(window.__DATA__&&window.__DATA__[rIdx]?window.__DATA__[rIdx][Number(c)]:'')||'';try{return fn(val);}catch(_){return true;}});
  #|      tr.style.display=visible?'':'none';
  #|    });
  #|    updateStickyOffsets();updateFilterIndicators();
  #|  }
  #|  function closeFilterMenu(){if(filterMenu)filterMenu.style.display='none';filterTargetCol=null;}
  #|  function openFilterMenu(col,rect){
  #|    if(!filterMenu)return;filterTargetCol=col;
  #|    var m=8,vw=window.innerWidth,mw=200,mh=260;
  #|    var left=window.scrollX+clamp(rect.left,m,vw-mw-m);
  #|    var top=window.scrollY+rect.bottom+m;
  #|    filterMenu.style.left=left+'px';filterMenu.style.top=top+'px';filterMenu.style.display='block';
  #|    if(freezeColCheck)freezeColCheck.checked=(freezeCols===col+1);
  #|  }
  #|  if(filterMenu)filterMenu.addEventListener('click',function(e){
  #|    var action=e.target.dataset.action;if(!action||filterTargetCol==null)return;
  #|    var col=filterTargetCol;
  #|    if(action==='not-empty')filters[col]=function(v){return(v||'').trim()!=='';};
  #|    else if(action==='empty')filters[col]=function(v){return(v||'').trim()==='';};
  #|    else if(action==='contains'||action==='not-contains'){
  #|      var kw=prompt('Enter text to filter by');if(kw==null||kw===''){closeFilterMenu();return;}
  #|      var lower=kw.toLowerCase();
  #|      if(action==='contains')filters[col]=function(v){return(v||'').toLowerCase().includes(lower);};
  #|      else filters[col]=function(v){return!(v||'').toLowerCase().includes(lower);};
  #|    }else if(action==='reset')delete filters[col];
  #|    closeFilterMenu();applyFilters();
  #|  });
  #|  if(freezeColCheck)freezeColCheck.addEventListener('change',function(){
  #|    if(filterTargetCol==null)return;freezeCols=freezeColCheck.checked?filterTargetCol+1:0;updateStickyOffsets();
  #|  });
  #|  document.addEventListener('click',function(e){if(filterMenu&&filterMenu.style.display==='block'&&!filterMenu.contains(e.target))closeFilterMenu();});
  #|  // Column resize
  #|  function startResize(colIdx,event){
  #|    event.preventDefault();var startX=event.clientX,startW=colWidths[colIdx];
  #|    function onMove(e){colWidths[colIdx]=clamp(startW+(e.clientX-startX),MIN_COL_WIDTH,MAX_COL_WIDTH);syncColgroup();updateStickyOffsets();}
  #|    function onUp(){window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);}
  #|    window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp);
  #|  }
  #|  document.querySelectorAll('.resizer').forEach(function(r){
  #|    r.addEventListener('pointerdown',function(e){e.stopPropagation();startResize(Number(r.dataset.col),e);});
  #|  });
  #|  document.querySelectorAll('thead th .th-inner').forEach(function(h){
  #|    h.addEventListener('click',function(e){var col=Number(h.parentElement.dataset.col);var rect=h.getBoundingClientRect();openFilterMenu(col,rect);e.stopPropagation();});
  #|  });
  #|}

///| Toggle highlight.js theme (dark/light stylesheets)
extern "js" fn toggle_hljs_theme(theme : String) -> Unit =
  #|(theme) => {
  #|  var dark = document.getElementById('hljs-theme-dark');
  #|  var light = document.getElementById('hljs-theme-light');
  #|  if (theme === 'light') {
  #|    if (dark) dark.disabled = true;
  #|    if (light) light.disabled = false;
  #|  } else {
  #|    if (dark) dark.disabled = false;
  #|    if (light) light.disabled = true;
  #|  }
  #|}

///| Create img element and append to parent
extern "js" fn create_timeline_thumb(parent : Element, src : String, time : String) -> Unit =
  #|(parent, src, time) => {
  #|  const img = document.createElement("img");
  #|  img.src = src;
  #|  img.className = "timeline-thumb";
  #|  img.dataset.time = time;
  #|  img.style.maxHeight = "60px";
  #|  parent.appendChild(img);
  #|}
