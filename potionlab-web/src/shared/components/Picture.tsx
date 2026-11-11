import { useState } from 'react';
import { placeholder } from '../assets/placeholders';

type PictureProps = {
  src: string;
  size: number;
  alt: string;
  failed: Readonly<Record<string, true>>;
  imgClassName: string;
};
export function Picture({
  src,
  size,
  alt,
  failed,
  imgClassName,
}: PictureProps) {
  const [broken, setBroken] = useState(false);
  const [fallbackBroken, setFallbackBroken] = useState(false);
  const fallback = placeholder(size);
  const useFallback = broken || failed[src];
  const unavailable = (useFallback && failed[fallback]) || fallbackBroken;

  if (unavailable) {
    return (
      <span
        className="image-fallback"
        role="img"
        aria-label={alt}
        style={{ width: size, height: size }}
      >
        {alt}
      </span>
    );
  }
  return (
    <img
      src={useFallback ? fallback : src}
      width={size}
      height={size}
      alt={alt}
      className={imgClassName}
      onError={() => (useFallback ? setFallbackBroken(true) : setBroken(true))}
    />
  );
}
