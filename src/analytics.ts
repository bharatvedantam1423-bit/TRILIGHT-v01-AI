/**
 * Funnel events for PRD §6 / §15: page_view → cta_click → login_success →
 * platform_redirect, plus scroll depth. Pushes to window.dataLayer, which
 * GTM or GA4 (gtag) can pick up; nothing is sent until one is installed.
 */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
}

/**
 * Sends one funnel event. GTM (VITE_GTM_ID) reads it from the dataLayer;
 * GA4 direct (VITE_GA_ID) gets it as a gtag event. With neither set, it is
 * only queued, so nothing leaves the page.
 */
export function track(event: string, props: Props = {}) {
  const name = `trl8_${event}`;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...props });
  if (typeof window.gtag === 'function') window.gtag('event', name, props);
}
