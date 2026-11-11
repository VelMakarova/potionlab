import { useEffect, useState } from 'react';
import { preloadImage } from '../assets/imageLoader';
import { placeholder } from '../assets/placeholders';
export function useImageResource(src: string, fallbackSize: number) {
  const [resource, setResource] = useState<{
    src: string;
    status: 'ready' | 'failed';
  } | null>(null);
  useEffect(() => {
    if (!src) return;
    let active = true;
    void preloadImage(src).then(async (success) => {
      if (!success) await preloadImage(placeholder(fallbackSize));
      if (active) setResource({ src, status: success ? 'ready' : 'failed' });
    });
    return () => {
      active = false;
    };
  }, [src, fallbackSize]);
  return resource?.src === src ? resource.status : 'loading';
}
