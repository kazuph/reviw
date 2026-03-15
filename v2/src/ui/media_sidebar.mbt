///| MediaSidebar — Pure MoonBit implementation
///  Replaces init_media_sidebar_js with native MoonBit logic
///  Features: thumbnail gallery, viewer panel, ZoomPanViewer for images/mermaid, VideoTimeline for videos

///| Media item types
enum MediaType {
  Image
  Video
  Mermaid
}

///| Media item data
struct MediaItem {
  type_ : MediaType
  element : Element
  src : String
  alt : String
  svg : Element  // For mermaid type
}

///| MediaSidebar state
struct MediaSidebarState {
  md_layout : Element
  preview : Element
  sidebar : Element
  thumbs_container : Element
  viewer_panel : Element
  mut toggle_btn : Element
  mut toggle_count : Element
  // Items and state
  items : Array[MediaItem]
  mut active_idx : Int
  mut is_visible : Bool
  mut current_cleanup : () -> Unit
  mut pending_fit : (() -> Unit)?
  // ZoomPanViewer and VideoTimeline handles
  mut current_zpv : ZPVState?
  mut current_vtl : VTLState?
  // Event handles
  handles : Array[ListenerHandle]
  // Mutation observer for mermaid updates
  mut observer_handle : ListenerHandle?
}

///| Global sidebar instance
let global_sidebar : Ref[MediaSidebarState?] = Ref::new(None)

///| Initialize media sidebar for the current page
pub fn init_media_sidebar() -> Unit {
  // Check if already initialized
  if global_sidebar.val.is_some() { return }

  // Find required elements
  let md_layout = query(".md-layout")
  let preview = query_in(md_layout, ".md-preview")
  let sidebar = query("#media-sidebar")
  let thumbs_c = query("#media-sidebar-thumbs")
  let viewer_p = query("#media-sidebar-viewer")
  let toggle_btn = query("#media-sidebar-toggle")
  let toggle_count = query("#media-toggle-count")

  // Check if all required elements exist
  if is_null(md_layout) || is_null(preview) ||
     is_null(sidebar) || is_null(thumbs_c) ||
     is_null(viewer_p) || is_null(toggle_btn) {
    return
  }

  // Collect media items from preview
  let items = collect_media_items(preview)
  if items.is_empty() { return }

  // Create state
  let state = MediaSidebarState::{
    md_layout,
    preview,
    sidebar,
    thumbs_container: thumbs_c,
    viewer_panel: viewer_p,
    toggle_btn,
    toggle_count,
    items,
    active_idx: -1,
    is_visible: true,
    current_cleanup: fn() {},
    pending_fit: None,
    current_zpv: None,
    current_vtl: None,
    handles: [],
    observer_handle: None,
  }

  // Show toggle button and sidebar
  set_style(toggle_btn, "display", "")
  add_class(toggle_btn, "has-media")
  if not(is_null(toggle_count)) {
    set_text_content(toggle_count, items.length().to_string())
  }
  remove_class(sidebar, "hidden")

  // Create thumbnails
  create_thumbnails(state)

  // Setup toggle button
  let h1 = on_with_handle(toggle_btn, "click", fn(e) {
    toggle_sidebar(state)
  })
  state.handles.push(h1)

  // Setup keyboard navigation
  setup_keyboard_navigation(state)

  // Setup mermaid mutation observer
  setup_mermaid_observer(state)

  // Store global instance
  global_sidebar.val = Some(state)
}

