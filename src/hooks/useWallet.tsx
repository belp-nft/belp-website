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
    return !!window.solana?.isPhantom;
  }, []);

  const getSolanaProvider = useCallback(() => {
    if (typeof window === "undefined") return null;
    return window.solana ?? (window.ethereum as any)?.solana ?? null;
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.localStorage.getItem("wallet-disconnected") === "true") {
      attachSolListeners();
      return () => {
        detachSolListeners();
      };
    }

    const sol = getSolanaProvider();
    if (sol?.isConnected === true && sol?.publicKey) {
      const addr = sol.publicKey.toString();
      setSolAddress(addr);
      refreshSolBalance(addr);
      onConnected?.({ kind: "sol", address: addr });
    } else if (sol?.connect) {
      sol
        .connect({ onlyIfTrusted: true })
        .then((resp: any) => {
          const addr = resp?.publicKey?.toString?.();
          if (addr) {
            setSolAddress(addr);
            refreshSolBalance(addr);
            onConnected?.({ kind: "sol", address: addr });
          }
        })
        .catch(() => {});
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
  ]);

  // Load user data từ backend - dựa trên logic index.html
  const loadUserData = useCallback(async (walletAddress: string) => {
    try {
      console.log("📊 Loading user data...", { walletAddress });

      // Load user statistics
      const statsResult = await UserService.getUserStatistics(walletAddress);
      if (statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        console.log("✅ User statistics loaded:", statsResult.data);
      }

      // Load transaction history
      const txResult = await UserService.getTransactions(walletAddress, {
        limit: 50,
      });
      if (txResult.success && txResult.data) {
        setTransactions(txResult.data);
        console.log(
          "✅ Transaction history loaded:",
          txResult.data.length,
          "transactions"
        );
      }
    } catch (error) {
      console.error("⚠️ Failed to load user data:", error);
    }
  }, []);

  const connectPhantom = useCallback(async () => {
    try {
      setLoading("phantom");
      window.localStorage.removeItem("wallet-disconnected");
      const sol = getSolanaProvider();
      if (!sol || !sol.connect) {
        window.open("https://phantom.app/download", "_blank");
        return;
      }

      console.log("🚀 Starting Phantom wallet connection...");

      // Bước 1: Kết nối với Phantom wallet
      const resp = await sol.connect();
      const addr = resp.publicKey.toString();
      setSolAddress(addr);
      setConnectedType("sol");

      console.log("✅ Phantom connected:", addr);

      // Bước 2: Authenticate với backend (dựa trên logic index.html)
      console.log("🔐 Authenticating with backend...");
      const connectResult = await UserService.connectWallet(addr);

      if (connectResult.success) {
        // Bước 3: Lưu JWT token vào localStorage
        if ((connectResult as any).data?.accessToken) {
          AuthService.setToken((connectResult as any).data.accessToken);
          setAuthToken((connectResult as any).data.accessToken);
          console.log("🔑 JWT token saved to localStorage");
        }

        // Bước 4: Load user data với JWT token
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
      console.log("🎉 Phantom wallet connection successful!");
    } catch (error) {
      console.error("❌ Phantom connection failed:", error);
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

    // Cleanup JWT token từ localStorage
    AuthService.removeToken();

    detachSolListeners();

    const sol = getSolanaProvider();
    if (sol?.disconnect) {
      try {
        await sol.disconnect();
      } catch {}
    }

    console.log("🔌 Wallet disconnected");
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
