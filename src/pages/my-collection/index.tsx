import { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import UserInfo from "@/modules/my-collection//UserInfo";
import { useWallet } from "@/hooks/useWallet";
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
  const [nfts, setNfts] = useState<SimpleNFT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);
  const router = useRouter();

  const { solAddress, loading, isWalletReady } = useWallet();
  const { hideLoading, showLoading } = useLoading();
  const configData = useConfig();

  const collectionAddress = useCollectionAddress();

  const items = nfts.slice(0, visible);
  const totalCount = nfts.length;

  const handleHistoryClick = () => {
    router.push("/my-collection/history");
  };

  // Initialize Metaplex
  useEffect(() => {
    const initMetaplex = async () => {
      try {
        const connection = new Connection(
          configData?.rpcUrl || "https://api.devnet.solana.com",
          "confirmed"
        );

        const metaplexInstance = new Metaplex(connection);
        setMetaplex(metaplexInstance);
        console.log("✅ Metaplex initialized successfully");
      } catch (err) {
        console.error("❌ Failed to initialize Metaplex:", err);
        setError(`Failed to initialize Metaplex: ${err}`);
      }
    };

    initMetaplex();
  }, [configData?.rpcUrl]);

  const loadWalletNfts = async (address: string) => {
    if (!metaplex) {
      setError("Metaplex not initialized");
      return;
    }

    try {
      setError(null);
      showLoading();

      console.log("� Fetching NFTs for wallet:", address);

      const walletKey = new PublicKey(address);

      // Get all NFTs owned by wallet
      const allNfts = await metaplex.nfts().findAllByOwner({
        owner: walletKey,
      });

      const filteredNfts = allNfts.filter(
        (nft: any) =>
          nft.collection &&
          nft.collection.verified &&
          nft.collection.address.toString() === collectionAddress
      );

      const processedNfts: SimpleNFT[] = await Promise.all(
        filteredNfts.map(async (nft: any, index: number) => {
          try {
            console.log(
              `📄 Processing NFT ${index + 1}/${filteredNfts.length}: ${nft.name || "Unnamed"}`
            );

            let metadata = null;
            if (nft.uri) {
              metadata = await fetchNftMetadata(nft.uri);
            }

            let imageUrl =
              "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF";

            if (metadata?.image) {
              if (metadata.image.startsWith("ipfs://")) {
                imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
              } else if (metadata.image.startsWith("http")) {
                imageUrl = metadata.image;
              } else {
                imageUrl = `https://ipfs.io/ipfs/${metadata.image}`;
              }
            }

            return {
              id: nft.address.toString(),
              name: metadata?.name || nft.name || `NFT #${index + 1}`,
              description: metadata?.description || "No description available",
              image: imageUrl,
              attributes: metadata?.attributes || [],
            };
          } catch (nftError) {
            console.error(`❌ Error processing NFT ${index}:`, nftError);

            // Use fallback image for error case
            const fallbackImage =
              "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF";

            return {
              id: nft.address?.toString() || `error-${index}`,
              name: `Error NFT #${index + 1}`,
              description: "Failed to process this NFT",
              image: fallbackImage,
              attributes: [],
            };
          }
        })
      );

      setNfts(processedNfts);
      console.log("✅ Successfully processed NFTs:", processedNfts.length);
    } catch (err) {
      console.error("❌ Error loading wallet NFTs:", err);
      setError(err instanceof Error ? err.message : String(err));
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
    if (isInitialized && solAddress && isWalletReady && metaplex) {
      console.log(
        "🔍 Loading NFTs for address:",
        solAddress,
        "- Wallet is ready, Metaplex initialized"
      );
      loadWalletNfts(solAddress);
    } else if (isInitialized && !solAddress && !loading) {
      console.log("⚠️ No wallet connected, clearing NFTs");
      setNfts([]);
      setError(null);
    }
  }, [solAddress, isInitialized, loading, isWalletReady, metaplex]);

  // Force reload NFTs when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (solAddress && isWalletReady && metaplex && isInitialized) {
        console.log("🔄 Page focused, reloading NFTs...");
        loadWalletNfts(solAddress);
      }
    };

    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        solAddress &&
        isWalletReady &&
        metaplex &&
        isInitialized
      ) {
        console.log("🔄 Page visible again, reloading NFTs...");
        loadWalletNfts(solAddress);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [solAddress, isWalletReady, metaplex, isInitialized]);

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
                disabled={!isWalletReady}
              >
                Retry
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
