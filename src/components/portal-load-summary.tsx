import type { ReactNode } from "react";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import type { LoadRecord } from "@/lib/portal-types";
import { formatDateTime, formatMoneyFromCents } from "@/lib/portal-types";

type Props = {
  load: LoadRecord;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function PortalLoadSummary({ load }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{load.title}</h1>
          <p className="page-subtitle">
            {load.origin} → {load.destination}
          </p>
        </div>
        <PortalLoadStatusBadge status={load.status} />
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Tipo de veículo" value={load.vehicleType?.name ?? "—"} />
        <DetailItem label="Peso" value={load.weightKg ? `${load.weightKg} kg` : "—"} />
        <DetailItem label="Volume" value={load.volumeM3 ? `${load.volumeM3} m³` : "—"} />
        <DetailItem
          label="Valor sugerido"
          value={formatMoneyFromCents(load.suggestedPriceCents)}
        />
        <DetailItem
          label="Contraproposta"
          value={load.allowsCounterOffer ? "Permitida" : "Não permitida"}
        />
        <DetailItem label="Coleta prevista" value={formatDateTime(load.pickupAt)} />
        <DetailItem label="Entrega prevista" value={formatDateTime(load.deliveryAt)} />
        <DetailItem label="Criada em" value={formatDateTime(load.createdAt)} />
        <DetailItem label="Atualizada em" value={formatDateTime(load.updatedAt)} />
      </div>

      {load.description ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Descrição</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{load.description}</p>
        </section>
      ) : null}

      {load.notes ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Observações</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{load.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
