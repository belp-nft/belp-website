"use client";

import BreadCrumbs from "@/components/Breadcrumb";
import { useWallet } from "@/hooks/useWallet";
import { useCandyMachineContext } from "@/providers/CandyMachineProvider";
import { UserService } from "@/services/userService";
import { Transaction } from "@/services/types";
import { BLOCKCHAIN_CONFIG } from "@/services";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useLoading } from "@/providers/LoadingProvider";
import { useAuth } from "@/providers/AuthProvider";
import moment from "moment";

// Custom hook for real-time relative time
const useRealTimeAgo = (timestamp: string) => {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const past = new Date(timestamp);
      const diffMs = now.getTime() - past.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let newTimeAgo = "";
      if (diffDays > 0) {
        newTimeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      } else if (diffHours > 0) {
        newTimeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else if (diffMinutes > 0) {
        newTimeAgo = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      } else if (diffSeconds > 0) {
        newTimeAgo = `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`;
      } else {
        newTimeAgo = "Just now";
      }

      setTimeAgo(newTimeAgo);
    };

    // Update immediately
    updateTimeAgo();

    // Update every second
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
};

// Component for displaying real-time relative time
const TimeAgo = ({ timestamp }: { timestamp: string }) => {
  const timeAgo = useRealTimeAgo(timestamp);

  return <div className="text-xs text-gray-400">{timeAgo}</div>;
};