///| Collect media items from preview element
fn collect_media_items(preview : Element) -> Array[MediaItem] {
  let items : Array[MediaItem] = []
  let mut img_count = 0
  let mut video_count = 0
  let mut mermaid_count = 0

  // Find all images, videos, and mermaid containers
  let all_media = query_all_in(preview, "img,video.video-preview,.mermaid-container")

  all_media.each(fn(el) {
    let tag = get_tag_name(el)
    let has_video_class = has_class(el, "video-preview")

    if tag == "IMG" {
      img_count = img_count + 1
      let src = get_src(el)
      let alt = get_attribute(el, "alt")
      let alt_text = if alt == "" { "Image " + img_count.to_string() } else { alt }
      items.push(MediaItem::{
        type_: Image,
        element: el,
        src,
        alt: alt_text,
        svg: null_element(),
      })
    } else if tag == "VIDEO" && has_video_class {
      let src = get_attribute(el, "src")
      let has_video_ext = src.to_lower().ends_with(".mp4") ||
                          src.to_lower().ends_with(".mov") ||
                          src.to_lower().ends_with(".webm") ||
                          src.to_lower().ends_with(".avi") ||
                          src.to_lower().ends_with(".mkv") ||
                          src.to_lower().ends_with(".m4v") ||
                          src.to_lower().ends_with(".ogv")

      if has_video_ext {
        video_count = video_count + 1
        let title = get_attribute(el, "title")
        let alt_text = if title == "" { "Video " + video_count.to_string() } else { title }
        items.push(MediaItem::{
          type_: Video,
          element: el,
          src,
          alt: alt_text,
          svg: null_element(),
        })
      }
    } else if has_class(el, "mermaid-container") {
      mermaid_count = mermaid_count + 1
      let svg = query_in(el, "svg")
      items.push(MediaItem::{
        type_: Mermaid,
        element: el,
        src: "",
        alt: "Diagram " + mermaid_count.to_string(),
        svg,
      })
    }
  })

  items
}

///| Create thumbnail elements
fn create_thumbnails(state : MediaSidebarState) -> Unit {
  state.items.eachi(fn(idx, item) {
    let thumb = create_element("div")
    set_class_name(thumb, "media-sidebar-thumb")
    set_attribute(thumb, "data-media-index", idx.to_string())
    set_tabindex(thumb, 0)
    set_attribute(thumb, "role", "button")
    set_aria_label(thumb, item.alt)

    // Index badge
    let badge = create_element("span")
    set_class_name(badge, "media-sidebar-thumb-index")
    set_text_content(badge, (idx + 1).to_string())
    append_child(thumb, badge)

    // Thumbnail content based on type
    match item.type_ {
      Image => {
        let img = create_element("img")
        set_attribute(img, "src", item.src)
        set_attribute(img, "alt", item.alt)
        set_attribute(img, "loading", "lazy")
        append_child(thumb, img)
      }
      Video => {
        let wrapper = create_element("div")
        set_class_name(wrapper, "media-sidebar-thumb-video")
        let vid = create_element("video")
        set_attribute(vid, "src", item.src + "#t=0.1")
        set_attribute(vid, "preload", "metadata")
        set_attribute(vid, "muted", "true")

        // Seek to 0.1s on load
        let h = on_with_handle(vid, "loadeddata", fn(e) {
          if video_get_current_time(vid) < 0.01 {
            video_set_current_time(vid, 0.1)
          }
        })
        state.handles.push(h)

        append_child(wrapper, vid)
        append_child(thumb, wrapper)
      }
      Mermaid => {
        let wrapper = create_element("div")
        set_class_name(wrapper, "media-sidebar-thumb-mermaid")

        if not(is_null(item.svg)) {
          let cloned = clone_svg_for_thumbnail(item.svg, idx)
          append_child(wrapper, cloned)
        } else {
          set_text_content(wrapper, "Diagram")
          set_style(wrapper, "font-size", "9px")
          set_style(wrapper, "color", "var(--muted)")
        }

        append_child(thumb, wrapper)
      }
    }

    // Click handler
    let h = on_with_handle(thumb, "click", fn(e) {
      stop_propagation(e)
      if state.active_idx == idx {
        close_viewer(state)
      } else {
        open_viewer(state, idx)
      }
    })
    state.handles.push(h)

    let h_key = on_with_handle(thumb, "keydown", fn(e) {
      let key = event_key(e)
      if key == "Enter" || key == " " {
        prevent_default(e)
        stop_propagation(e)
        if state.active_idx == idx {
          close_viewer(state)
        } else {
          open_viewer(state, idx)
        }
      }
    })
    state.handles.push(h_key)

    append_child(state.thumbs_container, thumb)
  })
}

///| Clone SVG for thumbnail with proper ID handling
fn clone_svg_for_thumbnail(svg : Element, idx : Int) -> Element {
  let cloned = clone_node_deep(svg)
  let orig_id = get_attribute(svg, "id")

  if orig_id != "" {
    let new_id = orig_id + "-sb-thumb-" + idx.to_string()
    set_attribute(cloned, "id", new_id)

    // Update style references
    let style_el = query_in(cloned, "style")
    if not(is_null(style_el)) {
      let style_text = get_text_content(style_el)
      let updated = replace_all_text(style_text, orig_id, new_id)
      set_text_content(style_el, updated)
    }
  }

  // Set viewBox if needed
  if get_attribute(cloned, "viewBox") == "" {
    let w = get_attribute(cloned, "width")
    let h = get_attribute(cloned, "height")
    if w != "" && h != "" {
      set_attribute(cloned, "viewBox", "0 0 " + w + " " + h)
    }
  }

  remove_attribute(cloned, "width")
  remove_attribute(cloned, "height")
  set_attribute(cloned, "preserveAspectRatio", "xMidYMid meet")
  set_style(cloned, "width", "100%")
  set_style(cloned, "height", "100%")

  cloned
}

