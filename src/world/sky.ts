import * as THREE from 'three'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { OUTSIDE, SUN } from './config'

export interface SkyResult {
  /** Unit vector pointing from the room toward the sun. */
  readonly sunDirection: THREE.Vector3
  dispose: () => void
}

/**
 * Converts an elevation/azimuth pair into a direction vector.
 *
 * Azimuth 0 points at -Z, i.e. straight out through the window, so the numbers
 * in `config.ts` read as "relative to the view out the window".
 */
function directionFromAngles(elevationDeg: number, azimuthDeg: number): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - elevationDeg)
  const theta = THREE.MathUtils.degToRad(180 + azimuthDeg)
  return new THREE.Vector3().setFromSphericalCoords(1, phi, theta)
}

/**
 * The world outside, as a single equirectangular HDR panorama.
 *
 * This replaced a procedural `Sky` dome plus a 600m ground plane. Both had to
 * go: the panorama already contains its own terrain and horizon, and a real
 * ground plane would have occluded the bottom half of it — `scene.background`
 * draws at infinite distance, behind all actual geometry.
 *
 * `HDRLoader`, not `RGBELoader` — the latter has been deprecated since r180 and
 * warns on construction, though most tutorials still use it.
 *
 * The load is asynchronous while `buildWorld` stays synchronous, which keeps the
 * HMR path simple; the texture is handed back through `applyOutside` whenever it
 * lands. On a hot reload the browser serves it straight from cache.
 */
export function createSky(
  applyOutside: (texture: THREE.Texture | null) => void,
  manager: THREE.LoadingManager,
): SkyResult {
  const sunDirection = directionFromAngles(SUN.elevation, SUN.azimuth)

  let disposed = false
  let texture: THREE.Texture | null = null

  void new HDRLoader(manager)
    .loadAsync(OUTSIDE.url)
    .then((loaded) => {
      // The world may have been torn down by a hot reload while this was in
      // flight. Attaching the texture to a dead scene would leak it.
      if (disposed) {
        loaded.dispose()
        return
      }

      // Without this the panorama is sampled as a flat rectangle rather than
      // wrapped around the scene, and three cannot prefilter it for lighting.
      loaded.mapping = THREE.EquirectangularReflectionMapping
      texture = loaded
      applyOutside(loaded)
    })
    .catch((error: unknown) => {
      console.error(`Could not load ${OUTSIDE.url}`, error)
    })

  return {
    sunDirection,

    dispose() {
      disposed = true
      // Detach before disposing, so the renderer is never holding a reference
      // to a texture whose GPU resources have gone.
      applyOutside(null)
      texture?.dispose()
      texture = null
    },
  }
}
