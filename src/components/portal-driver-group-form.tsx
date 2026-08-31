"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  FormActions,
  FormCard,
  FormSection,
  FormShell,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverGroupRecord } from "@/lib/portal-types";

type Props = {
  mode: "create" | "edit";
  group?: DriverGroupRecord;
};

export function PortalDriverGroupForm({ mode, group }: Props) {
  const router = useRouter();
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(group?.sortOrder ?? 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (mode === "create") {
        const created = await api<DriverGroupRecord>("/portal/driver-groups", {
          method: "POST",
          json: payload,
        });
        router.push(`/portal/driver-groups/${created.id}`);
        router.refresh();
      } else if (group) {
        await api(`/portal/driver-groups/${group.id}`, {
          method: "PATCH",
          json: payload,
        });
        router.refresh();
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      backHref={
        mode === "edit" && group
          ? `/portal/driver-groups/${group.id}`
          : "/portal/driver-groups"
      }
      backLabel="Grupos de motoristas"
      title={mode === "create" ? "Novo grupo" : group?.name ?? "Editar grupo"}
      description="Organize motoristas que já enviaram proposta para cargas da empresa."
    >
      <form onSubmit={(e) => void handleSubmit(e)}>
        <FormCard>
          {error ? (
            <div className="px-5 pt-5">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <FormSection title="Identificação">
            <TextField
              label="Nome do grupo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
            />
            <TextAreaField
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              hint="Opcional — ajuda a equipe a entender o propósito do grupo."
            />
            <TextField
              label="Ordem de exibição"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              hint="Grupos com número menor aparecem primeiro."
            />
          </FormSection>

          <FormActions
            primaryLabel={mode === "create" ? "Criar grupo" : "Salvar alterações"}
            loading={loading}
            backHref={
              mode === "edit" && group
                ? `/portal/driver-groups/${group.id}`
                : "/portal/driver-groups"
            }
          />
        </FormCard>
      </form>
    </FormShell>
  );
}
