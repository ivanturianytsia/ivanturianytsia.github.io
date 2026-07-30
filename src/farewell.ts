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

export interface Farewell {
  /** Shows it now, bypassing the exit-intent check. Exposed for testing. */
  show: () => void
  dispose: () => void
}

/**
 * Shows a "Let's connect" card when the visitor looks like they're leaving.
 *
 * The signal is the pointer leaving the document near its top edge — the
 * movement toward the tab strip, address bar or close button.
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
    return { show: () => {}, dispose: () => {} }
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

  // A touch device has no cursor to leave the window with, so there is no exit
  // intent to detect and these listeners would only ever be dead weight.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
    show,

    dispose() {
      lifetime.abort()
      if (modal.open) modal.close()
    },
  }
}
