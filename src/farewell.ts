/** Where "Let's connect" points. */
const LINKEDIN = 'https://www.linkedin.com/in/ivan-turianytsia-6a707a100/'

/**
 * How close to the top edge the pointer must be when it leaves.
 *
 * Generous on purpose. The first version of this required `clientY <= 0` and
 * never fired in practice: when you flick the cursor up to the tab strip, the
 * browser reports the exit at a small *positive* clientY — it samples the
 * position on the way out, not at the exact boundary. Anything in the top
 * hundred pixels is heading for the browser chrome.
 *
 * This is the one knob to turn if it still feels reluctant. Raising it toward
 * `window.innerHeight` makes any exit count, in any direction.
 */
const TOP_EDGE_PX = 100

/**
 * Touch devices have no cursor, so there is no pointer-leaving-the-window signal
 * to read. The industry proxies are back-button interception, fast upward
 * scroll, and idle time; the first is history manipulation and the second needs
 * a scrolling page, which this isn't — the canvas fills the viewport and nothing
 * scrolls. That leaves inactivity, which is the honest one anyway.
 *
 * The single number to tune if it feels early or late. 5s: someone is either
 * actively looking around, or they have finished and are ready to go.
 */
const IDLE_MS = 5_000

/** Anything that counts as "still here". */
const INTERACTION_EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown'] as const

export interface Farewell {
  /**
   * Starts watching. Called once the loading screen has faded, so the idle
   * timer measures time spent *in the room* rather than time spent waiting for
   * it to download.
   */
  arm: () => void
  /** Shows it now, bypassing the exit-intent check. Exposed for testing. */
  show: () => void
  dispose: () => void
}

/**
 * Shows a "Let's connect" card when the visitor looks like they're leaving.
 *
 * Two strategies, because the signal differs by device.
 *
 * **With a cursor:** the pointer leaving the document near its top edge — the
 * movement toward the tab strip, address bar or close button.
 *
 * **On touch:** inactivity. There is no cursor to leave the window, and of the
 * usual proxies, back-button interception means manipulating history and fast
 * upward scroll needs a scrolling page, which this is not. Idle time is what
 * remains, and it is the least user-hostile of the three.
 *
 * `mouseleave` on the document element rather than `mouseout` on the document:
 * mouseleave fires only once the pointer has left the element *and all its
 * descendants*, and does not bubble, so it means exactly "left the page".
 * `mouseout` bubbles from every element the cursor crosses, so it needs a
 * `relatedTarget === null` test to mean the same thing — that test is kept below
 * as a second path, since the two do not fire identically across browsers.
 *
 * Deliberately not `beforeunload`: browsers no longer allow custom content
 * there, and abusing it to trap people is what got it restricted. Deliberately
 * not `blur`/`visibilitychange` either — those fire on every alt-tab, which
 * would make this nag rather than say goodbye.
 */
export function createFarewell(): Farewell {
  const dialog = document.querySelector<HTMLDialogElement>('#farewell')
  const link = document.querySelector<HTMLAnchorElement>('#farewell-link')

  if (dialog === null) {
    return { arm: () => {}, show: () => {}, dispose: () => {} }
  }

  // Re-bound after the guard: narrowing from the check above does not reach
  // into the closures below, since TypeScript can't know when they run.
  const modal: HTMLDialogElement = dialog

  if (link !== null) {
    link.href = LINKEDIN
  }

  const lifetime = new AbortController()
  const { signal } = lifetime

  function show(): void {
    // The only suppression there is: don't re-open something already open.
    // Nothing is persisted, so a page reload starts completely fresh.
    if (modal.open) return
    modal.showModal()
  }

  function maybeShow(clientY: number): void {
    if (clientY > TOP_EDGE_PX) return
    show()
  }

  const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

  // --- Touch: idle timer ----------------------------------------------------
  let idleTimer: number | undefined

  function stopIdleTimer(): void {
    if (idleTimer !== undefined) {
      clearTimeout(idleTimer)
      idleTimer = undefined
    }
  }

  function restartIdleTimer(): void {
    stopIdleTimer()
    if (modal.open) return
    idleTimer = window.setTimeout(show, IDLE_MS)
  }

  let idleModeOn = false

  function enableIdleMode(): void {
    if (idleModeOn) return
    idleModeOn = true

    for (const name of INTERACTION_EVENTS) {
      document.addEventListener(name, restartIdleTimer, { signal, passive: true })
    }

    // Deliberately not restarted when the card is dismissed. Doing so would loop
    // — dismiss, wait, reappear, forever — for someone sitting perfectly still.
    // The next interaction arms it again, which mirrors the pointer behaviour:
    // it takes an action before it can show a second time.
    modal.addEventListener('close', stopIdleTimer, { signal })

    restartIdleTimer()
  }

  // Any real touch switches this device to the idle strategy, whatever the media
  // query claimed. A laptop with a touchscreen reports `pointer: fine`, so
  // trusting the query alone would leave someone touching that screen with no
  // exit intent at all.
  document.addEventListener('touchstart', enableIdleMode, { signal, passive: true, once: true })

  // --- Pointer: cursor leaving the window -----------------------------------
  if (hasPointer) {
    document.documentElement.addEventListener(
      'mouseleave',
      (event: MouseEvent) => maybeShow(event.clientY),
      { signal },
    )

    // Second path. mouseleave is the precise signal, but it can be missed when
    // the pointer exits very fast or over browser UI; a bubbled mouseout with no
    // relatedTarget means the cursor went somewhere outside the document too.
    document.addEventListener(
      'mouseout',
      (event: MouseEvent) => {
        if (event.relatedTarget !== null) return
        maybeShow(event.clientY)
      },
      { signal },
    )
  }

  modal
    .querySelector<HTMLButtonElement>('#farewell-close')
    ?.addEventListener('click', () => modal.close(), { signal })

  // Clicking the backdrop closes it. The dialog element itself fills the whole
  // viewport, so the check is whether the click landed outside the card.
  modal.addEventListener(
    'click',
    (event: MouseEvent) => {
      const box = modal.getBoundingClientRect()
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom
      if (!inside) modal.close()
    },
    { signal },
  )

  return {
    arm() {
      if (!hasPointer) enableIdleMode()
    },

    show,

    dispose() {
      stopIdleTimer()
      lifetime.abort()
      if (modal.open) modal.close()
    },
  }
}
