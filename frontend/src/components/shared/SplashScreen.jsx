import React from 'react';
import { cn } from '../../lib/utils';
import logoUrl from '../../assets/logo.jpg';

export function SplashScreen({ isVisible }) {
  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-500",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
          {/* Outer spinning dashed border for a premium feel */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#1a2d5a]/30 animate-[spin_4s_linear_infinite]"></div>
          
          {/* Inner pulsing container with the logo */}
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg animate-pulse border-2 border-[#4a9d8e]/20">
            <img src={logoUrl} alt="Antara Homoeopathy Logo" className="w-20 h-20 object-contain" />
          </div>
        </div>
        
        <h1 className="text-[#1a2d5a] text-lg font-bold tracking-widest uppercase mb-1">
          Antara Homoeopathy
        </h1>
        <p className="text-[#4a9d8e] text-[13px] tracking-wider uppercase font-medium animate-pulse">
          Healing From Within
        </p>
      </div>
    </div>
  );
}