///| Open viewer for specific media item
fn open_viewer(state : MediaSidebarState, idx : Int) -> Unit {
  if idx < 0 || idx >= state.items.length() { return }

  // Cleanup previous viewer
  (state.current_cleanup)()
  state.current_cleanup = fn() {}

  let item = state.items[idx]
  state.active_idx = idx

  // Update thumbnail active state
  update_thumbnail_active_state(state, idx)

  // Hide md-right panel
  let md_right = query_in(state.md_layout, ".md-right")
  if not(is_null(md_right)) {
    set_style(md_right, "display", "none")
  }

  // Clear and setup viewer panel
  clear_children(state.viewer_panel)

  // Create close button
  let close_btn = create_element("button")
  set_class_name(close_btn, "media-sidebar-viewer-close")
  set_text_content(close_btn, "✕")
  set_attribute(close_btn, "title", "Close viewer (ESC)")
  let h1 = on_with_handle(close_btn, "click", fn(e) {
    stop_propagation(e)
    close_viewer(state)
  })
  state.handles.push(h1)
  append_child(state.viewer_panel, close_btn)

  // Create content container
  let content = create_element("div")
  set_class_name(content, "media-sidebar-viewer-content")

  // Render based on type
  match item.type_ {
    Image => render_image_viewer(state, content, item)
    Video => render_video_viewer(state, content, item)
    Mermaid => render_mermaid_viewer(state, content, item)
  }

  // Add label (skip for video — it's obvious from the player)
  if not(is_video_type(item.type_)) {
    let label = create_element("div")
    set_class_name(label, "media-sidebar-viewer-label")
    set_text_content(label, item.alt)
    append_child(content, label)
  }

  append_child(state.viewer_panel, content)
  add_class(state.viewer_panel, "open")

  // Execute pending fit after transition
  match state.pending_fit {
    Some(_) => {
    let on_transition = on_with_handle(state.viewer_panel, "transitionend", fn(e) {
      if event_property_name(e) == "width" {
        match state.pending_fit {
          Some(pending_fit) => {
            pending_fit()
            state.pending_fit = None
          }
          None => ()
        }
      }
    })
    state.handles.push(on_transition)

    ignore(set_timeout(fn() {
      match state.pending_fit {
        Some(pending_fit) => {
          pending_fit()
          state.pending_fit = None
        }
        None => ()
      }
    }, 400))
  }
    None => ()
  }
}

///| Render image viewer with ZoomPanViewer
fn render_image_viewer(state : MediaSidebarState, content : Element, item : MediaItem) -> Unit {
  // Create viewport
  let viewport = create_element("div")
  set_style(viewport, "height", "calc(100vh - 140px)")
  set_style(viewport, "overflow", "hidden")
  set_style(viewport, "position", "relative")
  set_style(viewport, "cursor", "grab")

  // Create wrapper
  let wrapper = create_element("div")
  set_style(wrapper, "position", "absolute")
  set_style(wrapper, "left", "0")
  set_style(wrapper, "top", "0")
  set_style(wrapper, "transform-origin", "0 0")

  // Create image
  let img = create_element("img")
  set_attribute(img, "src", item.src)
  set_attribute(img, "alt", item.alt)
  set_draggable(img, false)
  append_child(wrapper, img)
  append_child(viewport, wrapper)

  // Zoom indicator
  let zoom_info = create_element("div")
  set_class_name(zoom_info, "sidebar-zoom-indicator")
  set_text_content(zoom_info, "100%")
  append_child(viewport, zoom_info)

  append_child(content, viewport)

  // Hide wrapper until initialized
  set_style(wrapper, "visibility", "hidden")

  // Initialize on image load
  let mut zpv_ref : ZPVState? = None

  let init_zpv = fn() {
    let nw = get_natural_width(img)
    let nh = get_natural_height(img)
    if nw <= 0.0 || nh <= 0.0 { return }

    if zpv_ref.is_some() {
      destroy_zoom_pan_viewer(zpv_ref.unwrap())
    }

    set_style(img, "width", nw.to_string() + "px")
    set_style(img, "height", nh.to_string() + "px")

    let zpv = create_zoom_pan_viewer_moonbit(
      viewport,
      wrapper,
      nw,
      nh,
      zoom_info,
      false,
      null_element(),
      184.0,
      134.0,
      8.0,
      0.1,
      20.0,
      true,
    )

    zpv_ref = Some(zpv)
    state.current_zpv = zpv_ref

    // Wrap update transform to call our callback
    // Note: This would need a callback registration mechanism

    fit_to_viewport(zpv)
    set_style(wrapper, "visibility", "visible")
  }

  let h = on_with_handle(img, "load", fn(e) {
    if get_client_width(viewport) > 100 {
      init_zpv()
    }
  })
  state.handles.push(h)

  // If already loaded
  if get_natural_width(img) > 0.0 {
    state.pending_fit = Some(init_zpv)
  }

  // Cleanup function
  state.current_cleanup = fn() {
    if zpv_ref.is_some() {
      destroy_zoom_pan_viewer(zpv_ref.unwrap())
    }
  }
}

