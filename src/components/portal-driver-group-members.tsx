"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ConfirmDialog } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  DriverGroupMemberRecord,
  DriverRecord,
  Paginated,
} from "@/lib/portal-types";

type Props = {
  groupId: string;
  members: DriverGroupMemberRecord[];
};

export function PortalDriverGroupMembers({ groupId, members }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [eligible, setEligible] = useState<DriverRecord[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<DriverGroupMemberRecord | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const memberIds = useMemo(
    () => new Set(members.map((member) => member.driverId)),
    [members],
  );

  async function searchEligible() {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const params = new URLSearchParams({
        search: search.trim(),
        limit: "20",
        page: "1",
      });
      const data = await api<Paginated<DriverRecord>>(
        `/portal/drivers/eligible?${params.toString()}`,
      );
      setEligible(data.items);
    } catch (error) {
      setSearchError(getApiErrorMessage(error));
      setEligible([]);
    } finally {
      setSearching(false);
    }
  }

  async function addDriver(driverId: string) {
    setAddingId(driverId);
    setActionError(null);
    try {
      await api(`/portal/driver-groups/${groupId}/members`, {
        method: "POST",
        json: { driverId },
      });
      setEligible((current) => current.filter((driver) => driver.id !== driverId));
      router.refresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setAddingId(null);
    }
  }

  async function removeDriver() {
    if (!confirmRemove?.driverId) return;
    setRemovingId(confirmRemove.driverId);
    setActionError(null);
    try {
      await api(
        `/portal/driver-groups/${groupId}/members/${confirmRemove.driverId}`,
        { method: "DELETE" },
      );
      setConfirmRemove(null);
      router.refresh();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Membros do grupo</h2>
        <p className="text-sm text-muted">
          Somente motoristas que já enviaram proposta para cargas da empresa podem
          ser incluídos.
        </p>
      </div>

      {actionError ? <Alert tone="error">{actionError}</Alert> : null}

      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Adicionar motorista</p>
        <div className="toolbar">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void searchEligible();
              }
            }}
            placeholder="Nome, CPF ou telefone..."
            aria-label="Buscar motorista"
            className="input-field min-w-[16rem] flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            loading={searching}
            onClick={() => void searchEligible()}
          >
            Buscar elegíveis
          </Button>
        </div>
        {searchError ? <Alert tone="error">{searchError}</Alert> : null}
        {eligible.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {eligible.map((driver) => {
              const alreadyMember = memberIds.has(driver.id);
              return (
                <li
                  key={driver.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{driver.name}</p>
                    <p className="text-sm text-muted">{driver.phone}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={alreadyMember || addingId === driver.id}
                    loading={addingId === driver.id}
                    onClick={() => void addDriver(driver.id)}
                  >
                    {alreadyMember ? "Já no grupo" : "Adicionar"}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {members.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-sm text-muted">
          Nenhum motorista neste grupo ainda.
        </p>
      ) : (
        <div className="data-table-wrap overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Motorista</th>
                <th>Contato</th>
                <th className="w-32">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <p className="font-medium text-foreground">
                      {member.driver?.name ?? "—"}
                    </p>
                  </td>
                  <td>{member.driver?.phone ?? "—"}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={removingId === member.driverId}
                      onClick={() => setConfirmRemove(member)}
                    >
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmRemove ? (
        <ConfirmDialog
          open
          title="Remover motorista do grupo?"
          description={
            <>
              Remover <strong>{confirmRemove.driver?.name ?? "motorista"}</strong>{" "}
              deste grupo? Ele continuará elegível para ser adicionado novamente.
            </>
          }
          confirmLabel="Remover"
          tone="danger"
          loading={Boolean(removingId)}
          onConfirm={() => void removeDriver()}
          onCancel={() => setConfirmRemove(null)}
        />
      ) : null}
    </section>
  );
}
