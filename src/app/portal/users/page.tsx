import Link from "next/link";
import { PortalUsersTable } from "@/components/portal-users-table";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { getSessionUser, requirePortalUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { Paginated, UserQuota, UserRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function PortalUsersPage({ searchParams }: Props) {
  await requirePortalUser();
  const session = await getSessionUser();
  const canManage =
    session?.role === "account_admin" || session?.role === "super_admin";

  const listQuery = parseListQuery(await searchParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  const [data, quota] = await Promise.all([
    serverApi<Paginated<UserRecord>>("/portal/users", {
      searchParams: toApiListParams(listQuery),
    }),
    serverApi<UserQuota>("/portal/users/quota").catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários da empresa"
        description={
          quota?.hasTeamUsersFeature && quota.max != null
            ? `Equipe com acesso ao portal. ${quota.used} de ${quota.max} usuários do plano.`
            : "Equipe com acesso ao portal da embarcadora."
        }
        actions={
          canManage ? (
            <ButtonLink href="/portal/users/new" variant="primary">
              Novo usuário
            </ButtonLink>
          ) : undefined
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
          placeholder="Buscar por nome ou e-mail..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href="/portal/users" className="btn-ghost">
          Limpar
        </Link>
      </form>

      <PortalUsersTable
        items={data.items}
        meta={data.meta}
        canManage={canManage}
        sort={{
          pathname: "/portal/users",
          current: toTableSort(listQuery),
          searchParams: paginationParams,
        }}
      />

      <Pagination
        meta={data.meta}
        pathname="/portal/users"
        searchParams={paginationParams}
      />
    </div>
  );
}
