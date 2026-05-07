import React from 'react';
import { cn } from '../../lib/utils';
import logoUrl from '../../assets/logo.svg';

export function SplashScreen({ isVisible }) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center">
        <img 
          src={logoUrl} 
          alt="Antara Homoeopathy Logo" 
          className="h-[120px] w-auto mb-6"
          style={{ animation: 'spin360 1.5s linear infinite' }}
        />
        <h1 className="text-[#1a2d5a] text-lg font-bold tracking-widest uppercase mb-1">
          Antara Homoeopathy
        </h1>
        <p className="text-[#4a9d8e] text-[13px] tracking-wider uppercase font-medium">
          Healing From Within
        </p>
      </div>
    </div>
  );
}
