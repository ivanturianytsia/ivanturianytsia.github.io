# ivan-palace

A room you stand inside. Personal website, built with three.js and grown over time.

```bash
npm install
npm run dev
```

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server with hot-reloading world           |
| `npm run build`     | Typecheck, then build to `dist/`              |
| `npm run preview`   | Serve the built `dist/` locally               |
| `npm run typecheck` | `tsc --noEmit` on its own                     |

Four dependencies total: `three`, plus `vite`, `typescript` and `@types/three`.
Keeping it that way is a rule, not an accident — see
[CLAUDE.md](CLAUDE.md) for that and the other working rules for this repo.

## The one thing to understand: stage vs world

```
src/
├── main.ts        entry + HMR boundary
├── stage.ts       renderer, camera, render loop   ← built once, never rebuilt
├── controls.ts    drag-to-look
├── dispose.ts     GPU resource cleanup
├── loading.ts     black screen + progress line, fades in on ready
└── world/         ← everything you iterate on, hot-swapped wholesale
    ├── config.ts     every tunable number, incl. the floor plan
    ├── kit.ts        builds the room from modular kit pieces + places props
    ├── sky.ts        HDR panorama: window view and image-based light
    ├── pictures.ts   framed pictures on the walls
    └── furnishings.ts one-off models outside the kit (currently unused)
```

`room.ts` is left over from the procedural room the kit replaced. It is no
longer imported.

The **stage** owns the WebGL context and the camera and survives every reload.
The **world** is rebuilt from scratch on each edit. Because the camera lives in
the stage, editing the world **keeps your viewpoint** — nudge `SUN.elevation`
and watch the patch of light slide across the floor from wherever you happen to
be standing, no page reload, no re-aiming.

Every file under `src/world/` gets this for free, via Vite's module graph.
Editing `stage.ts` or `controls.ts` triggers a normal full reload instead, which
is correct — those own the GL context.

**Start in [`src/world/config.ts`](src/world/config.ts).** Room dimensions, sun
angle, palette, where the pictures hang, and where you spawn are all there, with
notes on which numbers are touchy and why.

## Adding things

**Assets** go in `src/assets/` — imported, so Vite hashes and cache-busts them:

```ts
import url from '../assets/thing.png'
```

Anything over a few hundred KB should be resized first; see the note on
`old-website.png` below. Put files in `public/` instead only if you need a
stable, unhashed URL (`favicon.ico`, `CNAME`, `robots.txt`).

