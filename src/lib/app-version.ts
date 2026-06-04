/**
 * App version metadata. Bump VERSION whenever you ship a meaningful change so
 * you can tell prod from local in the footer / DevTools without spelunking.
 *
 * Build hash is wired through Vite's `define` in vite.config.ts so each deploy
 * stamps the actual git short SHA. Falls back to "dev" when running locally.
 */
export const APP_VERSION = 'v2026.05.31';
export const APP_BUILD = (import.meta.env.VITE_BUILD_SHA as string | undefined) ?? 'dev';
export const APP_VERSION_LABEL = `${APP_VERSION}${APP_BUILD && APP_BUILD !== 'dev' ? `+${APP_BUILD}` : ''}`;
