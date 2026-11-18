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
        {/* Open top box flaps */}
        <path
          d="M14 20L8 12H26L32 20M50 20L56 12H38L32 20"
          stroke="#EA580C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Box body */}
        <rect
          x="14"
          y="20"
          width="36"
          height="34"
          rx="6"
          stroke="#EA580C"
          strokeWidth="5"
        />
        {/* Bold X mark inside the box */}
        <path
          d="M25 30L39 44M39 30L25 44"
          stroke="#EA580C"
          strokeWidth="5"
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
