import { ConfigService } from "@/services";
import type { CandyMachineConfig, CandyMachineState } from "./types";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine, fetchCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";
import { BLOCKCHAIN_CONFIG } from "@/config/env.config";

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

        // Đồng bộ số liệu trực tiếp từ Metaplex sau khi có địa chỉ
        try {
          await (get().refreshStats?.(config.address));
        } catch (e) {
          // Silent fallback, keep backend values if chain fetch fails
        }
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
      // Lấy số liệu trực tiếp từ Metaplex (on-chain)
      const rpcEndpoint = BLOCKCHAIN_CONFIG.SOLANA_RPC;
      const umi = createUmi(rpcEndpoint).use(mplCandyMachine());
      const cm = await fetchCandyMachine(umi, umiPublicKey(targetAddress));

      const itemsLoaded = Number(cm.itemsLoaded || 0);
      const itemsRedeemed = Number(cm.itemsRedeemed || 0);

      set({
        totalMinted: itemsRedeemed,
        totalSupply: itemsLoaded,
      });
    } catch (error) {
      console.error("⚠️ Failed to refresh stats:", error);
      // Fallback: giữ nguyên số liệu cũ nếu lỗi
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
