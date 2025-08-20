"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className={clsx(
        "bg-[url('/images/home/bg-hero-section.png')] bg-no-repeat bg-cover bg-bottom bg-fixed"
      )}
    >
      <div
        className="relative flex flex-col items-center justify-center text-center"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 32%, rgba(255,255,255,0.06) 68%, #f2ecf6 100%)",
        }}
      >
        <div className="main-container pt-10 sm:pt-20 md:pt-24 lg:pt-[100px] mt-20 pb-[150px] md:pb-[200px] xl:pb-[600px]">
          <motion.h1
            className={clsx(
              "font-oxanium font-bold mb-4 text-4xl md:text-6xl md:title-text relative z-20",
              "bg-gradient-to-b from-[#ED00FF] to-[#FFC3F9] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-oxanium)",
            }}
          >
            Create Your Own BELPY
            <br />& Find New Universe
          </motion.h1>
          <p
            className={clsx(
              "text-white relative z-20",
              "sm:text-responsive-lg mb-8"
            )}
          >
            The first limited collection of unique NFT tokens,
            <br />
            there are amazing adventure and exploration.
          </p>

          <div
            className={clsx(
              "flex flex-row gap-5 sm:gap-8 justify-center items-center font-bold w-full mt-4 mb-20 relative z-20",
              "text-sm sm:text-base md:text-lg lg:text-xl"
            )}
          >
            <Link href="/mint" className="w-full">
              <button
                className={clsx(
                  "w-full sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px]",
                  "h-[48px] sm:h-[56px] md:h-[64px]",
                  "rounded-2xl bg-gradient-to-b from-[#F896FF] to-[#AE4DCE] text-white",
                  "shadow-lg hover:scale-105 transition"
                )}
              >
                Mint Now
              </button>
            </Link>
            <a
              href="https://magiceden.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <button
                className={clsx(
                  "w-full sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px]",
                  "h-[48px] sm:h-[56px] md:h-[64px]",
                  "rounded-2xl bg-[#E5CAFF] shadow-lg hover:scale-105 transition",
                  "border-2 border-[#8438CE] text-[#8438CE]"
                )}
              >
                Join Marketplace
              </button>
            </a>
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={clsx(
              "absolute bottom-10 left-1/2 transform -translate-x-1/2 z-0 flex-shrink-0 w-full mx-auto px-[50px] lg:px-[200px]"
            )}
          >
            <Image
              src="/images/home/belp-friends.svg"
              alt="belp friend"
              width={600}
              height={521}
              priority
              draggable={false}
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
