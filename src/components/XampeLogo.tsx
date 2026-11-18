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
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://w3.org"
        className="h-12 w-12 shrink-0"
      >
        {/* Solid Orange Hexagon Cube */}
        <path
          d="M32 6L55 19V45L32 58L9 45V19L32 6Z"
          fill="#EA580C"
        />
        {/* Crisp White Top Lid Fold */}
        <path
          d="M11 20L32 32L53 20"
          stroke="#FFFFFF"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sharp White Aura Eyes */}
        <path
          d="M18 33L26 37.5"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M46 33L38 37.5"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          Xampe
        </span>
      )}
    </div>
  );
};

export default XampeLogo;
