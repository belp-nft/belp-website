import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";

// Setup script to create a Candy Machine for BELPY NFTs
export async function createBelpyCandyMachine(wallet: any) {
  try {
    console.log("Setting up UMI and Candy Machine...");

    // Create UMI instance
    const umi = createUmi("https://api.devnet.solana.com").use(
      walletAdapterIdentity(wallet)
    );

    console.log("Creating collection NFT...");

    // Create collection NFT first
    const collectionMint = generateSigner(umi);
    const createNftTx = await createNft(umi, {
      mint: collectionMint,
      authority: umi.identity,
      name: "BELPY Collection",
      uri: "https://arweave.net/belpy-collection-metadata.json", // You'll need to upload this
      sellerFeeBasisPoints: percentAmount(5, 2), // 5% royalty
      isCollection: true,
      collectionDetails: { __kind: "V1", size: 0 },
    });
    await createNftTx.sendAndConfirm(umi);

    console.log("Collection created:", collectionMint.publicKey.toString());

    console.log("Creating Candy Machine...");

    // Create Candy Machine
    const candyMachine = generateSigner(umi);
    const createCandyMachineTx = await create(umi, {
      candyMachine,
      collectionMint: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity,
      tokenStandard: TokenStandard.NonFungible,
      itemsAvailable: 5000, // Total number of NFTs
      sellerFeeBasisPoints: percentAmount(5, 2), // 5% royalty
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          percentageShare: 100,
        },
      ],
    });
    await createCandyMachineTx.sendAndConfirm(umi);

    const candyMachineId = candyMachine.publicKey.toString();
    console.log("🎉 CANDY_MACHINE_ID =", candyMachineId);
    console.log("🎉 COLLECTION_MINT =", collectionMint.publicKey.toString());

    return {
      success: true,
      candyMachineId,
      collectionMint: collectionMint.publicKey.toString(),
    };
  } catch (error) {
    console.error("Failed to create Candy Machine:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Function to update the Candy Machine ID in the mint file
export function updateCandyMachineId(candyMachineId: string) {
  console.log(`
🔧 Update your candyMachineMint.ts file:

const CANDY_MACHINE_ID = "${candyMachineId}";

Then set USE_CANDY_MACHINE = true in useWallet.tsx
  `);
}
