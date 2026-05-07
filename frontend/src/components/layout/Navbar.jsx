import React from 'react';
import useUiStore from '../../store/uiStore';

export function Navbar() {
  const { pageTitle } = useUiStore();

  return (
    <div className="fixed top-0 right-0 left-60 h-14 bg-white border-b border-[var(--color-border-main)] z-40 flex items-center justify-between px-6 transition-all duration-300">
      <h1 className="text-xl font-semibold text-[var(--color-text-dark)]">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        {/* Placeholder for User Profile */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-medium)] flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <span className="text-sm font-medium text-[var(--color-text-dark)] hidden sm:block">Admin User</span>
        </div>
      </div>
    </div>
  );
}
