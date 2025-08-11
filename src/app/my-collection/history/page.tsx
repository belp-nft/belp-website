"use client";

import BreadCrumbs from "@/components/Breadcrumb";
import { useRealNfts } from "@/hooks/useRealNfts";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const HistoryPage = () => {
  const { nfts, loading } = useRealNfts();
  const [visible, setVisible] = useState(10);

  const sortedNfts = [...nfts].sort((a, b) => {
    if (!a.mintedAt || !b.mintedAt) return 0;
    return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
  });

  const visibleNfts = sortedNfts.slice(0, visible);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f4ff] via-white to-[#f0e6ff]">
        <div className="text-center">
          {/* Simple History Icon */}
          <motion.div
            className="relative w-20 h-20 mx-auto mb-8"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
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
                  📋
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Clean text */}
          <motion.h2
            className="text-2xl font-bold text-[#2b1a5e] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Loading History
          </motion.h2>

          {/* Loading dots */}
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ede9f6] py-8">
      <div className="main-container">
        <BreadCrumbs
          breadcrumbs={[
            { href: "/my-collection", label: "My Collection" },
            { label: "History" },
          ]}
        />
        <motion.h1
          className={clsx(
            "font-bold mt-5 mb-10",
            "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight",
            "text-4xl sm:text-6xl md:text-7xl lg:text-[96px]"
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          History
        </motion.h1>

        <div className="bg-[#E3CEF6] p-5 rounded-4xl">
          {nfts.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No transaction history
              </h3>
              <p className="text-gray-600 mb-6">
                Start minting NFTs to see your transaction history!
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
                onClick={() => (window.location.href = "/mint")}
              >
                Start Minting
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* History Items */}
              {visibleNfts.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  className="bg-white rounded-xl p-4 border border-[#e9defd] hover:border-[#d8c7ff] transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Image */}
                    <div className="col-span-2">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#7a4bd6]">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* NFT Details */}
                    <div className="col-span-3">
                      <Link
                        href={`/my-collection/${nft.id}`}
                        className="text-[#2b1a5e] font-semibold hover:text-[#7a4bd6] transition-colors"
                      >
                        {nft.name}
                      </Link>
                      <div className="text-xs text-[#6c5a99] mt-1">
                        #{nft.id.slice(-8).toUpperCase()}
                      </div>
                    </div>

                    {/* Tx Hash */}
                    <div className="col-span-2">
                      {nft.mintSignature ? (
                        <a
                          href={`https://solscan.io/tx/${nft.mintSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7a4bd6] hover:underline text-sm font-mono"
                        >
                          {nft.mintSignature.slice(0, 8)}...
                          {nft.mintSignature.slice(-8)}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No signature
                        </span>
                      )}
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Mint
                      </span>
                    </div>

                    {/* Time */}
                    <div className="col-span-3">
                      <div className="text-sm text-[#6c5a99]">
                        {nft.mintedAt ? (
                          <>
                            <div>
                              {new Date(nft.mintedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs opacity-70">
                              {new Date(nft.mintedAt).toLocaleTimeString()}
                            </div>
                          </>
                        ) : (
                          "Unknown"
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More Button */}
              {visible < sortedNfts.length && (
                <div className="flex justify-center py-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-[#7A4BD6] font-semibold shadow-md hover:shadow-lg transition"
                    onClick={() =>
                      setVisible((v) => Math.min(v + 10, sortedNfts.length))
                    }
                  >
                    See more
                  </motion.button>
                </div>
              )}

              {/* Stats Footer */}
              <motion.div
                className="mt-8 p-4 bg-white rounded-xl border border-[#e9defd] text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="text-sm text-[#6c5a99]">
                  Total transactions:{" "}
                  <span className="font-semibold text-[#7a4bd6]">
                    {nfts.length}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
