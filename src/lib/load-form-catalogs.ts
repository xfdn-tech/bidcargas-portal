import type {
  BodyTypeRecord,
  LoadRecord,
  LoadSpeciesRecord,
  LoadTypeRecord,
  Paginated,
  UserRecord,
  VehicleTypeRecord,
} from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export async function fetchLoadFormCatalogs() {
  const [vehicleTypes, loadTypes, species, bodyTypes, users, lastLoads] =
    await Promise.all([
      serverApi<Paginated<VehicleTypeRecord>>("/portal/vehicle-types", {
        searchParams: { page: 1, limit: 100 },
      }),
      serverApi<Paginated<LoadTypeRecord>>("/portal/load-types", {
        searchParams: { page: 1, limit: 100 },
      }),
      serverApi<Paginated<LoadSpeciesRecord>>("/portal/load-species", {
        searchParams: { page: 1, limit: 100 },
      }),
      serverApi<Paginated<BodyTypeRecord>>("/portal/body-types", {
        searchParams: { page: 1, limit: 100 },
      }),
      serverApi<Paginated<UserRecord>>("/portal/users", {
        searchParams: { page: 1, limit: 100 },
      }),
      serverApi<Paginated<LoadRecord>>("/portal/loads", {
        searchParams: { page: 1, limit: 1, sortBy: "createdAt", sortDir: "desc" },
      }),
    ]);

  return {
    vehicleTypes: vehicleTypes.items,
    loadTypes: loadTypes.items,
    species: species.items,
    bodyTypes: bodyTypes.items,
    users: users.items,
    lastLoad: lastLoads.items[0] ?? null,
  };
}
