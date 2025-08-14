import WalletLayout from '@/components/WalletLayout';
import { GetStaticProps, GetServerSideProps } from 'next';
import React from 'react';

export interface WalletPageProps {
  walletConfig?: {
    skipAutoConnect?: boolean;
    preferredWallet?: string;
    enableDebug?: boolean;
  };
}

// HOC để wrap pages với wallet functionality
export function withWallet<P extends object>(
  Component: React.ComponentType<P>,
  config?: {
    skipAutoConnect?: boolean;
    preferredWallet?: string;
    enableDebug?: boolean;
  }
) {
  return function WrappedComponent(props: P & WalletPageProps) {
    const walletConfig = props.walletConfig || config || {};
    
    return (
      <WalletLayout {...walletConfig}>
        <Component {...props} />
      </WalletLayout>
    );
  };
}

// Helper function để generate static props cho wallet pages
export function getWalletStaticProps(config?: {
  skipAutoConnect?: boolean;
  preferredWallet?: string;
  enableDebug?: boolean;
}): GetStaticProps<WalletPageProps> {
  return async () => {
    return {
      props: {
        walletConfig: {
          skipAutoConnect: config?.skipAutoConnect ?? false,
          preferredWallet: config?.preferredWallet,
          enableDebug: config?.enableDebug ?? process.env.NODE_ENV === 'development',
        },
      },
      revalidate: 60 * 60, // Revalidate every hour
    };
  };
}

// Helper function để generate server-side props cho wallet pages
export function getWalletServerSideProps(config?: {
  skipAutoConnect?: boolean;
  preferredWallet?: string;
  enableDebug?: boolean;
}): GetServerSideProps<WalletPageProps> {
  return async (context) => {
    // Có thể thêm logic để detect mobile/desktop, user-agent, etc.
    const userAgent = context.req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    return {
      props: {
        walletConfig: {
          skipAutoConnect: config?.skipAutoConnect ?? isMobile, // Skip auto-connect on mobile
          preferredWallet: config?.preferredWallet,
          enableDebug: config?.enableDebug ?? false, // Disable debug in SSR
        },
      },
    };
  };
}