///| Render video viewer with VideoTimeline
fn render_video_viewer(state : MediaSidebarState, content : Element, item : MediaItem) -> Unit {
  // Create container
  let container = create_element("div")
  set_class_name(container, "sidebar-video-container")

  // Create video
  let vid = create_element("video")
  set_attribute(vid, "src", item.src)
  set_attribute(vid, "controls", "true")
  set_attribute(vid, "preload", "metadata")
  append_child(container, vid)

  append_child(content, container)

  // Create VideoTimeline
  let vtl = create_video_timeline_moonbit(
    vid,
    container,
    item.src,
    0.01,
    0.1,
    false,
  )
  state.current_vtl = Some(vtl)

  // Keyboard handler for video navigation
  let video_key_handler = fn(e : Event) {
    if state.active_idx == -1 { return }

    // Check if fullscreen overlays are visible
    let img_fs = query("#image-fullscreen")
    let vid_fs = query("#video-fullscreen")
    if (not(is_null(img_fs)) && has_class(img_fs, "visible")) ||
       (not(is_null(vid_fs)) && has_class(vid_fs, "visible")) {
      return
    }

    // Only handle if current item is video
    if not(is_video_type(state.items[state.active_idx].type_)) { return }

    let key = event_key(e)
    if key == "ArrowLeft" || key == "j" {
      prevent_default(e)
      stop_propagation(e)
      navigate(vtl, -1)
    } else if key == "ArrowRight" || key == "l" {
      prevent_default(e)
      stop_propagation(e)
      navigate(vtl, 1)
    } else if key == " " || key == "k" {
      prevent_default(e)
      stop_propagation(e)
      if video_is_paused(vid) {
        video_play(vid)
      } else {
        video_pause(vid)
      }
    }
  }

  let h = on_with_handle(query_body(), "keydown", video_key_handler, capture=true)
  state.handles.push(h)

  // Settings button — added to viewer panel (not container) so it sits next to close btn
  let settings_btn = create_element("button")
  set_class_name(settings_btn, "sidebar-viewer-settings-btn")
  set_text_content(settings_btn, "\u{2699}")
  set_attribute(settings_btn, "title", "Timeline settings")

  // Settings panel (uses video-settings-panel CSS from fullscreen for consistency)
  let settings_panel = create_element("div")
  set_class_name(settings_panel, "video-settings-panel")

  // Scene sensitivity
  let scene_title = create_element("h4")
  set_text_content(scene_title, "Scene Sensitivity")
  append_child(settings_panel, scene_title)

  let scene_levels = [
    ("少なめ", 0.3),
    ("やや少", 0.1),
    ("標準", 0.01),
    ("やや多", 0.005),
    ("多め", 0.001),
  ]

  let stab_levels = [
    ("弱め", 0.5),
    ("やや弱", 0.2),
    ("標準", 0.1),
    ("やや強", 0.05),
    ("強め", 0.02),
  ]

  let mut cur_scene = 0.01
  let mut cur_stab = 0.1

  let create_btn_group = fn(levels : Array[(String, Double)], cur_val : Double, on_change : (Double) -> Unit) {
    let row = create_element("div")
    set_class_name(row, "video-settings-buttons")

    levels.each(fn(level) {
      let (text, val) = level
      let btn = create_element("button")
      set_text_content(btn, text)

      if (val - cur_val).abs() < 0.001 {
        add_class(btn, "selected")
      }

      let h = on_with_handle(btn, "click", fn(e) {
        on_change(val)
      })
      state.handles.push(h)

      append_child(row, btn)
    })

    row
  }

  let on_scene_change = fn(new_val : Double) {
    cur_scene = new_val
    if state.current_vtl.is_some() {
      let new_vtl = recreate_timeline(state.current_vtl.unwrap(), cur_scene, cur_stab)
      state.current_vtl = Some(new_vtl)
    }
  }

  let scene_row = create_btn_group(scene_levels, cur_scene, on_scene_change)
  append_child(settings_panel, scene_row)

  // Stabilization threshold
  let stab_title = create_element("h4")
  set_text_content(stab_title, "Stabilization")
  append_child(settings_panel, stab_title)

  let on_stab_change = fn(new_val : Double) {
    cur_stab = new_val
    if state.current_vtl.is_some() {
      let new_vtl = recreate_timeline(state.current_vtl.unwrap(), cur_scene, cur_stab)
      state.current_vtl = Some(new_vtl)
    }
  }

  let stab_row = create_btn_group(stab_levels, cur_stab, on_stab_change)
  append_child(settings_panel, stab_row)

  // Settings toggle (uses "visible" class like v1)
  let h2 = on_with_handle(settings_btn, "click", fn(e) {
    stop_propagation(e)
    if has_class(settings_panel, "visible") {
      remove_class(settings_panel, "visible")
    } else {
      add_class(settings_panel, "visible")
    }
  })
  state.handles.push(h2)

  // Add to viewer panel (next to close button)
  append_child(state.viewer_panel, settings_btn)
  append_child(state.viewer_panel, settings_panel)

  // Cleanup function
  state.current_cleanup = fn() {
    if state.current_vtl.is_some() {
      destroy_video_timeline(state.current_vtl.unwrap())
    }
    video_pause(vid)
  }
}

