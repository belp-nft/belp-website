/**
 * Environment Configuration
 * Tập trung quản lý tất cả các biến môi trường trong ứng dụng
 */

// Log để kiểm tra biến môi trường trong quá trình build và runtime

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Base URL cho API backend
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URI || "https://belpy-core.blockifyy.com",

  // Timeout cho các request API (30 giây)
  TIMEOUT: 30000,

  // API Endpoints
  ENDPOINTS: {
    USER: "/api/user",
    NFT: "/nft",
    CONFIG: "/api/config",
  },
} as const;

/**
 * Blockchain Configuration
 */
export const BLOCKCHAIN_CONFIG = {
  // Solana RPC endpoint
  SOLANA_RPC:
    process.env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com",

  // Network type
  NETWORK:
    process.env.NEXT_PUBLIC_NODE_ENV === "development" ? "devnet" : "mainnet",
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // Environment
  NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || "development",

  // Local Storage Keys
  STORAGE_KEYS: {
    JWT_TOKEN: "belp_jwt_token",
  },
} as const;

/**
 * Validation function để kiểm tra các biến môi trường bắt buộc
 */
export function validateEnvironmentVariables() {
  const requiredVars = ["NEXT_PUBLIC_API_URI"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn("⚠️ Missing environment variables:", missingVars);
  }
}

// Gọi validation khi import file này
validateEnvironmentVariables();

// Export default cho convenience
export default {
  API_CONFIG,
  APP_CONFIG,
  validateEnvironmentVariables,
};
