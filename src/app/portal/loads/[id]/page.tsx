import { notFound } from "next/navigation";
import { PortalLoadBidsTable } from "@/components/portal-load-bids-table";
import { PortalLoadDetailActions } from "@/components/portal-load-detail-actions";
import { PortalLoadForm } from "@/components/portal-load-form";
import { PortalLoadSummary } from "@/components/portal-load-summary";
import { Pagination } from "@/components/ui/pagination";
import { requirePortalUser } from "@/lib/auth-server";
import type {
  BidRecord,
  LoadRecord,
  Paginated,
  VehicleTypeRecord,
} from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bidPage?: string }>;
};

export default async function PortalLoadDetailPage({ params, searchParams }: Props) {
  await requirePortalUser();
  const { id } = await params;
  const rawParams = await searchParams;
  const bidPage = Number(rawParams.bidPage ?? "1") || 1;

  try {
    const load = await serverApi<LoadRecord>(`/portal/loads/${id}`);

    const [bids, vehicleTypes] = await Promise.all([
      serverApi<Paginated<BidRecord>>(`/portal/loads/${id}/bids`, {
        searchParams: { page: bidPage, limit: 20 },
      }),
      load.status === "draft"
        ? serverApi<Paginated<VehicleTypeRecord>>("/portal/vehicle-types", {
            searchParams: { page: 1, limit: 100 },
          })
        : Promise.resolve(null),
    ]);

    if (load.status === "draft") {
      return (
        <PortalLoadForm
          mode="edit"
          load={load}
          vehicleTypes={vehicleTypes?.items ?? []}
        />
      );
    }

    return (
      <div className="space-y-8">
        <PortalLoadSummary load={load} />
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
