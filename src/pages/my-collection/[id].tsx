import BreadCrumbs from "@/components/Breadcrumb";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { BLOCKCHAIN_CONFIG } from "@/services";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import clsx from "clsx";
import { HiOutlineInformationCircle, HiViewGrid } from "react-icons/hi";
import { useLoading } from "@/providers/LoadingProvider";
import { useConfig } from "@/stores";

interface SimpleNFTDetail {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: any[];
  owner: string;
  creator?: string;
  nftAddress: string;
  collection?: {
    address: string;
    name: string;
    verified: boolean;
  };
  createdAt?: string;
}

// Function to fetch metadata from NFT URI
const fetchNftMetadata = async (uri: string): Promise<any> => {
  try {
    let formattedUri = uri;
    if (uri.startsWith("ipfs://")) {
      formattedUri = `https://ipfs.io/ipfs/${uri.replace("ipfs://", "")}`;
    }

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
        return JSON.parse(responseText);
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Error fetching metadata:`, error);
    return null;
  }
};

const NftDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [nft, setNft] = useState<SimpleNFTDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const configData = useConfig();

  // Initialize Metaplex
  useEffect(() => {
    const initMetaplex = async () => {
      try {
        const connection = new Connection(
          configData?.rpcUrl ||
            "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06",
          "confirmed"
        );

        const metaplexInstance = new Metaplex(connection);
        setMetaplex(metaplexInstance);
        console.log("✅ Metaplex initialized for NFT detail");
      } catch (err) {
        console.error("❌ Failed to initialize Metaplex:", err);
        setError(`Failed to initialize Metaplex: ${err}`);
      }
    };

    initMetaplex();
  }, [configData?.rpcUrl]);

  const openTokenOnSolscan = (tokenAddress: string) => {
    if (!tokenAddress) return;

    const isMainnet = BLOCKCHAIN_CONFIG.NETWORK === "mainnet";

    const url = `https://solscan.io/token/${tokenAddress}${
      isMainnet ? "" : "?cluster=devnet"
    }`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const loadNftDetails = async () => {
      if (!router.isReady || !id || typeof id !== "string" || !metaplex) {
        hideLoading();
        return;
      }

      try {
        showLoading();
        setError(null);

        console.log("🔍 Loading NFT details for ID:", id);
        console.log("🔍 ID type:", typeof id, "Length:", id.length);

        // Validate the address format
        try {
          new PublicKey(id);
          console.log("✅ Valid PublicKey format");
        } catch (keyError) {
          throw new Error(
            `Invalid address format: ${id}. Please provide a valid Solana address.`
          );
        }

        let nftData;
        let addressType = "mint"; // Track what type of address we're dealing with

        try {
          // First try to get NFT by mint address
          const mintAddress = new PublicKey(id);
          nftData = await metaplex.nfts().findByMint({
            mintAddress: mintAddress,
          });
          console.log("✅ Found NFT by mint address");
        } catch (mintError) {
          console.log("⚠️ Failed to find by mint address:", mintError);

          try {
            // Try to find the NFT by searching for it in metadata
            // This is a fallback approach
            addressType = "metadata";
            const metadataAddress = new PublicKey(id);

            // Use findByMetadata approach
            const metadataAccount = await metaplex.nfts().findByMetadata({
              metadata: metadataAddress,
            });
            nftData = metadataAccount;
            console.log("✅ Found NFT by metadata address");
          } catch (metadataError) {
            console.error(
              "❌ Failed to find NFT by both mint and metadata address"
            );
            console.error("Mint error:", mintError);
            console.error("Metadata error:", metadataError);

            // Final attempt: try to get all NFTs and find by address
            console.log("🔄 Final attempt: searching through NFTs...");
            try {
              // This is a last resort - very inefficient but might work
              const allNfts = await metaplex.nfts().findAllByOwner({
                owner: new PublicKey(id), // This might fail, but let's try
              });

              if (allNfts.length > 0) {
                nftData = allNfts[0]; // Take the first one
                console.log("✅ Found NFT by owner search");
                addressType = "owner";
              } else {
                throw new Error("No NFTs found");
              }
            } catch (ownerError) {
              console.error("❌ All methods failed:", ownerError);
              throw new Error(
                `Cannot load NFT with address: ${id}\n\n` +
                  `This could be because:\n` +
                  `• The address is not a valid mint address\n` +
                  `• The NFT doesn't exist\n` +
                  `• The NFT is not on the current network (${configData?.rpcUrl?.includes("devnet") ? "devnet" : "mainnet"})\n\n` +
                  `Please verify the address and try again.`
              );
            }
          }
        }

        console.log(`📄 NFT data from Metaplex (${addressType}):`, nftData);

        let metadata = null;
        if (nftData.uri) {
          metadata = await fetchNftMetadata(nftData.uri);
          console.log("📝 Fetched metadata:", metadata);
        }

        // Get image URL from metadata
        let imageUrl =
          "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF"; // fallback

        if (metadata?.image) {
          if (metadata.image.startsWith("ipfs://")) {
            imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
          } else if (metadata.image.startsWith("http")) {
            imageUrl = metadata.image;
          } else {
            imageUrl = `https://ipfs.io/ipfs/${metadata.image}`;
          }
        }

        const nftDetail: SimpleNFTDetail = {
          id: id,
          name: metadata?.name || nftData.name || "Unnamed NFT",
          description: metadata?.description || "No description available",
          image: imageUrl,
          attributes: metadata?.attributes || [],
          owner:
            (nftData as any).mint?.supply?.basisPoints?.toString() || "Unknown",
          creator: (nftData as any).creators?.[0]?.address?.toString(),
          nftAddress: id,
          collection: (nftData as any).collection
            ? {
                address: (nftData as any).collection.address.toString(),
                name: "BELPY Collection",
                verified: (nftData as any).collection.verified || false,
              }
            : undefined,
          createdAt: new Date().toISOString(), // placeholder since we don't have this from blockchain
        };

        setNft(nftDetail);
        console.log("✅ NFT details loaded successfully");
      } catch (err) {
        console.error("❌ Error loading NFT details:", err);
        setError(err instanceof Error ? err.message : "Failed to load NFT");
        setNft(null);
      } finally {
        hideLoading();
      }
    };

    loadNftDetails();
  }, [router.isReady, id, metaplex]);

  if (error || !nft) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">NFT not found</h2>
        <p className="text-gray-600 mb-6">
          {error || "This NFT doesn't exist in your collection."}
        </p>
        <button
          onClick={() => (window.location.href = "/my-collection")}
          className="px-6 py-3 bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-semibold rounded-2xl"
        >
          Back to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f2ecf6] py-8">
      <div className="main-container w-full">
        <BreadCrumbs
          breadcrumbs={[
            { href: "/my-collection", label: "My Collection" },
            { label: "NFT details" },
          ]}
        />

        <motion.h1
          className={clsx(
            "font-oxanium font-bold mb-4 mt-5 text-3xl md:text-5xl md:title-text",
            "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "var(--font-oxanium)",
          }}
        >
          {nft.name}
        </motion.h1>
        <div className="flex flex-col md:flex-row gap-6 items-start text-lg">
          {/* Left: Image + Info */}
          <div className="flex flex-col gap-4 w-full md:w-[340px] items-center">
            <Image
              src={nft.image}
              alt={nft.name}
              width={260}
              height={260}
              className="rounded-xl object-contain w-full"
            />
            {/* Backstory */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2 w-full">
              <HiOutlineInformationCircle size={20} />
              <div>
                <div className="font-bold mb-1">Backstory</div>
                <div className="text-lg">
                  {nft.description ||
                    `${nft.name} was born under the Moon of Whisker Hollow. Known
                  for its mysterious glow and trickster nature, this BELPY has a
                  hidden destiny linked to the lost Harmony Stone.`}
                </div>
              </div>
            </div>

            {/* Blockchain details */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2 w-full">
              <HiViewGrid size={20} />
              <div className="flex-1">
                <div className="font-bold mb-1">Blockchain details</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <strong>Token ID</strong> {nft.name}
                  </div>
                  <div className="flex justify-between gap-2">
                    <strong className="text-nowrap">Token Address</strong>
                    <span
                      className="cursor-pointer hover:text-[#7A4BD6] transition-colors"
                      onClick={() => openTokenOnSolscan(nft.nftAddress)}
                      title="View token on Solscan"
                    >
                      <span className="truncate max-w-[90px] xs:max-w-[120px] inline-block align-middle text-right">
                        {nft.nftAddress}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <strong>Token Standard</strong> NFT
                  </div>
                  <div className="flex justify-between">
                    <strong>Chain</strong> Solana
                  </div>
                  {nft.createdAt && (
                    <div className="flex justify-between">
                      <strong>Minted:</strong>{" "}
                      {new Date(nft.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trait Info */}
          <div className="flex-1 flex flex-col gap-4">
            {nft?.attributes?.some((attr) =>
              attr?.trait_type?.toLowerCase().includes("special")
            ) && (
              <div
                className={clsx(
                  "self-start px-6 py-2 rounded-xl bg-[#7a4bd6] text-white font-bold shadow text-base mb-2"
                )}
              >
                GENESIS BELPY!
              </div>
            )}
            <div className="bg-[#E3CEF6] rounded-xl p-4">
              <div className="font-bold mb-2 flex items-center gap-2 text-base">
                <BiStar />
                Trait
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {nft.attributes
                  ?.filter((i: any) => i.value.toLowerCase() !== "none")
                  ?.map((trait: any) => (
                    <div
                      key={trait.trait_type}
                      className="bg-white rounded-lg px-3 pt-2 pb-1 text-sm flex flex-col items-start border border-[#e9defd]"
                    >
                      <p className="text-[#d3c0e4] font-semibold mb-[6px]">
                        {trait.trait_type}
                      </p>
                      <span className="text-base">{trait.value}</span>
                    </div>
                  )) || (
                  <div className="col-span-full text-center text-gray-500">
                    No traits available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftDetailPage;
