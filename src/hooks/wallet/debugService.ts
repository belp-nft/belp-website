import { WalletType } from "./types";
import { WALLET_CONFIGS } from "./configs";

export class WalletDebugService {
  /**
   * Debug function to check what events a wallet provider supports
   */
  static debugWalletEvents(walletType: WalletType): void {
    const config = WALLET_CONFIGS[walletType];
    const provider = config.getProvider();

    if (!provider) {
      console.log(`❌ ${config.displayName} provider not found`);
      return;
    }

    console.log(`🔍 Debugging ${config.displayName} wallet events:`);
    console.log("Provider object:", provider);
    console.log("Has .on method:", typeof provider.on === "function");
    console.log("Has .off method:", typeof provider.off === "function");
    console.log("Has .connect method:", typeof provider.connect === "function");
    console.log(
      "Has .disconnect method:",
      typeof provider.disconnect === "function"
    );
    console.log("Current publicKey:", provider.publicKey?.toString?.());
    console.log("Is connected:", provider.isConnected);

    // List all available methods and properties
    const methods = Object.getOwnPropertyNames(provider).filter(
      (prop) => typeof provider[prop] === "function"
    );
    const props = Object.getOwnPropertyNames(provider).filter(
      (prop) => typeof provider[prop] !== "function"
    );

    console.log("Available methods:", methods);
    console.log("Available properties:", props);

    // Try to add temporary listeners to see what events are supported
    if (provider.on) {
      const testEvents = [
        "connect",
        "disconnect",
        "accountChanged",
        "accountsChanged",
        "chainChanged",
      ];

      testEvents.forEach((eventName) => {
        try {
          const testListener = (...args: any[]) => {
            console.log(
              `🎉 ${config.displayName} ${eventName} event fired:`,
              args
            );
          };

          provider.on(eventName, testListener);
          console.log(`✅ Successfully added listener for '${eventName}'`);

          // Remove the test listener immediately
          if (provider.off) {
            provider.off(eventName, testListener);
          }
        } catch (error) {
          console.log(`❌ Failed to add listener for '${eventName}':`, error);
        }
      });
    }
  }

  /**
   * Setup temporary debug listeners for all wallet types
   */
  static setupDebugListeners(): void {
    console.log("🔧 Setting up debug listeners for wallet account changes...");

    const walletTypes: WalletType[] = [
      "phantom",
      "solflare",
      "backpack",
      "okx",
      "glow",
    ];

    walletTypes.forEach((walletType) => {
      const config = WALLET_CONFIGS[walletType];
      const provider = config.getProvider();

      if (!provider?.on) return;

      console.log(`🔧 Setting up debug for ${config.displayName}...`);

      // Universal debug listener
      const debugListener = (...args: any[]) => {
        console.log(`🎯 ${config.displayName} account change detected:`, args);
        console.log("Current provider state:", {
          publicKey: provider.publicKey?.toString?.(),
          isConnected: provider.isConnected,
          timestamp: new Date().toISOString(),
        });
      };

      // Try multiple event names
      const eventNames = ["accountChanged", "accountsChanged", "connect"];
      eventNames.forEach((eventName) => {
        try {
          provider.on(eventName, debugListener);
          console.log(`✅ ${config.displayName} - listening to '${eventName}'`);
        } catch (error) {
          console.log(
            `❌ ${config.displayName} - failed to listen to '${eventName}':`,
            error
          );
        }
      });
    });

    // Add to window for easy access in console
    (window as any).walletDebug = {
      debugWallet: this.debugWalletEvents.bind(this),
      clearDebug: () => {
        console.log(
          "🧹 Debug listeners would be cleared here (not implemented)"
        );
      },
    };

    console.log(
      "🎉 Debug setup complete! Use window.walletDebug.debugWallet('phantom') in console"
    );
  }
}

// Auto-setup debug in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Delay setup to ensure wallets are loaded
  setTimeout(() => {
    WalletDebugService.setupDebugListeners();
  }, 2000);
}
