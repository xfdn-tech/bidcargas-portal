"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PortalLoadDuplicateButton } from "@/components/portal-load-duplicate-button";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import type { LoadRecord, PaginatedMeta } from "@/lib/portal-types";
import { formatDateTime, formatMoneyFromCents } from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: LoadRecord[];
  meta: PaginatedMeta;
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
};

export function PortalLoadsTable({ items, meta, sort }: Props) {
  const columns: DataTableColumn<LoadRecord>[] = [
    {
      id: "title",
      header: "Carga",
      sortKey: "title",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="text-sm text-muted">
            {row.origin} → {row.destination}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortKey: "status",
      cell: (row) => <PortalLoadStatusBadge status={row.status} />,
    },
    {
      id: "vehicleType",
      header: "Veículo",
      cell: (row) =>
        row.vehicleTypes?.map((item) => item.name).join(", ") ||
        row.vehicleType?.name ||
        "—",
    },
    {
      id: "suggestedPrice",
      header: "Valor",
      cell: (row) =>
        row.suggestedPriceCents != null
          ? formatMoneyFromCents(row.suggestedPriceCents)
          : "A combinar",
    },
    {
      id: "createdAt",
      header: "Criada em",
      sortKey: "createdAt",
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      id: "duplicate",
      header: "",
      cell: (row) => <PortalLoadDuplicateButton loadId={row.id} compact />,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhuma carga cadastrada."
        getRowHref={(row) => `/portal/loads/${row.id}`}
        sort={sort}
      />
      {meta.totalItems > 0 ? (
        <p className="text-sm text-muted">
          {meta.totalItems} carga{meta.totalItems === 1 ? "" : "s"}
        </p>
      ) : null}
    </>
  );
}
