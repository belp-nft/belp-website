import { BaseService } from './baseService';
import type {
  ApiResponse,
  CandyMachineConfig,
} from './types';

/**
 * Config Service Class - Handles Config Controller APIs according to documentation
 * Note: All Config APIs are PUBLIC (no JWT required)
 */
export class ConfigService extends BaseService {
  private static readonly ENDPOINTS = {
    CANDY_MACHINE: '/api/config/candy-machine',
  };

  /**
   * 1. Lấy cấu hình candy machine (Public) - GET /api/config/candy-machine
   * 
   * Mô tả: Lấy cấu hình candy machine hiện tại hoặc theo địa chỉ
   * Headers: Content-Type: application/json (NO JWT REQUIRED)
   * Query Parameters: address (string, optional) - Địa chỉ candy machine cụ thể
   */
  static async getCandyMachineConfig(
    address?: string
  ): Promise<ApiResponse<CandyMachineConfig>> {
    try {
      console.log('⚙️ Fetching candy machine config...', { address });

      const params = address ? { address } : undefined;
      
      const result = await this.get<CandyMachineConfig>(
        this.ENDPOINTS.CANDY_MACHINE,
        params,
        false // Public API - không cần auth
      );

      console.log('✅ Config fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to get candy machine config:', error);
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

export default ConfigService;