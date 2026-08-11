"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { PaginatedMeta, VehicleTypeRecord } from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: VehicleTypeRecord[];
  meta: PaginatedMeta;
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
};

export function PortalVehicleTypesTable({ items, meta, sort }: Props) {
  const columns: DataTableColumn<VehicleTypeRecord>[] = [
    {
      id: "name",
      header: "Nome",
      sortKey: "name",
      cell: (row) => (
        <p className="font-medium text-foreground">{row.name}</p>
      ),
    },
    {
      id: "category",
      header: "Categoria",
      sortKey: "category",
      cell: (row) => row.category?.name ?? "—",
    },
    {
      id: "axles",
      header: "Eixos",
      sortKey: "axles",
      cell: (row) => row.axles,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhum tipo de veículo disponível."
        getRowHref={(row) => `/portal/vehicle-types/${row.id}`}
        sort={sort}
      />
      {meta.totalItems > 0 ? (
        <p className="text-sm text-muted">
          {meta.totalItems} tipo{meta.totalItems === 1 ? "" : "s"} de veículo
        </p>
      ) : null}
    </>
  );
}
