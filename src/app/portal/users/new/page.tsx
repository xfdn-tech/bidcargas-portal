import { PortalUserForm } from "@/components/portal-user-form";
import { requireAccountAdmin } from "@/lib/auth-server";

export default async function NewPortalUserPage() {
  await requireAccountAdmin();
  return <PortalUserForm mode="create" />;
}
