// Export all types
export * from "./types";

// Re-export specific classes for convenience
export { UserService } from "./userService";
export { NftService } from "./nftService";
export { ConfigService } from "./configService";
export { AuthService } from "./authService";

// Configuration constants
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URI || "http://localhost:4444",
  TIMEOUT: 30000,
  ENDPOINTS: {
    USER: "/api/user",
    NFT: "/nft",
    CONFIG: "/api/config",
  },
} as const;
