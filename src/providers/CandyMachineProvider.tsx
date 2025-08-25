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
  loadTransactionHistory: (
    address: string,
    page?: number
  ) => Promise<TransactionHistory[]>;
  loadMoreTransactions: (address: string) => Promise<TransactionHistory[]>;

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
  const { showError } = useToast();

  // Refs to prevent multiple simultaneous calls
  const isLoadingTransactionsRef = useRef(false);
  const loadingPromiseRef = useRef<Promise<TransactionHistory[]> | null>(null);

  // AbortController refs for cancellation
  const nftLoadingAbortControllerRef = useRef<AbortController | null>(null);
  const transactionLoadingAbortControllerRef = useRef<AbortController | null>(
    null
  );

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

  // Initialize Metaplex
  useEffect(() => {
    const initMetaplex = async () => {
      try {
        const connection = new Connection(
          configData?.rpcUrl || "https://api.devnet.solana.com",
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

        // Use findAllByOwner and implement client-side pagination
        console.log("📥 Fetching all NFTs from Metaplex...");

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

              let imageUrl =
                "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF";

              if (metadata?.image) {
                if (metadata.image.startsWith("ipfs://")) {
                  imageUrl = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
                } else if (metadata.image.startsWith("http")) {
                  imageUrl = metadata.image;
                } else {
                  imageUrl = `https://ipfs.io/ipfs/${metadata.image}`;
                }
              }

              let createdAt = new Date().toISOString();
              let signature: string | undefined = undefined;
              // try {
              //   const signatures =
              //     await state.metaplex!.connection.getSignaturesForAddress(
              //       new PublicKey(nft.address),
              //       { limit: 1 }
              //     );

              //   if (signatures[0]?.blockTime) {
              //     createdAt = new Date(
              //       signatures[0].blockTime * 1000
              //     ).toISOString();
              //     signature = signatures[0].signature; // Store signature for transaction view
              //   }
              // } catch {
              //   // Keep metadata or fallback time
              // }

              return {
                id: nft.address.toString(),
                name: metadata?.name || nft.name || `NFT #${index + 1}`,
                description:
                  metadata?.description || "No description available",
                image: imageUrl,
                attributes: metadata?.attributes || [],
                createdAt,
                signature, // Add signature to NFT data
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
                createdAt: new Date().toISOString(),
                signature: undefined, // No signature available for error case
              };
            }
          })
        );

        console.log(
          "✅ Successfully processed all NFTs:",
          allProcessedNfts.length
        );

        // Sort ALL NFTs by creation date (newest first) BEFORE pagination
        const sortedAllNfts = allProcessedNfts.sort((a, b) => {
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

        console.log(`✅ All NFTs sorted by creation date`);

        // NOW implement pagination on the sorted data
        const itemsPerPage = 10;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNfts = sortedAllNfts.slice(startIndex, endIndex);
        const hasMore = endIndex < sortedAllNfts.length;

        console.log(
          `📄 Returning ${pageNfts.length} NFTs for page ${page}, hasMore: ${hasMore}`
        );

        // Update state based on whether this is first page or additional pages
        if (page === 1) {
          setState((prev) => ({
            ...prev,
            walletNfts: pageNfts,
            isLoadingNfts: false,
            nftPage: 1,
            hasMoreNfts: hasMore,
            totalNfts: sortedAllNfts.length,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            walletNfts: [...prev.walletNfts, ...pageNfts],
            isLoadingNfts: false,
            nftPage: page,
            hasMoreNfts: hasMore,
            totalNfts: sortedAllNfts.length,
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
          walletNfts: page === 1 ? [] : prev.walletNfts, // Don't clear existing NFTs if it's pagination
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

  // Load transaction history from blockchain with pagination
  const loadTransactionHistory = useCallback(
    async (
      address: string,
      page: number = 1
    ): Promise<TransactionHistory[]> => {
      console.log("🚀 loadTransactionHistory called with:", {
        address,
        hasMetaplex: !!state.metaplex,
        collectionAddress,
        configAddress: configData?.address,
      });

      if (!state.metaplex) {
        console.log(
          "❌ Metaplex not initialized, cannot fetch transaction history"
        );
        return [];
      }

      if (!collectionAddress) {
        console.log(
          "❌ Collection address not available, cannot filter transactions"
        );
        return [];
      }

      console.log(
        `✅ Using collection address for filtering: ${collectionAddress}`
      );

      try {
        setState((prev) => ({ ...prev, error: null }));

        console.log(
          `🔍 Fetching transaction history for wallet: ${address}, page: ${page}`
        );

        const walletKey = new PublicKey(address);
        const connection = state.metaplex.connection;

        // Get confirmed signatures với timeout, use fixed limit to check for more data
        const itemsPerPage = 10; // Match NFT pagination

        // For hasMore detection, we fetch one extra signature beyond what we need for this page
        const fetchLimit = page * itemsPerPage + 1;

        const signatures = await Promise.race([
          connection.getSignaturesForAddress(walletKey, { limit: fetchLimit }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Signatures timeout")), 3000)
          ),
        ]);

        console.log(`📄 Found ${signatures.length} signatures for wallet`);

        // Implement pagination for transactions
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageSignatures = signatures.slice(startIndex, endIndex);

        // hasMore: if we got the extra signature (meaning there are more than current page needs)
        const hasMore = signatures.length === fetchLimit;

        console.log(
          `📋 Processing ${pageSignatures.length} transactions for page ${page}`,
          `fetched: ${signatures.length}/${fetchLimit}, hasMore: ${hasMore}`
        );

        // Process transactions với simplified logic
        const transactions: TransactionHistory[] = [];

        for (let i = 0; i < pageSignatures.length; i++) {
          const sigInfo = pageSignatures[i];
          console.log(
            `📋 Processing transaction ${i + 1}/${Math.min(signatures.length, 3)}: ${sigInfo.signature}`
          );

          try {
            // Get transaction với timeout
            const transaction = await Promise.race([
              connection.getTransaction(sigInfo.signature, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
              }),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("Transaction timeout")), 2000)
              ),
            ]);

            if (!transaction || !transaction.meta) {
              console.log(`⚠️ No transaction data for ${sigInfo.signature}`);
              continue;
            }

            console.log(`✅ Got transaction data for ${sigInfo.signature}`);

            // Simplified check cho NFT mint
            let isRelevantTransaction = false;
            let nftAddress = "";
            let nftName = "Unknown NFT";
            let nftImage =
              "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF";

            // Check postTokenBalances cho new NFTs
            if (
              transaction.meta.postTokenBalances &&
              transaction.meta.preTokenBalances
            ) {
              const newTokens = transaction.meta.postTokenBalances.filter(
                (postBalance: any) => {
                  const existedBefore =
                    transaction.meta!.preTokenBalances!.some(
                      (preBalance: any) =>
                        preBalance.mint === postBalance.mint &&
                        preBalance.owner === postBalance.owner
                    );
                  return (
                    !existedBefore &&
                    postBalance.owner === address &&
                    postBalance.uiTokenAmount.uiAmount === 1
                  );
                }
              );

              if (newTokens.length > 0) {
                isRelevantTransaction = true;
                nftAddress = newTokens[0].mint;
                console.log(`🎯 Found new NFT token: ${nftAddress}`);
              }
            }

            // Nếu tìm được NFT, verify collection (simplified)
            if (isRelevantTransaction && nftAddress) {
              try {
                const nftMintKey = new PublicKey(nftAddress);
                const nftInfo = await state.metaplex.nfts().findByMint({
                  mintAddress: nftMintKey,
                });

                const belongsToCollection = isNftInVerifiedCollection(
                  nftInfo,
                  collectionAddress
                );

                if (!belongsToCollection) {
                  console.log(
                    `⚠️ NFT ${nftAddress} not in verified collection, skipping`
                  );
                  continue;
                }

                // Get NFT info and metadata
                nftName = nftInfo.name || `NFT ${nftAddress.slice(0, 8)}...`;

                let metadata = null;
                // Fetch metadata to get actual image
                try {
                  if (nftInfo.uri) {
                    metadata = await fetchNftMetadata(nftInfo.uri);
                  }

                  if (metadata?.image) {
                    if (metadata.image.startsWith("ipfs://")) {
                      nftImage = `https://ipfs.io/ipfs/${metadata.image.replace("ipfs://", "")}`;
                    } else if (metadata.image.startsWith("http")) {
                      nftImage = metadata.image;
                    } else {
                      nftImage = `https://ipfs.io/ipfs/${metadata.image}`;
                    }
                  }
                } catch (metadataError) {
                  console.warn(
                    `⚠️ Error fetching NFT metadata for ${nftAddress}:`,
                    metadataError
                  );
                  // Keep default image if metadata fetch fails
                }

                // Add transaction to results
                transactions.push({
                  signature: sigInfo.signature,
                  nftAddress,
                  nftName: metadata?.name || nftName,
                  nftImage,
                  timestamp: sigInfo.blockTime
                    ? new Date(sigInfo.blockTime * 1000).toISOString()
                    : new Date().toISOString(),
                  status: "confirmed",
                });
              } catch (nftError) {
                console.warn(
                  `⚠️ Error processing NFT ${nftAddress}:`,
                  nftError
                );
                // Still add transaction with basic info
                transactions.push({
                  signature: sigInfo.signature,
                  nftAddress,
                  nftName: `NFT ${nftAddress.slice(0, 8)}...`,
                  nftImage,
                  timestamp: sigInfo.blockTime
                    ? new Date(sigInfo.blockTime * 1000).toISOString()
                    : new Date().toISOString(),
                  status: "confirmed",
                });
              }
            }
          } catch (txError) {
            console.warn(
              `⚠️ Error processing transaction ${sigInfo.signature}:`,
              txError
            );
            continue;
          }
        }

        console.log(
          `✅ Found ${transactions.length} relevant transactions for page ${page}`
        );

        // Sort by timestamp
        const sortedTransactions = transactions.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Update state based on whether this is first page or additional pages
        if (page === 1) {
          setState((prev) => ({
            ...prev,
            transactionHistory: sortedTransactions,
            isLoadingTransactions: false,
            transactionPage: 1,
            hasMoreTransactions: hasMore && sortedTransactions.length > 0, // Only hasMore if we found relevant transactions
            totalTransactions: signatures.length,
          }));
        } else {
          // For subsequent pages, check if we got new transactions
          const hasNewTransactions = sortedTransactions.length > 0;
          const actualHasMore = hasMore && hasNewTransactions;

          console.log(
            `📋 Page ${page} results: ${sortedTransactions.length} new transactions, hasMore: ${hasMore} → ${actualHasMore}`
          );

          setState((prev) => ({
            ...prev,
            transactionHistory: [
              ...prev.transactionHistory,
              ...sortedTransactions,
            ],
            isLoadingTransactions: false,
            transactionPage: page,
            hasMoreTransactions: actualHasMore, // Only hasMore if we found new relevant transactions
            totalTransactions: signatures.length,
          }));
        }

        return sortedTransactions;
      } catch (err) {
        console.error("❌ Error loading transaction history:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : String(err),
        }));
        return [];
      }
    },
    [state.metaplex, configData?.address, collectionAddress]
  );

  // Load more transactions (for pagination)
  const loadMoreTransactions = useCallback(
    async (address: string): Promise<TransactionHistory[]> => {
      if (state.isLoadingTransactions || !state.hasMoreTransactions) {
        return [];
      }
      return loadTransactionHistory(address, state.transactionPage + 1);
    },
    [
      loadTransactionHistory,
      state.isLoadingTransactions,
      state.hasMoreTransactions,
      state.transactionPage,
    ]
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

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

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

      // Gửi và confirm transaction với error handling
      const result = await mintBuilder.sendAndConfirm(state.umi, {
        send: { commitment: "finalized" },
        confirm: { commitment: "finalized" },
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
        signature: transactionDetails.transaction.signatures[0] || "",
        nftAddress: nftMint.publicKey.toString(),
        message: "Belp NFT minted successfully! 🐱",
      };

      // Tạo transaction history record
      const newTransaction: TransactionHistory = {
        signature: mintResult.signature || base58Signature,
        nftAddress: mintResult.nftAddress || "",
        nftName: `BELP #${Date.now()}`, // Temporary name, sẽ update sau
        nftImage:
          "https://ipfs.io/ipfs/QmVHjy69p8zAthFFizBEi2rBFQPZZvEZ4BePLK1hdws2QF", // Default image
        timestamp: new Date().toISOString(),
        status: "finalized",
      };

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
    loadTransactionHistory,
    loadMoreTransactions,
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
