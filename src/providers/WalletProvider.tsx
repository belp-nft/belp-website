"use client";
import { createContext, useContext, ReactNode, useRef, useState } from 'react';
import { useWallet, Connected } from '@/hooks/useWallet';

interface WalletContextType extends ReturnType<typeof useWallet> {
  isReady: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  config?: {
    skipAutoConnect?: boolean;
    preferredWallet?: string;
    enableDebug?: boolean;
    cacheTimeout?: number;
  };
}

export function WalletProvider({ children, config = {} }: WalletProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const initializationRef = useRef(false);

  const {
    skipAutoConnect = false,
    preferredWallet,
    enableDebug = false,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = config;

  const onConnected = (info: Connected) => {
    if (enableDebug) {
      // console.log('WalletProvider: Wallet connected', info);
    }
    
    if (!isReady) {
      setIsReady(true);
    }
  };

  const wallet = useWallet(onConnected);

  // Override auto-connect behavior based on static props
  const contextValue: WalletContextType = {
    ...wallet,
    isReady,
    // Override connectWallet to respect preferredWallet
    connectWallet: async (walletType) => {
      if (preferredWallet && walletType !== preferredWallet) {
        console.warn(`Preferred wallet is ${preferredWallet}, but trying to connect ${walletType}`);
      }
      return wallet.connectWallet(walletType);
    },
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
}

// Simplified hook for components that just need basic wallet info
export function useWalletInfo() {
  const { solAddress, connectedWallet, connectedType, loading, solBalanceText, isReady } = useWalletContext();
  
  return {
    address: solAddress,
    wallet: connectedWallet,
    type: connectedType,
    loading,
    balance: solBalanceText,
    isConnected: !!solAddress,
    isReady,
  };
}

// Hook for wallet actions only
export function useWalletActions() {
  const { connectWallet, disconnect, refreshSolBalance, availableWallets } = useWalletContext();
  
  return {
    connect: connectWallet,
    disconnect,
    refreshBalance: refreshSolBalance,
    availableWallets,
  };
}
