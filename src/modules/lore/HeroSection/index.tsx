"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section>
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <div className="lore-hero-title">
          <motion.div
            className="lore-hero-belpy"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            whileHover={{
              scale: 1.05,
              rotate: [-1, 1, -1, 0],
              transition: { duration: 0.6 },
            }}
          >
            BELPY
          </motion.div>
          <motion.div
            className="lore-hero-world"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
            whileHover={{
              scale: 1.05,
              rotate: [1, -1, 1, 0],
              transition: { duration: 0.6 },
            }}
          >
            WORLD
          </motion.div>
        </div>
      </div>
    </section>
  );
}
