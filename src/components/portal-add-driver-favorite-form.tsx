"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverRecord, Paginated } from "@/lib/portal-types";

export function PortalAddDriverFavoriteForm() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eligible, setEligible] = useState<DriverRecord[]>([]);

  async function searchEligible() {
    if (!search.trim()) return;
    setSearching(true);
    setError(null);
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
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setEligible([]);
    } finally {
      setSearching(false);
    }
  }

  async function addFavorite(driverId: string) {
    setAddingId(driverId);
    setError(null);
    try {
      await api("/portal/driver-favorites", {
        method: "POST",
        json: { driverId },
      });
      setEligible((current) => current.filter((driver) => driver.id !== driverId));
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Adicionar favorito</p>
      <p className="text-sm text-muted">
        Somente motoristas que já enviaram proposta para cargas da empresa.
      </p>
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
          Buscar
        </Button>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      {eligible.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {eligible.map((driver) => (
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
                loading={addingId === driver.id}
                onClick={() => void addFavorite(driver.id)}
              >
                Favoritar
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
