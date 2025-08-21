import React, { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { useConfig } from "@/stores";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { themeClasses } from "@/providers/ThemeProvider";

interface NFTData {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  image?: string | null;
  uri?: string | null;
  owner: string;
  collection?: {
    address: string;
    name: string;
    verified: boolean;
  };
  attributes?: any[];
  creators?: any[];
  sellerFeeBasisPoints?: number;
  rawNft?: any;
}

const fetchNftMetadata = async (uri: string): Promise<any> => {
  try {
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
      console.log(`📝 Response length: ${responseText.length} characters`);

      if (responseText.trim()) {
        const metadata = JSON.parse(responseText);
        console.log(`✅ Metadata parsed successfully:`, metadata);
        return metadata;
      } else {
        console.warn(`⚠️ Empty response from ${formattedUri}`);
        return null;
      }
    } else {
      const errorText = await response.text();
      console.warn(
        `⚠️ HTTP error ${response.status}:`,
        errorText.substring(0, 100)
      );
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching metadata from ${uri}:`, error);
    return null;
  }
};

const TestCollectionPage = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  console.log("🚀 ~ TestCollectionPage ~ nfts:", nfts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState(
    "71bczjoaeoNVrV7uiBCybx5MyTcdL9SPojDei7ug7vJ7"
  );

  const configData = useConfig();

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

  const loadWalletNfts = async () => {
    if (!metaplex) {
      setError("Metaplex not initialized");
      return;
    }

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log("🔍 Fetching NFTs for wallet:", walletAddress);

      const walletKey = new PublicKey(walletAddress);

      // Get all NFTs owned by wallet
      const allNfts = await metaplex.nfts().findAllByOwner({
        owner: walletKey,
      });

      const filteredNfts = allNfts.filter(
        (nft: any) =>
          nft.collection &&
          nft.collection.verified &&
          nft.collection.address ==
            "3C4VFXpwbJ73YdDMN3JKN9ZoNQs62ZXnjabMo1ABtHDc"
      );

      // Store debug info
      setDebugInfo({
        walletAddress,
        totalNfts: filteredNfts.length,
        sampleNfts: filteredNfts.slice(0, 3).map((nft) => ({
          address: nft.address.toString(),
          name: nft.name,
          symbol: nft.symbol,
          uri: nft.uri,
          collection: nft.collection
            ? {
                address: nft.collection.address.toString(),
                verified: nft.collection.verified,
              }
            : null,
        })),
      });

      // Process NFTs with metadata
      const processedNfts: NFTData[] = await Promise.all(
        filteredNfts.slice(0, 50).map(async (nft: any, index: number) => {
          try {
            console.log(
              `📄 Processing NFT ${index + 1}/${Math.min(filteredNfts.length, 50)}: ${nft.name || "Unnamed"}`
            );

            let metadata = null;
            if (nft.uri) {
              metadata = await fetchNftMetadata(nft.uri);
            }

            console.log(metadata, "metadata");

            // Get image URL from metadata, not from nft.uri
            let imageUrl =
              "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF"; // fallback

            if (metadata?.image) {
              if (metadata.image.startsWith("ipfs://")) {
                imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
              } else if (metadata.image.startsWith("http")) {
                imageUrl = metadata.image;
              } else {
                // Might be a direct IPFS hash
                imageUrl = `https://ipfs.io/ipfs/${metadata.image}`;
              }
              console.log(
                `🖼️ Image URL from metadata: ${metadata.image} → ${imageUrl}`
              );
            } else {
              console.warn(`⚠️ No image found in metadata for ${nft.name}`);
            }

            return {
              id: nft.address.toString(),
              name:
                metadata?.name || `BELPY #${nft.name}` || `NFT #${index + 1}`,
              symbol: nft.symbol || metadata?.symbol || "",
              description: metadata?.description || "No description available",
              image: imageUrl,
              uri: nft.uri || null,
              owner: walletAddress,
              collection: nft.collection
                ? {
                    address: nft.collection.address.toString(),
                    name: "Collection",
                    verified: nft.collection.verified || false,
                  }
                : undefined,
              attributes: metadata?.attributes || [],
              creators: nft.creators || [],
              sellerFeeBasisPoints: nft.sellerFeeBasisPoints || 0,
              rawNft: {
                address: nft.address.toString(),
                name: nft.name,
                symbol: nft.symbol,
                uri: nft.uri,
                mint: nft.mint?.toString(),
                updateAuthority: nft.updateAuthority?.toString(),
                primarySaleHappened: nft.primarySaleHappened,
                isMutable: nft.isMutable,
              },
            };
          } catch (nftError) {
            console.error(`❌ Error processing NFT ${index}:`, nftError);
            return {
              id: nft.address?.toString() || `error-${index}`,
              name: `Error NFT #${index + 1}`,
              description: "Failed to process this NFT",
              image: null,
              uri: nft.uri || null,
              owner: walletAddress,
              attributes: [],
              creators: [],
              sellerFeeBasisPoints: 0,
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
      setLoading(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="font-bold title-text bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight">
            🎨 NFT Test Collection
          </h1>

          {/* Wallet Input */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="px-3 py-2 border border-[#e9defd] rounded-lg text-sm font-mono max-w-[300px]"
              placeholder="Enter wallet address..."
            />
            <button
              onClick={loadWalletNfts}
              disabled={loading || !metaplex || !walletAddress}
              className={clsx(
                "px-4 py-2 rounded-lg font-semibold transition cursor-pointer",
                loading || !metaplex || !walletAddress
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#F356FF] to-[#AE4DCE] text-white hover:shadow-lg"
              )}
            >
              {loading ? "🔄 Loading..." : "🔍 Load NFTs"}
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📊 Wallet Info</h3>
            <div className="text-sm text-blue-700">
              <div>
                <strong>Total NFTs:</strong> {debugInfo.totalNfts}
              </div>
              <div>
                <strong>Displayed:</strong> {Math.min(debugInfo.totalNfts, 50)}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </section>

      <section className="main-container pt-5 md:pt-10 pb-20">
        {loading ? (
          <div className="text-center flex flex-col items-center pb-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Loading NFTs...
              </h3>
              <p className="text-blue-600">
                Please wait while we fetch NFT data from the blockchain.
              </p>
            </div>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center flex flex-col items-center pb-12">
            <Image
              src="/images/mint/random-cat.svg"
              width={200}
              height={200}
              alt="Random Cat"
              className="opacity-50"
            />
            <h3 className="text-xl font-semibold my-2">
              No NFTs found in this wallet
            </h3>
            <p className="mb-6">
              Enter a wallet address with NFTs to view the collection.
            </p>
          </div>
        ) : (
          <>
            <div className="text-right text-xs text-primary-muted mb-2">
              {nfts.length} Items
            </div>

            {/* NFT Grid - Same as My Collection */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {nfts.map((nft) => (
                <motion.div
                  key={nft.id}
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="block w-full text-left rounded-xl p-2 sm:p-3 bg-white/80 backdrop-blur border border-[#eadffd] hover:border-[#d8c7ff] cursor-pointer"
                >
                  <div className="relative rounded-lg overflow-hidden">
                    {nft.image ? (
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        width={480}
                        height={480}
                        className="w-full aspect-square object-cover rounded-lg"
                        onError={(e) => {
                          console.warn(`Failed to load image for ${nft.name}`);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 sm:mt-3">
                    <div className="text-[#2b1a5e] font-semibold text-sm sm:text-[15px]">
                      {nft.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6c5a99] mt-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#7a4bd6]" />
                        NFT
                      </span>
                      <span className="opacity-60">{nft.id.slice(-4)}</span>
                    </div>
                  </div>

                  {/* Additional Info - Collapsible */}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className="mt-2 text-xs text-[#6c5a99]">
                      <span className="opacity-70">
                        {nft.attributes.length} traits
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default TestCollectionPage;
