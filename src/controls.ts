import * as THREE from 'three'

export interface Controls {
  update: (dt: number) => void
  /** Sets the view direction immediately, with no easing. */
  setOrientation: (yaw: number, pitch: number) => void
  dispose: () => void
}

export interface ControlsOptions {
  /** Fired once, the first time the visitor moves the view at all. */
  onFirstLook?: () => void
}

/** Radians of rotation per CSS pixel dragged. */
const LOOK_SPEED = 0.0026
/** Radians per second while an arrow / WASD key is held. */
const KEY_SPEED = 1.5
/** Easing rate. Used as 1-exp(-RATE*dt) so feel is frame-rate independent. */
const DAMPING_RATE = 14
/** Stop just short of straight up/down; past the pole the view flips. */
const MAX_PITCH = THREE.MathUtils.degToRad(85)

const YAW_KEYS_LEFT = ['ArrowLeft', 'KeyA'] as const
const YAW_KEYS_RIGHT = ['ArrowRight', 'KeyD'] as const
const PITCH_KEYS_UP = ['ArrowUp', 'KeyW'] as const
const PITCH_KEYS_DOWN = ['ArrowDown', 'KeyS'] as const

const LOOK_KEYS: ReadonlySet<string> = new Set<string>([
  ...YAW_KEYS_LEFT,
  ...YAW_KEYS_RIGHT,
  ...PITCH_KEYS_UP,
  ...PITCH_KEYS_DOWN,
])

/**
 * Look-around-from-one-spot controls: drag or swipe to turn and to look up and
 * down. Position is fixed; this only ever touches rotation.
 *
 * Direction follows the panorama convention every photosphere viewer uses —
 * you grab the room and pull it, so dragging right turns the view left.
 */
export function createControls(
  camera: THREE.PerspectiveCamera,
  target: HTMLElement,
  options: ControlsOptions = {},
): Controls {
  // YXZ is what makes this work. Under the default XYZ order, combining yaw
  // and pitch introduces roll and the horizon visibly tilts as you look around.
  camera.rotation.order = 'YXZ'

  let yaw = camera.rotation.y
  let pitch = camera.rotation.x
  let yawTarget = yaw
  let pitchTarget = pitch

  let dragging = false
  let lastX = 0
  let lastY = 0
  let hasLooked = false

  const pressed = new Set<string>()
  const lifetime = new AbortController()
  const { signal } = lifetime

  function noteFirstLook(): void {
    if (hasLooked) return
    hasLooked = true
    options.onFirstLook?.()
  }

  // Pointer Events with capture: one code path covers mouse drag, touch swipe
  // and pen, and capture means a drag that leaves the canvas keeps tracking.
  target.addEventListener(
    'pointerdown',
    (event: PointerEvent) => {
      if (!event.isPrimary) return
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      target.setPointerCapture(event.pointerId)
    },
    { signal },
  )

  target.addEventListener(
    'pointermove',
    (event: PointerEvent) => {
      if (!dragging || !event.isPrimary) return

      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY

      yawTarget += dx * LOOK_SPEED
      pitchTarget = THREE.MathUtils.clamp(pitchTarget + dy * LOOK_SPEED, -MAX_PITCH, MAX_PITCH)
      noteFirstLook()
    },
    { signal },
  )

  function endDrag(event: PointerEvent): void {
    dragging = false
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }
  }

  target.addEventListener('pointerup', endDrag, { signal })
  target.addEventListener('pointercancel', endDrag, { signal })

  // Keyboard equivalent, so the room is navigable without a pointer at all.
  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (!LOOK_KEYS.has(event.code)) return
      event.preventDefault() // arrows would otherwise try to scroll
      pressed.add(event.code)
    },
    { signal },
  )

  window.addEventListener(
    'keyup',
    (event: KeyboardEvent) => {
      pressed.delete(event.code)
    },
    { signal },
  )

  // A blurred window never delivers keyup, which would leave the view spinning.
  window.addEventListener('blur', () => pressed.clear(), { signal })

  function axis(negative: readonly string[], positive: readonly string[]): number {
    let value = 0
    if (negative.some((code) => pressed.has(code))) value -= 1
    if (positive.some((code) => pressed.has(code))) value += 1
    return value
  }

  return {
    update(dt) {
      // Left arrow turns you left, which is a yaw increase — same sign
      // convention as dragging the room to the right.
      const yawInput = axis(YAW_KEYS_RIGHT, YAW_KEYS_LEFT)
      const pitchInput = axis(PITCH_KEYS_DOWN, PITCH_KEYS_UP)

      if (yawInput !== 0 || pitchInput !== 0) {
        yawTarget += yawInput * KEY_SPEED * dt
        pitchTarget = THREE.MathUtils.clamp(
          pitchTarget + pitchInput * KEY_SPEED * dt,
          -MAX_PITCH,
          MAX_PITCH,
        )
        noteFirstLook()
      }

      // Exponential smoothing: identical feel at 60Hz and 144Hz, unlike a
      // fixed per-frame lerp factor.
      const alpha = 1 - Math.exp(-DAMPING_RATE * dt)
      yaw += (yawTarget - yaw) * alpha
      pitch += (pitchTarget - pitch) * alpha

      camera.rotation.y = yaw
      camera.rotation.x = pitch
    },

    setOrientation(nextYaw, nextPitch) {
      yaw = nextYaw
      yawTarget = nextYaw
      pitch = THREE.MathUtils.clamp(nextPitch, -MAX_PITCH, MAX_PITCH)
      pitchTarget = pitch
      camera.rotation.y = yaw
      camera.rotation.x = pitch
    },

    dispose() {
      lifetime.abort()
      pressed.clear()
    },
  }
}
