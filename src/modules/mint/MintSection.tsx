"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import CatGrid from "./CatGrid";

interface MintSectionProps {
  minted: number;
  supply: number;
  isMinting: boolean;
  mintSuccess: boolean;
  selectedCat: number | null;
  cats: string[];
  onMintClick: () => void;
}

const MintSection: React.FC<MintSectionProps> = ({
  minted,
  supply,
  isMinting,
  mintSuccess,
  selectedCat,
  cats,
  onMintClick,
}) => {
  const getScaleAndSize = (text: string) => {
    // Simplified to use consistent title-text class
    return {
      scale: 1,
      sizeClasses: "title-text",
    };
  };

  const mintText =
    minted !== null && supply !== null ? `${minted}/${supply}` : "—";

  const { scale, sizeClasses } = getScaleAndSize(mintText);
  return (
    <motion.div
      className="mt-8 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <img
          src="/gifs/cat-play-ball.gif"
          alt="Cat playing with ball"
          style={{ aspectRatio: "4/3" }}
        />
      </div>

      <motion.div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-4"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.p
          className="text-xl sm:text-2xl font-bold text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          Genesis Round
        </motion.p>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div
            className={clsx(
              "font-bold text-center",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
              "whitespace-nowrap transition-all duration-300",
              "mb-2",
              sizeClasses
            )}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center lg:left center",
            }}
          >
            {mintText}
          </div>
        </motion.div>

        <motion.button
          className={clsx(
            "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-bold py-3 px-8 rounded-2xl text-lg sm:text-xl w-full max-w-xs shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "cursor-pointer"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          whileHover={{ scale: isMinting ? 1 : 1.05 }}
          whileTap={{ scale: isMinting ? 1 : 0.95 }}
          onClick={onMintClick}
          disabled={isMinting}
        >
          {isMinting ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className={clsx(
                  "w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                )}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Minting...
            </div>
          ) : mintSuccess ? (
            "Minted Successfully! 🎉"
          ) : (
            "MINT BELPY"
          )}
        </motion.button>

        <CatGrid
          cats={cats}
          selectedCat={selectedCat}
          mintSuccess={mintSuccess}
        />

        <motion.p
          className={clsx("mt-3 text-xs sm:text-sm text-center lg:text-left")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
        >
          {mintSuccess && selectedCat !== null
            ? `🎉 Congratulations! You minted ${cats[selectedCat]
                .replace(".svg", "")
                .replace("token-nft-", "BELPY #")}!`
            : "These are example BELPY designs available in this round."}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default MintSection;
