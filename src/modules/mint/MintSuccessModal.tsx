"use client";

import React from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";
import { motion } from "framer-motion";

interface MintSuccessModalProps {
  isOpen: boolean;
  selectedCat: number | null;
  cats: string[];
  mintedNftId: string;
  onClose: () => void;
  onViewDetails: () => void;
  onViewHistory: () => void;
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  isOpen,
  selectedCat,
  cats,
  mintedNftId,
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
            {selectedCat !== null && (
              <img
                src={`/icons/${cats[selectedCat]}`}
                alt="Minted BELPY"
                className="w-full object-contain"
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
            BELPY {mintedNftId}
          </motion.h1>
          <div
            className={clsx(
              "inline-block bg-gradient-to-r from-[#F356FF] to-[#AE4DCE]",
              "text-white px-4 py-1 rounded-full text-sm font-medium"
            )}
          >
            GENESIS BELPY!
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MintSuccessModal;
