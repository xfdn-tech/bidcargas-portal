"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalDriverProfileModal } from "@/components/portal-driver-profile-modal";
import { ConfirmDialog, Alert, Button, Pagination } from "@/components/ui";
import { PortalBidStatusBadge } from "@/components/portal-load-status-badge";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type {
  BidRecord,
  BidStatus,
  LoadRecord,
  PaginatedMeta,
} from "@/lib/portal-types";
import {
  BID_STATUSES,
  formatDateTime,
  formatDriverCsatShort,
  formatMoneyFromCents,
} from "@/lib/portal-types";

type Props = {
  load: LoadRecord;
  bids: BidRecord[];
  meta: PaginatedMeta;
  filters: {
    sortBy: string;
    sortDir: "asc" | "desc";
    status?: BidStatus;
  };
};

type PendingAction =
  | { type: "accept"; bid: BidRecord }
  | { type: "reject"; bid: BidRecord };

const SORT_OPTIONS = [
  { value: "amount:asc", label: "Menor preço" },
  { value: "amount:desc", label: "Maior preço" },
  { value: "createdAt:desc", label: "Envio mais recente" },
  { value: "createdAt:asc", label: "Envio mais antigo" },
  { value: "deadlineAt:asc", label: "Prazo mais próximo" },
] as const;

function driverInitials(name?: string | null) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function rankBadgeClass(rank: number, sortBy: string, sortDir: string) {
  if (sortBy === "amount" && sortDir === "asc") {
    if (rank === 1) return "load-bids-rank-badge is-first";
    if (rank === 2) return "load-bids-rank-badge is-second";
  }
  return "load-bids-rank-badge is-default";
}

