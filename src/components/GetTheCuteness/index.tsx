"use client";
import clsx from "clsx";
import { motion } from "framer-motion";

export default function GetTheCuteness() {
  return (
    <section className="relative mx-auto my-10 text-center">
      <div className="px-12">
        <motion.h2
          className={clsx(
            "lg:text-[64px] font-bold mb-3",
            "bg-gradient-to-b from-[#8438CE] to-[#1C007C] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Get The Cuteness
        </motion.h2>
        <motion.p
          className="text-center text-lg mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Each Belpy NFT serves as the main key that connects to all future
          content, unlocking unique value across the entire Belpy ecosystem,
          including games, merchandise, and token rewards.
        </motion.p>
      </div>
      <motion.img
        src="/images/belp-frinds.png"
        alt="Cute NFT"
        initial={{ scale: 0.85, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      />
    </section>
  );
}
