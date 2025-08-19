import { WalletType } from "./types";
import { WALLET_CONFIGS } from "./configs";
import { isMobile, isIOS } from "./utils";

export class WalletConnectionService {
  static async connectWallet(
    walletType: WalletType,
    setLoading: (loading: any) => void,
    showLoading: () => void,
    hideLoading: () => void,
    setSolAddress: (address: string | null) => void,
    setConnectedType: (type: any) => void,
    setConnectedWallet: (wallet: WalletType | null) => void,
    authenticateWallet: (
      address: string,
      forceBalance?: boolean
    ) => Promise<boolean>,
    refreshSolBalance: () => Promise<void>,
    onConnected?: (info: any) => void
  ): Promise<void> {
    const config = WALLET_CONFIGS[walletType];

    try {
      setLoading(walletType);
      showLoading();
      window.localStorage.removeItem("wallet-disconnected");

      const provider = config.getProvider();

      if (!provider) {
        hideLoading();
        this.handleWalletNotFound(walletType, config);
        return;
      }

      if (!provider.connect) {
        throw new Error(`${config.displayName} does not support connection`);
      }

      console.log(`Starting ${config.displayName} wallet connection...`);

      const resp = await provider.connect();

      if (!resp?.publicKey) {
        throw new Error(`Failed to get public key from ${config.displayName}`);
      }

      const addr = resp.publicKey.toString();
      setSolAddress(addr);
      setConnectedType("sol");
      setConnectedWallet(walletType);

      console.log(`${config.displayName} connected:`, addr);

      const authSuccess = await authenticateWallet(addr, true);

      if (authSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("Loading user data...");
        await refreshSolBalance();
      } else {
        console.warn("Authentication failed, continuing without backend data");
      }

      onConnected?.({ kind: "sol", address: addr, walletType });
      console.log(`${config.displayName} wallet connection successful!`);
    } catch (error: any) {
      console.error(`${config.displayName} connection failed:`, error);
      this.handleConnectionError(error, config);
    } finally {
      setLoading(null);
      hideLoading();
    }
  }

  private static handleWalletNotFound(
    walletType: WalletType,
    config: any
  ): void {
    console.log(`No ${config.displayName} provider detected, redirecting...`);

    const currentUrl = window.location.href;
    const mobile = isMobile();

    if (mobile && config.deepLinkTemplate) {
      const deepLink = config.deepLinkTemplate.replace(
        "{{url}}",
        encodeURIComponent(currentUrl)
      );
      console.log(
        `Trying mobile deep link for ${config.displayName}:`,
        deepLink
      );
      window.location.href = deepLink;

      setTimeout(() => {
        const storeUrl = isIOS()
          ? config.downloadUrl.mobile?.ios
          : config.downloadUrl.mobile?.android;

        if (storeUrl) {
          window.open(storeUrl, "_blank");
        }
      }, 3000);
    } else {
      const downloadUrl = `${config.downloadUrl.desktop}?utm_source=belp&utm_medium=web&return_url=${encodeURIComponent(currentUrl)}`;
      console.log(`Opening ${config.displayName} download:`, downloadUrl);
      window.open(downloadUrl, "_blank");
    }
  }

  private static handleConnectionError(error: any, config: any): void {
    if (error.message?.includes("User rejected") || error.code === 4001) {
      console.log("User cancelled the connection");
    } else if (error.code === -32002) {
      alert(
        `Connection request is already pending. Please check your ${config.displayName} wallet.`
      );
    } else if (error.message?.includes("wallet not found")) {
      alert(
        `${config.displayName} wallet not found. Please install ${config.displayName} extension or app.`
      );
    } else {
      alert(
        `Connection failed: ${error.message || "Unknown error"}. Please try again.`
      );
    }
  }
}
