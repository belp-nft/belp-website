import { UserService } from "@/services";

export class UserDataService {
  static async loadTransactions(
    isLoadingTransactions: boolean,
    transactions: any[],
    transactionsLastLoaded: number,
    setIsLoadingTransactions: (value: boolean) => void,
    setTransactions: (value: any[]) => void,
    setTransactionsLastLoaded: (value: number) => void,
    forceRefresh: boolean = false
  ): Promise<void> {
    if (isLoadingTransactions) {
      console.log("Transactions already loading, skipping...");
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (
      !forceRefresh &&
      transactions.length > 0 &&
      now - transactionsLastLoaded < CACHE_DURATION
    ) {
      console.log("Using cached transactions data");
      return;
    }

    try {
      setIsLoadingTransactions(true);
      console.log("Loading transaction history...");

      const txResult = await UserService.getTransactions({ limit: 50 });

      if (txResult.success && txResult.data) {
        setTransactions(txResult.data);
        setTransactionsLastLoaded(now);
        console.log(
          "Transaction history loaded:",
          txResult.data.length,
          "transactions"
        );
      } else if (
        txResult.message?.includes("Unauthorized") ||
        txResult.message?.includes("401")
      ) {
        console.warn("Token expired while loading transactions");
      }
    } catch (error: any) {
      console.error("Failed to load transactions:", error);

      if (
        error.response?.status === 401 ||
        error.message?.includes("Unauthorized")
      ) {
        console.warn("Authentication error while loading transactions");
      }
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  static async loadUserStatistics(
    isLoadingUserStats: boolean,
    userStatistics: any,
    userStatsLastLoaded: number,
    setIsLoadingUserStats: (value: boolean) => void,
    setUserStatistics: (value: any) => void,
    setUserStatsLastLoaded: (value: number) => void,
    forceRefresh: boolean = false
  ): Promise<void> {
    if (isLoadingUserStats) {
      console.log("User statistics already loading, skipping...");
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (
      !forceRefresh &&
      userStatistics &&
      now - userStatsLastLoaded < CACHE_DURATION
    ) {
      console.log("Using cached user statistics data");
      return;
    }

    try {
      setIsLoadingUserStats(true);
      console.log("Loading user statistics...");

      const statsResult = await UserService.getUserStatistics();

      if (statsResult.success && statsResult.data) {
        setUserStatistics(statsResult.data);
        setUserStatsLastLoaded(now);
        console.log("User statistics loaded:", statsResult.data);
      } else if (
        statsResult.message?.includes("Unauthorized") ||
        statsResult.message?.includes("401")
      ) {
        console.warn("Token expired while loading user statistics");
      }
    } catch (error: any) {
      console.error("Failed to load user statistics:", error);

      if (
        error.response?.status === 401 ||
        error.message?.includes("Unauthorized")
      ) {
        console.warn("Authentication error while loading user statistics");
      }
    } finally {
      setIsLoadingUserStats(false);
    }
  }
}
