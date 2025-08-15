"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { SettingService } from "@/services/settingService";
import { NftService } from "@/services/nftService";
import { useAuth } from "@/providers/AuthProvider";
import { useLoading } from "@/providers/LoadingProvider";
import type {
  SettingsData,
  GenesisStatusResponse,
  NFTPricingResponse,
} from "@/services/types";

interface SettingsContextType {
  // Settings data
  settings: SettingsData | null;
  nftPricing: NFTPricingResponse["data"] | null;

  // Loading states
  isLoadingSettings: boolean;
  isLoadingPricing: boolean;

  // Methods
  refreshSettings: () => Promise<void>;
  refreshPricing: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Error handling
  settingsError: string | null;
  pricingError: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  // States
  const [settings, setSettings] = useState<SettingsData | null>(null);

  const [nftPricing, setNftPricing] = useState<
    NFTPricingResponse["data"] | null
  >(null);

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Hooks
  const { isAuthenticated } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Calculate derived values

  // Refresh settings data
  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingSettings(true);
    setSettingsError(null);

    try {
      // console.log("🔄 Refreshing settings data...");

      const settingsData = await SettingService.getSettingsData();
      setSettings(settingsData.data);

      // console.log("✅ Settings refreshed:", { settingsData, genesisStatusData });
    } catch (error: any) {
      console.error("❌ Failed to refresh settings:", error);
      setSettingsError(error.message || "Failed to load settings");
    } finally {
      setIsLoadingSettings(false);
    }
  }, [isAuthenticated]);

  // Refresh pricing data
  const refreshPricing = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("🔒 Not authenticated - skipping pricing refresh");
      return;
    }

    setIsLoadingPricing(true);
    setPricingError(null);

    try {
      console.log("💰 Refreshing NFT pricing...");

      const pricingData = await NftService.getCurrentPricing();
      console.log("✅ Pricing API response:", pricingData);
      setNftPricing(pricingData.data);
    } catch (error: any) {
      console.error("❌ Failed to refresh pricing:", error);
      setSettingsError(error.message || "Failed to load pricing");
    } finally {
      setIsLoadingPricing(false);
    }
  }, [isAuthenticated]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;

    showLoading();
    try {
      await Promise.all([refreshSettings(), refreshPricing()]);
    } finally {
      hideLoading();
    }
  }, [
    isAuthenticated,
    refreshSettings,
    refreshPricing,
    showLoading,
    hideLoading,
  ]);

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // console.log("🔄 Auth detected - initializing settings...");
      refreshAll();
    } else {
      // Clear data when not authenticated
      setSettings(null);
      setNftPricing(null);
      setTimeRemaining(null);
    }
  }, [isAuthenticated]);

  const value: SettingsContextType = {
    // Data
    settings,
    nftPricing,

    // Loading states
    isLoadingSettings,
    isLoadingPricing,

    // Methods
    refreshSettings,
    refreshPricing,
    refreshAll,

    // Errors
    settingsError,
    pricingError,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
