"use client";
import { useState, useEffect, useRef } from "react";

interface LazyGifProps {
  src: string;
  placeholder?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
}

export default function LazyGif({
  src,
  placeholder,
  alt,
  width,
  height,
  className = "",
  loading = "lazy",
}: LazyGifProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {placeholder && (!inView || !loaded) && (
        <img
          src={placeholder}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 w-full h-auto transition-opacity duration-300 ${
            loaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Actual GIF - only load when in view */}
      {inView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-auto transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}
