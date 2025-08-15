import React from "react";
import Image from "next/image";

interface PageLoadingProps {
  size?: "sm" | "md" | "lg";
  isFullScreen?: boolean;
}

const PageLoading: React.FC<PageLoadingProps> = ({ 
  size = "md", 
  isFullScreen = false 
}) => {
  const getSizes = () => {
    const sizes = {
      sm: {
        image: "w-12 h-12",
        text: "text-sm",
        gifSize: 200,
      },
      md: {
        image: "w-16 h-16", 
        text: "text-base",
        gifSize: 300,
      },
      lg: {
        image: "w-20 h-20",
        text: "text-lg", 
        gifSize: 400,
      },
    };
    return sizes[size];
  };

  const sizeConfig = getSizes();

  const containerClass = isFullScreen 
    ? "fixed inset-0 z-[2000] flex items-center justify-center bg-white/70"
    : "flex items-center justify-center py-8 min-h-[200px]";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center justify-center">
        <Image 
          src="/loading.gif" 
          alt="Loading" 
          width={sizeConfig.gifSize} 
          height={sizeConfig.gifSize}
          className={sizeConfig.image}
          unoptimized
          priority={isFullScreen}
        />
        {isFullScreen && (
          <p className={`mt-4 text-purple-600 font-medium ${sizeConfig.text}`}>
            Loading...
          </p>
        )}
      </div>
    </div>
  );
};

export default PageLoading;
