import { GetServerSideProps } from 'next';
import BreadCrumbs from "@/components/Breadcrumb";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NftService } from "@/services/nftService";
import { BLOCKCHAIN_CONFIG } from "@/services";
import type { NFT } from "@/services/types";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";
import clsx from "clsx";
import { HiOutlineInformationCircle, HiViewGrid } from "react-icons/hi";
import { useLoading } from "@/providers/LoadingProvider";

interface NftDetailPageProps {
  nft?: NFT;
  error?: string;
  id: string;
}

const NftDetailPage = ({ nft: initialNft, error: serverError, id }: NftDetailPageProps) => {
  const [nft, setNft] = useState<NFT | null>(initialNft || null);
  const [error, setError] = useState<string | null>(serverError || null);
  const { showLoading, hideLoading } = useLoading();

  const openTokenOnSolscan = (tokenAddress: string) => {
    if (!tokenAddress) return;
    const baseUrl = "https://solscan.io";
    const cluster = BLOCKCHAIN_CONFIG.NETWORK === "mainnet" ? "" : "?cluster=devnet";
    const url = `${baseUrl}/token/${tokenAddress}${cluster}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchNft = async () => {
      if (!initialNft && id && !serverError) {
        try {
          showLoading();
          setError(null);
          
          const response = await NftService.getNftDetails(id);
          
          if (response.success) {
            setNft(response.nft || null);
          } else {
            setError("NFT not found");
          }
        } catch (error) {
          console.error("❌ Error fetching NFT details:", error);
          setError("Failed to load NFT details");
        } finally {
          hideLoading();
        }
      }
    };

    fetchNft();
  }, [id, initialNft, serverError, showLoading, hideLoading]);

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
            { href: "/", label: "Home" },
            { href: "/my-collection", label: "My Collection" },
            { label: nft.name || "NFT Details" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* NFT Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              <Image
                src={nft.imageUrl || "/icons/cat.png"}
                alt={nft.name || "NFT"}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Rarity badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <BiStar />
              Rare
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {nft.name || "Untitled NFT"}
              </h1>
              <p className="text-gray-600 text-lg">
                {nft.description || "No description available"}
              </p>
            </div>

            {/* NFT Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Token ID</div>
                <div className="font-bold text-lg truncate">
                  {nft.nftAddress ? nft.nftAddress.slice(0, 8) + '...' : 'N/A'}
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Blockchain</div>
                <div className="font-bold text-lg">Solana</div>
              </div>
            </div>

            {/* Attributes */}
            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <HiOutlineInformationCircle />
                  Attributes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {nft.attributes.map((attr: any, index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">{attr.trait_type}</div>
                      <div className="font-bold">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => openTokenOnSolscan(nft.nftAddress)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                View on Solscan
              </button>
              
              <button
                onClick={() => (window.location.href = "/my-collection")}
                className="w-full bg-white border-2 border-purple-500 text-purple-500 py-3 px-6 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <HiViewGrid />
                Back to Collection
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  try {
    if (typeof id === 'string') {
      const response = await NftService.getNftDetails(id);
      
      if (response.success && response.nft) {
        return {
          props: {
            nft: response.nft,
            id,
          },
        };
      }
    }
    
    return {
      props: {
        error: 'NFT not found',
        id: id || '',
      },
    };
  } catch (error) {
    console.error('Error fetching NFT details on server:', error);
    
    return {
      props: {
        error: 'Failed to load NFT details',
        id: id || '',
      },
    };
  }
};

export default NftDetailPage;