///| Render mermaid viewer with ZoomPanViewer
fn render_mermaid_viewer(state : MediaSidebarState, content : Element, item : MediaItem) -> Unit {
  // Get source SVG
  let svg_src = if not(is_null(item.svg)) {
    item.svg
  } else {
    query_in(item.element, "svg")
  }

  if is_null(svg_src) {
    let error_wrap = create_element("div")
    set_class_name(error_wrap, "viewer-mermaid-wrap")
    set_text_content(error_wrap, "Diagram not yet rendered")
    set_style(error_wrap, "color", "var(--muted)")
    set_style(error_wrap, "padding", "20px")
    append_child(content, error_wrap)
    return
  }

  // Create viewport
  let controls = create_element("div")
  set_class_name(controls, "sidebar-mermaid-controls")

  let zoom_out_btn = create_element("button")
  set_text_content(zoom_out_btn, "−")
  set_attribute(zoom_out_btn, "title", "Zoom out")
  append_child(controls, zoom_out_btn)

  let zoom_info = create_element("span")
  set_class_name(zoom_info, "sidebar-zoom-info")
  append_child(controls, zoom_info)

  let zoom_in_btn = create_element("button")
  set_text_content(zoom_in_btn, "+")
  set_attribute(zoom_in_btn, "title", "Zoom in")
  append_child(controls, zoom_in_btn)

  let reset_btn = create_element("button")
  set_text_content(reset_btn, "Fit")
  set_attribute(reset_btn, "title", "Reset to fit")
  set_style(reset_btn, "margin-left", "auto")
  append_child(controls, reset_btn)

  set_style(controls, "opacity", "0")
  append_child(content, controls)

  let viewport = create_element("div")
  set_class_name(viewport, "sidebar-mermaid-viewport")
  set_style(viewport, "height", "calc(100vh - 180px)")

  // Create wrapper
  let wrapper = create_element("div")
  set_class_name(wrapper, "sidebar-mermaid-wrapper")

  let natural_size = get_svg_natural_size(svg_src)
  let m_w = natural_size[0]
  let m_h = natural_size[1]

  // Clone and setup SVG
  let cloned = clone_svg_for_viewer(svg_src, state.active_idx)
  set_style(cloned, "width", m_w.to_string() + "px")
  set_style(cloned, "height", m_h.to_string() + "px")
  remove_attribute(cloned, "preserveAspectRatio")

  set_style(wrapper, "visibility", "hidden")
  append_child(wrapper, cloned)
  append_child(viewport, wrapper)

  let minimap = create_element("div")
  set_class_name(minimap, "sidebar-minimap")

  let minimap_content = create_element("div")
  set_class_name(minimap_content, "sidebar-minimap-content")
  let minimap_svg = clone_svg_for_viewer(svg_src, state.active_idx)
  if get_attribute(minimap_svg, "viewBox") == "" {
    set_attribute(minimap_svg, "viewBox", "0 0 " + m_w.to_string() + " " + m_h.to_string())
  }
  remove_attribute(minimap_svg, "width")
  remove_attribute(minimap_svg, "height")
  set_attribute(minimap_svg, "preserveAspectRatio", "xMidYMid meet")
  set_style(minimap_svg, "width", "")
  set_style(minimap_svg, "height", "")
  append_child(minimap_content, minimap_svg)
  append_child(minimap, minimap_content)

  let minimap_viewport = create_element("div")
  set_class_name(minimap_viewport, "sidebar-minimap-viewport")
  append_child(minimap, minimap_viewport)

  append_child(viewport, minimap)
  append_child(content, viewport)

  // Create ZoomPanViewer
  let zpv = create_zoom_pan_viewer_moonbit(
    viewport,
    wrapper,
    m_w,
    m_h,
    zoom_info,
    true,
    minimap_viewport,
    128.0,
    88.0,
    6.0,
    0.1,
    10.0,
    true,
  )

  state.current_zpv = Some(zpv)

  let h_zoom_in = on_with_handle(zoom_in_btn, "click", fn(_e) { zoom_in(zpv) })
  let h_zoom_out = on_with_handle(zoom_out_btn, "click", fn(_e) { zoom_out(zpv) })
  let h_reset = on_with_handle(reset_btn, "click", fn(_e) { reset_view(zpv) })
  state.handles.push(h_zoom_in)
  state.handles.push(h_zoom_out)
  state.handles.push(h_reset)

  // Setup pending fit
  state.pending_fit = Some(fn() {
    fit_to_viewport(zpv)
    set_style(wrapper, "visibility", "visible")
    set_style(controls, "opacity", "")
  })

  // Cleanup function
  state.current_cleanup = fn() {
    destroy_zoom_pan_viewer(zpv)
  }
}

