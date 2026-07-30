import * as THREE from 'three'

export interface LoadingScreen {
  /**
   * Hand this to every loader in the world. Anything constructed with it feeds
   * the progress line automatically.
   */
  readonly manager: THREE.LoadingManager
  /**
   * Waits for every queued asset, runs `prepare`, then fades the black overlay
   * out — which is what makes the scene appear to rise out of black.
   */
  reveal: (prepare: () => Promise<unknown>) => Promise<void>
}

/** Must stay in step with the transition duration in style.css. */
const FADE_MS = 900

/**
 * Upper bound on how long the black screen can last. A single asset that 404s or
 * stalls on a bad connection must not strand a visitor staring at nothing.
 */
const SAFETY_TIMEOUT_MS = 15_000

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function createLoadingScreen(): LoadingScreen {
  const overlay = document.querySelector<HTMLElement>('#loading')
  const bar = document.querySelector<HTMLElement>('#loading-bar')

  function setProgress(fraction: number): void {
    if (bar === null) return
    const clamped = Math.min(1, Math.max(0, fraction))
    bar.style.transform = `scaleX(${clamped.toFixed(4)})`
  }

  let resolveAssets = (): void => {}
  const assetsLoaded = new Promise<void>((resolve) => {
    resolveAssets = resolve
  })

  const manager = new THREE.LoadingManager()

  manager.onProgress = (_url, loaded, total) => {
    setProgress(total === 0 ? 0 : loaded / total)
  }

  manager.onLoad = () => {
    resolveAssets()
  }

  manager.onError = (url) => {
    // Deliberately does not reject. three's loaders call itemError followed by
    // itemEnd, so a failed asset still counts toward the total and onLoad still
    // fires — one missing texture should cost you that texture, not the room.
    console.error(`Loading failed: ${url}`)
  }

  return {
    manager,

    async reveal(prepare) {
      await Promise.race([assetsLoaded, delay(SAFETY_TIMEOUT_MS)])
      setProgress(1)

      // Compile shaders while the screen is still black. Skipping this just
      // moves the cost: the fade completes and then the first frame stalls for
      // a beat building programs, which is the most conspicuous place for a
      // hitch to land.
      try {
        await prepare()
      } catch (error) {
        console.error('Shader precompile failed', error)
      }

      overlay?.setAttribute('data-hidden', 'true')
      await delay(FADE_MS)
      // Gone rather than merely transparent, so it can never intercept a drag.
      overlay?.remove()
    },
  }
}
