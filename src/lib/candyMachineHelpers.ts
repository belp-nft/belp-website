import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  generateSigner,
  transactionBuilder,
  publicKey as umiPublicKey,
  sol,
  some,
  none,
  dateTime,
} from "@metaplex-foundation/umi";

export interface MintResult {
  success: boolean;
  signature?: string;
  nftAddress?: string;
  message: string;
  errorType?: string;
}

/**
 * Mint NFT trực tiếp từ Candy Machine smart contract
 * Sử dụng wallet connection thay vì RPC endpoint riêng
 */
export async function mintNftDirectlyFromWallet(
  candyMachineAddress: string,
  walletPublicKey: string,
  walletProvider: any // Phantom/Solflare provider từ window.solana
): Promise<MintResult> {
  try {
    console.log("🚀 Starting direct mint from wallet...");
    console.log("Candy Machine:", candyMachineAddress);
    console.log("Wallet:", walletPublicKey);

    // Tạo wallet adapter cho UMI
    const walletAdapter = {
      publicKey: new PublicKey(walletPublicKey),
      signTransaction: walletProvider.signTransaction?.bind(walletProvider),
      signAllTransactions:
        walletProvider.signAllTransactions?.bind(walletProvider),
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      connected: true,
    };

    console.log(
      "walletProvider.connection?._rpcEndpoint",
      walletProvider.connection?._rpcEndpoint
    );

    // Khởi tạo UMI với wallet connection
    // Sử dụng connection mặc định của wallet thay vì RPC riêng
    const rpcEndpoint = 'https://api.devnet.solana.com'
      // walletProvider.connection?._rpcEndpoint ||
      // "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06";

    const umi = createUmi(rpcEndpoint)
      .use(mplCandyMachine())
      .use(walletAdapterIdentity(walletAdapter));

    console.log("✅ UMI initialized with wallet connection");

    // Lấy thông tin Candy Machine
    console.log("📊 Fetching candy machine info...");
    const candyMachine = await fetchCandyMachine(
      umi,
      umiPublicKey(candyMachineAddress)
    );

    console.log("✅ Candy machine fetched:", {
      address: candyMachine.publicKey,
      itemsLoaded: candyMachine.itemsLoaded,
      itemsRedeemed: candyMachine.itemsRedeemed,
    });

    // Kiểm tra candy machine còn NFT không
    if (candyMachine.itemsRedeemed >= candyMachine.itemsLoaded) {
      throw new Error("Candy Machine đã sold out!");
    }

    // Tạo NFT mint signer
    const nftMint = generateSigner(umi);
    console.log("🎯 Generated NFT mint:", nftMint.publicKey);

    // Tạo mint instruction
    console.log("🔨 Building mint transaction...");
    const mintBuilder = transactionBuilder().add(
      mintV2(umi, {
        candyMachine: umiPublicKey(candyMachineAddress),
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        tokenStandard: candyMachine.tokenStandard,
      })
    );

    

    console.log("📝 Sending and confirming transaction...");

    // Gửi và confirm transaction
    const result = await mintBuilder.sendAndConfirm(umi, {
      confirm: { commitment: "confirmed" },
      send: { skipPreflight: false },
    });

    console.log("✅ Transaction confirmed:", result.signature);

    return {
      success: true,
      signature: result.signature.toString(),
      nftAddress: nftMint.publicKey.toString(),
      message: "NFT minted successfully!",
    };
  } catch (error: any) {
    console.error("❌ Direct mint failed:", error);

    let errorMessage = "Failed to mint NFT";
    let errorType = "error"; // default error type

    // Xử lý các loại lỗi khác nhau
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("rejected")
    ) {
      errorMessage = "Transaction was cancelled by user";
      errorType = "warning";
    } else if (error.message?.includes("insufficient")) {
      errorMessage =
        "Insufficient SOL balance. Please add more SOL to your wallet";
      errorType = "error";
    } else if (error.message?.includes("sold out")) {
      errorMessage = "All NFTs have been sold out";
      errorType = "info";
    } else if (error.message?.includes("not active")) {
      errorMessage = "Minting is not currently active";
      errorType = "info";
    } else if (error.message?.includes("blockhash")) {
      errorMessage = "Network congestion. Please try again";
      errorType = "warning";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Transaction timeout. Please try again";
      errorType = "warning";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      errorType, // Thêm errorType để UI có thể hiển thị toast phù hợp
    };
  }
}

/**
 * Mint NFT với các tham số cố định cho dự án Belp
 * Update Authority: BQKHinECp1JgTi4kvi3uR6fWVP6gFCq4YSch7yJGuBKX
 * Collection: Ak6Gq19YxzYmCqeDTHgmuhyNijTehM1HkVWsEjeZtZ7d
 * Candy Machine: AyJ3gLeJHvmCzBusiPZaGdsARViEaYg9bkghfosoenwX
 * 
 * Guards:
 * - startDate: 2024-01-01T00:00:00Z
 * - solPayment: 0.1 SOL
 */

