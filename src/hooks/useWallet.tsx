"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConfigActions } from "@/stores/config";
import { useLoading } from "@/providers/LoadingProvider";
import { AuthService } from "@/services";

// Import separated services
import { WalletType, LoadingKind, Connected } from "./wallet/types";
import {
  generateWalletAvailabilityChecks,
  generateWalletConnectors,
} from "./wallet/walletHelpers";
import { WALLET_CONFIGS } from "./wallet/configs";
import { formatSol, shortenAddress } from "./wallet/utils";
import { BalanceService } from "./wallet/balanceService";
import { UserDataService } from "./wallet/userDataService";
import { AuthenticationService } from "./wallet/authService";
import { WalletConnectionService } from "./wallet/connectionService";
import { WalletListenerService } from "./wallet/listenerService";
import { getSolBalanceLamports } from "./wallet/blockchainService";

// Global flags to prevent duplicate operations
let globalConnectionProcessed = false;

export type { WalletType, Connected };
export { getSolBalanceLamports };

export function useWallet(onConnected?: (info: Connected) => void) {
  // State management
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

  // Refs for preventing duplicate operations
  const isProcessingRef = useRef(false);
  const hasProcessedConnectionRef = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Map<WalletType, any>>(new Map());

  const { clearConfig } = useConfigActions();
  const { showLoading, hideLoading } = useLoading();

  // Computed values
  const solBalanceText = useMemo(
    () => (solLamports === null ? "—" : formatSol(solLamports)),
    [solLamports]
  );

  // Balance management
  const refreshSolBalance = useCallback(async (forceRefresh = false) => {
    await BalanceService.refreshSolBalance(
      forceRefresh,
      setSolLamports,
      setLoading
    );
  }, []);

  // User data management
  const loadTransactions = useCallback(
    async (forceRefresh: boolean = false) => {
      await UserDataService.loadTransactions(
        isLoadingTransactions,
        transactions,
        transactionsLastLoaded,
        setIsLoadingTransactions,
        setTransactions,
        setTransactionsLastLoaded,
        forceRefresh
      );
    },
    [isLoadingTransactions, transactions, transactionsLastLoaded]
  );

  const loadUserStatistics = useCallback(
    async (forceRefresh: boolean = false) => {
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
    [isLoadingUserStats, userStatistics, userStatsLastLoaded]
  );

  const loadUserData = useCallback(
    async (walletAddress: string, retryAuth: boolean = false) => {
      if (!retryAuth && isLoadingUserStats && isLoadingTransactions) {
        console.log("User data already loading, skipping duplicate call...");
        return;
      }

      try {
        console.log("Loading user data...", { walletAddress, retryAuth });
        await loadUserStatistics(retryAuth);
        await loadTransactions(retryAuth);
      } catch (error: any) {
        console.error("Failed to load user data:", error);

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
  const setupWalletListeners = useCallback((walletType: WalletType) => {
    WalletListenerService.setupWalletListeners(
      walletType,
      listenersRef,
      setSolAddress,
      setConnectedWallet,
      setConnectedType,
      setSolLamports
    );
  }, []);

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
      await WalletConnectionService.connectWallet(
        walletType,
        setLoading,
        showLoading,
        hideLoading,
        setSolAddress,
        setConnectedType,
        setConnectedWallet,
        authenticateWallet,
        refreshSolBalance
      );
    },
    [showLoading, hideLoading, authenticateWallet, refreshSolBalance]
  );

  // Auto-connect effect
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isInitialLoadComplete ||
      isProcessingRef.current
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

      const wasManuallyDisconnected =
        window.localStorage.getItem("wallet-disconnected") === "true";

      if (wasManuallyDisconnected) {
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

      // Reset all state
      setConnectedType(null);
      setSolAddress(null);
      setSolLamports(0);
      setConnectedWallet(null);
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0);
      setUserStatsLastLoaded(0);
      setIsInitialLoadComplete(false);

      window.dispatchEvent(new CustomEvent("wallet:disconnected"));
      clearConfig();
      window.localStorage.setItem("wallet-disconnected", "true");
      AuthService.removeToken();

      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);

      // Force cleanup on error
      setConnectedType(null);
      setSolAddress(null);
      setSolLamports(0);
      setConnectedWallet(null);
      setAuthToken(null);
      setUserStatistics(null);
      setTransactions([]);
      setTransactionsLastLoaded(0);
      setUserStatsLastLoaded(0);
      setIsInitialLoadComplete(false);

      clearConfig();
      AuthService.removeToken();
      window.localStorage.setItem("wallet-disconnected", "true");
    }
  }, [connectedWallet, cleanupWalletListeners, clearConfig]);

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
      setSolAddress(null);
      setConnectedWallet(null);
      setConnectedType(null);
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
    (addr?: string | null) => shortenAddress(addr),
    []
  );

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

    // Generic actions
    connectWallet,
    disconnect,
    refreshSolBalance,
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
  };
}
