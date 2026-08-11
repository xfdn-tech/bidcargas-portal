import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requirePortalUser } from "@/lib/auth-server";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requirePortalUser();
  return <AppShell user={user}>{children}</AppShell>;
}
