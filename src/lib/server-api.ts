import { cookies } from "next/headers";
import { resolveApiUrl } from "@/lib/api-url";
import { formatApiErrorMessage } from "@/lib/api";
import { AUTH_CLIENT, AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

function buildCookieHeader(
  jar: Awaited<ReturnType<typeof cookies>>,
): string {
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  return token ? `${AUTH_COOKIE_NAME}=${token}` : "";
}

type ServerFetchOptions = RequestInit & {
  json?: unknown;
  searchParams?: Record<string, string | number | undefined>;
};

export async function serverApi<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { json, searchParams, headers, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${resolveApiUrl()}${normalizedPath}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const jar = await cookies();
  const cookieHeader = buildCookieHeader(jar);

  const response = await fetch(url.toString(), {
    ...rest,
    cache: "no-store",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      "X-Auth-Client": AUTH_CLIENT,
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
  });

  const text = await response.text();
  const data = text.trim() ? (JSON.parse(text) as unknown) : {};

  if (!response.ok) {
    throw new Error(formatApiErrorMessage(data));
  }

  return data as T;
}
