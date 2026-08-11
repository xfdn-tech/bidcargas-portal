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

export type LoadRecord = {
  id: string;
  accountId: string;
  title: string;
  description?: string | null;
  origin: string;
  destination: string;
  weightKg?: string | null;
  volumeM3?: string | null;
  vehicleTypeId?: string | null;
  vehicleType?: VehicleTypeRecord | null;
  pickupAt?: string | null;
  deliveryAt?: string | null;
  suggestedPriceCents?: number | null;
  allowsCounterOffer: boolean;
  notes?: string | null;
  status: LoadStatus;
  createdAt: string;
  updatedAt: string;
};

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
