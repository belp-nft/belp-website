import React from "react";
import { useWallet } from "@/hooks/useWallet";
import { useConfig, useMintStats } from "@/stores/config";

const WalletStoreDemo: React.FC = () => {
  const {
    solAddress,
    connectedWallet,
    disconnect,
    connectWallet,
    clearToken,
    availableWallets,
  } = useWallet();

  const config = useConfig();
  const mintStats = useMintStats();

  const handleDisconnect = async () => {
    console.log("🔌 Disconnecting and clearing all stores...");
    console.log("Config before disconnect:", config);
    console.log("Mint stats before disconnect:", mintStats);

    await disconnect();

    // Check if stores are cleared after disconnect
    setTimeout(() => {
      console.log("Config after disconnect:", config);
      console.log("Mint stats after disconnect:", mintStats);
    }, 100);
  };

  const handleClearToken = () => {
    console.log("🗑️ Clearing token and stores...");
    console.log("Config before clear:", config);
    clearToken();

    setTimeout(() => {
      console.log("Config after clear:", config);
    }, 100);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Wallet & Store Management</h2>

      {/* Wallet Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">Wallet Status</h3>
        <div className="space-y-1 text-sm">
          <div>
            Connected:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {solAddress ? "Yes" : "No"}
            </code>
          </div>
          <div>
            Wallet:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {connectedWallet || "None"}
            </code>
          </div>
          <div>
            Address:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              {solAddress || "Not connected"}
            </code>
          </div>
        </div>
      </div>

      {/* Store Status */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium mb-2">Store Status</h3>
        <div className="space-y-1 text-sm">
          <div>
            Config:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {config ? "Loaded" : "Empty"}
            </code>
          </div>
          <div>
            Minted:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {mintStats.minted}
            </code>
          </div>
          <div>
            Supply:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {mintStats.supply}
            </code>
          </div>
          {config && (
            <div className="mt-2">
              <div className="text-xs text-gray-600">Config Details:</div>
              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-20">
                {JSON.stringify(
                  {
                    address: config.address,
                    collectionAddress: config.collectionAddress,
                    itemsAvailable: config.itemsAvailable,
                    totalProcessed: config.totalProcessed,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {!solAddress ? (
          <div className="space-y-2">
            <h3 className="font-medium">Connect Wallet</h3>
            <div className="flex flex-wrap gap-2">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.type}
                  onClick={() => connectWallet(wallet.type)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {wallet.displayName}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-medium">Wallet Actions</h3>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Disconnect (Clear All)
              </button>
              <button
                onClick={handleClearToken}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Clear Token & Stores
              </button>
            </div>
          </div>
        )}

        {/* Test Store Data */}
        <div className="space-y-2">
          <h3 className="font-medium">Test Actions</h3>
          <div className="text-sm text-gray-600 mb-2">
            Load some config data first, then test disconnect to see store
            clearing
          </div>
          <button
            onClick={() => {
              // Simulate loading config data for testing
              console.log("Loading test config data...");
              // You can call your config actions here to load actual data
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Load Test Config
          </button>
        </div>
      </div>

      {/* Debug Console */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm">
        <div className="font-medium mb-1">Console Output:</div>
        <div className="text-xs text-gray-600">
          Check browser console for detailed logs when testing disconnect and
          store clearing.
        </div>
      </div>
    </div>
  );
};

export default WalletStoreDemo;
