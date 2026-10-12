/** Deploy-time settings. See .env.example. */
export const config = {
  portalLoginUrl: (import.meta.env.VITE_PORTAL_LOGIN_URL as string | undefined) ?? '',
  platformUrl: (import.meta.env.VITE_PLATFORM_URL as string | undefined) ?? '',
};

/** Where the portal sends students back after a successful login. */
export function returnUrl(): string {
  return new URL('/registered.html?registered=1', window.location.origin).href;
}

/** Full portal login URL, or null while the integration isn't configured. */
export function registerUrl(): string | null {
  if (!config.portalLoginUrl) return null;
  try {
    const u = new URL(config.portalLoginUrl);
    u.searchParams.set('redirect_uri', returnUrl());
    return u.href;
  } catch {
    return null;
  }
}
