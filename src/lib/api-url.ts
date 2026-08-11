/** URL da API — browser usa proxy same-origin `/api`; SSR usa o mesmo proxy via loopback. */
export function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const isAbsolute =
    configured?.startsWith("http://") || configured?.startsWith("https://");

  if (typeof window !== "undefined") {
    if (!configured || configured.startsWith("/")) {
      return (configured ?? "/api").replace(/\/$/, "") || "/api";
    }
    if (!window.location.hostname.includes("localhost")) {
      return "/api";
    }
    return configured.replace(/\/$/, "");
  }

  if (configured && isAbsolute) {
    return configured.replace(/\/$/, "");
  }

  const appPort = process.env.PORT?.trim();
  if (appPort && (!configured || configured.startsWith("/"))) {
    return `http://127.0.0.1:${appPort}/api`;
  }

  const proxy = (
    process.env.API_PROXY_TARGET ?? "http://127.0.0.1:3050"
  ).replace(/\/$/, "");
  return `${proxy}/api`;
}
