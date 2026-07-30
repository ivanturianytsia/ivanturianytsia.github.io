import * as THREE from 'three'
import { FRAME, INTERIOR, KIT, LEVEL, PICTURES, type PictureConfig, type Wall } from './config'

/**
 * Framed pictures hung on the walls, each with its filename captioned
 * underneath.
 *
 * Textures load asynchronously, so a frame appears immediately and fills in
 * once its image arrives. The frame is also resized at that point to match the
 * image's real aspect ratio — see `fitToAspect`.
 */
export interface Pictures {
  readonly group: THREE.Group
  dispose: () => void
}

export function createPictures(
  renderer: THREE.WebGLRenderer,
  onContentChanged: () => void,
  manager: THREE.LoadingManager,
): Pictures {
  const group = new THREE.Group()
  group.name = 'pictures'

  const loader = new THREE.TextureLoader(manager)
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

  // Set once the world is torn down, so a texture that arrives after disposal
  // is released instead of being attached to a material nobody will render.
  let disposed = false
  const loaded: THREE.Texture[] = []

  for (const config of PICTURES) {
    const picture = createPicture(config)
    group.add(picture.group)

    void loader
      .loadAsync(config.url)
      .then((texture) => {
        if (disposed) {
          texture.dispose()
          return
        }

        // Colour textures must be tagged sRGB or three treats the bytes as
        // linear and everything comes out washed out and too bright.
        texture.colorSpace = THREE.SRGBColorSpace
        // Wall art is nearly always viewed at a glancing angle, which is
        // exactly the case anisotropic filtering exists for.
        texture.anisotropy = maxAnisotropy

        loaded.push(texture)
        // Resizes the frame to the image's real aspect ratio, so the cached
        // shadow map needs another pass.
        picture.applyTexture(texture)
        onContentChanged()
      })
      .catch((error: unknown) => {
        console.error(`Could not load ${config.url}`, error)
      })
  }

  return {
    group,

    dispose() {
      disposed = true
      // The meshes themselves are handled by the scene-graph traversal in
      // `dispose.ts`; these textures are reachable only from here.
      for (const texture of loaded) {
        texture.dispose()
      }
      loaded.length = 0
    },
  }
}

interface Picture {
  readonly group: THREE.Group
  applyTexture: (texture: THREE.Texture) => void
}

function createPicture(config: PictureConfig): Picture {
  const group = new THREE.Group()
  group.name = `picture:${config.caption}`

  const imageMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.58,
    metalness: 0,
    // These are PNGs and some of them have an alpha channel (bless.png is
    // cut out). Without this the cut-out area renders as whatever RGB happens
    // to sit under the transparent pixels — in practice a dirty black box.
    transparent: true,
  })

  // The passe-partout: off-white mount board the print sits inside. Also backs
  // the image, so a cut-out picture reads as printed on white stock rather than
  // as a hole in the frame.
  const mountMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(FRAME.mountColor),
    roughness: 0.85,
    metalness: 0,
  })

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(FRAME.color),
    roughness: 0.42,
    metalness: 0,
  })

  // Provisional square proportions; corrected in fitToAspect once the image
  // reports its real dimensions.
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, FRAME.depth), frameMaterial)
  frame.name = 'frame'
  frame.castShadow = true
  frame.receiveShadow = true
  group.add(frame)

  const mount = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mountMaterial)
  mount.name = 'mount'
  group.add(mount)

  const image = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imageMaterial)
  image.name = 'image'
  group.add(image)

  const caption = createCaption(config.caption)
  group.add(caption)

  const parts: PictureParts = { config, frame, mount, image, caption }
  fitToAspect(1, parts)
  placeOnWall(group, config)

  return {
    group,

    applyTexture(texture) {
      imageMaterial.map = texture
      imageMaterial.needsUpdate = true

      const { width, height } = texture.image as { width: number; height: number }
      if (width > 0 && height > 0) {
        fitToAspect(width / height, parts)
      }
    },
  }
}

interface PictureParts {
  readonly config: PictureConfig
  readonly frame: THREE.Mesh
  readonly mount: THREE.Mesh
  readonly image: THREE.Mesh
  readonly caption: THREE.Mesh
}

