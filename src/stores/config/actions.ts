import { ConfigService } from "@/services";
import type { CandyMachineConfig, CandyMachineState } from "./types";

export const createConfigActions = (
  set: (partial: Partial<CandyMachineState>) => void,
  get: () => CandyMachineState
) => ({
  fetchConfig: async (address?: string) => {
    set({ loading: true, error: null });

    try {
      const result = await ConfigService.getCandyMachineConfig(address);

      if (result.success && result.data) {
        const config = result.data;

        set({
          config,
          loading: false,
          error: null,
          collectionAddress: config.collectionAddress || null,
          candyMachineAddress: config.address || null,
          totalMinted: config.totalProcessed || 0,
          totalSupply: config.itemsAvailable || 0,
        });
      } else {
        throw new Error(
          result.message || "Failed to fetch candy machine config"
        );
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch candy machine config:", error);

      set({
        loading: false,
        error: error.message || "Unknown error",
        config: null,
        collectionAddress: null,
        candyMachineAddress: null,
        totalMinted: 0,
        totalSupply: 0,
      });
    }
  },

  refreshStats: async (address?: string) => {
    const state = get();
    const targetAddress = address || state.candyMachineAddress;

    if (!targetAddress) {
      console.warn("No candy machine address available for stats refresh");
      return;
    }

    try {
      const result = await ConfigService.getCandyMachineConfig(targetAddress);

      if (result.success && result.data) {
        const totalProcessed = result.data.totalProcessed || 0;
        const totalSupply = result.data.itemsAvailable || 0;

        set({
          totalMinted: totalProcessed,
          totalSupply: totalSupply,
        });
      }
    } catch (error) {
      console.error("⚠️ Failed to refresh stats:", error);
    }
  },

  setConfig: (config: CandyMachineConfig) => {
    set({
      config,
      collectionAddress: config.collectionAddress || null,
      candyMachineAddress: config.candyMachineAddress || config.address || null,
      totalMinted: config.totalProcessed || 0,
      totalSupply: config.itemsAvailable || 0,
      error: null,
    });
  },



  updateMintedCount: (newCount: number) => {
    set({ totalMinted: newCount });
  },

  incrementMinted: () => {
    const state = get();
    const newCount = state.totalMinted + 1;
    set({ totalMinted: newCount });
  },

  clearConfig: () => {
    set({
      config: null,
      loading: false,
      error: null,
      collectionAddress: null,
      candyMachineAddress: null,
      totalMinted: 0,
      totalSupply: 0,
    });
  },
});