export async function mintBelpNft(
  walletPublicKey: string,
  walletProvider: any // Phantom/Solflare provider từ window.solana
): Promise<MintResult> {
  // Các tham số cố định cho dự án Belp
  const UPDATE_AUTHORITY = "BQKHinECp1JgTi4kvi3uR6fWVP6gFCq4YSch7yJGuBKX";
  const COLLECTION = "Ak6Gq19YxzYmCqeDTHgmuhyNijTehM1HkVWsEjeZtZ7d";
  const CANDY_MACHINE = "AyJ3gLeJHvmCzBusiPZaGdsARViEaYg9bkghfosoenwX";

  try {
    console.log("🚀 Starting Belp NFT mint...");
    console.log("Update Authority:", UPDATE_AUTHORITY);
    console.log("Collection:", COLLECTION);
    console.log("Candy Machine:", CANDY_MACHINE);
    console.log("Wallet:", walletPublicKey);

    // Tạo wallet adapter cho UMI
    const walletAdapter = {
      publicKey: new PublicKey(walletPublicKey),
      signTransaction: walletProvider.signTransaction?.bind(walletProvider),
      signAllTransactions:
        walletProvider.signAllTransactions?.bind(walletProvider),
      connect: () => Promise.resolve(),
      disconnect: () => Promise.resolve(),
      connected: true,
    };

    // Khởi tạo UMI với wallet connection
    const rpcEndpoint = 'https://api.devnet.solana.com';
    
    const umi = createUmi(rpcEndpoint)
      .use(mplCandyMachine())
      .use(walletAdapterIdentity(walletAdapter));

    console.log("✅ UMI initialized with wallet connection");

    // Lấy thông tin Candy Machine
    console.log("📊 Fetching Belp candy machine info...");
    const candyMachine = await fetchCandyMachine(
      umi,
      umiPublicKey(CANDY_MACHINE)
    );

    console.log("✅ Belp candy machine fetched:", {
      address: candyMachine.publicKey,
      itemsLoaded: candyMachine.itemsLoaded,
      itemsRedeemed: candyMachine.itemsRedeemed,
      collection: COLLECTION,
      updateAuthority: UPDATE_AUTHORITY,
    });

    // Kiểm tra candy machine còn NFT không
    if (candyMachine.itemsRedeemed >= candyMachine.itemsLoaded) {
      throw new Error("Belp Candy Machine đã sold out!");
    }

    // Tạo NFT mint signer
    const nftMint = generateSigner(umi);
    console.log("🎯 Generated Belp NFT mint:", nftMint.publicKey);

    // Tạo mint instruction với collection và update authority cụ thể
    console.log("🔨 Building Belp mint transaction...");

    const mintBuilder = transactionBuilder().add(
      mintV2(umi, {
        candyMachine: umiPublicKey(CANDY_MACHINE),
        nftMint,
        collectionMint: umiPublicKey(COLLECTION),
        collectionUpdateAuthority: umiPublicKey(UPDATE_AUTHORITY),
        tokenStandard: candyMachine.tokenStandard,
        mintArgs: {
          solPayment: { destination: umi.identity.publicKey },
      },
      })
    );

    console.log("📝 Sending and confirming Belp NFT transaction...");

    // Gửi và confirm transaction
    const result = await mintBuilder.sendAndConfirm(umi, {
      confirm: { commitment: "confirmed" },
      send: { skipPreflight: false },
    });

    console.log("✅ Belp NFT transaction confirmed:", result.signature);

    return {
      success: true,
      signature: result.signature.toString(),
      nftAddress: nftMint.publicKey.toString(),
      message: "Belp NFT minted successfully! 🐱",
    };
  } catch (error: any) {
    console.error("❌ Belp NFT mint failed:", error);

    let errorMessage = "Failed to mint Belp NFT";
    let errorType = "error";

    // Xử lý các loại lỗi khác nhau
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("rejected")
    ) {
      errorMessage = "Transaction was cancelled by user";
      errorType = "warning";
    } else if (error.message?.includes("insufficient")) {
      errorMessage =
        "Insufficient SOL balance. Please add more SOL to your wallet";
      errorType = "error";
    } else if (error.message?.includes("sold out")) {
      errorMessage = "All Belp NFTs have been sold out";
      errorType = "info";
    } else if (error.message?.includes("not active")) {
      errorMessage = "Belp NFT minting is not currently active";
      errorType = "info";
    } else if (error.message?.includes("blockhash")) {
      errorMessage = "Network congestion. Please try again";
      errorType = "warning";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Transaction timeout. Please try again";
      errorType = "warning";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      errorType,
    };
  }
}

/**
 * Fallback method sử dụng raw Solana Web3.js nếu Metaplex không hoạt động
 */
export async function mintNftWithRawSolana(
  candyMachineAddress: string,
  walletPublicKey: string,
  walletProvider: any
): Promise<MintResult> {
  try {
    console.log("🔄 Trying raw Solana approach...");

    // Sử dụng connection từ wallet hoặc tạo mới
    const connection =
      walletProvider.connection ||
      new Connection("https://api.mainnet-beta.solana.com");

    const candyMachinePubkey = new PublicKey(candyMachineAddress);
    const payerPubkey = new PublicKey(walletPublicKey);

    // Tạo transaction đơn giản để test
    const transaction = new Transaction();

    // Thêm instruction (cần implement chi tiết hơn)
    // Đây chỉ là placeholder - cần research thêm về Candy Machine instruction format

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPubkey;

    // Ký transaction
    const signedTransaction = await walletProvider.signTransaction(transaction);

    // Gửi transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Confirm
    await connection.confirmTransaction(signature);

    return {
      success: true,
      signature,
      message: "Mint successful with raw Solana",
    };
  } catch (error: any) {
    console.error("❌ Raw Solana mint failed:", error);
    return {
      success: false,
      message: error.message || "Raw mint failed",
    };
  }
}
