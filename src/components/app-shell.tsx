"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { logout, type AuthUser } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { PortalSidebar } from "@/components/portal-sidebar";
import { cn } from "@/lib/cn";

type AppShellProps = {
  user: AuthUser;
  children: ReactNode;
};

export function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const brand =
    user.account?.settings?.brandName ??
    user.account?.name ??
    user.impersonating?.accountName ??
    "Portal";
  const subtitle =
    user.account?.slug ?? user.impersonating?.accountSlug ?? "portal";

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <PortalSidebar
          brand={brand}
          subtitle={subtitle}
          className="fixed inset-y-0 left-0 z-30"
        />
      </div>

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <PortalSidebar
        brand={brand}
        subtitle={subtitle}
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Portal da empresa
              </p>
              <p className="text-sm font-medium text-foreground">{brand}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            {user.isImpersonating ? (
              <span className="rounded-full bg-brand-soft px-2 py-1 text-xs font-medium text-brand">
                Personificação
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
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
