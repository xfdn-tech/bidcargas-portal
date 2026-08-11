import { redirect } from "next/navigation";
import { canAccessPortal } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-server";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user && canAccessPortal(user)) {
    redirect("/portal");
  }
  redirect("/login");
}
