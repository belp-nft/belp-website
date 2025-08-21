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
import { ApiCallHelper } from "@/hooks/wallet/apiCallHelper";

const MyCollectionPage = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const { solAddress, loading, isWalletReady, isAuthenticating } = useWallet();
  const { hideLoading, showLoading } = useLoading();

  const collectionAddress = useCollectionAddress();

  const items = nfts.slice(0, visible);
  const totalCount = nfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  const loadNfts = async (address: string) => {
    try {
      setError(null);
      showLoading(); // Show loading overlay

      // Check authentication before making API call
      if (!ApiCallHelper.canMakeAuthenticatedCall()) {
        console.warn("⚠️ Cannot load NFTs - authentication not ready");
        setError(
          "Authentication required. Please wait for wallet connection to complete."
        );
        return;
      }

      console.log("🔐 Loading NFTs with authentication check passed");
      const response = await ApiCallHelper.executeWithAuthCheck(
        () => NftService.getUserNfts(address),
        "Load User NFTs"
      );

      if (response && response.success) {
        setNfts(response.nfts || []);
      } else if (response === null) {
        // Authentication failed
        setError("Authentication failed. Please reconnect your wallet.");
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

  useEffect(() => {
    // Initialize when component mounts
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && solAddress && isWalletReady) {
      console.log(
        "🔍 Loading NFTs for address:",
        solAddress,
        "- Wallet is ready"
      );
      loadNfts(solAddress);
    } else if (isInitialized && solAddress && isAuthenticating) {
      console.log("🔄 Wallet is authenticating, waiting...", solAddress);
    } else if (isInitialized && !solAddress && !loading) {
      console.log("⚠️ No wallet connected, clearing NFTs");
      setNfts([]);
      setError(null);
    }
  }, [solAddress, isInitialized, loading, isWalletReady, isAuthenticating]);

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
        {isAuthenticating && solAddress ? (
          <div className="text-center flex flex-col items-center pb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Authenticating Wallet...
              </h3>
              <p className="text-blue-600">
                Please wait while we verify your wallet connection.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center flex flex-col items-center pb-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Collection
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  solAddress && isWalletReady && loadNfts(solAddress)
                }
                disabled={!isWalletReady || isAuthenticating}
              >
                {isAuthenticating ? "Authenticating..." : "Retry"}
              </motion.button>
            </div>
          </div>
        ) : totalCount === 0 ? (
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
