import Link from "next/link";
import { PortalVehicleTypesTable } from "@/components/portal-vehicle-types-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { Paginated, VehicleTypeRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function PortalVehicleTypesPage({ searchParams }: Props) {
  await requirePortalUser();

  const listQuery = parseListQuery(await searchParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  const data = await serverApi<Paginated<VehicleTypeRecord>>(
    "/portal/vehicle-types",
    {
      searchParams: toApiListParams(listQuery),
    },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de veículo"
        description="Catálogo global de tipos disponíveis para operação de cargas."
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
          placeholder="Buscar por nome ou categoria..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/portal/vehicle-types" className="btn-ghost">
          Limpar
        </Link>
      </form>

      <PortalVehicleTypesTable
        items={data.items}
        meta={data.meta}
        sort={{
          pathname: "/portal/vehicle-types",
          current: toTableSort(listQuery),
          searchParams: paginationParams,
        }}
      />

      <Pagination
        meta={data.meta}
        pathname="/portal/vehicle-types"
        searchParams={paginationParams}
      />
    </div>
  );
}
