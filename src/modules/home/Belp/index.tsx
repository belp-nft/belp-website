"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import RandomCloud from "../RandomCloud";

const BelpSection = () => {
  return (
    <div className="relative bg-white z-10 overflow-hidden">
      <div
        className={clsx(
          "flex flex-col md:flex-row items-center justify-between w-full gap-10",
          "main-container py-10"
        )}
      >
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <motion.h1
            className={clsx(
              "font-bold mb-4 title-text",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-oxanium)",
            }}
          >
            BELPY
          </motion.h1>
          <motion.div
            animate={{
              y: [0, -32, 0, 32, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
            className="flex md:hidden mb-10 w-full md:w-1/2 justify-center md:justify-end relative z-20"
          >
            <Image
              src="/images/home/belp-cat-1.png"
              alt="Belp"
              width={320}
              height={380}
              className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[538px] h-auto"
              priority
            />
          </motion.div>
          <div className="sm:text-responsive-lg space-y-4">
            <p>
              Welcome to the world of Belpy a Web3-born feline brand built on
              cuteness, claw, and community.
            </p>
            <p>
              Belpy is more than just an NFT. With handcrafted, high-quality
              avatars and over 550 customizable traits, Belpy opens the door to
              an expanding universe of games, merchandise, digital collectibles,
              and playful storytelling.
            </p>
            <p>
              The internet might be full of chaos, but you’ll feel right at home
              with your new favorite cat companion.
            </p>
          </div>
        </div>
        <motion.div
          animate={{
            y: [0, -32, 0, 32, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
          className="hidden w-full md:w-1/2 md:flex justify-center md:justify-end relative z-20"
        >
          <Image
            src="/images/home/belp-cat-1.png"
            alt="Belp"
            width={320}
            height={380}
            className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[538px] h-auto"
            priority
          />
        </motion.div>
      </div>
      <RandomCloud />
    </div>
  );
};

export default BelpSection;
