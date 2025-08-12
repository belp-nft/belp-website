"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
import { useRealNfts } from "@/hooks/useRealNfts";
import NftGrid from "@/modules/my-collection//NftGrid";

const MyCollectionPage = () => {
  const { nfts, loading, totalCount } = useRealNfts();
  const [visible, setVisible] = useState(20);
  const router = useRouter();

  const items = nfts.slice(0, visible);

  const { solAddress } = useWallet();

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f4ff] via-white to-[#f0e6ff]">
        <div className="text-center">
          {/* Modern NFT Loading Icon */}
          <motion.div
            className="relative w-20 h-20 mx-auto mb-8"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#F356FF] to-[#AE4DCE] p-1">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                <motion.span
                  className="text-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🎨
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Clean Loading Text */}
          <motion.h2
            className="text-2xl font-bold text-primary-text mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Loading Collection
          </motion.h2>

          {/* Elegant Loading Dots */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#7A4BD6] rounded-full"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <section className="relative w-full h-[414px] overflow-hidden">
        <Image
          src="/images/my-collection/collection-banner.png"
          alt="banner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/60 pointer-events-none z-0" />
      </section>

      <section className="main-container mt-4">
        <UserInfo
          contract="sm6LqSRQLkM29bMqct9QBRX5HZMEXYgELgwCXpump"
          walletAddress={solAddress || undefined}
          onHistoryClick={handleHistoryClick}
        />
      </section>

      <section className="main-container mt-6">
        {totalCount === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No NFTs in your collection yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start minting some BELPY NFTs to see them here!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
              onClick={() => (window.location.href = "/mint")}
            >
              Mint Your First BELPY
            </motion.button>
          </div>
        ) : (
          <>
            <div className="text-right text-xs text-primary-muted mb-2">
              {totalCount} Items
            </div>

            <NftGrid items={items} />

            {visible < totalCount && (
              <div className="flex justify-center py-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-primary-accent font-semibold shadow-md hover:shadow-lg transition"
                  onClick={() =>
                    setVisible((v) => Math.min(v + 20, totalCount))
                  }
                >
                  See more
                </motion.button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default MyCollectionPage;
