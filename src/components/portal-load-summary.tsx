import type { ReactNode } from "react";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import type { LoadRecord } from "@/lib/portal-types";
import {
  formatDateTime,
  formatMoneyFromCents,
  freightKindLabel,
  paymentMethodLabel,
  priceUnitLabel,
} from "@/lib/portal-types";

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
  const vehicles =
    load.vehicleTypes?.map((item) => item.name).join(", ") ||
    load.vehicleType?.name ||
    "—";
  const bodies = load.bodyTypes?.map((item) => item.name).join(", ") || "—";
  const payments = load.paymentMethods?.length
    ? load.paymentMethods.map(paymentMethodLabel).join(", ")
    : "—";
  const extras = [
    load.needsTracker ? "Rastreador" : null,
    load.emptyReturn ? "Retorno vazio" : null,
    load.highPerformance ? "Alto desempenho" : null,
    load.vehicleComposition ? "Composição veicular" : null,
    load.needsTarp ? "Lona" : null,
  ].filter(Boolean);

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
        <DetailItem label="Produto" value={load.product ?? "—"} />
        <DetailItem label="Tipo de carga" value={load.loadType?.name ?? "—"} />
        <DetailItem label="Espécie" value={load.loadSpecies?.name ?? "—"} />
        <DetailItem
          label="Tipo de frete"
          value={freightKindLabel(load.freightKind ?? "full")}
        />
        <DetailItem
          label="Peso"
          value={load.weightKg ? `${load.weightKg} kg` : "—"}
        />
        <DetailItem
          label="Volume"
          value={load.volumeM3 ? `${load.volumeM3} m³` : "—"}
        />
        <DetailItem label="Veículos" value={vehicles} />
        <DetailItem label="Carroceria" value={bodies} />
        <DetailItem
          label="Distância"
          value={load.distanceKm ? `${load.distanceKm} km` : "—"}
        />
        <DetailItem
          label="Valor"
          value={
            load.suggestedPriceCents != null
              ? `${formatMoneyFromCents(load.suggestedPriceCents)} ${priceUnitLabel(load.priceUnit ?? "trip")}`
              : "A combinar"
          }
        />
        <DetailItem
          label="Piso ANTT"
          value={
            load.anttFloorCents != null
              ? `${formatMoneyFromCents(load.anttFloorCents)}${load.anttTable ? ` · tabela ${load.anttTable}` : ""}${load.anttAxles ? ` · ${load.anttAxles} eixos` : ""}`
              : "—"
          }
        />
        <DetailItem label="Adiantamento" value={`${load.advancePercent ?? 0}%`} />
        <DetailItem label="Pagamento" value={payments} />
        <DetailItem
          label="Pedágio"
          value={load.tollSeparate ? "À parte" : "Incluso"}
        />
        <DetailItem
          label="Extras"
          value={extras.length ? extras.join(", ") : "Nenhum"}
        />
        <DetailItem label="Coleta prevista" value={formatDateTime(load.pickupAt)} />
        <DetailItem label="Entrega prevista" value={formatDateTime(load.deliveryAt)} />
        <DetailItem
          label="Responsáveis"
          value={
            load.contacts?.length
              ? load.contacts
                  .map((item) => item.user?.name ?? item.userId)
                  .join(", ")
              : "—"
          }
        />
      </div>

      {load.notes ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Observações</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{load.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
