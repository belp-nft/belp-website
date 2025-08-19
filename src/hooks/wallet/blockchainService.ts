import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BLOCKCHAIN_CONFIG } from "@/services";

export async function getSolBalanceLamports(address: string): Promise<number> {
  const rpcClient = new Connection(BLOCKCHAIN_CONFIG.SOLANA_RPC);
  const pubkey = new PublicKey(address);

  const lamports = await rpcClient.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}
