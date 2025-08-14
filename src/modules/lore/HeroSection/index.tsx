"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function HeroSection() {
  return (
    <section>
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <div
          className={clsx("font-oxanium font-bold title-text leading-none")}
          style={{
            fontFamily: "var(--font-oxanium)",
            lineHeight: "1.2",
          }}
        >
          <motion.span
            className="block text-[#F356FF] text-[72px] md:text-[80px] lg:text-[96px]"
            initial={{ opacity: 0, y: 300 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.2,
            }}
          >
            BELPY
          </motion.span>
          <motion.span
            className="block text-[#AE4DCE] text-[80px] md:text-[96px] lg:text-[124px]"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 1,
              ease: "easeOut",
              delay: 0.6,
            }}
          >
            WORLD
          </motion.span>
        </div>
      </div>
    </section>
  );
}
