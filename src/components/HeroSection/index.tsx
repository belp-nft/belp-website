"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center py-16 text-center">
      <motion.h1
        className={clsx(
          "text-[96px] font-bold",
          "mb-4",
          "bg-gradient-to-b from-[#8438CE] to-[#1C007C] bg-clip-text text-transparent"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Your NFT. Your Story.
        <br />
        <p className="flex gap-2">
          Your Cat
          <Image src="/icons/cat.png" width={139} height={105} alt="Cat Icon" />
          Kingdom
        </p>
      </motion.h1>
      <p className="text-xl mb-8">
        A new digital character ecosystem, starting with just one NFT.
      </p>

      <motion.video
        src="/videos/cat.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="mb-4 drop-shadow-xl"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      <div className="flex gap-5 text-2xl font-bold">
        <button className="w-[400px] h-[64px] rounded-2xl bg-gradient-to-b from-[#A39BFF] to-[#FFC3F9] text-white shadow-lg hover:scale-105 transition">
          Mint Now
        </button>
        <button className="w-[400px] h-[64px] rounded-2xl shadow-lg hover:scale-105 transition">
          Join Marketplace
        </button>
      </div>
    </section>
  );
}
