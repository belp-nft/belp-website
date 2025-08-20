import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Connection pool to reuse connections
const connectionPool = new Map<string, Connection>();

function getConnection(rpcUrl: string): Connection {
  if (!connectionPool.has(rpcUrl)) {
    connectionPool.set(rpcUrl, new Connection(rpcUrl, 'confirmed'));
  }
  return connectionPool.get(rpcUrl)!;
}

export async function getSolBalanceLamports(
  address: string,
  rpcUrl: string = "https://api.devnet.solana.com"
): Promise<number> {
  const rpcClient = getConnection(rpcUrl);
  const pubkey = new PublicKey(address);

  const lamports = await rpcClient.getBalance(pubkey);
  return lamports; // Return lamports directly, not converted to SOL
}
