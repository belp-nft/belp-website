"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoreShop() {
  return (
    <section
      className={clsx(
        "relative w-full min-h-[720px] overflow-hidden",
        "bg-[#2c1a52] pt-12 pb-10 px-4 md:px-12 lg:px-24"
      )}
      style={{
        backgroundImage: "url('/images/home/bg-lore-shop.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 w-full h-full z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0.06) 68%, rgba(255,255,255,0.72) 100%)",
        }}
      />
      <div className="flex flex-col md:flex-row items-center justify-between w-full h-full relative z-20 gap-12 md:gap-0">
        <motion.div
          initial={{ x: -300, scale: 0.5, opacity: 0 }}
          whileInView={{ x: 0, scale: 1, opacity: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="flex-shrink-0 w-full md:w-1/2 flex justify-center items-end pb-8 md:pb-0"
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
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start px-0 md:px-6 xl:px-12">
          <motion.h2
            className={clsx(
              "font-extrabold mb-6 text-center md:text-left",
              "text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[90px] text-white leading-tight"
            )}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, type: "spring" }}
          >
            LORE SHOP
          </motion.h2>
          <div className="flex flex-col justify-center gap-5 w-full max-w-[380px]">
            <motion.button
              className={clsx(
                "h-[54px] rounded-2xl shadow-md text-xl font-bold",
                "bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] text-white",
                "hover:bg-[#dfc6fd] transition-all w-full"
              )}
              whileHover={{ scale: 1.03 }}
            >
              Learn about the BELP
            </motion.button>
            <motion.button
              className={clsx(
                "bg-[#E5CAFF] shadow-lg hover:scale-105 transition",
                "border-2 border-[#8438CE] text-[#8438CE]",
                "h-[54px] rounded-2xl text-xl font-bold w-full"
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
