"use client";
import { useEffect, useState } from "react";

interface VideoPreloaderProps {
  src: string;
  children: React.ReactNode;
}

export default function VideoPreloader({ src, children }: VideoPreloaderProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Detect mobile devices and WebView environments
    const checkMobileDevice = () => {
      const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
      const isWebView = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any)?.standalone === true;
      const isMobileGeneral = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      return isMobileSafari || isWebView || isMobileGeneral;
    };

    setIsMobileDevice(checkMobileDevice());

    // Only preload video on desktop to avoid mobile issues
    if (!checkMobileDevice()) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = src;

      const handleLoadedMetadata = () => {
        setIsVideoLoaded(true);
      };

      const handleError = () => {
        // Fallback to static background on video error
        setIsVideoLoaded(true);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);

      // Start loading immediately
      video.load();

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
      };
    } else {
      // On mobile, skip video preloading and show content immediately
      setIsVideoLoaded(true);
    }
  }, [src]);

  return (
    <>
      {!isVideoLoaded && !isMobileDevice && (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 z-0 animate-pulse" />
      )}
      {children}
    </>
  );
}
