import { PortalLoadForm } from "@/components/portal-load-form";
import { requirePortalUser } from "@/lib/auth-server";
import { fetchLoadFormCatalogs } from "@/lib/load-form-catalogs";

export default async function NewPortalLoadPage() {
  const user = await requirePortalUser();
  const catalogs = await fetchLoadFormCatalogs();

  return (
    <PortalLoadForm mode="create" currentUserId={user.id} {...catalogs} />
  );
}
