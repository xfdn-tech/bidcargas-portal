import { redirect } from "next/navigation";
import { homePathForUser } from "@/lib/api";
import { getSessionUser } from "@/lib/auth-server";

export default async function HomePage() {
  const user = await getSessionUser();
  const home = user ? homePathForUser(user) : null;
  redirect(home ?? "/login");
}
