const DRIVER_PREFIX = "/driver";

export function safeDriverReturnTo(value?: string | null): string | null {
  if (!value) return null;

  let path = value.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      path = `${url.pathname}${url.search}`;
    }
  } catch {
    return null;
  }

  if (!path.startsWith(DRIVER_PREFIX)) return null;
  if (path.startsWith("//") || path.includes("://")) return null;

  const pathname = path.split("?")[0] ?? "";
  if (pathname !== DRIVER_PREFIX && !pathname.startsWith(`${DRIVER_PREFIX}/`)) {
    return null;
  }
  if (/^\/driver\/loads\/[^/]+/.test(pathname)) {
    return null;
  }

  return path;
}

export function withDriverReturnTo(href: string, from: string) {
  const params = new URLSearchParams();
  params.set("from", from);
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${params.toString()}`;
}

export function driverListLocation(
  pathname: string,
  params: Record<string, string | number | undefined>,
) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      qs.set(key, String(value));
    }
  }
  const search = qs.toString();
  return search ? `${pathname}?${search}` : pathname;
}
