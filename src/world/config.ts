/**
 * Every tunable number for the environment, in one place.
 *
 * This is the file to open first. Edit anything here and the running scene
 * rebuilds instantly while your camera stays exactly where it was — see the
 * HMR note in `src/main.ts`. Units are metres and degrees.
 */
import blessUrl from '../assets/bless.png'
import fantasyPropsUrl from '../assets/fantasy-props.glb'
import medievalKitUrl from '../assets/medieval-kit.glb'
import oldWebsiteUrl from '../assets/old-website.jpg'
import berlinTrainUrl from '../assets/berlin-train.jpg'

/** Which wall a picture hangs on. */
export type Wall = 'left' | 'right' | 'back'

export interface PictureConfig {
  readonly url: string
  readonly caption: string
  readonly wall: Wall
  /**
   * Which wall cell it hangs on, counted from the low corner. On a three-cell
   * wall, 1 is the middle.
   */
  readonly cell: number
  readonly height: number
  readonly centerY: number
}

/** Which side of the room a wall sits on. */
export type Edge = 'north' | 'south' | 'east' | 'west'

/**
 * The modular kit the room is built from — Quaternius Medieval Village MegaKit,
 * CC0.
 *
 * These three numbers were measured from the asset, not guessed, and every
 * placement offset depends on them. If you swap kits, re-measure.
 */
export const KIT = {
  url: medievalKitUrl,
  /** Grid cell size. Floor tiles are 2x2 and walls are 2 wide. */
  module: 2,
  /** Wall pieces are 3.125 tall, so that is the ceiling height. */
  wallHeight: 3.125,
  /**
   * Which windowed wall to use.
   *
   * `Wall_Plaster_Window_Wide_Round` is plaster with a brick apron built into
   * the mesh below the sill — that patch of stone is authored into the piece and
   * can't be removed without editing the model. The UnevenBrick variant is the
   * same opening in a fully stone wall, so the window reads as framed in stone
   * rather than as a plaster wall with a stone patch under it.
   */
  windowPiece: 'Wall_UnevenBrick_Window_Wide_Round',
  /**
   * Which plain wall to use.
   *
   * Stone, not plaster, for a specific reason: `Wall_Plaster_Straight` carries a
   * 12cm timber post dead down its centre (measured — timber at local x = -0.06
   * and +0.06). That post lands exactly where you would want to hang something,
   * and it cannot be removed without editing the mesh, since all of the piece's
   * woodwork is one merged mesh. `Wall_UnevenBrick_Straight` has no geometry at
   * all between y 1.0 and 2.6 — a clear wall — and it matches the stone window.
   */
  wallPiece: 'Wall_UnevenBrick_Straight',
  /**
   * A wall's visible face sits this far in front of its placement origin; the
   * remaining thickness hangs off behind. Needed so anything hung on a wall
   * lands on the surface rather than buried inside it.
   */
  wallFaceOffset: 0.092,
} as const

/**
 * The floor plan, as data.
 *
 * A rectangle of cells with walls around the perimeter. Grow `cellsX`/`cellsZ`
 * and the room grows with it — floor, ceiling and walls all follow, because
 * everything is derived rather than positioned by hand.
 *
 * `windows` replaces a plain wall with a windowed one. `index` counts along that
 * edge from the low corner.
 */
export const LEVEL = {
  cellsX: 3,
  cellsZ: 3,
  windows: [{ edge: 'north', index: 1 }],
} as const satisfies {
  cellsX: number
  cellsZ: number
  windows: readonly { edge: Edge; index: number }[]
}

/**
 * Fantasy Props MegaKit (Quaternius, CC0), merged into one file so every prop
 * shares a single download and one material set.
 *
 * Names are the glTF node names. Most match the source filename; `Chest_Armature`
 * is the odd one out because that chest ships rigged, so its armature is the
 * scene root rather than a plain mesh.
 *
 * Position is [x, y, z] in metres. y is almost always 0 — the props are authored
 * standing on their own origin — except for things sitting on the table, which
 * take the table's 0.81m height.
 */
export const PROPS_URL = fantasyPropsUrl

const TABLE_TOP = 0.81

export interface PropConfig {
  readonly piece: string
  readonly position: readonly [number, number, number]
  readonly rotationY: number
  /**
   * How `position.y` is interpreted.
   *
   * `base` (the default) treats it as where the object's lowest point goes, and
   * the prop is measured and dropped onto it — right for anything standing on
   * the floor, and it corrects models whose origin is not at their feet.
   *
   * `origin` uses the y as given. Needed for anything that hangs: a banner's
   * origin is its mount point with the cloth falling ~1.5m below it, so
   * grounding it would stand it on the floor instead of hanging it on the wall.
   */
  readonly anchor?: 'base' | 'origin'
}

