"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center">
      <motion.h1
        className={clsx(
          "font-bold mb-4",
          "text-4xl sm:text-6xl md:text-7xl lg:text-[96px]",
          "bg-gradient-to-b from-[#8438CE] to-[#1C007C] bg-clip-text text-transparent leading-tight"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your NFT. Your Story.
        <br />
        <span className="flex items-center gap-2 justify-center w-full text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Your Cat
          <span className="relative top-2">
            <Image
              src="/icons/cat.png"
              width={50}
              height={40}
              alt="Cat Icon"
              className="inline-block w-10 sm:w-[60px] md:w-[80px] lg:w-[139px] h-auto"
            />
          </span>
          Kingdom
        </span>
      </motion.h1>
      <p className="text-base sm:text-xl md:text-2xl mb-8 mx-auto">
        A new digital character ecosystem, starting with just one NFT.
      </p>

      <motion.video
        src="/videos/cat.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="mb-4 drop-shadow-xl rounded-2xl w-full max-w-[420px] sm:max-w-[560px] md:max-w-[700px] h-auto"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 justify-center items-center sm:text-xl font-bold w-full mt-4 text-2xl">
        <button className="min-w-[400px] h-[54px] sm:h-[64px] rounded-2xl bg-gradient-to-b from-[#A39BFF] to-[#FFC3F9] text-white shadow-lg hover:scale-105 transition">
          Mint Now
        </button>
        <button className="min-w-[400px] h-[54px] sm:h-[64px] rounded-2xl shadow-lg hover:scale-105 transition bg-white/90 border border-[#eee]">
          Join Marketplace
        </button>
      </div>
    </section>
  );
}
