"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useWalletContext } from "./WalletProvider";
import {
  useConfig,
  useCollectionAddress,
  useFetchConfig,
  useConfigLoading,
  useConfigError,
} from "@/stores/config";
import { PublicKey, Connection } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  CandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { CollectionV1, mplCore } from "@metaplex-foundation/mpl-core";
import {
  generateSigner,
  transactionBuilder,
  publicKey as umiPublicKey,
  Umi,
} from "@metaplex-foundation/umi";
import bs58 from "bs58";
import { useToast } from "@/components/ToastContainer";
import { UserService } from "@/services/userService";

// Helper function to detect wallet capabilities
// This helps us choose the appropriate transaction method to avoid Phantom warnings
const getWalletCapabilities = (provider: any) => {
  return {
    hasSignAndSendTransaction: !!provider?.signAndSendTransaction,
    hasSignTransaction: !!provider?.signTransaction,
    isPhantom: !!provider?.isPhantom,
    isSolflare: !!provider?.isSolflare,
    isBackpack: !!provider?.isBackpack,
    name: provider?.isPhantom ? 'Phantom' : 
          provider?.isSolflare ? 'Solflare' : 
          provider?.isBackpack ? 'Backpack' : 'Unknown'
  };
};

// Helper function to check if NFT belongs to verified collection (same logic as in loadWalletNfts)
const isNftInVerifiedCollection = (
  nft: any,
  targetCollectionAddress: string
): boolean => {
  return (
    nft.collection &&
    nft.collection.verified &&
    nft.collection.address.toString() === targetCollectionAddress
  );
};

// Function to fetch metadata from NFT URI with enhanced error handling and retry logic
const fetchNftMetadata = async (
  uri: string,
  retries = 2,
  externalSignal?: AbortSignal
): Promise<any> => {
  if (!uri || typeof uri !== "string") {
    console.warn(`⚠️ Invalid URI provided: ${uri}`);
    return null;
  }

  try {
    console.log(`🔗 Fetching metadata from URI: ${uri}`);

    // Format IPFS URIs properly with multiple gateway options
    let formattedUri = uri;
    if (uri.startsWith("ipfs://")) {
      const ipfsHash = uri.replace("ipfs://", "");
      // Try dweb.link first, fallback to ipfs.io if needed
      formattedUri = `https://ipfs.io/ipfs/${ipfsHash}`;
    }

    console.log(`🔄 Formatted URI: ${formattedUri}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // If external signal is provided, listen for it
    if (externalSignal) {
      externalSignal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(formattedUri, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseText = await response.text();
        if (responseText.trim()) {
          const metadata = JSON.parse(responseText);
          console.log(
            `✅ Metadata fetched successfully:`,
            metadata.name || "Unnamed"
          );
          return metadata;
        } else {
          console.warn(`⚠️ Empty response from ${formattedUri}`);
        }
      } else {
        console.warn(
          `⚠️ HTTP ${response.status} ${response.statusText} for ${formattedUri}`
        );

        // Try alternative IPFS gateway if dweb.link fails
        if (formattedUri.includes("dweb.link") && retries > 0) {
          const ipfsHash = uri.replace("ipfs://", "");
          const altUri = `https://ipfs.io/ipfs/${ipfsHash}`;
          console.log(`🔄 Trying alternative gateway: ${altUri}`);
          return await fetchNftMetadata(altUri, retries - 1, externalSignal);
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.warn(`⏱️ Request timeout for ${formattedUri}`);
      } else {
        console.warn(
          `🌐 Network error for ${formattedUri}:`,
          fetchError.message
        );
      }

      // Try alternative IPFS gateway if dweb.link fails
      if (formattedUri.includes("dweb.link") && retries > 0) {
        const ipfsHash = uri.replace("ipfs://", "");
        const altUri = `https://ipfs.io/ipfs/${ipfsHash}`;
        console.log(`🔄 Trying alternative gateway after error: ${altUri}`);
        return await fetchNftMetadata(altUri, retries - 1, externalSignal);
      }

      throw fetchError;
    }

    return null;
  } catch (error: any) {
    console.error(`❌ Error fetching metadata from ${uri}:`, {
      name: error.name,
      message: error.message,
      type: typeof error,
    });
    return null;
  }
};

// Interface for simple NFT data
interface SimpleNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: any[];
  createdAt?: string;
  signature?: string; // Transaction signature for transaction view
}

