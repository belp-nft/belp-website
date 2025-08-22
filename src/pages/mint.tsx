import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useWalletContext } from "@/providers/WalletProvider";
import { useCandyMachine } from "@/providers/CandyMachineProvider";
import { useToast } from "@/components/ToastContainer";

import {
  useConfig,
  useRefreshStats,
  useMintStats,
} from "@/stores/config";
import MintHeader from "@/modules/mint/MintHeader";
import MintSection from "@/modules/mint/MintSection";
import MintConfirmModal from "@/modules/mint/MintConfirmModal";
import MintSuccessModal from "@/modules/mint/MintSuccessModal";
import FeatureAnnouncementModal from "@/modules/mint/FeatureAnnouncementModalProps";
import { useCandyMachineContext } from "@/providers/CandyMachineProvider";
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

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

const BelpyMintPage = () => {
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
  const { minted, supply } = useMintStats();
  // const { minted, supply } = useCandyMachineInfo();
  const refreshStats = useRefreshStats();

  // UMI from context for on-chain fetching
  const { umi, collection } = useCandyMachineContext();

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
    if (!candyMachineConfig) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing candy machine stats...");
        await refreshStats(candyMachineConfig.address);
      } catch (error) {
        console.error("⚠️ Failed to auto-refresh stats:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [candyMachineConfig]);

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

      if (!mintResult?.success) {
        setIsProcessing(false);
        // Handle specific error types via message matching (fallback)
        const message = mintResult?.message || "Failed to mint NFT. Please try again.";
        if (message.includes("User rejected") || message.includes("rejected")) {
          showWarning(
            "Transaction Cancelled",
            "You cancelled the transaction signing in your wallet. Please try again if you want to mint NFT.",
            6000
          );
        } else if (message.includes("insufficient")) {
          showError(
            "Insufficient SOL",
            "Your wallet doesn't have enough SOL balance to mint. Please add more SOL to your wallet.",
            8000
          );
        } else if (message.includes("sold out")) {
          showInfo(
            "Sold Out",
            "Sorry, all NFTs have been minted out. Stay tuned for information about the next mint drop!",
            8000
          );
        } else if (message.includes("not active")) {
          showInfo(
            "Mint Not Active",
            "Minting is not currently active. Please wait for official announcement.",
            6000
          );
        } else {
          showError("Mint Failed", message, 6000);
        }
        return;
      }

      // Success flow without sendSignedTransaction
      showSuccess(
        "Mint Successful! 🎉",
        `NFT has been minted successfully${mintResult.signature ? `. TX: ${mintResult.signature.slice(0, 8)}...` : ""}`,
        8000
      );

      if (mintResult.nftAddress) {
        setNftAddress(mintResult.nftAddress);
      }

      setMintSuccess(true);
      setSelectedCat(Math.floor(Math.random() * cats.length));

      // Show success modal
      setShowMintModal(false);
      setShowSuccessModal(true);
      setIsProcessing(false); // Stop processing when success modal is shown

      // Fetch NFT details from Metaplex (on-chain)
      if (mintResult.nftAddress && umi) {
        try {
          const mintPk = umiPublicKey(mintResult.nftAddress);

          const fetchDetailsOnce = async () => {
            // Try Token Metadata first (standard NFT / pNFT)

            const da = await fetchDigitalAsset(umi, mintPk);
            const name = da.metadata.name || "";
            const uri = da.metadata.uri || "";   

            // Format IPFS URIs like test-collection
            let formattedUri = uri;
            if (formattedUri && formattedUri.startsWith("ipfs://")) {
              formattedUri = `https://ipfs.io/ipfs/${formattedUri.replace("ipfs://", "")}`;
            }

            let metadataJson: any = null;
            let imageUrl = "";
            if (formattedUri) {
              try {
                const resp = await fetch(formattedUri as string, {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  mode: "cors",
                });
                if (resp.ok) {
                  const text = await resp.text();
                  if (text.trim()) {
                    metadataJson = JSON.parse(text);
                  }
                }
              } catch (_) {}
            }

            // Build image url from metadata like test-collection
            if (metadataJson?.image) {
              const img = metadataJson.image as string;
              if (img.startsWith("ipfs://")) {
                imageUrl = `https://ipfs.io/ipfs/${img.replace("ipfs://", "")}`;
              } else if (img.startsWith("http")) {
                imageUrl = img;
              } else {
                imageUrl = `https://ipfs.io/ipfs/${img}`;
              }
            }

            const attributesArray = Array.isArray(metadataJson?.attributes)
              ? metadataJson.attributes
              : [];

            const mappedAttributes = attributesArray.map((attr: any) => ({
              trait_type:
                attr?.trait_type || attr?.traitType || attr?.trait || "",
              value: String(attr?.value ?? ""),
            }));

            return {
              name: metadataJson?.name || name || "BELPY NFT",
              imageUrl: imageUrl || "",
              attributes: mappedAttributes,
            } as any;
          };

          const retry = async (attempts = 5, delayMs = 600): Promise<any> => {
            let lastErr: any;
            for (let i = 0; i < attempts; i++) {
              try {
                return await fetchDetailsOnce();
              } catch (e) {
                lastErr = e;
                await new Promise((r) => setTimeout(r, delayMs));
              }
            }
            throw lastErr;
          };

          const details = await retry();
          setNftDetailData(details);
        } catch (error) {
          console.warn(
            "⚠️ Could not fetch NFT details from Metaplex (after retries):",
            error
          );
        }
      }

      // Refresh stats in background
      if (candyMachineConfig) {
        setTimeout(() => refreshStats(candyMachineConfig.address), 2000);
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
        className="container mx-auto"
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

export default BelpyMintPage;
