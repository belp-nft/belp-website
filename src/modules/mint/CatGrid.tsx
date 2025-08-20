"use client";

import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface CatGridProps {
  cats: string[];
  selectedCat: number | null;
  mintSuccess: boolean;
}

const CatGrid: React.FC<CatGridProps> = ({
  cats,
  selectedCat,
  mintSuccess,
}) => {
  return (
    <motion.div
      className={clsx(
        "flex gap-4 lg:gap-2 xl:gap-4 mt-8 flex-wrap justify-center lg:justify-start"
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.8 }}
    >
      {cats.map((src, i) => (
        <motion.div
          key={src + i}
          className={clsx(
            "rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-300 bg-white border shadow-sm",
            selectedCat === i && "border-[#F356FF] border-2 shadow-lg",
            selectedCat !== i && "border-[#e9defd]",
            mintSuccess && selectedCat === i && "ring-4 ring-[#F356FF]/30"
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
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{
            opacity: 1,
            scale: selectedCat === i ? 1.1 : 1,
            rotate: selectedCat === i ? 5 : 0,
          }}
          transition={{
            duration: 0.5,
            delay: 2 + i * 0.1,
            type: "spring",
            stiffness: 300,
          }}
          whileHover={{
            scale: selectedCat === i ? 1.1 : 1.05,
            rotate: selectedCat === i ? 5 : 2,
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={`/icons/${src}`}
            alt="token-nft"
            draggable={false}
            className="object-contain w-full h-full"
            style={{
              opacity: selectedCat === i ? 1 : 0.8,
              transition: "opacity .3s",
              minWidth: 95,
              maxWidth: 95,
              minHeight: 95,
              maxHeight: 95,
            }}
          />
          {mintSuccess && selectedCat === i && (
            <motion.div
              className={clsx(
                "absolute inset-0 bg-[#F356FF]/20 rounded-xl",
                "flex items-center justify-center"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                ✨
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CatGrid;
