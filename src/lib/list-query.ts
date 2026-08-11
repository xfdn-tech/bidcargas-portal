export type TableSort = {
  by?: string;
  dir?: "asc" | "desc";
};

export type ListQueryState = {
  page: number;
  search: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export function parseListQuery(params: {
  page?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}): ListQueryState {
  const dir = params.sortDir?.toLowerCase();
  return {
    page: Number(params.page ?? "1") || 1,
    search: params.search?.trim() ?? "",
    sortBy: params.sortBy?.trim() || undefined,
    sortDir: dir === "asc" || dir === "desc" ? dir : undefined,
  };
}

export function toApiListParams(state: ListQueryState, limit = 20) {
  return {
    page: state.page,
    limit,
    search: state.search || undefined,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
  };
}

export function toPaginationSearchParams(
  state: Pick<ListQueryState, "search" | "sortBy" | "sortDir">,
) {
  return {
    search: state.search || undefined,
    sortBy: state.sortBy,
    sortDir: state.sortDir,
  };
}

export function buildSortHref(
  pathname: string,
  sortKey: string,
  current: TableSort,
  searchParams?: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  params.set("page", "1");

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (
      key !== "page" &&
      key !== "sortBy" &&
      key !== "sortDir" &&
      value
    ) {
      params.set(key, value);
    }
  }

  const nextDir: "asc" | "desc" =
    current.by === sortKey && current.dir === "asc" ? "desc" : "asc";

  params.set("sortBy", sortKey);
  params.set("sortDir", nextDir);
  return `${pathname}?${params.toString()}`;
}

export function toTableSort(state: Pick<ListQueryState, "sortBy" | "sortDir">): TableSort {
  return {
    by: state.sortBy,
    dir: state.sortDir,
  };
}
