import { AuthService } from "@/services";

/**
 * API call utilities with authentication checks
 */
export class ApiCallHelper {
  /**
   * Check if we can make authenticated API calls
   */
  static canMakeAuthenticatedCall(): boolean {
    const token = AuthService.getToken();
    const isValid = AuthService.isTokenValid();

    if (!token) {
      console.warn("⚠️ No authentication token available");
      return false;
    }

    if (!isValid) {
      console.warn("⚠️ Authentication token is expired or invalid");
      AuthService.removeToken(); // Clean up invalid token
      return false;
    }

    return true;
  }

  /**
   * Wrapper for authenticated API calls with pre-check
   */
  static async executeWithAuthCheck<T>(
    apiCall: () => Promise<T>,
    operationName: string = "API call"
  ): Promise<T | null> {
    if (!this.canMakeAuthenticatedCall()) {
      console.warn(`⚠️ Skipping ${operationName} - authentication not ready`);
      return null;
    }

    try {
      console.log(`🔐 Executing authenticated ${operationName}...`);
      return await apiCall();
    } catch (error: any) {
      // Handle authentication errors
      if (
        error.response?.status === 401 ||
        error.message?.includes("Unauthorized") ||
        error.message?.includes("401")
      ) {
        console.warn(
          `❌ Authentication error in ${operationName}, clearing token`
        );
        AuthService.removeToken();
        return null;
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Check authentication status and log details
   */
  static logAuthStatus(): void {
    const token = AuthService.getToken();
    const isValid = AuthService.isTokenValid();

    console.log("🔍 Authentication Status:", {
      hasToken: !!token,
      isValid: isValid,
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString(),
    });

    if (token && !isValid) {
      console.warn("🚨 Token exists but is invalid/expired");
    }
  }
}