// Interface for transaction history
export interface TransactionHistory {
  signature: string;
  nftAddress: string;
  nftName: string;
  nftImage: string;
  timestamp: string;
  status: "confirmed" | "finalized";
}

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
  metaplex: Metaplex | null;
  // Wallet NFTs data with pagination
  walletNfts: SimpleNFT[];
  isLoadingNfts: boolean;
  nftPage: number;
  hasMoreNfts: boolean;
  totalNfts: number;
  // Transaction history with pagination
  transactionHistory: TransactionHistory[];
  transactionCache: Map<string, TransactionHistory | null>;
  isLoadingTransactions: boolean;
  transactionPage: number;
  hasMoreTransactions: boolean;
  totalTransactions: number;
  isInitialized: boolean;
  isLoading: boolean;
  itemsLoaded: number;
  itemsRedeemed: number;
  // Config state
  configLoading: boolean;
  configError: string | null;
}

interface CandyMachineContextType extends CandyMachineState {
  // Actions
  mintNft: () => Promise<MintResult>;
  clearLastResult: () => void;
  clearError: () => void;
  resetState: () => void;
  initializeCandyMachine: () => Promise<void>;
  loadWalletNfts: (address: string, page?: number) => Promise<SimpleNFT[]>;
  loadMoreNfts: (address: string) => Promise<SimpleNFT[]>;
  clearPersistedNewlyMintedNfts: () => void;

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
  metaplex: null,
  walletNfts: [],
  isLoadingNfts: false,
  nftPage: 1,
  hasMoreNfts: true,
  totalNfts: 0,
  transactionHistory: [],
  transactionCache: new Map(),
  isLoadingTransactions: false,
  transactionPage: 1,
  hasMoreTransactions: true,
  totalTransactions: 0,
  isInitialized: false,
  isLoading: false,
  itemsLoaded: 0,
  itemsRedeemed: 0,
  configLoading: false,
  configError: null,
};

