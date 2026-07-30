import * as THREE from 'three'

/**
 * Releases every GPU resource reachable from a material: its own program plus
 * any texture held in one of its slots (map, normalMap, envMap, …).
 *
 * Slots are discovered by reflection rather than listed by name — three.js has
 * dozens of them and they differ per material class, so an explicit list would
 * silently miss whatever we start using next.
 */
function disposeMaterial(material: THREE.Material): void {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) {
      value.dispose()
    }
  }
  material.dispose()
}

/**
 * Deep-disposes a subtree: geometries, materials, material textures and light
 * shadow maps.
 *
 * This is not optional housekeeping. The world is rebuilt on every hot reload,
 * and three.js holds GPU allocations outside the reach of the garbage
 * collector — dropping the JS references alone leaks them. Skip this and the
 * tab dies after a few dozen saves.
 */
export function disposeSubtree(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()

      if (Array.isArray(object.material)) {
        for (const material of object.material) {
          disposeMaterial(material)
        }
      } else {
        disposeMaterial(object.material)
      }
    }

    // Lights own their shadow map render target.
    if (object instanceof THREE.Light) {
      object.dispose()
    }
  })

  root.removeFromParent()
  root.clear()
}
