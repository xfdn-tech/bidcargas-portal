"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import { withDriverReturnTo } from "@/lib/driver-return-to";
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
  returnFrom: string;
};

export function DriverLoadsTable({ items, meta, sort, returnFrom }: Props) {

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
      id: "account",
      header: "Empresa",
      cell: (row) => row.account?.name ?? "—",
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
      header: "Publicada em",
      sortKey: "createdAt",
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhuma carga disponível."
        getRowHref={(row) =>
          withDriverReturnTo(`/driver/loads/${row.id}`, returnFrom)
        }
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
