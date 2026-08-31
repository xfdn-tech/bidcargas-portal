import { PortalDashboard } from "@/components/portal-dashboard";
import { requirePortalUser } from "@/lib/auth-server";
import type { DashboardKpis } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export default async function PortalHomePage() {
  const user = await requirePortalUser();
  const dashboard = await serverApi<DashboardKpis>("/portal/dashboard");
  const accountName =
    user.account?.name ?? user.impersonating?.accountName ?? "sua empresa";

  return (
    <PortalDashboard
      dashboard={dashboard}
      accountName={accountName}
      userName={user.name}
    />
  );
}
