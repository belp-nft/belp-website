"use client";
import { motion } from "framer-motion";
import type { NFT } from "@/services/types";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";

export default function NftItem({ item }: { item: NFT }) {
  return (
    <Link href={`/my-collection/${item.nftAddress}`}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={[
          "block w-full text-left rounded-xl p-2 sm:p-3 bg-white/80 backdrop-blur border border-[#eadffd] hover:border-[#d8c7ff] cursor-pointer",
        ].join(" ")}
      >
        <div className="relative rounded-lg overflow-hidden">
          <OptimizedImage
            src={item.imageUrl || "/file.svg"}
            alt={item.name}
            width={480}
            height={480}
            className="w-full aspect-square object-cover rounded-lg"
            unoptimized
            fallback="/file.svg"
            priority={false}
          />
        </div>

        <div className="mt-2 sm:mt-3">
          <div className="text-[#2b1a5e] font-semibold text-sm sm:text-[15px]">
            {item.name}
          </div>
          <div className="flex items-center justify-between text-xs text-[#6c5a99] mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#7a4bd6]" />
              NFT
            </span>
            <span className="opacity-60">{item.nftAddress.slice(-4)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
