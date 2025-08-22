import React from "react";
import Image from "next/image";

interface PageLoadingProps {
  isFullScreen?: boolean;
}

const PageLoading: React.FC<PageLoadingProps> = ({ isFullScreen = false }) => {
  const containerClass = isFullScreen
    ? "fixed inset-0 z-[2000] flex items-center justify-center bg-black/80"
    : "flex items-center justify-center py-8 min-h-[200px]";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center justify-center">
        <Image
          unoptimized
          src="/loading.gif"
          alt="Loading"
          width={650}
          height={650}
        />
      </div>
    </div>
  );
};

export default PageLoading;
