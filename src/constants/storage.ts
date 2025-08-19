// Storage keys for wallet state persistence
export const WALLET_STORAGE_KEYS = {
  ADDRESS: "wallet-address",
  TYPE: "wallet-connected-type",
  WALLET: "wallet", // Existing key để tương thích với code cũ
  DISCONNECTED: "wallet-disconnected",
} as const;

// Helper functions for wallet localStorage operations
export const WalletStorage = {
  // Get wallet state from localStorage
  getAddress: (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(WALLET_STORAGE_KEYS.ADDRESS);
  },

  getType: (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(WALLET_STORAGE_KEYS.TYPE);
  },

  getWallet: (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(WALLET_STORAGE_KEYS.WALLET);
  },

  isDisconnected: (): boolean => {
    if (typeof window === "undefined") return false;
    return (
      window.localStorage.getItem(WALLET_STORAGE_KEYS.DISCONNECTED) === "true"
    );
  },

  // Set wallet state to localStorage
  setAddress: (address: string | null): void => {
    if (typeof window === "undefined") return;
    if (address) {
      window.localStorage.setItem(WALLET_STORAGE_KEYS.ADDRESS, address);
      window.localStorage.removeItem(WALLET_STORAGE_KEYS.DISCONNECTED);
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEYS.ADDRESS);
    }
  },

  setType: (type: string | null): void => {
    if (typeof window === "undefined") return;
    if (type) {
      window.localStorage.setItem(WALLET_STORAGE_KEYS.TYPE, type);
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEYS.TYPE);
    }
  },

  setWallet: (wallet: string | null): void => {
    if (typeof window === "undefined") return;
    if (wallet) {
      window.localStorage.setItem(WALLET_STORAGE_KEYS.WALLET, wallet);
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEYS.WALLET);
    }
  },

  // Clear all wallet data
  clear: (): void => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(WALLET_STORAGE_KEYS.ADDRESS);
    window.localStorage.removeItem(WALLET_STORAGE_KEYS.TYPE);
    window.localStorage.removeItem(WALLET_STORAGE_KEYS.WALLET);
    window.localStorage.setItem(WALLET_STORAGE_KEYS.DISCONNECTED, "true");
  },

  // Remove disconnected flag
  clearDisconnected: (): void => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(WALLET_STORAGE_KEYS.DISCONNECTED);
  },
};
