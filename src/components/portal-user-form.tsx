"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  CheckboxField,
  FormActions,
  FormCard,
  FormSection,
  FormShell,
  SelectField,
  TextField,
} from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { UserRecord } from "@/lib/portal-types";
import { PORTAL_USER_ROLES } from "@/lib/portal-types";
import { CONTACT_CHANNEL_OPTIONS } from "@/lib/portal-types";

type Props = {
  mode: "create" | "edit";
  user?: UserRecord;
};

export function PortalUserForm({ mode, user }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRecord["role"]>(
    user?.role ?? "account_user",
  );
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [contactChannel, setContactChannel] = useState<
    "whatsapp" | "landline" | ""
  >(user?.contactChannel ?? "whatsapp");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [isActive, setIsActive] = useState(user?.status !== "inactive");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        await api("/portal/users", {
          method: "POST",
          json: {
            name,
            email,
            role,
            phone: phone.trim() || undefined,
            contactChannel: contactChannel || undefined,
            department: department.trim() || undefined,
          },
        });
        router.push("/portal/users");
        router.refresh();
      } else if (user) {
        await api(`/portal/users/${user.id}`, {
          method: "PATCH",
          json: {
            name,
            email,
            role,
            status: isActive ? "active" : "inactive",
            phone: phone.trim() || null,
            contactChannel: contactChannel || null,
            department: department.trim() || null,
          },
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
      backHref="/portal/users"
      backLabel="Usuários da empresa"
      title={mode === "create" ? "Novo usuário" : user?.name ?? "Editar usuário"}
      description={
        mode === "create"
          ? "Convide alguém da equipe. O acesso é feito por código enviado ao e-mail."
          : "Atualize perfil, e-mail ou status. Usuários inativos não conseguem entrar."
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)}>
        <FormCard>
          {error ? (
            <div className="px-5 pt-5">
              <Alert tone="error">{error}</Alert>
            </div>
          ) : null}

          <FormSection
            title="Dados do usuário"
            description="Administradores gerenciam a empresa; perfil operacional acessa cargas e propostas."
          >
            <TextField
              label="Nome"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: João Souza"
            />
            <TextField
              label="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.com"
            />
            <SelectField
              label="Perfil"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as UserRecord["role"])}
            >
              {PORTAL_USER_ROLES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-0000"
            />
            <SelectField
              label="Canal"
              value={contactChannel}
              onChange={(e) =>
                setContactChannel(e.target.value as "whatsapp" | "landline" | "")
              }
            >
              {CONTACT_CHANNEL_OPTIONS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Departamento"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ex.: Operações"
            />
            {mode === "edit" ? (
              <CheckboxField
                label="Usuário ativo"
                description="Desative para impedir login sem perder o histórico."
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            ) : null}
          </FormSection>

          <FormActions
            primaryLabel={mode === "create" ? "Convidar usuário" : "Salvar alterações"}
            loading={loading}
            backHref="/portal/users"
          />
        </FormCard>
      </form>
    </FormShell>
  );
}