export function PortalLoadBidsTable({ load, bids, meta, filters }: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [favoritingId, setFavoritingId] = useState<string | null>(null);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const [profileDriverId, setProfileDriverId] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<BidRecord["driver"] | null>(
    null,
  );

  const canManageBids =
    load.status === "published" ||
    load.status === "negotiating" ||
    load.status === "closed";

  const sortValue = `${filters.sortBy}:${filters.sortDir}`;
  const rankOffset = (meta.currentPage - 1) * meta.itemsPerPage;
  const isPriceRanking = filters.sortBy === "amount" && filters.sortDir === "asc";

  const paginationParams = {
    bidSort: sortValue,
    bidStatus: filters.status,
  };

  const lowestPendingAmount = useMemo(() => {
    const pending = bids.filter((bid) => bid.status === "pending");
    if (!pending.length) return null;
    return Math.min(...pending.map((bid) => bid.amountCents));
  }, [bids]);

  const canDecide =
    load.status === "published" || load.status === "negotiating";

  async function favoriteDriver(driverId: string) {
    setFavoritingId(driverId);
    setFavoriteMessage(null);
    setActionError(null);
    try {
      await api("/portal/driver-favorites", {
        method: "POST",
        json: { driverId },
      });
      setFavoriteMessage("Motorista adicionado aos favoritos.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setFavoritingId(null);
    }
  }

  async function runAction() {
    if (!pendingAction) return;
    setLoading(true);
    setActionError(null);
    try {
      const endpoint =
        pendingAction.type === "accept"
          ? `/portal/loads/${load.id}/bids/${pendingAction.bid.id}/accept`
          : `/portal/loads/${load.id}/bids/${pendingAction.bid.id}/reject`;

      await api(endpoint, { method: "POST" });
      setPendingAction(null);
      router.refresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function openProfile(bid: BidRecord) {
    setProfileDriverId(bid.driverId);
    setProfilePreview(bid.driver ?? null);
  }

  if (!canManageBids && bids.length === 0) {
    return null;
  }

  return (
    <section className="load-bids-panel">
      <header className="load-bids-panel-header">
        <div>
          <h2 className="load-bids-panel-title">Propostas</h2>
          <p className="load-bids-panel-subtitle">
            {meta.totalItems > 0
              ? `${meta.totalItems} proposta${meta.totalItems === 1 ? "" : "s"} recebida${meta.totalItems === 1 ? "" : "s"}`
              : "Aguardando propostas de motoristas"}
            {meta.totalPages > 1
              ? ` · página ${meta.currentPage} de ${meta.totalPages}`
              : ""}
          </p>
        </div>
        {isPriceRanking && meta.totalItems > 0 ? (
          <span className="badge badge-success">Ranking por menor preço</span>
        ) : null}
      </header>

      <form className="load-bids-toolbar toolbar" method="get">
        <select
          name="bidSort"
          defaultValue={sortValue}
          className="input-field max-w-[11rem]"
          aria-label="Ordenar propostas"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="bidStatus"
          defaultValue={filters.status ?? ""}
          className="input-field max-w-[10rem]"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {BID_STATUSES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary btn-inline">
          Aplicar
        </button>
        <Link href={`/portal/loads/${load.id}`} className="btn-ghost">
          Limpar
        </Link>
      </form>

      {actionError || favoriteMessage ? (
        <div className="load-bids-alerts space-y-2">
          {actionError ? <Alert tone="error">{actionError}</Alert> : null}
          {favoriteMessage ? <Alert tone="success">{favoriteMessage}</Alert> : null}
        </div>
      ) : null}

      {bids.length === 0 ? (
        <div className="ui-table-empty rounded-none border-0 shadow-none">
          <p>Nenhuma proposta encontrada com os filtros atuais.</p>
        </div>
      ) : (
        <div className="ui-table-wrap load-bids-table-wrap overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Motorista</th>
                <th>Proposta</th>
                <th>Status</th>
                <th className="load-bids-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, index) => {
                const rank = rankOffset + index + 1;
                const isBestPending =
                  bid.status === "pending" &&
                  lowestPendingAmount != null &&
                  bid.amountCents === lowestPendingAmount;
                const csatScore = formatDriverCsatShort(bid.driver);

                return (
                  <tr key={bid.id}>
                    <td>
                      <div className="load-bids-rank">
                        <span className={rankBadgeClass(rank, filters.sortBy, filters.sortDir)}>
                          {rank}
                        </span>
                        {isPriceRanking && rank === 1 ? (
                          <span className="load-bids-rank-tag">Melhor</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="load-bids-driver">
                        <span className="load-bids-avatar" aria-hidden="true">
                          {driverInitials(bid.driver?.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="load-bids-driver-name">
                            {bid.driver?.name ?? "—"}
                          </p>
                          <div className="load-bids-driver-meta">
                            {csatScore ? (
                              <span>
                                CSAT{" "}
                                <span className="load-bids-csat-score">{csatScore}</span>
                                /5
                              </span>
                            ) : (
                              <span>Sem avaliações</span>
                            )}
                            <button
                              type="button"
                              className="table-link"
                              onClick={() => openProfile(bid)}
                            >
                              Ver perfil
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p
                        className={cn(
                          "load-bids-offer-amount",
                          isBestPending && "is-best",
                        )}
                      >
                        {formatMoneyFromCents(bid.amountCents)}
                      </p>
                      <p className="load-bids-offer-meta">
                        Prazo: {formatDateTime(bid.deadlineAt)}
                      </p>
                      <p className="load-bids-offer-meta">
                        Enviada em {formatDateTime(bid.createdAt)}
                      </p>
                    </td>
                    <td className="load-bids-status-cell">
                      <PortalBidStatusBadge status={bid.status} />
                    </td>
                    <td>
                      <div className="load-bids-actions">
                        {canDecide && bid.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                setPendingAction({ type: "accept", bid })
                              }
                            >
                              Aceitar
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                setPendingAction({ type: "reject", bid })
                              }
                            >
                              Recusar
                            </Button>
                          </>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={favoritingId === bid.driverId}
                          onClick={() => void favoriteDriver(bid.driverId)}
                        >
                          Favoritar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 || meta.totalItems > 0 ? (
        <footer className="load-bids-panel-footer">
          <p className="text-sm text-muted">
            Exibindo {meta.itemCount} de {meta.totalItems} proposta
            {meta.totalItems === 1 ? "" : "s"}
          </p>
          <Pagination
            meta={meta}
            pathname={`/portal/loads/${load.id}`}
            pageParam="bidPage"
            searchParams={paginationParams}
            className="!p-0 !border-0 !bg-transparent !shadow-none"
          />
        </footer>
      ) : null}

      <PortalDriverProfileModal
        driverId={profileDriverId}
        driverPreview={profilePreview}
        onClose={() => {
          setProfileDriverId(null);
          setProfilePreview(null);
        }}
      />

      {pendingAction?.type === "accept" ? (
        <ConfirmDialog
          open
          title="Aceitar proposta?"
          description={
            <>
              Aceitar a proposta de{" "}
              <strong>{pendingAction.bid.driver?.name ?? "motorista"}</strong> no
              valor de{" "}
              <strong>{formatMoneyFromCents(pendingAction.bid.amountCents)}</strong>
              ? As demais propostas pendentes serão recusadas e a carga será
              fechada.
            </>
          }
          confirmLabel="Aceitar proposta"
          tone="default"
          loading={loading}
          onConfirm={() => void runAction()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {pendingAction?.type === "reject" ? (
        <ConfirmDialog
          open
          title="Recusar proposta?"
          description={
            <>
              Recusar a proposta de{" "}
              <strong>{pendingAction.bid.driver?.name ?? "motorista"}</strong>?
            </>
          }
          confirmLabel="Recusar"
          tone="danger"
          loading={loading}
          onConfirm={() => void runAction()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}
    </section>
  );
}
