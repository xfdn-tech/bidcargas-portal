const DEFAULT_BASE_DOMAIN =
  process.env.NEXT_PUBLIC_ACCOUNT_BASE_DOMAIN ?? "bidcargas.local";

/** Slug da account a partir do host ({slug}.bidcargas.local). */
export function resolveAccountSlugFromHostname(hostname: string): string | null {
  const base = DEFAULT_BASE_DOMAIN.toLowerCase();
  const host = hostname.toLowerCase();
  const suffix = `.${base}`;
  if (!host.endsWith(suffix) || host === base) {
    return null;
  }
  const slug = host.slice(0, -suffix.length);
  if (!slug || slug.includes(".")) {
    return null;
  }
  return slug;
}

/** Slug implícito no host (whitelabel); vazio em localhost genérico. */
export function resolveClientAccountSlug(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return resolveAccountSlugFromHostname(window.location.hostname) ?? "";
}
