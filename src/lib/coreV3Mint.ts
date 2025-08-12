import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import {
  create as createCoreCandyMachine,
  mintV1 as mintFromCoreCandyMachine,
  safeFetchCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  createV1 as createCoreAsset,
  fetchAsset,
  createCollectionV1,
} from "@metaplex-foundation/mpl-core";
import { Connection, PublicKey } from "@solana/web3.js";

// Auto-update CANDY_MACHINE_ID via API call
async function updateCandyMachineId(newCandyMachineId: string): Promise<void> {
  try {
    const response = await fetch("/api/update-candy-machine-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ candyMachineId: newCandyMachineId }),
    });

    if (response.ok) {
      console.log("✅ Auto-updated CANDY_MACHINE_ID in candyMachineMint.ts");
      console.log(`🆔 New Candy Machine ID: ${newCandyMachineId}`);
    } else {
      console.warn("⚠️ Failed to auto-update CANDY_MACHINE_ID via API");
    }
  } catch (error) {
    console.warn("⚠️ Failed to auto-update CANDY_MACHINE_ID:", error);
  }
}

export interface CandyMachineV3Result {
  success: boolean;
  nft?: {
    address: string;
    name: string;
    image: string;
    uri: string;
  };
  signature?: string;
  candyMachineId?: string;
  error?: string;
}

// Create Core Collection and Candy Machine V3
export async function createCoreCollection(wallet: any) {
  try {
    console.log("Creating Core Collection and Candy Machine V3...");

    // Setup UMI with devnet
    const umi = createUmi("https://api.devnet.solana.com").use(
      walletAdapterIdentity(wallet)
    );

    console.log("Creating Core Collection...");

    // Generate collection signer
    const collectionSigner = generateSigner(umi);

    // Create the collection
    const createCollectionTx = createCollectionV1(umi, {
      collection: collectionSigner,
      name: "BELPY Collection",
      uri: "https://arweave.net/belpy-collection-metadata.json",
    });

    const collectionResult = await createCollectionTx.sendAndConfirm(umi);
    console.log(
      "Core Collection created:",
      collectionSigner.publicKey.toString()
    );

    console.log("Creating Core Candy Machine V3...");

    // Generate candy machine signer
    const candyMachineSigner = generateSigner(umi);

    // Create the candy machine
    const createCandyMachineTx = await createCoreCandyMachine(umi, {
      candyMachine: candyMachineSigner,
      collection: collectionSigner.publicKey,
      collectionUpdateAuthority: umi.identity,
      itemsAvailable: 1000, // Total NFTs
      configLineSettings: {
        prefixName: "BELPY Cat #",
        nameLength: 32,
        prefixUri: "https://belpy.blockifyy.com/icons/",
        uriLength: 200,
        isSequential: false,
      },
    });

    const candyMachineResult = await createCandyMachineTx.sendAndConfirm(umi);

    const candyMachineId = candyMachineSigner.publicKey.toString();
    console.log("🎉 Core Candy Machine V3 created:", candyMachineId);

    // Auto update CANDY_MACHINE_ID in candyMachineMint.ts
    await updateCandyMachineId(candyMachineId);

    return {
      success: true,
      candyMachineId,
      collectionId: collectionSigner.publicKey.toString(),
      message: "Core Candy Machine V3 created successfully!",
    };
  } catch (error) {
    console.error("Failed to create Core Candy Machine:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Mint from Core Candy Machine V3
export async function mintFromCoreV3(
  wallet: any,
  candyMachineId: string
): Promise<CandyMachineV3Result> {
  try {
    console.log("Minting from Core Candy Machine V3...");

    const umi = createUmi("https://api.devnet.solana.com").use(
      walletAdapterIdentity(wallet)
    );

    // Fetch candy machine
    const candyMachinePublicKey = publicKey(candyMachineId);

    const candyMachine = await safeFetchCandyMachine(
      umi,
      candyMachinePublicKey
    );
    if (!candyMachine) {
      throw new Error("Candy Machine not found");
    }

    console.log("Candy Machine found, minting NFT...");

    // Generate asset signer for new NFT
    const assetSigner = generateSigner(umi);

    // Mint from candy machine
    const mintTx = mintFromCoreCandyMachine(umi, {
      candyMachine: candyMachinePublicKey,
      asset: assetSigner,
      collection: candyMachine.collectionMint,
    });

    const result = await mintTx.sendAndConfirm(umi);

    console.log("Core NFT minted successfully!");
    console.log("Transaction signature:", result.signature);
    console.log("Asset address:", assetSigner.publicKey.toString());

    // Fetch the created asset for details
    const asset = await fetchAsset(umi, assetSigner.publicKey);

    return {
      success: true,
      nft: {
        address: assetSigner.publicKey.toString(),
        name: asset.name || "BELPY NFT",
        image: `/icons/token-nft-${Math.floor(Math.random() * 5) + 1}.svg`,
        uri: asset.uri || "",
      },
      signature: result.signature.toString(),
      candyMachineId,
    };
  } catch (error) {
    console.error("Core V3 mint failed:", error);

    let errorMessage = "Core V3 mint failed";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance";
      } else if (msg.includes("not found")) {
        errorMessage = "Candy Machine not found";
      } else if (msg.includes("sold out")) {
        errorMessage = "Candy Machine is sold out";
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

// Direct Core Asset Creation (without Candy Machine)
export async function createDirectCoreAsset(
  wallet: any
): Promise<CandyMachineV3Result> {
  try {
    console.log("Creating Core Asset directly...");

    const umi = createUmi("https://api.devnet.solana.com").use(
      walletAdapterIdentity(wallet)
    );

    // Generate asset signer
    const assetSigner = generateSigner(umi);
    const nftId = Math.floor(Math.random() * 9999) + 1;

    // Create Core Asset directly
    const createAssetTx = createCoreAsset(umi, {
      asset: assetSigner,
      name: `BELPY Cat #${nftId}`,
      uri: `https://belpy.blockifyy.com/icons/token-nft-1.svg`,
    });

    const result = await createAssetTx.sendAndConfirm(umi);

    console.log("Core Asset created successfully!");
    console.log("Transaction signature:", result.signature);
    console.log("Asset address:", assetSigner.publicKey.toString());

    return {
      success: true,
      nft: {
        address: assetSigner.publicKey.toString(),
        name: `BELPY Cat #${nftId}`,
        image: `/icons/token-nft-${(nftId % 5) + 1}.svg`,
        uri: `https://belpy.blockifyy.com/icons/token-nft-1.svg`,
      },
      signature: result.signature.toString(),
    };
  } catch (error) {
    console.error("Direct Core Asset creation failed:", error);

    let errorMessage = "Core Asset creation failed";
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("insufficient")) {
        errorMessage = "Insufficient SOL balance";
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