const HistoryPage = () => {
  const { solAddress } = useWallet();
  const {
    loadWalletNfts,
    loadMoreNfts,
    walletNfts,
    metaplex,
    isLoadingNfts,
    hasMoreNfts,
  } = useCandyMachineContext();

  const { showLoading, hideLoading } = useLoading();
  const { isAuthenticated } = useAuth();

  const [isLoadingMoreNfts, setIsLoadingMoreNfts] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Load transactions from API
  const loadTransactions = useCallback(async () => {
    if (!solAddress || !isAuthenticated) {
      console.warn("⚠️ Skipping transaction loading - not authenticated");
      return;
    }

    try {
      setIsLoadingTransactions(true);
      const response = await UserService.getTransactions();
      setTransactions(response.success && response.data ? response.data : []);
    } catch (error) {
      console.error("❌ Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [solAddress, isAuthenticated]);

  // Map wallet NFTs with transaction data
  const mapNftsWithTransactionData = () => {
    if (!walletNfts?.length || !transactions.length) return walletNfts || [];

    const walletTransactions = transactions.filter(
      (tx) => tx.walletAddress?.toLowerCase() === solAddress?.toLowerCase()
    );

    return walletNfts.map((walletNft, index) => {
      const matchingTransaction =
        walletTransactions[index] || walletTransactions[0];

      return matchingTransaction
        ? {
            ...walletNft,
            createdAt: matchingTransaction.createdAt,
            signature: matchingTransaction.transactionSignature,
            transactionId: matchingTransaction._id,
          }
        : walletNft;
    });
  };

  const openTokenOnSolscan = (tokenAddress: string) => {
    if (!tokenAddress) return;
    const isMainnet = BLOCKCHAIN_CONFIG.NETWORK === "mainnet";
    const url = `https://solscan.io/token/${tokenAddress}${isMainnet ? "" : "?cluster=devnet"}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    if (!solAddress || !metaplex || !isAuthenticated) {
      setTransactions([]);
      hideLoading();
      return;
    }

    showLoading();
    loadTransactions().finally(async () => {
      // Double-check authentication before loading transactions
      if (isMounted && solAddress && isAuthenticated) {
        await loadWalletNfts(solAddress);
      }
      if (isMounted) {
        hideLoading();
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [
    solAddress,
    metaplex,
    showLoading,
    hideLoading,
    isAuthenticated,
    loadTransactions,
  ]);

  const currentData = mapNftsWithTransactionData();

  return (
    <div className="min-h-screen bg-[#ede9f6] pt-10 pb-20">
      <div className="main-container">
        <BreadCrumbs
          breadcrumbs={[
            { href: "/my-collection", label: "My Collection" },
            { label: "History" },
          ]}
        />
        <div className="flex md:flex-row flex-col items-center justify-between my-5 gap-5">
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
        </div>

        <div className="bg-[#E3CEF6] p-5 rounded-4xl">
          {!metaplex || isLoadingTransactions ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {!metaplex
                  ? "Initializing Metaplex..."
                  : isLoadingTransactions
                    ? "Loading Transaction Data..."
                    : "Loading NFT History..."}
              </h3>
              <p className="text-blue-600">
                {!metaplex
                  ? "Please wait while we setup the blockchain connection."
                  : isLoadingTransactions
                    ? "Fetching transaction history from API..."
                    : "Fetching your NFT collection and transaction data..."}
              </p>
            </motion.div>
          ) : currentData?.length === 0 && !isLoadingNfts ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No NFTs found</h3>
              <p className="mb-6">
                Collect your first BELPY and watch your gallery grow.
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
              {/* History Items - Unified View with Transaction Column */}
              {currentData?.map((nft: any, index: number) => {
                return (
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
                      <div className="col-span-12 sm:col-span-1">
                        <div className="flex justify-center sm:justify-start">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#7a4bd6]">
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* NFT Details */}
                      <div className="col-span-12 sm:col-span-3 text-center sm:text-left">
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

                      {/* NFT Address */}
                      <div className="col-span-12 sm:col-span-2 text-center sm:text-left">
                        <div
                          className="text-sm text-[#6c5a99] font-mono cursor-pointer hover:text-[#7A4BD6] transition-colors"
                          onClick={() => openTokenOnSolscan(nft.id)}
                          title="View token on Solscan"
                        >
                          {nft.id.slice(0, 4)}...
                          {nft.id.slice(-4)}
                        </div>

                        <button
                          onClick={() => openTokenOnSolscan(nft.id)}
                          className="text-[#7a4bd6] hover:underline text-sm cursor-pointer"
                        >
                          View Token →
                        </button>
                      </div>

                      {/* Transaction Column - New Addition */}
                      <div className="col-span-12 sm:col-span-2 text-center sm:text-left">
                        {nft.signature ? (
                          <div className="space-y-1">
                            <div className="text-xs text-[#6c5a99] font-mono">
                              {nft.signature.slice(0, 6)}...
                              {nft.signature.slice(-6)}
                            </div>
                            <a
                              href={`https://solscan.io/tx/${nft.signature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#7a4bd6] hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              View Tx →
                            </a>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            No signature
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div className="col-span-12 sm:col-span-1 text-center sm:text-left">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          NFT
                        </span>
                      </div>

                      {/* Transaction Info */}
                      <div className="col-span-12 sm:col-span-2 text-center sm:text-left">
                        {(() => {
                          // Sử dụng timestamp đã được mapped (ưu tiên transaction createdAt)
                          const timestamp = nft.createdAt;

                          if (!timestamp) {
                            return <span className="text-gray-400">-</span>;
                          }

                          return (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-[#2DD4BF]">
                                {nft.signature ? "Minted" : "Created"}
                              </div>
                              <TimeAgo timestamp={timestamp} />
                              <div className="text-xs text-gray-400">
                                {moment(timestamp).format("MMM DD, YYYY HH:mm")}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Initial Loading States - Both NFT and Transaction loading */}
              {(isLoadingNfts || isLoadingTransactions) &&
                currentData?.length === 0 && (
                  <div className="flex justify-center py-6">
                    <div className="flex items-center space-x-2 text-[#7A4BD6]">
                      <div className="animate-spin w-5 h-5 border-2 border-[#7A4BD6] border-t-transparent rounded-full"></div>
                      <span className="font-medium">
                        {isLoadingNfts && isLoadingTransactions
                          ? "Loading NFTs and Transactions..."
                          : isLoadingNfts
                            ? "Loading NFTs..."
                            : "Loading Transactions..."}
                      </span>
                    </div>
                  </div>
                )}

              {/* View More Button - Only NFT pagination needed */}
              {hasMoreNfts && currentData && currentData.length > 0 && (
                <div className="flex justify-center py-6">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-[#7A4BD6] font-semibold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                    disabled={isLoadingMoreNfts || isLoadingTransactions}
                    onClick={async () => {
                      if (!solAddress || isLoadingMoreNfts) return;
                      setIsLoadingMoreNfts(true);
                      try {
                        await loadMoreNfts(solAddress);
                      } catch (error) {
                        console.error("❌ Failed to load more NFTs:", error);
                      } finally {
                        setIsLoadingMoreNfts(false);
                      }
                    }}
                  >
                    {isLoadingMoreNfts ? "⏳ Loading..." : "View More"}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
