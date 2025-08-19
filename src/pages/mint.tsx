import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/ToastContainer";
import PageLoading from "@/components/PageLoading";

import { NftService } from "@/services";
import {
  mintNftDirectlyFromWallet,
  mintBelpNft,
} from "@/lib/candyMachineHelpers";
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
    connectPhantom,
    refreshSolBalance,
    connectedWallet,
    getWalletProvider,
    authToken,
    loadUserData,
  } = useWallet();

  // Zustand store
  const candyMachineConfig = useConfig();
  const candyMachineAddress = useCandyMachineAddress();
  const { minted, supply } = useMintStats();
  const { refreshStats, incrementMinted } = useConfigActions();

  // Local state
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintSuccess, setMintSuccess] = useState<boolean>(false);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftDetailData, setNftDetailData] = useState<any>(null);
  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(true);

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
    setIsMinting(true);
    setMintSuccess(false);

    try {
      if (!solAddress) {
        console.log("Wallet not connected, attempting to connect...");
        await connectPhantom();
        return;
      }

      if (!candyMachineConfig) {
        throw new Error("Candy Machine configuration not loaded!");
      }

      if (!candyMachineAddress) {
        throw new Error("Candy Machine address not available!");
      }

      console.log("Starting NFT mint...");
      console.log("Candy Machine:", candyMachineAddress);
      console.log("Buyer wallet:", solAddress);

      // Refresh SOL balance before minting
      await refreshSolBalance();

      // Get wallet provider from window
      const walletProvider =
        (window as any).solana || (window as any).phantom?.solana;

      if (!walletProvider) {
        throw new Error(
          "Wallet provider not found! Please make sure your wallet is installed and connected."
        );
      }

      console.log("🎯 Using wallet provider for direct mint...");

      // Call mint directly from Candy Machine smart contract
      // const result = await mintNftDirectlyFromWallet(
      //   candyMachineAddress,
      //   solAddress,
      //   walletProvider
      // );

      // Call mint directly from Candy Machine smart contract
      const result = await mintBelpNft(solAddress, walletProvider);

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

        // Increment minted count locally for immediate UI feedback
        incrementMinted();

        // Save user data after successful mint
        if (authToken && solAddress) {
          console.log("💾 Saving user data after mint...");
          await loadUserData(solAddress);
        }

        // Show success modal
        setShowMintModal(false);
        setShowSuccessModal(true);

        // Fetch NFT details for display (if nftAddress exists)
        if (result.nftAddress) {
          try {
            const nftDetails = await NftService.getNftDetails(
              result.nftAddress
            );
            setNftDetailData(nftDetails);
          } catch (error) {
            console.warn("⚠️ Could not fetch NFT details:", error);
          }
        }

        // Refresh stats in background
        setTimeout(() => refreshStats(candyMachineAddress), 2000);
      } else {
        // Throw error with result object to access errorType
        const error = new Error(result.message || "Failed to mint NFT");
        (error as any).result = result;
        throw error;
      }
    } catch (error: any) {
      console.error("❌ Mint failed:", error);

      // Check if error is from mintNftDirectlyFromWallet
      const result = error.result || {};
      const errorType = result.errorType || "error";
      let errorMessage =
        result.message ||
        error.message ||
        "Failed to mint NFT. Please try again.";

      // Handle specific error types
      if (
        error.message?.includes("User rejected") ||
        error.message?.includes("rejected")
      ) {
        showWarning(
          "Transaction Cancelled",
          "You cancelled the transaction signing in your wallet. Please try again if you want to mint NFT.",
          6000
        );
        return; // No need to show additional error
      } else if (error.message?.includes("insufficient")) {
        showError(
          "Insufficient SOL",
          "Your wallet doesn't have enough SOL balance to mint. Please add more SOL to your wallet.",
          8000
        );
        return;
      } else if (error.message?.includes("sold out")) {
        showInfo(
          "Sold Out",
          "Sorry, all NFTs have been minted out. Stay tuned for information about the next mint drop!",
          8000
        );
        return;
      } else if (error.message?.includes("not active")) {
        showInfo(
          "Mint Not Active",
          "Minting is not currently active. Please wait for official announcement.",
          6000
        );
        return;
      }

      // General error
      showError("Mint Failed", errorMessage, 6000);
    } finally {
      setIsMinting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setMintSuccess(false);
    setSelectedCat(null);
    setNftAddress("");
    setNftDetailData(null);
  };

  const handleMintClick = () => {
    // setShowFeatureAnnouncement(true);
    // if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
    // return;
    // }
    setShowMintModal(true);
  };

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

        <FeatureAnnouncementModal
          isOpen={showFeatureAnnouncement}
          onClose={() => setShowFeatureAnnouncement(false)}
        />

        <MintConfirmModal
          isOpen={showMintModal}
          isMinting={isMinting}
          onClose={() => setShowMintModal(false)}
          onConfirm={handleMint}
        />

        <MintSuccessModal
          isOpen={showSuccessModal}
          selectedCat={selectedCat}
          cats={cats}
          mintedNftId={nftDetailData?.name}
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
