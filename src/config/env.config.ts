/**
 * Environment Configuration
 * Tập trung quản lý tất cả các biến môi trường trong ứng dụng
 */

// Log để kiểm tra biến môi trường trong quá trình build và runtime
console.log("🔧 Environment Variables Check:");
console.log("- NEXT_PUBLIC_API_URI:", process.env.NEXT_PUBLIC_API_URI);
console.log("- NEXT_PUBLIC_SOLANA_RPC:", process.env.NEXT_PUBLIC_SOLANA_RPC);
console.log("- NODE_ENV:", process.env.NODE_ENV);

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
    process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",

  // Network type
  NETWORK: process.env.NODE_ENV === "production" ? "mainnet" : "devnet",
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",

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

  // Log cấu hình hiện tại
  console.log("✅ Environment Configuration Loaded:");
  console.log("- API Base URL:", API_CONFIG.BASE_URL);
  console.log("- Solana RPC:", BLOCKCHAIN_CONFIG.SOLANA_RPC);
  console.log("- Network:", BLOCKCHAIN_CONFIG.NETWORK);
  console.log("- Environment:", APP_CONFIG.NODE_ENV);
}

// Gọi validation khi import file này
validateEnvironmentVariables();

// Export default cho convenience
export default {
  API_CONFIG,
  BLOCKCHAIN_CONFIG,
  APP_CONFIG,
  validateEnvironmentVariables,
};
