import { UserService, AuthService } from "@/services";

export class AuthenticationService {
  static async authenticateWallet(
    walletAddress: string,
    forceBalanceRefresh: boolean = false,
    isAuthenticating: boolean,
    setIsAuthenticating: (value: boolean) => void,
    setAuthToken: (value: string | null) => void,
    refreshSolBalance: () => Promise<void>
  ): Promise<boolean> {
    if (isAuthenticating) {
      console.log("Authentication already in progress, skipping...");
      return false;
    }

    const existingToken = AuthService.getToken();

    // Check if existing token is valid AND matches current wallet address
    if (existingToken && AuthService.isTokenValid()) {
      // Verify token belongs to current wallet address
      const tokenValid = await this.verifyTokenMatchesAddress(
        existingToken,
        walletAddress
      );

      if (tokenValid) {
        console.log(
          "Valid token already exists for current address, skipping authentication"
        );
        setAuthToken(existingToken);

        if (forceBalanceRefresh) {
          console.log("Force refreshing balance for existing token...");
          await refreshSolBalance();
        }

        return true;
      } else {
        console.log(
          "Token exists but doesn't match current address, clearing and re-authenticating..."
        );
        AuthService.removeToken();
        setAuthToken(null);
      }
    }

    try {
      setIsAuthenticating(true);
      console.log("🔐 Authenticating wallet with backend:", walletAddress);

      const connectResult = await UserService.connectWallet(walletAddress);

      if (connectResult.success && (connectResult as any).data?.accessToken) {
        const token = (connectResult as any).data.accessToken;
        AuthService.setToken(token);
        setAuthToken(token);
        console.log("✅ Authentication successful, token saved");

        await refreshSolBalance();
        window.dispatchEvent(new CustomEvent("wallet:connected"));

        return true;
      } else {
        console.error("❌ Authentication failed:", connectResult.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Authentication error:", error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }

  /**
   * Verify if the JWT token belongs to the given wallet address
   */
  private static async verifyTokenMatchesAddress(
    token: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      // Decode JWT payload to extract wallet address
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.warn("Invalid JWT token format");
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const tokenWalletAddress =
        payload.walletAddress || payload.address || payload.wallet;

      if (!tokenWalletAddress) {
        console.warn("No wallet address found in token payload");
        return false;
      }

      const matches =
        tokenWalletAddress.toLowerCase() === walletAddress.toLowerCase();
      console.log("Token address validation:", {
        tokenWalletAddress,
        walletAddress,
        matches,
      });

      return matches;
    } catch (error) {
      console.error("Error verifying token address:", error);
      return false;
    }
  }
}
