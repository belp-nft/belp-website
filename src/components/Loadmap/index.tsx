"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const roadmapItems = [
  {
    label: "BELP Token",
    desc: "The community currency for tipping, governance, exclusive drops, and staking rewards.",
  },
  {
    label: "CLAW Chain",
    desc: "A fast, gas-efficient Layer 2 powering gaming, loyalty programs, and cross-IP collaboration.",
    icon: "/icons/belp-coin.svg",
  },
  {
    label: "Gaming",
    desc: "Lay-to-earn adventures with BELP rewards and evolving companions.",
  },
  {
    label: "Merchandise & Toys",
    desc: "NFT-linked plushies, figurines, and apparel with on-chain perks.",
    icon: "/icons/gamepad.svg",
  },
  {
    label: "Content & Media",
    desc: "Animated shorts, comics, and meme campaigns shaped by the community.",
  },
];

export default function Roadmap() {
  return (
    <section className="w-full flex justify-center items-center px-2 md:px-0 relative bg-transparent py-12 md:py-20">
      <div
        className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <Image
          src="/images/bg-roadmap.png"
          alt="roadmap bg"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-60"
          priority
          draggable={false}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, type: "spring", bounce: 0.15 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        <motion.h2
          className="font-extrabold mb-3 text-4xl sm:text-5xl md:text-[56px] lg:text-[64px]
          bg-gradient-to-b from-[#B553F3] to-[#A800BD] bg-clip-text text-transparent text-left"
        >
          Road map
        </motion.h2>
        <div className="text-[#411A7A] text-base md:text-lg font-medium mb-2">
          The Expanding Belpy Universe
        </div>
        <div className="text-[#401B79] text-sm md:text-base mb-6">
          Belpy NFTs are your key to a growing Web3 ecosystem where digital
          culture meets real-world experiences
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.22 },
            },
          }}
          className="flex flex-col gap-7 relative"
        >
          {roadmapItems.map((item, i) => (
            <motion.li
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 32 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.56, ease: "easeOut" },
                },
              }}
              className="relative flex items-center gap-4 py-1"
            >
              <span className="mt-2 block w-5 h-5 rounded-full bg-[#C000FF] shadow-[0_0_10px_#C000FF80] flex-shrink-0" />
              <div className="flex-1">
                <span className="font-bold text-[#401B79] text-lg md:text-xl">
                  {item.label}
                </span>
                <div className="text-[#431b73] text-sm md:text-base font-medium">
                  {item.desc}
                </div>
              </div>
              {/* Hiện icon bên phải CLAW Chain và Merchandise & Toys */}
              {item.icon && (
                <motion.div
                  initial={{ opacity: 0, x: 24, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                  className="ml-3 mt-0.5"
                >
                  <Image
                    src={item.icon}
                    alt={item.label + " icon"}
                    width={52}
                    height={52}
                    className="drop-shadow-lg"
                    draggable={false}
                  />
                </motion.div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
