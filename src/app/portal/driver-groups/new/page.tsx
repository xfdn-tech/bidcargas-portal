import { PortalDriverGroupForm } from "@/components/portal-driver-group-form";
import { requirePortalUser } from "@/lib/auth-server";

export default async function NewPortalDriverGroupPage() {
  await requirePortalUser();
  return <PortalDriverGroupForm mode="create" />;
}
