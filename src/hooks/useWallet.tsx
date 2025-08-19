"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  UserService,
  AuthService,
  NftService,
  ConfigService,
  BLOCKCHAIN_CONFIG,
} from "@/services";
import { useConfigActions } from "@/stores/config";
import { useLoading } from "@/providers/LoadingProvider";
import { useToast } from "@/components/ToastContainer";

export type WalletType = "phantom" | "solflare" | "backpack" | "glow" | "okx";
export type Connected = {
  kind: "sol";
  address: string;
  walletType: WalletType;
};

declare global {
  interface Window {
    ethereum?: any;
    solana?: {
      isPhantom?: boolean;
      connect: (args?: any) => Promise<{ publicKey: { toString(): string } }>;
      disconnect?: () => Promise<void>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      off?: (event: string, cb: (...args: any[]) => void) => void;
      publicKey?: { toString(): string };
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions?: (
        transactions: Transaction[]
      ) => Promise<Transaction[]>;
    };
    solflare?: any;
    backpack?: any;
    glowSolana?: any;
    okxwallet?: {
      solana?: any;
    };
  }
}

export type LoadingKind = WalletType | "sol-balance" | null;

export interface WalletConfig {
  name: string;
  displayName: string;
  downloadUrl: {
    desktop: string;
    mobile?: {
      ios: string;
      android: string;
    };
  };
  deepLinkTemplate?: string;
  getProvider: () => any;
  isAvailable: () => boolean;
}

const WALLET_CONFIGS: Record<WalletType, WalletConfig> = {
  phantom: {
    name: "phantom",
    displayName: "Phantom",
    downloadUrl: {
      desktop: "https://phantom.app/download",
      mobile: {
        ios: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
        android: "https://play.google.com/store/apps/details?id=app.phantom",
      },
    },
    deepLinkTemplate: "https://phantom.app/ul/browse/{{url}}?ref=belp",
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return window.solana?.isPhantom
        ? window.solana
        : (window as any).phantom?.solana ||
            window.solana ||
            (window.ethereum as any)?.solana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(
        window.solana?.isPhantom ||
        (window as any).phantom?.solana ||
        window.solana
      );
    },
  },
  solflare: {
    name: "solflare",
    displayName: "Solflare",
    downloadUrl: {
      desktop: "https://solflare.com/download",
      mobile: {
        ios: "https://apps.apple.com/app/solflare/id1580902717",
        android:
          "https://play.google.com/store/apps/details?id=com.solflare.mobile",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).solflare;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).solflare;
    },
  },
  backpack: {
    name: "backpack",
    displayName: "Backpack",
    downloadUrl: {
      desktop: "https://backpack.app/download",
      mobile: {
        ios: "https://apps.apple.com/app/backpack-wallet/id1614235142",
        android:
          "https://play.google.com/store/apps/details?id=app.backpack.mobile",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).backpack;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).backpack;
    },
  },
  glow: {
    name: "glow",
    displayName: "Glow",
    downloadUrl: {
      desktop: "https://glow.app/download",
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).glowSolana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).glowSolana;
    },
  },
  okx: {
    name: "okx",
    displayName: "OKX Wallet",
    downloadUrl: {
      desktop: "https://www.okx.com/web3",
      mobile: {
        ios: "https://apps.apple.com/app/okx/id1327268470",
        android:
          "https://play.google.com/store/apps/details?id=com.okinc.okex.gp",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).okxwallet?.solana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).okxwallet?.solana;
    },
  },
};

function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return sol.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

