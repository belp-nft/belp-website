"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export type Connected = { kind: "sol"; address: string };

export interface MintResult {
  success: boolean;
  nft?: {
    address: string;
    name: string;
    image: string;
  };
  signature?: string;
  error?: string;
}

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

import { getCurrentCandyMachineId } from "@/lib/simpleCandyMachine";

const SOLANA_RPC = "https://api.devnet.solana.com";
const USE_MOCK_MINT = false;
// Check if Candy Machine ID exists in localStorage
const USE_CANDY_MACHINE = () => {
  return (
    getCurrentCandyMachineId() !== null &&
    getCurrentCandyMachineId() !== "11111111111111111111111111111112"
  );
};
const USE_CORE_V3 = true; // Use Metaplex Core V3 for modern NFT minting

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
          setSolLamports(0);
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
    setSolLamports(0);

    window.localStorage.setItem("wallet-disconnected", "true");

    detachSolListeners();

    const sol = getSolanaProvider();
    if (sol?.disconnect) {
      try {
        await sol.disconnect();
      } catch {}
    }
  }, [detachSolListeners, getSolanaProvider]);

  const mintNft = useCallback(async (): Promise<MintResult> => {
    try {
      if (USE_MOCK_MINT) {
        const { mockMintBelpyNFT } = await import("../lib/mockMint");
        const mockResult = await mockMintBelpyNFT();

        if (mockResult.success && mockResult.nft) {
          await refreshSolBalance(solAddress);

          return {
            success: true,
            nft: {
              address: mockResult.nft.address,
              name: mockResult.nft.name,
              image: mockResult.nft.image,
            },
            signature: mockResult.signature,
          };
        } else {
          throw new Error(mockResult.error || "Mock mint failed");
        }
      }

      if (!solAddress) {
        throw new Error("Wallet not connected");
      }

      const sol = getSolanaProvider();
      if (!sol || !sol.publicKey) {
        throw new Error("Phantom wallet not found or not connected");
      }

      if (!sol.signTransaction || !sol.signAllTransactions) {
        throw new Error("Wallet does not support required signing methods");
      }

      const connection = new Connection(SOLANA_RPC);
      const publicKey = new PublicKey(sol.publicKey.toString());

      const walletAdapter = {
        publicKey,
        signTransaction: sol.signTransaction.bind(sol),
        signAllTransactions: sol.signAllTransactions.bind(sol),
      };

      console.log("Starting NFT mint...");

      if (USE_CORE_V3) {
        const { createDirectCoreAsset } = await import("../lib/coreV3Mint");

        const walletAdapter = {
          publicKey,
          signTransaction: sol.signTransaction.bind(sol),
          signAllTransactions: sol.signAllTransactions.bind(sol),
        };

        const result = await createDirectCoreAsset(walletAdapter);

        if (!result.success) {
          throw new Error(result.error || "Core V3 mint failed");
        }

        console.log("Core V3 mint successful!", result);

        await refreshSolBalance(solAddress);

        return {
          success: true,
          nft: {
            address: result.nft!.address,
            name: result.nft!.name,
            image: result.nft!.image,
          },
          signature: result.signature,
        };
      } else if (USE_CANDY_MACHINE()) {
        const { mintFromCandyMachine } = await import(
          "../lib/candyMachineMint"
        );

        const result = await mintFromCandyMachine(
          connection,
          walletAdapter,
          solAddress
        );

        if (!result.success) {
          throw new Error(result.error || "Candy Machine mint failed");
        }

        console.log("Candy Machine mint successful!", result);

        await refreshSolBalance(solAddress);

        return {
          success: true,
          nft: {
            address: result.nft!.address,
            name: result.nft!.name,
            image: result.nft!.image,
          },
          signature: result.signature,
        };
      } else {
        // Fallback to direct mint if Candy Machine is not available
        const { directMintBelpyNFT } = await import("../lib/candyMachineMint");

        const result = await directMintBelpyNFT(
          connection,
          walletAdapter,
          solAddress
        );

        if (!result.success) {
          throw new Error(result.error || "Direct mint failed");
        }

        console.log("Direct mint successful!", result);

        await refreshSolBalance(solAddress);

        return {
          success: true,
          nft: {
            address: result.nft!.address,
            name: result.nft!.name,
            image: result.nft!.image,
          },
          signature: result.signature,
        };
      }
    } catch (error) {
      console.error("Mint failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [solAddress, getSolanaProvider, refreshSolBalance]);

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
    mintNft,
    getSolanaProvider,
  };
}
