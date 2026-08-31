import Link from "next/link";
import { PortalAddDriverFavoriteForm } from "@/components/portal-add-driver-favorite-form";
import { PortalDriverFavoritesTable } from "@/components/portal-driver-favorites-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { DriverFavoriteRecord, Paginated } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function PortalDriverFavoritesPage({ searchParams }: Props) {
  await requirePortalUser();
  const listQuery = parseListQuery(await searchParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  const data = await serverApi<Paginated<DriverFavoriteRecord>>(
    "/portal/driver-favorites",
    { searchParams: toApiListParams(listQuery) },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Motoristas favoritos"
        description="Marque motoristas que já enviaram proposta para facilitar convites e acompanhamento."
      />

      <PortalAddDriverFavoriteForm />

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
          placeholder="Buscar nome, CPF, telefone ou anotação..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/portal/driver-favorites" className="btn-ghost">
          Limpar
        </Link>
      </form>

      <PortalDriverFavoritesTable
        items={data.items}
        sort={{
          pathname: "/portal/driver-favorites",
          current: toTableSort(listQuery),
          searchParams: paginationParams,
        }}
      />

      <Pagination
        meta={data.meta}
        pathname="/portal/driver-favorites"
        searchParams={paginationParams}
      />
    </div>
  );
}
