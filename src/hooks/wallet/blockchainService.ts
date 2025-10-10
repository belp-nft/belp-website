import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Connection pool to reuse connections
const connectionPool = new Map<string, Connection>();

function getConnection(rpcUrl: string): Connection {
  if (!connectionPool.has(rpcUrl)) {
    connectionPool.set(rpcUrl, new Connection(rpcUrl, "confirmed"));
  }
  return connectionPool.get(rpcUrl)!;
}

export async function getSolBalanceLamports(
  address: string,
  rpcUrl: string = "https://stylish-long-water.solana-mainnet.quiknode.pro/a51cf5df251ae4aadcc70d3c7685f56a8707dd06"
): Promise<number> {
  console.log("🔍 Getting SOL balance for:", address, "via RPC:", rpcUrl);

  try {
    const rpcClient = getConnection(rpcUrl);
    const pubkey = new PublicKey(address);

    console.log("🔍 Created PublicKey:", pubkey.toString());

    const lamports = await rpcClient.getBalance(pubkey);
    console.log("✅ Retrieved balance:", lamports, "lamports");

    return lamports; // Return lamports directly, not converted to SOL
  } catch (error) {
    console.error("❌ Error getting balance:", error);
    throw error;
  }
}
