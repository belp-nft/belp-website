import React from "react";
import { useWallet } from "@/hooks/useWallet";

const WalletConnector: React.FC = () => {
  const {
    // State
    solAddress,
    connectedWallet,
    loading,
    solBalanceText,
    availableWallets,

    // Actions
    connectWallet,
    disconnect,
    shorten,

    // Backward compatibility
    connectPhantom,
    hasPhantom,
  } = useWallet();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Wallet Connector</h2>

      {solAddress ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">Connected Wallet:</div>
            <div className="font-medium">{connectedWallet?.toUpperCase()}</div>
            <div className="text-sm text-gray-600">Address:</div>
            <div className="font-mono text-sm">{shorten(solAddress)}</div>
            <div className="text-sm text-gray-600">Balance:</div>
            <div className="font-medium">{solBalanceText} SOL</div>
          </div>

          <button
            onClick={disconnect}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-gray-600 text-center mb-4">
            Choose a wallet to connect:
          </div>

          {/* Generic wallet connections */}
          <div className="space-y-2">
            {availableWallets.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => connectWallet(wallet.type)}
                disabled={loading === wallet.type}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading === wallet.type ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  `Connect ${wallet.displayName}`
                )}
              </button>
            ))}
          </div>

          {/* Backward compatibility example */}
          {hasPhantom && (
            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-gray-500 mb-2">Legacy Method:</div>
              <button
                onClick={connectPhantom}
                disabled={loading === "phantom"}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                Connect Phantom (Legacy)
              </button>
            </div>
          )}

          {availableWallets.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-2">No wallets detected</div>
              <div className="text-sm">
                Please install a Solana wallet extension
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
