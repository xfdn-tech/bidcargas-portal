"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logout, type AuthUser } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

type AppShellProps = {
  user: AuthUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();
  const brand =
    user.account?.settings?.brandName ??
    user.account?.name ??
    user.impersonating?.accountName ??
    "Portal";

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div>
            <p className="text-sm font-semibold text-foreground">{brand}</p>
            <p className="text-xs text-muted">
              {user.account?.slug ?? user.impersonating?.accountSlug ?? "portal"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            {user.isImpersonating ? (
              <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-medium text-brand">
                Impersonação
              </span>
            ) : null}
            <ThemeToggle />
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-surface"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
