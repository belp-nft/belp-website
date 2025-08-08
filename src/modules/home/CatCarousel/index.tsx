import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation } from "swiper/modules";
import clsx from "clsx";

const cats = [
  "token-nft-1.svg",
  "token-nft-2.svg",
  "token-nft-3.svg",
  "token-nft-4.svg",
  "token-nft-5.svg",
];

export default function CatCarousel() {
  const swiperRef = useRef<SwiperType | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [isPause, setIsPause] = useState(false);

  useEffect(() => {
    if (isPause || !swiperRef.current) return;
    intervalRef.current = setInterval(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      if (swiper.activeIndex === cats.length - 1) {
        setDir("prev");
        swiper.slidePrev();
      } else if (swiper.activeIndex === 0) {
        setDir("next");
        swiper.slideNext();
      } else {
        dir === "next" ? swiper.slideNext() : swiper.slidePrev();
      }
    }, 1800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [dir, isPause]);

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setIsPause(true)}
      onMouseLeave={() => setIsPause(false)}
    >
      <Swiper
        modules={[Navigation]}
        centeredSlides
        initialSlide={2}
        loop={false}
        speed={600}
        className="w-full max-w-5xl select-none"
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        breakpoints={{
          // width >= 0px
          0: { slidesPerView: 1, spaceBetween: 8, centeredSlides: true },
          // width >= 640px
          640: { slidesPerView: 3, spaceBetween: 12, centeredSlides: true },
          // width >= 1024px
          1024: { slidesPerView: 5, spaceBetween: 18, centeredSlides: true },
        }}
      >
        {cats.map((src, i) => (
          <SwiperSlide key={i}>
            {({ isActive, isPrev, isNext }) => (
              <div
                className={clsx(
                  "rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300"
                )}
                style={{
                  width: 170,
                  height: 200,
                  opacity: isActive ? 1 : isPrev || isNext ? 0.7 : 0.23,
                  transition: "opacity .3s, box-shadow .3s",
                }}
                onClick={() => {
                  swiperRef.current && swiperRef.current.slideTo(i);
                }}
              >
                <img
                  src={`/icons/${src}`}
                  alt="token-nft"
                  draggable={false}
                  className="object-contain w-full h-full"
                  style={{
                    opacity: 1,
                    transition: "opacity .3s",
                  }}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
