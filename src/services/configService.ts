import type {
  ApiResponse,
  CandyMachineConfig,
} from './types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URI || 'https://belpy-core.blockifyy.com';

/**
 * Config Service Class - Handles Config Controller APIs according to documentation
 * Note: All Config APIs are PUBLIC (no JWT required)
 */
export class ConfigService {
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

      const url = new URL('/api/config/candy-machine', API_BASE_URL);
      if (address) {
        url.searchParams.set('address', address);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Config fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to get candy machine config:', error);
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
        candyMachine: '/api/config/candy-machine',
      },
    };
  }
}

export default ConfigService;