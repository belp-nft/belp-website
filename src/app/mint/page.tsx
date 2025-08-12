"use client";

import React, { useEffect, useState } from "react";
import { Metaplex } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";

import { NftService, UserService, ConfigService } from "@/services";
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

const RPC_URL = "https://api.devnet.solana.com"; // Sử dụng devnet cho testing

const BelpyMintPage = () => {
  const router = useRouter();
  const {
    solAddress,
    connectPhantom,
    refreshSolBalance,
    getSolanaProvider,
    authToken,
    loadUserData,
  } = useWallet();

  const [minted, setMinted] = useState<number>(0);
  const [supply, setSupply] = useState<number>(0);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintSuccess, setMintSuccess] = useState<boolean>(false);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [showMintModal, setShowMintModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [mintedNftId, setMintedNftId] = useState<string>("");
  const [currentCandyMachineId, setCurrentCandyMachineId] =
    useState<string>("");
  const [candyMachineConfig, setCandyMachineConfig] = useState<any>(null);

  // Auto-refresh stats every 30 seconds từ API
  useEffect(() => {
    if (!currentCandyMachineId) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing candy machine stats...");
        const result = await ConfigService.getCandyMachineConfig(
          currentCandyMachineId
        );

        if (result.success && result.data) {
          const totalProcessed = result.data.totalProcessed || 0;
          const totalSupply = result.data.itemsAvailable || 10;

          setMinted(totalProcessed);
          setSupply(totalSupply);
          console.log("✅ Stats refreshed from API:", {
            minted: totalProcessed,
            supply: totalSupply,
          });
        }
      } catch (error) {
        console.error("⚠️ Failed to auto-refresh stats:", error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentCandyMachineId]);

  // Load candy machine config từ backend - dựa trên logic index.html
  useEffect(() => {
    const loadCandyMachineConfig = async () => {
      try {
        console.log("📋 Loading candy machine config from backend...");
        const result = await ConfigService.getCandyMachineConfig();

        if (result.success && result.data) {
          console.log("✅ Candy machine config loaded:", result.data);
          setCandyMachineConfig(result.data);
          setCurrentCandyMachineId(result.data.address);

          // Update stats từ backend config
          const totalProcessed = result.data.totalProcessed || 0;
          const totalSupply = 10; // Hoặc từ config
          const remaining = Math.max(0, totalSupply - totalProcessed);

          setMinted(totalProcessed);
          setSupply(totalSupply);
        } else {
          console.warn(
            "⚠️ Failed to load candy machine config, using localStorage"
          );
          // Fallback to localStorage
        }
      } catch (error) {
        console.error("❌ Error loading candy machine config:", error);
        // Fallback to localStorage
      }
    };

    loadCandyMachineConfig();
  }, []);

  useEffect(() => {
    const fetchCandyMachine = async () => {
      try {
        // Check if candy machine ID is configured
        if (
          !currentCandyMachineId ||
          currentCandyMachineId === "11111111111111111111111111111112"
        ) {
          console.log("CANDY_MACHINE_ID not configured, using mock data");
          setMinted(1234); // Mock data cho demo
          setSupply(5000); // Mock data cho demo
          return;
        }

        // Check if this is a generated BELPY Candy Machine ID or any other candy machine
        if (currentCandyMachineId.includes("BELPY") || candyMachineConfig) {
          console.log("Using candy machine config from API");

          // Get stats từ candy machine config đã load từ API
          if (candyMachineConfig) {
            const totalProcessed = candyMachineConfig.totalProcessed || 0;
            const totalSupply = candyMachineConfig.itemsAvailable || 10;

            setMinted(totalProcessed);
            setSupply(totalSupply);
            console.log("✅ Stats loaded from config:", {
              minted: totalProcessed,
              supply: totalSupply,
            });
          }
          return;
        }

        // Validate CANDY_MACHINE_ID format
        try {
          new PublicKey(currentCandyMachineId);
        } catch (e) {
          console.error(
            "Invalid CANDY_MACHINE_ID format:",
            currentCandyMachineId
          );
          setMinted(1234); // Fallback to mock data
          setSupply(5000);
          return;
        }

        const connection = new Connection(RPC_URL);

        // Check if account exists first
        const accountInfo = await connection.getAccountInfo(
          new PublicKey(currentCandyMachineId)
        );
        if (!accountInfo) {
          console.warn("Candy Machine account not found, using mock data");
          setMinted(1234);
          setSupply(5000);
          return;
        }

        const metaplex = new Metaplex(connection);
        console.log("🚀 ~ fetchCandyMachine ~ metaplex:", metaplex);

        const candyMachine = await metaplex.candyMachines().findByAddress({
          address: new PublicKey(currentCandyMachineId),
        });

        console.log("🚀 ~ fetchCandyMachine ~ candyMachine:", candyMachine);
        setMinted(candyMachine.itemsMinted || 0);
        setSupply(candyMachine.itemsAvailable || 0);
      } catch (e) {
        console.log("🚀 ~ fetchCandyMachine ~ error:", e);
        // Fallback to mock data on any error
        setMinted(1234);
        setSupply(5000);
      }
    };

    // Only fetch when currentCandyMachineId is available
    if (currentCandyMachineId) {
      fetchCandyMachine();
    }
  }, [currentCandyMachineId]);

  // Mint NFT dựa trên logic từ index.html
  const handleMint = async () => {
    setIsMinting(true);
    setMintSuccess(false);

    try {
      // Bước 1: Kiểm tra kết nối ví
      if (!solAddress) {
        console.log("👛 Wallet not connected, attempting to connect...");
        await connectPhantom();
        return;
      }

      // Bước 2: Kiểm tra candy machine config
      if (!candyMachineConfig) {
        throw new Error("Chưa tải được cấu hình Candy Machine!");
      }

      console.log("🚀 Bắt đầu mint NFT...");
      console.log("📦 Candy Machine:", candyMachineConfig.address);
      console.log("👛 Buyer wallet:", solAddress);

      // Bước 3: Tạo unsigned transaction thông qua backend
      console.log("📝 Bước 1: Tạo unsigned transaction...");
      const buildResult = await NftService.buildMintTransaction(
        candyMachineConfig.address,
        solAddress
      );

      console.log("🔍 Build result:", buildResult);

      // Handle different response formats từ backend
      let unsignedTx;
      if (buildResult.unsignedTx) {
        // Format: { unsignedTx: string, note?: string }
        unsignedTx = buildResult.unsignedTx;
      } else if (buildResult.success && buildResult.data?.unsignedTx) {
        // Format: { success: true, data: { unsignedTx: string } }
        unsignedTx = buildResult.data.unsignedTx;
      } else {
        // Không tìm thấy unsignedTx
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
      console.log("✅ Đã tạo unsigned transaction, length:", unsignedTx.length);

      // Bước 4: Deserialize và kiểm tra transaction
      console.log("📋 Bước 2: Kiểm tra transaction...");
      const binaryString = atob(unsignedTx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Import Transaction từ @solana/web3.js
      const { Transaction } = await import("@solana/web3.js");
      const tx = Transaction.from(bytes);

      console.log("- Fee payer:", tx.feePayer?.toBase58());
      console.log("- Số signatures:", tx.signatures.length);
      console.log("- Số instructions:", tx.instructions.length);

      // Bước 5: Ký transaction với wallet
      console.log("✍️ Bước 3: Ký transaction với ví...");
      const sol = getSolanaProvider();
      if (!sol || !sol.signTransaction) {
        throw new Error("Wallet không hỗ trợ signing transaction");
      }

      const signedTransaction = await sol.signTransaction(tx);
      console.log("✅ Đã ký transaction");

      // Bước 6: Serialize và gửi transaction
      console.log("📤 Bước 4: Gửi signed transaction...");
      const signedTxBase64 = signedTransaction
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      const sendResult = await NftService.sendSignedTransaction(
        signedTxBase64,
        solAddress,
        candyMachineConfig.address
      );

      console.log("Backend send response:", sendResult);

      // Handle different response formats cho send transaction
      let transactionSignature, nftAddress;

      if (sendResult.success && sendResult.signature) {
        // Standard format
        transactionSignature = sendResult.signature;
        nftAddress = sendResult.nftAddress;
      } else {
        console.error("Invalid send response format:", sendResult);
        throw new Error(
          sendResult.error || sendResult.message || "Send transaction failed"
        );
      }

      if (transactionSignature) {
        console.log("🎉 MINT THÀNH CÔNG!");
        console.log("📝 Transaction signature:", transactionSignature);
        console.log("🔗 Xem trên Solana Explorer:");
        console.log(
          `   https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
        );

        console.log("🚀 ~ handleMint ~ nftAddress:", nftAddress);

        const realNftId = `#${nftAddress.slice(-4).toUpperCase()}`;
        setMintedNftId(realNftId);

        const randomCat = Math.floor(Math.random() * cats.length);
        setSelectedCat(randomCat);

        // Bước 7: Lưu transaction vào backend
        if (authToken) {
          try {
            console.log("💾 Saving transaction to backend...");
            await UserService.saveTransaction({
              walletAddress: solAddress,
              transactionSignature: transactionSignature, // Sử dụng variable đã parsed
              candyMachineAddress: candyMachineConfig.address,
              timestamp: new Date().toISOString(),
            });
            console.log("✅ Transaction saved to backend");

            // Reload user data để cập nhật statistics
            if (loadUserData) {
              await loadUserData(solAddress);
            }
          } catch (saveError) {
            console.error(
              "⚠️ Failed to save transaction to backend:",
              saveError
            );
          }
        }

        // Bước 8: Refresh SOL balance sau khi mint
        try {
          console.log("💰 Refreshing SOL balance after mint...");
          await refreshSolBalance();
          console.log("✅ SOL balance refreshed successfully");
        } catch (balanceError) {
          console.error("⚠️ Failed to refresh SOL balance:", balanceError);
          // Không throw error ở đây vì mint đã thành công
        }

        // Bước 9: Lấy thông tin chi tiết NFT từ backend
        try {
          console.log("📊 Fetching NFT details from backend...");
          const nftData = await NftService.getNftDetails(nftAddress);

          if (nftData && nftData.success && nftData.nft) {
            console.log("✅ NFT details loaded:", nftData.nft);

            // Chỉ log thông tin NFT, không lưu gì cả
            if (nftData.nft.name) {
              console.log("🏷️ NFT Name:", nftData.nft.name);
            }
          } else {
            console.log("⚠️ NFT details response format unexpected:", nftData);
          }
        } catch (nftError) {
          console.error("⚠️ Failed to fetch NFT details:", nftError);
          // Không throw error ở đây vì mint đã thành công
        }

        // Cập nhật stats từ API
        setMinted((prev) => {
          const newMinted = prev + 1;

          // Refresh candy machine config để có stats mới nhất
          ConfigService.getCandyMachineConfig(currentCandyMachineId)
            .then((result) => {
              if (result.success && result.data) {
                const totalProcessed = result.data.totalProcessed || newMinted;
                setMinted(totalProcessed);
                console.log("✅ Stats updated from API after mint:", {
                  minted: totalProcessed,
                });
              }
            })
            .catch((error) => {
              console.error("⚠️ Failed to refresh stats after mint:", error);
            });

          return newMinted;
        });

        setMintSuccess(true);
        setShowMintModal(false);
        setShowSuccessModal(true);

        // Show success message with transaction link
        console.log(
          `View transaction: https://solscan.io/tx/${transactionSignature}?cluster=devnet`
        );
      } else {
        console.log("❌ MINT THẤT BẠI!");
        console.log("Lỗi:", sendResult.message);
        throw new Error(sendResult.message || "Mint thất bại");
      }
    } catch (error: any) {
      console.error("\n❌ LỖI:", error.message);
      console.error("Stack trace:", error.stack);

      // Phân tích lỗi chi tiết giống như trong index.html
      let errorMessage = error.message;
      if (
        error.message.includes("0x1") ||
        error.message.includes("insufficient")
      ) {
        errorMessage = "💡 Không đủ SOL để trả phí giao dịch";
      } else if (
        error.message.includes("0x2") ||
        error.message.includes("empty")
      ) {
        errorMessage = "💡 Candy machine đã hết NFT";
      } else if (
        error.message.includes("0x3") ||
        error.message.includes("not live")
      ) {
        errorMessage = "💡 Chưa đến thời gian mint";
      } else if (error.message.includes("User rejected")) {
        errorMessage = "👤 Người dùng đã hủy giao dịch";
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
    setMintedNftId("");
  };

  const handleMintClick = () => {
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
          candyMachineId={currentCandyMachineId}
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
          mintedNftId={mintedNftId}
          onClose={handleSuccessModalClose}
          onViewDetails={() => {
            router.push(`/my-collection/${mintedNftId.replace("#", "")}`);
            handleSuccessModalClose();
          }}
          onViewHistory={() => {
            handleSuccessModalClose();
          }}
        />
      </motion.div>
    </div>
  );
};

export default BelpyMintPage;
