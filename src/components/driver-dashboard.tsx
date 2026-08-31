"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { withDriverReturnTo } from "@/lib/driver-return-to";
import type { DriverDashboardKpis } from "@/lib/portal-types";
import {
  formatDateTime,
  formatDriverCsat,
  formatMoneyFromCents,
  loadStatusLabel,
} from "@/lib/portal-types";

type Props = {
  dashboard: DriverDashboardKpis;
  userName: string;
};

function formatMonthLabel(periodStart: string) {
  const date = new Date(`${periodStart}T12:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function formatShortDay(date: string) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

function FinanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="portal-chart-tooltip">
      <p className="portal-chart-tooltip-label">{label}</p>
      <p className="portal-chart-tooltip-value">
        {formatMoneyFromCents(payload[0]?.value ?? 0)}
      </p>
    </div>
  );
}

export function DriverDashboard({ dashboard, userName }: Props) {
  const monthLabel = formatMonthLabel(dashboard.finance.periodStart);
  const csatLabel = formatDriverCsat({
    csatAvg: dashboard.csatAvg,
    csatCount: dashboard.csatCount,
  });

  const earningsChart = dashboard.finance.earningsByDay
    .filter((item) => item.amountCents > 0)
    .map((item) => ({
      ...item,
      label: formatShortDay(item.date),
    }));

  const hasFinance =
    dashboard.finance.earnedCents > 0 ||
    dashboard.finance.pendingReceivableCents > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Olá, {userName}</h1>
          <p className="page-subtitle">
            Seu painel · {monthLabel}
            {dashboard.csatCount > 0 ? ` · ${csatLabel}` : ""}
          </p>
        </div>
        <ButtonLink href="/driver/loads" variant="primary">
          Ver cargas
        </ButtonLink>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Mini financeiro
            </h2>
            <p className="text-sm text-muted">
              Recebimentos de viagens concluídas e valores a receber de fretes
              fechados.
            </p>
          </div>
          <Link href="/driver/bids?phase=completed" className="text-sm font-medium text-brand">
            Ver concluídas
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-muted">
              Recebido no mês
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {formatMoneyFromCents(dashboard.finance.earnedCents)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {dashboard.finance.tripsCompleted === 1
                ? "1 viagem concluída"
                : `${dashboard.finance.tripsCompleted} viagens concluídas`}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-muted">A receber</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {formatMoneyFromCents(dashboard.finance.pendingReceivableCents)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {dashboard.finance.tripsInProgress === 1
                ? "1 frete fechado em andamento"
                : `${dashboard.finance.tripsInProgress} fretes fechados em andamento`}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-muted">
              Propostas pendentes
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {dashboard.pendingBids}
            </p>
            <p className="mt-1 text-xs text-muted">Aguardando resposta da empresa</p>
          </div>
          <div className="stat-card">
            <p className="text-xs uppercase tracking-wide text-muted">
              Cargas disponíveis
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {dashboard.availableLoads}
            </p>
            <p className="mt-1 text-xs text-muted">Publicadas ou em negociação</p>
          </div>
        </div>

        {!hasFinance ? (
          <p className="mt-6 text-sm text-muted">
            Ainda não há recebimentos neste mês. Envie propostas e acompanhe aqui
            quando forem aceitas.
          </p>
        ) : earningsChart.length > 0 ? (
          <div className="mt-6 portal-chart-area">
            <p className="mb-3 text-sm font-medium text-foreground">
              Recebimentos por dia
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={earningsChart}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => {
                    const reais = value / 100;
                    return reais >= 1000
                      ? `R$ ${(reais / 1000).toFixed(1)}k`
                      : `R$ ${reais.toFixed(0)}`;
                  }}
                />
                <Tooltip content={<FinanceTooltip />} />
                <Bar
                  dataKey="amountCents"
                  fill="var(--brand)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="portal-chart-card">
          <header className="portal-chart-card-header">
            <h2 className="portal-chart-card-title">Fretes em andamento</h2>
            <p className="portal-chart-card-description">
              Propostas aceitas em cargas fechadas ou concluídas recentemente.
            </p>
          </header>
          <div className="portal-chart-card-body space-y-3">
            {dashboard.activeTrips.length === 0 ? (
              <p className="text-sm text-muted">Nenhum frete confirmado ainda.</p>
            ) : (
              dashboard.activeTrips.map((trip) => (
                <Link
                  key={trip.bidId}
                  href={withDriverReturnTo(
                    `/driver/loads/${trip.loadId}`,
                    "/driver",
                  )}
                  className="block rounded-lg border border-border bg-card px-4 py-3 transition hover:bg-surface"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{trip.title}</p>
                      <p className="text-sm text-muted">
                        {trip.origin} → {trip.destination}
                      </p>
                      {trip.accountName ? (
                        <p className="mt-1 text-xs text-muted">{trip.accountName}</p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatMoneyFromCents(trip.amountCents)}
                      </p>
                      <div className="mt-1">
                        <PortalLoadStatusBadge status={trip.loadStatus} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Atualizado em {formatDateTime(trip.updatedAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
          {dashboard.activeTrips.length > 0 ? (
            <footer className="portal-chart-card-footer">
              <Link href="/driver/bids?phase=in_progress" className="text-sm font-medium text-brand">
                Ver propostas em andamento
              </Link>
            </footer>
          ) : null}
        </section>

        <section className="portal-chart-card">
          <header className="portal-chart-card-header">
            <h2 className="portal-chart-card-title">Propostas aguardando</h2>
            <p className="portal-chart-card-description">
              Lances enviados que ainda não tiveram resposta.
            </p>
          </header>
          <div className="portal-chart-card-body space-y-3">
            {dashboard.recentPendingBids.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhuma proposta pendente.{" "}
                <Link href="/driver/loads" className="font-medium text-brand">
                  Buscar cargas
                </Link>
              </p>
            ) : (
              dashboard.recentPendingBids.map((bid) => (
                <Link
                  key={bid.bidId}
                  href={withDriverReturnTo(
                    `/driver/loads/${bid.loadId}`,
                    "/driver",
                  )}
                  className="block rounded-lg border border-border bg-card px-4 py-3 transition hover:bg-surface"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{bid.title}</p>
                      {bid.accountName ? (
                        <p className="text-sm text-muted">{bid.accountName}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted">
                        Carga {loadStatusLabel(bid.loadStatus).toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatMoneyFromCents(bid.amountCents)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(bid.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
