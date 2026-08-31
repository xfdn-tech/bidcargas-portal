"use client";

import { useState, type ReactNode } from "react";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import { Button } from "@/components/ui";
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

type DetailField = {
  label: string;
  value: ReactNode;
};

function DetailItem({ label, value }: DetailField) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}

export function PortalLoadSummary({ load }: Props) {
  const [expanded, setExpanded] = useState(false);

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

  const valueLabel =
    load.suggestedPriceCents != null
      ? `${formatMoneyFromCents(load.suggestedPriceCents)} ${priceUnitLabel(load.priceUnit ?? "trip")}`
      : "A combinar";

  const anttLabel =
    load.anttFloorCents != null
      ? `${formatMoneyFromCents(load.anttFloorCents)}${load.anttTable ? ` · tabela ${load.anttTable}` : ""}${load.anttAxles ? ` · ${load.anttAxles} eixos` : ""}`
      : "—";

  const compactFields: DetailField[] = [
    { label: "Produto", value: load.product ?? "—" },
    { label: "Tipo de carga", value: load.loadType?.name ?? "—" },
    { label: "Valor", value: valueLabel },
    { label: "Veículos", value: vehicles },
    { label: "Distância", value: load.distanceKm ? `${load.distanceKm} km` : "—" },
    { label: "Piso ANTT", value: anttLabel },
  ];

  const expandedFields: DetailField[] = [
    { label: "Espécie", value: load.loadSpecies?.name ?? "—" },
    {
      label: "Tipo de frete",
      value: freightKindLabel(load.freightKind ?? "full"),
    },
    { label: "Peso", value: load.weightKg ? `${load.weightKg} kg` : "—" },
    { label: "Volume", value: load.volumeM3 ? `${load.volumeM3} m³` : "—" },
    { label: "Carroceria", value: bodies },
    { label: "Adiantamento", value: `${load.advancePercent ?? 0}%` },
    { label: "Pagamento", value: payments },
    { label: "Pedágio", value: load.tollSeparate ? "À parte" : "Incluso" },
    {
      label: "Extras",
      value: extras.length ? extras.join(", ") : "Nenhum",
    },
    { label: "Coleta prevista", value: formatDateTime(load.pickupAt) },
    { label: "Entrega prevista", value: formatDateTime(load.deliveryAt) },
    {
      label: "Responsáveis",
      value: load.contacts?.length
        ? load.contacts.map((item) => item.user?.name ?? item.userId).join(", ")
        : "—",
    },
  ];

  const visibleFields = expanded
    ? [...compactFields, ...expandedFields]
    : compactFields;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">{load.title}</h1>
          <p className="page-subtitle">
            {load.origin} → {load.destination}
          </p>
        </div>
        <PortalLoadStatusBadge status={load.status} />
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 sm:px-5 sm:py-4 lg:grid-cols-3">
          {visibleFields.map((field) => (
            <DetailItem key={field.label} label={field.label} value={field.value} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 sm:px-5">
          <p className="text-xs text-muted">
            {expanded
              ? "Todos os detalhes da carga"
              : "Resumo compacto — expanda para ver o restante"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            {expanded ? "Recolher" : "Ver detalhes"}
          </Button>
        </div>
      </div>

      {expanded && load.notes ? (
        <section className="space-y-2 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-foreground">Observações</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{load.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
