/**
 * Module declarations for asset types Vite is told to treat as static assets
 * via `assetsInclude` in vite.config.ts.
 *
 * `vite/client` ships declarations for its own default asset list (images,
 * media, fonts…), but glTF is not on it — so adding `assetsInclude` fixes the
 * build while the import stays a type error until it is declared here. Both
 * halves are required.
 *
 * This must stay a `.d.ts`: `moduleDetection: "force"` treats every
 * *non-declaration* file as a module, and a wildcard `declare module` in a
 * module context is a module augmentation, which would fail to resolve.
 */

declare module '*.glb' {
  const src: string
  export default src
}

declare module '*.gltf' {
  const src: string
  export default src
}

declare module '*.hdr' {
  const src: string
  export default src
}

declare module '*.exr' {
  const src: string
  export default src
}
