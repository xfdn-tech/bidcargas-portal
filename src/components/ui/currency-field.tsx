"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/cn";
import {
  extractMoneyDigits,
  formatMoneyInputFromCents,
  formatMoneyInputFromDigits,
  parseMoneyToCents,
} from "@/lib/money";

export type CurrencyFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  valueCents?: number | null;
  onValueCentsChange: (cents: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

export const CurrencyField = forwardRef<HTMLInputElement, CurrencyFieldProps>(
  function CurrencyField(
    {
      label,
      hint,
      error,
      required,
      containerClassName,
      valueCents,
      onValueCentsChange,
      placeholder = "0,00",
      disabled,
      id,
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;
    const isEditingRef = useRef(false);

    const [displayValue, setDisplayValue] = useState(() =>
      formatMoneyInputFromCents(valueCents),
    );

    useEffect(() => {
      if (isEditingRef.current) return;
      setDisplayValue(formatMoneyInputFromCents(valueCents));
    }, [valueCents]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      isEditingRef.current = true;
      const digits = extractMoneyDigits(event.target.value);
      const formatted = formatMoneyInputFromDigits(digits);
      setDisplayValue(formatted);
      onValueCentsChange(parseMoneyToCents(formatted));
    }

    function handleBlur() {
      isEditingRef.current = false;
    }

    return (
      <div className={cn("ui-field", containerClassName)}>
        <label htmlFor={fieldId} className="ui-field-label">
          {label}
          {required ? <span className="ui-field-required">*</span> : null}
        </label>
        <div
          className={cn(
            "ui-currency-wrap",
            error && "ui-currency-wrap-error",
            disabled && "ui-currency-wrap-disabled",
          )}
        >
          <span className="ui-currency-prefix" aria-hidden="true">
            R$
          </span>
          <input
            ref={ref}
            id={fieldId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            aria-required={required || undefined}
            aria-invalid={Boolean(error)}
            aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
            className={cn("ui-input ui-currency-input", error && "ui-input-error")}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
          />
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
