"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonLink, ConfirmDialog } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { LoadRecord } from "@/lib/portal-types";

type Props = {
  load: LoadRecord;
  variant?: "default" | "toolbar";
};

type PendingAction = "publish" | "cancel" | "delete";

export function PortalLoadDetailActions({
  load,
  variant = "default",
}: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPublish = load.status === "draft";
  const canDelete = load.status === "draft";
  const canCancel =
    load.status === "published" ||
    load.status === "negotiating" ||
    load.status === "draft";

  if (!canPublish && !canDelete && !canCancel) {
    return null;
  }

  async function runAction() {
    if (!pendingAction) return;
    setLoading(true);
    setError(null);

    try {
      if (pendingAction === "publish") {
        await api(`/portal/loads/${load.id}/publish`, { method: "POST" });
      } else if (pendingAction === "cancel") {
        await api(`/portal/loads/${load.id}/cancel`, { method: "POST" });
      } else {
        await api(`/portal/loads/${load.id}`, { method: "DELETE" });
        router.push("/portal/loads");
        router.refresh();
        return;
      }

      setPendingAction(null);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setPendingAction(null);
    } finally {
      setLoading(false);
    }
  }

  const actions = (
    <>
      {canPublish ? (
        <Button size="sm" onClick={() => setPendingAction("publish")}>
          Publicar
        </Button>
      ) : null}
      {canCancel && load.status !== "draft" ? (
        <Button
          size="sm"
          variant="danger-outline"
          onClick={() => setPendingAction("cancel")}
        >
          Cancelar carga
        </Button>
      ) : null}
      {canDelete ? (
        <Button
          size="sm"
          variant="danger-outline"
          onClick={() => setPendingAction("delete")}
        >
          Excluir
        </Button>
      ) : null}
    </>
  );

  if (variant === "toolbar") {
    return (
      <>
        {error ? (
          <div className="w-full">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">{actions}</div>
        {pendingAction === "publish" ? (
          <ConfirmDialog
            open
            title="Publicar carga?"
            description="A carga ficará visível para motoristas e poderá receber propostas."
            confirmLabel="Publicar"
            loading={loading}
            onConfirm={() => void runAction()}
            onCancel={() => setPendingAction(null)}
          />
        ) : null}
        {pendingAction === "cancel" ? (
          <ConfirmDialog
            open
            title="Cancelar carga?"
            description="A carga deixará de aceitar novas propostas. Esta ação não pode ser desfeita."
            confirmLabel="Cancelar carga"
            tone="danger"
            loading={loading}
            onConfirm={() => void runAction()}
            onCancel={() => setPendingAction(null)}
          />
        ) : null}
        {pendingAction === "delete" ? (
          <ConfirmDialog
            open
            title="Excluir rascunho?"
            description="O rascunho será removido permanentemente."
            confirmLabel="Excluir"
            tone="danger"
            loading={loading}
            onConfirm={() => void runAction()}
            onCancel={() => setPendingAction(null)}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {actions}
        <ButtonLink href="/portal/loads" variant="ghost">
          Voltar à lista
        </ButtonLink>
      </div>

      {pendingAction === "publish" ? (
        <ConfirmDialog
          open
          title="Publicar carga?"
          description="A carga ficará visível para motoristas e poderá receber propostas."
          confirmLabel="Publicar"
          loading={loading}
          onConfirm={() => void runAction()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {pendingAction === "cancel" ? (
        <ConfirmDialog
          open
          title="Cancelar carga?"
          description="A carga deixará de aceitar novas propostas. Esta ação não pode ser desfeita."
          confirmLabel="Cancelar carga"
          tone="danger"
          loading={loading}
          onConfirm={() => void runAction()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {pendingAction === "delete" ? (
        <ConfirmDialog
          open
          title="Excluir rascunho?"
          description="O rascunho será removido permanentemente."
          confirmLabel="Excluir"
          tone="danger"
          loading={loading}
          onConfirm={() => void runAction()}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}
    </div>
  );
}
