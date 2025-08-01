"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoreShop() {
  return (
    <section
      className={clsx(
        "relative w-full flex flex-col items-center justify-end min-h-[720px] overflow-hidden",
        "bg-[#2c1a52] pt-10 pb-0"
      )}
      style={{
        backgroundImage: "url('/images/bg-spacecraft.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="z-20 w-full flex flex-col items-center mt-4">
        <motion.h2
          className={clsx(
            "font-extrabold mb-1 text-center",
            "text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[90px]",
            "bg-gradient-to-b from-[#F8B9FF] via-[#C19BFF] to-[#7B56F1] bg-clip-text text-transparent",
            "tracking-tight"
          )}
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, type: "spring" }}
        >
          LORE SHOP
        </motion.h2>
        <motion.div
          className="max-w-[780px] w-full mx-auto text-center mt-2"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-base sm:text-lg md:text-xl font-medium text-white/90 drop-shadow mb-0">
            <span className="block">
              Belp is more than just a cute NFT — it’s a character in a growing
              digital universe.
            </span>
            <span className="block mt-2">
              Each Belp has its own story, personality, and place in the Kingdom
              of Belpy: a whimsical Web3 world full of magic, mystery, and
              mischief.
            </span>
          </p>
        </motion.div>
      </div>

      <div className="relative w-full flex flex-row justify-center z-30 mt-10 mb-0 min-h-[370px]">
        <motion.div
          initial={{ x: -300, scale: 0.5, opacity: 0 }}
          whileInView={{ x: 0, scale: 1, opacity: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="flex-shrink-0 -mb-2 -ml-10"
        >
          <Image
            src="/images/lore-ufo.svg"
            alt="Belpy UFO"
            width={684}
            height={700}
            priority
            draggable={false}
          />
        </motion.div>

        <div className="flex flex-col gap-3 sm:gap-5 ml-4 mb-10">
          <motion.button
            className={clsx(
              "w-[330px] max-w-full h-[54px] rounded-2xl bg-gradient-to-b from-[#E7BFFF] to-[#A3B5FF]",
              "shadow-lg text-white text-xl font-bold hover:scale-[1.04] transition-all outline-none border-none"
            )}
            whileHover={{ scale: 1.04 }}
          >
            Start your collection
          </motion.button>
          <motion.button
            className={clsx(
              "w-[330px] max-w-full h-[54px] rounded-2xl bg-[#E9D2FF] shadow-md text-[#8338ec] text-xl font-bold",
              "hover:bg-[#dfc6fd] transition-all"
            )}
            whileHover={{ scale: 1.03 }}
          >
            Click Learn about BELP
          </motion.button>
        </div>
      </div>
    </section>
  );
}
