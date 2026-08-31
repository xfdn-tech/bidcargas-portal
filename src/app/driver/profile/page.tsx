import { DriverProfileForm } from "@/components/driver-profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireDriverUser } from "@/lib/auth-server";
import type { DriverProfileRecord, DriverVehicleRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export default async function DriverProfilePage() {
  await requireDriverUser();
  const [profile, vehicles] = await Promise.all([
    serverApi<DriverProfileRecord>("/driver/profile"),
    serverApi<DriverVehicleRecord[]>("/driver/vehicles"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        description="Seus dados de motorista e veículos cadastrados."
      />
      <DriverProfileForm profile={profile} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Veículos</h2>
        {vehicles.length === 0 ? (
          <p className="text-sm text-muted">Nenhum veículo cadastrado ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Placa</th>
                  <th className="px-4 py-3">Veículo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Principal</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{vehicle.plate}</td>
                    <td className="px-4 py-3">
                      {[vehicle.brand, vehicle.model, vehicle.year]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.vehicleType?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {vehicle.isPrimary ? "Sim" : "Não"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
