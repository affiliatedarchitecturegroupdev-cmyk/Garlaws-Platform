'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  fill = false,
  style,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const formats = ['webp', 'avif'];
    const widths = [320, 640, 768, 1024, 1280, 1920];

    const srcSet: string[] = [];

    formats.forEach(format => {
      widths.forEach(width => {
        // In a real implementation, you'd have a service to generate these
        // For now, we'll use the base src with format hints
        srcSet.push(`${baseSrc}?format=${format}&width=${width}&quality=${quality} ${width}w`);
      });
    });

    return srcSet.join(', ');
  };

  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const commonProps = {
    alt,
    onLoad: handleLoad,
    onError: handleError,
    className: cn(
      'transition-opacity duration-300',
      {
        'opacity-0': !isLoaded,
        'opacity-100': isLoaded,
      },
      className
    ),
    style: {
      ...style,
      ...(fill && { position: 'absolute' as const, height: '100%', width: '100%', inset: 0 }),
    },
  };

  const imgProps = {
    ...commonProps,
    width: fill ? undefined : width,
    height: fill ? undefined : height,
    sizes: sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    srcSet: isInView ? generateSrcSet(src) : undefined,
    src: isInView ? `${src}?quality=${quality}` : undefined,
    loading: priority ? 'eager' : 'lazy' as 'eager' | 'lazy',
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800',
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style,
        }}
      >
        <div className="text-gray-400 text-sm">Failed to load image</div>
      </div>
    );
  }

  return (
    <>
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          {...commonProps}
          src={blurDataURL}
          alt=""
          aria-hidden="true"
        />
      )}
      <picture>
        {isInView && (
          <>
            <source srcSet={`${src}?format=avif&quality=${quality}`} type="image/avif" />
            <source srcSet={`${src}?format=webp&quality=${quality}`} type="image/webp" />
          </>
        )}
        <img {...imgProps} ref={imgRef} />
      </picture>
    </>
  );
}