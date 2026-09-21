import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-lg overflow-hidden shadow-xs ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logoBlueGrad" x1="256" y1="120" x2="410" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="logoWhiteGrad" x1="256" y1="120" x2="256" y2="430" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <radialGradient id="logoDialBg" cx="50%" cy="54%" r="40%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="70%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#080E1C" />
          </radialGradient>
        </defs>

        {/* Circular Solid Dial Housing */}
        <circle cx="256" cy="275" r="150" fill="url(#logoDialBg)" />

        {/* Top Ergonomic Crown Button */}
        <rect x="226" y="74" width="60" height="28" rx="10" fill="#FFFFFF" />
        <rect x="244" y="102" width="24" height="30" rx="4" fill="#94A3B8" />

        {/* 45 Degree Right Lap Button */}
        <g transform="rotate(45 375 165)">
          <rect x="354" y="144" width="42" height="22" rx="8" fill="#FFFFFF" />
          <rect x="366" y="166" width="18" height="20" rx="4" fill="#94A3B8" />
        </g>

        {/* Main Chronometer Chassis Outer Ring */}
        <circle cx="256" cy="275" r="140" stroke="url(#logoWhiteGrad)" strokeWidth="26" strokeLinecap="round" />

        {/* Electric Blue Focus Progress Arc */}
        <path
          d="M 256 135 A 140 140 0 0 1 396 275"
          stroke="url(#logoBlueGrad)"
          strokeWidth="26"
          strokeLinecap="round"
        />

        {/* Dial Cardinal Markers */}
        <circle cx="256" cy="180" r="8" fill="#38BDF8" />
        <circle cx="351" cy="275" r="8" fill="#64748B" />
        <circle cx="256" cy="370" r="8" fill="#64748B" />
        <circle cx="161" cy="275" r="8" fill="#64748B" />

        {/* Precision Needle (11 o'clock exam focus orientation) */}
        <line x1="256" y1="275" x2="198" y2="180" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" />
        <circle cx="194" cy="174" r="10" fill="#38BDF8" />

        {/* Central Hub Disc with Jewel Center */}
        <circle cx="256" cy="275" r="30" fill="#0A0A0C" stroke="#FFFFFF" strokeWidth="11" />
        <circle cx="256" cy="275" r="14" fill="#38BDF8" />
      </svg>
    </div>
  );
};
