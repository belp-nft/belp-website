"use client";

import BreadCrumbs from "@/components/Breadcrumb";
import { useWallet } from "@/hooks/useWallet";
import { UserService } from "@/services/userService";
import { NftService } from "@/services/nftService";
import type { NFT, Transaction } from "@/services/types";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const HistoryPage = () => {
  const { solAddress, userStatistics } = useWallet();
  const [backendNfts, setBackendNfts] = useState<NFT[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(10);
  const [showTransactions, setShowTransactions] = useState(false);

  // Load NFTs từ backend
  const loadBackendNfts = async () => {
    if (!solAddress) return;

    try {
      setSyncing(true);
      setError(null);

      console.log("🖼️ Loading backend NFTs for:", solAddress);

      const response = await NftService.getUserNfts(solAddress);

      if (response.success && response.nfts) {
        setBackendNfts(response.nfts);
        console.log("✅ Backend NFTs loaded:", response.nfts.length);
      } else {
        console.warn("⚠️ Failed to load backend NFTs");
        setError("Failed to load NFTs");
      }
    } catch (err) {
      console.error("❌ Error loading backend NFTs:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSyncing(false);
    }
  };

  // Load transactions từ backend
  const loadTransactions = async () => {
    if (!solAddress) return;

    try {
      setSyncing(true);
      setError(null);

      console.log("📜 Loading transactions for:", solAddress);

      const response = await UserService.getTransactions(solAddress);

      if (response.success && response.data) {
        setTransactions(response.data);
        console.log("✅ Transactions loaded:", response.data.length);
      } else {
        console.warn("⚠️ Failed to load transactions:", response.message);
        setError(response.message || "Failed to load transactions");
      }
    } catch (err) {
      console.error("❌ Error loading transactions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSyncing(false);
    }
  };

  // Auto-refresh backend data khi có wallet address
  useEffect(() => {
    if (solAddress) {
      setLoading(true);
      Promise.all([loadBackendNfts(), loadTransactions()]).finally(() => {
        setLoading(false);
      });
    } else {
      // Reset data khi không có wallet
      setBackendNfts([]);
      setTransactions([]);
      setError(null);
    }
  }, [solAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chọn data source để hiển thị
  let dataSource, sortedData;

  if (showTransactions) {
    // Hiển thị transaction history
    dataSource = transactions || [];
    sortedData = [...dataSource].sort((a, b) => {
      const dateA = a.createdAt || a.timestamp;
      const dateB = b.createdAt || b.timestamp;

      if (!dateA || !dateB) return 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  } else {
    // Hiển thị NFTs từ backend
    dataSource = backendNfts || [];
    sortedData = [...dataSource].sort((a, b) => {
      const dateA = a.createdAt;
      const dateB = b.createdAt;

      if (!dateA || !dateB) return 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  const visibleData = sortedData.slice(0, visible);

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
        <div className="flex items-center justify-between mt-5 mb-10">
          <motion.h1
            className={clsx(
              "font-bold title-text",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            History
          </motion.h1>

          {/* Data Source Toggle */}
          {solAddress && (
            <div className="flex items-center gap-4">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-[#e9defd]">
                <button
                  onClick={() => setShowTransactions(false)}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
                    !showTransactions
                      ? "bg-gradient-to-r from-[#F356FF] to-[#AE4DCE] text-white shadow-sm"
                      : "text-[#7A4BD6] hover:bg-[#f8f4ff]"
                  )}
                >
                  NFTs ({backendNfts.length})
                </button>
                <button
                  onClick={() => setShowTransactions(true)}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
                    showTransactions
                      ? "bg-gradient-to-r from-[#F356FF] to-[#AE4DCE] text-white shadow-sm"
                      : "text-[#7A4BD6] hover:bg-[#f8f4ff]"
                  )}
                >
                  Transactions ({transactions?.length || 0})
                </button>
              </div>

              {syncing && (
                <div className="flex items-center gap-2 text-[#7A4BD6] text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-[#7A4BD6] border-t-transparent rounded-full"></div>
                  Syncing...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-[#E3CEF6] p-5 rounded-4xl">
          {dataSource.length === 0 ? (
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
              {visibleData.map((item, index) => {
                if (showTransactions) {
                  // Hiển thị transaction item - item là Transaction type
                  const transaction = item as Transaction;
                  return (
                    <motion.div
                      key={transaction._id}
                      className="bg-white rounded-xl p-4 border border-[#e9defd] hover:border-[#d8c7ff] transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Transaction Icon */}
                        <div className="col-span-2">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#7a4bd6] bg-gradient-to-r from-[#F356FF] to-[#AE4DCE] flex items-center justify-center">
                            <span className="text-white text-lg">📄</span>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div className="col-span-3">
                          <div className="text-[#2b1a5e] font-semibold">
                            Transaction
                          </div>
                          <div className="text-xs text-[#6c5a99] mt-1">
                            {transaction.transactionSignature?.slice(0, 8)}...
                            {transaction.transactionSignature?.slice(-8)}
                          </div>
                        </div>

                        {/* Candy Machine */}
                        <div className="col-span-2">
                          <div className="text-sm text-[#6c5a99] font-mono">
                            {transaction.candyMachineAddress?.slice(0, 4)}...
                            {transaction.candyMachineAddress?.slice(-4)}
                          </div>
                        </div>

                        {/* Tx Hash Link */}
                        <div className="col-span-2">
                          <a
                            href={`https://solscan.io/tx/${transaction.transactionSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7a4bd6] hover:underline text-sm font-mono"
                          >
                            View →
                          </a>
                        </div>

                        {/* Type */}
                        <div className="col-span-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Transaction
                          </span>
                        </div>

                        {/* Time */}
                        <div className="col-span-1">
                          <div className="text-sm text-[#6c5a99]">
                            {transaction.createdAt || transaction.timestamp ? (
                              <>
                                <div>
                                  {new Date(
                                    transaction.createdAt ||
                                      transaction.timestamp
                                  ).toLocaleDateString()}
                                </div>
                                <div className="text-xs opacity-70">
                                  {new Date(
                                    transaction.createdAt ||
                                      transaction.timestamp
                                  ).toLocaleTimeString()}
                                </div>
                              </>
                            ) : (
                              "Unknown"
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                } else {
                  // Hiển thị NFT item từ backend
                  const nft = item as NFT;

                  return (
                    <motion.div
                      key={nft._id}
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
                              src={nft.imageUrl}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* NFT Details */}
                        <div className="col-span-3">
                          <Link
                            href={`/my-collection/${nft.nftAddress}`}
                            className="text-[#2b1a5e] font-semibold hover:text-[#7a4bd6] transition-colors"
                          >
                            {nft.name}
                          </Link>
                          <div className="text-xs text-[#6c5a99] mt-1">
                            #{nft.nftAddress.slice(-8).toUpperCase()}
                          </div>
                        </div>

                        {/* NFT Address */}
                        <div className="col-span-2">
                          <div className="text-sm text-[#6c5a99] font-mono">
                            {nft.nftAddress.slice(0, 4)}...
                            {nft.nftAddress.slice(-4)}
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            NFT
                          </span>
                        </div>

                        {/* Time */}
                        <div className="col-span-3">
                          <div className="text-sm text-[#6c5a99]">
                            <div>
                              {new Date(nft.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs opacity-70">
                              {new Date(nft.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
              })}

              {/* Load More Button */}
              {visible < sortedData.length && (
                <div className="flex justify-center py-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-[#7A4BD6] font-semibold shadow-md hover:shadow-lg transition"
                    onClick={() =>
                      setVisible((v) => Math.min(v + 10, sortedData.length))
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
                  Total {showTransactions ? "transactions" : "NFTs"}:{" "}
                  <span className="font-semibold text-[#7a4bd6]">
                    {dataSource.length}
                  </span>
                  {solAddress && (
                    <>
                      <span className="mx-2">•</span>
                      Wallet:{" "}
                      <span className="font-mono text-xs">
                        {solAddress.slice(0, 4)}...{solAddress.slice(-4)}
                      </span>
                    </>
                  )}
                  {userStatistics && (
                    <>
                      <span className="mx-2">•</span>
                      Total NFTs:{" "}
                      <span className="font-semibold text-[#7a4bd6]">
                        {userStatistics.totalNfts || 0}
                      </span>
                      <span className="mx-2">•</span>
                      Total Transactions:{" "}
                      <span className="font-semibold text-[#7a4bd6]">
                        {userStatistics.totalTransactions || 0}
                      </span>
                    </>
                  )}
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
