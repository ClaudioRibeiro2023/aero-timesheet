import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, ...props }, ref) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-300"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "block w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-surface-50 placeholder:text-surface-500 transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-red-500/30 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/10 focus:border-brand-500 focus:ring-brand-500/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-surface-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