/**
 * Lays out frame, mount, image and name for a given image aspect ratio.
 *
 * Geometry is rebuilt rather than scaled: scaling the group would stretch the
 * frame rail, the mount border and the lettering along with the picture.
 *
 * Everything is positioned relative to the image, which stays centred on the
 * group's origin. The mount is taller below than above, so its own centre sits
 * slightly low — hence the offset applied to both the mount and the frame.
 */
function fitToAspect(aspect: number, parts: PictureParts): void {
  const { config, frame, mount, image, caption } = parts
  const { mount: side, mountBottom, border, depth } = FRAME

  const imageHeight = config.height
  const imageWidth = imageHeight * aspect

  const mountWidth = imageWidth + side * 2
  const mountHeight = imageHeight + side + mountBottom
  // Top edge sits `side` above the image, bottom edge `mountBottom` below, so
  // the centre of the board is offset downward by half the difference.
  const mountOffsetY = (side - mountBottom) / 2

  mount.geometry.dispose()
  mount.geometry = new THREE.PlaneGeometry(mountWidth, mountHeight)
  mount.position.set(0, mountOffsetY, depth / 2 + 0.0012)

  frame.geometry.dispose()
  frame.geometry = new THREE.BoxGeometry(
    mountWidth + border * 2,
    mountHeight + border * 2,
    depth,
  )
  frame.position.y = mountOffsetY

  image.geometry.dispose()
  image.geometry = new THREE.PlaneGeometry(imageWidth, imageHeight)
  image.position.z = depth / 2 + 0.0022

  // Printed on the mount, centred in the band below the image.
  caption.position.set(0, -(imageHeight / 2 + mountBottom / 2), depth / 2 + 0.0032)
}

/** Aspect ratio of the caption canvas. Wide enough for a long filename. */
const CAPTION_ASPECT = 10
const CAPTION_CANVAS_WIDTH = 1024

/**
 * Renders caption text into a canvas and hangs it on the wall as a small
 * transparent plane — a museum label.
 *
 * A CanvasTexture keeps this dependency-free: no font loader, no TextGeometry,
 * no extra package. The text is drawn at 1024px wide and minified down, so it
 * stays crisp well past the size it is displayed at.
 */
function createCaption(text: string): THREE.Mesh {
  const width = CAPTION_CANVAS_WIDTH
  const height = Math.round(width / CAPTION_ASPECT)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error('2D canvas context unavailable — cannot render captions')
  }

  const fontSize = Math.round(height * 0.62)
  context.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
  context.fillStyle = FRAME.captionColor
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, width / 2, height / 2, width * 0.96)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  const planeHeight = FRAME.captionHeight / 0.62
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    // Flat against a wall with nothing behind it, so skip depth writes and
    // avoid transparency-sorting artifacts against the wall surface.
    depthWrite: false,
  })

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(planeHeight * CAPTION_ASPECT, planeHeight),
    material,
  )
  mesh.name = 'caption'
  mesh.position.z = 0.002

  return mesh
}

/** Positions and orients a picture group flat against its wall, facing inward. */
function placeOnWall(group: THREE.Group, config: PictureConfig): void {
  const { halfWidth, halfDepth } = INTERIOR
  const { wall, centerY } = config
  // Centre of the wall cell. The stone wall piece has no post down its middle
  // (see KIT.wallPiece), so a cell centre is clear wall — cell 1 of a three-cell
  // wall is the middle of that wall.
  const cellsAlong = wall === 'back' ? LEVEL.cellsX : LEVEL.cellsZ
  const along = (config.cell - (cellsAlong - 1) / 2) * KIT.module

  group.position.y = centerY

  const placement: Record<Wall, () => void> = {
    left: () => {
      group.position.set(-halfWidth, centerY, along)
      group.rotation.y = Math.PI / 2 // face +X
    },
    right: () => {
      group.position.set(halfWidth, centerY, along)
      group.rotation.y = -Math.PI / 2 // face -X
    },
    back: () => {
      group.position.set(along, centerY, halfDepth)
      group.rotation.y = Math.PI // face -Z
    },
  }

  placement[wall]()
}
