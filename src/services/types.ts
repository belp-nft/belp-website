// Common types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  total?: number;
}

// User related types
export interface User {
  _id: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
}

export interface ConnectWalletRequest {
  walletAddress: string;
}

export interface Transaction {
  _id: string;
  walletAddress: string;
  transactionSignature: string;
  candyMachineAddress: string;
  amount?: number;
  timestamp: string;
  createdAt: string;
}

export interface SaveTransactionRequest {
  walletAddress: string;
  transactionSignature: string;
  candyMachineAddress: string;
  amount?: number;
  timestamp?: string;
}

export interface NFT {
  _id: string;
  walletAddress: string;
  nftAddress: string;
  name: string;
  imageUrl: string;
  description?: string;
  attributes?: Record<string, any>;
  createdAt: string;
  userId?: string;
}

// Response types for getUserNfts API
export interface GetUserNftsResponse {
  success: boolean;
  count: number;
  nfts: NFT[];
}

// Response types for getNftDetails API
export interface GetNftDetailsResponse {
  success: boolean;
  nft: NFT;
}

export interface SaveNftRequest {
  walletAddress: string;
  nftAddress: string;
  name: string;
  imageUrl: string;
  description?: string;
  attributes?: Record<string, any>;
}

export interface UserStatistics {
  totalTransactions: number;
  totalNfts: number;
  totalSpent: number;
}

export interface OverviewStatistics {
  totalUsers: number;
  totalTransactions: number;
  totalNfts: number;
  totalVolume: number;
}

// NFT related types
export interface BuildMintTxRequest {
  candyMachineAddress: string;
  buyer: string;
}

export interface BuildMintTxResponse {
  unsignedTx: string;
  note?: string;
  // Alternative format
  success?: boolean;
  data?: {
    unsignedTx: string;
  };
  message?: string;
}

export interface SendSignedTxRequest {
  signedTx: string;
  walletAddress?: string;
  candyMachineAddress?: string;
}

export interface SendSignedTxResponse {
  success: boolean;
  nftAddress: string;
  message: string;
  signature?: string;
  error?: string;
}

export interface CandyMachineInfo {
  address: string;
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  goLiveDate: string;
  price: number;
  sellerFeeBasisPoints: number;
  symbol: string;
  maxSupply: number;
}

// Config related types - Only what's documented
export interface CandyMachineConfig {
  _id: string;
  address: string;
  collectionAddress: string;
  itemsAvailable: number;
  itemsLoaded: number;
  totalProcessed: number;
  network: string;
  metadata: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginationParams {
  limit?: number;
  skip?: number;
}

// Settings related types
export interface Setting {
  _id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsData {
  GENESIS_NFT_PRICE?: string;
  GENERAL_NFT_PRICE?: string;
  GENESIS_ROUND_STARTDATE?: string;
  GENESIS_ROUND_DAYS?: string;
}

export interface SettingsDataResponse {
  success: boolean;
  data: SettingsData;
  meta?: {
    isGenesisRoundActive: boolean;
  };
}

export interface SettingResponse {
  success: boolean;
  data: {
    key: string;
    value: string;
  };
}

export interface GenesisStatusResponse {
  success: boolean;
  data: {
    isActive: boolean;
    now: string;
  };
}

// NFT Pricing types
export interface NFTPricingResponse {
  success: boolean;
  data: {
    currentPrice: number;
    isGenesisRound: boolean;
    genesisPrice: number;
    generalPrice: number;
    genesisRound: {
      startDate: string;
      endDate: string;
      durationDays: number;
      isActive: boolean;
    };
    priceType: "genesis" | "general";
  };
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
}
