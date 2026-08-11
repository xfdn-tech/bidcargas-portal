import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("ui-page-header", className)}>
      <div className="ui-page-header-copy">
        <h1 className="ui-page-title">{title}</h1>
        {description ? (
          <div className="ui-page-description">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="ui-page-header-actions">{actions}</div>
      ) : null}
    </header>
  );
}
