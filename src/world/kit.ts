import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js'
import { disposeSubtree } from '../dispose'
import { KIT, LEVEL, PROPS, PROPS_URL, type Edge } from './config'

export interface Kit {
  readonly group: THREE.Group
  dispose: () => void
}

/** Piece names as authored in the kit, matching the glTF node names. */
const PIECE = {
  floor: 'Floor_WoodDark',
} as const

/**
 * Builds the room out of modular kit pieces snapped to a grid.
 *
 * The whole point of a kit is that every piece shares one footprint, so placing
 * is integer arithmetic on cells rather than hand-positioning. Rotations are
 * quarter turns only. That is what makes this extend indefinitely: adding a room
 * is adding cells, not nudging geometry.
 *
 * Measured from the asset rather than assumed — the kit's module is 2m and its
 * walls are 3.125m tall, with the wall's mass hanging off the -Z side of its
 * origin and its visible face at +Z. Those three facts drive every offset here.
 */
export function createKit(manager: THREE.LoadingManager, onReady: () => void): Kit {
  const group = new THREE.Group()
  group.name = 'kit'

  const loader = new GLTFLoader(manager)
  loader.setMeshoptDecoder(MeshoptDecoder)

  let disposed = false

  void Promise.all([loader.loadAsync(KIT.url), loader.loadAsync(PROPS_URL)])
    .then(([shell, props]) => {
      if (disposed) {
        for (const scene of [...shell.scenes, ...props.scenes]) disposeSubtree(scene)
        return
      }

      build(group, index(shell.scenes))
      furnish(group, index(props.scenes))

      // The sun's shadow map is rendered once and cached, so anything that
      // arrives after the first frame would otherwise cast and receive nothing.
      onReady()
    })
    .catch((error: unknown) => {
      console.error('Could not load the kit', error)
    })

  return {
    group,
    dispose() {
      disposed = true
    },
  }
}

/**
 * Builds a name lookup from a merged file's scenes.
 *
 * gltf-transform's `merge` keeps each source file as its own scene rather than
 * folding them together, so the pieces live across `gltf.scenes` and never
 * appear in `gltf.scene`.
 */
function index(scenes: readonly THREE.Group[]): ReadonlyMap<string, THREE.Object3D> {
  const pieces = new Map<string, THREE.Object3D>()
  for (const scene of scenes) {
    for (const child of scene.children) {
      pieces.set(child.name, child)
    }
  }
  return pieces
}

/** Places the loose props listed in config, which are not on the grid. */
function furnish(group: THREE.Group, props: ReadonlyMap<string, THREE.Object3D>): void {
  for (const config of PROPS) {
    const template = props.get(config.piece)
    if (template === undefined) {
      console.warn(`No prop named "${config.piece}"`, [...props.keys()])
      continue
    }

    const [x, y, z] = config.position
    const prop = place(template, x, y, z, THREE.MathUtils.degToRad(config.rotationY))
    prop.name = `prop:${config.piece}`

    // Treat the configured y as where the prop's *base* goes, then measure and
    // correct. Props are authored standing on their own origin, but not all of
    // them: the chest is rigged and its armature sits at its centre, which
    // buried it half a metre into the floor. Measuring is cheaper than knowing
    // which ones are honest.
    const measured = new THREE.Box3().setFromObject(prop)
    if (measured.isEmpty() === false) {
      prop.position.y += y - measured.min.y
    }

    group.add(prop)
  }
}

function build(group: THREE.Group, pieces: ReadonlyMap<string, THREE.Object3D>): void {
  const floor = pieces.get(PIECE.floor)
  const wall = pieces.get(KIT.wallPiece)
  const wallWindow = pieces.get(KIT.windowPiece)

  if (floor === undefined || wall === undefined || wallWindow === undefined) {
    console.error('Kit is missing an expected piece', [...pieces.keys()])
    return
  }

  const { module: size, wallHeight } = KIT
  const { cellsX, cellsZ } = LEVEL

  // Cell (0,0) is the near-left corner; the grid is centred on the origin so the
  // room's middle stays at 0,0 no matter how many cells it grows to.
  const originX = ((cellsX - 1) / 2) * size
  const originZ = ((cellsZ - 1) / 2) * size
  const cellX = (ix: number): number => ix * size - originX
  const cellZ = (iz: number): number => iz * size - originZ

  for (let ix = 0; ix < cellsX; ix++) {
    for (let iz = 0; iz < cellsZ; iz++) {
      group.add(place(floor, cellX(ix), 0, cellZ(iz), 0))

      // No ceiling piece ships with this kit, so the floor tile is reused
      // upside-down. Flipping it about X inverts the normals too, which is what
      // makes it light correctly from below instead of reading as unlit.
      const ceiling = place(floor, cellX(ix), wallHeight, cellZ(iz), 0)
      ceiling.rotateX(Math.PI)
      ceiling.name = 'ceiling'
      group.add(ceiling)
    }
  }

  // Perimeter walls. A wall's face points +Z at rotation 0, so each edge gets
  // the quarter turn that aims it back into the room.
  const half = size / 2
  for (let ix = 0; ix < cellsX; ix++) {
    group.add(edgePiece('north', ix, cellX(ix), cellZ(0) - half, 0, wall, wallWindow))
    group.add(edgePiece('south', ix, cellX(ix), cellZ(cellsZ - 1) + half, Math.PI, wall, wallWindow))
  }
  for (let iz = 0; iz < cellsZ; iz++) {
    group.add(edgePiece('west', iz, cellX(0) - half, cellZ(iz), Math.PI / 2, wall, wallWindow))
    group.add(
      edgePiece('east', iz, cellX(cellsX - 1) + half, cellZ(iz), -Math.PI / 2, wall, wallWindow),
    )
  }
}

function edgePiece(
  edge: Edge,
  index: number,
  x: number,
  z: number,
  rotationY: number,
  wall: THREE.Object3D,
  wallWindow: THREE.Object3D,
): THREE.Object3D {
  const wantsWindow = LEVEL.windows.some((w) => w.edge === edge && w.index === index)
  const piece = place(wantsWindow ? wallWindow : wall, x, 0, z, rotationY)
  piece.name = `${edge}:${index}${wantsWindow ? ':window' : ''}`
  return piece
}

/**
 * Clones a template piece and positions it via a wrapper group.
 *
 * The wrapper is not incidental — writing to the cloned node's own
 * `position`/`rotation` is a trap. Meshopt compression quantizes vertex
 * positions into integer ranges and compensates with a scale and translation on
 * the node itself, so these wall nodes arrive carrying a +1.56m Y offset that
 * puts their geometry on the floor. Assigning to `position` discarded it and
 * sank every wall half its height into the ground. Anything that carries its own
 * transform — compressed, or just authored off-origin — breaks the same way.
 *
 * `clone()` shares materials with the original by design: every wall in the room
 * points at one material instance, which is what keeps a kit cheap to draw
 * however many pieces get placed.
 */
function place(
  template: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  rotationY: number,
): THREE.Object3D {
  const holder = new THREE.Group()
  holder.position.set(x, y, z)
  holder.rotation.y = rotationY

  // SkeletonUtils.clone, not Object3D.clone. A plain clone of a rigged model
  // copies the meshes but keeps them bound to the *original* skeleton, so the
  // copy renders wherever those bones are — the world origin — no matter where
  // this holder is placed. That is what put a chest under the spawn point.
  // SkeletonUtils rebinds to the cloned bones; it is a no-op for static pieces.
  const piece = cloneSkinned(template)
  holder.add(piece)

  piece.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return holder
}
