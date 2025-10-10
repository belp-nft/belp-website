"use client";

import React from "react";
import clsx from "clsx";
import Modal from "@/components/Modal";
import Image from "next/image";

interface MintConfirmModalProps {
  isOpen: boolean;
  isMinting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const MintConfirmModal: React.FC<MintConfirmModalProps> = ({
  isOpen,
  isMinting,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isMinting && onClose()} // Prevent close while minting
      headerTitle="Mint Confirmation"
      description="Ready to get your own BELPY?"
      primaryButtonText="Confirm & Mint"
      secondaryButtonText="Cancel"
      onPrimaryClick={onConfirm}
      onSecondaryClick={onClose}
      primaryButtonDisabled={isMinting}
      secondaryButtonDisabled={isMinting} // Disable cancel while minting
    >
      <div className="flex flex-col items-center py-6">
        <div className="relative mb-6 w-[200px] h-[200px]">
          <Image
            src="/images/mint/random-cat.svg"
            width={200}
            height={200}
            alt="Random Cat"
            className="w-full h-full object-contain"
          />

          <div className="absolute inset-0 flex items-center justify-center top-[-16px] right-[-8px]">
            <span className="text-white text-3xl font-bold drop-shadow-lg">
              ?
            </span>
          </div>
        </div>

        <div
          className={clsx(
            "bg-gradient-to-r from-[#F356FF] to-[#AE4DCE]",
            "text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg"
          )}
        >
          1 SOL
        </div>
      </div>
    </Modal>
  );
};

export default MintConfirmModal;
