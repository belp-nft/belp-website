"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
    };
  }
}

export type LoadingKind = "phantom" | "sol-balance" | null;

const SOLANA_RPC =
  "https://young-patient-asphalt.solana-mainnet.quiknode.pro/81fe1cb3431ef0eb5a1423f7e2f529f82a0f344f/";

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
  const [solLamports, setSolLamports] = useState<number | null>(null);
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
      setSolLamports(null);
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
        console.log("🚀 ~ useWallet ~ lamports:", lamports);
        setSolLamports(lamports);
      } catch {
        setSolLamports(null);
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
    // Chỉ auto-login nếu Phantom đã unlock (isConnected === true)
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

  const connectPhantom = useCallback(async () => {
    try {
      setLoading("phantom");
      window.localStorage.removeItem("wallet-disconnected");
      const sol = getSolanaProvider();
      if (!sol || !sol.connect) {
        window.open("https://phantom.app/download", "_blank");
        return;
      }
      const resp = await sol.connect();
      const addr = resp.publicKey.toString();
      setSolAddress(addr);
      setConnectedType("sol");
      setTimeout(async () => {
        try {
          const lamports = await getSolBalanceLamports(addr);
          setSolLamports(lamports);
        } catch {
          setSolLamports(null);
        }
      }, 0);
      onConnected?.({ kind: "sol", address: addr });
    } finally {
      setLoading(null);
    }
  }, [onConnected, getSolanaProvider]);

  const shorten = useCallback(
    (addr?: string | null) =>
      addr ? addr.slice(0, 4) + "..." + addr.slice(-4) : "Connect wallet",
    []
  );

  const disconnect = useCallback(async () => {
    setConnectedType(null);
    setSolAddress(null);
    setSolLamports(null);

    window.localStorage.setItem("wallet-disconnected", "true");

    detachSolListeners();

    const sol = getSolanaProvider();
    if (sol?.disconnect) {
      try {
        await sol.disconnect();
      } catch {}
    }
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
  };
}
