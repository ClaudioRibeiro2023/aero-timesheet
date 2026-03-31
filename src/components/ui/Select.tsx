import { forwardRef, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, hint, options, placeholder, className, id, ...props },
    ref
  ) {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-surface-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              "block w-full appearance-none rounded-xl border bg-white/5 px-4 py-3 pr-10 text-sm text-surface-50 transition-colors focus:outline-none focus:ring-2",
              error
                ? "border-red-500/30 focus:border-red-500 focus:ring-red-500/20"
                : "border-white/10 focus:border-brand-500 focus:ring-brand-500/20",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-surface-900 text-surface-50"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Ícone customizado */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-surface-500" />
          </div>
        </div>

        {error && (
          <p
            id={`${selectId}-error`}
            className="text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${selectId}-hint`} className="text-xs text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
