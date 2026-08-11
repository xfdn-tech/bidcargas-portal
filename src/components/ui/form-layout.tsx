import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FormShellProps = {
  backHref: string;
  backLabel: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormShell({
  backHref,
  backLabel,
  title,
  description,
  children,
  className,
}: FormShellProps) {
  return (
    <div className={cn("ui-form-shell animate-fade-in", className)}>
      <Link href={backHref} className="ui-form-back">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18 9 12l6-6" />
        </svg>
        {backLabel}
      </Link>

      <div className="ui-form-hero">
        <h1 className="ui-form-title">{title}</h1>
        {description ? (
          <div className="ui-form-description">{description}</div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

type FormCardProps = {
  children: ReactNode;
  className?: string;
};

export function FormCard({ children, className }: FormCardProps) {
  return <div className={cn("ui-form-card", className)}>{children}</div>;
}

type FormSectionProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("ui-form-section", className)}>
      <div className="ui-form-section-header">
        <h2 className="ui-form-section-title">{title}</h2>
        {description ? (
          <div className="ui-form-section-description">{description}</div>
        ) : null}
      </div>
      <div className="ui-form-section-body">{children}</div>
    </section>
  );
}

type FormActionsProps = {
  primaryLabel: string;
  loading?: boolean;
  backHref: string;
  backLabel?: string;
  onPrimaryClick?: () => void;
  primaryType?: "button" | "submit";
  destructive?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export function FormActions({
  primaryLabel,
  loading = false,
  backHref,
  backLabel = "Cancelar",
  onPrimaryClick,
  primaryType = "submit",
  destructive,
}: FormActionsProps) {
  return (
    <div className="ui-form-actions">
      <div className="ui-form-actions-primary">
        <button
          type={primaryType}
          disabled={loading}
          onClick={onPrimaryClick}
          className="ui-btn ui-btn-primary ui-btn-md"
        >
          {loading ? <span className="ui-btn-spinner" aria-hidden="true" /> : null}
          <span>{loading ? "Salvando..." : primaryLabel}</span>
        </button>
        <Link href={backHref} className="ui-btn ui-btn-secondary ui-btn-md">
          {backLabel}
        </Link>
      </div>
      {destructive ? (
        <button
          type="button"
          disabled={loading || destructive.disabled}
          onClick={destructive.onClick}
          className="ui-btn ui-btn-danger-outline ui-btn-md"
        >
          {destructive.label}
        </button>
      ) : null}
    </div>
  );
}
