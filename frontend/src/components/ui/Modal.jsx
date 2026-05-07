import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
      />
      <div 
        className={cn(
          "relative w-full max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl flex flex-col",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-main)] p-4 bg-white shrink-0">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100 transition-colors text-[var(--color-text-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
