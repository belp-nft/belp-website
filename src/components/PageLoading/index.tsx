import React from "react";
import Image from "next/image";

interface PageLoadingProps {
  size?: "sm" | "md" | "lg";
}

const PageLoading: React.FC<PageLoadingProps> = ({ size = "md" }) => {
  const getSizes = () => {
    const sizes = {
      sm: {
        image: "w-12 h-12",
        text: "text-sm",
      },
      md: {
        image: "w-16 h-16",
        text: "text-base",
      },
      lg: {
        image: "w-20 h-20",
        text: "text-lg",
      },
    };
    return sizes[size];
  };

  const sizeConfig = getSizes();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70">
      <Image src="/loading.gif" alt="Loading" width={650} height={650} />
    </div>
  );
};

export default PageLoading;
