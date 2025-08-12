import { AuthService } from './authService';
import type {
  ApiResponse,
  CandyMachineConfig,
  CreateConfigRequest,
  ActivateConfigRequest,
} from './types';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URI || 'http://localhost:4444';

/**
 * Config Service Class - Handles all Config Controller APIs
 */
export class ConfigService {
  /**
   * 1. Lấy cấu hình candy machine - GET /api/config/candy-machine
   */
  static async getCandyMachineConfig(
    address?: string
  ): Promise<ApiResponse<CandyMachineConfig>> {
    try {
      console.log('⚙️ Fetching candy machine config...', { address });

      const client = AuthService.createAuthorizedClient();
      const response = await client.get('/api/config/candy-machine', {
        params: address ? { address } : undefined,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get candy machine config:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 2. Tạo/cập nhật cấu hình candy machine - POST /api/config/candy-machine
   */
  static async createOrUpdateConfig(
    configData: CreateConfigRequest
  ): Promise<ApiResponse<CandyMachineConfig>> {
    try {
      console.log('⚙️ Creating/updating candy machine config...', configData);

      const client = AuthService.createAuthorizedClient();
      const response = await client.post('/api/config/candy-machine', configData);

      return response.data;
    } catch (error) {
      console.error('Failed to create/update candy machine config:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * 3. Kích hoạt candy machine - POST /api/config/candy-machine/activate
   */
  static async activateCandyMachine(
    address: string
  ): Promise<ApiResponse<CandyMachineConfig>> {
    try {
      console.log('🚀 Activating candy machine...', { address });

      const client = AuthService.createAuthorizedClient();
      const response = await client.post('/api/config/candy-machine/activate', {
        address,
      } as ActivateConfigRequest);

      return response.data;
    } catch (error) {
      console.error('Failed to activate candy machine:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * Helper method để lấy danh sách tất cả candy machine configs
   */
  static async getAllConfigs(): Promise<ApiResponse<CandyMachineConfig[]>> {
    try {
      console.log('📋 Fetching all candy machine configs...');

      const client = AuthService.createAuthorizedClient();
      const response = await client.get('/api/config/candy-machine/all');

      return response.data;
    } catch (error) {
      console.error('Failed to get all configs:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * Helper method để xóa candy machine config
   */
  static async deleteConfig(address: string): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      console.log('🗑️ Deleting candy machine config...', { address });

      const client = AuthService.createAuthorizedClient();
      const response = await client.delete(`/api/config/candy-machine/${address}`);

      return response.data;
    } catch (error) {
      console.error('Failed to delete candy machine config:', error);
      AuthService.handleUnauthorized(error);
      throw error;
    }
  }

  /**
   * Helper method để check health của config API
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/api/config/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Config API health check failed:', error);
      return false;
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
        activate: '/api/config/candy-machine/activate',
        all: '/api/config/candy-machine/all',
      },
    };
  }
}

export default ConfigService;
