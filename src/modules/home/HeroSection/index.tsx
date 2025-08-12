"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className={clsx(
        "relative flex flex-col items-center justify-center text-center",
        "bg-[url('/images/home/bg-hero-section.png')] bg-no-repeat bg-cover"
      )}
    >
      <div className="main-container py-20 md:py-24 lg:py-[100px] mt-20">
        <motion.h1
          className={clsx(
            "font-bold mb-4 title-text",
            "bg-gradient-to-b from-[#ED00FF] to-[#FFC3F9] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Create Your Own Belp
          <br />& Find New Universe
        </motion.h1>
        <p className={clsx("text-white", "medium-text-container mb-8")}>
          The first limited collection of unique NFT tokens, there are amazing
          adventure and exploration.
        </p>

        <div
          className={clsx(
            "flex flex-col md:flex-row gap-5 sm:gap-8 justify-center items-center font-bold w-full mt-4 mb-20",
            "text-sm sm:text-base md:text-lg lg:text-xl"
          )}
        >
          <Link href="/mint" className="w-full">
            <button
              className={clsx(
                "w-full min-w-[200px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px]",
                "h-[48px] sm:h-[56px] md:h-[64px]",
                "rounded-2xl bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] text-white",
                "shadow-lg hover:scale-105 transition"
              )}
            >
              Mint Now
            </button>
          </Link>
          <button
            className={clsx(
              "w-full min-w-[200px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px]",
              "h-[48px] sm:h-[56px] md:h-[64px]",
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
