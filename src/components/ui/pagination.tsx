import Link from "next/link";
import type { PaginatedMeta } from "@/lib/ui-types";
import { cn } from "@/lib/cn";

type PaginationProps = {
  meta: PaginatedMeta;
  pathname: string;
  searchParams?: Record<string, string | undefined>;
  className?: string;
};

function buildHref(
  pathname: string,
  page: number,
  searchParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page" && value) {
        params.set(key, value);
      }
    }
  }
  return `${pathname}?${params.toString()}`;
}

export function Pagination({
  meta,
  pathname,
  searchParams,
  className,
}: PaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages, totalItems } = meta;

  return (
    <div className={cn("ui-pagination", className)}>
      <p className="ui-pagination-meta">
        {totalItems} registro{totalItems === 1 ? "" : "s"} · página {currentPage}{" "}
        de {totalPages}
      </p>
      <div className="ui-pagination-actions">
        {currentPage > 1 ? (
          <Link
            href={buildHref(pathname, currentPage - 1, searchParams)}
            className="ui-btn ui-btn-secondary ui-btn-sm"
          >
            Anterior
          </Link>
        ) : null}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(pathname, currentPage + 1, searchParams)}
            className="ui-btn ui-btn-secondary ui-btn-sm"
          >
            Próxima
          </Link>
        ) : null}
      </div>
    </div>
  );
}
