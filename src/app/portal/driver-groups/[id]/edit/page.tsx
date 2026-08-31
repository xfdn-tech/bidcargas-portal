import { notFound } from "next/navigation";
import { PortalDriverGroupForm } from "@/components/portal-driver-group-form";
import { requirePortalUser } from "@/lib/auth-server";
import type { DriverGroupRecord } from "@/lib/portal-types";
import { serverApi } from "@/lib/server-api";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPortalDriverGroupPage({ params }: Props) {
  await requirePortalUser();
  const { id } = await params;

  let group: DriverGroupRecord;
  try {
    group = await serverApi<DriverGroupRecord>(`/portal/driver-groups/${id}`);
  } catch {
    notFound();
  }

  return <PortalDriverGroupForm mode="edit" group={group} />;
}
