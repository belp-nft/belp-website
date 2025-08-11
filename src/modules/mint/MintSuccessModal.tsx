"use client";

import React from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";

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
              "w-full h-full bg-gradient-to-br from-pink-200 to-purple-300",
              "rounded-2xl flex items-center justify-center shadow-lg overflow-hidden"
            )}
          >
            {selectedCat !== null && (
              <img
                src={`/icons/${cats[selectedCat]}`}
                alt="Minted BELPY"
                className="w-32 h-32 object-contain"
              />
            )}
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            BELPY {mintedNftId}
          </h3>
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
