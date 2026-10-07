import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export function WorklyLogo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const pixelSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const px = pixelSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none shrink-0 ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: `${px}px`, height: `${px}px`, minWidth: `${px}px`, minHeight: `${px}px` }}
      >
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 rounded-xl blur-[3px] opacity-70 animate-pulse" />
        
        {/* Main Logo Emblem */}
        <svg
          width={px}
          height={px}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block rounded-xl shadow-lg drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)] shrink-0"
          style={{ width: `${px}px`, height: `${px}px` }}
        >
          <rect width="40" height="40" rx="10" fill="#090d16" />
          <rect width="40" height="40" rx="10" stroke="url(#logo_grad_border)" strokeWidth="1.5" />
          
          {/* Automation Node Connectors */}
          <path d="M11 20H20M20 20H29M20 11V20M20 20V29" stroke="url(#logo_grad_line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M12 28L28 12" stroke="url(#logo_grad_line2)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Node Circles */}
          <circle cx="11" cy="20" r="3.5" fill="#6366f1" />
          <circle cx="29" cy="20" r="3.5" fill="#06b6d4" />
          <circle cx="20" cy="11" r="3.5" fill="#a855f7" />
          <circle cx="20" cy="29" r="3.5" fill="#3b82f6" />
          
          {/* Center Neural Core */}
          <circle cx="20" cy="20" r="5" fill="#ffffff" />
          <circle cx="20" cy="20" r="2.5" fill="#6366f1" />

          <defs>
            <linearGradient id="logo_grad_border" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logo_grad_line" x1="11" y1="11" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logo_grad_line2" x1="12" y1="28" x2="28" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`font-extrabold ${textSizes[size]} bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight`}>
            Workly
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            AI
          </span>
        </div>
      )}
    </div>
  );
}
