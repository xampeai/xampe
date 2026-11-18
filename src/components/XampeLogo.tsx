import React from 'react';

interface XampeLogoProps {
  className?: string;
  showText?: boolean;
}

export const XampeLogo: React.FC<XampeLogoProps> = ({
  className = '',
  showText = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://w3.org"
        className="h-9 w-9 shrink-0"
      >
        {/* Rounded Square Parcel Box */}
        <rect
          x="10"
          y="16"
          width="44"
          height="40"
          rx="11"
          stroke="#EA580C"
          strokeWidth="5.5"
        />
        {/* Open Top Box Flaps */}
        <path
          d="M16 16L22 8H42L48 16"
          stroke="#EA580C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Confident Slanted Aura Eyes */}
        <path
          d="M20 33L27 36"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M44 33L37 36"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Subtle Confident Smirk */}
        <path
          d="M27 45C29.5 47 34.5 47 37 45"
          stroke="#EA580C"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="text-xl font-extrabold tracking-tight text-slate-900">
          Xampe
        </span>
      )}
    </div>
  );
};

export default XampeLogo;
