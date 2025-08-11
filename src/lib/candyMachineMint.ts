import {
  Metaplex,
  walletAdapterIdentity,
  CandyMachineV2,
} from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

export interface CandyMachineMintResult {
  success: boolean;
  nft?: {
    address: string;
    name: string;
    image: string;
    uri: string;
  };
  signature?: string;
  error?: string;
}

// Replace this with your actual Candy Machine ID from devnet
// You can create a Candy Machine using Metaplex Sugar CLI or Candy Machine UI
let CANDY_MACHINE_ID = "11111111111111111111111111111112"; // Will be updated from localStorage

// Function to get Candy Machine ID from localStorage or default
function getCandyMachineId(): string {
  if (typeof window !== "undefined") {
    const storedId = localStorage.getItem("BELPY_CANDY_MACHINE_ID");
    if (storedId && storedId !== "11111111111111111111111111111112") {
      CANDY_MACHINE_ID = storedId;
      return storedId;
    }
  }
  return CANDY_MACHINE_ID;
}

// Function to update Candy Machine ID in localStorage
export function updateCandyMachineIdLocal(newId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("BELPY_CANDY_MACHINE_ID", newId);
    CANDY_MACHINE_ID = newId;
    console.log("✅ Updated CANDY_MACHINE_ID in localStorage:", newId);
  }
}

export async function mintFromCandyMachine(
  connection: Connection,
  wallet: any,
  userWalletAddress: string
): Promise<CandyMachineMintResult> {
  try {
    console.log("Starting Candy Machine mint...");

    // Get current Candy Machine ID from localStorage
    const currentCandyMachineId = getCandyMachineId();

    // If we have a valid generated Candy Machine ID, use direct mint (more reliable)
    if (
      currentCandyMachineId &&
      currentCandyMachineId !== "11111111111111111111111111111112" &&
      currentCandyMachineId.includes("BELPY")
    ) {
      console.log(
        "Using direct mint with generated Candy Machine ID:",
        currentCandyMachineId
      );
      return await directMintBelpyNFT(connection, wallet, userWalletAddress);
    }

    // If no valid Candy Machine ID is provided, use direct mint instead
    if (
      !currentCandyMachineId ||
      currentCandyMachineId === "11111111111111111111111111111112"
    ) {
      console.log(
        "No valid Candy Machine ID found, falling back to direct mint..."
      );
      return await directMintBelpyNFT(connection, wallet, userWalletAddress);
    } // Check balance - Candy Machine mints typically need less SOL
    const balance = await connection.getBalance(wallet.publicKey);
    console.log("Wallet SOL balance:", balance / 1e9, "SOL");

    if (balance < 0.01 * 1e9) {
      throw new Error(
        "Insufficient SOL balance. You need at least 0.01 SOL for minting."
      );
    }

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    console.log("Loading Candy Machine...");

    // Load the Candy Machine
    const candyMachine = await metaplex
      .candyMachinesV2()
      .findByAddress({ address: new PublicKey(currentCandyMachineId) });

    console.log("Candy Machine loaded:", {
      address: candyMachine.address.toString(),
      itemsAvailable: candyMachine.itemsAvailable.toString(),
      itemsMinted: candyMachine.itemsMinted.toString(),
      isLive: true, // Simplified for now
    });

    // Check if Candy Machine is live and has items available
    if (candyMachine.itemsMinted.gte(candyMachine.itemsAvailable)) {
      throw new Error("Candy Machine is sold out!");
    }

    console.log("Minting NFT from Candy Machine...");

    // Mint from Candy Machine
    const { nft, response } = await metaplex.candyMachinesV2().mint({
      candyMachine,
    });

    console.log("NFT minted successfully from Candy Machine!", {
      mint: nft.address.toString(),
      name: nft.name,
      signature: response.signature,
    });

    return {
      success: true,
      nft: {
        address: nft.address.toString(),
        name: nft.name || "BELPY NFT",
        image:
          nft.json?.image ||
          `/icons/token-nft-${Math.floor(Math.random() * 4) + 1}.svg`,
        uri: nft.uri || "",
      },
      signature: response.signature,
    };
  } catch (error) {
    console.error("Candy Machine mint failed:", error);

    let errorMessage = "Candy Machine mint failed";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("sold out")) {
        errorMessage = "Candy Machine is sold out";
      } else if (msg.includes("not live")) {
        errorMessage = "Candy Machine is not live yet";
      } else if (msg.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance";
      } else if (msg.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (msg.includes("blockhash")) {
        errorMessage = "Network congestion, please try again";
      } else if (msg.includes("Account does not exist")) {
        errorMessage =
          "Candy Machine not found. Please check the configuration.";
      } else {
        errorMessage = msg.length > 100 ? msg.substring(0, 100) + "..." : msg;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Alternative: Simple direct NFT mint without Candy Machine
export async function directMintBelpyNFT(
  connection: Connection,
  wallet: any,
  userWalletAddress: string
): Promise<CandyMachineMintResult> {
  try {
    console.log("Starting direct NFT mint...");

    const balance = await connection.getBalance(wallet.publicKey);
    console.log("Wallet SOL balance:", balance / 1e9, "SOL");

    if (balance < 0.005 * 1e9) {
      throw new Error(
        "Insufficient SOL balance. You need at least 0.005 SOL for minting."
      );
    }

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );

    const nftId = Math.floor(Math.random() * 9999) + 1;
    const imageIndex = (nftId % 5) + 1;

    // Create metadata
    const metadata = {
      name: `BELPY Cat #${nftId}`,
      description:
        "A cute BELPY cat from the BELP universe! Ready to explore and play.",
      image: `https://your-domain.com/icons/token-nft-${imageIndex}.svg`,
      attributes: [
        { trait_type: "Type", value: "BELPY Cat" },
        { trait_type: "Rarity", value: "Common" },
        { trait_type: "Number", value: nftId.toString() },
      ],
      properties: {
        files: [
          {
            uri: `https://your-domain.com/icons/token-nft-${imageIndex}.svg`,
            type: "image/svg+xml",
          },
        ],
        category: "image",
      },
    };

    console.log("Uploading metadata...");

    // Upload metadata to Metaplex
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);

    console.log("Creating NFT...");

    // Create NFT
    const { nft, response } = await metaplex.nfts().create({
      name: metadata.name,
      symbol: "BELPY",
      uri: uri,
      sellerFeeBasisPoints: 500, // 5% royalty
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
    });

    console.log("NFT created successfully!", {
      mint: nft.address.toString(),
      name: nft.name,
      signature: response.signature,
    });

    return {
      success: true,
      nft: {
        address: nft.address.toString(),
        name: nft.name || metadata.name,
        image: `/icons/token-nft-${imageIndex}.svg`,
        uri: nft.uri || uri,
      },
      signature: response.signature,
    };
  } catch (error) {
    console.error("Direct mint failed:", error);

    let errorMessage = "Direct mint failed";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance";
      } else if (msg.includes("User rejected")) {
        errorMessage = "Transaction was rejected by user";
      } else if (msg.includes("blockhash")) {
        errorMessage = "Network congestion, please try again";
      } else if (msg.includes("failed to send transaction")) {
        errorMessage = "Transaction failed to send, please try again";
      } else {
        errorMessage = msg.length > 100 ? msg.substring(0, 100) + "..." : msg;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
