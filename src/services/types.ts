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
  success: boolean;
  unsignedTx: string;
  message?: string;
}

export interface SendSignedTxRequest {
  signedTx: string;
  walletAddress?: string;
  candyMachineAddress?: string;
}

export interface SendSignedTxResponse {
  success: boolean;
  transactionSignature: string;
  nftAddress: string;
  message: string;
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

// Config related types
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

export interface CreateConfigRequest {
  address: string;
  collectionAddress: string;
  itemsAvailable?: number;
  itemsLoaded?: number;
  totalProcessed?: number;
  network?: string;
  metadata?: Record<string, any>;
}

export interface ActivateConfigRequest {
  address: string;
}

// Pagination types
export interface PaginationParams {
  limit?: number;
  skip?: number;
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
}
