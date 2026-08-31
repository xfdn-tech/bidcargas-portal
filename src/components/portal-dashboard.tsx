"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PortalBidStatusBadge } from "@/components/portal-load-status-badge";
import { ButtonLink } from "@/components/ui/button";
import type { DashboardKpis } from "@/lib/portal-types";
import {
  bidStatusLabel,
  formatDateTime,
  formatMoneyFromCents,
  loadStatusLabel,
} from "@/lib/portal-types";

type Props = {
  dashboard: DashboardKpis;
  accountName: string;
  userName: string;
};

const CHART_COLORS = [
  "var(--brand)",
  "var(--success)",
  "var(--warning)",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];

const LOAD_STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  published: "var(--brand)",
  negotiating: "var(--warning)",
  closed: "var(--success)",
  cancelled: "#64748b",
  completed: "#14b8a6",
};

const BID_STATUS_COLORS: Record<string, string> = {
  pending: "var(--warning)",
  accepted: "var(--success)",
  rejected: "#64748b",
  cancelled: "#94a3b8",
};

function formatShortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}`;
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`portal-chart-card ${className ?? ""}`}>
      <header className="portal-chart-card-header">
        <h2 className="portal-chart-card-title">{title}</h2>
        {description ? (
          <p className="portal-chart-card-description">{description}</p>
        ) : null}
      </header>
      <div className="portal-chart-card-body">{children}</div>
    </section>
  );
}

function DashboardTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; payload?: { label?: string } }>;
  label?: string;
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const displayLabel = item.payload?.label ?? label;
  return (
    <div className="portal-chart-tooltip">
      <p className="portal-chart-tooltip-label">{displayLabel}</p>
      <p className="portal-chart-tooltip-value">
        {item.value ?? 0} {valueLabel ?? ""}
      </p>
    </div>
  );
}

export function PortalDashboard({
  dashboard,
  accountName,
  userName,
}: Props) {
  const bidsTrend = dashboard.bidsByDay.map((item) => ({
    ...item,
    label: formatShortDate(item.date),
  }));

  const loadsChart = dashboard.loadsByStatus
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      label: loadStatusLabel(item.status),
      count: item.count,
    }));

  const bidsStatusChart = dashboard.bidsByStatus
    .filter((item) => item.count > 0)
    .map((item) => ({
      status: item.status,
      label: bidStatusLabel(item.status),
      count: item.count,
    }));

  const totalLoads = loadsChart.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Olá, {userName}</h1>
          <p className="page-subtitle">
            Painel de {accountName} · últimos 30 dias
          </p>
        </div>
        <ButtonLink href="/portal/loads/new" variant="primary">
          Criar carga
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          className={
            dashboard.pendingBidsCount > 0
              ? "stat-card portal-stat-card-highlight"
              : "stat-card"
          }
        >
          <p className="text-xs uppercase tracking-wide text-muted">
            Propostas pendentes
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {dashboard.pendingBidsCount}
          </p>
          <p className="mt-1 text-xs text-muted">Aguardando sua decisão</p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">
            Novas nas últimas 24h
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {dashboard.newBidsLast24h}
          </p>
          <p className="mt-1 text-xs text-muted">Propostas recebidas hoje</p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Cargas ativas</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {dashboard.activeLoadsCount}
          </p>
          <p className="mt-1 text-xs text-muted">Publicadas ou em negociação</p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">
            Fechadas no período
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {dashboard.confirmedPeriod}
          </p>
          <p className="mt-1 text-xs text-muted">
            {dashboard.interestedDriversPeriod} propostas no total
          </p>
        </div>
      </div>

      {!dashboard.hasActiveLoads && dashboard.publishedTotal === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Nenhuma carga publicada ainda</p>
          <p className="mt-1 text-sm text-muted">
            Publique a primeira carga para começar a receber propostas de motoristas.
          </p>
          <div className="mt-4">
            <ButtonLink href="/portal/loads/new" variant="primary">
              Criar carga
            </ButtonLink>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Propostas por dia"
          description="Volume de propostas recebidas nos últimos 14 dias"
        >
          <div className="portal-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bidsTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="bidsAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={
                    <DashboardTooltip valueLabel="proposta(s)" />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fill="url(#bidsAreaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Cargas por status"
          description={`${totalLoads} carga${totalLoads === 1 ? "" : "s"} no total`}
        >
          {loadsChart.length === 0 ? (
            <p className="portal-chart-empty">Sem cargas cadastradas.</p>
          ) : (
            <div className="portal-chart-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={loadsChart}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {loadsChart.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={LOAD_STATUS_COLORS[entry.status] ?? CHART_COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DashboardTooltip valueLabel="carga(s)" />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="portal-chart-legend">
                {loadsChart.map((entry) => (
                  <li key={entry.status}>
                    <span
                      className="portal-chart-legend-dot"
                      style={{
                        background:
                          LOAD_STATUS_COLORS[entry.status] ?? CHART_COLORS[0],
                      }}
                    />
                    <span>{entry.label}</span>
                    <strong>{entry.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Propostas por status"
          description="Distribuição das propostas nos últimos 30 dias"
        >
          {bidsStatusChart.length === 0 ? (
            <p className="portal-chart-empty">Nenhuma proposta no período.</p>
          ) : (
            <div className="portal-chart-bar">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bidsStatusChart}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={88}
                    tick={{ fill: "var(--muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<DashboardTooltip valueLabel="proposta(s)" />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                    {bidsStatusChart.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={BID_STATUS_COLORS[entry.status] ?? CHART_COLORS[0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Propostas recentes"
          description="Últimas movimentações na operação"
        >
          {dashboard.recentBids.length === 0 ? (
            <p className="portal-chart-empty">Nenhuma proposta recebida ainda.</p>
          ) : (
            <ul className="portal-recent-bids">
              {dashboard.recentBids.map((bid) => (
                <li key={bid.id}>
                  <div className="portal-recent-bids-main">
                    <Link href={`/portal/loads/${bid.loadId}`} className="portal-recent-bids-title">
                      {bid.loadTitle}
                    </Link>
                    <p className="portal-recent-bids-driver">{bid.driverName}</p>
                  </div>
                  <div className="portal-recent-bids-meta">
                    <p className="portal-recent-bids-amount">
                      {formatMoneyFromCents(bid.amountCents)}
                    </p>
                    <PortalBidStatusBadge status={bid.status} />
                    <p className="portal-recent-bids-date">
                      {formatDateTime(bid.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="portal-chart-card-footer">
            <Link href="/portal/loads" className="table-link">
              Ver todas as cargas
            </Link>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