///| Clone SVG for viewer
fn clone_svg_for_viewer(svg : Element, idx : Int) -> Element {
  let cloned = clone_node_deep(svg)
  let orig_id = get_attribute(svg, "id")

  if orig_id != "" {
    let new_id = orig_id + "-sb-viewer-" + idx.to_string()
    set_attribute(cloned, "id", new_id)

    let style_el = query_in(cloned, "style")
    if not(is_null(style_el)) {
      let style_text = get_text_content(style_el)
      let updated = replace_all_text(style_text, orig_id, new_id)
      set_text_content(style_el, updated)
    }
  }

  cloned
}

///| Update thumbnail active state
fn update_thumbnail_active_state(state : MediaSidebarState, idx : Int) -> Unit {
  let all_thumbs = query_all_in(state.thumbs_container, ".media-sidebar-thumb")

  all_thumbs.eachi(fn(i, thumb) {
    if i == idx {
      add_class(thumb, "active")
      scroll_into_view_nearest(thumb)
    } else {
      remove_class(thumb, "active")
    }
  })
}

///| Close viewer panel
fn close_viewer(state : MediaSidebarState) -> Unit {
  (state.current_cleanup)()
  state.current_cleanup = fn() {}
  state.current_zpv = None
  state.current_vtl = None
  state.active_idx = -1

  remove_class(state.viewer_panel, "open")

  // Remove active from all thumbnails
  let all_thumbs = query_all_in(state.thumbs_container, ".media-sidebar-thumb")
  all_thumbs.each(fn(thumb) {
    remove_class(thumb, "active")
  })

  // Restore md-right panel
  let md_right = query_in(state.md_layout, ".md-right")
  if not(is_null(md_right)) {
    set_style(md_right, "display", "")
  }

  // Clear viewer after transition
  ignore(set_timeout(fn() {
    if state.active_idx == -1 {
      clear_children(state.viewer_panel)
    }
  }, 350))
}

