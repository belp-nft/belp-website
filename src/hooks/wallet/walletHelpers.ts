import { WALLET_CONFIGS } from "./configs";
import type { WalletType } from "./types";

/**
 * Generate wallet availability checks dynamically
 * Returns: { hasPhantom: boolean, hasSolflare: boolean, ... }
 */
export const generateWalletAvailabilityChecks = () => {
  const helpers: Record<string, boolean> = {};

  Object.entries(WALLET_CONFIGS).forEach(([key, config]) => {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    helpers[`has${capitalizedKey}`] = config.isAvailable();
  });

  return helpers;
};

/**
 * Generate wallet connection functions dynamically
 * Returns: { connectPhantom: () => void, connectSolflare: () => void, ... }
 */
export const generateWalletConnectors = (
  connectWallet: (type: WalletType) => Promise<void>
) => {
  const connectors: Record<string, () => Promise<void>> = {};

  Object.keys(WALLET_CONFIGS).forEach((key) => {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    connectors[`connect${capitalizedKey}`] = () =>
      connectWallet(key as WalletType);
  });

  return connectors;
};

/**
 * Get all wallet types from config
 */
export const getWalletTypes = (): WalletType[] => {
  return Object.keys(WALLET_CONFIGS) as WalletType[];
};
