import * as THREE from 'three'
import { INTERIOR, OUTSIDE, SUN } from './config'

export interface SkyResult {
  /** The backdrop plane hanging beyond the window. Belongs in the scene graph. */
  readonly mesh: THREE.Object3D
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
 * The world outside: a photo hung on a plane beyond the window, which also
 * lights the room.
 *
 * One download, two textures. The backdrop samples it with ordinary UVs; a
 * clone shares the same image but is flagged equirectangular so three will
 * prefilter it into an environment map. `clone()` copies the texture object, not
 * the pixels, so this costs nothing extra to fetch or decode.
 *
 * Loaded asynchronously while `buildWorld` stays synchronous; the plane exists
 * immediately and gets its texture when the photo arrives.
 */
export function createSky(
  applyOutside: (texture: THREE.Texture | null) => void,
  manager: THREE.LoadingManager,
): SkyResult {
  const sunDirection = directionFromAngles(SUN.elevation, SUN.azimuth)
  const { width, distance, centerX, centerY } = OUTSIDE.backdrop

  // Unlit, and excluded from tone mapping: it is already a photograph of a lit
  // scene. Running it through the room's lighting would double-light it, and
  // through the tone mapper would desaturate a sunset whose whole point is
  // colour.
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
  // Provisional square; resized to the photo's real aspect once it loads.
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(width, width), material)
  backdrop.name = 'backdrop'
  // Window wall is the -Z wall; hang the photo `distance` beyond its outer face.
  // PlaneGeometry already faces +Z, which is back into the room.
  backdrop.position.set(centerX, centerY, -(INTERIOR.halfDepth + distance))

  let disposed = false
  let photo: THREE.Texture | null = null
  let environment: THREE.Texture | null = null

  void new THREE.TextureLoader(manager)
    .loadAsync(OUTSIDE.url)
    .then((loaded) => {
      // The world may have been torn down by a hot reload while this was in
      // flight. Attaching the texture to a dead scene would leak it.
      if (disposed) {
        loaded.dispose()
        return
      }

      loaded.colorSpace = THREE.SRGBColorSpace
      photo = loaded

      const { width: px, height: py } = loaded.image as { width: number; height: number }
      if (px > 0 && py > 0) {
        backdrop.geometry.dispose()
        backdrop.geometry = new THREE.PlaneGeometry(width, (width * py) / px)
      }
      material.map = loaded
      material.needsUpdate = true

      environment = loaded.clone()
      environment.mapping = THREE.EquirectangularReflectionMapping
      environment.needsUpdate = true
      applyOutside(environment)
    })
    .catch((error: unknown) => {
      console.error(`Could not load ${OUTSIDE.url}`, error)
    })

  return {
    mesh: backdrop,
    sunDirection,

    dispose() {
      disposed = true
      // Detach before disposing, so the renderer is never holding a reference
      // to a texture whose GPU resources have gone.
      applyOutside(null)
      environment?.dispose()
      photo?.dispose()
      environment = null
      photo = null
    },
  }
}
