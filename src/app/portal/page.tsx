import { cookies } from "next/headers";
import { requirePortalUser } from "@/lib/auth-server";
import { resolveApiUrl } from "@/lib/api-url";

async function fetchPortalSummary(cookieHeader: string) {
  const response = await fetch(`${resolveApiUrl()}/portal/summary`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<{ message?: string }>;
}

export default async function PortalHomePage() {
  const user = await requirePortalUser();
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((item) => `${item.name}=${item.value}`)
    .join("; ");

  const summary = cookieHeader
    ? await fetchPortalSummary(cookieHeader)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Olá, {user.name}</h1>
        <p className="page-subtitle">
          {summary?.message ??
            "Em breve: publicação de cargas e gestão de lances."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Empresa</p>
          <p className="mt-2 text-lg font-semibold">
            {user.account?.name ?? user.impersonating?.accountName ?? "—"}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Identificador</p>
          <p className="mt-2 text-lg font-semibold">
            {user.account?.slug ?? user.impersonating?.accountSlug ?? "—"}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wide text-muted">Perfil</p>
          <p className="mt-2 text-lg font-semibold">{user.role}</p>
        </div>
      </div>
    </div>
  );
}
