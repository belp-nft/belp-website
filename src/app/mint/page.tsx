"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

const cats = [
  "token-nft-1.svg",
  "token-nft-2.svg",
  "token-nft-3.svg",
  "token-nft-4.svg",
];

const BelpyMintPage = () => {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <h1
        className={clsx(
          "font-bold text-center",
          "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
          "text-4xl sm:text-6xl md:text-7xl lg:text-[96px]"
        )}
      >
        Get your BELPY
      </h1>
      <p className="text-center mt-2 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
        The first limited collection of unique NFT tokens, where cats are
        colonizing Mars and giving their owners a chance to be a part of the
        adventure.
      </p>

      <div className="mt-8 flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12">
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <video
            src="/videos/cat-play-ball.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full max-w-[420px] rounded-2xl object-contain shadow-lg"
            style={{ aspectRatio: "4/3" }}
          />
        </div>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          <p className="text-xl sm:text-2xl font-bold text-center lg:text-left">
            Genesis Round
          </p>
          <p
            className={clsx(
              "font-bold text-center lg:text-left",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
              "text-5xl sm:text-6xl md:text-7xl lg:text-[94px]"
            )}
          >
            1/1,000
          </p>
          <button className="bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-bold py-3 px-8 rounded-2xl text-lg sm:text-xl mt-2 w-full max-w-xs shadow-md">
            MINT BELPY
          </button>

          <div className="flex gap-4 mt-8 flex-wrap justify-center lg:justify-start">
            {cats.map((src, i) => (
              <div
                key={src + i}
                className={clsx(
                  "rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 bg-white border border-[#e9defd] shadow-sm"
                )}
                style={{
                  minWidth: 95,
                  maxWidth: 95,
                  minHeight: 95,
                  maxHeight: 95,
                  width: 95,
                  height: 95,
                  flex: "0 0 95px",
                }}
              >
                <img
                  src={`/icons/${src}`}
                  alt="token-nft"
                  draggable={false}
                  className="object-contain w-full h-full"
                  style={{
                    opacity: 1,
                    transition: "opacity .3s",
                    minWidth: 95,
                    maxWidth: 95,
                    minHeight: 95,
                    maxHeight: 95,
                  }}
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs sm:text-sm text-center lg:text-left">
            These are example BELPY designs available in this round.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BelpyMintPage;
