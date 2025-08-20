import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useWalletContext } from "@/providers/WalletProvider";
import { useCandyMachine } from "@/providers/CandyMachineProvider";
import { useToast } from "@/components/ToastContainer";

import { NftService } from "@/services";
import {
  useConfig,
  useMintStats,
  useConfigActions,
  useCandyMachineAddress,
} from "@/stores/config";
import MintHeader from "@/modules/mint/MintHeader";
import MintSection from "@/modules/mint/MintSection";
import MintConfirmModal from "@/modules/mint/MintConfirmModal";
import MintSuccessModal from "@/modules/mint/MintSuccessModal";
import FeatureAnnouncementModal from "@/modules/mint/FeatureAnnouncementModalProps";

const cats = [
  "tokens/1.png",
  "tokens/2.png",
  "tokens/3.png",
  "tokens/4.png",
  "tokens/5.png",
  "tokens/6.png",
  "tokens/7.png",
  "tokens/8.png",
  "tokens/9.png",
  "tokens/10.png",
];

interface MintPageProps {
  candyMachineData?: any;
  initialMintStats?: {
    minted: number;
    supply: number;
  };
}

const BelpyMintPage = ({
  candyMachineData,
  initialMintStats,
}: MintPageProps) => {
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const {
    solAddress,
    connectWallet,
    refreshSolBalance,
    connectedWallet,
    authToken,
    loadUserData,
  } = useWalletContext();

  const {
    isMinting,
    mint,
    lastMintResult,
    error: mintError,
    canMint,
    clearResult,
    clearError,
  } = useCandyMachine();

  // Zustand store
  const candyMachineConfig = useConfig();
  const candyMachineAddress = useCandyMachineAddress();
  const { minted, supply } = useMintStats();
  const { refreshStats, incrementMinted } = useConfigActions();

  // Local state
  const [mintSuccess, setMintSuccess] = useState<boolean>(false);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftDetailData, setNftDetailData] = useState<any>(null);

  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(false);

  const [isHiddenRemindMe, setIsHiddenRemindMe] = useState(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Auto-connect wallet if authToken exists but no solAddress
  useEffect(() => {
    if (!solAddress && authToken) {
      console.log("🔄 Auto-connecting wallet with existing authToken...");
      // Try to get last used wallet type or default to phantom
      const lastWalletType =
        (window.localStorage.getItem("last-wallet-type") as any) || "phantom";
      connectWallet(lastWalletType);
    }
  }, [solAddress, authToken, connectWallet]);

  // Auto-refresh stats every 30s
  useEffect(() => {
    if (!candyMachineAddress) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing candy machine stats...");
        await refreshStats(candyMachineAddress);
      } catch (error) {
        console.error("⚠️ Failed to auto-refresh stats:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [candyMachineAddress]);

  const handleMint = async () => {
    setMintSuccess(false);
    setIsProcessing(true);
    clearResult();
    clearError();

    try {
      if (!solAddress) {
        setIsProcessing(false);
        return;
      }

      // Call mint from CandyMachine provider
      const mintResult = await mint();
      const result = await NftService.sendSignedTransaction(
        mintResult?.signature || "",
        solAddress,
        "9MTRpcfQCGfpBgeruvVH5sDYCP58xVjEf7k3QjKE8pkf"
      );

      if (result.success) {
        console.log("✅ NFT minted successfully!");
        console.log("Transaction signature:", result.signature);
        console.log("NFT address:", result.nftAddress);

        // Show success toast
        showSuccess(
          "Mint Successful! 🎉",
          `NFT has been minted successfully${result.signature ? `. TX: ${result.signature.slice(0, 8)}...` : ""}`,
          8000
        );

        if (result.nftAddress) {
          setNftAddress(result.nftAddress);
        }

        setMintSuccess(true);
        setSelectedCat(Math.floor(Math.random() * cats.length));

        // Show success modal
        setShowMintModal(false);
        setShowSuccessModal(true);
        setIsProcessing(false); // Stop processing when success modal is shown

        // Fetch NFT details for display (if nftAddress exists)
        if (result.nftAddress) {
          try {
            const nftDetails = await NftService.getNftDetails(
              result.nftAddress
            );
            setNftDetailData(nftDetails?.nft);
          } catch (error) {
            console.warn("⚠️ Could not fetch NFT details:", error);
          }
        }

        // Refresh stats in background
        if (candyMachineAddress) {
          setTimeout(() => refreshStats(candyMachineAddress), 2000);
        }
      } else {
        // Handle error result from CandyMachine provider
        // const errorType = result.errorType || "error";

        // Handle specific error types
        if (
          result.message?.includes("User rejected") ||
          result.message?.includes("rejected")
        ) {
          showWarning(
            "Transaction Cancelled",
            "You cancelled the transaction signing in your wallet. Please try again if you want to mint NFT.",
            6000
          );
        } else if (result.message?.includes("insufficient")) {
          showError(
            "Insufficient SOL",
            "Your wallet doesn't have enough SOL balance to mint. Please add more SOL to your wallet.",
            8000
          );
        } else if (result.message?.includes("sold out")) {
          showInfo(
            "Sold Out",
            "Sorry, all NFTs have been minted out. Stay tuned for information about the next mint drop!",
            8000
          );
        } else if (result.message?.includes("not active")) {
          showInfo(
            "Mint Not Active",
            "Minting is not currently active. Please wait for official announcement.",
            6000
          );
        } else {
          // General error
          showError(
            "Mint Failed",
            result.message || "Failed to mint NFT. Please try again.",
            6000
          );
        }
        setIsProcessing(false); // Stop processing on error
      }
    } catch (error: any) {
      console.error("❌ Mint failed:", error);
      setIsProcessing(false); // Stop processing on exception
      showError(
        "Mint Failed",
        error.message || "An unexpected error occurred.",
        6000
      );
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setMintSuccess(false);
    setSelectedCat(null);
    setNftAddress("");
    setNftDetailData(null);
    setIsProcessing(false); // Ensure processing is stopped
  };

  const handleMintClick = () => {
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      setShowMintModal(true);
      return;
    }
    setShowFeatureAnnouncement(true);
    setIsHiddenRemindMe(true);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reminder = localStorage.getItem("belp-feature-reminder");
      if (!reminder) {
        setShowFeatureAnnouncement(true);
      } else {
        const now = new Date();
        const expire = new Date(reminder);
        if (
          now.getFullYear() > expire.getFullYear() ||
          (now.getFullYear() === expire.getFullYear() &&
            now.getMonth() > expire.getMonth()) ||
          (now.getFullYear() === expire.getFullYear() &&
            now.getMonth() === expire.getMonth() &&
            now.getDate() > expire.getDate())
        ) {
          localStorage.removeItem("belp-feature-reminder");
          setShowFeatureAnnouncement(true);
        }
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-8"
      >
        <MintHeader />

        <MintSection
          onMintClick={handleMintClick}
          isMinting={isMinting}
          mintSuccess={mintSuccess}
          minted={minted}
          supply={supply}
          selectedCat={selectedCat}
        />

        <MintConfirmModal
          isOpen={showMintModal}
          isMinting={isProcessing}
          onClose={() => setShowMintModal(false)}
          onConfirm={handleMint}
        />

        <MintSuccessModal
          isOpen={showSuccessModal}
          nftDetails={nftDetailData}
          onClose={handleSuccessModalClose}
          onViewDetails={() => {
            router.push(`/my-collection/${nftAddress}`);
            handleSuccessModalClose();
          }}
          onViewHistory={() => {
            router.push(`/my-collection/history`);
            handleSuccessModalClose();
          }}
        />
      </motion.div>

      <FeatureAnnouncementModal
        isOpen={showFeatureAnnouncement}
        isHiddenRemindMe={isHiddenRemindMe}
        onClose={(action) => {
          if (action === "remind") {
            setIsHiddenRemindMe(true);
            // Set reminder for tomorrow (you can implement localStorage logic here)
            localStorage.setItem(
              "belp-feature-reminder",
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            );
          }
          setShowFeatureAnnouncement(false);
        }}
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Fetch candy machine configuration from server
    // const candyMachineData = await ConfigService.getCandyMachineConfig();

    // Fetch initial mint stats
    // const mintStats = await NftService.getMintStats();

    return {
      props: {
        // candyMachineData: candyMachineData?.data || null,
        // initialMintStats: mintStats?.data || null,
      },
    };
  } catch (error) {
    console.error("Error fetching mint page data:", error);

    return {
      props: {
        candyMachineData: null,
        initialMintStats: null,
      },
    };
  }
};

export default BelpyMintPage;
