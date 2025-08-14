"use client";
import { useWallet } from "@/hooks/useWallet";
import WalletButton from "./WalletButton";

export default function WalletBar() {
  const { 
    solAddress, 
    connectedWallet,
    solBalanceText, 
    loading, 
    connectWallet, 
    disconnect,
    refreshSolBalance,
    shorten 
  } = useWallet();

  const isConnected = !!solAddress;
  const isLoadingBalance = loading === "sol-balance";

  return (
    <div className="flex items-center gap-4">
      <WalletButton
        label={isConnected ? shorten(solAddress) : undefined}
        balance={solBalanceText !== "—" ? solBalanceText : undefined}
        onClick={() => {
          if (!isConnected) {
            // Default to phantom if available, otherwise show wallet selection
            connectWallet("phantom");
          }
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
      {isLoadingBalance && (
        <span className="text-xs text-gray-500 ml-2">Loading...</span>
      )}
      {isConnected && (
        <button
          className="text-xs px-2 py-1 ml-2 rounded bg-blue-100 hover:bg-blue-200 cursor-pointer"
          onClick={() => refreshSolBalance()}
        >
          Refresh
        </button>
      )}
    </div>
  );
}
