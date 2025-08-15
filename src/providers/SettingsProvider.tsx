"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SettingService } from "@/services/settingService";
import { NftService } from "@/services/nftService";
import { useAuth } from "@/providers/AuthProvider";
import { useLoading } from "@/providers/LoadingProvider";
import type { 
  SettingsData, 
  GenesisStatusResponse, 
  NFTPricingResponse 
} from "@/services/types";

interface SettingsContextType {
  // Settings data
  settings: SettingsData | null;
  genesisStatus: GenesisStatusResponse['data'] | null;
  nftPricing: NFTPricingResponse['data'] | null;
  
  // Loading states
  isLoadingSettings: boolean;
  isLoadingPricing: boolean;
  
  // Helper values
  currentPrice: number;
  priceType: "genesis" | "general";
  isGenesisActive: boolean;
  genesisEndDate: Date | null;
  timeRemaining: string | null;
  
  // Methods
  refreshSettings: () => Promise<void>;
  refreshPricing: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Error handling
  settingsError: string | null;
  pricingError: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

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

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // States
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [genesisStatus, setGenesisStatus] = useState<GenesisStatusResponse['data'] | null>(null);
  const [nftPricing, setNftPricing] = useState<NFTPricingResponse['data'] | null>(null);
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Hooks
  const { isAuthenticated } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  // Calculate derived values
  const currentPrice = nftPricing?.currentPrice || 0;
  const priceType = nftPricing?.priceType || "general";
  const isGenesisActive = nftPricing?.isGenesisRound || false;
  
  // Calculate genesis end date from pricing API
  const genesisEndDate = React.useMemo(() => {
    return nftPricing?.genesisRound?.endDate 
      ? new Date(nftPricing.genesisRound.endDate) 
      : null;
  }, [nftPricing]);

  // Refresh settings data
  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoadingSettings(true);
    setSettingsError(null);
    
    try {
      // console.log("🔄 Refreshing settings data...");
      
      const [settingsData, genesisStatusData] = await Promise.all([
        SettingService.getSettingsData(),
        SettingService.getGenesisStatus(),
      ]);
      
      setSettings(settingsData.data);
      setGenesisStatus(genesisStatusData.data);
      
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
  }, [isAuthenticated, refreshSettings, refreshPricing, showLoading, hideLoading]);

  // Calculate time remaining for genesis round
  useEffect(() => {
    if (!genesisEndDate || !isGenesisActive) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const diff = genesisEndDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Ended");
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    // Update immediately
    updateTimeRemaining();
    
    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [genesisEndDate, isGenesisActive]);

  // Initial data fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // console.log("🔄 Auth detected - initializing settings...");
      refreshAll();
    } else {
      // Clear data when not authenticated
      setSettings(null);
      setGenesisStatus(null);
      setNftPricing(null);
      setTimeRemaining(null);
    }
  }, [isAuthenticated]);

  const value: SettingsContextType = {
    // Data
    settings,
    genesisStatus,
    nftPricing,
    
    // Loading states
    isLoadingSettings,
    isLoadingPricing,
    
    // Helper values
    currentPrice,
    priceType,
    isGenesisActive,
    genesisEndDate,
    timeRemaining,
    
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
