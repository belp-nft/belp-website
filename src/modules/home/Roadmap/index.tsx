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
    smallIcon: "/icons/small-belp-coin.svg",
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
    <div className="bg-[url('/images/home/bg-roadmap.png')] bg-contain bg-fixed bg-bottom">
      <section
        className="w-full flex justify-center items-center relative py-12 md:py-20"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0.06) 68%, rgba(255,255,255,1) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, type: "spring", bounce: 0.15 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10 w-full main-container"
        >
          <motion.h2
            className="font-bold title-text
          bg-gradient-to-b from-[#d38dff] to-[#e30bff] bg-clip-text text-transparent text-center"
            style={{
              fontFamily: "var(--font-oxanium) !important",
            }}
          >
            Road map
          </motion.h2>
          <div className="text-[#411A7A] text-responsive-lg font-medium mb-5 text-center">
            The Expanding BELPY Universe
          </div>
          <div className="text-[#401B79] text-responsive mb-16 text-center">
            BELPY NFTs are your key to a growing Web3 ecosystem where digital
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
            className="flex flex-col gap-12 relative"
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
                {item.icon && (
                  <motion.div
                    initial={{ opacity: 0, x: 24, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                    className="ml-3 mt-0.5 relative"
                  >
                    <Image
                      src={item.icon}
                      alt={item.label + " icon"}
                      width={52}
                      height={52}
                      className="drop-shadow-lg"
                      draggable={false}
                    />
                    {item.smallIcon && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.3,
                          duration: 0.3,
                          type: "spring",
                        }}
                        className="absolute -bottom-2 -right-3"
                      >
                        <Image
                          src={item.smallIcon}
                          alt={item.label + " small icon"}
                          width={50}
                          height={50}
                          className="drop-shadow-md"
                          draggable={false}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>
    </div>
  );
}
