import { WalletType, WalletConfig } from "./types";

export const WALLET_CONFIGS: Record<WalletType, WalletConfig> = {
  phantom: {
    name: "phantom",
    displayName: "Phantom",
    downloadUrl: {
      desktop: "https://phantom.app/download",
      mobile: {
        ios: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
        android: "https://play.google.com/store/apps/details?id=app.phantom",
      },
    },
    deepLinkTemplate: "https://phantom.app/ul/browse/{{url}}?ref=belp",
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return window.solana?.isPhantom
        ? window.solana
        : (window as any).phantom?.solana ||
            window.solana ||
            (window.ethereum as any)?.solana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(
        window.solana?.isPhantom ||
        (window as any).phantom?.solana ||
        window.solana
      );
    },
  },

  solflare: {
    name: "solflare",
    displayName: "Solflare",
    downloadUrl: {
      desktop: "https://solflare.com/download",
      mobile: {
        ios: "https://apps.apple.com/app/solflare/id1580902717",
        android:
          "https://play.google.com/store/apps/details?id=com.solflare.mobile",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).solflare;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).solflare;
    },
  },

  backpack: {
    name: "backpack",
    displayName: "Backpack",
    downloadUrl: {
      desktop: "https://backpack.app/download",
      mobile: {
        ios: "https://apps.apple.com/app/backpack-wallet/id1614235142",
        android:
          "https://play.google.com/store/apps/details?id=app.backpack.mobile",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).backpack;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).backpack;
    },
  },

  glow: {
    name: "glow",
    displayName: "Glow",
    downloadUrl: {
      desktop: "https://glow.app/download",
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).glowSolana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).glowSolana;
    },
  },

  okx: {
    name: "okx",
    displayName: "OKX Wallet",
    downloadUrl: {
      desktop: "https://www.okx.com/web3",
      mobile: {
        ios: "https://apps.apple.com/app/okx/id1327268470",
        android:
          "https://play.google.com/store/apps/details?id=com.okinc.okex.gp",
      },
    },
    getProvider: () => {
      if (typeof window === "undefined") return null;
      return (window as any).okxwallet?.solana;
    },
    isAvailable: () => {
      if (typeof window === "undefined") return false;
      return !!(window as any).okxwallet?.solana;
    },
  },
};
