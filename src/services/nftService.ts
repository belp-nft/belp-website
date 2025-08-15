import { BaseService } from "./baseService";
import type {
  ApiResponse,
  BuildMintTxRequest,
  BuildMintTxResponse,
  SendSignedTxRequest,
  SendSignedTxResponse,
  CandyMachineInfo,
  GetUserNftsResponse,
  GetNftDetailsResponse,
  NFTPricingResponse,
} from "./types";

/**
 * NFT Service Class - Handles all NFT Controller APIs according to documentation
 */
export class NftService extends BaseService {
  private static readonly ENDPOINTS = {
    PRICING: "/nft/pricing",
    BUILD_MINT_TX: "/nft/build-mint-tx",
    SEND_SIGNED_TX: "/nft/send-signed-tx",
    INFO: "/nft/info",
    USER_NFTS: "/nft/user",
    NFT_DETAILS: "/nft/details",
  };

  /**
   * 1. Lấy thông tin giá NFT hiện tại - GET /nft/pricing
   */
  static async getCurrentPricing(): Promise<NFTPricingResponse> {
    try {
      console.log("💰 Fetching current NFT pricing...");

      const response = await this.get<NFTPricingResponse['data']>(
        this.ENDPOINTS.PRICING,
        {},
        true // Requires auth
      );

      console.log("✅ NFT pricing API response:", response);

      // Return the wrapped response
      return {
        success: response.success || true,
        data: response.data || response as any
      };
    } catch (error) {
      console.error("❌ Failed to get NFT pricing:", error);
      throw error;
    }
  }

  /**
   * 2. Build mint transaction với payment - POST /nft/build-mint-tx
   */
  static async buildMintTransaction(
    candyMachineAddress: string,
    buyerPublicKey: string
  ): Promise<BuildMintTxResponse> {
    try {
      console.log("Building mint transaction...", {
        candyMachineAddress,
        buyerPublicKey,
      });

      const requestData: BuildMintTxRequest = {
        candyMachineAddress,
        buyer: buyerPublicKey,
      };

      const response = await this.post<BuildMintTxResponse>(
        this.ENDPOINTS.BUILD_MINT_TX,
        requestData,
        true // Requires auth
      );

      console.log("🎯 Build mint transaction response:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the BuildMintTxResponse
      return response as unknown as BuildMintTxResponse;
    } catch (error) {
      console.error("❌ Failed to build mint transaction:", error);
      throw error;
    }
  }

  /**
   * 3. Gửi signed transaction - POST /nft/send-signed-tx
   */
  static async sendSignedTransaction(
    signedTxBase64: string,
    walletAddress?: string,
    candyMachineAddress?: string
  ): Promise<SendSignedTxResponse> {
    try {
      console.log("Sending signed transaction...");
      console.log("Signed transaction length:", signedTxBase64.length);

      const requestData: SendSignedTxRequest = {
        signedTx: signedTxBase64,
        walletAddress,
        candyMachineAddress,
      };

      console.log("📦 Request data being sent:", requestData);

      const response = await this.post<SendSignedTxResponse>(
        this.ENDPOINTS.SEND_SIGNED_TX,
        requestData,
        true // Requires auth
      );

      console.log("✅ Send transaction response:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the SendSignedTxResponse
      return response as unknown as SendSignedTxResponse;
    } catch (error) {
      console.error("❌ Failed to send signed transaction:", error);
      throw error;
    }
  }

  /**
   * 4. Lấy thông tin candy machine - GET /nft/info
   */
  static async getCandyMachineInfo(
    candyMachineAddress: string
  ): Promise<ApiResponse<CandyMachineInfo>> {
    try {
      console.log("📊 Fetching candy machine info...", { candyMachineAddress });

      const result = await this.get<CandyMachineInfo>(
        this.ENDPOINTS.INFO,
        { cm: candyMachineAddress },
        true // Requires auth
      );

      console.log("✅ Candy machine info fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get candy machine info:", error);
      throw error;
    }
  }

  /**
   * 5. Lấy danh sách NFTs của user - GET /nft/user/:walletAddress/nfts
   */
  static async getUserNfts(
    walletAddress: string
  ): Promise<GetUserNftsResponse> {
    try {
      console.log("📊 Fetching user NFTs...", { walletAddress });

      const response = await this.get<GetUserNftsResponse>(
        `${this.ENDPOINTS.USER_NFTS}/${walletAddress}/nfts`,
        {},
        true // Requires auth
      );

      console.log("✅ User NFTs fetched:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the GetUserNftsResponse
      return response as unknown as GetUserNftsResponse;
    } catch (error) {
      console.error("❌ Failed to get user NFTs:", error);
      throw error;
    }
  }

  /**
   * 6. Lấy chi tiết NFT - GET /nft/details/:nftAddress
   */
  static async getNftDetails(
    nftAddress: string
  ): Promise<GetNftDetailsResponse> {
    try {
      console.log("📊 Fetching NFT details...", { nftAddress });

      const response = await this.get<GetNftDetailsResponse>(
        `${this.ENDPOINTS.NFT_DETAILS}/${nftAddress}`,
        {},
        true // Requires auth
      );

      console.log("✅ NFT details fetched:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the GetNftDetailsResponse
      return response as unknown as GetNftDetailsResponse;
    } catch (error) {
      console.error("❌ Failed to get NFT details:", error);
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

// Export default instance
export default NftService;
