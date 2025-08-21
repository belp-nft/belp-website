import { WalletType } from "./types";
import { WALLET_CONFIGS } from "./configs";

export class WalletListenerService {
  static setupWalletListeners(
    walletType: WalletType,
    listenersRef: React.MutableRefObject<Map<WalletType, any>>,
    setSolAddress: (address: string | null) => void,
    setConnectedWallet: (wallet: WalletType | null) => void,
    setConnectedType: (type: any) => void,
    setSolLamports: (lamports: number) => void,
    onAccountChangeCallback?: (
      newAddress: string,
      walletType: WalletType
    ) => void,
    getCurrentSolAddress?: () => string | null
  ): void {
    const config = WALLET_CONFIGS[walletType];
    const provider = config.getProvider();

    if (!provider?.on) return;

    const onConnect = (..._args: any[]) => {
      const addr = provider.publicKey?.toString?.() || null;
      if (addr) {
        setSolAddress(addr);
        setConnectedWallet(walletType);
        setConnectedType("sol");
      }
    };

    const onDisconnect = () => {
      setSolAddress(null);
      setSolLamports(0);
      setConnectedWallet(null);
      setConnectedType(null);
    };

    // Handle account change events
    const handleAccountChanged = (publicKey: any) => {
      const newAddr = publicKey?.toString?.() || null;
      if (newAddr) {
        const currentAddr = getCurrentSolAddress?.();
        console.log(`🔄 Account changed on ${config.displayName}:`, {
          from: currentAddr,
          to: newAddr,
        });

        // Only trigger if address actually changed
        if (currentAddr !== newAddr) {
          setSolAddress(newAddr);
          setConnectedWallet(walletType);
          setConnectedType("sol");
          setSolLamports(0); // Reset balance while loading new one

          // Notify parent about account change
          onAccountChangeCallback?.(newAddr, walletType);
        }
      }
    };

    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);

    // Listen for account changes (different wallets may use different event names)
    if (provider.on) {
      // Phantom uses 'accountChanged'
      if (walletType === "phantom") {
        provider.on("accountChanged", handleAccountChanged);
        // Some versions might use 'connect' event when switching accounts
        provider.on("connect", (publicKey: any) => {
          const addr =
            publicKey?.toString?.() || provider.publicKey?.toString?.();
          const currentAddr = getCurrentSolAddress?.();
          if (addr && addr !== currentAddr) {
            handleAccountChanged(publicKey || provider.publicKey);
          }
        });
      }
      // Solflare uses 'accountChanged'
      else if (walletType === "solflare") {
        provider.on("accountChanged", handleAccountChanged);
        provider.on("connect", (publicKey: any) => {
          const addr =
            publicKey?.toString?.() || provider.publicKey?.toString?.();
          const currentAddr = getCurrentSolAddress?.();
          if (addr && addr !== currentAddr) {
            handleAccountChanged(publicKey || provider.publicKey);
          }
        });
      }
      // Backpack uses 'accountChanged' and 'accountsChanged'
      else if (walletType === "backpack") {
        // Try both event names for Backpack
        if (provider.on) {
          provider.on("accountChanged", handleAccountChanged);
          provider.on("accountsChanged", (accounts: any[]) => {
            if (accounts?.[0]) {
              handleAccountChanged(accounts[0]);
            }
          });
        }
      }
      // OKX uses 'accountsChanged'
      else if (walletType === "okx") {
        provider.on("accountsChanged", (accounts: any[]) => {
          if (accounts?.[0]) {
            handleAccountChanged({ publicKey: accounts[0] });
          }
        });
        // Also try accountChanged
        provider.on("accountChanged", handleAccountChanged);
      }
      // Glow - try both patterns
      else if (walletType === "glow") {
        provider.on("accountChanged", handleAccountChanged);
        provider.on("accountsChanged", (accounts: any[]) => {
          if (accounts?.[0]) {
            handleAccountChanged(accounts[0]);
          }
        });
      }
    }

    listenersRef.current.set(walletType, {
      connect: onConnect,
      disconnect: onDisconnect,
      accountChanged: handleAccountChanged,
    });
  }

  static cleanupWalletListeners(
    walletType: WalletType,
    listenersRef: React.MutableRefObject<Map<WalletType, any>>
  ): void {
    const config = WALLET_CONFIGS[walletType];
    const provider = config.getProvider();
    const listeners = listenersRef.current.get(walletType);

    if (!provider?.off || !listeners) return;

    try {
      // Clean up basic listeners
      if (listeners.connect) {
        provider.off("connect", listeners.connect);
      }
      if (listeners.disconnect) {
        provider.off("disconnect", listeners.disconnect);
      }

      // Clean up account change listeners based on wallet type
      if (listeners.accountChanged) {
        if (walletType === "phantom" || walletType === "solflare") {
          provider.off("accountChanged", listeners.accountChanged);
        }

        if (walletType === "backpack") {
          provider.off("accountChanged", listeners.accountChanged);
          provider.off("accountsChanged", listeners.accountChanged);
        }

        if (walletType === "okx") {
          provider.off("accountChanged", listeners.accountChanged);
          provider.off("accountsChanged", listeners.accountChanged);
        }

        if (walletType === "glow") {
          provider.off("accountChanged", listeners.accountChanged);
          provider.off("accountsChanged", listeners.accountChanged);
        }
      }

      console.log(`🧹 Cleaned up ${config.displayName} wallet listeners`);
    } catch (error) {
      console.warn(`Failed to cleanup ${config.displayName} listeners:`, error);
    }

    listenersRef.current.delete(walletType);
  }
}
