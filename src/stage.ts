import * as THREE from 'three'

/**
 * The persistent shell: GL context, camera, scene container and render loop.
 *
 * The stage is built exactly once and survives every hot reload. That is the
 * whole point of separating it from the world — because the camera lives here,
 * editing `src/world/` swaps the contents of the room without throwing away
 * the viewpoint you were looking from.
 *
 * Consequence to respect: this module must never import from `src/world/`.
 * Doing so would pull the stage into the world's HMR graph and downgrade every
 * world edit into a full page reload.
 */
export interface Stage {
  readonly renderer: THREE.WebGLRenderer
  readonly camera: THREE.PerspectiveCamera
  readonly scene: THREE.Scene
  /** Registers a per-frame callback. Returns an unsubscribe function. */
  onFrame: (callback: (dt: number) => void) => () => void
  dispose: () => void
}

/** Largest step we ever advance in one frame, so a backgrounded tab that
 *  returns after 30s doesn't apply a 30s-worth of damping in one jump. */
const MAX_DELTA = 1 / 15

export function createStage(canvas: HTMLCanvasElement): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    // MSAA is the right call here: there is no post-processing stack that
    // would otherwise supply SMAA/FXAA.
    antialias: true,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  // Khronos PBR Neutral rather than AgX. AgX is the better film emulation and
  // is lovely over genuinely high-dynamic-range content, but it desaturates
  // hard, and side by side in this room it turned a brown floor and warm walls
  // into flat grey. Neutral preserves albedo — a colour you pick in
  // config.ts is roughly the colour you get. Exposure is supplied per-world.
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.shadowMap.enabled = true
  // PCFSoftShadowMap is deprecated as of r185 — the renderer silently
  // downgrades it to PCFShadowMap and warns. Ask for the real thing directly.
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(62, 1, 0.05, 4000)

  const callbacks = new Set<(dt: number) => void>()
  // Timer replaces the deprecated Clock. Connecting it to the document opts
  // into the Page Visibility API, so returning to a backgrounded tab does not
  // report the entire time away as one delta.
  const timer = new THREE.Timer()
  timer.connect(document)

  function resize(): void {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width === 0 || height === 0) return

    // `false` — leave the CSS size alone, the stylesheet owns layout.
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  // ResizeObserver rather than window.resize: it also catches devtools
  // docking, split panes and any CSS-driven layout change.
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  function tick(timestamp: number): void {
    timer.update(timestamp)
    // Timer's visibility handling covers tab switches; this clamp covers the
    // other case — a single long hitch (a big shader compile, a GC pause).
    const dt = Math.min(timer.getDelta(), MAX_DELTA)

    for (const callback of callbacks) {
      callback(dt)
    }
    renderer.render(scene, camera)
  }

  renderer.setAnimationLoop(tick)

  // No manual pause-on-hidden here, deliberately. Browsers already suspend
  // requestAnimationFrame for documents that aren't visible, so a
  // visibilitychange handler that nulls the loop buys no battery back — and it
  // actively misfires when a document reports hidden while still being
  // composited (an inactive tab in an embedded preview pane, for instance),
  // freezing a view somebody is actually looking at. Timer.connect above
  // already absorbs the time gap on the way back.

  return {
    renderer,
    camera,
    scene,

    onFrame(callback) {
      callbacks.add(callback)
      return () => callbacks.delete(callback)
    },

    dispose() {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      timer.disconnect()
      callbacks.clear()
      renderer.dispose()
    },
  }
}
