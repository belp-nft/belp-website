"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface MintHeaderProps {
  title?: string;
  description?: string;
}

const MintHeader: React.FC<MintHeaderProps> = ({
  title = "Get your BELPY",
  description = "The first limited collection of unique NFT tokens, where cats are colonizing Mars and giving their owners a chance to be a part of the adventure.",
}) => {
  return (
    <>
      <motion.h1
        className={clsx(
          "font-bold text-center title-text",
          "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        {title}
      </motion.h1>
      <motion.p
        className="text-center mt-2 text-base sm:text-lg md:text-xl small-text-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {description}
      </motion.p>
    </>
  );
};

export default MintHeader;
