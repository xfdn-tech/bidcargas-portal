"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, TextAreaField, TextField } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverRatingContext, DriverRatingRecord } from "@/lib/portal-types";

type Props = {
  loadId: string;
  initial: DriverRatingContext;
};

function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (score: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nota de 1 a 5">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          aria-label={`${score} estrela${score === 1 ? "" : "s"}`}
          aria-pressed={value === score}
          onClick={() => onChange(score)}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
            value === score
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-surface text-muted hover:border-brand/40 hover:text-foreground"
          }`}
        >
          {score}
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ rating }: { rating: DriverRatingRecord }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface px-4 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge badge-brand text-base">{rating.score}/5</span>
        <span className="text-sm text-muted">
          Avaliado em {new Date(rating.createdAt).toLocaleString("pt-BR")}
        </span>
      </div>
      {rating.lowScoreReason ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Motivo da nota baixa</p>
          <p className="mt-1 text-sm text-foreground">{rating.lowScoreReason}</p>
        </div>
      ) : null}
      {rating.comment ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Comentário</p>
          <p className="mt-1 text-sm text-foreground">{rating.comment}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PortalLoadDriverRating({ loadId, initial }: Props) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [lowScoreReason, setLowScoreReason] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresReason = useMemo(
    () => score > 0 && score <= initial.reasonBelowScore,
    [score, initial.reasonBelowScore],
  );

  if (!initial.enabled || !initial.canRate) {
    return null;
  }

  if (initial.rating) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Avaliação do motorista</h2>
          <p className="text-sm text-muted">
            Sua avaliação de {initial.acceptedDriver?.name ?? "motorista"} nesta carga.
          </p>
        </div>
        <RatingSummary rating={initial.rating} />
      </section>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (score < 1) {
      setError("Selecione uma nota de 1 a 5.");
      return;
    }
    if (requiresReason && lowScoreReason.trim().length < 5) {
      setError(`Informe o motivo para notas iguais ou inferiores a ${initial.reasonBelowScore}.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api(`/portal/loads/${loadId}/driver-rating`, {
        method: "POST",
        json: {
          score,
          lowScoreReason: requiresReason ? lowScoreReason.trim() : undefined,
          comment: comment.trim() || undefined,
        },
      });
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Avaliar motorista</h2>
        <p className="text-sm text-muted">
          Como foi a experiência com {initial.acceptedDriver?.name ?? "o motorista"} nesta carga?
        </p>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-xl border border-border bg-surface p-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Nota geral</p>
          <StarSelector value={score} onChange={setScore} disabled={loading} />
        </div>

        {requiresReason ? (
          <TextField
            label="Motivo da nota baixa"
            required
            value={lowScoreReason}
            onChange={(e) => setLowScoreReason(e.target.value)}
            placeholder="Descreva o que não funcionou"
            hint={`Obrigatório para notas iguais ou inferiores a ${initial.reasonBelowScore}.`}
          />
        ) : null}

        <TextAreaField
          label="Comentário"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Elogios, observações ou pontos de melhoria (opcional)"
          rows={4}
        />

        <Button type="submit" disabled={loading || score < 1}>
          {loading ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </form>
    </section>
  );
}
