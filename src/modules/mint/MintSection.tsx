"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import CatGrid from "./CatGrid";
import { useAuth } from "@/providers/AuthProvider";
import MintConnectButton from "@/components/Wallet/MintConnectButton";
import { useSettings } from "@/providers/SettingsProvider";
import { useWalletContext } from "@/providers/WalletProvider";

const cats = [
  "tokens/1.png",
  "tokens/2.png",
  "tokens/3.png",
  "tokens/4.png",
  "tokens/5.png",
];

interface MintSectionProps {
  minted: number;
  supply: number;
  isMinting: boolean;
  mintSuccess: boolean;
  selectedCat: number | null;
  onMintClick: () => void;
}

const MintSection: React.FC<MintSectionProps> = ({
  minted,
  supply,
  isMinting,
  mintSuccess,
  selectedCat,
  onMintClick,
}) => {
  const { isAuthenticated } = useAuth();
  const { solAddress, connectWallet } = useWalletContext();
  const { nftPricing, isLoadingPricing, pricingError } = useSettings();

  const getScaleAndSize = (text: string) => {
    // Simplified to use consistent title-text class
    return {
      scale: 1,
      sizeClasses: "title-text",
    };
  };

  const mintText =
    minted !== null && supply !== null ? `${minted}/${supply}` : "—";

  // Determine round type based on nftPricing
  const getRoundTitle = () => {
    if (isLoadingPricing) return "Loading...";
    if (pricingError) return "Genesis Round"; // Default fallback
    if (!nftPricing) return "Genesis Round"; // Default fallback

    return nftPricing.priceType === "genesis"
      ? "Genesis Round"
      : "General Round";
  };

  const { scale, sizeClasses } = getScaleAndSize(mintText);
  return (
    <motion.div
      className={clsx([
        "mt-8",
        "flex flex-col lg:flex-row",
        "items-center lg:items-stretch",
      ])}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <div className={clsx(["w-full", "lg:w-1/2", "relative"])}>
        <img
          src="/gifs/cat-play-ball.gif"
          alt="Cat playing with ball"
          width={1442}
          height={665}
          className={clsx([
            "lg:absolute lg:h-full w-auto",
            "lg:max-w-xl xl:max-w-none",
            "lg:top-1/2 lg:left-[10px] xl:left-[100px] 2xl:left-[200px]",
            "lg:-translate-y-1/2",
          ])}
        />
      </div>

      <motion.div
        className={clsx([
          "w-full lg:w-1/2",
          "flex flex-col items-center justify-center gap-4",
        ])}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.p
          className={clsx([
            "text-xl sm:text-2xl font-bold",
            "text-center lg:text-left",
          ])}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          {getRoundTitle()}
        </motion.p>

        <motion.div
          className={clsx(["w-full"])}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div
            className={clsx([
              "font-bold text-center",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
              "whitespace-nowrap transition-all duration-300",
              "mb-2",
              sizeClasses,
            ])}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center lg:left center",
            }}
          >
            {process.env.NODE_ENV === "development" ? mintText : "--"}
          </div>
        </motion.div>

        <motion.div
          className={clsx(["w-full", "max-w-xs"])}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          {isAuthenticated ? (
            <motion.button
              className={clsx([
                "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-bold py-3 px-8 rounded-2xl text-lg sm:text-xl w-full shadow-md",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "cursor-pointer",
              ])}
              whileHover={{ scale: isMinting ? 1 : 1.05 }}
              whileTap={{ scale: isMinting ? 1 : 0.95 }}
              onClick={onMintClick}
              disabled={isMinting || !solAddress}
            >
              {isMinting ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    className={clsx([
                      "w-4 h-4 border-2 border-white border-t-transparent rounded-full",
                    ])}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  Minting...
                </div>
              ) : mintSuccess ? (
                "Minted Successfully! 🎉"
              ) : solAddress ? (
                <>MINT BELPY</>
              ) : (
                <>Connect wallet to mint</>
              )}
            </motion.button>
          ) : (
            <MintConnectButton
              className={clsx(["!w-full", "py-3", "px-8"])}
              onConnected={(info) => console.log("Connected:", info)}
            />
          )}
        </motion.div>

        <CatGrid
          cats={cats}
          selectedCat={selectedCat}
          mintSuccess={mintSuccess}
        />

        <motion.p
          className={clsx([
            "mt-3",
            "text-xs sm:text-sm",
            "text-center lg:text-left",
          ])}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.4 }}
        >
          {mintSuccess && selectedCat !== null
            ? `🎉 Congratulations! You minted BELPY #${selectedCat}!`
            : "These are example BELPY designs available in this round."}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default MintSection;
