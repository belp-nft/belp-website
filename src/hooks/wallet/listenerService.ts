import { WalletType } from "./types";
import { WALLET_CONFIGS } from "./configs";

export class WalletListenerService {
  static setupWalletListeners(
    walletType: WalletType,
    listenersRef: React.MutableRefObject<Map<WalletType, any>>,
    setSolAddress: (address: string | null) => void,
    setConnectedWallet: (wallet: WalletType | null) => void,
    setConnectedType: (type: any) => void,
    setSolLamports: (lamports: number) => void
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

    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);

    listenersRef.current.set(walletType, {
      connect: onConnect,
      disconnect: onDisconnect,
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

    if (listeners.connect) {
      provider.off("connect", listeners.connect);
    }
    if (listeners.disconnect) {
      provider.off("disconnect", listeners.disconnect);
    }

    listenersRef.current.delete(walletType);
  }
}
