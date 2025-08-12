"use client";

import BreadCrumbs from "@/components/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { NftService } from "@/services/nftService";
import type { NFT } from "@/services/types";
import { BiStar } from "react-icons/bi";
import { motion } from "framer-motion";

const NftDetailPage = () => {
  const { id } = useParams();
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load NFT details từ service
  useEffect(() => {
    const loadNftDetails = async () => {
      if (!id || typeof id !== 'string') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🖼️ Loading NFT details for:', id);
        
        const response = await NftService.getNftDetails(id);
        
        if (response.success && response.nft) {
          setNft(response.nft);
          console.log('✅ NFT details loaded:', response.nft);
        } else {
          setError('NFT not found');
          console.error('❌ Failed to load NFT details');
        }
      } catch (err) {
        console.error('❌ Error loading NFT details:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setNft(null);
      } finally {
        setLoading(false);
      }
    };

    loadNftDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f4ff] via-white to-[#f0e6ff]">
        <div className="text-center">
          {/* Clean NFT Frame */}
          <motion.div
            className="relative w-24 h-24 mx-auto mb-8"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#F356FF] to-[#AE4DCE] p-1">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                <motion.span
                  className="text-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🖼️
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Simple text */}
          <motion.h2
            className="text-2xl font-bold text-[#2b1a5e] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Loading NFT
          </motion.h2>

          {/* Loading dots */}
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#7A4BD6] rounded-full"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="mt-6 mb-4 text-[2rem] font-extrabold text-[#6c3ad6] tracking-tight">
          {nft.name}
        </h1>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left: Image + Info */}
          <div className="flex flex-col gap-4 w-full md:w-[340px]">
            <div className="rounded-2xl border-2 border-[#7a4bd6] bg-black/80 p-2 w-full h-[320px] flex items-center justify-center shadow-lg">
              <Image
                src={nft.imageUrl}
                alt={nft.name}
                width={260}
                height={260}
                className="rounded-xl object-contain"
              />
            </div>
            {/* Backstory */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#7a4bd6"
                  strokeWidth="2"
                />
                <path d="M12 8v4l3 1" stroke="#7a4bd6" strokeWidth="2" />
              </svg>
              <div>
                <div className="font-bold text-[#2b1a5e] mb-1">Backstory</div>
                <div className="text-[#7466a1] text-sm leading-relaxed">
                  {nft.description || `${nft.name} was born under the Moon of Whisker Hollow. Known
                  for its mysterious glow and trickster nature, this BELPY has a
                  hidden destiny linked to the lost Harmony Stone.`}
                </div>
              </div>
            </div>

            {/* Blockchain details */}
            <div className="bg-[#E3CEF6] rounded-xl p-4 flex items-start gap-2 w-full">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="#7a4bd6"
                  strokeWidth="2"
                />
                <path d="M8 8h8v8H8z" stroke="#7a4bd6" strokeWidth="2" />
              </svg>
              <div className="flex-1">
                <div className="font-bold text-[#2b1a5e] mb-1">
                  Blockchain details
                </div>
                <div className="text-[#7466a1] text-sm space-y-1">
                  <div className="flex justify-between">
                    <strong>Token ID</strong> {nft.name}
                  </div>
                  <div className="flex justify-between">
                    <strong>Token Address</strong> {nft.nftAddress.slice(0, 8)}...{nft.nftAddress.slice(-8)}
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
            <button className="self-start px-6 py-2 rounded-xl bg-[#7a4bd6] text-white font-bold shadow text-base mb-2">
              GENESIS BELPY !
            </button>
            <div className="bg-[#E3CEF6] rounded-xl p-4">
              <div className="font-bold text-[#2b1a5e] mb-2 flex items-center gap-2 text-base">
                <BiStar />
                Trait
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {/* Show some default traits for minted NFTs */}
                {[
                  { label: "TYPE", value: "Genesis BELPY" },
                  { label: "RARITY", value: "Common" },
                  { label: "SPECIAL", value: "Minted" },
                  { label: "NETWORK", value: "Solana" },
                ].map((trait) => (
                  <div
                    key={trait.label}
                    className="bg-white rounded-lg px-3 py-2 text-sm flex flex-col items-start border border-[#e9defd]"
                  >
                    <span className="text-[#6c5a99] font-semibold mb-1">
                      {trait.label}
                    </span>
                    <span className="font-bold text-[#7a4bd6] text-base">
                      {trait.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftDetailPage;
