///| ZoomPanViewer — shared zoom/pan/drag viewer component
///  Wraps the JS createZoomPanViewer (cli.cjs L5296-5531).
///  Used by mermaid fullscreen, image fullscreen, and media sidebar.

///| Configuration for creating a ZoomPanViewer
pub(all) struct ZoomPanConfig {
  viewport : Element
  wrapper : Element
  natural_width : Double
  natural_height : Double
  zoom_info_el : Element
  has_minimap : Bool
  minimap_viewport_el : Element
  mm_max_w : Double
  mm_max_h : Double
  mm_pad : Double
  zoom_min : Double
  zoom_max : Double
  use_ctrl_for_zoom : Bool
}

///| Active ZoomPanViewer instance (stored as mutable ref)
let active_zpv : Ref[ZoomPanViewerHandle] = Ref::new(
  zpv_null_handle(),
)

///| Get a null handle for initialization
fn zpv_null_handle() -> ZoomPanViewerHandle {
  create_null_zpv_handle()
}

///| Create a null ZoomPanViewer handle
extern "js" fn create_null_zpv_handle() -> ZoomPanViewerHandle =
  #|() => null

///| Create a new ZoomPanViewer with the given config
pub fn new_zoom_pan_viewer(config : ZoomPanConfig) -> ZoomPanViewerHandle {
  create_zoom_pan_viewer(
    config.viewport,
    config.wrapper,
    config.natural_width,
    config.natural_height,
    config.zoom_info_el,
    config.has_minimap,
    config.minimap_viewport_el,
    config.mm_max_w,
    config.mm_max_h,
    config.mm_pad,
    config.zoom_min,
    config.zoom_max,
    config.use_ctrl_for_zoom,
  )
}

///| Destroy the active ZoomPanViewer and clear the ref
pub fn destroy_active_zpv() -> Unit {
  if not(zpv_is_null(active_zpv.val)) {
    zpv_destroy(active_zpv.val)
    active_zpv.val = create_null_zpv_handle()
  }
}

///| Set a new active ZoomPanViewer (destroys previous if any)
pub fn set_active_zpv(handle : ZoomPanViewerHandle) -> Unit {
  destroy_active_zpv()
  active_zpv.val = handle
}

///| Fit the active viewer to its viewport
pub fn fit_active_zpv() -> Unit {
  if not(zpv_is_null(active_zpv.val)) {
    zpv_fit_to_viewport(active_zpv.val)
  }
}