///| Toggle sidebar visibility
fn toggle_sidebar(state : MediaSidebarState) -> Unit {
  state.is_visible = not(state.is_visible)

  if state.is_visible {
    remove_class(state.sidebar, "hidden")
  } else {
    add_class(state.sidebar, "hidden")
    close_viewer(state)
  }
}

///| Navigate thumbnails
fn navigate_thumbs(state : MediaSidebarState, direction : Int) -> Unit {
  let total = state.items.length()
  if total == 0 { return }

  let new_idx = if state.active_idx == -1 {
    if direction > 0 { 0 } else { total - 1 }
  } else {
    state.active_idx + direction
  }

  let clamped_idx = if new_idx < 0 {
    0
  } else if new_idx >= total {
    total - 1
  } else {
    new_idx
  }

  if clamped_idx != state.active_idx {
    open_viewer(state, clamped_idx)
  }
}

///| Setup keyboard navigation
fn setup_keyboard_navigation(state : MediaSidebarState) -> Unit {
  let h = on_with_handle(query_body(), "keydown", fn(e) {
    if not(state.is_visible) { return }

    // Check if fullscreen overlays are visible
    let img_fs = query("#image-fullscreen")
    let vid_fs = query("#video-fullscreen")
    let mermaid_fs = query("#mermaid-fullscreen")

    if (not(is_null(img_fs)) && has_class(img_fs, "visible")) ||
       (not(is_null(vid_fs)) && has_class(vid_fs, "visible")) ||
       (not(is_null(mermaid_fs)) && has_class(mermaid_fs, "visible")) {
      return
    }

    // Ignore if typing in input
    let active = get_active_element()
    let tag = get_tag_name(active)
    if tag == "INPUT" || tag == "TEXTAREA" {
      return
    }

    let key = event_key(e)

    // Escape to close viewer
    if key == "Escape" && state.active_idx != -1 {
      prevent_default(e)
      close_viewer(state)
      return
    }

    // Arrow navigation
    let focused_thumb = has_class(active, "media-sidebar-thumb")
    if focused_thumb || state.active_idx != -1 {
      if key == "ArrowUp" {
        prevent_default(e)
        navigate_thumbs(state, -1)
      } else if key == "ArrowDown" {
        prevent_default(e)
        navigate_thumbs(state, 1)
      }
    }
  })
  state.handles.push(h)
}

///| Setup mermaid mutation observer
fn setup_mermaid_observer(state : MediaSidebarState) -> Unit {
  let check_mermaid = fn() {
    state.items.eachi(fn(idx, item) {
      if not(is_mermaid_type(item.type_)) { return }

      let svg = query_in(item.element, "svg")
      if is_null(svg) { return }

      // Check if SVG has content
      let has_content = query_in(svg, ".node,.cluster,.edgePath,.label,path,rect,circle,text")
      if is_null(has_content) { return }

      if get_dataset(item.element, "updated") == "true" {
        return
      }

      set_dataset(item.element, "updated", "true")

      // Update thumbnail
      let thumb = query_in(state.thumbs_container, "[data-media-index='" + idx.to_string() + "']")
      if is_null(thumb) { return }

      let mw = query_in(thumb, ".media-sidebar-thumb-mermaid")
      if is_null(mw) { return }

      clear_children(mw)
      let cloned = clone_svg_for_thumbnail(svg, idx)
      append_child(mw, cloned)
    })
  }

  // Initial check
  check_mermaid()

  // Setup mutation observer via FFI
  let h = setup_mutation_observer(state.preview, check_mermaid)
  state.observer_handle = Some(h)

  // Periodic checks
  let _ = set_timeout(check_mermaid, 1000)
  let _ = set_timeout(check_mermaid, 3000)
}

///| Get currently focused element
extern "js" fn get_active_element() -> Element =
  #|() => document.activeElement

///| Setup mutation observer (returns handle)
extern "js" fn setup_mutation_observer(
  target : Element,
  callback : () -> Unit
) -> ListenerHandle =
  #|(target, callback) => {
  #|  const observer = new MutationObserver(callback);
  #|  observer.observe(target, { childList: true, subtree: true, attributes: true });
  #|  return { disconnect: () => observer.disconnect() };
  #|}

fn is_video_type(type_ : MediaType) -> Bool {
  match type_ {
    Video => true
    _ => false
  }
}

fn is_mermaid_type(type_ : MediaType) -> Bool {
  match type_ {
    Mermaid => true
    _ => false
  }
}
