import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useId,
} from "react";
import { cn } from "@/lib/cn";

type FieldBaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
};

export type TextFieldProps = FieldBaseProps &
  InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      error,
      required,
      containerClassName,
      className,
      id,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className={cn("ui-field", containerClassName)}>
        <label htmlFor={fieldId} className="ui-field-label">
          {label}
          {required ? <span className="ui-field-required">*</span> : null}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn("ui-input", error && "ui-input-error", className)}
          {...props}
        />
        {hint && !error ? (
          <p id={hintId} className="ui-field-hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="ui-field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

export type TextAreaFieldProps = FieldBaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(function TextAreaField(
  {
    label,
    hint,
    error,
    required,
    containerClassName,
    className,
    id,
    rows = 4,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={cn("ui-field", containerClassName)}>
      <label htmlFor={fieldId} className="ui-field-label">
        {label}
        {required ? <span className="ui-field-required">*</span> : null}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cn("ui-input ui-textarea", error && "ui-input-error", className)}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="ui-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ui-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export type SelectFieldProps = FieldBaseProps &
  SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      label,
      hint,
      error,
      required,
      containerClassName,
      className,
      id,
      children,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className={cn("ui-field", containerClassName)}>
        <label htmlFor={fieldId} className="ui-field-label">
          {label}
          {required ? <span className="ui-field-required">*</span> : null}
        </label>
        <div className="ui-select-wrap">
          <select
            ref={ref}
            id={fieldId}
            aria-required={required || undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            className={cn("ui-input ui-select", error && "ui-input-error", className)}
            {...props}
          >
            {children}
          </select>
        </div>
        {hint && !error ? (
          <p id={hintId} className="ui-field-hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="ui-field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
