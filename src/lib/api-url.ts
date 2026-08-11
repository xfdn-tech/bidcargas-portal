/** URL da API — browser usa proxy same-origin `/api`; SSR fala direto com a API. */
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

  const proxy = (
    process.env.API_PROXY_TARGET ?? "http://localhost:3060"
  ).replace(/\/$/, "");
  return `${proxy}/api`;
}
