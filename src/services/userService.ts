import { BaseService } from "./baseService";
import type {
  ApiResponse,
  User,
  ConnectWalletRequest,
  Transaction,
  SaveTransactionRequest,
  NFT,
  SaveNftRequest,
  UserStatistics,
  OverviewStatistics,
  PaginationParams,
} from "./types";

/**
 * User Service Class - Handles all User Controller APIs
 */
export class UserService extends BaseService {
  private static readonly ENDPOINTS = {
    CONNECT: "/api/user/connect",
    INFO: "/api/user/info",
    TRANSACTION: "/api/user/transaction",
    TRANSACTIONS: "/api/user/transactions",
    NFT: "/api/user/nft",
    NFTS: "/api/user/nfts",
    STATISTICS: "/api/user/statistics",
    OVERVIEW_STATISTICS: "/api/user/statistics/overview",
    BALANCE: "/api/user/balance",
  };
  /**
   * 1. Kết nối ví (Public) - POST /api/user/connect
   */
  static async connectWallet(
    walletAddress: string
  ): Promise<ApiResponse<User>> {
    try {
      // console.log("🔗 Connecting wallet...", { walletAddress });

      const requestData: ConnectWalletRequest = {
        walletAddress,
      };

      const result = await this.post<User>(
        this.ENDPOINTS.CONNECT,
        requestData,
        false
      );

      // console.log("Wallet connected successfully", result);
      return result;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * 2. Lấy thông tin user - GET /api/user/info
   */
  static async getUserInfo(): Promise<ApiResponse<User>> {
    try {
      // console.log("👤 Fetching user info...");

      const result = await this.get<User>(
        this.ENDPOINTS.INFO,
        undefined,
        true
      );

      // console.log("✅ User info fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get user info:", error);
      throw error;
    }
  }

  /**
   * 3. Lấy Solana balance của wallet - GET /api/user/balance
   */
  static async getWalletBalance(): Promise<ApiResponse<any>> {
    try {
      // console.log("💰 Fetching wallet balance...");

      const result = await this.get<any>(
        this.ENDPOINTS.BALANCE,
        undefined,
        true // Requires auth
      );

      // console.log("✅ Wallet balance fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get wallet balance:", error);
      throw error;
    }
  }

  /**
   * 4. Lưu lịch sử giao dịch - POST /api/user/transaction
   */
  static async saveTransaction(
    transactionData: SaveTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    try {
      // console.log("💾 Saving transaction...", transactionData);

      const result = await this.post<Transaction>(
        this.ENDPOINTS.TRANSACTION,
        transactionData,
        true // Requires auth
      );

      // console.log("✅ Transaction saved:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to save transaction:", error);
      throw error;
    }
  }

  /**
   * 5. Lưu thông tin NFT - POST /api/user/nft
   */
  static async saveNft(
    nftData: SaveNftRequest
  ): Promise<ApiResponse<NFT>> {
    try {
      // console.log("🖼️ Saving NFT...", nftData);

      const result = await this.post<NFT>(
        this.ENDPOINTS.NFT,
        nftData,
        true // Requires auth
      );

      // console.log("✅ NFT saved:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to save NFT:", error);
      throw error;
    }
  }

  /**
   * 6. Lấy lịch sử giao dịch - GET /api/user/transactions
   */
  static async getTransactions(
    params?: PaginationParams
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      // console.log("📜 Fetching transactions...", { params });

      const result = await this.get<Transaction[]>(
        this.ENDPOINTS.TRANSACTIONS,
        params,
        true // Requires auth
      );

      // console.log("✅ Transactions fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get transactions:", error);
      throw error;
    }
  }

  /**
   * 7. Lấy danh sách NFT - GET /api/user/nfts
   */
  static async getNfts(
    params?: PaginationParams
  ): Promise<ApiResponse<NFT[]>> {
    try {
      // console.log("🖼️ Fetching NFTs...", { params });

      const result = await this.get<NFT[]>(
        this.ENDPOINTS.NFTS,
        params,
        true // Requires auth
      );

      // console.log("✅ NFTs fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get NFTs:", error);
      throw error;
    }
  }

  /**
   * 8. Lấy thống kê tổng quan - GET /api/user/statistics/overview
   */
  static async getOverviewStatistics(): Promise<
    ApiResponse<OverviewStatistics>
  > {
    try {
      // console.log("📊 Fetching overview statistics...");

      const result = await this.get<OverviewStatistics>(
        this.ENDPOINTS.OVERVIEW_STATISTICS,
        undefined,
        true // Requires auth
      );

      // console.log("✅ Overview statistics fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get overview statistics:", error);
      throw error;
    }
  }

  /**
   * 9. Lấy thống kê user - GET /api/user/statistics
   */
  static async getUserStatistics(): Promise<ApiResponse<UserStatistics>> {
    try {
      // console.log("📈 Fetching user statistics...");

      const result = await this.get<UserStatistics>(
        this.ENDPOINTS.STATISTICS,
        undefined,
        true
      );

      // console.log("✅ User statistics fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get user statistics:", error);
      throw error;
    }
  }

  /**
   * 10. Xóa lịch sử giao dịch - DELETE /api/user/transactions
   */
  static async deleteTransactions(): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      // console.log("🗑️ Deleting transactions...");

      const result = await this.delete<{ deletedCount: number }>(
        this.ENDPOINTS.TRANSACTIONS,
        true // Requires auth
      );

      // console.log("✅ Transactions deleted:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to delete transactions:", error);
      throw error;
    }
  }

  /**
   * Get service configuration
   */
  static getServiceConfig() {
    return {
      ...this.getConfig(),
      endpoints: this.ENDPOINTS,
    };
  }
}

export default UserService;
