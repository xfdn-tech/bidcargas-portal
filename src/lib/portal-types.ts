export type PaginatedMeta = {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginatedMeta;
};

export type UserRecord = {
  id: string;
  accountId: string;
  email: string;
  name: string;
  role: "account_admin" | "account_user";
  status: "active" | "inactive";
  phone?: string | null;
  contactChannel?: "whatsapp" | "landline" | null;
  department?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type VehicleTypeRecord = {
  id: string;
  name: string;
  axles: number;
  categoryId: string;
  category?: VehicleCategoryRecord | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const USER_STATUSES: Array<{
  value: UserRecord["status"];
  label: string;
}> = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

export const PORTAL_USER_ROLES: Array<{
  value: UserRecord["role"];
  label: string;
}> = [
  { value: "account_admin", label: "Administrador" },
  { value: "account_user", label: "Operacional" },
];

export function portalRoleLabel(role: UserRecord["role"]) {
  return PORTAL_USER_ROLES.find((entry) => entry.value === role)?.label ?? role;
}

export type LoadStatus =
  | "draft"
  | "published"
  | "negotiating"
  | "closed"
  | "cancelled"
  | "completed";

export type BidStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type AnttCargoKind =
  | "carga_geral"
  | "granel_solido"
  | "granel_liquido"
  | "granel_pressurizada"
  | "conteinerizada"
  | "frigorificada"
  | "neogranel"
  | "perigosa_carga_geral"
  | "perigosa_granel_solido"
  | "perigosa_granel_liquido"
  | "perigosa_conteinerizada"
  | "perigosa_frigorificada";

export type FreightKind = "full" | "complement" | "dedicated";
export type PriceUnit = "trip" | "ton";
export type PaymentMethod =
  | "pix"
  | "ted"
  | "card"
  | "check"
  | "e_freight"
  | "other";
export type BodyTypeGroup = "closed" | "open" | "special";

export const BODY_TYPE_GROUP_OPTIONS: Array<{
  value: BodyTypeGroup;
  label: string;
}> = [
  { value: "closed", label: "Fechada" },
  { value: "open", label: "Aberta" },
  { value: "special", label: "Especial" },
];

export type LoadTypeRecord = {
  id: string;
  name: string;
  slug: string;
  anttCargoKind: AnttCargoKind;
  sortOrder: number;
  isActive: boolean;
};

export type LoadSpeciesRecord = {
  id: string;
  name: string;
  slug: string;
  loadTypeId?: string | null;
  loadType?: LoadTypeRecord | null;
  sortOrder: number;
  isActive: boolean;
};

export type BodyTypeRecord = {
  id: string;
  name: string;
  slug: string;
  group: BodyTypeGroup;
  sortOrder: number;
  isActive: boolean;
};

export type LoadContactRecord = {
  id?: string;
  userId: string;
  isPrimary: boolean;
  user?: UserRecord | null;
};

export type LoadRecord = {
  id: string;
  accountId: string;
  title: string;
  product?: string | null;
  description?: string | null;
  origin: string;
  destination: string;
  originCity?: string | null;
  originState?: string | null;
  destinationCity?: string | null;
  destinationState?: string | null;
  weightKg?: string | null;
  volumeM3?: string | null;
  loadTypeId?: string | null;
  loadType?: LoadTypeRecord | null;
  loadSpeciesId?: string | null;
  loadSpecies?: LoadSpeciesRecord | null;
  freightKind: FreightKind;
  vehicleTypeId?: string | null;
  vehicleType?: VehicleTypeRecord | null;
  vehicleTypes?: VehicleTypeRecord[];
  bodyTypes?: BodyTypeRecord[];
  paymentMethods: PaymentMethod[];
  needsTracker: boolean;
  emptyReturn: boolean;
  highPerformance: boolean;
  vehicleComposition: boolean;
  needsTarp: boolean;
  pickupAt?: string | null;
  deliveryAt?: string | null;
  suggestedPriceCents?: number | null;
  priceUnit: PriceUnit;
  advancePercent: number;
  tollSeparate: boolean;
  allowsCounterOffer: boolean;
  distanceKm?: string | null;
  anttFloorCents?: number | null;
  anttTable?: string | null;
  anttAxles?: number | null;
  anttCargoKind?: string | null;
  anttCcd?: string | null;
  anttCc?: string | null;
  anttLegalName?: string | null;
  notes?: string | null;
  contacts?: LoadContactRecord[];
  status: LoadStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardKpis = {
  publishedTotal: number;
  publishedPeriod: number;
  interestedDriversPeriod: number;
  confirmedPeriod: number;
  hasActiveLoads: boolean;
};

export type UserQuota = {
  used: number;
  max: number | null;
  unlimited: boolean;
  hasTeamUsersFeature: boolean;
};

export type AnttQuote = {
  legalName: string;
  sourceUrl?: string | null;
  tableCode: string;
  cargoKind: AnttCargoKind;
  axles: number;
  distanceKm: number;
  ccd: number;
  cc: number;
  emptyReturn: boolean;
  outboundCents: number;
  emptyReturnCents: number;
  totalCents: number;
};

export const FREIGHT_KIND_OPTIONS: Array<{ value: FreightKind; label: string }> = [
  { value: "full", label: "Completo" },
  { value: "complement", label: "Complemento" },
  { value: "dedicated", label: "Agregamento" },
];

export const PRICE_UNIT_OPTIONS: Array<{ value: PriceUnit; label: string }> = [
  { value: "trip", label: "Por viagem" },
  { value: "ton", label: "Por tonelada" },
];

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
}> = [
  { value: "pix", label: "Pix" },
  { value: "ted", label: "TED" },
  { value: "card", label: "Cartão" },
  { value: "check", label: "Cheque" },
  { value: "e_freight", label: "Frete eletrônico" },
  { value: "other", label: "Outro" },
];

export const CONTACT_CHANNEL_OPTIONS: Array<{
  value: "whatsapp" | "landline";
  label: string;
}> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "landline", label: "Fixo" },
];

