import React from 'react';

// New Nepal Navigator summit mark: navy disc, rising red sun, white triple peaks
// with snowcaps, emerald ridge and a red location pin. Matches logo.svg.
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
        <svg viewBox="0 0 1024 1024" className="w-full h-full drop-shadow-md" role="img" aria-label="Nepal Navigator logo">
          <defs>
            <radialGradient id="nrbg" cx="50%" cy="38%" r="75%">
              <stop offset="0%" stopColor="#1B3358" />
              <stop offset="60%" stopColor="#0E1E38" />
              <stop offset="100%" stopColor="#0B192C" />
            </radialGradient>
            <linearGradient id="nrsun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <circle cx="512" cy="512" r="480" fill="url(#nrbg)" />
          <circle cx="512" cy="512" r="480" fill="none" stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="24" />
          <circle cx="672" cy="318" r="104" fill="url(#nrsun)" />
          <polygon points="232,668 372,372 496,548 596,348 792,668" fill="#334155" />
          <polygon points="252,668 384,396 496,548 592,376 772,668" fill="#E2E8F0" />
          <polygon points="372,372 402,418 372,436 344,418" fill="#FFFFFF" />
          <polygon points="596,348 628,398 596,418 566,398" fill="#FFFFFF" />
          <path d="M120,668 Q300,600 500,656 Q700,712 904,648 L904,780 L120,780 Z" fill="#10B981" opacity="0.9" />
          <path d="M512,560 C470,560 438,592 438,632 C438,688 512,764 512,764 C512,764 586,688 586,632 C586,592 554,560 512,560 Z" fill="#DC2626" stroke="#F8FAFC" strokeWidth="18" />
          <circle cx="512" cy="630" r="34" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-lg md:text-xl">
              Nepal<span className="text-red-500"> Navigator</span>
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
