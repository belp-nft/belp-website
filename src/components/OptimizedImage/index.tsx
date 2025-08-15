"use client";
import Image, { ImageProps } from "next/image";
import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  lazy?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fallback = "/images/placeholder.svg",
  lazy = true,
  priority = false,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!hasError && fallback) {
      setImageSrc(fallback);
      setHasError(true);
    }
    onError?.();
  };

  return (
    <Image
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      priority={priority}
      loading={priority ? "eager" : lazy ? "lazy" : "eager"}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        ...props.style,
      }}
      {...props}
    />
  );
}
