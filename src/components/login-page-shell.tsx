"use client";

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type LoginPageShellProps = {
  children: ReactNode;
  brandName?: string;
  primaryColor?: string;
};

export function LoginPageShell({
  children,
  brandName = "BidCargas",
  primaryColor = "#d3ff01",
}: LoginPageShellProps) {
  return (
    <div
      className="min-h-screen bg-background lg:grid lg:min-h-screen lg:grid-cols-2"
      style={
        {
          ["--brand" as string]: primaryColor,
          ["--accent" as string]: primaryColor,
        } as React.CSSProperties
      }
    >
      <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-12">
        <header className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{brandName}</p>
            <p className="text-xs text-muted">Portal BidCargas</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          {children}
        </div>
      </section>

      <aside className="hero-grid relative hidden overflow-hidden lg:block">
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Publique cargas.
            <br />
            Envie propostas.
            <br />
            Feche frete com transparência.
          </p>
        </div>
      </aside>
    </div>
  );
}
