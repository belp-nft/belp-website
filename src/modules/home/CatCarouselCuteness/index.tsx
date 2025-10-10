import { useRef, useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import clsx from "clsx";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const baseCats = [
  "tokens/1.webp",
  "tokens/2.webp",
  "tokens/3.webp",
  "tokens/4.webp",
  "tokens/5.webp",
];

// Tạo loop bằng cách duplicate slides để transition mượt hơn
const cats = [...baseCats, ...baseCats, ...baseCats];

// Tạo rotation ngẫu nhiên cho mỗi slide
const getRandomRotation = () => {
  return (Math.random() - 0.5) * 20; // Xoay từ -10 đến +10 độ
};

export default function CatCarouselCuteness() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(2);
  const [rotations, setRotations] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Khởi tạo rotation cho mỗi slide
  useEffect(() => {
    setIsMounted(true);
    setRotations(cats.map(() => getRandomRotation()));
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Auto-resume after manual interaction
  useEffect(() => {
    if (!isPaused && swiperRef.current?.autoplay) {
      const timer = setTimeout(() => {
        swiperRef.current?.autoplay.start();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isPaused, currentSlide]);

  const handleSlideClick = useCallback((index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
      setCurrentSlide(index);
    }
  }, []);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      setCurrentSlide(swiper.activeIndex);
      // Tạo rotation mới cho slide hiện tại và các slide xung quanh
      const newRotations = [...rotations];
      const activeIndex = swiper.activeIndex;
      newRotations[activeIndex] = getRandomRotation();
      setRotations(newRotations);
    },
    [rotations]
  );

  if (!isMounted) {
    return <div className="flex flex-col items-center w-full h-60" />;
  }

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        modules={[Navigation, Autoplay]}
        centeredSlides={true}
        initialSlide={Math.floor(cats.length / 2)}
        loop={true}
        speed={800}
        watchSlidesProgress={true}
        grabCursor={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection: false,
          stopOnLastSlide: false,
          waitForTransition: true,
        }}
        className="w-full max-w-7xl select-none"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
        breakpoints={{
          // Mobile
          320: {
            slidesPerView: 2.2,
            spaceBetween: 2,
            centeredSlides: true,
          },
          // Mobile large
          480: {
            slidesPerView: 2.5,
            spaceBetween: 2,
            centeredSlides: true,
          },
          // Tablet
          640: {
            slidesPerView: 3,
            spaceBetween: 2,
            centeredSlides: true,
          },
          // Desktop
          1024: {
            slidesPerView: 5,
            spaceBetween: 2,
            centeredSlides: true,
          },
          // Large Desktop
          1440: {
            slidesPerView: 7,
            spaceBetween: 2,
            centeredSlides: true,
          },
        }}
      >
        {cats.map((src, index) => (
          <SwiperSlide key={`${src}-${index}`}>
            {({ isActive, isPrev, isNext }) => {
              const isAdjacent = isPrev || isNext;
              const opacity = isActive ? 1 : isAdjacent ? 0.8 : 0.4;
              const scale = isActive ? 1 : isAdjacent ? 0.95 : 0.85;

              return (
                <div
                  className={clsx(
                    "flex items-center justify-center cursor-pointer transition-all duration-500 ease-out",
                    "hover:scale-105 hover:shadow-lg",
                    "h-60"
                  )}
                  style={{
                    width: "100%",
                    maxWidth: 180,
                    opacity,
                    transform: `scale(${scale}) rotate(${
                      rotations[index] || 0
                    }deg)`,
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onClick={() => handleSlideClick(index)}
                >
                  <img
                    src={`/icons/${src}`}
                    alt={`Belp Cat NFT ${index + 1}`}
                    draggable={false}
                    className="object-contain w-full h-full"
                    loading="lazy"
                    style={{
                      filter: isActive ? "none" : "brightness(0.9)",
                      transition: "filter 0.3s ease",
                    }}
                  />
                </div>
              );
            }}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
