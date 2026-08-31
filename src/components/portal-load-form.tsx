"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
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
import {
  closedBodyTypeIds,
  heavyVehicleIds,
  suggestedBodyTypeIds,
  suggestedVehicleIds,
} from "@/lib/load-suggestions";
import type {
  AnttQuote,
  BodyTypeRecord,
  FreightKind,
  LoadRecord,
  LoadSpeciesRecord,
  LoadTypeRecord,
  PaymentMethod,
  PriceUnit,
  UserRecord,
  VehicleTypeRecord,
} from "@/lib/portal-types";
import {
  FREIGHT_KIND_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PRICE_UNIT_OPTIONS,
  BODY_TYPE_GROUP_OPTIONS,
  formatMoneyFromCents,
  fromDatetimeLocalValue,
  parseCityState,
  toDatetimeLocalValue,
} from "@/lib/portal-types";

type Props = {
  mode: "create" | "edit";
  load?: LoadRecord;
  vehicleTypes: VehicleTypeRecord[];
  loadTypes: LoadTypeRecord[];
  species: LoadSpeciesRecord[];
  bodyTypes: BodyTypeRecord[];
  users: UserRecord[];
  currentUserId: string;
  lastLoad?: LoadRecord | null;
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

type FieldErrors = {
  origin?: string;
  destination?: string;
  product?: string;
  loadTypeId?: string;
  vehicleTypeIds?: string;
  price?: string;
};

function formatPercentPt(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function ChipButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={selected ? "load-form-chip is-selected" : "load-form-chip"}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PortalLoadForm({
  mode,
  load,
  vehicleTypes,
  loadTypes,
  species,
  bodyTypes,
  users,
  currentUserId,
  lastLoad,
}: Props) {
  const router = useRouter();
  const [origin, setOrigin] = useState(load?.origin ?? "");
  const [destination, setDestination] = useState(load?.destination ?? "");
  const [originCity, setOriginCity] = useState(load?.originCity ?? "");
  const [originState, setOriginState] = useState(load?.originState ?? "");
  const [destinationCity, setDestinationCity] = useState(load?.destinationCity ?? "");
  const [destinationState, setDestinationState] = useState(
    load?.destinationState ?? "",
  );
  const [product, setProduct] = useState(load?.product ?? "");
  const [loadTypeId, setLoadTypeId] = useState(load?.loadTypeId ?? "");
  const [loadSpeciesId, setLoadSpeciesId] = useState(load?.loadSpeciesId ?? "");
  const [weightUnit, setWeightUnit] = useState<"kg" | "ton">("kg");
  const [weightValue, setWeightValue] = useState(() => {
    if (!load?.weightKg) return "";
    return String(load.weightKg);
  });
  const [volumeM3, setVolumeM3] = useState(load?.volumeM3 ?? "");
  const [vehicleTypeIds, setVehicleTypeIds] = useState<string[]>(
    load?.vehicleTypes?.map((item) => item.id) ??
      (load?.vehicleTypeId ? [load.vehicleTypeId] : []),
  );
  const [bodyTypeIds, setBodyTypeIds] = useState<string[]>(
    load?.bodyTypes?.map((item) => item.id) ?? [],
  );
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [bodyQuery, setBodyQuery] = useState("");
  const [freightKind, setFreightKind] = useState<FreightKind>(
    load?.freightKind ?? "full",
  );
  const [needsTracker, setNeedsTracker] = useState(load?.needsTracker ?? false);
  const [emptyReturn, setEmptyReturn] = useState(load?.emptyReturn ?? false);
  const [highPerformance, setHighPerformance] = useState(
    load?.highPerformance ?? false,
  );
  const [vehicleComposition, setVehicleComposition] = useState(
    load?.vehicleComposition ?? true,
  );
  const [needsTarp, setNeedsTarp] = useState(load?.needsTarp ?? false);
  const [pickupAt, setPickupAt] = useState(toDatetimeLocalValue(load?.pickupAt));
  const [deliveryAt, setDeliveryAt] = useState(
    toDatetimeLocalValue(load?.deliveryAt),
  );
  const [priceKnown, setPriceKnown] = useState(
    load ? load.suggestedPriceCents != null : true,
  );
  const [suggestedPriceCents, setSuggestedPriceCents] = useState<
    number | undefined
  >(load?.suggestedPriceCents ?? undefined);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>(load?.priceUnit ?? "trip");
  const [advancePercent, setAdvancePercent] = useState(
    String(load?.advancePercent ?? lastLoad?.advancePercent ?? 0),
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    load?.paymentMethods?.length
      ? load.paymentMethods
      : lastLoad?.paymentMethods?.length
        ? lastLoad.paymentMethods
        : ["pix"],
  );
  const [tollSeparate, setTollSeparate] = useState(load?.tollSeparate ?? true);
  const [distanceKm, setDistanceKm] = useState(load?.distanceKm ?? "");
  const [notes, setNotes] = useState(load?.notes ?? "");
  const [contactIds, setContactIds] = useState<string[]>(() => {
    const saved = load?.contacts?.map((item) => item.userId) ?? [];
    if (saved.length) return saved;
    return currentUserId ? [currentUserId] : [];
  });
  const [showMore, setShowMore] = useState(Boolean(load?.notes || load?.volumeM3));
  const [quote, setQuote] = useState<AnttQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const selectedLoadType = loadTypes.find((item) => item.id === loadTypeId);
  const filteredSpecies = species.filter(
    (item) => !item.loadTypeId || item.loadTypeId === loadTypeId,
  );
  const filteredVehicles = vehicleTypes.filter((item) =>
    item.name.toLowerCase().includes(vehicleQuery.trim().toLowerCase()),
  );
  const filteredBodies = bodyTypes.filter((item) =>
    item.name.toLowerCase().includes(bodyQuery.trim().toLowerCase()),
  );
  const vehiclesByCategory = useMemo(() => {
    const groups = new Map<string, VehicleTypeRecord[]>();
    for (const item of filteredVehicles) {
      const key = item.category?.name ?? "Outros";
      const list = groups.get(key) ?? [];
      list.push(item);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [filteredVehicles]);
  const bodiesByGroup = useMemo(
    () =>
      BODY_TYPE_GROUP_OPTIONS.map((group) => ({
        ...group,
        items: filteredBodies.filter((item) => item.group === group.value),
      })).filter((group) => group.items.length > 0),
    [filteredBodies],
  );
  const maxAxles = Math.max(
    0,
    ...vehicleTypes
      .filter((item) => vehicleTypeIds.includes(item.id))
      .map((item) => item.axles),
  );
  const generatedTitle =
    product.trim() && origin.trim() && destination.trim()
      ? `${product.trim()} · ${origin.trim()} → ${destination.trim()}`
      : "Nova carga";

  function toggleId(list: string[], id: string) {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  function validate(forPublish: boolean): FieldErrors {
    const errors: FieldErrors = {};
    if (!origin.trim()) errors.origin = "Informe a origem.";
    if (!destination.trim()) errors.destination = "Informe o destino.";
    if (forPublish && !product.trim()) errors.product = "Informe o produto.";
    if (forPublish && !loadTypeId) errors.loadTypeId = "Informe o tipo de carga.";
    if (forPublish && vehicleTypeIds.length < 1) {
      errors.vehicleTypeIds = "Selecione ao menos um veículo.";
    }
    if (forPublish && priceKnown && (suggestedPriceCents == null || suggestedPriceCents < 0)) {
      errors.price = "Informe o valor ou marque a combinar.";
    }
    return errors;
  }

  function weightKgPayload() {
    const raw = weightValue.trim().replace(",", ".");
    if (!raw) return undefined;
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) return undefined;
    return String(weightUnit === "ton" ? numeric * 1000 : numeric);
  }

  function buildPayload() {
    const originParts = parseCityState(origin);
    const destinationParts = parseCityState(destination);
    return {
      product: product.trim() || undefined,
      origin,
      destination,
      originCity: originCity || originParts.city,
      originState: originState || originParts.state,
      destinationCity: destinationCity || destinationParts.city,
      destinationState: destinationState || destinationParts.state,
      weightKg: weightKgPayload(),
      volumeM3: volumeM3.trim() || undefined,
      loadTypeId: loadTypeId || undefined,
      loadSpeciesId: loadSpeciesId || undefined,
      freightKind,
      vehicleTypeIds,
      bodyTypeIds,
      paymentMethods,
      needsTracker,
      emptyReturn,
      highPerformance,
      vehicleComposition,
      needsTarp,
      pickupAt: fromDatetimeLocalValue(pickupAt),
      deliveryAt: fromDatetimeLocalValue(deliveryAt),
      suggestedPriceCents: priceKnown ? suggestedPriceCents : undefined,
      priceUnit,
      advancePercent: Number(advancePercent) || 0,
      tollSeparate,
      allowsCounterOffer: true,
      distanceKm: distanceKm.trim() ? Number(distanceKm.replace(",", ".")) : undefined,
      notes: notes.trim() || undefined,
      contacts: contactIds.slice(0, 3).map((userId, index) => ({
        userId,
        isPrimary: index === 0,
      })),
    };
  }

  async function saveLoad(forPublish: boolean) {
    const nextErrors = validate(forPublish);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setShowMore(true);
      throw new Error("Preencha os campos obrigatórios.");
    }
    setFieldErrors({});
    const payload = {
      ...buildPayload(),
      allowsCounterOffer: true,
      suggestedPriceCents: priceKnown
        ? suggestedPriceCents
        : mode === "create"
          ? undefined
          : null,
    };

    if (mode === "create") {
      return api<LoadRecord>("/portal/loads", { method: "POST", json: payload });
    }
    await api(`/portal/loads/${load!.id}`, { method: "PATCH", json: payload });
    return { id: load!.id } as LoadRecord;
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const saved = await saveLoad(false);
      router.push(`/portal/loads/${saved.id}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message.startsWith("Preencha")
          ? requestError.message
          : getApiErrorMessage(requestError),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setPublishing(true);
    try {
      const saved = await saveLoad(true);
      await api(`/portal/loads/${saved.id}/publish`, { method: "POST" });
      router.push(`/portal/loads/${saved.id}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error && requestError.message.startsWith("Preencha")
          ? requestError.message
          : getApiErrorMessage(requestError),
      );
    } finally {
      setPublishing(false);
    }
  }

  useEffect(() => {
    if (!origin.trim() || !destination.trim()) return;
    const timer = window.setTimeout(() => {
      void api<{ distanceKm: number } | null>(
        `/portal/locations/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
      )
        .then((result) => {
          if (result?.distanceKm && !load?.distanceKm) {
            setDistanceKm(String(result.distanceKm));
          } else if (result?.distanceKm && mode === "create") {
            setDistanceKm((current) => current || String(result.distanceKm));
          }
        })
        .catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [origin, destination, load?.distanceKm, mode]);

  useEffect(() => {
    if (
      freightKind !== "full" ||
      !selectedLoadType ||
      !maxAxles ||
      !distanceKm.trim()
    ) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    const km = Number(distanceKm.replace(",", "."));
    if (!Number.isFinite(km) || km <= 0) return;
    const timer = window.setTimeout(() => {
      void api<AnttQuote>("/portal/loads/antt-quote", {
        method: "POST",
        json: {
          cargoKind: selectedLoadType.anttCargoKind,
          axles: maxAxles,
          distanceKm: km,
          vehicleComposition,
          highPerformance,
          emptyReturn,
        },
      })
        .then((result) => {
          setQuote(result);
          setQuoteError(null);
        })
        .catch((requestError) => {
          setQuote(null);
          setQuoteError(getApiErrorMessage(requestError));
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    freightKind,
    selectedLoadType,
    maxAxles,
    distanceKm,
    vehicleComposition,
    highPerformance,
    emptyReturn,
  ]);

  const floorComparison = useMemo(() => {
    if (!quote || !priceKnown || suggestedPriceCents == null || quote.totalCents <= 0) {
      return null;
    }
    const diffCents = suggestedPriceCents - quote.totalCents;
    const percent = (Math.abs(diffCents) / quote.totalCents) * 100;
    if (percent < 0.05) {
      return { status: "equal" as const, percent: 0, diffCents: 0 };
    }
    return {
      status: (diffCents < 0 ? "below" : "above") as "below" | "above",
      percent,
      diffCents: Math.abs(diffCents),
    };
  }, [quote, priceKnown, suggestedPriceCents]);

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
              <h1 className="load-form-title">{generatedTitle}</h1>
              {load ? <PortalLoadStatusBadge status={load.status} /> : null}
            </div>
            <p className="load-form-subtitle">
              Cadastro em uma tela. O título é gerado pelo produto e pela rota.
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

      <form noValidate onSubmit={(e) => void handleSave(e)}>
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
            title="Rota e produto"
            description="Origem, destino, produto, tipo de carga e peso."
          >
            <div className="load-form-fields-grid load-form-fields-grid--2">
              <LocationSearchField
                label="Origem"
                required
                error={fieldErrors.origin}
                value={origin}
                onValueChange={(value) => {
                  setOrigin(value);
                  setFieldErrors((current) => ({ ...current, origin: undefined }));
                }}
                onLocationSelect={(location) => {
                  setOriginCity(location.city);
                  setOriginState(location.state);
                }}
                placeholder="Busque a cidade de coleta..."
              />
              <LocationSearchField
                label="Destino"
                required
                error={fieldErrors.destination}
                value={destination}
                onValueChange={(value) => {
                  setDestination(value);
                  setFieldErrors((current) => ({ ...current, destination: undefined }));
                }}
                onLocationSelect={(location) => {
                  setDestinationCity(location.city);
                  setDestinationState(location.state);
                }}
                placeholder="Busque a cidade de entrega..."
              />
              <TextField
                label="Produto"
                required
                error={fieldErrors.product}
                value={product}
                maxLength={80}
                onChange={(e) => {
                  setProduct(e.target.value);
                  setFieldErrors((current) => ({ ...current, product: undefined }));
                }}
                placeholder="Ex.: Soja em grãos"
              />
              <SelectField
                label="Tipo de carga"
                required
                error={fieldErrors.loadTypeId}
                value={loadTypeId}
                onChange={(e) => {
                  setLoadTypeId(e.target.value);
                  setLoadSpeciesId("");
                  setFieldErrors((current) => ({ ...current, loadTypeId: undefined }));
                }}
              >
                <option value="">Selecione</option>
                {loadTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Espécie"
                value={loadSpeciesId}
                onChange={(e) => setLoadSpeciesId(e.target.value)}
              >
                <option value="">Não informado</option>
                {filteredSpecies.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectField>
              <div className="flex gap-2">
                <TextField
                  label="Peso"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="Ex.: 25000"
                  inputMode="decimal"
                  containerClassName="flex-1"
                />
                <SelectField
                  label="Unidade"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as "kg" | "ton")}
                  containerClassName="w-28"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                </SelectField>
              </div>
              <SelectField
                label="Tipo de frete"
                value={freightKind}
                onChange={(e) => setFreightKind(e.target.value as FreightKind)}
              >
                {FREIGHT_KIND_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
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
            title="Veículos"
            description="Use os sugeridos ou busque e marque em chips."
          >
            <div className="load-form-chip-shortcuts">
              <button
                type="button"
                className="btn-secondary btn-inline"
                onClick={() => {
                  setVehicleTypeIds(suggestedVehicleIds(selectedLoadType, vehicleTypes));
                  setBodyTypeIds(suggestedBodyTypeIds(selectedLoadType, bodyTypes));
                  setFieldErrors((current) => ({ ...current, vehicleTypeIds: undefined }));
                }}
              >
                Usar sugeridos
              </button>
              <button
                type="button"
                className="btn-ghost btn-inline"
                onClick={() => setVehicleTypeIds(heavyVehicleIds(vehicleTypes))}
              >
                Todos os pesados
              </button>
            </div>
            {fieldErrors.vehicleTypeIds ? (
              <p className="ui-field-error mb-2">{fieldErrors.vehicleTypeIds}</p>
            ) : null}
            <TextField
              label="Buscar veículo"
              value={vehicleQuery}
              onChange={(e) => setVehicleQuery(e.target.value)}
              placeholder="Toco, bitrem, carreta..."
            />
            {vehiclesByCategory.length ? (
              vehiclesByCategory.map(([category, items]) => (
                <div key={category} className="load-form-catalog-group">
                  <p className="load-form-catalog-group-title">{category}</p>
                  <div className="load-form-chips">
                    {items.map((item) => (
                      <ChipButton
                        key={item.id}
                        selected={vehicleTypeIds.includes(item.id)}
                        onClick={() =>
                          setVehicleTypeIds((current) => toggleId(current, item.id))
                        }
                      >
                        {item.name}
                        <span className="text-muted">· {item.axles} eixos</span>
                      </ChipButton>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-3 text-sm text-muted">Nenhum tipo de veículo encontrado.</p>
            )}
          </FormPanel>

          <FormPanel
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="7" width="18" height="12" rx="2" />
                <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
              </svg>
            }
            title="Carroceria"
            description="Marque as carrocerias aceitas. Use os sugeridos pelo tipo de carga."
          >
            <div className="load-form-chip-shortcuts">
              <button
                type="button"
                className="btn-secondary btn-inline"
                onClick={() =>
                  setBodyTypeIds(suggestedBodyTypeIds(selectedLoadType, bodyTypes))
                }
              >
                Selecionar sugeridos
              </button>
              <button
                type="button"
                className="btn-ghost btn-inline"
                onClick={() => setBodyTypeIds(closedBodyTypeIds(bodyTypes))}
              >
                Todas as fechadas
              </button>
            </div>
            <TextField
              label="Buscar carroceria"
              value={bodyQuery}
              onChange={(e) => setBodyQuery(e.target.value)}
              placeholder="Baú, sider, tanque..."
            />
            {bodiesByGroup.length ? (
              bodiesByGroup.map((group) => (
                <div key={group.value} className="load-form-catalog-group">
                  <p className="load-form-catalog-group-title">{group.label}</p>
                  <div className="load-form-chips">
                    {group.items.map((item) => (
                      <ChipButton
                        key={item.id}
                        selected={bodyTypeIds.includes(item.id)}
                        onClick={() =>
                          setBodyTypeIds((current) => toggleId(current, item.id))
                        }
                      >
                        {item.name}
                      </ChipButton>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-3 text-sm text-muted">Nenhum tipo de carroceria encontrado.</p>
            )}
          </FormPanel>

          <FormPanel
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            }
            title="Valor e piso ANTT"
            description="Informe o valor ou deixe a combinar. O piso é calculado sozinho."
          >
            <div className="load-form-fields-grid load-form-fields-grid--2">
              <div>
                <p className="ui-field-label mb-2">Como publicar o valor</p>
                <div className="load-form-chips">
                  <ChipButton selected={priceKnown} onClick={() => setPriceKnown(true)}>
                    Já sei o valor
                  </ChipButton>
                  <ChipButton
                    selected={!priceKnown}
                    onClick={() => {
                      setPriceKnown(false);
                      setSuggestedPriceCents(undefined);
                    }}
                  >
                    A combinar
                  </ChipButton>
                </div>
              </div>
              <SelectField
                label="Unidade"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as PriceUnit)}
              >
                {PRICE_UNIT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </SelectField>
              {priceKnown ? (
                <div className="load-form-fields-span-2 load-form-highlight">
                  <CurrencyField
                    label="Valor"
                    valueCents={suggestedPriceCents}
                    onValueCentsChange={setSuggestedPriceCents}
                    placeholder="0,00"
                    error={fieldErrors.price}
                  />
                </div>
              ) : null}
              <TextField
                label="Distância (km)"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                hint="Preenchida pela rota. Ajuste se souber o km real."
                inputMode="decimal"
              />
              <div className="load-form-fields-span-2 rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">Piso ANTT</p>
                {freightKind !== "full" ? (
                  <p className="mt-2 text-sm text-muted">
                    A PNPM-TRC vale para carga lotação (frete completo).
                  </p>
                ) : quote ? (
                  <div className="load-form-antt mt-2">
                    <p>
                      Tabela {quote.tableCode} · {quote.axles} eixos · CCD {quote.ccd} · CC{" "}
                      {quote.cc}
                    </p>
                    <p>Ida: {formatMoneyFromCents(quote.outboundCents)}</p>
                    {quote.emptyReturn ? (
                      <p>Retorno vazio: {formatMoneyFromCents(quote.emptyReturnCents)}</p>
                    ) : null}
                    <p className="load-form-antt-total">
                      Total: {formatMoneyFromCents(quote.totalCents)}
                    </p>
                    {floorComparison?.status === "below" ? (
                      <>
                        <p className="load-form-antt-delta is-below">
                          {formatPercentPt(floorComparison.percent)}% abaixo do piso
                          {" · "}
                          {formatMoneyFromCents(floorComparison.diffCents)} a menos
                        </p>
                        <Alert
                          tone="warning"
                          title="Valor abaixo do piso mínimo"
                        >
                          <p>
                            Dá para publicar, mas o frete abaixo da PNPM-TRC pode
                            implicar descumprimento da Resolução ANTT 5.867/2020,
                            risco de fiscalização e autuação, e recusa de
                            motoristas para fechar a carga.
                          </p>
                        </Alert>
                      </>
                    ) : floorComparison?.status === "above" ? (
                      <p className="load-form-antt-delta is-above">
                        {formatPercentPt(floorComparison.percent)}% acima do piso
                        {" · "}
                        {formatMoneyFromCents(floorComparison.diffCents)} a mais
                      </p>
                    ) : floorComparison?.status === "equal" ? (
                      <p className="load-form-antt-delta is-equal">
                        O valor está no piso mínimo.
                      </p>
                    ) : (
                      <p className="text-muted">
                        Informe o valor da viagem para ver se está acima ou abaixo
                        do piso.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    {quoteError ??
                      "Preencha tipo de carga, veículo e km para ver o piso."}
                  </p>
                )}
              </div>
            </div>
          </FormPanel>

          <div className="load-form-more">
            <button
              type="button"
              className="load-form-more-toggle"
              onClick={() => setShowMore((current) => !current)}
            >
              Mais opções
              <span aria-hidden="true">{showMore ? "−" : "+"}</span>
            </button>
            {showMore ? (
              <div className="load-form-panel-body mt-4">
                <div className="load-form-fields-grid load-form-fields-grid--2">
                  <TextField
                    label="Volume (m³)"
                    value={volumeM3}
                    onChange={(e) => setVolumeM3(e.target.value)}
                    inputMode="decimal"
                  />
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
                  <TextField
                    label="Adiantamento (%)"
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(e.target.value)}
                    inputMode="numeric"
                  />
                  <div>
                    <p className="ui-field-label mb-2">Formas de pagamento</p>
                    <div className="load-form-chips">
                      {PAYMENT_METHOD_OPTIONS.map((item) => (
                        <ChipButton
                          key={item.value}
                          selected={paymentMethods.includes(item.value)}
                          onClick={() =>
                            setPaymentMethods((current) =>
                              current.includes(item.value)
                                ? current.filter((value) => value !== item.value)
                                : [...current, item.value],
                            )
                          }
                        >
                          {item.label}
                        </ChipButton>
                      ))}
                    </div>
                  </div>
                  <CheckboxField
                    label="Pedágio à parte"
                    checked={tollSeparate}
                    onChange={(e) => setTollSeparate(e.target.checked)}
                  />
                  <CheckboxField
                    label="Precisa de rastreador"
                    checked={needsTracker}
                    onChange={(e) => setNeedsTracker(e.target.checked)}
                  />
                  <CheckboxField
                    label="Retorno vazio"
                    checked={emptyReturn}
                    onChange={(e) => setEmptyReturn(e.target.checked)}
                  />
                  <CheckboxField
                    label="Alto desempenho"
                    checked={highPerformance}
                    onChange={(e) => setHighPerformance(e.target.checked)}
                  />
                  <CheckboxField
                    label="Composição veicular"
                    description="Veículo automotor + implemento. Padrão ligado (tabela A)."
                    checked={vehicleComposition}
                    onChange={(e) => setVehicleComposition(e.target.checked)}
                  />
                  <CheckboxField
                    label="Precisa de lona"
                    checked={needsTarp}
                    onChange={(e) => setNeedsTarp(e.target.checked)}
                  />
                  {users.length > 1 ? (
                    <div className="load-form-fields-span-2">
                      <p className="ui-field-label mb-2">Responsáveis (até 3)</p>
                      <div className="load-form-chips">
                        {users.map((user) => (
                          <ChipButton
                            key={user.id}
                            selected={contactIds.includes(user.id)}
                            onClick={() =>
                              setContactIds((current) => {
                                if (current.includes(user.id)) {
                                  return current.filter((id) => id !== user.id);
                                }
                                return [...current, user.id].slice(0, 3);
                              })
                            }
                          >
                            {user.name}
                          </ChipButton>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="load-form-fields-span-2">
                    <TextAreaField
                      label="Observações"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="load-form-footer">
          <p className="load-form-footer-note">
            Salve como rascunho ou publique nesta mesma tela.
          </p>
          <div className="load-form-footer-actions">
            <ButtonLink href="/portal/loads" variant="secondary">
              Cancelar
            </ButtonLink>
            <button
              type="submit"
              disabled={loading || publishing}
              className="ui-btn ui-btn-secondary ui-btn-md"
            >
              {loading ? <span className="ui-btn-spinner" aria-hidden="true" /> : null}
              <span>{loading ? "Salvando..." : "Salvar rascunho"}</span>
            </button>
            <button
              type="button"
              disabled={loading || publishing}
              className="ui-btn ui-btn-primary ui-btn-md"
              onClick={() => void handlePublish()}
            >
              {publishing ? <span className="ui-btn-spinner" aria-hidden="true" /> : null}
              <span>{publishing ? "Publicando..." : "Publicar"}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
