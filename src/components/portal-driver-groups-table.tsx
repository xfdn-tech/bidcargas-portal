"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { DriverGroupRecord, PaginatedMeta } from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: DriverGroupRecord[];
  meta: PaginatedMeta;
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
};

export function PortalDriverGroupsTable({ items, meta, sort }: Props) {
  const columns: DataTableColumn<DriverGroupRecord>[] = [
    {
      id: "name",
      header: "Grupo",
      sortKey: "name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          {row.description ? (
            <p className="text-sm text-muted line-clamp-2">{row.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: "members",
      header: "Motoristas",
      cell: (row) => String(row.memberCount ?? 0),
    },
    {
      id: "sortOrder",
      header: "Ordem",
      sortKey: "sortOrder",
      cell: (row) => String(row.sortOrder),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhum grupo cadastrado ainda."
        getRowHref={(row) => `/portal/driver-groups/${row.id}`}
        sort={sort}
      />
      {meta.totalItems > 0 ? (
        <p className="text-sm text-muted">
          {meta.totalItems} grupo{meta.totalItems === 1 ? "" : "s"}
        </p>
      ) : null}
    </>
  );
}
