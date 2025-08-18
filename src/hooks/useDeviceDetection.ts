"use client";
import { useEffect, useState } from "react";

interface DeviceCapabilities {
  isMobile: boolean;
  isMobileSafari: boolean;
  isWebView: boolean;
  supportsVideoAutoplay: boolean;
  isLowPowerMode: boolean;
  screenWidth: number;
}

export function useDeviceDetection(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: true, // Default to mobile for safety
    isMobileSafari: false,
    isWebView: false,
    supportsVideoAutoplay: false,
    isLowPowerMode: false,
    screenWidth: 0,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return;

    const detectCapabilities = async () => {
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      
      // Comprehensive mobile detection
      const isMobileUserAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = screenWidth <= 768;
      const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
      
      // If ANY of these conditions is true, treat as mobile
      const isMobile = isMobileUserAgent || isTouchDevice || isSmallScreen || isMobileViewport;
      
      const isMobileSafari = /iPhone|iPad|iPod/.test(userAgent) && /Safari/.test(userAgent);
      
      // Enhanced WebView detection
      const isWebView = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any)?.standalone === true ||
        userAgent.includes('wv') || // Android WebView
        userAgent.includes('Version/') && userAgent.includes('Chrome') || // iOS WebView
        userAgent.includes('PhantomWallet') || // Phantom app specifically
        userAgent.includes('MetaMask') ||
        userAgent.includes('Trust') ||
        !userAgent.includes('Safari') && userAgent.includes('Version/'); // Other iOS WebViews
      
      // For mobile devices, NEVER support video autoplay
      const supportsVideoAutoplay = !isMobile && !isWebView;
      
      // Low power detection
      const isLowPowerMode = 
        isMobileSafari && 
        ((navigator as any)?.hardwareConcurrency <= 2 || 
         (navigator as any)?.deviceMemory <= 4);

      setCapabilities({
        isMobile,
        isMobileSafari,
        isWebView,
        supportsVideoAutoplay,
        isLowPowerMode,
        screenWidth,
      });
    };

    detectCapabilities();

    // Re-detect on resize to catch orientation changes
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setCapabilities(prev => ({
        ...prev,
        screenWidth: newWidth,
        isMobile: prev.isMobile || newWidth <= 768, // Once mobile, stay mobile
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return capabilities;
}
