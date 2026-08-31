import { notFound } from "next/navigation";
import { DriverBidForm } from "@/components/driver-bid-form";
import { PortalLoadSummary } from "@/components/portal-load-summary";
import { requireDriverUser } from "@/lib/auth-server";
import { safeDriverReturnTo } from "@/lib/driver-return-to";
import type { LoadRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function DriverLoadDetailPage({ params, searchParams }: Props) {
  await requireDriverUser();
  const { id } = await params;
  const { from } = await searchParams;
  const returnTo = safeDriverReturnTo(from);

  let load: LoadRecord;
  try {
    load = await serverApi<LoadRecord>(`/driver/loads/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PortalLoadSummary load={load} />
      {load.account?.name ? (
        <p className="text-sm text-muted">
          Empresa:{" "}
          <span className="font-medium text-foreground">{load.account.name}</span>
        </p>
      ) : null}
      <DriverBidForm load={load} returnTo={returnTo} />
    </div>
  );
}
