import * as THREE from 'three'
import { createControls } from './controls'
import { createFarewell } from './farewell'
import { createLoadingScreen } from './loading'
import { createStage } from './stage'
import { buildWorld, type World } from './world'

const canvas = document.querySelector<HTMLCanvasElement>('#stage')
if (canvas === null) {
  throw new Error('#stage canvas is missing from index.html')
}

const hint = document.querySelector<HTMLParagraphElement>('#hint')

const stage = createStage(canvas)
const controls = createControls(stage.camera, canvas, {
  onFirstLook: () => hint?.setAttribute('data-dismissed', 'true'),
})

/**
 * Attaches the outside panorama, which arrives asynchronously. One texture
 * serves as both the view through the window and the room's image-based light:
 * three prefilters an equirectangular `scene.environment` internally, so no
 * manual PMREM pass is needed here.
 */
const applyOutside = (texture: THREE.Texture | null): void => {
  stage.scene.background = texture
  stage.scene.environment = texture
}

const farewell = createFarewell()
const loading = createLoadingScreen()

const worldContext = {
  renderer: stage.renderer,
  applyOutside,
  loadingManager: loading.manager,
}

let world = mount(buildWorld(worldContext), true)

stage.onFrame((dt) => {
  controls.update(dt)
  world.update(dt)
})

// Hold the black screen until every asset is in and the shaders are built, then
// fade up. Called once: a hot reload re-runs buildWorld but not this module, so
// the loading screen never reappears mid-session.
void loading
  .reveal(() => stage.renderer.compileAsync(stage.scene, stage.camera))
  // Armed only once the room is actually visible, so the touch idle timer
  // measures time spent in it rather than time spent downloading it.
  .then(() => farewell.arm())

/**
 * Attaches a world to the stage.
 *
 * `applySpawn` is the interesting parameter. On the initial build we place the
 * camera where the world asks. On a hot reload we deliberately do not — the
 * camera belongs to the stage, so leaving it alone means you keep looking at
 * whatever you were looking at while the room rebuilds around you.
 */
function mount(next: World, applySpawn: boolean): World {
  stage.scene.add(next.root)
  stage.scene.environmentIntensity = next.environmentIntensity
  stage.scene.backgroundBlurriness = next.backgroundBlurriness
  stage.scene.backgroundIntensity = next.backgroundIntensity
  // Both, together: a rotated background with an unrotated environment means
  // reflections that disagree with the view out of the window.
  stage.scene.backgroundRotation.copy(next.outsideRotation)
  stage.scene.environmentRotation.copy(next.outsideRotation)
  stage.renderer.toneMappingExposure = next.exposure

  if (applySpawn) {
    stage.camera.position.copy(next.spawn.position)
    controls.setOrientation(next.spawn.yaw, next.spawn.pitch)
  }

  return next
}

// --- Hot reload --------------------------------------------------------------
// Everything under src/world/ propagates up to this boundary, so editing
// config.ts, room.ts or sky.ts swaps the environment in place. Editing stage.ts
// or controls.ts falls back to a full page reload, which is correct — those own
// the GL context.
//
// Vite matches the literal text `import.meta.hot.accept(` when it builds the
// module graph, so this call must not be aliased or wrapped. Keeping it inside
// `if (import.meta.hot)` is what lets the whole block vanish from the
// production bundle.
interface WorldModule {
  readonly buildWorld: typeof buildWorld
}

/**
 * A hot-updated module arrives as an opaque namespace, so verify the shape
 * rather than asserting it. If an edit leaves `world/index.ts` mid-syntax-error
 * this bails out and keeps the last good world on screen instead of throwing.
 */
function isWorldModule(value: unknown): value is WorldModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>)['buildWorld'] === 'function'
  )
}

declare global {
  interface Window {
    /** Dev-only inspection handle. Never defined in a production build. */
    palace?: {
      stage: typeof stage
      controls: typeof controls
      farewell: typeof farewell
      readonly world: World
    }
  }
}

if (import.meta.hot) {
  // Lets you poke at the live scene from the devtools console while tuning —
  // e.g. `palace.world.root.getObjectByName('sun')` or `palace.stage.renderer.info`.
  window.palace = {
    stage,
    controls,
    farewell,
    get world() {
      return world
    },
  }

  import.meta.hot.accept('./world', (updated) => {
    if (!isWorldModule(updated)) return

    world.dispose()
    world = mount(updated.buildWorld(worldContext), false)
  })

  import.meta.hot.dispose(() => {
    world.dispose()
    controls.dispose()
    farewell.dispose()
    stage.dispose()
  })
}
