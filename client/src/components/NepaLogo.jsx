import React from 'react';

export default function NepaLogo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeMap[size] || sizeMap.md} flex-shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full drop-shadow-md">
          {/* Shield Badge */}
          <path
            d="M50 8 L88 22 V50 C88 72 50 92 50 92 C50 92 12 72 12 50 V22 Z"
            fill="#0B192C"
            stroke="#DC2626"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Himalayan Mountains */}
          <path d="M22 62 L38 38 L50 52 L64 32 L80 62 Z" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <path d="M38 38 L43 45 L34 47 Z" fill="#F8FAFC" />
          <path d="M64 32 L70 41 L60 43 Z" fill="#F8FAFC" />

          {/* Nepal Emergency Pin */}
          <path
            d="M50 36 C42 36 36 42 36 50 C36 60 50 74 50 74 C50 74 64 60 64 50 C64 42 58 36 50 36 Z"
            fill="#DC2626"
            stroke="#FEF2F2"
            strokeWidth="2"
          />
          <circle cx="50" cy="48" r="5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-lg md:text-xl">
              Nepa<span className="text-red-500">Ready</span>
            </span>
            <span className="text-xs">🇳🇵</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Your Nepal. Always Ready.
          </span>
        </div>
      )}
    </div>
  );
}