// Helper function to get newly minted NFTs from localStorage
const getNewlyMintedNftsFromStorage = (walletAddress: string): SimpleNFT[] => {
  try {
    const key = `newly_minted_nfts_${walletAddress}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to get newly minted NFTs from storage:", error);
    return [];
  }
};

// Helper function to save newly minted NFTs to localStorage
const saveNewlyMintedNftsToStorage = (
  walletAddress: string,
  nfts: SimpleNFT[]
) => {
  try {
    const key = `newly_minted_nfts_${walletAddress}`;
    localStorage.setItem(key, JSON.stringify(nfts));
  } catch (error) {
    console.warn("Failed to save newly minted NFTs to storage:", error);
  }
};

// Helper function to clear newly minted NFTs from localStorage
const clearNewlyMintedNftsFromStorage = (walletAddress: string) => {
  try {
    const key = `newly_minted_nfts_${walletAddress}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear newly minted NFTs from storage:", error);
  }
};
async function getTransactionFromRPC(
  signature: string,
  rpcEndpoint: string = "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06"
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
  const { showError } = useToast();

  // Refs to prevent multiple simultaneous calls
  const isLoadingTransactionsRef = useRef(false);
  const loadingPromiseRef = useRef<Promise<TransactionHistory[]> | null>(null);

  // AbortController refs for cancellation
  const nftLoadingAbortControllerRef = useRef<AbortController | null>(null);
  const transactionLoadingAbortControllerRef = useRef<AbortController | null>(
    null
  );

  // Ref to track newly minted NFTs that haven't been fetched from blockchain yet
  const newlyMintedNftsRef = useRef<SimpleNFT[]>([]);

  // Ref to track if we just minted an NFT to avoid immediate reload
  const justMintedRef = useRef<boolean>(false);

  // Get config from store
  const configData = useConfig();
  const collectionAddress = useCollectionAddress();
  const fetchConfig = useFetchConfig();
  const configLoading = useConfigLoading();
  const configError = useConfigError();

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

  // Initialize newly minted NFTs from localStorage when wallet connects
  useEffect(() => {
    if (solAddress) {
      const storedNfts = getNewlyMintedNftsFromStorage(solAddress);
      newlyMintedNftsRef.current = storedNfts;

      if (storedNfts.length > 0) {
        console.log(
          `🔄 Loaded ${storedNfts.length} newly minted NFTs from storage for wallet ${solAddress}`
        );

        // Update state with stored NFTs
        setState((prev) => ({
          ...prev,
          walletNfts: [
            ...storedNfts,
            ...prev.walletNfts.filter(
              (nft) => !storedNfts.find((stored) => stored.id === nft.id)
            ),
          ],
          totalNfts: prev.totalNfts + storedNfts.length,
        }));
      }
    } else {
      // Clear when wallet disconnects
      newlyMintedNftsRef.current = [];
    }
  }, [solAddress]);

  // Initialize Metaplex
  useEffect(() => {
    const initMetaplex = async () => {
      try {
        const connection = new Connection(
          configData?.rpcUrl ||
            "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06",
          "confirmed"
        );

        const metaplexInstance = new Metaplex(connection);

        setState((prev) => ({
          ...prev,
          metaplex: metaplexInstance,
        }));

        console.log("✅ Metaplex initialized for CandyMachine provider");
      } catch (err) {
        console.error("❌ Failed to initialize Metaplex:", err);
      }
    };

    initMetaplex();
  }, [configData?.rpcUrl]);

  // Load wallet NFTs function with pagination support and cancellation
  const loadWalletNfts = useCallback(
    async (address: string, page: number = 1): Promise<SimpleNFT[]> => {
      if (!state.metaplex) {
        console.log("Metaplex not initialized, cannot fetch wallet NFTs");
        return [];
      }

      // Skip loading if we just minted and it's page 1 (let the mint result show first)
      if (page === 1 && justMintedRef.current) {
        console.log("⏭️ Skipping loadWalletNfts because we just minted an NFT");
        justMintedRef.current = false; // Reset flag for next time
        return [];
      }

      // Cancel any existing request
      if (nftLoadingAbortControllerRef.current) {
        nftLoadingAbortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      nftLoadingAbortControllerRef.current = abortController;

      try {
        setState((prev) => ({ ...prev, isLoadingNfts: true, error: null }));

        console.log(`🔍 Fetching NFTs for wallet: ${address}, page: ${page}`);

        // Check if request was cancelled before proceeding
        if (abortController.signal.aborted) {
          throw new Error("Request was cancelled");
        }

        const walletKey = new PublicKey(address);

        let apiTransactions: any[] = [];
        try {
          const transactionResponse = await UserService.getTransactions();

          if (transactionResponse.success) {
            apiTransactions = transactionResponse.data || [];
          } else {
            console.warn("⚠️ Failed to fetch transactions from API");
          }
        } catch (transactionError) {
          console.warn(
            "⚠️ Could not fetch transactions from API:",
            transactionError
          );
        }

        const allNftsRaw = await state.metaplex.nfts().findAllByOwner({
          owner: walletKey,
        });

        // Check if request was cancelled after Metaplex call
        if (abortController.signal.aborted) {
          throw new Error("Request was cancelled");
        }

        const allNfts = allNftsRaw.filter(
          (nft: any) =>
            collectionAddress &&
            isNftInVerifiedCollection(nft, collectionAddress)
        );
        console.log(999, allNfts);

        console.log(`📄 Found ${allNfts.length} total filtered NFTs`);

        // Process ALL NFTs first to get createdAt for proper sorting
        console.log(`📄 Processing ALL ${allNfts.length} NFTs for sorting...`);

        const allProcessedNfts: SimpleNFT[] = await Promise.all(
          allNfts.map(async (nft: any, index: number) => {
            try {
              // Check if request was cancelled before processing each NFT
              if (abortController.signal.aborted) {
                throw new Error("Request was cancelled");
              }

              console.log(
                `📄 Processing NFT ${index + 1}/${allNfts.length}: ${nft.name || "Unnamed"}`
              );

              let metadata = null;
              if (nft.uri) {
                metadata = await fetchNftMetadata(
                  nft.uri,
                  2,
                  abortController.signal
                );

                // Check again after metadata fetch
                if (abortController.signal.aborted) {
                  throw new Error("Request was cancelled");
                }
              }

              let imageUrl = "";

              if (metadata?.image) {
                if (metadata.image.startsWith("ipfs://")) {
                  imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
                } else if (metadata.image.startsWith("http")) {
                  imageUrl = metadata.image;
                } else {
                  imageUrl = `https://ipfs.io/ipfs/${metadata.image}`;
                }
              }

              // Check if this NFT has a matching transaction in the API data
              const matchingTransaction = await apiTransactions.find(
                (tx) =>
                  tx.nftAddress && nft.mintAddress.toString() === tx.nftAddress
              );

              // Process image URL from API or metadata
              let finalImageUrl = imageUrl; // fallback image

              if (matchingTransaction?.nftImageUrl) {
                const apiImageUrl = matchingTransaction.nftImageUrl;

                if (apiImageUrl.startsWith("ipfs://")) {
                  // Convert ipfs:// to HTTP gateway
                  finalImageUrl = `https://ipfs.io/ipfs/${apiImageUrl.replace("ipfs://", "")}`;
                } else if (apiImageUrl.startsWith("http")) {
                  // Already a full HTTP URL
                  finalImageUrl = apiImageUrl;
                } else if (apiImageUrl.length > 10) {
                  // Assume it's an IPFS hash without prefix
                  finalImageUrl = `https://ipfs.io/ipfs/${apiImageUrl}`;
                }
              }

              return {
                id: nft.mintAddress.toString(),
                name: metadata?.name || nft.name || `NFT #${index + 1}`,
                description:
                  metadata?.description || "No description available",
                image: finalImageUrl,
                attributes: metadata?.attributes || [],
                createdAt: matchingTransaction?.createdAt,
                signature: matchingTransaction?.transactionSignature,
              };
            } catch (nftError) {
              console.error(`❌ Error processing NFT ${index}:`, nftError);

              // Use fallback image for error case
              const fallbackImage =
                "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF";

              return {
                id: nft.address?.toString() || `error-${index}`,
                name: `Error NFT #${index + 1}`,
                description: "Failed to process this NFT",
                image: fallbackImage,
                attributes: [],
                createdAt: undefined,
                signature: undefined,
              };
            }
          })
        );

        allProcessedNfts.sort((a, b) => {
          const dateA = a.createdAt;
          const dateB = b.createdAt;

          if (dateA && dateB) {
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          }

          if (dateA && !dateB) return -1;
          if (!dateA && dateB) return 1;

          const nameA = a.name || a.id || "";
          const nameB = b.name || b.id || "";
          return nameB.localeCompare(nameA);
        });

        const itemsPerPage = 12;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNfts = allProcessedNfts.slice(startIndex, endIndex);
        const hasMore = endIndex < allProcessedNfts.length;

        // Update state based on whether this is first page or additional pages
        if (page === 1) {
          // When loading first page, get newly minted NFTs from storage and filter out duplicates
          const storedNewlyMintedNfts = getNewlyMintedNftsFromStorage(address);
          const existingNewlyMintedNfts = storedNewlyMintedNfts.filter(
            (nft) => !pageNfts.find((pageNft) => pageNft.id === nft.id)
          );

          // Update ref and storage with filtered list
          newlyMintedNftsRef.current = existingNewlyMintedNfts;
          saveNewlyMintedNftsToStorage(address, existingNewlyMintedNfts);

          setState((prev) => ({
            ...prev,
            walletNfts: [...existingNewlyMintedNfts, ...pageNfts],
            isLoadingNfts: false,
            nftPage: 1,
            hasMoreNfts: hasMore,
            totalNfts: allProcessedNfts.length + existingNewlyMintedNfts.length,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            walletNfts: [...prev.walletNfts, ...pageNfts],
            isLoadingNfts: false,
            nftPage: page,
            hasMoreNfts: hasMore,
            totalNfts: allProcessedNfts.length,
          }));
        }

        return pageNfts;
      } catch (err: any) {
        // Handle cancellation gracefully
        if (
          err.message === "Request was cancelled" ||
          err.name === "AbortError"
        ) {
          console.log("🚫 NFT loading was cancelled");
          return [];
        }

        console.error("❌ Error loading wallet NFTs:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : String(err),
          isLoadingNfts: false,
          // Keep newly minted NFTs from storage even on error for page 1
          walletNfts:
            page === 1
              ? getNewlyMintedNftsFromStorage(address)
              : prev.walletNfts,
        }));
        return [];
      } finally {
        // Clear the abort controller reference if this is the current request
        if (nftLoadingAbortControllerRef.current === abortController) {
          nftLoadingAbortControllerRef.current = null;
        }
      }
    },
    [state.metaplex, collectionAddress]
  );

  // Load more NFTs (for pagination)
  const loadMoreNfts = useCallback(
    async (address: string): Promise<SimpleNFT[]> => {
      if (state.isLoadingNfts || !state.hasMoreNfts) {
        return [];
      }
      return loadWalletNfts(address, state.nftPage + 1);
    },
    [loadWalletNfts, state.isLoadingNfts, state.hasMoreNfts, state.nftPage]
  );

  // Initialize UMI and Candy Machine
  const initializeCandyMachine = useCallback(async () => {
    if (!solAddress || !connectedWallet || state.isLoading) {
      return;
    }

    // Kiểm tra configData và báo lỗi rõ ràng
    if (!configData) {
      const errorMsg =
        "❌ Config data not loaded! Cannot initialize Candy Machine. Please refresh the page.";
      console.error(errorMsg);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Config data not loaded. Please refresh the page.",
      }));
      showError(
        "Configuration Error",
        "Config data not loaded. Please refresh the page."
      );
      return;
    }

    // Kiểm tra các field bắt buộc trong configData
    if (!configData.address) {
      const errorMsg = "❌ Candy Machine address not found in config!";
      console.error(errorMsg);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Candy Machine address not configured.",
      }));
      showError("Configuration Error", "Candy Machine address not configured.");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    console.log("Initializing Candy Machine...");

    try {
      // Lấy wallet provider từ window với fallback
      let walletProvider = null;

      // Thử các wallet providers phổ biến
      if ((window as any).solana && (window as any).solana.isPhantom) {
        walletProvider = (window as any).solana;
        console.log("🔍 Found Phantom wallet");
      } else if ((window as any).phantom?.solana) {
        walletProvider = (window as any).phantom.solana;
        console.log("🔍 Found Phantom wallet (alt path)");
      } else if ((window as any).solflare) {
        walletProvider = (window as any).solflare;
        console.log("🔍 Found Solflare wallet");
      } else if ((window as any).backpack) {
        walletProvider = (window as any).backpack;
        console.log("🔍 Found Backpack wallet");
      } else if ((window as any).glow) {
        walletProvider = (window as any).glow;
        console.log("🔍 Found Glow wallet");
      } else if ((window as any).okxwallet?.solana) {
        walletProvider = (window as any).okxwallet.solana;
        console.log("🔍 Found OKX wallet");
      } else if ((window as any).solana) {
        walletProvider = (window as any).solana;
        console.log("🔍 Found generic Solana wallet");
      }

      // Fallback: thử sử dụng connectedWallet nếu có methods cần thiết
      if (
        !walletProvider &&
        connectedWallet &&
        (connectedWallet as any).signTransaction
      ) {
        walletProvider = connectedWallet;
        console.log("🔍 Using connectedWallet as fallback");
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
            console.log(
              "🔍 Found compatible wallet provider via fallback search"
            );
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
      console.log("Using wallet provider:", {
        isPhantom: walletProvider.isPhantom,
        isSolflare: walletProvider.isSolflare,
        isBackpack: walletProvider.isBackpack,
        hasSignTransaction: !!walletProvider.signTransaction,
        hasSignAllTransactions: !!walletProvider.signAllTransactions,
        hasSignAndSendTransaction: !!walletProvider.signAndSendTransaction,
        publicKey: walletProvider.publicKey?.toString?.(),
        connected: walletProvider.connected,
      });

      // Tạo wallet adapter cho UMI với signAndSendTransaction support
      const walletAdapter = {
        publicKey: new PublicKey(solAddress),
        signTransaction: walletProvider.signTransaction?.bind(walletProvider),
        signAllTransactions:
          walletProvider.signAllTransactions?.bind(walletProvider),
        // Add signAndSendTransaction support for Phantom
        signAndSendTransaction: walletProvider.signAndSendTransaction?.bind(walletProvider),
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        connected: true,
      };

      // Khởi tạo UMI
      const rpcEndpoint =
        configData.rpcUrl ||
        "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06";
      console.log("✅ UMI initialized with rpcEndpoint:", rpcEndpoint);
      const umi = createUmi(rpcEndpoint)
        .use(mplCandyMachine())
        .use(mplCore())
        .use(walletAdapterIdentity(walletAdapter));

      console.log("✅ UMI initialized");
      // Fetch Candy Machine
      const candyMachine = await fetchCandyMachine(
        umi,
        umiPublicKey(configData.address || "")
      );
      console.log("🚀 ~ CandyMachineProvider ~ candyMachine:", candyMachine);

      console.log("✅ Candy Machine fetched:", {
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
    } catch (error: any) {
      console.log("❌ Failed to initialize Candy Machine:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to initialize Candy Machine",
      }));
    }
  }, [
    solAddress,
    connectedWallet,
    state.isLoading,
    configData,
    log,
    showError,
  ]);

  // Auto-fetch config if not available
  useEffect(() => {
    if (!configData && !configLoading && !configError) {
      console.log(
        "🔄 [CandyMachineProvider] Config data not available, fetching..."
      );
      fetchConfig().catch((error) => {
        console.error(
          "❌ [CandyMachineProvider] Failed to fetch config:",
          error
        );
      });
    } else if (configData) {
      console.log("✅ [CandyMachineProvider] Config data available:", {
        address: configData.address,
        collectionAddress: configData.collectionAddress,
        updateAuthority: configData.updateAuthority,
        rpcUrl: configData.rpcUrl,
      });
    }
  }, [configData, configLoading, configError, fetchConfig]);

  // Auto-initialize when wallet connects and config is ready
  useEffect(() => {
    console.log(
      "🔍 [CandyMachineProvider] Checking initialization conditions:",
      {
        solAddress: !!solAddress,
        connectedWallet: !!connectedWallet,
        configData: !!configData,
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
      }
    );

    if (
      solAddress &&
      connectedWallet &&
      configData &&
      !state.isInitialized &&
      !state.isLoading
    ) {
      console.log(
        "🚀 [CandyMachineProvider] All conditions met, initializing candy machine..."
      );
      initializeCandyMachine();
    }
  }, [
    solAddress,
    connectedWallet,
    configData,
    state.isInitialized,
    state.isLoading,
    initializeCandyMachine,
  ]);

  // Cleanup effect - cancel any pending requests when component unmounts
  useEffect(() => {
    return () => {
      // Cancel NFT loading requests
      if (nftLoadingAbortControllerRef.current) {
        nftLoadingAbortControllerRef.current.abort();
        nftLoadingAbortControllerRef.current = null;
      }

      // Cancel transaction loading requests
      if (transactionLoadingAbortControllerRef.current) {
        transactionLoadingAbortControllerRef.current.abort();
        transactionLoadingAbortControllerRef.current = null;
      }

      // Clear newly minted NFTs ref
      newlyMintedNftsRef.current = [];
      justMintedRef.current = false;

      console.log(
        "🧹 CandyMachineProvider cleanup: All pending requests cancelled"
      );
    };
  }, []);

  const clearLastResult = useCallback(() => {
    setState((prev) => ({ ...prev, lastMintResult: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Function to clear persisted newly minted NFTs (useful when they appear on blockchain)
  const clearPersistedNewlyMintedNfts = useCallback(() => {
    if (solAddress) {
      clearNewlyMintedNftsFromStorage(solAddress);
      newlyMintedNftsRef.current = [];
    }
  }, [solAddress]);

  const resetState = useCallback(() => {
    setState(initialState);
    newlyMintedNftsRef.current = [];
    justMintedRef.current = false;

    // Clear localStorage as well
    if (solAddress) {
      clearNewlyMintedNftsFromStorage(solAddress);
    }
  }, [solAddress]);

  const mintNft = useCallback(async (): Promise<MintResult> => {
    if (!solAddress || !connectedWallet) {
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

    if (!configData) {
      const result: MintResult = {
        success: false,
        message: "Config data not loaded. Please refresh the page.",
        errorType: "error",
      };
      setState((prev) => ({
        ...prev,
        lastMintResult: result,
        error: result.message,
      }));
      showError("Configuration Error", result.message);

      return result;
    }

    if (!configData.address) {
      const result: MintResult = {
        success: false,
        message: "Candy Machine address not configured.",
        errorType: "error",
      };
      setState((prev) => ({
        ...prev,
        lastMintResult: result,
        error: result.message,
      }));
      showError("Configuration Error", result.message);

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

    console.log("Starting mint for wallet:", solAddress);

    try {
      // Tạo NFT mint signer
      const nftMint = generateSigner(state.umi);
      console.log("🎯 Generated NFT mint:", nftMint.publicKey);

      // Tạo mint instruction
      console.log("🔨 Building mint transaction...");
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

      console.log("📝 Sending and confirming Belp NFT transaction...");

      // Detect wallet capabilities and choose appropriate method
      const walletProvider = (connectedWallet as any) || (window as any).solana;
      const capabilities = getWalletCapabilities(walletProvider);
      
      console.log("🔍 Wallet capabilities:", capabilities);

      let result: any;
      
      if (capabilities.isPhantom && capabilities.hasSignAndSendTransaction) {
        console.log("🚀 Using Phantom's signAndSendTransaction method");
        
        try {
          // Build transaction without sending
          const builtTransaction = await mintBuilder.build(state.umi);
          
          // For now, we'll use UMI's sendAndConfirm but log that we detected Phantom
          // TODO: Implement proper UMI to web3.js transaction conversion when needed
          console.log("🔄 Phantom detected but using UMI method (conversion needed)");
          result = await mintBuilder.sendAndConfirm(state.umi, {
            send: { commitment: "finalized" },
            confirm: { commitment: "finalized" },
          });
          
          console.log("✅ Transaction completed via UMI for Phantom wallet");
        } catch (phantomError) {
          console.warn("⚠️ Phantom signAndSendTransaction failed, falling back to UMI:", phantomError);
          // Fallback to UMI method
          result = await mintBuilder.sendAndConfirm(state.umi, {
            send: { commitment: "finalized" },
            confirm: { commitment: "finalized" },
          });
        }
      } else {
        console.log("🔄 Using UMI sendAndConfirm method (fallback)");
        // Use UMI's sendAndConfirm for other wallets or when signAndSendTransaction is not available
        result = await mintBuilder.sendAndConfirm(state.umi, {
          send: { commitment: "finalized" },
          confirm: { commitment: "finalized" },
        });
      }

      const base58Signature = bs58.encode(result.signature);
      let transactionDetails: any;
      // Tùy chọn: Lấy thông tin chi tiết transaction từ RPC
      try {
        const rpcEndpoint =
          configData?.rpcUrl ||
          "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06";
        transactionDetails = await getTransactionFromRPC(
          base58Signature,
          rpcEndpoint
        );
        if (transactionDetails) {
          console.log("📋 Transaction details from RPC:", transactionDetails);
        }
      } catch (rpcError) {
        console.log(
          "⚠️ Failed to fetch transaction details from RPC:",
          rpcError
        );
        // Không throw error vì đây chỉ là thông tin bổ sung
      }

      const mintResult: MintResult = {
        success: true,
        signature:
          transactionDetails?.transaction?.signatures?.[0] || base58Signature,
        nftAddress: nftMint.publicKey.toString(),
        message: "Belp NFT minted successfully! 🐱",
      };

      // Tạo transaction history record từ mintResult
      const newTransaction: TransactionHistory = {
        signature: mintResult.signature || base58Signature,
        nftAddress: mintResult.nftAddress || "",
        nftName: `BELP #${Date.now()}`, // Temporary name, sẽ update sau
        nftImage:
          "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF", // Default image
        timestamp: new Date().toISOString(),
        status: "finalized",
      };

      // Tạo NFT object mới từ mintResult để thêm vào walletNfts
      const newNftItem: SimpleNFT = {
        id: mintResult.nftAddress || "",
        name: `BELP #${Date.now()}`, // Temporary name, sẽ update sau khi fetch metadata
        description: "Freshly minted BELP NFT",
        image:
          "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF", // Default image
        attributes: [],
        createdAt: new Date().toISOString(),
        signature: mintResult.signature || base58Signature,
      };

      console.log("📊 State before adding NFT:", {
        currentWalletNftsCount: state.walletNfts.length,
        currentTotalNfts: state.totalNfts,
        newlyMintedInRef: newlyMintedNftsRef.current.length,
      });

      setState((prev) => ({
        ...prev,
        isMinting: false,
        lastMintResult: mintResult,
        mintCount: prev.mintCount + 1,
        error: null,
        // Update candy machine stats
        itemsRedeemed: prev.itemsRedeemed + 1,
        // Add transaction to history
        transactionHistory: [newTransaction, ...prev.transactionHistory],
        // Add new NFT to wallet NFTs at the beginning of the array
        walletNfts: [newNftItem, ...prev.walletNfts],
        totalNfts: prev.totalNfts + 1,
      }));

      // Also add to newly minted NFTs ref so it persists through blockchain refreshes
      newlyMintedNftsRef.current = [newNftItem, ...newlyMintedNftsRef.current];

      // Save to localStorage so it persists across page navigation
      if (solAddress) {
        saveNewlyMintedNftsToStorage(solAddress, newlyMintedNftsRef.current);
        console.log(
          "💾 Saved newly minted NFT to localStorage for wallet:",
          solAddress
        );
      }

      // Set flag to prevent immediate reload
      justMintedRef.current = true;

      // Reset flag after a short delay to allow normal loading later
      setTimeout(() => {
        justMintedRef.current = false;
      }, 3000); // 3 seconds

      console.log("🎉 NFT added to walletNfts:", {
        nftId: newNftItem.id,
        nftName: newNftItem.name,
        totalWalletNfts: state.walletNfts.length + 1,
        newlyMintedCount: newlyMintedNftsRef.current.length,
      });

      // Log final state after setState (this will show in next render)
      setTimeout(() => {
        console.log("📊 State after adding NFT (async check):", {
          currentWalletNftsCount: state.walletNfts.length,
          currentTotalNfts: state.totalNfts,
          newlyMintedInRef: newlyMintedNftsRef.current.length,
        });
      }, 100);

      // Fetch metadata asynchronously sau khi mint để update thông tin NFT
      try {
        if (state.metaplex && mintResult.nftAddress) {
          const mintAddress = new PublicKey(mintResult.nftAddress);
          const nftData = await state.metaplex.nfts().findByMint({
            mintAddress,
          });

          if (nftData && nftData.uri) {
            const metadata = await fetchNftMetadata(nftData.uri, 2);
            if (metadata) {
              // Update NFT với metadata thực
              const updatedNft: SimpleNFT = {
                ...newNftItem,
                name: metadata.name || newNftItem.name,
                description: metadata.description || newNftItem.description,
                image: metadata.image?.startsWith("ipfs://")
                  ? `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`
                  : metadata.image || newNftItem.image,
                attributes: metadata.attributes || [],
              };

              // Update state với metadata thực
              setState((prev) => ({
                ...prev,
                walletNfts: prev.walletNfts.map((nft) =>
                  nft.id === mintResult.nftAddress ? updatedNft : nft
                ),
                transactionHistory: prev.transactionHistory.map((tx) =>
                  tx.nftAddress === mintResult.nftAddress
                    ? {
                        ...tx,
                        nftName: updatedNft.name,
                        nftImage: updatedNft.image,
                      }
                    : tx
                ),
              }));

              // Also update in newly minted NFTs ref
              newlyMintedNftsRef.current = newlyMintedNftsRef.current.map(
                (nft) => (nft.id === mintResult.nftAddress ? updatedNft : nft)
              );

              // Update localStorage as well
              if (solAddress) {
                saveNewlyMintedNftsToStorage(
                  solAddress,
                  newlyMintedNftsRef.current
                );
              }
            }
          }
        }
      } catch (metadataError) {
        console.warn(
          "⚠️ Failed to fetch metadata for newly minted NFT:",
          metadataError
        );
        // Không throw error vì NFT đã được mint thành công
      }

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
      console.log("❌ Belp NFT mint failed:", error);

      // Try to get detailed logs if it's a SendTransactionError
      if (error.getLogs && typeof error.getLogs === "function") {
        try {
          const logs = await error.getLogs();
          console.log("🔍 Transaction logs:", logs);
        } catch (logError) {
          console.log("❌ Failed to get transaction logs:", logError);
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
    state.metaplex,
    log,
    autoResetAfter,
    showError,
    configData,
  ]);

  const contextValue: CandyMachineContextType = {
    ...state,
    configLoading,
    configError,
    mintNft,
    clearLastResult,
    clearError,
    resetState,
    initializeCandyMachine,
    loadWalletNfts,
    loadMoreNfts,
    clearPersistedNewlyMintedNfts,
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
    configLoading,
    configError,
    mintNft,
    clearLastResult,
    clearError,
    initializeCandyMachine,
    loadWalletNfts,
    walletNfts,
    isLoadingNfts,
  } = useCandyMachineContext();

  // Get config data for status computation
  const configData = useConfig();

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
    configLoading,
    configError,

    // Wallet NFTs state
    walletNfts,
    isLoadingNfts,

    // Actions
    mint: mintNft,
    clearResult: clearLastResult,
    clearError,
    initialize: initializeCandyMachine,
    loadWalletNfts,

    // Computed
    canMint: !isMinting && isInitialized && !configLoading,
    hasError: !!error || !!configError,
    hasMinted: mintCount > 0,
    soldOut: itemsRedeemed >= itemsLoaded,
    remaining: Math.max(0, itemsLoaded - itemsRedeemed),
    isReady: isInitialized && !configLoading && !configError,

    // Status for debugging
    status: configLoading
      ? "Loading config..."
      : configError
        ? `Config error: ${configError}`
        : !configData
          ? "No config data"
          : isLoading
            ? "Initializing candy machine..."
            : !isInitialized
              ? "Waiting for wallet connection"
              : "Ready",
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
