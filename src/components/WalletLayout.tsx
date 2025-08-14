import { WalletProvider } from '@/providers/WalletProvider';
import { ReactNode } from 'react';

interface WalletLayoutProps {
  children: ReactNode;
  skipAutoConnect?: boolean;
  preferredWallet?: string;
  enableDebug?: boolean;
}

export default function WalletLayout({ 
  children, 
  skipAutoConnect = false,
  preferredWallet,
  enableDebug = process.env.NODE_ENV === 'development'
}: WalletLayoutProps) {
  return (
    <WalletProvider 
      config={{
        skipAutoConnect,
        preferredWallet,
        enableDebug,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
      }}
    >
      {children}
    </WalletProvider>
  );
}
