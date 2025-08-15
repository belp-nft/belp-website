import { BaseService } from "./baseService";
import type {
  ApiResponse,
  SettingsData,
  SettingsDataResponse,
  SettingResponse,
  GenesisStatusResponse,
  Setting,
} from "./types";

/**
 * Settings Service Class - Handles all Settings Controller APIs according to documentation
 */
export class SettingService extends BaseService {
  private static readonly ENDPOINTS = {
    GET_ALL_SETTINGS: "/settings",
    GET_SETTINGS_DATA: "/settings/data",
    GET_SETTING: "/settings",
    GET_GENESIS_STATUS: "/settings/genesis/status",
  };

  /**
   * 1. Lấy tất cả settings - GET /settings
   */
  static async getAllSettings(): Promise<ApiResponse<Setting[]>> {
    try {
      // console.log("📊 Fetching all settings...");

      const result = await this.get<Setting[]>(
        this.ENDPOINTS.GET_ALL_SETTINGS,
        {},
        true // Requires auth
      );

      // console.log("✅ All settings fetched:", result);
      return result;
    } catch (error) {
      console.error("❌ Failed to get all settings:", error);
      throw error;
    }
  }

  /**
   * 2. Lấy settings theo format data - GET /settings/data
   */
  static async getSettingsData(): Promise<SettingsDataResponse> {
    try {
      // console.log("📊 Fetching settings data...");

      const response = await this.get<SettingsDataResponse>(
        this.ENDPOINTS.GET_SETTINGS_DATA,
        {},
        true // Requires auth
      );

      // console.log("✅ Settings data fetched:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the SettingsDataResponse
      return response as unknown as SettingsDataResponse;
    } catch (error) {
      console.error("❌ Failed to get settings data:", error);
      throw error;
    }
  }

  /**
   * 3. Lấy setting cụ thể - GET /settings/{key}
   */
  static async getSetting(key: string): Promise<SettingResponse> {
    try {
      // console.log("📊 Fetching setting...", { key });

      const response = await this.get<SettingResponse>(
        `${this.ENDPOINTS.GET_SETTING}/${key}`,
        {},
        true // Requires auth
      );

      // console.log("✅ Setting fetched:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the SettingResponse
      return response as unknown as SettingResponse;
    } catch (error) {
      console.error("❌ Failed to get setting:", error);
      throw error;
    }
  }

  /**
   * 4. Kiểm tra trạng thái Genesis Round - GET /settings/genesis/status
   */
  static async getGenesisStatus(): Promise<GenesisStatusResponse> {
    try {
      // console.log("📊 Fetching Genesis status...");

      const response = await this.get<GenesisStatusResponse>(
        this.ENDPOINTS.GET_GENESIS_STATUS,
        {},
        true // Requires auth
      );

      // console.log("✅ Genesis status fetched:", response);

      // Return the data from ApiResponse wrapper
      if (response.data) {
        return response.data;
      }

      // Handle case where response.data might be directly the GenesisStatusResponse
      return response as unknown as GenesisStatusResponse;
    } catch (error) {
      console.error("❌ Failed to get Genesis status:", error);
      throw error;
    }
  }

  /**
   * Helper method to get current NFT price based on Genesis status
   */
  static async getCurrentNftPrice(): Promise<{
    price: number;
    priceType: "genesis" | "general";
    isGenesisActive: boolean;
  }> {
    try {
      const [settingsData, genesisStatus] = await Promise.all([
        this.getSettingsData(),
        this.getGenesisStatus(),
      ]);

      const isGenesisActive = genesisStatus.data?.isActive ?? false;
      const price = isGenesisActive
        ? parseFloat(settingsData.data?.GENESIS_NFT_PRICE || "0")
        : parseFloat(settingsData.data?.GENERAL_NFT_PRICE || "0");

      return {
        price,
        priceType: isGenesisActive ? "genesis" : "general",
        isGenesisActive,
      };
    } catch (error) {
      console.error("❌ Failed to get current NFT price:", error);
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
export default SettingService;
