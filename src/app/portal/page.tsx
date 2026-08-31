import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { requirePortalUser } from "@/lib/auth-server";
import type { DashboardKpis } from "@/lib/portal-types";
import { portalRoleLabel } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

export default async function PortalHomePage() {
  const user = await requirePortalUser();
  const dashboard = await serverApi<DashboardKpis>("/portal/dashboard");
  const roleLabel =
    user.role === "super_admin"
      ? "Administrador da plataforma"
      : portalRoleLabel(user.role as "account_admin" | "account_user");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Olá, {user.name}</h1>
          <p className="page-subtitle">
            Acompanhe a operação dos últimos 30 dias.
          </p>
        </div>
        <ButtonLink href="/portal/loads/new" variant="primary">
          Criar carga
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">
            Cargas publicadas
          </p>
          <p className="mt-2 text-2xl font-semibold">{dashboard.publishedPeriod}</p>
          <p className="mt-1 text-xs text-muted">
            {dashboard.publishedTotal} no total
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">
            Propostas recebidas
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {dashboard.interestedDriversPeriod}
          </p>
          <p className="mt-1 text-xs text-muted">Motoristas interessados</p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">
            Negociações confirmadas
          </p>
          <p className="mt-2 text-2xl font-semibold">{dashboard.confirmedPeriod}</p>
          <p className="mt-1 text-xs text-muted">Cargas fechadas ou concluídas</p>
        </div>
      </div>

      {dashboard.hasActiveLoads ? null : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-lg font-semibold">Nenhuma carga ativa</p>
          <p className="mt-1 text-sm text-muted">
            Publique uma carga para começar a receber propostas.
          </p>
          <div className="mt-4">
            <Link href="/portal/loads/new" className="btn-primary btn-inline">
              Criar carga
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Empresa</p>
          <p className="mt-2 text-lg font-semibold">
            {user.account?.name ?? user.impersonating?.accountName ?? "—"}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Perfil</p>
          <p className="mt-2 text-lg font-semibold">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}
