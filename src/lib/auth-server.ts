import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api";
import { canAccessDriverPortal, canAccessPortal } from "@/lib/api";
import { AUTH_CLIENT, AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { resolveApiUrl } from "@/lib/api-url";

export async function getSessionUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const response = await fetch(`${resolveApiUrl()}/auth/me`, {
    headers: {
      cookie: `${AUTH_COOKIE_NAME}=${token}`,
      "X-Auth-Client": AUTH_CLIENT,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<AuthUser>;
}

export async function requirePortalUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (canAccessDriverPortal(user)) {
    redirect("/driver");
  }
  if (!canAccessPortal(user)) {
    redirect("/login");
  }

  return user;
}

export async function requireDriverUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (canAccessPortal(user)) {
    redirect("/portal");
  }
  if (!canAccessDriverPortal(user)) {
    redirect("/login");
  }
  return user;
}

export async function requireAccountAdmin(): Promise<AuthUser> {
  const user = await requirePortalUser();
  if (user.role !== "account_admin" && user.role !== "super_admin") {
    redirect("/portal");
  }
  return user;
}
