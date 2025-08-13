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

export type Connected = { kind: "sol"; address: string };

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
  }
}

export type LoadingKind =
  | "phantom"
  | "solflare"
  | "backpack"
  | "glow"
  | "okx"
  | "sol-balance"
  | null;

const SOLANA_RPC = "https://api.devnet.solana.com";

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
  const [loading, setLoading] = useState<LoadingKind>(null);
  const [solLamports, setSolLamports] = useState<number>(0);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userStatistics, setUserStatistics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const solBalanceText = useMemo(
    () => (solLamports === null ? "—" : formatSol(solLamports)),
    [solLamports]
  );

  const solConnectRef = useRef<((...args: any[]) => void) | null>(null);
  const solDisconnectRef = useRef<((...args: any[]) => void) | null>(null);

  const hasPhantom = useMemo(() => {
    if (typeof window === "undefined") return false;

    // Check multiple provider locations for better detection across browsers
    const provider =
      window.solana?.isPhantom ||
      (window as any).phantom?.solana?.isPhantom ||
      !!(window.solana || (window as any).phantom?.solana);

    return !!provider;
  }, []);

  const getSolanaProvider = useCallback(() => {
    if (typeof window === "undefined") return null;

    // Try multiple provider locations - some extensions inject differently
    if (window.solana?.isPhantom) return window.solana;
    if ((window as any).phantom?.solana) return (window as any).phantom.solana;
    if (window.solana) return window.solana;
    if ((window.ethereum as any)?.solana)
      return (window.ethereum as any).solana;

    return null;
  }, []);

  const attachSolListeners = useCallback(() => {
    const sol = getSolanaProvider();
    if (!sol?.on) return;

    const onConnect = (..._args: any[]) => {
      const addr = sol.publicKey?.toString?.() || null;
      if (addr) {
        setSolAddress(addr);
        refreshSolBalance(addr);
      }
    };
    const onDisconnect = () => {
      setSolAddress(null);
      setSolLamports(0);
    };

    sol.on("connect", onConnect);
    sol.on("disconnect", onDisconnect);
    solConnectRef.current = onConnect;
    solDisconnectRef.current = onDisconnect;
  }, [getSolanaProvider]);

  const detachSolListeners = useCallback(() => {
    const sol = getSolanaProvider();
    if (!sol?.off) return;
    if (solConnectRef.current) {
      sol.off("connect", solConnectRef.current);
      solConnectRef.current = null;
    }
    if (solDisconnectRef.current) {
      sol.off("disconnect", solDisconnectRef.current);
      solDisconnectRef.current = null;
    }
  }, [getSolanaProvider]);

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

  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log("Loading user data...", { walletAddress });

      // Load user statistics
      const statsResult = await UserService.getUserStatistics(walletAddress);
      if (statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        console.log("User statistics loaded:", statsResult.data);
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
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.localStorage.getItem("wallet-disconnected") === "true") {
      attachSolListeners();
      return () => {
        detachSolListeners();
      };
    }

    const sol = getSolanaProvider();

    // Check if wallet is already connected
    if (sol?.isConnected === true && sol?.publicKey) {
      const addr = sol.publicKey.toString();
      setSolAddress(addr);
      setConnectedType("sol");
      refreshSolBalance(addr);
      onConnected?.({ kind: "sol", address: addr });

      // Load backend data if we have auth token
      const existingToken = AuthService.getToken();
      if (existingToken) {
        setAuthToken(existingToken);
        loadUserData(addr).catch(console.error);
      }
    } else if (sol?.connect) {
      // Try silent connection (only if previously authorized)
      sol
        .connect({ onlyIfTrusted: true })
        .then((resp: any) => {
          const addr = resp?.publicKey?.toString?.();
          if (addr) {
            setSolAddress(addr);
            setConnectedType("sol");
            refreshSolBalance(addr);
            onConnected?.({ kind: "sol", address: addr });

            // Load backend data if we have auth token
            const existingToken = AuthService.getToken();
            if (existingToken) {
              setAuthToken(existingToken);
              loadUserData(addr).catch(console.error);
            }
          }
        })
        .catch(() => {
          // Silent connection failed, user needs to manually connect
          console.log(
            "Silent connection failed - user needs to manually connect"
          );
        });
    }

    attachSolListeners();

    return () => {
      detachSolListeners();
    };
  }, [
    onConnected,
    getSolanaProvider,
    refreshSolBalance,
    attachSolListeners,
    detachSolListeners,
    loadUserData,
  ]);

  const connectPhantom = useCallback(async () => {
    try {
      setLoading("phantom");
      window.localStorage.removeItem("wallet-disconnected");

      const sol = getSolanaProvider();

      // If no provider detected, handle redirect to install/open Phantom
      if (!sol) {
        console.log("No Phantom provider detected, redirecting...");

        const currentUrl = window.location.href;
        const isMobile =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        if (isMobile) {
          // Mobile: Try deep link to Phantom app first
          const deepLink = `https://phantom.app/ul/browse/${encodeURIComponent(
            currentUrl
          )}?ref=belp`;
          console.log("Trying mobile deep link:", deepLink);

          // Try to open in Phantom app
          window.location.href = deepLink;

          // Fallback: Open app store after delay
          setTimeout(() => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const storeUrl = isIOS
              ? "https://apps.apple.com/app/phantom-solana-wallet/1598432977"
              : "https://play.google.com/store/apps/details?id=app.phantom";
            window.open(storeUrl, "_blank");
          }, 3000);
        } else {
          // Desktop: Open extension download page
          const downloadUrl = `https://phantom.app/download?utm_source=belp&utm_medium=web&return_url=${encodeURIComponent(
            currentUrl
          )}`;
          console.log("Opening desktop download:", downloadUrl);
          window.open(downloadUrl, "_blank");
        }
        return;
      }

      if (!sol.connect) {
        throw new Error("Wallet does not support connection");
      }

      console.log("Starting Phantom wallet connection...");

      // Request connection from wallet
      const resp = await sol.connect();

      if (!resp?.publicKey) {
        throw new Error("Failed to get public key from wallet");
      }

      const addr = resp.publicKey.toString();
      setSolAddress(addr);
      setConnectedType("sol");

      console.log("Phantom connected:", addr);

      // Authenticate with backend
      console.log("Authenticating with backend...");
      const connectResult = await UserService.connectWallet(addr);

      if (connectResult.success) {
        // Save JWT token
        if ((connectResult as any).data?.accessToken) {
          AuthService.setToken((connectResult as any).data.accessToken);
          setAuthToken((connectResult as any).data.accessToken);
          console.log("JWT token saved");
        }

        // Load user data
        await loadUserData(addr);
      }

      // Load SOL balance
      setTimeout(async () => {
        try {
          const lamports = await getSolBalanceLamports(addr);
          setSolLamports(lamports);
        } catch {
          setSolLamports(0);
        }
      }, 0);

      onConnected?.({ kind: "sol", address: addr });
      console.log("Phantom wallet connection successful!");
    } catch (error: any) {
      console.error("Phantom connection failed:", error);

      // Handle specific error cases with user-friendly messages
      if (error.message?.includes("User rejected") || error.code === 4001) {
        console.log("User cancelled the connection");
        // Don't show error for user cancellation
      } else if (error.code === -32002) {
        alert(
          "Connection request is already pending. Please check your Phantom wallet."
        );
      } else if (error.message?.includes("wallet not found")) {
        alert(
          "Phantom wallet not found. Please install Phantom extension or app."
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
  }, [onConnected, getSolanaProvider, loadUserData]);

  const shorten = useCallback(
    (addr?: string | null) =>
      addr ? addr.slice(0, 4) + "..." + addr.slice(-4) : "Connect wallet",
    []
  );

  const disconnect = useCallback(async () => {
    setConnectedType(null);
    setSolAddress(null);
    setSolLamports(0);
    setAuthToken(null);
    setUserStatistics(null);
    setTransactions([]);

    window.localStorage.setItem("wallet-disconnected", "true");

    // Cleanup JWT token
    AuthService.removeToken();

    detachSolListeners();

    const sol = getSolanaProvider();
    if (sol?.disconnect) {
      try {
        await sol.disconnect();
      } catch {}
    }

    console.log("Wallet disconnected");
  }, [detachSolListeners, getSolanaProvider]);

  return {
    solAddress,
    connectedType,
    loading,
    hasPhantom,
    connectPhantom,
    disconnect,
    shorten,
    solLamports,
    solBalanceText,
    refreshSolBalance,

    getSolanaProvider,
    authToken,
    userStatistics,
    transactions,
    loadUserData,
  };
}
