import * as THREE from 'three'
import { disposeSubtree } from '../dispose'
import { LIGHTING, OUTSIDE, ROOM, SHADOW, SUN, VIEWPOINT } from './config'
import { createPictures } from './pictures'
import { createKit } from './kit'
import { createSky } from './sky'

export interface Spawn {
  readonly position: THREE.Vector3
  readonly yaw: number
  readonly pitch: number
}

/**
 * Everything that makes up the environment, and nothing that makes up the
 * viewer. This whole module graph is hot-swappable — see `src/main.ts`.
 */
export interface World {
  /** Single root, so mounting and unmounting is one add/remove. */
  readonly root: THREE.Object3D
  readonly environmentIntensity: number
  /** Blur applied to the visible panorama only, not to its lighting. */
  readonly backgroundBlurriness: number
  readonly backgroundIntensity: number
  /**
   * Rotation applied to background and environment together, so what you see
   * through the window and what lights the room never disagree.
   */
  readonly outsideRotation: THREE.Euler
  /** Renderer tone-mapping exposure this world expects. */
  readonly exposure: number
  /** Where the visitor starts. Applied on first build only. */
  readonly spawn: Spawn
  update: (dt: number) => void
  dispose: () => void
}

export interface WorldContext {
  readonly renderer: THREE.WebGLRenderer
  /**
   * Shared by every loader in the world, so the loading screen's progress line
   * reflects all of them without each having to report separately.
   */
  readonly loadingManager: THREE.LoadingManager
  /**
   * Receives the outside panorama once it has downloaded, and `null` when the
   * world is torn down. Needed because the HDR load is asynchronous while
   * `buildWorld` is synchronous — the scene's background and environment cannot
   * be set at build time.
   */
  readonly applyOutside: (texture: THREE.Texture | null) => void
}

export function buildWorld(context: WorldContext): World {
  const root = new THREE.Group()
  root.name = 'world'

  const sky = createSky(context.applyOutside, context.loadingManager)
  const sun = createSun(sky.sunDirection)

  // The sun's shadow map is rendered once and cached (see createSun), so
  // anything that arrives or changes shape after the first frame — a model
  // finishing its download, a picture frame resizing to its image's aspect
  // ratio — has to ask for one more pass or it casts no shadow at all.
  const refreshShadows = (): void => {
    sun.light.shadow.needsUpdate = true
  }

  const kit = createKit(context.loadingManager, refreshShadows)
  const pictures = createPictures(context.renderer, refreshShadows, context.loadingManager)

  root.add(kit.group)
  root.add(sun.group)
  root.add(createBounce())
  root.add(pictures.group)

  return {
    root,
    environmentIntensity: LIGHTING.environmentIntensity,
    backgroundBlurriness: OUTSIDE.blurriness,
    backgroundIntensity: OUTSIDE.intensity,
    outsideRotation: new THREE.Euler(0, THREE.MathUtils.degToRad(OUTSIDE.rotationDeg), 0),
    exposure: LIGHTING.exposure,

    spawn: {
      position: new THREE.Vector3(VIEWPOINT.x, VIEWPOINT.eye, VIEWPOINT.z),
      yaw: THREE.MathUtils.degToRad(VIEWPOINT.yaw),
      pitch: THREE.MathUtils.degToRad(VIEWPOINT.pitch),
    },

    // Nothing in the room animates yet. Kept as the per-frame hook: return an
    // update from a world module and call it here.
    update() {},

    dispose() {
      sky.dispose()
      kit.dispose()
      pictures.dispose()
      disposeSubtree(root)
    },
  }
}

/** How far out to place the sun. Only affects the shadow frustum, not falloff. */
const SUN_DISTANCE = 14

/**
 * Warm fill approximating light bounced off the room's own surfaces. See the
 * long note on LIGHTING.bounce in config.ts for why this exists rather than
 * falling out of the environment map.
 *
 * A HemisphereLight rather than an AmbientLight specifically because it is
 * directional — warm from below where the sunlit floor is, cooler from above —
 * which an AmbientLight cannot express, and flat ambient reads as fog.
 */
function createBounce(): THREE.HemisphereLight {
  const { bounce } = LIGHTING
  const light = new THREE.HemisphereLight(
    new THREE.Color(bounce.fromAbove),
    new THREE.Color(bounce.fromBelow),
    bounce.intensity,
  )
  light.name = 'bounce'
  return light
}

/**
 * A single directional light standing in for the sun, aimed to throw a patch of
 * light through the window and onto the floor.
 */
interface Sun {
  readonly group: THREE.Group
  readonly light: THREE.DirectionalLight
}

function createSun(direction: THREE.Vector3): Sun {
  const group = new THREE.Group()
  group.name = 'sun'

  const light = new THREE.DirectionalLight(new THREE.Color(SUN.color), SUN.intensity)
  light.position.copy(direction).multiplyScalar(SUN_DISTANCE)
  light.castShadow = true

  // Aim at roughly chest height in the middle of the room, so the shadow
  // frustum is centred on what actually matters.
  light.target.position.set(0, ROOM.height * 0.35, 0)

  const { shadow } = light
  shadow.mapSize.set(SHADOW.mapSize, SHADOW.mapSize)

  // Fit the frustum tightly. A loose one spends nearly all of the depth map's
  // resolution on empty space and turns crisp window-light edges into mush.
  const camera = shadow.camera
  camera.left = -SHADOW.extent
  camera.right = SHADOW.extent
  camera.top = SHADOW.extent
  camera.bottom = -SHADOW.extent
  camera.near = 0.5
  camera.far = SUN_DISTANCE + 12
  camera.updateProjectionMatrix()

  // Nothing that casts a shadow in this room ever moves, so render the depth
  // map once instead of re-rendering 16M texels every frame. Anything animated
  // added later needs to either cast no shadow or set needsUpdate again.
  shadow.autoUpdate = false
  shadow.needsUpdate = true

  // normalBias is the right fix for shadow acne on large flat walls: it offsets
  // along the surface normal, so unlike a big depth bias it doesn't detach
  // shadows from the objects casting them.
  shadow.normalBias = 0.02
  shadow.bias = -0.0002

  group.add(light)
  // A DirectionalLight's target only takes effect once it is in the scene graph.
  group.add(light.target)

  return { group, light }
}
