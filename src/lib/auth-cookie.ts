export const AUTH_CLIENT = "portal" as const;
export const AUTH_COOKIE_NAME = "bidcargas_portal_token";

export function buildAuthCookieHeader(token: string): string {
  return `${AUTH_COOKIE_NAME}=${token}`;
}
