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
        {/* Solid rounded orange square badge */}
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="14"
          fill="#EA580C"
        />
        {/* Crisp white geometric open shipping box + X */}
        <path
          d="M18 22L32 14L46 22V42L32 50L18 42V22Z"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path
          d="M24 26L40 38M40 26L24 38"
          stroke="#FFFFFF"
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
