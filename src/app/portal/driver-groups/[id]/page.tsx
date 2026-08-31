import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalDriverGroupMembers } from "@/components/portal-driver-group-members";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
} from "@/lib/list-query";
import type {
  DriverGroupMemberRecord,
  DriverGroupRecord,
  Paginated,
} from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
  }>;
};

export default async function PortalDriverGroupDetailPage({
  params,
  searchParams,
}: Props) {
  await requirePortalUser();
  const { id } = await params;
  const listQuery = parseListQuery(await searchParams);
  const paginationParams = toPaginationSearchParams(listQuery);

  let group: DriverGroupRecord;
  let members: Paginated<DriverGroupMemberRecord>;

  try {
    [group, members] = await Promise.all([
      serverApi<DriverGroupRecord>(`/portal/driver-groups/${id}`),
      serverApi<Paginated<DriverGroupMemberRecord>>(
        `/portal/driver-groups/${id}/members`,
        { searchParams: toApiListParams(listQuery) },
      ),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={group.name}
        description={
          group.description ||
          "Gerencie os motoristas deste grupo e edite as informações do cadastro."
        }
        actions={
          <ButtonLink href={`/portal/driver-groups/${id}/edit`} variant="secondary">
            Editar grupo
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
          placeholder="Buscar motorista do grupo por nome, CPF ou telefone..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href={`/portal/driver-groups/${id}`} className="btn-ghost">
          Limpar
        </Link>
      </form>

      <PortalDriverGroupMembers groupId={id} members={members.items} />

      <Pagination
        meta={members.meta}
        pathname={`/portal/driver-groups/${id}`}
        searchParams={paginationParams}
      />

      <p className="text-sm text-muted">
        <Link href="/portal/driver-groups" className="link-muted">
          Voltar para grupos
        </Link>
      </p>
    </div>
  );
}
