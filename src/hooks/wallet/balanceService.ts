import { UserService } from "@/services";

let globalBalanceLoading = false;
let globalLastBalanceLoad = 0;

export class BalanceService {
  private static balanceLoadingRef = { current: false };
  private static lastBalanceLoadRef = { current: 0 };

  static async refreshSolBalance(
    forceRefresh = false,
    setSolLamports: (value: number) => void,
    setLoading: (loading: any) => void
  ): Promise<void> {
    if (globalBalanceLoading || this.balanceLoadingRef.current) {
      console.log(
        "💰 Balance already loading globally, skipping duplicate call"
      );
      return;
    }

    const now = Date.now();
    const MIN_INTERVAL = 30000; // 30 seconds

    if (!forceRefresh && now - globalLastBalanceLoad < MIN_INTERVAL) {
      console.log(
        `💰 Balance called too recently globally, skipping (last call was ${Math.floor((now - globalLastBalanceLoad) / 1000)} seconds ago)`
      );
      return;
    }

    try {
      globalBalanceLoading = true;
      this.balanceLoadingRef.current = true;
      globalLastBalanceLoad = now;
      this.lastBalanceLoadRef.current = now;
      setLoading("sol-balance");

      console.log("💰 Using API to fetch wallet balance...");
      const balanceResult = await UserService.getWalletBalance();

      if (balanceResult.success && balanceResult.data) {
        const lamports =
          balanceResult.data.lamports ||
          balanceResult.data.balance ||
          balanceResult.data.solBalance ||
          0;
        setSolLamports(lamports);
        console.log("✅ Balance loaded from API:", lamports);
      } else {
        console.warn(
          "API balance fetch failed:",
          balanceResult.message || "Unknown error"
        );
        setSolLamports(0);
      }
    } catch (error: any) {
      console.error("Failed to refresh SOL balance:", error);

      if (
        error.message?.includes("Rate limit") ||
        error.message?.includes("Too many")
      ) {
        console.warn(
          "⚠️ Rate limit hit, will skip balance refresh for a while"
        );
        globalLastBalanceLoad = now + 60000;
        this.lastBalanceLoadRef.current = now + 60000;
      }

      setSolLamports(0);
    } finally {
      globalBalanceLoading = false;
      this.balanceLoadingRef.current = false;
      setLoading((l: any) => (l === "sol-balance" ? null : l));
    }
  }
}
