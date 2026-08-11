import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";

export default async function HomePage() {
  const user = await getSessionUser();
  if (
    user &&
    (user.role === "account_admin" ||
      user.role === "account_user" ||
      (user.role === "super_admin" && user.isImpersonating))
  ) {
    redirect("/portal");
  }
  redirect("/login");
}
