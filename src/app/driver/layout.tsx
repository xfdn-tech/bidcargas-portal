import { ReactNode } from "react";
import { DriverShell } from "@/components/driver-shell";
import { requireDriverUser } from "@/lib/auth-server";

export default async function DriverLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireDriverUser();
  return <DriverShell user={user}>{children}</DriverShell>;
}
