import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  return (
    <div className="relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-md border border-[var(--color-border-main)] py-1.5 pl-10 pr-3 text-sm focus:border-[var(--color-primary-medium)] focus:outline-none focus:ring-0 sm:text-sm bg-white"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
}
