"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  api,
  getApiErrorMessage,
  type AuthUser,
} from "@/lib/api";
import { resolveClientAccountSlug } from "@/lib/account-slug";

type VerifyResponse = {
  user: AuthUser;
};

type Props = {
  initialAccountSlug?: string;
  brandTitle?: string;
};

export function LoginForm({ initialAccountSlug = "", brandTitle }: Props) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [accountSlug, setAccountSlug] = useState(initialAccountSlug);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromHost = resolveClientAccountSlug();
    if (fromHost) {
      setAccountSlug(fromHost);
    }
  }, []);

  useEffect(() => {
    const slug = accountSlug.trim().toLowerCase();
    const headers = slug ? { "X-Account-Slug": slug } : undefined;

    void api<AuthUser>("/auth/me", { headers })
      .then((user) => {
        const allowed =
          user.role === "account_admin" ||
          user.role === "account_user" ||
          (user.role === "super_admin" && user.isImpersonating);
        if (allowed) {
          window.location.href = "/portal";
        }
      })
      .catch(() => {});
  }, [accountSlug]);

  function authJson(extra?: Record<string, unknown>) {
    const slug = accountSlug.trim().toLowerCase();
    return {
      email: email.trim().toLowerCase(),
      ...(slug ? { accountSlug: slug } : {}),
      ...extra,
    };
  }

  function authHeaders() {
    const slug = accountSlug.trim().toLowerCase();
    return slug ? { "X-Account-Slug": slug } : undefined;
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api("/auth/login", {
        method: "POST",
        json: authJson(),
        headers: authHeaders(),
      });
      setStep("otp");
      setMessage("Se o e-mail existir, enviamos um código de 6 dígitos.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Não foi possível enviar o código."));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await api<VerifyResponse>("/auth/verify", {
        method: "POST",
        json: authJson({ code }),
        headers: authHeaders(),
      });

      const allowed =
        result.user.role === "account_admin" ||
        result.user.role === "account_user" ||
        (result.user.role === "super_admin" && result.user.isImpersonating);

      if (!allowed) {
        setError("Este portal é para usuários da empresa embarcadora.");
        return;
      }

      window.location.href = "/portal";
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Código inválido ou expirado."));
    } finally {
      setLoading(false);
    }
  }

  const title = brandTitle?.trim() || "Portal da empresa";

  return (
    <div className="glass-card animate-fade-in w-full rounded-3xl border border-border p-8 shadow-xl shadow-black/20">
      <div className="space-y-2">
        <p className="eyebrow">Portal embarcador</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted">
          Use o e-mail cadastrado na sua empresa. Identificamos sua conta
          automaticamente.
        </p>
      </div>

      {message ? <p className="alert-info mt-4">{message}</p> : null}
      {error ? <p className="alert-error mt-4">{error}</p> : null}

      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="operacao@empresa.com"
              className="input-field"
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-foreground">Código OTP</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="••••••"
              className="input-field text-center tracking-[0.3em]"
            />
          </label>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn-primary"
          >
            {loading ? "Validando..." : "Entrar"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setMessage(null);
            }}
            className="btn-secondary"
          >
            Alterar e-mail
          </button>
        </form>
      )}
    </div>
  );
}
