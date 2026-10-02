/**
 * Three events to PostHog, and nothing else.
 *
 * Deliberately not `posthog-js`. The official snippet pulls in ~97 KB gzipped of
 * autocapture, session replay, surveys and feature flags — several times the
 * size of all the code on this page — to send what is here three POSTs. The
 * capture endpoint is a public, documented JSON API built for exactly this.
 *
 * Also deliberately stateless: no cookie, no localStorage, a fresh random id per
 * page load. Nothing is stored on the visitor's device, which is what keeps this
 * clear of a consent banner. The cost is that a returning visitor counts as new,
 * which for a personal site is the right trade.
 */

/**
 * Public by design — PostHog project tokens can only *write* events, and ship
 * in every page that uses PostHog. It is not a secret.
 */
const TOKEN = 'phc_xLFsxG7W6nkHnksnFPZ95aki76b6R8ctskjcdtscMdph'

/**
 * The project lives in PostHog's EU cloud. Region matters: a token sent to the
 * wrong one is accepted with a 200 and the events silently vanish.
 */
const CAPTURE_URL = 'https://eu.i.posthog.com/i/v0/e/'

export type AnalyticsEvent = 'room_ready' | 'first_look' | 'linkedin_clicked'

type Properties = Readonly<Record<string, string | number | boolean>>

/** One per page load, shared by its events so they line up as one visit. */
const visitId = crypto.randomUUID()

/**
 * Sends one event. Fire-and-forget: analytics must never be able to break or
 * slow the page, so every failure is swallowed.
 *
 * Off in development, so tuning sessions don't flood the numbers — it logs to
 * the console there instead. `npm run preview` serves the production build and
 * sends for real, which is how to test it end to end.
 */
export function track(event: AnalyticsEvent, properties: Properties = {}): void {
  const payload = {
    api_key: TOKEN,
    event,
    distinct_id: visitId,
    properties: {
      ...properties,
      // Anonymous event: no person profile is created for the random id, which
      // would otherwise be one throwaway "person" per visit.
      $process_person_profiles: false,
      $session_id: visitId,
      $current_url: location.href,
      $host: location.host,
      $pathname: location.pathname,
      $referrer: document.referrer === '' ? '$direct' : document.referrer,
      $raw_user_agent: navigator.userAgent,
      $screen_width: screen.width,
      $screen_height: screen.height,
      $viewport_width: innerWidth,
      $viewport_height: innerHeight,
      // Which exit-intent strategy this visitor gets — see farewell.ts.
      pointer: matchMedia('(pointer: fine)').matches ? 'fine' : 'coarse',
      ms_since_load: Math.round(performance.now()),
    },
  }

  if (import.meta.env.DEV) {
    console.info('[analytics]', event, payload.properties)
    return
  }

  // keepalive lets the request outlive the page, for an event fired just
  // before the visitor leaves. Not sendBeacon: it cannot send a JSON body
  // cross-origin without a preflight it is not allowed to make.
  void fetch(CAPTURE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {})
}
