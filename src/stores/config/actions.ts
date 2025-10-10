import { ConfigService } from "@/services";
import type { CandyMachineConfig, CandyMachineState } from "./types";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";

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

        // Lấy stats trực tiếp từ Metaplex để đảm bảo chính xác ngay từ đầu
        let totalMinted = 0;
        let totalSupply = 0;
        try {
          const rpcEndpoint = config.rpcUrl || "https://api.devnet.solana.com";
          const umi = createUmi(rpcEndpoint).use(mplCandyMachine());
          const cm = await fetchCandyMachine(umi, umiPublicKey(config.address));
          totalMinted = Number(cm.itemsRedeemed || 0);
          totalSupply = Number(cm.itemsLoaded || 0);
        } catch (onChainErr) {
          console.warn(
            "⚠️ Fallback to API stats due to Metaplex fetch error:",
            onChainErr
          );
          totalMinted = config.totalProcessed || 0;
          totalSupply = config.itemsAvailable || 0;
        }

        set({
          config,
          loading: false,
          error: null,
          collectionAddress: config.collectionAddress || null,
          candyMachineAddress: config.address || null,
          totalMinted,
          totalSupply,
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
      const rpcEndpoint =
        state.config?.rpcUrl || "https://api.devnet.solana.com";
      const umi = createUmi(rpcEndpoint).use(mplCandyMachine());
      const cm = await fetchCandyMachine(umi, umiPublicKey(targetAddress));

      const totalProcessed = Number(cm.itemsRedeemed || 0);
      const totalSupply = Number(cm.itemsLoaded || 0);

      set({
        totalMinted: totalProcessed,
        totalSupply: totalSupply,
      });
    } catch (error) {
      console.error("⚠️ Failed to refresh stats from Metaplex:", error);
    }
  },

  setConfig: (config: CandyMachineConfig) => {
    set({
      config,
      collectionAddress: config.collectionAddress || null,
      candyMachineAddress: config.address || null,
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
