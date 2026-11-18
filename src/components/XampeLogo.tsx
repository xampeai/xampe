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
        {/* Open Top Flaps */}
        <path
          d="M14 22L7 14H26L32 22M50 22L57 14H38L32 22"
          stroke="#EA580C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main Box Body */}
        <path
          d="M14 22H50V46C50 50.4183 46.4183 54 42 54H22C17.5817 54 14 50.4183 14 46V22Z"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* Fierce Aura Eyes */}
        <path
          d="M21 34L28 38"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        <path
          d="M43 34L36 38"
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
