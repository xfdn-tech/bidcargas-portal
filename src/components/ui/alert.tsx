import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "error" | "info" | "success" | "warning";

type AlertProps = {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
};

const toneClasses: Record<AlertTone, string> = {
  error: "ui-alert-error",
  info: "ui-alert-info",
  success: "ui-alert-success",
  warning: "ui-alert-warning",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div className={cn("ui-alert", toneClasses[tone], className)} role="alert">
      {title ? <p className="ui-alert-title">{title}</p> : null}
      <div className="ui-alert-body">{children}</div>
    </div>
  );
}
