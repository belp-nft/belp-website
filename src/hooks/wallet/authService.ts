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
    if (existingToken && AuthService.isTokenValid()) {
      console.log("Valid token already exists, skipping authentication");
      setAuthToken(existingToken);

      if (forceBalanceRefresh) {
        console.log("Force refreshing balance for existing token...");
        await refreshSolBalance();
      }

      return true;
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
}
