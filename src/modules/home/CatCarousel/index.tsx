"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import clsx from "clsx";
import OptimizedImage from "@/components/OptimizedImage";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

// Memoized slide component
const CatSlide = React.memo(
  ({
    src,
    index,
    isActive,
    isPrev,
    isNext,
    onClick,
  }: {
    src: string;
    index: number;
    isActive: boolean;
    isPrev: boolean;
    isNext: boolean;
    onClick: () => void;
  }) => {
    const isAdjacent = isPrev || isNext;
    const opacity = isActive ? 1 : isAdjacent ? 0.8 : 0.4;
    const scale = isActive ? 1 : isAdjacent ? 0.95 : 0.85;

    return (
      <div
        className={clsx(
          "overflow-hidden flex items-center justify-center cursor-pointer",
        )}
        style={{
          width: "100%",
          maxWidth: 180,
          opacity,
          transform: `scale(${scale})`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={onClick}
      >
        <OptimizedImage
          src={`/icons/${src}`}
          alt={`Belp Cat NFT ${index + 1}`}
          width={180}
          height={180}
          draggable={false}
          className="object-contain w-full h-full rounded-2xl"
          lazy={!isActive}
          style={{
            filter: isActive ? "none" : "brightness(0.9)",
            transition: "filter 0.3s ease",
          }}
        />
      </div>
    );
  }
);

CatSlide.displayName = "CatSlide";

export default function CatCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(2);

  // Memoized handlers
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  const handleSlideClick = useCallback((index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
      setCurrentSlide(index);
    }
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setCurrentSlide(swiper.activeIndex);
  }, []);

  // Optimized autoplay settings
  const autoplayConfig = useMemo(
    () => ({
      delay: 2000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      reverseDirection: false,
      stopOnLastSlide: false,
      waitForTransition: true,
    }),
    []
  );

  // Optimized breakpoints
  const breakpoints = useMemo(
    () => ({
      320: {
        slidesPerView: 2.2,
        spaceBetween: 2,
        centeredSlides: true,
      },
      480: {
        slidesPerView: 2.5,
        spaceBetween: 2,
        centeredSlides: true,
      },
      640: {
        slidesPerView: 3,
        spaceBetween: 2,
        centeredSlides: true,
      },
      1024: {
        slidesPerView: 5,
        spaceBetween: 2,
        centeredSlides: true,
      },
      1440: {
        slidesPerView: 7,
        spaceBetween: 2,
        centeredSlides: true,
      },
    }),
    []
  );

  // Auto-resume after manual interaction
  useEffect(() => {
    if (!isPaused && swiperRef.current?.autoplay) {
      const timer = setTimeout(() => {
        swiperRef.current?.autoplay.start();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isPaused, currentSlide]);

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        centeredSlides={true}
        initialSlide={3}
        loop={true}
        speed={600} // Reduced from 800 for better performance
        watchSlidesProgress={true}
        grabCursor={true}
        autoplay={autoplayConfig}
        breakpoints={breakpoints}
        className="w-full max-w-7xl select-none"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
      >
        {Array(25)
          .fill(0)
          .map((_, index) => (
            <SwiperSlide key={`cat-${index}`}>
              {({ isActive, isPrev, isNext }) => (
                <CatSlide
                  src={`tokens/${index + 1}.png`}
                  index={index}
                  isActive={isActive}
                  isPrev={isPrev}
                  isNext={isNext}
                  onClick={() => handleSlideClick(index)}
                />
              )}
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}
