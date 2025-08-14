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
    USER: "/api/user",
    TRANSACTION: "/api/user/transaction",
    NFT: "/api/user/nft",
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
      console.log("🔗 Connecting wallet...", { walletAddress });

      const requestData: ConnectWalletRequest = {
        walletAddress,
      };

      const result = await this.post<User>(
        this.ENDPOINTS.CONNECT,
        requestData,
        false
      );

      console.log("Wallet connected successfully", result);
      return result;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  static async getUserInfo(walletAddress: string): Promise<ApiResponse<User>> {
    try {
      console.log("Fetching user info...", { walletAddress });

      const result = await this.get<User>(
        `${this.ENDPOINTS.USER}/${walletAddress}`,
        undefined,
        true
      );

      console.log("User info fetched:", result);
      return result;
    } catch (error) {
      console.error("Failed to get user info:", error);
      throw error;
    }
  }

  /**
   * 3. Lưu lịch sử giao dịch - POST /api/user/transaction
   */
  static async saveTransaction(
    transactionData: SaveTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    try {
      console.log("💾 Saving transaction...", transactionData);

      const result = await this.post<Transaction>(
        this.ENDPOINTS.TRANSACTION,
        transactionData,
        true // Requires auth
      );

      console.log("✅ Transaction saved:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to save transaction:", error);
      throw error;
    }
  }

  /**
   * 5. Lấy lịch sử giao dịch - GET /api/user/{walletAddress}/transactions
   */
  static async getTransactions(
    walletAddress: string,
    params?: PaginationParams
  ): Promise<ApiResponse<Transaction[]>> {
    try {
      console.log("📜 Fetching transactions...", { walletAddress, params });

      const result = await this.get<Transaction[]>(
        `${this.ENDPOINTS.USER}/${walletAddress}/transactions`,
        params,
        true // Requires auth
      );

      console.log("✅ Transactions fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get transactions:", error);
      throw error;
    }
  }

  /**
   * 6. Lấy danh sách NFT - GET /api/user/{walletAddress}/nfts
   */
  static async getNfts(
    walletAddress: string,
    params?: PaginationParams
  ): Promise<ApiResponse<NFT[]>> {
    try {
      console.log("🖼️ Fetching NFTs...", { walletAddress, params });

      const result = await this.get<NFT[]>(
        `${this.ENDPOINTS.USER}/${walletAddress}/nfts`,
        params,
        true // Requires auth
      );

      console.log("✅ NFTs fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get NFTs:", error);
      throw error;
    }
  }

  /**
   * 7. Lấy thống kê tổng quan - GET /api/user/statistics/overview
   */
  static async getOverviewStatistics(): Promise<
    ApiResponse<OverviewStatistics>
  > {
    try {
      console.log("📊 Fetching overview statistics...");

      const result = await this.get<OverviewStatistics>(
        this.ENDPOINTS.OVERVIEW_STATISTICS,
        undefined,
        true // Requires auth
      );

      console.log("✅ Overview statistics fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get overview statistics:", error);
      throw error;
    }
  }

  static async getUserStatistics(
    walletAddress: string
  ): Promise<ApiResponse<UserStatistics>> {
    try {
      console.log("Fetching user statistics...", { walletAddress });

      const result = await this.get<UserStatistics>(
        `${this.ENDPOINTS.USER}/${walletAddress}/statistics`,
        undefined,
        true
      );

      console.log("✅ User statistics fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get user statistics:", error);
      throw error;
    }
  }

  /**
   * 9. Xóa lịch sử giao dịch - DELETE /api/user/{walletAddress}/transactions
   */
  static async deleteTransactions(
    walletAddress: string
  ): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      console.log("🗑️ Deleting transactions...", { walletAddress });

      const result = await this.delete<{ deletedCount: number }>(
        `${this.ENDPOINTS.USER}/${walletAddress}/transactions`,
        true // Requires auth
      );

      console.log("✅ Transactions deleted:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to delete transactions:", error);
      throw error;
    }
  }

  /**
   * 10. Lấy Solana balance của wallet - GET /api/user/balance
   */
  static async getWalletBalance(): Promise<ApiResponse<any>> {
    try {
      console.log("💰 Fetching wallet balance...");

      const result = await this.get<any>(
        this.ENDPOINTS.BALANCE,
        undefined,
        true // Requires auth
      );

      console.log("✅ Wallet balance fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get wallet balance:", error);
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
