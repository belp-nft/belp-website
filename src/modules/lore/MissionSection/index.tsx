"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function MissionSection() {
  return (
    <section className="pt-16 sm:pt-20 lg:pt-24 bg-gradient-to-b from-purple-100 to-pink-100">
      {/* Section Title */}
      <div className="text-center mb-3 lg:mb-5">
        <motion.h1
          className={clsx(
            "font-oxanium font-bold title-text",
            "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--font-oxanium)",
          }}
        >
          Mission
        </motion.h1>
      </div>

      {/* Mission Content */}
      <div className="max-w-2xl mx-auto text-center space-y-8">
        Belpy enters not just to compete with penguins, but to build an empire
        of her own — one rooted in community-crafted lore, real-world toys,
        game-ready NFTs, and the consumer-friendly scalability of CLAW.
      </div>
    </section>
  );
}
