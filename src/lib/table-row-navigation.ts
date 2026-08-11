"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/cn";

export function shouldIgnoreRowNavigation(target: EventTarget | null) {
  return Boolean(
    target instanceof Element &&
      target.closest(
        "a, button, input, select, textarea, [data-row-nav-ignore]",
      ),
  );
}

export function useTableRowNavigation() {
  const router = useRouter();

  function getRowProps(href: string | undefined, className?: string) {
    if (!href) {
      return { className };
    }

    return {
      className: cn("ui-table-row-clickable", className),
      role: "link" as const,
      tabIndex: 0,
      "aria-label": "Abrir detalhes",
      onClick: (event: MouseEvent<HTMLTableRowElement>) => {
        if (shouldIgnoreRowNavigation(event.target)) return;
        router.push(href);
      },
      onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        router.push(href);
      },
    };
  }

  return { getRowProps };
}
