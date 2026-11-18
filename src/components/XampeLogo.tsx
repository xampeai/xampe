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
        {/* Outer rounded hexagon box */}
        <path
          d="M32 6L54 18.7V45.3L32 58L10 45.3V18.7L32 6Z"
          stroke="#EA580C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Top Y-fold angry brow lines */}
        <path
          d="M11 19.5L32 31.5L53 19.5"
          stroke="#EA580C"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Angry eyes */}
        <path
          d="M19.5 34.5L25.5 37.5"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M44.5 34.5L38.5 37.5"
          stroke="#EA580C"
          strokeWidth="5.5"
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
