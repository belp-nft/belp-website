"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      className={clsx(
        "relative flex flex-col items-center justify-center text-center",
        "bg-[url('/images/home/bg-hero-section.png')] bg-no-repeat bg-cover"
      )}
    >
      <div className="py-20 md:py-24 lg:py-[100px] px-5 mt-20">
        <motion.h1
          className={clsx(
            "font-bold mb-4",
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[96px]",
            "bg-gradient-to-b from-[#ED00FF] to-[#FFC3F9] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Create Your Own Belp
          <br />& Find New Universe
        </motion.h1>
        <p
          className={clsx(
            "text-base sm:text-xl md:text-2xl text-white",
            "text-container mb-8"
          )}
        >
          The first limited collection of unique NFT tokens, there are amazing
          adventure and exploration.
        </p>

        <div
          className={clsx(
            "flex flex-col lg:flex-row gap-5 sm:gap-8 justify-center items-center sm:text-xl font-bold w-full mt-4 text-2xl mb-20"
          )}
        >
          <button
            className={clsx(
              "min-w-[220px] sm:min-w-[320px] md:min-w-[400px]",
              "h-[54px] sm:h-[64px]",
              "rounded-2xl bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] text-white",
              "shadow-lg hover:scale-105 transition"
            )}
          >
            Mint Now
          </button>
          <button
            className={clsx(
              "min-w-[220px] sm:min-w-[320px] md:min-w-[400px]",
              "h-[54px] sm:h-[64px]",
              "rounded-2xl bg-[#E5CAFF] shadow-lg hover:scale-105 transition",
              "border-2 border-[#8438CE] text-[#8438CE]"
            )}
          >
            Join Marketplace
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={clsx(
            "relative z-10 flex-shrink-0 w-full max-w-[550px] xl:max-w-[623px] mx-auto cursor-pointer"
          )}
        >
          <Image
            src="/images/home/belp-friends.svg"
            alt="belp friend"
            width={623}
            height={321}
            priority
            draggable={false}
            className="w-full h-auto"
          />
        </motion.div>

        <div
          className={clsx(
            "pointer-events-none absolute left-0 bottom-0 w-full",
            "h-16 sm:h-24 md:h-32 lg:h-40",
            "bg-gradient-to-b from-transparent to-[#FFE7FF]",
            "z-0"
          )}
        />
      </div>
    </section>
  );
}