export const PROPS: readonly PropConfig[] = [

  // Bookshelves along the east wall, backs to it.
  { piece: 'Bookcase_2', position: [2.66, 0, -1.6], rotationY: -90 },
  { piece: 'Bookcase_2', position: [2.66, 0, 0.5], rotationY: -90 },

  // Working corner: cauldron by the window wall, chest and barrel stowed.
  { piece: 'Cauldron', position: [-2.1, 0, -2.1], rotationY: 20 },
  { piece: 'Chest_Armature', position: [-2.45, 0, 1.5], rotationY: 90 },
  { piece: 'Barrel', position: [1.35, 0, -2.5], rotationY: 0 },

  // Table pushed to the south half, so the middle of the room stays clear.
  { piece: 'Table_Large', position: [0, 0, 1.9], rotationY: 0 },
  { piece: 'Chair_1', position: [-0.7, 0, 1.0], rotationY: 0 },
  { piece: 'CandleStick_Triple', position: [0.7, TABLE_TOP, 1.9], rotationY: -25 },
  { piece: 'Book_Stack_1', position: [-0.5, TABLE_TOP, 1.75], rotationY: 15 },
]

/**
 * Room extents, derived from the grid so there is one source of truth. Anything
 * that needs to know how big the room is — picture placement, the sun's shadow
 * frustum — reads this rather than repeating the numbers.
 */
export const ROOM = {
  width: LEVEL.cellsX * KIT.module,
  depth: LEVEL.cellsZ * KIT.module,
  height: KIT.wallHeight,
} as const

/** Inner wall surfaces, i.e. where a picture actually hangs. */
export const INTERIOR = {
  halfWidth: ROOM.width / 2 - KIT.wallFaceOffset,
  halfDepth: ROOM.depth / 2 - KIT.wallFaceOffset,
} as const

export const SUN = {
  /**
   * Degrees above the horizon.
   *
   * This one is fussier than it looks. Too low and the light thrown through
   * the window overshoots the floor entirely and climbs the far wall (below
   * ~30° with this room's proportions it runs past the back wall); too high
   * and the patch collapses into a puddle right under the sill. 34° lands it
   * fully on the floor, a little past the middle of the room.
   */
  elevation: 30,
  /**
   * Degrees, clockwise from straight-through-the-window.
   * 0 would put the sun dead ahead and flatten everything; offsetting it
   * throws the light patch sideways across the floor, which reads far better.
   * Keep it modest — past ~20° the patch slides so far to one side that you
   * have to turn away from the window to see it.
   */
  azimuth: 18,
  /** Direct sunlight strength. */
  intensity: 4,
  color: 0xffcf9e,
} as const

export const SHADOW = {
  /**
   * Half-extent of the sun's orthographic shadow frustum. Sized to the room's
   * bounding sphere (radius ≈ 3.47m) and no larger — every metre of slack here
   * is resolution thrown away, and it shows up directly as a stair-stepped
   * edge on the patch of light on the floor.
   */
  extent: 4.6,
  mapSize: 4096,
} as const

export const OUTSIDE = {
  /**
   * The view out of the window: your own photo of the Fernsehturm at dusk, with
   * an S-Bahn coming in below.
   *
   * A flat photo, hung on a backdrop plane beyond the window — not an HDRI. It
   * is an ordinary LDR photograph rather than a 360° panorama, and mapping one
   * as an equirectangular environment would wrap it round the whole sphere and
   * bend the horizon. A plane is the honest fit: you only ever see ~25° of the
   * outside through that arch, so a flat backdrop has no visible distortion,
   * uses the photo at near full resolution, and costs 414 KB instead of the
   * 1.5–6.3 MB the panoramas did.
   */
  url: berlinTrainUrl,

  /**
   * Backdrop placement, in metres. Height is not set here: it is derived from
   * the photo's own aspect ratio once it loads, so swapping in a differently
   * shaped photo can never stretch it.
   *
   * Width trades coverage against how much of the photo you see. Portrait photos
   * get tall fast, so a plane wide enough to hide its edges from the far corners
   * would only show a thin band of the image through the arch. 8m covers anyone
   * standing within ~2m of the room's centre line; from the corners you may
   * catch the edge, where the same photo shows through as the background.
   */
  backdrop: {
    width: 8,
    /** How far beyond the window wall it hangs. Far enough to read as distance. */
    distance: 6,
    /**
     * Where the plane's centre hangs. The viewpoint never moves (the controls
     * only rotate), so what the arch frames is fixed and can be composed exactly.
     *
     * Tuned by projecting the arch's opening onto the backdrop from the viewpoint
     * and placing the photo inside it: the Fernsehturm sits about 72% across the
     * opening, with the spire clear of the arch curve. The geometric centre of
     * the right third (83%) looked jammed against the edge, because the arch
     * narrows towards the top exactly where the spire is.
     * Moving the plane left or down moves the photo left or down in the window.
     */
    centerX: -0.6,
    centerY: 1.75,
  },

  /**
   * The same photo also supplies the room's ambient light, so the warmth on the
   * walls matches the sunset you can see. Its lack of real HDR range doesn't
   * matter much here: three prefilters the environment down to 256px, and the
   * sun and bounce light carry the actual shading.
   */
  rotationDeg: 0,
  blurriness: 0,
  intensity: 1,
} as const

