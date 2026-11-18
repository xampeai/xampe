import React, { useEffect, useState } from 'react';

interface ProductStudioVisualProps {
  imageUrl: string;
  imagePosition?: string;
  productName: string;
  darkSurface?: boolean;
  isLiveProduct?: boolean;
}

export const ProductStudioVisual: React.FC<ProductStudioVisualProps> = ({
  imageUrl,
  imagePosition = 'center center',
  productName,
  darkSurface = false,
  isLiveProduct = false,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const isExternalUrl =
    isLiveProduct ||
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://');

  return (
    <div
      className={`relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center ${
        isExternalUrl
          ? 'bg-white'
          : darkSurface
            ? 'bg-zinc-900'
            : 'bg-slate-100'
      }`}
    >
      {!hasError && imageUrl ? (
        <img
          src={imageUrl}
          alt={productName}
          onError={() => setHasError(true)}
          style={isExternalUrl ? undefined : { objectPosition: imagePosition }}
          className={`w-full h-full block transition-transform duration-300 ${
            isExternalUrl
              ? 'object-contain p-3'
              : 'object-cover'
          }`}
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
            darkSurface ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'
          }`}
        >
          <span className="text-xs font-semibold leading-snug">{productName}</span>
          <span className="text-[11px] opacity-75 mt-1">Image Unavailable</span>
        </div>
      )}
    </div>
  );
};

interface HeroImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  objectPosition?: string;
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  fallbackSrc,
  alt,
  objectPosition = 'center center',
  className = '',
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setErrored(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setErrored(true);
    }
  };

  if (errored || !currentSrc) {
    return <div className={`bg-[#111827] ${className}`} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      style={{ objectPosition }}
      className={`object-cover block ${className}`}
    />
  );
};
