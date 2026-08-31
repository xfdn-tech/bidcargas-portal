"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Alert, Button, ConfirmDialog, TextAreaField } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverFavoriteRecord } from "@/lib/portal-types";
import type { TableSort } from "@/lib/list-query";

type Props = {
  items: DriverFavoriteRecord[];
  sort: {
    pathname: string;
    current: TableSort;
    searchParams?: Record<string, string | undefined>;
  };
};

export function PortalDriverFavoritesTable({ items, sort }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<DriverFavoriteRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [removing, setRemoving] = useState<DriverFavoriteRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveNotes() {
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      await api(`/portal/driver-favorites/${editing.driverId}`, {
        method: "PATCH",
        json: { notes: notes.trim() || null },
      });
      setEditing(null);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite() {
    if (!removing) return;
    setLoading(true);
    setError(null);
    try {
      await api(`/portal/driver-favorites/${removing.driverId}`, {
        method: "DELETE",
      });
      setRemoving(null);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const columns: DataTableColumn<DriverFavoriteRecord>[] = [
    {
      id: "name",
      header: "Motorista",
      sortKey: "name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.driver?.name ?? "—"}</p>
          {row.driver?.phone ? (
            <p className="text-sm text-muted">{row.driver.phone}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: "notes",
      header: "Observações",
      cell: (row) => row.notes?.trim() || "—",
    },
    {
      id: "createdAt",
      header: "Favoritado em",
      sortKey: "createdAt",
      cell: (row) => new Date(row.createdAt).toLocaleString("pt-BR"),
    },
    {
      id: "actions",
      header: "Ações",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditing(row);
              setNotes(row.notes ?? "");
            }}
          >
            Observações
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setRemoving(row)}>
            Remover
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {error ? <Alert tone="error">{error}</Alert> : null}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        emptyMessage="Nenhum motorista favorito ainda. Favorite motoristas que já enviaram proposta nas cargas ou aqui, após buscá-los."
        sort={sort}
      />

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-lg space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Observações — {editing.driver?.name}
            </h3>
            <TextAreaField
              label="Observações internas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button loading={loading} onClick={() => void saveNotes()}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {removing ? (
        <ConfirmDialog
          open
          title="Remover dos favoritos?"
          description={
            <>
              Remover <strong>{removing.driver?.name ?? "motorista"}</strong> da
              lista de favoritos?
            </>
          }
          confirmLabel="Remover"
          tone="danger"
          loading={loading}
          onConfirm={() => void removeFavorite()}
          onCancel={() => setRemoving(null)}
        />
      ) : null}
    </>
  );
}
