import { AuthService } from './authService';
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
} from './types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:4444';

/**
 * User Service Class - Handles all User Controller APIs
 */
export class UserService {
  /**
   * 1. Kết nối ví (Public) - POST /api/user/connect
   */
  static async connectWallet(
    walletAddress: string
  ): Promise<ApiResponse<User>> {
    try {
      console.log('🔗 Connecting wallet...', { walletAddress });

      const response = await fetch(`${API_BASE_URL}/api/user/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
        } as ConnectWalletRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Wallet connected successfully', data);
      return data;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  /**
   * 2. Lấy thông tin người dùng - GET /api/user/{walletAddress}
   */
  static async getUserInfo(walletAddress: string): Promise<ApiResponse<User>> {
    try {
      console.log('👤 Fetching user info...', { walletAddress });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get(`/api/user/${walletAddress}`);

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
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
      console.log('💾 Saving transaction...', transactionData);

      const client = AuthService.createAuthorizedClient();
      const response = await client.post('/api/user/transaction', transactionData);

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 4. Lưu thông tin NFT (Public) - POST /api/user/nft
   */
  static async saveNft(nftData: SaveNftRequest): Promise<ApiResponse<NFT>> {
    try {
      console.log('🖼️ Saving NFT info...', nftData);

      const response = await fetch(`${API_BASE_URL}/api/user/nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Failed to save NFT info:', error);
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
      console.log('📜 Fetching transactions...', { walletAddress, params });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get(`/api/user/${walletAddress}/transactions`, {
        params,
      });

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
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
      console.log('🖼️ Fetching NFTs...', { walletAddress, params });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get(`/api/user/${walletAddress}/nfts`, {
        params,
      });

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 7. Lấy thống kê tổng quan - GET /api/user/statistics/overview
   */
  static async getOverviewStatistics(): Promise<ApiResponse<OverviewStatistics>> {
    try {
      console.log('📊 Fetching overview statistics...');

      const client = AuthService.createAuthorizedClient();
      const response = await client.get('/api/user/statistics/overview');

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 8. Lấy thống kê người dùng - GET /api/user/{walletAddress}/statistics
   */
  static async getUserStatistics(
    walletAddress: string
  ): Promise<ApiResponse<UserStatistics>> {
    try {
      console.log('📈 Fetching user statistics...', { walletAddress });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get(`/api/user/${walletAddress}/statistics`);

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
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
      console.log('🗑️ Deleting transactions...', { walletAddress });

      const client = AuthService.createAuthorizedClient();
      const response = await client.delete(`/api/user/${walletAddress}/transactions`);

      return response.data;
    } catch (error) {
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * Get API configuration
   */
  static getConfig() {
    return {
      baseURL: API_BASE_URL,
      endpoints: {
        connect: '/api/user/connect',
        user: '/api/user',
        transaction: '/api/user/transaction',
        nft: '/api/user/nft',
        statistics: '/api/user/statistics',
      },
    };
  }
}

export default UserService;