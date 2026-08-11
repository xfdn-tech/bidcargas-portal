import { headers } from "next/headers";
import { LoginForm } from "@/components/login-form";
import { LoginPageShell } from "@/components/login-page-shell";
import { resolveAccountSlugFromHostname } from "@/lib/account-slug";

export default async function LoginPage() {
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  const accountSlug = resolveAccountSlugFromHostname(host) ?? "";

  return (
    <LoginPageShell brandName={accountSlug || "BidCargas"}>
      <LoginForm initialAccountSlug={accountSlug} />
    </LoginPageShell>
  );
}
