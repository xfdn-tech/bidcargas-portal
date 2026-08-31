"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  FormActions,
  FormCard,
  FormSection,
  SelectField,
  TextField,
} from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverProfileRecord } from "@/lib/portal-types";

const CNH_CATEGORIES = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

type Props = {
  profile: DriverProfileRecord;
};

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, a, b, c, d) =>
    d ? `${a}.${b}.${c}-${d}` : `${a}.${b}.${c}`,
  );
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

export function DriverProfileForm({ profile }: Props) {
  const router = useRouter();
  const [cnhNumber, setCnhNumber] = useState(profile.cnhNumber ?? "");
  const [cnhCategory, setCnhCategory] = useState(profile.cnhCategory ?? "");
  const [cnhExpiresAt, setCnhExpiresAt] = useState(
    profile.cnhExpiresAt?.slice(0, 10) ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await api("/driver/profile", {
        method: "PATCH",
        json: {
          cnhNumber: cnhNumber.replace(/\D/g, "") || undefined,
          cnhCategory: cnhCategory || undefined,
          cnhExpiresAt: cnhExpiresAt || undefined,
        },
      });
      setSaved(true);
      router.refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível salvar o perfil."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormCard>
        <FormSection title="Dados pessoais" description="Informações da conta.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Nome" value={profile.name} disabled />
            <TextField label="E-mail" value={profile.email ?? ""} disabled />
            <TextField label="CPF" value={formatCpf(profile.cpf)} disabled />
            <TextField label="Telefone" value={formatPhone(profile.phone)} disabled />
          </div>
        </FormSection>
      </FormCard>

      <FormCard>
        <FormSection title="CNH" description="Atualize os dados da sua habilitação.">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {saved ? <Alert tone="success">Perfil atualizado.</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Número da CNH"
              value={cnhNumber}
              onChange={(event) =>
                setCnhNumber(event.target.value.replace(/\D/g, "").slice(0, 11))
              }
            />
            <SelectField
              label="Categoria"
              value={cnhCategory}
              onChange={(event) => setCnhCategory(event.target.value)}
            >
              <option value="">Selecione</option>
              {CNH_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Validade"
              type="date"
              value={cnhExpiresAt}
              onChange={(event) => setCnhExpiresAt(event.target.value)}
            />
          </div>
        </FormSection>
      </FormCard>

      <FormActions
        primaryLabel="Salvar"
        loading={loading}
        backHref="/driver"
        backLabel="Voltar"
      />
    </form>
  );
}
