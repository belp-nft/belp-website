"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useWalletContext } from "./WalletProvider";
import { useConfig, useCollectionAddress } from "@/stores/config";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  CandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  fetchCollection,
  CollectionV1,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  transactionBuilder,
  publicKey as umiPublicKey,
  sol,
  Umi,
} from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { useToast } from "@/components/ToastContainer";

export interface MintResult {
  success: boolean;
  signature?: string;
  nftAddress?: string;
  message: string;
  errorType?: string;
}

interface CandyMachineState {
  isMinting: boolean;
  lastMintResult: MintResult | null;
  mintCount: number;
  error: string | null;
  // Candy Machine data
  candyMachine: CandyMachine | null;
  collection: CollectionV1 | null;
  umi: Umi | null;
  isInitialized: boolean;
  isLoading: boolean;
  itemsLoaded: number;
  itemsRedeemed: number;
}

interface CandyMachineContextType extends CandyMachineState {
  // Actions
  mintNft: () => Promise<MintResult>;
  clearLastResult: () => void;
  clearError: () => void;
  resetState: () => void;
  initializeCandyMachine: () => Promise<void>;
  fetchCollection: () => Promise<void>;

  // Config
  candyMachineAddress: string;
  collectionAddress: string;
  updateAuthority: string;
}

const CandyMachineContext = createContext<CandyMachineContextType | null>(null);

interface CandyMachineProviderProps {
  children: ReactNode;
  config?: {
    enableDebug?: boolean;
    autoResetAfter?: number; // milliseconds
  };
}

const initialState: CandyMachineState = {
  isMinting: false,
  lastMintResult: null,
  mintCount: 0,
  error: null,
  candyMachine: null,
  collection: null,
  umi: null,
  isInitialized: false,
  isLoading: false,
  itemsLoaded: 0,
  itemsRedeemed: 0,
};

