"use client";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { PaginatedMeta, UserRecord } from "@/lib/portal-types";
import { PORTAL_USER_ROLES, USER_STATUSES, portalRoleLabel } from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: UserRecord[];
  meta: PaginatedMeta;
  canManage: boolean;
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
};

function statusLabel(status: UserRecord["status"]) {
  return USER_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

export function PortalUsersTable({ items, meta, canManage, sort }: Props) {
  const columns: DataTableColumn<UserRecord>[] = [
    {
      id: "name",
      header: "Nome",
      sortKey: "name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-sm text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      id: "role",
      header: "Perfil",
      sortKey: "role",
      cell: (row) => (
        <span className="badge badge-brand">{portalRoleLabel(row.role)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortKey: "status",
      cell: (row) => (
        <span
          className={
            row.status === "active" ? "badge badge-success" : "badge badge-muted"
          }
        >
          {statusLabel(row.status)}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhum usuário cadastrado na empresa."
        getRowHref={
          canManage ? (row) => `/portal/users/${row.id}` : undefined
        }
        sort={sort}
      />
      {meta.totalItems > 0 ? (
        <p className="text-sm text-muted">
          {meta.totalItems} usuário{meta.totalItems === 1 ? "" : "s"}
        </p>
      ) : null}
    </>
  );
}

export { PORTAL_USER_ROLES };
