import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import UserInfo from "@/modules/my-collection/UserInfo";
import { useWallet } from "@/hooks/useWallet";
import { NftService } from "@/services/nftService";
import type { NFT } from "@/services/types";
import NftGrid from "@/modules/my-collection/NftGrid";
import { useLoading } from "@/providers/LoadingProvider";
import { useCollectionAddress } from "@/stores/config";
import { themeClasses } from "@/providers/ThemeProvider";

interface MyCollectionPageProps {
  initialNfts?: NFT[];
  error?: string;
}

const MyCollectionPage = ({
  initialNfts = [],
  error: serverError,
}: MyCollectionPageProps) => {
  const [nfts, setNfts] = useState<NFT[]>(initialNfts);
  const [error, setError] = useState<string | null>(serverError || null);
  const [visible, setVisible] = useState(20);
  const router = useRouter();

  const { solAddress } = useWallet();
  const { showLoading, hideLoading } = useLoading();
  const collectionAddress = useCollectionAddress();

  const items = nfts.slice(0, visible);
  const totalCount = nfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  useEffect(() => {
    const loadNfts = async () => {
      if (!solAddress) {
        return;
      }

      // Only fetch if we don't have initial data or wallet changed
      if (nfts.length === 0) {
        try {
          setError(null);
          showLoading();

          const response = await NftService.getUserNfts(solAddress);

          if (response.success) {
            setNfts(response.nfts || []);
          } else {
            setError("Failed to load NFTs");
            console.error("❌ Failed to load NFTs");
          }
        } catch (error) {
          setError("Failed to load NFTs");
          console.error("❌ Error loading NFTs:", error);
        } finally {
          hideLoading();
        }
      }
    };

    loadNfts();
  }, [solAddress, showLoading, hideLoading]);

  if (!solAddress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2ecf6] p-8">
        <div className="text-6xl mb-4">👛</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Please connect your wallet to view your NFT collection.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2ecf6]">
      <div className="main-container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <UserInfo contract={collectionAddress || ""} />

          <div className="mt-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">My Collection</h1>
            <button
              onClick={handleHistoryClick}
              className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl hover:scale-105 transition-transform"
            >
              View History
            </button>
          </div>

          {error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Error Loading NFTs
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
              >
                Try Again
              </button>
            </div>
          ) : totalCount === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                No NFTs Found
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have any NFTs in your collection yet.
              </p>
              <button
                onClick={() => router.push("/mint")}
                className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
              >
                Mint Your First NFT
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 text-gray-600">
                Showing {items.length} of {totalCount} NFTs
              </div>

              <NftGrid items={items} />

              {visible < totalCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setVisible((prev) => prev + 20)}
                    className="px-8 py-3 bg-white border-2 border-[#F356FF] text-[#F356FF] font-semibold rounded-2xl hover:bg-[#F356FF] hover:text-white transition-colors"
                  >
                    Load More ({totalCount - visible} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // You could potentially get wallet address from query params or cookies
    // and pre-fetch NFTs on the server side
    const { walletAddress } = context.query;

    if (walletAddress && typeof walletAddress === "string") {
      try {
        const response = await NftService.getUserNfts(walletAddress);

        if (response.success) {
          return {
            props: {
              initialNfts: response.nfts || [],
            },
          };
        }
      } catch (error) {
        console.error("Error fetching NFTs on server:", error);
      }
    }

    return {
      props: {
        initialNfts: [],
      },
    };
  } catch (error) {
    console.error("Error in my-collection getServerSideProps:", error);

    return {
      props: {
        initialNfts: [],
        error: "Failed to load collection data",
      },
    };
  }
};

export default MyCollectionPage;
