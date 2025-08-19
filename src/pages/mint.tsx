import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useWalletContext } from "@/providers/WalletProvider";
import { useCandyMachine, useCandyMachineContext } from "@/providers/CandyMachineProvider";
import { useToast } from "@/components/ToastContainer";
import PageLoading from "@/components/PageLoading";

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
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { BLOCKCHAIN_CONFIG } from "@/services";
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { fetchAsset } from "@metaplex-foundation/mpl-core";

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

function normalizeNftImageUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
  }
  if (url.startsWith("ar://")) {
    return `https://arweave.net/${url.replace("ar://", "")}`;
  }
  return url;
}

function shortenAddress(addr?: string, len: number = 4) {
  if (!addr) return "";
  return `${addr.slice(0, len)}...${addr.slice(-len)}`;
}

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
  const { umi } = useCandyMachineContext();

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
    setMintSuccess(false);
    clearResult();
    clearError();

    try {
      if (!solAddress) {
        console.log("Wallet not connected, attempting to connect...");
        await connectWallet("phantom");
        return;
      }

      // Call mint from CandyMachine provider
      const result = await mint();

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
        setSelectedCat(null);

        // Cập nhật minted ngay lập tức trên UI
        incrementMinted();

        // Show success modal
        setShowMintModal(false);
        setShowSuccessModal(true);

        // Fetch NFT details for display: ưu tiên dùng Token Metadata, sau đó Core, rồi Metaplex JS
        if (result.nftAddress) {
          try {
            let name = "";
            let imageUrl = "";

            // 1) mpl-token-metadata
            if (umi) {
              try {
                const da = await fetchDigitalAsset(umi, umiPublicKey(result.nftAddress));
                name = (da as any)?.metadata?.name || name;
                const uri = (da as any)?.metadata?.uri;
                if (uri) {
                  try {
                    const resp = await fetch(uri);
                    const json = await resp.json();
                    name = json.name || name;
                    imageUrl = normalizeNftImageUrl(json.image || json.image_url || json?.properties?.files?.[0]?.uri);
                  } catch {}
                }
              } catch {}
            }

            // 2) Fallback: mpl-core asset
            if (!imageUrl && umi) {
              try {
                const coreAsset = await fetchAsset(umi, umiPublicKey(result.nftAddress));
                name = (coreAsset as any).name || name;
                const uri = (coreAsset as any).uri;
                if (uri) {
                  try {
                    const resp = await fetch(uri);
                    const json = await resp.json();
                    name = json.name || name;
                    imageUrl = normalizeNftImageUrl(json.image || json.image_url || json?.properties?.files?.[0]?.uri);
                  } catch {}
                }
              } catch {}
            }

            // 3) Fallback: Metaplex JS NFT
            if (!imageUrl) {
              try {
                const connection = new Connection(BLOCKCHAIN_CONFIG.SOLANA_RPC);
                const metaplex = Metaplex.make(connection);
                const mintPk = new PublicKey(result.nftAddress);
                const asset = await metaplex.nfts().findByMint({ mintAddress: mintPk });
                name = name || (asset as any).name || "";
                const uri = (asset as any).uri;
                if (uri) {
                  try {
                    const resp = await fetch(uri);
                    const json = await resp.json();
                    name = json.name || name;
                    imageUrl = normalizeNftImageUrl(json.image || json.image_url || json?.properties?.files?.[0]?.uri);
                  } catch {}
                }
              } catch {}
            }

            // Finalize detail data with fallbacks
            const finalName = name || shortenAddress(result.nftAddress);
            setNftDetailData({ name: finalName, imageUrl, address: result.nftAddress });
          } catch (error) {
            console.warn("⚠️ Could not fetch NFT details via chain:", error);
            setNftDetailData({ name: shortenAddress(result.nftAddress), imageUrl: "", address: result.nftAddress });
          }
        }

        // Đồng bộ số liệu từ Metaplex ngay và sau 2s
        if (candyMachineAddress) {
          try { await refreshStats(candyMachineAddress); } catch {}
          setTimeout(() => refreshStats(candyMachineAddress), 2000);
        }
      } else {
        // Handle error result from backend
        const message = result.message || "Failed to send transaction";

        if (
          message?.includes("User rejected") ||
          message?.includes("rejected")
        ) {
          showWarning(
            "Transaction Cancelled",
            "You cancelled the transaction signing in your wallet. Please try again if you want to mint NFT.",
            6000
          );
        } else if (message?.includes("insufficient")) {
          showError(
            "Insufficient SOL",
            "Your wallet doesn't have enough SOL balance to mint. Please add more SOL to your wallet.",
            8000
          );
        } else if (message?.includes("sold out")) {
          showInfo(
            "Sold Out",
            "Sorry, all NFTs have been minted out. Stay tuned for information about the next mint drop!",
            8000
          );
        } else if (message?.includes("not active")) {
          showInfo(
            "Mint Not Active",
            "Minting is not currently active. Please wait for official announcement.",
            6000
          );
        } else {
          // General error
          showError(
            "Mint Failed",
            message || "Failed to mint NFT. Please try again.",
            6000
          );
        }
      }
    } catch (error: any) {
      console.error("❌ Mint failed:", error);
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
  };

  const handleMintClick = () => {
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
          mintedImageUrl={nftDetailData?.imageUrl}
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
    return {
      props: {},
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
