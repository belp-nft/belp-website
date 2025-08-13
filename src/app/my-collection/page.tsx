"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
import { NftService } from "@/services/nftService";
import type { NFT } from "@/services/types";
import NftGrid from "@/modules/my-collection//NftGrid";
import PageLoading from "@/components/PageLoading";
import {
  useCollectionAddress,
  useConfig,
  useConfigStore,
} from "@/stores/config";

const MyCollectionPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);
  const router = useRouter();

  const { solAddress } = useWallet();

  const collectionAddress = useCollectionAddress();

  const items = nfts.slice(0, visible);
  const totalCount = nfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  // Load NFTs từ service
  useEffect(() => {
    const loadNfts = async () => {
      if (!solAddress) {
        setNfts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🖼️ Loading NFTs for wallet:", solAddress);

        const response = await NftService.getUserNfts(solAddress);

        if (response.success) {
          setNfts(response.nfts || []);
          console.log("✅ NFTs loaded:", response.nfts?.length || 0);
        } else {
          setError("Failed to load NFTs");
          console.error("❌ Failed to load NFTs");
        }
      } catch (err) {
        console.error("❌ Error loading NFTs:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadNfts();
  }, [solAddress]);

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
          contract={collectionAddress || ""}
          walletAddress={solAddress || undefined}
          onHistoryClick={handleHistoryClick}
        />
      </section>

      <section className="main-container pt-10 pb-20">
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
              className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl cursor-pointer"
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
                  className="px-8 py-3 rounded-2xl bg-[#E9D9FF] text-primary-accent font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
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
