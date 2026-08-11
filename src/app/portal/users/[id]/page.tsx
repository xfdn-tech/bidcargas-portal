import { notFound } from "next/navigation";
import { PortalUserForm } from "@/components/portal-user-form";
import { requireAccountAdmin } from "@/lib/auth-server";
import type { UserRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPortalUserPage({ params }: Props) {
  await requireAccountAdmin();
  const { id } = await params;

  try {
    const user = await serverApi<UserRecord>(`/portal/users/${id}`);
    return <PortalUserForm mode="edit" user={user} />;
  } catch {
    notFound();
  }
}
