import type { BidStatus, LoadStatus } from "@/lib/portal-types";
import { bidStatusLabel, loadStatusLabel } from "@/lib/portal-types";
import { cn } from "@/lib/cn";

const LOAD_BADGE_CLASS: Record<LoadStatus, string> = {
  draft: "badge badge-muted",
  published: "badge badge-brand",
  negotiating: "badge badge-warning",
  closed: "badge badge-success",
  cancelled: "badge badge-muted",
  completed: "badge badge-success",
};

const BID_BADGE_CLASS: Record<BidStatus, string> = {
  pending: "badge badge-warning",
  accepted: "badge badge-success",
  rejected: "badge badge-muted",
  cancelled: "badge badge-muted",
};

export function PortalLoadStatusBadge({ status }: { status: LoadStatus }) {
  return (
    <span className={cn(LOAD_BADGE_CLASS[status])}>{loadStatusLabel(status)}</span>
  );
}

export function PortalBidStatusBadge({ status }: { status: BidStatus }) {
  return (
    <span className={cn(BID_BADGE_CLASS[status])}>{bidStatusLabel(status)}</span>
  );
}
