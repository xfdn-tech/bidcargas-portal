import { notFound } from "next/navigation";
import { PortalLoadDriverRating } from "@/components/portal-load-driver-rating";
import { PortalLoadBidsTable } from "@/components/portal-load-bids-table";
import { PortalLoadDetailActions } from "@/components/portal-load-detail-actions";
import { PortalLoadDuplicateButton } from "@/components/portal-load-duplicate-button";
import { PortalLoadForm } from "@/components/portal-load-form";
import { PortalLoadSummary } from "@/components/portal-load-summary";
import { requirePortalUser } from "@/lib/auth-server";
import { fetchLoadFormCatalogs } from "@/lib/load-form-catalogs";
import type {
  BidRecord,
  BidStatus,
  DriverRatingContext,
  LoadRecord,
  Paginated,
} from "@/lib/portal-types";
import { BID_STATUSES } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    bidPage?: string;
    bidSort?: string;
    bidStatus?: string;
  }>;
};

const BID_STATUS_VALUES = new Set<BidStatus>(BID_STATUSES.map((entry) => entry.value));

const BID_SORT_OPTIONS = new Set([
  "amount:asc",
  "amount:desc",
  "createdAt:desc",
  "createdAt:asc",
  "deadlineAt:asc",
]);

function parseBidSort(value?: string) {
  if (value && BID_SORT_OPTIONS.has(value)) {
    const [sortBy, sortDir] = value.split(":") as [string, "asc" | "desc"];
    return { sortBy, sortDir };
  }
  return { sortBy: "amount", sortDir: "asc" as const };
}

function parseBidStatus(value?: string): BidStatus | undefined {
  if (!value) return undefined;
  return BID_STATUS_VALUES.has(value as BidStatus)
    ? (value as BidStatus)
    : undefined;
}

export default async function PortalLoadDetailPage({ params, searchParams }: Props) {
  const user = await requirePortalUser();
  const { id } = await params;
  const rawParams = await searchParams;
  const bidPage = Number(rawParams.bidPage ?? "1") || 1;
  const bidSort = parseBidSort(rawParams.bidSort);
  const bidStatus = parseBidStatus(rawParams.bidStatus);

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
      searchParams: {
        page: bidPage,
        limit: 10,
        sortBy: bidSort.sortBy,
        sortDir: bidSort.sortDir,
        status: bidStatus,
      },
    });

    const ratingContext =
      load.status === "closed" || load.status === "completed"
        ? await serverApi<DriverRatingContext>(`/portal/loads/${id}/driver-rating`)
        : null;

    return (
      <div className="space-y-5">
        <PortalLoadSummary load={load} />

        <div className="load-detail-toolbar">
          <PortalLoadDuplicateButton loadId={load.id} />
          <PortalLoadDetailActions load={load} variant="toolbar" />
        </div>

        <PortalLoadBidsTable
          load={load}
          bids={bids.items}
          meta={bids.meta}
          filters={{
            sortBy: bidSort.sortBy,
            sortDir: bidSort.sortDir,
            status: bidStatus,
          }}
        />

        {ratingContext ? (
          <PortalLoadDriverRating loadId={load.id} initial={ratingContext} />
        ) : null}
      </div>
    );
  } catch {
    notFound();
  }
}
