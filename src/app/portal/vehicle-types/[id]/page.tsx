import { notFound } from "next/navigation";
import {
  FormCard,
  FormSection,
  FormShell,
} from "@/components/ui/form-layout";
import { requirePortalUser } from "@/lib/auth-server";
import type { VehicleTypeRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export default async function PortalVehicleTypeDetailPage({ params }: Props) {
  await requirePortalUser();
  const { id } = await params;

  let vehicleType: VehicleTypeRecord;
  try {
    vehicleType = await serverApi<VehicleTypeRecord>(
      `/portal/vehicle-types/${id}`,
    );
  } catch {
    notFound();
  }

  return (
    <FormShell
      backHref="/portal/vehicle-types"
      backLabel="Voltar para tipos de veículo"
      title={vehicleType.name}
      description="Detalhes do tipo de veículo no catálogo da plataforma."
    >
      <FormCard>
        <FormSection title="Informações gerais">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailField label="Nome" value={vehicleType.name} />
            <DetailField
              label="Categoria"
              value={vehicleType.category?.name ?? "—"}
            />
            <DetailField label="Eixos" value={vehicleType.axles} />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Status
              </p>
              <span className="badge badge-success">Ativo</span>
            </div>
          </div>
        </FormSection>
      </FormCard>
    </FormShell>
  );
}
