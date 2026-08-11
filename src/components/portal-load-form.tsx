"use client";

import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PortalLoadDetailActions } from "@/components/portal-load-detail-actions";
import { PortalLoadStatusBadge } from "@/components/portal-load-status-badge";
import {
  Alert,
  ButtonLink,
  CheckboxField,
  CurrencyField,
  LocationSearchField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { LoadRecord, VehicleTypeRecord } from "@/lib/portal-types";
import {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/portal-types";

type Props = {
  mode: "create" | "edit";
  load?: LoadRecord;
  vehicleTypes: VehicleTypeRecord[];
};

function PanelIcon({ children }: { children: ReactNode }) {
  return <div className="load-form-panel-icon">{children}</div>;
}

function FormPanel({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="load-form-panel">
      <div className="load-form-panel-header">
        <PanelIcon>{icon}</PanelIcon>
        <div>
          <h2 className="load-form-panel-title">{title}</h2>
          <p className="load-form-panel-description">{description}</p>
        </div>
      </div>
      <div className="load-form-panel-body">{children}</div>
    </section>
  );
}

function RoutePreview({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const hasOrigin = Boolean(origin.trim());
  const hasDestination = Boolean(destination.trim());

  return (
    <div className="load-form-route-card" aria-live="polite">
      <div className="load-form-route-grid">
        <div className="load-form-route-point">
          <p className="load-form-route-label">Origem</p>
          <p
            className={
              hasOrigin
                ? "load-form-route-value"
                : "load-form-route-value load-form-route-value--empty"
            }
          >
            {hasOrigin ? origin : "Informe a coleta"}
          </p>
        </div>

        <div className="load-form-route-connector" aria-hidden="true">
          <div className="load-form-route-truck">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11" />
              <path d="M15 18H9" />
              <path d="M19 18h2v-3.34a1 1 0 0 0-.26-.66L19 12.5V10a1 1 0 0 0-1-1h-3" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </div>
          <div className="load-form-route-line" />
        </div>

        <div className="load-form-route-point sm:text-right">
          <p className="load-form-route-label">Destino</p>
          <p
            className={
              hasDestination
                ? "load-form-route-value"
                : "load-form-route-value load-form-route-value--empty"
            }
          >
            {hasDestination ? destination : "Informe a entrega"}
          </p>
        </div>
      </div>
    </div>
  );
}

type LoadFieldErrors = {
  title?: string;
  origin?: string;
  destination?: string;
};

function validateLoadForm(values: {
  title: string;
  origin: string;
  destination: string;
}): LoadFieldErrors {
  const errors: LoadFieldErrors = {};

  if (!values.title.trim()) {
    errors.title = "Informe o título da carga.";
  }
  if (!values.origin.trim()) {
    errors.origin = "Informe a origem.";
  }
  if (!values.destination.trim()) {
    errors.destination = "Informe o destino.";
  }

  return errors;
}

export function PortalLoadForm({ mode, load, vehicleTypes }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(load?.title ?? "");
  const [description, setDescription] = useState(load?.description ?? "");
  const [origin, setOrigin] = useState(load?.origin ?? "");
  const [destination, setDestination] = useState(load?.destination ?? "");
  const [weightKg, setWeightKg] = useState(load?.weightKg ?? "");
  const [volumeM3, setVolumeM3] = useState(load?.volumeM3 ?? "");
  const [vehicleTypeId, setVehicleTypeId] = useState(load?.vehicleTypeId ?? "");
  const [pickupAt, setPickupAt] = useState(toDatetimeLocalValue(load?.pickupAt));
  const [deliveryAt, setDeliveryAt] = useState(
    toDatetimeLocalValue(load?.deliveryAt),
  );
  const [suggestedPriceCents, setSuggestedPriceCents] = useState<
    number | undefined
  >(load?.suggestedPriceCents ?? undefined);
  const [allowsCounterOffer, setAllowsCounterOffer] = useState(
    load?.allowsCounterOffer ?? true,
  );
  const [notes, setNotes] = useState(load?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoadFieldErrors>({});

  function clearFieldError(field: keyof LoadFieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function buildPayload() {
    return {
      title,
      description: description.trim() || undefined,
      origin,
      destination,
      weightKg: weightKg.trim() || undefined,
      volumeM3: volumeM3.trim() || undefined,
      vehicleTypeId: vehicleTypeId || undefined,
      pickupAt: fromDatetimeLocalValue(pickupAt),
      deliveryAt: fromDatetimeLocalValue(deliveryAt),
      suggestedPriceCents,
      allowsCounterOffer,
      notes: notes.trim() || undefined,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const nextFieldErrors = validateLoadForm({ title, origin, destination });
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      if (mode === "create") {
        const created = await api<LoadRecord>("/portal/loads", {
          method: "POST",
          json: buildPayload(),
        });
        router.push(`/portal/loads/${created.id}`);
        router.refresh();
      } else if (load) {
        await api(`/portal/loads/${load.id}`, {
          method: "PATCH",
          json: buildPayload(),
        });
        router.refresh();
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  const pageTitle =
    mode === "create" ? "Nova carga" : load?.title ?? "Editar carga";

  return (
    <div className="load-form-page">
      <header className="load-form-top">
        <div className="min-w-0 flex-1">
          <Link href="/portal/loads" className="load-form-back">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18 9 12l6-6" />
            </svg>
            Cargas
          </Link>

          <div className="load-form-heading">
            <div className="load-form-title-row">
              <h1 className="load-form-title">{pageTitle}</h1>
              {load ? <PortalLoadStatusBadge status={load.status} /> : null}
            </div>
            <p className="load-form-subtitle">
              {mode === "create"
                ? "Monte a publicação em etapas. Salve como rascunho e publique quando estiver pronta."
                : "Ajuste os dados do rascunho. Após publicar, a carga ficará aberta para propostas."}
            </p>
          </div>
        </div>

        {load?.status === "draft" ? (
          <div className="load-form-toolbar">
            <PortalLoadDetailActions load={load} variant="toolbar" />
          </div>
        ) : null}
      </header>

      <RoutePreview origin={origin} destination={destination} />

      <form noValidate onSubmit={(e) => void handleSubmit(e)}>
        {error ? (
          <div className="load-form-error">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}

        <div className="load-form-stack">
          <FormPanel
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            }
            title="Rota e identificação"
            description="Título, origem e destino são obrigatórios para publicar."
          >
            <div className="load-form-fields-grid">
              <div className="load-form-fields-span-2">
                <TextField
                  label="Título da carga"
                  required
                  error={fieldErrors.title}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError("title");
                  }}
                  placeholder="Ex.: Grãos Curitiba → Santos"
                />
              </div>
              <div className="load-form-fields-span-2">
                <TextAreaField
                  label="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mercadoria, restrições de carga/descarga, observações para motoristas..."
                  rows={3}
                />
              </div>
              <LocationSearchField
                label="Origem"
                required
                error={fieldErrors.origin}
                value={origin}
                onValueChange={(value) => {
                  setOrigin(value);
                  clearFieldError("origin");
                }}
                placeholder="Busque a cidade de origem..."
                hint="Selecione na lista ou digite Cidade, UF."
              />
              <LocationSearchField
                label="Destino"
                required
                error={fieldErrors.destination}
                value={destination}
                onValueChange={(value) => {
                  setDestination(value);
                  clearFieldError("destination");
                }}
                placeholder="Busque a cidade de destino..."
                hint="Selecione na lista ou digite Cidade, UF."
              />
            </div>
          </FormPanel>

          <FormPanel
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11" />
                <path d="M15 18H9" />
                <path d="M19 18h2v-3.34a1 1 0 0 0-.26-.66L19 12.5V10a1 1 0 0 0-1-1h-3" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            }
            title="Carga e veículo"
            description="Detalhes físicos e tipo de carroceria esperado."
          >
            <div className="load-form-fields-grid load-form-fields-grid--2">
              <TextField
                label="Peso (kg)"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ex.: 25.000"
                inputMode="decimal"
              />
              <TextField
                label="Volume (m³)"
                value={volumeM3}
                onChange={(e) => setVolumeM3(e.target.value)}
                placeholder="Ex.: 45"
                inputMode="decimal"
              />
              <div className="load-form-fields-span-2">
                <SelectField
                  label="Tipo de veículo"
                  value={vehicleTypeId}
                  onChange={(e) => setVehicleTypeId(e.target.value)}
                >
                  <option value="">Não especificado</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                      {type.category?.name ? ` · ${type.category.name}` : ""}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
          </FormPanel>

          <FormPanel
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            }
            title="Prazos e valor"
            description="Oriente motoristas sobre janela de coleta e expectativa de frete."
          >
            <div className="load-form-fields-grid load-form-fields-grid--2">
              <TextField
                label="Coleta prevista"
                type="datetime-local"
                value={pickupAt}
                onChange={(e) => setPickupAt(e.target.value)}
              />
              <TextField
                label="Entrega prevista"
                type="datetime-local"
                value={deliveryAt}
                onChange={(e) => setDeliveryAt(e.target.value)}
              />
              <div className="load-form-fields-span-2 load-form-highlight">
                <CurrencyField
                  label="Valor sugerido"
                  valueCents={suggestedPriceCents}
                  onValueCentsChange={setSuggestedPriceCents}
                  placeholder="0,00"
                  hint="Referência para negociação — não é um valor fixo."
                />
                <div className="mt-3">
                  <CheckboxField
                    label="Aceita contraproposta"
                    description="Motoristas podem enviar valores diferentes do sugerido."
                    checked={allowsCounterOffer}
                    onChange={(e) => setAllowsCounterOffer(e.target.checked)}
                  />
                </div>
              </div>
              <div className="load-form-fields-span-2">
                <TextAreaField
                  label="Observações internas"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções para equipe ou motoristas..."
                  rows={3}
                />
              </div>
            </div>
          </FormPanel>
        </div>

        <footer className="load-form-footer">
          <p className="load-form-footer-note">
            {mode === "create"
              ? "Salva como rascunho — você publica quando quiser."
              : "Alterações ficam salvas no rascunho até publicar."}
          </p>
          <div className="load-form-footer-actions">
            <ButtonLink href="/portal/loads" variant="secondary">
              Cancelar
            </ButtonLink>
            <button
              type="submit"
              disabled={loading}
              className="ui-btn ui-btn-primary ui-btn-md"
            >
              {loading ? <span className="ui-btn-spinner" aria-hidden="true" /> : null}
              <span>
                {loading
                  ? "Salvando..."
                  : mode === "create"
                    ? "Salvar rascunho"
                    : "Salvar alterações"}
              </span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
