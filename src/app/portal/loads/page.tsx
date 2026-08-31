import Link from "next/link";
import { PortalLoadsTable } from "@/components/portal-loads-table";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { LoadRecord, LoadStatus, Paginated } from "@/lib/portal-types";
import { LOAD_STATUSES } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
    status?: string;
  }>;
};

const LOAD_STATUS_FILTER_VALUES = new Set<LoadStatus>(
  LOAD_STATUSES.map((entry) => entry.value),
);

function parseStatusFilter(value?: string): LoadStatus | undefined {
  if (!value) return undefined;
  return LOAD_STATUS_FILTER_VALUES.has(value as LoadStatus)
    ? (value as LoadStatus)
    : undefined;
}

export default async function PortalLoadsPage({ searchParams }: Props) {
  await requirePortalUser();
  const rawParams = await searchParams;
  const listQuery = parseListQuery(rawParams);
  const statusFilter = parseStatusFilter(rawParams.status);
  const paginationParams = {
    ...toPaginationSearchParams(listQuery),
    status: statusFilter,
  };

  const data = await serverApi<Paginated<LoadRecord>>("/portal/loads", {
    searchParams: {
      ...toApiListParams(listQuery),
      status: statusFilter,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargas"
        description="Publique cargas e acompanhe propostas de motoristas."
        actions={
          <ButtonLink href="/portal/loads/new" variant="primary">
            Nova carga
          </ButtonLink>
        }
      />

      <form className="toolbar">
        {listQuery.sortBy ? (
          <input type="hidden" name="sortBy" value={listQuery.sortBy} />
        ) : null}
        {listQuery.sortDir ? (
          <input type="hidden" name="sortDir" value={listQuery.sortDir} />
        ) : null}
        <input
          name="search"
          defaultValue={listQuery.search}
          placeholder="Buscar título, origem ou destino..."
          className="input-field max-w-sm flex-1"
        />
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="input-field max-w-[12rem]"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {LOAD_STATUSES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/portal/loads" className="btn-ghost">
          Limpar
        </Link>
      </form>

      {data.meta.totalItems === 0 && !listQuery.search && !statusFilter ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Nenhuma carga ainda</p>
          <p className="mt-1 text-sm text-muted">
            Publique a primeira carga da empresa para receber propostas.
          </p>
          <div className="mt-4">
            <ButtonLink href="/portal/loads/new" variant="primary">
              Criar carga
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <PortalLoadsTable
            items={data.items}
            meta={data.meta}
            sort={{
              pathname: "/portal/loads",
              current: toTableSort(listQuery),
              searchParams: paginationParams,
            }}
          />
          <Pagination
            meta={data.meta}
            pathname="/portal/loads"
            searchParams={paginationParams}
          />
        </>
      )}
    </div>
  );
}
