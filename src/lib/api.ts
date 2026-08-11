import { resolveApiUrl } from "@/lib/api-url";

type ApiOptions = RequestInit & { json?: unknown };

export type AuthUser = {
  id: string;
  accountId: string;
  homeAccountId?: string | null;
  email: string;
  name: string;
  role: "super_admin" | "account_admin" | "account_user" | "driver";
  isImpersonating?: boolean;
  impersonating?: {
    accountId: string;
    accountName: string;
    accountSlug: string;
  } | null;
  account?: {
    id: string;
    name: string;
    slug: string;
    status?: string;
    settings?: {
      brandName?: string | null;
      primaryColor?: string | null;
      logoUrl?: string | null;
    } | null;
  } | null;
};

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

function formatApiErrorMessage(data: unknown, fallback = "Erro na requisição") {
  if (!data || typeof data !== "object") return fallback;
  const message = (data as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro na requisição",
) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

async function readApiResponseData(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.trim() };
  }
}

function throwApiError(response: Response, data: unknown): never {
  throw new ApiError(formatApiErrorMessage(data), response.status);
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { json, headers, credentials, ...rest } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${resolveApiUrl()}${normalizedPath}`, {
    ...rest,
    credentials: credentials ?? "include",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
  });

  const data = await readApiResponseData(response);
  if (!response.ok) {
    throwApiError(response, data);
  }
  return data as T;
}

export async function logout(): Promise<void> {
  await api("/auth/logout", { method: "POST" });
}

export function isPortalRole(role: string): boolean {
  return role === "account_admin" || role === "account_user";
}
