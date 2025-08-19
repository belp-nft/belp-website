import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useWallet } from "@/hooks/useWallet";
import PageLoading from "@/components/PageLoading";

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
  const {
    solAddress,
    connectWallet,
    refreshSolBalance,
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
  const [showFeatureAnnouncement, setShowFeatureAnnouncement] = useState(false);
  const [isHiddenRemindMe, setIsHiddenRemindMe] = useState(false);

  // Check if feature announcement should be shown
  useEffect(() => {
    const checkFeatureAnnouncementStatus = () => {
      const remindTomorrow = localStorage.getItem(
        "feature-announcement-remind-tomorrow"
      );

      if (remindTomorrow) {
        const remindTime = new Date(remindTomorrow);
        const now = new Date();

        // Calculate the start of the next day from when reminder was set
        const nextDay = new Date(remindTime);
        nextDay.setHours(0, 0, 0, 0); // Set to 00:00:00 of the same day
        nextDay.setDate(nextDay.getDate() + 1); // Move to next day

        // Check if current time has passed the next day's midnight
        const hasPassedMidnight = now >= nextDay;

        if (hasPassedMidnight) {
          // It's past midnight of the next day, remove the reminder and show modal
          localStorage.removeItem("feature-announcement-remind-tomorrow");
          setShowFeatureAnnouncement(true);
          console.log(
            "🌅 New day detected, showing feature announcement modal"
          );
        } else {
          // Still within the "remind tomorrow" period, don't show modal
          setShowFeatureAnnouncement(false);
          const hoursLeft = Math.ceil(
            (nextDay.getTime() - now.getTime()) / (1000 * 60 * 60)
          );
          console.log(
            `⏰ Still in remind period, ${hoursLeft} hours until next show`
          );
        }
      } else {
        // No reminder set, show modal by default
        setShowFeatureAnnouncement(true);
      }
    };

    checkFeatureAnnouncementStatus();
  }, []);

  const handleFeatureAnnouncementClose = (action?: "remind") => {
    setShowFeatureAnnouncement(false);

    if (action === "remind") {
      // Set reminder for tomorrow - save current timestamp
      localStorage.setItem(
        "feature-announcement-remind-tomorrow",
        new Date().toISOString()
      );
    }
  };

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
        await connectWallet("phantom");
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

      // Build mint transaction
      const buildResult = await NftService.buildMintTransaction(
        candyMachineAddress,
        solAddress
      );

      if (!buildResult.success) {
        throw new Error(
          buildResult.message || "Failed to build mint transaction"
        );
      }

      // Here you would typically sign and send the transaction
      // This is a simplified version - you'll need to implement actual signing logic
      const result = {
        success: true,
        nftAddress: "example-nft-address", // This should come from actual mint result
        message: "Mint successful",
      };

      if (result.success && result.nftAddress) {
        console.log("✅ NFT minted successfully:", result.nftAddress);
        setNftAddress(result.nftAddress);
        setMintSuccess(true);
        setSelectedCat(Math.floor(Math.random() * cats.length));

        // Increment minted count locally for immediate UI feedback
        incrementMinted();

        // Save user data after successful mint
        if (authToken && solAddress) {
          await loadUserData(solAddress);
        }

        // Show success modal
        setShowMintModal(false);
        setShowSuccessModal(true);

        // Fetch NFT details for display
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
        throw new Error(result.message || "Failed to mint NFT");
      }
    } catch (error: any) {
      console.error("❌ Mint failed:", error);

      let errorMessage = "Failed to mint NFT. Please try again.";

      if (error.message?.includes("insufficient")) {
        errorMessage =
          "Insufficient SOL balance. Please add more SOL to your wallet.";
      } else if (error.message?.includes("sold out")) {
        errorMessage = "Sorry, all NFTs have been sold out!";
      } else if (error.message?.includes("not active")) {
        errorMessage = "Minting is not currently active.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
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
    setShowFeatureAnnouncement(true);
    setIsHiddenRemindMe(true);
    // if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
    // return;
    // }
    // setShowMintModal(true);
  };

  useEffect(() => {
    if (solAddress) {
      loadUserData(solAddress);
    }
  }, [solAddress]);

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
          isHiddenRemindMe={isHiddenRemindMe}
          onClose={(action) => handleFeatureAnnouncementClose(action)}
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
