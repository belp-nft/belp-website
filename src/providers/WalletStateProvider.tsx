"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { WalletType } from "@/hooks/wallet/types";

interface WalletStateContextType {
  solAddress: string | null;
  connectedType: string | null;
  connectedWallet: WalletType | null;
  setSolAddress: (address: string | null) => void;
  setConnectedType: (type: string | null) => void;
  setConnectedWallet: (wallet: WalletType | null) => void;
  clearWalletState: () => void;
}

const WalletStateContext = createContext<WalletStateContextType | undefined>(
  undefined
);

const STORAGE_KEYS = {
  ADDRESS: "wallet-address",
  TYPE: "wallet-connected-type",
  WALLET: "wallet", // Use existing key để tương thích với code cũ
  DISCONNECTED: "wallet-disconnected",
};

interface WalletStateProviderProps {
  children: ReactNode;
}

export function WalletStateProvider({ children }: WalletStateProviderProps) {
  // Initialize state as null for SSR compatibility
  const [solAddress, setSolAddressState] = useState<string | null>(null);
  const [connectedType, setConnectedTypeState] = useState<string | null>(null);
  const [connectedWallet, setConnectedWalletState] =
    useState<WalletType | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate state from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const disconnected = window.localStorage.getItem(
        STORAGE_KEYS.DISCONNECTED
      );

      if (disconnected !== "true") {
        const storedAddress = window.localStorage.getItem(STORAGE_KEYS.ADDRESS);
        const storedType = window.localStorage.getItem(STORAGE_KEYS.TYPE);
        const storedWallet = window.localStorage.getItem(STORAGE_KEYS.WALLET);

        if (storedAddress) setSolAddressState(storedAddress);
        if (storedType) setConnectedTypeState(storedType);
        if (storedWallet) setConnectedWalletState(storedWallet as WalletType);
      }

      setIsHydrated(true);
    }
  }, []);

  // Wrapper functions that sync with localStorage
  const setSolAddress = (address: string | null) => {
    console.log("💾 Setting solAddress:", address);
    setSolAddressState(address);

    if (typeof window !== "undefined") {
      if (address) {
        window.localStorage.setItem(STORAGE_KEYS.ADDRESS, address);
        window.localStorage.removeItem(STORAGE_KEYS.DISCONNECTED);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.ADDRESS);
      }
    }
  };

  const setConnectedType = (type: string | null) => {
    console.log("💾 Setting connectedType:", type);
    setConnectedTypeState(type);

    if (typeof window !== "undefined") {
      if (type) {
        window.localStorage.setItem(STORAGE_KEYS.TYPE, type);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.TYPE);
      }
    }
  };

  const setConnectedWallet = (wallet: WalletType | null) => {
    console.log("💾 Setting connectedWallet:", wallet);
    setConnectedWalletState(wallet);

    if (typeof window !== "undefined") {
      if (wallet) {
        window.localStorage.setItem(STORAGE_KEYS.WALLET, wallet);
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.WALLET);
      }
    }
  };

  const clearWalletState = () => {
    console.log("🧹 Clearing wallet state");
    setSolAddressState(null);
    setConnectedTypeState(null);
    setConnectedWalletState(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.ADDRESS);
      window.localStorage.removeItem(STORAGE_KEYS.TYPE);
      window.localStorage.removeItem(STORAGE_KEYS.WALLET);
      window.localStorage.setItem(STORAGE_KEYS.DISCONNECTED, "true");
    }
  };

  // Listen for storage changes (for multi-tab sync)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ADDRESS) {
        setSolAddressState(e.newValue);
      } else if (e.key === STORAGE_KEYS.TYPE) {
        setConnectedTypeState(e.newValue);
      } else if (e.key === STORAGE_KEYS.WALLET) {
        setConnectedWalletState(e.newValue as WalletType | null);
      } else if (e.key === STORAGE_KEYS.DISCONNECTED && e.newValue === "true") {
        setSolAddressState(null);
        setConnectedTypeState(null);
        setConnectedWalletState(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("🔍 WalletState changed:", {
      solAddress,
      connectedType,
      connectedWallet,
    });
  }, [solAddress, connectedType, connectedWallet]);

  const value: WalletStateContextType = {
    solAddress,
    connectedType,
    connectedWallet,
    setSolAddress,
    setConnectedType,
    setConnectedWallet,
    clearWalletState,
  };

  return (
    <WalletStateContext.Provider value={value}>
      {children}
    </WalletStateContext.Provider>
  );
}

export function useWalletState() {
  const context = useContext(WalletStateContext);
  if (context === undefined) {
    throw new Error("useWalletState must be used within a WalletStateProvider");
  }
  return context;
}
