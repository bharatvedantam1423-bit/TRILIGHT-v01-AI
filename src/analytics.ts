/**
 * Funnel events for PRD §6 / §15: page_view → cta_click → login_success →
 * platform_redirect, plus scroll depth. Pushes to window.dataLayer, which
 * GTM or GA4 (gtag) can pick up; nothing is sent until one is installed.
 */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window { dataLayer?: unknown[] }
}

export function track(event: string, props: Props = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: `trl8_${event}`, ...props });
}
