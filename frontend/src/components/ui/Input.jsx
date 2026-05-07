import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col w-full space-y-1">
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-dark)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary-medium)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          error && "border-[var(--color-error)] focus:border-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = "Input";
