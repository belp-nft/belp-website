"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useBalance } from "@/providers/BalanceProvider";
import { useClearConfig, useConfig } from "@/stores/config";

import { AuthService } from "@/services";
import { WalletStorage } from "@/constants/storage";

// Import separated services
import { WalletDebugService } from "./wallet/debugService";
import { WalletType, LoadingKind, Connected } from "./wallet/types";
import {
  generateWalletAvailabilityChecks,
  generateWalletConnectors,
} from "./wallet/walletHelpers";
import { WALLET_CONFIGS } from "./wallet/configs";
import { formatSol, shortenAddress } from "./wallet/utils";
import { UserDataService } from "./wallet/userDataService";
import { AuthenticationService } from "./wallet/authService";
import { WalletListenerService } from "./wallet/listenerService";
import { getSolBalanceLamports } from "./wallet/blockchainService";

// Global flags to prevent duplicate operations
let globalConnectionProcessed = false;

export type { WalletType, Connected };

export function useWallet(onConnected?: (info: Connected) => void) {
  const router = useRouter();

  // State management với localStorage initialization
  const [solAddress, setSolAddressState] = useState<string | null>(null);
  const [connectedType, setConnectedTypeState] = useState<"sol" | null>(null);
  const [connectedWallet, setConnectedWalletState] =
    useState<WalletType | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wrapper functions for localStorage sync
  const setSolAddress = useCallback((address: string | null) => {
    setSolAddressState(address);
    currentSolAddressRef.current = address; // Keep ref in sync
    WalletStorage.setAddress(address);
  }, []);

  const setConnectedType = useCallback((type: "sol" | null) => {
    setConnectedTypeState(type);
    WalletStorage.setType(type);
  }, []);

  const setConnectedWallet = useCallback((wallet: WalletType | null) => {
    setConnectedWalletState(wallet);
    WalletStorage.setWallet(wallet);
  }, []);

  const clearWalletState = useCallback(() => {
    setSolAddressState(null);
    setConnectedTypeState(null);
    setConnectedWalletState(null);
    WalletStorage.clear();
  }, []);

  // Hydrate from localStorage after mount (SSR safe)
  useEffect(() => {
    if (typeof window !== "undefined" && !isHydrated) {
      // Only hydrate if not manually disconnected
      if (!WalletStorage.isDisconnected()) {
        const storedAddress = WalletStorage.getAddress();
        const storedType = WalletStorage.getType();
        const storedWallet = WalletStorage.getWallet();
        if (storedAddress) {
          setSolAddressState(storedAddress);
          currentSolAddressRef.current = storedAddress; // Sync ref during hydration
        }
        if (storedType) setConnectedTypeState(storedType as "sol");
        if (storedWallet) setConnectedWalletState(storedWallet as WalletType);
      } else {
        console.log("⏹️ User disconnected, skipping hydration");
      }
      setIsHydrated(true);
    }
  }, [isHydrated]);

  // Local state for non-persistent data
  const [loading, setLoading] = useState<LoadingKind>(null);
  const { solLamports, setSolLamports } = useBalance();
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

  // Refs for preventing duplicate operations
  const isProcessingRef = useRef(false);
  const hasProcessedConnectionRef = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Map<WalletType, any>>(new Map());
  const isLoadingUserDataRef = useRef(false);
  const isLoadingTransactionsRef = useRef(false);
  const currentSolAddressRef = useRef<string | null>(null);

  const clearConfig = useClearConfig();
  const configData = useConfig();

  // Computed values
  const solBalanceText = useMemo(
    () => (solLamports === null ? "—" : formatSol(solLamports)),
    [solLamports]
  );

  // Check if wallet is ready for API calls (connected + authenticated)
  const isWalletReady = useMemo(() => {
    return !!(
      solAddress &&
      authToken &&
      !isAuthenticating &&
      AuthService.isTokenValid()
    );
  }, [solAddress, authToken, isAuthenticating]);

  // Memoize RPC URL to prevent unnecessary re-renders
  const rpcUrl = useMemo(() => {
    return (
      configData?.rpcUrl ||
      "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06"
    );
  }, [configData?.rpcUrl]);

  // Helper function to get SOL balance using config RPC URL
  const getSolBalance = useCallback(
    async (address: string): Promise<number> => {
      return await getSolBalanceLamports(address, rpcUrl);
    },
    [rpcUrl]
  );

  // Balance management
  const refreshSolBalance = useCallback(
    async (forceRefresh = false) => {
      if (!solAddress) {
        console.warn("💰 No wallet address, cannot fetch balance");
        setSolLamports(0);
        return;
      }

      try {
        setLoading("sol-balance");
        console.log("💰 Fetching balance for:", solAddress);
        const lamports = await getSolBalance(solAddress);
        setSolLamports(lamports);
        console.log("✅ Balance loaded:", lamports);
      } catch (error) {
        console.error("❌ Failed to fetch balance:", error);
        setSolLamports(0);
      } finally {
        setLoading(null);
      }
    },
    [solAddress]
  );

  // User data management
  const loadTransactions = useCallback(
    async (forceRefresh: boolean = false) => {
      // Check authentication before proceeding
      if (!solAddress || !authToken || !AuthService.isTokenValid()) {
        return;
      }

      if (
        !forceRefresh &&
        (isLoadingTransactions || isLoadingTransactionsRef.current)
      ) {
        return;
      }

      isLoadingTransactionsRef.current = true;

      try {
        await UserDataService.loadTransactions(
          isLoadingTransactions,
          transactions,
          transactionsLastLoaded,
          setIsLoadingTransactions,
          setTransactions,
          setTransactionsLastLoaded,
          forceRefresh
        );
      } finally {
        isLoadingTransactionsRef.current = false;
      }
    },
    [
      isLoadingTransactions,
      transactions,
      transactionsLastLoaded,
      solAddress,
      authToken,
    ]
  );

  const loadUserStatistics = useCallback(
    async (forceRefresh: boolean = false) => {
      // Check authentication before proceeding
      if (!solAddress || !authToken || !AuthService.isTokenValid()) {
        console.warn("⚠️ Skipping user statistics loading - not authenticated");
        return;
      }

      await UserDataService.loadUserStatistics(
        isLoadingUserStats,
        userStatistics,
        userStatsLastLoaded,
        setIsLoadingUserStats,
        setUserStatistics,
        setUserStatsLastLoaded,
        forceRefresh
      );
    },
    [
      isLoadingUserStats,
      userStatistics,
      userStatsLastLoaded,
      solAddress,
      authToken,
    ]
  );

  const loadUserData = useCallback(
    async (walletAddress: string, retryAuth: boolean = false) => {
      // Check authentication before proceeding (unless it's a retry)
      if (
        !retryAuth &&
        (!walletAddress || !authToken || !AuthService.isTokenValid())
      ) {
        return;
      }

      if (
        !retryAuth &&
        (isLoadingUserStats ||
          isLoadingTransactions ||
          isLoadingUserDataRef.current ||
          isLoadingTransactionsRef.current)
      ) {
        return;
      }

      isLoadingUserDataRef.current = true;

      try {
        await loadUserStatistics(retryAuth);
        await loadTransactions(retryAuth);
      } catch (error: any) {
        console.error("Failed to load user data:", error);

        if (
          error.response?.status === 401 ||
          error.message?.includes("Unauthorized")
        ) {
          AuthService.removeToken();
          setAuthToken(null);
        }
      } finally {
        isLoadingUserDataRef.current = false;
      }
    },
    [
      loadUserStatistics,
      loadTransactions,
      isLoadingUserStats,
      isLoadingTransactions,
      authToken,
    ]
  );

  // Authentication
  const authenticateWallet = useCallback(
    async (
      walletAddress: string,
      forceBalanceRefresh: boolean = false
    ): Promise<boolean> => {
      return await AuthenticationService.authenticateWallet(
        walletAddress,
        forceBalanceRefresh,
        isAuthenticating,
        setIsAuthenticating,
        setAuthToken,
        refreshSolBalance
      );
    },
    [isAuthenticating, refreshSolBalance]
  );

  // Wallet listeners setup
  const setupWalletListeners = useCallback(
    (walletType: WalletType) => {
      WalletListenerService.setupWalletListeners(
        walletType,
        listenersRef,
        setSolAddress,
        setConnectedWallet,
        setConnectedType,
        setSolLamports,
        // Handle account changed callback
        async (newAddress: string, changedWalletType: WalletType) => {
          const currentAddress = currentSolAddressRef.current;

          if (!currentAddress) {
            return;
          }

          if (currentAddress === newAddress) {
            return;
          }

          // Clear tokens and user data
          AuthService.removeToken();
          setAuthToken(null);
          setUserStatistics(null);
          setTransactions([]);
          setTransactionsLastLoaded(0);
          setUserStatsLastLoaded(0);

          // Reset wallet connection state
          setSolAddress(null);
          setConnectedWallet(null);
          setConnectedType(null);

          // Reset global connection flags to prevent auto-reconnect
          globalConnectionProcessed = true; // Keep as true to prevent auto-connect
          hasProcessedConnectionRef.current = true;

          // Clean up wallet listeners to prevent immediate reconnection
          if (connectedWallet) {
            WalletListenerService.cleanupWalletListeners(
              connectedWallet,
              listenersRef
            );
          }

          WalletStorage.clear();
          clearConfig();
          window.localStorage.removeItem("last-wallet-type");

          // Redirect to home page instead of re-authenticating
          if (router.pathname.startsWith("/my-collection")) {
            router.push("/");
          }
        },
        // Get current sol address function
        () => solAddress
      );
    },
    [
      setSolAddress,
      setConnectedWallet,
      setConnectedType,
      authenticateWallet,
      loadUserData,
      onConnected,
      solAddress,
      router,
      clearWalletState,
      clearConfig,
      connectedWallet,
      listenersRef,
    ]
  );

  const cleanupWalletListeners = useCallback((walletType: WalletType) => {
    WalletListenerService.cleanupWalletListeners(walletType, listenersRef);
  }, []);

  // Connection handling
  const handleConnection = useCallback(
    async (
      walletType: WalletType,
      addr: string,
      isExisting: boolean = false
    ) => {
      if (globalConnectionProcessed || hasProcessedConnectionRef.current) {
        console.log("Connection already processed globally, skipping...");
        return;
      }

      globalConnectionProcessed = true;
      hasProcessedConnectionRef.current = true;
      setSolAddress(addr);
      setConnectedType("sol");
      setConnectedWallet(walletType);

      // Save wallet type for future restoration
      window.localStorage.setItem("last-wallet-type", walletType);

      const config = WALLET_CONFIGS[walletType];
      console.log(
        `Processing ${isExisting ? "existing" : "new"} ${config.displayName} connection...`
      );

      try {
        const existingToken = AuthService.getToken();
        if (existingToken && AuthService.isTokenValid()) {
          console.log("Valid token exists, loading data");
          setAuthToken(existingToken);
        } else {
          console.log("Authenticating wallet...");
          const authSuccess = await authenticateWallet(addr);
          if (authSuccess) {
            await refreshSolBalance();
          }
        }

        onConnected?.({ kind: "sol", address: addr, walletType });
      } catch (error) {
        console.error("Connection handling error:", error);
        globalConnectionProcessed = false;
        hasProcessedConnectionRef.current = false;
      }
    },
    [refreshSolBalance, authenticateWallet, onConnected]
  );

  // Main wallet connection function
  const connectWallet = useCallback(
    async (walletType: WalletType) => {
      const config = WALLET_CONFIGS[walletType];

      try {
        setLoading(walletType);
        window.localStorage.removeItem("wallet-disconnected");

        const provider = config.getProvider();

        // If provider not found, redirect to download/install
        if (!provider) {
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

        // Save wallet type for future restoration
        window.localStorage.setItem("last-wallet-type", walletType);

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
      }
    },
    [authenticateWallet, refreshSolBalance]
  );

  // Restore wallet state from localStorage on initial load
  useEffect(() => {
    if (typeof window === "undefined" || solAddress) return;

    // Check for existing valid token and try to restore wallet address
    const existingToken = AuthService.getToken();
    if (existingToken && AuthService.isTokenValid()) {
      try {
        // Try to decode wallet address from JWT token
        const parts = existingToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const walletAddress =
            payload.walletAddress || payload.address || payload.wallet;

          if (walletAddress) {
            // Get current connected wallet address to compare
            const lastWalletType =
              (window.localStorage.getItem("last-wallet-type") as WalletType) ||
              "phantom";

            // Check if we have a wallet provider with current address
            const config = WALLET_CONFIGS[lastWalletType];
            const provider = config.getProvider();
            const currentWalletAddress = provider?.publicKey?.toString();

            // If current wallet address differs from token address, clear old token
            if (
              currentWalletAddress &&
              currentWalletAddress.toLowerCase() !== walletAddress.toLowerCase()
            ) {
              console.log(
                "🔄 Wallet address changed, clearing old token and disconnecting..."
              );

              // Don't auto-reconnect - just clear everything and stay disconnected
              AuthService.removeToken();
              setAuthToken(null);
              WalletStorage.clear();
              clearConfig();
              window.localStorage.removeItem("last-wallet-type");

              return;
            }

            console.log(
              "🔄 Restoring wallet address from token:",
              walletAddress
            );
            setSolAddress(walletAddress);
            setAuthToken(existingToken);
            setConnectedWallet(lastWalletType);
            setConnectedType("sol");

            refreshSolBalance();

            // Only load user data if we don't have recent data
            // Use setTimeout to avoid hydration mismatch with Date.now()
            setTimeout(() => {
              const now = Date.now();
              const hasRecentUserStats =
                userStatistics && now - userStatsLastLoaded < 5 * 60 * 1000; // 5 minutes
              const hasRecentTransactions =
                transactions.length > 0 &&
                now - transactionsLastLoaded < 5 * 60 * 1000; // 5 minutes

              if (!hasRecentUserStats || !hasRecentTransactions) {
                loadUserData(walletAddress);
              }
            }, 0);

            onConnected?.({
              kind: "sol",
              address: walletAddress,
              walletType: lastWalletType,
            });
          }
        }
      } catch (error) {
        console.warn("Failed to restore wallet from token:", error);
        AuthService.removeToken();
      }
    }
  }, [authenticateWallet, refreshSolBalance, loadUserData, onConnected]);

  // Auto-refresh balance when wallet address or RPC URL changes
  useEffect(() => {
    if (solAddress && rpcUrl) {
      console.log("🔄 Auto-refreshing balance due to address/RPC change:", {
        solAddress,
        rpcUrl,
      });
      refreshSolBalance();
    }
  }, [solAddress, rpcUrl, refreshSolBalance]);

  // Periodic check for account changes (fallback if events don't work)
  useEffect(() => {
    if (!connectedWallet || !solAddress) return;

    const checkForAccountChanges = async () => {
      try {
        const config = WALLET_CONFIGS[connectedWallet];
        const provider = config.getProvider();

        if (!provider?.publicKey) return;

        const currentProviderAddress = provider.publicKey.toString();

        // If provider address differs from our stored address, account was changed
        if (currentProviderAddress !== solAddress) {
          console.log("🔄 Detected account change via periodic check:", {
            stored: solAddress,
            current: currentProviderAddress,
            wallet: connectedWallet,
          });

          // Clear authentication and wallet state
          AuthService.removeToken();
          setAuthToken(null);
          setUserStatistics(null);
          setTransactions([]);
          setTransactionsLastLoaded(0);
          setUserStatsLastLoaded(0);

          // Reset wallet connection state
          setSolAddress(null);
          setConnectedWallet(null);
          setConnectedType(null);

          // Clear storage and set disconnected flag
          WalletStorage.clear();
          clearConfig();
          window.localStorage.removeItem("last-wallet-type");

          // Clean up listeners
          WalletListenerService.cleanupWalletListeners(
            connectedWallet,
            listenersRef
          );

          // Redirect to home
          if (router.pathname.startsWith("/my-collection")) {
            router.push("/");
          }
        }
      } catch (error) {
        // Ignore errors in periodic check to avoid spam
      }
    };

    // Check every 2 seconds when connected
    const interval = setInterval(checkForAccountChanges, 2000);

    return () => clearInterval(interval);
  }, [
    connectedWallet,
    solAddress,
    router,
    clearConfig,
    listenersRef,
    setSolLamports,
  ]);

  // Simplified auto-connect with debounce
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isInitialLoadComplete ||
      isProcessingRef.current ||
      solAddress // Skip if already restored from token
    )
      return;

    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    initTimeoutRef.current = setTimeout(() => {
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;

      Object.keys(WALLET_CONFIGS).forEach((walletType) => {
        setupWalletListeners(walletType as WalletType);
      });

      // Check if user manually disconnected
      if (WalletStorage.isDisconnected()) {
        console.log("User manually disconnected, skipping auto-connect");
        setIsInitialLoadComplete(true);
        isProcessingRef.current = false;
        return;
      }

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
    }, 300);

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
    solAddress, // Add solAddress to dependencies
  ]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    try {
      console.log("Disconnecting wallet...");

      if (connectedWallet) {
        const config = WALLET_CONFIGS[connectedWallet];
        const provider = config.getProvider();

        if (provider?.disconnect) {
          await provider.disconnect();
          console.log(`${config.displayName} provider disconnected`);
        }

        cleanupWalletListeners(connectedWallet);
      }

      // Reset state but keep isInitialLoadComplete to prevent auto-reconnect
      clearWalletState();
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0);
      setUserStatsLastLoaded(0);
      // Don't reset isInitialLoadComplete to prevent auto-connect

      window.dispatchEvent(new CustomEvent("wallet:disconnected"));
      clearConfig();

      // Set disconnected flag to prevent auto-reconnect
      window.localStorage.setItem("wallet-disconnected", "true");

      // Clear wallet type
      window.localStorage.removeItem("last-wallet-type");

      // Cleanup JWT token

      AuthService.removeToken();

      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);

      // Force cleanup on error but keep isInitialLoadComplete
      clearWalletState();
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0);
      setUserStatsLastLoaded(0);
      // Don't reset isInitialLoadComplete to prevent auto-connect

      clearConfig();
      AuthService.removeToken();
      window.localStorage.setItem("wallet-disconnected", "true");
      window.localStorage.removeItem("last-wallet-type");
    }
  }, [connectedWallet, cleanupWalletListeners, clearConfig, clearWalletState]);

  // Wallet event listeners
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔗 Wallet connected event received - syncing state");

      for (const [walletType, config] of Object.entries(WALLET_CONFIGS)) {
        const provider = config.getProvider();

        if (provider?.isConnected === true && provider?.publicKey) {
          const addr = provider.publicKey.toString();
          console.log(`Syncing ${config.displayName} connection:`, addr);

          setSolAddress(addr);
          setConnectedWallet(walletType as WalletType);
          setConnectedType("sol");

          const token = AuthService.getToken();
          if (token) {
            setAuthToken(token);
          }

          await refreshSolBalance(true);
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
      clearWalletState();
      setAuthToken(null);
      setSolLamports(0);
    };

    window.addEventListener("wallet:connected", handleWalletConnected);
    window.addEventListener("wallet:disconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("wallet:connected", handleWalletConnected);
      window.removeEventListener(
        "wallet:disconnected",
        handleWalletDisconnected
      );
    };
  }, [onConnected, refreshSolBalance]);

  // Utility functions
  const shorten = useCallback(
    (addr?: string | null) => shortenAddress({ addr }),
    []
  );

  // Generate available wallets list
  const availableWallets = useMemo(() => {
    return Object.entries(WALLET_CONFIGS)
      .filter(([_, config]) => config.isAvailable())
      .map(([walletType, config]) => ({
        type: walletType as WalletType,
        name: config.displayName,
        isInstalled: true,
      }));
  }, []);

  // Generate wallet availability checks dynamically
  const walletHelpers = useMemo(() => generateWalletAvailabilityChecks(), []);

  // Extract availability checks for components that need them
  const { hasPhantom, hasSolflare, hasBackpack, hasGlow, hasOKX } =
    walletHelpers;
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
    isAuthenticating,
    isWalletReady,
    isHydrated, // Expose hydration state to prevent flickering in components

    // Generic actions
    connectWallet,
    disconnect,
    refreshSolBalance,
    getSolBalance,
    loadUserData,
    loadTransactions: (forceRefresh = false) => loadTransactions(forceRefresh),
    loadUserStatistics: (forceRefresh = false) =>
      loadUserStatistics(forceRefresh),
    shorten,

    // Wallet availability checks
    hasPhantom,
    hasSolflare,
    hasBackpack,
    hasGlow,
    hasOKX,

    // Available wallets list
    availableWallets,

    // Wallet configs access
    getWalletConfig: (walletType: WalletType) => WALLET_CONFIGS[walletType],
    getWalletProvider: (walletType: WalletType) =>
      WALLET_CONFIGS[walletType].getProvider(),

    // Token utilities
    hasValidToken: () => AuthService.isTokenValid(),
    clearToken: () => {
      AuthService.removeToken();
      setAuthToken(null);
      clearConfig();
    },

    // Debug helpers for development
    debugWallet: (walletType: WalletType) =>
      WalletDebugService.debugWalletEvents(walletType),
    setupDebugListeners: () => WalletDebugService.setupDebugListeners(),
    logAuthStatus: () => {
      console.log("🔍 Wallet Auth Status:", {
        solAddress,
        hasAuthToken: !!authToken,
        isAuthenticating,
        isWalletReady,
        hasValidToken: AuthService.isTokenValid(),
        timestamp: new Date().toISOString(),
      });
    },
    logBalanceStatus: () => {
      console.log("🔍 Wallet Balance Status:", {
        solAddress,
        solLamports,
        solBalanceText,
        rpcUrl,
        loading,
        timestamp: new Date().toISOString(),
      });
    },
    forceRefreshBalance: () => {
      refreshSolBalance(true);
    },
  };
}
