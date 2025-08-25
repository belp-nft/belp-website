"use client";
import type { NFT } from "@/services/types";
import NftItem from "../NftItem";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  items: NFT[];
  isLoadingMore?: boolean;
};

export default function NftGrid({ items, isLoadingMore = false }: Props) {
  const previousCountRef = useRef(0);

  useEffect(() => {
    previousCountRef.current = items.length;
  }, [items.length]);

  return (
    <div
      className="
      grid gap-3 sm:gap-4
      grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5
    "
    >
      <AnimatePresence>
        {items.map((it, index) => {
          // Only animate new items
          const isNewItem = index >= previousCountRef.current;

          return (
            <motion.div
              key={`nft-item-${it.nftAddress}-${index}`}
              initial={isNewItem ? { opacity: 0, y: 20, scale: 0.9 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.4,
                delay: isNewItem ? (index - previousCountRef.current) * 0.1 : 0,
                ease: "easeOut",
              }}
              layout
            >
              <NftItem item={it} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Loading placeholders for new items - match NftItem structure */}
      {isLoadingMore && (
        <>
          {Array.from({ length: 10 }).map((_, index) => (
            <motion.div
              key={`loading-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="block w-full text-left rounded-xl p-2 sm:p-3 bg-white/80 backdrop-blur border border-[#eadffd]"
            >
              {/* Image skeleton */}
              <div className="relative rounded-lg overflow-hidden">
                <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>

              {/* Text skeleton */}
              <div className="mt-2 sm:mt-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                    <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
