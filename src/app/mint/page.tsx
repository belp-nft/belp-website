"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { usePageLoading } from "@/hooks/usePageLoading";
import PageLoading from "@/components/PageLoading";

import { NftService, UserService } from "@/services";
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

const cats = [
  "token-nft-1.svg",
  "token-nft-2.svg",
  "token-nft-3.svg",
  "token-nft-4.svg",
];

const BelpyMintPage = () => {
  const router = useRouter();
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
  }, [candyMachineAddress]); // Use stable address selector

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

      console.log("Creating unsigned transaction...");
      const buildResult = await NftService.buildMintTransaction(
        candyMachineAddress,
        solAddress
      );

      console.log("Build result:", buildResult);

      let unsignedTx;
      if (buildResult.unsignedTx) {
        unsignedTx = buildResult.unsignedTx;
      } else if (buildResult.success && buildResult.data?.unsignedTx) {
        unsignedTx = buildResult.data.unsignedTx;
      } else {
        console.error("Invalid build response format:", buildResult);
        throw new Error(
          `Failed to build transaction: ${
            buildResult.message ||
            buildResult.note ||
            "No unsigned transaction returned"
          }`
        );
      }

      if (!unsignedTx) {
        throw new Error("Empty unsigned transaction received");
      }
      console.log("Unsigned transaction created, length:", unsignedTx.length);

      console.log("Verifying transaction...");
      const binaryString = atob(unsignedTx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { Transaction } = await import("@solana/web3.js");
      const tx = Transaction.from(bytes);

      console.log("- Fee payer:", tx.feePayer?.toBase58());
      console.log("- Number of signatures:", tx.signatures.length);
      console.log("- Number of instructions:", tx.instructions.length);

      console.log("Signing transaction with wallet...");
      if (!connectedWallet) {
        throw new Error("No wallet connected");
      }
      const sol = getWalletProvider(connectedWallet);
      if (!sol || !sol.signTransaction) {
        throw new Error("Wallet does not support transaction signing");
      }

      const signedTransaction = await sol.signTransaction(tx);
      console.log("Transaction signed");

      console.log("Sending signed transaction...");
      const signedTxBase64 = signedTransaction
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      const sendResult = await NftService.sendSignedTransaction(
        signedTxBase64,
        solAddress,
        candyMachineAddress
      );

      console.log("Backend send response:", sendResult);

      let transactionSignature, nftAddressResult;

      if (sendResult.success && sendResult.signature) {
        transactionSignature = sendResult.signature;
        nftAddressResult = sendResult.nftAddress;
      } else {
        console.error("Invalid send response format:", sendResult);
        throw new Error(
          sendResult.error || sendResult.message || "Send transaction failed"
        );
      }

      if (transactionSignature) {
        console.log("MINT SUCCESSFUL!");
        console.log("Transaction signature:", transactionSignature);
        console.log("View on Solana Explorer:");
        console.log(
          `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
        );

        setNftAddress(nftAddressResult);

        const randomCat = Math.floor(Math.random() * cats.length);
        setSelectedCat(randomCat);

        if (authToken) {
          try {
            console.log("Saving transaction to backend...");
            await UserService.saveTransaction({
              walletAddress: solAddress,
              transactionSignature: transactionSignature,
              candyMachineAddress: candyMachineAddress,
              timestamp: new Date().toISOString(),
            });
            console.log("Transaction saved to backend");

            if (loadUserData) {
              await loadUserData(solAddress);
            }
          } catch (saveError) {
            console.error("Failed to save transaction to backend:", saveError);
          }
        }

        try {
          console.log("Refreshing SOL balance after mint...");
          await refreshSolBalance();
          console.log("SOL balance refreshed successfully");
        } catch (balanceError) {
          console.error("Failed to refresh SOL balance:", balanceError);
        }

        try {
          console.log("Fetching NFT details from backend...");
          const nftData = await NftService.getNftDetails(nftAddressResult);

          if (nftData && nftData.success && nftData.nft) {
            console.log("NFT details loaded:", nftData.nft);
            setNftDetailData(nftData.nft);

            if (nftData.nft.name) {
              console.log("NFT Name:", nftData.nft.name);
            }
          } else {
            console.log("NFT details response format unexpected:", nftData);
          }
        } catch (nftError) {
          console.error("Failed to fetch NFT details:", nftError);
        }

        // Increment minted count in store
        incrementMinted();

        // Refresh stats from API after a delay
        setTimeout(async () => {
          try {
            await refreshStats(candyMachineAddress);
          } catch (error) {
            console.error("Failed to refresh stats after mint:", error);
          }
        }, 2000);

        setMintSuccess(true);
        setShowMintModal(false);
        setShowSuccessModal(true);

        console.log(
          `View transaction: https://solscan.io/tx/${transactionSignature}?cluster=devnet`
        );
      } else {
        console.log("MINT FAILED!");
        console.log("Error:", sendResult.message);
        throw new Error(sendResult.message || "Mint failed");
      }
    } catch (error: any) {
      console.error("ERROR:", error.message);
      console.error("Stack trace:", error.stack);

      let errorMessage = error.message;
      if (
        error.message.includes("0x1") ||
        error.message.includes("insufficient")
      ) {
        errorMessage = "Insufficient SOL for transaction fee";
      } else if (
        error.message.includes("0x2") ||
        error.message.includes("empty")
      ) {
        errorMessage = "Candy machine is out of NFTs";
      } else if (
        error.message.includes("0x3") ||
        error.message.includes("not live")
      ) {
        errorMessage = "Mint period has not started yet";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "User cancelled the transaction";
      } else if (
        error.message.includes("account of type [CandyMachine] was not found")
      ) {
        errorMessage =
          "Candy Machine not found. Using demo mode for testing. Contact support for real mint setup.";
      } else if (error.message.includes("Wallet not connected")) {
        errorMessage = "Please connect your wallet first";
      } else if (error.message.includes("sold out")) {
        errorMessage = "Sorry! This collection is sold out.";
      } else if (error.message.includes("Insufficient funds")) {
        errorMessage =
          "Insufficient SOL balance for minting. You can get devnet SOL from faucet for testing.";
      }

      alert("❌ " + errorMessage);
    } finally {
      setIsMinting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setMintSuccess(false);
    setSelectedCat(null);
  };

  const handleMintClick = () => {
    if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
      return;
    }
    setShowMintModal(true);
  };

  return (
    <div className="bg-[url('/images/mint/background.png')] bg-no-repeat bg-cover pt-24 pb-16 min-h-[calc(100vh-64px)]">
      <motion.div
        className="main-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <MintHeader />

        <MintSection
          minted={minted}
          supply={supply}
          isMinting={isMinting}
          mintSuccess={mintSuccess}
          selectedCat={selectedCat}
          cats={cats}
          onMintClick={handleMintClick}
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

export default BelpyMintPage;
