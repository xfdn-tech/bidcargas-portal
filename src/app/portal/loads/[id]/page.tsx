import { notFound } from "next/navigation";
import { PortalLoadBidsTable } from "@/components/portal-load-bids-table";
import { PortalLoadDetailActions } from "@/components/portal-load-detail-actions";
import { PortalLoadDuplicateButton } from "@/components/portal-load-duplicate-button";
import { PortalLoadForm } from "@/components/portal-load-form";
import { PortalLoadSummary } from "@/components/portal-load-summary";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import { fetchLoadFormCatalogs } from "@/lib/load-form-catalogs";
import type { BidRecord, LoadRecord, Paginated } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bidPage?: string }>;
};

export default async function PortalLoadDetailPage({ params, searchParams }: Props) {
  const user = await requirePortalUser();
  const { id } = await params;
  const rawParams = await searchParams;
  const bidPage = Number(rawParams.bidPage ?? "1") || 1;

  try {
    const load = await serverApi<LoadRecord>(`/portal/loads/${id}`);

    if (load.status === "draft") {
      const catalogs = await fetchLoadFormCatalogs();
      return (
        <PortalLoadForm
          mode="edit"
          load={load}
          currentUserId={user.id}
          {...catalogs}
        />
      );
    }

    const bids = await serverApi<Paginated<BidRecord>>(`/portal/loads/${id}/bids`, {
      searchParams: { page: bidPage, limit: 20 },
    });

    return (
      <div className="space-y-8">
        <PortalLoadSummary load={load} />
        <div className="flex flex-wrap gap-2">
          <PortalLoadDuplicateButton loadId={load.id} />
        </div>
        <PortalLoadDetailActions load={load} />
        <PortalLoadBidsTable load={load} bids={bids.items} />
        <Pagination
          meta={bids.meta}
          pathname={`/portal/loads/${id}`}
          pageParam="bidPage"
        />
      </div>
    );
  } catch {
    notFound();
  }
}
