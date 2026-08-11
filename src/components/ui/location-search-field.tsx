"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import {
  useLocationSearch,
  type LocationResult,
} from "@/lib/use-location-search";

type LocationSearchFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
  value?: string;
  onValueChange?: (value: string) => void;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>;

export const LocationSearchField = forwardRef<
  HTMLInputElement,
  LocationSearchFieldProps
>(function LocationSearchField(
  {
    label,
    hint,
    error,
    required,
    containerClassName,
    value = "",
    onValueChange,
    className,
    id,
    placeholder,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isEditingRef = useRef(false);

  const { results, loading, searchLocations, clearResults } = useLocationSearch();

  useEffect(() => {
    if (isEditingRef.current) return;
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const query = searchQuery.trim();
      if (query.length >= 2) {
        void searchLocations(query);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(nextValue: string) {
    isEditingRef.current = true;
    setInputValue(nextValue);
    setSearchQuery(nextValue);
    setIsOpen(true);
    onValueChange?.(nextValue);
  }

  function handleLocationSelect(location: LocationResult) {
    const locationString = `${location.city}, ${location.state}`;
    isEditingRef.current = false;
    setInputValue(locationString);
    setSearchQuery("");
    setIsOpen(false);
    clearResults();
    onValueChange?.(locationString);
  }

  return (
    <div
      ref={containerRef}
      className={cn("ui-field relative", containerClassName)}
    >
      <label htmlFor={fieldId} className="ui-field-label">
        {label}
        {required ? <span className="ui-field-required">*</span> : null}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          type="text"
          value={inputValue}
          disabled={disabled}
          aria-required={required || undefined}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={cn("ui-input pr-10", error && "ui-input-error", className)}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => {
            if (inputValue.trim().length >= 2) {
              setSearchQuery(inputValue);
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false);
              isEditingRef.current = false;
            }, 200);
          }}
          {...props}
        />

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <span className="ui-btn-spinner" aria-hidden="true" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-lg ring-1 ring-black/5"
        >
          {results.map((location, index) => (
            <li key={`${location.city}-${location.state}-${index}`}>
              <button
                type="button"
                role="option"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleLocationSelect(location);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-muted"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>
                  {location.city}, {location.state}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {isOpen && searchQuery.trim().length >= 2 && results.length === 0 && !loading ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted shadow-lg">
          Nenhuma localidade encontrada
        </div>
      ) : null}

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
