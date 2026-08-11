import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  description?: string;
  containerClassName?: string;
};

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  function CheckboxField(
    { label, description, containerClassName, className, id, ...props },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <label
        htmlFor={fieldId}
        className={cn("ui-checkbox-field", containerClassName)}
      >
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className={cn("ui-checkbox", className)}
          {...props}
        />
        <span className="ui-checkbox-content">
          <span className="ui-checkbox-label">{label}</span>
          {description ? (
            <span className="ui-checkbox-description">{description}</span>
          ) : null}
        </span>
      </label>
    );
  },
);