// Helper function để lấy transaction details từ Solana RPC
async function getTransactionFromRPC(
  signature: string,
  rpcEndpoint: string = "https://api.devnet.solana.com"
) {
  try {
    const response = await fetch(rpcEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          signature,
          {
            commitment: "confirmed",
            encoding: "json",
            maxSupportedTransactionVersion: 0,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `RPC request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    console.error("Failed to fetch transaction from RPC:", error);
    throw error;
  }
}

export function CandyMachineProvider({
  children,
  config = {},
}: CandyMachineProviderProps) {
  const [state, setState] = useState<CandyMachineState>(initialState);
  const { solAddress, connectedWallet } = useWalletContext();
  const { showError } = useToast()

  // Get config from store
  const configData = useConfig();
  const collectionAddress = useCollectionAddress();

  const {
    enableDebug = false,
    autoResetAfter = 10000, // 10 seconds
  } = config;

  const log = useCallback(
    (...args: any[]) => {
      if (enableDebug) {
        console.log("[CandyMachineProvider]", ...args);
      }
    },
    [enableDebug]
  );

  // Fetch Collection data
  const fetchCollectionData = useCallback(async () => {
    if (!state.umi) {
      log("UMI not initialized, cannot fetch collection");
      return;
    }

    log("Fetching Collection...");

    try {
      const collection = await fetchCollection(
        state.umi,
        umiPublicKey(collectionAddress || configData?.collectionAddress || "")
      );

      log("✅ Collection fetched:", {
        address: collection.publicKey,
        name: collection.name,
        uri: collection.uri,
      });

      setState((prev) => ({
        ...prev,
        collection,
      }));
    } catch (error: any) {
      log("❌ Failed to fetch Collection:", error);
      // Don't set error state for collection fetch failure
      // as it's not critical for minting
    }
  }, [state.umi, log]);

  // Initialize UMI and Candy Machine
  const initializeCandyMachine = useCallback(async () => {
    if (!solAddress || !connectedWallet || state.isLoading || !configData) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    log("Initializing Candy Machine...");

    try {
      // Lấy wallet provider từ window với fallback
      let walletProvider = null;

      // Thử các wallet providers phổ biến
      if ((window as any).solana && (window as any).solana.isPhantom) {
        walletProvider = (window as any).solana;
        log("🔍 Found Phantom wallet");
      } else if ((window as any).phantom?.solana) {
        walletProvider = (window as any).phantom.solana;
        log("🔍 Found Phantom wallet (alt path)");
      } else if ((window as any).solflare) {
        walletProvider = (window as any).solflare;
        log("🔍 Found Solflare wallet");
      } else if ((window as any).backpack) {
        walletProvider = (window as any).backpack;
        log("🔍 Found Backpack wallet");
      } else if ((window as any).glow) {
        walletProvider = (window as any).glow;
        log("🔍 Found Glow wallet");
      } else if ((window as any).okxwallet?.solana) {
        walletProvider = (window as any).okxwallet.solana;
        log("🔍 Found OKX wallet");
      } else if ((window as any).solana) {
        walletProvider = (window as any).solana;
        log("🔍 Found generic Solana wallet");
      }

      // Fallback: thử sử dụng connectedWallet nếu có methods cần thiết
      if (
        !walletProvider &&
        connectedWallet &&
        (connectedWallet as any).signTransaction
      ) {
        walletProvider = connectedWallet;
        log("🔍 Using connectedWallet as fallback");
      }

      // Final fallback: tìm bất kỳ wallet provider nào có signTransaction
      if (!walletProvider) {
        const allSolanaProviders = [
          (window as any).solana,
          (window as any).phantom,
          (window as any).solflare,
          (window as any).backpack,
          (window as any).glow,
          (window as any).okxwallet,
        ].filter(Boolean);

        for (const provider of allSolanaProviders) {
          if (provider && provider.signTransaction) {
            walletProvider = provider;
            log("🔍 Found compatible wallet provider via fallback search");
            break;
          }
        }
      }

      if (!walletProvider) {
        throw new Error(
          "Wallet provider not found! Please make sure your wallet is installed and connected."
        );
      }

      // Kiểm tra wallet provider có hỗ trợ signing không
      if (!walletProvider.signTransaction) {
        throw new Error(
          "Wallet does not support transaction signing. Please use a compatible wallet."
        );
      }

      // Debug wallet provider info
      log("Using wallet provider:", {
        isPhantom: walletProvider.isPhantom,
        isSolflare: walletProvider.isSolflare,
        isBackpack: walletProvider.isBackpack,
        hasSignTransaction: !!walletProvider.signTransaction,
        hasSignAllTransactions: !!walletProvider.signAllTransactions,
        publicKey: walletProvider.publicKey?.toString?.(),
        connected: walletProvider.connected,
      });

      // Tạo wallet adapter cho UMI
      const walletAdapter = {
        publicKey: new PublicKey(solAddress),
        signTransaction: walletProvider.signTransaction.bind(walletProvider),
        signAllTransactions:
          walletProvider.signAllTransactions?.bind(walletProvider),
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        connected: true,
      };

      // Khởi tạo UMI
      const rpcEndpoint = configData.rpcUrl || "https://api.devnet.solana.com";
      log("✅ UMI initialized with rpcEndpoint:", rpcEndpoint);
      const umi = createUmi(rpcEndpoint)
        .use(mplCandyMachine())
        .use(mplCore())
        .use(walletAdapterIdentity(walletAdapter));

      log("✅ UMI initialized");
      // Fetch Candy Machine
      const candyMachine = await fetchCandyMachine(
        umi,
        umiPublicKey(configData.address || "")
      );

      log("✅ Candy Machine fetched:", {
        address: candyMachine.publicKey,
        itemsLoaded: candyMachine.itemsLoaded,
        itemsRedeemed: candyMachine.itemsRedeemed,
      });

      setState((prev) => ({
        ...prev,
        umi,
        candyMachine,
        isInitialized: true,
        isLoading: false,
        itemsLoaded: Number(candyMachine.itemsLoaded),
        itemsRedeemed: Number(candyMachine.itemsRedeemed),
      }));

      // Fetch Collection after Candy Machine is initialized
      setTimeout(() => {
        fetchCollectionData();
      }, 100);
    } catch (error: any) {
      log("❌ Failed to initialize Candy Machine:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to initialize Candy Machine",
      }));
    }
  }, [solAddress, connectedWallet, state.isLoading, log, fetchCollectionData]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (
      solAddress &&
      connectedWallet &&
      !state.isInitialized &&
      !state.isLoading
    ) {
      initializeCandyMachine();
    }
  }, [
    solAddress,
    connectedWallet,
    state.isInitialized,
    state.isLoading,
    initializeCandyMachine,
  ]);

  const clearLastResult = useCallback(() => {
    setState((prev) => ({ ...prev, lastMintResult: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const mintNft = useCallback(async (): Promise<MintResult> => {
    if (!solAddress || !connectedWallet || !configData) {
      const result: MintResult = {
        success: false,
        message: "Wallet not connected",
        errorType: "warning",
      };
      setState((prev) => ({
        ...prev,
        lastMintResult: result,
        error: result.message,
      }));

      return result;
    }

    if (!state.umi || !state.candyMachine || !state.isInitialized) {
      const result: MintResult = {
        success: false,
        message: "Candy Machine not initialized",
        errorType: "error",
      };

      setState((prev) => ({
        ...prev,
        lastMintResult: result,
        error: result.message,
      }));

      return result;
    }

    if (state.isMinting) {
      const result: MintResult = {
        success: false,
        message: "Minting NFT, please wait...",
        errorType: "info",
      };

      return result;
    }

    setState((prev) => ({
      ...prev,
      isMinting: true,
      error: null,
      lastMintResult: null,
    }));

    log("Starting mint for wallet:", solAddress);

    try {
      // Kiểm tra candy machine còn NFT không
      if (state.candyMachine.itemsRedeemed >= state.candyMachine.itemsLoaded) {
        throw new Error("Belp Candy Machine sold out!");
      }

      // Tạo NFT mint signer
      const nftMint = generateSigner(state.umi);
      log("🎯 Generated NFT mint:", nftMint.publicKey);

      // Tạo mint instruction
      log("🔨 Building mint transaction...");
      const mintBuilder = transactionBuilder().add(
        mintV2(state.umi, {
          candyMachine: umiPublicKey(configData?.address || ""),
          nftMint,
          collectionMint: state.candyMachine.collectionMint,
          collectionUpdateAuthority: state.candyMachine.authority,
          tokenStandard: state.candyMachine.tokenStandard,
          mintArgs: {
            solPayment: {
              destination: umiPublicKey(configData?.updateAuthority || ""),
            },
          },
        })
      );

      log("📝 Sending and confirming Belp NFT transaction...");

      // Gửi và confirm transaction với error handling
      const result = await mintBuilder.sendAndConfirm(state.umi, {
        confirm: { commitment: "confirmed" },
        send: {
          skipPreflight: true, // Skip preflight to avoid simulation issues
          maxRetries: 3,
        },
      });

      const base58Signature = bs58.encode(result.signature);
      let transactionDetails: any;
      // Tùy chọn: Lấy thông tin chi tiết transaction từ RPC
      try {
        const rpcEndpoint =
          configData?.rpcUrl || "https://api.devnet.solana.com";
        transactionDetails = await getTransactionFromRPC(
          base58Signature,
          rpcEndpoint
        );
        if (transactionDetails) {
          log("📋 Transaction details from RPC:", transactionDetails);
        }
      } catch (rpcError) {
        log("⚠️ Failed to fetch transaction details from RPC:", rpcError);
        // Không throw error vì đây chỉ là thông tin bổ sung
      }

      const mintResult: MintResult = {
        success: true,
        signature: transactionDetails.transaction.signatures[0] || "",
        nftAddress: nftMint.publicKey.toString(),
        message: "Belp NFT minted successfully! 🐱",
      };

      setState((prev) => ({
        ...prev,
        isMinting: false,
        lastMintResult: mintResult,
        mintCount: prev.mintCount + 1,
        error: null,
        // Update candy machine stats
        itemsRedeemed: prev.itemsRedeemed + 1,
      }));

      // Auto clear result after specified time
      if (autoResetAfter > 0) {
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            lastMintResult: null,
            error: null,
          }));
        }, autoResetAfter);
      }

      // Update local state instead of refreshing
      // The itemsRedeemed is already updated above

      return mintResult;
    } catch (error: any) {
      log("❌ Belp NFT mint failed:", error);

      // Try to get detailed logs if it's a SendTransactionError
      if (error.getLogs && typeof error.getLogs === "function") {
        try {
          const logs = await error.getLogs();
          log("🔍 Transaction logs:", logs);
        } catch (logError) {
          log("❌ Failed to get transaction logs:", logError);
        }
      }

      let errorMessage = "Failed to mint Belp NFT";
      let errorType = "error";

      // Xử lý các loại lỗi khác nhau
      if (
        error.message?.includes("User rejected") ||
        error.message?.includes("rejected")
      ) {
        errorMessage = "Transaction was cancelled by user";
        errorType = "warning";
      } else if (error.message?.includes("insufficient")) {
        errorMessage =
          "Insufficient SOL balance. Please add more SOL to your wallet";
        errorType = "error";
      } else if (error.message?.includes("sold out")) {
        errorMessage = "All Belp NFTs have been sold out";
        errorType = "info";
      } else if (error.message?.includes("not active")) {
        errorMessage = "Belp NFT minting is not currently active";
        errorType = "info";
      } else if (error.message?.includes("blockhash")) {
        errorMessage = "Network congestion. Please try again";
        errorType = "warning";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Transaction timeout. Please try again";
        errorType = "warning";
      } else if (
        error.message?.includes("simulation failed") ||
        error.message?.includes("Simulation failed")
      ) {
        errorMessage =
          "Transaction simulation failed. Please try again or check your wallet balance";
        errorType = "warning";
      } else if (error.message?.includes("deserialize")) {
        errorMessage = "Transaction format error. Please refresh and try again";
        errorType = "warning";
      } else if (error.message) {
        errorMessage = error.message;
      }

      const result: MintResult = {
        success: false,
        message: errorMessage,
        errorType,
      };

      // Hiển thị lỗi bằng toast
      showError("Mint Error", errorMessage);

      setState((prev) => ({
        ...prev,
        isMinting: false,
        lastMintResult: result,
        error: result.message,
      }));

      return result;
    }
  }, [
    solAddress,
    connectedWallet,
    state.umi,
    state.candyMachine,
    state.isInitialized,
    state.isMinting,
    log,
    autoResetAfter,
    showError,
    configData,
  ]);

  const contextValue: CandyMachineContextType = {
    ...state,
    mintNft,
    clearLastResult,
    clearError,
    resetState,
    initializeCandyMachine,
    fetchCollection: fetchCollectionData,
    candyMachineAddress: configData?.address || "",
    collectionAddress: collectionAddress || configData?.collectionAddress || "",
    updateAuthority: configData?.updateAuthority || "",
  };

  return (
    <CandyMachineContext.Provider value={contextValue}>
      {children}
    </CandyMachineContext.Provider>
  );
}

export function useCandyMachineContext() {
  const context = useContext(CandyMachineContext);
  if (!context) {
    throw new Error(
      "useCandyMachineContext must be used within CandyMachineProvider"
    );
  }
  return context;
}

// Simplified hook for components that just need mint functionality
export function useCandyMachine() {
  const {
    isMinting,
    lastMintResult,
    mintCount,
    error,
    isInitialized,
    isLoading,
    itemsLoaded,
    itemsRedeemed,
    collection,
    mintNft,
    clearLastResult,
    clearError,
    initializeCandyMachine,
    fetchCollection: fetchCollectionData,
  } = useCandyMachineContext();

  return {
    // State
    isMinting,
    lastMintResult,
    mintCount,
    error,
    isInitialized,
    isLoading,
    itemsLoaded,
    itemsRedeemed,
    collection,

    // Actions
    mint: mintNft,
    clearResult: clearLastResult,
    clearError,
    initialize: initializeCandyMachine,
    fetchCollection: fetchCollectionData,

    // Computed
    canMint: !isMinting && isInitialized,
    hasError: !!error,
    hasMinted: mintCount > 0,
    soldOut: itemsRedeemed >= itemsLoaded,
    remaining: Math.max(0, itemsLoaded - itemsRedeemed),
  };
}

// Hook for candy machine info only
export function useCandyMachineInfo() {
  const {
    candyMachineAddress,
    collectionAddress,
    updateAuthority,
    mintCount,
    itemsLoaded,
    itemsRedeemed,
    isInitialized,
  } = useCandyMachineContext();

  return {
    candyMachineAddress,
    collectionAddress,
    updateAuthority,
    totalMinted: mintCount,
    supply: itemsLoaded,
    minted: itemsRedeemed,
    remaining: Math.max(0, itemsLoaded - itemsRedeemed),
    isReady: isInitialized,
  };
}

// Hook for mint status tracking
export function useMintStatus() {
  const { isMinting, lastMintResult, error } = useCandyMachineContext();

  return {
    isMinting,
    lastResult: lastMintResult,
    error,
    isSuccess: lastMintResult?.success === true,
    isError: lastMintResult?.success === false,
  };
}
