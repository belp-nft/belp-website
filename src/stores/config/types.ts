export interface CandyMachineConfig {
  address: string;
  collectionAddress?: string;
  totalProcessed?: number;
  itemsAvailable?: number;
  authority?: string;
  symbol?: string;
  sellerFeeBasisPoints?: number;
  maxSupply?: number;
  isMutable?: boolean;
  retainAuthority?: boolean;
  goLiveDate?: string;
  endSettings?: any;
  hiddenSettings?: any;
  whitelistMintSettings?: any;
  gatekeeper?: any;
  price?: number;
}

export interface CandyMachineState {
  // Config data
  config: CandyMachineConfig | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Computed values
  collectionAddress: string | null;
  candyMachineAddress: string | null;
  totalMinted: number;
  totalSupply: number;

  // Actions
  fetchConfig: (address?: string) => Promise<void>;
  refreshStats: (address?: string) => Promise<void>;
  setConfig: (config: CandyMachineConfig) => void;
  updateMintedCount: (newCount: number) => void;
  incrementMinted: () => void;
  clearConfig: () => void;
}
