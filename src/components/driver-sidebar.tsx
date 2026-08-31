"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/nav-icon";
import { cn } from "@/lib/cn";

const SECTIONS = [
  {
    id: "main",
    label: "Operação",
    items: [
      { id: "home", href: "/driver", label: "Painel", iconKey: "home", exactMatch: true },
      { id: "loads", href: "/driver/loads", label: "Cargas", iconKey: "package" },
      { id: "bids", href: "/driver/bids", label: "Minhas propostas", iconKey: "clipboard" },
    ],
  },
  {
    id: "account",
    label: "Conta",
    items: [
      { id: "profile", href: "/driver/profile", label: "Perfil", iconKey: "user" },
    ],
  },
];

type DriverSidebarProps = {
  brand?: string;
  onNavigate?: () => void;
  className?: string;
};

export function DriverSidebar({
  brand = "BidCargas",
  onNavigate,
  className,
}: DriverSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-card text-foreground",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm">
          <NavIcon iconKey="truck" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">{brand}</p>
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted">
            Portal do motorista
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {SECTIONS.map((section) => (
          <div key={section.id} className="space-y-1">
            <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = item.exactMatch
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-soft text-brand ring-1 ring-brand/20"
                      : "text-muted hover:bg-surface hover:text-foreground",
                  )}
                >
                  <NavIcon iconKey={item.iconKey} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
