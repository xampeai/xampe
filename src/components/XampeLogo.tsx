import React from 'react';

interface XampeLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
}

export const XampeLogo: React.FC<XampeLogoProps> = ({
  variant = 'light',
  size = 'md',
}) => {
  const iconSizeClass = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  const wordmarkClass =
    size === 'sm'
      ? variant === 'dark'
        ? 'font-display text-[17px] font-extrabold tracking-tight text-white'
        : 'font-display text-[17px] font-extrabold tracking-tight text-[#111827]'
      : variant === 'dark'
        ? 'font-display text-[21px] font-extrabold tracking-tight text-white'
        : 'font-display text-[21px] font-extrabold tracking-tight text-[#111827]';

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap shrink-0">
      {variant === 'dark' ? (
        <span className="inline-flex items-center justify-center rounded-lg bg-white p-0.5 shrink-0">
          <img
            src="/assets/aistudio/image_6a0fb77_2ecd1718.jpg"
            alt="Xampe logo"
            className={`${iconSizeClass} object-cover object-center mix-blend-multiply rounded-md shrink-0`}
          />
        </span>
      ) : (
        <img
          src="/assets/aistudio/image_6a0fb77_2ecd1718.jpg"
          alt="Xampe logo"
          className={`${iconSizeClass} object-cover object-center mix-blend-multiply shrink-0`}
        />
      )}
      <span className={wordmarkClass}>Xampe</span>
    </span>
  );
};
