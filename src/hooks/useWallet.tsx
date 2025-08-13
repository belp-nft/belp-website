"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  UserService,
  AuthService,
  NftService,
  ConfigService,
} from "@/services";
import { useConfigActions } from "@/stores/config";
import { useLoading } from "@/providers/LoadingProvider";

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

const SOLANA_RPC = "https://api.devnet.solana.com";

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

async function getSolBalanceLamports(address: string): Promise<number> {
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getBalance",
    params: [address, { commitment: "processed" }],
  };
  const res = await fetch(SOLANA_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json?.error) throw new Error(json.error?.message || "RPC error");
  return json?.result?.value ?? 0;
}

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

  const { clearConfig } = useConfigActions();
  const { showLoading, hideLoading, setLoadingMessage } = useLoading();

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

  const refreshSolBalance = useCallback(
    async (addr?: string | null) => {
      const target = (addr ?? solAddress) || null;
      if (!target) return;
      try {
        setLoading("sol-balance");
        const lamports = await getSolBalanceLamports(target);
        setSolLamports(lamports);
      } catch {
        setSolLamports(0);
      } finally {
        setLoading((l) => (l === "sol-balance" ? null : l));
      }
    },
    [solAddress]
  );

  const loadUserData = useCallback(
    async (walletAddress: string, retryAuth: boolean = false) => {
      try {
        console.log("Loading user data...", { walletAddress, retryAuth });

        // Load user statistics
        const statsResult = await UserService.getUserStatistics(walletAddress);
        if (statsResult.success && statsResult.data) {
          setUserStatistics(statsResult.data);
          console.log("User statistics loaded:", statsResult.data);
        } else if (
          statsResult.message?.includes("Unauthorized") ||
          statsResult.message?.includes("401")
        ) {
          console.warn("Token may be expired, trying to re-authenticate...");

          if (!retryAuth) {
            // Try to re-authenticate and retry once
            try {
              const connectResult = await UserService.connectWallet(
                walletAddress
              );
              if (
                connectResult.success &&
                (connectResult as any).data?.accessToken
              ) {
                AuthService.setToken((connectResult as any).data.accessToken);
                setAuthToken((connectResult as any).data.accessToken);
                console.log(
                  "Re-authentication successful, retrying data load..."
                );

                // Retry loading user data
                return loadUserData(walletAddress, true);
              }
            } catch (authError) {
              console.error("Re-authentication failed:", authError);
            }
          } else {
            console.error(
              "Authentication retry failed, user needs to reconnect wallet"
            );
          }
        }

        // Load transaction history
        const txResult = await UserService.getTransactions(walletAddress, {
          limit: 50,
        });
        if (txResult.success && txResult.data) {
          setTransactions(txResult.data);
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
          if (!retryAuth) {
            // Already handled auth retry above, just log this case
            console.log(
              "Skipping transaction retry - auth was already attempted"
            );
          }
        }
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
    []
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
          refreshSolBalance(addr);
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
    [refreshSolBalance]
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

  // Generic wallet connection function
  const connectWallet = useCallback(
    async (walletType: WalletType) => {
      const config = WALLET_CONFIGS[walletType];

      try {
        setLoading(walletType);
        showLoading(`Connecting to ${config.displayName}...`);
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

        // Authenticate with backend
        setLoadingMessage("Authenticating with backend...");
        console.log("Authenticating with backend...");
        const connectResult = await UserService.connectWallet(addr);

        if (connectResult.success) {
          // Save JWT token FIRST
          if ((connectResult as any).data?.accessToken) {
            const token = (connectResult as any).data.accessToken;
            AuthService.setToken(token);
            setAuthToken(token);
            console.log("JWT token saved successfully");

            // Wait a moment to ensure token is properly set
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Verify token is valid before proceeding
            if (AuthService.isTokenValid()) {
              console.log("Token validation successful");

              // Now load user data with valid token
              setLoadingMessage("Loading user data...");
              await loadUserData(addr);
            } else {
              console.error("Token validation failed after setting");
            }
          } else {
            console.warn("No access token received from backend");
          }
        } else {
          console.error(
            "Backend authentication failed:",
            connectResult.message
          );
          // Continue with connection but without backend authentication
        }

        // Load SOL balance
        setLoadingMessage("Loading wallet balance...");
        setTimeout(async () => {
          try {
            const lamports = await getSolBalanceLamports(addr);
            setSolLamports(lamports);
          } catch {
            setSolLamports(0);
          }
        }, 0);

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
    [onConnected, loadUserData, showLoading, hideLoading, setLoadingMessage]
  );

  // Auto-connect function for trusted connections
  const autoConnect = useCallback(
    async (walletType: WalletType) => {
      const config = WALLET_CONFIGS[walletType];
      const provider = config.getProvider();

      if (!provider?.isConnected || !provider?.publicKey) return null;

      try {
        console.log(`Attempting auto-connect for ${config.displayName}...`);

        const response = await provider.connect({ onlyIfTrusted: true });
        const addr = response.publicKey.toString();

        setSolAddress(addr);
        setConnectedType("sol");
        setConnectedWallet(walletType);

        console.log(`${config.displayName} auto-connect successful:`, addr);

        // Authenticate with backend
        const connectResult = await UserService.connectWallet(addr);

        if (connectResult.success && (connectResult as any).data?.accessToken) {
          AuthService.setToken((connectResult as any).data.accessToken);
          setAuthToken((connectResult as any).data.accessToken);
          console.log("JWT token saved from auto-connect");

          // Load user data
          await loadUserData(addr);

          onConnected?.({ kind: "sol", address: addr, walletType });
          return response;
        }
      } catch (error) {
        console.log(
          `${config.displayName} auto-connect failed, user needs to manually connect`
        );
      }

      return null;
    },
    [loadUserData, onConnected]
  );

  // Check for existing connections on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Setup listeners for all available wallets first
    Object.keys(WALLET_CONFIGS).forEach((walletType) => {
      setupWalletListeners(walletType as WalletType);
    });

    // Check if user manually disconnected - if so, don't auto-connect
    const wasManuallyDisconnected =
      window.localStorage.getItem("wallet-disconnected") === "true";

    if (wasManuallyDisconnected) {
      console.log("User manually disconnected, skipping auto-connect");
      return () => {
        Object.keys(WALLET_CONFIGS).forEach((walletType) => {
          cleanupWalletListeners(walletType as WalletType);
        });
      };
    }

    // Try to find an already connected wallet and re-authenticate
    for (const [walletType, config] of Object.entries(WALLET_CONFIGS)) {
      const provider = config.getProvider();

      if (provider?.isConnected === true && provider?.publicKey) {
        const addr = provider.publicKey.toString();
        setSolAddress(addr);
        setConnectedType("sol");
        setConnectedWallet(walletType as WalletType);
        refreshSolBalance(addr);

        // Always try to re-authenticate to get fresh token
        console.log(
          `Found connected ${config.displayName}, re-authenticating...`
        );
        UserService.connectWallet(addr)
          .then((connectResult) => {
            if (
              connectResult.success &&
              (connectResult as any).data?.accessToken
            ) {
              AuthService.setToken((connectResult as any).data.accessToken);
              setAuthToken((connectResult as any).data.accessToken);
              console.log("Re-authentication successful, token refreshed");

              // Load user data with fresh token
              loadUserData(addr).catch(console.error);
            } else {
              console.warn("Re-authentication failed, checking existing token");
              // Check if existing token is valid
              if (AuthService.validateAndCleanToken()) {
                const existingToken = AuthService.getToken();
                if (existingToken) {
                  setAuthToken(existingToken);
                  loadUserData(addr).catch(console.error);
                }
              } else {
                console.warn(
                  "No valid token available, user may need to reconnect"
                );
              }
            }
          })
          .catch((error) => {
            console.error("Re-authentication failed:", error);
            // Check if existing token is valid
            if (AuthService.validateAndCleanToken()) {
              const existingToken = AuthService.getToken();
              if (existingToken) {
                setAuthToken(existingToken);
                loadUserData(addr).catch(console.error);
              }
            } else {
              console.warn("No valid token available after auth failure");
            }
          });

        onConnected?.({
          kind: "sol",
          address: addr,
          walletType: walletType as WalletType,
        });
        break;
      } else if (provider?.connect) {
        // Try silent auto-connect for previously authorized wallets
        autoConnect(walletType as WalletType).catch(() => {
          console.log(`Silent connection failed for ${config.displayName}`);
        });
      }
    }

    return () => {
      Object.keys(WALLET_CONFIGS).forEach((walletType) => {
        cleanupWalletListeners(walletType as WalletType);
      });
    };
  }, [
    refreshSolBalance,
    setupWalletListeners,
    cleanupWalletListeners,
    loadUserData,
    autoConnect,
    onConnected,
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

      // Clear all stores
      clearConfig();

      AuthService.removeToken();
      window.localStorage.setItem("wallet-disconnected", "true");
    }
  }, [connectedWallet, cleanupWalletListeners, solAddress, clearConfig]);

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

    // Available wallets
    availableWallets,

    // Generic actions
    connectWallet,
    disconnect,
    autoConnect,
    refreshSolBalance,
    loadUserData,
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
