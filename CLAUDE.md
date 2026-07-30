# Working rules for this repo

Read before making changes. These are hard rules, not preferences — several were
learned by getting them wrong here.

## 1. Dependencies: no

**The dependency count is a feature. Do not grow it.**

Current total is four: `three`, plus `vite`, `typescript`, `@types/three`.

- **Do not add a runtime dependency.** Not for animation, not for state, not for
  UI, not for a helper you could write in thirty lines.
- **Do not add a framework.** No React, no build plugins beyond what Vite ships.
- **Prefer what three.js already bundles.** `three/addons/` covers loaders,
  controls, post-processing, `SkeletonUtils`, `MeshoptDecoder` and much more, at
  no install cost. Check there first, always.
- **Prefer the platform.** `<dialog>` over a modal library. `ResizeObserver`,
  `AbortController`, Pointer Events, CSS transitions, `CanvasTexture` for text.
- **Build-time-only tools are fine via `npx`**, never installed:
  `npx @gltf-transform/cli@4 …`. They touch assets and leave no trace in
  `package.json`.

If something genuinely cannot be done without a dependency, say so and ask
first — with the size, the transitive count, and what it replaces.

## 2. Assets: compress before committing

Git history is permanent. An unoptimised asset committed once is there forever.

- Raw downloads go in `raw-assets/` (gitignored). Only the compressed result
  goes in `src/assets/`.
- **Models:** `npx @gltf-transform/cli@4 optimize` with `--compress meshopt
  --texture-compress webp --texture-size 1024`. For kits add
  `--join false --flatten false`, or the named nodes you address pieces by are
  destroyed. Real results here: 33.4 MB → 562 KB, 25.0 MB → 734 KB.
- **Images:** `sips -s format jpeg -s formatOptions 72 -Z 1200`. A screenshot
  went 10.2 MB → 335 KB with no visible loss at the size it renders.
- **HDRIs:** pick resolution for the *background*, not the lighting — lighting is
  prefiltered to 256px regardless. See `OUTSIDE` in `world/config.ts`.
- Merge related pieces into one file so they share a download and one
  deduplicated texture set.

## 3. Measure, don't assume

Every serious bug in this project came from reasoning about geometry instead of
measuring it. When something looks wrong, query the live scene through
`window.palace` before theorising.

Actual failures, all of which cost real time:

- **Wrong metric.** Sampled *vertices* to find timber posts, found none, declared
  the wall clear. A post is a long box with vertices only at its ends — its
  surface spanned the whole range. Sample the right thing, or raycast.
- **Node transforms.** Meshopt quantisation compensates with a transform on the
  node. Writing to a loaded node's `position` discards it. **Never write to a
  loaded node's transform — wrap it in a group and move the group.**
- **Skinned meshes.** `Object3D.clone()` does not rebind skeletons; the clone
  renders at the original bones' location. Use `SkeletonUtils.clone()`.
- **Model orientation is arbitrary.** Measure it and record it explicitly
  (`modelYawOffset`), don't fold a magic number into the rotation.
- **Test with realistic inputs.** An exit-intent handler was verified with a
  synthetic event carrying an idealised value; real browsers report a different
  one and it never fired in practice.

## 4. Verify in the browser, and say what you actually checked

Screenshot it. Read back the numbers. Do not report something as working on the
strength of the code looking right.

Two quirks of the preview pane specifically: it reports `document.hidden === true`,
which suspends `requestAnimationFrame`, CSS transitions **and** `ResizeObserver`
callbacks. Frames must be driven manually and `camera.aspect` set by hand, or you
are screenshotting a stale frame at the wrong aspect. Neither is an app bug.

## 5. Architecture invariants

- **`stage.ts` must never import from `world/`.** The stage owns the GL context
  and the camera and survives hot reloads; pulling it into the world's module
  graph downgrades every world edit to a full page reload.
- **Everything under `world/` is disposable and rebuilt on every save.** Anything
  the scene graph can't reach — render targets, hand-loaded textures — must be
  released in that module's `dispose()`, or the tab dies after a few dozen edits.
- **`config.ts` is the tuning surface.** New tunables go there with a note on
  what they trade off, not inline in the module.
- **Kit placement is grid arithmetic**, integer cells and quarter turns. Measured
  kit facts (module size, wall height, face offset) live in `KIT`.

## 6. Types and build

- `tsc --noEmit` runs before every build and blocks the push. Strictest settings
  are on deliberately: fix the code, never loosen `tsconfig.json`.
- No `any`. Narrow with a real type guard.
- `src/assets.d.ts` plus `assetsInclude` in `vite.config.ts` — **both** are needed
  for a new asset extension.

## 7. Deploy

Pushing `master` runs `.githooks/pre-push`: builds locally, force-pushes `dist/`
to `gh-pages`. `dist/` stays gitignored. A type error blocks the push.

Anything that must be served at the site root — `CNAME`, favicons, the Google
verification file — belongs in `public/`. Removing `CNAME` breaks the custom
domain.
