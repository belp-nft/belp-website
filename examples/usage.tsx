// Example usage in pages/index.tsx

import { withWallet, getWalletStaticProps } from '@/lib/walletHelpers';
import { useWalletInfo, useWalletActions } from '@/providers/WalletProvider';

function HomePage() {
  // Simplified hooks - no more complex logic in components
  const { address, wallet, balance, isConnected, isReady } = useWalletInfo();
  const { connect, disconnect, availableWallets } = useWalletActions();

  if (!isReady) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div>
      <h1>Belp Website</h1>
      
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <p>Wallet: {wallet}</p>
          <p>Balance: {balance} SOL</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <h3>Connect Wallet:</h3>
          {availableWallets.map((w) => (
            <button 
              key={w.type} 
              onClick={() => connect(w.type)}
            >
              Connect {w.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Export with wallet wrapper and static props
export default withWallet(HomePage);

// Static props với config tối ưu
export const getStaticProps = getWalletStaticProps({
  skipAutoConnect: false, // Auto-connect on desktop
  preferredWallet: 'phantom', // Prefer Phantom if available
  enableDebug: true, // Enable debug in development
});