export type DriverRecord = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string | null;
};

export type BidRecord = {
  id: string;
  loadId: string;
  driverId: string;
  driver?: DriverRecord | null;
  amountCents: number;
  deadlineAt?: string | null;
  notes?: string | null;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
};

export const LOAD_STATUSES: Array<{ value: LoadStatus; label: string }> = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicada" },
  { value: "negotiating", label: "Em negociação" },
  { value: "closed", label: "Fechada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "completed", label: "Concluída" },
];

export const BID_STATUSES: Array<{ value: BidStatus; label: string }> = [
  { value: "pending", label: "Pendente" },
  { value: "accepted", label: "Aceita" },
  { value: "rejected", label: "Recusada" },
  { value: "cancelled", label: "Cancelada" },
];

export function loadStatusLabel(status: LoadStatus) {
  return LOAD_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

export function bidStatusLabel(status: BidStatus) {
  return BID_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

export function formatMoneyFromCents(cents?: number | null) {
  if (cents === undefined || cents === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export {
  formatMoneyInputFromCents,
  parseMoneyToCents,
} from "@/lib/money";

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function toDatetimeLocalValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function parseCityState(value: string): {
  city?: string;
  state?: string;
} {
  const match = value.trim().match(/^(.*),\s*([A-Za-z]{2})$/);
  if (!match) return {};
  return { city: match[1].trim(), state: match[2].toUpperCase() };
}

export function freightKindLabel(kind: FreightKind) {
  return FREIGHT_KIND_OPTIONS.find((item) => item.value === kind)?.label ?? kind;
}

export function priceUnitLabel(unit: PriceUnit) {
  return PRICE_UNIT_OPTIONS.find((item) => item.value === unit)?.label ?? unit;
}

export function paymentMethodLabel(method: PaymentMethod) {
  return (
    PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)?.label ?? method
  );
}
