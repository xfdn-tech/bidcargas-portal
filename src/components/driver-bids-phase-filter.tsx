import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  DRIVER_BID_PHASES,
  type DriverBidPhase,
} from "@/lib/portal-types";

type Props = {
  current: DriverBidPhase;
  searchParams?: Record<string, string | undefined>;
};

export function DriverBidsPhaseFilter({ current, searchParams }: Props) {
  return (
    <nav
      className="flex flex-wrap gap-2"
      aria-label="Filtrar propostas por situação da carga"
    >
      {DRIVER_BID_PHASES.map((entry) => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("phase", entry.value);
        for (const [key, value] of Object.entries(searchParams ?? {})) {
          if (key !== "page" && key !== "phase" && value) {
            params.set(key, value);
          }
        }
        const active = current === entry.value;
        return (
          <Link
            key={entry.value}
            href={`/driver/bids?${params.toString()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition",
              active
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-card text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
