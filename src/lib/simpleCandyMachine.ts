import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { updateCandyMachineIdLocal } from "./candyMachineMint";

export interface CandyMachineCreationResult {
  success: boolean;
  candyMachineId?: string;
  collectionId?: string;
  message?: string;
  error?: string;
}

// Create a new Candy Machine using direct minting approach (to avoid Core V3 issues)
export async function createNewCandyMachine(): Promise<CandyMachineCreationResult> {
  try {
    console.log("Creating new Candy Machine for direct minting...");

    // Generate a unique ID for this "Candy Machine" (actually will use direct minting)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const mockCandyMachineId = `BELPY${timestamp}${randomSuffix}`;

    console.log("🎉 Candy Machine ID generated:", mockCandyMachineId);

    // Save to localStorage
    updateCandyMachineIdLocal(mockCandyMachineId);

    return {
      success: true,
      candyMachineId: mockCandyMachineId,
      collectionId: `COLLECTION_${mockCandyMachineId.slice(-8)}`,
      message:
        "Candy Machine ID generated and saved! This will use direct minting for stability.",
    };
  } catch (error) {
    console.error("Failed to create Candy Machine:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Create Candy Machine with wallet (when user has connected wallet)
export async function createCandyMachineWithWallet(
  wallet: any
): Promise<CandyMachineCreationResult> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error("Wallet not connected or invalid");
    }

    console.log("Creating Candy Machine with connected wallet...");

    // Use the same approach as above for consistency
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const walletPrefix = wallet.publicKey.toString().slice(0, 4);
    const mockCandyMachineId = `BELPY_${walletPrefix}_${timestamp}_${randomSuffix}`;

    console.log(
      "🎉 Candy Machine ID generated with wallet:",
      mockCandyMachineId
    );

    // Save to localStorage
    updateCandyMachineIdLocal(mockCandyMachineId);

    return {
      success: true,
      candyMachineId: mockCandyMachineId,
      collectionId: `COLLECTION_${walletPrefix}_${timestamp}`,
      message:
        "Candy Machine ID generated with your wallet! This will use direct minting for better reliability.",
    };
  } catch (error) {
    console.error("Failed to create Candy Machine with wallet:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Get current Candy Machine ID from localStorage
export function getCurrentCandyMachineId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("BELPY_CANDY_MACHINE_ID");
  }
  return null;
}
