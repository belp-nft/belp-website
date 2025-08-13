import React, { useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";

const WalletDebugger: React.FC = () => {
  const {
    // State
    solAddress,
    connectedWallet,
    loading,
    authToken,

    // Actions
    connectWallet,
    disconnect,

    // Debug utilities
    getDebugInfo,
    forceReconnect,
    hasValidToken,
    clearToken,

    // Backward compatibility
    connectPhantom,
    hasPhantom,
  } = useWallet();

  const debugInfo = getDebugInfo();

  useEffect(() => {
    // Log debug info on state changes
    console.log("🔍 Wallet Debug Info:", debugInfo);
  }, [solAddress, connectedWallet, authToken]);

  const handleConnect = async (walletType: "phantom" | "solflare") => {
    try {
      console.log(`🔌 Connecting to ${walletType}...`);
      await connectWallet(walletType);
    } catch (error) {
      console.error(`❌ Connection failed:`, error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("🔌 Disconnecting...");
      await disconnect();
    } catch (error) {
      console.error("❌ Disconnect failed:", error);
    }
  };

  const handleForceReconnect = async () => {
    try {
      console.log("🔄 Force reconnecting...");
      await forceReconnect();
    } catch (error) {
      console.error("❌ Force reconnect failed:", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Wallet Debugger</h2>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Connection Status</h3>
        <div className="space-y-1 text-sm">
          <div>
            Address:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {solAddress || "Not connected"}
            </code>
          </div>
          <div>
            Wallet:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {connectedWallet || "None"}
            </code>
          </div>
          <div>
            Loading:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {loading || "None"}
            </code>
          </div>
          <div>
            Has Token:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {!!authToken ? "Yes" : "No"}
            </code>
          </div>
          <div>
            Token Valid:{" "}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {hasValidToken() ? "Yes" : "No"}
            </code>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2">Debug Information</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        {!solAddress ? (
          <div className="space-y-2">
            <h3 className="font-medium">Connect Wallet</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleConnect("phantom")}
                disabled={loading === "phantom" || !hasPhantom}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
              >
                {loading === "phantom" ? "Connecting..." : "Phantom"}
              </button>
              <button
                onClick={() => handleConnect("solflare")}
                disabled={loading === "solflare"}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading === "solflare" ? "Connecting..." : "Solflare"}
              </button>
            </div>

            {/* Legacy method for comparison */}
            <div className="border-t pt-2 mt-2">
              <div className="text-sm text-gray-500 mb-1">Legacy Method:</div>
              <button
                onClick={connectPhantom}
                disabled={loading === "phantom" || !hasPhantom}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
              >
                Phantom (Legacy)
              </button>
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
                Disconnect
              </button>
              <button
                onClick={handleForceReconnect}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Force Reconnect
              </button>
            </div>
          </div>
        )}

        {/* Token Actions */}
        <div className="space-y-2">
          <h3 className="font-medium">Token Actions</h3>
          <div className="flex gap-2">
            <button
              onClick={clearToken}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Clear Token
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("wallet-disconnected");
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Disconnect Flag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDebugger;
