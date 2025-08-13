"use client";
import { usePhantomProvider } from "@/hooks/usePhantomProvider";
import { useSolanaBalance } from "@/hooks/useSolanaBalance";
import WalletButton from "./WalletButton";

export default function WalletBar() {
  const { publicKey, isConnected, connect, disconnect } = usePhantomProvider();
  const { sol, loading, error, refresh } = useSolanaBalance(publicKey);

  return (
    <div className="flex items-center gap-4">
      <WalletButton
        label={
          isConnected && publicKey
            ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
            : undefined
        }
        balance={sol || undefined}
        onClick={() => {
          if (!isConnected) connect();
        }}
      />
      {isConnected && (
        <button
          className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
          onClick={disconnect}
        >
          Disconnect
        </button>
      )}
      {loading && (
        <span className="text-xs text-gray-500 ml-2">Loading...</span>
      )}
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
      {isConnected && (
        <button
          className="text-xs px-2 py-1 ml-2 rounded bg-blue-100 hover:bg-blue-200 cursor-pointer"
          onClick={refresh}
        >
          Refresh
        </button>
      )}
    </div>
  );
}
