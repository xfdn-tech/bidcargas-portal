import Link from "next/link";
import { DriverLoadsTable } from "@/components/driver-loads-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireDriverUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { LoadRecord, Paginated } from "@/lib/portal-types";
import { driverListLocation } from "@/lib/driver-return-to";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function DriverLoadsPage({ searchParams }: Props) {
  await requireDriverUser();
  const rawParams = await searchParams;
  const listQuery = parseListQuery(rawParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  const data = await serverApi<Paginated<LoadRecord>>("/driver/loads", {
    searchParams: toApiListParams(listQuery),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargas disponíveis"
        description="Envie propostas para cargas publicadas pelas empresas."
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
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/driver/loads" className="btn-ghost">
          Limpar
        </Link>
      </form>

      {data.meta.totalItems === 0 && !listQuery.search ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Nenhuma carga disponível</p>
          <p className="mt-1 text-sm text-muted">
            Quando uma empresa publicar, a carga aparece nesta lista.
          </p>
        </div>
      ) : (
        <>
          <DriverLoadsTable
            items={data.items}
            meta={data.meta}
            returnFrom={driverListLocation("/driver/loads", {
              ...paginationParams,
              page: listQuery.page > 1 ? listQuery.page : undefined,
            })}
            sort={{
              pathname: "/driver/loads",
              current: toTableSort(listQuery),
              searchParams: paginationParams,
            }}
          />
          <Pagination
            meta={data.meta}
            pathname="/driver/loads"
            searchParams={paginationParams}
          />
        </>
      )}
    </div>
  );
}