**3D models** — see [Models](#models) below.

**Geometry** goes in a new `src/world/` module returning an `Object3D`, added to
the root in `world/index.ts`. If it allocates anything the scene graph can't
reach — a render target, a texture you loaded yourself — release it in that
module's `dispose()`. Everything reachable from `world.root` is handled
automatically by `disposeSubtree`.

This matters more than it sounds: the world is rebuilt on **every save**, and
three.js holds GPU memory outside the garbage collector's reach. Leak a texture
per reload and the tab dies after a few dozen edits.

**Animation**: return an `update(dt)` from your module and call it from the
world's `update`. Note that the sun's shadow map is rendered **once** and cached
(`shadow.autoUpdate = false` in `world/index.ts`) because nothing in the room
moves. Anything animated that should cast a moving shadow needs to set
`shadow.needsUpdate` itself.

## Debugging

In dev, `window.palace` exposes the live scene:

```js
palace.world.root.getObjectByName('sun')
palace.stage.renderer.info.memory   // watch for leaks across reloads
palace.stage.camera.rotation.y      // find a yaw you like, paste into config
```

It is defined only under `import.meta.hot`, so it never reaches production.

## Deploying

Builds run **on your machine**, not in CI. Pushing `master` triggers
[`.githooks/pre-push`](.githooks/pre-push), which builds the site and publishes
`dist/` to the `gh-pages` branch that GitHub Pages serves from.

```
git push          →  npm run build  →  force-push dist/ to gh-pages
```

`dist/` stays gitignored and never lands in `master`'s history.

**One-time setup:**

1. `npm install` — the `prepare` script points git at `.githooks/`. Git hooks
   live in `.git/hooks/`, which is not versioned, so `core.hooksPath` is what
   makes a committed hook survive a fresh clone.
2. Repo → Settings → Pages → Source → **Deploy from a branch** → `gh-pages` / root.

Because `npm run build` is `tsc --noEmit && vite build`, **a type error blocks
the push** — the same gate the CI job used to provide.

Pushing any branch other than `master` skips the build entirely, and a failed
build aborts the push before anything is published. Both are covered by the
guards at the top of the hook.

To force a redeploy without new commits:

```bash
git commit --allow-empty -m "redeploy" && git push
```

### Why a separate branch instead of committing dist/

Git works out which commits a push will send *before* `pre-push` runs. A commit
created inside the hook would sit on your branch unpushed until the next push —
a confusing trap that looks like the deploy silently doing nothing. Pushing
`gh-pages` explicitly from within the hook avoids it, and keeps build output out
of `master`.

`gh-pages` is force-pushed with a single fresh commit each time. It is a build
artifact, so its history is not worth keeping.

**Note:** GitHub Actions is free for public repositories with no minute limit,
and Pages on a free account requires a public repo — so this setup is a
preference, not a cost saving. It does become necessary if the repo goes
private, and it means you can deploy offline.

## Models

### Where to get them

| Source | License | Notes |
| --- | --- | --- |
| [Poly Haven](https://polyhaven.com/models) | **CC0** — no attribution, commercial OK | Photoreal, well-built, sane scale. Best first stop for furniture and props. |
| [Poly Pizza](https://poly.pizza) | CC0 / CC-BY | Low-poly, includes the archived Google Poly library. Tiny files. |
| [Kenney](https://kenney.nl/assets) · [Quaternius](https://quaternius.com) | **CC0** | Stylised/low-poly game assets, ship as glTF already. |
| [Sketchfab](https://sketchfab.com) | **Varies per model** | Biggest selection by far. Filter *Downloadable* + license. See the caveat below. |

**On Sketchfab specifically:** it's a good source but a declining one. Epic
acquired it and has been folding it into [Fab](https://fab.com) — its own help
pages now redirect to `support.fab.com`. Downloads still work, but treat any
Sketchfab URL as temporary: **download the file and commit it**, never hotlink.

Also check the license per model, because it is not uniform. CC-BY means
attribution is legally required — see [Credits](#credits).

### Which format to download

**GLB**, and the smaller texture variant. GLB is one self-contained binary
(geometry + textures + materials) that `GLTFLoader` reads directly. `.gltf` is
the same data split into a JSON file plus loose textures you must keep together;
`.fbx` needs a different loader and maps PBR materials unreliably; `.usdz` is
Apple AR only. 4k textures are wasted on an object a few hundred pixels tall.

### Compress before committing

Downloads are routinely 20–50 MB, which is unusable on a web page. Always run:

```bash
npx @gltf-transform/cli@4 optimize raw-assets/thing.glb src/assets/thing.glb \
  --compress meshopt --texture-compress webp --texture-size 1024 \
  --simplify-ratio 0.15 --simplify-error 0.004
```

Keep the original in `raw-assets/` (gitignored) and commit only the compressed
result. To find out *why* a file is big before compressing:
`npx @gltf-transform/cli@4 inspect thing.glb`.

The medieval kit went **33.4 MB → 562 KB** that way, and the props **25.0 MB →
734 KB**: redundant UV sets pruned, positions quantised to 16-bit, and textures
re-encoded as 1024² WebP. Merging several pieces into one file first means they
share a single download and one deduplicated texture set.

**Pass `--join false --flatten false` when compressing a kit.** `optimize`
otherwise merges meshes and flattens the scene graph, which destroys the named
nodes you need to address individual pieces.

`meshopt` + WebP is deliberate. three bundles the meshopt decoder as a plain JS
module (`three/addons/libs/meshopt_decoder.module.js`) and supports
`EXT_texture_webp` natively, so this needs **no extra dependency and no
external decoder files**. Draco would require hosting its wasm; KTX2 would
require the Basis transcoder. If VRAM ever becomes the constraint rather than
download size, KTX2 is the upgrade — WebP decompresses to full RGBA on the GPU.

### Adding one to the room

1. Compress into `src/assets/`.
2. Import it in `world/config.ts` and add a `FURNISHINGS` entry.
3. Set `position` and `rotationY` (where it should look), and **measure
   `modelYawOffset`** — models are authored facing arbitrary directions. The
   Eames chair is 156° off. Getting this wrong is the single most likely reason
   something faces a wall.

`fitHeight` rescales the model to a real-world height and grounds it on the
floor, so you never have to care what units it was exported in. Set it to `null`
to keep the model's own scale. If the glTF carries animation clips, the first
one plays automatically — which is how a Mixamo "sitting" clip would pose an
avatar that would otherwise load in a T-pose.

### HDRIs (the outside)

The view through the window and the room's ambient light are the same file: one
equirectangular `.hdr` panorama, set as both `scene.background` and
`scene.environment`. Assigning an equirect texture to `environment` is enough —
three's `WebGLEnvironments` runs `PMREMGenerator.fromEquirectangular` internally
and caches it, so there's no manual prefiltering step.

Get them from [Poly Haven](https://polyhaven.com/hdris) (all CC0). On a download
page, set the two dropdowns to **HDR** and **1K or 2K** — the default 4K EXR is
~96 MB. Load with **`HDRLoader`**; `RGBELoader` was deprecated in r180 and warns
on construction, though most tutorials still use it.

**On resolution — pick it for the background, not the lighting.** Lighting is
prefiltered to 256px whatever you supply, so 1K is always enough there. The
window is what sets the requirement, and it's demanding for a non-obvious
reason: it shows only a *narrow slice* of the panorama blown up wide. This
window covers ~24.7° of 360°, magnified across ~360 screen pixels on a 16:9
desktop:

| Resolution | Source px in the window | Upscale | Size |
| --- | --- | --- | --- |
| 1K | 70 | 5.1× — mush | 1.6 MB |
| **2K** (current) | **141** | **2.6× — acceptable** | **6.5 MB** |
| 4K | 281 | 1.3× — sharp | ~25 MB |

Note this gets *worse* on a narrow/portrait viewport: less horizontal FOV means
the same window fills more of the screen. On a tall phone the effective upscale
roughly doubles.

Don't reach for `backgroundBlurriness` to hide upscaling — it was tried here and
just destroyed what horizon detail existed. It's for a deliberately dreamy look,
not a sharpness fix.

Two things that will bite:

- **Remove any ground geometry.** `scene.background` draws at infinite distance
  behind all real geometry, so a ground plane occludes the bottom half of the
  panorama and cuts off the horizon. The HDRI has its own terrain baked in.
- **Rotate background and environment together** (`OUTSIDE.rotationDeg`).
  Rotating only the background gives you reflections that disagree with the view.

## Credits

`src/assets/qwantani-dusk-2.hdr` — *Qwantani Dusk 2* by **Greg Zaal** and **Jarod
Guest**, [Poly Haven](https://polyhaven.com/a/qwantani_dusk_2), **CC0**. No
attribution required; listed because it's worth knowing where it came from.

## Known issue

`src/assets/old-website.png` is **9.7 MB** (3248×1942). It is the single
biggest thing on the page by two orders of magnitude, and as a texture it costs
roughly 34 MB of VRAM once mipmapped. Displayed at ~1.2 m wide on a wall it
never needs more than ~1024 px:

```bash
sips -Z 1024 src/assets/old-website.png --out src/assets/old-website.png
```

The frame reads the image's real aspect ratio at load time, so resizing it
needs no code change.
