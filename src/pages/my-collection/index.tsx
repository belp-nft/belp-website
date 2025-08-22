import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
import { useCandyMachineContext } from "@/providers/CandyMachineProvider";
import type { NFT } from "@/services/types";

interface SimpleNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: any[];
}
import NftGrid from "@/modules/my-collection//NftGrid";
import { useLoading } from "@/providers/LoadingProvider";
import { useCollectionAddress } from "@/stores/config";
import { useConfig } from "@/stores";
import { themeClasses } from "@/providers/ThemeProvider";

// Function to fetch metadata from NFT URI
const fetchNftMetadata = async (uri: string): Promise<any> => {
  try {
    console.log(`🔗 Fetching metadata from URI: ${uri}`);

    // Format IPFS URIs properly
    let formattedUri = uri;
    if (uri.startsWith("ipfs://")) {
      formattedUri = `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }

    console.log(`🔄 Formatted URI: ${formattedUri}`);

    const response = await fetch(formattedUri, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (response.ok) {
      const responseText = await response.text();
      if (responseText.trim()) {
        const metadata = JSON.parse(responseText);
        console.log(`✅ Metadata parsed successfully for URI`);
        return metadata;
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching metadata:`, error);
    return null;
  }
};

const MyCollectionPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);

  const { solAddress, loading, isWalletReady } = useWallet();

  const { loadWalletNfts, walletNfts, isLoadingNfts, metaplex } =
    useCandyMachineContext();

  const collectionAddress = useCollectionAddress();

  const items = walletNfts.slice(0, visible);
  const totalCount = walletNfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  useEffect(() => {
    // Initialize when component mounts
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && solAddress && isWalletReady && metaplex) {
      console.log(
        "🔍 Loading NFTs for address:",
        solAddress,
        "- Wallet is ready, Metaplex initialized"
      );
      console.log("📊 Current state:", {
        isLoadingNfts,
        walletNftsCount: walletNfts.length,
        metaplexReady: !!metaplex,
      });
      loadWalletNfts(solAddress);
    } else if (isInitialized && !solAddress && !loading) {
      console.log("⚠️ No wallet connected, clearing NFTs");
      setError(null);
    } else {
      console.log("⏳ Waiting for prerequisites:", {
        isInitialized,
        hasAddress: !!solAddress,
        isWalletReady,
        hasMetaplex: !!metaplex,
        loading,
      });
    }
  }, [solAddress, isInitialized, loading, isWalletReady, metaplex]);

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
        {!metaplex ? (
          <div className="text-center flex flex-col items-center pb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Initializing Metaplex...
              </h3>
              <p className="text-blue-600">
                Please wait while we setup the blockchain connection.
              </p>
            </div>
          </div>
        ) : isLoadingNfts ? (
          <div className="text-center flex flex-col items-center pb-12">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Loading NFTs...
              </h3>
              <p className="text-purple-600">
                Fetching your NFT collection from the blockchain.
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
                  solAddress && isWalletReady && loadWalletNfts(solAddress)
                }
                disabled={!isWalletReady || isLoadingNfts}
              >
                {isLoadingNfts ? "Loading..." : "Retry"}
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

            <NftGrid items={items as any} />

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
