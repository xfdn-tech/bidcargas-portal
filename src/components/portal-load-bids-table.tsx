"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog, Alert, Button } from "@/components/ui";
import { PortalBidStatusBadge } from "@/components/portal-load-status-badge";
import { api, getApiErrorMessage } from "@/lib/api";
import type { BidRecord, LoadRecord } from "@/lib/portal-types";
import { formatDateTime, formatMoneyFromCents } from "@/lib/portal-types";

type Props = {
  load: LoadRecord;
  bids: BidRecord[];
};

type PendingAction =
  | { type: "accept"; bid: BidRecord }
  | { type: "reject"; bid: BidRecord };

export function PortalLoadBidsTable({ load, bids }: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canManageBids =
    load.status === "published" ||
    load.status === "negotiating" ||
    load.status === "closed";

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

  if (!canManageBids && bids.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Propostas</h2>
        <p className="text-sm text-muted">
          Propostas enviadas por motoristas para esta carga.
        </p>
      </div>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      {bids.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-sm text-muted">
          Nenhuma proposta recebida ainda.
        </p>
      ) : (
        <div className="data-table-wrap overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Valor</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Recebida em</th>
                {load.status === "published" || load.status === "negotiating" ? (
                  <th className="w-48">Ações</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id}>
                  <td>
                    <p className="font-medium text-foreground">
                      {bid.driver?.name ?? "—"}
                    </p>
                    {bid.driver?.phone ? (
                      <p className="text-sm text-muted">{bid.driver.phone}</p>
                    ) : null}
                  </td>
                  <td>{formatMoneyFromCents(bid.amountCents)}</td>
                  <td>{formatDateTime(bid.deadlineAt)}</td>
                  <td>
                    <PortalBidStatusBadge status={bid.status} />
                  </td>
                  <td>{formatDateTime(bid.createdAt)}</td>
                  {load.status === "published" || load.status === "negotiating" ? (
                    <td>
                      {bid.status === "pending" ? (
                        <div className="flex flex-wrap gap-2">
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
                        </div>
                      ) : (
                        <span className="text-sm text-muted">—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
