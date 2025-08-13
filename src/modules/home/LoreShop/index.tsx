"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoreShop() {
  return (
    <section
      className={clsx(
        "relative w-full min-h-[720px] overflow-hidden -mt-2",
        "bg-[#2c1a52] pt-12 pb-10 bg-fixed"
      )}
      style={{
        backgroundImage: "url('/images/home/bg-lore-shop.png')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 w-full h-full z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0.06) 68%, rgba(255,255,255) 100%)",
        }}
      />
      <div className="flex flex-col lg:flex-row items-center justify-between w-full h-full relative z-20 gap-12 md:gap-0 main-container">
        <motion.div
          initial={{ x: -300, scale: 0.5, opacity: 0 }}
          whileInView={{ x: 0, scale: 1, opacity: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="hidden md:flex flex-shrink-0 w-full md:w-1/2  justify-center items-end pb-8 md:pb-0"
        >
          <Image
            src="/images/home/belp-cat-2.png"
            alt="Belpy UFO"
            width={684}
            height={700}
            priority
            draggable={false}
            className="max-w-[320px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[684px] h-auto"
          />
        </motion.div>
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-end">
          <motion.h2
            className={clsx(
              "mt-16 md:mt-0 font-extrabold mb-6 text-center md:text-left title-text text-white leading-tight text-nowrap"
            )}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, type: "spring" }}
            style={{
              fontFamily: "var(--font-oxanium)",
            }}
          >
            LORE SHOP
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, type: "spring" }}
            className="block md:hidden mb-10"
          >
            <Image
              src="/images/home/belp-cat-2.png"
              alt="Belpy UFO"
              width={684}
              height={700}
              priority
              draggable={false}
              className="max-w-[320px] sm:max-w-[440px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[684px] h-auto"
            />
          </motion.div>
          <div className="flex flex-row md:flex-col justify-center gap-5 w-full max-w-[380px]">
            <motion.button
              className={clsx(
                "md:h-[54px] rounded-xl md:rounded-2xl shadow-md text-xs md:text-xl md:font-bold",
                "bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] text-white",
                "hover:bg-[#dfc6fd] transition-all w-full",
                "h-11"
              )}
              whileHover={{ scale: 1.03 }}
            >
              Learn about the BELP
            </motion.button>
            <motion.button
              className={clsx(
                "bg-[#E5CAFF] shadow-lg hover:scale-105 transition",
                "border-1 border-[#8438CE] text-[#8438CE]",
                "md:h-[54px] rounded-xl md:rounded-2xl text-xs md:text-xl md:font-bold w-full",
                "h-11"
              )}
              whileHover={{ scale: 1.04 }}
            >
              Start your Collection
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
