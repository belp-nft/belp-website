"use client";

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import Modal from "@/components/Modal";
import { motion } from "framer-motion";

interface NFTDetails {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  nftAddress: string;
  transactionSignature: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    edition: number;
  };
  candyMachineAddress: string;
  collectionAddress: string;
  collectionName: string;
  walletAddress: string;
  userId: string;
  mintedAt: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isVerified: boolean;
  symbol: string;
}

interface MintSuccessModalProps {
  isOpen: boolean;
  nftDetails: NFTDetails | null;
  onClose: () => void;
  onViewDetails: () => void;
  onViewHistory: () => void;
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  isOpen,
  nftDetails,
  onClose,
  onViewDetails,
  onViewHistory,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerTitle="Your BELPY is here !"
      description="You've successfully minted a BELPY! Your new favorite cat companion."
      primaryButtonText="View Details"
      secondaryButtonText="History"
      onPrimaryClick={onViewDetails}
      onSecondaryClick={onViewHistory}
    >
      <div className="flex flex-col items-center py-6">
        <div className="relative w-40 h-40 mb-4">
          <div
            className={clsx(
              "w-full h-full",
              "rounded-2xl shadow-lg overflow-hidden"
            )}
          >
            {nftDetails?.imageUrl && (
              <Image
                src={nftDetails.imageUrl}
                alt={`Minted ${nftDetails.name}`}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                priority
              />
            )}
          </div>
        </div>

        <div className="text-center">
          <motion.h1
            className={clsx(
              "font-oxanium font-bold mb-4 text-3xl md:title-text",
              "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] bg-clip-text text-transparent leading-tight"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-oxanium)",
            }}
          >
            {nftDetails?.name || "BELPY NFT"}
          </motion.h1>

          {/* Display attributes if available */}
          {nftDetails?.attributes?.some((attr) =>
            attr?.trait_type?.toLowerCase().includes("special")
          ) && (
            <div
              className={clsx(
                "inline-block bg-gradient-to-r from-[#F356FF] to-[#AE4DCE]",
                "text-white px-4 py-1 rounded-full text-sm font-medium"
              )}
            >
              GENESIS BELPY!
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MintSuccessModal;
