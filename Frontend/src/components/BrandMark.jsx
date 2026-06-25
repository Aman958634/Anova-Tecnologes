import { useId } from 'react';

export default function BrandMark({ dark = false, compact = false, showText = true, className = '' }) {
  const gradientId = useId();

  return (
    <div className={`flex items-center ${showText ? 'gap-2' : 'gap-0'} ${className}`}>
      <div className={`grid place-items-center rounded-2xl bg-white/0 ${compact ? 'h-14 w-14' : 'h-16 w-16'}`}>
        <svg viewBox="0 0 68 64" aria-hidden="true" className={`shrink-0 ${compact ? 'h-12 w-12' : 'h-14 w-14'}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        <path d="M10 53 C18 28 24 14 33 10 C40 7 46 11 51 18 L58 27 C53 22 48 22 42 26 L31 43 L19 53 Z" fill={`url(#${gradientId})`} />
        <path d="M18 50 C24 34 30 22 35 18 C39 15 44 16 48 21 L40 32 L31 43 L19 53 Z" fill="#1d4ed8" opacity="0.82" />
        <path d="M36 12 C50 12 58 17 61 25" fill="none" stroke="#172554" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M45 25 L52 25 L52 46" fill="none" stroke="#172554" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M41 33 C46 35 50 39 53 44" fill="none" stroke="#60a5fa" strokeWidth="5.5" strokeLinecap="round" />
        <rect x="52" y="10" width="7" height="7" rx="1.4" fill="#2563eb" />
        <rect x="60" y="10" width="7" height="7" rx="1.4" fill="#1d4ed8" />
        <rect x="52" y="18" width="7" height="7" rx="1.4" fill="#1e40af" />
        </svg>
      </div>

      {showText ? (
        <div className="leading-none">
          <p className={`font-semibold tracking-tight ${compact ? 'text-[1.18rem]' : 'text-[1.5rem]'} ${dark ? 'text-slate-900' : 'text-white'}`}>ANOVA</p>
          <p className={`mt-1 ${compact ? 'text-[0.46rem]' : 'text-[0.58rem]'} tracking-[0.34em] ${dark ? 'text-slate-500' : 'text-white/80'}`}>TECHNOLOGIES</p>
        </div>
      ) : null}
    </div>
  );
}