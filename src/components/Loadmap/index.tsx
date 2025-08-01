"use client";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

const BELP_ICON_SIZE = 117;
const BELP_SMALL_ICON_SIZE = 96;
const GAMEPAD_ICON_SIZE = 140;
const STAR_ICON_SIZE = 120;

export default function Roadmap() {
  return (
    <section className="flex flex-col items-center py-14 w-full px-2 md:px-0 relative overflow-visible">
      {/* Heading */}
      <div className="mx-auto mb-7 max-w-4xl w-full text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className={clsx(
            "font-bold mb-4",
            "text-4xl sm:text-6xl md:text-7xl lg:text-[96px]",
            "bg-gradient-to-b from-[#8438CE] to-[#1C007C] bg-clip-text text-transparent leading-tight"
          )}
        >
          Loadmap
        </motion.h2>
        <div className="text-sm md:text-base font-semibold mt-2">
          The Expanding Belpy Universe
        </div>
        <div className="text-xs md:text-base mt-1 text-[#1C007C]">
          Belpy NFTs are your key to a growing Web3 ecosystem where digital
          culture meets real-world experiences.
        </div>
      </div>

      {/* Desktop Grid */}
      <div
        className={clsx(
          "hidden lg:grid w-full max-w-[1038px] mx-auto gap-3 relative"
        )}
        style={{
          gridTemplateAreas: `
            "belp gaming toys"
            "belp claw toys"
            "content content content"
          `,
        }}
      >
        {/* BELP coin icons */}
        <Image
          src="/icons/belp-coin.svg"
          alt="BELP Icon"
          width={BELP_ICON_SIZE}
          height={BELP_ICON_SIZE}
          className="absolute left-[-90px] bottom-[180px] z-30"
          draggable={false}
        />
        <Image
          src="/icons/small-belp-coin.svg"
          alt="BELP small Icon"
          width={BELP_SMALL_ICON_SIZE}
          height={BELP_SMALL_ICON_SIZE}
          className="absolute left-[-20px] bottom-[160px] z-30"
          draggable={false}
        />
        {/* Star icon */}
        <Image
          src="/icons/star.svg"
          alt="Star"
          width={STAR_ICON_SIZE}
          height={STAR_ICON_SIZE}
          className="absolute right-[-105px] top-[-48px] z-30"
          draggable={false}
        />

        {/* BELP Token */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className={clsx(
            "rounded-2xl flex flex-col justify-center items-center text-center px-9 py-8 shadow-lg bg-gradient-to-b from-[#E5CAFF] to-[#A39BFF] row-span-2"
          )}
          style={{
            gridArea: "belp",
            minWidth: 422,
            maxWidth: 422,
          }}
        >
          <span className="text-white font-bold mb-2 leading-tight text-[48px]">
            BELP Token
          </span>
          <p className="font-medium max-w-[260px]">
            The community currency for tipping, governance, exclusive drops, and
            staking rewards.
          </p>
        </motion.div>

        {/* Gaming */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className={clsx(
            "rounded-2xl flex flex-col items-start px-6 py-5 shadow-lg bg-gradient-to-b from-[#E5CAFF] to-[#A39BFF]"
          )}
          style={{
            gridArea: "gaming",
            minWidth: 336,
            maxWidth: 336,
          }}
        >
          <span className="font-medium">
            Lay-to-earn adventures with BELP rewards and evolving companions.
          </span>
          <p className="text-white font-bold mb-2 leading-tight text-[48px] text-end w-full mt-4">
            Gaming
          </p>
        </motion.div>

        {/* CLAW Chain */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className={clsx(
            "rounded-2xl flex flex-col justify-center items-start px-6 py-5 shadow-lg bg-gradient-to-b from-[#E5CAFF] to-[#A39BFF] relative"
          )}
          style={{
            gridArea: "claw",
            minWidth: 336,
            maxWidth: 336,
          }}
        >
          <span className="text-white font-bold mb-2 leading-tight text-[48px]">
            CLAW Chain
          </span>
          <p className="font-medium max-w-[260px] text-center">
            A fast, gas-efficient Layer 2 powering gaming, loyalty programs, and
            cross-IP collaboration.
          </p>
          <Image
            src="/icons/gamepad.svg"
            alt="Gamepad Icon"
            width={GAMEPAD_ICON_SIZE}
            height={GAMEPAD_ICON_SIZE}
            className="absolute -bottom-12 right-[-56px] z-20"
            draggable={false}
          />
        </motion.div>

        {/* Merchandise & Toys (dọc phải) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className={clsx(
            "rounded-2xl px-6 py-3 shadow-lg bg-gradient-to-b from-[#A39BFF] to-[#E5CAFF] row-span-2"
          )}
          style={{
            gridArea: "toys",
            minWidth: 280,
            maxWidth: 280,
          }}
        >
          <p className="font-medium mt-2 mb-3 max-w-[210px]">
            NFT-linked plushies, figurines, and apparel with on-chain perks.
          </p>
          <span
            className={clsx(
              "float-end text-white font-bold text-[48px] leading-none tracking-wide [writing-mode:vertical-rl] [text-orientation:mixed] whitespace-pre"
            )}
            style={{ letterSpacing: 2 }}
          >
            Merchandise{"\n"}& Toys
          </span>
        </motion.div>

        {/* Content & Media */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className={clsx(
            "rounded-2xl flex flex-col items-center justify-center px-9 py-5 shadow-lg bg-gradient-to-b from-[#A1B8FF] to-[#A39BFF] col-span-3"
          )}
          style={{
            gridArea: "content",
            minHeight: 90,
          }}
        >
          <span className="text-white font-bold text-[48px] mb-2">
            Content & Media
          </span>
          <p className="font-medium text-center">
            Animated shorts, comics, and meme campaigns shaped by the community.
          </p>
        </motion.div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-col w-full gap-5 mt-2 px-2">
        <div className="rounded-2xl p-5 flex flex-col shadow-lg bg-gradient-to-b from-[#E5CAFF] to-[#A39BFF]">
          <span className="text-white font-bold text-[38px] mb-2">
            BELP Token
          </span>
          <p className="font-medium">
            The community currency for tipping, governance, exclusive drops, and
            staking rewards.
          </p>
        </div>
        <div className="rounded-2xl p-5 flex flex-col shadow-lg bg-gradient-to-b from-[#DAF4FF] to-[#A39BFF] relative">
          <span className="text-white font-bold text-[38px] mb-2">
            CLAW Chain
          </span>
          <p className="font-medium">
            A fast, gas-efficient Layer 2 powering gaming, loyalty programs, and
            cross-IP collaboration.
          </p>
        </div>
        <div className="rounded-2xl p-5 flex flex-col shadow-lg bg-gradient-to-b from-[#E5CAFF] to-[#A2C6F8]">
          <span className="text-white font-bold text-[38px] mb-2">Gaming</span>
          <p className="font-medium">
            Lay-to-earn adventures with BELP rewards and evolving companions.
          </p>
        </div>
        <div className="rounded-2xl p-5 flex flex-col shadow-lg bg-gradient-to-b from-[#A39BFF] to-[#E5CAFF] relative">
          <span className="text-white font-bold text-[38px] mb-2">
            Merchandise & Toys
          </span>
          <p className="font-medium">
            NFT-linked plushies, figurines, and apparel with on-chain perks.
          </p>
        </div>
        <div className="rounded-2xl p-5 flex flex-col shadow-lg bg-gradient-to-b from-[#A1B8FF] to-[#A39BFF] items-center">
          <span className="text-white font-bold text-[38px] mb-2">
            Content & Media
          </span>
          <p className="font-medium text-base text-center">
            Animated shorts, comics, and meme campaigns shaped by the community.
          </p>
        </div>
      </div>
    </section>
  );
}
