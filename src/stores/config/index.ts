// Main store exports
export { useConfigStore } from "./useConfigStore";

// Selector hooks
export {
  useConfig,
  useConfigLoading,
  useConfigError,
  useCollectionAddress,
  useMintStats,
  // Individual action hooks
  useFetchConfig,
  useRefreshStats,
  useSetConfig,
  useUpdateMintedCount,
  useIncrementMinted,
  useClearConfig,
  // Legacy hook (deprecated)
  useConfigActions,
} from "./useConfigStore";

// Types
export type { CandyMachineConfig, CandyMachineState } from "./types";

// Actions (for direct usage if needed)
export { createConfigActions } from "./actions";