export function useWallet(onConnected?: (info: Connected) => void) {
  const [solAddress, setSolAddress] = useState<string | null>(null);
  const [connectedType, setConnectedType] = useState<Connected["kind"] | null>(
    null
  );
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(
    null
  );
  const [loading, setLoading] = useState<LoadingKind>(null);
  const [solLamports, setSolLamports] = useState<number>(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsLastLoaded, setTransactionsLastLoaded] =
    useState<number>(0);
  const [isLoadingUserStats, setIsLoadingUserStats] = useState(false);
  const [userStatsLastLoaded, setUserStatsLastLoaded] = useState<number>(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Add refs for debouncing and preventing duplicate calls
  const isProcessingRef = useRef(false);
  const hasProcessedConnectionRef = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const balanceLoadingRef = useRef(false);
  const lastBalanceLoadRef = useRef(0);
  const toast = useToast();

  const { clearConfig } = useConfigActions();
  const { showLoading, hideLoading } = useLoading();

  const solBalanceText = useMemo(
    () => (solLamports === null ? "—" : formatSol(solLamports)),
    [solLamports]
  );

  const listenersRef = useRef<
    Map<
      WalletType,
      {
        connect?: (...args: any[]) => void;
        disconnect?: (...args: any[]) => void;
      }
    >
  >(new Map());

  const refreshSolBalance = useCallback(async (forceRefresh = false) => {
    // Add stack trace to see where this is being called from
    console.log(
      "Refreshing SOL balance... Called from:",
      new Error().stack?.split("\n")[2]?.trim(),
      forceRefresh ? "(FORCED)" : ""
    );

    // Prevent concurrent calls globally across all instances
    if (globalBalanceLoading || balanceLoadingRef.current) {
      console.log(
        "💰 Balance already loading globally, skipping duplicate call"
      );
      return;
    }

    // Increased debounce - only allow one call per 30 seconds globally (unless forced)
    const now = Date.now();
    const MIN_INTERVAL = 30000; // 30 seconds
    if (!forceRefresh && now - globalLastBalanceLoad < MIN_INTERVAL) {
      console.log(
        "💰 Balance called too recently globally, skipping (last call was",
        Math.floor((now - globalLastBalanceLoad) / 1000),
        "seconds ago, need to wait",
        Math.floor((MIN_INTERVAL - (now - globalLastBalanceLoad)) / 1000),
        "more seconds)"
      );
      return;
    }

    try {
      globalBalanceLoading = true;
      balanceLoadingRef.current = true;
      globalLastBalanceLoad = now;
      lastBalanceLoadRef.current = now;
      setLoading("sol-balance");

      console.log(
        "💰 Using API to fetch wallet balance... (call #" +
          Math.floor(now / 1000) +
          ")"
      );
      const balanceResult = await UserService.getWalletBalance();
      if (balanceResult.success && balanceResult.data) {
        // Check for different possible response structures
        const lamports =
          balanceResult.data.lamports ||
          balanceResult.data.balance ||
          balanceResult.data.solBalance ||
          0;
        setSolLamports(lamports);
        console.log("✅ Balance loaded from API:", lamports);
      } else {
        // toast by english
        toast.showError("Balance fetch failed", "Please try again later", 8000);
        // If API fails, set to 0
        console.warn(
          "API balance fetch failed:",
          balanceResult.message || "Unknown error"
        );
        setSolLamports(0);
      }
    } catch (error: any) {
      console.error("Failed to refresh SOL balance:", error);

      toast.showError("Balance fetch failed", "Please try again later", 8000);
      // Handle rate limit error specifically
      if (
        error.message?.includes("Rate limit") ||
        error.message?.includes("Too many")
      ) {
        console.warn(
          "⚠️ Rate limit hit, will skip balance refresh for a while"
        );
        // Set a longer cooldown for rate limit
        globalLastBalanceLoad = now + 60000; // Extra 60 seconds cooldown
        lastBalanceLoadRef.current = now + 60000;
      }

      setSolLamports(0);
    } finally {
      globalBalanceLoading = false;
      balanceLoadingRef.current = false;
      setLoading((l) => (l === "sol-balance" ? null : l));
    }
  }, []);

  // Load transactions with caching and debouncing
  const loadTransactions = useCallback(
    async (forceRefresh: boolean = false) => {
      // Prevent concurrent loading
      if (isLoadingTransactions) {
        console.log("Transactions already loading, skipping...");
        return;
      }

      // Cache check - only reload if forced or data is older than 5 minutes
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (
        !forceRefresh &&
        transactions.length > 0 &&
        now - transactionsLastLoaded < CACHE_DURATION
      ) {
        console.log("Using cached transactions data");
        return;
      }

      try {
        setIsLoadingTransactions(true);
        console.log("Loading transaction history...");

        const txResult = await UserService.getTransactions({
          limit: 50,
        });

        if (txResult.success && txResult.data) {
          setTransactions(txResult.data);
          setTransactionsLastLoaded(now);
          console.log(
            "Transaction history loaded:",
            txResult.data.length,
            "transactions"
          );
        } else if (
          txResult.message?.includes("Unauthorized") ||
          txResult.message?.includes("401")
        ) {
          console.warn("Token expired while loading transactions");
          // Don't retry here - let the main auth flow handle it
        }
      } catch (error: any) {
        console.error("Failed to load transactions:", error);

        // Handle authentication errors
        if (
          error.response?.status === 401 ||
          error.message?.includes("Unauthorized")
        ) {
          console.warn("Authentication error while loading transactions");
          // Clear invalid data but don't retry - main auth flow will handle
        }
      } finally {
        setIsLoadingTransactions(false);
      }
    },
    [isLoadingTransactions, transactions.length, transactionsLastLoaded]
  );

  // Load user statistics with caching and debouncing
  const loadUserStatistics = useCallback(
    async (forceRefresh: boolean = false) => {
      // Prevent concurrent loading
      if (isLoadingUserStats) {
        console.log("User statistics already loading, skipping...");
        return;
      }

      // Cache check - only reload if forced or data is older than 5 minutes
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (
        !forceRefresh &&
        userStatistics &&
        now - userStatsLastLoaded < CACHE_DURATION
      ) {
        console.log("Using cached user statistics data");
        return;
      }

      try {
        setIsLoadingUserStats(true);
        console.log("Loading user statistics...");

        const statsResult = await UserService.getUserStatistics();

        if (statsResult.success && statsResult.data) {
          setUserStatistics(statsResult.data);
          setUserStatsLastLoaded(now);
          console.log("User statistics loaded:", statsResult.data);
        } else if (
          statsResult.message?.includes("Unauthorized") ||
          statsResult.message?.includes("401")
        ) {
          console.warn("Token expired while loading user statistics");
          // Don't retry here - let the main auth flow handle it
        }
      } catch (error: any) {
        console.error("Failed to load user statistics:", error);

        // Handle authentication errors
        if (
          error.response?.status === 401 ||
          error.message?.includes("Unauthorized")
        ) {
          console.warn("Authentication error while loading user statistics");
          // Clear invalid data but don't retry - main auth flow will handle
        }
      } finally {
        setIsLoadingUserStats(false);
      }
    },
    [isLoadingUserStats, userStatistics, userStatsLastLoaded]
  );

  const loadUserData = useCallback(
    async (walletAddress: string, retryAuth: boolean = false) => {
      // Prevent multiple calls during initial load
      if (!retryAuth && isLoadingUserStats && isLoadingTransactions) {
        console.log("User data already loading, skipping duplicate call...");
        return;
      }

      try {
        console.log("Loading user data...", { walletAddress, retryAuth });

        // Load user statistics using optimized function
        await loadUserStatistics(retryAuth);

        // Load transaction history using optimized function
        await loadTransactions(retryAuth);
      } catch (error: any) {
        console.error("Failed to load user data:", error);

        // Handle authentication errors
        if (
          error.response?.status === 401 ||
          error.message?.includes("Unauthorized")
        ) {
          console.warn("Authentication error detected, clearing invalid token");
          AuthService.removeToken();
          setAuthToken(null);

          if (!retryAuth) {
            console.log("Will retry authentication on next connect");
          }
        }
      }
    },
    [
      loadUserStatistics,
      loadTransactions,
      isLoadingUserStats,
      isLoadingTransactions,
    ]
  );

  // Authenticate wallet with backend - centralized function to prevent duplicate calls
  const authenticateWallet = useCallback(
    async (
      walletAddress: string,
      forceBalanceRefresh: boolean = false
    ): Promise<boolean> => {
      // Prevent multiple simultaneous authentication calls
      if (isAuthenticating) {
        console.log("Authentication already in progress, skipping...");
        return false;
      }

      // Check if we already have a valid token for this wallet
      const existingToken = AuthService.getToken();
      if (existingToken && AuthService.isTokenValid()) {
        console.log("Valid token already exists, skipping authentication");
        setAuthToken(existingToken);

        // Always refresh balance when connecting wallet manually
        if (forceBalanceRefresh) {
          console.log("Force refreshing balance for existing token...");
          await refreshSolBalance();
        }

        return true;
      }

      try {
        setIsAuthenticating(true);
        console.log("🔐 Authenticating wallet with backend:", walletAddress);

        const connectResult = await UserService.connectWallet(walletAddress);

        if (connectResult.success && (connectResult as any).data?.accessToken) {
          const token = (connectResult as any).data.accessToken;
          AuthService.setToken(token);
          setAuthToken(token);
          console.log("✅ Authentication successful, token saved");

          // Load balance only once after successful authentication (force refresh)
          await refreshSolBalance(true);

          // Dispatch wallet connected event for AuthProvider
          window.dispatchEvent(new CustomEvent("wallet:connected"));

          return true;
        } else {
          console.error("❌ Authentication failed:", connectResult.message);
          return false;
        }
      } catch (error) {
        console.error("❌ Authentication error:", error);
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating, refreshSolBalance]
  );

  // Common wallet event handlers
  const setupWalletListeners = useCallback(
    (walletType: WalletType) => {
      const config = WALLET_CONFIGS[walletType];
      const provider = config.getProvider();

      if (!provider?.on) return;

      const onConnect = (..._args: any[]) => {
        const addr = provider.publicKey?.toString?.() || null;
        if (addr) {
          setSolAddress(addr);
          setConnectedWallet(walletType);
          setConnectedType("sol");
          // Balance will be loaded once after successful authentication
        }
      };

      const onDisconnect = () => {
        setSolAddress(null);
        setSolLamports(0);
        setConnectedWallet(null);
        setConnectedType(null);
      };

      provider.on("connect", onConnect);
      provider.on("disconnect", onDisconnect);

      listenersRef.current.set(walletType, {
        connect: onConnect,
        disconnect: onDisconnect,
      });
    },
    [] // Remove refreshSolBalance dependency since it's not used in listeners
  );

  const cleanupWalletListeners = useCallback((walletType: WalletType) => {
    const config = WALLET_CONFIGS[walletType];
    const provider = config.getProvider();
    const listeners = listenersRef.current.get(walletType);

    if (!provider?.off || !listeners) return;

    if (listeners.connect) {
      provider.off("connect", listeners.connect);
    }
    if (listeners.disconnect) {
      provider.off("disconnect", listeners.disconnect);
    }

    listenersRef.current.delete(walletType);
  }, []);

  // Simplified connection handler to prevent duplicates
  const handleConnection = useCallback(
    async (
      walletType: WalletType,
      addr: string,
      isExisting: boolean = false
    ) => {
      // Prevent duplicate processing globally
      if (globalConnectionProcessed || hasProcessedConnectionRef.current) {
        console.log("Connection already processed globally, skipping...");
        return;
      }

      globalConnectionProcessed = true;
      hasProcessedConnectionRef.current = true;
      setSolAddress(addr);
      setConnectedType("sol");
      setConnectedWallet(walletType);

      const config = WALLET_CONFIGS[walletType];
      console.log(
        `Processing ${isExisting ? "existing" : "new"} ${config.displayName} connection...`
      );

      try {
        // Check for valid token first
        const existingToken = AuthService.getToken();
        if (existingToken && AuthService.isTokenValid()) {
          console.log("Valid token exists, loading data");
          setAuthToken(existingToken);

          // Only refresh balance if we don't have recent data
          const now = Date.now();
          if (solLamports === 0 || now - lastBalanceLoadRef.current > 60000) {
            await refreshSolBalance();
          }
          await loadUserData(addr);
        } else {
          console.log("Authenticating wallet...");
          const authSuccess = await authenticateWallet(addr);
          if (authSuccess) {
            // Balance already loaded in authenticateWallet, no need to call again
            await loadUserData(addr);
          }
        }

        onConnected?.({
          kind: "sol",
          address: addr,
          walletType,
        });
      } catch (error) {
        console.error("Connection handling error:", error);
        globalConnectionProcessed = false; // Reset global on error
        hasProcessedConnectionRef.current = false; // Reset on error
      }
    },
    [refreshSolBalance, loadUserData, authenticateWallet, onConnected]
  );

  // Generic wallet connection function
  const connectWallet = useCallback(
    async (walletType: WalletType) => {
      const config = WALLET_CONFIGS[walletType];

      try {
        setLoading(walletType);
        showLoading();
        window.localStorage.removeItem("wallet-disconnected");

        const provider = config.getProvider();

        // If provider not found, redirect to download/install
        if (!provider) {
          hideLoading();
          console.log(
            `No ${config.displayName} provider detected, redirecting...`
          );

          const currentUrl = window.location.href;
          const isMobile =
            /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            );

          if (isMobile && config.deepLinkTemplate) {
            // Try deep link first for mobile
            const deepLink = config.deepLinkTemplate.replace(
              "{{url}}",
              encodeURIComponent(currentUrl)
            );
            console.log(
              `Trying mobile deep link for ${config.displayName}:`,
              deepLink
            );
            window.location.href = deepLink;

            // Fallback to app store
            setTimeout(() => {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
              const storeUrl = isIOS
                ? config.downloadUrl.mobile?.ios
                : config.downloadUrl.mobile?.android;

              if (storeUrl) {
                window.open(storeUrl, "_blank");
              }
            }, 3000);
          } else {
            // Desktop: Open extension download page
            const downloadUrl = `${
              config.downloadUrl.desktop
            }?utm_source=belp&utm_medium=web&return_url=${encodeURIComponent(
              currentUrl
            )}`;
            console.log(`Opening ${config.displayName} download:`, downloadUrl);
            window.open(downloadUrl, "_blank");
          }
          return;
        }

        if (!provider.connect) {
          throw new Error(`${config.displayName} does not support connection`);
        }

        console.log(`Starting ${config.displayName} wallet connection...`);

        // Request connection from wallet
        const resp = await provider.connect();

        if (!resp?.publicKey) {
          throw new Error(
            `Failed to get public key from ${config.displayName}`
          );
        }

        const addr = resp.publicKey.toString();
        setSolAddress(addr);
        setConnectedType("sol");
        setConnectedWallet(walletType);

        console.log(`${config.displayName} connected:`, addr);

        // Authenticate with backend using centralized function, force balance refresh
        const authSuccess = await authenticateWallet(addr, true);

        if (authSuccess) {
          // Wait a moment to ensure token is properly set
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Now load user data (balance already loaded in authenticateWallet)
          console.log("Loading user data...");
          await loadUserData(addr);
        } else {
          console.warn(
            "Authentication failed, continuing without backend data"
          );
        }

        await refreshSolBalance();
        onConnected?.({ kind: "sol", address: addr, walletType });
        console.log(`${config.displayName} wallet connection successful!`);
      } catch (error: any) {
        console.error(`${config.displayName} connection failed:`, error);

        // Handle specific error cases
        if (error.message?.includes("User rejected") || error.code === 4001) {
          console.log("User cancelled the connection");
        } else if (error.code === -32002) {
          alert(
            `Connection request is already pending. Please check your ${config.displayName} wallet.`
          );
        } else if (error.message?.includes("wallet not found")) {
          alert(
            `${config.displayName} wallet not found. Please install ${config.displayName} extension or app.`
          );
        } else {
          alert(
            `Connection failed: ${
              error.message || "Unknown error"
            }. Please try again.`
          );
        }
      } finally {
        setLoading(null);
        hideLoading();
      }
    },
    [onConnected, loadUserData, showLoading, hideLoading, authenticateWallet]
  );

  // Simplified auto-connect with debounce
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isInitialLoadComplete ||
      isProcessingRef.current
    )
      return;

    // Clear any existing timeout
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    // Debounce to prevent multiple calls during React hydration
    initTimeoutRef.current = setTimeout(() => {
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;

      // Setup wallet listeners first
      Object.keys(WALLET_CONFIGS).forEach((walletType) => {
        setupWalletListeners(walletType as WalletType);
      });

      // Check if user manually disconnected
      const wasManuallyDisconnected =
        window.localStorage.getItem("wallet-disconnected") === "true";

      if (wasManuallyDisconnected) {
        console.log("User manually disconnected, skipping auto-connect");
        setIsInitialLoadComplete(true);
        isProcessingRef.current = false;
        return;
      }

      // Single scan for connected wallets
      const checkConnections = async () => {
        let foundConnection = false;

        for (const [walletType, config] of Object.entries(WALLET_CONFIGS)) {
          const provider = config.getProvider();

          if (
            provider?.isConnected === true &&
            provider?.publicKey &&
            !foundConnection
          ) {
            foundConnection = true;
            const addr = provider.publicKey.toString();
            console.log(
              `Found existing ${config.displayName} connection:`,
              addr
            );

            await handleConnection(walletType as WalletType, addr, true);
            break;
          }
        }

        // Try trusted connections if no existing connection
        if (!foundConnection) {
          for (const [walletType, config] of Object.entries(WALLET_CONFIGS)) {
            const provider = config.getProvider();

            if (provider?.connect && !foundConnection) {
              try {
                const response = await provider.connect({
                  onlyIfTrusted: true,
                });
                if (response?.publicKey) {
                  foundConnection = true;
                  const addr = response.publicKey.toString();
                  console.log(
                    `Trusted ${config.displayName} connection:`,
                    addr
                  );

                  await handleConnection(walletType as WalletType, addr, false);
                  break;
                }
              } catch {
                // Silent fail for trusted connections
              }
            }
          }
        }

        setIsInitialLoadComplete(true);
        isProcessingRef.current = false;
      };

      checkConnections();
    }, 300); // 300ms debounce

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      isProcessingRef.current = false;
      Object.keys(WALLET_CONFIGS).forEach((walletType) => {
        cleanupWalletListeners(walletType as WalletType);
      });
    };
  }, [
    setupWalletListeners,
    cleanupWalletListeners,
    handleConnection,
    isInitialLoadComplete,
  ]);

  // Generic disconnect function
  const disconnect = useCallback(async () => {
    try {
      console.log("Disconnecting wallet...", {
        connectedWallet,
        hasToken: AuthService.hasToken(),
        address: solAddress,
      });

      // Disconnect from current wallet if connected
      if (connectedWallet) {
        const config = WALLET_CONFIGS[connectedWallet];
        const provider = config.getProvider();

        if (provider?.disconnect) {
          await provider.disconnect();
          console.log(`${config.displayName} provider disconnected`);
        }

        cleanupWalletListeners(connectedWallet);
      }

      // Reset all state
      setConnectedType(null);
      setSolAddress(null);
      setSolLamports(0);
      setConnectedWallet(null);
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0); // Clear cache timestamp
      setUserStatsLastLoaded(0); // Clear user stats cache timestamp
      setIsInitialLoadComplete(false); // Reset initial load flag

      // Dispatch wallet disconnected event for AuthProvider
      window.dispatchEvent(new CustomEvent("wallet:disconnected"));

      // Clear all stores
      clearConfig();

      // Set disconnected flag to prevent auto-reconnect
      window.localStorage.setItem("wallet-disconnected", "true");

      // Cleanup JWT token
      AuthService.removeToken();

      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);

      // Force cleanup even if there's an error
      setConnectedType(null);
      setSolAddress(null);
      setSolLamports(0);
      setConnectedWallet(null);
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0); // Clear cache timestamp
      setUserStatsLastLoaded(0); // Clear user stats cache timestamp
      setIsInitialLoadComplete(false); // Reset initial load flag

      // Clear all stores
      clearConfig();

      AuthService.removeToken();
      window.localStorage.setItem("wallet-disconnected", "true");
    }
  }, [connectedWallet, cleanupWalletListeners, solAddress, clearConfig]);

  // Listen for wallet events to sync state across instances
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔗 Wallet connected event received - syncing state");

      // Check for any connected wallet and update state
      for (const [walletType, config] of Object.entries(WALLET_CONFIGS)) {
        const provider = config.getProvider();

        if (provider?.isConnected === true && provider?.publicKey) {
          const addr = provider.publicKey.toString();
          console.log(`Syncing ${config.displayName} connection:`, addr);

          setSolAddress(addr);
          setConnectedWallet(walletType as WalletType);
          setConnectedType("sol");

          // Check for auth token
          const token = AuthService.getToken();
          if (token) {
            setAuthToken(token);
          }

          // Load balance after syncing state (force refresh to ignore rate limit)
          await refreshSolBalance(true);

          // Call onConnected callback if provided
          onConnected?.({
            kind: "sol",
            address: addr,
            walletType: walletType as WalletType,
          });

          break;
        }
      }
    };

    const handleWalletDisconnected = () => {
      console.log("🔌 Wallet disconnected event received - syncing state");
      setSolAddress(null);
      setConnectedWallet(null);
      setConnectedType(null);
      setAuthToken(null);
      setSolLamports(0);
    };

    // Listen for custom wallet events
    window.addEventListener("wallet:connected", handleWalletConnected);
    window.addEventListener("wallet:disconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("wallet:connected", handleWalletConnected);
      window.removeEventListener(
        "wallet:disconnected",
        handleWalletDisconnected
      );
    };
  }, [onConnected, refreshSolBalance]); // Add refreshSolBalance to dependencies

  // Utility functions
  const shorten = useCallback(
    (addr?: string | null) =>
      addr ? addr.slice(0, 4) + "..." + addr.slice(-4) : "Connect wallet",
    []
  );

  // Check which wallets are available
  const availableWallets = useMemo(() => {
    return Object.entries(WALLET_CONFIGS)
      .filter(([_, config]) => config.isAvailable())
      .map(([walletType, config]) => ({
        type: walletType as WalletType,
        ...config,
      }));
  }, []);

  // Specific wallet connection functions for backward compatibility
  const connectPhantom = useCallback(
    () => connectWallet("phantom"),
    [connectWallet]
  );
  const connectSolflare = useCallback(
    () => connectWallet("solflare"),
    [connectWallet]
  );
  const connectBackpack = useCallback(
    () => connectWallet("backpack"),
    [connectWallet]
  );
  const connectGlow = useCallback(() => connectWallet("glow"), [connectWallet]);
  const connectOKX = useCallback(() => connectWallet("okx"), [connectWallet]);

  // Check if specific wallets are available (backward compatibility)
  const hasPhantom = WALLET_CONFIGS.phantom.isAvailable();
  const hasSolflare = WALLET_CONFIGS.solflare.isAvailable();
  const hasBackpack = WALLET_CONFIGS.backpack.isAvailable();
  const hasGlow = WALLET_CONFIGS.glow.isAvailable();
  const hasOKX = WALLET_CONFIGS.okx.isAvailable();

  // Debug utilities
  const getDebugInfo = useCallback(() => {
    return {
      solAddress,
      connectedWallet,
      connectedType,
      loading,
      hasToken: AuthService.hasToken(),
      isTokenValid: AuthService.isTokenValid(),
      disconnectedFlag: window.localStorage?.getItem("wallet-disconnected"),
      availableWallets: availableWallets.map((w) => w.type),
      providers: Object.entries(WALLET_CONFIGS).map(([type, config]) => ({
        type,
        available: config.isAvailable(),
        provider: !!config.getProvider(),
        connected: config.getProvider()?.isConnected,
      })),
    };
  }, [solAddress, connectedWallet, connectedType, loading, availableWallets]);

  // Force reconnect utility for debugging
  const forceReconnect = useCallback(async () => {
    console.log("Force reconnecting...");
    window.localStorage.removeItem("wallet-disconnected");

    if (connectedWallet) {
      await disconnect();
      setTimeout(() => {
        connectWallet(connectedWallet);
      }, 1000);
    }
  }, [connectedWallet, disconnect, connectWallet]);

  return {
    // State
    solAddress,
    connectedType,
    connectedWallet,
    loading,
    solLamports,
    solBalanceText,
    authToken,
    userStatistics,
    transactions,
    isLoadingTransactions,
    isLoadingUserStats,

    // Available wallets
    availableWallets,

    // Generic actions
    connectWallet,
    disconnect,
    refreshSolBalance,
    loadUserData,
    loadTransactions: (forceRefresh = false) => loadTransactions(forceRefresh),
    loadUserStatistics: (forceRefresh = false) =>
      loadUserStatistics(forceRefresh),
    shorten,

    // Specific wallet actions (backward compatibility)
    connectPhantom,
    connectSolflare,
    connectBackpack,
    connectGlow,
    connectOKX,

    // Wallet availability checks (backward compatibility)
    hasPhantom,
    hasSolflare,
    hasBackpack,
    hasGlow,
    hasOKX,
    getSolBalanceLamports,

    // Wallet configs access
    getWalletConfig: (walletType: WalletType) => WALLET_CONFIGS[walletType],
    getWalletProvider: (walletType: WalletType) =>
      WALLET_CONFIGS[walletType].getProvider(),

    // Debug utilities (for development)
    getDebugInfo,
    forceReconnect,

    // Token utilities
    hasValidToken: () => AuthService.isTokenValid(),
    clearToken: () => {
      AuthService.removeToken();
      setAuthToken(null);
      clearConfig();
    },
  };
}

// Global flag to prevent multiple balance calls across all instances
let globalBalanceLoading = false;
let globalLastBalanceLoad = 0;
// Global flag to prevent multiple connection processing
let globalConnectionProcessed = false;

export async function getSolBalanceLamports(address: string): Promise<number> {
  const rpcClient = new Connection(BLOCKCHAIN_CONFIG.SOLANA_RPC);
  const pubkey = new PublicKey(address);

  const lamports = await rpcClient.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}
