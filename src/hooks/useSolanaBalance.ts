import { useCallback, useEffect, useState } from "react";

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

export function useSolanaBalance(address?: string | null) {
  const [lamports, setLamports] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const value = await getSolBalanceLamports(address);
      setLamports(value);
    } catch (e: any) {
      setError(e?.message || "Error fetching balance");
      setLamports(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) refresh();
  }, [address, refresh]);

  return {
    lamports,
    sol: lamports === null ? null : formatSol(lamports),
    loading,
    error,
    refresh,
  };
}
