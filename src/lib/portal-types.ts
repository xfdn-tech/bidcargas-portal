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
