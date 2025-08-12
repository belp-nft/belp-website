import { AuthService } from './authService';
import type {
  ApiResponse,
  BuildMintTxRequest,
  BuildMintTxResponse,
  SendSignedTxRequest,
  SendSignedTxResponse,
  CandyMachineInfo,
} from './types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:4444';
const NFT_ENDPOINT = '/nft';

/**
 * NFT Service Class - Handles all NFT Controller APIs according to documentation
 */
export class NftService {
  /**
   * 1. Tạo giao dịch mint chưa ký - POST /nft/build-mint-tx
   */
  static async buildMintTransaction(
    candyMachineAddress: string,
    buyerPublicKey: string
  ): Promise<BuildMintTxResponse> {
    try {
      console.log('📝 Building mint transaction...', {
        candyMachineAddress,
        buyerPublicKey,
      });

      const client = AuthService.createAuthorizedClient();
      const response = await client.post(
        `${NFT_ENDPOINT}/build-mint-tx`,
        {
          candyMachineAddress,
          buyer: buyerPublicKey,
        } as BuildMintTxRequest
      );

      console.log('🎯 Build mint transaction response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Failed to build mint transaction:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 2. Gửi giao dịch đã ký - POST /nft/send-signed-tx
   */
  static async sendSignedTransaction(
    signedTxBase64: string,
    walletAddress?: string,
    candyMachineAddress?: string
  ): Promise<SendSignedTxResponse> {
    try {
      console.log('📤 Sending signed transaction...');
      console.log('🔍 Signed transaction length:', signedTxBase64.length);

      const payload: SendSignedTxRequest = {
        signedTx: signedTxBase64,
        walletAddress,
        candyMachineAddress,
      };

      console.log('📦 Payload being sent:', payload);

      const client = AuthService.createAuthorizedClient();
      const response = await client.post(
        `${NFT_ENDPOINT}/send-signed-tx`,
        payload
      );

      console.log('✅ Send transaction response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Failed to send signed transaction:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 3. Lấy thông tin candy machine - GET /nft/info
   */
  static async getCandyMachineInfo(
    candyMachineAddress: string
  ): Promise<ApiResponse<CandyMachineInfo>> {
    try {
      console.log('📊 Fetching candy machine info...', { candyMachineAddress });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get(
        `${NFT_ENDPOINT}/info`,
        {
          params: {
            cm: candyMachineAddress,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get candy machine info:', error);
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
      endpoint: NFT_ENDPOINT,
      endpoints: {
        buildMintTx: '/nft/build-mint-tx',
        sendSignedTx: '/nft/send-signed-tx',
        info: '/nft/info',
      },
    };
  }
}

// Export default instance
export default NftService;