"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  buildSortHref,
  type TableSort,
} from "@/lib/list-query";
import { useTableRowNavigation } from "@/lib/table-row-navigation";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  sortKey?: string;
};

type DataTableSortConfig = {
  pathname: string;
  current: TableSort;
  searchParams?: Record<string, string | undefined>;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  className?: string;
  getRowHref?: (row: T) => string | undefined;
  sort?: DataTableSortConfig;
};

function SortIndicator({
  active,
  dir,
}: {
  active: boolean;
  dir?: "asc" | "desc";
}) {
  if (!active) {
    return (
      <span className="ui-table-sort-icon ui-table-sort-icon-idle" aria-hidden="true">
        ↕
      </span>
    );
  }

  return (
    <span className="ui-table-sort-icon" aria-hidden="true">
      {dir === "desc" ? "↓" : "↑"}
    </span>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "Nenhum registro encontrado.",
  className,
  getRowHref,
  sort,
}: DataTableProps<T>) {
  const { getRowProps } = useTableRowNavigation();

  if (!rows.length) {
    return (
      <div className={cn("ui-table-empty", className)}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("ui-table-wrap overflow-x-auto", className)}>
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} className={column.headerClassName}>
                {column.sortKey && sort ? (
                  <Link
                    href={buildSortHref(
                      sort.pathname,
                      column.sortKey,
                      sort.current,
                      sort.searchParams,
                    )}
                    className="ui-table-sort-link"
                    aria-sort={
                      sort.current.by === column.sortKey
                        ? sort.current.dir === "desc"
                          ? "descending"
                          : "ascending"
                        : "none"
                    }
                  >
                    <span>{column.header}</span>
                    <SortIndicator
                      active={sort.current.by === column.sortKey}
                      dir={
                        sort.current.by === column.sortKey
                          ? sort.current.dir
                          : undefined
                      }
                    />
                  </Link>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = getRowHref?.(row);
            const rowProps = getRowProps(href);

            return (
              <tr key={rowKey(row)} {...rowProps}>
                {columns.map((column) => (
                  <td key={column.id} className={column.cellClassName}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
