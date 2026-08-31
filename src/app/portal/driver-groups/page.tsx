import Link from "next/link";
import { PortalDriverGroupsTable } from "@/components/portal-driver-groups-table";
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
import type { DriverGroupRecord, Paginated } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function PortalDriverGroupsPage({ searchParams }: Props) {
  await requirePortalUser();
  const listQuery = parseListQuery(await searchParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  const data = await serverApi<Paginated<DriverGroupRecord>>(
    "/portal/driver-groups",
    { searchParams: toApiListParams(listQuery) },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos de motoristas"
        description="Organize motoristas que já participaram de propostas nas cargas da empresa."
        actions={
          <ButtonLink href="/portal/driver-groups/new" variant="primary">
            Novo grupo
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
          placeholder="Buscar nome ou descrição..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/portal/driver-groups" className="btn-ghost">
          Limpar
        </Link>
      </form>

      <PortalDriverGroupsTable
        items={data.items}
        meta={data.meta}
        sort={{
          pathname: "/portal/driver-groups",
          current: toTableSort(listQuery),
          searchParams: paginationParams,
        }}
      />

      <Pagination
        meta={data.meta}
        pathname="/portal/driver-groups"
        searchParams={paginationParams}
      />
    </div>
  );
}
