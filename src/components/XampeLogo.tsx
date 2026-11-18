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
        {/* Sharp 3D Isometric Cube Outline */}
        <path
          d="M32 6L55 19V45L32 58L9 45V19L32 6Z"
          stroke="#EA580C"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* 3D Cube Top & Center Ridge */}
        <path
          d="M9 19L32 32L55 19M32 32V58"
          stroke="#EA580C"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Top Lid Aura Spark / Crown Accent */}
        <path
          d="M26 17L32 13.5L38 17"
          stroke="#EA580C"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Confident Aura Eyes on Left & Right Cube Faces */}
        <path
          d="M17.5 34.5L24.5 38.5"
          stroke="#EA580C"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M46.5 34.5L39.5 38.5"
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
