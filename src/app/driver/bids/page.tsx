import Link from "next/link";
import { DriverBidsPhaseFilter } from "@/components/driver-bids-phase-filter";
import { DriverBidsTable } from "@/components/driver-bids-table";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireDriverUser } from "@/lib/auth-server";
import {
  parseListQuery,
  toApiListParams,
  toPaginationSearchParams,
  toTableSort,
} from "@/lib/list-query";
import type { BidRecord, Paginated } from "@/lib/portal-types";
import { driverListLocation } from "@/lib/driver-return-to";
import { parseDriverBidPhase } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
    phase?: string;
  }>;
};

const EMPTY_COPY: Record<
  ReturnType<typeof parseDriverBidPhase>,
  { title: string; description: string }
> = {
  in_progress: {
    title: "Nenhuma proposta em andamento",
    description:
      "Quando você enviar um lance para uma carga publicada ou em negociação, ela aparece aqui.",
  },
  closed: {
    title: "Nenhuma proposta em carga fechada",
    description:
      "Cargas com motorista aceito e ainda não concluídas aparecem neste filtro.",
  },
  completed: {
    title: "Nenhuma proposta em carga concluída",
    description: "As viagens finalizadas com a sua proposta ficam nesta lista.",
  },
  all: {
    title: "Nenhuma proposta ainda",
    description: "Abra uma carga disponível e envie o primeiro lance.",
  },
};

export default async function DriverBidsPage({ searchParams }: Props) {
  await requireDriverUser();
  const rawParams = await searchParams;
  const listQuery = parseListQuery(rawParams);
  const phase = parseDriverBidPhase(rawParams.phase);
  const paginationParams = {
    ...toPaginationSearchParams(listQuery),
    phase,
  };
  const clearHref =
    phase === "in_progress" ? "/driver/bids" : `/driver/bids?phase=${phase}`;

  const data = await serverApi<Paginated<BidRecord>>("/driver/bids", {
    searchParams: {
      ...toApiListParams(listQuery),
      phase: phase === "all" ? undefined : phase,
    },
  });

  const empty = listQuery.search
    ? {
        title: "Nenhuma proposta encontrada",
        description: "Tente outro termo ou limpe a busca.",
      }
    : EMPTY_COPY[phase];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minhas propostas"
        description="Acompanhe o status das propostas enviadas."
      />

      <form className="toolbar">
        {listQuery.sortBy ? (
          <input type="hidden" name="sortBy" value={listQuery.sortBy} />
        ) : null}
        {listQuery.sortDir ? (
          <input type="hidden" name="sortDir" value={listQuery.sortDir} />
        ) : null}
        <input type="hidden" name="phase" value={phase} />
        <input
          name="search"
          defaultValue={listQuery.search}
          placeholder="Buscar título, origem, destino ou produto..."
          className="input-field max-w-sm flex-1"
        />
        <button type="submit" className="btn-secondary btn-inline">
          Buscar
        </button>
        <Link href={clearHref} className="btn-ghost">
          Limpar
        </Link>
      </form>

      <DriverBidsPhaseFilter
        current={phase}
        searchParams={toPaginationSearchParams(listQuery)}
      />

      {data.meta.totalItems === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">{empty.title}</p>
          <p className="mt-1 text-sm text-muted">{empty.description}</p>
        </div>
      ) : (
        <>
          <DriverBidsTable
            items={data.items}
            meta={data.meta}
            returnFrom={driverListLocation("/driver/bids", {
              ...paginationParams,
              page: listQuery.page > 1 ? listQuery.page : undefined,
            })}
            sort={{
              pathname: "/driver/bids",
              current: toTableSort(listQuery),
              searchParams: paginationParams,
            }}
          />
          <Pagination
            meta={data.meta}
            pathname="/driver/bids"
            searchParams={paginationParams}
          />
        </>
      )}
    </div>
  );
}
