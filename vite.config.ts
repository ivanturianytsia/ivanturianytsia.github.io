import { defineConfig } from 'vite'

export default defineConfig({
  // glTF is not in Vite's default asset list — importing a .glb without this
  // hands it to the JS transform pipeline and the build fails. Vite's own
  // assetsInclude docs use glTF as the example for exactly this reason.
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.exr'],

  // Relative base keeps the build path-agnostic: the same dist/ works at
  // user.github.io/ivan-palace/, at a custom domain root, and opened straight
  // off the filesystem. Safe because there is no client-side routing.
  // If routing is ever added, switch to an explicit '/ivan-palace/'.
  base: './',
})
