"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import { withDriverReturnTo } from "@/lib/driver-return-to";
import type { BidRecord, PaginatedMeta } from "@/lib/portal-types";
import {
  bidStatusLabel,
  formatDateTime,
  formatMoneyFromCents,
} from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: BidRecord[];
  meta: PaginatedMeta;
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
  returnFrom: string;
};

export function DriverBidsTable({ items, meta, sort, returnFrom }: Props) {

  const columns: DataTableColumn<BidRecord>[] = [
    {
      id: "load",
      header: "Carga",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">
            {row.load?.title ?? "Carga"}
          </p>
          <p className="text-sm text-muted">
            {row.load
              ? `${row.load.origin} → ${row.load.destination}`
              : "—"}
          </p>
        </div>
      ),
    },
    {
      id: "loadStatus",
      header: "Carga",
      cell: (row) =>
        row.load ? <PortalLoadStatusBadge status={row.load.status} /> : "—",
    },
    {
      id: "amount",
      header: "Valor",
      sortKey: "amount",
      cell: (row) => formatMoneyFromCents(row.amountCents),
    },
    {
      id: "status",
      header: "Proposta",
      sortKey: "status",
      cell: (row) => (
        <span className="badge badge-brand">{bidStatusLabel(row.status)}</span>
      ),
    },
    {
      id: "createdAt",
      header: "Enviada em",
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
        emptyMessage="Você ainda não enviou propostas."
        getRowHref={(row) =>
          withDriverReturnTo(`/driver/loads/${row.loadId}`, returnFrom)
        }
        sort={sort}
      />
      {meta.totalItems > 0 ? (
        <p className="text-sm text-muted">
          {meta.totalItems} proposta{meta.totalItems === 1 ? "" : "s"}
        </p>
      ) : null}
    </>
  );
}