export const LIGHTING = {
  /**
   * Strength of the ambient fill contributed by the HDR panorama. This is what
   * keeps the shadow side of the room from going black — it does the job an
   * AmbientLight would do, but with correct directionality.
   *
   * Balance this against SUN.intensity: push it too high and the sun stops
   * reading as sun, because everything is already lit and the patch on the
   * floor has nothing to contrast against.
   */
  // Raised from 0.4 when the HDRI became an LDR photo: a photograph caps at
  // white and this one is 40% dark rooftops, so it carries far less light.
  environmentIntensity: 1.1,
  /** Renderer tone-mapping exposure. */
  exposure: 1,
  /**
   * Stand-in for interior bounce light.
   *
   * The sky environment map alone lights an up-facing floor with pure sky, so
   * anything out of the sun goes cold navy — physically what you'd get in a
   * roofless room, and quite wrong for an interior. A real room is filled with
   * warm light bounced off its own walls and floor, which needs global
   * illumination we do not have. A hemisphere light is the cheap honest
   * approximation: warm from above, warmer from below, no shadows, no cost.
   *
   * Upgrade path if this ever needs to be exact: prefilter the environment map
   * from a scene that includes the room's own interior surfaces, so the bounce
   * is derived rather than dialled in.
   */
  bounce: {
    intensity: 0.55,
    fromAbove: 0xd8cfc2,
    fromBelow: 0x8a7358,
  },
} as const

export const VIEWPOINT = {
  /** Eye height above the floor. */
  eye: 1.62,
  /** Standing position on the floor plane, relative to room centre. */
  x: 0,
  z: 0,
  /**
   * Initial view direction, degrees. Yaw 0 looks toward -Z (the window).
   * Angled slightly so the window is off-centre and the sunlit floor is in
   * frame — dead-on symmetry reads as a screenshot, not a place.
   */
  /**
   * Angled across the room's diagonal so the window and the desk are both in
   * frame from the start — the light source and the thing it lights.
   */
  yaw: 180,
  pitch: -3,
} as const

/**
 * Framed pictures on the walls.
 *
 * `wall` picks which surface it hangs on; `along` slides it left/right on that
 * wall (metres from the wall's centre); `height` is the picture's height, with
 * width derived from the image's own aspect ratio once it loads — so swapping
 * in a differently-shaped image reframes itself instead of getting squashed.
 */
export const PICTURES = [
  {
    url: oldWebsiteUrl,
    caption: 'old-website.jpg',
    wall: 'back',
    cell: 1,
    height: 1.48,
    centerY: 1.72,
  },
  {
    url: blessUrl,
    caption: 'bless.png',
    wall: 'left',
    cell: 1,
    height: 0.84,
    centerY: 1.55,
  },
] as const satisfies readonly PictureConfig[]

export const FRAME = {
  /** Width of the frame rail itself, outside the mount. */
  border: 0.05,
  /** How far the frame stands off the wall. */
  depth: 0.04,
  color: 0x121212,

  /**
   * White passe-partout — the mount board the print sits inside. Also shows
   * through any transparent pixels in the image itself, which is why it is pure
   * white rather than a warmer off-white: both images already contain white, and
   * a tinted mount reads as a mismatch against them.
   */
  mountColor: 0xffffff,
  /** Mount width at the top and sides. Kept slim on purpose. */
  mount: 0.075,
  /**
   * Mount width along the bottom, wider than the sides.
   *
   * This is how picture framing is actually done — a "weighted" mount, because
   * an even border reads as bottom-heavy to the eye. It also happens to be where
   * the title goes, so the extra depth earns itself twice.
   */
  mountBottom: 0.17,

  /** Cap height of the name printed on the mount. */
  captionHeight: 0.052,
  captionColor: '#141414',
} as const
