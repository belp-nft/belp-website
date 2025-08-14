"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
import { NftService } from "@/services/nftService";
import type { NFT } from "@/services/types";
import NftGrid from "@/modules/my-collection//NftGrid";
import { useLoading } from "@/providers/LoadingProvider";
import { useCollectionAddress } from "@/stores/config";
import { themeClasses } from "@/providers/ThemeProvider";

const MyCollectionPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);
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

      try {
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
        hideLoading();
      }
    };

    loadNfts();
  }, [solAddress, showLoading, hideLoading]);

  return (
    <main className={clsx("min-h-screen", themeClasses.bg.page)}>
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

      <section className="main-container pt-5 md:pt-10 pb-20">
        {totalCount === 0 ? (
          <div className="text-center flex flex-col items-center pb-12">
            <Image
              src="/images/mint/random-cat.svg"
              width={200}
              height={200}
              alt="Random Cat"
              className="opacity-50"
            />

            <h3 className={clsx("text-xl font-semibold my-2")}>
              No NFTs in your collection yet
            </h3>
            <p className={clsx("mb-6")}>
              Collect your first BELPY and watch your gallery grow.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "px-6 py-3 font-semibold rounded-2xl cursor-pointer",
                themeClasses.button.gradient
              )}
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
                  className={clsx(
                    "px-8 py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition cursor-pointer",
                    themeClasses.button.accent
                  )}
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
