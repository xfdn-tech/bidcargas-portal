"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeDriverReturnTo } from "@/lib/driver-return-to";
import {
  Alert,
  CurrencyField,
  FormActions,
  FormCard,
  FormSection,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { BidRecord, LoadRecord } from "@/lib/portal-types";
import {
  bidStatusLabel,
  formatMoneyFromCents,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/portal-types";

type Props = {
  load: LoadRecord;
  returnTo?: string | null;
};

export function DriverBidForm({ load, returnTo }: Props) {
  const router = useRouter();
  const [backHref, setBackHref] = useState(returnTo ?? "/driver/loads");
  const existing = load.myBid ?? null;
  const canBid =
    (load.status === "published" || load.status === "negotiating") &&
    load.allowsCounterOffer !== false &&
    existing?.status !== "pending" &&
    existing?.status !== "accepted";

  const [amountCents, setAmountCents] = useState<number | undefined>(
    existing?.amountCents ?? load.suggestedPriceCents ?? undefined,
  );
  const [deadlineAt, setDeadlineAt] = useState(
    toDatetimeLocalValue(existing?.deadlineAt),
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (returnTo) {
      setBackHref(returnTo);
      return;
    }
    const fromReferrer = safeDriverReturnTo(document.referrer);
    if (fromReferrer) {
      setBackHref(fromReferrer);
    }
  }, [returnTo]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!amountCents) {
      setError("Informe o valor da proposta.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api<BidRecord>(`/driver/loads/${load.id}/bids`, {
        method: "POST",
        json: {
          amountCents,
          deadlineAt: fromDatetimeLocalValue(deadlineAt),
          notes: notes.trim() || undefined,
        },
      });
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível enviar a proposta."));
    } finally {
      setLoading(false);
    }
  }

  const statusMessage =
    existing?.status === "pending"
      ? "Você já tem uma proposta pendente nesta carga."
      : existing?.status === "accepted"
        ? "Sua proposta foi aceita."
        : "Esta carga não aceita novas propostas.";

  const card = (
    <FormCard className="max-w-3xl">
      {error ? (
        <div className="px-6 pt-6 sm:px-8">
          <Alert tone="error">{error}</Alert>
        </div>
      ) : null}

      <FormSection
        title="Sua proposta"
        description={
          existing
            ? `Última proposta: ${formatMoneyFromCents(existing.amountCents)} · ${bidStatusLabel(existing.status)}`
            : "Envie um valor para esta carga. A empresa analisa e responde."
        }
      >
        {canBid ? (
          <>
            <CurrencyField
              label="Valor"
              required
              valueCents={amountCents}
              onValueCentsChange={setAmountCents}
            />
            <TextField
              label="Prazo de entrega"
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
            />
            <TextAreaField
              label="Observações"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </>
        ) : (
          <p className="text-sm text-muted">{statusMessage}</p>
        )}
      </FormSection>

      {canBid ? (
        <FormActions
          primaryLabel="Enviar proposta"
          loading={loading}
          backHref={backHref}
          backLabel="Voltar"
        />
      ) : (
        <div className="ui-form-actions">
          <Link href={backHref} className="ui-btn ui-btn-secondary ui-btn-md">
            Voltar
          </Link>
        </div>
      )}
    </FormCard>
  );

  if (!canBid) {
    return card;
  }

  return (
    <form onSubmit={handleSubmit}>{card}</form>
  );
}
