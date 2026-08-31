"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { LoadRecord } from "@/lib/portal-types";

type Props = {
  loadId: string;
  compact?: boolean;
};

export function PortalLoadDuplicateButton({ loadId, compact = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDuplicate() {
    setLoading(true);
    setError(null);
    try {
      const created = await api<LoadRecord>(`/portal/loads/${loadId}/duplicate`, {
        method: "POST",
      });
      router.push(`/portal/loads/${created.id}`);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <button
        type="button"
        data-row-nav-ignore
        disabled={loading}
        className={compact ? "btn-ghost text-sm" : "btn-secondary btn-inline"}
        onClick={() => void handleDuplicate()}
      >
        {loading ? "Duplicando..." : "Nova a partir desta"}
      </button>
    </span>
  );
}
