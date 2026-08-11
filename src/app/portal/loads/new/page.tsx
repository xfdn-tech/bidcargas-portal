import { PortalLoadForm } from "@/components/portal-load-form";
import { requirePortalUser } from "@/lib/auth-server";
import type { Paginated, VehicleTypeRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export default async function NewPortalLoadPage() {
  await requirePortalUser();

  const vehicleTypes = await serverApi<Paginated<VehicleTypeRecord>>(
    "/portal/vehicle-types",
    { searchParams: { page: 1, limit: 100 } },
  );

  return <PortalLoadForm mode="create" vehicleTypes={vehicleTypes.items} />;
}
