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

// Memoized selector for actions to prevent infinite re-renders
let cachedActions: any = null;

const selectActions = (state: CandyMachineState) => {
  if (!cachedActions) {
    cachedActions = {
      fetchConfig: state.fetchConfig,
      refreshStats: state.refreshStats,
      setConfig: state.setConfig,
      updateMintedCount: state.updateMintedCount,
      incrementMinted: state.incrementMinted,
      clearConfig: state.clearConfig,
    };
  }
  return cachedActions;
};

// Selectors for easier access
export const useConfig = () => useConfigStore(selectConfig);
export const useConfigLoading = () => useConfigStore(selectLoading);
export const useConfigError = () => useConfigStore(selectError);
export const useCollectionAddress = () =>
  useConfigStore(selectCollectionAddress);
export const useCandyMachineAddress = () =>
  useConfigStore(selectCandyMachineAddress);
export const useMintStats = () => useConfigStore(selectMintStats);

// Action hooks for easier access
export const useConfigActions = () => useConfigStore(selectActions);
