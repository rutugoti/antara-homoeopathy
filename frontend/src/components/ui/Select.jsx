import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Select = forwardRef(({ className, label, error, options = [], placeholder, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full space-y-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-dark)]">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-medium)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error && "border-[var(--color-error)] focus:border-[var(--color-error)]",
          className
        )}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>
      )}
    </div>
  );
});

Select.displayName = "Select";
