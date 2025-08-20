import { create } from "zustand";
import type { CandyMachineState } from "./types";
import { createConfigActions } from "./actions";
export const useConfigStore = create<CandyMachineState>((set, get) => ({
  // Initial state
  config: null,
  loading: false,
  error: null,

  // Computed values
  collectionAddress: null,
  candyMachineAddress: null,
  totalMinted: 0,
  totalSupply: 0,

  // Actions
  ...createConfigActions(set, get),
}));

// Stable selectors to prevent infinite loops
const selectConfig = (state: CandyMachineState) => state.config;
const selectLoading = (state: CandyMachineState) => state.loading;
const selectError = (state: CandyMachineState) => state.error;
const selectCollectionAddress = (state: CandyMachineState) =>
  state.collectionAddress;
const selectCandyMachineAddress = (state: CandyMachineState) =>
  state.candyMachineAddress;

// Memoized selector for mint stats to prevent infinite re-renders
let lastMintedCount = 0;
let lastSupplyCount = 0;
let cachedMintStats = { minted: 0, supply: 0 };

const selectMintStats = (state: CandyMachineState) => {
  if (
    state.totalMinted !== lastMintedCount ||
    state.totalSupply !== lastSupplyCount
  ) {
    lastMintedCount = state.totalMinted;
    lastSupplyCount = state.totalSupply;
    cachedMintStats = {
      minted: state.totalMinted,
      supply: state.totalSupply,
    };
  }
  return cachedMintStats;
};

// Stable selector for actions
const selectActions = (state: CandyMachineState) => state;

// Selectors for easier access
export const useConfig = () => useConfigStore(selectConfig);
export const useConfigLoading = () => useConfigStore(selectLoading);
export const useConfigError = () => useConfigStore(selectError);
export const useCollectionAddress = () =>
  useConfigStore(selectCollectionAddress);

export const useMintStats = () => useConfigStore(selectMintStats);

// Individual action hooks to prevent re-renders
export const useFetchConfig = () =>
  useConfigStore((state) => state.fetchConfig);
export const useRefreshStats = () =>
  useConfigStore((state) => state.refreshStats);
export const useSetConfig = () => useConfigStore((state) => state.setConfig);
export const useUpdateMintedCount = () =>
  useConfigStore((state) => state.updateMintedCount);
export const useIncrementMinted = () =>
  useConfigStore((state) => state.incrementMinted);
export const useClearConfig = () =>
  useConfigStore((state) => state.clearConfig);

// Legacy hook for backward compatibility - use individual hooks instead
export const useConfigActions = () => {
  console.warn("useConfigActions is deprecated, use individual hooks instead");
  return {
    fetchConfig: useFetchConfig(),
    refreshStats: useRefreshStats(),
    setConfig: useSetConfig(),
    updateMintedCount: useUpdateMintedCount(),
    incrementMinted: useIncrementMinted(),
    clearConfig: useClearConfig(),
  };
};
