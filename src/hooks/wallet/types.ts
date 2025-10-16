import { Transaction } from "@solana/web3.js";

export type WalletType = "phantom" | "solflare" | "backpack" | "glow" | "okx";
export type LoadingKind = WalletType | "sol-balance" | null;

export type Connected = {
  kind: "sol";
  address: string;
  walletType: WalletType;
};

export interface WalletConfig {
  name: string;
  displayName: string;
  downloadUrl: {
    desktop: string;
    mobile?: {
      ios: string;
      android: string;
    };
  };
  deepLinkTemplate?: string;
  getProvider: () => any;
  isAvailable: () => boolean;
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: {
      isPhantom?: boolean;
      connect: (args?: any) => Promise<{ publicKey: { toString(): string } }>;
      disconnect?: () => Promise<void>;
      on?: (event: string, cb: (...args: any[]) => void) => void;
      off?: (event: string, cb: (...args: any[]) => void) => void;
      publicKey?: { toString(): string };
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions?: (
        transactions: Transaction[]
      ) => Promise<Transaction[]>;
      // Phantom's preferred method
      signAndSendTransaction?: (
        transaction: Transaction,
        options?: { commitment?: string }
      ) => Promise<{ signature: string }>;
    };
    solflare?: any;
    backpack?: any;
    glowSolana?: any;
    okxwallet?: {
      solana?: any;
    };
  }
}
