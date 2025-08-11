"use client";

import { useWallet } from "@/hooks/useWallet";
import {
  createNewCandyMachine,
  createCandyMachineWithWallet,
  getCurrentCandyMachineId,
} from "@/lib/simpleCandyMachine";
import { useState, useEffect } from "react";

export default function CandyMachineSetup() {
  const { solAddress, connectPhantom, getSolanaProvider } = useWallet();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentCandyMachineId, setCurrentCandyMachineId] = useState<
    string | null
  >(null);

  // Load current Candy Machine ID on component mount
  useEffect(() => {
    const storedId = getCurrentCandyMachineId();
    setCurrentCandyMachineId(storedId);
  }, []);

  const handleCreateCandyMachine = async () => {
    try {
      setLoading(true);
      console.log("Creating Candy Machine...");

      let result;

      if (solAddress) {
        // If wallet is connected, use wallet-based creation
        const provider = getSolanaProvider();
        result = await createCandyMachineWithWallet(provider);
      } else {
        // If no wallet, create with temporary keypair
        result = await createNewCandyMachine();
      }

      if (result.success && result.candyMachineId) {
        setResult(result);
        setCurrentCandyMachineId(result.candyMachineId);
        alert(
          `✅ ${result.message}\n🆔 Candy Machine ID: ${result.candyMachineId}`
        );
      } else {
        alert("Failed to create Candy Machine: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Error creating Candy Machine: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🍬 Candy Machine Setup</h1>

        {/* Show current Candy Machine ID if exists */}
        {currentCandyMachineId && (
          <div className="mb-4 p-3 bg-blue-100 rounded">
            <h3 className="font-bold text-sm">Current Candy Machine ID:</h3>
            <code className="text-xs break-all bg-gray-200 p-1 rounded">
              {currentCandyMachineId}
            </code>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {solAddress
              ? `Wallet connected: ${solAddress.slice(0, 8)}...`
              : "You can create a Candy Machine with or without connecting a wallet"}
          </p>

          {!solAddress && (
            <button
              onClick={connectPhantom}
              className="w-full mb-3 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Connect Phantom Wallet (Optional)
            </button>
          )}

          <button
            onClick={handleCreateCandyMachine}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Creating..." : "Create New Candy Machine"}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <h3 className="font-bold">✅ Success!</h3>
            <p className="text-sm mt-2">
              <strong>Candy Machine ID:</strong>
              <br />
              <code className="bg-gray-200 p-1 rounded text-xs break-all">
                {result.candyMachineId}
              </code>
            </p>
            <p className="text-sm mt-2 text-gray-600">{result.message}</p>
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
              <strong>✅ Saved to localStorage!</strong>
              <br />
              The Candy Machine ID has been automatically saved and will be used
              for minting.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
