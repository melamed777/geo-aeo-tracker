/**
 * Same-origin API/base-path helper.
 *
 * In production the app is served under a subpath (leto.ddns.net/geo), which is
 * wired via Next.js `basePath`. `basePath` prefixes framework-generated URLs
 * (assets, <Link>, router), but NOT raw `fetch("/api/...")` calls — so every
 * client-side API call must go through `apiPath()` to include the prefix.
 *
 * NEXT_PUBLIC_BASE_PATH is inlined at build time (e.g. "/geo"); in local dev it
 * is empty, so paths stay rooted at "/".
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function apiPath(path: string): string {
  return `${BASE}${path}`;
}
