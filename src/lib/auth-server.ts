import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api";
import { isPortalRole } from "@/lib/api";
import { resolveApiUrl } from "@/lib/api-url";

function buildCookieHeader(
  jar: Awaited<ReturnType<typeof cookies>>,
): string {
  return jar
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  if (!jar.get("access_token")) {
    return null;
  }

  const response = await fetch(`${resolveApiUrl()}/auth/me`, {
    headers: { cookie: buildCookieHeader(jar) },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthUser>;
}

export async function requirePortalUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user || !isPortalRole(user.role)) {
    redirect("/login");
  }

  if (user.role === "super_admin" && !user.isImpersonating) {
    redirect("/login");
  }

  return user;
}
