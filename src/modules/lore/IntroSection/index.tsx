"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

export default function IntroSection() {
  const images = [
    "/images/lore/intro-story-1.svg",
    "/images/lore/intro-story-2.svg",
    "/images/lore/intro-story-3.svg",
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left side - Swiper */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative aspect-square max-w-sm sm:max-w-md lg:max-w-lg mx-auto rounded-2xl overflow-hidden">
              <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={true}
                className="h-full rounded-2xl"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative w-full h-full">
                      <Image
                        src={image}
                        alt={`Belpy Story ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            className="space-y-6 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            {/* Icon and Title */}
            <div className="flex items-end gap-4 mb-6 lg:mb-8">
              <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[157px] lg:h-[157px] flex-shrink-0">
                <Image
                  src="/images/lore/intro-cat.svg"
                  alt="Belpy Icon"
                  fill
                  className="object-contain"
                />
              </div>
              <motion.h1
                className={clsx(
                  "font-oxanium font-bold text-center sm:text-left",
                  "text-5xl md:text-8xl",
                  "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                  fontFamily: "var(--font-oxanium)",
                }}
              >
                Intro
              </motion.h1>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <motion.p
                className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed text-center sm:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Meet the adorable characters that live in Belpy World! Each one
                has their own unique personality and special abilities that make
                them perfect companions for any adventure.
              </motion.p>

              <motion.p
                className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed text-center sm:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                From the playful purple cats to the wise rainbow friends,
                discover the magical world where friendship and wonder never
                end. Every character has a story to tell and dreams to share
                with you!
              </motion.p>

              <motion.p
                className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed text-center sm:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                Join us in this incredible journey through Belpy World, where
                every day brings new surprises and endless possibilities for fun
                and friendship.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
