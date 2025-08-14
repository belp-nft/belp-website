"use client";
import { useEffect, useState } from "react";

interface VideoPreloaderProps {
  src: string;
  children: React.ReactNode;
}

export default function VideoPreloader({ src, children }: VideoPreloaderProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Preload video metadata only
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = src;

    const handleLoadedMetadata = () => {
      setIsVideoLoaded(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Start loading immediately
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [src]);

  return (
    <>
      {!isVideoLoaded && (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 z-0" />
      )}
      {children}
    </>
  );
}
