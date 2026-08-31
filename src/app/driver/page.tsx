import { DriverDashboard } from "@/components/driver-dashboard";
import { requireDriverUser } from "@/lib/auth-server";
import type { DriverDashboardKpis } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export default async function DriverHomePage() {
  const user = await requireDriverUser();
  const dashboard = await serverApi<DriverDashboardKpis>("/driver/dashboard");

  return <DriverDashboard dashboard={dashboard} userName={user.name} />;
}
