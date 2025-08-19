"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useWallet, Connected } from "@/hooks/useWallet";
import WalletModal from "./WalletModal";

interface MintConnectButtonProps {
  className?: string;
  onConnected?: (info: Connected) => void;
}

const MintConnectButton: React.FC<MintConnectButtonProps> = ({
  className,
  onConnected,
}) => {
  const [open, setOpen] = useState(false);

  const {
    hasPhantom,
    hasSolflare,
    hasBackpack,
    hasGlow,
    hasOKX,
    loading,
    connectWallet,
  } = useWallet(onConnected);

  const handleWalletConnection = async (
    walletType: "phantom" | "solflare" | "backpack" | "glow" | "okx"
  ) => {
    try {
      setOpen(false);
      await connectWallet(walletType);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <>
      <motion.button
        className={clsx(
          "bg-gradient-to-b from-[#F356FF] to-[#AE4DCE] text-white font-bold rounded-2xl text-lg sm:text-xl shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300",
          "flex items-center justify-center gap-2 min-w-[180px] h-[48px]",
          "cursor-pointer",
          className
        )}
        whileHover={{ scale: loading ? 1 : 1.05 }}
        whileTap={{ scale: loading ? 1 : 0.95 }}
        onClick={() => setOpen(true)}
        disabled={!!loading}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="whitespace-nowrap">
            {loading ? "Connecting..." : "CONNECT WALLET"}
          </span>
        </div>
      </motion.button>

      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        title="Connect Wallet to Mint"
        subtitle="Choose a wallet to connect and start minting BELPY NFTs."
        hasPhantom={hasPhantom}
        hasSolflare={hasSolflare}
        hasBackpack={hasBackpack}
        hasGlow={hasGlow}
        hasOKX={hasOKX}
        loading={loading}
        connectWallet={handleWalletConnection}
      />
    </>
  );
};

export default MintConnectButton;
